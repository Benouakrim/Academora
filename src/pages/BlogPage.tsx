import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Calendar, User, ArrowRight, Edit, Trash2, Eye, BookOpen, FileText, Search, Filter, Tag as TagIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { adminAPI } from '../lib/api'
import { BlogService } from '../lib/services/blogService'
import SEO from '../components/SEO'
import { getCurrentUser } from '../lib/api'
import AnimatedBackground from '../components/AnimatedBackground'

interface Article {
  id: string
  title: string
  slug: string
  excerpt: string
  category: string
  featured_image?: string
  created_at: string
  author_id: string
}

interface Doc {
  id: string
  title: string
  slug: string
  description: string
  category: string
  created_at: string
  updated_at: string
}

export default function BlogPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [articles, setArticles] = useState<Article[]>([])
  const [docs, setDocs] = useState<Doc[]>([])
  const [viewMode, setViewMode] = useState<'articles' | 'docs'>('articles')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState(() => searchParams.get('q') || '')
  const [selectedCategory, setSelectedCategory] = useState(() => searchParams.get('category') || 'all')
  const [selectedTag, setSelectedTag] = useState(() => searchParams.get('tag') || 'all')
  const navigate = useNavigate()

  // Initialize view mode from URL parameter
  useEffect(() => {
    const view = searchParams.get('view') as 'articles' | 'docs'
    if (view === 'docs') {
      setViewMode('docs')
      setSelectedTag('all')
    } else {
      setViewMode('articles')
    }
  }, [searchParams])

  const syncParams = useCallback((nextState: Partial<{ viewMode: 'articles' | 'docs'; searchTerm: string; selectedCategory: string; selectedTag: string }>) => {
    setSearchParams(prev => {
      const params = new URLSearchParams(prev)
      const computedView = nextState.viewMode ?? viewMode
      const computedSearch = nextState.searchTerm ?? searchTerm
      const computedCategory = nextState.selectedCategory ?? selectedCategory
      const computedTag = computedView === 'articles' ? (nextState.selectedTag ?? selectedTag) : 'all'

      if (computedView === 'docs') {
        params.set('view', 'docs')
      } else {
        params.delete('view')
      }

      if (computedSearch && computedSearch.trim().length > 0) {
        params.set('q', computedSearch)
      } else {
        params.delete('q')
      }

      if (computedCategory && computedCategory !== 'all') {
        params.set('category', computedCategory)
      } else {
        params.delete('category')
      }

      if (computedView === 'articles' && computedTag && computedTag !== 'all') {
        params.set('tag', computedTag)
      } else {
        params.delete('tag')
      }

      return params
    })
  }, [searchTerm, selectedCategory, selectedTag, setSearchParams, viewMode])

  // Update URL when view mode changes
  const handleViewModeChange = (mode: 'articles' | 'docs') => {
    setViewMode(mode)
    if (mode === 'docs') {
      setSelectedTag('all')
    }
    syncParams({ viewMode: mode, selectedTag: mode === 'articles' ? selectedTag : 'all' })
  }

  // Check if current user is admin
  const currentUser = getCurrentUser()
  const isAdmin = currentUser && (currentUser.role === 'admin' || currentUser.email === 'admin@academora.com')

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch articles
        const articlesData = await (BlogService as any).list ? await (BlogService as any).list() : await (BlogService as any).getArticles()
        setArticles(articlesData || [])
        
        // Fetch docs - this would be from a docs service
        // For now, I'll create some mock docs data
        const mockDocs: Doc[] = [
          {
            id: '1',
            title: 'Getting Started Guide',
            slug: 'getting-started',
            description: 'Complete guide to getting started with AcademOra platform',
            category: 'User Guide',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '2',
            title: 'API Documentation',
            slug: 'api-docs',
            description: 'Technical documentation for AcademOra API endpoints',
            category: 'Technical',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '3',
            title: 'Feature Overview',
            slug: 'feature-overview',
            description: 'Comprehensive overview of all AcademOra features',
            category: 'Features',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]
        setDocs(mockDocs)
        
        setError(null)
      } catch (error: any) {
        console.error('Error fetching data:', error)
        const errorMessage = error?.message || 'Failed to fetch content. Please check if the server is running and configured correctly.'
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const handleEditArticle = (articleId: string) => {
    navigate(`/admin/articles/edit/${articleId}`)
  }

  const handleDeleteArticle = async (articleId: string, articleTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete "${articleTitle}"? This action cannot be undone.`)) {
      return
    }

    setDeletingId(articleId)
    try {
      await adminAPI.deleteArticle(articleId)
      setArticles(articles.filter(article => article.id !== articleId))
    } catch (error: any) {
      console.error('Error deleting article:', error)
      alert('Failed to delete article: ' + (error.message || 'Unknown error'))
    } finally {
      setDeletingId(null)
    }
  }

  const articleCategories = useMemo(() => {
    const categorySet = new Set<string>()
    articles.forEach(article => {
      if (article.category) {
        categorySet.add(article.category)
      }
    })
    return Array.from(categorySet).sort()
  }, [articles])

  const articleTags = useMemo(() => {
    const tagMap = new Map<string, string>()
    articles.forEach(article => {
      const terms = (article as any)?.terms
      if (Array.isArray(terms)) {
        terms.forEach((term: any) => {
          const value = (term?.slug || term?.name || '').trim()
          if (value) {
            tagMap.set(value, term?.name || value)
          }
        })
      }
    })
    return Array.from(tagMap.entries()).map(([value, label]) => ({ value, label })).sort((a, b) => a.label.localeCompare(b.label))
  }, [articles])

  const docCategories = useMemo(() => {
    const categorySet = new Set<string>()
    docs.forEach(doc => {
      if (doc.category) {
        categorySet.add(doc.category)
      }
    })
    return Array.from(categorySet).sort()
  }, [docs])

  const normalizedSearch = searchTerm.trim().toLowerCase()

  const filteredArticles = useMemo(() => {
    const normalizedSelectedCategory = selectedCategory.toLowerCase()
    const normalizedSelectedTag = selectedTag.toLowerCase()
    const tagFilterActive = normalizedSelectedTag !== 'all' && normalizedSelectedTag.length > 0
    const tagExistsInOptions = tagFilterActive
      ? articleTags.some(tag => tag.value.toLowerCase() === normalizedSelectedTag)
      : false

    return articles.filter(article => {
      const matchesSearch = normalizedSearch
        ? [article.title, article.excerpt, article.category]
            .filter(Boolean)
            .some(field => (field as string).toLowerCase().includes(normalizedSearch)) ||
          (((article as any)?.terms as any[])?.some(term =>
            (term?.name || term?.slug || '').toLowerCase().includes(normalizedSearch)
          ) ?? false)
        : true

      const matchesCategory = selectedCategory === 'all' || !selectedCategory
        ? true
        : (article.category || '').toLowerCase() === normalizedSelectedCategory

      const matchesTag = !tagFilterActive
        ? true
        : tagExistsInOptions
          ? (((article as any)?.terms as any[])?.some(term => {
              const tagValue = (term?.slug || term?.name || '').toLowerCase()
              return tagValue === normalizedSelectedTag
            }) ?? false)
          : true

      return matchesSearch && matchesCategory && matchesTag
    })
  }, [articleTags, articles, normalizedSearch, selectedCategory, selectedTag])

  const filteredDocs = useMemo(() => {
    return docs.filter(doc => {
      const matchesSearch = normalizedSearch
        ? [doc.title, doc.description, doc.category]
            .filter(Boolean)
            .some(field => (field as string).toLowerCase().includes(normalizedSearch))
        : true

      const matchesCategory = selectedCategory === 'all' || !selectedCategory
        ? true
        : (doc.category || '').toLowerCase() === selectedCategory.toLowerCase()

      return matchesSearch && matchesCategory
    })
  }, [docs, normalizedSearch, selectedCategory])

  const hasActiveFilters = Boolean(
    normalizedSearch.length > 0 ||
    (selectedCategory && selectedCategory !== 'all') ||
    (viewMode === 'articles' && selectedTag !== 'all')
  )

  const handleSearchInputChange = (value: string) => {
    setSearchTerm(value)
    syncParams({ searchTerm: value })
  }

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value)
    syncParams({ selectedCategory: value })
  }

  const handleTagChange = (value: string) => {
    setSelectedTag(value)
    syncParams({ selectedTag: value })
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('all')
    setSelectedTag('all')
    syncParams({ searchTerm: '', selectedCategory: 'all', selectedTag: 'all' })
  }

  const activeArticles = filteredArticles
  const activeDocs = filteredDocs
  const categoryOptions = useMemo(() => {
    const base = viewMode === 'articles' ? articleCategories : docCategories
    if (selectedCategory !== 'all' && selectedCategory && !base.includes(selectedCategory)) {
      return [...base, selectedCategory].sort()
    }
    return base
  }, [articleCategories, docCategories, selectedCategory, viewMode])

  useEffect(() => {
    if (viewMode === 'docs' && selectedCategory !== 'all' && selectedCategory && !docCategories.includes(selectedCategory)) {
      setSelectedCategory('all')
      syncParams({ selectedCategory: 'all' })
    }
  }, [docCategories, selectedCategory, syncParams, viewMode])

  return (
    <div className="relative bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] min-h-screen py-20 overflow-hidden">
      <SEO title="AcademOra Read" description="Insights, guides, and articles for your academic journey" />
      
      {/* Animated background elements */}
      <AnimatedBackground 
  colors={['var(--chart-color-2)', 'var(--chart-color-1)', 'var(--chart-color-4)', 'var(--chart-color-5)']} 
        orbCount={4}
        duration={15}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="mb-8">
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20"
              animate={{ 
                boxShadow: ["0 0 20px rgba(139, 92, 246, 0.5)", "0 0 40px rgba(139, 92, 246, 0.8)", "0 0 20px rgba(139, 92, 246, 0.5)"]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <BookOpen className="w-4 h-4 text-purple-300" />
              <span className="text-sm font-medium text-purple-200">AcademOra Read</span>
            </motion.div>
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-6">
            <span className="bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
              Insights & Stories
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              for Your Journey
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-8">
            Navigate your academic path with expert guides, inspiring stories, and valuable insights
          </p>
          
          {/* Admin Indicator */}
          {isAdmin && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-6 inline-flex items-center gap-3 bg-green-500/20 backdrop-blur-sm text-green-300 px-6 py-3 rounded-full text-sm font-medium border border-green-500/30"
            >
              <motion.div
                className="w-3 h-3 bg-green-400 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              Admin Mode - Hover over articles for actions
            </motion.div>
          )}
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col gap-6 mb-12"
        >
          <div className="flex justify-center">
            <div className="inline-flex items-center bg-gray-800/50 backdrop-blur-sm rounded-full p-1 border border-gray-700/50">
              <button
                onClick={() => handleViewModeChange('articles')}
                className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                  viewMode === 'articles'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <BookOpen className="h-4 w-4" />
                Articles
              </button>
              <button
                onClick={() => handleViewModeChange('docs')}
                className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                  viewMode === 'docs'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <FileText className="h-4 w-4" />
                Docs
              </button>
            </div>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={event => handleSearchInputChange(event.target.value)}
                    placeholder={viewMode === 'articles' ? 'Search articles by title, excerpt, category, or tag' : 'Search docs by title or description'}
                    className="w-full bg-black/60 rounded-xl py-3 pl-12 pr-4 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition"
                  />
                </div>

                <div className="flex flex-wrap gap-3 md:w-auto">
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <select
                      value={selectedCategory}
                      onChange={event => handleCategoryChange(event.target.value)}
                      className="appearance-none bg-black/60 rounded-xl py-3 pl-10 pr-8 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition min-w-[160px]"
                    >
                      <option value="all">All Categories</option>
                      {categoryOptions.map(category => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">▾</span>
                  </div>

                  {viewMode === 'articles' && articleTags.length > 0 && (
                    <div className="relative">
                      <TagIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <select
                        value={selectedTag}
                        onChange={event => handleTagChange(event.target.value)}
                        className="appearance-none bg-black/60 rounded-xl py-3 pl-10 pr-8 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition min-w-[160px]"
                      >
                        <option value="all">All Tags</option>
                        {articleTags.map(tag => (
                          <option key={tag.value} value={tag.value}>
                            {tag.label}
                          </option>
                        ))}
                      </select>
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">▾</span>
                    </div>
                  )}
                </div>
              </div>

              {hasActiveFilters && (
                <div className="flex justify-between flex-col gap-3 text-sm text-gray-400 md:flex-row md:items-center">
                  <span>
                    Showing {viewMode === 'articles' ? activeArticles.length : activeDocs.length}{' '}
                    {viewMode === 'articles' ? 'article' : 'doc'}
                    {(viewMode === 'articles' ? activeArticles : activeDocs).length === 1 ? '' : 's'}
                  </span>
                  <button
                    onClick={handleClearFilters}
                    className="inline-flex items-center gap-2 text-purple-300 hover:text-purple-200 transition-colors"
                  >
                    <span>Clear filters</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="text-center py-20">
            <motion.div
              className="inline-block rounded-full h-16 w-16 border-4 border-purple-500/30 border-t-purple-400 backdrop-blur-sm"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-6 text-gray-300 text-lg"
            >
              Loading amazing articles...
            </motion.p>
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="bg-red-900/20 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto">
              <h3 className="text-xl font-bold text-red-300 mb-4">Error Loading Articles</h3>
              <p className="text-red-400 mb-4">{error}</p>
              <p className="text-sm text-red-500">
                Make sure the backend server is running on port 3001 and your environment variables are configured correctly.
              </p>
            </div>
          </motion.div>
        ) : viewMode === 'articles' && activeArticles.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-12">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-6" />
              <p className="text-xl text-gray-300 mb-4">
                {articles.length === 0 ? 'No articles found.' : 'No articles match your search or filters.'}
              </p>
              <p className="text-gray-500">
                {articles.length === 0 ? 'Check back soon for new content!' : 'Try adjusting your filters or search term to find something else.'}
              </p>
            </div>
          </motion.div>
        ) : viewMode === 'docs' && activeDocs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-6" />
              <p className="text-xl text-gray-300 mb-4">
                {docs.length === 0 ? 'No docs found.' : 'No docs match your search or filters.'}
              </p>
              <p className="text-gray-500">
                {docs.length === 0 ? 'Documentation will be available soon!' : 'Reset your filters or try another search.'}
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {viewMode === 'articles' 
              ? activeArticles.map((article, index) => (
                  <motion.article
                    key={article.id}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -10, transition: { duration: 0.2 } }}
                    className="group bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 overflow-hidden relative"
                  >
                    {/* Admin Action Buttons */}
                    {isAdmin && (
                      <motion.div 
                        className="absolute top-4 right-4 z-10 flex gap-2"
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <motion.button
                          onClick={() => handleEditArticle(article.id)}
                          className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-500 transition-colors shadow-lg backdrop-blur-sm"
                          title="Edit article"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Edit className="h-4 w-4" />
                        </motion.button>
                        <motion.button
                          onClick={() => handleDeleteArticle(article.id, article.title)}
                          disabled={deletingId === article.id}
                          className="bg-red-600 text-white p-2 rounded-full hover:bg-red-500 transition-colors shadow-lg backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete article"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {deletingId === article.id ? (
                            <motion.div
                              className="rounded-full h-4 w-4 border-2 border-white border-t-transparent"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </motion.button>
                        <Link
                          to={`/blog/${article.slug}`}
                          className="bg-gray-700 text-white p-2 rounded-full hover:bg-gray-600 transition-colors shadow-lg backdrop-blur-sm"
                          title="View article"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                      </motion.div>
                    )}
                    
                    {article.featured_image && (
                      <div className="mb-6 rounded-xl overflow-hidden">
                        <motion.img
                          src={article.featured_image}
                          alt={article.title}
                          className="w-full h-48 object-cover"
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    )}
                    
                    <div className="mb-4 flex flex-wrap gap-2 px-6">
                      {Array.isArray((article as any).terms) && (article as any).terms.length > 0 ? (
                        (article as any).terms.slice(0, 6).map((t: any) => (
                          <motion.span 
                            key={t.id} 
                            className="inline-block bg-purple-500/20 backdrop-blur-sm text-purple-300 text-xs font-semibold px-3 py-1 rounded-full"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.2 }}
                          >
                            {t.name}
                          </motion.span>
                        ))
                      ) : (
                        <motion.span 
                          className="inline-block bg-purple-500/20 backdrop-blur-sm text-purple-300 text-xs font-semibold px-3 py-1 rounded-full"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.2 }}
                        >
                          {article.category}
                        </motion.span>
                      )}
                    </div>
                    
                    <div className="px-6">
                      <h2 className="text-2xl font-bold mb-4 text-white group-hover:text-purple-300 transition-colors line-clamp-2">
                        <Link to={`/blog/${article.slug}`}>{article.title}</Link>
                      </h2>
                      <p className="text-gray-400 mb-6 line-clamp-3 leading-relaxed">{article.excerpt}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-purple-400" />
                          <span className="text-gray-300">{formatDate(article.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-purple-400" />
                          <span className="text-gray-300">Author</span>
                        </div>
                      </div>
                      <Link
                        to={`/blog/${article.slug}`}
                        className="inline-flex items-center text-purple-400 hover:text-purple-300 font-semibold group/ln transition-all duration-300"
                      >
                        Read More 
                        <motion.div
                          className="ml-2"
                          whileHover={{ x: 4 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ArrowRight className="h-4 w-4" />
                        </motion.div>
                      </Link>
                    </div>
                  </motion.article>
                ))
              : activeDocs.map((doc, index) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -10, transition: { duration: 0.2 } }}
                    className="group bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 overflow-hidden relative"
                  >
                    {/* Doc Content */}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <FileText className="h-8 w-8 text-blue-400" />
                        <span className="text-xs font-medium text-blue-400 bg-blue-500/20 px-3 py-1 rounded-full">
                          {doc.category}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-300 transition-colors">
                        {doc.title}
                      </h3>

                      <p className="text-gray-400 mb-6 leading-relaxed">
                        {doc.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <Link
                          to={`/docs/${doc.slug}`}
                          className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium transition-colors group"
                        >
                          Read Doc
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        
                        <div className="text-xs text-gray-500">
                          Updated {formatDate(doc.updated_at)}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
            }            
          </div>
        )}
      </div>
    </div>
  )
}

