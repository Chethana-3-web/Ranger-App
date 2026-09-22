/**
 * Ranger App – Fake Connectivity Monitor
 *
 * Test double with manual state control.
 */

/**
 * Create a fake connectivity monitor for testing.
 *
 * @param {boolean} [initialOnline=true]
 * @returns {{
 *   isOnline: () => boolean,
 *   subscribe: (listener: (isOnline: boolean) => void) => () => void,
 *   setOnline: (bool: boolean) => void
 * }}
 */
export function FakeConnectivityMonitor(initialOnline = true) {
  let isOnline = initialOnline;
  const listeners = [];

  return {
    isOnline: () => isOnline,

    subscribe(listener) {
      listeners.push(listener);
      // Trigger immediate callback with current state
      listener(isOnline);
      return () => {
        const idx = listeners.indexOf(listener);
        if (idx >= 0) listeners.splice(idx, 1);
      };
    },

    /**
     * Test helper: change online status and notify subscribers.
     */
    setOnline(newState) {
      if (newState !== isOnline) {
        isOnline = newState;
        listeners.forEach((l) => l(isOnline));
      }
    },
  };
}

export default FakeConnectivityMonitor;
