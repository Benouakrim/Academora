import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { referralsAPI } from '../lib/api';
import { motion } from 'framer-motion';
import {
  Copy,
  Check,
  Users,
  Gift,
  Share2,
  Mail,
  Facebook,
  Twitter,
  Linkedin,
  TrendingUp,
  Award,
  Calendar,
  CheckCircle,
  Clock,
} from 'lucide-react';


interface ReferralStats {
  total_referrals: number;
  completed_referrals: number;
  pending_referrals: number;
  total_rewards: number;
}

interface Referral {
  id: string;
  referred_email: string;
  status: 'pending' | 'completed';
  created_at: string;
  completed_at?: string;
}

interface Reward {
  id: string;
  reward_type: string;
  reward_value: number;
  description: string;
  applied_at: string;
}

const ReferralDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Store just the referral code string returned by backend (simpler than unused object shape)
  const [referralCode, setReferralCode] = useState<string>('');
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);

  // Get token from Clerk (fresh token each time)
  const { getToken } = useAuth();

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    // Get fresh token right before API call (tokens expire quickly)
    const token = await getToken({ skipCache: true });
    if (!token) {
      setError('Please log in to view your referral dashboard');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Use centralized API client (adds Authorization header)
      const codeData = await referralsAPI.getMyCode();
      setReferralCode(codeData.code || '');
      setStats(codeData.stats);

      const referralsData = await referralsAPI.getMyReferrals();
      setReferrals(referralsData.referrals || []);

      const rewardsData = await referralsAPI.getMyRewards();
      setRewards(rewardsData.rewards || []);
    } catch (err: any) {
      console.error('Error fetching referral data:', err);
      const status = err?.status || err?.code || null;
      if (status === 401) {
        setError('Your session has expired. Please log in again.');
      } else if (status === 403) {
        setError('Access denied. Your account does not have permission to view referrals.');
      } else if (err?.message) {
        setError(err.message);
      } else {
        setError('Failed to load referral data');
      }
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getReferralUrl = () => {
  if (!referralCode) return '';
  const baseUrl = window.location.origin;
  return `${baseUrl}/signup?ref=${referralCode}`;
  };

  const shareViaEmail = () => {
    const url = getReferralUrl();
    const subject = 'Join AcademOra with my referral link';
    const body = `Hi! I've been using AcademOra and thought you might be interested. Use my referral link to sign up: ${url}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const shareViaSocial = (platform: string) => {
    const url = getReferralUrl();
    const text = 'Join me on AcademOra!';

    const urls: { [key: string]: string } = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    };

    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'width=600,height=400');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-red-600 mb-4">Error loading referral dashboard</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchReferralData}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Referral Program</h1>
          <p className="text-lg text-gray-600">
            Share AcademOra with friends and earn rewards!
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Referrals</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.total_referrals || 0}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Completed</p>
                <p className="text-3xl font-bold text-green-600">{stats?.completed_referrals || 0}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{stats?.pending_referrals || 0}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Rewards</p>
                <p className="text-3xl font-bold text-purple-600">{stats?.total_rewards || 0}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Gift className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Referral Code Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg shadow-lg p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <Share2 className="w-6 h-6 mr-2" />
            Your Referral Code
          </h2>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Referral Code
            </label>
            <div className="flex items-center">
              <div className="flex-1 bg-gray-50 border border-gray-300 rounded-l-lg p-4 font-mono text-2xl font-bold text-blue-600">
                {referralCode}
              </div>
              <button
                onClick={() => copyToClipboard(referralCode || '')}
                className="bg-blue-600 text-white px-6 py-4 rounded-r-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5 mr-2" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Referral Link
            </label>
            <div className="flex items-center">
              <div className="flex-1 bg-gray-50 border border-gray-300 rounded-l-lg p-4 text-sm text-gray-700 overflow-x-auto">
                {getReferralUrl()}
              </div>
              <button
                onClick={() => copyToClipboard(getReferralUrl())}
                className="bg-gray-600 text-white px-6 py-4 rounded-r-lg hover:bg-gray-700 transition-colors flex items-center whitespace-nowrap"
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5 mr-2" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Share Via
            </label>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={shareViaEmail}
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Mail className="w-5 h-5 mr-2" />
                Email
              </button>
              <button
                onClick={() => shareViaSocial('facebook')}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Facebook className="w-5 h-5 mr-2" />
                Facebook
              </button>
              <button
                onClick={() => shareViaSocial('twitter')}
                className="flex items-center px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
              >
                <Twitter className="w-5 h-5 mr-2" />
                Twitter
              </button>
              <button
                onClick={() => shareViaSocial('linkedin')}
                className="flex items-center px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
              >
                <Linkedin className="w-5 h-5 mr-2" />
                LinkedIn
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Referrals List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Users className="w-6 h-6 mr-2" />
              Your Referrals
            </h2>

            {referrals.length === 0 ? (
              <div className="text-center py-12">
                <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No referrals yet</p>
                <p className="text-sm text-gray-400">
                  Share your referral link to get started!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {referrals.map((referral) => (
                  <div
                    key={referral.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{referral.referred_email}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          <Calendar className="w-4 h-4 inline mr-1" />
                          {new Date(referral.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        {referral.status === 'completed' ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                            <Clock className="w-4 h-4 mr-1" />
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Rewards List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Award className="w-6 h-6 mr-2" />
              Your Rewards
            </h2>

            {rewards.length === 0 ? (
              <div className="text-center py-12">
                <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No rewards earned yet</p>
                <p className="text-sm text-gray-400">
                  Complete referrals to earn rewards!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {rewards.map((reward) => (
                  <div
                    key={reward.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <Gift className="w-5 h-5 text-purple-600 mr-2" />
                          <p className="font-medium text-gray-900">{reward.reward_type}</p>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{reward.description}</p>
                        <p className="text-sm text-gray-500">
                          <Calendar className="w-4 h-4 inline mr-1" />
                          Applied: {new Date(reward.applied_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-2xl font-bold text-purple-600">
                        +{reward.reward_value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ReferralDashboard;
