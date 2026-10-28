import {
  CURRENT_SCHEMA_VERSION,
  MAX_HISTORY_ENTRIES,
  PersistedAppState,
  PlayerStats,
  QuestHistoryEntry,
} from '../models/system.models';
import { createInitialAttributes } from './attributeRules';
import {
  calculateRankFromBaseTarget,
  getHunterTitleByRank,
  MIN_BASE_TARGET,
  normalizeBaseTarget,
} from './progression.rules';
import { buildExercisesSummary, createDailyQuest } from './quest.rules';
import { getXpToNextLevel } from './reward.rules';

/**
 * Gera a chave de data local real no formato YYYY-MM-DD (sem desvio UTC).
 */
export function getLocalDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isValidDateKey(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

/**
 * Cria o perfil inicial do Caçador no Nível 1, Rank E e Meta-Base 5.
 */
export function createInitialPlayerStats(
  todayKey: string = getLocalDateKey(),
  hunterName: string = 'Caçador Sung',
): PlayerStats {
  const baseTarget = MIN_BASE_TARGET;
  const rank = calculateRankFromBaseTarget(baseTarget);

  return {
    hunterName: hunterName.trim() || 'Caçador Sung',
    avatarId: 'shadow-monarch-crest',
    title: getHunterTitleByRank(rank),
    level: 1,
    currentXp: 0,
    xpToNextLevel: getXpToNextLevel(1),
    totalXpEarned: 0,
    coins: 0,
    availableAttributePoints: 0,
    attributes: createInitialAttributes(),
    baseTarget,
    rank,
    currentStreak: 0,
    bestStreak: 0,
    totalCompletedQuests: 0,
    lastActiveDateKey: todayKey,
  };
}

/**
 * Cria o estado completo inicial da aplicação para a data local atual.
 */
export function createInitialAppState(
  todayKey: string = getLocalDateKey(),
  hunterName: string = 'Caçador Sung',
): PersistedAppState {
  const safeDateKey = isValidDateKey(todayKey) ? todayKey : getLocalDateKey();
  const player = createInitialPlayerStats(safeDateKey, hunterName);
  const dailyQuest = createDailyQuest(safeDateKey, player.baseTarget);

  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    player,
    dailyQuest,
    history: [],
  };
}

/**
 * Sincroniza o estado persistido com a data local atual (virada de dia).
 * - Preserva 100% do histórico existente.
 * - Se a última missão estava IN_PROGRESS em data anterior, arquiva apenas ela como INCOMPLETE e zera a sequência (streak).
 * - NUNCA cria missões retroativas infinitas para dias intermediários sem treino.
 * - Instancia a nova DailyQuest para `todayKey` com a meta-base vigente do Caçador.
 */
export function syncStateWithLocalDate(
  state: PersistedAppState,
  todayKey: string = getLocalDateKey(),
  nowIso: string = new Date().toISOString(),
): PersistedAppState {
  if (!isValidDateKey(todayKey)) {
    return state;
  }

  const questDateKey = state.dailyQuest.dateKey;

  // Mesmo dia ou relógio retrocedido: mantém missão atual intacta
  if (todayKey <= questDateKey) {
    return state;
  }

  let updatedHistory = [...state.history];
  let updatedStreak = state.player.currentStreak;

  // Se a missão do dia anterior não foi concluída, registra uma única vez como INCOMPLETE
  if (state.dailyQuest.status !== 'COMPLETED') {
    const alreadyArchived = updatedHistory.some(
      (item) => item.questId === state.dailyQuest.id,
    );

    if (!alreadyArchived) {
      const incompleteEntry: QuestHistoryEntry = {
        questId: state.dailyQuest.id,
        dateKey: state.dailyQuest.dateKey,
        status: 'INCOMPLETE',
        baseTargetAtCompletion: state.dailyQuest.baseTarget,
        nextBaseTargetApplied: state.player.baseTarget,
        progressionChoice: 'NOT_APPLICABLE',
        exceededTarget: state.dailyQuest.exceededTarget,
        xpEarned: 0,
        coinsEarned: 0,
        attributePointsEarned: 0,
        exercisesSummary: buildExercisesSummary(state.dailyQuest),
        recordedAt: nowIso,
      };
      updatedHistory = [incompleteEntry, ...updatedHistory].slice(0, MAX_HISTORY_ENTRIES);
    }
    updatedStreak = 0;
  }

  const safeBaseTarget = normalizeBaseTarget(state.player.baseTarget);
  const safeRank = calculateRankFromBaseTarget(safeBaseTarget);
  const newDailyQuest = createDailyQuest(todayKey, safeBaseTarget);

  return {
    ...state,
    player: {
      ...state.player,
      baseTarget: safeBaseTarget,
      rank: safeRank,
      title: getHunterTitleByRank(safeRank),
      currentStreak: updatedStreak,
      lastActiveDateKey: todayKey,
    },
    dailyQuest: newDailyQuest,
    history: updatedHistory,
  };
}
