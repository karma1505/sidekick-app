import React, { createContext, useContext, useEffect, useState } from 'react';

// Safely load react-native-google-mobile-ads to prevent crashes in Expo Go
let InterstitialAd: any = null;
let RewardedAd: any = null;
let TestIds: any = { INTERSTITIAL: '', REWARDED: '' };
let AdEventType: any = { LOADED: 'loaded', CLOSED: 'closed' };
let RewardedAdEventType: any = { LOADED: 'loaded', EARNED_REWARD: 'earned_reward' };
let isGoogleMobileAdsAvailable = false;

try {
    const GoogleMobileAds = require('react-native-google-mobile-ads');
    InterstitialAd = GoogleMobileAds.InterstitialAd;
    RewardedAd = GoogleMobileAds.RewardedAd;
    TestIds = GoogleMobileAds.TestIds;
    AdEventType = GoogleMobileAds.AdEventType;
    RewardedAdEventType = GoogleMobileAds.RewardedAdEventType;
    isGoogleMobileAdsAvailable = true;
} catch (e) {
    console.warn('Native Google Mobile Ads module not found (running in Expo Go). Ads will be simulated.');
}

const interstitialAdUnitId = __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-3002397785934507/1902874687';
const rewardedAdUnitId = __DEV__ ? TestIds.REWARDED : 'ca-app-pub-3002397785934507/8292175756';

let interstitial: any = null;
let rewarded: any = null;

if (isGoogleMobileAdsAvailable && InterstitialAd && RewardedAd) {
    try {
        interstitial = InterstitialAd.createForAdRequest(interstitialAdUnitId, {
            requestNonPersonalizedAdsOnly: true,
        });

        rewarded = RewardedAd.createForAdRequest(rewardedAdUnitId, {
            requestNonPersonalizedAdsOnly: true,
        });
    } catch (e) {
        console.warn('Failed to initialize Google Mobile Ads:', e);
        isGoogleMobileAdsAvailable = false;
    }
}

interface AdContextData {
    isInterstitialLoaded: boolean;
    isRewardedLoaded: boolean;
    showInterstitial: (onClosed?: () => void) => void;
    showRewarded: (onRewardEarned: () => void) => void;
}

const AdContext = createContext<AdContextData>({
    isInterstitialLoaded: false,
    isRewardedLoaded: false,
    showInterstitial: () => { },
    showRewarded: () => { },
});

export const AdProvider = ({ children }: { children: React.ReactNode }) => {
    const [isInterstitialLoaded, setIsInterstitialLoaded] = useState(false);
    const [isRewardedLoaded, setIsRewardedLoaded] = useState(false);

    useEffect(() => {
        if (!isGoogleMobileAdsAvailable || !interstitial || !rewarded) {
            // In Expo Go or mock mode, mark as ready so features/UI can be tested
            setIsInterstitialLoaded(true);
            setIsRewardedLoaded(true);
            return;
        }

        const unsubscribeInterstitial = interstitial.addAdEventListener(AdEventType.LOADED, () => {
            setIsInterstitialLoaded(true);
        });

        const unsubscribeRewarded = rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
            setIsRewardedLoaded(true);
        });

        const unsubscribeRewardedEarned = rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, (reward: any) => {
            console.log('User earned reward of ', reward);
        });

        interstitial.load();
        rewarded.load();

        return () => {
            unsubscribeInterstitial?.();
            unsubscribeRewarded?.();
            unsubscribeRewardedEarned?.();
        };
    }, []);

    const showInterstitial = (onClosed?: () => void) => {
        if (!isGoogleMobileAdsAvailable || !interstitial) {
            onClosed?.();
            return;
        }
        if (isInterstitialLoaded) {
            const unsubscribeClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
                setIsInterstitialLoaded(false);
                interstitial.load();
                onClosed?.();
                unsubscribeClosed();
            });
            interstitial.show();
        } else {
            onClosed?.();
        }
    };

    const showRewarded = (onRewardEarned: () => void) => {
        if (!isGoogleMobileAdsAvailable || !rewarded) {
            onRewardEarned();
            return;
        }
        if (isRewardedLoaded) {
            const unsubscribeEarned = rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
                onRewardEarned();
                unsubscribeEarned();
            });
            const unsubscribeClosed = rewarded.addAdEventListener(AdEventType.CLOSED, () => {
                setIsRewardedLoaded(false);
                rewarded.load();
                unsubscribeClosed();
            });
            rewarded.show();
        }
    };

    return (
        <AdContext.Provider value={{ isInterstitialLoaded, isRewardedLoaded, showInterstitial, showRewarded }}>
            {children}
        </AdContext.Provider>
    );
};

export const useAds = () => useContext(AdContext);
