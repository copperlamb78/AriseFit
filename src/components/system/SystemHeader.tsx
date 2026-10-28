import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PlayerStats } from '../../domain/models/system.models';
import { borders, colors, radii, spacing, typography } from '../../theme/tokens';
import { ProgressBar } from '../ui/ProgressBar';
import { SystemBadge } from '../ui/SystemBadge';
import { RankCrest } from './RankCrest';

export interface SystemHeaderProps {
  player: PlayerStats;
  dateKey: string;
}

export function SystemHeader({ player, dateKey }: SystemHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.identityCol}>
          <Text style={styles.systemTag}>[SISTEMA ARISEFIT // STATUS DO JOGADOR]</Text>
          <Text numberOfLines={1} style={styles.hunterName}>
            {player.hunterName}
          </Text>
          <Text numberOfLines={1} style={styles.hunterTitle}>
            {player.title}
          </Text>
        </View>
        <RankCrest rank={player.rank} size="md" />
      </View>

      <View style={styles.badgesRow}>
        <SystemBadge label={`NÍVEL ${player.level}`} tone="cyan" />
        <SystemBadge label={`${player.coins} MOEDAS`} tone="warning" />
        <SystemBadge label={`SEQUÊNCIA: ${player.currentStreak}D`} tone="success" />
        <SystemBadge label={`DATA: ${dateKey}`} tone="neutral" />
      </View>

      <ProgressBar
        current={player.currentXp}
        total={player.xpToNextLevel}
        label="EXPERIÊNCIA DE NÍVEL (XP)"
        valueLabel={`${player.currentXp} / ${player.xpToNextLevel} XP`}
        accentColor={colors.accentCyan}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.lg,
    borderWidth: borders.active,
    borderColor: colors.accentCyan,
    padding: spacing.lg,
    gap: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  identityCol: {
    flex: 1,
    gap: spacing.xs,
  },
  systemTag: {
    color: colors.accentCyan,
    fontSize: typography.sizes.xs,
    lineHeight: typography.lineHeights.xs,
    fontWeight: typography.weights.bold,
    letterSpacing: typography.letterSpacing.wide,
  },
  hunterName: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xl,
    lineHeight: typography.lineHeights.xl,
    fontWeight: typography.weights.heavy,
  },
  hunterTitle: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    fontWeight: typography.weights.semibold,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
