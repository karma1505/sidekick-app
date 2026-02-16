import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { supabase } from '@/services/supabase';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { interpolate, interpolateColor, useAnimatedStyle, useDerivedValue, withSpring } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

function ThemeToggle() {
    const { theme, setUserTheme, textSize, setTextSize } = useTheme();
    const isDark = theme === 'dark';

    const toggleTheme = () => {
        setUserTheme(isDark ? 'light' : 'dark');
    };

    const progress = useDerivedValue(() => {
        return withSpring(isDark ? 1 : 0, { damping: 15 });
    });

    const rTrackStyle = useAnimatedStyle(() => {
        const backgroundColor = interpolateColor(
            progress.value,
            [0, 1],
            [Colors.light.border, '#1a1a1a']
        );
        return { backgroundColor };
    });

    const rThumbStyle = useAnimatedStyle(() => {
        const translateX = interpolate(progress.value, [0, 1], [2, 22]);
        return {
            transform: [{ translateX }],
        };
    });

    const rSunStyle = useAnimatedStyle(() => {
        return {
            opacity: interpolate(progress.value, [0, 1], [1, 0]),
            transform: [{ scale: interpolate(progress.value, [0, 1], [1, 0]) }],
        };
    });

    const rMoonStyle = useAnimatedStyle(() => {
        return {
            opacity: interpolate(progress.value, [0, 1], [0, 1]),
            transform: [{ scale: interpolate(progress.value, [0, 1], [0, 1]) }],
        };
    });

    return (
        <TouchableOpacity onPress={toggleTheme} activeOpacity={0.8}>
            <Animated.View style={[styles.switchTrack, rTrackStyle]}>
                <Animated.View style={[styles.switchThumb, rThumbStyle]}>
                    <Animated.View style={[styles.switchIcon, rSunStyle]}>
                        <IconSymbol name="sun.max.fill" size={14} color="#FDB813" />
                    </Animated.View>
                    <Animated.View style={[styles.switchIcon, rMoonStyle]}>
                        <IconSymbol name="moon.fill" size={14} color="#6C5CE7" />
                    </Animated.View>
                </Animated.View>
            </Animated.View>
        </TouchableOpacity>
    );
}

export default function SettingsScreen() {
    const { textSize, setTextSize } = useTheme();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Settings</Text>
            </View>

            <Text style={styles.sectionHeader}>Appearance</Text>
            <View style={[styles.section, { marginBottom: Spacing.m }]}>
                <View style={[styles.row, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: Spacing.m }]}>
                    <View style={styles.rowContent}>
                        <Text style={styles.rowText}>Dark Mode</Text>
                    </View>
                    <ThemeToggle />
                </View>

                <View style={styles.separator} />

                <TouchableOpacity style={styles.row}>
                    <View style={styles.rowContent}>
                        <Text style={styles.rowText}>App Icon</Text>
                    </View>
                </TouchableOpacity>
            </View>

            <View style={[styles.section, { marginBottom: Spacing.m }]}>
                <TouchableOpacity style={styles.row}>
                    <View style={styles.rowContent}>
                        <Image source={require('@/assets/images/avatar.png')} style={styles.rowImage} />
                        <Text style={styles.rowText}>Profile</Text>
                    </View>
                </TouchableOpacity>
            </View>

            <View style={styles.section}>
                <TouchableOpacity style={styles.row} onPress={handleSignOut}>
                    <View style={styles.rowContent}>
                        <IconSymbol name="arrow.right.square" size={24} color={Colors.light.error} />
                        <Text style={[styles.rowText, { color: Colors.light.error }]}>Sign Out</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
        padding: Spacing.m,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.l,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.light.text,
    },
    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    rowImage: {
        width: 32,
        height: 32,
        borderRadius: 16,
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: BorderRadius.m,
        padding: Spacing.s,
        // shadowing
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    row: {
        paddingVertical: Spacing.m,
        paddingHorizontal: Spacing.s,
    },
    rowContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.m,
    },
    rowText: {
        fontSize: 16,
        fontWeight: '500',
    },
    switchTrack: {
        width: 50,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
    },
    switchThumb: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2.5,
        elevation: 2,
    },
    switchIcon: {
        position: 'absolute',
    },
    sectionHeader: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.light.textSecondary,
        marginBottom: Spacing.s,
        marginLeft: Spacing.s,
        textTransform: 'uppercase',
    },
    separator: {
        height: 1,
        backgroundColor: Colors.light.border,
        marginLeft: Spacing.s, // Align with text
    },
});
