import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Calendar, User, ArrowLeft, Edit, Trash2, Flame, Clock, Lock } from 'lucide-react'
import { adminAPI, blogAPI } from '../lib/api'
import { BlogService } from '../lib/services/blogService'
import { getCurrentUser } from '../lib/api'
import MarkdownPreview from '@uiw/react-markdown-preview'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import SaveButton from '../components/SaveButton'
import ArticleComments from '../components/ArticleComments'
import SEO from '../components/SEO'
import '../styles/editor.css'

interface Article {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  category: string
  is_premium?: boolean
  premium?: boolean
  featured_image?: string
  created_at: string
  updated_at: string
  author_id: string
}

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>()
  const [article, setArticle] = useState<Article | null>(null)
  const [latestArticles, setLatestArticles] = useState<Article[]>([])
  const [hotArticles, setHotArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [accessError, setAccessError] = useState<{ code: string; message: string } | null>(null)
  const navigate = useNavigate()

  // Check if current user is admin
  const currentUser = getCurrentUser()
  const isAdmin = currentUser && (currentUser.role === 'admin' || currentUser.email === 'admin@academora.com')

  useEffect(() => {
    async function fetchArticle() {
      if (!slug) return

      try {
        const data = await BlogService.getArticle(slug)
        const normalized: Article = {
          ...(data as Article),
          is_premium: (data as any)?.is_premium ?? (data as any)?.premium ?? false,
        }
        setArticle(normalized)
        setAccessError(null)
      } catch (error: any) {
        console.error('Error fetching article:', error)
        if (error?.code === 'LOGIN_REQUIRED' || error?.code === 'UPGRADE_REQUIRED') {
          setAccessError({
            code: error.code,
            message: error.error || error.message || '',
          })
        } else {
          setAccessError({
            code: error?.code || 'UNKNOWN',
            message: error?.message || 'Failed to load article.',
          })
        }
        setArticle(null)
      } finally {
        setLoading(false)
      }
    }

    async function fetchSidebarArticles() {
      try {
        const allArticles = await blogAPI.getArticles()
        const articles = Array.isArray(allArticles) ? allArticles : []
        
        // Exclude current article
        const filtered = articles.filter(a => a.slug !== slug)
        
        // Latest articles (most recent, limit 3)
        const latest = [...filtered]
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 3)
        setLatestArticles(latest)
        
        // Hot articles (could be most recent or featured, limit 3)
        // For now, using most recent as "hot" - you can customize this logic
        const hot = [...filtered]
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 3)
        setHotArticles(hot)
      } catch (error) {
        console.error('Error fetching sidebar articles:', error)
      }
    }

    fetchArticle()
    fetchSidebarArticles()
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

  if (accessError) {
    return (
      <div className="bg-gray-50 min-h-screen py-16">
        <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <Lock className="h-16 w-16 text-primary-600 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {accessError.code === 'LOGIN_REQUIRED' ? 'Premium Article' : 'Upgrade Required'}
            </h1>
            <p className="text-gray-600 mb-8">
              {accessError.message ||
                (accessError.code === 'LOGIN_REQUIRED'
                  ? 'Please register for a free account to read this article.'
                  : 'Upgrade to a Pro plan to unlock this premium article.')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to={accessError.code === 'UPGRADE_REQUIRED' ? '/pricing' : '/register'}
                className="px-6 py-3 rounded-lg font-semibold text-white bg-primary-600 hover:bg-primary-700 transition-colors w-full sm:w-auto"
              >
                {accessError.code === 'UPGRADE_REQUIRED' ? 'Upgrade to Pro' : 'Create Free Account'}
              </Link>
              <Link
                to="/login"
                className="px-6 py-3 rounded-lg font-semibold border border-primary-200 text-primary-700 hover:bg-primary-50 transition-colors w-full sm:w-auto"
              >
                Log In
              </Link>
              <Link to="/blog" className="text-sm text-gray-500 hover:text-gray-700 mt-2 sm:mt-0">
                Back to Blog
              </Link>
            </div>
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
      <SEO title={`${article.title} | AcademOra`} description={article.excerpt || article.title} />
      
      <div className="max-w-7xl mx-auto px-0 xl:px-4">
        <div className="xl:flex xl:gap-8">
          {/* Left Sidebar - Latest & Hot Articles */}
          <aside className="hidden xl:block xl:w-[320px] xl:flex-shrink-0 xl:pl-4">
            <div className="sticky top-28 space-y-6">
              {/* Latest Articles */}
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <Clock className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Latest Articles</h3>
                  </div>
                </div>
                <div className="p-4 space-y-4">
                  {latestArticles.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No articles yet</p>
                  ) : (
                    latestArticles.map((art) => (
                      <Link
                        key={art.id}
                        to={`/blog/${art.slug}`}
                        className="block group hover:scale-[1.02] transition-all duration-200"
                      >
                        <div className="bg-white rounded-xl shadow-md hover:shadow-lg overflow-hidden border border-gray-100">
                          {art.featured_image && (
                            <div className="w-full h-32 overflow-hidden bg-gray-200">
                              <img
                                src={art.featured_image}
                                alt={art.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            </div>
                          )}
                          <div className="p-4">
                            <h4 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 line-clamp-2 mb-2 transition-colors">
                              {art.title}
                            </h4>
                            <p className="text-xs text-gray-600 line-clamp-2 mb-2">{art.excerpt}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(art.created_at)}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>

              {/* Hot Articles */}
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <Flame className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Hot Articles</h3>
                  </div>
                </div>
                <div className="p-4 space-y-4">
                  {hotArticles.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No articles yet</p>
                  ) : (
                    hotArticles.map((art) => (
                      <Link
                        key={art.id}
                        to={`/blog/${art.slug}`}
                        className="block group hover:scale-[1.02] transition-all duration-200"
                      >
                        <div className="bg-white rounded-xl shadow-md hover:shadow-lg overflow-hidden border border-gray-100">
                          {art.featured_image && (
                            <div className="w-full h-32 overflow-hidden bg-gray-200">
                              <img
                                src={art.featured_image}
                                alt={art.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            </div>
                          )}
                          <div className="p-4">
                            <h4 className="text-sm font-bold text-gray-900 group-hover:text-orange-600 line-clamp-2 mb-2 transition-colors">
                              {art.title}
                            </h4>
                            <p className="text-xs text-gray-600 line-clamp-2 mb-2">{art.excerpt}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(art.created_at)}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8">
            {/* Right Side Ad Placeholder */}
            <div
              className="hidden xl:block fixed top-28 right-4 z-10"
              aria-label="Advertisement"
              data-testid="ad-right"
            >
              <div className="w-[160px] h-[600px] rounded-lg border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-gray-600 text-sm">
                Ad (160x600)
              </div>
            </div>
            
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

          <div className="mb-6 flex flex-wrap gap-2">
            {article.is_premium && (
              <span className="inline-flex items-center bg-yellow-100 text-yellow-800 text-sm font-semibold px-4 py-1 rounded-full">
                <Lock className="h-3 w-3 mr-1" />
                Premium
              </span>
            )}
            {Array.isArray((article as any).terms) && (article as any).terms.length > 0 ? (
              (article as any).terms.map((t: any) => (
                <span key={t.id} className="inline-block bg-primary-100 text-primary-700 text-sm font-semibold px-4 py-1 rounded-full">
                  {t.name}
                </span>
              ))
            ) : (
            <span className="inline-block bg-primary-100 text-primary-700 text-sm font-semibold px-4 py-1 rounded-full">
              {article.category}
            </span>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            {article.title}
          </h1>

          {/* Ad Placeholder - Below Title */}
          <div
            className="mb-8 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-gray-600"
            aria-label="Advertisement"
            data-testid="ad-below-title"
          >
            Ad placeholder (970x250)
          </div>

          <div className="flex items-center justify-between mb-8 pb-8 border-b border-gray-200">
            <div className="flex items-center text-gray-600">
              <div className="flex items-center mr-6">
                <Calendar className="h-5 w-5 mr-2" />
                <span>{formatDate(article.created_at)}</span>
              </div>
              <div className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                <span>Author</span>
              </div>
            </div>
            <SaveButton
              itemType="article"
              itemId={article.id}
              itemData={{ title: article.title, excerpt: article.excerpt, slug: article.slug }}
            />
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

          {/* Ad Placeholder - Above Content */}
          <div
            className="mb-8 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-gray-600"
            aria-label="Advertisement"
            data-testid="ad-above-content"
          >
            Ad placeholder (728x90)
          </div>

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

          {/* Ad Placeholder - Below Content */}
          <div
            className="mt-10 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-gray-600"
            aria-label="Advertisement"
            data-testid="ad-below-content"
          >
            Ad placeholder (300x250)
          </div>

          <div className="mt-12">
            <ArticleComments slug={article.slug} />
          </div>
        </article>
          </div>
        </div>
      </div>
    </div>
  )
}

