import { useThemeColor } from '@/hooks/useThemeColor';
import { View } from 'react-native';

export default function TabBarBackground() {
    const colors = useThemeColor();
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
}
