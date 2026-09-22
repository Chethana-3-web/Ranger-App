/**
 * Log Patrol Incident – Draft Domain
 *
 * A draft represents an in-progress incident that hasn't been saved yet.
 * The draft is autosaved after each step so it can survive a crash (E1).
 *
 * Steps: 'TYPE' → 'PHOTO' → 'LOCATION' → 'DETAILS' → done
 */

/** Draft step enum */
export const DraftStep = Object.freeze({
  TYPE:     'TYPE',
  PHOTO:    'PHOTO',
  LOCATION: 'LOCATION',
  DETAILS:  'DETAILS',
});

/** Ordered step sequence */
const STEP_ORDER = [DraftStep.TYPE, DraftStep.PHOTO, DraftStep.LOCATION, DraftStep.DETAILS];

/**
 * @typedef {Object} Draft
 * @property {string}      lastCompletedStep – last fully-filled step key
 * @property {string|null} type              – IncidentType key or null
 * @property {string|null} photoUri          – photo URI or null
 * @property {import('../../../core/domain/location').RangerLocation|null} location
 * @property {string}      description       – partial description
 * @property {string}      createdAt         – ISO timestamp
 */

/**
 * Create a fresh empty draft.
 *
 * @param {string} createdAt – ISO timestamp
 * @returns {Draft}
 */
export function createDraft(createdAt) {
  return {
    lastCompletedStep: null,
    type:        null,
    photoUri:    null,
    location:    null,
    description: '',
    createdAt,
  };
}

/**
 * Update a draft with data from a completed step.
 *
 * @param {Draft} draft
 * @param {string} step  – DraftStep key
 * @param {Partial<Draft>} data – fields to merge
 * @returns {Draft} new draft object
 */
export function updateDraftStep(draft, step, data) {
  return {
    ...draft,
    ...data,
    lastCompletedStep: step,
  };
}

/**
 * Determine the screen to restore to after a crash.
 * Returns the step AFTER the last completed one.
 *
 * @param {Draft} draft
 * @returns {string} DraftStep key to resume at
 */
export function getRestoreStep(draft) {
  if (!draft.lastCompletedStep) return DraftStep.TYPE;
  const idx = STEP_ORDER.indexOf(draft.lastCompletedStep);
  if (idx === -1 || idx + 1 >= STEP_ORDER.length) return DraftStep.DETAILS;
  return STEP_ORDER[idx + 1];
}

/**
 * Check whether a draft has enough data to attempt saving.
 *
 * @param {Draft} draft
 * @returns {boolean}
 */
export function isDraftComplete(draft) {
  return (
    draft.type !== null &&
    draft.location !== null &&
    typeof draft.description === 'string' &&
    draft.description.trim().length > 0
  );
}

export default { createDraft, updateDraftStep, getRestoreStep, isDraftComplete, DraftStep };
