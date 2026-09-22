/**
 * Ranger App – UI Theme
 *
 * Centralized color palette and spacing for consistent UI across the app.
 * Theme: green (conservation theme) with clear contrast for outdoor use.
 */

export const theme = {
  // Primary colors
  colors: {
    primary:        '#1B5E20',     // Dark green
    primaryLight:   '#2E7D32',     // Medium green
    primaryLighter: '#4CAF50',     // Light green
    secondary:      '#00695C',     // Teal accent
    background:     '#F5F5F5',     // Light background
    surface:        '#FFFFFF',     // Card/surface white
    text:           '#212121',     // Primary text (dark)
    textSecondary:  '#757575',     // Secondary text (grey)
    border:         '#BDBDBD',     // Light grey border
    error:          '#C62828',     // Red
    warning:        '#F57F17',     // Amber
    success:        '#2E7D32',     // Green
    info:           '#1565C0',     // Blue
  },

  // Status colors
  status: {
    pending:  '#FBC02D',            // Amber - pending sync
    synced:   '#2E7D32',            // Green - synced
    failed:   '#C62828',            // Red - sync failed
    offline:  '#F57F17',            // Orange - offline
  },

  // Spacing
  spacing: {
    xs:  4,
    sm:  8,
    md:  16,
    lg:  24,
    xl:  32,
    xxl: 48,
  },

  // Rounding
  borderRadius: {
    sm:  4,
    md:  8,
    lg:  12,
    full: 9999,
  },

  // Typography
  typography: {
    heading1: {
      fontSize: 32,
      fontWeight: '700',
      lineHeight: 40,
    },
    heading2: {
      fontSize: 24,
      fontWeight: '600',
      lineHeight: 32,
    },
    heading3: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 28,
    },
    body: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 24,
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 16,
    },
  },

  // Shadows (Android elevation / iOS shadow)
  shadow: {
    sm: {
      elevation: 1,
      shadowColor: '#000',
      shadowOpacity: 0.12,
      shadowRadius: 2,
      shadowOffset: { width: 0, height: 1 },
    },
    md: {
      elevation: 4,
      shadowColor: '#000',
      shadowOpacity: 0.15,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
    },
    lg: {
      elevation: 8,
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
    },
  },
};

export default theme;
