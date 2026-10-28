import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PlayerStats } from '../../domain/models/system.models';
import { borders, colors, radii, spacing, typography } from '../../theme/tokens';
import { SystemCard } from '../ui/SystemCard';

export interface HunterStatsSummaryProps {
  player: PlayerStats;
}

export function HunterStatsSummary({ player }: HunterStatsSummaryProps) {
  const stats = [
    { label: 'MISSÕES CONCLUÍDAS', value: String(player.totalCompletedQuests) },
    { label: 'SEQUÊNCIA ATUAL', value: `${player.currentStreak} dias` },
    { label: 'RECORDE DE SEQUÊNCIA', value: `${player.bestStreak} dias` },
    { label: 'XP ACUMULADO TOTAL', value: `${player.totalXpEarned} XP` },
    { label: 'MOEDAS DO SISTEMA', value: `${player.coins}` },
    { label: 'META-BASE ATUAL', value: `${player.baseTarget} (${player.baseTarget * 10} Poli)` },
  ];

  return (
    <SystemCard
      hudTag="[REGISTRO OPERACIONAL DO CAÇADOR]"
      title="Estatísticas Acumuladas"
      subtitle="Histórico consolidado de desempenho físico no Sistema."
    >
      <View style={styles.grid}>
        {stats.map((item) => (
          <View key={item.label} style={styles.cell}>
            <Text style={styles.cellLabel}>{item.label}</Text>
            <Text style={styles.cellValue}>{item.value}</Text>
          </View>
        ))}
      </View>
    </SystemCard>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  cell: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: radii.md,
    borderWidth: borders.thin,
    borderColor: colors.borderSubtle,
    padding: spacing.md,
    gap: spacing.xs,
  },
  cellLabel: {
    color: colors.textSecondary,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: typography.weights.bold,
    letterSpacing: typography.letterSpacing.wide,
  },
  cellValue: {
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
    fontWeight: typography.weights.heavy,
  },
});
