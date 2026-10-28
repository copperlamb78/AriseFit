import {
  createInitialAppState,
  getLocalDateKey,
  syncStateWithLocalDate,
} from '../src/domain/rules/date.rules';
import { recordExerciseExecution } from '../src/domain/rules/quest.rules';
import {
  StorageDriver,
  StorageRepository,
  SYSTEM_STORAGE_KEY,
} from '../src/services/storage/storage.repository';
import { useSystemStore } from '../src/store/useSystemStore';

class InMemoryStorageDriver implements StorageDriver {
  private store = new Map<string, string>();

  async getItem(key: string): Promise<string | null> {
    return this.store.has(key) ? (this.store.get(key) ?? null) : null;
  }

  async setItem(key: string, value: string): Promise<void> {
    this.store.set(key, value);
  }

  async removeItem(key: string): Promise<void> {
    this.store.delete(key);
  }

  setRaw(key: string, raw: string): void {
    this.store.set(key, raw);
  }
}

describe('Storage, Sincronização de Data Local e Resiliência a Caos', () => {
  it('deve gerar chave de data local YYYY-MM-DD respeitando horário noturno local (23:30)', () => {
    const lateNightLocal = new Date(2026, 9, 27, 23, 30, 0); // 27 de Outubro de 2026 às 23:30 locais
    expect(getLocalDateKey(lateNightLocal)).toBe('2026-10-27');
  });

  it('deve sincronizar virada de dia após múltiplos dias sem treino sem gerar missões retroativas infinitas e preservando histórico anterior', () => {
    let state = createInitialAppState('2026-10-15');
    // Conclui a missão de 2026-10-15
    let q1 = state.dailyQuest;
    q1 = recordExerciseExecution(q1, 'pushups', 10).quest;
    q1 = recordExerciseExecution(q1, 'squats', 5).quest;
    q1 = recordExerciseExecution(q1, 'situps', 5).quest;
    q1 = recordExerciseExecution(q1, 'jumping_jacks', 50).quest;
    state = { ...state, dailyQuest: q1 };

    // Avança para 2026-10-16 após ter deixado a missão de 2026-10-15 como IN_PROGRESS (não clicou em concluir)
    const syncedAfterGap = syncStateWithLocalDate(
      state,
      '2026-10-27',
      '2026-10-27T08:00:00.000Z',
    );

    // Apenas a missão de 2026-10-15 é arquivada como INCOMPLETE (não cria dias 16..26 fantasmas!)
    expect(syncedAfterGap.history).toHaveLength(1);
    expect(syncedAfterGap.history[0]?.dateKey).toBe('2026-10-15');
    expect(syncedAfterGap.history[0]?.status).toBe('INCOMPLETE');
    expect(syncedAfterGap.player.currentStreak).toBe(0);
    expect(syncedAfterGap.dailyQuest.dateKey).toBe('2026-10-27');
    expect(syncedAfterGap.dailyQuest.status).toBe('IN_PROGRESS');
  });

  it('deve recuperar de JSON corrompido no AsyncStorage sem crash (Fail-Safe Cold Start)', async () => {
    const driver = new InMemoryStorageDriver();
    driver.setRaw(SYSTEM_STORAGE_KEY, '{corrupted_json_payload: true');
    const repo = new StorageRepository(driver);

    const { state, recoveredFromCorruption } = await repo.loadState('2026-10-27');
    expect(recoveredFromCorruption).toBe(true);
    expect(state.schemaVersion).toBe(1);
    expect(state.player.level).toBe(1);
    expect(state.player.rank).toBe('E');
    expect(state.dailyQuest.dateKey).toBe('2026-10-27');
  });

  it('deve recuperar de schemaVersion incompatível ou campos nulos sem lançar TypeError', async () => {
    const driver = new InMemoryStorageDriver();
    driver.setRaw(
      SYSTEM_STORAGE_KEY,
      JSON.stringify({
        schemaVersion: 999,
        player: null,
        dailyQuest: null,
      }),
    );
    const repo = new StorageRepository(driver);

    const { state, recoveredFromCorruption } = await repo.loadState('2026-10-27');
    expect(recoveredFromCorruption).toBe(true);
    expect(state.player.attributes).toEqual({ STR: 10, AGI: 10, VIT: 10 });
    expect(state.dailyQuest.exercises.jumping_jacks.targetReps).toBe(50);
  });

  it('deve persistir, recarregar estado íntegro após reinicialização e impedir duplicação em duplo clique concorrente na Store', async () => {
    const driver = new InMemoryStorageDriver();
    const repo = new StorageRepository(driver);

    await useSystemStore.getState().initializeSystem('2026-10-27', repo);
    await useSystemStore.getState().recordExercise('pushups', 10, repo);
    await useSystemStore.getState().recordExercise('squats', 10, repo);
    await useSystemStore.getState().recordExercise('situps', 10, repo);
    await useSystemStore.getState().recordExercise('jumping_jacks', 100, repo);

    // Simula duplo clique rápido concorrente (Race Condition)
    const [firstCall, secondCall] = await Promise.all([
      useSystemStore.getState().completeDailyQuest('ACCEPT_NEW_TARGET', repo),
      useSystemStore.getState().completeDailyQuest('ACCEPT_NEW_TARGET', repo),
    ]);

    expect(firstCall.ok).toBe(true);
    expect(secondCall.ok).toBe(true);

    const stateAfterComplete = useSystemStore.getState();
    expect(stateAfterComplete.player.availableAttributePoints).toBe(3);
    expect(stateAfterComplete.player.coins).toBe(55);
    expect(stateAfterComplete.player.baseTarget).toBe(10);
    expect(stateAfterComplete.history).toHaveLength(1);

    // Distribui +1 em STR e atualiza nome do Caçador
    await useSystemStore.getState().allocateAttribute('STR', 1, repo);
    await useSystemStore.getState().updateHunterProfile('Sung Jin-Woo', 'shadow-monarch-crest', repo);

    // Simula reinicialização completa do app lendo do StorageRepository
    const reloaded = await repo.loadState('2026-10-27');
    expect(reloaded.recoveredFromCorruption).toBe(false);
    expect(reloaded.state.player.hunterName).toBe('Sung Jin-Woo');
    expect(reloaded.state.player.attributes.STR).toBe(11);
    expect(reloaded.state.player.availableAttributePoints).toBe(2);
    expect(reloaded.state.player.baseTarget).toBe(10);
    expect(reloaded.state.dailyQuest.status).toBe('COMPLETED');
    expect(reloaded.state.history).toHaveLength(1);
  });
});
