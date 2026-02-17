import { Stack } from 'expo-router';
import React from 'react';

export default function OnboardingLayout() {
    return (
        <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
            <Stack.Screen name="gender" />
            <Stack.Screen name="height" />
            <Stack.Screen name="religion" />
            <Stack.Screen name="bio" />
        </Stack>
    );
}
