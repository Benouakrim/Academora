import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Calendar, User, ArrowLeft, Edit, Trash2 } from 'lucide-react'
import { blogAPI, adminAPI } from '../lib/api'
import { getCurrentUser } from '../lib/api'
import MarkdownPreview from '@uiw/react-markdown-preview'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import '../styles/editor.css'

interface Article {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  category: string
  featured_image?: string
  created_at: string
  updated_at: string
  author_id: string
}

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>()
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const navigate = useNavigate()

  // Check if current user is admin
  const currentUser = getCurrentUser()
  const isAdmin = currentUser && (currentUser.role === 'admin' || currentUser.email === 'admin@academora.com')

  useEffect(() => {
    async function fetchArticle() {
      if (!slug) return

      try {
        const data = await blogAPI.getArticle(slug)
        setArticle(data as Article)
      } catch (error) {
        console.error('Error fetching article:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchArticle()
  }, [slug])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const handleEditArticle = () => {
    if (article) {
      navigate(`/admin/articles/edit/${article.id}`)
    }
  }

  const handleDeleteArticle = async () => {
    if (!article) return
    
    if (!window.confirm(`Are you sure you want to delete "${article.title}"? This action cannot be undone.`)) {
      return
    }

    setDeleting(true)
    try {
      await adminAPI.deleteArticle(article.id)
      navigate('/blog')
    } catch (error: any) {
      console.error('Error deleting article:', error)
      alert('Failed to delete article: ' + (error.message || 'Unknown error'))
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen py-16">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 xl:px-16">
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Loading article...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="bg-gray-50 min-h-screen py-16">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 xl:px-16">
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
            <p className="text-gray-600 mb-6">The article you're looking for doesn't exist.</p>
            <Link to="/blog" className="btn-primary">
              Back to Blog
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 xl:px-16">
        <Link
          to="/blog"
          className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Blog
        </Link>

        <article className="bg-white rounded-xl shadow-lg p-10 md:p-16">
          {/* Admin Actions Bar */}
          {isAdmin && (
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
              <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Admin Mode
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleEditArticle}
                  className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  Edit Article
                </button>
                <button
                  onClick={handleDeleteArticle}
                  disabled={deleting}
                  className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          <div className="mb-6">
            <span className="inline-block bg-primary-100 text-primary-700 text-sm font-semibold px-4 py-1 rounded-full">
              {article.category}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            {article.title}
          </h1>

          <div className="flex items-center text-gray-600 mb-8 pb-8 border-b border-gray-200">
            <div className="flex items-center mr-6">
              <Calendar className="h-5 w-5 mr-2" />
              <span>{formatDate(article.created_at)}</span>
            </div>
            <div className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              <span>Author</span>
            </div>
          </div>

          {article.featured_image && (
            <div className="mb-8 rounded-lg overflow-hidden">
              <img
                src={article.featured_image}
                alt={article.title}
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          <div className="prose prose-lg max-w-none prose-headings:mb-6 prose-p:mb-4 prose-ul:mb-4 prose-li:mb-2 prose-h2:mt-8 prose-h3:mt-6 prose-h4:mt-4 leading-relaxed markdown-preview" data-color-mode="light">
            <MarkdownPreview 
              source={article.content} 
              rehypePlugins={[rehypeRaw]} 
              remarkPlugins={[remarkGfm]}
              style={{ background: 'transparent' }}
              wrapperElement={{
                "data-color-mode": "light"
              }}
            />
          </div>
        </article>
      </div>
    </div>
  )
}

