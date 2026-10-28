import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { calculateQuestRewards } from '../../domain/rules/reward.rules';
import { borders, colors, radii, spacing, typography } from '../../theme/tokens';
import { SystemBadge } from '../ui/SystemBadge';
import { SystemCard } from '../ui/SystemCard';

export interface RewardSummaryCardProps {
  baseTarget: number;
  rewardClaimed: boolean;
}

export function RewardSummaryCard({
  baseTarget,
  rewardClaimed,
}: RewardSummaryCardProps) {
  const rewards = calculateQuestRewards(baseTarget);

  return (
    <SystemCard
      variant={rewardClaimed ? 'successGlow' : 'default'}
      hudTag="[PACOTE DE RECOMPENSA DIÁRIA]"
      title="Espólios da Missão"
      subtitle="Concedidos uma única vez ao concluir todos os 4 exercícios do dia."
      rightSlot={
        <SystemBadge
          label={rewardClaimed ? 'RECEBIDO' : 'DISPONÍVEL'}
          tone={rewardClaimed ? 'success' : 'cyan'}
        />
      }
    >
      <View style={styles.rewardsGrid}>
        <View style={styles.rewardBox}>
          <Text style={styles.rewardValue}>+{rewards.xpEarned}</Text>
          <Text style={styles.rewardLabel}>XP DE EVOLUÇÃO</Text>
        </View>
        <View style={styles.rewardBox}>
          <Text style={styles.rewardValueGold}>+{rewards.coinsEarned}</Text>
          <Text style={styles.rewardLabel}>MOEDAS DO SISTEMA</Text>
        </View>
        <View style={styles.rewardBox}>
          <Text style={styles.rewardValueGreen}>+{rewards.attributePointsEarned}</Text>
          <Text style={styles.rewardLabel}>PTS. ATRIBUTO</Text>
        </View>
      </View>
    </SystemCard>
  );
}

const styles = StyleSheet.create({
  rewardsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  rewardBox: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: radii.md,
    borderWidth: borders.thin,
    borderColor: colors.borderSubtle,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  rewardValue: {
    color: colors.accentCyan,
    fontSize: typography.sizes.lg,
    lineHeight: typography.lineHeights.lg,
    fontWeight: typography.weights.heavy,
  },
  rewardValueGold: {
    color: colors.statusWarning,
    fontSize: typography.sizes.lg,
    lineHeight: typography.lineHeights.lg,
    fontWeight: typography.weights.heavy,
  },
  rewardValueGreen: {
    color: colors.statusSuccess,
    fontSize: typography.sizes.lg,
    lineHeight: typography.lineHeights.lg,
    fontWeight: typography.weights.heavy,
  },
  rewardLabel: {
    color: colors.textSecondary,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
  },
});
