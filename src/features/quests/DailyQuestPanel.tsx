import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ExerciseQuestCard } from '../../components/quests/ExerciseQuestCard';
import { QuestCompletionModal } from '../../components/quests/QuestCompletionModal';
import { TargetEvolutionPrompt } from '../../components/quests/TargetEvolutionPrompt';
import { RewardSummaryCard } from '../../components/rewards/RewardSummaryCard';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { SystemBadge } from '../../components/ui/SystemBadge';
import { SystemButton } from '../../components/ui/SystemButton';
import { SystemCard } from '../../components/ui/SystemCard';
import { EXERCISE_IDS } from '../../domain/models/system.models';
import {
  areAllExercisesCompleted,
  getCompletedExercisesCount,
} from '../../domain/rules/quest.rules';
import { useSystemStore } from '../../store/useSystemStore';
import { colors, spacing, typography } from '../../theme/tokens';

export interface DailyQuestPanelProps {
  onNavigateToCleared?: () => void;
}

export function DailyQuestPanel({ onNavigateToCleared }: DailyQuestPanelProps) {
  const dailyQuest = useSystemStore((s) => s.dailyQuest);
  const isProcessingCompletion = useSystemStore((s) => s.isProcessingCompletion);
  const recordExercise = useSystemStore((s) => s.recordExercise);
  const undoExercise = useSystemStore((s) => s.undoExercise);
  const completeDailyQuest = useSystemStore((s) => s.completeDailyQuest);

  const [selectedChoice, setSelectedChoice] = useState<
    'ACCEPT_NEW_TARGET' | 'KEEP_CURRENT_TARGET'
  >('ACCEPT_NEW_TARGET');
  const [modalVisible, setModalVisible] = useState(false);

  const completedCount = getCompletedExercisesCount(dailyQuest);
  const allCompleted = areAllExercisesCompleted(dailyQuest);
  const isQuestCompleted = dailyQuest.status === 'COMPLETED';

  const handleCompleteQuestDirectOrModal = async () => {
    if (isQuestCompleted) {
      if (onNavigateToCleared) {
        onNavigateToCleared();
      }
      return;
    }

    const choiceToApply = dailyQuest.exceededTarget
      ? selectedChoice
      : 'KEEP_CURRENT_TARGET';

    const outcome = await completeDailyQuest(choiceToApply);
    setModalVisible(false);
    if (outcome.ok && onNavigateToCleared) {
      onNavigateToCleared();
    }
  };

  return (
    <View style={styles.container}>
      <SystemCard
        variant={isQuestCompleted ? 'successGlow' : 'cyanGlow'}
        hudTag="[DIRETRIZ DIÁRIA DO SISTEMA]"
        title="Treinamento de Força do Caçador"
        subtitle={`Meta-base vigente: ${dailyQuest.baseTarget} repetições (${dailyQuest.baseTarget * 10} Polichinelos)`}
        rightSlot={
          <SystemBadge
            label={isQuestCompleted ? 'MISSÃO CONCLUÍDA' : `${completedCount}/4 CONCLUÍDOS`}
            tone={isQuestCompleted ? 'success' : completedCount === 4 ? 'warning' : 'cyan'}
          />
        }
      >
        <ProgressBar
          current={completedCount}
          total={4}
          label="PROGRESSO DA MISSÃO DIÁRIA (0/4 A 4/4)"
          valueLabel={`${completedCount} / 4 exercícios`}
          accentColor={isQuestCompleted ? colors.statusSuccess : colors.accentCyan}
          height={12}
        />

        {allCompleted && !isQuestCompleted && dailyQuest.exceededTarget ? (
          <TargetEvolutionPrompt
            currentBaseTarget={dailyQuest.baseTarget}
            exceededTarget={dailyQuest.exceededTarget}
            selectedChoice={selectedChoice}
            onSelectChoice={setSelectedChoice}
          />
        ) : null}

        <View style={styles.ctaSection}>
          {!isQuestCompleted ? (
            <SystemButton
              label={
                allCompleted
                  ? 'Concluir Missão Diária & Resgatar Recompensas'
                  : `Conclua os 4 Exercícios (${completedCount}/4)`
              }
              variant={allCompleted ? 'cyan' : 'secondary'}
              disabled={!allCompleted || isProcessingCompletion}
              fullWidth
              onPress={() => void handleCompleteQuestDirectOrModal()}
            />
          ) : (
            <View style={styles.completedNoticeCol}>
              <Text style={styles.completedNoticeText}>
                Missão de hoje ({dailyQuest.dateKey}) concluída com sucesso! Recompensas já
                creditadas ao seu status.
              </Text>
              {onNavigateToCleared ? (
                <SystemButton
                  label="Ver Relatório QUEST CLEARED"
                  variant="success"
                  fullWidth
                  onPress={onNavigateToCleared}
                />
              ) : null}
            </View>
          )}
        </View>
      </SystemCard>

      <View style={styles.exercisesList}>
        {EXERCISE_IDS.map((id) => (
          <ExerciseQuestCard
            key={id}
            exercise={dailyQuest.exercises[id]}
            isQuestCompleted={isQuestCompleted}
            onRecordReps={recordExercise}
            onUndo={undoExercise}
          />
        ))}
      </View>

      <RewardSummaryCard
        baseTarget={dailyQuest.baseTarget}
        rewardClaimed={dailyQuest.rewardClaimed}
      />

      <QuestCompletionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        dailyQuest={dailyQuest}
        selectedChoice={selectedChoice}
        onSelectChoice={setSelectedChoice}
        onConfirmCompletion={() => void handleCompleteQuestDirectOrModal()}
        isSubmitting={isProcessingCompletion}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  ctaSection: {
    paddingTop: spacing.xs,
  },
  completedNoticeCol: {
    gap: spacing.sm,
  },
  completedNoticeText: {
    color: colors.statusSuccess,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    fontWeight: typography.weights.semibold,
  },
  exercisesList: {
    gap: spacing.md,
  },
});
