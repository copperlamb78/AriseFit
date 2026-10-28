import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { EXERCISE_IDS, QuestHistoryEntry } from '../../domain/models/system.models';
import { EXERCISE_CATALOG } from '../../domain/rules/progression.rules';
import { borders, colors, radii, spacing, typography } from '../../theme/tokens';
import { formatDateKeyToBr } from '../../utils/validation';
import { SystemBadge } from '../ui/SystemBadge';
import { SystemCard } from '../ui/SystemCard';

export interface HistoryTimelineItemProps {
  entry: QuestHistoryEntry;
}

export function HistoryTimelineItem({ entry }: HistoryTimelineItemProps) {
  const isCompleted = entry.status === 'COMPLETED';

  return (
    <SystemCard
      variant={isCompleted ? 'default' : 'elevated'}
      hudTag={`[REGISTRO IMUTÁVEL // ${entry.dateKey}]`}
      title={`Missão de ${formatDateKeyToBr(entry.dateKey)}`}
      subtitle={`Meta-base solicitada: ${entry.baseTargetAtCompletion} reps (${entry.baseTargetAtCompletion * 10} Polichinelos)`}
      rightSlot={
        <SystemBadge
          label={isCompleted ? 'CONCLUÍDA' : 'INCOMPLETA'}
          tone={isCompleted ? 'success' : 'danger'}
        />
      }
    >
      <View style={styles.exercisesList}>
        {EXERCISE_IDS.map((id) => {
          const summary = entry.exercisesSummary[id];
          const catalog = EXERCISE_CATALOG[id];
          const metTarget = summary.performed >= summary.target;

          return (
            <View key={id} style={styles.exerciseRow}>
              <Text style={styles.exerciseName}>{catalog.name}</Text>
              <Text
                style={[
                  styles.exerciseCount,
                  metTarget ? styles.countSuccess : styles.countIncomplete,
                ]}
              >
                {summary.performed} / {summary.target} reps
              </Text>
            </View>
          );
        })}
      </View>

      <View style={styles.footerRow}>
        <View style={styles.rewardsRow}>
          <SystemBadge label={`+${entry.xpEarned} XP`} tone="cyan" />
          <SystemBadge label={`+${entry.coinsEarned} MOEDAS`} tone="warning" />
          <SystemBadge label={`+${entry.attributePointsEarned} PTS`} tone="success" />
        </View>
        {entry.exceededTarget ? (
          <Text style={styles.progressionNote}>
            Meta superada • Próxima meta aplicada: {entry.nextBaseTargetApplied} reps
          </Text>
        ) : (
          <Text style={styles.progressionNote}>
            Próxima meta aplicada: {entry.nextBaseTargetApplied} reps
          </Text>
        )}
      </View>
    </SystemCard>
  );
}

const styles = StyleSheet.create({
  exercisesList: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: radii.md,
    borderWidth: borders.thin,
    borderColor: colors.borderSubtle,
    padding: spacing.md,
    gap: spacing.xs,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  exerciseName: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  exerciseCount: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  countSuccess: {
    color: colors.statusSuccess,
  },
  countIncomplete: {
    color: colors.statusDanger,
  },
  footerRow: {
    gap: spacing.xs,
  },
  rewardsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  progressionNote: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    lineHeight: typography.lineHeights.xs,
  },
});
