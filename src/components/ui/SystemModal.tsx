import React, { ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { borders, colors, radii, shadows, spacing, touchTargets, typography } from '../../theme/tokens';

export interface SystemModalProps {
  visible: boolean;
  onClose: () => void;
  hudTag?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * Modal Canônico Mobile Nativo (.modal-card equivalente em React Native):
 * - Cabeçalho fixo (flexShrink: 0)
 * - Corpo rolável (ScrollView flexGrow: 0)
 * - Rodapé fixo de ações (flexShrink: 0)
 */
export function SystemModal({
  visible,
  onClose,
  hudTag = '[NOTIFICAÇÃO DO SISTEMA]',
  title,
  subtitle,
  children,
  footer,
}: SystemModalProps) {
  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          {/* Cabeçalho Fixo */}
          <View style={styles.header}>
            <View style={styles.headerTitleCol}>
              <Text style={styles.hudTag}>{hudTag}</Text>
              <Text style={styles.title}>{title}</Text>
              {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Fechar janela do Sistema"
              style={styles.closeBtn}
            >
              <Text style={styles.closeBtnText}>X</Text>
            </Pressable>
          </View>

          {/* Corpo Rolável */}
          <ScrollView
            style={styles.bodyScroll}
            contentContainerStyle={styles.bodyContent}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>

          {/* Rodapé Fixo */}
          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.modalBackdrop,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '88%',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.xl,
    borderWidth: borders.active,
    borderColor: colors.accentCyan,
    overflow: 'hidden',
    ...shadows.elevated,
  },
  header: {
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: borders.thin,
    borderBottomColor: colors.borderSubtle,
    backgroundColor: colors.backgroundSecondary,
    gap: spacing.md,
  },
  headerTitleCol: {
    flex: 1,
    gap: spacing.xs,
  },
  hudTag: {
    color: colors.accentCyan,
    fontSize: typography.sizes.xs,
    lineHeight: typography.lineHeights.xs,
    fontWeight: typography.weights.bold,
    letterSpacing: typography.letterSpacing.systemHud,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xl,
    lineHeight: typography.lineHeights.xl,
    fontWeight: typography.weights.heavy,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
  },
  closeBtn: {
    minWidth: touchTargets.minSize,
    minHeight: touchTargets.minSize,
    borderRadius: radii.md,
    borderWidth: borders.thin,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surfaceCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  bodyScroll: {
    flexGrow: 0,
  },
  bodyContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  footer: {
    flexShrink: 0,
    padding: spacing.lg,
    borderTopWidth: borders.thin,
    borderTopColor: colors.borderSubtle,
    backgroundColor: colors.backgroundSecondary,
    gap: spacing.sm,
  },
});
