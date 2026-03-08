import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Shadows, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { supabase } from '@/services/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FeedbackScreen() {
    const [feedback, setFeedback] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const colors = useThemeColor();
    const router = useRouter();
    const { session } = useAuth();
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const cardGradientColors = isDark ? ['#1e1e1e', '#2c2c2c'] as const : ['#F3F4F6', '#E5E7EB'] as const;

    const handleSubmit = async () => {
        const content = feedback.trim();
        if (!content) {
            Alert.alert('Empty Message', 'Please enter your feature request before submitting.');
            return;
        }

        if (content.length < 10) {
            Alert.alert('Too Short', 'Please provide a bit more detail (at least 10 characters).');
            return;
        }

        if (content.length > 1000) {
            Alert.alert('Message Too Long', 'Please limit your feedback to 1000 characters.');
            return;
        }

        setIsSubmitting(true);
        try {
            const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
            const response = await fetch(`${apiUrl}/api/v1/feedback/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`,
                },
                body: JSON.stringify({
                    content: content,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('Feedback submission error:', data);
                throw new Error(data.detail || 'Failed to submit feedback');
            }

            Alert.alert(
                'Success!',
                `Thank you for your request! Your feedback has been received.\n\nTicket: ${data.ticket_number}\n\nWe're building Sidekick for you, and your feedback helps us prioritize the right features.`,
                [{ text: 'Great', onPress: () => router.back() }]
            );
        } catch (err: any) {
            console.error('Unexpected feedback error:', err);
            Alert.alert(
                'Submission Failed',
                err.message || 'Could not submit feedback. Please ensure your backend is running and the table exists.'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            {/* Background Gradient */}
            <LinearGradient
                colors={[colors.tint + '30', colors.background] as const}
                style={styles.backgroundGradient}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <IconSymbol name="chevron.left" size={28} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: colors.text }]}>Feature Request</Text>
                    <View style={{ width: 44 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.content}>
                        <Text style={[styles.description, { color: colors.textSecondary }]}>
                            You know what you need better than anyone. Request a feature and help us build the Sidekick you actually want
                        </Text>

                        <TextInput
                            style={[
                                styles.input,
                                {
                                    color: colors.text,
                                    backgroundColor: isDark ? '#252525' : '#F9FAFB',
                                    borderColor: colors.border
                                }
                            ]}
                            placeholder="I wish Sidekick could..."
                            placeholderTextColor={colors.textSecondary}
                            multiline
                            numberOfLines={6}
                            value={feedback}
                            onChangeText={setFeedback}
                            textAlignVertical="top"
                        />

                        <TouchableOpacity
                            style={[
                                styles.submitButton,
                                {
                                    backgroundColor: feedback.trim().length >= 10 ? '#6C5CE7' : (isDark ? '#333' : '#E5E7EB')
                                },
                                isSubmitting && { opacity: 0.7 }
                            ]}
                            onPress={handleSubmit}
                            disabled={isSubmitting || feedback.trim().length < 10}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <Text style={[
                                    styles.submitButtonText,
                                    { color: feedback.trim().length >= 10 ? '#FFF' : (isDark ? '#666' : '#9CA3AF') }
                                ]}>
                                    Submit Request
                                </Text>
                            )}
                        </TouchableOpacity>

                        <Text style={[styles.disclaimer, { color: colors.textSecondary }]}>
                            We read every single request. Thank you for helping us grow!
                        </Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backgroundGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 400,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.m,
        paddingVertical: Spacing.s,
    },
    backButton: {
        padding: Spacing.s,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    scrollContent: {
        padding: Spacing.m,
    },
    content: {
        gap: Spacing.l,
        marginTop: Spacing.m,
    },
    description: {
        fontSize: 16,
        fontWeight: '500',
        lineHeight: 24,
        paddingHorizontal: Spacing.s,
    },
    card: {
        borderRadius: BorderRadius.xl,
        padding: Spacing.m,
        borderWidth: 1,
        ...Shadows.medium,
    },
    input: {
        borderRadius: BorderRadius.m,
        padding: Spacing.m,
        fontSize: 16,
        height: 180,
        borderWidth: 1,
    },
    submitButton: {
        paddingVertical: Spacing.m,
        borderRadius: BorderRadius.circle,
        alignItems: 'center',
        justifyContent: 'center',
        ...Shadows.strong,
    },
    submitButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '700',
    },
    disclaimer: {
        fontSize: 12,
        textAlign: 'center',
        fontStyle: 'italic',
        marginTop: Spacing.s,
    },
});
