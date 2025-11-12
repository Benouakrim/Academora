import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import AnimatedBackground from '../components/AnimatedBackground'
import {
  BookOpen,
  Compass,
  Brain,
  Scale,
  DollarSign,
  BarChart3,
  Users,
  Share2,
  Globe,
  Award,
  Sparkles,
  TrendingUp,
  MessageSquare,
  Calendar,
  FileText,
  Video,
  Lock,
  CheckCircle2,
  Clock,
  ArrowRight,
  Search,
  Filter,
  X
} from 'lucide-react'

type Feature = {
  id: string
  icon: JSX.Element
  title: string
  description: string
  longDescription: string
  status: 'live' | 'coming-soon' | 'beta'
  category: string
  benefits: string[]
  availability?: string
  link?: string
  estimatedLaunch?: string
}

const features: Feature[] = [
  {
    id: 'blog',
    icon: <BookOpen className="w-6 h-6" />,
    title: 'Comprehensive Read',
    description: 'Expert articles on academics, careers, and study opportunities worldwide',
    longDescription: 'Access a comprehensive library of expert-written articles covering everything from university applications to career planning. Get insights from education professionals, industry experts, and successful students.',
    status: 'live',
    category: 'content',
    benefits: [
      'Stay informed about latest educational trends',
      'Expert advice on applications and careers',
      'Real-world experiences and case studies',
      'Comprehensive study guides and resources'
    ],
    link: '/blog'
  },
  {
    id: 'orientation',
    icon: <Compass className="w-6 h-6" />,
    title: 'Orientation Hub',
    description: 'Navigate fields, schools, study abroad, and application procedures',
    longDescription: 'Explore structured pathways through every aspect of your academic journey. Discover different fields, compare schools globally, understand study abroad options, and master application procedures.',
    status: 'live',
    category: 'guidance',
    benefits: [
      'Make informed academic decisions',
      'Discover suitable career paths',
      'Compare educational options globally',
      'Step-by-step application guidance'
    ],
    link: '/orientation'
  },
  {
    id: 'matching',
    icon: <Brain className="w-6 h-6" />,
    title: 'Smart Algorithm Matching',
    description: 'AI-powered university recommendations based on your profile',
    longDescription: 'Our intelligent matching system evaluates your academic profile, preferences, and goals to recommend universities where you have the highest chances of admission and success.',
    status: 'live',
    category: 'matching',
    benefits: [
      'Personalized university recommendations',
      'Data-driven admission probability',
      'Match based on 50+ criteria',
      'Save time on research'
    ],
    link: '/matching'
  },
  {
    id: 'comparison',
    icon: <Scale className="w-6 h-6" />,
    title: 'University Comparison',
    description: 'Compare tuition, rankings, visas, and career outcomes side-by-side',
    longDescription: 'Make data-driven decisions with comprehensive side-by-side comparisons of universities, including academics, finances, career outcomes, and more.',
    status: 'live',
    category: 'tools',
    benefits: [
      'Compare up to 4 universities at once',
      'Detailed cost breakdowns',
      'Career outcome statistics',
      'Save and share comparisons'
    ],
    link: '/universities'
  },
  {
    id: 'financial-aid',
    icon: <DollarSign className="w-6 h-6" />,
    title: 'Financial Aid Predictor',
    description: 'Estimate your actual costs after scholarships, grants, and aid',
    longDescription: 'Calculate your true college costs with our sophisticated predictor that considers scholarships, grants, loans, and work-study opportunities for accurate net cost estimates.',
    status: 'live',
    category: 'tools',
    benefits: [
      'Accurate net cost calculations',
      'Scholarship matching',
      'Financial planning tools',
      'ROI analysis per university'
    ],
    link: '/universities'
  },
  {
    id: 'career-maps',
    icon: <BarChart3 className="w-6 h-6" />,
    title: 'Career Trajectory Maps',
    description: 'Visualize salary potential vs visa flexibility globally',
    longDescription: 'Explore interactive career outcome visualizations mapping salary potential against visa flexibility. Make informed decisions about your global career prospects with real employment data.',
    status: 'beta',
    category: 'insights',
    benefits: [
      'Salary projections by field and country',
      'Visa and work permit insights',
      'Industry demand analytics',
      'Long-term career planning'
    ],
    availability: 'Available for Pro subscribers'
  },
  {
    id: 'mentorship',
    icon: <Users className="w-6 h-6" />,
    title: 'Mentorship Network',
    description: 'Connect with alumni and students from your dream schools',
    longDescription: 'Access our growing network of mentors including alumni, current students, and education professionals. Get personalized guidance, insider insights, and application support.',
    status: 'coming-soon',
    category: 'community',
    benefits: [
      'One-on-one mentorship sessions',
      'Alumni from top universities',
      'Application review and feedback',
      'Career guidance and networking'
    ],
    estimatedLaunch: 'Q1 2026',
    availability: 'Premium feature'
  },
  {
    id: 'collaboration',
    icon: <Share2 className="w-6 h-6" />,
    title: 'Collaborative Lists',
    description: 'Save and share university research with friends and family',
    longDescription: 'Create and share curated lists of universities and resources. Collaborate with family, friends, or counselors to make informed decisions together.',
    status: 'coming-soon',
    category: 'tools',
    benefits: [
      'Shared university lists',
      'Family collaboration features',
      'Counselor integration',
      'Real-time updates and comments'
    ],
    estimatedLaunch: 'Q2 2026'
  },
  {
    id: 'virtual-tours',
    icon: <Video className="w-6 h-6" />,
    title: 'Virtual Campus Tours',
    description: 'Explore campuses in 360° from anywhere in the world',
    longDescription: 'Experience universities through immersive virtual tours. Walk through campuses, visit facilities, and get a feel for campus life before you apply.',
    status: 'coming-soon',
    category: 'content',
    benefits: [
      '360° campus walkthroughs',
      'Virtual open houses',
      'Student life previews',
      'Facility tours and dormitory views'
    ],
    estimatedLaunch: 'Q3 2026',
    availability: 'Premium feature'
  },
  {
    id: 'interview-prep',
    icon: <MessageSquare className="w-6 h-6" />,
    title: 'Interview Preparation',
    description: 'AI-powered mock interviews and feedback',
    longDescription: 'Practice for university interviews with AI-powered simulations. Get instant feedback on your responses, body language, and communication skills.',
    status: 'coming-soon',
    category: 'tools',
    benefits: [
      'Realistic interview simulations',
      'AI feedback and scoring',
      'Common question database',
      'Video recording and review'
    ],
    estimatedLaunch: 'Q2 2026',
    availability: 'Pro feature'
  },
  {
    id: 'document-review',
    icon: <FileText className="w-6 h-6" />,
    title: 'Essay & Document Review',
    description: 'Get professional feedback on your application materials',
    longDescription: 'Submit your essays, personal statements, and other application documents for professional review. Receive detailed feedback and suggestions for improvement.',
    status: 'coming-soon',
    category: 'community',
    benefits: [
      'Professional essay reviews',
      'Grammar and style checking',
      'Content improvement suggestions',
      'Multiple revision rounds'
    ],
    estimatedLaunch: 'Q1 2026',
    availability: 'Premium add-on'
  },
  {
    id: 'deadline-tracker',
    icon: <Calendar className="w-6 h-6" />,
    title: 'Application Deadline Tracker',
    description: 'Never miss an important deadline with smart reminders',
    longDescription: 'Keep track of all your application deadlines, requirements, and milestones. Get smart reminders and personalized timelines for each university.',
    status: 'coming-soon',
    category: 'tools',
    benefits: [
      'Centralized deadline management',
      'Smart reminder system',
      'Task breakdown and checklists',
      'Progress tracking'
    ],
    estimatedLaunch: 'Q1 2026'
  },
  {
    id: 'peer-network',
    icon: <Globe className="w-6 h-6" />,
    title: 'Peer Student Network',
    description: 'Connect with students applying to similar programs',
    longDescription: 'Join a community of students with similar academic goals. Share experiences, exchange tips, and support each other through the application process.',
    status: 'coming-soon',
    category: 'community',
    benefits: [
      'Connect with like-minded students',
      'Share application experiences',
      'Study group formation',
      'International student community'
    ],
    estimatedLaunch: 'Q2 2026'
  },
  {
    id: 'scholarship-finder',
    icon: <Award className="w-6 h-6" />,
    title: 'Advanced Scholarship Finder',
    description: 'Discover thousands of scholarships matched to your profile',
    longDescription: 'Access a comprehensive scholarship database with intelligent matching. Find opportunities you qualify for based on your academic profile, background, and interests.',
    status: 'coming-soon',
    category: 'tools',
    benefits: [
      'Personalized scholarship matching',
      'Application deadline tracking',
      'Eligibility verification',
      'Essay prompt library'
    ],
    estimatedLaunch: 'Q3 2026'
  },
  {
    id: 'visa-assistant',
    icon: <Globe className="w-6 h-6" />,
    title: 'Visa & Immigration Assistant',
    description: 'Step-by-step guidance for student visas worldwide',
    longDescription: 'Navigate the complex visa application process with confidence. Get country-specific guidance, document checklists, and timeline planning.',
    status: 'coming-soon',
    category: 'guidance',
    benefits: [
      'Country-specific visa guides',
      'Document preparation checklists',
      'Timeline and process tracking',
      'Common pitfall warnings'
    ],
    estimatedLaunch: 'Q3 2026'
  },
  {
    id: 'analytics',
    icon: <TrendingUp className="w-6 h-6" />,
    title: 'Personal Analytics Dashboard',
    description: 'Track your application progress and improve your profile',
    longDescription: 'Monitor your application journey with detailed analytics. See how your profile compares, identify areas for improvement, and track your progress over time.',
    status: 'beta',
    category: 'insights',
    benefits: [
      'Application progress tracking',
      'Profile strength analysis',
      'Competitive benchmarking',
      'Improvement recommendations'
    ],
    availability: 'Available in beta',
    link: '/dashboard'
  }
]

const categories = [
  { id: 'all', name: 'All Features', icon: <Sparkles className="w-4 h-4" /> },
  { id: 'content', name: 'Content & Learning', icon: <BookOpen className="w-4 h-4" /> },
  { id: 'guidance', name: 'Guidance & Planning', icon: <Compass className="w-4 h-4" /> },
  { id: 'matching', name: 'Smart Matching', icon: <Brain className="w-4 h-4" /> },
  { id: 'tools', name: 'Tools & Calculators', icon: <Scale className="w-4 h-4" /> },
  { id: 'insights', name: 'Career Insights', icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'community', name: 'Community', icon: <Users className="w-4 h-4" /> }
]

const statusConfig = {
  live: {
    label: 'Live',
    color: 'bg-green-500/20 text-green-300 border-green-500/30',
    icon: <CheckCircle2 className="w-3 h-3" />
  },
  beta: {
    label: 'Beta',
    color: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    icon: <Sparkles className="w-3 h-3" />
  },
  'coming-soon': {
    label: 'Coming Soon',
    color: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    icon: <Clock className="w-3 h-3" />
  }
}

export default function ExplorePage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null)

  const filteredFeatures = features.filter(feature => {
    const matchesCategory = selectedCategory === 'all' || feature.category === selectedCategory
    const matchesSearch = feature.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         feature.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const liveCount = features.filter(f => f.status === 'live').length
  const betaCount = features.filter(f => f.status === 'beta').length
  const comingSoonCount = features.filter(f => f.status === 'coming-soon').length

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20" />
          <AnimatedBackground 
            colors={['var(--chart-color-2)', 'var(--chart-color-1)', 'var(--chart-color-4)']} 
            orbCount={3}
            orbSize={400}
            duration={14}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-6">
              <Sparkles className="w-4 h-4 text-purple-300" />
              <span className="text-sm font-medium text-purple-200">Platform Features</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Explore Everything
              </span>
              <br />
              <span className="text-white">AcademOra Has to Offer</span>
            </h1>

            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Discover our comprehensive suite of tools, resources, and features designed to guide you through every step of your academic journey.
            </p>

            {/* Feature Stats */}
            <div className="flex flex-wrap justify-center gap-6 mb-12">
              <div className="px-6 py-3 bg-green-500/10 backdrop-blur-sm rounded-full border border-green-500/20">
                <span className="text-2xl font-bold text-green-400">{liveCount}</span>
                <span className="text-sm text-green-300 ml-2">Live Features</span>
              </div>
              <div className="px-6 py-3 bg-blue-500/10 backdrop-blur-sm rounded-full border border-blue-500/20">
                <span className="text-2xl font-bold text-blue-400">{betaCount}</span>
                <span className="text-sm text-blue-300 ml-2">In Beta</span>
              </div>
              <div className="px-6 py-3 bg-purple-500/10 backdrop-blur-sm rounded-full border border-purple-500/20">
                <span className="text-2xl font-bold text-purple-400">{comingSoonCount}</span>
                <span className="text-sm text-purple-300 ml-2">Coming Soon</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters & Search */}
      <section className="py-8 border-y border-white/10 bg-black/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search features..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  {category.icon}
                  <span className="hidden sm:inline">{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          {filteredFeatures.length === 0 ? (
            <div className="text-center py-20">
              <Filter className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-400 mb-2">No features found</h3>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFeatures.map((feature, index) => (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ y: -5 }}
                  onClick={() => setSelectedFeature(feature)}
                  className="group relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-purple-500/50 transition-all duration-300 cursor-pointer overflow-hidden"
                >
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4">
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${statusConfig[feature.status].color}`}>
                      {statusConfig[feature.status].icon}
                      {statusConfig[feature.status].label}
                    </div>
                  </div>

                  {/* Icon */}
                  <div className="mb-4 text-purple-400 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold mb-2 text-white group-hover:text-purple-400 transition-colors">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {feature.description}
                  </p>

                  {/* Additional Info */}
                  <div className="space-y-2">
                    {feature.estimatedLaunch && (
                      <div className="flex items-center gap-2 text-xs text-purple-300">
                        <Calendar className="w-3 h-3" />
                        <span>Expected: {feature.estimatedLaunch}</span>
                      </div>
                    )}
                    
                    {feature.availability && (
                      <div className="flex items-center gap-2 text-xs text-blue-300">
                        <Lock className="w-3 h-3" />
                        <span>{feature.availability}</span>
                      </div>
                    )}
                  </div>

                  {/* Hover Indicator */}
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-5 h-5 text-purple-400" />
                  </div>

                  {/* Gradient Overlay on Hover */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={false}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-purple-900/30 via-black to-pink-900/30">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white/5 backdrop-blur-md rounded-3xl p-12 border border-white/10"
          >
            <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-6" />
            <h2 className="text-4xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Ready to Get Started?
              </span>
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of students using AcademOra to find their perfect university match
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-semibold text-lg hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300"
              >
                Start Your Journey
              </Link>
              <Link
                to="/pricing"
                className="px-8 py-4 border border-white/30 rounded-full font-semibold text-lg hover:bg-white/10 transition-all duration-300"
              >
                View Pricing
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Detail Modal */}
      <AnimatePresence>
        {selectedFeature && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedFeature(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-2xl w-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 border border-white/10 max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedFeature(null)}
                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Status Badge */}
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border mb-4 ${statusConfig[selectedFeature.status].color}`}>
                {statusConfig[selectedFeature.status].icon}
                {statusConfig[selectedFeature.status].label}
              </div>

              {/* Icon & Title */}
              <div className="flex items-start gap-4 mb-6">
                <div className="text-purple-400 p-3 bg-purple-500/10 rounded-xl">
                  {selectedFeature.icon}
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-2">{selectedFeature.title}</h2>
                  <p className="text-gray-400">{selectedFeature.description}</p>
                </div>
              </div>

              {/* Long Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-purple-300">About This Feature</h3>
                <p className="text-gray-300 leading-relaxed">{selectedFeature.longDescription}</p>
              </div>

              {/* Benefits */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-purple-300">Key Benefits</h3>
                <ul className="space-y-2">
                  {selectedFeature.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3 text-gray-300">
                      <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Additional Info */}
              {(selectedFeature.estimatedLaunch || selectedFeature.availability) && (
                <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
                  {selectedFeature.estimatedLaunch && (
                    <div className="flex items-center gap-2 text-sm text-purple-300 mb-2">
                      <Calendar className="w-4 h-4" />
                      <span>Expected Launch: {selectedFeature.estimatedLaunch}</span>
                    </div>
                  )}
                  {selectedFeature.availability && (
                    <div className="flex items-center gap-2 text-sm text-blue-300">
                      <Lock className="w-4 h-4" />
                      <span>{selectedFeature.availability}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Action Button */}
              {selectedFeature.link ? (
                <Link
                  to={selectedFeature.link}
                  className="block w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-semibold text-center hover:shadow-lg transition-all duration-300"
                >
                  Try Now
                </Link>
              ) : (
                <button
                  disabled
                  className="block w-full py-3 bg-gray-700 text-gray-400 rounded-full font-semibold cursor-not-allowed"
                >
                  Coming Soon
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
