/**
 * Log Patrol Incident – Camera Provider Port
 *
 * Abstract contract for capturing a photo.
 * Implementations: ExpoCameraProvider (real), FakeCameraProvider (tests).
 *
 * @typedef {Object} CameraProvider
 * @property {() => Promise<{uri: string}|null>} takePhoto
 *   Resolves with { uri } on success, or null if cancelled / unavailable.
 */

export default {};
