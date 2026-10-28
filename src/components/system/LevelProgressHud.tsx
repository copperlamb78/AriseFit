import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PlayerStats } from '../../domain/models/system.models';
import { getNextStep } from '../../domain/rules/progression.rules';
import { borders, colors, radii, spacing, typography } from '../../theme/tokens';
import { ProgressBar } from '../ui/ProgressBar';

export interface LevelProgressHudProps {
  player: PlayerStats;
}

export function LevelProgressHud({ player }: LevelProgressHudProps) {
  const nextStep = getNextStep(player.baseTarget);

  return (
    <View style={styles.container}>
      <View style={styles.metricsRow}>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>META-BASE ATUAL</Text>
          <Text style={styles.metricValue}>{player.baseTarget} reps</Text>
          <Text style={styles.metricSub}>Polichinelos: {player.baseTarget * 10}</Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>PRÓXIMO DEGRAU</Text>
          <Text style={styles.metricValueCyan}>{nextStep} reps</Text>
          <Text style={styles.metricSub}>Polichinelos: {nextStep * 10}</Text>
        </View>
      </View>

      <ProgressBar
        current={player.baseTarget}
        total={100}
        label="PROGRESSÃO RUMO AO RANK S (TETO 100 / 1000)"
        valueLabel={`${player.baseTarget} / 100`}
        accentColor={colors.accentBlue}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceCard,
    borderRadius: radii.lg,
    borderWidth: borders.thin,
    borderColor: colors.borderSubtle,
    padding: spacing.lg,
    gap: spacing.md,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  metricBox: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: radii.md,
    borderWidth: borders.thin,
    borderColor: colors.borderSubtle,
    padding: spacing.md,
    gap: spacing.xs,
  },
  metricLabel: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    lineHeight: typography.lineHeights.xs,
    fontWeight: typography.weights.bold,
    letterSpacing: typography.letterSpacing.wide,
  },
  metricValue: {
    color: colors.textPrimary,
    fontSize: typography.sizes.lg,
    lineHeight: typography.lineHeights.lg,
    fontWeight: typography.weights.heavy,
  },
  metricValueCyan: {
    color: colors.accentCyan,
    fontSize: typography.sizes.lg,
    lineHeight: typography.lineHeights.lg,
    fontWeight: typography.weights.heavy,
  },
  metricSub: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    lineHeight: typography.lineHeights.xs,
  },
});
