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

const MOCK_USAGE_DATA = [
    { day: 'Mon', count: 12 },
    { day: 'Tue', count: 19 },
    { day: 'Wed', count: 8 },
    { day: 'Thu', count: 23 },
    { day: 'Fri', count: 15 },
    { day: 'Sat', count: 28 },
    { day: 'Sun', count: 7 },
];

export default function UsageScreen() {
    const { session } = useAuth();
    const { isPro, isUltra } = useSubscription();
    const router = useRouter();
    const colors = useThemeColor();

    const [usedRequests, setUsedRequests] = useState(0);

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
                    const today = new Date().toISOString().split('T')[0];

                    if (lastDate === today) {
                        setUsedRequests(data.daily_requests_used || 0);
                    } else {
                        setUsedRequests(0); // It's a new day! Free limit refreshed.
                    }
                }
            };

            fetchUsageStats();

            return () => {
                isActive = false;
            };
        }, [session, isPro, isUltra])
    );

    const usagePercentage = isUltra ? 0 : Math.min((usedRequests / DAILY_LIMIT) * 100, 100);
    const remaining = isUltra ? '∞' : Math.max(DAILY_LIMIT - usedRequests, 0);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={[styles.title, { color: colors.text }]}>Usage</Text>
                </View>

                {/* Quota Card */}
                <View style={[styles.card, { backgroundColor: colors.card }]}>
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
                </View>

                {/* Upsell / Paywall Trigger Button - Hide if Ultra */}
                {!isUltra && (
                    <TouchableOpacity
                        activeOpacity={0.8}
                        style={styles.upgradeBtnContainer}
                        onPress={() => router.push('/paywall')}
                    >
                        <LinearGradient
                            colors={colors.logoGradient as [string, string, ...string[]]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.upgradeBtnGradient}
                        >
                            <Text style={styles.upgradeBtnText}>
                                {isPro ? '🔥 Upgrade to Sidekick Ultra' : '🌟 Upgrade to Sidekick Pro'}
                            </Text>
                            <Text style={styles.upgradeBtnSubtext}>
                                {isPro ? 'Unlock Unlimited Replies' : 'More Replies • No Ads'}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                )}

                {/* Usage Chart */}
                <View style={[styles.card, { backgroundColor: colors.card }]}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>Last 7 Days</Text>
                    <UsageChart data={MOCK_USAGE_DATA} colors={colors} />
                </View>

                <View style={{ height: 80 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

function UsageChart({ data, colors }: { data: typeof MOCK_USAGE_DATA, colors: any }) {
    const chartWidth = 320;
    const chartHeight = 200;
    const padding = 40;
    const maxValue = Math.max(...data.map(d => d.count));
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
    header: {
        marginBottom: Spacing.l,
        marginTop: Spacing.s,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    card: {
        borderRadius: BorderRadius.xl,
        padding: Spacing.l,
        marginBottom: Spacing.m,
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
