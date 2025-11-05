import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, EyeOff, Search, FileText, Globe, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Page {
  id: string;
  title: string;
  slug: string;
  status: 'published' | 'draft';
  template: string;
  updated_at: string;
  created_at: string;
}

export default function PagesManagementPage() {
  const { t } = useTranslation();
  const [pages, setPages] = useState<Page[]>([]);
  const [filteredPages, setFilteredPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login');
      return;
    }

    fetchPages();
  }, [navigate]);

  const fetchPages = async () => {
    try {
      setLoading(true);
      // In real implementation, fetch from your API
      // const data = await adminAPI.getPages();
      
      // Mock data for demonstration
      const mockPages: Page[] = [
        {
          id: '1',
          title: 'About Us',
          slug: 'about',
          status: 'published',
          template: 'about',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Contact Us',
          slug: 'contact',
          status: 'published',
          template: 'contact',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '3',
          title: 'Privacy Policy',
          slug: 'privacy',
          status: 'published',
          template: 'default',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '4',
          title: 'Terms of Service',
          slug: 'terms',
          status: 'draft',
          template: 'default',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      setPages(mockPages);
      setFilteredPages(mockPages);
    } catch (err: any) {
      console.error('Failed to fetch pages:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Filter pages based on search term and status
    let filtered = pages;

    // Filter by status
    if (filterStatus === 'published') {
      filtered = filtered.filter((page) => page.status === 'published');
    } else if (filterStatus === 'draft') {
      filtered = filtered.filter((page) => page.status === 'draft');
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (page) =>
          page.title.toLowerCase().includes(term) ||
          page.slug.toLowerCase().includes(term) ||
          page.template.toLowerCase().includes(term)
      );
    }

    setFilteredPages(filtered);
  }, [pages, searchTerm, filterStatus]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this page? This action cannot be undone.')) {
      return;
    }

    try {
      // In real implementation, delete from your API
      // await adminAPI.deletePage(id);
      
      console.log('Deleting page:', id);
      
      // Update local state
      setPages(pages.filter(page => page.id !== id));
    } catch (err: any) {
      alert('Failed to delete page: ' + err.message);
    }
  };

  const handleDuplicate = async (page: Page) => {
    try {
      // In real implementation, duplicate via your API
      // const newPage = await adminAPI.duplicatePage(page.id);
      
      const newPage: Page = {
        ...page,
        id: Date.now().toString(),
        title: `${page.title} (Copy)`,
        slug: `${page.slug}-copy`,
        status: 'draft'
      };
      
      setPages([newPage, ...pages]);
    } catch (err: any) {
      alert('Failed to duplicate page: ' + err.message);
    }
  };

  const toggleStatus = async (id: string) => {
    try {
      // In real implementation, update via your API
      // await adminAPI.updatePageStatus(id, newStatus);
      
      setPages(pages.map(page => 
        page.id === id 
          ? { ...page, status: page.status === 'published' ? 'draft' : 'published' }
          : page
      ));
    } catch (err: any) {
      alert('Failed to update page status: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">{t('common.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Pages Management</h1>
                <p className="text-gray-600">Create and manage your static pages</p>
              </div>
              <div className="flex items-center gap-3">
                <Link to="/admin/articles" className="btn-secondary border text-sm px-4 py-2 rounded-md">
                  Articles
                </Link>
                <Link to="/admin/pages/new" className="btn-primary flex items-center space-x-2">
                  <Plus className="h-5 w-5" />
                  <span>Create New Page</span>
                </Link>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Pages</p>
                    <p className="text-2xl font-bold text-gray-900">{pages.length}</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Published</p>
                    <p className="text-2xl font-bold text-green-600">
                      {pages.filter((p) => p.status === 'published').length}
                    </p>
                  </div>
                  <Eye className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Drafts</p>
                    <p className="text-2xl font-bold text-gray-600">
                      {pages.filter((p) => p.status === 'draft').length}
                    </p>
                  </div>
                  <EyeOff className="h-8 w-8 text-gray-600" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Showing</p>
                    <p className="text-2xl font-bold text-gray-900">{filteredPages.length}</p>
                  </div>
                  <Search className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search pages..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilterStatus('all')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      filterStatus === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilterStatus('published')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      filterStatus === 'published'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Published
                  </button>
                  <button
                    onClick={() => setFilterStatus('draft')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      filterStatus === 'draft'
                        ? 'bg-gray-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Drafts
                  </button>
                </div>
              </div>
            </div>

            {/* Pages Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Pages</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        URL
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Template
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Updated
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPages.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                          No pages found.
                        </td>
                      </tr>
                    ) : (
                      filteredPages.map((page) => (
                        <tr key={page.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {page.title}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {page.id}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <Globe className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-900 font-mono">
                                /{page.slug}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                              {page.template}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => toggleStatus(page.id)}
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer transition-colors ${
                                page.status === 'published'
                                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                              }`}
                            >
                              {page.status === 'published' ? 'Published' : 'Draft'}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(page.updated_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <a
                                href={`/${page.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-900"
                                title="View page"
                              >
                                <Eye className="h-5 w-5" />
                              </a>
                              <Link
                                to={`/admin/pages/${page.id}/edit`}
                                className="text-blue-600 hover:text-blue-900"
                                title="Edit page"
                              >
                                <Edit className="h-5 w-5" />
                              </Link>
                              <button
                                onClick={() => handleDuplicate(page)}
                                className="text-purple-600 hover:text-purple-900"
                                title="Duplicate page"
                              >
                                <Plus className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleDelete(page.id)}
                                className="text-red-600 hover:text-red-900"
                                title="Delete page"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                  to="/admin/pages/new?type=about"
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Create About Page</h4>
                      <p className="text-sm text-gray-500">Company/team information</p>
                    </div>
                  </div>
                </Link>

                <Link
                  to="/admin/pages/new?type=contact"
                  className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all duration-200 group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200">
                      <Globe className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Create Contact Page</h4>
                      <p className="text-sm text-gray-500">Contact form and info</p>
                    </div>
                  </div>
                </Link>

                <Link
                  to="/admin/pages/new"
                  className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200">
                      <Settings className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Create Custom Page</h4>
                      <p className="text-sm text-gray-500">Fully customizable layout</p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
