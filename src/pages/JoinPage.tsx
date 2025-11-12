import { motion } from 'framer-motion'
import SEO from '../components/SEO'
import { Users, Rocket } from 'lucide-react'

export default function JoinPage() {
  return (
    <div className="relative bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] min-h-screen py-20 overflow-hidden">
      <SEO title="Join Us - AcademOra" description="Become part of the AcademOra team and help transform education" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="mb-8">
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20"
            >
              <Users className="w-4 h-4 text-purple-300" />
              <span className="text-sm font-medium text-purple-200">Join Our Team</span>
            </motion.div>
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-6">
            <span className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
              Join Us
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
            Help us transform the future of education and make a difference in students' lives.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-3xl border border-gray-700/50 p-12 text-center"
        >
          <Rocket className="h-16 w-16 text-purple-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">Coming Soon</h2>
          <p className="text-gray-300 text-lg">
            We're building our careers portal. Check back soon for exciting opportunities to join the AcademOra team!
          </p>
        </motion.div>
      </div>
    </div>
  )
}
