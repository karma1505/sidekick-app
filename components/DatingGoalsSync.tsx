import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, BorderRadius, Shadows, Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useTheme } from '@/context/ThemeContext';

export type DatingGoal = 'Long-term' | 'Short-term' | 'Physical Intimacy' | 'Figuring it out' | 'Not sure';

const GOALS: DatingGoal[] = ['Long-term', 'Short-term', 'Physical Intimacy', 'Figuring it out', 'Not sure'];

interface DatingGoalsSyncProps {
  userGoal: DatingGoal | null;
  targetGoal: DatingGoal | null;
  onUserGoalChange: (goal: DatingGoal) => void;
  onTargetGoalChange: (goal: DatingGoal) => void;
}

export default function DatingGoalsSync({
  userGoal,
  targetGoal,
  onUserGoalChange,
  onTargetGoalChange,
}: DatingGoalsSyncProps) {
  const colors = useThemeColor();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const gradientColors = isDark ? ['#1e1e1e', '#2c2c2c'] as const : [colors.card, colors.card] as const;

  const renderGoalPills = (
    selectedGoal: DatingGoal | null,
    onSelect: (goal: DatingGoal) => void
  ) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsContainer}>
      {GOALS.map((goal) => {
        const isSelected = selectedGoal === goal;
        return (
          <TouchableOpacity
            key={goal}
            onPress={() => onSelect(goal)}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={isSelected ? [colors.primary, colors.primary] : gradientColors}
              style={[
                styles.pill,
                {
                  borderColor: isSelected ? colors.primary : colors.border,
                }
              ]}
            >
              <Text style={[
                styles.pillText,
                { color: isSelected ? '#fff' : colors.text }
              ]}>
                {goal}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <Text style={[styles.header, { color: colors.textSecondary }]}>DATING GOALS SYNC</Text>

      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>YOUR GOAL</Text>
        {renderGoalPills(userGoal, onUserGoalChange)}
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>THEIR GOAL (FROM PROFILE)</Text>
        {renderGoalPills(targetGoal, onTargetGoalChange)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.s,
    gap: Spacing.m,
  },
  header: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.s,
    marginLeft: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  section: {
    gap: Spacing.xs,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
    marginLeft: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  pillsContainer: {
    gap: Spacing.s,
    paddingVertical: 4,
  },
  pill: {
    paddingHorizontal: Spacing.m,
    paddingVertical: Spacing.s,
    borderRadius: BorderRadius.circle,
    borderWidth: 1,
    ...Shadows.soft,
  },
  pillText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
