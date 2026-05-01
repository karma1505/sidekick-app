import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput } from 'react-native';
import { Colors, BorderRadius, Shadows, Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/useThemeColor';
import Feather from '@expo/vector-icons/Feather';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/context/ThemeContext';

interface PromptPreviewModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: (text: string) => void;
  detectedText: string;
}

export default function PromptPreviewModal({
  isVisible,
  onClose,
  onConfirm,
  detectedText,
}: PromptPreviewModalProps) {
  const colors = useThemeColor();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const gradientColors = isDark ? ['#1e1e1e', '#2c2c2c'] as const : ['#F3F4F6', '#E5E7EB'] as const;

  const [text, setText] = useState(detectedText);

  useEffect(() => {
    setText(detectedText);
  }, [detectedText, isVisible]);

  return (
    <Modal visible={isVisible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Preview Extracted Prompt</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Here is what we detected from the screenshot. This helps us generate better replies.
          </Text>

          <LinearGradient
            colors={gradientColors}
            style={[styles.textContainer, { borderColor: colors.border }]}
          >
            <TextInput
              style={[styles.detectedText, { color: colors.text }]}
              value={text}
              onChangeText={setText}
              multiline
              textAlignVertical="top"
              placeholder="No text detected."
              placeholderTextColor={colors.textSecondary}
            />
          </LinearGradient>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { borderColor: colors.border }]}
              onPress={onClose}
            >
              <Text style={[styles.buttonText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.confirmButton, { backgroundColor: colors.primary }]}
              onPress={() => onConfirm(text)}
            >
              <Text style={[styles.buttonText, { color: '#fff' }]}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.l,
    maxHeight: '80%',
    ...Shadows.strong,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.m,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    padding: Spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: Spacing.m,
  },
  textContainer: {
    borderWidth: 1,
    borderRadius: BorderRadius.m,
    padding: Spacing.m,
    minHeight: 120,
    maxHeight: 200,
    marginBottom: Spacing.l,
    ...Shadows.soft,
  },
  detectedText: {
    fontSize: 16,
    lineHeight: 24,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.m,
  },
  button: {
    flex: 1,
    paddingVertical: Spacing.m,
    borderRadius: BorderRadius.circle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  confirmButton: {
    ...Shadows.medium,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
