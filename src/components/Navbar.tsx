import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Menu, X, User, LogOut, GraduationCap } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { authAPI, getCurrentUser } from '../lib/api'
import LanguageSwitcher from './LanguageSwitcher'
import { motion, AnimatePresence } from 'framer-motion'

interface User {
  id: string
  email: string
  role?: string
}

interface NavbarProps {
  onAdminMenuToggle?: () => void
  showAdminMenu?: boolean
  isAdmin?: boolean
}

export default function Navbar({ onAdminMenuToggle, showAdminMenu }: NavbarProps = {}) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Get initial user from localStorage
    const currentUser = getCurrentUser()
    setUser(currentUser)
  }, [])

  // Listen for storage changes (e.g., login/logout from another tab)
  useEffect(() => {
    const handleStorageChange = () => {
      const currentUser = getCurrentUser()
      setUser(currentUser)
    }

    window.addEventListener('storage', handleStorageChange)
    // Also check periodically (in case of same-tab changes)
    const interval = setInterval(() => {
      const currentUser = getCurrentUser()
      if (currentUser?.id !== user?.id) {
        setUser(currentUser)
      }
    }, 1000)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [user])

  const handleSignOut = () => {
    authAPI.logout()
    setUser(null)
    navigate('/')
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/95 backdrop-blur-md shadow-md sticky top-0 z-50 border-b border-gray-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Admin Menu Toggle for Admin Users */}
          {user?.role === 'admin' ? (
            <button
              onClick={onAdminMenuToggle}
              className="flex items-center space-x-2 group"
              title="Admin Menu"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className={`${showAdminMenu ? 'rotate-12' : ''}`}
              >
                <GraduationCap className={`h-8 w-8 transition-colors duration-200 ${
                  showAdminMenu ? 'text-blue-600' : 'text-primary-600'
                } group-hover:text-blue-600`} />
              </motion.div>
              <span className={`text-2xl font-bold transition-all duration-200 bg-gradient-to-r bg-clip-text text-transparent ${
                showAdminMenu 
                  ? 'from-blue-600 to-blue-800' 
                  : 'from-primary-600 to-primary-800 group-hover:from-blue-600 group-hover:to-blue-800'
              }`}>
                AcademOra
              </span>
            </button>
          ) : (
            <Link to="/" className="flex items-center space-x-2 group">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                <GraduationCap className="h-8 w-8 text-primary-600" />
              </motion.div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                AcademOra
              </span>
            </Link>
          )}

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {[
              { path: '/', label: t('common.home') },
              { path: '/blog', label: t('common.blog') },
              { path: '/orientation', label: t('common.orientation') },
              { path: '/about', label: 'About' },
              { path: '/contact', label: 'Contact' },
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="relative text-gray-700 hover:text-primary-600 transition-colors px-2 py-1 group"
              >
                <span className="relative z-10">{item.label}</span>
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span>{t('common.dashboard')}</span>
                </Link>
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="text-gray-700 hover:text-primary-600 transition-colors"
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{t('common.signOut')}</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-primary-600 transition-colors">
                  {t('common.login')}
                </Link>
                <Link to="/signup" className="btn-primary">
                  {t('common.signup')}
                </Link>
              </>
            )}
            <LanguageSwitcher />
          </div>

          {/* Mobile menu button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="md:hidden text-gray-700 hover:text-primary-600"
            onClick={() => setIsOpen(!isOpen)}
          >
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                >
                  <X className="h-6 w-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                >
                  <Menu className="h-6 w-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

          {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden border-t border-gray-200 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              {t('common.home')}
            </Link>
            <Link
              to="/blog"
              className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              {t('common.blog')}
            </Link>
            <Link
              to="/orientation"
              className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              {t('common.orientation')}
            </Link>
            <Link
              to="/about"
              className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              About
            </Link>
            <Link
              to="/contact"
              className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              Contact
            </Link>
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  {t('common.dashboard')}
                </Link>
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                    onClick={() => setIsOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleSignOut()
                    setIsOpen(false)
                  }}
                  className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  {t('common.signOut')}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  {t('common.login')}
                </Link>
                <Link
                  to="/signup"
                  className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  {t('common.signup')}
                </Link>
              </>
            )}
            <div className="pt-2 border-t border-gray-200 mt-2">
              <LanguageSwitcher />
            </div>
          </div>
        </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

