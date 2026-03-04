import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Colors, Shadows, Spacing } from '@/constants/theme';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { ActivityIndicator, Alert, Platform, StyleSheet, Text, ToastAndroid, TouchableOpacity, View } from 'react-native';

interface ResponseCardProps {
    responses: string[];
    isLoading: boolean;
}

export default function ResponseCard({ responses, isLoading }: ResponseCardProps) {
    const rawTheme = useColorScheme();
    const isDark = rawTheme === 'dark';
    const activeColors = Colors[isDark ? 'dark' : 'light'];

    const copyToClipboard = async (text: string) => {
        await Clipboard.setStringAsync(text);
        if (Platform.OS === 'android') {
            ToastAndroid.show('Copied to clipboard!', ToastAndroid.SHORT);
        } else {
            Alert.alert('Copied!', 'Response copied to clipboard.');
        }
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={activeColors.primary} />
                <Text style={[styles.loadingText, { color: activeColors.textSecondary }]}>Brewing the perfect reply...</Text>
            </View>
        );
    }

    if (responses.length === 0) return null;

    return (
        <View style={styles.container}>
            <Text style={[styles.header, { color: activeColors.text }]}>Your Magic Responses</Text>
            {responses.map((response, index) => (
                <TouchableOpacity
                    key={index}
                    style={styles.cardContainer}
                    onPress={() => copyToClipboard(response)}
                    activeOpacity={0.9}
                >
                    <LinearGradient
                        colors={isDark ? ['#1f2937', '#111827'] : ['#ffffff', '#fcfcfc']}
                        style={[styles.card, { borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}
                    >
                        <View style={styles.textContainer}>
                            <Text style={[styles.responseText, { color: activeColors.text }]}>{response}</Text>
                        </View>
                        <View style={styles.actionContainer}>
                            <View style={styles.copyIcon}>
                                <IconSymbol name="doc.on.doc" size={20} color={activeColors.primary} />
                            </View>
                            <Text style={[styles.copyText, { color: activeColors.primary }]}>Tap to copy</Text>
                        </View>
                    </LinearGradient>
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginTop: Spacing.l,
        gap: Spacing.m,
    },
    loadingContainer: {
        padding: Spacing.xl,
        alignItems: 'center',
        gap: Spacing.m,
    },
    loadingText: {
        fontSize: 16,
        fontWeight: '500',
    },
    header: {
        fontSize: 18,
        fontWeight: '700',
        marginLeft: Spacing.xs,
        marginBottom: Spacing.xs,
    },
    cardContainer: {
        borderRadius: BorderRadius.xl,
        ...Shadows.medium,
        backgroundColor: 'transparent',
    },
    card: {
        borderRadius: BorderRadius.xl,
        padding: Spacing.l,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    textContainer: {
        marginBottom: Spacing.m,
    },
    responseText: {
        fontSize: 16,
        lineHeight: 24,
        fontWeight: '500',
    },
    actionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-end',
        opacity: 0.8,
    },
    copyIcon: {
        marginRight: 6,
    },
    copyText: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
});
