import { Colors, Shadows, BorderRadius, Spacing } from '@/constants/theme';
import { supabase } from '@/services/supabase';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, SafeAreaView, ActivityIndicator, Image } from 'react-native';
import { useGoogleAuth } from '../../hooks/useGoogleAuth';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { signInWithGoogle, loading: googleLoading, error: googleError } = useGoogleAuth();

    async function signInWithEmail() {
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
        });

        if (error) Alert.alert('Login Failed', error.message);
        setLoading(false);
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
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
                            <TextInput
                                style={styles.input}
                                placeholder="••••••••"
                                placeholderTextColor={Colors.light.textSecondary}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={signInWithEmail}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={[Colors.light.logoGradient[0], Colors.light.logoGradient[1]]}
                                style={styles.primaryButtonGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.primaryButtonText}>Sign In</Text>
                                )}
                            </LinearGradient>
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
                        <TouchableOpacity
                            style={styles.googleButton}
                            onPress={signInWithGoogle}
                            disabled={googleLoading}
                            activeOpacity={0.7}
                        >
                            {googleLoading ? (
                                <ActivityIndicator color={Colors.light.text} />
                            ) : (
                                <>
                                    <View style={styles.googleIconContainer}>
                                        <Text style={styles.googleIconText}>G</Text>
                                    </View>
                                    <Text style={styles.googleButtonText}>Continue with Google</Text>
                                </>
                            )}
                        </TouchableOpacity>
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
                </View>
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
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: Spacing.xl,
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
    primaryButton: {
        marginTop: Spacing.m,
        borderRadius: BorderRadius.circle,
        overflow: 'hidden',
        ...Shadows.medium,
    },
    primaryButtonGradient: {
        paddingVertical: Spacing.m,
        alignItems: 'center',
        justifyContent: 'center',
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
    googleButton: {
        backgroundColor: Colors.light.card,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: Spacing.l,
        borderRadius: BorderRadius.circle,
        borderWidth: 1,
        borderColor: Colors.light.border,
        width: '100%',
        ...Shadows.soft,
    },
    googleIconContainer: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#4285F4',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    googleIconText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    googleButtonText: {
        color: Colors.light.text,
        fontWeight: '600',
        fontSize: 16,
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
});
