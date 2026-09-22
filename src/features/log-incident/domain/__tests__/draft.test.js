/**
 * Tests for draft.js
 * Naming: <method>_<condition>_<expectedResult>
 */

import {
  createDraft,
  updateDraftStep,
  getRestoreStep,
  isDraftComplete,
  DraftStep,
} from '../draft';

const TS = '2026-09-22T09:00:00.000Z';
const LOC = { latitude: 6.37, longitude: 81.52, source: 'GPS', accuracyMeters: 5, capturedAt: TS };

describe('createDraft', () => {
  test('createDraft_called_returnsEmptyDraft', () => {
    const draft = createDraft(TS);
    expect(draft.type).toBeNull();
    expect(draft.photoUri).toBeNull();
    expect(draft.location).toBeNull();
    expect(draft.description).toBe('');
    expect(draft.lastCompletedStep).toBeNull();
    expect(draft.createdAt).toBe(TS);
  });
});

describe('updateDraftStep', () => {
  test('updateDraftStep_typeStep_setsTypeAndLastCompletedStep', () => {
    const draft = createDraft(TS);
    const updated = updateDraftStep(draft, DraftStep.TYPE, { type: 'SNARE' });
    expect(updated.type).toBe('SNARE');
    expect(updated.lastCompletedStep).toBe(DraftStep.TYPE);
  });

  test('updateDraftStep_doesNotMutateOriginal', () => {
    const draft = createDraft(TS);
    updateDraftStep(draft, DraftStep.TYPE, { type: 'SNARE' });
    expect(draft.type).toBeNull();
  });

  test('updateDraftStep_locationStep_setsLocation', () => {
    const draft = createDraft(TS);
    const updated = updateDraftStep(draft, DraftStep.LOCATION, { location: LOC });
    expect(updated.location).toEqual(LOC);
    expect(updated.lastCompletedStep).toBe(DraftStep.LOCATION);
  });
});

describe('getRestoreStep', () => {
  test('getRestoreStep_noCompletedStep_returnsTypeStep', () => {
    const draft = createDraft(TS);
    expect(getRestoreStep(draft)).toBe(DraftStep.TYPE);
  });

  test('getRestoreStep_typeCompleted_returnsPhotoStep', () => {
    const draft = updateDraftStep(createDraft(TS), DraftStep.TYPE, { type: 'SNARE' });
    expect(getRestoreStep(draft)).toBe(DraftStep.PHOTO);
  });

  test('getRestoreStep_photoCompleted_returnsLocationStep', () => {
    let draft = createDraft(TS);
    draft = updateDraftStep(draft, DraftStep.TYPE, { type: 'SNARE' });
    draft = updateDraftStep(draft, DraftStep.PHOTO, { photoUri: null });
    expect(getRestoreStep(draft)).toBe(DraftStep.LOCATION);
  });

  test('getRestoreStep_locationCompleted_returnsDetailsStep', () => {
    let draft = createDraft(TS);
    draft = updateDraftStep(draft, DraftStep.LOCATION, { location: LOC });
    expect(getRestoreStep(draft)).toBe(DraftStep.DETAILS);
  });
});

describe('isDraftComplete', () => {
  test('isDraftComplete_allRequiredFields_returnsTrue', () => {
    let draft = createDraft(TS);
    draft = updateDraftStep(draft, DraftStep.TYPE, { type: 'SNARE' });
    draft = updateDraftStep(draft, DraftStep.LOCATION, { location: LOC });
    draft = updateDraftStep(draft, DraftStep.DETAILS, { description: 'Found a snare.' });
    expect(isDraftComplete(draft)).toBe(true);
  });

  test('isDraftComplete_missingType_returnsFalse', () => {
    let draft = createDraft(TS);
    draft = updateDraftStep(draft, DraftStep.LOCATION, { location: LOC });
    draft = updateDraftStep(draft, DraftStep.DETAILS, { description: 'Found a snare.' });
    expect(isDraftComplete(draft)).toBe(false);
  });

  test('isDraftComplete_missingLocation_returnsFalse', () => {
    let draft = createDraft(TS);
    draft = updateDraftStep(draft, DraftStep.TYPE, { type: 'SNARE' });
    draft = updateDraftStep(draft, DraftStep.DETAILS, { description: 'Found a snare.' });
    expect(isDraftComplete(draft)).toBe(false);
  });

  test('isDraftComplete_emptyDescription_returnsFalse', () => {
    let draft = createDraft(TS);
    draft = updateDraftStep(draft, DraftStep.TYPE, { type: 'SNARE' });
    draft = updateDraftStep(draft, DraftStep.LOCATION, { location: LOC });
    expect(isDraftComplete(draft)).toBe(false);
  });
});
