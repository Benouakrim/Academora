import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../lib/api';
import ArticleAnalyticsDashboard from '../../components/admin/ArticleAnalyticsDashboard';
import { ArrowLeft } from 'lucide-react';

export default function ArticleAnalyticsPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== 'admin') {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/admin/articles')}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Articles
        </button>

        {/* Analytics Dashboard */}
        <ArticleAnalyticsDashboard />
      </div>
    </div>
  );
}
