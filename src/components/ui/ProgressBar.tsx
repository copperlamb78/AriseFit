import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { borders, colors, radii, spacing, typography } from '../../theme/tokens';
import { clampNumber } from '../../utils/validation';

export interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
  valueLabel?: string;
  accentColor?: string;
  height?: number;
}

export function ProgressBar({
  current,
  total,
  label,
  valueLabel,
  accentColor = colors.accentCyan,
  height = 10,
}: ProgressBarProps) {
  const safeTotal = total > 0 ? total : 1;
  const ratio = clampNumber(current / safeTotal, 0, 1);
  const percentage = Math.round(ratio * 100);

  return (
    <View style={styles.wrapper}>
      {label || valueLabel ? (
        <View style={styles.metaRow}>
          {label ? <Text style={styles.label}>{label}</Text> : <View />}
          <Text style={styles.valueLabel}>
            {valueLabel ?? `${current}/${total} (${percentage}%)`}
          </Text>
        </View>
      ) : null}
      <View style={[styles.track, { height }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${percentage}%`,
              backgroundColor: accentColor,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    gap: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  label: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    lineHeight: typography.lineHeights.xs,
    fontWeight: typography.weights.semibold,
    letterSpacing: typography.letterSpacing.wide,
    textTransform: 'uppercase',
  },
  valueLabel: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xs,
    lineHeight: typography.lineHeights.xs,
    fontWeight: typography.weights.bold,
  },
  track: {
    width: '100%',
    backgroundColor: colors.backgroundPrimary,
    borderRadius: radii.pill,
    borderWidth: borders.thin,
    borderColor: colors.borderSubtle,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radii.pill,
  },
});
