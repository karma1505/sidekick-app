import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import Purchases, { CustomerInfo, PurchasesPackage } from 'react-native-purchases';
import { useAuth } from './AuthContext';

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
    const [isPro, setIsPro] = useState(false);
    const [isUltra, setIsUltra] = useState(false);
    const [packages, setPackages] = useState<PurchasesPackage[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Wait until they are fully logged in before configuring RC with their Supabase UUID
        if (!session?.user) return;

        // RevenueCat initialization
        const initRC = async () => {
            try {
                if (Platform.OS === 'ios' && REVENUECAT_APPLE_KEY) {
                    Purchases.configure({ apiKey: REVENUECAT_APPLE_KEY, appUserID: session.user.id });
                } else if (Platform.OS === 'android' && REVENUECAT_GOOGLE_KEY) {
                    Purchases.configure({ apiKey: REVENUECAT_GOOGLE_KEY, appUserID: session.user.id });
                } else {
                    // For Expo Go mock/web or if missing keys
                    console.log("RevenueCat mocked (Missing keys or wrong platform)");
                    setIsLoading(false);
                    return;
                }

                // Get offerings
                const offerings = await Purchases.getOfferings();
                if (offerings.current !== null && offerings.current.availablePackages.length !== 0) {
                    setPackages(offerings.current.availablePackages);
                }

                // Check if user is already Pro on boot
                const customerInfo = await Purchases.getCustomerInfo();
                checkProState(customerInfo);
            } catch (e) {
                console.error("RevenueCat Init error:", e);
            } finally {
                setIsLoading(false);
            }
        };

        initRC();

        // Listen for transaction updates
        const purchaserInfoUpdateListener = (info: CustomerInfo) => {
            checkProState(info);
        };

        Purchases.addCustomerInfoUpdateListener(purchaserInfoUpdateListener);

        return () => {
            Purchases.removeCustomerInfoUpdateListener(purchaserInfoUpdateListener);
        };
    }, [session]);

    const checkProState = (customerInfo: CustomerInfo) => {
        // Check Ultra First (Highest Tier)
        if (typeof customerInfo.entitlements.active['SideKick Ultra'] !== 'undefined') {
            setIsUltra(true);
            setIsPro(true); // Ultra implies Pro features too
        }
        // Check Pro Second
        else if (typeof customerInfo.entitlements.active['SideKick Pro'] !== 'undefined') {
            setIsPro(true);
            setIsUltra(false);
        }
        // Free Tier
        else {
            setIsPro(false);
            setIsUltra(false);
        }
    };

    const purchasePackage = async (pack: PurchasesPackage) => {
        try {
            setIsLoading(true);
            const { customerInfo } = await Purchases.purchasePackage(pack);
            checkProState(customerInfo);
            return typeof customerInfo.entitlements.active['SideKick Pro'] !== 'undefined' || typeof customerInfo.entitlements.active['SideKick Ultra'] !== 'undefined';
        } catch (e: any) {
            if (!e.userCancelled) {
                console.error("Purchase error", e);
            }
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SubscriptionContext.Provider value={{ isPro, isUltra, packages, purchasePackage, isLoading }}>
            {children}
        </SubscriptionContext.Provider>
    );
};

export const useSubscription = () => useContext(SubscriptionContext);
