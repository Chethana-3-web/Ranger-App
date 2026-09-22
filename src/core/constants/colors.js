/**
 * Ranger App – Color Constants
 *
 * Centralised color palette. Referenced by core/ui components.
 * Green conservation theme for outdoor readability.
 */

const COLORS = {
  // ── Brand greens ──────────────────────────────────────────────────────────
  PRIMARY:        '#1B5E20',  // dark forest green
  PRIMARY_LIGHT:  '#2E7D32',  // medium green
  PRIMARY_LIGHTER:'#4CAF50',  // light green
  ACCENT:         '#F57F17',  // amber (offline banner, warnings)

  // ── Backgrounds ──────────────────────────────────────────────────────────
  BACKGROUND:     '#F5F5F5',
  SURFACE:        '#FFFFFF',
  HEADER_BG:      '#1B5E20',

  // ── Text ─────────────────────────────────────────────────────────────────
  TEXT_PRIMARY:   '#212121',
  TEXT_SECONDARY: '#757575',
  TEXT_INVERSE:   '#FFFFFF',

  // ── Status ───────────────────────────────────────────────────────────────
  STATUS_PENDING: '#FBC02D',  // amber
  STATUS_SYNCED:  '#2E7D32',  // green
  STATUS_FAILED:  '#C62828',  // red
  ERROR:          '#C62828',
  SUCCESS:        '#2E7D32',

  // ── UI chrome ─────────────────────────────────────────────────────────────
  BORDER:         '#BDBDBD',
  DIVIDER:        '#E0E0E0',

  // ── Navigation ───────────────────────────────────────────────────────────
  NAV_BG:         '#FFFFFF',
  NAV_ACTIVE:     '#1B5E20',
  NAV_INACTIVE:   '#9E9E9E',
};

export default COLORS;
