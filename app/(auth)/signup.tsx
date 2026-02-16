import { supabase } from '@/services/supabase';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function signUpWithEmail() {
        setLoading(true);
        const { error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) Alert.alert(error.message);
        else Alert.alert('Check your inbox for email verification!');
        setLoading(false);
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Create Account</Text>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
            </View>
            <TouchableOpacity style={styles.button} onPress={signUpWithEmail} disabled={loading}>
                <Text style={styles.buttonText}>{loading ? 'Loading...' : 'Sign Up'}</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
                <Text>Already have an account? </Text>
                <Link href="/(auth)/login" asChild>
                    <TouchableOpacity>
                        <Text style={styles.link}>Sign In</Text>
                    </TouchableOpacity>
                </Link>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    inputContainer: {
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
    },
    button: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    footer: {
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    link: {
        color: '#007AFF',
        fontWeight: 'bold',
    },
});
