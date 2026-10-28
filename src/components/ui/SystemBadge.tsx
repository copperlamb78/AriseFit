import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { borders, colors, radii, spacing, typography } from '../../theme/tokens';

export type SystemBadgeTone =
  | 'cyan'
  | 'blue'
  | 'success'
  | 'warning'
  | 'danger'
  | 'neutral';

export interface SystemBadgeProps {
  label: string;
  tone?: SystemBadgeTone;
  symbol?: string;
  style?: StyleProp<ViewStyle>;
}

export function SystemBadge({
  label,
  tone = 'cyan',
  symbol,
  style,
}: SystemBadgeProps) {
  return (
    <View style={[styles.badge, toneContainerStyles[tone], style]}>
      {symbol ? (
        <Text numberOfLines={1} style={[styles.symbol, toneTextStyles[tone]]}>
          {symbol}
        </Text>
      ) : null}
      <Text numberOfLines={1} style={[styles.label, toneTextStyles[tone]]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
    borderWidth: borders.thin,
    flexShrink: 0,
  },
  symbol: {
    fontSize: typography.sizes.xs,
    lineHeight: typography.lineHeights.xs,
    fontWeight: typography.weights.bold,
    flexShrink: 0,
  },
  label: {
    fontSize: typography.sizes.xs,
    lineHeight: typography.lineHeights.xs,
    fontWeight: typography.weights.bold,
    letterSpacing: typography.letterSpacing.wide,
    flexShrink: 0,
  },
});

const toneContainerStyles: Record<SystemBadgeTone, ViewStyle> = {
  cyan: {
    backgroundColor: colors.cyanGlowBg,
    borderColor: colors.accentCyan,
  },
  blue: {
    backgroundColor: colors.blueGlowBg,
    borderColor: colors.accentBlue,
  },
  success: {
    backgroundColor: colors.successGlowBg,
    borderColor: colors.statusSuccess,
  },
  warning: {
    backgroundColor: colors.warningGlowBg,
    borderColor: colors.statusWarning,
  },
  danger: {
    backgroundColor: colors.dangerGlowBg,
    borderColor: colors.statusDanger,
  },
  neutral: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.borderSubtle,
  },
};

const toneTextStyles = StyleSheet.create({
  cyan: {
    color: colors.accentCyan,
  },
  blue: {
    color: colors.accentBlue,
  },
  success: {
    color: colors.statusSuccess,
  },
  warning: {
    color: colors.statusWarning,
  },
  danger: {
    color: colors.statusDanger,
  },
  neutral: {
    color: colors.textSecondary,
  },
});
