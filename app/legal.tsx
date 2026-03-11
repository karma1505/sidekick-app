import { Spacing, BorderRadius } from '@/constants/theme';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { LinearGradient } from 'expo-linear-gradient';
import { PRIVACY_POLICY, TERMS_AND_CONDITIONS } from '@/constants/LegalText';

export default function LegalScreen() {
    const { type } = useLocalSearchParams<{ type: 'privacy' | 'terms' }>();
    const colors = useThemeColor();
    const router = useRouter();

    const title = type === 'privacy' ? 'Privacy Policy' : 'Terms & Conditions';
    const content = type === 'privacy' ? PRIVACY_POLICY : TERMS_AND_CONDITIONS;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <LinearGradient
                colors={[colors.tint + '15', colors.background] as const}
                style={styles.headerGradient}
            />
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backButton}
                    activeOpacity={0.7}
                >
                    <IconSymbol name="chevron.left" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
                <View style={{ width: 40 }} />
            </View>
            <ScrollView
                style={styles.contentContainer}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Text style={[styles.legalText, { color: colors.text }]}>{content}</Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 200,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.m,
        paddingVertical: Spacing.m,
        zIndex: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
    },
    contentContainer: {
        flex: 1,
        marginHorizontal: Spacing.m,
        marginBottom: Spacing.m,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: BorderRadius.l,
        padding: Spacing.m,
    },
    scrollContent: {
        paddingBottom: Spacing.xl,
    },
    legalText: {
        fontSize: 14,
        lineHeight: 20,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
});
