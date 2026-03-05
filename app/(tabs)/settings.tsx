import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { supabase } from '@/services/supabase';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    interpolate,
    interpolateColor,
    useAnimatedStyle,
    useDerivedValue,
    useSharedValue,
    withSpring
} from 'react-native-reanimated';

import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const APP_ICON_STORAGE_KEY = '@sidekick_app_icon';

const ICONS = [
    { id: 'classic', name: 'Classic', source: require('@/assets/images/icons/classic.png') },
    { id: 'calculator', name: 'Calculator', source: require('@/assets/images/icons/calculator.png') },
    { id: 'calendar', name: 'Calendar', source: require('@/assets/images/icons/calendar.png') },
    { id: 'weather', name: 'Weather', source: require('@/assets/images/icons/weather.png') },
];

function AppIconPicker() {
    const colors = useThemeColor();
    const [selectedIcon, setSelectedIcon] = useState('classic');
    const [isExpanded, setIsExpanded] = useState(false);

    // Reanimated shared values
    const expansion = useSharedValue(0);

    useEffect(() => {
        expansion.value = withSpring(isExpanded ? 1 : 0, {
            damping: 20,
            stiffness: 120,
            mass: 0.8 // Slightly snappier
        });
    }, [isExpanded]);

    useEffect(() => {
        loadSelectedIcon();
    }, []);

    const loadSelectedIcon = async () => {
        try {
            const saved = await AsyncStorage.getItem(APP_ICON_STORAGE_KEY);
            if (saved) setSelectedIcon(saved);
        } catch (e) {
            console.error('Failed to load app icon preference', e);
        }
    };

    const handleSelectIcon = async (iconId: string) => {
        try {
            setSelectedIcon(iconId);
            await AsyncStorage.setItem(APP_ICON_STORAGE_KEY, iconId);

            Alert.alert(
                "Icon Saved",
                "Note: Changing the home screen icon in real-time requires a production build. This choice is saved!",
                [{ text: "OK" }]
            );
        } catch (e) {
            console.error('Failed to save app icon preference', e);
        }
    };

    const rContainerStyle = useAnimatedStyle(() => {
        return {
            height: expansion.value * 120, // Approximate height of the icon row + padding
            opacity: expansion.value,
            marginTop: expansion.value * Spacing.m,
            overflow: 'hidden',
        };
    });

    const rChevronStyle = useAnimatedStyle(() => {
        return {
            transform: [{ rotate: `${expansion.value * 90}deg` }],
        };
    });

    return (
        <View style={styles.iconPickerContainer}>
            <TouchableOpacity
                style={styles.pickerToggle}
                onPress={() => setIsExpanded(!isExpanded)}
                activeOpacity={0.7}
            >
                <View style={styles.rowContent}>
                    <Text style={[styles.rowText, { color: colors.text }]}>App Icon</Text>
                </View>
                <Animated.View style={rChevronStyle}>
                    <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
                </Animated.View>
            </TouchableOpacity>

            <Animated.View style={[styles.iconRowWrapper, rContainerStyle]}>
                <View style={styles.iconRow}>
                    {ICONS.map((icon) => {
                        const isSelected = selectedIcon === icon.id;
                        return (
                            <TouchableOpacity
                                key={icon.id}
                                onPress={() => handleSelectIcon(icon.id)}
                                style={styles.iconItem}
                                activeOpacity={0.7}
                            >
                                <Image source={icon.source} style={[styles.pickerIcon, isSelected && { borderColor: colors.primary, borderWidth: 2 }]} />
                                <Text style={[styles.iconLabel, { color: isSelected ? colors.primary : colors.textSecondary }]}>
                                    {icon.name}
                                </Text>
                                {isSelected && (
                                    <View style={[styles.selectionDot, { backgroundColor: colors.primary }]} />
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </Animated.View>
        </View>
    );
}

function ThemeToggle() {
    const { theme, setUserTheme } = useTheme();
    const isDark = theme === 'dark';
    const colors = useThemeColor();

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
            [colors.border, '#1a1a1a']
        );
        return { backgroundColor };
    });

    const rThumbStyle = useAnimatedStyle(() => {
        const translateX = interpolate(progress.value, [0, 1], [0, 20]);
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
    const colors = useThemeColor();
    const router = useRouter();
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const cardGradientColors = isDark ? ['#1e1e1e', '#2c2c2c'] as const : ['#F3F4F6', '#E5E7EB'] as const;

    const handleSignOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            {/* Background Gradient */}
            <LinearGradient
                colors={[colors.tint + '30', colors.background] as const}
                style={styles.backgroundGradient}
            />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
                </View>
                <LinearGradient colors={cardGradientColors} style={[styles.section, { borderColor: colors.border, marginBottom: Spacing.m }]}>
                    <TouchableOpacity style={styles.row} onPress={() => router.push('/profile')}>
                        <View style={styles.rowContent}>
                            <Image source={require('@/assets/images/avatar.png')} style={styles.rowImage} />
                            <Text style={[styles.rowText, { color: colors.text }]}>Profile</Text>
                        </View>
                    </TouchableOpacity>
                </LinearGradient>

                <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>Appearance</Text>
                <LinearGradient colors={cardGradientColors} style={[styles.section, { borderColor: colors.border, marginBottom: Spacing.m }]}>
                    <View style={[styles.row, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: Spacing.m }]}>
                        <View style={styles.rowContent}>
                            <Text style={[styles.rowText, { color: colors.text }]}>Dark Mode</Text>
                        </View>
                        <ThemeToggle />
                    </View>

                    <View style={[styles.separator, { backgroundColor: colors.border }]} />

                    <AppIconPicker />
                </LinearGradient>

                <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>Legal</Text>
                <LinearGradient colors={cardGradientColors} style={[styles.section, { borderColor: colors.border, marginBottom: Spacing.m }]}>
                    <TouchableOpacity style={styles.row}>
                        <View style={styles.rowContent}>
                            <Text style={[styles.rowText, { color: colors.text }]}>Privacy Policy</Text>
                        </View>
                    </TouchableOpacity>

                    <View style={[styles.separator, { backgroundColor: colors.border }]} />

                    <TouchableOpacity style={styles.row}>
                        <View style={styles.rowContent}>
                            <Text style={[styles.rowText, { color: colors.text }]}>Terms & Conditions</Text>
                        </View>
                    </TouchableOpacity>
                </LinearGradient>

                <LinearGradient colors={cardGradientColors} style={[styles.section, { borderColor: colors.border, marginBottom: Spacing.xl }]}>
                    <TouchableOpacity style={styles.row} onPress={handleSignOut}>
                        <View style={styles.rowContent}>
                            <IconSymbol name="arrow.right.square" size={24} color={colors.error} />
                            <Text style={[styles.rowText, { color: colors.error }]}>Sign Out</Text>
                        </View>
                    </TouchableOpacity>
                </LinearGradient>

                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: colors.textSecondary }]}>Made with ❤️ by Nimbus Technologies Private Limited</Text>
                </View>
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.l,
        marginTop: Spacing.s,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        letterSpacing: -0.5,
        marginBottom: 4,
    },
    rowImage: {
        width: 32,
        height: 32,
        borderRadius: 16,
    },
    section: {
        borderRadius: BorderRadius.m,
        padding: Spacing.s,
        borderWidth: 1,
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
        marginBottom: Spacing.s,
        marginLeft: Spacing.s,
        textTransform: 'uppercase',
    },
    separator: {
        height: 1,
        marginLeft: Spacing.s, // Align with text
    },
    footer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: Spacing.xl,
        paddingBottom: Spacing.xxl,
    },
    footerText: {
        fontSize: 12,
        fontWeight: '500',
        textAlign: 'center',
    },
    iconPickerContainer: {
        // No extra padding here to keep it flush with other rows
    },
    iconRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.xs,
    },
    iconItem: {
        alignItems: 'center',
        gap: 6,
    },
    pickerIcon: {
        width: 60,
        height: 60,
        borderRadius: 14,
    },
    iconLabel: {
        fontSize: 10,
        fontWeight: '600',
    },
    selectionDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginTop: 2,
    },
    pickerToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Spacing.m,
        paddingHorizontal: Spacing.s,
    },
    iconRowWrapper: {
        // Shared animated style handles height/opacity
    }
});
