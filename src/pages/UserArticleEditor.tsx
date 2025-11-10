import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Send, AlertCircle, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import LinkExtension from '@tiptap/extension-link';
import ImageExtension from '@tiptap/extension-image';
import { TextStyle } from '@tiptap/extension-text-style';
import { FontSize } from '../extensions/FontSize';
import ImageUpload from '../components/ImageUpload';
import EditorToolbar from '../components/EditorToolbar';
import { adminAPI } from '../lib/api';
import '../styles/editor.css';

interface SubmissionLimit {
  canSubmit: boolean;
  pendingCount: number;
  maxPending: number;
  remaining: number;
}

export default function UserArticleEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [submissionLimit, setSubmissionLimit] = useState<SubmissionLimit | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featured_image: '',
    category_id: '',
    tags: [] as string[],
    meta_title: '',
    meta_description: '',
  });

  // Initialize Tiptap editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      FontSize,
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
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[500px] px-10 py-8',
      },
    },
    onUpdate: ({ editor }) => {
      setFormData((prev) => ({ ...prev, content: editor.getHTML() }));
    },
  });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load categories
      const categoriesRes = await adminAPI.getCategories();
      setCategories(categoriesRes.categories);

      // Check submission limit
      const limitRes = await fetch(`${import.meta.env.VITE_API_URL}/user-articles/can-submit`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const limitData = await limitRes.json();
      setSubmissionLimit(limitData);

      // Load article if editing
      if (id) {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/user-articles/my-articles`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await response.json();
        const article = data.articles.find((a: any) => a.id === parseInt(id));

        if (article) {
          setFormData({
            title: article.title || '',
            slug: article.slug || '',
            excerpt: article.excerpt || '',
            content: article.content || '',
            featured_image: article.featured_image || '',
            category_id: article.category_id?.toString() || '',
            tags: article.tags || [],
            meta_title: article.meta_title || '',
            meta_description: article.meta_description || '',
          });
          editor?.commands.setContent(article.content || '');
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setMessage({ type: 'error', text: 'Failed to load data' });
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      title: value,
      slug: generateSlug(value),
    }));
  };

  const handleSave = async (status: 'draft' | 'pending') => {
    try {
      setSaving(true);
      setMessage(null);

      // Validation
      if (status === 'pending' && (!formData.title || !formData.content || !formData.category_id)) {
        setMessage({ type: 'error', text: 'Title, content, and category are required for submission' });
        return;
      }

      if (status === 'pending' && submissionLimit && !submissionLimit.canSubmit && !id) {
        setMessage({ 
          type: 'error', 
          text: `You have reached the limit of ${submissionLimit.maxPending} pending articles. Please wait for review.` 
        });
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/user-articles/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          id: id ? parseInt(id) : undefined,
          ...formData,
          category_id: parseInt(formData.category_id),
          status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save article');
      }

      setMessage({ type: 'success', text: data.message });

      // Redirect to My Articles after successful submission
      setTimeout(() => {
        navigate('/my-articles');
      }, 1500);
    } catch (error: any) {
      console.error('Error saving article:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to save article' });
    } finally {
      setSaving(false);
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
        <div className="mb-8">
          <button
            onClick={() => navigate('/my-articles')}
            className="flex items-center text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to My Articles
          </button>
          <h1 className="text-4xl font-bold text-white mb-2">
            {id ? 'Edit Article' : 'Write New Article'}
          </h1>
          <p className="text-gray-400">
            {submissionLimit && (
              <span>
                Pending articles: {submissionLimit.pendingCount} / {submissionLimit.maxPending}
                {submissionLimit.remaining > 0 && ` (${submissionLimit.remaining} remaining)`}
              </span>
            )}
          </p>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              message.type === 'success'
                ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                : 'bg-red-500/10 border border-red-500/20 text-red-400'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Form */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
          {/* Basic Information */}
          <div className="p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter article title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Slug
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="article-url-slug"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category *
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData((prev) => ({ ...prev, category_id: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Excerpt
              </label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Brief description of your article"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Featured Image
              </label>
              <ImageUpload
                value={formData.featured_image}
                onChange={(url) => setFormData((prev) => ({ ...prev, featured_image: url }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={formData.tags.join(', ')}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    tags: e.target.value.split(',').map((tag) => tag.trim()).filter(Boolean),
                  }))
                }
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., education, research, university"
              />
            </div>
          </div>

          {/* Content Editor */}
          <div className="border-t border-gray-700">
            <div className="p-4 bg-gray-900/30">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Content *
              </label>
            </div>
            <EditorToolbar editor={editor} />
            <div className="bg-gray-900/50">
              <EditorContent editor={editor} />
            </div>
          </div>

          {/* SEO Section */}
          <div className="p-8 border-t border-gray-700 space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4">SEO Settings</h3>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Meta Title
              </label>
              <input
                type="text"
                value={formData.meta_title}
                onChange={(e) => setFormData((prev) => ({ ...prev, meta_title: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="SEO title for search engines"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Meta Description
              </label>
              <textarea
                value={formData.meta_description}
                onChange={(e) => setFormData((prev) => ({ ...prev, meta_description: e.target.value }))}
                rows={2}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="SEO description for search engines"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-8 bg-gray-900/30 border-t border-gray-700 flex gap-4">
            <button
              onClick={() => handleSave('draft')}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              <Save className="h-5 w-5" />
              Save as Draft
            </button>
            <button
              onClick={() => handleSave('pending')}
              disabled={saving || (submissionLimit && !submissionLimit.canSubmit && !id)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-5 w-5" />
              Submit for Review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
