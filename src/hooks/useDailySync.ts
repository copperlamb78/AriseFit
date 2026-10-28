import { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { getLocalDateKey } from '../domain/rules/date.rules';
import { useSystemStore } from '../store/useSystemStore';

/**
 * Hook customizado para hidratar a store no cold start e sincronizar a virada de dia
 * local sempre que o aplicativo retorna ao primeiro plano (active).
 * Zero timers contínuos em background (conformidade FinOps N4).
 */
export function useDailySync(): {
  isHydrated: boolean;
  isHydrating: boolean;
  recoveredFromCorruption: boolean;
} {
  const isHydrated = useSystemStore((s) => s.isHydrated);
  const isHydrating = useSystemStore((s) => s.isHydrating);
  const recoveredFromCorruption = useSystemStore((s) => s.recoveredFromCorruption);
  const initializeSystem = useSystemStore((s) => s.initializeSystem);
  const syncDailyState = useSystemStore((s) => s.syncDailyState);

  useEffect(() => {
    if (!isHydrated && !isHydrating) {
      void initializeSystem(getLocalDateKey());
    }
  }, [isHydrated, isHydrating, initializeSystem]);

  useEffect(() => {
    const handleAppStateChange = (nextStatus: AppStateStatus) => {
      if (nextStatus === 'active' && useSystemStore.getState().isHydrated) {
        void syncDailyState(getLocalDateKey());
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, [syncDailyState]);

  return {
    isHydrated,
    isHydrating,
    recoveredFromCorruption,
  };
}
