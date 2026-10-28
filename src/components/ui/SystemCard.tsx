import React, { ReactNode } from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { borders, colors, radii, shadows, spacing, typography } from '../../theme/tokens';

export type SystemCardVariant = 'default' | 'elevated' | 'cyanGlow' | 'successGlow' | 'warningGlow';

export interface SystemCardProps {
  children: ReactNode;
  hudTag?: string;
  title?: string;
  subtitle?: string;
  rightSlot?: ReactNode;
  variant?: SystemCardVariant;
  style?: StyleProp<ViewStyle>;
}

export function SystemCard({
  children,
  hudTag,
  title,
  subtitle,
  rightSlot,
  variant = 'default',
  style,
}: SystemCardProps) {
  const hasHeader = Boolean(hudTag || title || subtitle || rightSlot);

  return (
    <View style={[styles.card, variantStyles[variant], style]}>
      {hasHeader ? (
        <View style={styles.headerRow}>
          <View style={styles.headerTextCol}>
            {hudTag ? <Text style={styles.hudTag}>{hudTag}</Text> : null}
            {title ? <Text style={styles.title}>{title}</Text> : null}
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
          {rightSlot ? <View style={styles.rightSlot}>{rightSlot}</View> : null}
        </View>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceCard,
    borderRadius: radii.lg,
    borderWidth: borders.thin,
    borderColor: colors.borderSubtle,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.subtle,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  headerTextCol: {
    flex: 1,
    gap: spacing.xs,
  },
  rightSlot: {
    flexShrink: 0,
  },
  hudTag: {
    color: colors.accentCyan,
    fontSize: typography.sizes.xs,
    lineHeight: typography.lineHeights.xs,
    fontWeight: typography.weights.bold,
    letterSpacing: typography.letterSpacing.systemHud,
    textTransform: 'uppercase',
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
});

const variantStyles: Record<SystemCardVariant, ViewStyle> = {
  default: {
    backgroundColor: colors.surfaceCard,
    borderColor: colors.borderSubtle,
  },
  elevated: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.borderSubtle,
  },
  cyanGlow: {
    backgroundColor: colors.surfaceCard,
    borderColor: colors.accentCyan,
    borderWidth: borders.active,
    ...shadows.cyanGlow,
  },
  successGlow: {
    backgroundColor: colors.surfaceCard,
    borderColor: colors.statusSuccess,
    borderWidth: borders.active,
  },
  warningGlow: {
    backgroundColor: colors.surfaceCard,
    borderColor: colors.statusWarning,
    borderWidth: borders.active,
  },
};
