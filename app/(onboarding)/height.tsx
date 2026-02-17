import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing } from '@/constants/theme';
import { useOnboarding } from '@/context/OnboardingContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HeightScreen() {
    const { data, updateData } = useOnboarding();
    const [ft, setFt] = useState(data.heightFt);
    const [inches, setInches] = useState(data.heightIn);
    const router = useRouter();
    const colors = useThemeColor();

    const handleNext = () => {
        const ftNum = parseInt(ft, 10);
        const inNum = parseInt(inches, 10);

        if (!isNaN(ftNum) && !isNaN(inNum) && ftNum >= 0 && ftNum <= 8 && inNum >= 0 && inNum <= 11) {
            updateData({ heightFt: ft, heightIn: inches });
            router.push('/(onboarding)/religion');
        }
    };

    const isValid = () => {
        const ftNum = parseInt(ft, 10);
        const inNum = parseInt(inches, 10);
        return !isNaN(ftNum) && !isNaN(inNum) && ftNum >= 0 && ftNum <= 8 && inNum >= 0 && inNum <= 11;
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <IconSymbol name="chevron.left" size={28} color={colors.text} />
            </TouchableOpacity>

            <View style={styles.content}>
                <Text style={[styles.title, { color: colors.text }]}>How tall are you?</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    This helps us find better matches for you.
                </Text>

                <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                            placeholder="5"
                            placeholderTextColor={colors.textSecondary}
                            value={ft}
                            onChangeText={setFt}
                            keyboardType="number-pad"
                            maxLength={1}
                            autoFocus
                        />
                        <Text style={[styles.unit, { color: colors.textSecondary }]}>ft</Text>
                    </View>

                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                            placeholder="10"
                            placeholderTextColor={colors.textSecondary}
                            value={inches}
                            onChangeText={setInches}
                            keyboardType="number-pad"
                            maxLength={2}
                        />
                        <Text style={[styles.unit, { color: colors.textSecondary }]}>in</Text>
                    </View>
                </View>

                <View style={{ flex: 1 }} />

                <TouchableOpacity
                    style={[
                        styles.button,
                        {
                            backgroundColor: colors.primary,
                            opacity: isValid() ? 1 : 0.5,
                        },
                    ]}
                    onPress={handleNext}
                    disabled={!isValid()}>
                    <Text style={styles.buttonText}>Continue</Text>
                    <IconSymbol name="arrow.right" size={20} color="white" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backButton: {
        padding: Spacing.m,
    },
    content: {
        flex: 1,
        padding: Spacing.xl,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: Spacing.s,
    },
    subtitle: {
        fontSize: 16,
        marginBottom: Spacing.xl,
    },
    inputContainer: {
        flexDirection: 'row',
        gap: Spacing.xl,
        justifyContent: 'center',
        marginBottom: Spacing.xl * 2,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: Spacing.xs,
    },
    input: {
        fontSize: 32,
        borderBottomWidth: 2,
        paddingVertical: Spacing.s,
        width: 60,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    unit: {
        fontSize: 18,
        fontWeight: '600',
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.l,
        borderRadius: Spacing.xl,
        gap: Spacing.s,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
