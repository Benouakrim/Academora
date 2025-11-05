import { Link } from 'react-router-dom'
import { BookOpen, GraduationCap, Globe, FileText, ArrowRight, CheckCircle, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import { blogAPI } from '../lib/api'
import { motion } from 'framer-motion'

export default function HomePage() {
  const { t } = useTranslation()
  const [articles, setArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const data = await blogAPI.getArticles()
        setArticles(Array.isArray(data) ? data : [])
        setError(null)
      } catch (e: any) {
        setError(e?.message || 'Failed to load articles')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-20 left-10 w-72 h-72 bg-primary-400/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-96 h-96 bg-primary-300/20 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.4, 0.2, 0.4],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 drop-shadow-lg"
              >
                {t('home.heroTitle')}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                className="text-xl md:text-2xl mb-8 text-primary-100/90 max-w-2xl mx-auto lg:mx-0"
              >
                {t('home.heroSubtitle')}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
              <Link
                to="/orientation"
                className="relative group btn-primary bg-white text-primary-600 hover:bg-gray-100 text-lg px-8 py-3 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden"
              >
                <span className="relative z-10">{t('home.exploreOrientation')}</span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary-400 to-primary-500 opacity-0 group-hover:opacity-100"
                  initial={false}
                  transition={{ duration: 0.3 }}
                />
              </Link>
              <Link
                to="/blog"
                className="relative group btn-secondary border-white text-white hover:bg-white/10 text-lg px-8 py-3 rounded-full border-2 backdrop-blur-sm bg-white/5 transition-all duration-300 hover:bg-white/20"
              >
                {t('home.readBlog')}
              </Link>
            </motion.div>
            </div>
            
            {/* Hero Image */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
              className="relative hidden lg:block"
            >
              <div className="relative z-10">
                <img
                  src="https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
                  alt="Education and learning"
                  className="rounded-2xl shadow-2xl w-full h-auto object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x600/dc2626/ffffff?text=AcademOra'
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-900/50 to-transparent rounded-2xl" />
              </div>
              <motion.div
                className="absolute -bottom-6 -right-6 w-full h-full bg-primary-400/30 rounded-2xl blur-2xl -z-10"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Search + Latest Articles */}
      <section className="relative py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Centered big search bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center mb-10"
          >
            <div className="relative group">
              <motion.div
                className="absolute left-4 top-1/2 -translate-y-1/2"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Search className="h-6 w-6 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
              </motion.div>
              <input
                type="text"
                placeholder={t('common.search') || 'Search articles...'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-full border-2 border-gray-200 shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg transition-all duration-300 hover:shadow-xl bg-white/80 backdrop-blur-sm"
              />
            </div>
            <p className="text-sm text-gray-500 mt-3">Type a keyword to filter the latest articles</p>
          </motion.div>

          {/* Articles grid: 4 per row, 3 rows (12) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-6 flex items-center justify-between"
          >
            <h2 className="text-2xl font-extrabold text-gray-900 bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
              Latest Articles
            </h2>
            <Link
              to="/blog"
              className="relative group text-primary-600 hover:text-primary-700 font-semibold inline-flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 shadow-sm"
            >
              {error}
            </motion.div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <motion.div
                className="inline-block rounded-full h-10 w-10 border-4 border-primary-200 border-t-primary-600"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {articles
                .filter(a => {
                  if (!search) return true
                  const q = search.toLowerCase()
                  return (
                    (a.title || '').toLowerCase().includes(q) ||
                    (a.excerpt || '').toLowerCase().includes(q) ||
                    (a.category || '').toLowerCase().includes(q)
                  )
                })
                .slice(0, 12)
                .map((a, index) => (
                  <motion.article
                    key={a.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -8, transition: { duration: 0.2 } }}
                    className="card group border border-gray-200 hover:border-primary-200 hover:shadow-2xl transition-all duration-300 rounded-xl overflow-hidden bg-white"
                  >
                    {a.featured_image && (
                      <div className="mb-3 rounded-lg overflow-hidden">
                        <motion.img
                          src={a.featured_image}
                          alt={a.title}
                          className="w-full h-40 object-cover"
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    )}
                    <div className="mb-2">
                      <span className="inline-block bg-gradient-to-r from-primary-100 to-primary-50 text-primary-700 text-xs font-semibold px-3 py-1 rounded-full border border-primary-200 shadow-sm">
                        {a.category}
                      </span>
                    </div>
                    <h3 className="text-lg font-extrabold mb-2 text-gray-900 group-hover:text-primary-600 transition-colors">
                      <Link to={`/blog/${a.slug}`}>{a.title}</Link>
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-3 mb-3 leading-relaxed">{a.excerpt}</p>
                    <Link
                      to={`/blog/${a.slug}`}
                      className="text-primary-600 hover:text-primary-700 font-semibold text-sm inline-flex items-center gap-1 group/ln transition"
                    >
                      <span>Read More</span>
                      <ArrowRight className="h-4 w-4 group-hover/ln:translate-x-2 transition-transform duration-300" />
                    </Link>
                  </motion.article>
                ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
              {t('home.featuresTitle')}
            </h2>
            <motion.div
              className="w-24 h-1 bg-gradient-to-r from-primary-600 to-primary-800 rounded mx-auto mb-4"
              initial={{ width: 0 }}
              whileInView={{ width: 96 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            />
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              {t('home.featuresSubtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { 
                icon: GraduationCap, 
                title: t('home.fieldsTitle'), 
                desc: t('home.fieldsDescription'), 
                link: '/orientation/fields',
                image: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
              },
              { 
                icon: BookOpen, 
                title: t('home.schoolsTitle'), 
                desc: t('home.schoolsDescription'), 
                link: '/orientation/schools',
                image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
              },
              { 
                icon: Globe, 
                title: t('home.studyAbroadTitle'), 
                desc: t('home.studyAbroadDescription'), 
                link: '/orientation/study-abroad',
                image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80'
              },
              { 
                icon: FileText, 
                title: t('home.proceduresTitle'), 
                desc: t('home.proceduresDescription'), 
                link: '/orientation/procedures',
                image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="card text-center border border-gray-200 hover:border-primary-200 hover:shadow-2xl transition-all duration-300 rounded-xl relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  {/* Feature Image */}
                  <div className="mb-4 rounded-lg overflow-hidden relative h-32">
                    <motion.img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://via.placeholder.com/400x300/dc2626/ffffff?text=${encodeURIComponent(item.title)}`
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    <motion.div
                      className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <item.icon className="h-5 w-5 text-primary-600" />
                    </motion.div>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900">{item.title}</h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">{item.desc}</p>
                  <Link
                    to={item.link}
                    className="text-primary-600 hover:text-primary-700 font-semibold flex items-center justify-center transition group/ln"
                  >
                    {t('common.readMore')} <ArrowRight className="h-4 w-4 ml-1 group-hover/ln:translate-x-2 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative py-20 bg-gradient-to-br from-gray-50 via-white to-primary-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Benefits Image */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-2 lg:order-1"
            >
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Students learning together"
                  className="rounded-2xl shadow-2xl w-full h-auto object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x600/dc2626/ffffff?text=Students'
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-900/30 to-transparent rounded-2xl" />
                <motion.div
                  className="absolute -top-6 -left-6 w-24 h-24 bg-primary-400/40 rounded-full blur-2xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.4, 0.6, 0.4],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-1 lg:order-2"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                {t('home.whyChooseTitle')}
              </h2>
              <div className="space-y-4">
                {[
                  { title: t('home.resourcesTitle'), desc: t('home.resourcesDescription') },
                  { title: t('home.articlesTitle'), desc: t('home.articlesDescription') },
                  { title: t('home.comparisonTitle'), desc: t('home.comparisonDescription') },
                  { title: t('home.dashboardTitle'), desc: t('home.dashboardDescription') },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-start group"
                  >
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CheckCircle className="h-6 w-6 text-primary-600 mr-3 mt-1 flex-shrink-0" />
                    </motion.div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1 text-gray-900">{item.title}</h3>
                      <p className="text-gray-600">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            {/* Get Started Card with Image */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
              className="bg-white rounded-xl shadow-2xl border border-gray-200 relative overflow-hidden order-2 lg:order-2"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Get started"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x400/dc2626/ffffff?text=Get+Started'
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent" />
                <h3 className="absolute bottom-4 left-4 right-4 text-2xl font-extrabold text-white">{t('home.getStartedTitle')}</h3>
              </div>
              <div className="p-8 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-transparent opacity-50" />
                <div className="relative">
                  <p className="text-gray-600 mb-6">{t('home.getStartedDescription')}</p>
                  <Link
                    to="/signup"
                    className="relative group btn-primary text-lg px-6 py-3 inline-block rounded-full shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    <span className="relative z-10">{t('home.createAccount')}</span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-700"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white overflow-hidden">
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-10 left-10 w-64 h-64 bg-primary-400/30 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-10 right-10 w-80 h-80 bg-primary-300/30 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.4, 0.2, 0.4],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-extrabold mb-4"
          >
            {t('home.ctaTitle')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-primary-100/90 mb-8"
          >
            {t('home.ctaDescription')}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to="/orientation"
              className="relative group btn-primary bg-white text-primary-600 hover:bg-gray-100 text-lg px-8 py-3 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 inline-block"
            >
              {t('home.exploreResources')}
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

