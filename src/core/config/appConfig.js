/**
 * Ranger App – API / Server Configuration
 *
 * All network-layer constants live here.
 * The server is mocked in this prototype – these values are present for
 * future real-backend wiring.
 */

const apiConfig = {
  /** Base URL for the operations dashboard API */
  API_BASE_URL: 'http://localhost:3000/api',

  /** Request timeout in milliseconds */
  TIMEOUT: 10000,

  /** Sync retry attempts before marking an incident as FAILED */
  SYNC_RETRY_LIMIT: 3,

  /** Web Dashboard hosted URL (Render / Production) */
  DASHBOARD_URL: 'https://ranger-dashboard.onrender.com',

  /** Local development Dashboard URL */
  LOCAL_DASHBOARD_URL: 'http://localhost:5173',
};

export default apiConfig;
