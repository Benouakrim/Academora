import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Calendar, User, ArrowLeft, Edit, Trash2, Flame, Clock, Lock, Star, TrendingUp } from 'lucide-react'
import { adminAPI } from '../lib/api'
import { BlogService } from '../lib/services/blogService'
import { getCurrentUser } from '../lib/api'
import MarkdownPreview from '@uiw/react-markdown-preview'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import SaveButton from '../components/SaveButton'
import ArticleComments from '../components/ArticleComments'
import SEO from '../components/SEO'
import '../styles/editor.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

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
  const [similarArticles, setSimilarArticles] = useState<Article[]>([])
  const [recommendedArticles, setRecommendedArticles] = useState<Article[]>([])
  const [activeTab, setActiveTab] = useState<'similar' | 'recommended' | 'hot' | 'latest'>('similar')
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

    fetchArticle()
  }, [slug])

  useEffect(() => {
    let isMounted = true;
    let cleanupFn: (() => void) | undefined;

    async function fetchSidebarArticles() {
      try {
        // Use the new unified API endpoint
        const response = await fetch(`${API_URL}/blog/sections/${slug}?limit=6`)
        if (!response.ok) {
          throw new Error('Failed to fetch article sections')
        }
        
        const sections = await response.json()
        
        if (!isMounted) return;
        
        setSimilarArticles(sections.similar || [])
        setRecommendedArticles(sections.recommended || [])
        setHotArticles(sections.hot || [])
        setLatestArticles(sections.latest || [])
      } catch (error) {
        console.error('Error fetching article sections:', error)
        // Fallback to empty arrays if API fails
        if (isMounted) {
          setSimilarArticles([])
          setRecommendedArticles([])
          setHotArticles([])
          setLatestArticles([])
        }
      }
    }

    if (article) {
      fetchSidebarArticles()
      // Track article view - returns cleanup function
      cleanupFn = trackArticleView()
    }

    return () => {
      isMounted = false;
      if (cleanupFn) {
        cleanupFn();
      }
    };
  }, [article?.id])

  const trackArticleView = () => {
    // Generate a unique session ID per article per browser session
    const sessionKey = `article_view_${slug}_${sessionStorage.getItem('articleSessionId')}`;
    
    // Check if we already tracked this view in this session
    const alreadyTracked = sessionStorage.getItem(sessionKey);
    if (alreadyTracked) {
      console.log('Article view already tracked in this session');
      return () => {}; // Return empty cleanup
    }

    let viewStartTime: number;
    let durationInterval: NodeJS.Timeout | undefined;
    let hasTracked = false;

    const trackView = async () => {
      try {
        // Generate a global session ID if not exists
        let sessionId = sessionStorage.getItem('articleSessionId')
        if (!sessionId) {
          sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          sessionStorage.setItem('articleSessionId', sessionId)
        }

        viewStartTime = Date.now();
        
        // Get auth token if available
        const token = localStorage.getItem('token')
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        }
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }
        
        // Track the view immediately
        const response = await fetch(`${API_URL}/blog/${slug}/track-view`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            sessionId,
          }),
        })

        if (response.ok) {
          hasTracked = true;
          // Mark as tracked in session storage
          sessionStorage.setItem(sessionKey, 'true');
          console.log('Article view tracked successfully')
        }

        // Update view duration when user leaves the page
        const updateViewDuration = async () => {
          if (!hasTracked) return;
          
          const duration = Math.round((Date.now() - viewStartTime) / 1000)
          if (duration > 5) { // Only update if stayed more than 5 seconds
            try {
              await fetch(`${API_URL}/blog/${slug}/track-view`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                  sessionId,
                  duration,
                }),
              })
            } catch (error) {
              // Silent fail for duration tracking
            }
          }
        }

        // Track duration on page unload
        window.addEventListener('beforeunload', updateViewDuration)
        
        // Also track duration every 30 seconds for more accurate data
        durationInterval = setInterval(() => {
          const currentDuration = Math.round((Date.now() - viewStartTime) / 1000)
          if (currentDuration > 0 && currentDuration % 30 === 0) {
            updateViewDuration()
          }
        }, 30000)
      } catch (error) {
        console.error('Error tracking article view:', error)
        // Silent fail - don't break the user experience
      }
    };

    // Call the tracking function
    trackView();

    // Return cleanup function
    return () => {
      if (durationInterval) {
        clearInterval(durationInterval);
      }
      // Note: We don't remove beforeunload listener as it's one-time use
    };
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getCurrentTabData = () => {
    switch (activeTab) {
      case 'similar':
        return {
          articles: similarArticles,
          title: 'Similar Topics',
          icon: TrendingUp,
          colorClass: 'from-purple-600 to-purple-700',
          hoverColor: 'text-purple-600'
        }
      case 'recommended':
        return {
          articles: recommendedArticles,
          title: 'Recommended Articles',
          icon: Star,
          colorClass: 'from-green-600 to-green-700',
          hoverColor: 'text-green-600'
        }
      case 'hot':
        return {
          articles: hotArticles,
          title: 'Hot Articles',
          icon: Flame,
          colorClass: 'from-orange-600 to-orange-700',
          hoverColor: 'text-orange-600'
        }
      case 'latest':
        return {
          articles: latestArticles,
          title: 'Latest Articles',
          icon: Clock,
          colorClass: 'from-blue-600 to-blue-700',
          hoverColor: 'text-blue-600'
        }
      default:
        return {
          articles: similarArticles,
          title: 'Similar Topics',
          icon: TrendingUp,
          colorClass: 'from-purple-600 to-purple-700',
          hoverColor: 'text-purple-600'
        }
    }
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
    <div className="bg-gray-50 min-h-screen">
      <SEO title={`${article.title} | AcademOra`} description={article.excerpt || article.title} />
      
      {/* Top Ad Banner */}
      <div className="w-full bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div
            className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-center text-gray-600"
            aria-label="Advertisement"
            data-testid="ad-top-banner"
          >
            Ad Banner (970x90)
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <Link
            to="/blog"
            className="inline-flex items-center text-primary-600 hover:text-primary-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Link>
        </div>

        {/* Main Article - Full Width */}
        <article className="bg-white rounded-xl shadow-lg p-8 md:p-12 lg:p-16 mb-12">
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

          {/* Article Meta */}
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

          {/* Article Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-8 leading-tight">
            {article.title}
          </h1>

          {/* Ad Below Title */}
          <div
            className="mb-8 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-gray-600"
            aria-label="Advertisement"
            data-testid="ad-below-title"
          >
            Ad placeholder (970x250)
          </div>

          {/* Article Info */}
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

          {/* Featured Image */}
          {article.featured_image && (
            <div className="mb-8 rounded-lg overflow-hidden">
              <img
                src={article.featured_image}
                alt={article.title}
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          {/* Ad Above Content */}
          <div
            className="mb-8 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-gray-600"
            aria-label="Advertisement"
            data-testid="ad-above-content"
          >
            Ad placeholder (728x90)
          </div>

          {/* Article Content - Full Width Reading */}
          <div className="prose prose-lg prose-xl max-w-none prose-headings:mb-6 prose-p:mb-4 prose-ul:mb-4 prose-li:mb-2 prose-h2:mt-8 prose-h3:mt-6 prose-h4:mt-4 leading-relaxed markdown-preview" data-color-mode="light">
            <MarkdownPreview 
              source={article.content} 
              rehypePlugins={[rehypeRaw]} 
              remarkPlugins={[remarkGfm]}
              className="bg-transparent"
              wrapperElement={{
                "data-color-mode": "light"
              }}
            />
          </div>

          {/* Ad Below Content */}
          <div
            className="mt-12 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-gray-600"
            aria-label="Advertisement"
            data-testid="ad-below-content"
          >
            Ad placeholder (300x250)
          </div>
        </article>

        {/* Article Sections - Unified Navigation */}
        <div className="space-y-8">
          {/* Unified Article Navigation */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Tab Navigation */}
            <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
                  <button
                    onClick={() => setActiveTab('similar')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'similar' 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <TrendingUp className="h-4 w-4" />
                    <span className="hidden sm:inline">Similar</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('recommended')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'recommended' 
                        ? 'bg-green-100 text-green-700' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Star className="h-4 w-4" />
                    <span className="hidden sm:inline">Recommended</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('hot')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'hot' 
                        ? 'bg-orange-100 text-orange-700' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Flame className="h-4 w-4" />
                    <span className="hidden sm:inline">Hot</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('latest')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'latest' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Clock className="h-4 w-4" />
                    <span className="hidden sm:inline">Latest</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-2 bg-gradient-to-r ${getCurrentTabData().colorClass} rounded-lg`}>
                  {(() => {
                    const Icon = getCurrentTabData().icon
                    return <Icon className="h-5 w-5 text-white" />
                  })()}
                </div>
                <h3 className="text-xl font-bold text-gray-900">{getCurrentTabData().title}</h3>
              </div>
              
              {getCurrentTabData().articles.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-12">No articles yet</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getCurrentTabData().articles.map((art) => {
                    const tabData = getCurrentTabData()
                    return (
                      <Link
                        key={art.id}
                        to={`/blog/${art.slug}`}
                        className="group hover:scale-[1.02] transition-all duration-200"
                      >
                        <div className="bg-gray-50 rounded-xl shadow-md hover:shadow-lg overflow-hidden border border-gray-100 h-full">
                          {art.featured_image && (
                            <div className="w-full h-48 overflow-hidden bg-gray-200">
                              <img
                                src={art.featured_image}
                                alt={art.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            </div>
                          )}
                          <div className="p-5">
                            <h4 className={`text-base font-bold text-gray-900 line-clamp-2 mb-3 transition-colors group-hover:${tabData.hoverColor}`}>
                              {art.title}
                            </h4>
                            <p className="text-sm text-gray-600 line-clamp-3 mb-4">{art.excerpt}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(art.created_at)}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Middle Ad Banner */}
          <div
            className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-gray-600"
            aria-label="Advertisement"
            data-testid="ad-middle-banner"
          >
            Ad Banner (970x250)
          </div>

          {/* Comments Section */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100">
            <ArticleComments slug={article.slug} />
          </div>
        </div>
      </div>

      {/* Bottom Ad Banner */}
      <div className="w-full bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div
            className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-center text-gray-600"
            aria-label="Advertisement"
            data-testid="ad-bottom-banner"
          >
            Ad Banner (970x90)
          </div>
        </div>
      </div>
    </div>
  )
}

