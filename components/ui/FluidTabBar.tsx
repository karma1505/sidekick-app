import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import { LayoutChangeEvent, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
    withSequence
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Shadows, Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/useThemeColor';

// Spring config for the fluid "liquid" motion
const SPRING_CONFIG = {
    damping: 100,    // High damping = no wobble
    stiffness: 400,  // Fast movement
    mass: 1,
};

export function FluidTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const colors = useThemeColor();
    const insets = useSafeAreaInsets();

    // Store the X position of each tab so the indicator knows where to slide
    const [tabPositions, setTabPositions] = useState<{ x: number; width: number }[]>([]);

    // Shared values for the fluid indicator
    const translateX = useSharedValue(0);
    const indicatorWidth = useSharedValue(0);
    const indicatorScale = useSharedValue(1);

    // When the active tab changes, animate the indicator
    useEffect(() => {
        const activeTab = tabPositions[state.index];
        if (activeTab) {
            // Target center X of the active tab icon area
            // Base indicator width is now 64, so offset by half (32)
            const targetX = activeTab.x + activeTab.width / 2 - 32;

            // Calculate distance to determine how much to stretch
            const distance = Math.abs(targetX - translateX.value);
            const stretchAmount = Math.min(distance * 0.35, 50); // Less exaggerated stretch

            // 1. Stretch wide, then IMMEDIATELY spring back to a pill shape
            // This removes the delay of waiting for the slide animation to fully settle
            indicatorWidth.value = withSequence(
                withTiming(64 + stretchAmount, { duration: 100 }), // Fast stretch out
                withSpring(64, { damping: 100, stiffness: 400 })   // Snap back to base 64 instantly with NO bounce
            );

            indicatorScale.value = withSequence(
                withTiming(0.85, { duration: 100 }),
                withSpring(1, { damping: 100, stiffness: 400 })
            );

            // 2. Slide to new position (decoupled from the shape snap-back)
            translateX.value = withSpring(targetX, SPRING_CONFIG);
        }
    }, [state.index, tabPositions]);

    const handleTabLayout = (event: LayoutChangeEvent, index: number) => {
        const { x, width } = event.nativeEvent.layout;
        setTabPositions((prev) => {
            const newPositions = [...prev];
            newPositions[index] = { x, width };
            return newPositions;
        });
    };

    // Calculate style unconditionally to obey Rules of Hooks
    const indicatorAnimatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { scaleY: indicatorScale.value }
        ],
        width: indicatorWidth.value,
    }));

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: colors.background,
                    paddingBottom: Platform.OS === 'ios' ? insets.bottom || 20 : 16,
                },
            ]}
        >
            {/* The Animated Fluid Indicator */}
            {tabPositions.length === state.routes.length && (
                <Animated.View
                    style={[
                        styles.indicator,
                        { backgroundColor: colors.tint + '20' }, // 20% opacity primary color
                        indicatorAnimatedStyle,
                    ]}
                />
            )}

            {/* Tab Buttons */}
            {state.routes.map((route, index) => {
                const { options } = descriptors[route.key];
                const isFocused = state.index === index;

                const onPress = () => {
                    // Tap haptic feedback
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name);
                    }
                };

                return (
                    <TouchableOpacity
                        key={route.key}
                        activeOpacity={1}
                        onPress={onPress}
                        onLayout={(e) => handleTabLayout(e, index)}
                        style={styles.tabItem}
                    >
                        {/* Render the icon from the route options (passed from _layout.tsx) */}
                        {options.tabBarIcon?.({
                            focused: isFocused,
                            color: isFocused ? colors.tint : colors.tabIconDefault,
                            size: 24,
                        })}
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: Platform.OS === 'ios' ? 85 : 70,
        paddingTop: 12,
        alignItems: 'flex-start',
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
        ...Shadows.medium,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: 48,
        zIndex: 2, // Keep icons above the indicator
    },
    indicator: {
        position: 'absolute',
        top: 16, // Matches container paddingTop (12) + small offset to center the 40px height inside the 48px tabItem
        height: 40,
        borderRadius: 20, // Fully rounded vertical edges (half of height 40)
        zIndex: 1, // Stays behind the icons
    },
});
