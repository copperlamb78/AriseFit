import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import { LevelProgressHud } from '../../components/system/LevelProgressHud';
import { SystemAlertBanner } from '../../components/system/SystemAlertBanner';
import { SystemHeader } from '../../components/system/SystemHeader';
import { DailyQuestPanel } from '../../features/quests/DailyQuestPanel';
import { useSystemStore } from '../../store/useSystemStore';
import { colors, spacing } from '../../theme/tokens';

/**
 * Tela 1: Dashboard / The System
 * Exibe identidade, nível/rank/XP, missão diária com 4 exercícios, barra 0/4..4/4,
 * registro de repetições realizadas, opção de desfazer antes de concluir,
 * botão de concluir missão e resumo de recompensas.
 */
export default function SystemDashboardScreen() {
  const router = useRouter();
  const player = useSystemStore((s) => s.player);
  const dailyQuest = useSystemStore((s) => s.dailyQuest);
  const lastActionError = useSystemStore((s) => s.lastActionError);
  const recoveredFromCorruption = useSystemStore((s) => s.recoveredFromCorruption);
  const clearError = useSystemStore((s) => s.clearError);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <SystemHeader player={player} dateKey={dailyQuest.dateKey} />

        {recoveredFromCorruption ? (
          <SystemAlertBanner
            tone="warning"
            message="Dados corrompidos ou incompatíveis foram detectados e o Sistema restaurou seu núcleo com segurança."
          />
        ) : null}

        {lastActionError ? (
          <SystemAlertBanner
            tone="danger"
            message={lastActionError}
            onDismiss={clearError}
          />
        ) : null}

        <LevelProgressHud player={player} />

        <DailyQuestPanel
          onNavigateToCleared={() => {
            router.push('/quest-cleared');
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.massive,
    gap: spacing.lg,
  },
});
