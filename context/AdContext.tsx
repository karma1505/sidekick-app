import React, { createContext, useContext, useEffect, useState } from 'react';
import { InterstitialAd, RewardedAd, TestIds, AdEventType, RewardedAdEventType } from 'react-native-google-mobile-ads';

// Use test IDs during development. 
// DO NOT use your real Ad Unit IDs while developing or Google will ban your account.
const interstitialAdUnitId = __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-3002397785934507/1902874687';
const rewardedAdUnitId = __DEV__ ? TestIds.REWARDED : 'ca-app-pub-3002397785934507/8292175756';

const interstitial = InterstitialAd.createForAdRequest(interstitialAdUnitId, {
    requestNonPersonalizedAdsOnly: true,
});

const rewarded = RewardedAd.createForAdRequest(rewardedAdUnitId, {
    requestNonPersonalizedAdsOnly: true,
});

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
        const unsubscribeInterstitial = interstitial.addAdEventListener(AdEventType.LOADED, () => {
            setIsInterstitialLoaded(true);
        });

        const unsubscribeRewarded = rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
            setIsRewardedLoaded(true);
        });

        const unsubscribeRewardedEarned = rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, (reward) => {
            console.log('User earned reward of ', reward);
        });

        interstitial.load();
        rewarded.load();

        return () => {
            unsubscribeInterstitial();
            unsubscribeRewarded();
            unsubscribeRewardedEarned();
        };
    }, []);

    const showInterstitial = (onClosed?: () => void) => {
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
