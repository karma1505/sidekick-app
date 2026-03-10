import { Colors, Shadows, BorderRadius, Spacing } from '@/constants/theme';
import { supabase } from '@/services/supabase';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, SafeAreaView, ActivityIndicator, Image, Linking, ScrollView } from 'react-native';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { GoogleSignInButton } from '@/components/ui/GoogleSignInButton';

export default function SignupScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isLegalAccepted, setIsLegalAccepted] = useState(false);
    const router = useRouter();
    const { signInWithGoogle, loading: googleLoading, error: googleError } = useGoogleAuth();

    async function signUpWithEmail() {
        if (!isLegalAccepted) {
            Alert.alert('Terms of Service', 'Please read and accept the Terms and Conditions and Privacy Policy to continue.');
            return;
        }
        setLoading(true);
        const { error } = await supabase.auth.signUp({
            email: email.trim(),
            password,
        });

        if (error) {
            Alert.alert('Signup Failed', error.message);
        } else {
            Alert.alert('Success!', 'Check your inbox for email verification!');
            router.replace('/(auth)/login');
        }
        setLoading(false);
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.container}>
                        {/* Header Section */}
                        <View style={styles.header}>
                            <Image
                                source={require('@/assets/images/logo.png')}
                                style={styles.logoImage}
                                resizeMode="contain"
                            />
                            <Text style={styles.title}>Create Account.</Text>
                            <Text style={styles.subtitle}>Join Sidekick to get started.</Text>
                        </View>

                        {/* Email/Password Block */}
                        <View style={styles.formContainer}>
                            <View style={styles.inputWrapper}>
                                <Text style={styles.inputLabel}>Email Address</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="you@example.com"
                                    placeholderTextColor={Colors.light.textSecondary}
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                />
                            </View>

                            <View style={styles.inputWrapper}>
                                <Text style={styles.inputLabel}>Password</Text>
                                <View style={styles.passwordContainer}>
                                    <TextInput
                                        style={styles.passwordInput}
                                        placeholder="Create a secure password"
                                        placeholderTextColor={Colors.light.textSecondary}
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry={!showPassword}
                                    />
                                    <TouchableOpacity
                                        style={styles.eyeIcon}
                                        onPress={() => setShowPassword(!showPassword)}
                                        activeOpacity={0.7}
                                    >
                                        <IconSymbol
                                            name={showPassword ? 'eye.slash' : 'eye'}
                                            size={20}
                                            color={Colors.light.textSecondary}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={[styles.primaryButton, (!isLegalAccepted || loading) && styles.buttonDisabled]}
                                onPress={signUpWithEmail}
                                disabled={loading || !isLegalAccepted}
                                activeOpacity={0.8}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.primaryButtonText}>Sign Up</Text>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Divider */}
                        <View style={styles.dividerContainer}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>OR</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        {/* Google Auth Block */}
                        <View>
                            <GoogleSignInButton
                                onPress={() => isLegalAccepted ? signInWithGoogle() : Alert.alert('Terms of Service', 'Please read and accept the Terms and Conditions and Privacy Policy to continue.')}
                                loading={googleLoading}
                                disabled={!isLegalAccepted}
                            />
                            {googleError && <Text style={styles.errorText}>{googleError}</Text>}
                        </View>

                        <TouchableOpacity
                            style={styles.checkboxContainer}
                            onPress={() => setIsLegalAccepted(!isLegalAccepted)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.checkbox, isLegalAccepted && styles.checkboxChecked]}>
                                {isLegalAccepted && <IconSymbol name="checkmark" size={12} color={Colors.light.primary} />}
                            </View>
                            <View style={styles.checkboxTextContainer}>
                                <Text style={styles.footerText}>I have read and agree to the </Text>
                                <TouchableOpacity onPress={() => Linking.openURL('https://sidekick.com/terms')}>
                                    <Text style={styles.link}>Terms</Text>
                                </TouchableOpacity>
                                <Text style={styles.footerText}> and </Text>
                                <TouchableOpacity onPress={() => Linking.openURL('https://sidekick.com/privacy')}>
                                    <Text style={styles.link}>Privacy Policy</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Already have an account? </Text>
                            <Link href="/(auth)/login" replace asChild>
                                <TouchableOpacity>
                                    <Text style={styles.link}>Sign In</Text>
                                </TouchableOpacity>
                            </Link>
                        </View>

                        <View style={styles.disclosureContainer}>
                            <Text style={styles.disclosureTitle}>Data Analysis Disclosure</Text>
                            <Text style={styles.disclosureText}>
                                Sidekick analyzes your uploaded chat screenshots using secure AI to provide personalized advice. By continuing, you consent to this analysis. You can manage this in Settings at any time.
                            </Text>
                        </View>

                        {/* Footer Setup */}

                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: Spacing.xl,
    },
    container: {
        flex: 1,
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.xxl,
    },
    header: {
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    logoImage: {
        width: 84,
        height: 84,
        marginBottom: Spacing.s,
        borderRadius: BorderRadius.xl,
        overflow: 'hidden',
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: Colors.light.text,
        marginBottom: Spacing.xs,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.light.textSecondary,
        fontWeight: '500',
    },
    formContainer: {
        gap: Spacing.m,
    },
    inputWrapper: {
        gap: Spacing.xs,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.light.text,
        marginLeft: Spacing.xs,
    },
    input: {
        backgroundColor: Colors.light.card,
        borderWidth: 1,
        borderColor: Colors.light.border,
        padding: Spacing.m,
        borderRadius: BorderRadius.l,
        fontSize: 16,
        color: Colors.light.text,
        ...Shadows.soft,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.light.card,
        borderWidth: 1,
        borderColor: Colors.light.border,
        borderRadius: BorderRadius.l,
        ...Shadows.soft,
    },
    passwordInput: {
        flex: 1,
        padding: Spacing.m,
        fontSize: 16,
        color: Colors.light.text,
    },
    eyeIcon: {
        padding: Spacing.m,
    },
    primaryButton: {
        marginTop: Spacing.m,
        borderRadius: BorderRadius.circle,
        backgroundColor: Colors.light.primary,
        paddingVertical: Spacing.m,
        alignItems: 'center',
        justifyContent: 'center',
        ...Shadows.medium,
    },
    buttonDisabled: {
        opacity: 0.5,
        backgroundColor: Colors.light.textSecondary,
    },
    primaryButtonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
        letterSpacing: 0.5,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: Spacing.xl,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: Colors.light.border,
    },
    dividerText: {
        marginHorizontal: Spacing.m,
        color: Colors.light.textSecondary,
        fontWeight: '600',
        fontSize: 12,
    },
    googleContainer: {
        width: '100%',
        alignItems: 'center',
    },
    errorText: {
        color: Colors.light.error,
        marginTop: Spacing.m,
        fontSize: 14,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: Spacing.xl,
        marginBottom: Spacing.xxl,
    },
    footerText: {
        color: Colors.light.textSecondary,
        fontSize: 14,
    },
    link: {
        color: Colors.light.primary,
        fontWeight: '700',
        fontSize: 14,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: Spacing.xl,
        paddingHorizontal: Spacing.xs,
        gap: Spacing.s,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: Colors.light.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 2,
    },
    checkboxChecked: {
        // No filled background, just the tick
    },
    checkboxTextContainer: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    disclosureContainer: {
        backgroundColor: Colors.light.primary + '10',
        padding: Spacing.m,
        borderRadius: BorderRadius.m,
        marginTop: Spacing.xl,
        borderWidth: 1,
        borderColor: Colors.light.primary + '20',
    },
    disclosureTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.light.primary,
        marginBottom: 4,
    },
    disclosureText: {
        fontSize: 12,
        lineHeight: 18,
        color: Colors.light.textSecondary,
    },
});
