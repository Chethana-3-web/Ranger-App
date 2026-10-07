/**
 * Log Patrol Incident – Incident Type Enum
 *
 * Frozen enum of incident types a ranger can log.
 * Each entry has a machine key and a human-readable label.
 * The subset offered to a ranger is filtered by the park's enabledIncidentTypes.
 */

/**
 * @typedef {{ key: string, label: string }} IncidentTypeEntry
 */

/** Frozen enum of all incident types. */
export const IncidentType = Object.freeze({
  EMERGENCY:'EMERGENCY',
  SNARE:    'SNARE',
  CARCASS:  'CARCASS',
  TRACKS:   'TRACKS',
  CAMPSITE: 'CAMPSITE',
  OTHER:    'OTHER',
});

/** Human-readable labels for each incident type. */
export const INCIDENT_TYPE_LABELS = Object.freeze({
  EMERGENCY:'EMERGENCY INCIDENT',
  SNARE:    'Snare / Trap',
  CARCASS:  'Animal Carcass',
  TRACKS:   'Animal Tracks',
  CAMPSITE: 'Illegal Campsite',
  OTHER:    'Other',
});

/**
 * Get all IncidentType entries as an array of { key, label }.
 *
 * @returns {IncidentTypeEntry[]}
 */
export function getAllIncidentTypes() {
  return Object.keys(IncidentType).map((key) => ({
    key,
    label: INCIDENT_TYPE_LABELS[key],
  }));
}

/**
 * Get the incident types enabled for a specific park.
 * Returns only the types in the park's enabledIncidentTypes list.
 *
 * @param {{ enabledIncidentTypes: string[] }} park
 * @returns {IncidentTypeEntry[]}
 */
export function getEnabledTypesForPark(park) {
  if (!park || !Array.isArray(park.enabledIncidentTypes)) {
    return [];
  }
  return park.enabledIncidentTypes
    .filter((key) => Object.prototype.hasOwnProperty.call(IncidentType, key))
    .map((key) => ({ key, label: INCIDENT_TYPE_LABELS[key] }));
}

/**
 * Check whether a given type key is valid.
 *
 * @param {string} key
 * @returns {boolean}
 */
export function isValidIncidentType(key) {
  return Object.prototype.hasOwnProperty.call(IncidentType, key);
}

export default IncidentType;
