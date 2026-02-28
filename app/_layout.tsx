import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

import 'react-native-reanimated';

import { ONBOARDING_REQUIRED } from '@/constants/Config';


import { useOnboarding } from '@/context/OnboardingContext';

function RootLayoutNav() {
  const { session, isLoading: authLoading } = useAuth();
  const { hasCompletedOnboarding, isLoading: onboardingLoading } = useOnboarding();
  const segments = useSegments();
  const router = useRouter();
  const colorScheme = useColorScheme();

  const rootNavigationState = useRootNavigationState();
  const isLoading = authLoading || onboardingLoading;

  useEffect(() => {
    if (!rootNavigationState?.key) return; // Wait for navigation to complete mounting
    if (isLoading) return;
    if (!segments || !segments.length) return; // Wait for segments to be ready

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboardingGroup = segments[0] === '(onboarding)';

    console.log('RootLayoutNav check:', {
      session: !!session,
      onboardingRequired: ONBOARDING_REQUIRED,
      hasCompleted: hasCompletedOnboarding,
      segments: segments,
      inOnboarding: inOnboardingGroup
    });

    if (!session && !inAuthGroup) {
      // Redirect to the login page if the user is not signed in
      console.log('Redirecting to login');
      router.replace('/(auth)/login');
    } else if (session) {
      if (ONBOARDING_REQUIRED && !hasCompletedOnboarding && !inOnboardingGroup) {
        // Redirect to onboarding if required, not completed, and not already there
        console.log('Redirecting to onboarding');
        router.replace('/(onboarding)/gender');
      } else if (hasCompletedOnboarding && inOnboardingGroup) {
        // If completed and still in onboarding, go to tabs
        console.log('Redirecting to tabs (completed)');
        router.replace('/(tabs)');
      } else if ((!ONBOARDING_REQUIRED || hasCompletedOnboarding) && inAuthGroup) {
        // Redirect away from the login page if the user is signed in and onboarding is done/not required
        console.log('Redirecting to tabs (auth)');
        router.replace('/(tabs)');
      }
    }
  }, [session, hasCompletedOnboarding, segments, isLoading, rootNavigationState?.key]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
        <Stack.Screen name="paywall" options={{ presentation: 'fullScreenModal', headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

import { OnboardingProvider } from '@/context/OnboardingContext';
import { ThemeProvider as SidekickThemeProvider } from '@/context/ThemeContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <SidekickThemeProvider>
          <OnboardingProvider>
            <SafeAreaProvider>
              <RootLayoutNav />
            </SafeAreaProvider>
          </OnboardingProvider>
        </SidekickThemeProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

