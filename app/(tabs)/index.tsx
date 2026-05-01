import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, Easing } from 'react-native-reanimated';
import Feather from '@expo/vector-icons/Feather';
import { useAlert } from '@/context/AlertContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';

import ResponseCard from '@/components/ResponseCard';
import ScreenshotUploader from '@/components/ScreenshotUploader';
import ToneSelector, { Tone } from '@/components/ToneSelector';
import ReportBottomSheet from '@/components/ReportBottomSheet';
import MissionField from '@/components/MissionField';
import DatingGoalsSync, { DatingGoal } from '@/components/DatingGoalsSync';
import { BorderRadius, Shadows, Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/useThemeColor';
import { generateResponses } from '@/services/ai';
import { useSubscription } from '@/context/SubscriptionContext';
import { useOnboarding } from '@/context/OnboardingContext';
import { useAds } from '@/context/AdContext';
import { useTheme } from '@/context/ThemeContext';

export default function HomeScreen() {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [mode, setMode] = useState<'chat' | 'prompts'>('chat');
  const [missionText, setMissionText] = useState('');
  const [userGoal, setUserGoal] = useState<DatingGoal | null>(null);
  const [targetGoal, setTargetGoal] = useState<DatingGoal | null>(null);
  const [detectedText, setDetectedText] = useState('Mocked OCR text: "I love hiking and coffee."');
  const [selectedTone, setSelectedTone] = useState<Tone>('flirty');
  const [responses, setResponses] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isReportVisible, setIsReportVisible] = useState(false);
  const [reportingResponse, setReportingResponse] = useState<string | null>(null);
  const { showAlert, showToast } = useAlert();

  const colors = useThemeColor();
  const { isPro, isUltra } = useSubscription();
  const { data: onboardingData } = useOnboarding();
  const { isInterstitialLoaded, showInterstitial } = useAds();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Mode Switcher Animation
  const tabPosition = useSharedValue(mode === 'chat' ? 0 : 1);

  const handleModeChange = (newMode: 'chat' | 'prompts') => {
    if (mode === newMode) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMode(newMode);
    tabPosition.value = withTiming(newMode === 'chat' ? 0 : 1, {
      duration: 250,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
    setSelectedImages([]);
    setResponses([]);
  };

  const animatedIndicatorStyle = useAnimatedStyle(() => {
    return {
      left: `${tabPosition.value * 50}%`,
    };
  });

  const handleImageSelected = (uris: string[]) => {
    setSelectedImages(uris);
    setResponses([]); // Reset responses on new image
    // Friction removed: modal no longer pops up automatically
  };

  const router = useRouter();
  const queryClient = useQueryClient();
  const { session } = useAuth();

  const handleGenerateValues = async () => {
    if (selectedImages.length === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);
    setResponses([]);

    try {
      // Show Interstitial ad immediately to mask backend latency!
      if (!isUltra && !isPro && isInterstitialLoaded) {
        showInterstitial();
      }

      const results = await generateResponses(
        selectedImages,
        selectedTone,
        isPro,
        isUltra,
        mode,
        missionText,
        userGoal,
        targetGoal
      );
      setResponses(results);

      // Refresh usage stats immediately
      queryClient.invalidateQueries({ queryKey: ['usageStats', session?.user?.id] });
      queryClient.invalidateQueries({ queryKey: ['usageHistory', session?.user?.id] });
    } catch (error: any) {
      if (error.message === 'PAYWALL_LIMIT_REACHED') {
        showAlert(
          'Daily Limit Reached',
          'You have used all 5 of your free daily requests. Upgrade to Pro for unlimited AI replies!',
          {
            type: 'warning',
            buttons: [
              { text: 'Cancel', style: 'cancel' },
              { text: 'View Usage', onPress: () => router.push('/(tabs)/usage') }
            ]
          }
        );
      } else {
        showAlert('Analysis Failed', 'Could not generate replies. Please try again.', { type: 'error' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReport = (response: string) => {
    setReportingResponse(response);
    setIsReportVisible(true);
  };

  const handleReportSubmit = (reason: string, details: string) => {
    // Log report for now as requested
    console.log('Report submitted:', {
      response: reportingResponse,
      reason,
      details,
      timestamp: new Date().toISOString()
    });

    setIsReportVisible(false);
    showToast('Thank you for your report!', 'success');
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

        {/* Mode Switcher */}
        <LinearGradient
          colors={isDark ? ['#1e1e1e', '#2c2c2c'] : [colors.card, colors.card]}
          style={[styles.modeSwitcherContainer]}
        >
          <View style={[StyleSheet.absoluteFill, { padding: 4 }]}>
            <Animated.View style={[
              styles.animatedIndicator,
              { backgroundColor: colors.primary },
              animatedIndicatorStyle
            ]} />
          </View>

          <TouchableOpacity
            style={styles.modeTab}
            onPress={() => handleModeChange('chat')}
            activeOpacity={0.7}
          >
            <Text style={[styles.modeTabText, mode === 'chat' && styles.activeModeTabText, mode === 'chat' ? { color: '#fff' } : { color: colors.textSecondary }]}>Chat Mode</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.modeTab}
            onPress={() => handleModeChange('prompts')}
            activeOpacity={0.7}
          >
            <Text style={[styles.modeTabText, mode === 'prompts' && styles.activeModeTabText, mode === 'prompts' ? { color: '#fff' } : { color: colors.textSecondary }]}>Prompts Mode</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Hero / Upload Section */}
        <ScreenshotUploader
          onImageSelected={handleImageSelected}
          selectedImages={selectedImages}
          isLoading={isLoading}
          mode={mode}
        />

        {/* Controls Section */}
        {selectedImages.length > 0 && (
          <View style={styles.controls}>
            {mode === 'chat' ? (
              <>
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
              </>
            ) : (
              <>
                <MissionField value={missionText} onChangeText={setMissionText} />
                <DatingGoalsSync
                  userGoal={userGoal}
                  targetGoal={targetGoal}
                  onUserGoalChange={setUserGoal}
                  onTargetGoalChange={setTargetGoal}
                />

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleGenerateValues}
                  disabled={isLoading}
                  style={[styles.generateButtonContainer, { backgroundColor: '#6C5CE7' }]}
                >
                  <Text style={styles.generateButtonText}>
                    {isLoading ? 'Brewing...' : 'Generate Prompts'}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        <ResponseCard
          responses={responses}
          isLoading={isLoading}
          onReport={handleReport}
        />

        <View style={{ height: 140 }} />
      </ScrollView>

      <ReportBottomSheet
        isVisible={isReportVisible}
        onClose={() => setIsReportVisible(false)}
        onSubmit={handleReportSubmit}
      />
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
  modeSwitcherContainer: {
    flexDirection: 'row',
    borderRadius: BorderRadius.xl + 8, // match uploader border radius
    padding: 4,
    // Removed marginBottom: Spacing.m so that it respects the uploader's marginVertical perfectly
  },
  animatedIndicator: {
    height: '100%',
    width: '50%',
    borderRadius: BorderRadius.xl + 4,
    ...Shadows.soft,
  },
  modeTab: {
    flex: 1,
    paddingVertical: Spacing.s,
    alignItems: 'center',
    borderRadius: BorderRadius.xl,
  },
  activeModeTab: {
    // shadow removed since it's now on the indicator
  },
  modeTabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  activeModeTabText: {
    fontWeight: '700',
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
  secondaryButtonContainer: {
    paddingVertical: Spacing.m,
    borderRadius: BorderRadius.circle,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 1,
    marginTop: Spacing.s,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
