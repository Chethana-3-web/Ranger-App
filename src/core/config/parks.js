/**
 * Ranger App – Park Seed Data
 *
 * Seed configuration for Sri Lanka national parks supported by this prototype.
 * Each park has a unique ID, display name, map centre coordinates, and the
 * list of incident types rangers can log in that park.
 *
 * enabledIncidentTypes mirrors the INCIDENT_TYPES keys in constants/strings.js.
 * Different parks intentionally have different subsets to show system flexibility.
 */

/** @type {Array<{id: string, name: string, centre: {lat: number, lng: number}, enabledIncidentTypes: string[]}>} */
const PARKS = [
  {
    id:     'PARK-YALA',
    name:   'Yala National Park',
    centre: { lat: 6.3728, lng: 81.5198 },
    // Open grassland / scrubland – full incident type set
    enabledIncidentTypes: ['EMERGENCY', 'SNARE', 'CARCASS', 'CAMPSITE', 'TRACKS', 'OTHER'],
  },
  {
    id:     'PARK-SINHARAJA',
    name:   'Sinharaja Forest Reserve',
    centre: { lat: 6.4052, lng: 80.4881 },
    // Dense jungle – illegal camps and snares are primary concerns; no open carcass finds
    enabledIncidentTypes: ['EMERGENCY', 'SNARE', 'CAMPSITE', 'TRACKS', 'OTHER'],
  },
  {
    id:     'PARK-UDAWALAWE',
    name:   'Udawalawe National Park',
    centre: { lat: 6.4745, lng: 80.8998 },
    // Elephant country – all types plus dedicated elephant-conflict footprint logging
    enabledIncidentTypes: ['EMERGENCY', 'SNARE', 'CARCASS', 'CAMPSITE', 'TRACKS', 'OTHER'],
  },
];

export default PARKS;

/**
 * Get a park by its ID.
 *
 * @param {string} parkId
 * @returns {{ id: string, name: string, centre: { lat: number, lng: number }, enabledIncidentTypes: string[] } | undefined}
 */
export function getParkById(parkId) {
  return PARKS.find((p) => p.id === parkId);
}
