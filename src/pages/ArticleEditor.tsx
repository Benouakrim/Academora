import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, Save, ChevronDown, ChevronUp } from 'lucide-react';
import { adminAPI } from '../lib/api';
import { getCurrentUser } from '../lib/api';
import { useTranslation } from 'react-i18next';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import LinkExtension from '@tiptap/extension-link';
import ImageExtension from '@tiptap/extension-image';
import ImageUpload from '../components/ImageUpload';
import EditorToolbar from '../components/EditorToolbar';
import '../styles/editor.css';

export default function ArticleEditor() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showSEO, setShowSEO] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    category: 'General',
    published: false,
    featured_image: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    focus_keyword: '',
    og_image: '',
    canonical_url: '',
  });

  // Initialize Tiptap editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight,
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-400 underline cursor-pointer',
        },
      }),
      ImageExtension.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
    ],
    content: formData.content,
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[500px] px-10 py-8 prose-headings:mb-6 prose-p:mb-4 prose-ul:mb-4 prose-li:mb-2 prose-h2:mt-8 prose-h3:mt-6 prose-h4:mt-4 leading-relaxed',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setFormData((prev) => ({ ...prev, content: html }));
    },
  });

  // Debug logging and route validation
  useEffect(() => {
    console.log('Current URL:', window.location.href);
    console.log('Current pathname:', location.pathname);
    console.log('Route params:', { id });
    console.log('isEditMode:', isEditMode);
    console.log('Expected route pattern:', '/admin/articles/edit/:id');

    // Check if we're on the wrong route
    if (!location.pathname.startsWith('/admin/articles/edit/')) {
      console.error('Wrong route detected, redirecting...');
      setError('Wrong route detected. Redirecting to admin dashboard...');
      setTimeout(() => {
        navigate('/admin');
      }, 2000);
      return;
    }
  }, [location.pathname, id, isEditMode, navigate, setError]);

  useEffect(() => {
    // Check if user is authenticated
    const user = getCurrentUser();
    if (!user) {
      navigate('/login');
      return;
    }

    // If editing, fetch the article
    if (isEditMode && id) {
      fetchArticle();
    }
  }, [id, isEditMode, navigate]);

  // Update editor content when formData.content changes
  useEffect(() => {
    if (editor && formData.content !== editor.getHTML()) {
      editor.commands.setContent(formData.content);
    }
  }, [formData.content, editor]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      console.log('Fetching article with ID:', id); // Debug log
      
      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!id || !uuidRegex.test(id)) {
        console.error('Invalid UUID format, redirecting to admin...');
        setError(`Invalid article ID format: ${id}. Redirecting to admin dashboard...`);
        setTimeout(() => {
          navigate('/admin');
        }, 2000);
        return;
      }
      
      const article = await adminAPI.getArticleById(id!);
      setFormData({
        title: article.title || '',
        slug: article.slug || '',
        content: article.content || '',
        excerpt: article.excerpt || '',
        category: article.category || 'General',
        published: article.published || false,
        featured_image: article.featured_image || '',
        meta_title: article.meta_title || article.title || '',
        meta_description: article.meta_description || article.excerpt || '',
        meta_keywords: article.meta_keywords || '',
        focus_keyword: article.focus_keyword || '',
        og_image: article.og_image || article.featured_image || '',
        canonical_url: article.canonical_url || '',
      });
      // Content is stored as Markdown (supports raw HTML too). Nothing else to do here.
    } catch (err: any) {
      setError('Failed to load article: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title),
      meta_title: prev.meta_title || title, // Auto-fill meta_title if empty
    }));
  };

  const handleExcerptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const excerpt = e.target.value;
    setFormData((prev) => ({
      ...prev,
      excerpt,
      meta_description: prev.meta_description || excerpt, // Auto-fill meta_description if empty
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (isEditMode && id) {
        await adminAPI.updateArticle(id, formData);
      } else {
        await adminAPI.createArticle(formData);
      }
      navigate('/admin');
    } catch (err: any) {
      setError('Failed to save article: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">{t('common.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="flex h-screen">
        {/* Left Sidebar */}
        <div className="w-80 bg-white/95 backdrop-blur-sm border-r border-gray-200/80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400 transition-all shadow-lg">
          <div className="p-6 animate-fadeIn">
            <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full shadow-sm"></span>
              Article Settings
            </h2>
            
            {/* Title */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleTitleChange}
                className="w-full px-4 py-2 bg-gray-50 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-300 transition-all duration-200 hover:bg-white hover:border-blue-300 focus:bg-white focus:border-blue-500"
                placeholder="Enter article title"
              />
            </div>

            {/* Slug */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slug
              </label>
              <input
                type="text"
                id="slug"
                name="slug"
                required
                value={formData.slug}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-gray-50 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-300 transition-all duration-200 hover:bg-white hover:border-blue-300 focus:bg-white focus:border-blue-500"
                placeholder="article-url-slug"
              />
            </div>

            {/* Category */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                id="category"
                name="category"
                required
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-gray-50 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-300 transition-all duration-200 hover:bg-white hover:border-blue-300 focus:bg-white focus:border-blue-500"
              >
                <option value="General">General</option>
                <option value="Education">Education</option>
                <option value="Tips">Tips</option>
                <option value="Orientation">Orientation</option>
                <option value="Study Abroad">Study Abroad</option>
              </select>
            </div>

            {/* Excerpt */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Excerpt
              </label>
              <textarea
                id="excerpt"
                name="excerpt"
                required
                rows={3}
                value={formData.excerpt}
                onChange={handleExcerptChange}
                className="w-full px-4 py-2 bg-gray-50 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-300 transition-all duration-200 hover:bg-white hover:border-blue-300 focus:bg-white focus:border-blue-500"
                placeholder="Brief description of the article"
              />
            </div>

            {/* Published */}
            <div className="mb-6">
              <label className="flex items-center text-sm font-medium text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  id="published"
                  name="published"
                  checked={formData.published}
                  onChange={handleInputChange}
                  className="mr-2 h-4 w-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
                />
                Published
              </label>
            </div>

            {/* Featured Image */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Featured Image
              </label>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-300">
                <ImageUpload
                  value={formData.featured_image}
                  onChange={(url) => setFormData(prev => ({ ...prev, featured_image: url }))}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col bg-gradient-to-b from-white to-gray-50">
          {/* Header */}
          <div className="bg-white/95 backdrop-blur-md border-b border-gray-200 px-6 py-4 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link
                  to="/admin"
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 group"
                  title="Back to Admin"
                >
                  <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-200" />
                </Link>
                <div className="flex items-center gap-3">
                  <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full shadow-sm"></div>
                  <h1 className="text-xl font-semibold text-gray-800">
                    {isEditMode ? 'Edit Article' : 'Create New Article'}
                  </h1>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link 
                  to="/admin" 
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200 hover:scale-105 border border-gray-300"
                >
                  Cancel
                </Link>
                <button 
                  type="submit"
                  form="article-form"
                  disabled={saving}
                  className="px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md hover:shadow-lg hover:scale-105 disabled:hover:scale-100"
                >
                  <Save className="h-4 w-4" />
                  <span className="font-medium">{saving ? 'Saving...' : 'Save Article'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Editor Area */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {error && (
              <div className="bg-red-50 backdrop-blur-sm border-b border-red-200 text-red-700 px-6 py-3 text-sm animate-slideDown shadow-md">
                {error}
              </div>
            )}

            <form id="article-form" onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
              {/* Toolbar */}
              <div className="animate-slideDown">
                <EditorToolbar editor={editor} />
              </div>
              
              {/* Editor Content */}
              <div className="flex-1 overflow-y-auto bg-white scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400 transition-all">
                <div className="max-w-5xl mx-auto animate-fadeIn">
                  <EditorContent editor={editor} />
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Right Sidebar - SEO */}
        <div className="w-80 bg-white/95 backdrop-blur-sm border-l border-gray-200/80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400 transition-all shadow-lg">
          <div className="p-6 animate-fadeIn">
            <button
              type="button"
              onClick={() => setShowSEO(!showSEO)}
              className="flex items-center justify-between w-full text-lg font-semibold text-gray-800 mb-6 hover:text-blue-600 transition-all duration-200 p-2 hover:bg-blue-50 rounded-lg group"
            >
              <span>SEO Settings</span>
              {showSEO ? <ChevronUp className="h-5 w-5 group-hover:scale-110 transition-transform" /> : <ChevronDown className="h-5 w-5 group-hover:scale-110 transition-transform" />}
            </button>

            {showSEO && (
              <div className="space-y-4 animate-slideDown">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Focus Keyword
                  </label>
                  <input
                    type="text"
                    name="focus_keyword"
                    value={formData.focus_keyword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-50 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-300 transition-all duration-200 hover:bg-white hover:border-blue-300 focus:bg-white focus:border-blue-500"
                    placeholder="Main keyword"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Title ({formData.meta_title.length}/60)
                  </label>
                  <input
                    type="text"
                    name="meta_title"
                    value={formData.meta_title}
                    onChange={handleInputChange}
                    maxLength={60}
                    className="w-full px-4 py-2 bg-gray-50 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-300 transition-all duration-200 hover:bg-white hover:border-blue-300 focus:bg-white focus:border-blue-500"
                    placeholder="SEO title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Description ({formData.meta_description.length}/160)
                  </label>
                  <textarea
                    name="meta_description"
                    rows={3}
                    value={formData.meta_description}
                    onChange={handleInputChange}
                    maxLength={160}
                    className="w-full px-4 py-2 bg-gray-50 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-300 transition-all duration-200 hover:bg-white hover:border-blue-300 focus:bg-white focus:border-blue-500"
                    placeholder="SEO description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Keywords
                  </label>
                  <input
                    type="text"
                    name="meta_keywords"
                    value={formData.meta_keywords}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-50 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-300 transition-all duration-200 hover:bg-white hover:border-blue-300 focus:bg-white focus:border-blue-500"
                    placeholder="keyword1, keyword2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    OG Image
                  </label>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-300">
                    <ImageUpload
                      value={formData.og_image}
                      onChange={(url) => setFormData(prev => ({ ...prev, og_image: url }))}
                      placeholder="https://example.com/og.jpg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Canonical URL
                  </label>
                  <input
                    type="url"
                    name="canonical_url"
                    value={formData.canonical_url}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-50 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-300 transition-all duration-200 hover:bg-white hover:border-blue-300 focus:bg-white focus:border-blue-500"
                    placeholder="https://yoursite.com/article"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

