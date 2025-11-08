import React, { useState, useEffect } from 'react';
import { X, Settings, Cookie, Shield, BarChart, Megaphone, User } from 'lucide-react';
import { CookieManager, CookiePreferences, COOKIE_CATEGORIES } from '../lib/cookies';

interface CookieConsentProps {
  onPreferencesChange?: (preferences: CookiePreferences) => void;
}

export default function CookieConsent({ onPreferencesChange }: CookieConsentProps) {
  const [showConsent, setShowConsent] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(CookieManager.getPreferences());
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const settings = CookieManager.getSettings();
    setShowConsent(settings.showConsent);
  }, []);

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      ...preferences,
      functional: true,
      analytics: true,
      marketing: true,
      preferences: true,
      lastUpdated: new Date().toISOString(),
      version: '1.0'
    };
    
    setPreferences(allAccepted);
    CookieManager.savePreferences(allAccepted);
    setShowConsent(false);
    onPreferencesChange?.(allAccepted);
  };

  const handleAcceptNecessary = () => {
    const necessaryOnly: CookiePreferences = {
      ...preferences,
      functional: false,
      analytics: false,
      marketing: false,
      preferences: false,
      lastUpdated: new Date().toISOString(),
      version: '1.0'
    };
    
    setPreferences(necessaryOnly);
    CookieManager.savePreferences(necessaryOnly);
    setShowConsent(false);
    onPreferencesChange?.(necessaryOnly);
  };

  const handleSavePreferences = () => {
    CookieManager.savePreferences(preferences);
    setShowConsent(false);
    setShowSettings(false);
    onPreferencesChange?.(preferences);
  };

  const handlePreferenceChange = (category: keyof CookiePreferences, value: boolean) => {
    if (category === 'necessary') return; // Can't change necessary cookies
    setPreferences(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'necessary': return <Shield className="w-5 h-5" />;
      case 'functional': return <User className="w-5 h-5" />;
      case 'analytics': return <BarChart className="w-5 h-5" />;
      case 'marketing': return <Megaphone className="w-5 h-5" />;
      case 'preferences': return <Settings className="w-5 h-5" />;
      default: return <Cookie className="w-5 h-5" />;
    }
  };

  if (!showConsent && !showSettings) return null;

  return (
    <>
      {/* Main Consent Banner */}
      {showConsent && !showSettings && (
        <div className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 transition-all duration-300 ${isAnimating ? 'translate-y-full' : 'translate-y-0'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <Cookie className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Cookie Consent
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    We use cookies to enhance your experience, analyze site traffic, and personalize content. 
                    By clicking "Accept All", you consent to our use of cookies.
                  </p>
                  <button
                    onClick={() => setShowSettings(true)}
                    className="text-sm text-blue-600 hover:text-blue-700 underline"
                  >
                    Customize your preferences
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={handleAcceptNecessary}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Necessary only
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                >
                  Accept All
                </button>
                <button
                  onClick={() => {
                    setIsAnimating(true);
                    setTimeout(() => setShowConsent(false), 300);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Settings Modal */}
      {(showSettings || (!showConsent && showSettings)) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Cookie className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    Cookie Preferences
                  </h2>
                </div>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="px-6 py-4">
              <p className="text-sm text-gray-600 mb-6">
                We use different types of cookies to provide you with the best experience on our website. 
                You can choose which types of cookies you allow below.
              </p>

              <div className="space-y-4 mb-6">
                {Object.entries(COOKIE_CATEGORIES).map(([key, category]) => {
                  const categoryKey = key as keyof CookiePreferences;
                  const isEnabled = preferences[categoryKey];
                  const isRequired = category.required;

                  return (
                    <div key={key} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="text-blue-600 mt-1">
                          {getCategoryIcon(key)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium text-gray-900">
                              {category.name}
                              {isRequired && (
                                <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                  Always required
                                </span>
                              )}
                            </h3>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isEnabled}
                                onChange={(e) => handlePreferenceChange(categoryKey, e.target.checked)}
                                disabled={isRequired}
                                className="sr-only peer"
                              />
                              <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-disabled:opacity-50 peer-disabled:cursor-not-allowed ${
                                isRequired ? 'peer-disabled:bg-blue-100' : ''
                              } ${
                                isEnabled ? 'peer-checked:bg-blue-600' : ''
                              } transition-colors`}>
                                <div className={`absolute top-[2px] left-[2px] bg-white border-gray-300 rounded-full h-5 w-5 transition-transform ${
                                  isEnabled ? 'translate-x-full' : ''
                                } ${
                                  isRequired ? 'border-blue-400' : ''
                                }`}></div>
                              </div>
                            </label>
                          </div>
                          <p className="text-sm text-gray-600">
                            {category.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  <p>Last updated: {new Date(preferences.lastUpdated).toLocaleDateString()}</p>
                  <p>Version: {preferences.version}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => CookieManager.resetPreferences()}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    Reset to default
                  </button>
                  <button
                    onClick={handleSavePreferences}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                  >
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Button (always visible in corner when consent is given) */}
      {!showConsent && CookieManager.hasConsent() && (
        <button
          onClick={() => setShowSettings(true)}
          className="fixed bottom-4 right-4 p-3 bg-white border border-gray-200 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-40 group"
          title="Cookie Settings"
        >
          <Cookie className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
        </button>
      )}
    </>
  );
}
