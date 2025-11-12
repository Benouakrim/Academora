import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp,
  Users,
  Building2,
  FileText,
  Clock,
  Activity,
  Download,
  Filter,
  BarChart3,
  Eye,
  Target,
  Globe,
  BookOpen,
  RefreshCw,
  AlertCircle,
  Star,
  Shield
} from 'lucide-react'
import ProgressBar from './ProgressBar'
import {
  advancedAnalyticsAPI,
  AnalyticsOverview,
  UserAnalytics,
  UniversityAnalytics,
  EngagementAnalytics,
  ConversionAnalytics,
  ContentAnalytics,
  AnalyticsFilters,
  DATE_RANGES,
  EXPORT_FORMATS
} from '../lib/services/analyticsService'

interface AdvancedAnalyticsDashboardProps {
  className?: string
}

export default function AdvancedAnalyticsDashboard({ className = '' }: AdvancedAnalyticsDashboardProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'universities' | 'engagement' | 'conversions' | 'content'>('overview')
  const [filters, setFilters] = useState<AnalyticsFilters>({
    dateRange: '30d'
  })
  const [showFilters, setShowFilters] = useState(false)
  const [, setRealTimeData] = useState<any>(null)
  const [autoRefresh, setAutoRefresh] = useState(false)

  // Analytics data states
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null)
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(null)
  const [universityAnalytics, setUniversityAnalytics] = useState<UniversityAnalytics | null>(null)
  const [, setEngagementAnalytics] = useState<EngagementAnalytics | null>(null)
  const [, setConversionAnalytics] = useState<ConversionAnalytics | null>(null)
  const [, setContentAnalytics] = useState<ContentAnalytics | null>(null)

  useEffect(() => {
    fetchAnalyticsData()
  }, [activeTab, filters])

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchRealTimeData()
      }, 30000) // Refresh every 30 seconds
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      setError(null)

      switch (activeTab) {
        case 'overview':
          const overviewData = await advancedAnalyticsAPI.overview(filters)
          setOverview(overviewData)
          break
        case 'users':
          const userData = await advancedAnalyticsAPI.getUserAnalytics(filters)
          setUserAnalytics(userData)
          break
        case 'universities':
          const universityData = await advancedAnalyticsAPI.getUniversityAnalytics(filters)
          setUniversityAnalytics(universityData)
          break
        case 'engagement':
          const engagementData = await advancedAnalyticsAPI.getEngagementAnalytics(filters)
          setEngagementAnalytics(engagementData)
          break
        case 'conversions':
          const conversionData = await advancedAnalyticsAPI.getConversionAnalytics(filters)
          setConversionAnalytics(conversionData)
          break
        case 'content':
          const contentData = await advancedAnalyticsAPI.getContentAnalytics(filters)
          setContentAnalytics(contentData)
          break
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch analytics data')
    } finally {
      setLoading(false)
    }
  }

  const fetchRealTimeData = async () => {
    try {
      const data = await advancedAnalyticsAPI.getRealTimeMetrics()
      setRealTimeData(data)
    } catch (err) {
      console.error('Failed to fetch real-time data:', err)
    }
  }

  const handleExport = async (format: 'csv' | 'json' | 'xlsx') => {
    try {
      const blob = await advancedAnalyticsAPI.exportData(activeTab, format, filters)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `analytics-${activeTab}-${new Date().toISOString().split('T')[0]}${EXPORT_FORMATS.find(f => f.value === format)?.extension}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err: any) {
      setError(err.message || 'Failed to export data')
    }
  }

  const renderMetricCard = (title: string, value: string | number, icon: React.ReactNode, trend?: number, color = 'blue') => {
    const colors = {
      blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
      green: 'from-green-500/20 to-green-600/20 border-green-500/30',
      purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
      orange: 'from-orange-500/20 to-orange-600/20 border-orange-500/30',
      red: 'from-red-500/20 to-red-600/20 border-red-500/30',
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gradient-to-br ${colors[color as keyof typeof colors]} rounded-xl p-6 border backdrop-blur-sm`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-white/10 rounded-lg">
            {icon}
          </div>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 text-sm font-medium ${
              trend >= 0 ? 'text-green-300' : 'text-red-300'
            }`}>
              <TrendingUp className={`w-4 h-4 ${trend < 0 ? 'rotate-180' : ''}`} />
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
        <p className="text-white/70 text-sm">{title}</p>
      </motion.div>
    )
  }

  const renderOverviewTab = () => {
    if (!overview) return null

    return (
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {renderMetricCard('Total Users', overview.totalUsers.toLocaleString(), <Users className="w-6 h-6 text-blue-400" />, 12, 'blue')}
          {renderMetricCard('Active Universities', overview.totalUniversities.toLocaleString(), <Building2 className="w-6 h-6 text-purple-400" />, 8, 'purple')}
          {renderMetricCard('Total Applications', overview.totalApplications.toLocaleString(), <FileText className="w-6 h-6 text-green-400" />, 15, 'green')}
          {renderMetricCard('Conversion Rate', `${overview.conversionRate}%`, <Target className="w-6 h-6 text-orange-400" />, 5, 'orange')}
        </div>

        {/* Engagement Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {renderMetricCard('Page Views', overview.pageViews.toLocaleString(), <Eye className="w-6 h-6 text-blue-400" />, 18, 'blue')}
          {renderMetricCard('Avg Session Duration', `${Math.round(overview.avgSessionDuration / 60)}m`, <Clock className="w-6 h-6 text-green-400" />, -3, 'green')}
          {renderMetricCard('Bounce Rate', `${overview.bounceRate}%`, <Activity className="w-6 h-6 text-red-400" />, -8, 'red')}
        </div>
      </div>
    )
  }

  const renderUsersTab = () => {
    if (!userAnalytics) return null

    return (
      <div className="space-y-6">
        {/* User Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {renderMetricCard('Total Users', userAnalytics.totalUsers.toLocaleString(), <Users className="w-6 h-6 text-blue-400" />, 12, 'blue')}
          {renderMetricCard('New Users', userAnalytics.newUsers.toLocaleString(), <TrendingUp className="w-6 h-6 text-green-400" />, 18, 'green')}
          {renderMetricCard('Active Users', userAnalytics.activeUsers.toLocaleString(), <Activity className="w-6 h-6 text-purple-400" />, 8, 'purple')}
          {renderMetricCard('Growth Rate', `${userAnalytics.userGrowthRate}%`, <TrendingUp className="w-6 h-6 text-orange-400" />, 5, 'orange')}
        </div>

        {/* Top Countries */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-400" />
            Top Countries
          </h3>
          <div className="space-y-3">
            {userAnalytics.topCountries.map((country, index) => (
              <div key={country.country} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 text-sm w-6">#{index + 1}</span>
                  <span className="text-white font-medium">{country.country}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-gray-300">{country.count.toLocaleString()}</span>
                  <div className="w-24">
                    <ProgressBar value={country.percentage} variant="info" />
                  </div>
                  <span className="text-gray-400 text-sm">{country.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const renderUniversitiesTab = () => {
    if (!universityAnalytics) return null

    return (
      <div className="space-y-6">
        {/* University Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {renderMetricCard('Total Universities', universityAnalytics.totalUniversities.toLocaleString(), <Building2 className="w-6 h-6 text-blue-400" />, 8, 'blue')}
          {renderMetricCard('Featured', universityAnalytics.featuredUniversities.toLocaleString(), <Star className="w-6 h-6 text-yellow-400" />, 12, 'yellow')}
          {renderMetricCard('Claimed', universityAnalytics.claimedUniversities.toLocaleString(), <Shield className="w-6 h-6 text-green-400" />, 15, 'green')}
          {renderMetricCard('Applications', '0', <FileText className="w-6 h-6 text-purple-400" />, 10, 'purple')}
        </div>

        {/* Top Universities */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-400" />
            Top Performing Universities
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-white">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4">University</th>
                  <th className="text-right py-3 px-4">Views</th>
                  <th className="text-right py-3 px-4">Applications</th>
                  <th className="text-right py-3 px-4">Conversion Rate</th>
                </tr>
              </thead>
              <tbody>
                {universityAnalytics.topUniversities.map((university, index) => (
                  <tr key={university.id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <span className="text-gray-400 text-sm w-6">#{index + 1}</span>
                        <span className="font-medium">{university.name}</span>
                      </div>
                    </td>
                    <td className="text-right py-3 px-4">{university.views.toLocaleString()}</td>
                    <td className="text-right py-3 px-4">{university.applications.toLocaleString()}</td>
                    <td className="text-right py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        university.conversionRate >= 10 ? 'bg-green-500/20 text-green-300' :
                        university.conversionRate >= 5 ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-red-500/20 text-red-300'
                      }`}>
                        {university.conversionRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-20">
          <motion.div
            className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-400 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      )
    }

    if (error) {
      return (
        <div className="text-center py-20">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-red-300">{error}</p>
        </div>
      )
    }

    switch (activeTab) {
      case 'overview': return renderOverviewTab()
      case 'users': return renderUsersTab()
      case 'universities': return renderUniversitiesTab()
      default: return <div className="text-center py-20 text-gray-400">Coming soon...</div>
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'users', label: 'Users', icon: <Users className="w-4 h-4" /> },
    { id: 'universities', label: 'Universities', icon: <Building2 className="w-4 h-4" /> },
    { id: 'engagement', label: 'Engagement', icon: <Activity className="w-4 h-4" /> },
    { id: 'conversions', label: 'Conversions', icon: <Target className="w-4 h-4" /> },
    { id: 'content', label: 'Content', icon: <BookOpen className="w-4 h-4" /> },
  ] as const

  return (
    <div className={`bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-700/50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-blue-500/30">
              <BarChart3 className="w-5 h-5 text-blue-400" />
            </div>
            Advanced Analytics Dashboard
          </h2>

          <div className="flex items-center gap-2">
            {/* Auto Refresh */}
            <motion.button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`p-2 rounded-lg transition-all ${
                autoRefresh 
                  ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                  : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            </motion.button>

            {/* Export */}
            <motion.button
              onClick={() => handleExport('csv')}
              className="p-2 bg-gray-700/50 text-gray-400 rounded-lg hover:bg-gray-600/50 transition-all"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Download className="w-4 h-4" />
            </motion.button>

            {/* Filters */}
            <motion.button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-all ${
                showFilters 
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                  : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Filter className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          {tabs.map(tab => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : 'bg-gray-700/50 text-gray-400 border border-gray-600/50 hover:bg-gray-600/50'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-gray-700/50 overflow-hidden"
          >
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Date Range
                  </label>
                  <select
                    value={filters.dateRange}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value as any }))}
                    className="w-full p-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:border-blue-500/50 focus:outline-none transition-all"
                  >
                    {DATE_RANGES.map(range => (
                      <option key={range.value} value={range.value}>
                        {range.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Country
                  </label>
                  <select
                    value={filters.country || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, country: e.target.value || undefined }))}
                    className="w-full p-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:border-blue-500/50 focus:outline-none transition-all"
                  >
                    <option value="">All Countries</option>
                    <option value="US">United States</option>
                    <option value="UK">United Kingdom</option>
                    <option value="CA">Canada</option>
                    <option value="AU">Australia</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    University
                  </label>
                  <select
                    value={filters.university || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, university: e.target.value || undefined }))}
                    className="w-full p-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:border-blue-500/50 focus:outline-none transition-all"
                  >
                    <option value="">All Universities</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="p-6">
        {renderContent()}
      </div>
    </div>
  )
}
