import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, BorderRadius, Shadows, Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useTheme } from '@/context/ThemeContext';

interface MissionFieldProps {
  value: string;
  onChangeText: (text: string) => void;
}

export default function MissionField({ value, onChangeText }: MissionFieldProps) {
  const colors = useThemeColor();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const gradientColors = isDark ? ['#1e1e1e', '#2c2c2c'] as const : [colors.card, colors.card] as const;

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>YOUR GOAL</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        What do you expect out of this reply?
      </Text>
      <LinearGradient
        colors={gradientColors}
        style={[styles.inputWrapper, { borderColor: colors.border }]}
      >
        <TextInput
          style={[
            styles.input,
            {
              color: colors.text
            }
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder="I want to get them on a coffee date..."
          placeholderTextColor={colors.textSecondary}
          multiline
          maxLength={150}
        />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.s,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.s,
    marginLeft: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: Spacing.s,
    marginLeft: Spacing.xs,
  },
  inputWrapper: {
    borderWidth: 1,
    borderRadius: BorderRadius.m,
    overflow: 'hidden',
    ...Shadows.soft,
  },
  input: {
    padding: Spacing.m,
    minHeight: 80,
    fontSize: 16,
    textAlignVertical: 'top',
  },
});
