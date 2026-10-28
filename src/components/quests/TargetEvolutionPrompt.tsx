import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  calculateRankFromBaseTarget,
  canAdvanceBaseTarget,
  getNextStep,
} from '../../domain/rules/progression.rules';
import { borders, colors, radii, spacing, touchTargets, typography } from '../../theme/tokens';
import { SystemBadge } from '../ui/SystemBadge';

export interface TargetEvolutionPromptProps {
  currentBaseTarget: number;
  exceededTarget: boolean;
  selectedChoice: 'ACCEPT_NEW_TARGET' | 'KEEP_CURRENT_TARGET';
  onSelectChoice: (choice: 'ACCEPT_NEW_TARGET' | 'KEEP_CURRENT_TARGET') => void;
}

export function TargetEvolutionPrompt({
  currentBaseTarget,
  exceededTarget,
  selectedChoice,
  onSelectChoice,
}: TargetEvolutionPromptProps) {
  const canAdvance = canAdvanceBaseTarget(currentBaseTarget);
  const nextBase = getNextStep(currentBaseTarget);
  const nextRank = calculateRankFromBaseTarget(nextBase);
  const currentRank = calculateRankFromBaseTarget(currentBaseTarget);

  if (!canAdvance) {
    return (
      <View style={styles.maxCapBox}>
        <SystemBadge label="TETO MÁXIMO ATINGIDO (RANK S)" tone="warning" />
        <Text style={styles.maxCapText}>
          Você atingiu o limite supremo do Sistema: 100 repetições nos exercícios base e 1000
          Polichinelos.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.hudTag}>
          {exceededTarget
            ? '[SUPERAÇÃO DE META DETECTADA PELO SISTEMA]'
            : '[DECISÃO DE PROGRESSÃO DO CAÇADOR]'}
        </Text>
        <Text style={styles.title}>Definir Meta da Próxima Missão Diária</Text>
        <Text style={styles.subtitle}>
          {exceededTarget
            ? 'Você realizou repetições acima da meta do dia. Deseja avançar para o próximo degrau ou manter a carga atual?'
            : 'Escolha se deseja evoluir a meta para o próximo degrau ou consolidar o degrau atual.'}
        </Text>
      </View>

      <View style={styles.optionsCol}>
        <Pressable
          onPress={() => onSelectChoice('ACCEPT_NEW_TARGET')}
          accessibilityRole="button"
          accessibilityLabel="Aceitar nova meta"
          style={[
            styles.optionCard,
            selectedChoice === 'ACCEPT_NEW_TARGET' ? styles.optionSelectedCyan : null,
          ]}
        >
          <View style={styles.optionHeader}>
            <Text style={styles.optionTitle}>Aceitar nova meta</Text>
            <SystemBadge
              label={`${nextBase} REPS / ${nextBase * 10} POLI (RANK ${nextRank})`}
              tone="cyan"
            />
          </View>
          <Text style={styles.optionDesc}>
            Avança do degrau {currentBaseTarget} para {nextBase} repetições base e {nextBase * 10}{' '}
            Polichinelos a partir de amanhã.
          </Text>
        </Pressable>

        <Pressable
          onPress={() => onSelectChoice('KEEP_CURRENT_TARGET')}
          accessibilityRole="button"
          accessibilityLabel="Manter meta atual"
          style={[
            styles.optionCard,
            selectedChoice === 'KEEP_CURRENT_TARGET' ? styles.optionSelectedBlue : null,
          ]}
        >
          <View style={styles.optionHeader}>
            <Text style={styles.optionTitle}>Manter meta atual</Text>
            <SystemBadge
              label={`${currentBaseTarget} REPS / ${currentBaseTarget * 10} POLI (RANK ${currentRank})`}
              tone="neutral"
            />
          </View>
          <Text style={styles.optionDesc}>
            Conserva a meta atual de {currentBaseTarget} repetições base e{' '}
            {currentBaseTarget * 10} Polichinelos para consolidar seu condicionamento.
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceCard,
    borderRadius: radii.lg,
    borderWidth: borders.active,
    borderColor: colors.accentCyan,
    padding: spacing.lg,
    gap: spacing.md,
  },
  header: {
    gap: spacing.xs,
  },
  hudTag: {
    color: colors.accentCyan,
    fontSize: typography.sizes.xs,
    lineHeight: typography.lineHeights.xs,
    fontWeight: typography.weights.bold,
    letterSpacing: typography.letterSpacing.wide,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.sizes.lg,
    lineHeight: typography.lineHeights.lg,
    fontWeight: typography.weights.bold,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
  },
  optionsCol: {
    gap: spacing.md,
  },
  optionCard: {
    minHeight: touchTargets.minSize,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: radii.md,
    borderWidth: borders.thin,
    borderColor: colors.borderSubtle,
    padding: spacing.md,
    gap: spacing.xs,
  },
  optionSelectedCyan: {
    borderColor: colors.accentCyan,
    borderWidth: borders.active,
    backgroundColor: colors.cyanGlowBg,
  },
  optionSelectedBlue: {
    borderColor: colors.accentBlue,
    borderWidth: borders.active,
    backgroundColor: colors.blueGlowBg,
  },
  optionHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  optionTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
    fontWeight: typography.weights.bold,
  },
  optionDesc: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    lineHeight: typography.lineHeights.xs,
  },
  maxCapBox: {
    backgroundColor: colors.surfaceCard,
    borderRadius: radii.lg,
    borderWidth: borders.thin,
    borderColor: colors.statusWarning,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  maxCapText: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
  },
});
