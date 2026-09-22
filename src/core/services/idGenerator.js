/**
 * Ranger App – ID Generator Service
 *
 * Injectable ID generation (UUIDs). Allows test injection of predictable IDs.
 */

import * as Crypto from 'expo-crypto';

/**
 * Default ID generator using expo-crypto.
 */
export const DefaultIdGenerator = {
  /**
   * Generate a random UUID v4.
   *
   * @returns {Promise<string>}
   */
  async generate() {
    return Crypto.randomUUID();
  },
};

/**
 * Fake ID generator for tests (synchronous, predictable).
 *
 * @param {number} [seed=0] – starting number for test IDs
 */
export function FakeIdGenerator(seed = 0) {
  let counter = seed;
  return {
    async generate() {
      return `fake-id-${counter++}`;
    },
  };
}

export default DefaultIdGenerator;
