import { create } from 'zustand';
import {
  AttributeKey,
  CURRENT_SCHEMA_VERSION,
  DailyQuest,
  ExerciseId,
  PersistedAppState,
  PlayerStats,
  ProgressionChoice,
  QuestHistoryEntry,
} from '../domain/models/system.models';
import { allocateAttributePoints } from '../domain/rules/attributeRules';
import {
  createInitialAppState,
  getLocalDateKey,
  syncStateWithLocalDate,
} from '../domain/rules/date.rules';
import {
  applyProgressionChoiceForCompletedQuest,
  completeDailyQuest as completeDailyQuestRule,
  recordExerciseExecution,
  undoExerciseExecution,
} from '../domain/rules/quest.rules';
import {
  defaultStorageRepository,
  StorageRepository,
} from '../services/storage/storage.repository';

export interface SystemStoreState extends PersistedAppState {
  isHydrated: boolean;
  isHydrating: boolean;
  isProcessingCompletion: boolean;
  recoveredFromCorruption: boolean;
  lastActionError: string | null;

  initializeSystem: (
    todayKey?: string,
    repository?: StorageRepository,
  ) => Promise<void>;
  syncDailyState: (
    todayKey?: string,
    repository?: StorageRepository,
  ) => Promise<void>;
  recordExercise: (
    exerciseId: ExerciseId,
    reps: number,
    repository?: StorageRepository,
  ) => Promise<{ ok: boolean; error?: string }>;
  undoExercise: (
    exerciseId: ExerciseId,
    repository?: StorageRepository,
  ) => Promise<{ ok: boolean; error?: string }>;
  completeDailyQuest: (
    choice?: ProgressionChoice,
    repository?: StorageRepository,
  ) => Promise<{ ok: boolean; alreadyCompleted: boolean; error?: string }>;
  setProgressionChoiceAfterCompletion: (
    choice: 'ACCEPT_NEW_TARGET' | 'KEEP_CURRENT_TARGET',
    repository?: StorageRepository,
  ) => Promise<void>;
  allocateAttribute: (
    attribute: AttributeKey,
    amount?: number,
    repository?: StorageRepository,
  ) => Promise<{ ok: boolean; error?: string }>;
  updateHunterProfile: (
    hunterName: string,
    avatarId?: string,
    repository?: StorageRepository,
  ) => Promise<{ ok: boolean; error?: string }>;
  clearError: () => void;
  resetSystem: (
    todayKey?: string,
    repository?: StorageRepository,
  ) => Promise<void>;
}

const initialSeed = createInitialAppState(getLocalDateKey());

let completionInFlightLock = false;

function extractPersistedSnapshot(state: {
  player: PlayerStats;
  dailyQuest: DailyQuest;
  history: QuestHistoryEntry[];
}): PersistedAppState {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    player: state.player,
    dailyQuest: state.dailyQuest,
    history: state.history,
  };
}

export const useSystemStore = create<SystemStoreState>((set, get) => ({
  schemaVersion: initialSeed.schemaVersion,
  player: initialSeed.player,
  dailyQuest: initialSeed.dailyQuest,
  history: initialSeed.history,
  isHydrated: false,
  isHydrating: false,
  isProcessingCompletion: false,
  recoveredFromCorruption: false,
  lastActionError: null,

  initializeSystem: async (
    todayKey: string = getLocalDateKey(),
    repository: StorageRepository = defaultStorageRepository,
  ) => {
    set({ isHydrating: true, lastActionError: null });
    const { state, recoveredFromCorruption } = await repository.loadState(todayKey);
    set({
      schemaVersion: state.schemaVersion,
      player: state.player,
      dailyQuest: state.dailyQuest,
      history: state.history,
      isHydrated: true,
      isHydrating: false,
      recoveredFromCorruption,
      lastActionError: null,
    });
  },

  syncDailyState: async (
    todayKey: string = getLocalDateKey(),
    repository: StorageRepository = defaultStorageRepository,
  ) => {
    const currentSnapshot = extractPersistedSnapshot(get());
    const synced = syncStateWithLocalDate(currentSnapshot, todayKey);

    if (synced !== currentSnapshot) {
      set({
        player: synced.player,
        dailyQuest: synced.dailyQuest,
        history: synced.history,
        lastActionError: null,
      });
      await repository.saveState(synced);
    }
  },

  recordExercise: async (
    exerciseId: ExerciseId,
    reps: number,
    repository: StorageRepository = defaultStorageRepository,
  ) => {
    const current = get();
    const outcome = recordExerciseExecution(current.dailyQuest, exerciseId, reps);

    if (!outcome.ok) {
      set({ lastActionError: outcome.error ?? 'Valor inválido.' });
      return { ok: false, error: outcome.error };
    }

    const nextSnapshot: PersistedAppState = {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      player: current.player,
      dailyQuest: outcome.quest,
      history: current.history,
    };

    set({
      dailyQuest: outcome.quest,
      lastActionError: null,
    });

    await repository.saveState(nextSnapshot);
    return { ok: true };
  },

  undoExercise: async (
    exerciseId: ExerciseId,
    repository: StorageRepository = defaultStorageRepository,
  ) => {
    const current = get();
    const outcome = undoExerciseExecution(current.dailyQuest, exerciseId);

    if (!outcome.ok) {
      set({ lastActionError: outcome.error ?? 'Não foi possível desfazer.' });
      return { ok: false, error: outcome.error };
    }

    const nextSnapshot: PersistedAppState = {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      player: current.player,
      dailyQuest: outcome.quest,
      history: current.history,
    };

    set({
      dailyQuest: outcome.quest,
      lastActionError: null,
    });

    await repository.saveState(nextSnapshot);
    return { ok: true };
  },

  completeDailyQuest: async (
    choice: ProgressionChoice = 'KEEP_CURRENT_TARGET',
    repository: StorageRepository = defaultStorageRepository,
  ) => {
    // Trava síncrona imediata contra duplo clique concorrente
    if (completionInFlightLock || get().isProcessingCompletion) {
      return { ok: true, alreadyCompleted: true };
    }

    completionInFlightLock = true;
    set({ isProcessingCompletion: true });

    try {
      const currentSnapshot = extractPersistedSnapshot(get());
      const outcome = completeDailyQuestRule(currentSnapshot, choice);

      if (!outcome.ok) {
        set({
          isProcessingCompletion: false,
          lastActionError: outcome.error ?? 'Missão incompleta.',
        });
        return {
          ok: false,
          alreadyCompleted: false,
          error: outcome.error,
        };
      }

      if (outcome.alreadyCompleted) {
        set({ isProcessingCompletion: false, lastActionError: null });
        return {
          ok: true,
          alreadyCompleted: true,
        };
      }

      set({
        player: outcome.state.player,
        dailyQuest: outcome.state.dailyQuest,
        history: outcome.state.history,
        isProcessingCompletion: false,
        lastActionError: null,
      });

      await repository.saveState(outcome.state);
      return {
        ok: true,
        alreadyCompleted: false,
      };
    } finally {
      completionInFlightLock = false;
    }
  },

  setProgressionChoiceAfterCompletion: async (
    choice: 'ACCEPT_NEW_TARGET' | 'KEEP_CURRENT_TARGET',
    repository: StorageRepository = defaultStorageRepository,
  ) => {
    const currentSnapshot = extractPersistedSnapshot(get());
    const updated = applyProgressionChoiceForCompletedQuest(currentSnapshot, choice);

    set({
      player: updated.player,
      dailyQuest: updated.dailyQuest,
      history: updated.history,
      lastActionError: null,
    });

    await repository.saveState(updated);
  },

  allocateAttribute: async (
    attribute: AttributeKey,
    amount: number = 1,
    repository: StorageRepository = defaultStorageRepository,
  ) => {
    const current = get();
    const outcome = allocateAttributePoints(current.player, attribute, amount);

    if (!outcome.ok) {
      set({ lastActionError: outcome.error ?? 'Pontos insuficientes.' });
      return { ok: false, error: outcome.error };
    }

    const nextSnapshot: PersistedAppState = {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      player: outcome.player,
      dailyQuest: current.dailyQuest,
      history: current.history,
    };

    set({
      player: outcome.player,
      lastActionError: null,
    });

    await repository.saveState(nextSnapshot);
    return { ok: true };
  },

  updateHunterProfile: async (
    hunterName: string,
    avatarId?: string,
    repository: StorageRepository = defaultStorageRepository,
  ) => {
    const trimmed = hunterName.trim();
    if (trimmed.length < 2 || trimmed.length > 28) {
      const error = 'O nome do Caçador deve ter entre 2 e 28 caracteres.';
      set({ lastActionError: error });
      return { ok: false, error };
    }

    const current = get();
    const updatedPlayer: PlayerStats = {
      ...current.player,
      hunterName: trimmed,
      avatarId: avatarId?.trim() || current.player.avatarId || 'shadow-monarch-crest',
    };

    const nextSnapshot: PersistedAppState = {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      player: updatedPlayer,
      dailyQuest: current.dailyQuest,
      history: current.history,
    };

    set({
      player: updatedPlayer,
      lastActionError: null,
    });

    await repository.saveState(nextSnapshot);
    return { ok: true };
  },

  clearError: () => {
    set({ lastActionError: null });
  },

  resetSystem: async (
    todayKey: string = getLocalDateKey(),
    repository: StorageRepository = defaultStorageRepository,
  ) => {
    const fresh = await repository.resetState(todayKey);
    set({
      schemaVersion: fresh.schemaVersion,
      player: fresh.player,
      dailyQuest: fresh.dailyQuest,
      history: fresh.history,
      recoveredFromCorruption: false,
      lastActionError: null,
      isProcessingCompletion: false,
    });
  },
}));
