import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing } from '@/constants/theme';
import { useOnboarding } from '@/context/OnboardingContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BioScreen() {
    const { data, updateData, submitOnboarding } = useOnboarding();
    const [bio, setBio] = useState(data.bio);
    const router = useRouter();
    const colors = useThemeColor();

    const handleFinish = async () => {
        updateData({ bio });
        await submitOnboarding();
        // Navigation is handled by RootLayout based on hasCompletedOnboarding state
        // But we can also force it here if needed, or just let the state change trigger it
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <IconSymbol name="chevron.left" size={28} color={colors.text} />
                </TouchableOpacity>

                <ScrollView contentContainerStyle={styles.content}>
                    <Text style={[styles.title, { color: colors.text }]}>Anything else?</Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        Share any details you want our AI to know about you. This is optional.
                    </Text>

                    <TextInput
                        style={[
                            styles.input,
                            {
                                color: colors.text,
                                borderColor: colors.border,
                                backgroundColor: colors.card
                            }
                        ]}
                        placeholder="I love hiking and reading sci-fi novels..."
                        placeholderTextColor={colors.textSecondary}
                        value={bio}
                        onChangeText={setBio}
                        multiline
                        textAlignVertical="top"
                        numberOfLines={6}
                    />
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.skipButton]}
                        onPress={handleFinish}
                    >
                        <Text style={[styles.skipText, { color: colors.textSecondary }]}>Skip</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: colors.primary }]}
                        onPress={handleFinish}>
                        <Text style={styles.buttonText}>Finish Setup</Text>
                        <IconSymbol name="checkmark" size={20} color="white" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
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
    input: {
        fontSize: 16,
        borderWidth: 1,
        borderRadius: Spacing.m,
        padding: Spacing.m,
        minHeight: 150,
    },
    footer: {
        padding: Spacing.xl,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    skipButton: {
        padding: Spacing.m,
    },
    skipText: {
        fontSize: 16,
        fontWeight: '500',
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.l,
        borderRadius: Spacing.xl,
        gap: Spacing.s,
        paddingHorizontal: Spacing.xl,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
