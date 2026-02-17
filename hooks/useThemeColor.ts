import { Colors } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

export function useThemeColor() {
    const { theme } = useTheme();
    return Colors[theme];
}
