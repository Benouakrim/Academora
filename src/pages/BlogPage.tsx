import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Calendar, User, ArrowRight, Edit, Trash2, Eye } from 'lucide-react'
import { blogAPI, adminAPI } from '../lib/api'
import { getCurrentUser } from '../lib/api'
import { motion } from 'framer-motion'

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

export default function BlogPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const navigate = useNavigate()

  // Check if current user is admin
  const currentUser = getCurrentUser()
  const isAdmin = currentUser && (currentUser.role === 'admin' || currentUser.email === 'admin@academora.com')

  useEffect(() => {
    async function fetchArticles() {
      try {
        const data = await blogAPI.getArticles()
        setArticles(data || [])
        setError(null)
      } catch (error: any) {
        console.error('Error fetching articles:', error)
        const errorMessage = error?.message || 'Failed to fetch articles. Please check if the server is running and configured correctly.'
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()
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

  return (
    <div className="relative bg-gradient-to-b from-gray-50 via-white to-gray-50 min-h-screen py-12 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-20 w-96 h-96 bg-primary-200/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-80 h-80 bg-primary-300/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.1, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
            AcademOra Blog
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Insights, guides, and articles to help you navigate your academic journey
          </p>
          
          {/* Admin Indicator */}
          {isAdmin && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-6 inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium border border-green-200"
            >
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Admin Mode - Hover over articles for actions
            </motion.div>
          )}
        </motion.div>

        {loading ? (
          <div className="text-center py-20">
            <motion.div
              className="inline-block rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-4 text-gray-600"
            >
              Loading articles...
            </motion.p>
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-2xl mx-auto shadow-lg">
              <h3 className="text-xl font-bold text-red-800 mb-2">Error Loading Articles</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <p className="text-sm text-red-500">
                Make sure the backend server is running on port 3001 and your environment variables are configured correctly.
              </p>
            </div>
          </motion.div>
        ) : articles.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <p className="text-xl text-gray-600 mb-4">No articles found.</p>
            <p className="text-gray-500">Check back soon for new content!</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article, index) => (
              <motion.article
                key={article.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="card group border border-gray-200 hover:border-primary-200 hover:shadow-2xl transition-all duration-300 rounded-xl overflow-hidden bg-white relative"
              >
                {/* Admin Action Buttons */}
                {isAdmin && (
                  <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditArticle(article.id)}
                      className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors shadow-lg"
                      title="Edit article"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteArticle(article.id, article.title)}
                      disabled={deletingId === article.id}
                      className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete article"
                    >
                      {deletingId === article.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                    <Link
                      to={`/blog/${article.slug}`}
                      className="bg-gray-700 text-white p-2 rounded-full hover:bg-gray-800 transition-colors shadow-lg"
                      title="View article"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                  </div>
                )}
                {article.featured_image && (
                  <div className="mb-4 rounded-lg overflow-hidden">
                    <motion.img
                      src={article.featured_image}
                      alt={article.title}
                      className="w-full h-48 object-cover"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                )}
                <div className="mb-2">
                  <span className="inline-block bg-gradient-to-r from-primary-100 to-primary-50 text-primary-700 text-xs font-semibold px-3 py-1 rounded-full border border-primary-200 shadow-sm">
                    {article.category}
                  </span>
                </div>
                <h2 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-primary-600 transition-colors">
                  <Link to={`/blog/${article.slug}`}>{article.title}</Link>
                </h2>
                <p className="text-gray-600 mb-4 line-clamp-3">{article.excerpt}</p>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(article.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>Author</span>
                  </div>
                </div>
                <Link
                  to={`/blog/${article.slug}`}
                  className="inline-flex items-center text-primary-600 hover:text-primary-700 font-semibold group/ln transition"
                >
                  Read More <ArrowRight className="h-4 w-4 ml-1 group-hover/ln:translate-x-2 transition-transform duration-300" />
                </Link>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

