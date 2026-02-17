import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing } from '@/constants/theme';
import { useOnboarding } from '@/context/OnboardingContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AgeScreen() {
    const { data, updateData } = useOnboarding();
    const [age, setAge] = useState(data.age);
    const router = useRouter();
    const colors = useThemeColor();

    const handleNext = () => {
        const ageNum = parseInt(age, 10);
        if (!isNaN(ageNum) && ageNum > 17 && ageNum < 100) {
            updateData({ age });
            router.push('/(onboarding)/gender');
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <IconSymbol name="chevron.left" size={28} color={colors.text} />
            </TouchableOpacity>

            <View style={styles.content}>
                <Text style={[styles.title, { color: colors.text }]}>How old are you?</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    This helps us personalize your experience.
                </Text>

                <TextInput
                    style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                    placeholder="Age"
                    placeholderTextColor={colors.textSecondary}
                    value={age}
                    onChangeText={setAge}
                    keyboardType="number-pad"
                    maxLength={3}
                    autoFocus
                />

                <View style={{ flex: 1 }} />

                <TouchableOpacity
                    style={[
                        styles.button,
                        {
                            backgroundColor: colors.primary,
                            opacity: (parseInt(age, 10) > 17 && parseInt(age, 10) < 100) ? 1 : 0.5,
                        },
                    ]}
                    onPress={handleNext}
                    disabled={!(parseInt(age, 10) > 17 && parseInt(age, 10) < 100)}>
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
        justifyContent: 'center',
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
    input: {
        fontSize: 24,
        borderBottomWidth: 2,
        paddingVertical: Spacing.s,
        marginBottom: Spacing.xl * 2,
        textAlign: 'center',
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
