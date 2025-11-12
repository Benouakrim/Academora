import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Search, BookOpen } from 'lucide-react'
import { motion } from 'framer-motion'
import SEO from '../components/SEO'
import AnimatedBackground from '../components/AnimatedBackground'

interface Doc {
  id: string
  title: string
  slug: string
  description: string
  category: string
  created_at: string
  updated_at: string
}

export default function DocsPage() {
  const [docs, setDocs] = useState<Doc[]>([])
  const [filteredDocs, setFilteredDocs] = useState<Doc[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    async function fetchDocs() {
      try {
        // Mock docs data - replace with actual API call
        const mockDocs: Doc[] = [
          {
            id: '1',
            title: 'Getting Started Guide',
            slug: 'getting-started',
            description: 'Complete guide to getting started with AcademOra platform. Learn how to navigate the interface, create your profile, and start exploring academic resources.',
            category: 'User Guide',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '2',
            title: 'API Documentation',
            slug: 'api-docs',
            description: 'Technical documentation for AcademOra API endpoints. Learn how to integrate with our RESTful API and access programmatic features.',
            category: 'Technical',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '3',
            title: 'Feature Overview',
            slug: 'feature-overview',
            description: 'Comprehensive overview of all AcademOra features including matching algorithms, comparison tools, and academic resources.',
            category: 'Features',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '4',
            title: 'University Matching System',
            slug: 'university-matching',
            description: 'Detailed explanation of our university matching algorithm and how to use it effectively to find your perfect academic fit.',
            category: 'Features',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '5',
            title: 'Study Abroad Guide',
            slug: 'study-abroad-guide',
            description: 'Everything you need to know about studying abroad, from application procedures to cultural adaptation tips.',
            category: 'User Guide',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]
        setDocs(mockDocs)
        setFilteredDocs(mockDocs)
      } catch (error) {
        console.error('Error fetching docs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDocs()
  }, [])

  useEffect(() => {
    let filtered = docs

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(doc =>
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(doc => doc.category === selectedCategory)
    }

    setFilteredDocs(filtered)
  }, [docs, searchTerm, selectedCategory])

  const categories = ['all', ...Array.from(new Set(docs.map(doc => doc.category)))]

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="relative bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] min-h-screen py-20 overflow-hidden">
        <SEO title="AcademOra Docs" description="Comprehensive documentation for AcademOra platform" />
        <div className="text-center py-20">
          <motion.div
            className="inline-block rounded-full h-16 w-16 border-4 border-blue-500/30 border-t-blue-400 backdrop-blur-sm"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="mt-6 text-gray-300 text-lg">Loading documentation...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] min-h-screen py-20 overflow-hidden">
      <SEO title="AcademOra Docs" description="Comprehensive documentation for AcademOra platform" />
      
      {/* Animated background elements */}
      <AnimatedBackground 
        colors={['var(--ambient-color-2)', 'var(--chart-color-2)', 'var(--ambient-color-3)', 'var(--ambient-color-1)']} 
        orbCount={4}
        duration={16}
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
                boxShadow: ["0 0 20px rgba(59, 130, 246, 0.5)", "0 0 40px rgba(59, 130, 246, 0.8)", "0 0 20px rgba(59, 130, 246, 0.5)"]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <FileText className="w-4 h-4 text-blue-300" />
              <span className="text-sm font-medium text-blue-200">AcademOra Docs</span>
            </motion.div>
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-6">
            <span className="bg-gradient-to-r from-white via-blue-200 to-cyan-200 bg-clip-text text-transparent">
              Documentation
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-green-400 bg-clip-text text-transparent">
              & Guides
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-8">
            Comprehensive guides and technical documentation to help you make the most of AcademOra
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-12"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search documentation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                      : 'bg-gray-800/50 text-gray-400 hover:text-white border border-gray-700/50'
                  }`}
                >
                  {category === 'all' ? 'All Docs' : category}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Results Count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-8"
        >
          <p className="text-gray-400">
            Found {filteredDocs.length} document{filteredDocs.length !== 1 ? 's' : ''}
            {searchTerm && ` matching "${searchTerm}"`}
            {selectedCategory !== 'all' && ` in ${selectedCategory}`}
          </p>
        </motion.div>

        {/* Docs Grid */}
        {filteredDocs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-12 border border-gray-700/50">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-6" />
              <p className="text-xl text-gray-300 mb-4">No documentation found</p>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDocs.map((doc, index) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -10, transition: { duration: 0.2 } }}
                className="group bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 overflow-hidden"
              >
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

                  <p className="text-gray-400 mb-6 leading-relaxed line-clamp-3">
                    {doc.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <Link
                      to={`/docs/${doc.slug}`}
                      className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium transition-colors group"
                    >
                      Read More
                      <motion.div
                        className="ml-2"
                        whileHover={{ x: 4 }}
                        transition={{ duration: 0.2 }}
                      >
                        <BookOpen className="h-4 w-4" />
                      </motion.div>
                    </Link>
                    
                    <div className="text-xs text-gray-500">
                      Updated {formatDate(doc.updated_at)}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
