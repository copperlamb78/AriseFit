import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import { QuestClearedView } from '../features/rewards/QuestClearedView';
import { colors, spacing } from '../theme/tokens';

/**
 * Tela 2: Conclusão e Recompensas (QUEST CLEARED)
 * Apresenta o resumo realizado vs meta, +XP, +Moedas do Sistema, +3 Pontos de Atributo,
 * seletor "Aceitar nova meta" vs "Manter meta atual" quando superar a meta e resumo do próximo dia.
 */
export default function QuestClearedScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <QuestClearedView
          onBackToDashboard={() => {
            router.replace('/(tabs)');
          }}
          onGoToProfile={() => {
            router.replace('/(tabs)/profile');
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
