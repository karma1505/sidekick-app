import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { ColorSchemeName, useColorScheme as useDeviceColorScheme } from 'react-native';

type Theme = 'light' | 'dark' | 'system';
export type TextSize = 'small' | 'medium' | 'large';

interface ThemeContextType {
    theme: Theme;
    userTheme: Theme;
    setUserTheme: (theme: Theme) => void;
    textSize: TextSize;
    setTextSize: (size: TextSize) => void;
    isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
    theme: 'light',
    userTheme: 'system',
    setUserTheme: () => { },
    textSize: 'medium',
    setTextSize: () => { },
    isLoading: true,
});

const THEME_STORAGE_KEY = 'user_theme_preference';
const TEXT_SIZE_STORAGE_KEY = 'user_text_size_preference';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const deviceColorScheme = useDeviceColorScheme();
    const [userTheme, setUserThemeState] = useState<Theme>('system');
    const [textSize, setTextSizeState] = useState<TextSize>('medium');
    const [isLoading, setIsLoading] = useState(true);

    // Load saved preferences
    useEffect(() => {
        const loadPreferences = async () => {
            try {
                const [savedTheme, savedTextSize] = await Promise.all([
                    AsyncStorage.getItem(THEME_STORAGE_KEY),
                    AsyncStorage.getItem(TEXT_SIZE_STORAGE_KEY),
                ]);

                if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') {
                    setUserThemeState(savedTheme);
                }
                if (savedTextSize === 'small' || savedTextSize === 'medium' || savedTextSize === 'large') {
                    setTextSizeState(savedTextSize as TextSize);
                }
            } catch (e) {
                console.error('Failed to load preferences', e);
            } finally {
                setIsLoading(false);
            }
        };
        loadPreferences();
    }, []);

    const setUserTheme = async (newTheme: Theme) => {
        setUserThemeState(newTheme);
        try {
            await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
        } catch (e) {
            console.error('Failed to save theme preference', e);
        }
    };

    const setTextSize = async (newSize: TextSize) => {
        setTextSizeState(newSize);
        try {
            await AsyncStorage.setItem(TEXT_SIZE_STORAGE_KEY, newSize);
        } catch (e) {
            console.error('Failed to save text size preference', e);
        }
    };

    // Determine the effective theme
    const theme: ColorSchemeName =
        userTheme === 'system' ? (deviceColorScheme ?? 'light') : userTheme;

    return (
        <ThemeContext.Provider value={{ theme: theme || 'light', userTheme, setUserTheme, textSize, setTextSize, isLoading }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext);
