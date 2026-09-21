/**
 * Ranger App – Color Palette
 *
 * Conservation-themed design system adapted from the BinGo mobile app pattern.
 *
 * Theme:
 *   Primary    – dark forest green  (#1B4332, #2D6A4F)
 *   Accent     – amber/warning      (#E8950A, #F5A623)
 *   Background – off-white/light green tint (#F0F4EF)
 *   Surface    – pure white         (#FFFFFF)
 *   Error      – red                (#DC2626)
 *
 * Status colours (incident sync state):
 *   Pending  – amber
 *   Synced   – green
 *   Failed   – red
 */

const COLORS = {
  // ── Primary brand – dark forest green ─────────────────────────────────
  PRIMARY:       '#1B4332',   // dark green – headers, active nav, buttons
  PRIMARY_LIGHT: '#2D6A4F',   // medium green – icons, step indicators
  PRIMARY_DARK:  '#0F2419',   // deepest green – pressed states
  PRIMARY_TINT:  '#D8F3DC',   // very light green – card backgrounds, selected

  // ── Accent – amber / warning ────────────────────────────────────────────
  ACCENT:        '#E8950A',   // amber – CTA, poaching alert badge
  ACCENT_LIGHT:  '#F5C842',   // light yellow – highlights
  ACCENT_DARK:   '#B86E00',   // dark amber – pressed CTA

  // ── Backgrounds ──────────────────────────────────────────────────────────
  BACKGROUND:    '#F0F4EF',   // app background – very light green tint
  SURFACE:       '#FFFFFF',   // card / input backgrounds
  CARD:          '#FFFFFF',

  // ── Text ──────────────────────────────────────────────────────────────────
  TEXT_PRIMARY:   '#1A1A1A',  // near-black – headings, body
  TEXT_SECONDARY: '#6B7280',  // grey – subtitles, labels, inactive tabs
  TEXT_DISABLED:  '#B0B8B0',  // light grey – placeholder, char count
  TEXT_INVERSE:   '#FFFFFF',  // white – text on dark/green backgrounds
  TEXT_ACCENT:    '#E8950A',  // amber – highlighted text

  // ── Incident sync statuses ──────────────────────────────────────────────
  STATUS_PENDING: '#E8950A',  // amber  – not yet synced
  STATUS_SYNCED:  '#2D6A4F',  // green  – synced to server
  STATUS_FAILED:  '#DC2626',  // red    – sync failed

  // ── Incident type colours ───────────────────────────────────────────────
  INCIDENT_SNARE:    '#DC2626',  // red    – snare / trap
  INCIDENT_CARCASS:  '#7C3AED',  // purple – carcass
  INCIDENT_CAMP:     '#D97706',  // amber  – illegal camp
  INCIDENT_FOOTPRINT:'#2D6A4F',  // green  – at-risk species footprint
  INCIDENT_OTHER:    '#6B7280',  // grey   – other

  // ── General semantic ────────────────────────────────────────────────────
  SUCCESS:  '#2D6A4F',
  WARNING:  '#E8950A',
  ERROR:    '#DC2626',
  INFO:     '#1D6FA4',

  // ── Borders & dividers ──────────────────────────────────────────────────
  BORDER:   '#C8D8C4',
  DIVIDER:  '#E8F0E4',

  // ── Header bar ──────────────────────────────────────────────────────────
  HEADER_BG:   '#1B4332',
  HEADER_TEXT: '#FFFFFF',

  // ── Nav bar ──────────────────────────────────────────────────────────────
  NAV_BG:       '#FFFFFF',
  NAV_ACTIVE:   '#1B4332',
  NAV_INACTIVE: '#9CA3AF',

  // ── Misc ──────────────────────────────────────────────────────────────────
  TRANSPARENT: 'transparent',
  OVERLAY:     'rgba(0, 0, 0, 0.45)',
  SHADOW:      '#000000',

  // ── Legacy aliases ────────────────────────────────────────────────────────
  SECONDARY:       '#E8950A',
  SECONDARY_LIGHT: '#F5C842',
  SECONDARY_DARK:  '#B86E00',
};

export default COLORS;
