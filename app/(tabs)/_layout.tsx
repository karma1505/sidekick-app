import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { FluidTabBar } from '@/components/ui/FluidTabBar';
import { Shadows } from '@/constants/theme';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function TabLayout() {
  const colors = useThemeColor();

  return (
    <Tabs
      tabBar={(props: any) => <FluidTabBar {...props} />}
      screenOptions={{
        tabBarActiveTintColor: colors.tabIconSelected,
        tabBarInactiveTintColor: colors.tabIconDefault,
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          animation: 'shift',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="house.fill" color={color} />,
        }}
      />

      <Tabs.Screen
        name="usage"
        options={{
          title: 'Usage',
          animation: 'shift',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="chart.bar.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          animation: 'shift',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="gear" color={color} />,
        }}
      />
    </Tabs>
  );
}
