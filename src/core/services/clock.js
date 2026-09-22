/**
 * Ranger App – Clock Service
 *
 * Simple injectable time source (for testability).
 * Use this instead of Date.now() or new Date() directly.
 */

/**
 * Default clock implementation using native Date.
 */
export const DefaultClock = {
  /**
   * @returns {number} milliseconds since epoch
   */
  now() {
    return Date.now();
  },

  /**
   * @returns {string} ISO timestamp
   */
  iso() {
    return new Date().toISOString();
  },
};

export default DefaultClock;
