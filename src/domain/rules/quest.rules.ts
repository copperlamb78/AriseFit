import {
  DailyQuest,
  EXERCISE_IDS,
  ExerciseId,
  ExerciseProgress,
  MAX_HISTORY_ENTRIES,
  PersistedAppState,
  ProgressionChoice,
  QuestHistoryEntry,
  ValidationResult,
} from '../models/system.models';
import {
  calculateRankFromBaseTarget,
  EXERCISE_CATALOG,
  getExerciseTarget,
  getHunterTitleByRank,
  getNextStep,
  MAX_BASE_TARGET,
  normalizeBaseTarget,
} from './progression.rules';
import { calculateQuestRewards, grantRewardsToPlayer } from './reward.rules';

export interface ExerciseMutationResult {
  ok: boolean;
  success: boolean;
  quest: DailyQuest;
  error?: string;
}

export interface QuestCompletionResult {
  ok: boolean;
  success: boolean;
  alreadyCompleted: boolean;
  state: PersistedAppState;
  error?: string;
}

/**
 * Cria uma instância limpa de Missão Diária para a data local informada.
 */
export function createDailyQuest(dateKey: string, baseTarget: number): DailyQuest {
  const safeBase = normalizeBaseTarget(baseTarget);
  const exercises = {} as Record<ExerciseId, ExerciseProgress>;

  for (const id of EXERCISE_IDS) {
    const catalog = EXERCISE_CATALOG[id];
    exercises[id] = {
      id,
      name: catalog.name,
      unitLabel: catalog.unitLabel,
      multiplier: catalog.multiplier,
      targetReps: getExerciseTarget(id, safeBase),
      maxAllowedReps: catalog.maxAllowedReps,
      performedReps: 0,
      completed: false,
      completedAt: null,
    };
  }

  return {
    id: `quest-${dateKey}`,
    dateKey,
    baseTarget: safeBase,
    status: 'IN_PROGRESS',
    exercises,
    rewardClaimed: false,
    exceededTarget: false,
    progressionChoice: 'NOT_APPLICABLE',
    completedAt: null,
  };
}

/**
 * Valida o valor numérico informado pelo usuário para um exercício.
 * Rejeita negativos, decimais, NaN, Infinity e valores acima do teto (100 ou 1000).
 */
export function validateExerciseInput(
  exerciseId: ExerciseId,
  reps: unknown,
): ValidationResult {
  const catalog = EXERCISE_CATALOG[exerciseId];
  if (!catalog) {
    return {
      valid: false,
      error: 'Exercício inválido no catálogo do Sistema.',
    };
  }

  if (typeof reps !== 'number' || !Number.isFinite(reps) || !Number.isInteger(reps)) {
    return {
      valid: false,
      error: 'Informe um número inteiro válido de repetições.',
    };
  }

  if (reps < 0) {
    return {
      valid: false,
      error: 'A quantidade realizada não pode ser negativa.',
    };
  }

  if (reps > catalog.maxAllowedReps) {
    return {
      valid: false,
      error: `O limite máximo permitido para ${catalog.name} é ${catalog.maxAllowedReps} repetições.`,
    };
  }

  return {
    valid: true,
    sanitizedReps: reps,
  };
}

/**
 * Verifica se pelo menos um exercício superou a meta do dia.
 */
export function hasQuestExceededTarget(quest: DailyQuest): boolean {
  for (const id of EXERCISE_IDS) {
    const ex = quest.exercises[id];
    if (ex && ex.performedReps > ex.targetReps) {
      return true;
    }
  }
  return false;
}

/**
 * Verifica se todos os 4 exercícios atingiram a meta mínima.
 */
export function areAllExercisesCompleted(quest: DailyQuest): boolean {
  for (const id of EXERCISE_IDS) {
    const ex = quest.exercises[id];
    if (!ex || !ex.completed || ex.performedReps < ex.targetReps) {
      return false;
    }
  }
  return true;
}

/**
 * Retorna a contagem de exercícios concluídos (0 a 4).
 */
export function getCompletedExercisesCount(quest: DailyQuest): number {
  let count = 0;
  for (const id of EXERCISE_IDS) {
    if (quest.exercises[id]?.completed) {
      count += 1;
    }
  }
  return count;
}

/**
 * Registra as repetições realizadas em um exercício da Missão Diária.
 * Enquanto a missão estiver IN_PROGRESS, o registro pode ser atualizado.
 */
export function recordExerciseExecution(
  quest: DailyQuest,
  exerciseId: ExerciseId,
  reps: number,
  nowIso: string = new Date().toISOString(),
): ExerciseMutationResult {
  if (quest.status === 'COMPLETED' || quest.rewardClaimed) {
    return {
      ok: false,
      success: false,
      quest,
      error: 'A Missão Diária já foi concluída e seus registros estão bloqueados.',
    };
  }

  const validation = validateExerciseInput(exerciseId, reps);
  if (!validation.valid || validation.sanitizedReps === undefined) {
    return {
      ok: false,
      success: false,
      quest,
      error: validation.error ?? 'Valor inválido.',
    };
  }

  const currentExercise = quest.exercises[exerciseId];
  const validReps = validation.sanitizedReps;
  const isCompleted = validReps >= currentExercise.targetReps;

  const updatedExercises: Record<ExerciseId, ExerciseProgress> = {
    ...quest.exercises,
    [exerciseId]: {
      ...currentExercise,
      performedReps: validReps,
      completed: isCompleted,
      completedAt: isCompleted ? nowIso : null,
    },
  };

  const nextQuest: DailyQuest = {
    ...quest,
    exercises: updatedExercises,
  };
  nextQuest.exceededTarget = hasQuestExceededTarget(nextQuest);

  return {
    ok: true,
    success: true,
    quest: nextQuest,
  };
}

/**
 * Permite desfazer/resetar um exercício antes do encerramento da Missão Diária.
 */
export function undoExerciseExecution(
  quest: DailyQuest,
  exerciseId: ExerciseId,
): ExerciseMutationResult {
  if (quest.status === 'COMPLETED' || quest.rewardClaimed) {
    return {
      ok: false,
      success: false,
      quest,
      error: 'Não é permitido desfazer exercícios após o encerramento da Missão Diária.',
    };
  }

  const currentExercise = quest.exercises[exerciseId];
  if (!currentExercise) {
    return {
      ok: false,
      success: false,
      quest,
      error: 'Exercício não encontrado.',
    };
  }

  const updatedExercises: Record<ExerciseId, ExerciseProgress> = {
    ...quest.exercises,
    [exerciseId]: {
      ...currentExercise,
      performedReps: 0,
      completed: false,
      completedAt: null,
    },
  };

  const nextQuest: DailyQuest = {
    ...quest,
    exercises: updatedExercises,
  };
  nextQuest.exceededTarget = hasQuestExceededTarget(nextQuest);

  return {
    ok: true,
    success: true,
    quest: nextQuest,
  };
}

export function buildExercisesSummary(
  quest: DailyQuest,
): Record<ExerciseId, { target: number; performed: number }> {
  return {
    pushups: {
      target: quest.exercises.pushups.targetReps,
      performed: quest.exercises.pushups.performedReps,
    },
    squats: {
      target: quest.exercises.squats.targetReps,
      performed: quest.exercises.squats.performedReps,
    },
    situps: {
      target: quest.exercises.situps.targetReps,
      performed: quest.exercises.situps.performedReps,
    },
    jumping_jacks: {
      target: quest.exercises.jumping_jacks.targetReps,
      performed: quest.exercises.jumping_jacks.performedReps,
    },
  };
}

/**
 * Conclui a Missão Diária com tripla barreira de idempotência.
 * Concede +XP, +Moedas e +3 Pontos de Atributo exatamente 1 vez por missão.
 * Respeita a decisão explícita do jogador ("ACCEPT_NEW_TARGET" vs "KEEP_CURRENT_TARGET").
 */
export function completeDailyQuest(
  state: PersistedAppState,
  choice: ProgressionChoice = 'KEEP_CURRENT_TARGET',
  nowIso: string = new Date().toISOString(),
): QuestCompletionResult {
  const { dailyQuest, player, history } = state;

  // Tripla barreira de idempotência contra duplo clique ou re-execução
  const alreadyInHistory = history.some(
    (entry) => entry.questId === dailyQuest.id && entry.status === 'COMPLETED',
  );

  if (dailyQuest.rewardClaimed || dailyQuest.status === 'COMPLETED' || alreadyInHistory) {
    return {
      ok: true,
      success: true,
      alreadyCompleted: true,
      state,
    };
  }

  if (!areAllExercisesCompleted(dailyQuest)) {
    return {
      ok: false,
      success: false,
      alreadyCompleted: false,
      state,
      error: 'Complete todos os 4 exercícios atingindo a meta mínima antes de concluir a missão.',
    };
  }

  const exceededTarget = hasQuestExceededTarget(dailyQuest);
  const currentBase = normalizeBaseTarget(player.baseTarget);

  let nextBaseTarget = currentBase;
  let effectiveChoice: ProgressionChoice = choice;

  if (currentBase >= MAX_BASE_TARGET) {
    nextBaseTarget = MAX_BASE_TARGET;
    effectiveChoice = choice === 'ACCEPT_NEW_TARGET' ? 'ACCEPT_NEW_TARGET' : 'NOT_APPLICABLE';
  } else if (choice === 'ACCEPT_NEW_TARGET') {
    nextBaseTarget = getNextStep(currentBase);
    effectiveChoice = 'ACCEPT_NEW_TARGET';
  } else if (choice === 'KEEP_CURRENT_TARGET') {
    nextBaseTarget = currentBase;
    effectiveChoice = 'KEEP_CURRENT_TARGET';
  } else {
    nextBaseTarget = currentBase;
    effectiveChoice = 'NOT_APPLICABLE';
  }

  const rewards = calculateQuestRewards(dailyQuest.baseTarget);
  const rewardedPlayer = grantRewardsToPlayer(player, rewards);
  const nextRank = calculateRankFromBaseTarget(nextBaseTarget);
  const nextStreak = rewardedPlayer.currentStreak + 1;

  const updatedPlayer = {
    ...rewardedPlayer,
    baseTarget: nextBaseTarget,
    rank: nextRank,
    title: getHunterTitleByRank(nextRank),
    currentStreak: nextStreak,
    bestStreak: Math.max(rewardedPlayer.bestStreak, nextStreak),
    totalCompletedQuests: rewardedPlayer.totalCompletedQuests + 1,
    lastActiveDateKey: dailyQuest.dateKey,
  };

  const completedQuest: DailyQuest = {
    ...dailyQuest,
    status: 'COMPLETED',
    rewardClaimed: true,
    exceededTarget,
    progressionChoice: effectiveChoice,
    completedAt: nowIso,
  };

  const historyEntry: QuestHistoryEntry = {
    questId: completedQuest.id,
    dateKey: completedQuest.dateKey,
    status: 'COMPLETED',
    baseTargetAtCompletion: completedQuest.baseTarget,
    nextBaseTargetApplied: nextBaseTarget,
    progressionChoice: effectiveChoice,
    exceededTarget,
    xpEarned: rewards.xpEarned,
    coinsEarned: rewards.coinsEarned,
    attributePointsEarned: rewards.attributePointsEarned,
    exercisesSummary: buildExercisesSummary(completedQuest),
    recordedAt: nowIso,
  };

  const updatedHistory = [historyEntry, ...history].slice(0, MAX_HISTORY_ENTRIES);

  return {
    ok: true,
    success: true,
    alreadyCompleted: false,
    state: {
      ...state,
      player: updatedPlayer,
      dailyQuest: completedQuest,
      history: updatedHistory,
    },
  };
}

/**
 * Permite ao jogador confirmar ou alternar sua decisão ("Aceitar nova meta" vs "Manter meta atual")
 * na tela de conclusão da missão do dia atual, sem duplicar recompensas.
 */
export function applyProgressionChoiceForCompletedQuest(
  state: PersistedAppState,
  choice: 'ACCEPT_NEW_TARGET' | 'KEEP_CURRENT_TARGET',
): PersistedAppState {
  const { dailyQuest, player, history } = state;
  if (dailyQuest.status !== 'COMPLETED') {
    return state;
  }

  const questBase = normalizeBaseTarget(dailyQuest.baseTarget);
  const nextBaseTarget =
    choice === 'ACCEPT_NEW_TARGET' ? getNextStep(questBase) : questBase;
  const nextRank = calculateRankFromBaseTarget(nextBaseTarget);

  const updatedPlayer = {
    ...player,
    baseTarget: nextBaseTarget,
    rank: nextRank,
    title: getHunterTitleByRank(nextRank),
  };

  const updatedQuest: DailyQuest = {
    ...dailyQuest,
    progressionChoice: choice,
  };

  const updatedHistory = history.map((entry) =>
    entry.questId === dailyQuest.id
      ? {
          ...entry,
          progressionChoice: choice,
          nextBaseTargetApplied: nextBaseTarget,
        }
      : entry,
  );

  return {
    ...state,
    player: updatedPlayer,
    dailyQuest: updatedQuest,
    history: updatedHistory,
  };
}
