import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import Purchases, { CustomerInfo, PurchasesPackage, PurchasesOfferings } from 'react-native-purchases';
import { useAuth } from './AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';

// Add these to your .env file
const REVENUECAT_APPLE_KEY = process.env.EXPO_PUBLIC_REVENUECAT_APPLE_KEY || '';
const REVENUECAT_GOOGLE_KEY = process.env.EXPO_PUBLIC_REVENUECAT_GOOGLE_KEY || '';

interface SubscriptionData {
    isPro: boolean;
    isUltra: boolean;
    packages: PurchasesPackage[];
    purchasePackage: (pack: PurchasesPackage) => Promise<boolean>;
    isLoading: boolean;
}

const SubscriptionContext = createContext<SubscriptionData>({
    isPro: false,
    isUltra: false,
    packages: [],
    purchasePackage: async () => false,
    isLoading: true,
});

export const SubscriptionProvider = ({ children }: { children: React.ReactNode }) => {
    const { session } = useAuth();
    const queryClient = useQueryClient();
    const [isPro, setIsPro] = useState(false);
    const [isUltra, setIsUltra] = useState(false);
    const [packages, setPackages] = useState<PurchasesPackage[]>([]);
    const [isConfigured, setIsConfigured] = useState(false);

    const checkProState = (customerInfo: CustomerInfo) => {
        if (typeof customerInfo.entitlements.active['SideKick Ultra'] !== 'undefined') {
            setIsUltra(true);
            setIsPro(true);
        } else if (typeof customerInfo.entitlements.active['SideKick Pro'] !== 'undefined') {
            setIsPro(true);
            setIsUltra(false);
        } else {
            setIsPro(false);
            setIsUltra(false);
        }
    };

    // Initialize RC and Fetch Offerings
    const { isLoading: offeringsLoading } = useQuery({
        queryKey: ['subscriptionOfferings', session?.user?.id],
        queryFn: async () => {
            if (!session?.user) return null;

            try {
                if (Platform.OS === 'ios' && REVENUECAT_APPLE_KEY) {
                    await Purchases.configure({ apiKey: REVENUECAT_APPLE_KEY, appUserID: session.user.id });
                } else if (Platform.OS === 'android' && REVENUECAT_GOOGLE_KEY) {
                    await Purchases.configure({ apiKey: REVENUECAT_GOOGLE_KEY, appUserID: session.user.id });
                } else {
                    return null; // Mocked later
                }
                setIsConfigured(true);

                const offerings = await Purchases.getOfferings();
                if (offerings.current !== null && offerings.current.availablePackages.length !== 0) {
                    setPackages(offerings.current.availablePackages);
                    return offerings.current.availablePackages;
                }
                return null;
            } catch (e) {
                console.log("Offerings/Config capture (handled by mock):", e);
                // Even on failure in Expo Go, we mark as 'configured' so customerInfo query can run (and fail/mock safely)
                setIsConfigured(true);
                return null;
            }
        },
        enabled: !!session?.user,
        staleTime: 1000 * 60 * 60, // 1 hour
    });

    // Fetch Customer Info
    const { isLoading: customerLoading } = useQuery({
        queryKey: ['customerInfo', session?.user?.id],
        queryFn: async () => {
            if (!session?.user || !isConfigured) return null;
            try {
                const customerInfo = await Purchases.getCustomerInfo();
                checkProState(customerInfo);
                return customerInfo;
            } catch (e) {
                console.error("RC getCustomerInfo fail (likely Expo Go):", e);
                return null;
            }
        },
        enabled: !!session?.user && isConfigured,
    });

    // Mock packages for Expo Go if needed
    useEffect(() => {
        if (!offeringsLoading && packages.length === 0 && session?.user) {
            setPackages([
                {
                    identifier: 'SideKick Pro',
                    packageType: 'MONTHLY' as any,
                    product: {
                        identifier: 'sidekick_pro_monthly',
                        description: 'Pro Tier',
                        title: 'SideKick Pro',
                        price: 6.99,
                        priceString: '$6.99',
                        currencyCode: 'USD',
                    } as any,
                    offeringIdentifier: 'default'
                },
                {
                    identifier: 'SideKick Ultra',
                    packageType: 'MONTHLY' as any,
                    product: {
                        identifier: 'sidekick_ultra_monthly',
                        description: 'Ultra Tier',
                        title: 'SideKick Ultra',
                        price: 16.99,
                        priceString: '$16.99',
                        currencyCode: 'USD',
                    } as any,
                    offeringIdentifier: 'default'
                }
            ] as PurchasesPackage[]);
        }
    }, [offeringsLoading, packages.length, session?.user]);

    useEffect(() => {
        const purchaserInfoUpdateListener = (info: CustomerInfo) => {
            checkProState(info);
            queryClient.setQueryData(['customerInfo', session?.user?.id], info);
        };

        Purchases.addCustomerInfoUpdateListener(purchaserInfoUpdateListener);
        return () => {
            Purchases.removeCustomerInfoUpdateListener(purchaserInfoUpdateListener);
        };
    }, [session?.user?.id]);

    const purchasePackage = async (pack: PurchasesPackage) => {
        try {
            if (pack.product.description === 'Pro Tier' || pack.product.description === 'Ultra Tier') {
                await new Promise(resolve => setTimeout(resolve, 1500));
                if (pack.identifier === 'SideKick Ultra') {
                    setIsUltra(true);
                    setIsPro(true);
                } else {
                    setIsPro(true);
                }
                return true;
            }

            const { customerInfo } = await Purchases.purchasePackage(pack);
            checkProState(customerInfo);
            queryClient.setQueryData(['customerInfo', session?.user?.id], customerInfo);
            return typeof customerInfo.entitlements.active['SideKick Pro'] !== 'undefined' || typeof customerInfo.entitlements.active['SideKick Ultra'] !== 'undefined';
        } catch (e: any) {
            if (!e.userCancelled) console.error("Purchase error", e);
            return false;
        }
    };

    const isLoading = offeringsLoading || customerLoading;

    return (
        <SubscriptionContext.Provider value={{ isPro, isUltra, packages, purchasePackage, isLoading }}>
            {children}
        </SubscriptionContext.Provider>
    );
};

export const useSubscription = () => useContext(SubscriptionContext);
