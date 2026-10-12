/**
 * Safe Firebase Analytics wrapper for SideKick.
 *
 * Designed to:
 * 1. Comply strictly with Google Play Review (Zero PII: no email, phone, text content, or OCR).
 * 2. Fail safely in Expo Go, local web, or when native Firebase is unavailable.
 * 3. Provide accurate tracking for core conversion and lifecycle events.
 */

type AnalyticsParams = Record<string, string | number | boolean>;

let getAnalytics: any = null;

try {
  const firebaseAnalytics = require('@react-native-firebase/analytics');
  getAnalytics = firebaseAnalytics.default || firebaseAnalytics;
} catch {
  // Expo Go or native module not compiled yet
}

const safeLogEvent = async (name: string, params?: AnalyticsParams) => {
  try {
    if (getAnalytics) {
      await getAnalytics().logEvent(name, params);
      console.log(`[Analytics] ${name}`, params || {});
    } else {
      console.log(`[Analytics:Mock] ${name}`, params || {});
    }
  } catch (err) {
    console.warn(`[Analytics:Error] Failed to log event "${name}":`, err);
  }
};

/**
 * 1. Logged when user successfully generates their very first AI reply.
 */
export const trackFirstReplyGenerated = async (meta?: { mode?: string; tone?: string }) => {
  await safeLogEvent('first_reply_generated', {
    mode: meta?.mode || 'chat',
    tone: meta?.tone || 'flirty',
  });
};

/**
 * 2. Logged when a user hits their free daily limit / paywall trigger.
 */
export const trackLimitReached = async (feature: string = 'ai_replies') => {
  await safeLogEvent('limit_reached', {
    feature,
  });
};

/**
 * 3. Logged when user opens/views the Paywall screen.
 */
export const trackPaywallViewed = async (source: string = 'app') => {
  await safeLogEvent('paywall_viewed', {
    source,
  });
};

/**
 * 4. Logged when a free trial is initiated.
 */
export const trackTrialStarted = async (meta?: { packageId?: string; productId?: string }) => {
  await safeLogEvent('trial_started', {
    package_id: meta?.packageId || 'unknown',
    product_id: meta?.productId || 'unknown',
  });
};

/**
 * 4b. Logged when a subscription is successfully purchased.
 */
export const trackSubscriptionPurchased = async (meta?: {
  packageId?: string;
  productId?: string;
  price?: number;
  currency?: string;
  isTrial?: boolean;
}) => {
  await safeLogEvent('subscription_purchased', {
    package_id: meta?.packageId || 'unknown',
    product_id: meta?.productId || 'unknown',
    price: meta?.price ?? 0,
    currency: meta?.currency || 'USD',
    is_trial: !!meta?.isTrial,
  });
};

/**
 * 5. Logged when user finishes watching a rewarded ad to earn credits.
 */
export const trackRewardedAdWatched = async (meta?: { creditsEarned?: number; source?: string }) => {
  await safeLogEvent('rewarded_ad_watched', {
    credits_earned: meta?.creditsEarned ?? 2,
    source: meta?.source || 'in_app',
  });
};
