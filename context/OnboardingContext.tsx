import { supabase } from '@/services/supabase';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface OnboardingData {
    name: string;
    age: string;
    gender: 'Male' | 'Female' | 'Other' | null;
    heightFt: string;
    heightIn: string;
    religion: string;
    bio: string;
    avatarUrl: string | null;
}

interface OnboardingContextType {
    data: OnboardingData;
    updateData: (updates: Partial<OnboardingData>) => void;
    resetData: () => void;
    submitOnboarding: (updates?: Partial<OnboardingData>) => Promise<void>;
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
    avatarUrl: null,
};

const OnboardingContext = createContext<OnboardingContextType>({
    data: defaultData,
    updateData: () => { },
    resetData: () => { },
    submitOnboarding: async (updates) => { },
    hasCompletedOnboarding: false,
    isLoading: true,
});

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
    const { session } = useAuth();
    const queryClient = useQueryClient();
    const [data, setData] = useState<OnboardingData>(defaultData);

    // Profile Query
    const { data: profile, isLoading, error: profileError } = useQuery({
        queryKey: ['profile', session?.user?.id],
        queryFn: async () => {
            if (!session?.user) return null;
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .maybeSingle();
            if (error && error.code !== 'PGRST116') throw error;
            return data;
        },
        enabled: !!session?.user,
    });

    // Update local state when profile is fetched
    useEffect(() => {
        if (profile) {
            setData({
                name: profile.name || '',
                age: profile.age?.toString() || '',
                gender: profile.gender as any,
                heightFt: profile.height_ft?.toString() || '',
                heightIn: profile.height_in?.toString() || '',
                religion: profile.religion || '',
                bio: profile.bio || '',
                avatarUrl: profile.avatar_url || null,
            });
        } else if (session?.user) {
            const metadata = session.user.user_metadata;
            const updates: Partial<OnboardingData> = {};

            if (metadata?.full_name && !data.name) {
                updates.name = metadata.full_name;
            }
            if ((metadata?.avatar_url || metadata?.picture) && !data.avatarUrl) {
                updates.avatarUrl = metadata.avatar_url || metadata.picture;
            }

            if (Object.keys(updates).length > 0) {
                setData(prev => ({ ...prev, ...updates }));
            }
        }
    }, [profile, session]);

    const hasCompletedOnboarding = !!profile;

    const updateData = (updates: Partial<OnboardingData>) => {
        setData((prev) => ({ ...prev, ...updates }));
    };

    const resetData = () => {
        setData(defaultData);
    };

    // Profile Mutation
    const onboardingMutation = useMutation({
        mutationFn: async (updates?: Partial<OnboardingData>) => {
            if (!session?.user) return;
            const finalData = { ...data, ...updates };
            const payload = {
                id: session.user.id,
                name: finalData.name,
                age: finalData.age ? parseInt(finalData.age, 10) : null,
                gender: finalData.gender,
                height_ft: finalData.heightFt ? parseInt(finalData.heightFt, 10) : null,
                height_in: finalData.heightIn ? parseInt(finalData.heightIn, 10) : null,
                religion: finalData.religion || null,
                bio: finalData.bio || null,
                avatar_url: finalData.avatarUrl || null,
            };

            const { error } = await supabase
                .from('profiles')
                .upsert(payload);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile', session?.user?.id] });
        },
    });

    const submitOnboarding = async (updates?: Partial<OnboardingData>) => {
        await onboardingMutation.mutateAsync(updates);
    };

    return (
        <OnboardingContext.Provider value={{ data, updateData, resetData, submitOnboarding, hasCompletedOnboarding, isLoading }}>
            {children}
        </OnboardingContext.Provider>
    );
}

export const useOnboarding = () => useContext(OnboardingContext);
