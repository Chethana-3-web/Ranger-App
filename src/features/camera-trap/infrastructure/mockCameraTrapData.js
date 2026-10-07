/**
 * Mock Camera Trap Data
 *
 * Seed data for development and testing.
 */

import { createCameraTrap } from '../domain/cameraTrap';
import { createCameraTrapImage } from '../domain/cameraTrapImage';
import { ReviewStatus } from '../domain/reviewStatus';

/**
 * Mock camera traps
 */
export const MOCK_CAMERA_TRAPS = [
  createCameraTrap({
    id: 'CT-001',
    name: 'North Trail Camera',
    location: {
      lat: 6.4281,
      lng: 81.3295,
      name: 'North Trail Intersection',
    },
    pendingImageCount: 8,
    status: 'active',
    lastImageAt: '2026-09-29T14:30:00.000Z',
    createdAt: '2026-08-01T00:00:00.000Z',
  }),
  createCameraTrap({
    id: 'CT-002',
    name: 'Waterhole Monitor',
    location: {
      lat: 6.4291,
      lng: 81.3315,
      name: 'Main Waterhole',
    },
    pendingImageCount: 5,
    status: 'active',
    lastImageAt: '2026-09-29T12:15:00.000Z',
    createdAt: '2026-08-01T00:00:00.000Z',
  }),
  createCameraTrap({
    id: 'CT-003',
    name: 'South Border',
    location: {
      lat: 6.4251,
      lng: 81.3275,
      name: 'South Border Patrol Point',
    },
    pendingImageCount: 3,
    status: 'active',
    lastImageAt: '2026-09-28T18:45:00.000Z',
    createdAt: '2026-08-01T00:00:00.000Z',
  }),
];

/**
 * Mock camera trap images
 */
export const MOCK_IMAGES = [
  // CT-001 images
  createCameraTrapImage({
    id: 'IMG-001',
    cameraTrapId: 'CT-001',
    imageUri: 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=800',
    timestamp: '2026-09-29T14:30:00.000Z',
    location: { lat: 6.4281, lng: 81.3295 },
    reviewStatus: ReviewStatus.PENDING,
  }),
  createCameraTrapImage({
    id: 'IMG-002',
    cameraTrapId: 'CT-001',
    imageUri: 'https://images.unsplash.com/photo-1551718693-75a763546abb?w=800',
    timestamp: '2026-09-29T13:15:00.000Z',
    location: { lat: 6.4281, lng: 81.3295 },
    reviewStatus: ReviewStatus.PENDING,
  }),
  createCameraTrapImage({
    id: 'IMG-003',
    cameraTrapId: 'CT-001',
    imageUri: 'https://images.unsplash.com/photo-1603824774146-5e33e9fc0c3e?w=800',
    timestamp: '2026-09-29T12:00:00.000Z',
    location: { lat: 6.4281, lng: 81.3295 },
    reviewStatus: ReviewStatus.PENDING,
  }),
  createCameraTrapImage({
    id: 'IMG-004',
    cameraTrapId: 'CT-001',
    imageUri: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=800',
    timestamp: '2026-09-29T08:30:00.000Z',
    location: { lat: 6.4281, lng: 81.3295 },
    reviewStatus: ReviewStatus.CLASSIFIED,
    classification: {
      species: 'Sri Lankan Elephant',
      count: 3,
      reviewedBy: 'MGR-1',
      reviewedAt: '2026-09-29T15:00:00.000Z',
    },
    reviewedAt: '2026-09-29T15:00:00.000Z',
  }),

  // CT-002 images
  createCameraTrapImage({
    id: 'IMG-005',
    cameraTrapId: 'CT-002',
    imageUri: 'https://images.unsplash.com/photo-1456926631375-92c8ce872def?w=800',
    timestamp: '2026-09-29T12:15:00.000Z',
    location: { lat: 6.4291, lng: 81.3315 },
    reviewStatus: ReviewStatus.PENDING,
  }),
  createCameraTrapImage({
    id: 'IMG-006',
    cameraTrapId: 'CT-002',
    imageUri: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?w=800',
    timestamp: '2026-09-29T10:45:00.000Z',
    location: { lat: 6.4291, lng: 81.3315 },
    reviewStatus: ReviewStatus.PENDING,
  }),
  createCameraTrapImage({
    id: 'IMG-007',
    cameraTrapId: 'CT-002',
    imageUri: 'https://images.unsplash.com/photo-1501706362039-c06b2d715385?w=800',
    timestamp: '2026-09-28T16:20:00.000Z',
    location: { lat: 6.4291, lng: 81.3315 },
    reviewStatus: ReviewStatus.UNCLEAR,
    reviewedAt: '2026-09-29T09:00:00.000Z',
  }),

  // CT-003 images (suspicious activity scenario)
  createCameraTrapImage({
    id: 'IMG-008',
    cameraTrapId: 'CT-003',
    imageUri: 'https://images.unsplash.com/photo-1503066211613-c17ebc9daef0?w=800',
    timestamp: '2026-09-28T22:45:00.000Z',
    location: { lat: 6.4251, lng: 81.3275 },
    reviewStatus: ReviewStatus.PENDING,
  }),
  createCameraTrapImage({
    id: 'IMG-009',
    cameraTrapId: 'CT-003',
    imageUri: 'https://images.unsplash.com/photo-1517732306149-e8f829eb588a?w=800',
    timestamp: '2026-09-28T21:30:00.000Z',
    location: { lat: 6.4251, lng: 81.3275 },
    reviewStatus: ReviewStatus.FLAGGED,
    suspiciousActivity: {
      id: 'SA-001',
      imageId: 'IMG-009',
      isSuspicious: true,
      decision: 'suspicious',
      reason: 'Unauthorized Entry',
      notes: 'Two individuals spotted near border fence at night',
      reviewedBy: 'MGR-1',
      createdAt: '2026-09-29T08:00:00.000Z',
      status: 'under_investigation',
    },
    reviewedAt: '2026-09-29T08:00:00.000Z',
  }),
];

/**
 * Get all camera traps.
 * @returns {Promise<Array>}
 */
export async function getMockCameraTraps() {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...MOCK_CAMERA_TRAPS]), 300);
  });
}

/**
 * Get images for a specific camera trap.
 * @param {string} cameraTrapId
 * @returns {Promise<Array>}
 */
export async function getMockImagesByCameraTrap(cameraTrapId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const images = MOCK_IMAGES.filter((img) => img.cameraTrapId === cameraTrapId);
      resolve(images);
    }, 300);
  });
}

/**
 * Get a single image by ID.
 * @param {string} imageId
 * @returns {Promise<Object|null>}
 */
export async function getMockImageById(imageId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const image = MOCK_IMAGES.find((img) => img.id === imageId);
      resolve(image || null);
    }, 200);
  });
}
