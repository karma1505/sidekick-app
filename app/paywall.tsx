import { Colors, Shadows, BorderRadius, Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useSubscription } from '@/context/SubscriptionContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PurchasesPackage } from 'react-native-purchases';

export default function PaywallScreen() {
    const colors = useThemeColor();
    const router = useRouter();
    const { packages, purchasePackage, isPro, isUltra, isLoading } = useSubscription();
    const [isPurchasing, setIsPurchasing] = useState(false);

    // Filter packages based on identifiers
    const proPackage = packages.find(p => p.identifier === 'SideKick Pro' || p.identifier === '$rc_monthly' || p.product.identifier.includes('pro'));
    const ultraPackage = packages.find(p => p.identifier === 'SideKick Ultra' || p.identifier === '$rc_annual' || p.product.identifier.includes('ultra'));

    const handlePurchase = async (pack: PurchasesPackage | undefined) => {
        if (!pack) return;
        setIsPurchasing(true);
        try {
            const success = await purchasePackage(pack);
            if (success) {
                Alert.alert("Success!", "Welcome to the Premium tier!");
                router.back();
            }
        } catch (error) {
            console.error("Purchase Flow Error", error);
        } finally {
            setIsPurchasing(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header / Close Button */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
                    <Ionicons name="close" size={28} color={colors.textSecondary} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Titles */}
                <View style={styles.titleContainer}>
                    <Text style={[styles.title, { color: colors.text }]}>Unlock You</Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        Never run out of perfect replies again.
                    </Text>
                </View>

                {/* Offerings Container */}
                <View style={styles.cardsContainer}>

                    {/* Pro Card */}
                    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}>
                        <View style={styles.cardHeader}>
                            <Text style={[styles.cardTitle, { color: colors.text }]}>Sidekick Pro</Text>
                            <View style={[styles.badge, { backgroundColor: 'rgba(255, 149, 0, 0.15)' }]}>
                                <Text style={[styles.badgeText, { color: '#FF9500' }]}>Popular</Text>
                            </View>
                        </View>
                        <Text style={[styles.priceTag, { color: colors.text }]}>
                            {proPackage ? proPackage.product.priceString : '...'} <Text style={styles.pricePeriod}>/ mo</Text>
                        </Text>
                        <View style={styles.featuresList}>
                            <FeatureItem icon="chatbubbles-outline" text="30 AI Requests per day" color={colors.text} />
                            <FeatureItem icon="flash-outline" text="Faster AI Processing" color={colors.text} />
                            <FeatureItem icon="shield-checkmark-outline" text="Zero Advertisements" color={colors.text} />
                        </View>
                        <TouchableOpacity
                            style={styles.purchaseBtn}
                            onPress={() => handlePurchase(proPackage)}
                            disabled={isPurchasing || isLoading || isPro}
                        >
                            <LinearGradient
                                colors={['#FF9500', '#FF5E3A']}
                                style={styles.btnGradient}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                            >
                                {isPurchasing ? <ActivityIndicator color="#fff" /> :
                                    <Text style={styles.btnText}>{isPro ? 'Current Plan' : 'Get Pro'}</Text>}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    {/* Ultra Card */}
                    <View style={[styles.card, styles.ultraCard, { borderColor: '#8A2BE2', borderWidth: 2 }]}>
                        <View style={styles.ultraGlow} />
                        <View style={styles.cardHeader}>
                            <Text style={[styles.cardTitle, { color: '#fff' }]}>Sidekick Ultra</Text>
                            <View style={[styles.badge, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
                                <Text style={[styles.badgeText, { color: '#fff' }]}>Max Power</Text>
                            </View>
                        </View>
                        <Text style={[styles.priceTag, { color: '#fff' }]}>
                            {ultraPackage ? ultraPackage.product.priceString : '...'} <Text style={[styles.pricePeriod, { color: 'rgba(255,255,255,0.7)' }]}>/ mo</Text>
                        </Text>
                        <View style={styles.featuresList}>
                            <FeatureItem icon="infinite-outline" text="Unlimited AI Requests" color="#fff" />
                            <FeatureItem icon="star-outline" text="Premium Rizz Tones" color="#fff" />
                            <FeatureItem icon="rocket-outline" text="Priority API Processing" color="#fff" />
                        </View>
                        <TouchableOpacity
                            style={styles.purchaseBtn}
                            onPress={() => handlePurchase(ultraPackage)}
                            disabled={isPurchasing || isLoading || isUltra}
                        >
                            <View style={[styles.btnGradient, { backgroundColor: '#fff' }]}>
                                {isPurchasing ? <ActivityIndicator color="#8A2BE2" /> :
                                    <Text style={[styles.btnText, { color: '#8A2BE2' }]}>{isUltra ? 'Current Plan' : 'Get Ultra'}</Text>}
                            </View>
                        </TouchableOpacity>
                    </View>

                </View>

                {/* Footer terms */}
                <Text style={styles.footerTerms}>
                    Recurring billing. Cancel anytime. By subscribing, you agree to our Terms of Service and Privacy Policy.
                </Text>

            </ScrollView>
        </SafeAreaView>
    );
}

function FeatureItem({ icon, text, color }: { icon: any, text: string, color: string }) {
    return (
        <View style={styles.featureItem}>
            <Ionicons name={icon} size={20} color={color} style={styles.featureIcon} />
            <Text style={[styles.featureText, { color }]}>{text}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: Spacing.m,
        paddingTop: Spacing.s,
        alignItems: 'flex-start',
    },
    closeBtn: {
        padding: Spacing.xs,
    },
    scrollContent: {
        padding: Spacing.l,
        paddingBottom: Spacing.xxl * 2,
    },
    titleContainer: {
        marginBottom: Spacing.xl,
    },
    title: {
        fontSize: 34,
        fontWeight: '900',
        letterSpacing: -1,
        marginBottom: Spacing.xs,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '500',
    },
    cardsContainer: {
        gap: Spacing.l,
    },
    card: {
        borderRadius: BorderRadius.xl,
        padding: Spacing.l,
        ...Shadows.medium,
        overflow: 'hidden',
    },
    ultraCard: {
        backgroundColor: '#1E1E2C', // Deep premium dark background
        ...Shadows.strong,
    },
    ultraGlow: {
        position: 'absolute',
        top: -50,
        right: -50,
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(138, 43, 226, 0.15)', // Subtle purple glow
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.s,
    },
    cardTitle: {
        fontSize: 22,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: BorderRadius.circle,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    priceTag: {
        fontSize: 36,
        fontWeight: '900',
        letterSpacing: -1,
        marginBottom: Spacing.l,
    },
    pricePeriod: {
        fontSize: 16,
        fontWeight: '500',
    },
    featuresList: {
        gap: Spacing.m,
        marginBottom: Spacing.xl,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    featureIcon: {
        marginRight: Spacing.s,
    },
    featureText: {
        fontSize: 15,
        fontWeight: '600',
    },
    purchaseBtn: {
        borderRadius: BorderRadius.circle,
        overflow: 'hidden',
    },
    btnGradient: {
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: BorderRadius.circle,
    },
    btnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
    },
    footerTerms: {
        marginTop: Spacing.xl,
        textAlign: 'center',
        fontSize: 12,
        color: Colors.light.textSecondary,
        paddingHorizontal: Spacing.l,
        lineHeight: 18,
    }
});
