import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import { SystemAlertBanner } from '../../components/system/SystemAlertBanner';
import { AttributeAndRankPanel } from '../../features/progression/AttributeAndRankPanel';
import { useSystemStore } from '../../store/useSystemStore';
import { colors, spacing } from '../../theme/tokens';

/**
 * Rota dedicada de Progressão, Escala de Degraus (5..100), Ranks (E..S) e Atributos.
 */
export default function ProgressionScreen() {
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

        <AttributeAndRankPanel />
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
