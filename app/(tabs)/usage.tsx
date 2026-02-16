import { BorderRadius, Colors, Shadows, Spacing } from '@/constants/theme';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Line, Rect, Text as SvgText } from 'react-native-svg';

// Mock data
const MOCK_QUOTA = {
    used: 127,
    total: 200,
};

const MOCK_USAGE_DATA = [
    { day: 'Mon', count: 12 },
    { day: 'Tue', count: 19 },
    { day: 'Wed', count: 8 },
    { day: 'Thu', count: 23 },
    { day: 'Fri', count: 15 },
    { day: 'Sat', count: 28 },
    { day: 'Sun', count: 22 },
];

export default function UsageScreen() {
    const usagePercentage = (MOCK_QUOTA.used / MOCK_QUOTA.total) * 100;
    const remaining = MOCK_QUOTA.total - MOCK_QUOTA.used;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Usage</Text>
                </View>

                {/* Quota Card */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Monthly Quota</Text>

                    <View style={styles.quotaStats}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{MOCK_QUOTA.used}</Text>
                            <Text style={styles.statLabel}>Used</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{remaining}</Text>
                            <Text style={styles.statLabel}>Remaining</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{MOCK_QUOTA.total}</Text>
                            <Text style={styles.statLabel}>Total</Text>
                        </View>
                    </View>

                    {/* Progress Bar */}
                    <View style={styles.progressContainer}>
                        <View style={styles.progressTrack}>
                            <View
                                style={[
                                    styles.progressFill,
                                    { width: `${usagePercentage}%` }
                                ]}
                            />
                        </View>
                        <Text style={styles.progressText}>{usagePercentage.toFixed(1)}% used</Text>
                    </View>
                </View>

                {/* Usage Chart */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Last 7 Days</Text>
                    <UsageChart data={MOCK_USAGE_DATA} />
                </View>

                <View style={{ height: 80 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

function UsageChart({ data }: { data: typeof MOCK_USAGE_DATA }) {
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
                            stroke="#E5E7EB"
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
                                fill="#111827"
                                rx={4}
                            />
                            {/* Day label */}
                            <SvgText
                                x={x + width / 2}
                                y={chartHeight - padding + 20}
                                fontSize="12"
                                fill="#6B7280"
                                textAnchor="middle"
                            >
                                {item.day}
                            </SvgText>
                            {/* Value label */}
                            <SvgText
                                x={x + width / 2}
                                y={y - 8}
                                fontSize="12"
                                fill="#111827"
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
        backgroundColor: Colors.light.background,
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
        color: Colors.light.text,
        letterSpacing: -0.5,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: BorderRadius.xl,
        padding: Spacing.l,
        marginBottom: Spacing.m,
        ...Shadows.medium,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.light.text,
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
        color: Colors.light.text,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 14,
        color: Colors.light.textSecondary,
        fontWeight: '500',
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: Colors.light.border,
    },
    progressContainer: {
        gap: Spacing.s,
    },
    progressTrack: {
        height: 8,
        backgroundColor: '#E5E7EB',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#111827',
        borderRadius: 4,
    },
    progressText: {
        fontSize: 14,
        color: Colors.light.textSecondary,
        textAlign: 'center',
        fontWeight: '600',
    },
    chartContainer: {
        alignItems: 'center',
        marginTop: Spacing.m,
    },
});
