import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { DailyQuest, EXERCISE_IDS } from '../../domain/models/system.models';
import { calculateQuestRewards } from '../../domain/rules/reward.rules';
import { borders, colors, radii, spacing, typography } from '../../theme/tokens';
import { SystemButton } from '../ui/SystemButton';
import { SystemModal } from '../ui/SystemModal';
import { TargetEvolutionPrompt } from './TargetEvolutionPrompt';

export interface QuestCompletionModalProps {
  visible: boolean;
  onClose: () => void;
  dailyQuest: DailyQuest;
  selectedChoice: 'ACCEPT_NEW_TARGET' | 'KEEP_CURRENT_TARGET';
  onSelectChoice: (choice: 'ACCEPT_NEW_TARGET' | 'KEEP_CURRENT_TARGET') => void;
  onConfirmCompletion: () => void;
  isSubmitting?: boolean;
}

export function QuestCompletionModal({
  visible,
  onClose,
  dailyQuest,
  selectedChoice,
  onSelectChoice,
  onConfirmCompletion,
  isSubmitting = false,
}: QuestCompletionModalProps) {
  const rewards = calculateQuestRewards(dailyQuest.baseTarget);

  return (
    <SystemModal
      visible={visible}
      onClose={onClose}
      hudTag="[VERIFICAÇÃO DE MISSÃO CONCLUÍDA]"
      title="Encerrar Missão Diária"
      subtitle="Confirme a execução dos 4 exercícios e receba as recompensas do Sistema."
      footer={
        <View style={styles.footerRow}>
          <SystemButton
            label="Voltar"
            variant="ghost"
            onPress={onClose}
            disabled={isSubmitting}
            style={styles.flexBtn}
          />
          <SystemButton
            label={isSubmitting ? 'Processando...' : 'Confirmar & Receber'}
            variant="cyan"
            onPress={onConfirmCompletion}
            disabled={isSubmitting}
            style={styles.flexBtn}
          />
        </View>
      }
    >
      <View style={styles.summaryBox}>
        <Text style={styles.sectionTitle}>RESUMO DE EXECUÇÃO</Text>
        {EXERCISE_IDS.map((id) => {
          const ex = dailyQuest.exercises[id];
          return (
            <View key={id} style={styles.exerciseRow}>
              <Text style={styles.exerciseName}>{ex.name}</Text>
              <Text style={styles.exerciseNums}>
                {ex.performedReps} / {ex.targetReps} {ex.unitLabel}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={styles.rewardsBox}>
        <Text style={styles.sectionTitle}>RECOMPENSAS DO SISTEMA</Text>
        <View style={styles.rewardsRow}>
          <View style={styles.rewardPill}>
            <Text style={styles.rewardValue}>+{rewards.xpEarned}</Text>
            <Text style={styles.rewardLabel}>XP</Text>
          </View>
          <View style={styles.rewardPill}>
            <Text style={styles.rewardValue}>+{rewards.coinsEarned}</Text>
            <Text style={styles.rewardLabel}>MOEDAS</Text>
          </View>
          <View style={styles.rewardPill}>
            <Text style={styles.rewardValue}>+{rewards.attributePointsEarned}</Text>
            <Text style={styles.rewardLabel}>ATRIBUTOS</Text>
          </View>
        </View>
      </View>

      <TargetEvolutionPrompt
        currentBaseTarget={dailyQuest.baseTarget}
        exceededTarget={dailyQuest.exceededTarget}
        selectedChoice={selectedChoice}
        onSelectChoice={onSelectChoice}
      />
    </SystemModal>
  );
}

const styles = StyleSheet.create({
  summaryBox: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: radii.md,
    borderWidth: borders.thin,
    borderColor: colors.borderSubtle,
    padding: spacing.md,
    gap: spacing.sm,
  },
  sectionTitle: {
    color: colors.accentCyan,
    fontSize: typography.sizes.xs,
    lineHeight: typography.lineHeights.xs,
    fontWeight: typography.weights.bold,
    letterSpacing: typography.letterSpacing.wide,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  exerciseName: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  exerciseNums: {
    color: colors.statusSuccess,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  rewardsBox: {
    backgroundColor: colors.surfaceCard,
    borderRadius: radii.md,
    borderWidth: borders.thin,
    borderColor: colors.borderSubtle,
    padding: spacing.md,
    gap: spacing.sm,
  },
  rewardsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  rewardPill: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: radii.sm,
    borderWidth: borders.thin,
    borderColor: colors.accentCyan,
    padding: spacing.sm,
    alignItems: 'center',
  },
  rewardValue: {
    color: colors.accentCyan,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.heavy,
  },
  rewardLabel: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: typography.weights.bold,
  },
  footerRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  flexBtn: {
    flex: 1,
  },
});
