import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import Purchases, { CustomerInfo, PurchasesPackage, PurchasesOfferings } from 'react-native-purchases';
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

                // Fetch Offerings with aggressive timeout for Expo Go
                console.log("Fetching RevenueCat offerings...");
                const offeringsP = Purchases.getOfferings();
                const timeoutGetOfferingsP = new Promise((_, reject) => setTimeout(() => reject(new Error("GetOfferings Timeout")), 2000));

                const offerings = await Promise.race([offeringsP, timeoutGetOfferingsP]) as PurchasesOfferings;

                console.log("Offerings received:", JSON.stringify(offerings, null, 2));

                if (offerings.current !== null && offerings.current.availablePackages.length !== 0) {
                    setPackages(offerings.current.availablePackages);
                    console.log(`Set ${offerings.current.availablePackages.length} packages into state.`);
                } else {
                    console.warn("RevenueCat offerings fetched successfully, but the current offerings array was unexpectedly empty!");
                    throw new Error("Empty Offerings"); // Throw so we can catch and mock
                }

                // Check if user is already Pro on boot
                console.log("Fetching Customer Info...");
                // Wrap in timeout because sometimes Expo Go native module failures just hang forever instead of rejecting
                const customerInfoP = Purchases.getCustomerInfo();
                const timeoutP = new Promise((_, reject) => setTimeout(() => reject(new Error("CustomerInfo Timeout")), 2000));

                const customerInfo = await Promise.race([customerInfoP, timeoutP]) as CustomerInfo;
                console.log("Customer info received");
                checkProState(customerInfo);
            } catch (e) {
                console.error("RevenueCat Init error (likely running in Expo Go):", e);
                console.log("Injecting Mock Data so you can preview the Paywall in Expo Go!");

                // Inject fake mock packages for Expo Go UI Testing
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

            // If we are using the mock packages from the catch block above:
            if (pack.product.description === 'Pro Tier' || pack.product.description === 'Ultra Tier') {
                console.log("Mocking purchase in Expo Go for:", pack.identifier);
                // Simulate network delay
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
