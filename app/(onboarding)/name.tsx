import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing } from '@/constants/theme';
import { useOnboarding } from '@/context/OnboardingContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NameScreen() {
    const { data, updateData } = useOnboarding();
    const [name, setName] = useState(data.name);
    const router = useRouter();
    const colors = useThemeColor();

    const handleNext = () => {
        console.log('NameScreen: handleNext called', { name });
        if (name.trim()) {
            updateData({ name });
            console.log('NameScreen: Navigating to age...');
            router.push('/(onboarding)/age');
        } else {
            console.log('NameScreen: Name is empty');
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.content}>
                <Text style={[styles.title, { color: colors.text }]}>What's your name?</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    This helps SideKick AI to craft personalized responses.
                </Text>

                <TextInput
                    style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                    placeholder="Enter your name"
                    placeholderTextColor={colors.textSecondary}
                    value={name}
                    onChangeText={setName}
                    autoFocus
                />

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: colors.primary, opacity: name.trim() ? 1 : 0.5 }]}
                    onPress={handleNext}
                    disabled={!name.trim()}>
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
