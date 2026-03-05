import { BorderRadius, Shadows, Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useAuth } from '@/context/AuthContext';
import { useSubscription } from '@/context/SubscriptionContext';
import { supabase } from '@/services/supabase';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Line, Rect, Text as SvgText } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/context/ThemeContext';

const FALLBACK_USAGE_DATA = [
    { day: 'Mon', count: 0 },
    { day: 'Tue', count: 0 },
    { day: 'Wed', count: 0 },
    { day: 'Thu', count: 0 },
    { day: 'Fri', count: 0 },
    { day: 'Sat', count: 0 },
    { day: 'Sun', count: 0 },
];

export default function UsageScreen() {
    const { session } = useAuth();
    const { isPro, isUltra } = useSubscription();
    const router = useRouter();
    const colors = useThemeColor();
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const cardGradientColors = isDark ? ['#1e1e1e', '#2c2c2c'] as const : ['#F3F4F6', '#E5E7EB'] as const;

    const [usedRequests, setUsedRequests] = useState(0);
    const [usageHistory, setUsageHistory] = useState(FALLBACK_USAGE_DATA);

    const DAILY_LIMIT = isUltra ? Infinity : (isPro ? 30 : 5);

    useFocusEffect(
        useCallback(() => {
            let isActive = true;

            const fetchUsageStats = async () => {
                if (!session?.user) return;

                const { data } = await supabase
                    .from('profiles')
                    .select('daily_requests_used, last_request_date')
                    .eq('id', session.user.id)
                    .maybeSingle();

                if (data && isActive) {
                    const lastDate = data.last_request_date ? data.last_request_date.split('T')[0] : '';
                    const now = new Date();
                    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

                    if (lastDate === today) {
                        setUsedRequests(data.daily_requests_used || 0);
                    } else {
                        setUsedRequests(0); // It's a new day! Free limit refreshed.
                    }
                }
            };

            const fetchUsageHistory = async () => {
                if (!session?.access_token) return;
                try {
                    const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
                    console.log(`Fetching usage history from: ${apiUrl}/api/v1/profiles/usage-history`);
                    const response = await fetch(`${apiUrl}/api/v1/profiles/usage-history`, {
                        headers: {
                            'Authorization': `Bearer ${session.access_token}`
                        }
                    });
                    if (response.ok) {
                        const historyData = await response.json();
                        console.log('Usage history received:', historyData);
                        if (isActive && Array.isArray(historyData)) {
                            setUsageHistory(historyData);
                        } else {
                            console.warn('Received usage history is not an array:', historyData);
                        }
                    } else {
                        console.error(`Failed to fetch history: ${response.status} ${response.statusText}`);
                        const errorText = await response.text();
                        console.error('Error detail:', errorText);
                    }
                } catch (error) {
                    console.error('Failed to fetch usage history catch:', error);
                }
            };

            fetchUsageStats();
            fetchUsageHistory();

            return () => {
                isActive = false;
            };
        }, [session, isPro, isUltra])
    );

    const usagePercentage = isUltra ? 0 : Math.min((usedRequests / DAILY_LIMIT) * 100, 100);
    const remaining = isUltra ? '∞' : Math.max(DAILY_LIMIT - usedRequests, 0);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            {/* Background Gradient */}
            <LinearGradient
                colors={[colors.tint + '30', 'transparent'] as const}
                style={styles.backgroundGradient}
            />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={[styles.title, { color: colors.text }]}>Usage</Text>
                </View>

                {/* Quota Card */}
                <LinearGradient
                    colors={cardGradientColors}
                    style={[styles.card, { borderColor: colors.border }]}
                >
                    <Text style={[styles.cardTitle, { color: colors.text }]}>Daily Free Quota</Text>

                    <View style={styles.quotaStats}>
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: colors.text }]}>{usedRequests}</Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Used</Text>
                        </View>
                        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: colors.text }]}>{remaining}</Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Remaining</Text>
                        </View>
                        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: colors.text }]}>
                                {isUltra ? '∞' : DAILY_LIMIT}
                            </Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total</Text>
                        </View>
                    </View>

                    {/* Progress Bar */}
                    <View style={styles.progressContainer}>
                        <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
                            <View
                                style={[
                                    styles.progressFill,
                                    { width: `${usagePercentage}%`, backgroundColor: isUltra ? colors.primary : colors.text }
                                ]}
                            />
                        </View>
                        <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                            {isUltra
                                ? "Unlimited access enabled!"
                                : (remaining === 0 ? "You've reached your free daily limit!" : `Resets at midnight`)}
                        </Text>
                    </View>
                </LinearGradient>

                {/* Upsell / Paywall Trigger Button - Hide if Ultra */}
                {!isUltra && (
                    <TouchableOpacity
                        activeOpacity={0.8}
                        style={[styles.upgradeBtnContainer, { backgroundColor: '#6C5CE7' }]}
                        onPress={() => router.push('/paywall')}
                    >
                        <View style={styles.upgradeBtnGradient}>
                            <Text style={styles.upgradeBtnText}>
                                {isPro ? 'Upgrade to Sidekick Ultra' : 'Upgrade to Sidekick Pro'}
                            </Text>
                            <Text style={styles.upgradeBtnSubtext}>
                                {isPro ? '\n • Unlock Unlimited Replies\n • All Features In Pro' : 'More Replies • No Ads'}
                            </Text>
                        </View>
                    </TouchableOpacity>
                )}

                {/* Usage Chart */}
                <LinearGradient
                    colors={cardGradientColors}
                    style={[styles.card, { borderColor: colors.border }]}
                >
                    <Text style={[styles.cardTitle, { color: colors.text }]}>Last 7 Days</Text>
                    <UsageChart data={usageHistory} colors={colors} />
                </LinearGradient>

                <View style={{ height: 80 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

function UsageChart({ data, colors }: { data: typeof FALLBACK_USAGE_DATA, colors: any }) {
    const chartWidth = 320;
    const chartHeight = 200;
    const padding = 40;
    // Safeguard maxValue to be at least 1 to avoid division by zero (NaN bar heights)
    const maxValue = Math.max(...data.map(d => d.count), 1);
    const barWidth = (chartWidth - padding * 2) / data.length;

    return (
        <View style={styles.chartContainer}>
            <Svg width={chartWidth} height={chartHeight}>
                {/* Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((fraction, i) => {
                    const y = chartHeight - padding - (chartHeight - padding * 2) * fraction;
                    return (
                        <Line
                            key={i}
                            x1={padding}
                            y1={y}
                            x2={chartWidth - padding}
                            y2={y}
                            stroke={colors.border}
                            strokeWidth="1"
                        />
                    );
                })}

                {/* Bars */}
                {data.map((item, index) => {
                    const barHeight = ((chartHeight - padding * 2) * item.count) / maxValue;
                    const x = padding + index * barWidth + barWidth * 0.2;
                    const y = chartHeight - padding - barHeight;
                    const width = barWidth * 0.6;

                    return (
                        <React.Fragment key={index}>
                            <Rect
                                x={x}
                                y={y}
                                width={width}
                                height={barHeight}
                                fill={colors.text}
                                rx={4}
                            />
                            {/* Day label */}
                            <SvgText
                                x={x + width / 2}
                                y={chartHeight - padding + 20}
                                fontSize="12"
                                fill={colors.textSecondary}
                                textAnchor="middle"
                            >
                                {item.day}
                            </SvgText>
                            {/* Value label */}
                            <SvgText
                                x={x + width / 2}
                                y={y - 8}
                                fontSize="12"
                                fill={colors.text}
                                textAnchor="middle"
                                fontWeight="600"
                            >
                                {item.count}
                            </SvgText>
                        </React.Fragment>
                    );
                })}
            </Svg>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: Spacing.m,
    },
    backgroundGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 400,
    },
    header: {
        marginBottom: Spacing.l,
        marginTop: Spacing.s,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        letterSpacing: -0.5,
        marginBottom: 4,
    },
    card: {
        borderRadius: BorderRadius.xl,
        padding: Spacing.l,
        marginBottom: Spacing.m,
        borderWidth: 1,
        ...Shadows.medium,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: Spacing.m,
    },
    quotaStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginBottom: Spacing.l,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statValue: {
        fontSize: 32,
        fontWeight: '800',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 14,
        fontWeight: '500',
    },
    statDivider: {
        width: 1,
        height: 40,
    },
    progressContainer: {
        gap: Spacing.s,
    },
    progressTrack: {
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
    },
    progressText: {
        fontSize: 14,
        textAlign: 'center',
        fontWeight: '600',
    },
    chartContainer: {
        alignItems: 'center',
        marginTop: Spacing.m,
    },
    upgradeBtnContainer: {
        borderRadius: BorderRadius.xl,
        ...Shadows.medium,
        marginBottom: Spacing.xl,
    },
    upgradeBtnGradient: {
        paddingVertical: Spacing.xl,
        paddingHorizontal: Spacing.xl,
        borderRadius: BorderRadius.xl,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    upgradeBtnText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    upgradeBtnSubtext: {
        color: 'rgba(255,255,255,0.85)',
        fontSize: 14,
        fontWeight: '600',
    },
});
