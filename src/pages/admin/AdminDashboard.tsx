import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText, Users, Building2, School,
  Plus, Eye, Edit, Shield, Settings, Cookie
} from 'lucide-react';
import { adminAPI, adminUniversityAPI, adminUniversityGroupsAPI, adminUniversityClaimsAPI, getCurrentUser, adminAnalyticsAPI } from '../../lib/api';

interface Stats {
  articles: {
    total: number;
    published: number;
    drafts: number;
  };
  users: {
    total: number;
    admins: number;
    regular: number;
  };
  universities: {
    total: number;
    withGroups: number;
    standalone: number;
  };
  groups: {
    total: number;
    withInstances: number;
  };
  claims: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    articles: { total: 0, published: 0, drafts: 0 },
    users: { total: 0, admins: 0, regular: 0 },
    universities: { total: 0, withGroups: 0, standalone: 0 },
    groups: { total: 0, withInstances: 0 },
    claims: { total: 0, pending: 0, approved: 0, rejected: 0 },
  });
  const [recentArticles, setRecentArticles] = useState<any[]>([]);
  const [recentClaims, setRecentClaims] = useState<any[]>([]);
  const [overview, setOverview] = useState<{users:number;universities:number;reviews:number;saved_matches:number}>({users:0,universities:0,reviews:0,saved_matches:0});
  const [trend, setTrend] = useState<{date:string;count:number}[]>([]);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [articles, users, universities, groups, claims, ov, tr] = await Promise.all([
        adminAPI.getAllArticles().catch(() => []),
        adminAPI.getUsers().catch(() => []),
        adminUniversityAPI.getUniversities().catch(() => []),
        adminUniversityGroupsAPI.getGroups().catch(() => []),
        adminUniversityClaimsAPI.getClaimRequests().catch(() => []),
        adminAnalyticsAPI.overview().catch(() => ({ users:0, universities:0, reviews:0, saved_matches:0 })),
        adminAnalyticsAPI.registrationsLast7().catch(() => []),
      ]);

      // Calculate stats
      const articlesData = Array.isArray(articles) ? articles : [];
      const usersData = Array.isArray(users) ? users : [];
      const universitiesData = Array.isArray(universities) ? universities : [];
      const groupsData = Array.isArray(groups) ? groups : [];
      const claimsData = Array.isArray(claims) ? claims : [];

      setStats({
        articles: {
          total: articlesData.length,
          published: articlesData.filter((a: any) => a.published).length,
          drafts: articlesData.filter((a: any) => !a.published).length,
        },
        users: {
          total: usersData.length,
          admins: usersData.filter((u: any) => u.role === 'admin').length,
          regular: usersData.filter((u: any) => u.role !== 'admin').length,
        },
        universities: {
          total: universitiesData.length,
          withGroups: universitiesData.filter((u: any) => u.group_id).length,
          standalone: universitiesData.filter((u: any) => !u.group_id).length,
        },
        groups: {
          total: groupsData.length,
          withInstances: groupsData.filter((g: any) => (g.total_instances || 0) > 0).length,
        },
        claims: {
          total: claimsData.length,
          pending: claimsData.filter((c: any) => c.status === 'pending').length,
          approved: claimsData.filter((c: any) => c.status === 'approved').length,
          rejected: claimsData.filter((c: any) => c.status === 'rejected' || c.status === 'revoked').length,
        },
      });

      // Set recent items (last 5)
      setRecentArticles(articlesData.slice(0, 5));
      setRecentClaims(claimsData.slice(0, 5));
      setOverview(ov);
      setTrend(Array.isArray(tr) ? tr : []);
    } catch (error: any) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
              <p className="text-gray-600">Overview of your platform statistics and management</p>
            </div>
            <div className="flex items-center gap-3">
              {import.meta.env.DEV && (
                <Link to="/__dev" className="px-4 py-2 text-sm font-medium text-purple-700 border border-purple-300 rounded-md hover:bg-purple-50">
                  Dev Dashboard
                </Link>
              )}
              <Link to="/dashboard" className="btn-secondary border text-sm px-4 py-2 rounded-md">
                User Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Articles Card */}
          <Link
            to="/admin/articles"
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer border-l-4 border-blue-500"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-sm text-gray-500">Total</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.articles.total}</h3>
            <p className="text-sm text-gray-600 mb-2">Articles</p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="text-green-600">{stats.articles.published} published</span>
              <span className="text-gray-400">{stats.articles.drafts} drafts</span>
            </div>
          </Link>

          {/* Users Card */}
          <Link
            to="/admin/users"
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer border-l-4 border-green-500"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-sm text-gray-500">Total</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.users.total}</h3>
            <p className="text-sm text-gray-600 mb-2">Users</p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="text-red-600">{stats.users.admins} admins</span>
              <span className="text-gray-400">{stats.users.regular} regular</span>
            </div>
          </Link>

          {/* Universities Card */}
          <Link
            to="/admin/universities"
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer border-l-4 border-purple-500"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <School className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-sm text-gray-500">Total</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.universities.total}</h3>
            <p className="text-sm text-gray-600 mb-2">Universities</p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="text-primary-600">{stats.universities.withGroups} in groups</span>
              <span className="text-gray-400">{stats.universities.standalone} standalone</span>
            </div>
          </Link>

          {/* Claims Card */}
          <Link
            to="/admin/university-claims"
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer border-l-4 border-yellow-500"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Shield className="h-6 w-6 text-yellow-600" />
              </div>
              <span className="text-sm text-gray-500">Pending</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.claims.pending}</h3>
            <p className="text-sm text-gray-600 mb-2">Claim Requests</p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="text-green-600">{stats.claims.approved} approved</span>
              <span className="text-red-600">{stats.claims.rejected} rejected</span>
            </div>
          </Link>
        </div>

        {/* Admin Analytics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border">
            <div className="text-xs text-gray-500">Users</div>
            <div className="text-2xl font-bold">{overview.users}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border">
            <div className="text-xs text-gray-500">Universities</div>
            <div className="text-2xl font-bold">{overview.universities}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border">
            <div className="text-xs text-gray-500">Reviews</div>
            <div className="text-2xl font-bold">{overview.reviews}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border">
            <div className="text-xs text-gray-500">Saved Matches</div>
            <div className="text-2xl font-bold">{overview.saved_matches}</div>
          </div>
        </div>

        {/* Registrations Trend */}
        <div className="bg-white rounded-lg shadow p-6 border mb-8">
          <div className="text-sm font-semibold mb-3">Registrations (last 7 days)</div>
          <div className="grid grid-cols-7 gap-2">
            {trend.map((d) => (
              <div key={d.date} className="text-center">
                <div className="h-24 bg-primary-50 rounded flex items-end">
                  <div className="w-full bg-primary-600 rounded" style={{ height: `${Math.min(100, d.count * 10)}%` }} />
                </div>
                <div className="text-[10px] text-gray-500 mt-1">{d.date.slice(5)}</div>
                <div className="text-xs font-semibold">{d.count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link
            to="/admin/articles/new"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow border-2 border-dashed border-gray-300 hover:border-primary-500"
          >
            <div className="flex items-center gap-4">
              <div className="bg-primary-100 p-3 rounded-lg">
                <Plus className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Write New Article</h3>
                <p className="text-sm text-gray-500">Create a new blog post</p>
              </div>
            </div>
          </Link>

          <Link
            to="/admin/universities/new"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow border-2 border-dashed border-gray-300 hover:border-primary-500"
          >
            <div className="flex items-center gap-4">
              <div className="bg-primary-100 p-3 rounded-lg">
                <Plus className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Add University</h3>
                <p className="text-sm text-gray-500">Add a new institution</p>
              </div>
            </div>
          </Link>

          <Link
            to="/admin/university-groups/new"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow border-2 border-dashed border-gray-300 hover:border-primary-500"
          >
            <div className="flex items-center gap-4">
              <div className="bg-primary-100 p-3 rounded-lg">
                <Plus className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Create Group</h3>
                <p className="text-sm text-gray-500">Add a university group</p>
              </div>
            </div>
          </Link>

          <Link
            to="/admin/cookies"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow border-2 border-dashed border-gray-300 hover:border-orange-500"
          >
            <div className="flex items-center gap-4">
              <div className="bg-orange-100 p-3 rounded-lg">
                <Cookie className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Cookie Management</h3>
                <p className="text-sm text-gray-500">Manage user cookie preferences</p>
              </div>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Articles */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary-600" />
                Recent Articles
              </h2>
              <Link
                to="/admin/articles"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                View All →
              </Link>
            </div>
            {recentArticles.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No articles yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentArticles.map((article) => (
                  <div
                    key={article.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/admin/articles/edit/${article.id}`}
                        className="text-sm font-medium text-gray-900 hover:text-primary-600 truncate block"
                      >
                        {article.title}
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          article.published
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {article.published ? 'Published' : 'Draft'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(article.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/blog/${article.slug}`}
                        target="_blank"
                        className="text-gray-400 hover:text-gray-600"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        to={`/admin/articles/edit/${article.id}`}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Claim Requests */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Shield className="h-5 w-5 text-yellow-600" />
                Recent Claim Requests
              </h2>
              <Link
                to="/admin/university-claims"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                View All →
              </Link>
            </div>
            {recentClaims.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Shield className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No claim requests yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentClaims.map((claim) => (
                  <div
                    key={claim.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {claim.requester_name}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 truncate">
                        {claim.organization_name || claim.requester_email}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          claim.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : claim.status === 'approved'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {claim.status.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(claim.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Link
                      to={`/admin/university-claims/${claim.id}`}
                      className="text-blue-600 hover:text-blue-800"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Management Links */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/admin/articles"
            className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow flex items-center gap-3"
          >
            <FileText className="h-5 w-5 text-primary-600" />
            <span className="font-medium text-gray-900">Articles</span>
          </Link>
          <Link
            to="/admin/users"
            className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow flex items-center gap-3"
          >
            <Users className="h-5 w-5 text-primary-600" />
            <span className="font-medium text-gray-900">Users</span>
          </Link>
          <Link
            to="/admin/universities"
            className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow flex items-center gap-3"
          >
            <School className="h-5 w-5 text-primary-600" />
            <span className="font-medium text-gray-900">Universities</span>
          </Link>
          <Link
            to="/admin/university-groups"
            className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow flex items-center gap-3"
          >
            <Building2 className="h-5 w-5 text-primary-600" />
            <span className="font-medium text-gray-900">Groups</span>
          </Link>
          <Link
            to="/admin/university-claims"
            className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow flex items-center gap-3"
          >
            <Shield className="h-5 w-5 text-primary-600" />
            <span className="font-medium text-gray-900">Claims</span>
          </Link>
          <Link
            to="/admin/pages"
            className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow flex items-center gap-3"
          >
            <FileText className="h-5 w-5 text-primary-600" />
            <span className="font-medium text-gray-900">Pages</span>
          </Link>
          <Link
            to="/admin/categories"
            className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow flex items-center gap-3"
          >
            <Settings className="h-5 w-5 text-primary-600" />
            <span className="font-medium text-gray-900">Categories</span>
          </Link>
          <Link
            to="/admin/tags"
            className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow flex items-center gap-3"
          >
            <Settings className="h-5 w-5 text-primary-600" />
            <span className="font-medium text-gray-900">Tags</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

