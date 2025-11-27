import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import {
  Users,
  Gift,
  TrendingUp,
  Search,
  Download,
  Settings,
  Award,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
} from 'lucide-react';

interface Stats {
  total_referrals: number;
  completed_referrals: number;
  pending_referrals: number;
  total_rewards_given: number;
  active_codes: number;
  unique_referrers: number;
}

interface TopReferrer {
  user_id: string;
  email: string;
  referral_count: number;
  completed_count: number;
}

interface Referral {
  id: string;
  code: string;
  referrer_email: string;
  referred_email: string;
  status: 'pending' | 'completed';
  created_at: string;
  completed_at?: string;
}

interface ReferralCode {
  code: string;
  user_email: string;
  uses_count: number;
  is_active: boolean;
  created_at: string;
}

interface ReferralSettings {
  rewards_enabled: boolean;
  points_per_referral: number;
  min_referrals_for_reward: number;
  max_uses_per_code: number;
  code_expiry_days: number;
}

const AdminReferrals: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'referrals' | 'codes' | 'settings'>('overview');
  
  // Get token from Clerk (fresh token each time)
  const { getToken } = useAuth();

  // Overview state
  const [stats, setStats] = useState<Stats | null>(null);
  const [topReferrers, setTopReferrers] = useState<TopReferrer[]>([]);

  // Referrals state
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [referralsPage, setReferralsPage] = useState(1);
  const [referralsTotal, setReferralsTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');

  // Codes state
  const [codes, setCodes] = useState<ReferralCode[]>([]);

  // Settings state
  const [settings, setSettings] = useState<ReferralSettings | null>(null);
  const [settingsChanged, setSettingsChanged] = useState(false);

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchOverviewData();
    } else if (activeTab === 'referrals') {
      fetchReferrals();
    } else if (activeTab === 'codes') {
      fetchCodes();
    } else if (activeTab === 'settings') {
      fetchSettings();
    }
  }, [activeTab, referralsPage, searchTerm, statusFilter]);

  const fetchOverviewData = async () => {
    // Get fresh token right before API call (tokens expire quickly)
    const token = await getToken({ skipCache: true });
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch('/api/admin/referrals/stats', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setTopReferrers(data.top_referrers || []);
      }
    } catch (err) {
      console.error('Error fetching overview:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReferrals = async () => {
    // Get fresh token right before API call (tokens expire quickly)
    const token = await getToken({ skipCache: true });
    if (!token) return;

    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: referralsPage.toString(),
        limit: '20',
      });

      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await fetch(`/api/admin/referrals/all?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setReferrals(data.referrals || []);
        setReferralsTotal(data.total || 0);
      }
    } catch (err) {
      console.error('Error fetching referrals:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCodes = async () => {
    // Get fresh token right before API call (tokens expire quickly)
    const token = await getToken({ skipCache: true });
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch('/api/admin/referrals/codes', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCodes(data.codes || []);
      }
    } catch (err) {
      console.error('Error fetching codes:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    // Get fresh token right before API call (tokens expire quickly)
    const token = await getToken({ skipCache: true });
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch('/api/admin/referrals/settings', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleCodeStatus = async (code: string, currentStatus: boolean) => {
    // Get fresh token right before API call (tokens expire quickly)
    const token = await getToken({ skipCache: true });
    if (!token) return;

    try {
      const response = await fetch(`/api/admin/referrals/codes/${code}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active: !currentStatus }),
      });

      if (response.ok) {
        fetchCodes();
      }
    } catch (err) {
      console.error('Error toggling code status:', err);
    }
  };

  const saveSettings = async () => {
    // Get fresh token right before API call (tokens expire quickly)
    const token = await getToken({ skipCache: true });
    if (!token || !settings) return;

    try {
      const response = await fetch('/api/admin/referrals/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setSettingsChanged(false);
        alert('Settings saved successfully!');
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      alert('Failed to save settings');
    }
  };

  const exportData = () => {
    // Simple CSV export
    let csv = 'Code,Referrer,Referred,Status,Created,Completed\n';
    referrals.forEach((ref) => {
      csv += `${ref.code},${ref.referrer_email},${ref.referred_email},${ref.status},${ref.created_at},${ref.completed_at || ''}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `referrals-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const renderOverview = () => (
    <div>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Referrals</p>
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats?.total_referrals || 0}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Completed</p>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-600">{stats?.completed_referrals || 0}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Pending</p>
            <Clock className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-2xl font-bold text-yellow-600">{stats?.pending_referrals || 0}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Rewards Given</p>
            <Gift className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-purple-600">{stats?.total_rewards_given || 0}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Active Codes</p>
            <TrendingUp className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-indigo-600">{stats?.active_codes || 0}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Unique Referrers</p>
            <Award className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-orange-600">{stats?.unique_referrers || 0}</p>
        </div>
      </div>

      {/* Top Referrers */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Award className="w-6 h-6 mr-2 text-orange-600" />
          Top Referrers
        </h3>

        {topReferrers.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No referrers yet</p>
        ) : (
          <div className="space-y-3">
            {topReferrers.map((referrer, index) => (
              <div key={referrer.user_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{referrer.email}</p>
                    <p className="text-sm text-gray-500">
                      {referrer.completed_count} completed of {referrer.referral_count} total
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-orange-600">{referrer.referral_count}</p>
                  <p className="text-sm text-gray-500">referrals</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderReferrals = () => (
    <div>
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by email or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>

            <button
              onClick={exportData}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Referrals Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Referrer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Referred User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Completed
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {referrals.map((referral) => (
                <tr key={referral.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono text-sm font-medium text-blue-600">
                      {referral.code}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{referral.referrer_email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{referral.referred_email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {referral.status === 'completed' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(referral.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {referral.completed_at
                      ? new Date(referral.completed_at).toLocaleDateString()
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {referralsTotal > 20 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-700">
              Showing {(referralsPage - 1) * 20 + 1} to{' '}
              {Math.min(referralsPage * 20, referralsTotal)} of {referralsTotal} results
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setReferralsPage((p) => Math.max(1, p - 1))}
                disabled={referralsPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => setReferralsPage((p) => p + 1)}
                disabled={referralsPage * 20 >= referralsTotal}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderCodes = () => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Uses
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {codes.map((code) => (
              <tr key={code.code} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="font-mono text-sm font-medium text-blue-600">{code.code}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">{code.user_email}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">{code.uses_count}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {code.is_active ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <XCircle className="w-3 h-3 mr-1" />
                      Inactive
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(code.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => toggleCodeStatus(code.code, code.is_active)}
                    className={`px-3 py-1 rounded-lg transition-colors ${
                      code.is_active
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {code.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
        <Settings className="w-6 h-6 mr-2" />
        Referral System Settings
      </h3>

      {settings && (
        <div className="space-y-6">
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.rewards_enabled}
                onChange={(e) => {
                  setSettings({ ...settings, rewards_enabled: e.target.checked });
                  setSettingsChanged(true);
                }}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">Enable Rewards System</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Points Per Referral
            </label>
            <input
              type="number"
              value={settings.points_per_referral}
              onChange={(e) => {
                setSettings({ ...settings, points_per_referral: parseInt(e.target.value) || 0 });
                setSettingsChanged(true);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Referrals for Reward
            </label>
            <input
              type="number"
              value={settings.min_referrals_for_reward}
              onChange={(e) => {
                setSettings({
                  ...settings,
                  min_referrals_for_reward: parseInt(e.target.value) || 0,
                });
                setSettingsChanged(true);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Uses Per Code (0 = unlimited)
            </label>
            <input
              type="number"
              value={settings.max_uses_per_code}
              onChange={(e) => {
                setSettings({ ...settings, max_uses_per_code: parseInt(e.target.value) || 0 });
                setSettingsChanged(true);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Code Expiry Days (0 = never expires)
            </label>
            <input
              type="number"
              value={settings.code_expiry_days}
              onChange={(e) => {
                setSettings({ ...settings, code_expiry_days: parseInt(e.target.value) || 0 });
                setSettingsChanged(true);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="pt-4">
            <button
              onClick={saveSettings}
              disabled={!settingsChanged}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <Settings className="w-5 h-5 mr-2" />
              Save Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Referral Management</h1>
          <p className="text-lg text-gray-600">Manage referral codes, track performance, and configure rewards</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <TrendingUp className="w-5 h-5 inline mr-2" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('referrals')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'referrals'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="w-5 h-5 inline mr-2" />
              All Referrals
            </button>
            <button
              onClick={() => setActiveTab('codes')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'codes'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Gift className="w-5 h-5 inline mr-2" />
              Referral Codes
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'settings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Settings className="w-5 h-5 inline mr-2" />
              Settings
            </button>
          </nav>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'referrals' && renderReferrals()}
            {activeTab === 'codes' && renderCodes()}
            {activeTab === 'settings' && renderSettings()}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminReferrals;
