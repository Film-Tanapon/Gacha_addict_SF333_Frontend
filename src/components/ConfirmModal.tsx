import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, radius } from '../theme/theme';
import PrimaryButton from './PrimaryButton';

type Props = {
  visible: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmDisabled?: boolean;
  disabledHint?: string; // เช่น "*Coins is not enough"
  onConfirm: () => void;
  onClose: () => void;
};

// Modal ยืนยันการทำรายการทั่วไป ใช้ซ้ำได้ เช่น ยืนยันซื้อ Theme, ยืนยันลบ ฯลฯ
export default function ConfirmModal({
  visible,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmDisabled,
  disabledHint,
  onConfirm,
  onClose,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.box}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>

          <Text style={styles.title}>{title}</Text>
          {description ? <Text style={styles.description}>{description}</Text> : null}

          {confirmDisabled && disabledHint ? (
            <Text style={styles.hint}>{disabledHint}</Text>
          ) : null}

          <View style={styles.actions}>
            <PrimaryButton title={cancelLabel} variant="muted" onPress={onClose} style={styles.actionButton} />
            <PrimaryButton
              title={confirmLabel}
              onPress={onConfirm}
              disabled={confirmDisabled}
              style={styles.actionButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  box: {
    width: '100%',
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: 24,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 14,
    right: 14,
  },
  closeText: {
    fontSize: 18,
    color: colors.textMuted,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 12,
  },
  hint: {
    fontSize: 12,
    color: colors.danger,
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    minWidth: 0,
  },
});
