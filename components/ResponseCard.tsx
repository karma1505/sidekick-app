import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Colors, Shadows, Spacing } from '@/constants/theme';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Platform, StyleSheet, Text, ToastAndroid, TouchableOpacity, View } from 'react-native';

interface ResponseCardProps {
    responses: string[];
    isLoading: boolean;
}

const CHAR_INTERVAL_MS = 18;   // speed: ms per character
const CARD_STAGGER_MS = 220;  // delay between each card starting

function useTypewriter(target: string, startDelay: number) {
    const [displayed, setDisplayed] = useState('');
    const [done, setDone] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const indexRef = useRef(0);

    useEffect(() => {
        // Reset when target changes (new responses)
        setDisplayed('');
        setDone(false);
        indexRef.current = 0;

        if (!target) return;

        timeoutRef.current = setTimeout(() => {
            intervalRef.current = setInterval(() => {
                indexRef.current += 1;
                setDisplayed(target.slice(0, indexRef.current));
                if (indexRef.current >= target.length) {
                    clearInterval(intervalRef.current!);
                    setDone(true);
                }
            }, CHAR_INTERVAL_MS);
        }, startDelay);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [target]);

    return { displayed, done };
}

interface SingleCardProps {
    response: string;
    index: number;
    isDark: boolean;
    activeColors: typeof Colors['light'];
}

function SingleCard({ response, index, isDark, activeColors }: SingleCardProps) {
    const startDelay = index * CARD_STAGGER_MS;
    const { displayed, done } = useTypewriter(response, startDelay);

    const copyToClipboard = async () => {
        if (!done) return; // don't copy partial text
        await Clipboard.setStringAsync(response);
        if (Platform.OS === 'android') {
            ToastAndroid.show('Copied to clipboard!', ToastAndroid.SHORT);
        } else {
            Alert.alert('Copied!', 'Response copied to clipboard.');
        }
    };

    return (
        <TouchableOpacity
            style={styles.cardContainer}
            onPress={copyToClipboard}
            activeOpacity={done ? 0.9 : 1}
        >
            <LinearGradient
                colors={isDark ? ['#1e1e1e', '#2c2c2c'] : ['#F3F4F6', '#E5E7EB']}
                style={[styles.card, { borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)' }]}
            >
                <View style={styles.textContainer}>
                    <Text style={[styles.responseText, { color: activeColors.text }]}>
                        {displayed}
                        {!done && (
                            <Text style={[styles.cursor, { color: activeColors.primary }]}>|</Text>
                        )}
                    </Text>
                </View>
                {done && (
                    <View style={styles.actionContainer}>
                        <View style={styles.copyIcon}>
                            <IconSymbol name="doc.on.doc" size={20} color={activeColors.primary} />
                        </View>
                        <Text style={[styles.copyText, { color: activeColors.primary }]}>Tap to copy</Text>
                    </View>
                )}
            </LinearGradient>
        </TouchableOpacity>
    );
}

export default function ResponseCard({ responses, isLoading }: ResponseCardProps) {
    const rawTheme = useColorScheme();
    const isDark = rawTheme === 'dark';
    const activeColors = Colors[isDark ? 'dark' : 'light'];

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
                <SingleCard
                    key={index}
                    response={response}
                    index={index}
                    isDark={isDark}
                    activeColors={activeColors}
                />
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
    cursor: {
        fontWeight: '200',
        fontSize: 18,
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
