// import { GoogleSignin, isErrorWithCode, statusCodes } from '@react-native-google-signin/google-signin';

// Mocking GoogleSignin for Expo Go MVP testing to prevent native module crash
const GoogleSignin = {
    configure: (options?: any) => { },
    hasPlayServices: async () => true,
    signIn: async () => ({ data: { idToken: 'mock-token' } }),
    signOut: async () => { },
};
const isErrorWithCode = (error: any) => false;
const statusCodes = {
    SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
    IN_PROGRESS: 'IN_PROGRESS',
    PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
};
import { supabase } from '@/services/supabase';
import { GOOGLE_WEB_CLIENT_ID } from '@/constants/Config';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

export const useGoogleAuth = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (Platform.OS !== 'web') {
            try {
                GoogleSignin.configure({
                    webClientId: GOOGLE_WEB_CLIENT_ID,
                    scopes: ['profile', 'email'],
                    offlineAccess: true, // required for supabase to get id_token
                });
            } catch (e) {
                console.error("GoogleSignin configure error", e);
            }
        }
    }, []);

    const signInWithGoogle = async () => {
        setLoading(true);
        setError(null);
        try {
            if (Platform.OS === 'web') {
                const { data, error } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                        redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
                        queryParams: {
                            access_type: 'offline',
                            prompt: 'consent',
                        },
                    },
                });
                if (error) throw error;
                // Web acts as a redirect, so we might not return data immediately here same as native
                return data;
            } else {
                await GoogleSignin.hasPlayServices();
                const userInfo = await GoogleSignin.signIn();

                if (userInfo.data?.idToken) {
                    if (userInfo.data.idToken === 'mock-token') {
                        // MVP Expo Go Bypass: Supabase rejects the mock token, 
                        // so we bypass the actual sign-in and just signInAnonymously if allowed, 
                        // or just sign in with a test email account you can make
                        const { data, error } = await supabase.auth.signInAnonymously();

                        if (error) {
                            console.warn("Anonymous sign fails, attempting generic mock email login...");
                            // Fallback if anon login disabled
                            const { data: fbData, error: fbErr } = await supabase.auth.signInWithPassword({
                                email: 'test@example.com',
                                password: 'password123'
                            });
                            if (fbErr) throw fbErr;
                            return fbData;
                        }
                        return data;
                    } else {
                        const { data, error } = await supabase.auth.signInWithIdToken({
                            provider: 'google',
                            token: userInfo.data.idToken,
                        });

                        if (error) throw error;
                        return data;
                    }
                } else {
                    throw new Error('No ID token present!');
                }
            }

        } catch (error: any) {
            if (Platform.OS !== 'web' && isErrorWithCode(error)) {
                switch (error.code) {
                    case statusCodes.SIGN_IN_CANCELLED:
                        // user cancelled the login flow
                        break;
                    case statusCodes.IN_PROGRESS:
                        // operation (e.g. sign in) is in progress already
                        break;
                    case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
                        // play services not available or outdated
                        setError('Google Play Services not available');
                        break;
                    default:
                        // some other error happened
                        setError(error.message);
                }
            } else {
                // an error that's not related to google sign in occurred
                setError(error.message);
            }
            console.error('Google Sign-In Error:', error);
            return null;

        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        try {
            if (Platform.OS !== 'web') {
                await GoogleSignin.signOut();
            }
            await supabase.auth.signOut();
        } catch (error) {
            console.error(error);
        }
    };

    return {
        signInWithGoogle,
        signOut,
        loading,
        error
    };
};
