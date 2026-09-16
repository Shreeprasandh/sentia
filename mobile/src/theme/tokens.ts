/**
 * Sentia Design System Tokens
 * Luxury Editorial Aesthetic: "Imperial Emerald & Porcelain Linen"
 * Strictly handcrafted; zero generic purple/neon gradients.
 */

export const Colors = {
  // Primary Palette
  primary: '#064E3B',         // Deep Imperial Emerald
  primaryLight: '#0A664E',    // Subtle interactive hover emerald
  primaryMuted: '#1B3A31',    // Deep forest charcoal
  primarySoft: '#E6F4EA',     // Soft emerald tint for badges

  // Canvas & Whitespace (Porcelain Linen)
  canvas: '#FAF6EE',          // Main background
  canvasElevated: '#FDFBF7',  // Elevated card background
  canvasWarm: '#F5EFE0',      // Warm secondary canvas

  // Card Accents & Artisan Parchment
  cardAccent: '#F8E7C9',      // Soft Sand Linen Card Accent
  cardAccentBorder: '#EEDCC0',// 1px Artisan border
  borderMuted: '#E5D8C5',     // Subtle separator line

  // Status & Telemetry Indicators
  statusSuccess: '#10B981',   // Vibrant emerald online glow
  statusWarning: '#D97706',   // Warm amber warning
  statusDanger: '#B91C1C',    // Crimson emergency SOS
  statusInfo: '#0D9488',      // Teal companion indicator

  // Typography Colors (WCAG AAA Compliance)
  textPrimary: '#0F1F1A',     // Deep Obsidian Forest
  textSecondary: '#4B5563',   // Muted charcoal body
  textTertiary: '#7D8882',    // Quiet timestamp / caption
  textInverse: '#FAF6EE',     // Porcelain text on emerald

  // Hardware Accents & Friends Mode Palette
  goldAccent: '#C5A059',      // Champagne brass buckle accent
  cognacAmber: '#92400E',     // Warm Cognac Amber for Friends Mode
  cognacAmberLight: '#B45309',
  champagneParchment: '#FAF3E7',
  borderLight: '#E5D8C5',     // Soft card border
  batteryGreen: '#10B981',
  batteryAmber: '#F59E0B',
  batteryRed: '#EF4444',
};

export const Typography = {
  // Option A: Instrument Serif (Editorial Headers) + Plus Jakarta Sans (Body & Controls)
  fontSerif: 'InstrumentSerif-Regular',
  fontSerifItalic: 'InstrumentSerif-Italic',
  fontSans: 'PlusJakartaSans-Regular',
  fontSansMedium: 'PlusJakartaSans-Medium',
  fontSansSemiBold: 'PlusJakartaSans-SemiBold',
  fontSansBold: 'PlusJakartaSans-Bold',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 9999,
};

export const Shadows = {
  subtle: {
    shadowColor: '#0F1F1A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  card: {
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  floating: {
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
};
