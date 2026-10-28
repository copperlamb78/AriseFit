import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useDailySync } from '../hooks/useDailySync';
import { colors, spacing, typography } from '../theme/tokens';

export default function RootLayout() {
  const { isHydrated } = useDailySync();

  if (!isHydrated) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <StatusBar style="light" />
        <View style={styles.loadingCard}>
          <Text style={styles.hudTag}>[SISTEMA ARISEFIT]</Text>
          <Text style={styles.loadingTitle}>Inicializando Interface do Caçador...</Text>
          <Text style={styles.loadingSub}>Sincronizando dados locais e Missão Diária.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.backgroundPrimary },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="quest-cleared"
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  loadingScreen: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  loadingCard: {
    width: '100%',
    backgroundColor: colors.surfaceCard,
    borderWidth: 1.5,
    borderColor: colors.accentCyan,
    borderRadius: 12,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  hudTag: {
    color: colors.accentCyan,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    letterSpacing: typography.letterSpacing.systemHud,
  },
  loadingTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
  },
  loadingSub: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    textAlign: 'center',
  },
});
