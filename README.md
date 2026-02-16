# Sidekick - Your AI Dating Assistant

## 🎯 Overview

Sidekick is an AI-powered dating assistant mobile app that helps users craft better responses in their dating conversations. Users upload screenshots of their dating app conversations, and Sidekick's AI analyzes the context and generates multiple compelling response options tailored to their style.

**Think of it as: ChatGPT meets Grammarly for dating apps**

## 👥 Target Audience

**Primary Users:**
- Men aged 18-35 using dating apps (Tinder, Hinge, Bumble, etc.)
- People who struggle with texting anxiety or "what to say next"
- Users wanting to improve their conversation game
- Anyone looking to make better first impressions online

**User Pain Points We Solve:**
- Fear of saying the wrong thing
- Not knowing how to keep conversations interesting
- Struggling to match someone's energy/vibe
- Over-thinking messages and missing opportunities
- Need for quick, witty responses

## 🚀 Core Value Proposition

"Never wonder what to say next. Upload a screenshot, get 3 perfect responses instantly."

## ✨ Key Features

### MVP Features (Phase 1)

#### 1. **Screenshot Upload & Analysis**
- Users upload screenshots of dating conversations
- AI extracts text using OCR/Vision API
- Analyzes conversation context, tone, and vibe
- Identifies key topics and emotional cues

#### 2. **AI Response Generation**
- Generates 3 response options per request
- Different styles: Flirty, Funny, Thoughtful
- Contextually appropriate based on conversation stage
- Maintains user's authentic voice

#### 3. **Response Customization**
- Tone selector (Playful, Smooth, Bold, Casual)
- Length preference (Short, Medium, Long)
- Option to regenerate if not satisfied
- Copy-to-clipboard functionality

#### 4. **Freemium Model with Usage Limits**
- **Free Tier:** 3 responses per day
- **Pro Tier ($4.99/month):** 50 responses per day
- **Unlimited Tier ($19.99/month):** Unlimited responses (150/day fair use)
- Real-time usage tracking and display

#### 5. **Onboarding Flow**
- Quick tutorial on how to use the app
- Permission requests (camera, photos)
- Subscription upsell placement
- Example use cases

### Phase 2 Features (Future)

#### 6. **Conversation Coach**
- Analysis of why certain responses work better
- Tips on improving conversation skills
- Success rate tracking
- Weekly insights

#### 7. **Profile Optimization**
- Analyze and improve dating profile bios
- Photo selection advice
- Opening line suggestions

#### 8. **Vibe Score**
- Rate how well conversations are going
- Green/Yellow/Red flag detection
- Compatibility analysis

#### 9. **Response History**
- Save favorite responses
- Track what worked vs didn't
- Learn from past successes

#### 10. **Smart Notifications**
- Remind users when matches go cold
- Suggest best times to respond
- Re-engagement prompts

## 🏗️ Tech Stack

### Frontend
- **Framework:** React Native (Expo)
- **Package Manager:** pnpm
- **UI Library:** React Native Paper or NativeBase
- **State Management:** Zustand or React Context
- **Navigation:** React Navigation
- **Image Handling:** expo-image-picker, expo-image-manipulator

### Backend
- **BaaS:** Supabase
  - Authentication (email, social login)
  - PostgreSQL database
  - Real-time subscriptions
  - Storage (for screenshots - optional)
  - Edge Functions (for AI API calls)

### AI/ML
- **Primary Models:**
  - **Vision API:** GPT-4 Vision or Claude 3.5 Sonnet (for screenshot analysis)
  - **Text Generation:** Claude 3.5 Haiku or GPT-4o-mini (for response generation)
  - **Alternative:** Google Gemini Flash (cost optimization)
- **Strategy:** Image-to-text → Text-to-response pipeline

### Payments
- **Stripe** or **RevenueCat** for subscription management
- In-app purchase handling (iOS App Store, Google Play)

### Analytics
- **PostHog** or **Mixpanel** for product analytics
- **Sentry** for error tracking
- **Revenue Tracking:** Stripe Dashboard + custom analytics

### DevOps
- **Version Control:** Git + GitHub
- **CI/CD:** GitHub Actions or EAS Build
- **Environment Management:** Expo EAS
- **Deployment:** Expo Application Services (EAS)

## 📊 Data Models

### User Model
```typescript
interface User {
  id: string;                    // UUID
  email: string;
  created_at: timestamp;
  subscription_tier: 'free' | 'pro' | 'unlimited';
  subscription_status: 'active' | 'cancelled' | 'expired';
  subscription_end_date?: timestamp;
  
  // Usage tracking
  daily_usage_count: number;
  last_usage_reset: timestamp;
  total_responses_generated: number;
  
  // Preferences
  preferred_tone?: string;
  preferred_length?: string;
  
  // Metadata
  onboarding_completed: boolean;
  platform: 'ios' | 'android';
  app_version: string;
}
```

### Response Model
```typescript
interface Response {
  id: string;                    // UUID
  user_id: string;               // Foreign key
  created_at: timestamp;
  
  // Input
  screenshot_url?: string;       // Optional: if we store screenshots
  conversation_context: string;  // Extracted text from screenshot
  
  // Generated responses
  responses: {
    style: string;               // 'flirty', 'funny', 'thoughtful'
    text: string;
    confidence_score?: number;
  }[];
  
  // User interaction
  selected_response?: number;    // Which response they chose (0, 1, 2)
  was_regenerated: boolean;
  user_feedback?: 'thumbs_up' | 'thumbs_down';
  
  // Cost tracking
  ai_cost: number;               // For internal analytics
  model_used: string;
}
```

### Subscription Model
```typescript
interface Subscription {
  id: string;
  user_id: string;
  tier: 'free' | 'pro' | 'unlimited';
  status: 'active' | 'past_due' | 'cancelled' | 'expired';
  
  // Stripe/RevenueCat data
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  
  // Billing
  current_period_start: timestamp;
  current_period_end: timestamp;
  cancel_at_period_end: boolean;
  
  // Metadata
  created_at: timestamp;
  updated_at: timestamp;
}
```

### Usage Tracking Model
```typescript
interface DailyUsage {
  id: string;
  user_id: string;
  date: date;                    // YYYY-MM-DD
  response_count: number;
  tier: string;
  
  created_at: timestamp;
}
```

### Analytics Events Model (for PostHog/Mixpanel)
```typescript
interface AnalyticsEvent {
  // User events
  'app_opened'
  'screenshot_uploaded'
  'response_generated'
  'response_selected'
  'response_copied'
  'regenerate_clicked'
  
  // Subscription events
  'paywall_viewed'
  'subscription_started'
  'subscription_cancelled'
  'free_limit_reached'
  
  // Engagement events
  'onboarding_completed'
  'settings_viewed'
  'feedback_submitted'
}
```

## 🎨 App Structure

```
sidekick/
├── app/                        # Expo Router (or screens/)
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── signup.tsx
│   ├── (tabs)/
│   │   ├── home.tsx           # Main screenshot upload screen
│   │   ├── history.tsx        # Past responses (Phase 2)
│   │   └── profile.tsx        # Settings, subscription
│   ├── onboarding.tsx
│   ├── paywall.tsx
│   └── response-result.tsx    # Shows 3 AI responses
├── components/
│   ├── ScreenshotUploader.tsx
│   ├── ResponseCard.tsx
│   ├── ToneSelector.tsx
│   ├── UsageMeter.tsx
│   └── SubscriptionBadge.tsx
├── services/
│   ├── supabase.ts            # Supabase client setup
│   ├── ai.ts                  # AI API calls (Claude/GPT)
│   ├── subscription.ts        # Stripe/RevenueCat logic
│   └── analytics.ts           # PostHog/Mixpanel
├── hooks/
│   ├── useUser.ts
│   ├── useSubscription.ts
│   └── useUsageLimit.ts
├── utils/
│   ├── imageProcessing.ts
│   └── textExtraction.ts
├── constants/
│   └── config.ts              # API keys, limits, pricing
└── types/
    └── index.ts               # TypeScript interfaces
```

## 🔐 Environment Variables

```env
# Supabase
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=

# AI APIs (choose one or multiple)
ANTHROPIC_API_KEY=              # For Claude
OPENAI_API_KEY=                 # For GPT
GOOGLE_AI_API_KEY=              # For Gemini

# Payments
STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
REVENUECAT_API_KEY=

# Analytics
POSTHOG_API_KEY=
SENTRY_DSN=
```

## 💰 Monetization Strategy

### Pricing Tiers

| Tier | Price | Daily Limit | Monthly Limit | Target User |
|------|-------|-------------|---------------|-------------|
| **Free** | $0 | 3 responses | ~90 | Curious users, trial |
| **Pro** | $4.99/mo | 50 responses | ~1,500 | Regular daters |
| **Unlimited** | $19.99/mo | 150 fair use | Unlimited | Power users |

### Cost Analysis (Per User)

**AI Costs (using Claude Haiku):**
- Free user: ~$0.90/month (3/day × 30 × $0.01)
- Pro user: ~$15/month (50/day × 30 × $0.01) ⚠️ Need optimization
- Unlimited: Variable, need fair use policy

**Cost Optimization Strategies:**
1. Use cheaper models (Gemini Flash: $0.002/request)
2. Cache common conversation patterns
3. Batch requests where possible
4. Implement smart rate limiting
5. Use edge functions to minimize latency

**Target Margins:**
- Pro tier: Need to get AI cost to $2-3/user
- Unlimited tier: Profitable at <100 requests/day average

## 🚦 Implementation Phases

### Week 1-2: Foundation
- [x] Expo project setup with pnpm
- [ ] Supabase project creation and database schema
- [ ] Authentication flow (email + Google/Apple)
- [ ] Basic navigation structure
- [ ] Environment configuration

### Week 3-4: Core Features
- [ ] Screenshot upload functionality
- [ ] AI integration (image analysis + response generation)
- [ ] Response display UI (3 options)
- [ ] Copy-to-clipboard
- [ ] Basic usage tracking

### Week 5-6: Monetization
- [ ] Usage limit enforcement
- [ ] Paywall design and flow
- [ ] Stripe/RevenueCat integration
- [ ] Subscription management
- [ ] In-app purchase testing

### Week 7-8: Polish & Launch
- [ ] Onboarding flow
- [ ] Analytics integration
- [ ] Error handling and edge cases
- [ ] Performance optimization
- [ ] App Store assets (screenshots, description)
- [ ] TestFlight beta testing
- [ ] Submit to App Store & Play Store

## 📱 User Flow

1. **First Time User**
   - Download app → Create account → Onboarding (3 screens)
   - Try free screenshot → See 3 responses → Copy & use
   - Get hooked → Hit free limit → See paywall

2. **Paid User Journey**
   - Open app → Upload screenshot → Get responses instantly
   - Select tone/style if desired → Copy favorite
   - Track usage in profile → Renews monthly

3. **Retention Loop**
   - User has date → Conversation goes well → Credits Sidekick
   - Shares with friends (referral potential)
   - Becomes habitual tool for dating apps

## 🎯 Success Metrics

### Product KPIs
- **DAU/MAU ratio:** Target 0.4+ (daily active users)
- **Conversion rate:** Free → Paid (target 5-10%)
- **Retention:** D7, D30 retention rates
- **Churn:** Monthly churn <5%

### Revenue KPIs
- **MRR:** Monthly Recurring Revenue
- **ARPU:** Average Revenue Per User
- **CAC:** Customer Acquisition Cost (via TikTok ads)
- **LTV:CAC ratio:** Target 3:1

### Usage KPIs
- Screenshots uploaded per user
- Responses generated per day
- Time to first value (<2 minutes)
- Response selection rate (which style wins)

## 🎨 Design Principles

1. **Fast & Frictionless:** User should get responses in <10 seconds
2. **No Judgement:** Friendly, supportive tone throughout
3. **Privacy First:** Don't store screenshots unless user opts in
4. **Clear Value:** Usage meter always visible
5. **Encouraging:** Celebrate user wins, gentle on limits

## 🔒 Privacy & Security

- **No screenshot storage by default** (process and delete)
- **End-to-end encryption** for sensitive data
- **Compliance:** GDPR, CCPA ready
- **Terms of Service:** Clear about AI usage
- **Age verification:** 18+ only

## 📈 Marketing Strategy (Post-Launch)

### Primary Channel: TikTok
- Partner with "rizz" content creators
- Pay $50-100 per shoutout
- Target faceless accounts with 50K-500K followers
- Track conversion with promo codes

### Secondary Channels
- Reddit (r/Tinder, r/dating_advice, r/OnlineDating)
- Instagram Reels (rizz content)
- Product Hunt launch
- Referral program (Phase 2)

## 🤝 Contributing

This is a solo project initially, but open to feedback and suggestions.

## 📄 License

Proprietary - All rights reserved

---

**Built with ❤️ for people who want to be their best selves in dating.**

Last Updated: February 2026