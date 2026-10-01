/**
 * Camera Trap Gateway Port
 *
 * Abstract contract for remote API communication (future).
 */

/**
 * @typedef {Object} CameraTrapGateway
 * @property {() => Promise<Array>} getCameraTraps
 * @property {(cameraTrapId: string) => Promise<Array>} getCameraTrapImages
 * @property {(imageId: string, classification: Object) => Promise<void>} saveClassification
 * @property {(imageId: string) => Promise<void>} markUnclear
 * @property {(imageId: string, suspiciousActivity: Object) => Promise<void>} saveSuspiciousFlag
 */

// This is a JSDoc interface definition - no implementation here
