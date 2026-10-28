import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  CURRENT_SCHEMA_VERSION,
  DailyQuest,
  EXERCISE_IDS,
  ExerciseId,
  ExerciseProgress,
  MAX_HISTORY_ENTRIES,
  PersistedAppState,
  PlayerStats,
  ProgressionChoice,
  QuestHistoryEntry,
} from '../../domain/models/system.models';
import { INITIAL_ATTRIBUTE_VALUE } from '../../domain/rules/attributeRules';
import {
  createInitialAppState,
  getLocalDateKey,
  isValidDateKey,
  syncStateWithLocalDate,
} from '../../domain/rules/date.rules';
import {
  calculateRankFromBaseTarget,
  EXERCISE_CATALOG,
  getExerciseTarget,
  getHunterTitleByRank,
  normalizeBaseTarget,
} from '../../domain/rules/progression.rules';
import { createDailyQuest, hasQuestExceededTarget } from '../../domain/rules/quest.rules';
import { getXpToNextLevel } from '../../domain/rules/reward.rules';
import { isNonNegativeInteger } from '../../utils/validation';

export const SYSTEM_STORAGE_KEY = '@arisefit/system-state:v1' as const;

export interface StorageDriver {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isValidProgressionChoice(value: unknown): value is ProgressionChoice {
  return (
    value === 'ACCEPT_NEW_TARGET' ||
    value === 'KEEP_CURRENT_TARGET' ||
    value === 'NOT_APPLICABLE'
  );
}

function sanitizePlayerStats(raw: unknown, fallbackDateKey: string): PlayerStats | null {
  if (!isObjectRecord(raw)) {
    return null;
  }

  if (!isObjectRecord(raw.attributes)) {
    return null;
  }

  const str = raw.attributes.STR;
  const agi = raw.attributes.AGI;
  const vit = raw.attributes.VIT;

  if (
    !isNonNegativeInteger(str) ||
    !isNonNegativeInteger(agi) ||
    !isNonNegativeInteger(vit) ||
    str < INITIAL_ATTRIBUTE_VALUE ||
    agi < INITIAL_ATTRIBUTE_VALUE ||
    vit < INITIAL_ATTRIBUTE_VALUE
  ) {
    return null;
  }

  if (
    !isNonNegativeInteger(raw.level) ||
    raw.level < 1 ||
    !isNonNegativeInteger(raw.currentXp) ||
    !isNonNegativeInteger(raw.totalXpEarned) ||
    !isNonNegativeInteger(raw.coins) ||
    !isNonNegativeInteger(raw.availableAttributePoints) ||
    typeof raw.baseTarget !== 'number' ||
    !Number.isFinite(raw.baseTarget)
  ) {
    return null;
  }

  const safeBaseTarget = normalizeBaseTarget(raw.baseTarget);
  const safeRank = calculateRankFromBaseTarget(safeBaseTarget);
  const hunterName =
    typeof raw.hunterName === 'string' && raw.hunterName.trim().length > 0
      ? raw.hunterName.trim()
      : 'Caçador Sung';
  const avatarId =
    typeof raw.avatarId === 'string' && raw.avatarId.trim().length > 0
      ? raw.avatarId.trim()
      : 'shadow-monarch-crest';

  const currentStreak = isNonNegativeInteger(raw.currentStreak) ? raw.currentStreak : 0;
  const bestStreak = isNonNegativeInteger(raw.bestStreak)
    ? Math.max(raw.bestStreak, currentStreak)
    : currentStreak;
  const totalCompletedQuests = isNonNegativeInteger(raw.totalCompletedQuests)
    ? raw.totalCompletedQuests
    : 0;
  const lastActiveDateKey = isValidDateKey(raw.lastActiveDateKey)
    ? raw.lastActiveDateKey
    : fallbackDateKey;

  return {
    hunterName,
    avatarId,
    title: getHunterTitleByRank(safeRank),
    level: raw.level,
    currentXp: raw.currentXp,
    xpToNextLevel: getXpToNextLevel(raw.level),
    totalXpEarned: raw.totalXpEarned,
    coins: raw.coins,
    availableAttributePoints: raw.availableAttributePoints,
    attributes: {
      STR: str,
      AGI: agi,
      VIT: vit,
    },
    baseTarget: safeBaseTarget,
    rank: safeRank,
    currentStreak,
    bestStreak,
    totalCompletedQuests,
    lastActiveDateKey,
  };
}

function sanitizeDailyQuest(raw: unknown, fallbackBaseTarget: number): DailyQuest | null {
  if (!isObjectRecord(raw)) {
    return null;
  }

  if (!isValidDateKey(raw.dateKey) || !isObjectRecord(raw.exercises)) {
    return null;
  }

  const safeBaseTarget =
    typeof raw.baseTarget === 'number' && Number.isFinite(raw.baseTarget)
      ? normalizeBaseTarget(raw.baseTarget)
      : normalizeBaseTarget(fallbackBaseTarget);

  const sanitizedExercises = {} as Record<ExerciseId, ExerciseProgress>;

  for (const id of EXERCISE_IDS) {
    const rawEx = raw.exercises[id];
    if (!isObjectRecord(rawEx)) {
      return null;
    }

    const catalog = EXERCISE_CATALOG[id];
    const targetReps = getExerciseTarget(id, safeBaseTarget);
    const performedReps = isNonNegativeInteger(rawEx.performedReps)
      ? Math.min(rawEx.performedReps, catalog.maxAllowedReps)
      : 0;
    const completed = performedReps >= targetReps && Boolean(rawEx.completed);

    sanitizedExercises[id] = {
      id,
      name: catalog.name,
      unitLabel: catalog.unitLabel,
      multiplier: catalog.multiplier,
      targetReps,
      maxAllowedReps: catalog.maxAllowedReps,
      performedReps,
      completed,
      completedAt:
        completed && typeof rawEx.completedAt === 'string' ? rawEx.completedAt : null,
    };
  }

  const allDone = EXERCISE_IDS.every((id) => sanitizedExercises[id].completed);
  const status =
    raw.status === 'COMPLETED' && allDone ? 'COMPLETED' : 'IN_PROGRESS';
  const rewardClaimed = status === 'COMPLETED' && Boolean(raw.rewardClaimed);

  const quest: DailyQuest = {
    id: typeof raw.id === 'string' && raw.id.length > 0 ? raw.id : `quest-${raw.dateKey}`,
    dateKey: raw.dateKey,
    baseTarget: safeBaseTarget,
    status,
    exercises: sanitizedExercises,
    rewardClaimed,
    exceededTarget: false,
    progressionChoice: isValidProgressionChoice(raw.progressionChoice)
      ? raw.progressionChoice
      : 'NOT_APPLICABLE',
    completedAt:
      status === 'COMPLETED' && typeof raw.completedAt === 'string'
        ? raw.completedAt
        : null,
  };

  quest.exceededTarget = hasQuestExceededTarget(quest);
  return quest;
}

function sanitizeHistoryEntries(rawHistory: unknown): QuestHistoryEntry[] {
  if (!Array.isArray(rawHistory)) {
    return [];
  }

  const validEntries: QuestHistoryEntry[] = [];

  for (const item of rawHistory) {
    if (!isObjectRecord(item)) {
      continue;
    }
    if (
      typeof item.questId !== 'string' ||
      !isValidDateKey(item.dateKey) ||
      (item.status !== 'COMPLETED' && item.status !== 'INCOMPLETE') ||
      !isObjectRecord(item.exercisesSummary)
    ) {
      continue;
    }

    const baseTargetAtCompletion =
      typeof item.baseTargetAtCompletion === 'number'
        ? normalizeBaseTarget(item.baseTargetAtCompletion)
        : 5;
    const nextBaseTargetApplied =
      typeof item.nextBaseTargetApplied === 'number'
        ? normalizeBaseTarget(item.nextBaseTargetApplied)
        : baseTargetAtCompletion;

    const summary = createDailyQuest(item.dateKey, baseTargetAtCompletion);
    const exercisesSummary = {
      pushups: {
        target: summary.exercises.pushups.targetReps,
        performed: 0,
      },
      squats: {
        target: summary.exercises.squats.targetReps,
        performed: 0,
      },
      situps: {
        target: summary.exercises.situps.targetReps,
        performed: 0,
      },
      jumping_jacks: {
        target: summary.exercises.jumping_jacks.targetReps,
        performed: 0,
      },
    };

    for (const id of EXERCISE_IDS) {
      const rawExSum = item.exercisesSummary[id];
      if (isObjectRecord(rawExSum)) {
        if (isNonNegativeInteger(rawExSum.target) && rawExSum.target > 0) {
          exercisesSummary[id].target = rawExSum.target;
        }
        if (isNonNegativeInteger(rawExSum.performed)) {
          exercisesSummary[id].performed = Math.min(
            rawExSum.performed,
            EXERCISE_CATALOG[id].maxAllowedReps,
          );
        }
      }
    }

    validEntries.push({
      questId: item.questId,
      dateKey: item.dateKey,
      status: item.status,
      baseTargetAtCompletion,
      nextBaseTargetApplied,
      progressionChoice: isValidProgressionChoice(item.progressionChoice)
        ? item.progressionChoice
        : 'NOT_APPLICABLE',
      exceededTarget: Boolean(item.exceededTarget),
      xpEarned: isNonNegativeInteger(item.xpEarned) ? item.xpEarned : 0,
      coinsEarned: isNonNegativeInteger(item.coinsEarned) ? item.coinsEarned : 0,
      attributePointsEarned: isNonNegativeInteger(item.attributePointsEarned)
        ? item.attributePointsEarned
        : 0,
      exercisesSummary,
      recordedAt:
        typeof item.recordedAt === 'string' ? item.recordedAt : new Date().toISOString(),
    });
  }

  return validEntries.slice(0, MAX_HISTORY_ENTRIES);
}

/**
 * Valida e sanitiza qualquer payload bruto lido do AsyncStorage.
 * Se a versão do schema for incompatível ou os objetos principais estiverem corrompidos, retorna null.
 */
export function sanitizeAndValidatePersistedState(
  rawPayload: unknown,
  todayKey: string = getLocalDateKey(),
): PersistedAppState | null {
  if (!isObjectRecord(rawPayload)) {
    return null;
  }

  if (rawPayload.schemaVersion !== CURRENT_SCHEMA_VERSION) {
    return null;
  }

  const player = sanitizePlayerStats(rawPayload.player, todayKey);
  if (!player) {
    return null;
  }

  const dailyQuest = sanitizeDailyQuest(rawPayload.dailyQuest, player.baseTarget);
  if (!dailyQuest) {
    return null;
  }

  const history = sanitizeHistoryEntries(rawPayload.history);

  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    player,
    dailyQuest,
    history,
  };
}

export class StorageRepository {
  private readonly driver: StorageDriver;
  private readonly storageKey: string;

  constructor(driver: StorageDriver = AsyncStorage, storageKey: string = SYSTEM_STORAGE_KEY) {
    this.driver = driver;
    this.storageKey = storageKey;
  }

  /**
   * Carrega o estado persistido no AsyncStorage com blindagem contra JSON inválido,
   * schema incompatível ou campos nulos, sincronizando automaticamente com a data local.
   */
  async loadState(
    todayKey: string = getLocalDateKey(),
    nowIso: string = new Date().toISOString(),
  ): Promise<{ state: PersistedAppState; recoveredFromCorruption: boolean }> {
    try {
      const rawJson = await this.driver.getItem(this.storageKey);

      if (!rawJson || rawJson.trim().length === 0) {
        const fresh = createInitialAppState(todayKey);
        await this.saveState(fresh);
        return { state: fresh, recoveredFromCorruption: false };
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(rawJson);
      } catch {
        const fallback = createInitialAppState(todayKey);
        await this.saveState(fallback);
        return { state: fallback, recoveredFromCorruption: true };
      }

      const validated = sanitizeAndValidatePersistedState(parsed, todayKey);
      if (!validated) {
        const fallback = createInitialAppState(todayKey);
        await this.saveState(fallback);
        return { state: fallback, recoveredFromCorruption: true };
      }

      const synced = syncStateWithLocalDate(validated, todayKey, nowIso);
      if (synced !== validated) {
        await this.saveState(synced);
      }

      return { state: synced, recoveredFromCorruption: false };
    } catch {
      const fallback = createInitialAppState(todayKey);
      return { state: fallback, recoveredFromCorruption: true };
    }
  }

  /**
   * Persiste atomicamente o documento de estado no AsyncStorage.
   */
  async saveState(state: PersistedAppState): Promise<boolean> {
    try {
      const payload: PersistedAppState = {
        ...state,
        schemaVersion: CURRENT_SCHEMA_VERSION,
        history: state.history.slice(0, MAX_HISTORY_ENTRIES),
      };
      await this.driver.setItem(this.storageKey, JSON.stringify(payload));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Remove o estado salvo e restaura o Caçador inicial.
   */
  async resetState(todayKey: string = getLocalDateKey()): Promise<PersistedAppState> {
    const fresh = createInitialAppState(todayKey);
    try {
      await this.driver.removeItem(this.storageKey);
      await this.saveState(fresh);
    } catch {
      // Fallback silencioso mantendo o estado em memória íntegro
    }
    return fresh;
  }
}

export const defaultStorageRepository = new StorageRepository();
