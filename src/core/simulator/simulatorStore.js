/**
 * Ranger App – Simulator Store
 *
 * Dev-only fault injection flags to simulate various device/network states.
 * Used by components and services to respond realistically to problems.
 *
 * Example:
 *   simulatorStore.set('gpsAvailable', false);  // Simulate GPS failure
 *   simulatorStore.set('networkOverride', 'offline');  // Force offline
 */

class SimulatorStore {
  constructor() {
    this.state = {
      gpsAvailable: true,
      cameraAvailable: true,
      networkOverride: 'auto', // 'auto' | 'offline' | 'online'
      serverUp: true,
    };
    this.listeners = [];
  }

  /**
   * Get current value of a flag.
   *
   * @param {string} key
   * @returns {any}
   */
  get(key) {
    return this.state[key];
  }

  /**
   * Set a flag and notify subscribers.
   *
   * @param {string} key
   * @param {any} value
   */
  set(key, value) {
    if (this.state[key] !== value) {
      this.state[key] = value;
      this.listeners.forEach((l) => l(key, value));
    }
  }

  /**
   * Subscribe to state changes.
   *
   * @param {(key: string, value: any) => void} listener
   * @returns {() => void} unsubscribe
   */
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      const idx = this.listeners.indexOf(listener);
      if (idx >= 0) this.listeners.splice(idx, 1);
    };
  }

  /**
   * Reset to default state.
   */
  reset() {
    this.state = {
      gpsAvailable: true,
      cameraAvailable: true,
      networkOverride: 'auto',
      serverUp: true,
    };
    this.listeners.forEach((l) => l(null, null));
  }
}

export const simulatorStore = new SimulatorStore();

export default simulatorStore;
