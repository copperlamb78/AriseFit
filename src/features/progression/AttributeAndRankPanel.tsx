import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AttributeAllocatorRow } from '../../components/rewards/AttributeAllocatorRow';
import { LevelProgressHud } from '../../components/system/LevelProgressHud';
import { SystemBadge } from '../../components/ui/SystemBadge';
import { SystemCard } from '../../components/ui/SystemCard';
import { ATTRIBUTE_KEYS, RANK_TIERS, RankTier } from '../../domain/models/system.models';
import {
  calculateRankFromBaseTarget,
  getRankDescription,
  PROGRESSION_STEPS,
} from '../../domain/rules/progression.rules';
import { useSystemStore } from '../../store/useSystemStore';
import { borders, colors, radii, spacing, typography } from '../../theme/tokens';

export function AttributeAndRankPanel() {
  const player = useSystemStore((s) => s.player);
  const allocateAttribute = useSystemStore((s) => s.allocateAttribute);

  return (
    <View style={styles.container}>
      <SystemCard
        variant={player.availableAttributePoints > 0 ? 'cyanGlow' : 'default'}
        hudTag="[DISTRIBUIÇÃO DE ATRIBUTOS DO CAÇADOR]"
        title="Atributos Físicos (STR / AGI / VIT)"
        subtitle="Você recebe +3 pontos livres a cada Missão Diária concluída."
        rightSlot={
          <SystemBadge
            label={`${player.availableAttributePoints} PTS LIVRES`}
            tone={player.availableAttributePoints > 0 ? 'cyan' : 'neutral'}
          />
        }
      >
        <View style={styles.attributesCol}>
          {ATTRIBUTE_KEYS.map((key) => (
            <AttributeAllocatorRow
              key={key}
              attributeKey={key}
              value={player.attributes[key]}
              availablePoints={player.availableAttributePoints}
              onAllocateOne={(attr) => void allocateAttribute(attr, 1)}
            />
          ))}
        </View>
      </SystemCard>

      <LevelProgressHud player={player} />

      <SystemCard
        hudTag="[MATRIZ DE DEGRAUS DO SISTEMA]"
        title="Escala Adaptativa (5 a 100)"
        subtitle="Flexões, Agachamentos e Abdominais seguem a meta-base; Polichinelos aplica 10x."
      >
        <View style={styles.stepsGrid}>
          {PROGRESSION_STEPS.map((step) => {
            const isCurrent = step === player.baseTarget;
            const isPassed = step < player.baseTarget;
            const stepRank = calculateRankFromBaseTarget(step);

            return (
              <View
                key={step}
                style={[
                  styles.stepChip,
                  isCurrent ? styles.stepChipCurrent : null,
                  isPassed ? styles.stepChipPassed : null,
                ]}
              >
                <Text
                  style={[
                    styles.stepNumber,
                    isCurrent ? styles.stepNumberCurrent : null,
                  ]}
                >
                  {step}
                </Text>
                <Text style={styles.stepPoli}>{step * 10}p</Text>
                <Text style={styles.stepRank}>Rank {stepRank}</Text>
              </View>
            );
          })}
        </View>
      </SystemCard>

      <SystemCard
        hudTag="[HIERARQUIA DE CAÇADORES]"
        title="Classificação de Ranks (E até S)"
        subtitle="Determinada automaticamente pela sua meta-base atual."
      >
        <View style={styles.ranksList}>
          {RANK_TIERS.map((tier: RankTier) => {
            const active = player.rank === tier;
            return (
              <View
                key={tier}
                style={[styles.rankRow, active ? styles.rankRowActive : null]}
              >
                <View style={styles.rankBadgeBox}>
                  <Text style={styles.rankLetter}>{tier}</Text>
                </View>
                <View style={styles.rankDescCol}>
                  <Text style={styles.rankTitle}>
                    Rank {tier} {active ? '(ATUAL)' : ''}
                  </Text>
                  <Text style={styles.rankSubtitle}>{getRankDescription(tier)}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </SystemCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  attributesCol: {
    gap: spacing.sm,
  },
  stepsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  stepChip: {
    width: '30%',
    flexGrow: 1,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: radii.md,
    borderWidth: borders.thin,
    borderColor: colors.borderSubtle,
    padding: spacing.sm,
    alignItems: 'center',
    gap: 2,
  },
  stepChipCurrent: {
    borderColor: colors.accentCyan,
    borderWidth: borders.active,
    backgroundColor: colors.cyanGlowBg,
  },
  stepChipPassed: {
    borderColor: colors.statusSuccess,
  },
  stepNumber: {
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.heavy,
  },
  stepNumberCurrent: {
    color: colors.accentCyan,
  },
  stepPoli: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  stepRank: {
    color: colors.accentBlue,
    fontSize: 10,
    fontWeight: typography.weights.bold,
  },
  ranksList: {
    gap: spacing.sm,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: radii.md,
    borderWidth: borders.thin,
    borderColor: colors.borderSubtle,
    padding: spacing.md,
    gap: spacing.md,
  },
  rankRowActive: {
    borderColor: colors.accentCyan,
    borderWidth: borders.active,
  },
  rankBadgeBox: {
    width: 40,
    height: 40,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceCard,
    borderWidth: borders.thin,
    borderColor: colors.accentCyan,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankLetter: {
    color: colors.accentCyan,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.heavy,
  },
  rankDescCol: {
    flex: 1,
    gap: 2,
  },
  rankTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  rankSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    lineHeight: typography.lineHeights.xs,
  },
});
