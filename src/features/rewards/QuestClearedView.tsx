import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TargetEvolutionPrompt } from '../../components/quests/TargetEvolutionPrompt';
import { RankCrest } from '../../components/system/RankCrest';
import { SystemBadge } from '../../components/ui/SystemBadge';
import { SystemButton } from '../../components/ui/SystemButton';
import { SystemCard } from '../../components/ui/SystemCard';
import { EXERCISE_IDS } from '../../domain/models/system.models';
import { getAllExerciseTargetsForBase } from '../../domain/rules/progression.rules';
import { calculateQuestRewards } from '../../domain/rules/reward.rules';
import { useSystemStore } from '../../store/useSystemStore';
import { borders, colors, radii, spacing, typography } from '../../theme/tokens';

export interface QuestClearedViewProps {
  onBackToDashboard: () => void;
  onGoToProfile: () => void;
}

export function QuestClearedView({
  onBackToDashboard,
  onGoToProfile,
}: QuestClearedViewProps) {
  const player = useSystemStore((s) => s.player);
  const dailyQuest = useSystemStore((s) => s.dailyQuest);
  const setProgressionChoiceAfterCompletion = useSystemStore(
    (s) => s.setProgressionChoiceAfterCompletion,
  );

  const rewards = calculateQuestRewards(dailyQuest.baseTarget);
  const nextDayTargets = getAllExerciseTargetsForBase(player.baseTarget);

  const activeChoice: 'ACCEPT_NEW_TARGET' | 'KEEP_CURRENT_TARGET' =
    dailyQuest.progressionChoice === 'ACCEPT_NEW_TARGET'
      ? 'ACCEPT_NEW_TARGET'
      : 'KEEP_CURRENT_TARGET';

  return (
    <View style={styles.container}>
      <SystemCard
        variant="cyanGlow"
        hudTag="[NOTIFICAÇÃO OFICIAL DO SISTEMA]"
        title="QUEST CLEARED"
        subtitle={`Missão Diária de ${dailyQuest.dateKey} concluída com êxito.`}
        rightSlot={<RankCrest rank={player.rank} size="sm" />}
      >
        <View style={styles.badgesRow}>
          <SystemBadge label="RECOMPENSA IDEMPOTENTE CREDITADA" tone="success" />
          <SystemBadge label={`NÍVEL ATUAL: ${player.level}`} tone="cyan" />
          <SystemBadge label={`SEQUÊNCIA: ${player.currentStreak} DIAS`} tone="warning" />
        </View>

        <View style={styles.rewardsBanner}>
          <View style={styles.rewardColumn}>
            <Text style={styles.rewardBigCyan}>+{rewards.xpEarned}</Text>
            <Text style={styles.rewardCaption}>XP GANHO</Text>
          </View>
          <View style={styles.rewardColumn}>
            <Text style={styles.rewardBigGold}>+{rewards.coinsEarned}</Text>
            <Text style={styles.rewardCaption}>MOEDAS DO SISTEMA</Text>
          </View>
          <View style={styles.rewardColumn}>
            <Text style={styles.rewardBigGreen}>+{rewards.attributePointsEarned}</Text>
            <Text style={styles.rewardCaption}>PONTOS DE ATRIBUTO</Text>
          </View>
        </View>
      </SystemCard>

      <SystemCard
        hudTag="[RELATÓRIO DE EXECUÇÃO]"
        title="Realizado vs Meta Solicitada"
        subtitle="Registro auditado dos 4 exercícios obrigatórios do Sistema."
      >
        <View style={styles.summaryList}>
          {EXERCISE_IDS.map((id) => {
            const ex = dailyQuest.exercises[id];
            const isSuper = ex.performedReps > ex.targetReps;
            return (
              <View key={id} style={styles.summaryRow}>
                <View style={styles.summaryLeft}>
                  <Text style={styles.summaryName}>{ex.name}</Text>
                  <Text style={styles.summaryMeta}>Meta: {ex.targetReps} reps</Text>
                </View>
                <View style={styles.summaryRight}>
                  <Text style={styles.summaryPerformed}>
                    Realizado: {ex.performedReps} reps
                  </Text>
                  <SystemBadge
                    label={isSuper ? 'SUPEROU A META' : 'META CUMPRIDA'}
                    tone={isSuper ? 'warning' : 'success'}
                  />
                </View>
              </View>
            );
          })}
        </View>
      </SystemCard>

      <TargetEvolutionPrompt
        currentBaseTarget={dailyQuest.baseTarget}
        exceededTarget={dailyQuest.exceededTarget}
        selectedChoice={activeChoice}
        onSelectChoice={(choice) => {
          void setProgressionChoiceAfterCompletion(choice);
        }}
      />

      <SystemCard
        hudTag="[PROJEÇÃO DA PRÓXIMA MISSÃO DIÁRIA]"
        title="Resumo da Meta do Próximo Dia"
        subtitle={`Configurada no degrau ${player.baseTarget} (Rank ${player.rank}).`}
      >
        <View style={styles.nextTargetsGrid}>
          <View style={styles.nextTargetItem}>
            <Text style={styles.nextTargetLabel}>Flexões</Text>
            <Text style={styles.nextTargetVal}>{nextDayTargets.pushups}</Text>
          </View>
          <View style={styles.nextTargetItem}>
            <Text style={styles.nextTargetLabel}>Agachamentos</Text>
            <Text style={styles.nextTargetVal}>{nextDayTargets.squats}</Text>
          </View>
          <View style={styles.nextTargetItem}>
            <Text style={styles.nextTargetLabel}>Abdominais</Text>
            <Text style={styles.nextTargetVal}>{nextDayTargets.situps}</Text>
          </View>
          <View style={styles.nextTargetItem}>
            <Text style={styles.nextTargetLabel}>Polichinelos (10x)</Text>
            <Text style={styles.nextTargetValCyan}>{nextDayTargets.jumping_jacks}</Text>
          </View>
        </View>
      </SystemCard>

      <View style={styles.actionsCol}>
        <SystemButton
          label={`Distribuir Pontos de Atributo (${player.availableAttributePoints} disponíveis)`}
          variant="cyan"
          fullWidth
          onPress={onGoToProfile}
        />
        <SystemButton
          label="Voltar ao Painel do Sistema"
          variant="secondary"
          fullWidth
          onPress={onBackToDashboard}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  rewardsBanner: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  rewardColumn: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: radii.md,
    borderWidth: borders.thin,
    borderColor: colors.accentCyan,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
  },
  rewardBigCyan: {
    color: colors.accentCyan,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.heavy,
  },
  rewardBigGold: {
    color: colors.statusWarning,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.heavy,
  },
  rewardBigGreen: {
    color: colors.statusSuccess,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.heavy,
  },
  rewardCaption: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
  },
  summaryList: {
    gap: spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: radii.md,
    borderWidth: borders.thin,
    borderColor: colors.borderSubtle,
    padding: spacing.md,
    gap: spacing.md,
  },
  summaryLeft: {
    gap: 2,
  },
  summaryName: {
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  summaryMeta: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
  },
  summaryRight: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  summaryPerformed: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  nextTargetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  nextTargetItem: {
    width: '47%',
    flexGrow: 1,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: radii.md,
    borderWidth: borders.thin,
    borderColor: colors.borderSubtle,
    padding: spacing.md,
    gap: spacing.xs,
  },
  nextTargetLabel: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  nextTargetVal: {
    color: colors.textPrimary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.heavy,
  },
  nextTargetValCyan: {
    color: colors.accentCyan,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.heavy,
  },
  actionsCol: {
    gap: spacing.sm,
  },
});
