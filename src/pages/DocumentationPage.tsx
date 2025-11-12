import { motion } from 'framer-motion'
import { ArrowLeft, BookOpen, Clock, Users, Target, Zap } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useEffect } from 'react'

// Documentation data
const documentationData = {
  blog: {
    title: 'Comprehensive Blog',
    subtitle: 'Expert articles on academics, careers, and study opportunities',
    icon: BookOpen,
    color: 'from-purple-500 to-pink-500',
    overview: 'Our blog serves as your primary resource for educational content, featuring expert-written articles on everything from university applications to career planning.',
    sections: [
      {
        title: 'Content Categories',
        content: 'The blog covers multiple areas including academic guidance, career insights, study abroad opportunities, application strategies, and industry trends. Each article is carefully researched and written by experts in the field.',
        icon: BookOpen
      },
      {
        title: 'Regular Updates',
        content: 'New content is published weekly, ensuring you always have access to the most current information and trends in education and career development.',
        icon: Clock
      },
      {
        title: 'Expert Authors',
        content: 'Our contributors include education professionals, industry experts, and experienced mentors who share their knowledge and real-world experiences.',
        icon: Users
      }
    ],
    benefits: [
      'Stay informed about latest educational trends',
      'Get expert advice on applications and careers',
      'Learn from real-world experiences',
      'Access comprehensive study guides',
      'Prepare for interviews and assessments'
    ],
    useCases: [
      'Researching university programs',
      'Understanding career paths',
      'Learning application strategies',
      'Studying for standardized tests',
      'Exploring study abroad options'
    ]
  },
  orientation: {
    title: 'Orientation Hub',
    subtitle: 'Navigate fields, schools, study abroad, and application procedures',
    icon: Target,
    color: 'from-blue-500 to-cyan-500',
    overview: 'The Orientation Hub is your comprehensive guide to making informed educational decisions, providing structured pathways through every aspect of your academic journey.',
    sections: [
      {
        title: 'Field Exploration',
        content: 'Discover different academic fields and career paths with detailed information about required skills, job prospects, and educational requirements.',
        icon: Target
      },
      {
        title: 'School Comparisons',
        content: 'Compare schools and universities worldwide using our comprehensive database that includes rankings, programs, costs, and student outcomes.',
        icon: Users
      },
      {
        title: 'Study Abroad Guidance',
        content: 'Navigate the complexities of international education with guides on visas, cultural adaptation, and choosing the right program.',
        icon: BookOpen
      }
    ],
    benefits: [
      'Make informed academic decisions',
      'Discover suitable career paths',
      'Compare educational options globally',
      'Understand application procedures',
      'Plan your educational journey effectively'
    ],
    useCases: [
      'Choosing a major or field of study',
      'Selecting the right university',
      'Planning study abroad experiences',
      'Understanding admission requirements',
      'Exploring career opportunities'
    ]
  },
  matching: {
    title: 'Smart Algorithm Matching',
    subtitle: 'Data-driven university matching based on your profile and preferences',
    icon: Zap,
    color: 'from-green-500 to-emerald-500',
    overview: 'Our intelligent matching system analyzes your academic profile, preferences, and goals to recommend universities that align perfectly with your needs.',
    sections: [
      {
        title: 'Profile Analysis',
        content: 'We evaluate your academic achievements, test scores, extracurricular activities, and personal preferences to create a comprehensive profile.',
        icon: Users
      },
      {
        title: 'Smart Matching',
        content: 'Our algorithm processes thousands of data points to identify universities where you have the highest chances of admission and success.',
        icon: Target
      },
      {
        title: 'Personalized Recommendations',
        content: 'Receive tailored suggestions that consider your academic fit, career goals, financial situation, and personal preferences.',
        icon: Zap
      }
    ],
    benefits: [
      'Find universities that match your profile',
      'Increase admission success chances',
      'Save time on research',
      'Discover hidden gem schools',
      'Get personalized recommendations'
    ],
    useCases: [
      'Building college application lists',
      'Finding safety, match, and reach schools',
      'Exploring new university options',
      'Validating school choices',
      'Optimizing application strategy'
    ]
  },
  comparison: {
    title: 'University Comparison',
    subtitle: 'Side-by-side analysis of tuition, rankings, and career outcomes',
    icon: Target,
    color: 'from-orange-500 to-red-500',
    overview: 'Compare multiple universities simultaneously with our comprehensive comparison tool that covers academics, finances, and career outcomes.',
    sections: [
      {
        title: 'Academic Comparison',
        content: 'Compare programs, faculty quality, research opportunities, and academic reputation across multiple institutions.',
        icon: BookOpen
      },
      {
        title: 'Financial Analysis',
        content: 'Analyze tuition costs, living expenses, financial aid opportunities, and return on investment for each university.',
        icon: Target
      },
      {
        title: 'Career Outcomes',
        content: 'Review graduation rates, employment statistics, average salaries, and alumni network strength for informed decisions.',
        icon: Users
      }
    ],
    benefits: [
      'Make data-driven decisions',
      'Compare total costs accurately',
      'Evaluate career prospects',
      'Identify best value options',
      'Streamline decision-making process'
    ],
    useCases: [
      'Finalizing university choices',
      'Negotiating financial aid',
      'Convincing parents of choices',
      'Making enrollment decisions',
      'Planning career trajectory'
    ]
  },
  predictor: {
    title: 'Financial Aid Predictor',
    subtitle: 'Calculate real costs after scholarships, grants, and aid',
    icon: Target,
    color: 'from-emerald-500 to-green-500',
    overview: 'Estimate your actual college costs with our sophisticated financial aid calculator that considers scholarships, grants, loans, and work-study opportunities.',
    sections: [
      {
        title: 'Cost Analysis',
        content: 'Break down total costs including tuition, room and board, books, and personal expenses for each university.',
        icon: Target
      },
      {
        title: 'Aid Estimation',
        content: 'Calculate potential financial aid based on your family income, academic merit, and other qualifying factors.',
        icon: Zap
      },
      {
        title: 'Net Cost Calculation',
        content: 'Determine your actual out-of-pocket costs after accounting for all types of financial assistance.',
        icon: Users
      }
    ],
    benefits: [
      'Understand true college costs',
      'Plan financially for education',
      'Identify affordable options',
      'Maximize financial aid opportunities',
      'Avoid unexpected expenses'
    ],
    useCases: [
      'Budgeting for college',
      'Comparing financial aid packages',
      'Planning family finances',
      'Applying for scholarships',
      'Making enrollment decisions'
    ]
  },
  career: {
    title: 'Career Trajectory Maps',
    subtitle: 'Visualize salary potential vs visa flexibility globally',
    icon: Target,
    color: 'from-cyan-500 to-blue-500',
    overview: 'Explore career outcomes and international opportunities with our interactive visualization tools that map salary potential against visa flexibility.',
    sections: [
      {
        title: 'Salary Projections',
        content: 'View detailed salary data by major, industry, and location to understand your earning potential after graduation.',
        icon: Target
      },
      {
        title: 'Visa Opportunities',
        content: 'Analyze post-graduation work visa options, duration, and requirements for international students.',
        icon: Users
      },
      {
        title: 'Career Pathways',
        content: 'Explore different career trajectories and understand how various factors influence your professional journey.',
        icon: Zap
      }
    ],
    benefits: [
      'Make informed career choices',
      'Understand global opportunities',
      'Plan for international work',
      'Maximize earning potential',
      'Choose optimal study locations'
    ],
    useCases: [
      'Choosing a career path',
      'Selecting study destinations',
      'Planning long-term career goals',
      'Evaluating job opportunities',
      'Making relocation decisions'
    ]
  },
  mentorship: {
    title: 'Mentorship Network',
    subtitle: 'Connect with alumni and students from your dream schools',
    icon: Users,
    color: 'from-indigo-500 to-purple-500',
    overview: 'Access our network of mentors who have successfully navigated the admissions process and can provide personalized guidance and support.',
    sections: [
      {
        title: 'Alumni Mentors',
        content: 'Connect with graduates from top universities who can share their experiences and provide insider insights.',
        icon: Users
      },
      {
        title: 'Current Students',
        content: 'Get advice from students currently attending your target schools about campus life, academics, and application tips.',
        icon: BookOpen
      },
      {
        title: 'Expert Guidance',
        content: 'Receive personalized advice on applications, interviews, essays, and choosing the right educational path.',
        icon: Target
      }
    ],
    benefits: [
      'Get insider knowledge',
      'Receive personalized advice',
      'Build professional network',
      'Learn from real experiences',
      'Increase admission success'
    ],
    useCases: [
      'Preparing for interviews',
      'Writing application essays',
      'Choosing between schools',
      'Understanding campus culture',
      'Planning career strategies'
    ]
  },
  collaboration: {
    title: 'Collaborative Lists',
    subtitle: 'Save and share university research with friends and family',
    icon: Users,
    color: 'from-pink-500 to-purple-500',
    overview: 'Create and share curated lists of universities, articles, and resources with collaborators to make group decisions and gather feedback.',
    sections: [
      {
        title: 'Shared Research',
        content: 'Collaborate on university research by sharing lists, notes, and evaluations with family, friends, or counselors.',
        icon: Users
      },
      {
        title: 'Team Planning',
        content: 'Work together to create comprehensive application strategies and compare options as a group.',
        icon: Target
      },
      {
        title: 'Feedback Collection',
        content: 'Gather opinions and feedback from collaborators to make more informed decisions about your educational choices.',
        icon: BookOpen
      }
    ],
    benefits: [
      'Collaborate effectively',
      'Get multiple perspectives',
      'Make group decisions',
      'Share research efficiently',
      'Streamline communication'
    ],
    useCases: [
      'Family decision-making',
      'Counselor collaboration',
      'Peer recommendation sharing',
      'Group project planning',
      'Feedback collection'
    ]
  }
}

export default function DocumentationPage() {
  const { slug } = useParams<{ slug: string }>()
  const doc = documentationData[slug as keyof typeof documentationData]

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  if (!doc) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Documentation Not Found</h1>
          <Link to="/" className="text-purple-400 hover:text-purple-300">
            Return to Home
          </Link>
        </div>
      </div>
    )
  }

  const Icon = doc.icon

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
            <div className={`p-4 rounded-2xl bg-gradient-to-r ${doc.color}`}>
              <Icon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{doc.title}</h1>
              <p className="text-xl text-gray-400">{doc.subtitle}</p>
            </div>
          </div>

          <p className="text-lg text-gray-300 leading-relaxed">{doc.overview}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Sections */}
        <div className="space-y-12 mb-16">
          {doc.sections.map((section, index) => {
            const SectionIcon = section.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gray-900/50 rounded-2xl p-8 border border-gray-800"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${doc.color} flex-shrink-0`}>
                    <SectionIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-3">{section.title}</h3>
                    <p className="text-gray-300 leading-relaxed">{section.content}</p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Benefits */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6">Key Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {doc.benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-pink-400" />
                <span className="text-gray-300">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Use Cases */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Common Use Cases</h2>
          <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-2xl p-8 border border-purple-500/20">
            <ul className="space-y-3">
              {doc.useCases.map((useCase, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-center gap-3 text-gray-300"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  {useCase}
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
