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

            // Google provides full_name, name, or names
            const googleName = metadata?.full_name || metadata?.name || '';
            // Google provides avatar_url, picture, or photo
            const googleAvatar = metadata?.avatar_url || metadata?.picture || null;

            if (googleName && !data.name) {
                updates.name = googleName;
            }
            if (googleAvatar && !data.avatarUrl) {
                updates.avatarUrl = googleAvatar;
            }

            if (Object.keys(updates).length > 0) {
                setData(prev => ({ ...prev, ...updates }));

                // Proactively save basic Google info to DB if profile is missing
                const saveGoogleInfo = async () => {
                    const payload: any = {
                        id: session.user.id,
                        name: googleName,
                        avatar_url: googleAvatar,
                    };
                    const { error } = await supabase.from('profiles').upsert(payload);
                    
                    if (error && error.message?.includes("avatar_url")) {
                        console.warn('OnboardingProvider: Auto-save avatar_url failed, retrying without it...');
                        delete payload.avatar_url;
                        await supabase.from('profiles').upsert(payload);
                    }
                };
                saveGoogleInfo();
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

            console.log('OnboardingProvider: Sending profile payload:', payload);

            let { error } = await supabase
                .from('profiles')
                .upsert(payload);

            // Fallback for missing avatar_url column
            if (error && error.message?.includes("avatar_url")) {
                console.warn('OnboardingProvider: avatar_url column missing, retrying without it...');
                const { avatar_url, ...safePayload } = payload;
                const { error: retryError } = await supabase
                    .from('profiles')
                    .upsert(safePayload);
                error = retryError;
            }

            if (error) {
                console.error('OnboardingProvider: Upsert error detail:', error);
                throw error;
            }
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
