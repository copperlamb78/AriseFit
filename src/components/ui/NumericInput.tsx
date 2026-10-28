import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { borders, colors, radii, spacing, touchTargets, typography } from '../../theme/tokens';

export interface NumericInputProps {
  value: string;
  onChangeText: (val: string) => void;
  placeholder?: string;
  label?: string;
  helperText?: string;
  errorText?: string | null;
  editable?: boolean;
  maxLength?: number;
}

export function NumericInput({
  value,
  onChangeText,
  placeholder = '0',
  label,
  helperText,
  errorText,
  editable = true,
  maxLength = 4,
}: NumericInputProps) {
  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        keyboardType="number-pad"
        editable={editable}
        maxLength={maxLength}
        style={[
          styles.input,
          errorText ? styles.inputError : null,
          !editable ? styles.inputDisabled : null,
        ]}
      />
      {errorText ? (
        <Text style={styles.errorText}>{errorText}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  label: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    lineHeight: typography.lineHeights.xs,
    fontWeight: typography.weights.semibold,
    letterSpacing: typography.letterSpacing.wide,
    textTransform: 'uppercase',
  },
  input: {
    minHeight: touchTargets.minSize,
    backgroundColor: colors.backgroundPrimary,
    borderWidth: borders.thin,
    borderColor: colors.borderSubtle,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  inputError: {
    borderColor: colors.statusDanger,
  },
  inputDisabled: {
    opacity: 0.55,
  },
  helperText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    lineHeight: typography.lineHeights.xs,
  },
  errorText: {
    color: colors.statusDanger,
    fontSize: typography.sizes.xs,
    lineHeight: typography.lineHeights.xs,
    fontWeight: typography.weights.semibold,
  },
});
