import { motion } from 'framer-motion'
import SEO from '../components/SEO'
import AnimatedBackground from '../components/AnimatedBackground'
import { Heart, Briefcase, PenTool, Database, Search, Megaphone, Shield, Lightbulb, Bug, Image, Code, DollarSign } from 'lucide-react'

interface TeamRole {
  title: string
  icon: any
  description: string
  responsibilities: string[]
  monetization: string
  color: string
}

export default function CareersPage() {
  const teamRoles: TeamRole[] = [
    {
      title: "Content Writers",
      icon: PenTool,
      description: "Create engaging, informative articles about academic topics, career guidance, and educational trends.",
      responsibilities: [
        "Research and write high-quality articles on academic and career topics",
        "Interview students and professionals for success stories",
        "Create SEO-optimized content that helps students navigate their academic journey",
        "Collaborate with editors to maintain content standards and brand voice"
      ],
      monetization: "Per-article payment ($50-200) + performance bonuses based on readership and engagement metrics",
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Data Submitters",
      icon: Database,
      description: "Help expand our database by adding accurate information about schools, fields, and educational programs.",
      responsibilities: [
        "Research and verify information about universities and academic programs",
        "Submit detailed data on admission requirements, tuition costs, and program details",
        "Update existing information to ensure accuracy and relevance",
        "Source information from official university websites and educational databases"
      ],
      monetization: "Per-entry payment ($5-25) + quality bonuses for verified and comprehensive submissions",
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Data Inspectors",
      icon: Search,
      description: "Ensure data quality by identifying and reporting inaccurate or outdated information in our database.",
      responsibilities: [
        "Review submitted data for accuracy and completeness",
        "Identify and flag false, misleading, or outdated information",
        "Cross-reference data with official sources and educational authorities",
        "Provide detailed reports on data quality issues and suggest corrections"
      ],
      monetization: "Per-review payment ($3-15) + bonus incentives for catching critical errors and maintaining high accuracy rates",
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "Marketing Specialists",
      icon: Megaphone,
      description: "Drive user growth through referrals, partnerships, and targeted marketing campaigns.",
      responsibilities: [
        "Develop and execute referral programs to attract new users",
        "Build partnerships with schools, educational consultants, and student organizations",
        "Create social media campaigns and content to increase brand awareness",
        "Analyze marketing metrics and optimize campaigns for better conversion rates"
      ],
      monetization: "Base salary + commission (10-20% of revenue from referred users) + performance bonuses",
      color: "from-orange-500 to-red-500"
    },
    {
      title: "Community Moderators",
      icon: Shield,
      description: "Maintain a safe and respectful community environment by managing comments and user interactions.",
      responsibilities: [
        "Monitor and moderate user comments, discussions, and user-generated content",
        "Enforce community guidelines and remove inappropriate content",
        "Handle user reports and resolve conflicts between community members",
        "Foster positive engagement and build a supportive community atmosphere"
      ],
      monetization: "Per-action payment ($0.10-1) + monthly stipend + bonuses for community growth and engagement metrics",
      color: "from-indigo-500 to-purple-500"
    },
    {
      title: "Growth Strategists",
      icon: Lightbulb,
      description: "Develop innovative strategies for business growth, user acquisition, and market expansion.",
      responsibilities: [
        "Analyze market trends and identify growth opportunities",
        "Develop comprehensive marketing and business development strategies",
        "Create data-driven plans for user acquisition and retention",
        "Collaborate with leadership to implement and optimize strategic initiatives"
      ],
      monetization: "Project-based payment ($500-5000) + revenue sharing (5-15%) + equity options for long-term contributors",
      color: "from-yellow-500 to-orange-500"
    },
    {
      title: "QA Testers",
      icon: Bug,
      description: "Ensure platform quality by testing features, identifying bugs, and providing detailed feedback.",
      responsibilities: [
        "Test new features and functionality across different devices and browsers",
        "Identify, document, and report bugs with detailed reproduction steps",
        "Provide user experience feedback and suggest improvements",
        "Participate in regression testing and quality assurance processes"
      ],
      monetization: "Per-bug payment ($10-100) + hourly rates ($15-40) + bonuses for critical issue discovery",
      color: "from-red-500 to-pink-500"
    },
    {
      title: "Visual Editors",
      icon: Image,
      description: "Create compelling visual content including graphics, videos, and multimedia for our platform.",
      responsibilities: [
        "Design eye-catching graphics for articles and social media",
        "Create educational videos and visual content",
        "Develop brand-consistent visual assets across all platforms",
        "Collaborate with content team to enhance article engagement through visuals"
      ],
      monetization: "Per-project payment ($100-1000) + retainer options + performance bonuses based on engagement metrics",
      color: "from-pink-500 to-rose-500"
    },
    {
      title: "Programmers",
      icon: Code,
      description: "Build and maintain our platform's features, APIs, and infrastructure.",
      responsibilities: [
        "Develop new features and functionality for the AcademOra platform",
        "Write clean, efficient code and participate in code reviews",
        "Maintain and optimize existing systems for better performance",
        "Collaborate with cross-functional teams to deliver high-quality solutions"
      ],
      monetization: "Hourly rates ($25-100) + project-based payments + equity options for senior contributors and long-term commitments",
      color: "from-cyan-500 to-blue-500"
    }
  ]

  return (
    <div className="relative bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] min-h-screen py-20 overflow-hidden">
      <SEO title="Join Our Team - AcademOra" description="Become part of AcademOra's mission to transform education through various roles and opportunities" />
      
      {/* Animated background elements */}
      <AnimatedBackground 
  colors={['var(--chart-color-6)', 'var(--chart-color-5)', 'var(--chart-color-4)', 'var(--chart-color-1)']} 
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
                boxShadow: ["0 0 20px rgba(239, 68, 68, 0.5)", "0 0 40px rgba(239, 68, 68, 0.8)", "0 0 20px rgba(239, 68, 68, 0.5)"]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Heart className="w-4 h-4 text-red-300" />
              <span className="text-sm font-medium text-red-200">Join Our Team</span>
            </motion.div>
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-6">
            <span className="bg-gradient-to-r from-white via-red-200 to-pink-200 bg-clip-text text-transparent">
              Join Our Team
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-8">
            Build your career while helping students build theirs. We're looking for passionate individuals to join our mission.
          </p>

          {/* Coming Soon Banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm rounded-2xl p-8 border border-yellow-500/30 max-w-4xl mx-auto"
          >
            <div className="flex items-center justify-center gap-4 mb-4">
              <DollarSign className="h-8 w-8 text-yellow-400" />
              <h2 className="text-3xl font-bold text-yellow-300">COMING SOON</h2>
              <DollarSign className="h-8 w-8 text-yellow-400" />
            </div>
            <p className="text-xl text-yellow-200 font-medium">
              (Tight Budget - But Great Opportunities!)
            </p>
            <p className="text-gray-300 mt-4">
              We're currently building our team platform and monetization systems. Each role will have its own flexible monetization regime designed to reward quality contributions.
            </p>
          </motion.div>
        </motion.div>

        {/* Monetization Info */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-3xl border border-gray-700/50 p-8 mb-12"
        >
          <div className="flex items-center gap-4 mb-6">
            <DollarSign className="h-8 w-8 text-green-400" />
            <h2 className="text-2xl font-bold text-white">Flexible Monetization for Every Role</h2>
          </div>
          <p className="text-gray-300 leading-relaxed">
            At AcademOra, we believe in rewarding talent and dedication. Each role comes with its own tailored monetization regime, 
            ranging from per-task payments to revenue sharing and equity opportunities. Whether you're looking for freelance work, 
            part-time collaboration, or long-term partnership, we have flexible options to suit your needs and compensate you fairly 
            for your contributions to our mission of transforming education.
          </p>
        </motion.div>

        {/* Team Roles Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <h2 className="text-3xl font-bold text-white text-center mb-12">Available Roles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamRoles.map((role, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -10, transition: { duration: 0.2 } }}
                className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 hover:border-gray-600/50 hover:shadow-2xl transition-all duration-300 overflow-hidden"
              >
                <div className={`bg-gradient-to-r ${role.color} p-6`}>
                  <role.icon className="h-12 w-12 text-white mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">{role.title}</h3>
                </div>
                
                <div className="p-6">
                  <p className="text-gray-300 mb-4 leading-relaxed">{role.description}</p>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-400 mb-2">Key Responsibilities:</h4>
                    <ul className="space-y-1">
                      {role.responsibilities.slice(0, 3).map((resp, i) => (
                        <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                          <span className="text-green-400 mt-1">•</span>
                          <span>{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-green-400 mb-2">Monetization:</h4>
                    <p className="text-sm text-gray-300">{role.monetization}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-3xl border border-gray-700/50 p-12">
            <Briefcase className="h-16 w-16 text-red-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Make a Difference?</h2>
            <p className="text-gray-300 text-lg mb-8">
              Join us in transforming education and helping students worldwide achieve their academic dreams.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold px-8 py-4 rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-300"
              onClick={() => alert('Application portal coming soon!')}
            >
              Get Notified When We Launch
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
