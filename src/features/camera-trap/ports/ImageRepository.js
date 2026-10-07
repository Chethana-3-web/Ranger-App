/**
 * Image Repository Port
 *
 * Abstract contract for camera trap image persistence.
 */

/**
 * @typedef {Object} ImageRepository
 * @property {(cameraTrapId: string) => Promise<Array>} getByCameraTrapId
 * @property {(id: string) => Promise<Object|null>} getById
 * @property {(image: Object) => Promise<void>} save
 * @property {(id: string, updates: Object) => Promise<void>} update
 * @property {(status: string) => Promise<Array>} findByReviewStatus
 */

// This is a JSDoc interface definition - no implementation here
