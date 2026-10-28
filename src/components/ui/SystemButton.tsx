import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { borders, colors, radii, spacing, touchTargets, typography } from '../../theme/tokens';

export type SystemButtonVariant =
  | 'primary'
  | 'cyan'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'ghost';

export interface SystemButtonProps {
  label: string;
  onPress: () => void;
  variant?: SystemButtonVariant;
  disabled?: boolean;
  fullWidth?: boolean;
  compact?: boolean;
  prefixSymbol?: string;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export function SystemButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  fullWidth = false,
  compact = false,
  prefixSymbol,
  style,
  accessibilityLabel,
}: SystemButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.base,
        compact ? styles.compact : styles.regular,
        fullWidth ? styles.fullWidth : null,
        variantContainerStyles[variant],
        pressed && !disabled ? styles.pressed : null,
        disabled ? styles.disabled : null,
        style,
      ]}
    >
      <View style={styles.contentRow}>
        {prefixSymbol ? (
          <Text
            numberOfLines={1}
            style={[styles.prefixText, variantTextStyles[variant]]}
          >
            {prefixSymbol}
          </Text>
        ) : null}
        <Text
          numberOfLines={1}
          style={[
            styles.labelText,
            compact ? styles.compactText : null,
            variantTextStyles[variant],
          ]}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: touchTargets.minSize,
    minWidth: touchTargets.minSize,
    borderRadius: radii.md,
    borderWidth: borders.thin,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  regular: {
    minHeight: touchTargets.minSize,
  },
  compact: {
    minHeight: touchTargets.minSize,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  fullWidth: {
    width: '100%',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  prefixText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  labelText: {
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    fontWeight: typography.weights.bold,
    letterSpacing: typography.letterSpacing.wide,
  },
  compactText: {
    fontSize: typography.sizes.xs,
    lineHeight: typography.lineHeights.xs,
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.45,
  },
});

const variantContainerStyles: Record<SystemButtonVariant, ViewStyle> = {
  primary: {
    backgroundColor: colors.accentBlue,
    borderColor: colors.accentCyan,
  },
  cyan: {
    backgroundColor: colors.accentCyan,
    borderColor: colors.accentCyan,
  },
  secondary: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.borderSubtle,
  },
  success: {
    backgroundColor: colors.statusSuccess,
    borderColor: colors.statusSuccess,
  },
  danger: {
    backgroundColor: colors.dangerGlowBg,
    borderColor: colors.statusDanger,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: colors.borderSubtle,
  },
};

const variantTextStyles = StyleSheet.create({
  primary: {
    color: colors.textPrimary,
  },
  cyan: {
    color: colors.backgroundPrimary,
  },
  secondary: {
    color: colors.textPrimary,
  },
  success: {
    color: colors.backgroundPrimary,
  },
  danger: {
    color: colors.statusDanger,
  },
  ghost: {
    color: colors.textSecondary,
  },
});
