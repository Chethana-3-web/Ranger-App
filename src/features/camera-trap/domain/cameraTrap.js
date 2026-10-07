/**
 * Camera Trap – Domain Model
 *
 * Represents a physical camera trap device in the park.
 */

/**
 * @typedef {Object} CameraTrap
 * @property {string} id - Unique identifier (e.g., "CT-001")
 * @property {string} name - Display name
 * @property {Object} location - GPS location
 * @property {number} location.lat - Latitude
 * @property {number} location.lng - Longitude
 * @property {string} location.name - Location description
 * @property {number} pendingImageCount - Number of unreviewed images
 * @property {string} status - "active" | "inactive" | "maintenance"
 * @property {string} lastImageAt - ISO 8601 timestamp of last image
 * @property {string} createdAt - ISO 8601 timestamp
 */

/**
 * Create a camera trap object.
 *
 * @param {Object} params
 * @param {string} params.id
 * @param {string} params.name
 * @param {Object} params.location
 * @param {number} params.location.lat
 * @param {number} params.location.lng
 * @param {string} params.location.name
 * @param {number} [params.pendingImageCount=0]
 * @param {string} [params.status='active']
 * @param {string} [params.lastImageAt]
 * @param {string} [params.createdAt]
 * @returns {CameraTrap}
 */
export function createCameraTrap({
  id,
  name,
  location,
  pendingImageCount = 0,
  status = 'active',
  lastImageAt = null,
  createdAt = new Date().toISOString(),
}) {
  if (!id) throw new Error('Camera trap id is required');
  if (!name) throw new Error('Camera trap name is required');
  if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
    throw new Error('Valid location with lat/lng is required');
  }

  return Object.freeze({
    id,
    name,
    location: Object.freeze(location),
    pendingImageCount,
    status,
    lastImageAt,
    createdAt,
  });
}
