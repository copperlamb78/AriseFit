import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { HistoryTimelineItem } from '../../components/profile/HistoryTimelineItem';
import { HunterStatsSummary } from '../../components/profile/HunterStatsSummary';
import { RankCrest } from '../../components/system/RankCrest';
import { SystemBadge } from '../../components/ui/SystemBadge';
import { SystemButton } from '../../components/ui/SystemButton';
import { SystemCard } from '../../components/ui/SystemCard';
import { useSystemStore } from '../../store/useSystemStore';
import { borders, colors, radii, spacing, touchTargets, typography } from '../../theme/tokens';

const AVATAR_EMBLEMS = [
  { id: 'shadow-monarch-crest', code: 'SM', label: 'Insígnia das Sombras' },
  { id: 'crimson-knight-crest', code: 'CK', label: 'Elmo Carmesim' },
  { id: 'azure-dagger-crest', code: 'AD', label: 'Adaga Astral' },
  { id: 'astral-gate-crest', code: 'AG', label: 'Portal Dimensional' },
] as const;

export interface HunterProfileAndHistoryPanelProps {
  showHistorySection?: boolean;
}

export function HunterProfileAndHistoryPanel({
  showHistorySection = true,
}: HunterProfileAndHistoryPanelProps) {
  const player = useSystemStore((s) => s.player);
  const history = useSystemStore((s) => s.history);
  const updateHunterProfile = useSystemStore((s) => s.updateHunterProfile);

  const [nameDraft, setNameDraft] = useState(player.hunterName);
  const [selectedAvatar, setSelectedAvatar] = useState(
    player.avatarId ?? 'shadow-monarch-crest',
  );
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSaveIdentity = async () => {
    const result = await updateHunterProfile(nameDraft, selectedAvatar);
    if (result.ok) {
      setFeedback('Identidade do Caçador atualizada no Sistema.');
    } else {
      setFeedback(result.error ?? 'Erro ao salvar nome.');
    }
  };

  const currentEmblem =
    AVATAR_EMBLEMS.find((a) => a.id === (player.avatarId ?? selectedAvatar)) ??
    AVATAR_EMBLEMS[0];

  return (
    <View style={styles.container}>
      <SystemCard
        variant="cyanGlow"
        hudTag="[IDENTIDADE REGISTRADA NO SISTEMA]"
        title={player.hunterName}
        subtitle={`${player.title} • Emblema: ${currentEmblem.label}`}
        rightSlot={<RankCrest rank={player.rank} size="md" />}
      >
        <View style={styles.avatarGrid}>
          {AVATAR_EMBLEMS.map((emblem) => {
            const isSelected = selectedAvatar === emblem.id;
            return (
              <Pressable
                key={emblem.id}
                onPress={() => setSelectedAvatar(emblem.id)}
                accessibilityRole="button"
                accessibilityLabel={`Selecionar emblema ${emblem.label}`}
                style={[
                  styles.emblemOption,
                  isSelected ? styles.emblemOptionActive : null,
                ]}
              >
                <Text style={styles.emblemCode}>{emblem.code}</Text>
                <Text numberOfLines={1} style={styles.emblemLabel}>
                  {emblem.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.editNameRow}>
          <View style={styles.inputCol}>
            <Text style={styles.inputLabel}>NOME DO CAÇADOR</Text>
            <TextInput
              value={nameDraft}
              onChangeText={(text) => {
                setNameDraft(text);
                if (feedback) {
                  setFeedback(null);
                }
              }}
              placeholder="Digite seu nome de Caçador"
              placeholderTextColor={colors.textSecondary}
              maxLength={28}
              style={styles.textInput}
            />
          </View>
          <SystemButton
            label="Salvar"
            variant="primary"
            compact
            onPress={() => void handleSaveIdentity()}
          />
        </View>

        {feedback ? <Text style={styles.feedbackText}>{feedback}</Text> : null}
      </SystemCard>

      <HunterStatsSummary player={player} />

      {showHistorySection ? (
        <View style={styles.historySection}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>REGISTROS DE MISSÕES (QUEST RECORDS)</Text>
            <SystemBadge label={`${history.length} REGISTROS`} tone="cyan" />
          </View>

          {history.length === 0 ? (
            <SystemCard
              hudTag="[ARQUIVO DO SISTEMA VAZIO]"
              title="Nenhuma Missão Arquivada Ainda"
              subtitle="Conclua os 4 exercícios da Missão Diária no painel principal para inaugurar seu histórico imutável."
            >
              <Text style={styles.emptyHint}>
                Seus registros diários (YYYY-MM-DD), quantidades realizadas e recompensas aparecerão
                aqui em modo de leitura segura.
              </Text>
            </SystemCard>
          ) : (
            <View style={styles.historyList}>
              {history.map((entry) => (
                <HistoryTimelineItem key={`${entry.questId}-${entry.recordedAt}`} entry={entry} />
              ))}
            </View>
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  emblemOption: {
    width: '47%',
    flexGrow: 1,
    minHeight: touchTargets.minSize,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: radii.md,
    borderWidth: borders.thin,
    borderColor: colors.borderSubtle,
    padding: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  emblemOptionActive: {
    borderColor: colors.accentCyan,
    borderWidth: borders.active,
    backgroundColor: colors.cyanGlowBg,
  },
  emblemCode: {
    color: colors.accentCyan,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.heavy,
  },
  emblemLabel: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  editNameRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  inputCol: {
    flex: 1,
    gap: spacing.xs,
  },
  inputLabel: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    letterSpacing: typography.letterSpacing.wide,
  },
  textInput: {
    minHeight: touchTargets.minSize,
    backgroundColor: colors.backgroundPrimary,
    borderRadius: radii.md,
    borderWidth: borders.thin,
    borderColor: colors.borderSubtle,
    paddingHorizontal: spacing.md,
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  feedbackText: {
    color: colors.accentCyan,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  historySection: {
    gap: spacing.md,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  historyTitle: {
    color: colors.accentCyan,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    letterSpacing: typography.letterSpacing.wide,
  },
  historyList: {
    gap: spacing.md,
  },
  emptyHint: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    lineHeight: typography.lineHeights.xs,
  },
});
