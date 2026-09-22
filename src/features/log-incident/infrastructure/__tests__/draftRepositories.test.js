/**
 * Tests for InMemoryDraftRepository and AsyncStorageDraftRepository.
 * Both must satisfy the same DraftRepository contract.
 * Naming: <method>_<condition>_<expectedResult>
 */

import { InMemoryDraftRepository } from '../inMemoryDraftRepository';
import { AsyncStorageDraftRepository } from '../asyncStorageDraftRepository';
import { InMemoryKeyValueStore } from '../../../../core/services/storage/InMemoryKeyValueStore';
import { createDraft, updateDraftStep, DraftStep } from '../../domain/draft';

const TS = '2026-09-22T09:00:00.000Z';

function runContractTests(label, makeRepo) {
  describe(`${label} – DraftRepository contract`, () => {
    let repo;
    beforeEach(() => { repo = makeRepo(); });

    test('find_whenEmpty_returnsNull', async () => {
      expect(await repo.find()).toBeNull();
    });

    test('save_andFind_returnsSavedDraft', async () => {
      const draft = createDraft(TS);
      await repo.save(draft);
      const found = await repo.find();
      expect(found).toMatchObject({ createdAt: TS });
    });

    test('save_twice_overwritesPreviousDraft', async () => {
      const d1 = createDraft(TS);
      const d2 = updateDraftStep(d1, DraftStep.TYPE, { type: 'SNARE' });
      await repo.save(d1);
      await repo.save(d2);
      expect((await repo.find()).type).toBe('SNARE');
    });

    test('delete_afterSave_makesNextFindReturnNull', async () => {
      await repo.save(createDraft(TS));
      await repo.delete();
      expect(await repo.find()).toBeNull();
    });

    test('delete_whenEmpty_doesNotThrow', async () => {
      await expect(repo.delete()).resolves.not.toThrow();
    });
  });
}

runContractTests('InMemoryDraftRepository', () => InMemoryDraftRepository());
runContractTests('AsyncStorageDraftRepository', () =>
  AsyncStorageDraftRepository(InMemoryKeyValueStore()),
);
