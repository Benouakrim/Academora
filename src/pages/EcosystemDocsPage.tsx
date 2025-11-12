import { motion } from 'framer-motion'
import { ArrowLeft, BookOpen, Globe, Compass, Brain, Users, Scale, DollarSign, BarChart3, Share2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect } from 'react'

export default function EcosystemDocsPage() {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const ecosystemSections = [
    {
      title: "Platform Overview",
      icon: Globe,
      color: "from-purple-500 to-pink-500",
      description: "AcademOra is a comprehensive educational platform designed to guide students through every step of their academic journey, from initial exploration to final enrollment decisions.",
      topics: [
        "Our Mission: Making education accessible and transparent",
        "Platform Philosophy: Data-driven guidance with human touch",
        "Target Audience: Students, parents, and educators worldwide",
        "Core Values: Integrity, Innovation, and Student Success"
      ]
    },
    {
      title: "Content Ecosystem",
      icon: BookOpen,
      color: "from-blue-500 to-cyan-500",
      description: "Our content ecosystem provides structured information across multiple formats to help users make informed educational decisions.",
      topics: [
        "Blog Articles: Expert-written content on academics and careers",
        "Orientation Guides: Structured pathways through educational choices",
        "Documentation: In-depth feature explanations and use cases",
        "User-Generated Content: Community insights and experiences"
      ]
    },
    {
      title: "Smart Technology",
      icon: Brain,
      color: "from-green-500 to-emerald-500",
      description: "Our smart technology uses advanced algorithms to analyze profiles and provide personalized recommendations, ensuring optimal matches between students and educational opportunities.",
      topics: [
        "Algorithm-Based Matching: Profile analysis for university recommendations",
        "Data Processing: Thousands of data points analyzed for accuracy",
        "Personalization: Tailored suggestions based on individual goals",
        "Continuous Learning: System improves with user feedback"
      ]
    },
    {
      title: "Community & Mentorship",
      icon: Users,
      color: "from-indigo-500 to-purple-500",
      description: "Connect with experienced mentors and peers to gain real-world insights and guidance throughout your educational journey.",
      topics: [
        "Mentor Network: Alumni and current students from top universities",
        "Peer Connections: Collaborate with other students on similar paths",
        "Expert Guidance: Access to education professionals and counselors",
        "Community Support: Forums and discussion groups for shared learning"
      ]
    },
    {
      title: "Financial Tools",
      icon: DollarSign,
      color: "from-emerald-500 to-green-500",
      description: "Comprehensive financial planning tools to help understand and manage the costs of education, from tuition to living expenses.",
      topics: [
        "Financial Aid Predictor: Calculate actual costs after aid",
        "Scholarship Matching: Find relevant funding opportunities",
        "Cost Comparison: Compare total expenses across institutions",
        "Budget Planning: Tools for financial planning and management"
      ]
    },
    {
      title: "Career Insights",
      icon: BarChart3,
      color: "from-cyan-500 to-blue-500",
      description: "Advanced analytics and visualizations to help understand career outcomes and make informed decisions about your future.",
      topics: [
        "Salary Projections: Industry-specific earning potential",
        "Career Trajectories: Long-term career path analysis",
        "Market Trends: Current and future job market insights",
        "Skill Requirements: In-demand skills for different careers"
      ]
    },
    {
      title: "Comparison & Analysis",
      icon: Scale,
      color: "from-orange-500 to-red-500",
      description: "Powerful comparison tools to analyze multiple options side-by-side, ensuring you make the best possible educational choices.",
      topics: [
        "University Comparison: Multiple institutions analyzed together",
        "Program Analysis: Degree and program-specific comparisons",
        "Outcome Metrics: Graduate success and employment statistics",
        "Quality Rankings: Academic and institutional reputation analysis"
      ]
    },
    {
      title: "Collaboration Tools",
      icon: Share2,
      color: "from-pink-500 to-purple-500",
      description: "Work together with family, friends, and counselors to make collective decisions about educational opportunities.",
      topics: [
        "Shared Lists: Collaborative research and shortlisting",
        "Team Planning: Group decision-making tools",
        "Feedback Collection: Gather opinions from trusted advisors",
        "Progress Tracking: Monitor application and decision progress"
      ]
    }
  ]

  const terminology = [
    {
      term: "Academic Profile",
      definition: "Comprehensive data about a student's academic achievements, including GPA, test scores, coursework, and extracurricular activities.",
      category: "Core Concepts"
    },
    {
      term: "Smart Matching",
      definition: "Our algorithm-based system that analyzes student profiles against university requirements to recommend optimal matches.",
      category: "Technology"
    },
    {
      term: "Orientation Hub",
      definition: "Central area for exploring educational paths, including fields of study, school options, and application procedures.",
      category: "Features"
    },
    {
      term: "Financial Aid Package",
      definition: "Complete combination of grants, scholarships, loans, and work-study opportunities offered by an institution.",
      category: "Financial"
    },
    {
      term: "Career Trajectory",
      definition: "Projected career path and outcomes based on educational choices, including salary potential and advancement opportunities.",
      category: "Career"
    },
    {
      term: "Mentor Network",
      definition: "Community of experienced individuals who provide guidance and insights based on their own educational and professional experiences.",
      category: "Community"
    },
    {
      term: "Collaborative Lists",
      definition: "Shared collections of universities, articles, and resources that can be edited and discussed by multiple users.",
      category: "Tools"
    },
    {
      term: "Net Cost Calculator",
      definition: "Tool that determines the actual out-of-pocket expense after subtracting all financial aid from total costs.",
      category: "Financial"
    },
    {
      term: "Visa Flexibility",
      definition: "Analysis of post-graduation work visa options and requirements for international students.",
      category: "International"
    },
    {
      term: "Algorithm-Based Recommendations",
      definition: "Personalized suggestions generated by our smart technology based on comprehensive profile analysis.",
      category: "Technology"
    }
  ]

  const categories = [...new Set(terminology.map(item => item.category))]

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      {/* Header */}
      <div className="bg-gradient-to-b from-gray-900 to-black py-20">
        <div className="max-w-4xl mx-auto px-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          
          <div className="flex items-center gap-6 mb-8">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500">
              <Globe className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Platform Ecosystem & Terminology</h1>
              <p className="text-xl text-gray-400">Understanding the complete AcademOra platform</p>
            </div>
          </div>

          <p className="text-lg text-gray-300 leading-relaxed">
            AcademOra is designed as an integrated ecosystem where every component works together to provide comprehensive guidance for your educational journey. This documentation explains how all parts connect and the terminology used throughout the platform.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Ecosystem Sections */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8">Platform Ecosystem</h2>
          <div className="space-y-8">
            {ecosystemSections.map((section, index) => {
              const Icon = section.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-gray-900/50 rounded-2xl p-8 border border-gray-800"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${section.color} flex-shrink-0`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-3">{section.title}</h3>
                      <p className="text-gray-300 leading-relaxed mb-4">{section.description}</p>
                      <ul className="space-y-2">
                        {section.topics.map((topic, topicIndex) => (
                          <li key={topicIndex} className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex-shrink-0" />
                            <span className="text-gray-300">{topic}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Terminology */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-8">Platform Terminology</h2>
          <div className="space-y-8">
            {categories.map((category, categoryIndex) => (
              <motion.div
                key={categoryIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
              >
                <h3 className="text-xl font-bold text-white mb-4">{category}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {terminology
                    .filter(item => item.category === category)
                    .map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700"
                      >
                        <h4 className="text-lg font-semibold text-white mb-2">{item.term}</h4>
                        <p className="text-gray-300 text-sm leading-relaxed">{item.definition}</p>
                      </motion.div>
                    ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-white mb-6">Quick Links to Feature Documentation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              to="/docs/blog"
              className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-xl border border-gray-700 hover:bg-gray-700/50 transition-colors"
            >
              <BookOpen className="w-5 h-5 text-purple-400" />
              <span className="text-white">Comprehensive Blog</span>
            </Link>
            <Link
              to="/docs/orientation"
              className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-xl border border-gray-700 hover:bg-gray-700/50 transition-colors"
            >
              <Compass className="w-5 h-5 text-blue-400" />
              <span className="text-white">Orientation Hub</span>
            </Link>
            <Link
              to="/docs/matching"
              className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-xl border border-gray-700 hover:bg-gray-700/50 transition-colors"
            >
              <Brain className="w-5 h-5 text-green-400" />
              <span className="text-white">Smart Algorithm Matching</span>
            </Link>
            <Link
              to="/docs/comparison"
              className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-xl border border-gray-700 hover:bg-gray-700/50 transition-colors"
            >
              <Scale className="w-5 h-5 text-orange-400" />
              <span className="text-white">University Comparison</span>
            </Link>
            <Link
              to="/docs/predictor"
              className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-xl border border-gray-700 hover:bg-gray-700/50 transition-colors"
            >
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <span className="text-white">Financial Aid Predictor</span>
            </Link>
            <Link
              to="/docs/career"
              className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-xl border border-gray-700 hover:bg-gray-700/50 transition-colors"
            >
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              <span className="text-white">Career Trajectory Maps</span>
            </Link>
            <Link
              to="/docs/mentorship"
              className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-xl border border-gray-700 hover:bg-gray-700/50 transition-colors"
            >
              <Users className="w-5 h-5 text-indigo-400" />
              <span className="text-white">Mentorship Network</span>
            </Link>
            <Link
              to="/docs/collaboration"
              className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-xl border border-gray-700 hover:bg-gray-700/50 transition-colors"
            >
              <Share2 className="w-5 h-5 text-pink-400" />
              <span className="text-white">Collaborative Lists</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
