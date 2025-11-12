import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Globe,
  Plus,
  BarChart3,
  TrendingUp,
  Users,
  FileText,
  Eye,
  ArrowLeft
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { getCurrentUser } from '../lib/api'
import ProgressBar from '../components/ProgressBar'
import LocalizedContentHub from '../components/LocalizedContentHub'
import LocalizedContentEditor from '../components/LocalizedContentEditor'
import { LocalizedContent, LanguageStats } from '../lib/services/localizedContentService'

export default function LocalizedContentPage() {
  const [showEditor, setShowEditor] = useState(false)
  const [editingContent, setEditingContent] = useState<LocalizedContent | undefined>(undefined)
  const [languageStats, setLanguageStats] = useState<LanguageStats[]>([])
  const [loadingStats, setLoadingStats] = useState(true)
  
  const currentUser = getCurrentUser()
  const isAdmin = currentUser?.role === 'admin'

  useEffect(() => {
    if (isAdmin) {
      fetchLanguageStats()
    }
  }, [])

  const fetchLanguageStats = async () => {
    try {
      setLoadingStats(true)
      
      // Temporary mock stats (will be replaced with real Supabase integration)
      const mockStats: LanguageStats[] = [
        { 
          language_code: 'en', 
          total_content: 45, 
          published_content: 30, 
          draft_content: 10, 
          pending_review: 5, 
          last_updated: new Date().toISOString() 
        },
        { 
          language_code: 'fr', 
          total_content: 23, 
          published_content: 15, 
          draft_content: 5, 
          pending_review: 3, 
          last_updated: new Date().toISOString() 
        },
        { 
          language_code: 'es', 
          total_content: 18, 
          published_content: 12, 
          draft_content: 4, 
          pending_review: 2, 
          last_updated: new Date().toISOString() 
        },
        { 
          language_code: 'ar', 
          total_content: 12, 
          published_content: 8, 
          draft_content: 3, 
          pending_review: 1, 
          last_updated: new Date().toISOString() 
        },
        { 
          language_code: 'zh', 
          total_content: 8, 
          published_content: 5, 
          draft_content: 2, 
          pending_review: 1, 
          last_updated: new Date().toISOString() 
        }
      ]
      
      setLanguageStats(mockStats)
    } catch (error) {
      console.error('Failed to fetch language stats:', error)
      setLanguageStats([])
    } finally {
      setLoadingStats(false)
    }
  }

  const handleCreateNew = () => {
    setEditingContent(undefined)
    setShowEditor(true)
  }

  const handleEdit = (content: LocalizedContent) => {
    setEditingContent(content)
    setShowEditor(true)
  }

  const handleSave = () => {
    setShowEditor(false)
    setEditingContent(undefined)
    // Refresh the content hub and stats
    window.location.reload()
  }

  const handleCancel = () => {
    setShowEditor(false)
    setEditingContent(undefined)
  }

  const getTotalContent = () => {
    return languageStats.reduce((total, stat) => total + stat.total_content, 0)
  }

  const getPublishedContent = () => {
    return languageStats.reduce((total, stat) => total + stat.published_content, 0)
  }

  const getActiveLanguages = () => {
    return languageStats.filter(stat => stat.published_content > 0).length
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <Link
              to="/admin"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Admin
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Globe className="w-8 h-8 text-blue-600" />
                Localized Content Hub
              </h1>
              <p className="text-gray-600 mt-1">
                Manage multilingual content for different regions and languages
              </p>
            </div>
          </div>

          {isAdmin && (
            <motion.button
              onClick={handleCreateNew}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="w-5 h-5" />
              Create Content
            </motion.button>
          )}
        </motion.div>
      </div>

      {/* Stats Dashboard */}
      {isAdmin && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6"
          >
            {/* Total Content */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                {loadingStats ? '...' : getTotalContent()}
              </h3>
              <p className="text-sm text-gray-600 mt-1">Total Content</p>
            </div>

            {/* Published Content */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Eye className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                  Live
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                {loadingStats ? '...' : getPublishedContent()}
              </h3>
              <p className="text-sm text-gray-600 mt-1">Published</p>
            </div>

            {/* Active Languages */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Globe className="w-6 h-6 text-purple-600" />
                </div>
                <BarChart3 className="w-5 h-5 text-purple-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                {loadingStats ? '...' : getActiveLanguages()}
              </h3>
              <p className="text-sm text-gray-600 mt-1">Active Languages</p>
            </div>

            {/* Pending Review */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
                <div className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-full font-medium">
                  Review
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                {loadingStats ? '...' : languageStats.reduce((total, stat) => total + stat.pending_review, 0)}
              </h3>
              <p className="text-sm text-gray-600 mt-1">Pending Review</p>
            </div>
          </motion.div>

          {/* Language Breakdown */}
          {!loadingStats && languageStats.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Language Breakdown
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {languageStats.map((stat) => {
                  const language = stat.language_code.toUpperCase()
                  const percentage = stat.total_content > 0 
                    ? Math.round((stat.published_content / stat.total_content) * 100)
                    : 0
                  
                  return (
                    <div
                      key={stat.language_code}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{language}</span>
                        <span className="text-sm text-gray-600">{percentage}%</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Published:</span>
                          <span className="font-medium text-green-600">{stat.published_content}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Draft:</span>
                          <span className="font-medium text-gray-600">{stat.draft_content}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Review:</span>
                          <span className="font-medium text-orange-600">{stat.pending_review}</span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <ProgressBar value={percentage} variant="success" />
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Content Hub */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <LocalizedContentHub
            showCreateButton={isAdmin}
            onCreateNew={handleCreateNew}
            onEdit={handleEdit}
          />
        </motion.div>
      </div>

      {/* Editor Modal */}
      {showEditor && (
        <LocalizedContentEditor
          content={editingContent}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
    </div>
  )
}
