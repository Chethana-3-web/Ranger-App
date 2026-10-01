/**
 * Tests for imageReviewService.js and suspiciousActivityService.js
 * Naming: <method>_<condition>_<expectedResult>
 */

jest.mock('expo-crypto', () => ({ randomUUID: () => 'uuid' }));

import { createImageReviewService } from '../imageReviewService';
import { createSuspiciousActivityService } from '../suspiciousActivityService';
import { AsyncStorageImageRepository } from '../../infrastructure/asyncStorageImageRepository';
import { InMemoryKeyValueStore } from '../../../../core/services/storage/InMemoryKeyValueStore';
import { FakeIdGenerator } from '../../../../core/services/idGenerator';
import { createCameraTrapImage } from '../../domain/cameraTrapImage';
import { ReviewStatus } from '../../domain/reviewStatus';

// ── Fakes ─────────────────────────────────────────────────────────────────────

function makeImage(id) {
  return createCameraTrapImage({
    id,
    cameraTrapId: 'CT-001',
    imageUri: `https://example.com/${id}.jpg`,
    timestamp: '2026-09-29T14:30:00.000Z',
  });
}

function makeGateway(overrides = {}) {
  return {
    async getCameraTrapImages() { return [makeImage('IMG-1'), makeImage('IMG-2')]; },
    async saveClassification() {},
    async markUnclear() {},
    async saveSuspiciousFlag() {},
    ...overrides,
  };
}

function makeServices(gatewayOverrides) {
  const imageRepo = AsyncStorageImageRepository(InMemoryKeyValueStore());
  const gateway = makeGateway(gatewayOverrides);
  return {
    imageRepo,
    review: createImageReviewService({ imageRepo, gateway }),
    suspicious: createSuspiciousActivityService({ imageRepo, gateway, idGenerator: FakeIdGenerator() }),
  };
}

const ELEPHANTS = { species: 'Sri Lankan Elephant', count: 4 };

// ── imageReviewService ────────────────────────────────────────────────────────

describe('getImagesByCameraTrapId', () => {
  test('getImagesByCameraTrapId_firstLoad_returnsGatewayImagesAsPending', async () => {
    const { review } = makeServices();
    const images = await review.getImagesByCameraTrapId('CT-001');
    expect(images.map((img) => img.id)).toEqual(['IMG-1', 'IMG-2']);
    expect(images.every((img) => img.reviewStatus === ReviewStatus.PENDING)).toBe(true);
  });

  test('getImagesByCameraTrapId_afterLocalReview_keepsLocalReview', async () => {
    const { review } = makeServices();
    await review.getImagesByCameraTrapId('CT-001');
    await review.saveClassification('IMG-1', ELEPHANTS, 'MGR-1');

    const images = await review.getImagesByCameraTrapId('CT-001');
    expect(images[0].reviewStatus).toBe(ReviewStatus.CLASSIFIED);
    expect(images[1].reviewStatus).toBe(ReviewStatus.PENDING);
  });

  test('getImagesByCameraTrapId_gatewayFails_returnsLocalImages', async () => {
    const { review, imageRepo } = makeServices({
      async getCameraTrapImages() { throw new Error('offline'); },
    });
    await imageRepo.save(makeImage('IMG-9'));
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const images = await review.getImagesByCameraTrapId('CT-001');

    expect(images.map((img) => img.id)).toEqual(['IMG-9']);
    errorSpy.mockRestore();
  });
});

describe('saveClassification', () => {
  test('saveClassification_validData_marksImageClassified', async () => {
    const { review } = makeServices();
    await review.getImagesByCameraTrapId('CT-001');

    const updated = await review.saveClassification('IMG-1', ELEPHANTS, 'MGR-1');

    expect(updated.reviewStatus).toBe(ReviewStatus.CLASSIFIED);
    expect(updated.classification).toMatchObject({ ...ELEPHANTS, reviewedBy: 'MGR-1' });
    expect((await review.getImageById('IMG-1')).reviewStatus).toBe(ReviewStatus.CLASSIFIED);
  });

  test('saveClassification_gatewayFails_stillSavesLocally', async () => {
    const { review } = makeServices({
      async saveClassification() { throw new Error('offline'); },
    });
    await review.getImagesByCameraTrapId('CT-001');
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await review.saveClassification('IMG-1', ELEPHANTS, 'MGR-1');

    expect((await review.getImageById('IMG-1')).reviewStatus).toBe(ReviewStatus.CLASSIFIED);
    errorSpy.mockRestore();
  });

  test('saveClassification_unknownImage_throws', async () => {
    const { review } = makeServices();
    await expect(review.saveClassification('IMG-404', ELEPHANTS, 'MGR-1')).rejects.toThrow('Image not found');
  });

  test('saveClassification_countBelowOne_throwsAndKeepsPending', async () => {
    const { review } = makeServices();
    await review.getImagesByCameraTrapId('CT-001');

    await expect(
      review.saveClassification('IMG-1', { species: 'Wild Boar', count: 0 }, 'MGR-1')
    ).rejects.toThrow('Count must be at least 1');
    expect((await review.getImageById('IMG-1')).reviewStatus).toBe(ReviewStatus.PENDING);
  });

  test('saveClassification_flaggedImage_staysFlagged', async () => {
    const { review, suspicious } = makeServices();
    await review.getImagesByCameraTrapId('CT-001');
    await suspicious.saveSuspiciousFlag('IMG-1', { decision: 'suspicious', reason: 'Poaching Activity' }, 'MGR-1');

    const updated = await review.saveClassification('IMG-1', ELEPHANTS, 'MGR-1');

    expect(updated.reviewStatus).toBe(ReviewStatus.FLAGGED);
    expect(updated.classification.species).toBe('Sri Lankan Elephant');
  });
});

describe('markImageAsUnclear', () => {
  test('markImageAsUnclear_pendingImage_marksUnclear', async () => {
    const { review } = makeServices();
    await review.getImagesByCameraTrapId('CT-001');

    const updated = await review.markImageAsUnclear('IMG-2');

    expect(updated.reviewStatus).toBe(ReviewStatus.UNCLEAR);
    expect(await review.getPendingImagesCount('CT-001')).toBe(1);
  });
});

// ── suspiciousActivityService ─────────────────────────────────────────────────

describe('saveSuspiciousFlag', () => {
  test('saveSuspiciousFlag_suspicious_flagsImage', async () => {
    const { review, suspicious } = makeServices();
    await review.getImagesByCameraTrapId('CT-001');

    const updated = await suspicious.saveSuspiciousFlag(
      'IMG-1',
      { decision: 'suspicious', reason: 'Unauthorized Entry', notes: 'Two people at night' },
      'MGR-1'
    );

    expect(updated.reviewStatus).toBe(ReviewStatus.FLAGGED);
    expect(updated.suspiciousActivity).toMatchObject({
      id: 'fake-id-0',
      imageId: 'IMG-1',
      isSuspicious: true,
      reason: 'Unauthorized Entry',
      reviewedBy: 'MGR-1',
    });
  });

  test('saveSuspiciousFlag_suspiciousWithoutReason_throws', async () => {
    const { review, suspicious } = makeServices();
    await review.getImagesByCameraTrapId('CT-001');

    await expect(
      suspicious.saveSuspiciousFlag('IMG-1', { decision: 'suspicious' }, 'MGR-1')
    ).rejects.toThrow('reason is required');
  });

  test('saveSuspiciousFlag_notSuspicious_recordsReviewWithoutFlag', async () => {
    const { review, suspicious } = makeServices();
    await review.getImagesByCameraTrapId('CT-001');

    const updated = await suspicious.saveSuspiciousFlag('IMG-1', { decision: 'not_suspicious' }, 'MGR-1');

    expect(updated.reviewStatus).toBe(ReviewStatus.PENDING);
    expect(updated.suspiciousActivity.isSuspicious).toBe(false);
  });

  test('saveSuspiciousFlag_unclear_marksImageUnclear', async () => {
    const { review, suspicious } = makeServices();
    await review.getImagesByCameraTrapId('CT-001');

    const updated = await suspicious.saveSuspiciousFlag('IMG-1', { decision: 'unclear' }, 'MGR-1');

    expect(updated.reviewStatus).toBe(ReviewStatus.UNCLEAR);
  });
});
