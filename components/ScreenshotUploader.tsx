import { BorderRadius, Colors, Shadows, Spacing } from '@/constants/theme';
import Feather from '@expo/vector-icons/Feather';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, Easing, withSequence, withDelay } from 'react-native-reanimated';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useTheme } from '@/context/ThemeContext';


interface ScreenshotUploaderProps {
    onImageSelected: (uris: string[]) => void;
    selectedImages: string[];
    isLoading?: boolean;
    mode?: 'chat' | 'prompts';
}

export default function ScreenshotUploader({ onImageSelected, selectedImages, isLoading = false, mode = 'chat' }: ScreenshotUploaderProps) {
    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            allowsMultipleSelection: mode === 'prompts',
            selectionLimit: mode === 'prompts' ? 3 : 1,
            quality: 1,
        });

        if (!result.canceled) {
            onImageSelected(result.assets.map(asset => asset.uri));
        }
    };

    const colors = useThemeColor();
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const gradientColors = isDark ? ['#1e1e1e', '#2c2c2c'] as const : ['#F3F4F6', '#E5E7EB'] as const;

    // Animation values
    const scanPosition = useSharedValue(0);

    useEffect(() => {
        if (isLoading) {
            scanPosition.value = 0; // Reset
            scanPosition.value = withRepeat(
                withTiming(1, { duration: 2000, easing: Easing.linear }),
                -1, // Infinite repeat
                false // Do not reverse
            );
        } else {
            scanPosition.value = 0;
        }
    }, [isLoading]);

    const animatedScanStyle = useAnimatedStyle(() => {
        // Sweep from top (-60) to bottom (400)
        return {
            transform: [{ translateY: scanPosition.value * 460 - 60 }],
            opacity: isLoading ? 1 : 0,
        };
    });

    return (
        <View style={styles.container}>
            <TouchableOpacity
                onPress={pickImage}
                activeOpacity={0.8}
                style={[styles.uploadAreaContainer, { backgroundColor: colors.card, shadowColor: isDark ? '#000' : '#888' }]}
            >
                {selectedImages.length > 0 ? (
                    <View style={styles.imageContainer}>
                        <Image source={{ uri: selectedImages[0] }} style={styles.image} resizeMode="cover" />
                        {selectedImages.length > 1 && (
                            <View style={styles.badgeContainer}>
                                <Text style={styles.badgeText}>+ {selectedImages.length - 1}</Text>
                            </View>
                        )}

                        {/* Scanning Overlay (only visible when isLoading is true) */}
                        {isLoading && (
                            <View style={StyleSheet.absoluteFillObject}>
                                <View style={[styles.scanOverlayBackground, { backgroundColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.4)' }]} />
                                <Animated.View style={[styles.scanLineContainer, animatedScanStyle]}>
                                    <LinearGradient
                                        colors={[colors.primary + '00', colors.primary, colors.primary + '00']}
                                        style={styles.scanLaserLine}
                                        start={{ x: 0, y: 0.5 }}
                                        end={{ x: 1, y: 0.5 }}
                                    />
                                    <LinearGradient
                                        colors={[colors.primary + '50', colors.primary + '00']}
                                        style={styles.scanLaserGlow}
                                        start={{ x: 0.5, y: 0 }}
                                        end={{ x: 0.5, y: 1 }}
                                    />
                                </Animated.View>
                            </View>
                        )}

                        {!isLoading && (
                            <View style={styles.editOverlay}>
                                <Text style={styles.editText}>Change Screenshot</Text>
                            </View>
                        )}
                    </View>
                ) : (
                    <LinearGradient
                        colors={gradientColors}
                        style={[styles.placeholder, { borderColor: colors.border }]}
                    >
                        <View style={[styles.iconCircle, { backgroundColor: colors.card }]}>
                            <Feather name="upload" size={32} color={colors.secondary} />
                        </View>
                        <Text style={[styles.ctaTitle, { color: colors.text }]}>
                            {mode === 'chat' ? 'Upload Conversation' : 'Upload Profile Screenshots'}
                        </Text>
                        <Text style={[styles.ctaSubtitle, { color: colors.textSecondary }]}>
                            {mode === 'chat' ? 'Select a screenshot to analyze' : 'Select up to 3 screenshots'}
                        </Text>
                    </LinearGradient>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: Spacing.m,
        width: '100%',
        alignItems: 'center',
    },
    uploadAreaContainer: {
        width: '100%',
        aspectRatio: 3 / 4, // Typical phone screenshot aspect ratio
        borderRadius: BorderRadius.xl + 8,
        backgroundColor: '#fff',
        ...Shadows.medium,
        overflow: 'hidden',
    },
    imageContainer: {
        width: '100%',
        height: '100%',
        position: 'relative',
        backgroundColor: '#000',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    editOverlay: {
        position: 'absolute',
        bottom: Spacing.m,
        alignSelf: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: Spacing.m,
        paddingVertical: Spacing.s,
        borderRadius: BorderRadius.circle,
    },
    editText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    badgeContainer: {
        position: 'absolute',
        top: Spacing.m,
        right: Spacing.m,
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: Spacing.s,
        paddingVertical: 4,
        borderRadius: BorderRadius.round,
    },
    badgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    scanOverlayBackground: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 1,
    },
    scanLineContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 2,
    },
    scanLaserLine: {
        height: 3,
        width: '100%',
        ...Shadows.strong, // slight glow
    },
    scanLaserGlow: {
        height: 60,
        width: '100%',
    },
    placeholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.light.border,
        borderRadius: BorderRadius.xl + 8,
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.m,
        ...Shadows.soft,
    },
    ctaTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.light.text,
        marginBottom: 4,
        textAlign: 'center',
    },
    ctaSubtitle: {
        fontSize: 14,
        color: Colors.light.textSecondary,
        textAlign: 'center',
    },
});
