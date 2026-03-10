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
    const [day, setDay] = useState('');
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');
    
    const router = useRouter();
    const colors = useThemeColor();

    const calculateAge = (d: string, m: string, y: string) => {
        const birthDate = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const isValid = () => {
        const d = parseInt(day);
        const m = parseInt(month);
        const y = parseInt(year);
        if (isNaN(d) || isNaN(m) || isNaN(y)) return false;
        if (m < 1 || m > 12) return false;
        if (d < 1 || d > 31) return false;
        if (y < 1920 || y > new Date().getFullYear()) return false;
        
        const age = calculateAge(day, month, year);
        return age >= 16 && age < 100;
    };

    const handleNext = () => {
        if (isValid()) {
            const ageNum = calculateAge(day, month, year);
            updateData({ age: ageNum.toString() });
            router.push('/(onboarding)/gender');
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <IconSymbol name="chevron.left" size={28} color={colors.text} />
            </TouchableOpacity>

            <View style={styles.content}>
                <Text style={[styles.title, { color: colors.text }]}>When's your birthday?</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    You must be at least 16 years old to use SideKick AI.
                </Text>

                <View style={styles.dobContainer}>
                    <View style={styles.inputWrapper}>
                        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>DD</Text>
                        <TextInput
                            style={[styles.dobInput, { color: colors.text, borderColor: colors.border }]}
                            placeholder="01"
                            placeholderTextColor={colors.textSecondary}
                            value={day}
                            onChangeText={setDay}
                            keyboardType="number-pad"
                            maxLength={2}
                        />
                    </View>
                    <View style={styles.inputWrapper}>
                        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>MM</Text>
                        <TextInput
                            style={[styles.dobInput, { color: colors.text, borderColor: colors.border }]}
                            placeholder="01"
                            placeholderTextColor={colors.textSecondary}
                            value={month}
                            onChangeText={setMonth}
                            keyboardType="number-pad"
                            maxLength={2}
                        />
                    </View>
                    <View style={styles.inputWrapper}>
                        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>YYYY</Text>
                        <TextInput
                            style={[styles.dobInput, { color: colors.text, borderColor: colors.border, width: 100 }]}
                            placeholder="2000"
                            placeholderTextColor={colors.textSecondary}
                            value={year}
                            onChangeText={setYear}
                            keyboardType="number-pad"
                            maxLength={4}
                        />
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
                    <Text style={styles.buttonText}>Confirm Age</Text>
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
    dobContainer: {
        flexDirection: 'row',
        gap: Spacing.m,
        justifyContent: 'center',
        marginTop: Spacing.l,
    },
    inputWrapper: {
        alignItems: 'center',
        gap: Spacing.xs,
    },
    inputLabel: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    dobInput: {
        fontSize: 24,
        borderBottomWidth: 2,
        paddingVertical: Spacing.s,
        width: 60,
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
