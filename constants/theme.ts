/**
 * Premium Theme for Sidekick
 * Focus: Clean, Modern, Vibrant, Trustworthy
 */

import { Platform } from 'react-native';

const tintColorLight = '#4F46E5'; // Indigo 600
const tintColorDark = '#818cf8'; // Indigo 400

export const Colors = {
  light: {
    primary: '#4F46E5', // Indigo 600
    secondary: '#8B5CF6', // Violet 500
    background: '#F9FAFB', // Gray 50
    card: '#FFFFFF',
    text: '#111827', // Gray 900
    textSecondary: '#6B7280', // Gray 500
    border: '#E5E7EB', // Gray 200
    tint: tintColorLight,
    icon: '#6B7280',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: tintColorLight,
    success: '#10B981', // Emerald 500
    error: '#EF4444', // Red 500
    logoGradient: ['#4F46E5', '#EC4899'], // Indigo to Pink
  },
  dark: {
    primary: '#818CF8',
    secondary: '#A78BFA',
    background: '#111827', // Gray 900
    card: '#1F2937', // Gray 800
    text: '#F9FAFB', // Gray 50
    textSecondary: '#9CA3AF', // Gray 400
    border: '#374151', // Gray 700
    tint: tintColorDark,
    icon: '#9CA3AF',
    tabIconDefault: '#4B5563',
    tabIconSelected: tintColorDark,
    success: '#34D399',
    error: '#F87171',
    logoGradient: ['#818CF8', '#F472B6'],
  },
};

export const Spacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  s: 8,
  m: 12,
  l: 16,
  xl: 24,
  circle: 9999,
};

export const Shadows = {
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  strong: {
    shadowColor: '#4F46E5', // Colored shadow
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'System',
    serif: 'Georgia',
    mono: 'Menlo',
  },
  default: {
    sans: 'sans-serif',
    serif: 'serif',
    mono: 'monospace',
  },
});
