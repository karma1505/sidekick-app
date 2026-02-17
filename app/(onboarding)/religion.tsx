import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing } from '@/constants/theme';
import { useOnboarding } from '@/context/OnboardingContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const RELIGIONS = [
    'Agnostic',
    'Atheist',
    'Buddhist',
    'Catholic',
    'Christian',
    'Hindu',
    'Jewish',
    'Muslim',
    'Sikh',
    'Spiritual',
    'Other',
    'Prefer not to say',
];

export default function ReligionScreen() {
    const { data, updateData } = useOnboarding();
    const [selectedReligion, setSelectedReligion] = useState(data.religion);
    const router = useRouter();
    const colors = useThemeColor();

    const handleNext = () => {
        if (selectedReligion) {
            updateData({ religion: selectedReligion });
            router.push('/(onboarding)/bio');
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <IconSymbol name="chevron.left" size={28} color={colors.text} />
            </TouchableOpacity>

            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>What are your beliefs?</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    This helps navigate sensitive topics appropriately.
                </Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {RELIGIONS.map((religion) => (
                    <TouchableOpacity
                        key={religion}
                        style={[
                            styles.option,
                            {
                                borderColor: selectedReligion === religion ? colors.primary : colors.border,
                                backgroundColor: selectedReligion === religion ? colors.primary + '10' : 'transparent',
                            },
                        ]}
                        onPress={() => setSelectedReligion(religion)}>
                        <Text
                            style={[
                                styles.optionText,
                                { color: selectedReligion === religion ? colors.primary : colors.text },
                            ]}>
                            {religion}
                        </Text>
                        {selectedReligion === religion && (
                            <IconSymbol name="checkmark" size={20} color={colors.primary} />
                        )}
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[
                        styles.button,
                        {
                            backgroundColor: colors.primary,
                            opacity: selectedReligion ? 1 : 0.5,
                        },
                    ]}
                    onPress={handleNext}
                    disabled={!selectedReligion}>
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
    header: {
        paddingHorizontal: Spacing.xl,
        paddingBottom: Spacing.m,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: Spacing.s,
    },
    subtitle: {
        fontSize: 16,
        marginBottom: Spacing.m,
    },
    scrollContent: {
        paddingHorizontal: Spacing.xl,
        gap: Spacing.m,
        paddingBottom: 100, // Space for footer
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Spacing.l,
        borderRadius: Spacing.m,
        borderWidth: 1,
    },
    optionText: {
        fontSize: 18,
        fontWeight: '500',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: Spacing.xl,
        backgroundColor: 'transparent',
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.l,
        borderRadius: Spacing.xl,
        gap: Spacing.s,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
