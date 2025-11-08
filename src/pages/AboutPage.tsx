import { motion } from 'framer-motion'
import SEO from '../components/SEO'
import { Info, Users, Target, Award } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="relative bg-black text-white min-h-screen py-20 overflow-hidden">
      <SEO title="About Us - AcademOra" description="Learn about AcademOra's mission to transform academic guidance and career planning" />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full mix-blend-screen"
            style={{
              left: `${15 + (i * 25)}%`,
              top: `${20 + (i * 15)}%`,
              width: `${150 + (i * 100)}px`,
              height: `${150 + (i * 100)}px`,
              background: `radial-gradient(circle, ${['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'][i]}20 0%, transparent 70%)`,
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            About AcademOra
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Empowering students worldwide with intelligent academic guidance and personalized career planning through cutting-edge AI technology.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {[
            {
              icon: Info,
              title: "Our Mission",
              description: "To democratize access to quality educational guidance and help every student find their perfect academic path.",
              color: "from-blue-500 to-cyan-500"
            },
            {
              icon: Users,
              title: "Our Team",
              description: "A diverse group of educators, technologists, and industry experts passionate about transforming education.",
              color: "from-purple-500 to-pink-500"
            },
            {
              icon: Target,
              title: "Our Vision",
              description: "Creating a world where every student has the tools and knowledge to make informed academic decisions.",
              color: "from-pink-500 to-rose-500"
            },
            {
              icon: Award,
              title: "Our Values",
              description: "Excellence, innovation, accessibility, and student success guide everything we do.",
              color: "from-amber-500 to-orange-500"
            }
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${item.color} flex items-center justify-center mb-4`}>
                <item.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">{item.title}</h3>
              <p className="text-gray-400 leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-gray-800"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Why Choose AcademOra?
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4 text-white">🎯 Precision Matching</h3>
              <p className="text-gray-400 mb-6">
                Our advanced AI algorithms analyze your academic profile, preferences, and goals to recommend the most suitable universities and programs.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4 text-white">🌍 Global Reach</h3>
              <p className="text-gray-400 mb-6">
                Access comprehensive information about universities and educational institutions worldwide, all in one platform.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4 text-white">📊 Data-Driven Insights</h3>
              <p className="text-gray-400 mb-6">
                Make informed decisions with detailed analytics, admission statistics, and success metrics for thousands of programs.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4 text-white">🤝 Personalized Support</h3>
              <p className="text-gray-400 mb-6">
                Receive tailored guidance and support throughout your academic journey, from application to enrollment.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            Join Our Community
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Become part of a global network of students and educators shaping the future of academic guidance.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            onClick={() => window.location.href = '/register'}
          >
            Get Started Today
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}
