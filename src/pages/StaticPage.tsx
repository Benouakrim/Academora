import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { staticPagesAPI } from '../lib/api';

export default function StaticPage() {
  const { slug } = useParams<{ slug: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageContent, setPageContent] = useState<string | null>(null);

  useEffect(() => {
    const fetchPageContent = async () => {
      if (!slug) {
        setError('Page slug is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await staticPagesAPI.getPage(slug);
        if (data && data.status === 'published') {
          setPageContent(data.content);
        } else if (data && data.status === 'draft') {
          setError('This page is not published yet.');
        } else {
          setError('Page not found');
        }
      } catch (err: any) {
        console.error('Error fetching page:', err);
        setError(err.message || 'Failed to load page');
      } finally {
        setLoading(false);
      }
    };

    fetchPageContent();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !pageContent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h1>
          <p className="text-gray-600">{error || "The page you're looking for doesn't exist."}</p>
        </div>
      </div>
    );
  }

  // Render content without any default styling - let HTML/CSS override everything
  return (
    <div className="m-0 p-0 min-h-screen">
      <div dangerouslySetInnerHTML={{ __html: pageContent }} />
    </div>
  );
}

