// Cookie management utilities for AcademOra

export interface CookiePreferences {
  necessary: boolean; // Always true for essential cookies
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
  lastUpdated: string;
  version: string;
}

export interface CookieSettings {
  showConsent: boolean;
  preferences: CookiePreferences;
}

export const DEFAULT_COOKIE_PREFERENCES: CookiePreferences = {
  necessary: true, // Essential cookies (authentication, session)
  functional: false, // User preferences, language, etc.
  analytics: false, // Google Analytics, etc.
  marketing: false, // Third-party marketing cookies
  preferences: false, // Theme, layout preferences
  lastUpdated: new Date().toISOString(),
  version: '1.0'
};

export const COOKIE_CATEGORIES = {
  necessary: {
    name: 'Essential Cookies',
    description: 'Required for the website to function properly, including authentication and security.',
    required: true
  },
  functional: {
    name: 'Functional Cookies',
    description: 'Enable enhanced functionality and personalization, such as language preferences and user settings.',
    required: false
  },
  analytics: {
    name: 'Analytics Cookies',
    description: 'Help us understand how visitors interact with our website by collecting and reporting information anonymously.',
    required: false
  },
  marketing: {
    name: 'Marketing Cookies',
    description: 'Used to track visitors across websites to display relevant advertisements and marketing campaigns.',
    required: false
  },
  preferences: {
    name: 'Preference Cookies',
    description: 'Remember your user preferences and settings to provide a more personalized experience.',
    required: false
  }
} as const;

// Cookie utility functions
export class CookieManager {
  private static readonly CONSENT_KEY = 'academora_cookie_consent';
  private static readonly PREFERENCES_KEY = 'academora_cookie_preferences';
  private static readonly CONSENT_VERSION = '1.0';

  // Get a cookie value
  static getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  }

  // Set a cookie with options
  static setCookie(name: string, value: string, options: {
    days?: number;
    hours?: number;
    minutes?: number;
    path?: string;
    domain?: string;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
  } = {}): void {
    if (typeof document === 'undefined') return;

    const { days, hours, minutes, path = '/', domain, secure = true, sameSite = 'lax' } = options;
    
    let expires = '';
    if (days || hours || minutes) {
      const date = new Date();
      const totalMinutes = (days || 0) * 24 * 60 + (hours || 0) * 60 + (minutes || 0);
      date.setTime(date.getTime() + totalMinutes * 60 * 1000);
      expires = `; expires=${date.toUTCString()}`;
    }

    let cookieString = `${name}=${value}${expires}; path=${path}`;
    
    if (domain) {
      cookieString += `; domain=${domain}`;
    }
    
    if (secure) {
      cookieString += '; secure';
    }
    
    if (sameSite) {
      cookieString += `; samesite=${sameSite}`;
    }

    document.cookie = cookieString;
  }

  // Delete a cookie
  static deleteCookie(name: string, path: string = '/'): void {
    if (typeof document === 'undefined') return;
    
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}`;
  }

  // Check if user has given consent
  static hasConsent(): boolean {
    const consent = localStorage.getItem(this.CONSENT_KEY);
    if (!consent) return false;
    
    const consentData = JSON.parse(consent);
    return consentData.version === this.CONSENT_VERSION && consentData.given === true;
  }

  // Get user's cookie preferences
  static getPreferences(): CookiePreferences {
    const stored = localStorage.getItem(this.PREFERENCES_KEY);
    if (stored) {
      try {
        const prefs = JSON.parse(stored);
        if (prefs.version === this.CONSENT_VERSION) {
          return { ...DEFAULT_COOKIE_PREFERENCES, ...prefs };
        }
      } catch (error) {
        console.warn('Invalid cookie preferences found, using defaults');
      }
    }
    return DEFAULT_COOKIE_PREFERENCES;
  }

  // Save user's cookie preferences
  static savePreferences(preferences: Partial<CookiePreferences>): void {
    const updatedPreferences: CookiePreferences = {
      ...this.getPreferences(),
      ...preferences,
      lastUpdated: new Date().toISOString(),
      version: this.CONSENT_VERSION
    };

    localStorage.setItem(this.PREFERENCES_KEY, JSON.stringify(updatedPreferences));
    
    // Save consent timestamp
    localStorage.setItem(this.CONSENT_KEY, JSON.stringify({
      given: true,
      timestamp: new Date().toISOString(),
      version: this.CONSENT_VERSION
    }));

    // Apply preferences immediately
    this.applyPreferences(updatedPreferences);
  }

  // Apply cookie preferences (set necessary cookies, remove non-consented ones)
  static applyPreferences(preferences: CookiePreferences): void {
    // Always keep necessary cookies
    if (preferences.necessary) {
      // Ensure authentication token cookie exists if user is logged in
      const token = localStorage.getItem('token');
      if (token) {
        this.setCookie('auth_token', token, { days: 30 });
      }
    }

    // Remove non-consented category cookies
    if (!preferences.functional) {
      this.deleteCookie('user_preferences');
      this.deleteCookie('theme');
      this.deleteCookie('language');
    }

    if (!preferences.analytics) {
      this.deleteCookie('_ga');
      this.deleteCookie('_gid');
      this.deleteCookie('_gat');
    }

    if (!preferences.marketing) {
      this.deleteCookie('fb_pixel');
      this.deleteCookie('linkedin_insight');
    }

    if (!preferences.preferences) {
      this.deleteCookie('layout_settings');
      this.deleteCookie('dashboard_config');
    }
  }

  // Check if specific category is allowed
  static isCategoryAllowed(category: keyof CookiePreferences): boolean {
    const preferences = this.getPreferences();
    return Boolean(preferences[category]);
  }

  // Reset all cookie preferences
  static resetPreferences(): void {
    localStorage.removeItem(this.CONSENT_KEY);
    localStorage.removeItem(this.PREFERENCES_KEY);
    
    // Remove all application cookies
    const cookies = ['auth_token', 'user_preferences', 'theme', 'language', '_ga', '_gid', '_gat', 'fb_pixel', 'linkedin_insight', 'layout_settings', 'dashboard_config'];
    cookies.forEach(cookie => this.deleteCookie(cookie));
  }

  // Initialize cookie management on app start
  static initialize(): void {
    if (this.hasConsent()) {
      this.applyPreferences(this.getPreferences());
    }
  }

  // Get cookie settings for UI
  static getSettings(): CookieSettings {
    return {
      showConsent: !this.hasConsent(),
      preferences: this.getPreferences()
    };
  }
}

// Export convenience functions
export const {
  getCookie,
  setCookie,
  deleteCookie,
  hasConsent,
  getPreferences,
  savePreferences,
  applyPreferences,
  isCategoryAllowed,
  resetPreferences,
  initialize,
  getSettings
} = CookieManager;
