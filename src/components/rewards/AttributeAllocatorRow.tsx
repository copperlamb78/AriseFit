import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AttributeKey } from '../../domain/models/system.models';
import { ATTRIBUTE_METADATA } from '../../domain/rules/attributeRules';
import { borders, colors, radii, spacing, typography } from '../../theme/tokens';
import { SystemButton } from '../ui/SystemButton';

export interface AttributeAllocatorRowProps {
  attributeKey: AttributeKey;
  value: number;
  availablePoints: number;
  onAllocateOne: (attributeKey: AttributeKey) => void;
}

export function AttributeAllocatorRow({
  attributeKey,
  value,
  availablePoints,
  onAllocateOne,
}: AttributeAllocatorRowProps) {
  const meta = ATTRIBUTE_METADATA[attributeKey];
  const canAllocate = availablePoints > 0;

  return (
    <View style={styles.row}>
      <View style={styles.infoCol}>
        <View style={styles.titleLine}>
          <Text style={styles.codeBadge}>{meta.code}</Text>
          <Text style={styles.label}>{meta.label}</Text>
        </View>
        <Text style={styles.desc}>{meta.description}</Text>
      </View>

      <View style={styles.actionCol}>
        <View style={styles.valueBox}>
          <Text style={styles.valueText}>{value}</Text>
        </View>
        <SystemButton
          label="+1"
          variant={canAllocate ? 'cyan' : 'secondary'}
          disabled={!canAllocate}
          compact
          accessibilityLabel={`Alocar 1 ponto em ${meta.label}`}
          onPress={() => onAllocateOne(attributeKey)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
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
  infoCol: {
    flex: 1,
    gap: spacing.xs,
  },
  titleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  codeBadge: {
    color: colors.accentCyan,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.heavy,
    letterSpacing: typography.letterSpacing.wide,
  },
  label: {
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  desc: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    lineHeight: typography.lineHeights.xs,
  },
  actionCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexShrink: 0,
  },
  valueBox: {
    minWidth: 44,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceCard,
    borderWidth: borders.thin,
    borderColor: colors.borderSubtle,
    alignItems: 'center',
  },
  valueText: {
    color: colors.textPrimary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.heavy,
  },
});
