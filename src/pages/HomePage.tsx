import { Link } from 'react-router-dom'
import { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, Sparkles, ArrowRight, Users, DollarSign, 
  Globe, Target, Heart, Star, Play, Pause,
  ChevronRight, Compass, Lightbulb, Award, X,
  BookOpen, Scale, BarChart3, Share2, ChevronLeft
} from 'lucide-react'
import FeatureModal from '../components/FeatureModal'
import AnimatedBackground from '../components/AnimatedBackground'
import { videosAPI, getCurrentUser } from '../lib/api'

type ShowcaseVideo = {
  id: string
  title: string
  description?: string | null
  video_url?: string | null
  embed_code?: string | null
  thumbnail_url?: string | null
  position?: number | null
  is_active?: boolean | null
}

const fallbackShowcaseVideos: ShowcaseVideo[] = [
  {
    id: 'sample-1',
    title: 'Discover AcademOra in 90 Seconds',
    description:
      'See how AcademOra brings guidance, matching, and comparison into one seamless experience.',
    video_url: 'https://www.youtube.com/watch?v=ysz5S6PUM-U',
    embed_code: '',
    thumbnail_url: '',
    position: 1,
  },
  {
    id: 'sample-2',
    title: 'Match With The Right University',
    description:
      'Our smart matching engine analyzes your goals to recommend the programs that fit best.',
    video_url: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
    embed_code: '',
    thumbnail_url: '',
    position: 2,
  },
  {
    id: 'sample-3',
    title: 'Plan Your Academic Journey',
    description:
      'Financial planning, mentorship, and real insights—watch how students stay ahead with AcademOra.',
    video_url: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
    embed_code: '',
    thumbnail_url: '',
    position: 3,
  },
]

export default function HomePage() {
  const user = getCurrentUser()
  const isAdmin = user?.role === 'admin'
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showExplorer, setShowExplorer] = useState(false)
  const [selectedFeature, setSelectedFeature] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showcaseVideos, setShowcaseVideos] = useState<ShowcaseVideo[]>(fallbackShowcaseVideos)
  const [activeVideoIndex, setActiveVideoIndex] = useState(0)
  const [isVideoLoading, setIsVideoLoading] = useState(true)
  const howItWorksRef = useRef<HTMLDivElement | null>(null)

  // Auto-advance through the journey steps
  const apiOrigin = useMemo(() => {
    const raw = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
    try {
      const url = new URL(raw)
      if (url.pathname.endsWith('/api')) {
        url.pathname = url.pathname.replace(/\/api$/, '')
      }
      return url.origin + url.pathname.replace(/\/$/, '')
    } catch {
      return raw.replace(/\/api$/, '')
    }
  }, [])

  const resolveMediaUrl = (value?: string | null) => {
    if (!value) return ''
    const trimmed = value.trim()
    if (!trimmed) return ''
    if (/^https?:\/\//i.test(trimmed)) return trimmed
    if (trimmed.startsWith('//')) {
      return `${window.location.protocol}${trimmed}`
    }
    if (trimmed.startsWith('/')) {
      return `${apiOrigin}${trimmed}`
    }
    return trimmed
  }

  useEffect(() => {
    if (!isPlaying) return
    
    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % journeySteps.length)
    }, 3000)

    return () => clearInterval(timer)
  }, [isPlaying])

  useEffect(() => {
    let cancelled = false

    async function loadVideos() {
      try {
        setIsVideoLoading(true)
        // Admins see all videos (including inactive ones for preview)
        // Regular users only see active videos
        console.log('[HomePage] Loading videos - isAdmin:', isAdmin, 'user:', user)
        const data = isAdmin ? await videosAPI.listAdmin() : await videosAPI.listPublic()
        console.log('[HomePage] Loaded videos:', data)
        if (cancelled) return
        if (Array.isArray(data) && data.length > 0) {
          const sorted = [...data]
            .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
            .map((video) => ({
              ...video,
              video_url: video.video_url ?? '',
              thumbnail_url: video.thumbnail_url ?? '',
            })) as ShowcaseVideo[]
          console.log('[HomePage] Setting showcase videos:', sorted)
          setShowcaseVideos(sorted)
          setActiveVideoIndex(0)
        } else {
          console.log('[HomePage] No videos returned, using fallback')
          setShowcaseVideos(fallbackShowcaseVideos)
        }
      } catch (error) {
        console.warn('Failed to load showcase videos, using fallback.', error)
        if (!cancelled) {
          setShowcaseVideos(fallbackShowcaseVideos)
        }
      } finally {
        if (!cancelled) {
          setIsVideoLoading(false)
        }
      }
    }

    loadVideos()

    return () => {
      cancelled = true
    }
  }, [isAdmin])

  const journeySteps = [
    {
      title: "Explore",
      subtitle: "Discover insights & guidance",
      icon: <BookOpen className="w-8 h-8" />,
      color: "from-purple-500 to-pink-500",
      description: "Browse our Read section for expert articles on any academic or career topic."
    },
    {
      title: " Orient", 
      subtitle: "Find your perfect direction",
      icon: <Compass className="w-8 h-8" />,
      color: "from-blue-500 to-cyan-500",
      description: "Navigate fields, schools, study abroad options, and application procedures."
    },
    {
      title: "Match",
      subtitle: "Discover your ideal universities",
      icon: <Target className="w-8 h-8" />,
      color: "from-green-500 to-emerald-500", 
      description: "Smart algorithm-based matching connects you with perfect-fit universities."
    },
    {
      title: "Compare",
      subtitle: "Make informed decisions",
      icon: <Scale className="w-8 h-8" />,
      color: "from-orange-500 to-red-500",
      description: "Side-by-side comparisons of tuition, rankings, and career outcomes."
    },
    {
      title: "Connect",
      subtitle: "Learn from those who succeeded",
      icon: <Users className="w-8 h-8" />,
      color: "from-indigo-500 to-purple-500",
      description: "Get mentorship from alumni and students at your target universities."
    }
  ]

  const features = [
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Comprehensive Read",
      description: "Expert articles on academics, careers, and study opportunities worldwide",
      stat: "Expert Content",
      color: "text-purple-600",
      category: "content",
      featured: true,
      detailedDescription: "Our Read section serves as your primary resource for educational content, featuring expert-written articles on everything from university applications to career planning. Access comprehensive guides, industry insights, and practical advice from education professionals.",
      benefits: [
        "Stay informed about latest educational trends",
        "Get expert advice on applications and careers",
        "Learn from real-world experiences",
        "Access comprehensive study guides"
      ],
      docSlug: "blog"
    },
    {
      icon: <Compass className="w-6 h-6" />,
      title: "Explore Hub", 
      description: "Navigate fields, schools, study abroad, and application procedures",
      stat: "5 Guidance Areas",
      color: "text-blue-600",
      category: "guidance",
      featured: true,
      detailedDescription: "The Explore Hub provides structured pathways through every aspect of your academic journey. Discover different fields, compare schools globally, understand study abroad options, and master application procedures.",
      benefits: [
        "Make informed academic decisions",
        "Discover suitable career paths",
        "Compare educational options globally",
        "Plan your educational journey effectively"
      ],
      docSlug: "orientation"
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: "Smart Algorithm Matching",
      description: "Our advanced algorithm analyzes your profile against thousands of universities",
      stat: "Data-Driven Matches",
      color: "text-green-600",
      category: "matching",
      featured: true,
      detailedDescription: "Our intelligent matching system evaluates your academic profile, preferences, and goals to recommend universities where you have the highest chances of admission and success. Process thousands of data points for personalized results.",
      benefits: [
        "Find universities that match your profile",
        "Increase admission success chances",
        "Save time on research",
        "Get personalized recommendations"
      ],
      docSlug: "matching"
    },
    {
      icon: <Scale className="w-6 h-6" />,
      title: "University Comparison",
      description: "Compare tuition, rankings, visas, and career outcomes side-by-side",
      stat: "Compare 3+ Schools",
      color: "text-orange-600",
      category: "tools",
      featured: false,
      detailedDescription: "Compare multiple universities simultaneously with comprehensive analysis covering academics, finances, and career outcomes. Make data-driven decisions with detailed comparisons of programs, costs, and prospects.",
      benefits: [
        "Make data-driven decisions",
        "Compare total costs accurately",
        "Evaluate career prospects",
        "Identify best value options"
      ],
      docSlug: "comparison"
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: "Financial Aid Predictor", 
      description: "See your actual costs after scholarships, grants, and aid",
      stat: "Cost Transparency",
      color: "text-emerald-600",
      category: "tools",
      featured: false,
      detailedDescription: "Estimate your actual college costs with our sophisticated calculator that considers scholarships, grants, loans, and work-study opportunities. Plan your finances with accurate net cost calculations.",
      benefits: [
        "Understand true college costs",
        "Plan financially for education",
        "Identify affordable options",
        "Maximize financial aid opportunities"
      ],
      docSlug: "predictor"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Career Trajectory Maps",
      description: "Visualize salary potential vs visa flexibility globally",
      stat: "Career Insights",
      color: "text-cyan-600",
      category: "insights",
      featured: false,
      detailedDescription: "Explore career outcomes and international opportunities with interactive visualizations mapping salary potential against visa flexibility. Make informed decisions about your global career prospects.",
      benefits: [
        "Make informed career choices",
        "Understand global opportunities",
        "Plan for international work",
        "Maximize earning potential"
      ],
      docSlug: "career"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Mentorship Network",
      description: "Connect with alumni and students from your dream schools",
      stat: "Real Connections",
      color: "text-indigo-600",
      category: "community",
      featured: false,
      detailedDescription: "Access our network of mentors who have successfully navigated the admissions process. Get personalized guidance, insider insights, and support from alumni and current students at top universities.",
      benefits: [
        "Get insider knowledge",
        "Receive personalized advice",
        "Build professional network",
        "Increase admission success"
      ],
      docSlug: "mentorship"
    },
    {
      icon: <Share2 className="w-6 h-6" />,
      title: "Collaborative Lists",
      description: "Save and share university research with friends and family",
      stat: "Team Planning",
      color: "text-pink-600",
      category: "tools",
      featured: false,
      detailedDescription: "Create and share curated lists of universities and resources with collaborators. Work together on research, gather feedback, and make group decisions with family, friends, or counselors.",
      benefits: [
        "Collaborate effectively",
        "Get multiple perspectives",
        "Make group decisions",
        "Share research efficiently"
      ],
      docSlug: "collaboration"
    }
  ]

  const categories = {
    content: { name: 'Content & Learning', icon: BookOpen, color: 'from-purple-500 to-pink-500' },
    guidance: { name: 'Guidance & Explore', icon: Compass, color: 'from-blue-500 to-cyan-500' },
    matching: { name: 'Smart Matching', icon: Brain, color: 'from-green-500 to-emerald-500' },
    tools: { name: 'Tools & Calculators', icon: Scale, color: 'from-orange-500 to-red-500' },
    insights: { name: 'Career Insights', icon: BarChart3, color: 'from-cyan-500 to-blue-500' },
    community: { name: 'Community & Mentorship', icon: Users, color: 'from-indigo-500 to-purple-500' }
  }

  const featuredFeatures = features.filter(f => f.featured)
  const filteredFeatures = selectedCategory 
    ? features.filter(f => f.category === selectedCategory)
    : features

  const stats = [
    { number: "Global", label: "Reach", icon: <Globe className="w-5 h-5" /> },
    { number: "Expert", label: "Guidance", icon: <Target className="w-5 h-5" /> },
    { number: "Smart", label: "Technology", icon: <Brain className="w-5 h-5" /> },
    { number: "Free", label: "Start", icon: <DollarSign className="w-5 h-5" /> }
  ]

  const totalVideos = showcaseVideos.length

  const currentVideo = useMemo(() => {
    if (totalVideos === 0) return null
    const safeIndex = Math.max(0, Math.min(activeVideoIndex, totalVideos - 1))
    return showcaseVideos[safeIndex]
  }, [showcaseVideos, activeVideoIndex, totalVideos])

  const getVideoEmbed = (video: ShowcaseVideo | null) => {
    if (!video) return { type: 'none' as const }

    if (video.embed_code && video.embed_code.trim()) {
      return { type: 'embed' as const, html: video.embed_code }
    }

    const rawUrl = video.video_url?.trim()
    if (!rawUrl) {
      return { type: 'none' as const }
    }

    const urlLower = rawUrl.toLowerCase()

    const extractYoutubeId = (url: string) => {
      try {
        if (url.includes('youtube.com/watch')) {
          const parsed = new URL(url)
          return parsed.searchParams.get('v')
        }
        if (url.includes('youtu.be/')) {
          const parts = url.split('/')
          return parts[parts.length - 1]
        }
      } catch {
        return null
      }
      return null
    }

    const extractVimeoId = (url: string) => {
      const match = url.match(/vimeo\.com\/(\d+)/)
      return match ? match[1] : null
    }

    const youtubeId = extractYoutubeId(rawUrl)
    if (youtubeId) {
      return {
        type: 'iframe' as const,
        src: `https://www.youtube.com/embed/${youtubeId}`,
      }
    }

    const vimeoId = extractVimeoId(rawUrl)
    if (vimeoId) {
      return {
        type: 'iframe' as const,
        src: `https://player.vimeo.com/video/${vimeoId}`,
      }
    }

    const isDirectVideo =
      /\.(mp4|webm|ogg)(\?.*)?$/.test(urlLower) || urlLower.startsWith('/uploads/')
    if (isDirectVideo) {
      return {
        type: 'video' as const,
        src: resolveMediaUrl(rawUrl),
      }
    }

    return {
      type: 'iframe' as const,
      src: rawUrl,
    }
  }

  const currentEmbed = useMemo(() => getVideoEmbed(currentVideo), [currentVideo])

  const handleNextVideo = () => {
    if (totalVideos === 0) return
    setActiveVideoIndex((prev) => (prev + 1) % totalVideos)
  }

  const handlePrevVideo = () => {
    if (totalVideos === 0) return
    setActiveVideoIndex((prev) => (prev - 1 + totalVideos) % totalVideos)
  }

  const handleSelectVideo = (index: number) => {
    if (index < 0 || index >= totalVideos) return
    setActiveVideoIndex(index)
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] overflow-hidden">
      {/* 5-Second Hook: Immersive Hero */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent-secondary)]/20 via-[var(--color-bg-primary)] to-[var(--color-accent-primary)]/20" />
          <AnimatedBackground orbCount={6} duration={12} />
        </div>

        {/* Main Content */}
        <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
          {/* The Hook - Big Bold Statement */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <div className="mb-8">
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20"
                animate={{ 
                  boxShadow: ["0 0 20px rgba(139, 92, 246, 0.5)", "0 0 40px rgba(139, 92, 246, 0.8)", "0 0 20px rgba(139, 92, 246, 0.5)"]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-4 h-4 text-purple-300" />
                <span className="text-sm font-medium text-purple-200">Smart University Discovery</span>
              </motion.div>
            </div>

            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black mb-6 leading-none">
              <span className="bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                Your Dream
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                University
              </span>
              <br />
              <motion.span 
                className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent"
                animate={{ 
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{ backgroundSize: "200% 200%" }}
              >
                Awaits
              </motion.span>
            </h1>

            <motion.p 
              className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              Stop guessing. Start knowing. Our comprehensive platform guides you through every step - from exploring career insights and academic guidance to finding perfect universities, comparing options, and connecting with mentors who've been there.
            </motion.p>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.8 }}
            >
              <Link
                to="/register"
                className="group relative px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full font-semibold text-lg text-white hover:shadow-2xl hover:shadow-primary-500/25 transition-all duration-300 overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Start Guided Registration
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-700"
                  initial={{ x: "100%" }}
                  whileHover={{ x: "0%" }}
                  transition={{ duration: 0.3 }}
                />
              </Link>
              
              <button
                onClick={() => howItWorksRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                className="px-8 py-4 border border-white/30 rounded-full font-semibold text-lg hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
              >
                <Play className="w-5 h-5 inline mr-2" />
                See How It Works
              </button>
            </motion.div>
          </motion.div>

          {/* Social Proof - Immediate Credibility */}
          <motion.div 
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.2 }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  {stat.icon}
                  <span className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {stat.number}
                  </span>
                </div>
                <span className="text-sm text-gray-400">{stat.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronRight className="w-6 h-6 text-gray-400 rotate-90" />
        </motion.div>
      </section>

      {/* 5-Minute Explanation: Interactive Journey */}
      <section id="journey" className="relative py-20 bg-gradient-to-b from-black via-purple-950/20 to-black">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Your 5-Minute Journey to Clarity
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Watch how AcademOra transforms your university search from confusing to crystal clear
            </p>
          </motion.div>

          {/* Interactive Journey Steps */}
          <div className="relative" style={{ height: "400px", contain: "layout" }}>
            {/* Progress Bar Container */}
            <div className="absolute top-8 left-0 right-0 h-2 bg-gray-800/50 rounded-full overflow-hidden z-0 backdrop-blur-sm border border-gray-700/30" style={{ contain: "layout" }}>
              {/* Glow effect behind the progress */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 blur-sm"
                initial={{ width: "0%" }}
                animate={{ width: `${((currentStep + 1) / journeySteps.length) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
              {/* Main progress bar */}
              <motion.div
                className="relative h-full bg-gradient-to-r from-purple-500 via-purple-400 to-pink-500 rounded-full shadow-lg"
                initial={{ width: "0%" }}
                animate={{ width: `${((currentStep + 1) / journeySteps.length) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                {/* Animated shimmer effect - optimized */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  animate={{ x: ["-200%", "200%"] }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    ease: "linear",
                    repeatType: "loop"
                  }}
                  style={{ willChange: "transform" }}
                />
                {/* Inner glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-300/30 to-pink-300/30 rounded-full" />
                {/* Top highlight */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-300/50 to-pink-300/50 rounded-t-full" />
              </motion.div>
            </div>

            {/* Journey Cards */}
            <div className="relative grid grid-cols-1 md:grid-cols-5 gap-8 z-10" style={{ marginTop: "80px", height: "280px" }}>
              {journeySteps.map((step, index) => (
                <motion.div
                  key={index}
                  className={`text-center cursor-pointer transition-all duration-300 ${
                    index === currentStep ? 'scale-110 opacity-100' : 'scale-100 opacity-60'
                  }`}
                  onClick={() => setCurrentStep(index)}
                  whileHover={{ scale: index === currentStep ? 1.15 : 1.05 }}
                  style={{ transformOrigin: "center bottom" }}
                >
                  <motion.div
                    className={`w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${step.color} flex items-center justify-center shadow-lg`}
                    animate={{
                      boxShadow: index === currentStep 
                        ? ["0 0 20px rgba(139, 92, 246, 0.5)", "0 0 40px rgba(139, 92, 246, 0.8)", "0 0 20px rgba(139, 92, 246, 0.5)"]
                        : "0 10px 25px rgba(0, 0, 0, 0.3)"
                    }}
                    transition={{ duration: 2, repeat: index === currentStep ? Infinity : 0 }}
                  >
                    {step.icon}
                  </motion.div>
                  
                  <h3 className="text-xl font-bold mb-2 text-white">{step.title}</h3>
                  <p className="text-sm text-purple-200 mb-2">{step.subtitle}</p>
                  
                  <AnimatePresence mode="wait">
                    {index === currentStep && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, y: -10 }}
                        animate={{ opacity: 1, height: "auto", y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -10 }}
                        className="mt-4 p-4 bg-gradient-to-br from-purple-900/30 to-pink-900/20 backdrop-blur-sm rounded-xl border border-purple-500/20 shadow-lg shadow-purple-500/10"
                      >
                        <p className="text-sm text-gray-200 leading-relaxed">
                          {step.description}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>

            {/* Play/Pause Controls */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-center">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300 flex items-center gap-2"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isPlaying ? 'Pause Journey' : 'Play Journey'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Immersive Video Walkthrough */}
      <section
        ref={howItWorksRef}
        id="how-it-works"
        className="relative overflow-hidden bg-gradient-to-br from-purple-950/60 via-black to-blue-950/40 py-20"
      >
        <div className="absolute inset-0">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(147,197,253,0.15),_transparent_55%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(192,132,252,0.12),_transparent_55%)]" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4">
          <div className="mb-12 flex flex-col gap-4 text-center md:text-left">
            <span className="inline-flex items-center gap-2 self-center rounded-full border border-white/10 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-purple-200 md:self-start">
              <Play className="h-3.5 w-3.5" />
              See how it works
            </span>
            <div className="grid gap-6 md:grid-cols-2 md:items-end">
              <div>
                <h2 className="text-4xl font-bold text-white md:text-5xl">
                  A guided journey through the AcademOra platform
                </h2>
              </div>
              <p className="text-lg text-gray-300 md:text-right">
                Watch the experience come alive. Cycle through quick demos that highlight how AcademOra
                explores, compares, and matches you with universities made for your goals.
              </p>
            </div>
          </div>

          <div className="grid gap-10 lg:grid-cols-[3fr,2fr]">
            <div className="relative">
              <div className="relative overflow-hidden rounded-3xl border border-[var(--color-border-primary)]/10 bg-[var(--color-bg-secondary)] shadow-2xl shadow-[var(--color-accent-secondary)]/40">
                <div className="relative aspect-video">
                  {isVideoLoading ? (
                    <div className="flex h-full items-center justify-center text-gray-400">
                      <div className="flex items-center gap-3 text-sm">
                        <Play className="h-4 w-4 animate-pulse" />
                        Loading showcase…
                      </div>
                    </div>
                  ) : !currentVideo ? (
                    <div className="flex h-full items-center justify-center text-gray-400">
                      Videos unavailable right now.
                    </div>
                  ) : currentEmbed.type === 'embed' ? (
                    <div
                      key={`embed-${currentVideo.id}`}
                      className="absolute inset-0 [&>iframe]:h-full [&>iframe]:w-full [&>iframe]:rounded-3xl [&>iframe]:border-0"
                      dangerouslySetInnerHTML={{ __html: currentEmbed.html ?? '' }}
                    />
                  ) : currentEmbed.type === 'iframe' ? (
                    <iframe
                      key={`iframe-${currentVideo.id}`}
                      src={currentEmbed.src}
                      title={currentVideo.title}
                      className="absolute inset-0 h-full w-full rounded-3xl"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : currentEmbed.type === 'video' ? (
                    <video
                      key={`video-${currentVideo.id}`}
                      controls
                      playsInline
                      poster={
                        currentVideo.thumbnail_url
                          ? resolveMediaUrl(currentVideo.thumbnail_url)
                          : undefined
                      }
                      className="absolute inset-0 h-full w-full rounded-3xl bg-[var(--color-bg-primary)]"
                    >
                      <source src={currentEmbed.src} />
                      Your browser does not support embedded videos.
                    </video>
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-500">
                      Video unavailable.
                    </div>
                  )}
                </div>

                {totalVideos > 1 && (
                  <div className="absolute inset-x-0 bottom-4 flex items-center justify-between px-6">
                    <button
                      onClick={handlePrevVideo}
                      className="inline-flex items-center justify-center rounded-full bg-white/15 p-2 text-white transition hover:bg-white/25"
                      aria-label="Previous video"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={handleNextVideo}
                      className="inline-flex items-center justify-center rounded-full bg-white/15 p-2 text-white transition hover:bg-white/25"
                      aria-label="Next video"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
              <div className="mt-5 flex items-center justify-center gap-2">
                {showcaseVideos.map((video, index) => {
                  const isActive = index === activeVideoIndex
                  return (
                    <button
                      key={video.id ?? index}
                      onClick={() => handleSelectVideo(index)}
                      className={`h-2.5 rounded-full transition ${
                        isActive ? 'w-10 bg-purple-400' : 'w-2.5 bg-white/20 hover:bg-white/40'
                      }`}
                      aria-label={`Show video ${index + 1}`}
                    />
                  )
                })}
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
              <div className="space-y-5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-2 rounded-full bg-purple-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-purple-200">
                    Step {totalVideos === 0 ? 0 : activeVideoIndex + 1} of {totalVideos}
                  </span>
                  {isAdmin && currentVideo && !currentVideo.is_active && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-yellow-200 border border-yellow-500/30">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Draft
                    </span>
                  )}
                </div>
                <h3 className="text-3xl font-bold text-white">
                  {currentVideo?.title ?? 'Experience AcademOra'}
                </h3>
                <p className="text-base text-gray-300 leading-relaxed">
                  {currentVideo?.description ??
                    'Explore how AcademOra transforms discovery, comparison, and decision-making into a guided path built for ambitious students.'}
                </p>
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center border border-white/10">
                    <Sparkles className="h-5 w-5 text-purple-200" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Tips while watching</p>
                    <p className="text-xs text-gray-400">
                      Use the arrows or dots to switch videos instantly and dive into the flow that
                      matters most to you.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <button
                    onClick={handlePrevVideo}
                    disabled={totalVideos <= 1}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </button>
                  <button
                    onClick={handleNextVideo}
                    disabled={totalVideos <= 1}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-500/30 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    Next video
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-gray-200">
                  Ready for a deeper dive?{' '}
                  <Link
                    to="/register"
                    className="font-semibold text-purple-200 underline-offset-4 hover:underline"
                  >
                    Start guided registration
                  </Link>{' '}
                  and we’ll tailor the platform to your goals.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Platform Explorer */}
      <section className="py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
                The AcademOra Universe
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Start with our core features, then explore everything else when you're ready
            </p>
            
            {/* Explorer Toggle */}
            <motion.button
              onClick={() => setShowExplorer(!showExplorer)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-semibold text-lg hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 flex items-center gap-2 mx-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Sparkles className="w-5 h-5" />
              {showExplorer ? 'Show Core Features' : 'Explore All Features'}
              <motion.div
                animate={{ rotate: showExplorer ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronRight className="w-5 h-5" />
              </motion.div>
            </motion.button>
          </motion.div>

          {/* Core Features (Always Visible) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {featuredFeatures.map((feature, index) => (
              <motion.div
                key={index}
                className="relative group cursor-pointer"
                onHoverStart={() => setHoveredFeature(index)}
                onHoverEnd={() => setHoveredFeature(null)}
                whileHover={{ y: -5 }}
                onClick={() => {
                  setSelectedFeature(feature)
                  setIsModalOpen(true)
                }}
              >
                <div className="relative h-full p-8 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl transition-all duration-300 overflow-hidden">
                  {/* Hover gradient overlay */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-2xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: hoveredFeature === index ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                  />
                  
                  <div className={`relative z-10 mb-6 ${feature.color}`}>
                    {feature.icon}
                  </div>
                  
                  <h3 className="relative z-10 text-xl font-bold mb-3 text-white">{feature.title}</h3>
                  <p className="relative z-10 text-gray-400 mb-6">{feature.description}</p>
                  
                  <motion.div
                    className="relative z-10 text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ 
                      opacity: hoveredFeature === index ? 1 : 0.7,
                      scale: hoveredFeature === index ? 1 : 0.9
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {feature.stat}
                  </motion.div>

                  {/* Clickable Indicator */}
                  <motion.div
                    className="absolute bottom-4 right-4 flex items-center gap-1 text-xs text-purple-400 z-10"
                    initial={{ opacity: 0 }}
                    animate={{ 
                      opacity: hoveredFeature === index ? 1 : 0.6,
                      x: hoveredFeature === index ? -2 : 0
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <span>Click to learn more</span>
                    <ArrowRight className="w-3 h-3" />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Interactive Explorer (Expandable) */}
          <AnimatePresence>
            {showExplorer && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="overflow-hidden"
              >
                {/* Category Filters */}
                <div className="flex flex-wrap justify-center gap-3 mb-12">
                  <motion.button
                    onClick={() => setSelectedCategory(null)}
                    className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                      selectedCategory === null 
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    All Features
                  </motion.button>
                  {Object.entries(categories).map(([key, category]) => {
                    const Icon = category.icon
                    return (
                      <motion.button
                        key={key}
                        onClick={() => setSelectedCategory(selectedCategory === key ? null : key)}
                        className={`px-4 py-2 rounded-full font-medium transition-all duration-300 flex items-center gap-2 ${
                          selectedCategory === key 
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Icon className="w-4 h-4" />
                        {category.name}
                      </motion.button>
                    )
                  })}
                </div>

                {/* Expanded Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredFeatures.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="relative group cursor-pointer"
                      onHoverStart={() => setHoveredFeature(index + 100)}
                      onHoverEnd={() => setHoveredFeature(null)}
                      whileHover={{ y: -5 }}
                      onClick={() => {
                        setSelectedFeature(feature)
                        setIsModalOpen(true)
                      }}
                    >
                      <div className={`relative h-full p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl transition-all duration-300 overflow-hidden ${
                        feature.featured 
                          ? 'ring-2 ring-purple-500/50' 
                          : ''
                      }`}>
                        {/* Hover gradient overlay */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-2xl"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: hoveredFeature === index + 100 ? 1 : 0 }}
                          transition={{ duration: 0.3 }}
                        />
                        
                        <div className={`relative z-10 mb-4 ${feature.color}`}>
                          {feature.icon}
                        </div>
                        
                        <div className="relative z-10 flex items-start justify-between mb-3">
                          <h3 className="text-lg font-bold text-white">{feature.title}</h3>
                          {feature.featured && (
                            <motion.div
                              className="px-2 py-1 bg-purple-600/20 rounded-full text-xs text-purple-300 font-medium"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ duration: 0.3, delay: 0.2 }}
                            >
                              Core
                            </motion.div>
                          )}
                        </div>
                        
                        <p className="relative z-10 text-gray-400 text-sm mb-4">{feature.description}</p>
                        
                        <motion.div
                          className="relative z-10 text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
                          initial={{ opacity: 0 }}
                          animate={{ 
                            opacity: hoveredFeature === index + 100 ? 1 : 0.6,
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          {feature.stat}
                        </motion.div>

                        {/* Clickable Indicator */}
                        <motion.div
                          className="absolute bottom-3 right-3 flex items-center gap-1 text-xs text-purple-400 z-10"
                          initial={{ opacity: 0 }}
                          animate={{ 
                            opacity: hoveredFeature === index + 100 ? 1 : 0.6,
                            x: hoveredFeature === index + 100 ? -2 : 0
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          <span>Click to learn more</span>
                          <ArrowRight className="w-3 h-3" />
                        </motion.div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Feature Summary */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="mt-12 text-center"
                >
                  <p className="text-gray-400 text-lg">
                    <span className="font-bold text-white">{filteredFeatures.length}</span> powerful features 
                    {selectedCategory && ` in ${categories[selectedCategory as keyof typeof categories].name.toLowerCase()}`}
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    Start with our core features, explore more as you need them
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Final CTA - The Decision Point */}
      <section className="py-20 bg-gradient-to-br from-purple-900/50 via-black to-pink-900/50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white/5 backdrop-blur-md rounded-3xl p-12"
          >
            <div className="mb-8">
              <Award className="w-16 h-16 mx-auto text-yellow-400 mb-4" />
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  The Choice is Yours
                </span>
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Keep guessing your way through applications, or let our comprehensive platform guide you to success?
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="p-6 bg-red-900/20 rounded-2xl">
                <h3 className="text-xl font-bold mb-4 text-red-400">The Old Way</h3>
                <ul className="text-left space-y-2 text-gray-400">
                  <li className="flex items-center gap-2">
                    <X className="w-4 h-4 text-red-500" />
                    Endless spreadsheets and confusion
                  </li>
                  <li className="flex items-center gap-2">
                    <X className="w-4 h-4 text-red-500" />
                    Sticker price shock and hidden costs
                  </li>
                  <li className="flex items-center gap-2">
                    <X className="w-4 h-4 text-red-500" />
                    Generic advice from strangers
                  </li>
                </ul>
              </div>

              <div className="p-6 bg-green-900/20 rounded-2xl">
                <h3 className="text-xl font-bold mb-4 text-green-400">The AcademOra Way</h3>
                <ul className="text-left space-y-2 text-gray-400">
                  <li className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-green-500" />
                    Comprehensive guidance from blog to mentorship
                  </li>
                  <li className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-green-500" />
                    Smart algorithm-based matching and comparisons
                  </li>
                  <li className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-green-500" />
                    Real costs, career insights, and mentor connections
                  </li>
                </ul>
              </div>
            </div>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <Link
                to="/orientation"
                className="group px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full font-semibold text-lg hover:shadow-2xl hover:shadow-green-500/25 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Lightbulb className="w-5 h-5" />
                Start Your Success Story
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                to="/pricing"
                className="px-8 py-4 rounded-full font-semibold text-lg bg-white/5 hover:bg-white/10 transition-all duration-300"
              >
                See Pricing Plans
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Quick Start Banner */}
      <section className="py-12 bg-[var(--color-bg-primary)]">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400 mb-4">
            Join students finding their perfect educational path
          </p>
          <div className="flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              <span className="text-sm text-gray-500">
                Made with love for students worldwide
              </span>
              <Globe className="w-5 h-5 text-blue-500" />
            </div>
            <div className="flex items-center gap-2 text-sm">
              <BookOpen className="w-4 h-4 text-purple-400" />
              <Link
                to="/docs"
                className="text-purple-400 hover:text-purple-300 transition-colors"
              >
                Platform Documentation
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Modal */}
      <FeatureModal
        feature={selectedFeature}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}
