import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useSubscription } from './SubscriptionContext';
import { trackRewardedAdWatched } from '@/services/analytics';

// Safely load react-native-google-mobile-ads to prevent crashes in Expo Go
let InterstitialAd: any = null;
let RewardedAd: any = null;
let TestIds: any = { INTERSTITIAL: '', REWARDED: '' };
let AdEventType: any = { LOADED: 'loaded', CLOSED: 'closed', OPENED: 'opened', ERROR: 'error' };
let RewardedAdEventType: any = { LOADED: 'loaded', EARNED_REWARD: 'earned_reward' };
let AdsConsent: any = null;
let MobileAdsDefault: any = null;
let isGoogleMobileAdsAvailable = false;

try {
    const GoogleMobileAds = require('react-native-google-mobile-ads');
    InterstitialAd = GoogleMobileAds.InterstitialAd;
    RewardedAd = GoogleMobileAds.RewardedAd;
    TestIds = GoogleMobileAds.TestIds;
    AdEventType = GoogleMobileAds.AdEventType;
    RewardedAdEventType = GoogleMobileAds.RewardedAdEventType;
    AdsConsent = GoogleMobileAds.AdsConsent;
    MobileAdsDefault = GoogleMobileAds.default;
    isGoogleMobileAdsAvailable = true;
} catch (e) {
    console.warn('Native Google Mobile Ads module not found (running in Expo Go). Ads will be simulated.');
}

const interstitialAdUnitId = __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-3002397785934507/3080104187';
const rewardedAdUnitId = __DEV__ ? TestIds.REWARDED : 'ca-app-pub-3002397785934507/6665045840';

interface AdContextData {
    isInterstitialLoaded: boolean;
    isRewardedLoaded: boolean;
    lastInterstitialShownTime: number;
    showInterstitial: () => Promise<void>;
    showRewarded: (onRewardEarned: () => void) => void;
}

const AdContext = createContext<AdContextData>({
    isInterstitialLoaded: false,
    isRewardedLoaded: false,
    lastInterstitialShownTime: 0,
    showInterstitial: async () => { },
    showRewarded: () => { },
});

export const AdProvider = ({ children }: { children: React.ReactNode }) => {
    const { isPro, isLoading: isSubscriptionLoading } = useSubscription();
    const [isInterstitialLoaded, setIsInterstitialLoaded] = useState(false);
    const [isRewardedLoaded, setIsRewardedLoaded] = useState(false);
    const [lastInterstitialShownTime, setLastInterstitialShownTime] = useState(0);

    const interstitialRef = useRef<any>(null);
    const rewardedRef = useRef<any>(null);
    const isProRef = useRef(isPro);
    isProRef.current = isPro;
    const canRequestAdsRef = useRef(false);
    const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isInitializedRef = useRef(false);

    const scheduleInterstitialRetry = () => {
        if (isProRef.current || !canRequestAdsRef.current) return;
        if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
        retryTimerRef.current = setTimeout(() => {
            console.log('[AdMob] Retrying interstitial load after 45s...');
            loadInterstitial();
        }, 45000);
    };

    const loadInterstitial = () => {
        if (isProRef.current || !canRequestAdsRef.current || !interstitialRef.current) return;
        try {
            interstitialRef.current.load();
        } catch (e) {
            console.warn('[AdMob] Error loading interstitial:', e);
            scheduleInterstitialRetry();
        }
    };

    const loadRewarded = () => {
        if (isProRef.current || !canRequestAdsRef.current || !rewardedRef.current) return;
        try {
            rewardedRef.current.load();
        } catch (e) {
            console.warn('[AdMob] Error loading rewarded:', e);
        }
    };

    const setupAds = () => {
        if (!InterstitialAd || !RewardedAd) return;

        try {
            // Note: requestNonPersonalizedAdsOnly removed; personalized/non-personalized handled via UMP consent
            const inst = InterstitialAd.createForAdRequest(interstitialAdUnitId);
            const rew = RewardedAd.createForAdRequest(rewardedAdUnitId);

            inst.addAdEventListener(AdEventType.LOADED, () => {
                if (retryTimerRef.current) {
                    clearTimeout(retryTimerRef.current);
                    retryTimerRef.current = null;
                }
                setIsInterstitialLoaded(true);
            });

            inst.addAdEventListener(AdEventType.OPENED, () => {
                // Record the shown time when the ad actually opens, not before
                const now = Date.now();
                setLastInterstitialShownTime(now);
            });

            inst.addAdEventListener(AdEventType.ERROR, (err: any) => {
                console.warn('[AdMob] Interstitial load error event:', err);
                setIsInterstitialLoaded(false);
                scheduleInterstitialRetry();
            });

            rew.addAdEventListener(RewardedAdEventType.LOADED, () => {
                setIsRewardedLoaded(true);
            });

            rew.addAdEventListener(AdEventType.ERROR, (err: any) => {
                console.warn('[AdMob] Rewarded load error event:', err);
                setIsRewardedLoaded(false);
            });

            interstitialRef.current = inst;
            rewardedRef.current = rew;

            loadInterstitial();
            loadRewarded();
        } catch (e) {
            console.warn('[AdMob] Error creating ad instances:', e);
        }
    };

    useEffect(() => {
        // Gate 1: Do not create or load any ad until RevenueCat entitlement check finishes
        if (isSubscriptionLoading) {
            return;
        }

        // Gate 2: Never load ads for Pro users. If a user becomes Pro later, stop loading new ads.
        if (isPro) {
            console.log('[AdMob] User is Pro. Disabling ads.');
            setIsInterstitialLoaded(false);
            setIsRewardedLoaded(false);
            canRequestAdsRef.current = false;
            if (retryTimerRef.current) {
                clearTimeout(retryTimerRef.current);
                retryTimerRef.current = null;
            }
            return;
        }

        // Running in Expo Go simulation mode
        if (!isGoogleMobileAdsAvailable) {
            setIsInterstitialLoaded(true);
            setIsRewardedLoaded(true);
            return;
        }

        // If already initialized and consent obtained, ensure ads are loaded
        if (isInitializedRef.current) {
            canRequestAdsRef.current = true;
            if (!interstitialRef.current) {
                setupAds();
            } else {
                loadInterstitial();
                loadRewarded();
            }
            return;
        }

        // UMP Consent flow and SDK initialization
        const runConsentAndInit = async () => {
            try {
                if (AdsConsent) {
                    console.log('[AdMob] Gathering UMP consent...');
                    const consentInfo = await AdsConsent.gatherConsent();
                    console.log('[AdMob] Consent gathered. canRequestAds:', consentInfo?.canRequestAds);
                    canRequestAdsRef.current = !!consentInfo?.canRequestAds;
                } else {
                    canRequestAdsRef.current = true;
                }

                if (canRequestAdsRef.current) {
                    if (MobileAdsDefault) {
                        await MobileAdsDefault().initialize();
                        console.log('[AdMob] MobileAds initialized.');
                    }
                    isInitializedRef.current = true;
                    if (!isProRef.current) {
                        setupAds();
                    }
                }
            } catch (err) {
                console.warn('[AdMob] Consent/init flow error:', err);
                // Fallback check
                try {
                    if (AdsConsent) {
                        const info = await AdsConsent.getConsentInfo();
                        if (info?.canRequestAds) {
                            canRequestAdsRef.current = true;
                            if (MobileAdsDefault) await MobileAdsDefault().initialize();
                            isInitializedRef.current = true;
                            if (!isProRef.current) setupAds();
                        }
                    }
                } catch (e) {
                    console.warn('[AdMob] Fallback consent check error:', e);
                }
            }
        };

        runConsentAndInit();

        return () => {
            if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
        };
    }, [isSubscriptionLoading, isPro]);

    const showInterstitial = (): Promise<void> => {
        return new Promise<void>((resolve) => {
            if (!isGoogleMobileAdsAvailable || !interstitialRef.current || !isInterstitialLoaded) {
                resolve();
                return;
            }

            let resolved = false;
            let timeoutId: ReturnType<typeof setTimeout> | null = null;

            const finish = () => {
                if (!resolved) {
                    resolved = true;
                    if (timeoutId) clearTimeout(timeoutId);
                    cleanup();
                    resolve();
                }
            };

            // 30-second safety timeout so AI generation is never blocked
            timeoutId = setTimeout(() => {
                console.warn('[AdMob] Interstitial 30s timeout elapsed, resolving');
                finish();
            }, 30000);

            const unsubClosed = interstitialRef.current.addAdEventListener(AdEventType.CLOSED, () => {
                setIsInterstitialLoaded(false);
                finish();
                // Preload the next ad as soon as the previous one closes
                loadInterstitial();
            });

            const unsubError = interstitialRef.current.addAdEventListener(AdEventType.ERROR, (err: any) => {
                console.warn('[AdMob] Interstitial error event during show:', err);
                setIsInterstitialLoaded(false);
                finish();
                scheduleInterstitialRetry();
            });

            const cleanup = () => {
                unsubClosed?.();
                unsubError?.();
            };

            try {
                interstitialRef.current.show();
            } catch (err) {
                console.warn('[AdMob] Interstitial show() threw:', err);
                setIsInterstitialLoaded(false);
                finish();
                scheduleInterstitialRetry();
            }
        });
    };

    const showRewarded = (onRewardEarned: () => void) => {
        if (!isGoogleMobileAdsAvailable || !rewardedRef.current) {
            onRewardEarned();
            return;
        }

        if (isRewardedLoaded) {
            // Credits are granted ONLY in the reward-earned callback, never on close or dismiss
            const unsubEarned = rewardedRef.current.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
                trackRewardedAdWatched({ creditsEarned: 2, source: 'rewarded_video' });
                onRewardEarned();
            });

            const unsubClosed = rewardedRef.current.addAdEventListener(AdEventType.CLOSED, () => {
                setIsRewardedLoaded(false);
                cleanup();
                // Preload next rewarded ad
                loadRewarded();
            });

            const unsubError = rewardedRef.current.addAdEventListener(AdEventType.ERROR, () => {
                setIsRewardedLoaded(false);
                cleanup();
            });

            const cleanup = () => {
                unsubEarned?.();
                unsubClosed?.();
                unsubError?.();
            };

            try {
                rewardedRef.current.show();
            } catch (err) {
                console.warn('[AdMob] Rewarded show() threw:', err);
                setIsRewardedLoaded(false);
                cleanup();
            }
        }
    };

    return (
        <AdContext.Provider value={{
            isInterstitialLoaded,
            isRewardedLoaded,
            lastInterstitialShownTime,
            showInterstitial,
            showRewarded,
        }}>
            {children}
        </AdContext.Provider>
    );
};

export const useAds = () => useContext(AdContext);
