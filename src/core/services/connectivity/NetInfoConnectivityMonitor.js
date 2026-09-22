/**
 * Ranger App – NetInfo Connectivity Monitor
 *
 * Real implementation using @react-native-community/netinfo.
 */

import NetInfo from '@react-native-community/netinfo';

/**
 * Create a connectivity monitor using NetInfo.
 *
 * @returns {import('./ConnectivityMonitor').ConnectivityMonitor}
 */
export function NetInfoConnectivityMonitor() {
  let currentState = { isConnected: true };

  return {
    /**
     * @returns {boolean}
     */
    isOnline() {
      return currentState.isConnected === true;
    },

    /**
     * @param {(isOnline: boolean) => void} listener
     * @returns {() => void} unsubscribe function
     */
    subscribe(listener) {
      const unsubscribe = NetInfo.addEventListener((state) => {
        currentState = state;
        listener(state.isConnected === true);
      });

      // Trigger initial state
      NetInfo.fetch().then((state) => {
        currentState = state;
        listener(state.isConnected === true);
      });

      return () => {
        unsubscribe();
      };
    },
  };
}

export default NetInfoConnectivityMonitor;
