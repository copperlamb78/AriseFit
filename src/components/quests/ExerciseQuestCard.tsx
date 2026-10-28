import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ExerciseId, ExerciseProgress } from '../../domain/models/system.models';
import { EXERCISE_CATALOG } from '../../domain/rules/progression.rules';
import { validateExerciseInput } from '../../domain/rules/quest.rules';
import { borders, colors, radii, spacing, typography } from '../../theme/tokens';
import { parseStrictNonNegativeInt } from '../../utils/validation';
import { NumericInput } from '../ui/NumericInput';
import { ProgressBar } from '../ui/ProgressBar';
import { SystemBadge } from '../ui/SystemBadge';
import { SystemButton } from '../ui/SystemButton';
import { SystemCard } from '../ui/SystemCard';

export interface ExerciseQuestCardProps {
  exercise: ExerciseProgress;
  isQuestCompleted: boolean;
  onRecordReps: (exerciseId: ExerciseId, reps: number) => Promise<{ ok: boolean; error?: string }>;
  onUndo: (exerciseId: ExerciseId) => Promise<{ ok: boolean; error?: string }>;
}

export function ExerciseQuestCard({
  exercise,
  isQuestCompleted,
  onRecordReps,
  onUndo,
}: ExerciseQuestCardProps) {
  const [inputValue, setInputValue] = useState<string>(
    exercise.performedReps > 0 ? String(exercise.performedReps) : String(exercise.targetReps),
  );
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    setInputValue(
      exercise.performedReps > 0 ? String(exercise.performedReps) : String(exercise.targetReps),
    );
    setLocalError(null);
  }, [exercise.performedReps, exercise.targetReps]);

  const catalog = EXERCISE_CATALOG[exercise.id];
  const isExceeded = exercise.performedReps > exercise.targetReps;
  const bonusDelta = exercise.multiplier === 10 ? 50 : 5;
  const bonusTarget = Math.min(exercise.targetReps + bonusDelta, exercise.maxAllowedReps);

  const handleApplyReps = async (repsToApply: number) => {
    const validation = validateExerciseInput(exercise.id, repsToApply);
    if (!validation.valid || validation.sanitizedReps === undefined) {
      setLocalError(validation.error ?? 'Quantidade inválida.');
      return;
    }
    setLocalError(null);
    const result = await onRecordReps(exercise.id, validation.sanitizedReps);
    if (!result.ok && result.error) {
      setLocalError(result.error);
    }
  };

  const handleConfirmInput = async () => {
    const parsed = parseStrictNonNegativeInt(inputValue);
    if (parsed === null) {
      setLocalError(
        `Digite um número inteiro entre 0 e ${exercise.maxAllowedReps}.`,
      );
      return;
    }
    await handleApplyReps(parsed);
  };

  const handleUndo = async () => {
    setLocalError(null);
    await onUndo(exercise.id);
  };

  return (
    <SystemCard
      variant={
        exercise.completed
          ? isExceeded
            ? 'warningGlow'
            : 'successGlow'
          : 'default'
      }
      hudTag={
        exercise.multiplier === 10
          ? '[EXERCÍCIO AERÓBICO // MULTIPLICADOR 10X]'
          : '[EXERCÍCIO CALISTÊNICO // META BASE 1X]'
      }
      title={exercise.name}
      subtitle={catalog.shortDescription}
      rightSlot={
        exercise.completed ? (
          <SystemBadge
            label={isExceeded ? 'META SUPERADA' : 'CONCLUÍDO'}
            tone={isExceeded ? 'warning' : 'success'}
          />
        ) : (
          <SystemBadge label="PENDENTE" tone="neutral" />
        )
      }
    >
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>META DO DIA</Text>
          <Text style={styles.statValue}>
            {exercise.targetReps} {exercise.unitLabel}
          </Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>REALIZADO</Text>
          <Text
            style={[
              styles.statValue,
              exercise.completed ? styles.statValueDone : null,
            ]}
          >
            {exercise.performedReps} {exercise.unitLabel}
          </Text>
        </View>
      </View>

      <ProgressBar
        current={Math.min(exercise.performedReps, exercise.targetReps)}
        total={exercise.targetReps}
        label="PROGRESSO DO REQUISITO"
        valueLabel={`${exercise.performedReps} / ${exercise.targetReps} (Teto: ${exercise.maxAllowedReps})`}
        accentColor={
          exercise.completed
            ? isExceeded
              ? colors.statusWarning
              : colors.statusSuccess
            : colors.accentCyan
        }
      />

      {!isQuestCompleted ? (
        <View style={styles.controlsSection}>
          <View style={styles.quickButtonsRow}>
            <SystemButton
              label={`Meta (${exercise.targetReps})`}
              variant={exercise.completed && !isExceeded ? 'success' : 'secondary'}
              compact
              onPress={() => void handleApplyReps(exercise.targetReps)}
              style={styles.flexBtn}
            />
            {exercise.targetReps < exercise.maxAllowedReps ? (
              <SystemButton
                label={`Superar (${bonusTarget})`}
                variant={isExceeded ? 'cyan' : 'secondary'}
                compact
                onPress={() => void handleApplyReps(bonusTarget)}
                style={styles.flexBtn}
              />
            ) : null}
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputWrapper}>
              <NumericInput
                label="REPETIÇÕES REALIZADAS"
                value={inputValue}
                onChangeText={(text) => {
                  setInputValue(text);
                  if (localError) {
                    setLocalError(null);
                  }
                }}
                placeholder={String(exercise.targetReps)}
                errorText={localError}
                helperText={`Mínimo p/ concluir: ${exercise.targetReps} | Máx: ${exercise.maxAllowedReps}`}
              />
            </View>
            <View style={styles.actionBtnsCol}>
              <SystemButton
                label={exercise.completed ? 'Atualizar' : 'Registrar'}
                variant="primary"
                compact
                onPress={() => void handleConfirmInput()}
              />
              {exercise.performedReps > 0 || exercise.completed ? (
                <SystemButton
                  label="Desfazer"
                  variant="ghost"
                  compact
                  onPress={() => void handleUndo()}
                />
              ) : null}
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.lockedBanner}>
          <Text style={styles.lockedText}>
            Registro consolidado na Missão Diária: {exercise.performedReps} / {exercise.targetReps}{' '}
            {exercise.unitLabel}.
          </Text>
        </View>
      )}
    </SystemCard>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: radii.md,
    borderWidth: borders.thin,
    borderColor: colors.borderSubtle,
    padding: spacing.md,
    gap: spacing.xs,
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    lineHeight: typography.lineHeights.xs,
    fontWeight: typography.weights.bold,
    letterSpacing: typography.letterSpacing.wide,
  },
  statValue: {
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
    fontWeight: typography.weights.bold,
  },
  statValueDone: {
    color: colors.statusSuccess,
  },
  controlsSection: {
    gap: spacing.md,
    paddingTop: spacing.xs,
  },
  quickButtonsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  flexBtn: {
    flex: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  inputWrapper: {
    flex: 1,
  },
  actionBtnsCol: {
    gap: spacing.sm,
    paddingTop: spacing.lg,
  },
  lockedBanner: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: radii.md,
    borderWidth: borders.thin,
    borderColor: colors.borderSubtle,
    padding: spacing.md,
  },
  lockedText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    lineHeight: typography.lineHeights.xs,
    fontWeight: typography.weights.semibold,
  },
});
