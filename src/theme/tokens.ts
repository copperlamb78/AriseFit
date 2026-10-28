import { Platform, ViewStyle } from 'react-native';

/**
 * AriseFit Design System — "O Sistema" (Solo Leveling Dark Fantasy Futurista)
 * Paleta oficial de alta legibilidade, grid em múltiplos de 4, tipografia e elevação.
 */

export const colors = {
  backgroundPrimary: '#080B14',
  backgroundSecondary: '#0D1220',
  surfaceCard: '#111827',
  surfaceElevated: '#172238',
  borderSubtle: '#25334B',
  textPrimary: '#F4F7FF',
  textSecondary: '#9AA9C2',
  accentCyan: '#00E5FF',
  accentBlue: '#3B82F6',
  statusSuccess: '#4ADE80',
  statusWarning: '#FBBF24',
  statusDanger: '#F87171',
  // Semânticos derivados com opacidade controlada para brilho HUD
  cyanGlowBg: 'rgba(0, 229, 255, 0.10)',
  cyanGlowBorder: 'rgba(0, 229, 255, 0.45)',
  blueGlowBg: 'rgba(59, 130, 246, 0.14)',
  successGlowBg: 'rgba(74, 222, 128, 0.12)',
  warningGlowBg: 'rgba(251, 191, 36, 0.12)',
  dangerGlowBg: 'rgba(248, 113, 113, 0.12)',
  modalBackdrop: 'rgba(8, 11, 20, 0.86)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  massive: 48,
} as const;

export const typography = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },
  lineHeights: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
    xxl: 40,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
  },
  letterSpacing: {
    tight: -0.3,
    normal: 0,
    wide: 0.8,
    systemHud: 1.6,
  },
} as const;

export const radii = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  pill: 9999,
} as const;

export const borders = {
  thin: 1,
  active: 1.5,
  thick: 2,
} as const;

export const touchTargets = {
  minSize: 48,
} as const;

export const animationTimings = {
  fast: 150,
  normal: 250,
  slow: 400,
} as const;

export const shadows: Record<'subtle' | 'cyanGlow' | 'elevated', ViewStyle> = {
  subtle: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 8,
    },
    android: {
      elevation: 4,
    },
    default: {},
  }),
  cyanGlow: Platform.select<ViewStyle>({
    ios: {
      shadowColor: colors.accentCyan,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.28,
      shadowRadius: 10,
    },
    android: {
      elevation: 6,
    },
    default: {},
  }),
  elevated: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.5,
      shadowRadius: 16,
    },
    android: {
      elevation: 8,
    },
    default: {},
  }),
};

export const theme = {
  colors,
  spacing,
  typography,
  radii,
  borders,
  touchTargets,
  animationTimings,
  shadows,
} as const;

export type SystemTheme = typeof theme;
