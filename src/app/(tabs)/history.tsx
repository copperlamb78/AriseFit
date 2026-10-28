import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { HistoryTimelineItem } from '../../components/profile/HistoryTimelineItem';
import { SystemBadge } from '../../components/ui/SystemBadge';
import { SystemCard } from '../../components/ui/SystemCard';
import { useSystemStore } from '../../store/useSystemStore';
import { colors, spacing, typography } from '../../theme/tokens';

/**
 * Tela 4: Histórico / Quest Records
 * Lista de missões por data YYYY-MM-DD, meta solicitada, quantidades realizadas,
 * status de conclusão e recompensas recebidas (somente leitura).
 */
export default function QuestHistoryScreen() {
  const history = useSystemStore((s) => s.history);
  const player = useSystemStore((s) => s.player);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <SystemCard
          variant="cyanGlow"
          hudTag="[ARQUIVO CRONOLÓGICO DO SISTEMA]"
          title="Histórico de Missões (Quest Records)"
          subtitle="Registros imutáveis por data local (YYYY-MM-DD), metas, execuções e recompensas."
          rightSlot={
            <SystemBadge
              label={`${history.length} DIAS REGISTRADOS`}
              tone="cyan"
            />
          }
        >
          <View style={styles.summaryRow}>
            <SystemBadge
              label={`CONCLUÍDAS: ${player.totalCompletedQuests}`}
              tone="success"
            />
            <SystemBadge
              label={`MELHOR SEQUÊNCIA: ${player.bestStreak}D`}
              tone="warning"
            />
            <SystemBadge
              label={`META ATUAL: ${player.baseTarget} (${player.baseTarget * 10} POLI)`}
              tone="blue"
            />
          </View>
        </SystemCard>

        {history.length === 0 ? (
          <SystemCard
            hudTag="[SEM REGISTROS ARQUIVADOS]"
            title="Nenhuma Missão Encerrada Ainda"
            subtitle="Quando você concluir a Missão Diária ou quando o dia virar, os registros aparecerão aqui."
          >
            <Text style={styles.emptyText}>
              O histórico do Sistema é somente leitura e preserva todas as missões concluídas sem
              permitir adulteração retroativa.
            </Text>
          </SystemCard>
        ) : (
          <View style={styles.listCol}>
            {history.map((entry) => (
              <HistoryTimelineItem
                key={`${entry.questId}-${entry.recordedAt}`}
                entry={entry}
              />
            ))}
          </View>
        )}
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
  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  listCol: {
    gap: spacing.md,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
  },
});
