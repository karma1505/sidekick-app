import { Colors, Shadows, BorderRadius, Spacing } from '@/constants/theme';
import { supabase } from '@/services/supabase';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, SafeAreaView, ActivityIndicator, Image, ScrollView } from 'react-native';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { useAlert } from '@/context/AlertContext';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { GoogleSignInButton } from '@/components/ui/GoogleSignInButton';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { signInWithGoogle, loading: googleLoading, error: googleError } = useGoogleAuth();
    const { showAlert } = useAlert();

    async function signInWithEmail() {
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
        });

        if (error) showAlert('Login Failed', error.message, { type: 'error' });
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
                            <Text style={styles.title}>Welcome back.</Text>
                            <Text style={styles.subtitle}>Sign in to continue into Sidekick.</Text>
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
                                        placeholder="••••••••"
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
                                style={[styles.primaryButton, (!email.includes('@') || password.length < 6 || loading) && styles.buttonDisabled]}
                                onPress={signInWithEmail}
                                disabled={loading || !email.includes('@') || password.length < 6}
                                activeOpacity={0.8}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.primaryButtonText}>Sign In</Text>
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
                        <View style={styles.googleContainer}>
                            <GoogleSignInButton
                                onPress={signInWithGoogle}
                                loading={googleLoading}
                            />
                            {googleError && <Text style={styles.errorText}>{googleError}</Text>}
                        </View>

                        {/* Footer Setup */}
                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Don't have an account? </Text>
                            <Link href="/signup" replace asChild>
                                <TouchableOpacity>
                                    <Text style={styles.link}>Sign Up</Text>
                                </TouchableOpacity>
                            </Link>
                        </View>

                        <View style={styles.legalLinksFooter}>
                            <Text style={styles.footerText}>
                                <Text
                                    style={styles.secondaryLink}
                                    onPress={() => router.push({ pathname: '/legal', params: { type: 'terms' } })}
                                >
                                    Terms of Service
                                </Text>
                                {' '}•{' '}
                                <Text
                                    style={styles.secondaryLink}
                                    onPress={() => router.push({ pathname: '/legal', params: { type: 'privacy' } })}
                                >
                                    Privacy Policy
                                </Text>
                            </Text>
                        </View>

                        <View style={styles.disclosureContainer}>
                            <Text style={styles.disclosureTitle}>Data Analysis Disclosure</Text>
                            <Text style={styles.disclosureText}>
                                Sidekick analyzes your uploaded chat screenshots using secure AI to provide personalized advice. By continuing, you consent to this analysis.
                            </Text>
                        </View>
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
    primaryButtonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
        letterSpacing: 0.5,
    },
    buttonDisabled: {
        opacity: 0.5,
        backgroundColor: Colors.light.textSecondary,
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
        marginTop: Spacing.xxl,
    },
    footerText: {
        color: Colors.light.textSecondary,
        fontSize: 15,
    },
    link: {
        color: Colors.light.primary,
        fontWeight: '700',
        fontSize: 15,
    },
    legalLinksFooter: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: Spacing.m,
    },
    secondaryLink: {
        color: Colors.light.textSecondary,
        fontSize: 13,
        fontWeight: '500',
        textDecorationLine: 'underline',
    },
    disclosureContainer: {
        backgroundColor: Colors.light.primary + '10',
        padding: Spacing.m,
        borderRadius: BorderRadius.m,
        marginTop: Spacing.xl,
        marginBottom: Spacing.xl,
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
