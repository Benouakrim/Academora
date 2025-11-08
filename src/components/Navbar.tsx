import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Menu, X, User, LogOut, Sparkles, Settings, Bell, ChevronDown, BookOpen, FileText, Info, Phone, Shield, Heart } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { authAPI, getCurrentUser, staticPagesAPI, notificationsAPI } from '../lib/api'
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

interface StaticPage {
  id: string;
  slug: string;
  title: string;
  visibility_areas: string[];
  sort_order: number;
}

// Permanent features that always appear in navbar
const PERMANENT_FEATURES = [
  { path: '/blog', label: 'Read' },
  { path: '/orientation', label: 'Explore' },
  { path: '/discover', label: 'Discover' },
  { path: '/pricing', label: 'Pricing' },
];

export default function Navbar({ onAdminMenuToggle, showAdminMenu }: NavbarProps = {}) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [isReadDropdownOpen, setIsReadDropdownOpen] = useState(false)
  const [isDiscoverDropdownOpen, setIsDiscoverDropdownOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [navbarPages, setNavbarPages] = useState<StaticPage[]>([])
  const [unreadCount, setUnreadCount] = useState<number>(0)
  const [showNotifs, setShowNotifs] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    // Get initial user from localStorage
    const currentUser = getCurrentUser()
    setUser(currentUser)
    
    // Fetch pages that should be displayed in navbar
    const fetchNavbarPages = async () => {
      try {
        const pages = await staticPagesAPI.getNavbarPages()
        setNavbarPages(pages || [])
      } catch (err) {
        console.error('Failed to fetch navbar pages:', err)
        setNavbarPages([])
      }
    }
    
    fetchNavbarPages()
  }, [])

  // Notifications polling (lightweight)
  useEffect(() => {
    let mounted = true
    let interval: any
    async function load() {
      try {
        if (!user) { setUnreadCount(0); setNotifications([]); return }
        const [{ count }, list] = await Promise.all([
          notificationsAPI.unreadCount(),
          notificationsAPI.list(),
        ])
        if (!mounted) return
        setUnreadCount(Number(count || 0))
        setNotifications(Array.isArray(list) ? list.slice(0, 10) : [])
      } catch (err) {
        if (!mounted) return
        console.warn('Notifications unavailable:', err)
        setUnreadCount(0)
        setNotifications([])
      }
    }
    load()
    interval = setInterval(load, 15000)
    return () => { mounted = false; clearInterval(interval) }
  }, [user])

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
      className="bg-black/80 backdrop-blur-md shadow-2xl sticky top-0 z-50 border-b border-gray-800/50"
    >
      {/* Animated background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 via-black to-blue-900/10" />
      
      <div className="relative w-full px-2 sm:px-3 lg:px-4">
        <div className="flex justify-between items-center h-16 gap-2">
          {/* Left side: Admin Menu Toggle + Logo */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* Admin Menu Toggle Button */}
            {user?.role === 'admin' && (
              <motion.button
                onClick={onAdminMenuToggle}
                className="p-2 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 group"
                title="Admin Menu"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Settings className={`h-5 w-5 transition-colors duration-200 ${
                  showAdminMenu ? 'text-purple-400' : 'text-gray-400 group-hover:text-purple-400'
                }`} />
              </motion.button>
            )}
            
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                <Sparkles className="h-8 w-8 text-purple-400 relative z-10" />
              </motion.div>
              <span className="text-2xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                AcademOra
              </span>
            </Link>
          </div>

          {/* Center: Navigation Items */}
          <div className="hidden md:flex items-center space-x-8 flex-1 justify-center min-w-0">
            {/* Permanent Features */}
            {PERMANENT_FEATURES.map((item) => (
              <motion.div
                key={item.path}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
                className="relative"
                onMouseEnter={() => {
                      if (item.path === '/blog') setIsReadDropdownOpen(true)
                      if (item.path === '/discover') setIsDiscoverDropdownOpen(true)
                    }}
                    onMouseLeave={() => {
                      if (item.path === '/blog') setIsReadDropdownOpen(false)
                      if (item.path === '/discover') setIsDiscoverDropdownOpen(false)
                    }}
              >
                {item.path === '/blog' ? (
                  <div className="relative">
                    <Link
                      to="/blog"
                      className="relative text-gray-300 hover:text-white transition-colors px-3 py-2 group flex items-center gap-1"
                      onClick={() => setIsReadDropdownOpen(false)}
                    >
                      <span className="relative z-10 font-medium">{item.label}</span>
                      <ChevronDown className="h-4 w-4" />
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500"
                        initial={{ scaleX: 0 }}
                        whileHover={{ scaleX: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    </Link>
                    
                    {/* Read Dropdown Menu */}
                    <AnimatePresence>
                      {isReadDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-0 mt-2 w-48 bg-gray-900/95 backdrop-blur-md rounded-lg border border-gray-700/50 shadow-2xl"
                        >
                          <Link
                            to="/blog"
                            className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 transition-colors rounded-t-lg"
                            onClick={() => setIsReadDropdownOpen(false)}
                          >
                            <BookOpen className="h-4 w-4" />
                            <span>Articles</span>
                          </Link>
                          <Link
                            to="/blog?view=docs"
                            className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 transition-colors rounded-b-lg"
                            onClick={() => setIsReadDropdownOpen(false)}
                          >
                            <FileText className="h-4 w-4" />
                            <span>Docs</span>
                          </Link>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : item.path === '/discover' ? (
                  <div className="relative">
                    <Link
                      to="/about"
                      className="relative text-gray-300 hover:text-white transition-colors px-3 py-2 group flex items-center gap-1"
                      onClick={() => setIsDiscoverDropdownOpen(false)}
                    >
                      <span className="relative z-10 font-medium">{item.label}</span>
                      <ChevronDown className="h-4 w-4" />
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-500 to-emerald-500"
                        initial={{ scaleX: 0 }}
                        whileHover={{ scaleX: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    </Link>
                    
                    {/* Discover Dropdown Menu */}
                    <AnimatePresence>
                      {isDiscoverDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-0 mt-2 w-56 bg-gray-900/95 backdrop-blur-md rounded-lg border border-gray-700/50 shadow-2xl"
                        >
                          <Link
                            to="/about"
                            className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 transition-colors rounded-t-lg"
                            onClick={() => setIsDiscoverDropdownOpen(false)}
                          >
                            <Info className="h-4 w-4" />
                            <span>About Us</span>
                          </Link>
                          <Link
                            to="/contact"
                            className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                            onClick={() => setIsDiscoverDropdownOpen(false)}
                          >
                            <Phone className="h-4 w-4" />
                            <span>Contact Us</span>
                          </Link>
                          <Link
                            to="/policy"
                            className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                            onClick={() => setIsDiscoverDropdownOpen(false)}
                          >
                            <Shield className="h-4 w-4" />
                            <span>Our Policy</span>
                          </Link>
                          <Link
                            to="/careers"
                            className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 transition-colors rounded-b-lg"
                            onClick={() => setIsDiscoverDropdownOpen(false)}
                          >
                            <Heart className="h-4 w-4" />
                            <span>Join Our Team</span>
                          </Link>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link
                    to={item.path}
                    className="relative text-gray-300 hover:text-white transition-colors px-3 py-2 group"
                  >
                    <span className="relative z-10 font-medium">{item.label}</span>
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500"
                      initial={{ scaleX: 0 }}
                      whileHover={{ scaleX: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  </Link>
                )}
              </motion.div>
            ))}

            {/* Static Pages */}
            {navbarPages.filter(page => page.slug !== 'about').map((page) => (
              <motion.div
                key={page.id}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <Link
                  to={`/${page.slug}`}
                  className="relative text-gray-300 hover:text-white transition-colors px-3 py-2 group"
                >
                  <span className="relative z-10 font-medium">{page.title}</span>
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500"
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Right side: User Actions */}
          <div className="hidden md:flex items-center space-x-3 flex-shrink-0 relative">
            {user && (
              <div className="relative">
                <motion.button
                  onClick={() => setShowNotifs(!showNotifs)}
                  className="relative flex items-center justify-center w-10 h-10 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 group"
                  title="Notifications"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Bell className="h-5 w-5 text-gray-400 group-hover:text-purple-400" />
                  {unreadCount > 0 && (
                    <motion.span 
                      className="absolute -top-1 -right-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] px-1.5 py-0.5 rounded-full"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </motion.span>
                  )}
                </motion.button>
                
                <AnimatePresence>
                  {showNotifs && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-80 bg-gray-900/95 backdrop-blur-md border border-gray-700/50 rounded-lg shadow-2xl z-[60]"
                    >
                      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700/50">
                        <div className="text-sm font-semibold text-white">Notifications</div>
                        <button 
                          className="text-xs text-purple-400 hover:text-purple-300 transition-colors" 
                          onClick={async()=>{ 
                            await notificationsAPI.markAllRead();
                            setUnreadCount(0);
                            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
                          }}
                        >
                          Mark all read
                        </button>
                      </div>
                      <div className="max-h-80 overflow-auto divide-y divide-gray-700/50">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-sm text-gray-400">No notifications</div>
                        ) : notifications.map((n) => {
                          const title = n.title || n.metadata?.title || n.type || 'Notification'
                          const message = n.message || n.metadata?.message
                          const createdAt = n.created_at ? new Date(n.created_at).toLocaleString() : ''

                          return (
                            <div key={n.id} className={`p-4 text-sm space-y-2 ${n.is_read ? '' : 'bg-white/5'}`}>
                              <div className="flex items-center justify-between gap-3">
                                <div className="font-medium text-white truncate" title={title}>{title}</div>
                                {!n.is_read && <span className="text-[10px] uppercase text-purple-300">New</span>}
                              </div>
                              {message && <div className="text-gray-300 leading-snug">{message}</div>}
                              {n.action_url && (
                                <Link
                                  to={n.action_url}
                                  className="inline-flex items-center gap-1 text-xs text-purple-300 hover:text-purple-200 transition-colors"
                                  onClick={() => setShowNotifs(false)}
                                >
                                  View
                                  <ChevronDown className="h-3 w-3 rotate-[-90deg]" />
                                </Link>
                              )}
                              {createdAt && <div className="text-xs text-gray-500">{createdAt}</div>}
                            </div>
                          )
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
            
            {user && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/dashboard"
                  className="relative flex items-center justify-center w-10 h-10 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 group"
                  title="My Profile"
                >
                  {user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  ) : (
                    <User className="h-5 w-5 text-gray-400 group-hover:text-purple-400 transition-colors" />
                  )}
                </Link>
              </motion.div>
            )}

            {user ? (
              <motion.button
                onClick={handleSignOut}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-red-500/20 hover:border-red-500/50 transition-all duration-300 group"
                title="Sign Out"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogOut className="h-5 w-5 text-gray-400 group-hover:text-red-400 transition-colors" />
              </motion.button>
            ) : (
              <>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/login"
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-purple-500/20 hover:border-purple-500/50 transition-all duration-300 group"
                    title="Sign In"
                  >
                    <User className="h-5 w-5 text-gray-400 group-hover:text-purple-400 transition-colors" />
                  </Link>
                </motion.div>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary-500/30 transition hover:from-primary-600 hover:to-primary-700"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Create Account</span>
                </Link>
              </>
            )}
            
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-2">
              <LanguageSwitcher />
            </div>
          </div>

          {/* Mobile menu button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="md:hidden text-gray-300 hover:text-white p-2 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10"
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
            className="md:hidden border-t border-gray-800/50 overflow-hidden bg-black/80 backdrop-blur-md"
          >
            <div className="px-4 pt-4 pb-3 space-y-2">
              {/* Permanent Features */}
              {PERMANENT_FEATURES.map((item) => (
                <motion.div
                  key={item.path}
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  {item.path === '/blog' ? (
                    <div>
                      <Link
                        to="/blog"
                        className="w-full flex items-center justify-between px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-300 font-medium"
                        onClick={() => {
                          setIsReadDropdownOpen(!isReadDropdownOpen)
                        }}
                      >
                        <span>{item.label}</span>
                        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isReadDropdownOpen ? 'rotate-180' : ''}`} />
                      </Link>
                      
                      {/* Mobile Read Dropdown Menu */}
                      <AnimatePresence>
                        {isReadDropdownOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <Link
                              to="/blog"
                              className="flex items-center gap-3 pl-8 pr-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                              onClick={() => {
                                setIsReadDropdownOpen(false)
                                setIsOpen(false)
                              }}
                            >
                              <BookOpen className="h-4 w-4" />
                              <span>Articles</span>
                            </Link>
                            <Link
                              to="/blog?view=docs"
                              className="flex items-center gap-3 pl-8 pr-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                              onClick={() => {
                                setIsReadDropdownOpen(false)
                                setIsOpen(false)
                              }}
                            >
                              <FileText className="h-4 w-4" />
                              <span>Docs</span>
                            </Link>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : item.path === '/discover' ? (
                    <div>
                      <Link
                        to="/about"
                        className="w-full flex items-center justify-between px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-300 font-medium"
                        onClick={() => {
                          setIsDiscoverDropdownOpen(!isDiscoverDropdownOpen)
                        }}
                      >
                        <span>{item.label}</span>
                        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isDiscoverDropdownOpen ? 'rotate-180' : ''}`} />
                      </Link>
                      
                      {/* Mobile Discover Dropdown Menu */}
                      <AnimatePresence>
                        {isDiscoverDropdownOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <Link
                              to="/about"
                              className="flex items-center gap-3 pl-8 pr-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                              onClick={() => {
                                setIsDiscoverDropdownOpen(false)
                                setIsOpen(false)
                              }}
                            >
                              <Info className="h-4 w-4" />
                              <span>About Us</span>
                            </Link>
                            <Link
                              to="/contact"
                              className="flex items-center gap-3 pl-8 pr-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                              onClick={() => {
                                setIsDiscoverDropdownOpen(false)
                                setIsOpen(false)
                              }}
                            >
                              <Phone className="h-4 w-4" />
                              <span>Contact Us</span>
                            </Link>
                            <Link
                              to="/policy"
                              className="flex items-center gap-3 pl-8 pr-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                              onClick={() => {
                                setIsDiscoverDropdownOpen(false)
                                setIsOpen(false)
                              }}
                            >
                              <Shield className="h-4 w-4" />
                              <span>Our Policy</span>
                            </Link>
                            <Link
                              to="/careers"
                              className="flex items-center gap-3 pl-8 pr-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                              onClick={() => {
                                setIsDiscoverDropdownOpen(false)
                                setIsOpen(false)
                              }}
                            >
                              <Heart className="h-4 w-4" />
                              <span>Join Our Team</span>
                            </Link>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <Link
                      to={item.path}
                      className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-300 font-medium"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.label}
                    </Link>
                  )}
                </motion.div>
              ))}

              {/* Static Pages */}
              {navbarPages.filter(page => page.slug !== 'about').map((page) => (
                <motion.div
                  key={page.id}
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    to={`/${page.slug}`}
                    className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-300 font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    {page.title}
                  </Link>
                </motion.div>
              ))}

              <div className="pt-3 border-t border-gray-800/50 mt-3">
                {/* User Actions */}
                {user ? (
                  <>
                    <motion.div
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Link
                        to="/dashboard"
                        className="block w-full text-left px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-300 font-medium flex items-center space-x-3"
                        onClick={() => setIsOpen(false)}
                      >
                        <User className="h-5 w-5" />
                        <span>My Profile</span>
                      </Link>
                    </motion.div>
                    <motion.button
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => {
                        handleSignOut()
                        setIsOpen(false)
                      }}
                      className="block w-full text-left px-4 py-3 text-gray-300 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-300 font-medium flex items-center space-x-3"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>{t('common.signOut')}</span>
                    </motion.button>
                  </>
                ) : (
                  <>
                    <motion.div
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Link
                        to="/login"
                        className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-300 font-medium flex items-center space-x-3"
                        onClick={() => setIsOpen(false)}
                      >
                        <User className="h-5 w-5" />
                        <span>{t('common.login')}</span>
                      </Link>
                    </motion.div>
                    <motion.div
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Link
                        to="/login"
                        className="block px-4 py-3 rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold shadow-lg shadow-primary-500/30 transition-all duration-300 hover:from-primary-600 hover:to-primary-700"
                        onClick={() => setIsOpen(false)}
                      >
                        {t('common.signup')}
                      </Link>
                    </motion.div>
                  </>
                )}
                
                <div className="pt-3 mt-3">
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-3">
                    <LanguageSwitcher />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
