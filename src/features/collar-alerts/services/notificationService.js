/**
 * notificationService.js
 * In-app alert banner for new collar alerts.
 * expo-notifications removed — not supported in Expo Go SDK 53+.
 * Uses a simple event emitter so any screen can show the banner.
 */

const listeners = new Set();

/**
 * Subscribe to new alert events.
 * @param {(alert: object) => void} fn
 * @returns {() => void} unsubscribe
 */
export function onNewAlert(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/**
 * Emit a new alert to all subscribers.
 * Called from useAlerts when a new Firestore document arrives.
 * @param {object} alert
 */
export function emitNewAlert(alert) {
  listeners.forEach((fn) => fn(alert));
}

// No-op — kept so App.js import doesn't break
export async function requestNotificationPermission() { return true; }
export async function showAlertNotification(alert) { emitNewAlert(alert); }
