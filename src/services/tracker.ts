/**
 * RoomReady Google Analytics 4 (GA4) Integration
 * 
 * Uses official Google tag (gtag.js) architecture.
 * Safely reads VITE_GA4_MEASUREMENT_ID from environment (defaults to G-PSJZMCEZY1).
 * If no measurement ID is configured or if an ad-blocker blocks gtag,
 * all functions cleanly and silently no-op without affecting UI functionality.
 * 
 * Privacy & Safety Guarantees:
 * - Never transmits user photos, base64 data, personal identity, or sensitive info.
 * - Only transmits non-sensitive contextual parameters (room type, style, budget tier, product IDs).
 * - Avoids duplicate page views via controlled config flags.
 */

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

// Configurable GA4 Measurement ID from environment or setting (e.g. G-PSJZMCEZY1)
export const GA4_MEASUREMENT_ID = (
  typeof import.meta.env.VITE_GA4_MEASUREMENT_ID === 'string' && import.meta.env.VITE_GA4_MEASUREMENT_ID.trim().length > 0
    ? import.meta.env.VITE_GA4_MEASUREMENT_ID
    : 'G-PSJZMCEZY1'
).trim();

let activeMeasurementId = GA4_MEASUREMENT_ID;
let isInitialized = false;

export function setCustomMeasurementId(newId: string): void {
  activeMeasurementId = (newId || '').trim();
  if (activeMeasurementId && !isInitialized) {
    initGA4();
  }
}

export function getActiveMeasurementId(): string {
  return activeMeasurementId;
}

/**
 * Initializes the official Google tag (gtag.js) asynchronously.
 * Safe to call multiple times (idempotent).
 */
export function initGA4(): void {
  if (typeof window === 'undefined') return;
  if (isInitialized) return;

  const targetId = activeMeasurementId || GA4_MEASUREMENT_ID;

  // If no Measurement ID is configured, leave analytics disabled in safe offline mode
  if (!targetId) {
    if (import.meta.env.DEV) {
      console.info(
        '[RoomReady GA4] No GA4_MEASUREMENT_ID configured. Operating in safe offline/no-op mode.'
      );
    }
    return;
  }

  try {
    // Avoid duplicate script tag injection
    if (!document.getElementById('ga4-gtag-script')) {
      const script = document.createElement('script');
      script.id = 'ga4-gtag-script';
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(targetId)}`;
      document.head.appendChild(script);
    }

    // Set up dataLayer and gtag function
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer?.push(arguments);
    };

    window.gtag('js', new Date());
    // Initial configuration with single page view
    window.gtag('config', targetId, {
      send_page_view: true,
      anonymize_ip: true,
      cookie_flags: 'SameSite=None;Secure',
    });

    isInitialized = true;

    if (import.meta.env.DEV) {
      console.info(`[RoomReady GA4] Initialized gtag.js with ID: ${targetId}`);
    }
  } catch (err) {
    // If blocked by ad-blocker or CSP, silently handle error without disrupting application
    console.warn('[RoomReady GA4] Failed to load gtag script (likely ad-blocker):', err);
  }
}

/**
 * Sanitize parameters to guarantee no images, base64 strings, passwords, or PII ever reach GA4.
 */
function sanitizeParams(params?: Record<string, any>): Record<string, any> {
  if (!params) return {};
  const cleaned: Record<string, any> = {};

  const forbiddenKeys = ['image', 'photo', 'base64', 'email', 'name_full', 'user', 'password', 'token', 'secret'];

  for (const [key, value] of Object.entries(params)) {
    const lowerKey = key.toLowerCase();
    const isForbidden = forbiddenKeys.some(
      (f) => lowerKey.includes(f) && !lowerKey.includes('item_name') && !lowerKey.includes('productname')
    );

    if (isForbidden) continue;

    if (typeof value === 'string') {
      // Discard strings that look like base64 payloads or exceed 100 characters
      if (value.startsWith('data:image') || value.length > 100) continue;
      cleaned[key] = value;
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      cleaned[key] = value;
    }
  }

  return cleaned;
}

/**
 * Dispatches a standard or custom event to GA4 via gtag('event', ...).
 */
export function trackGAEvent(eventName: string, params?: Record<string, any>): void {
  const safeParams = sanitizeParams(params);

  // Trace in development console for verification and debugging
  if (import.meta.env.DEV) {
    console.log(`[RoomReady GA4 Event]: ${eventName}`, safeParams);
  }

  if (typeof window === 'undefined') return;

  const targetId = activeMeasurementId || GA4_MEASUREMENT_ID;

  if (typeof window.gtag === 'function' && targetId) {
    try {
      window.gtag('event', eventName, safeParams);
    } catch (err) {
      // Never throw on analytics error
      console.warn('[RoomReady GA4] Event dispatch failed:', err);
    }
  }
}

/**
 * 1. room_photo_uploaded
 */
export function trackRoomPhotoUploaded(params: {
  room_type: string;
  style: string;
  file_extension: string;
}): void {
  trackGAEvent('room_photo_uploaded', params);
}

/**
 * 2. room_analysis_started
 */
export function trackRoomAnalysisStarted(params: {
  room_type: string;
  style: string;
  budget_inr: number;
  palette: string;
  room_area_sqm?: number;
}): void {
  trackGAEvent('room_analysis_started', params);
}

/**
 * 3. room_analysis_completed
 */
export function trackRoomAnalysisCompleted(params: {
  room_type: string;
  style: string;
  recommendation_count: number;
  analysis_source: string;
}): void {
  trackGAEvent('room_analysis_completed', params);
}

/**
 * 4. room_makeover_requested
 */
export function trackRoomMakeoverRequested(params: {
  room_type: string;
  style: string;
  budget_inr: number;
  palette: string;
  room_width_m?: number;
  room_length_m?: number;
}): void {
  trackGAEvent('room_makeover_requested', params);
}

/**
 * 5. recommendations_viewed
 */
export function trackRecommendationsViewed(params: {
  room_type: string;
  style: string;
  product_count: number;
}): void {
  trackGAEvent('recommendations_viewed', params);
}

/**
 * 6. product_clicked (IKEA outbound links)
 */
export function trackProductClicked(params: {
  item_id: string;
  item_name: string;
  item_category: string;
  price_inr: number;
}): void {
  trackGAEvent('product_clicked', params);
}

/**
 * 7. budget_selected
 */
export function trackBudgetSelected(params: {
  budget_inr: number;
  room_type: string;
  style: string;
}): void {
  trackGAEvent('budget_selected', params);
}

/**
 * Backward compatibility alias for existing calls
 */
export function trackEvent(type: string, payload?: Record<string, any>): void {
  trackGAEvent(type, payload);
}
