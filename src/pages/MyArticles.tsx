import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  Edit,
  Trash2,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
} from 'lucide-react';

interface Article {
  id: number;
  title: string;
  slug: string;
  status: string;
  created_at: string;
  submitted_at: string;
  reviewed_at: string;
  reviewer_name: string;
  rejection_reason: string;
  category_name: string;
  total_views: number;
  total_likes: number;
  total_comments: number;
  total_shares: number;
  comment_count: number;
}

const statusConfig = {
  draft: {
    label: 'Draft',
    icon: Edit,
    color: 'text-gray-400 bg-gray-500/10 border-gray-500/20',
  },
  pending: {
    label: 'Pending Review',
    icon: Clock,
    color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  },
  approved: {
    label: 'Approved',
    icon: CheckCircle,
    color: 'text-green-400 bg-green-500/10 border-green-500/20',
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    color: 'text-red-400 bg-red-500/10 border-red-500/20',
  },
  published: {
    label: 'Published',
    icon: CheckCircle,
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  },
};

export default function MyArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [submissionLimit, setSubmissionLimit] = useState<any>(null);

  useEffect(() => {
    loadArticles();
    loadSubmissionLimit();
  }, []);

  const loadArticles = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/user-articles/my-articles`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to load articles' }));
        console.error('Error loading articles:', response.status, errorData);
        setArticles([]);
        return;
      }
      const data = await response.json();
      setArticles(data.articles || []);
    } catch (error) {
      console.error('Error loading articles:', error);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSubmissionLimit = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/user-articles/can-submit`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to check submission limit' }));
        console.error('Error loading submission limit:', response.status, errorData);
        return;
      }
      const data = await response.json();
      setSubmissionLimit(data);
    } catch (error) {
      console.error('Error loading submission limit:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this article?')) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/user-articles/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        setArticles(articles.filter((a) => a.id !== id));
        loadSubmissionLimit();
      }
    } catch (error) {
      console.error('Error deleting article:', error);
      alert('Failed to delete article');
    }
  };

  const filteredArticles = articles.filter((article) => {
    if (filter === 'all') return true;
    return article.status === filter;
  });

  const stats = {
    total: articles.length,
    draft: articles.filter((a) => a.status === 'draft').length,
    pending: articles.filter((a) => a.status === 'pending').length,
    published: articles.filter((a) => a.status === 'published').length,
    rejected: articles.filter((a) => a.status === 'rejected').length,
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
            <h1 className="text-4xl font-bold text-white mb-2">My Articles</h1>
            <p className="text-gray-400">
              Manage your articles and track their performance
            </p>
          </div>
          <Link
            to="/write-article"
            className={`flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all ${
              submissionLimit && !submissionLimit.canSubmit ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={(e) => {
              if (submissionLimit && !submissionLimit.canSubmit) {
                e.preventDefault();
                alert(`You have reached the limit of ${submissionLimit.maxPending} pending articles. Please wait for review.`);
              }
            }}
          >
            <PlusCircle className="h-5 w-5" />
            Write Article
          </Link>
        </div>

        {/* Submission Limit Info */}
        {submissionLimit && (
          <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-center gap-3 text-blue-400">
              <AlertCircle className="h-5 w-5" />
              <span>
                Pending submissions: {submissionLimit.pendingCount} / {submissionLimit.maxPending}
                {submissionLimit.remaining > 0 && (
                  <span className="ml-2 text-green-400">
                    ({submissionLimit.remaining} slot{submissionLimit.remaining !== 1 ? 's' : ''} available)
                  </span>
                )}
                {!submissionLimit.canSubmit && (
                  <span className="ml-2 text-red-400">
                    (Limit reached - wait for review)
                  </span>
                )}
              </span>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <button
            onClick={() => setFilter('all')}
            className={`p-6 rounded-xl border transition-all ${
              filter === 'all'
                ? 'bg-blue-500/10 border-blue-500/50'
                : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
            }`}
          >
            <div className="text-3xl font-bold text-white mb-2">{stats.total}</div>
            <div className="text-sm text-gray-400">Total Articles</div>
          </button>
          <button
            onClick={() => setFilter('draft')}
            className={`p-6 rounded-xl border transition-all ${
              filter === 'draft'
                ? 'bg-gray-500/10 border-gray-500/50'
                : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
            }`}
          >
            <div className="text-3xl font-bold text-white mb-2">{stats.draft}</div>
            <div className="text-sm text-gray-400">Drafts</div>
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`p-6 rounded-xl border transition-all ${
              filter === 'pending'
                ? 'bg-yellow-500/10 border-yellow-500/50'
                : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
            }`}
          >
            <div className="text-3xl font-bold text-white mb-2">{stats.pending}</div>
            <div className="text-sm text-gray-400">Pending</div>
          </button>
          <button
            onClick={() => setFilter('published')}
            className={`p-6 rounded-xl border transition-all ${
              filter === 'published'
                ? 'bg-blue-500/10 border-blue-500/50'
                : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
            }`}
          >
            <div className="text-3xl font-bold text-white mb-2">{stats.published}</div>
            <div className="text-sm text-gray-400">Published</div>
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`p-6 rounded-xl border transition-all ${
              filter === 'rejected'
                ? 'bg-red-500/10 border-red-500/50'
                : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
            }`}
          >
            <div className="text-3xl font-bold text-white mb-2">{stats.rejected}</div>
            <div className="text-sm text-gray-400">Rejected</div>
          </button>
        </div>

        {/* Articles List */}
        {filteredArticles.length === 0 ? (
          <div className="text-center py-16 bg-gray-800/50 rounded-xl border border-gray-700">
            <p className="text-gray-400 mb-4">No articles found</p>
            <Link
              to="/write-article"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusCircle className="h-5 w-5" />
              Write Your First Article
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredArticles.map((article) => {
              const StatusIcon = statusConfig[article.status as keyof typeof statusConfig].icon;
              const statusColor = statusConfig[article.status as keyof typeof statusConfig].color;

              return (
                <div
                  key={article.id}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6 hover:border-gray-600 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-white">
                          {article.title || 'Untitled'}
                        </h3>
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${statusColor}`}
                        >
                          <StatusIcon className="h-3.5 w-3.5" />
                          {statusConfig[article.status as keyof typeof statusConfig].label}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>{article.category_name}</span>
                        <span>•</span>
                        <span>Created {new Date(article.created_at).toLocaleDateString()}</span>
                        {article.submitted_at && (
                          <>
                            <span>•</span>
                            <span>Submitted {new Date(article.submitted_at).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {['draft', 'rejected'].includes(article.status) && (
                        <Link
                          to={`/write-article/${article.id}`}
                          className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-5 w-5" />
                        </Link>
                      )}
                      {['draft', 'rejected'].includes(article.status) && (
                        <button
                          onClick={() => handleDelete(article.id)}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Analytics */}
                  {article.status === 'published' && (
                    <div className="grid grid-cols-4 gap-4 p-4 bg-gray-900/50 rounded-lg mb-4">
                      <div className="flex items-center gap-3">
                        <Eye className="h-5 w-5 text-blue-400" />
                        <div>
                          <div className="text-xl font-semibold text-white">{article.total_views}</div>
                          <div className="text-xs text-gray-400">Views</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Heart className="h-5 w-5 text-red-400" />
                        <div>
                          <div className="text-xl font-semibold text-white">{article.total_likes}</div>
                          <div className="text-xs text-gray-400">Likes</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <MessageCircle className="h-5 w-5 text-green-400" />
                        <div>
                          <div className="text-xl font-semibold text-white">{article.comment_count}</div>
                          <div className="text-xs text-gray-400">Comments</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Share2 className="h-5 w-5 text-purple-400" />
                        <div>
                          <div className="text-xl font-semibold text-white">{article.total_shares}</div>
                          <div className="text-xs text-gray-400">Shares</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Rejection Reason */}
                  {article.status === 'rejected' && article.rejection_reason && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                      <strong>Rejection Reason:</strong> {article.rejection_reason}
                    </div>
                  )}

                  {/* Review Info */}
                  {article.reviewed_at && article.reviewer_name && (
                    <div className="text-sm text-gray-400 mt-3">
                      Reviewed by {article.reviewer_name} on {new Date(article.reviewed_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
