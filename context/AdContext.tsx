import React, { createContext, useContext, useEffect, useState } from 'react';
import { InterstitialAd, RewardedAd, TestIds, AdEventType, RewardedAdEventType } from 'react-native-google-mobile-ads';

// Use test IDs during development. 
// DO NOT use your real Ad Unit IDs while developing or Google will ban your account.
const interstitialAdUnitId = __DEV__ ? TestIds.INTERSTITIAL : 'your-production-interstitial-id';
const rewardedAdUnitId = __DEV__ ? TestIds.REWARDED : 'your-production-rewarded-id';

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
        // --- Interstitial Listeners ---
        const unsubscribeInterstitialLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
            setIsInterstitialLoaded(true);
        });
        
        const unsubscribeInterstitialClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
            setIsInterstitialLoaded(false);
            interstitial.load(); // Reload immediately for the next time
        });

        // --- Rewarded Listeners ---
        const unsubscribeRewardedLoaded = rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
            setIsRewardedLoaded(true);
        });

        const unsubscribeRewardedEarned = rewarded.addAdEventListener(
            RewardedAdEventType.EARNED_REWARD,
            reward => {
                console.log('User earned reward of ', reward);
            },
        );

        const unsubscribeRewardedClosed = rewarded.addAdEventListener(AdEventType.CLOSED, () => {
            setIsRewardedLoaded(false);
            rewarded.load(); // Reload instantly 
        });

        // Boot and load them once the provider mounts
        interstitial.load();
        rewarded.load();

        return () => {
            unsubscribeInterstitialLoaded();
            unsubscribeInterstitialClosed();
            unsubscribeRewardedLoaded();
            unsubscribeRewardedEarned();
            unsubscribeRewardedClosed();
        };
    }, []);

    const showInterstitial = (onClosed?: () => void) => {
        if (isInterstitialLoaded) {
            if (onClosed) {
                const triggerOff = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
                    onClosed();
                    triggerOff();
                });
            }
            interstitial.show();
        } else {
            console.warn('Interstitial not loaded yet');
            // If it failed to load, just skip so the user isn't stuck
            onClosed?.();
        }
    };

    const showRewarded = (onRewardEarned: () => void) => {
        if (isRewardedLoaded) {
            const triggerRewardOff = rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
                onRewardEarned();
                triggerRewardOff();
            });
            rewarded.show();
        } else {
            console.warn('Rewarded ad not loaded yet');
        }
    };

    return (
        <AdContext.Provider value={{ isInterstitialLoaded, isRewardedLoaded, showInterstitial, showRewarded }}>
            {children}
        </AdContext.Provider>
    );
};

export const useAds = () => useContext(AdContext);
