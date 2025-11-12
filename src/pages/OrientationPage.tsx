import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { adminAPI } from '../lib/api'
import * as LucideIcons from 'lucide-react'
import { motion } from 'framer-motion'
import { Compass, Sparkles, ArrowRight, Brain, Scale } from 'lucide-react'
import AnimatedBackground from '../components/AnimatedBackground'

interface Category {
  id: string
  name: string
  slug: string
  type: string
  description?: string
  icon?: string
  color?: string
  sort_order?: number
}

export default function OrientationPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const data = await adminAPI.getAllCategories('orientation')
      setCategories(Array.isArray(data) ? data : [])
    } catch (err: any) {
      console.error('Error loading orientation categories:', err)
      // Fallback to default categories if API fails
      setCategories([
        { id: '1', name: 'Fields', slug: 'fields', type: 'orientation', description: 'Explore different academic fields and programs', icon: 'GraduationCap', color: 'from-blue-500 to-cyan-500', sort_order: 1 },
        { id: '2', name: 'Schools', slug: 'schools', type: 'orientation', description: 'Compare schools and universities worldwide', icon: 'Building2', color: 'from-green-500 to-emerald-500', sort_order: 2 },
        { id: '3', name: 'Study Abroad', slug: 'study-abroad', type: 'orientation', description: 'International study opportunities and programs', icon: 'Globe', color: 'from-purple-500 to-pink-500', sort_order: 3 },
        { id: '4', name: 'Procedures', slug: 'procedures', type: 'orientation', description: 'Step-by-step guides for applications and admissions', icon: 'FileText', color: 'from-orange-500 to-red-500', sort_order: 4 },
        { id: '5', name: 'Comparisons', slug: 'comparisons', type: 'orientation', description: 'Compare programs, schools, and opportunities', icon: 'Scale', color: 'from-red-500 to-pink-500', sort_order: 5 },
      ])
    } finally {
      setLoading(false)
    }
  }

  const getIcon = (iconName?: string) => {
    if (!iconName) return LucideIcons.GraduationCap
    const IconComponent = (LucideIcons as any)[iconName]
    return IconComponent || LucideIcons.GraduationCap
  }

  return (
    <div className="relative bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] min-h-screen py-20 overflow-hidden">
      {/* Animated background elements */}
      <AnimatedBackground 
  colors={['var(--chart-color-2)', 'var(--chart-color-1)', 'var(--chart-color-4)', 'var(--chart-color-5)']} 
        orbCount={4}
        orbSize={280}
        duration={18}
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
              <Compass className="w-4 h-4 text-purple-300" />
              <span className="text-sm font-medium text-purple-200">Academic Explore</span>
            </motion.div>
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-6">
            <span className="bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
              Your Academic
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Journey Starts Here
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
            Comprehensive resources to guide your academic decisions and career path
          </p>
        </motion.div>

        {/* Categories Grid */}
        {loading ? (
          <div className="text-center py-20">
            <motion.div
              className="inline-block rounded-full h-16 w-16 border-4 border-purple-500/30 border-t-purple-400 backdrop-blur-sm"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p className="mt-6 text-gray-300 text-lg">Loading orientation categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-12">
              <Compass className="w-16 h-16 text-gray-400 mx-auto mb-6" />
              <p className="text-xl text-gray-300 mb-4">No orientation categories found.</p>
              <p className="text-gray-500">Please add categories in the admin panel.</p>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Section: Academic Databases */}
            <div className="bg-gradient-to-br from-blue-900/10 to-cyan-900/10 rounded-3xl p-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center mb-12"
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    Academic Databases
                  </span>
                </h2>
                <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                  Explore academic fields, schools, study opportunities, and application procedures
                </p>
              </motion.div>

              <div className="grid grid-cols-1 gap-6">
                {categories.map((category, index) => {
                  const Icon = getIcon(category.icon)
                  const gradientClass = category.color || 'from-blue-500 to-cyan-500'
                  return (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, y: 50 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      whileHover={{ y: -10, scale: 1.02 }}
                      className="group"
                    >
                      <Link
                        to={`/orientation/${category.slug}`}
                        className="block bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 p-6 h-44 flex flex-col"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <motion.div
                            className={`bg-gradient-to-r ${gradientClass} w-10 h-10 rounded-lg flex items-center justify-center text-white flex-shrink-0`}
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Icon className="h-5 w-5" />
                          </motion.div>
                          <h2 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">
                            {category.name}
                          </h2>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed flex-grow">
                          {category.description || 'Explore resources in this category'}
                        </p>
                        <div className="flex items-center text-blue-400 font-semibold group-hover:text-blue-300 transition-colors mt-auto">
                          <span className="text-sm">Explore</span>
                          <motion.div
                            className="ml-2"
                            whileHover={{ x: 4 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ArrowRight className="h-3 w-3" />
                          </motion.div>
                        </div>
                      </Link>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* Right Section: Interactive Tools */}
            <div className="bg-gradient-to-br from-purple-900/10 to-pink-900/10 rounded-3xl p-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-center mb-12"
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Interactive Tools
                  </span>
                </h2>
                <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                  Advanced matching and comparison tools to find your perfect educational fit
                </p>
              </motion.div>

              <div className="grid grid-cols-1 gap-8">
                {/* Matcher Card */}
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="group"
                >
                  <Link
                    to="/matching-engine"
                    className="block bg-gradient-to-br from-purple-800/50 to-pink-900/50 backdrop-blur-sm rounded-2xl hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 p-6 h-44 flex flex-col"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <motion.div
                        className="bg-gradient-to-r from-purple-500 to-pink-500 w-10 h-10 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Brain className="h-5 w-5" />
                      </motion.div>
                      <h2 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
                        Smart Matcher
                      </h2>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed flex-grow">
                      Find your perfect universities with our advanced algorithm-based matching system
                    </p>
                    <div className="flex items-center text-purple-400 font-semibold group-hover:text-purple-300 transition-colors mt-auto">
                      <span className="text-sm">Start Matching</span>
                      <motion.div
                        className="ml-2"
                        whileHover={{ x: 4 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ArrowRight className="h-3 w-3" />
                      </motion.div>
                    </div>
                  </Link>
                </motion.div>

                {/* Comparison Card */}
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="group"
                >
                  <Link
                    to="/compare"
                    className="block bg-gradient-to-br from-orange-800/50 to-red-900/50 backdrop-blur-sm rounded-2xl border border-orange-600/50 hover:border-orange-400/50 hover:shadow-2xl hover:shadow-orange-500/25 transition-all duration-500 p-6 h-44 flex flex-col"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <motion.div
                        className="bg-gradient-to-r from-orange-500 to-red-500 w-10 h-10 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Scale className="h-5 w-5" />
                      </motion.div>
                      <h2 className="text-xl font-bold text-white group-hover:text-orange-300 transition-colors">
                        Comparison
                      </h2>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed flex-grow">
                      Compare universities, programs, and outcomes side-by-side to make informed decisions
                    </p>
                    <div className="flex items-center text-orange-400 font-semibold group-hover:text-orange-300 transition-colors mt-auto">
                      <span className="text-sm">Start Comparing</span>
                      <motion.div
                        className="ml-2"
                        whileHover={{ x: 4 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ArrowRight className="h-3 w-3" />
                      </motion.div>
                    </div>
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-3xl p-12"
        >
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20"
                animate={{ 
                  boxShadow: ["0 0 20px rgba(16, 185, 129, 0.5)", "0 0 40px rgba(16, 185, 129, 0.8)", "0 0 20px rgba(16, 185, 129, 0.5)"]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-4 h-4 text-green-300" />
                <span className="text-sm font-medium text-green-200">Simplified Navigation</span>
              </motion.div>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Your Academic Journey, Simplified
              </span>
            </h2>
            
            <p className="text-lg text-gray-300 mb-8 leading-relaxed">
              AcademOra provides comprehensive orientation resources to help you make informed
              decisions about your education. Whether you're choosing a field, selecting a school,
              planning to study abroad, or navigating procedures, we've got you covered.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              {[
                { number: 'Expert', label: 'Resources', color: 'from-purple-400 to-pink-400' },
                { number: 'Global', label: 'Schools', color: 'from-blue-400 to-cyan-400' },
                { number: 'Worldwide', label: 'Reach', color: 'from-green-400 to-emerald-400' }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 + (index * 0.1) }}
                  className="text-center"
                >
                  <motion.div
                    className={`text-4xl md:text-5xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}
                    initial={{ scale: 0.8 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 + (index * 0.1) }}
                  >
                    {stat.number}
                  </motion.div>
                  <div className="text-gray-400 text-lg">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

