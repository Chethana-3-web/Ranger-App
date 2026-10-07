/**
 * Camera Trap Repository Port
 *
 * Abstract contract for camera trap persistence.
 */

/**
 * @typedef {Object} CameraTrapRepository
 * @property {() => Promise<Array>} getAll
 * @property {(id: string) => Promise<Object|null>} getById
 * @property {(cameraTrap: Object) => Promise<void>} save
 */

// This is a JSDoc interface definition - no implementation here
