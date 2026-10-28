import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import { SystemAlertBanner } from '../../components/system/SystemAlertBanner';
import { DailyQuestPanel } from '../../features/quests/DailyQuestPanel';
import { useSystemStore } from '../../store/useSystemStore';
import { colors, spacing } from '../../theme/tokens';

/**
 * Rota dedicada da Missão Diária na barra de navegação.
 */
export default function DailyQuestScreen() {
  const router = useRouter();
  const lastActionError = useSystemStore((s) => s.lastActionError);
  const clearError = useSystemStore((s) => s.clearError);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {lastActionError ? (
          <SystemAlertBanner
            tone="danger"
            message={lastActionError}
            onDismiss={clearError}
          />
        ) : null}

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
