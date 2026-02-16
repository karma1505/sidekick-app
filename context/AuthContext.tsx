import { Session } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState } from 'react';

type AuthContextType = {
    session: Session | null;
    isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({
    session: null,
    isLoading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // MOCK AUTH SESSION FOR DEVELOPMENT
        // This allows bypassing the login screen
        const mockSession = {
            access_token: 'mock-token',
            token_type: 'bearer',
            expires_in: 3600,
            refresh_token: 'mock-refresh-token',
            user: {
                id: 'mock-user-id',
                aud: 'authenticated',
                role: 'authenticated',
                email: 'dev@sidekick.app',
                email_confirmed_at: new Date().toISOString(),
                phone: '',
                confirmed_at: new Date().toISOString(),
                last_sign_in_at: new Date().toISOString(),
                app_metadata: { provider: 'email', providers: ['email'] },
                user_metadata: {},
                identities: [],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            },
        } as Session;

        setSession(mockSession);
        setIsLoading(false);

        /*
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setIsLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setIsLoading(false);
        });

        return () => subscription.unsubscribe();
        */
    }, []);

    return (
        <AuthContext.Provider value={{ session, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};
