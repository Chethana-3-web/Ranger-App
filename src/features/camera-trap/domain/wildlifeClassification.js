/**
 * Wildlife Classification – Domain Model
 */

/**
 * @typedef {Object} WildlifeClassification
 * @property {string} species
 * @property {number} count
 * @property {string} reviewedBy
 * @property {string} reviewedAt
 */

/**
 * Create a wildlife classification.
 */
export function createWildlifeClassification({ species, count, reviewedBy, reviewedAt }) {
  if (!species || species.trim() === '') {
    throw new Error('Species is required');
  }
  if (!count || count < 1) {
    throw new Error('Count must be at least 1');
  }
  if (!reviewedBy) {
    throw new Error('reviewedBy is required');
  }

  return Object.freeze({
    species: species.trim(),
    count: Number(count),
    reviewedBy,
    reviewedAt: reviewedAt || new Date().toISOString(),
  });
}

/**
 * Available species list
 */
export const SPECIES_LIST = Object.freeze([
  'Sri Lankan Elephant',
  'Sri Lankan Leopard',
  'Spotted Deer',
  'Wild Boar',
  'Sloth Bear',
  'Water Buffalo',
  'Crocodile',
  'Peacock',
  'Other',
]);
