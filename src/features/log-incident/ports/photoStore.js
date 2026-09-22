/**
 * Log Patrol Incident – Photo Store Port
 *
 * Abstract contract for persisting a captured photo to a permanent location.
 * The camera provider returns a temporary cache URI; photoStore copies it into
 * the app's document directory so it survives cache clearing.
 * Implementations: ExpoPhotoStore (real), FakePhotoStore (tests).
 *
 * @typedef {Object} PhotoStore
 * @property {(tempUri: string) => Promise<string>} persist
 *   Copies the file at tempUri to a permanent location and returns the new URI.
 */

export default {};
