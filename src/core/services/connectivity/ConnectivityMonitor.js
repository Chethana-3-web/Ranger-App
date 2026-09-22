/**
 * Ranger App – Connectivity Monitor Contract
 *
 * Abstract contract for monitoring online/offline status.
 * Implementations: NetInfoConnectivityMonitor (real), FakeConnectivityMonitor (tests).
 */

/**
 * @typedef {Object} ConnectivityMonitor
 * @property {() => boolean} isOnline – current status
 * @property {(listener: (isOnline: boolean) => void) => () => void} subscribe – returns unsubscribe
 */

/**
 * No-op implementation for testing or when no provider is available.
 *
 * @returns {ConnectivityMonitor}
 */
export function NullConnectivityMonitor() {
  return {
    isOnline: () => true,
    subscribe: (_listener) => {
      return () => {};
    },
  };
}

export default { NullConnectivityMonitor };
