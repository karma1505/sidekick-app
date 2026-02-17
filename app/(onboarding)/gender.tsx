import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing } from '@/constants/theme';
import { useOnboarding } from '@/context/OnboardingContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function GenderScreen() {
    const { data, updateData } = useOnboarding();
    const [selectedGender, setSelectedGender] = useState(data.gender);
    const [customGender, setCustomGender] = useState(data.customGender || '');
    const router = useRouter();
    const colors = useThemeColor();

    const handleNext = () => {
        if (selectedGender) {
            updateData({ gender: selectedGender, customGender: selectedGender === 'Other' ? customGender : '' });
            router.push('/(onboarding)/height');
        }
    };

    const GenderOption = ({ label, value }: { label: string; value: typeof data.gender }) => (
        <TouchableOpacity
            style={[
                styles.option,
                {
                    borderColor: selectedGender === value ? colors.primary : colors.border,
                    backgroundColor: selectedGender === value ? colors.primary + '10' : 'transparent',
                },
            ]}
            onPress={() => setSelectedGender(value)}>
            <Text
                style={[
                    styles.optionText,
                    { color: selectedGender === value ? colors.primary : colors.text },
                ]}>
                {label}
            </Text>
            {selectedGender === value && <IconSymbol name="checkmark" size={20} color={colors.primary} />}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <IconSymbol name="chevron.left" size={28} color={colors.text} />
            </TouchableOpacity>

            <View style={styles.content}>
                <Text style={[styles.title, { color: colors.text }]}>What's your gender?</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    Select the option that best describes you.
                </Text>

                <View style={styles.optionsContainer}>
                    <GenderOption label="Male" value="Male" />
                    <GenderOption label="Female" value="Female" />
                    <GenderOption label="Other" value="Other" />
                </View>

                {selectedGender === 'Other' && (
                    <TextInput
                        style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                        placeholder="Please specify"
                        placeholderTextColor={colors.textSecondary}
                        value={customGender}
                        onChangeText={setCustomGender}
                        autoFocus
                    />
                )}

                <View style={{ flex: 1 }} />

                <TouchableOpacity
                    style={[
                        styles.button,
                        {
                            backgroundColor: colors.primary,
                            opacity: selectedGender ? (selectedGender === 'Other' && !customGender.trim() ? 0.5 : 1) : 0.5,
                        },
                    ]}
                    onPress={handleNext}
                    disabled={!selectedGender || (selectedGender === 'Other' && !customGender.trim())}>
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
    optionsContainer: {
        gap: Spacing.m,
        marginBottom: Spacing.l,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Spacing.l,
        borderRadius: Spacing.m,
        borderWidth: 2,
    },
    optionText: {
        fontSize: 18,
        fontWeight: '600',
    },
    input: {
        fontSize: 18,
        borderBottomWidth: 2,
        paddingVertical: Spacing.s,
        marginBottom: Spacing.xl,
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
