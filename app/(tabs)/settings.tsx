import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { useOnboarding } from '@/context/OnboardingContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { supabase } from '@/services/supabase';
import React from 'react';
import { Alert, Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    interpolate,
    interpolateColor,
    useAnimatedStyle,
    useDerivedValue,
    withSpring
} from 'react-native-reanimated';

import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';





interface GenericToggleProps {
    active: boolean;
    onToggle: () => void;
    activeIcon?: React.ReactNode;
    inactiveIcon?: React.ReactNode;
    activeTrackColor?: string;
}

function GenericToggle({ active, onToggle, activeIcon, inactiveIcon, activeTrackColor }: GenericToggleProps) {
    const colors = useThemeColor();
    const progress = useDerivedValue(() => {
        return withSpring(active ? 1 : 0, { damping: 15 });
    });

    const rTrackStyle = useAnimatedStyle(() => {
        const backgroundColor = interpolateColor(
            progress.value,
            [0, 1],
            [colors.border, activeTrackColor || '#1a1a1a']
        );
        return { backgroundColor };
    });

    const rThumbStyle = useAnimatedStyle(() => {
        const translateX = interpolate(progress.value, [0, 1], [0, 20]);
        return {
            transform: [{ translateX }],
        };
    });

    const rActiveIconStyle = useAnimatedStyle(() => {
        return {
            opacity: interpolate(progress.value, [0, 1], [0, 1]),
            transform: [{ scale: interpolate(progress.value, [0, 1], [0, 1]) }],
        };
    });

    const rInactiveIconStyle = useAnimatedStyle(() => {
        return {
            opacity: interpolate(progress.value, [0, 1], [1, 0]),
            transform: [{ scale: interpolate(progress.value, [0, 1], [1, 0]) }],
        };
    });

    return (
        <TouchableOpacity onPress={onToggle} activeOpacity={0.8}>
            <Animated.View style={[styles.switchTrack, rTrackStyle]}>
                <Animated.View style={[styles.switchThumb, rThumbStyle]}>
                    <Animated.View style={[styles.switchIcon, rInactiveIconStyle]}>
                        {inactiveIcon}
                    </Animated.View>
                    <Animated.View style={[styles.switchIcon, rActiveIconStyle]}>
                        {activeIcon}
                    </Animated.View>
                </Animated.View>
            </Animated.View>
        </TouchableOpacity>
    );
}

function ThemeToggle() {
    const { theme, setUserTheme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <GenericToggle
            active={isDark}
            onToggle={() => setUserTheme(isDark ? 'light' : 'dark')}
            activeIcon={<IconSymbol name="moon.fill" size={14} color="#6C5CE7" />}
            inactiveIcon={<IconSymbol name="sun.max.fill" size={14} color="#FDB813" />}
            activeTrackColor="#1a1a1a"
        />
    );
}

export default function SettingsScreen() {
    const colors = useThemeColor();
    const router = useRouter();
    const { theme } = useTheme();
    const { data: onboardingData } = useOnboarding();
    const isDark = theme === 'dark';
    const cardGradientColors = isDark ? ['#1e1e1e', '#2c2c2c'] as const : ['#F3F4F6', '#E5E7EB'] as const;

    const handleSignOut = async () => {
        await supabase.auth.signOut();
    };

    const [isDataConsented, setIsDataConsented] = React.useState(true);

    React.useEffect(() => {
        const checkConsent = async () => {
            const val = await AsyncStorage.getItem('@sidekick_photo_disclosure_accepted');
            setIsDataConsented(val === 'true');
        };
        checkConsent();
    }, []);

    const handleDeleteAccount = async () => {
        Alert.alert(
            'Delete Account',
            'Are you sure you want to delete your account forever? This action cannot be undone and all your data will be permanently deleted.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const { data: { session } } = await supabase.auth.getSession();
                            if (!session?.access_token) {
                                throw new Error('No active session found');
                            }

                            const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
                            const response = await fetch(`${apiUrl}/api/v1/profiles/`, {
                                method: 'DELETE',
                                headers: {
                                    'Authorization': `Bearer ${session.access_token}`
                                }
                            });

                            if (!response.ok) {
                                const errorData = await response.json();
                                throw new Error(errorData.detail || 'Failed to delete account');
                            }

                            await supabase.auth.signOut();
                            Alert.alert('Account Deleted', 'Your account and data have been successfully deleted.');
                        } catch (error: any) {
                            console.error('Error deleting account:', error);
                            Alert.alert('Error', 'Failed to delete account. Please try again or contact support.');
                        }
                    }
                }
            ]
        );
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
                            <View style={styles.iconContainer}>
                                <Image
                                    source={onboardingData.avatarUrl ? { uri: onboardingData.avatarUrl } : require('@/assets/images/avatar.png')}
                                    style={styles.rowImage}
                                />
                            </View>
                            <Text style={[styles.rowText, { color: colors.text }]}>Profile</Text>
                        </View>
                    </TouchableOpacity>
                </LinearGradient>

                <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>Appearance & Privacy</Text>
                <LinearGradient colors={cardGradientColors} style={[styles.section, { borderColor: colors.border, marginBottom: Spacing.m }]}>
                    <View style={[styles.row, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: Spacing.m }]}>
                        <View style={styles.rowContent}>
                            <Text style={[styles.rowText, { color: colors.text }]}>Dark Mode</Text>
                        </View>
                        <ThemeToggle />
                    </View>

                    <View style={[styles.separator, { backgroundColor: colors.border }]} />

                    <View style={[styles.row, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: Spacing.m }]}>
                        <View style={styles.rowContent}>
                            <Text style={[styles.rowText, { color: colors.text }]}>Data Analysis Consent</Text>
                        </View>
                        <GenericToggle
                            active={isDataConsented}
                            onToggle={async () => {
                                if (isDataConsented) {
                                    Alert.alert(
                                        "Revoke Consent",
                                        "By revoking consent, you will be prompted again the next time you try to upload a screenshot for analysis.",
                                        [
                                            { text: "Cancel", style: "cancel" },
                                            {
                                                text: "Revoke",
                                                style: "destructive",
                                                onPress: async () => {
                                                    await AsyncStorage.removeItem('@sidekick_photo_disclosure_accepted');
                                                    setIsDataConsented(false);
                                                    Alert.alert("Consent Revoked", "Your consent has been removed.");
                                                }
                                            }
                                        ]
                                    );
                                } else {
                                    await AsyncStorage.setItem('@sidekick_photo_disclosure_accepted', 'true');
                                    setIsDataConsented(true);
                                }
                            }}
                            activeTrackColor={colors.primary}
                            activeIcon={<IconSymbol name="checkmark" size={12} color={colors.primary} />}
                        />
                    </View>
                </LinearGradient>

                <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>Support & Feedback</Text>
                <LinearGradient colors={cardGradientColors} style={[styles.section, { borderColor: colors.border, marginBottom: Spacing.m }]}>
                    <TouchableOpacity style={styles.row} onPress={() => router.push('/feedback')}>
                        <View style={styles.rowContent}>
                            <Text style={[styles.rowText, { color: colors.text }]}>Feature Request</Text>
                        </View>
                    </TouchableOpacity>

                    <View style={[styles.separator, { backgroundColor: colors.border }]} />

                    <TouchableOpacity style={styles.row} onPress={() => Linking.openURL('mailto:karmanyasingh8@gmail.com')}>
                        <View style={styles.rowContent}>
                            <Text style={[styles.rowText, { color: colors.text }]}>Support Contact</Text>
                        </View>
                    </TouchableOpacity>
                </LinearGradient>

                <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>Legal</Text>
                <LinearGradient colors={cardGradientColors} style={[styles.section, { borderColor: colors.border, marginBottom: Spacing.m }]}>
                    <TouchableOpacity style={styles.row} onPress={() => Linking.openURL('https://sidekick.com/privacy')}>
                        <View style={styles.rowContent}>
                            <Text style={[styles.rowText, { color: colors.text }]}>Privacy Policy</Text>
                        </View>
                    </TouchableOpacity>

                    <View style={[styles.separator, { backgroundColor: colors.border }]} />

                    <TouchableOpacity style={styles.row} onPress={() => Linking.openURL('https://sidekick.com/terms')}>
                        <View style={styles.rowContent}>
                            <Text style={[styles.rowText, { color: colors.text }]}>Terms & Conditions</Text>
                        </View>
                    </TouchableOpacity>
                </LinearGradient>

                <LinearGradient colors={cardGradientColors} style={[styles.section, { borderColor: colors.border, marginBottom: Spacing.m }]}>
                    <TouchableOpacity style={styles.row} onPress={handleSignOut}>
                        <View style={styles.rowContent}>
                            <Text style={[styles.rowText, { color: colors.error }]}>Sign Out</Text>
                        </View>
                    </TouchableOpacity>
                </LinearGradient>

                <LinearGradient colors={cardGradientColors} style={[styles.section, { borderColor: colors.border, marginBottom: Spacing.xl }]}>
                    <TouchableOpacity style={styles.row} onPress={handleDeleteAccount}>
                        <View style={styles.rowContent}>
                            <Text style={[styles.rowText, { color: colors.error }]}>Delete Account</Text>
                        </View>
                    </TouchableOpacity>
                </LinearGradient>

                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: colors.textSecondary }]}>Made with ❤️ by TheRubberDuckDev</Text>
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
        paddingBottom: 100, // Increased to ensure the footer is clearly visible above the floating tab bar
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
    iconContainer: {
        width: 32,
        alignItems: 'center',
        justifyContent: 'center',
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

});
