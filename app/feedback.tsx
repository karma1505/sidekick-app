import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Shadows, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { supabase } from '@/services/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Pressable,
    ToastAndroid
} from 'react-native';
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut, Easing } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FeedbackScreen() {
    const [feedback, setFeedback] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [submittedTicket, setSubmittedTicket] = useState('');
    const [showToast, setShowToast] = useState(false);

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

            // High-end success flow
            setSubmittedTicket(data.ticket_number);
            setShowSuccessModal(true);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            // Clear input
            setFeedback('');

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

    const copyTicketToClipboard = async () => {
        await Clipboard.setStringAsync(submittedTicket);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        if (Platform.OS === 'android') {
            ToastAndroid.show('Ticket copied to clipboard', ToastAndroid.SHORT);
        } else {
            setShowToast(true);
            setTimeout(() => setShowToast(false), 2000);
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

            {/* Premium Success Modal */}
            <Modal
                transparent
                visible={showSuccessModal}
                animationType="none"
                onRequestClose={() => setShowSuccessModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <Animated.View
                        entering={FadeIn.duration(300)}
                        exiting={FadeOut.duration(200)}
                        style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.6)' }]}
                    >
                        <Pressable style={{ flex: 1 }} onPress={() => { }} />
                    </Animated.View>

                    <Animated.View
                        entering={ZoomIn.duration(400).easing(Easing.out(Easing.quad))}
                        exiting={ZoomOut.duration(200)}
                        style={[
                            styles.modalContent,
                            {
                                backgroundColor: colors.background,
                                borderColor: colors.border
                            }
                        ]}
                    >
                        <LinearGradient
                            colors={[colors.tint + '15', 'transparent'] as const}
                            style={styles.modalGradient}
                        />

                        <View style={[styles.successIconContainer, { backgroundColor: colors.tint + '20' }]}>
                            <IconSymbol name="checkmark.circle.fill" size={48} color={colors.tint} />
                        </View>

                        <Text style={[styles.modalTitle, { color: colors.text }]}>Idea Received!</Text>

                        <Text style={[styles.modalDescription, { color: colors.textSecondary }]}>
                            We've got it! Your request is now in our priority queue. Sidekick gets better because of <Text style={{ fontWeight: '700' }}>you</Text>.
                        </Text>

                        <View style={[styles.ticketSection, { backgroundColor: isDark ? '#222' : '#F3F4F6' }]}>
                            <View>
                                <Text style={[styles.ticketLabel, { color: colors.textSecondary }]}>YOUR TICKET</Text>
                                <Text style={[styles.ticketValue, { color: colors.text }]}>{submittedTicket}</Text>
                            </View>
                            <TouchableOpacity
                                style={[styles.copyButton, { backgroundColor: colors.tint }]}
                                onPress={copyTicketToClipboard}
                                activeOpacity={0.8}
                            >
                                <IconSymbol name="doc.on.doc.fill" size={16} color="#FFF" />
                                <Text style={styles.copyButtonText}>Copy</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={[styles.modalCloseButton, { backgroundColor: colors.text }]}
                            onPress={() => {
                                setShowSuccessModal(false);
                                router.back();
                            }}
                            activeOpacity={0.9}
                        >
                            <Text style={[styles.modalCloseButtonText, { color: colors.background }]}>Done, thanks!</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </Modal>

            {/* Custom Toast for Clipboard */}
            {showToast && (
                <Animated.View
                    entering={FadeIn.duration(300)}
                    exiting={FadeOut.duration(300)}
                    style={[styles.toastContainer, { backgroundColor: colors.text }]}
                >
                    <IconSymbol name="checkmark.circle.fill" size={16} color={colors.background} />
                    <Text style={[styles.toastText, { color: colors.background }]}>Copied to clipboard</Text>
                </Animated.View>
            )}
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
    // Modal Styles
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.l,
    },
    modalContent: {
        width: '100%',
        maxWidth: 400,
        borderRadius: BorderRadius.xl,
        padding: Spacing.xl,
        borderWidth: 1,
        alignItems: 'center',
        overflow: 'hidden',
        ...Shadows.medium,
    },
    modalGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 150,
    },
    successIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.l,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '800',
        marginBottom: Spacing.s,
        textAlign: 'center',
    },
    modalDescription: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: Spacing.xl,
        paddingHorizontal: Spacing.s,
    },
    ticketSection: {
        width: '100%',
        borderRadius: BorderRadius.l,
        padding: Spacing.m,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    ticketLabel: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 2,
    },
    ticketValue: {
        fontSize: 20,
        fontWeight: 'bold',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    copyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: BorderRadius.circle,
        gap: 6,
    },
    copyButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '700',
    },
    modalCloseButton: {
        width: '100%',
        paddingVertical: Spacing.m,
        borderRadius: BorderRadius.circle,
        alignItems: 'center',
        ...Shadows.strong,
    },
    modalCloseButtonText: {
        fontSize: 18,
        fontWeight: '700',
    },
    // Toast Styles
    toastContainer: {
        position: 'absolute',
        bottom: 50,
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: BorderRadius.circle,
        gap: 8,
        ...Shadows.strong,
        zIndex: 1000,
    },
    toastText: {
        fontSize: 14,
        fontWeight: '600',
    },
});
