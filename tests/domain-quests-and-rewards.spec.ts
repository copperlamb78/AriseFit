import { createInitialAppState } from '../src/domain/rules/date.rules';
import {
  applyProgressionChoiceForCompletedQuest,
  areAllExercisesCompleted,
  completeDailyQuest,
  createDailyQuest,
  getCompletedExercisesCount,
  recordExerciseExecution,
  undoExerciseExecution,
  validateExerciseInput,
} from '../src/domain/rules/quest.rules';
import {
  allocateAttributePoints,
  applyLevelProgression,
  calculateQuestRewards,
} from '../src/domain/rules/reward.rules';

describe('Domain Rules — Missão Diária, Desfazer, Escolha de Meta, Recompensas e Atributos', () => {
  it('deve validar entradas numéricas rejeitando negativos, decimais, NaN e valores acima do teto', () => {
    expect(validateExerciseInput('pushups', -1).valid).toBe(false);
    expect(validateExerciseInput('pushups', 12.5).valid).toBe(false);
    expect(validateExerciseInput('pushups', Number.NaN).valid).toBe(false);
    expect(validateExerciseInput('pushups', 101).valid).toBe(false);
    expect(validateExerciseInput('jumping_jacks', 1001).valid).toBe(false);

    expect(validateExerciseInput('pushups', 100)).toEqual({
      valid: true,
      sanitizedReps: 100,
    });
    expect(validateExerciseInput('jumping_jacks', 1000)).toEqual({
      valid: true,
      sanitizedReps: 1000,
    });
  });

  it('deve registrar repetições realizadas, detectar superação de meta e permitir desfazer antes de concluir', () => {
    let quest = createDailyQuest('2026-10-27', 5);
    expect(getCompletedExercisesCount(quest)).toBe(0);

    // Registro parcial abaixo da meta (3/5) -> ainda não concluído
    const partial = recordExerciseExecution(quest, 'pushups', 3);
    expect(partial.ok).toBe(true);
    expect(partial.quest.exercises.pushups.completed).toBe(false);
    expect(partial.quest.exercises.pushups.performedReps).toBe(3);

    // Registro superando a meta (10/5)
    quest = recordExerciseExecution(partial.quest, 'pushups', 10).quest;
    expect(quest.exercises.pushups.completed).toBe(true);
    expect(quest.exceededTarget).toBe(true);

    // Completar os outros 3 exercícios na meta exata
    quest = recordExerciseExecution(quest, 'squats', 5).quest;
    quest = recordExerciseExecution(quest, 'situps', 5).quest;
    quest = recordExerciseExecution(quest, 'jumping_jacks', 50).quest;
    expect(areAllExercisesCompleted(quest)).toBe(true);
    expect(getCompletedExercisesCount(quest)).toBe(4);

    // Desfazer Agachamentos antes de encerrar a missão
    const undone = undoExerciseExecution(quest, 'squats');
    expect(undone.ok).toBe(true);
    expect(undone.quest.exercises.squats.completed).toBe(false);
    expect(undone.quest.exercises.squats.performedReps).toBe(0);
    expect(areAllExercisesCompleted(undone.quest)).toBe(false);
    expect(getCompletedExercisesCount(undone.quest)).toBe(3);
  });

  it('deve impedir encerramento da missão enquanto qualquer um dos 4 exercícios estiver incompleto', () => {
    const state = createInitialAppState('2026-10-27');
    const result = completeDailyQuest(state, 'ACCEPT_NEW_TARGET');
    expect(result.ok).toBe(false);
    expect(result.state.dailyQuest.status).toBe('IN_PROGRESS');
    expect(result.state.player.coins).toBe(0);
  });

  it('deve conceder +XP, +Moedas e +3 Pontos de Atributo de forma idempotente e respeitar "Aceitar nova meta" vs "Manter meta atual"', () => {
    let state = createInitialAppState('2026-10-27');

    // Executa os 4 exercícios superando a meta de Flexões (10 > 5)
    let quest = state.dailyQuest;
    quest = recordExerciseExecution(quest, 'pushups', 10).quest;
    quest = recordExerciseExecution(quest, 'squats', 5).quest;
    quest = recordExerciseExecution(quest, 'situps', 5).quest;
    quest = recordExerciseExecution(quest, 'jumping_jacks', 50).quest;
    state = { ...state, dailyQuest: quest };

    // Caso A: Escolhe "Manter meta atual" (KEEP_CURRENT_TARGET)
    const keepOutcome = completeDailyQuest(state, 'KEEP_CURRENT_TARGET', '2026-10-27T20:00:00.000Z');
    expect(keepOutcome.ok).toBe(true);
    expect(keepOutcome.alreadyCompleted).toBe(false);
    expect(keepOutcome.state.player.baseTarget).toBe(5);
    expect(keepOutcome.state.player.availableAttributePoints).toBe(3);
    expect(keepOutcome.state.player.coins).toBe(55); // 50 + 5
    expect(keepOutcome.state.player.level).toBe(2); // 110 XP -> sobe para nível 2 com 10 XP

    // Caso B: Escolhe "Aceitar nova meta" (ACCEPT_NEW_TARGET)
    const acceptOutcome = completeDailyQuest(state, 'ACCEPT_NEW_TARGET', '2026-10-27T20:00:00.000Z');
    expect(acceptOutcome.ok).toBe(true);
    expect(acceptOutcome.state.player.baseTarget).toBe(10);
    expect(acceptOutcome.state.history[0]?.nextBaseTargetApplied).toBe(10);

    // Tentativa de concluir novamente a mesma missão (Idempotência estrita)
    const duplicateAttempt = completeDailyQuest(acceptOutcome.state, 'ACCEPT_NEW_TARGET');
    expect(duplicateAttempt.ok).toBe(true);
    expect(duplicateAttempt.alreadyCompleted).toBe(true);
    expect(duplicateAttempt.state.player.coins).toBe(55);
    expect(duplicateAttempt.state.player.availableAttributePoints).toBe(3);
    expect(duplicateAttempt.state.history).toHaveLength(1);

    // Alternar escolha na tela QUEST CLEARED sem duplicar recompensas
    const switchedToKeep = applyProgressionChoiceForCompletedQuest(
      acceptOutcome.state,
      'KEEP_CURRENT_TARGET',
    );
    expect(switchedToKeep.player.baseTarget).toBe(5);
    expect(switchedToKeep.player.coins).toBe(55);
    expect(switchedToKeep.player.availableAttributePoints).toBe(3);
  });

  it('deve distribuir pontos de atributo em STR/AGI/VIT com segurança e rejeitar saldo insuficiente ou valores inválidos', () => {
    const initial = createInitialAppState('2026-10-27').player;
    const playerWithPoints = { ...initial, availableAttributePoints: 3 };

    const strAlloc = allocateAttributePoints(playerWithPoints, 'STR', 2);
    expect(strAlloc.ok).toBe(true);
    expect(strAlloc.player.attributes.STR).toBe(12);
    expect(strAlloc.player.availableAttributePoints).toBe(1);

    const agiAlloc = allocateAttributePoints(strAlloc.player, 'AGI', 1);
    expect(agiAlloc.ok).toBe(true);
    expect(agiAlloc.player.attributes.AGI).toBe(11);
    expect(agiAlloc.player.availableAttributePoints).toBe(0);

    // Tentativa de alocar sem saldo disponível
    const overflowAlloc = allocateAttributePoints(agiAlloc.player, 'VIT', 1);
    expect(overflowAlloc.ok).toBe(false);
    expect(overflowAlloc.player.attributes.VIT).toBe(10);
    expect(overflowAlloc.player.availableAttributePoints).toBe(0);

    // Tentativa de alocar número negativo ou decimal
    expect(allocateAttributePoints(playerWithPoints, 'STR', -1).ok).toBe(false);
    expect(allocateAttributePoints(playerWithPoints, 'STR', 1.5).ok).toBe(false);
  });

  it('deve calcular progressão de múltiplos níveis quando o XP acumulado exceder vários limiares', () => {
    const rewardsAt100 = calculateQuestRewards(100);
    expect(rewardsAt100).toEqual({
      xpEarned: 300,
      coinsEarned: 150,
      attributePointsEarned: 3,
    });

    // Nível 1 requer 100 XP, Nível 2 requer 200 XP -> 300 XP leva do Nível 1 (0 XP) ao Nível 3 (0 XP)
    const levelResult = applyLevelProgression(1, 0, 300);
    expect(levelResult.level).toBe(3);
    expect(levelResult.currentXp).toBe(0);
    expect(levelResult.xpToNextLevel).toBe(300);
    expect(levelResult.levelsGained).toBe(2);
  });
});
