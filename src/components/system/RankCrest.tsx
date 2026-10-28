import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RankTier } from '../../domain/models/system.models';
import { borders, colors, radii, spacing, typography } from '../../theme/tokens';

export interface RankCrestProps {
  rank: RankTier;
  size?: 'sm' | 'md' | 'lg';
}

const RANK_COLOR_MAP: Record<RankTier, string> = {
  E: colors.textSecondary,
  D: colors.accentBlue,
  C: colors.accentCyan,
  B: colors.statusSuccess,
  A: colors.statusWarning,
  S: colors.statusDanger,
};

export function RankCrest({ rank, size = 'md' }: RankCrestProps) {
  const accent = RANK_COLOR_MAP[rank] ?? colors.accentCyan;

  return (
    <View
      style={[
        styles.crest,
        sizeStyles[size],
        {
          borderColor: accent,
          backgroundColor: colors.backgroundSecondary,
        },
      ]}
    >
      <Text style={[styles.rankLabel, { color: accent }]}>RANK</Text>
      <Text
        style={[
          styles.rankTier,
          size === 'lg' ? styles.rankTierLg : size === 'sm' ? styles.rankTierSm : null,
          { color: accent },
        ]}
      >
        {rank}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  crest: {
    borderWidth: borders.active,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    flexShrink: 0,
  },
  rankLabel: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: typography.weights.bold,
    letterSpacing: typography.letterSpacing.systemHud,
  },
  rankTier: {
    fontSize: typography.sizes.xl,
    lineHeight: typography.lineHeights.xl,
    fontWeight: typography.weights.heavy,
  },
  rankTierSm: {
    fontSize: typography.sizes.lg,
    lineHeight: typography.lineHeights.lg,
  },
  rankTierLg: {
    fontSize: typography.sizes.xxl,
    lineHeight: typography.lineHeights.xxl,
  },
});

const sizeStyles = StyleSheet.create({
  sm: {
    minWidth: 52,
    minHeight: 48,
  },
  md: {
    minWidth: 64,
    minHeight: 56,
  },
  lg: {
    minWidth: 80,
    minHeight: 72,
  },
});
