import { supabase } from '@/services/supabase';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

export interface OnboardingData {
    name: string;
    age: string;
    gender: 'Male' | 'Female' | 'Other' | null;
    heightFt: string;
    heightIn: string;
    religion: string;
    bio: string;
}

interface OnboardingContextType {
    data: OnboardingData;
    updateData: (updates: Partial<OnboardingData>) => void;
    resetData: () => void;
    submitOnboarding: () => Promise<void>;
    hasCompletedOnboarding: boolean;
    isLoading: boolean;
}

const defaultData: OnboardingData = {
    name: '',
    age: '',
    gender: null,
    heightFt: '',
    heightIn: '',
    religion: '',
    bio: '',
};

const OnboardingContext = createContext<OnboardingContextType>({
    data: defaultData,
    updateData: () => { },
    resetData: () => { },
    submitOnboarding: async () => { },
    hasCompletedOnboarding: false,
    isLoading: true,
});

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
    const { session } = useAuth();
    const [data, setData] = useState<OnboardingData>(defaultData);
    const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (session?.user) {
            checkProfile();
        } else {
            setData(defaultData);
            setHasCompletedOnboarding(false);
            setIsLoading(false);
        }
    }, [session]);

    const checkProfile = async () => {
        try {
            setIsLoading(true);
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session?.user.id)
                .single();

            if (profile) {
                // Profile exists, populate data into context directly from columns
                setData({
                    name: profile.name || '',
                    age: profile.age?.toString() || '',
                    gender: profile.gender as any,
                    heightFt: profile.height_ft?.toString() || '',
                    heightIn: profile.height_in?.toString() || '',
                    religion: profile.religion || '',
                    bio: profile.bio || ''
                });

                setHasCompletedOnboarding(true);
            } else {
                // No profile found, user needs to onboard
                setHasCompletedOnboarding(false);
                // Pre-fill name/email from auth if available
                if (session?.user.user_metadata?.full_name) {
                    setData(prev => ({ ...prev, name: session.user.user_metadata.full_name }));
                }
            }
        } catch (error) {
            console.error('Error checking profile:', error);
            // Default to not completed on error to be safe? Or retry?
            setHasCompletedOnboarding(false);
        } finally {
            setIsLoading(false);
        }
    };

    const updateData = (updates: Partial<OnboardingData>) => {
        setData((prev) => ({ ...prev, ...updates }));
    };

    const resetData = () => {
        setData(defaultData);
        setHasCompletedOnboarding(false);
    };

    const submitOnboarding = async () => {
        if (!session?.user) return;

        try {
            const payload = {
                id: session.user.id,
                name: data.name,
                age: data.age ? parseInt(data.age, 10) : null,
                gender: data.gender,
                height_ft: data.heightFt ? parseInt(data.heightFt, 10) : null,
                height_in: data.heightIn ? parseInt(data.heightIn, 10) : null,
                religion: data.religion || null,
                bio: data.bio || null,
            };

            const { error } = await supabase
                .from('profiles')
                .upsert(payload);

            if (error) throw error;

            setHasCompletedOnboarding(true);
        } catch (error) {
            console.error('Error submitting onboarding:', error);
            throw error;
        }
    };

    return (
        <OnboardingContext.Provider value={{ data, updateData, resetData, submitOnboarding, hasCompletedOnboarding, isLoading }}>
            {children}
        </OnboardingContext.Provider>
    );
}

export const useOnboarding = () => useContext(OnboardingContext);
