import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import { SystemAlertBanner } from '../../components/system/SystemAlertBanner';
import { SystemHeader } from '../../components/system/SystemHeader';
import { HunterProfileAndHistoryPanel } from '../../features/profile/HunterProfileAndHistoryPanel';
import { AttributeAndRankPanel } from '../../features/progression/AttributeAndRankPanel';
import { useSystemStore } from '../../store/useSystemStore';
import { colors, spacing } from '../../theme/tokens';

/**
 * Tela 3: Perfil / Status do Caçador
 * Exibe nome editável, avatar/emblema do Sistema, nível, rank E..S, barra de XP,
 * moedas, atributos STR/AGI/VIT com pontos disponíveis e alocador +1, e estatísticas.
 */
export default function HunterProfileScreen() {
  const player = useSystemStore((s) => s.player);
  const dailyQuest = useSystemStore((s) => s.dailyQuest);
  const lastActionError = useSystemStore((s) => s.lastActionError);
  const clearError = useSystemStore((s) => s.clearError);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <SystemHeader player={player} dateKey={dailyQuest.dateKey} />

        {lastActionError ? (
          <SystemAlertBanner
            tone="danger"
            message={lastActionError}
            onDismiss={clearError}
          />
        ) : null}

        <HunterProfileAndHistoryPanel showHistorySection={false} />

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
