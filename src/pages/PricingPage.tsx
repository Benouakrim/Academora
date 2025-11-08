import { useState } from 'react'
import { 
  Check, X, Star, Users, BookOpen, Award, 
  Globe, ArrowRight, ChevronDown, Sparkles, Zap, Heart, Coffee
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

interface PricingPlan {
  id: string
  name: string
  description: string
  price: number
  yearlyPrice?: number
  features: string[]
  notIncluded?: string[]
  popular?: boolean
  icon: React.ReactNode
  color: string
  buttonText: string
  comingSoon?: boolean
}

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false)
  const [activeFaq, setActiveFaq] = useState<number | null>(null)

  const plans: PricingPlan[] = [
    {
      id: 'free',
      name: 'Free',
      description: 'Perfect for exploring academic options',
      price: 0,
      features: [
        'University search and filtering',
        'Basic university information',
        'Save up to 10 universities',
        'Access to public articles (with ads)',
        'Basic matching algorithm',
        'Community forum access',
        'Email support'
      ],
      notIncluded: [
        'Advanced financial aid calculator',
        'Priority support',
        'Ad-free experience'
      ],
      icon: <BookOpen className="h-6 w-6" />,
      color: 'gray',
      buttonText: 'Get Started Free'
    },
    {
      id: 'plus',
      name: 'Plus',
      description: 'Enhanced features for serious students',
      price: 2.99,
      yearlyPrice: 29.99,
      features: [
        'Everything in Free',
        'Advanced financial aid predictor',
        'Save unlimited universities',
        'Personalized matching scores',
        'Application deadline tracking',
        'Priority email support',
        'Ad-free articles experience'
      ],
      notIncluded: [
        '1-on-1 mentorship sessions',
        'Premium counselor access'
      ],
      icon: <Users className="h-6 w-6" />,
      color: 'blue',
      buttonText: 'Start 7-Day Free Trial',
      popular: true
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'Complete support for dream universities',
      price: 9.99,
      yearlyPrice: 99.99,
      features: [
        'Everything in Plus',
        '1-on-1 mentorship sessions',
        'Premium counselor access',
        'Custom application strategy',
        'Priority application review',
        'Essay review service',
        'Interview preparation',
        'Priority 24/7 support'
      ],
      icon: <Award className="h-6 w-6" />,
      color: 'purple',
      buttonText: 'Coming Soon',
      comingSoon: true
    },
    {
      id: 'ultimate',
      name: 'Ultimate',
      description: 'Maximum support for academic success',
      price: 19.99,
      yearlyPrice: 199.99,
      features: [
        'Everything in Pro',
        'Unlimited mentorship connections',
        'Collaborative saved lists with sharing',
        'Family dashboard and analytics',
        'Custom family application strategy',
        'Dedicated success manager',
        'Exclusive workshops and events'
      ],
      icon: <Globe className="h-6 w-6" />,
      color: 'green',
      buttonText: 'Coming Soon',
      comingSoon: true
    }
  ]

  const faqs = [
    {
      question: 'What\'s included in the Plus plan free trial?',
      answer: 'The 7-day free trial gives you full access to all Plus plan features including the advanced financial aid predictor, unlimited university saves, personalized matching scores, and ad-free articles. No credit card required to start.'
    },
    {
      question: 'Why do articles have ads in the Free plan?',
      answer: 'As a startup focused on making education accessible, we use minimal ads to support our mission and keep the platform free for everyone. Ads will be removed as our revenue stabilizes, ensuring a better experience for all users.'
    },
    {
      question: 'How can I support AcademOra\'s mission?',
      answer: 'You can support us in several ways: upgrading to Plus plan, making a donation through our partnered platforms, or referring friends to join the community. Every contribution helps us improve and expand our services.'
    },
    {
      question: 'When will Pro and Ultimate plans be available?',
      answer: 'Pro and Ultimate plans will be launched as we add more advanced features like mentorship programs and counselor services. We\'re working hard to build these features and expect to launch them in the coming months.'
    },
    {
      question: 'Can I change or cancel my subscription anytime?',
      answer: 'Yes! You can upgrade, downgrade, or cancel your subscription at any time. Changes take effect at the next billing cycle, and you keep access to paid features until the end of your current period.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, debit cards, and PayPal. All payments are processed securely through our payment partners.'
    }
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20">
        {/* Animated Background */}
        <div className="absolute inset-0">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full mix-blend-screen"
              style={{
                left: `${15 + (i * 25)}%`,
                top: `${20 + (i * 15)}%`,
                width: `${150 + (i * 100)}px`,
                height: `${150 + (i * 100)}px`,
                background: `radial-gradient(circle, ${['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'][i]} 0%, transparent 70%)`,
              }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 5 + (i * 0.5),
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.3
              }}
            />
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
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
                <span className="text-sm font-medium text-purple-200">Simple, Transparent Pricing</span>
              </motion.div>
            </div>

            <h1 className="text-5xl md:text-7xl font-black mb-6">
              <span className="bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                Choose Your Plan
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                to Success
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
              Start free, upgrade when you need more power. We're just getting started!
            </p>
            
            {/* Billing Toggle */}
            <motion.div 
              className="flex items-center justify-center gap-6 mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <span className={`text-lg font-medium ${!isYearly ? 'text-white' : 'text-gray-400'}`}>
                Monthly
              </span>
              <motion.button
                onClick={() => setIsYearly(!isYearly)}
                className={`relative inline-flex h-10 w-20 items-center rounded-full transition-colors ${
                  isYearly ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-gray-700'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.span
                  className="inline-block h-8 w-8 transform rounded-full bg-white shadow-lg"
                  animate={{ x: isYearly ? 44 : 4 }}
                  transition={{ duration: 0.2 }}
                />
              </motion.button>
              <span className={`text-lg font-medium ${isYearly ? 'text-white' : 'text-gray-400'}`}>
                Yearly
                <motion.span 
                  className="ml-2 text-sm bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full font-medium"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Save 17%
                </motion.span>
              </span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Startup Message */}
      <section className="py-12 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-2xl border border-blue-500/30 p-8 text-center"
          >
            <Coffee className="h-12 w-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-4">We're Just Getting Started! ☕</h3>
            <p className="text-gray-300 leading-relaxed mb-6">
              AcademOra is a growing platform focused on making education accessible to everyone. 
              We're currently building advanced features and our revenue is still developing. 
              Your support helps us continue our mission and improve the platform for all students.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Heart className="h-4 w-4 text-red-400" />
                <span>Support our mission</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Users className="h-4 w-4 text-blue-400" />
                <span>Refer friends</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Star className="h-4 w-4 text-yellow-400" />
                <span>Help us grow</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {plans.map((plan, index) => {
              const displayPrice = isYearly && plan.yearlyPrice ? plan.yearlyPrice / 12 : plan.price
              const isPaid = plan.price > 0
              
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                  className={`relative group ${plan.comingSoon ? 'opacity-75' : ''}`}
                >
                  <div className={`h-full bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border ${
                    plan.popular ? 'border-purple-500/50' : 'border-gray-700/50'
                  } transition-all duration-300 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/25`}>
                    {plan.popular && !plan.comingSoon && (
                      <motion.div 
                        className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-bl-lg text-sm font-semibold"
                        animate={{ 
                          boxShadow: ["0 0 20px rgba(139, 92, 246, 0.5)", "0 0 40px rgba(139, 92, 246, 0.8)", "0 0 20px rgba(139, 92, 246, 0.5)"]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        Most Popular
                      </motion.div>
                    )}
                    
                    {plan.comingSoon && (
                      <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-4 py-2 rounded-bl-lg text-sm font-semibold">
                        Coming Soon
                      </div>
                    )}
                    
                    <div className="p-8">
                      {/* Plan Header */}
                      <div className="text-center mb-8">
                        <motion.div 
                          className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                            plan.color === 'blue' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' :
                            plan.color === 'purple' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' :
                            plan.color === 'green' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' :
                            'bg-gradient-to-r from-gray-600 to-gray-700 text-white'
                          } ${plan.comingSoon ? 'opacity-50' : ''}`}
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ duration: 0.3 }}
                        >
                          {plan.icon}
                        </motion.div>
                        <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                        <p className="text-gray-400 mb-6">{plan.description}</p>
                        
                        {/* Price */}
                        <div className="mb-6">
                          {!plan.comingSoon ? (
                            <>
                              <div className="flex items-baseline justify-center">
                                <span className="text-5xl font-black bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                  ${displayPrice}
                                </span>
                                <span className="text-gray-400 ml-2">/month</span>
                              </div>
                              {isYearly && plan.yearlyPrice && (
                                <p className="text-sm text-gray-500 mt-2">
                                  ${plan.yearlyPrice} billed annually
                                </p>
                              )}
                              {plan.id === 'plus' && (
                                <p className="text-sm text-green-400 mt-2 font-medium">
                                  7-day free trial
                                </p>
                              )}
                            </>
                          ) : (
                            <div className="flex items-center justify-center">
                              <span className="text-3xl font-bold text-yellow-400">
                                Coming Soon
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Features */}
                      <div className="space-y-4 mb-8">
                        {plan.features.map((feature, index) => (
                          <motion.div 
                            key={index} 
                            className="flex items-start gap-3"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.5 + (index * 0.05) }}
                          >
                            <Check className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-300 text-sm">{feature}</span>
                          </motion.div>
                        ))}
                        
                        {plan.notIncluded?.map((feature, index) => (
                          <div key={index} className="flex items-start gap-3 opacity-40">
                            <X className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-500 text-sm line-through">{feature}</span>
                          </div>
                        ))}
                      </div>

                      {/* CTA Button */}
                      <motion.button
                        className={`w-full py-3 px-6 rounded-full font-semibold transition-all duration-300 ${
                          plan.comingSoon
                            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                            : plan.popular
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-2xl hover:shadow-purple-500/25 text-white'
                            : plan.color === 'purple'
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-2xl hover:shadow-purple-500/25 text-white'
                            : plan.color === 'green'
                            ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-2xl hover:shadow-green-500/25 text-white'
                            : isPaid
                            ? 'bg-gradient-to-r from-gray-700 to-gray-800 hover:bg-gray-600 text-white'
                            : 'bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white'
                        }`}
                        whileHover={plan.comingSoon ? {} : { scale: 1.02 }}
                        whileTap={plan.comingSoon ? {} : { scale: 0.98 }}
                        disabled={plan.comingSoon}
                      >
                        {plan.buttonText}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section className="py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
                Support Our Mission
              </span>
            </h2>
            <p className="text-xl text-gray-300">
              Help us make education accessible for everyone
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -10 }}
              className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8 hover:border-red-500/50 transition-all duration-300"
            >
              <Heart className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">Make a Donation</h3>
              <p className="text-gray-300 mb-6">
                Direct support helps us maintain and improve the platform for all students.
              </p>
              <div className="space-y-2">
                <a 
                  href="https://www.buymeacoffee.com/academora" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block w-full py-2 px-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-yellow-300 hover:bg-yellow-500/30 transition-all duration-300 text-center"
                >
                  Buy Us a Coffee
                </a>
                <a 
                  href="https://paypal.me/academora" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block w-full py-2 px-4 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-300 hover:bg-blue-500/30 transition-all duration-300 text-center"
                >
                  Donate via PayPal
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -10 }}
              className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8 hover:border-green-500/50 transition-all duration-300"
            >
              <Users className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">Refer Friends</h3>
              <p className="text-gray-300 mb-6">
                Share AcademOra with your friends and help grow our community of learners.
              </p>
              <motion.button
                className="w-full py-2 px-4 bg-green-500/20 border border-green-500/30 rounded-lg text-green-300 hover:bg-green-500/30 transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'AcademOra - Find Your Perfect University',
                      text: 'Check out AcademOra! It\'s helping me find my dream university.',
                      url: window.location.origin
                    })
                  } else {
                    navigator.clipboard.writeText(window.location.origin)
                    alert('Link copied to clipboard!')
                  }
                }}
              >
                Share with Friends
              </motion.button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ y: -10 }}
              className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8 hover:border-purple-500/50 transition-all duration-300"
            >
              <Star className="h-12 w-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">Upgrade to Plus</h3>
              <p className="text-gray-300 mb-6">
                Get premium features and directly support platform development.
              </p>
              <Link
                to="/register"
                className="block w-full py-2 px-4 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-300 hover:bg-purple-500/30 transition-all duration-300 text-center"
              >
                Start Guided Setup
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Frequently Asked Questions
              </span>
            </h2>
            <p className="text-xl text-gray-300">
              Got questions? We've got answers
            </p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden"
              >
                <motion.button
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-white/5 transition-all duration-300"
                  whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                >
                  <span className="font-semibold text-white text-lg">{faq.question}</span>
                  <motion.div
                    animate={{ rotate: activeFaq === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="h-6 w-6 text-purple-400" />
                  </motion.div>
                </motion.button>
                <AnimatePresence>
                  {activeFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-8 pb-6"
                    >
                      <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-purple-900/50 via-black to-pink-900/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white/5 backdrop-blur-md rounded-3xl p-12 border border-white/10"
          >
            <div className="mb-8">
              <Zap className="w-16 h-16 mx-auto text-yellow-400 mb-4" />
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  Start Your Journey Today
                </span>
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Join thousands of students finding their perfect academic match
              </p>
            </div>
            
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <Link
                to="/register"
                className="group px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full font-semibold text-lg hover:shadow-2xl hover:shadow-green-500/25 transition-all duration-300 flex items-center justify-center gap-2"
              >
                Begin Guided Registration
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a 
                href="https://www.buymeacoffee.com/academora" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-8 py-4 border border-white/30 rounded-full font-semibold text-lg hover:bg-white/10 transition-all duration-300 backdrop-blur-sm flex items-center justify-center gap-2"
              >
                <Coffee className="w-5 h-5" />
                Support Us
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
