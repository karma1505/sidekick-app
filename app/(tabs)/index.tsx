import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';

import ResponseCard from '@/components/ResponseCard';
import ScreenshotUploader from '@/components/ScreenshotUploader';
import ToneSelector, { Tone } from '@/components/ToneSelector';
import { BorderRadius, Shadows, Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/useThemeColor';
import { generateResponses } from '@/services/ai';
import { useSubscription } from '@/context/SubscriptionContext';
import { useOnboarding } from '@/context/OnboardingContext';

export default function HomeScreen() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedTone, setSelectedTone] = useState<Tone>('flirty');
  const [responses, setResponses] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const colors = useThemeColor();
  const { isPro, isUltra } = useSubscription();
  const { data: onboardingData } = useOnboarding();

  const handleImageSelected = (uri: string) => {
    setSelectedImage(uri);
    setResponses([]); // Reset responses on new image
  };

  const router = useRouter();
  const queryClient = useQueryClient();
  const { session } = useAuth();

  const handleGenerateValues = async () => {
    if (!selectedImage) {
      Alert.alert('Upload Screenshot', 'Please upload a screenshot first.');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);
    setResponses([]);

    try {
      const results = await generateResponses(selectedImage, selectedTone, isPro, isUltra);
      setResponses(results);

      // Refresh usage stats immediately
      queryClient.invalidateQueries({ queryKey: ['usageStats', session?.user?.id] });
      queryClient.invalidateQueries({ queryKey: ['usageHistory', session?.user?.id] });
    } catch (error: any) {
      if (error.message === 'PAYWALL_LIMIT_REACHED') {
        Alert.alert(
          'Daily Limit Reached',
          'You have used all 5 of your free daily requests. Upgrade to Pro for unlimited AI replies!',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'View Usage', onPress: () => router.push('/(tabs)/usage') }
          ]
        );
      } else {
        Alert.alert('Analysis Failed', 'Could not generate replies. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getGreeting = () => {
    const date = new Date();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const totalMinutes = hours * 60 + minutes;

    // 5:00 AM to 12:00 PM (noon)
    if (totalMinutes >= 300 && totalMinutes < 720) {
      return 'Morning Champ';
    }
    // 12:00 PM to 4:30 PM
    if (totalMinutes >= 720 && totalMinutes < 990) {
      return 'Afternoon Babe';
    }
    // 4:30 PM to 5:00 AM
    return 'Evening Honey';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Background Gradient */}
      <LinearGradient
        colors={[colors.tint + '30', colors.background] as const}
        style={styles.backgroundGradient}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.text }]}>{getGreeting()},</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Your SideKick Is Waiting</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.avatarContainer}
            onPress={() => router.push('/profile')}
          >
            <Animated.Image
              source={onboardingData.avatarUrl ? { uri: onboardingData.avatarUrl } : require('@/assets/images/avatar.png')}
              style={[styles.avatar, { borderColor: colors.card }]}
            />
          </TouchableOpacity>
        </View>

        {/* Hero / Upload Section */}
        <ScreenshotUploader
          onImageSelected={handleImageSelected}
          selectedImage={selectedImage}
          isLoading={isLoading}
        />

        {/* Controls Section (only show if image is selected or for demo layout) */}
        {selectedImage && (
          <View style={styles.controls}>
            <ToneSelector
              selectedTone={selectedTone}
              onSelectTone={setSelectedTone}
            />

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleGenerateValues}
              disabled={isLoading}
              style={[styles.generateButtonContainer, { backgroundColor: '#6C5CE7' }]}
            >
              <Text style={styles.generateButtonText}>
                {isLoading ? 'Brewing...' : 'Generate Replies'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <ResponseCard responses={responses} isLoading={isLoading} />

        <View style={{ height: 140 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.m,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 400,
  },
  header: {
    marginBottom: Spacing.l,
    marginTop: Spacing.s,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  avatarContainer: {
    ...Shadows.soft,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
  },
  controls: {
    marginTop: Spacing.s,
    gap: Spacing.m,
  },
  generateButtonContainer: {
    paddingVertical: Spacing.m,
    borderRadius: BorderRadius.circle,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.strong,
    marginTop: Spacing.s,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
