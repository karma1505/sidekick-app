import React, { createContext, useContext, useState } from 'react';

export interface OnboardingData {
    name: string;
    age: string;
    gender: 'Male' | 'Female' | 'Other' | null;
    customGender?: string;
    heightFt: string;
    heightIn: string;
    religion: string;
    bio: string;
}

interface OnboardingContextType {
    data: OnboardingData;
    updateData: (updates: Partial<OnboardingData>) => void;
    resetData: () => void;
    submitOnboarding: () => void;
    hasCompletedOnboarding: boolean;
}

const defaultData: OnboardingData = {
    name: 'Karmanya', // Simulated from Google Auth
    age: '24',        // Simulated from Google Auth
    gender: null,
    customGender: '',
    heightFt: '',
    heightIn: '',
    religion: '',
    bio: '',
};

const OnboardingContext = createContext<OnboardingContextType>({
    data: defaultData,
    updateData: () => { },
    resetData: () => { },
    submitOnboarding: () => { },
    hasCompletedOnboarding: false,
});

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
    const [data, setData] = useState<OnboardingData>(defaultData);
    const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

    const updateData = (updates: Partial<OnboardingData>) => {
        setData((prev) => ({ ...prev, ...updates }));
    };

    const resetData = () => {
        setData(defaultData);
        setHasCompletedOnboarding(false);
    };

    const submitOnboarding = () => {
        const payload = {
            name: data.name,
            age: parseInt(data.age, 10),
            gender: data.gender,
            gender_specification: data.gender === 'Other' ? data.customGender : null,
            height: {
                ft: parseInt(data.heightFt, 10),
                in: parseInt(data.heightIn, 10),
            },
            religion: data.religion,
            personal_details: data.bio || null,
        };
        console.log('Onboarding Payload:', JSON.stringify(payload, null, 2));
        setHasCompletedOnboarding(true);
    };

    return (
        <OnboardingContext.Provider value={{ data, updateData, resetData, submitOnboarding, hasCompletedOnboarding }}>
            {children}
        </OnboardingContext.Provider>
    );
}

export const useOnboarding = () => useContext(OnboardingContext);
