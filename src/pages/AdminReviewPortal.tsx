import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  User,
  Calendar,
  Tag,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Settings,
} from 'lucide-react';

interface Article {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  author_name: string;
  author_email: string;
  author_avatar: string;
  category_name: string;
  submitted_at: string;
  author_published_count: number;
  author_rejected_count: number;
  tags: string[];
}

interface ReviewStats {
  pending_count: number;
  approved_count: number;
  rejected_count: number;
  published_count: number;
  max_pending_per_user: number;
}

export default function AdminReviewPortal() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [maxPending, setMaxPending] = useState('3');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load pending articles
      const articlesRes = await fetch(`${import.meta.env.VITE_API_URL}/article-review/pending`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const articlesData = await articlesRes.json();
      setArticles(articlesData.articles);

      // Load stats
      const statsRes = await fetch(`${import.meta.env.VITE_API_URL}/article-review/stats/overview`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const statsData = await statsRes.json();
      setStats(statsData);
      setMaxPending(statsData.max_pending_per_user?.toString() || '3');
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (articleId: number, publishImmediately: boolean = false) => {
    try {
      setProcessing(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/article-review/${articleId}/approve`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ publish_immediately: publishImmediately }),
        }
      );

      if (response.ok) {
        setArticles(articles.filter((a) => a.id !== articleId));
        setSelectedArticle(null);
        loadData();
        alert(`Article ${publishImmediately ? 'approved and published' : 'approved'} successfully!`);
      }
    } catch (error) {
      console.error('Error approving article:', error);
      alert('Failed to approve article');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (articleId: number) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      setProcessing(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/article-review/${articleId}/reject`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ reason: rejectionReason }),
        }
      );

      if (response.ok) {
        setArticles(articles.filter((a) => a.id !== articleId));
        setSelectedArticle(null);
        setRejectionReason('');
        loadData();
        alert('Article rejected successfully');
      }
    } catch (error) {
      console.error('Error rejecting article:', error);
      alert('Failed to reject article');
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdateSettings = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/article-review/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ max_pending_articles_per_user: parseInt(maxPending) }),
      });

      if (response.ok) {
        alert('Settings updated successfully');
        setShowSettings(false);
        loadData();
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      alert('Failed to update settings');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Article Review Portal</h1>
            <p className="text-gray-400">Review and moderate user-submitted articles</p>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            <Settings className="h-5 w-5" />
            Settings
          </button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mb-6 p-6 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Submission Settings</h3>
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Max Pending Articles Per User
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={maxPending}
                  onChange={(e) => setMaxPending(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-900/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-2 text-sm text-gray-400">
                  Users can have maximum {maxPending} articles pending review at a time
                </p>
              </div>
              <button
                onClick={handleUpdateSettings}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>
        )}

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="h-6 w-6 text-yellow-400" />
                <span className="text-sm text-yellow-400 font-medium">Pending Review</span>
              </div>
              <div className="text-3xl font-bold text-white">{stats.pending_count}</div>
            </div>
            <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="h-6 w-6 text-green-400" />
                <span className="text-sm text-green-400 font-medium">Approved</span>
              </div>
              <div className="text-3xl font-bold text-white">{stats.approved_count}</div>
            </div>
            <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <XCircle className="h-6 w-6 text-red-400" />
                <span className="text-sm text-red-400 font-medium">Rejected</span>
              </div>
              <div className="text-3xl font-bold text-white">{stats.rejected_count}</div>
            </div>
            <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <User className="h-6 w-6 text-blue-400" />
                <span className="text-sm text-blue-400 font-medium">Published</span>
              </div>
              <div className="text-3xl font-bold text-white">{stats.published_count}</div>
            </div>
          </div>
        )}

        {/* Articles List */}
        {articles.length === 0 ? (
          <div className="text-center py-16 bg-gray-800/50 rounded-xl border border-gray-700">
            <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No articles pending review</p>
            <p className="text-gray-500 text-sm mt-2">All caught up! 🎉</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Articles List */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white mb-4">
                Pending Articles ({articles.length})
              </h2>
              {articles.map((article) => (
                <div
                  key={article.id}
                  onClick={() => setSelectedArticle(article)}
                  className={`p-6 rounded-xl border cursor-pointer transition-all ${
                    selectedArticle?.id === article.id
                      ? 'bg-blue-500/10 border-blue-500/50'
                      : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <h3 className="text-lg font-semibold text-white mb-2">{article.title}</h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{article.excerpt}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {article.author_name}
                    </div>
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      {article.category_name}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(article.submitted_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Published: {article.author_published_count}</span>
                    <span>Rejected: {article.author_rejected_count}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Article Preview & Actions */}
            {selectedArticle ? (
              <div className="lg:sticky lg:top-8 h-fit">
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
                  <div className="p-6 border-b border-gray-700">
                    <h2 className="text-2xl font-bold text-white mb-4">{selectedArticle.title}</h2>
                    
                    <div className="flex items-center gap-4 mb-4">
                      {selectedArticle.author_avatar ? (
                        <img
                          src={selectedArticle.author_avatar}
                          alt={selectedArticle.author_name}
                          className="w-12 h-12 rounded-full"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                          {selectedArticle.author_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="text-white font-medium">{selectedArticle.author_name}</div>
                        <div className="text-sm text-gray-400">{selectedArticle.author_email}</div>
                      </div>
                    </div>

                    {selectedArticle.tags && selectedArticle.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {selectedArticle.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="p-6 max-h-96 overflow-y-auto">
                    <div
                      className="prose prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
                    />
                  </div>

                  <div className="p-6 border-t border-gray-700 bg-gray-900/50">
                    <h3 className="text-sm font-medium text-gray-300 mb-3">Review Actions</h3>
                    
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleApprove(selectedArticle.id, true)}
                          disabled={processing}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50"
                        >
                          <ThumbsUp className="h-5 w-5" />
                          Approve & Publish
                        </button>
                        <button
                          onClick={() => handleApprove(selectedArticle.id, false)}
                          disabled={processing}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50"
                        >
                          <CheckCircle className="h-5 w-5" />
                          Approve Only
                        </button>
                      </div>

                      <div className="border-t border-gray-700 pt-3">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Rejection Reason
                        </label>
                        <textarea
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          rows={3}
                          placeholder="Provide a clear reason for rejection..."
                          className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 mb-3"
                        />
                        <button
                          onClick={() => handleReject(selectedArticle.id)}
                          disabled={processing || !rejectionReason.trim()}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all disabled:opacity-50"
                        >
                          <ThumbsDown className="h-5 w-5" />
                          Reject Article
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="lg:sticky lg:top-8 h-fit">
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-12 text-center">
                  <Eye className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Select an article to review</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
