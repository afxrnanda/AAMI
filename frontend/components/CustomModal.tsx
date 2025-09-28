import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

type CustomModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title?: string;
  closeText?: string;
  confirmText?: string;
  buttonTextColor?: string;
  buttonBackgroundColor?: string;
  modalBackgroundColor?: string;
  titleColor?: string;
  children?: React.ReactNode;
};

export default function CustomModal({
  visible,
  onClose,
  onConfirm,
  title = 'Informação',
  closeText = 'Fechar',
  confirmText = 'Confirmar',
  buttonTextColor,
  buttonBackgroundColor,
  modalBackgroundColor,
  titleColor,
  children,
}: CustomModalProps) {
  const theme = useTheme();

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: modalBackgroundColor || theme.colors.background },
          ]}
        >
          {title && (
            <Text
              style={[
                styles.modalTitle,
                { color: titleColor || theme.colors.onBackground },
              ]}
            >
              {title}
            </Text>
          )}

          <View>{children}</View>

          <View style={styles.modalButtonContainer}>
            {onConfirm && (
              <TouchableOpacity
                onPress={onClose}
                style={[styles.modalButton, styles.cancelButton]}
              >
                <Text style={[styles.cancelButtonText, { color: buttonTextColor || '#333' }]}>
                  {closeText}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={onConfirm || onClose}
              style={[
                styles.modalButton,
                onConfirm ? styles.confirmButton : styles.closeButton,
                { backgroundColor: buttonBackgroundColor || theme.colors.primary },
              ]}
            >
              <Text style={[styles.buttonText, { color: buttonTextColor || 'white' }]}>
                {onConfirm ? confirmText : closeText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: '80%',
    borderRadius: 8,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  modalButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
  },
  closeButton: {
    backgroundColor: '#007AFF',
  },
  cancelButtonText: {
    fontWeight: 'bold',
  },
  buttonText: {
    fontWeight: 'bold',
  },
});