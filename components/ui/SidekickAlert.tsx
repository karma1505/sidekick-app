import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions
} from 'react-native';
import { IconSymbol } from './icon-symbol';
import { Colors, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useThemeColor } from '@/hooks/useThemeColor';
import { LinearGradient } from 'expo-linear-gradient';

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface SidekickAlertProps {
  visible: boolean;
  title: string;
  message: string;
  options: {
    buttons?: AlertButton[];
    type?: 'info' | 'success' | 'error' | 'warning' | 'confirm';
    cancelable?: boolean;
  };
  onClose: () => void;
}

const { width } = Dimensions.get('window');

export const SidekickAlert: React.FC<SidekickAlertProps> = ({
  visible,
  title,
  message,
  options,
  onClose
}) => {
  const colors = useThemeColor();
  const scaleAnim = React.useRef(new Animated.Value(0.9)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.9);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  const isDark = colors.background === '#1a1a1a' || colors.background === '#121212';
  const sharpRed = '#FF3B30';

  const getIcon = () => {
    switch (options.type) {
      case 'success': return { name: 'checkmark.circle.fill', color: colors.success };
      case 'error': return { name: 'exclamationmark.circle.fill', color: isDark ? sharpRed : colors.error };
      case 'warning': return { name: 'exclamationmark.triangle.fill', color: '#FF9500' }; // Sharp Orange
      case 'confirm': return { name: 'questionmark.circle.fill', color: colors.primary };
      default: return { name: 'info.circle.fill', color: colors.primary };
    }
  };

  const icon = getIcon();

  const handleButtonPress = (onPress?: () => void) => {
    onClose();
    if (onPress) {
      setTimeout(onPress, 100);
    }
  };

  const buttons = options.buttons || [{ text: 'OK', onPress: onClose }];

  const darkGradient = ['#1a1a1a', '#0a0a0a'] as const;
  const lightGradient = ['#ffffff', '#f2f2f2'] as const;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={() => options.cancelable && onClose()}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          activeOpacity={1}
          style={StyleSheet.absoluteFill}
          onPress={() => options.cancelable && onClose()}
        >
          <View style={[styles.backdrop, { backgroundColor: 'rgba(0,0,0,0.75)' }]} />
        </TouchableOpacity>

        <Animated.View
          style={[
            styles.alertContainer,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
              borderColor: isDark ? 'rgba(255,255,255,0.1)' : colors.border,
            }
          ]}
        >
          <LinearGradient
            colors={isDark ? darkGradient : lightGradient}
            style={[StyleSheet.absoluteFill, { opacity: isDark ? 0.9 : 1 }]}
          />

          <LinearGradient
            colors={isDark ? ['rgba(255,255,255,0.05)', 'transparent'] : ['rgba(255,255,255,0.8)', 'transparent']}
            style={styles.gradient}
          />

          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <IconSymbol name={icon.name as any} size={42} color={icon.color} />
            </View>

            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>

            <View style={styles.buttonContainer}>
              {buttons.map((button, index) => {
                const isDestructive = button.style === 'destructive';
                const isCancel = button.style === 'cancel';
                const isPrimary = buttons.length === 1 || (buttons.length === 2 && index === 1);
                const buttonBg = isDestructive
                  ? (isPrimary ? sharpRed : sharpRed + '15')
                  : (isPrimary ? colors.primary : 'transparent');

                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.button,
                      isCancel && styles.cancelButton,
                      { backgroundColor: buttonBg }
                    ]}
                    onPress={() => handleButtonPress(button.onPress)}
                  >
                    <Text
                      style={[
                        styles.buttonText,
                        { color: colors.text },
                        isDestructive && isPrimary && { color: 'white' },
                        isDestructive && !isPrimary && { color: sharpRed },
                        !isDestructive && isPrimary && { color: 'white' },
                      ]}
                    >
                      {button.text}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  alertContainer: {
    width: '100%',
    maxWidth: 340,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    ...Shadows.strong,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    padding: Spacing.xl,
    paddingTop: Spacing.s, // Further reduced top padding
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: Spacing.s, // Reduced icon margin
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: Spacing.s,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: Spacing.m,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: Spacing.m,
    borderRadius: BorderRadius.l,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButton: {
    backgroundColor: 'transparent',
  },
});
