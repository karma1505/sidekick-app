import { BorderRadius, Colors, Shadows, Spacing } from '@/constants/theme';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export type Tone = 'flirty' | 'funny' | 'thoughtful' | 'casual' | 'bold';

interface ToneSelectorProps {
    selectedTone: Tone;
    onSelectTone: (tone: Tone) => void;
}

const TONES: { id: Tone; label: string }[] = [
    { id: 'flirty', label: 'Flirty' },
    { id: 'funny', label: 'Funny' },
    { id: 'thoughtful', label: 'Thoughtful' },
    { id: 'casual', label: 'Casual' },
    { id: 'bold', label: 'Bold' },
];

export default function ToneSelector({ selectedTone, onSelectTone }: ToneSelectorProps) {

    const handlePress = (tone: Tone) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onSelectTone(tone);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Choose the Vibe</Text>
            <View style={styles.scrollContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {TONES.map((tone) => {
                        const isSelected = selectedTone === tone.id;
                        return (
                            <TouchableOpacity
                                key={tone.id}
                                style={[
                                    styles.toneButton,
                                    isSelected && styles.selectedToneButton,
                                ]}
                                onPress={() => handlePress(tone.id)}
                                activeOpacity={0.7}
                            >

                                <Text
                                    style={[
                                        styles.toneLabel,
                                        isSelected && styles.selectedToneLabel,
                                    ]}
                                >
                                    {tone.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
                <LinearGradient
                    colors={[Colors.light.background, 'transparent']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.fadeLeft}
                    pointerEvents="none"
                />
                <LinearGradient
                    colors={['transparent', Colors.light.background]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.fadeRight}
                    pointerEvents="none"
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: Spacing.s,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.light.textSecondary,
        marginBottom: Spacing.s,
        marginLeft: Spacing.xs,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    scrollContainer: {
        position: 'relative',
    },
    scrollContent: {
        gap: Spacing.s,
        paddingHorizontal: Spacing.m,
        paddingBottom: Spacing.s,
    },
    fadeLeft: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: Spacing.s, // Avoid covering shadow
        width: 32,
        height: '100%',
        zIndex: 1,
    },
    fadeRight: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: Spacing.s,
        width: 32,
        height: '100%',
        zIndex: 1,
    },
    toneButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.s,
        paddingHorizontal: Spacing.m,
        borderRadius: BorderRadius.circle,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: Colors.light.border,
        ...Shadows.soft,
    },
    selectedToneButton: {
        backgroundColor: Colors.light.primary,
        borderColor: Colors.light.primary,
        ...Shadows.medium,
        shadowColor: Colors.light.primary, // Colored shadow
    },

    toneLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.light.text,
    },
    selectedToneLabel: {
        color: '#fff',
    },
});
