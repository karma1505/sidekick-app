import { supabase } from '@/services/supabase';
import { GOOGLE_WEB_CLIENT_ID } from '@/constants/Config';
import { useEffect, useState } from 'react';
import { Platform, Alert } from 'react-native';

// Dynamically import or handle missing native module for Expo Go safety
let GoogleSignin: any = null;
let statusCodes: any = {};
let isErrorWithCode: any = () => false;

try {
    const GoogleAuth = require('@react-native-google-signin/google-signin');
    GoogleSignin = GoogleAuth.GoogleSignin;
    statusCodes = GoogleAuth.statusCodes;
    isErrorWithCode = GoogleAuth.isErrorWithCode;
} catch (e) {
    console.warn('Native GoogleSignin module not found. Google login will only work in native builds.');
}

export const useGoogleAuth = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (Platform.OS !== 'web' && GoogleSignin) {
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
                const origin = typeof window !== 'undefined' ? window.location.origin : '';
                console.log('Starting Web Google OAuth with origin:', origin);

                const { data, error } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                        redirectTo: origin,
                        queryParams: {
                            access_type: 'offline',
                            prompt: 'consent',
                        },
                    },
                });
                if (error) {
                    console.error('Supabase OAuth Error:', error);
                    throw error;
                }

                if (data?.url) {
                    console.log('Redirecting to Supabase OAuth URL:', data.url);
                    window.location.assign(data.url);
                } else {
                    console.warn('No redirect URL returned from Supabase OAuth');
                }

                return data;
            } else {
                if (!GoogleSignin) {
                    Alert.alert('Native Build Required', 'Google Sign-In is only available in the native APK.');
                    setLoading(false);
                    return null;
                }
                await GoogleSignin.hasPlayServices();
                const userInfo = await GoogleSignin.signIn();

                if (userInfo.data?.idToken) {
                    const { data, error } = await supabase.auth.signInWithIdToken({
                        provider: 'google',
                        token: userInfo.data.idToken,
                    });

                    if (error) throw error;
                    return data;
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
            if (Platform.OS !== 'web' && GoogleSignin) {
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
