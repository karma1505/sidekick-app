import React, { useEffect } from 'react';
import {
  StyleSheet,
  Text,
  Animated,
  Dimensions,
  SafeAreaView,
  View
} from 'react-native';
import { IconSymbol } from './icon-symbol';
import { Colors, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useThemeColor } from '@/hooks/useThemeColor';

interface SidekickToastProps {
  visible: boolean;
  message: string;
  type?: 'success' | 'error' | 'info';
}

const { width } = Dimensions.get('window');

export const SidekickToast: React.FC<SidekickToastProps> = ({
  visible,
  message,
  type = 'info'
}) => {
  const colors = useThemeColor();
  const translateY = React.useRef(new Animated.Value(-100)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 20,
          useNativeDriver: true,
          tension: 40,
          friction: 8,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const isDark = colors.background === '#1a1a1a' || colors.background === '#121212';
  const sharpRed = '#FF3B30';

  const getIcon = () => {
    switch (type) {
      case 'success': return { name: 'checkmark.circle.fill', color: colors.success };
      case 'error': return { name: 'exclamationmark.circle.fill', color: isDark ? sharpRed : colors.error };
      default: return { name: 'info.circle.fill', color: colors.primary };
    }
  };

  const icon = getIcon();

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        {
          transform: [{ translateY }],
          opacity,
          backgroundColor: isDark ? 'rgba(31, 41, 55, 0.95)' : colors.text,
          borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
          borderWidth: isDark ? 1 : 0,
        }
      ]}
    >
      <IconSymbol name={icon.name as any} size={20} color={isDark ? icon.color : colors.background} />
      <Text style={[styles.message, { color: isDark ? colors.text : colors.background }]}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 50,
    left: Spacing.xl,
    right: Spacing.xl,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: BorderRadius.circle,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    ...Shadows.strong,
    zIndex: 9999,
  },
  message: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
});
