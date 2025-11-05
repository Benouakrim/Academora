import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Eye, Globe, FileText } from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import LinkExtension from '@tiptap/extension-link';
import ImageExtension from '@tiptap/extension-image';
import EditorToolbar from '../components/EditorToolbar';
import '../styles/editor.css';

interface PageData {
  id?: string;
  title: string;
  slug: string;
  content: string;
  meta_title: string;
  meta_description: string;
  status: 'published' | 'draft';
  template: 'default' | 'about' | 'contact' | 'custom';
  updated_at?: string;
  created_at?: string;
}

const templates = [
  { id: 'default', name: 'Default Page', description: 'Standard page layout' },
  { id: 'about', name: 'About Page', description: 'Company/team information layout' },
  { id: 'contact', name: 'Contact Page', description: 'Contact form and information layout' },
  { id: 'custom', name: 'Custom Page', description: 'Fully customizable layout' }
];

export default function PageEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageType, setPageType] = useState<'about' | 'contact' | 'custom'>('custom');

  const [formData, setFormData] = useState<PageData>({
    title: '',
    slug: '',
    content: '',
    meta_title: '',
    meta_description: '',
    status: 'draft',
    template: 'default'
  });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4],
        },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      LinkExtension.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
      }),
      ImageExtension.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg shadow-md',
        },
      }),
    ],
    content: formData.content,
    onUpdate: ({ editor }) => {
      setFormData(prev => ({
        ...prev,
        content: editor.getHTML()
      }));
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[400px] p-8 prose-headings:mb-6 prose-p:mb-4 prose-ul:mb-4 prose-li:mb-2 prose-h2:mt-8 prose-h3:mt-6 prose-h4:mt-4 leading-relaxed',
      },
    },
  });

  useEffect(() => {
    if (isEditMode && id) {
      fetchPage(id);
    } else {
      // Set default values based on page type
      if (pageType === 'about') {
        setFormData(prev => ({
          ...prev,
          title: 'About Us',
          slug: 'about',
          meta_title: 'About Us - AcademOra',
          meta_description: 'Learn more about AcademOra and our mission to provide academic guidance.',
          template: 'about'
        }));
      } else if (pageType === 'contact') {
        setFormData(prev => ({
          ...prev,
          title: 'Contact Us',
          slug: 'contact',
          meta_title: 'Contact Us - AcademOra',
          meta_description: 'Get in touch with the AcademOra team for academic guidance and support.',
          template: 'contact'
        }));
      }
    }
  }, [id, isEditMode, pageType]);

  const fetchPage = async (pageId: string) => {
    try {
      setLoading(true);
      // In real implementation, fetch from your API
      // const pageData = await adminAPI.getPage(pageId);
      
      // Mock data for demonstration
      const mockPage: PageData = {
        id: pageId,
        title: pageId === 'about' ? 'About Us' : 'Contact Us',
        slug: pageId,
        content: '<p>Page content goes here...</p>',
        meta_title: `${pageId === 'about' ? 'About Us' : 'Contact Us'} - AcademOra`,
        meta_description: `Learn more about AcademOra's ${pageId === 'about' ? 'mission and team' : 'contact information'}.`,
        status: 'published',
        template: pageId === 'about' ? 'about' : 'contact'
      };
      
      setFormData(mockPage);
      editor?.commands.setContent(mockPage.content);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch page');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-generate slug from title
    if (name === 'title' && !isEditMode) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData(prev => ({
        ...prev,
        slug
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Title and content are required');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // In real implementation, save to your API
      // if (isEditMode) {
      //   await adminAPI.updatePage(id!, formData);
      // } else {
      //   await adminAPI.createPage(formData);
      // }

      console.log('Saving page:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      navigate('/admin/pages');
    } catch (err: any) {
      setError(err.message || 'Failed to save page');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    // Open preview in new tab
    const previewWindow = window.open('', '_blank');
    if (previewWindow) {
      previewWindow.document.write(`
        <html>
          <head>
            <title>${formData.meta_title || formData.title}</title>
            <meta name="description" content="${formData.meta_description}">
            <style>
              body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; margin: 0; padding: 20px; }
              .container { max-width: 800px; margin: 0 auto; }
              h1, h2, h3 { color: #1f2937; }
              .meta { color: #6b7280; font-size: 0.875rem; margin-bottom: 2rem; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>${formData.title}</h1>
              <div class="meta">
                Status: ${formData.status} | Template: ${formData.template}
              </div>
              <div>${formData.content}</div>
            </div>
          </body>
        </html>
      `);
      previewWindow.document.close();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="flex h-screen">
        {/* Left Sidebar - Page Settings */}
        <div className="w-80 bg-white/95 backdrop-blur-sm border-r border-gray-200/80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400 transition-all shadow-lg">
          <div className="p-6 animate-fadeIn">
            <div className="flex items-center gap-2 mb-6">
              <FileText className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-800">Page Settings</h2>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm animate-slideDown">
                {error}
              </div>
            )}

            <form id="page-form" onSubmit={handleSubmit} className="space-y-4">
              {/* Page Type (for new pages) */}
              {!isEditMode && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Page Type
                  </label>
                  <select
                    name="pageType"
                    value={pageType}
                    onChange={(e) => setPageType(e.target.value as 'about' | 'contact' | 'custom')}
                    className="w-full px-3 py-2 bg-gray-50 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-300 transition-all duration-200 hover:bg-white hover:border-blue-300 focus:bg-white focus:border-blue-500"
                  >
                    <option value="custom">Custom Page</option>
                    <option value="about">About Us Page</option>
                    <option value="contact">Contact Us Page</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Page Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 bg-gray-50 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-300 transition-all duration-200 hover:bg-white hover:border-blue-300 focus:bg-white focus:border-blue-500"
                  placeholder="Enter page title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL Slug *
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  required
                  pattern="[a-z0-9-]+"
                  className="w-full px-3 py-2 bg-gray-50 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-300 transition-all duration-200 hover:bg-white hover:border-blue-300 focus:bg-white focus:border-blue-500 font-mono text-sm"
                  placeholder="page-url-slug"
                />
                <p className="text-xs text-gray-500 mt-1">Lowercase letters, numbers, and hyphens only</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template
                </label>
                <select
                  name="template"
                  value={formData.template}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-50 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-300 transition-all duration-200 hover:bg-white hover:border-blue-300 focus:bg-white focus:border-blue-500"
                >
                  {templates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-50 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-300 transition-all duration-200 hover:bg-white hover:border-blue-300 focus:bg-white focus:border-blue-500"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              {/* SEO Settings */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  SEO Settings
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta Title
                    </label>
                    <input
                      type="text"
                      name="meta_title"
                      value={formData.meta_title}
                      onChange={handleInputChange}
                      maxLength={60}
                      className="w-full px-3 py-2 bg-gray-50 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-300 transition-all duration-200 hover:bg-white hover:border-blue-300 focus:bg-white focus:border-blue-500"
                      placeholder="SEO title (60 chars max)"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.meta_title.length}/60 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta Description
                    </label>
                    <textarea
                      name="meta_description"
                      value={formData.meta_description}
                      onChange={handleInputChange}
                      maxLength={160}
                      rows={3}
                      className="w-full px-3 py-2 bg-gray-50 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-300 transition-all duration-200 hover:bg-white hover:border-blue-300 focus:bg-white focus:border-blue-500 resize-none"
                      placeholder="SEO description (160 chars max)"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.meta_description.length}/160 characters
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col bg-gradient-to-b from-white to-gray-50">
          {/* Header */}
          <div className="bg-white/95 backdrop-blur-md border-b border-gray-200 px-6 py-4 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link
                  to="/admin/pages"
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 group"
                  title="Back to Pages"
                >
                  <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-200" />
                </Link>
                <div className="flex items-center gap-3">
                  <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full shadow-sm"></div>
                  <h1 className="text-xl font-semibold text-gray-800">
                    {isEditMode ? 'Edit Page' : 'Create New Page'}
                  </h1>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handlePreview}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200 hover:scale-105 border border-gray-300 flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Preview
                </button>
                <Link 
                  to="/admin/pages" 
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200 hover:scale-105 border border-gray-300"
                >
                  Cancel
                </Link>
                <button 
                  type="submit"
                  form="page-form"
                  disabled={saving}
                  className="px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md hover:shadow-lg hover:scale-105 disabled:hover:scale-100"
                >
                  <Save className="h-4 w-4" />
                  <span className="font-medium">{saving ? 'Saving...' : 'Save Page'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Editor Area */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <form id="page-form" onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
              {/* Toolbar */}
              <div className="animate-slideDown">
                <EditorToolbar editor={editor} />
              </div>

              {/* Editor Content */}
              <div className="flex-1 overflow-y-auto bg-white">
                <EditorContent editor={editor} />
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
