import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { borders, colors, radii, spacing, touchTargets, typography } from '../../theme/tokens';

export interface SystemAlertBannerProps {
  message: string;
  tone?: 'danger' | 'warning' | 'cyan' | 'success';
  onDismiss?: () => void;
}

export function SystemAlertBanner({
  message,
  tone = 'danger',
  onDismiss,
}: SystemAlertBannerProps) {
  return (
    <View style={[styles.banner, toneStyles[tone]]}>
      <View style={styles.textCol}>
        <Text style={[styles.tag, toneTextStyles[tone]]}>[AVISO DO SISTEMA]</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
      {onDismiss ? (
        <Pressable
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel="Fechar aviso"
          style={styles.dismissBtn}
        >
          <Text style={styles.dismissText}>OK</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radii.md,
    borderWidth: borders.thin,
    padding: spacing.md,
    gap: spacing.md,
  },
  textCol: {
    flex: 1,
    gap: spacing.xs,
  },
  tag: {
    fontSize: typography.sizes.xs,
    lineHeight: typography.lineHeights.xs,
    fontWeight: typography.weights.bold,
    letterSpacing: typography.letterSpacing.wide,
  },
  message: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
  },
  dismissBtn: {
    minWidth: touchTargets.minSize,
    minHeight: touchTargets.minSize,
    borderRadius: radii.sm,
    borderWidth: borders.thin,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surfaceCard,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  dismissText: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
});

const toneStyles = StyleSheet.create({
  danger: {
    backgroundColor: colors.dangerGlowBg,
    borderColor: colors.statusDanger,
  },
  warning: {
    backgroundColor: colors.warningGlowBg,
    borderColor: colors.statusWarning,
  },
  cyan: {
    backgroundColor: colors.cyanGlowBg,
    borderColor: colors.accentCyan,
  },
  success: {
    backgroundColor: colors.successGlowBg,
    borderColor: colors.statusSuccess,
  },
});

const toneTextStyles = StyleSheet.create({
  danger: {
    color: colors.statusDanger,
  },
  warning: {
    color: colors.statusWarning,
  },
  cyan: {
    color: colors.accentCyan,
  },
  success: {
    color: colors.statusSuccess,
  },
});
