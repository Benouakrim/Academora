import React, { useState, useEffect } from 'react';
import { Cookie, Shield, BarChart, Megaphone, User, Settings, Download, Trash2, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { CookieManager, CookiePreferences, COOKIE_CATEGORIES } from '../../lib/cookies';

interface CookieAnalytics {
  totalUsers: number;
  consentRate: number;
  categoryAcceptance: Record<string, number>;
  recentActivity: Array<{
    timestamp: string;
    action: string;
    userAgent?: string;
  }>;
}

export default function AdminCookieManager() {
  const [analytics, setAnalytics] = useState<CookieAnalytics>({
    totalUsers: 0,
    consentRate: 0,
    categoryAcceptance: {},
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [previewPreferences, setPreviewPreferences] = useState<CookiePreferences>(CookieManager.getPreferences());

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would fetch from your backend API
      // For now, we'll simulate the data
      const mockAnalytics: CookieAnalytics = {
        totalUsers: 1250,
        consentRate: 78.5,
        categoryAcceptance: {
          necessary: 100,
          functional: 65,
          analytics: 45,
          marketing: 28,
          preferences: 72
        },
        recentActivity: [
          {
            timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
            action: 'User accepted all cookies',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
          },
          {
            timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
            action: 'User customized preferences',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
          },
          {
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            action: 'User accepted necessary only',
            userAgent: 'Mozilla/5.0 (X11; Linux x86_64)'
          }
        ]
      };
      
      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    const data = {
      analytics,
      cookieSettings: CookieManager.getSettings(),
      categories: COOKIE_CATEGORIES,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cookie-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetAllUserPreferences = async () => {
    if (confirm('Are you sure you want to reset all user cookie preferences? This will require all users to consent again.')) {
      try {
        // In a real implementation, this would call your backend API
        CookieManager.resetPreferences();
        alert('All cookie preferences have been reset. Users will be asked to consent again on their next visit.');
        loadAnalytics();
      } catch (error) {
        console.error('Failed to reset preferences:', error);
        alert('Failed to reset preferences. Please try again.');
      }
    }
  };

  const updatePreviewPreferences = (category: keyof CookiePreferences, value: boolean) => {
    if (category === 'necessary') return;
    setPreviewPreferences(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const applyPreviewToAllUsers = async () => {
    if (confirm('Are you sure you want to apply these preferences to all users? This will override their individual choices.')) {
      try {
        // In a real implementation, this would call your backend API
        console.log('Applying preferences to all users:', previewPreferences);
        alert('Preferences have been applied to all users.');
        loadAnalytics();
      } catch (error) {
        console.error('Failed to apply preferences:', error);
        alert('Failed to apply preferences. Please try again.');
      }
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cookie Management</h1>
          <p className="text-gray-600 mt-1">Manage user cookie preferences and view analytics</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
          <button
            onClick={exportData}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Data
          </button>
          <button
            onClick={loadAnalytics}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{analytics.totalUsers.toLocaleString()}</p>
            </div>
            <User className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Consent Rate</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{analytics.consentRate}%</p>
            </div>
            <Cookie className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Recent Activity</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{analytics.recentActivity.length}</p>
            </div>
            <BarChart className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Category Acceptance */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Category Acceptance Rate</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {Object.entries(COOKIE_CATEGORIES).map(([key, category]) => {
              const acceptanceRate = analytics.categoryAcceptance[key] || 0;
              return (
                <div key={key} className="flex items-center gap-4">
                  <div className="flex items-center gap-2 flex-shrink-0 w-32">
                    <div className="text-blue-600">
                      {getCategoryIcon(key)}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{category.name}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${acceptanceRate}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-12 text-right">
                        {acceptanceRate}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Preview Section */}
      {showPreview && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Preview & Bulk Settings</h2>
            <p className="text-sm text-gray-600 mt-1">Configure default preferences and apply to all users</p>
          </div>
          <div className="p-6">
            <div className="space-y-4 mb-6">
              {Object.entries(COOKIE_CATEGORIES).map(([key, category]) => {
                const categoryKey = key as keyof CookiePreferences;
                const isEnabled = previewPreferences[categoryKey];
                const isRequired = category.required;

                return (
                  <div key={key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-blue-600">
                        {getCategoryIcon(key)}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {category.name}
                          {isRequired && (
                            <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              Always required
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-600">{category.description}</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={(e) => updatePreviewPreferences(categoryKey, e.target.checked)}
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
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                <p>These settings will be applied as default preferences for new users</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={resetAllUserPreferences}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Reset All Users
                </button>
                <button
                  onClick={applyPreviewToAllUsers}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                >
                  Apply to All Users
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {analytics.recentActivity.map((activity, index) => (
            <div key={index} className="px-6 py-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                  {activity.userAgent && (
                    <p className="text-xs text-gray-400 mt-1 font-mono">
                      {activity.userAgent}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
