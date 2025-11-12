import { Link } from 'react-router-dom'
import { GraduationCap, Mail, Github, Twitter, Linkedin, Sparkles, Heart } from 'lucide-react'
import ThemeModeToggle from './ThemeModeToggle'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'

export default function Footer() {
  const { t } = useTranslation()
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-black to-purple-900/20 text-white mt-auto">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Link to="/" className="flex items-center space-x-3 group">
              <motion.div
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  boxShadow: ["0 0 20px rgba(139, 92, 246, 0.5)", "0 0 40px rgba(139, 92, 246, 0.8)", "0 0 20px rgba(139, 92, 246, 0.5)"]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <GraduationCap className="h-10 w-10 text-purple-400 group-hover:text-purple-300 transition-colors" />
              </motion.div>
              <span className="text-3xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                AcademOra
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your gateway to finding the perfect university match. Connect with institutions worldwide and discover your academic future.
            </p>
            <div className="flex space-x-4">
              {[
                { href: "https://github.com", icon: Github, label: "GitHub" },
                { href: "https://twitter.com", icon: Twitter, label: "Twitter" },
                { href: "https://linkedin.com", icon: Linkedin, label: "LinkedIn" }
              ].map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-purple-400 transition-colors p-2 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:bg-purple-900/20 hover:border-purple-500/30"
                  aria-label={social.label}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <social.icon className="h-5 w-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="text-lg font-semibold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {[
                { to: "/blog", label: "Read" },
                { to: "/orientation", label: "Explore" },
                { to: "/matching-engine", label: t('common.matcher') },
                { to: "/about", label: "About Us" },
                { to: "/careers", label: "Careers" },
                { to: "/pricing", label: "Pricing" }
              ].map((link, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.2 + (index * 0.05) }}
                >
                  <Link
                    to={link.to}
                    className="text-gray-400 hover:text-purple-400 transition-all duration-300 text-sm flex items-center gap-2 group"
                  >
                    <Sparkles className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Resources */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-lg font-semibold mb-6 bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
              Resources
            </h3>
            <ul className="space-y-3">
              {[
                { to: "/contact", label: "Contact Us" },
                { to: "/policy", label: "Privacy Policy" },
                { to: "/docs", label: "Documentation" },
                { to: "/compare", label: "Compare Universities" }
              ].map((link, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.3 + (index * 0.05) }}
                >
                  <Link
                    to={link.to}
                    className="text-gray-400 hover:text-blue-400 transition-all duration-300 text-sm flex items-center gap-2 group"
                  >
                    <Sparkles className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="text-lg font-semibold mb-6 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Get in Touch
            </h3>
            <ul className="space-y-4">
              <motion.li 
                className="flex items-start space-x-3"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <motion.div
                  animate={{ 
                    boxShadow: ["0 0 20px rgba(16, 185, 129, 0.5)", "0 0 40px rgba(16, 185, 129, 0.8)", "0 0 20px rgba(16, 185, 129, 0.5)"]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Mail className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                </motion.div>
                <a
                  href="mailto:contact@academora.com"
                  className="text-gray-400 hover:text-green-400 transition-colors text-sm"
                >
                  contact@academora.com
                </a>
              </motion.li>
            </ul>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div 
          className="border-t border-gray-700/50 mt-12 pt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm flex items-center gap-2">
              © {currentYear} AcademOra. All rights reserved.
            </p>
            <motion.div 
              className="text-gray-500 text-xs flex items-center gap-2"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              Made with 
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Heart className="w-4 h-4 text-red-400 fill-current" />
              </motion.div>
              for students worldwide
            </motion.div>
            {/* Public theme mode toggle in footer */}
            <ThemeModeToggle className="ml-0 md:ml-4" />
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
