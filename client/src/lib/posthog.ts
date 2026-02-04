// PostHog stub for local development
// Replace with actual PostHog integration when deploying

export const initPostHog = () => {
    console.log("[PostHog Stub] PostHog not initialized in development");
};

export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
    // Log to console in dev
    console.log(`[Analytics] ${eventName}`, properties);
};

export const getFeatureFlag = (key: string) => {
    return null;
};
