/**
 * Ranger App – Feature Registry
 *
 * Declarative registry of all features accessible to the ranger.
 * Features can be added/removed by changing this file without touching navigation.
 *
 * Each feature declares its route, icon, title, and optional badge count source.
 */

/**
 * @typedef {Object} Feature
 * @property {string} id            – unique identifier
 * @property {string} title         – display name
 * @property {string} icon          – icon name (Material Design)
 * @property {string} route         – navigation route name
 * @property {number} order         – sort order in menu
 * @property {(() => number) | undefined} getBadgeCount – optional badge count function
 */

/** @type {Feature[]} */
const FEATURES = [
  {
    id:           'home',
    title:        'Home',
    icon:         'home',
    route:        'Home',
    order:        0,
    getBadgeCount: undefined,
  },
  {
    id:           'log-incident',
    title:        'Log Incident',
    icon:         'clipboard-list',
    route:        'LogIncident',
    order:        1,
    getBadgeCount: undefined,
  },
  {
    id:           'incident-list',
    title:        'Incidents',
    icon:         'list-box',
    route:        'IncidentList',
    order:        2,
    getBadgeCount: undefined,
  },
  {
    id:           'alerts',
    title:        'Alerts',
    icon:         'bell',
    route:        'Alerts',
    order:        3,
    getBadgeCount: undefined,
  },
  {
    id:           'profile',
    title:        'Profile',
    icon:         'account',
    route:        'Profile',
    order:        4,
    getBadgeCount: undefined,
  },
];

/**
 * Get all registered features, sorted by order.
 *
 * @returns {Feature[]}
 */
export function getAllFeatures() {
  return FEATURES.sort((a, b) => a.order - b.order);
}

/**
 * Get a feature by its ID.
 *
 * @param {string} featureId
 * @returns {Feature | undefined}
 */
export function getFeatureById(featureId) {
  return FEATURES.find((f) => f.id === featureId);
}

/**
 * Get a feature by its route name.
 *
 * @param {string} routeName
 * @returns {Feature | undefined}
 */
export function getFeatureByRoute(routeName) {
  return FEATURES.find((f) => f.route === routeName);
}

export default { getAllFeatures, getFeatureById, getFeatureByRoute };
