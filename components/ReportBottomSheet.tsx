import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  Dimensions,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useColorScheme } from '@/hooks/use-color-scheme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ReportBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (reason: string, details: string) => void;
}

const REASONS = [
  'Inappropriate',
  'Inaccurate',
  'Repetitive',
  'Too Short',
  'Offensive',
  'Other',
];

export default function ReportBottomSheet({ isVisible, onClose, onSubmit }: ReportBottomSheetProps) {
  const colors = useThemeColor();
  const rawTheme = useColorScheme();
  const isDark = rawTheme === 'dark';
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [details, setDetails] = useState('');
  
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  // Use the same gradient as other cards in the app
  const cardGradientColors = isDark ? ['#1e1e1e', '#2c2c2c'] as const : ['#F3F4F6', '#E5E7EB'] as const;

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
      // Reset state on close
      setSelectedReason(null);
      setDetails('');
    }
  }, [isVisible]);

  const handleSubmit = () => {
    if (selectedReason) {
      onSubmit(selectedReason, details);
    }
  };

  if (!isVisible) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={isVisible ? 'auto' : 'none'}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity, backgroundColor: '#000' }]} />
      </Pressable>
      
      <Animated.View 
        style={[
          styles.sheet, 
          { 
            transform: [{ translateY }] 
          }
        ]}
      >
        <LinearGradient
            colors={cardGradientColors}
            style={[styles.sheetGradient, { borderColor: colors.border }]}
        >
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={20}
          >
            <View style={styles.content}>
              <View style={[styles.handle, { backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : colors.border }]} />
              
              <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>Report Response</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <IconSymbol name="xmark" size={24} color={colors.textSecondary} /> 
                </TouchableOpacity>
              </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
              <Text style={[styles.sectionLabel, { color: colors.text }]}>Select reason for report</Text>
              <View style={styles.pillsContainer}>
                {REASONS.map((reason) => (
                  <TouchableOpacity
                    key={reason}
                    style={[
                      styles.pill,
                      { borderColor: colors.border },
                      selectedReason === reason && { backgroundColor: colors.primary, borderColor: colors.primary }
                    ]}
                    onPress={() => setSelectedReason(reason)}
                  >
                    <Text 
                      style={[
                        styles.pillText, 
                        { color: colors.textSecondary },
                        selectedReason === reason && { color: '#FFF' }
                      ]}
                    >
                      {reason}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.sectionLabel, { color: colors.text, marginTop: Spacing.l }]}>Anything More (optional)</Text>
              <TextInput
                style={[
                  styles.input, 
                  { 
                    color: colors.text, 
                    borderColor: colors.border,
                    backgroundColor: colors.background 
                  }
                ]}
                placeholder="Tell us more..."
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={4}
                value={details}
                onChangeText={setDetails}
                textAlignVertical="top"
              />

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  { backgroundColor: colors.primary },
                  !selectedReason && { opacity: 0.5 }
                ]}
                disabled={!selectedReason}
                onPress={handleSubmit}
              >
                <Text style={styles.submitButtonText}>Submit Report</Text>
              </TouchableOpacity>
              
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    ...Shadows.strong,
    maxHeight: SCREEN_HEIGHT * 0.8,
  },
  sheetGradient: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    borderTopWidth: 1,
  },
  content: {
    padding: Spacing.l,
    paddingTop: Spacing.m,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.m,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.l,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: Spacing.m,
  },
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.s,
  },
  pill: {
    paddingHorizontal: Spacing.m,
    paddingVertical: Spacing.s,
    borderRadius: BorderRadius.circle,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    borderRadius: BorderRadius.m,
    borderWidth: 1,
    padding: Spacing.m,
    fontSize: 16,
    minHeight: 100,
    marginTop: Spacing.s,
  },
  submitButton: {
    marginTop: Spacing.xl,
    paddingVertical: Spacing.m,
    borderRadius: BorderRadius.circle,
    alignItems: 'center',
    ...Shadows.medium,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
