import { useState } from 'react'
import { 
  Check, X, Star, Users, Sparkles, Zap, Heart, 
  TrendingUp, Shield, Crown, Rocket, Gift, ArrowRight,
  ChevronDown, Globe, Award, Target
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

interface PricingPlan {
  id: string
  name: string
  tagline: string
  description: string
  price: number
  yearlyPrice?: number
  features: string[]
  notIncluded?: string[]
  highlighted?: boolean
  icon: React.ReactNode
  gradient: string
  buttonText: string
  comingSoon?: boolean
  badge?: string
}

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false)
  const [activeFaq, setActiveFaq] = useState<number | null>(null)

  const plans: PricingPlan[] = [
    {
      id: 'free',
      name: 'Explorer',
      tagline: 'Start Your Journey',
      description: 'Perfect for discovering your academic path',
      price: 0,
      features: [
        'Browse 1000+ universities worldwide',
        'Advanced search & smart filters',
        'Save up to 10 favorite universities',
        'Basic university comparison (up to 3)',
        'Access public articles & guides',
        'Join our student community',
        'University application deadlines',
        'Email support within 48 hours'
      ],
      notIncluded: [
        'Advanced AI matching',
        'Financial aid predictions',
        'Unlimited saves & comparisons'
      ],
      icon: <Rocket className="w-6 h-6" />,
      gradient: 'from-blue-500 to-cyan-500',
      buttonText: 'Start Free Forever'
    },
    {
      id: 'plus',
      name: 'Plus',
      tagline: 'Power Up Your Search',
      description: 'Advanced tools for serious applicants',
      price: 2.99,
      yearlyPrice: 29.99,
      badge: '7-Day Free Trial',
      features: [
        'Everything in Explorer, plus:',
        'AI-powered university matching',
        'Save unlimited universities',
        'Compare up to 5 universities',
        'Advanced financial aid predictor',
        'Personalized application timeline',
        'Interactive data visualizations',
        'Ad-free experience',
        'Email & chat support within 24hrs',
        'Export comparison reports (PDF)'
      ],
      icon: <Star className="w-6 h-6" />,
      gradient: 'from-purple-500 via-pink-500 to-rose-500',
      buttonText: 'Try Plus Free',
      highlighted: true
    },
    {
      id: 'pro',
      name: 'Pro',
      tagline: 'Expert Guidance',
      description: 'Complete support for dream universities',
      price: 9.99,
      yearlyPrice: 99.99,
      features: [
        'Everything in Plus, plus:',
        'Monthly 1-on-1 counselor sessions',
        'Personalized application strategy',
        'Essay review & feedback (2/month)',
        'Interview preparation resources',
        'Scholarship opportunity alerts',
        'University ambassador connections',
        'Priority support (response in 2hrs)',
        'Custom comparison analytics',
        'Family dashboard access'
      ],
      icon: <Crown className="w-6 h-6" />,
      gradient: 'from-amber-500 to-orange-500',
      buttonText: 'Coming Soon',
      comingSoon: true
    },
    {
      id: 'ultimate',
      name: 'Ultimate',
      tagline: 'VIP Experience',
      description: 'White-glove service for maximum success',
      price: 19.99,
      yearlyPrice: 199.99,
      features: [
        'Everything in Pro, plus:',
        'Weekly 1-on-1 mentorship sessions',
        'Unlimited essay reviews',
        'Mock interview sessions',
        'Direct admissions office connections',
        'Dedicated success manager',
        'Custom research projects',
        'Priority application review service',
        'Exclusive webinars & workshops',
        'VIP 24/7 priority support',
        'Lifetime career guidance access'
      ],
      icon: <Gift className="w-6 h-6" />,
      gradient: 'from-emerald-500 to-teal-500',
      buttonText: 'Coming Soon',
      comingSoon: true
    }
  ]

  const faqs = [
    {
      question: 'What happens after my 7-day Plus trial ends?',
      answer: 'After your trial, you can choose to continue with Plus at $2.99/month or $29.99/year. If you don\'t subscribe, you\'ll automatically return to our generous Explorer (free) plan with no interruption to your saved data.'
    },
    {
      question: 'Can I upgrade or downgrade my plan anytime?',
      answer: 'Absolutely! You can upgrade, downgrade, or cancel your subscription at any time. Changes take effect immediately for upgrades, or at the next billing cycle for downgrades. You always keep your saved data.'
    },
    {
      question: 'Why are some features "Coming Soon"?',
      answer: 'AcademOra is a growing platform, and we\'re actively building advanced features like counselor matching, essay reviews, and interview prep. Pro and Ultimate plans will launch as these features become available. Current Plus subscribers will get early access!'
    },
    {
      question: 'Do you offer student or educator discounts?',
      answer: 'Yes! We offer a 20% discount for verified students with a .edu email and a 30% discount for educators and counselors. Contact our support team with your credentials to receive your discount code.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, Mastercard, American Express, Discover), debit cards, and PayPal. All payments are securely processed through Stripe with industry-standard encryption.'
    },
    {
      question: 'Is my data safe and private?',
      answer: 'Absolutely. We never sell your data to third parties. Your information is encrypted and stored securely. We only use your data to provide personalized recommendations and improve our platform. Read our Privacy Policy for full details.'
    },
    {
      question: 'What if I\'m not satisfied with my subscription?',
      answer: 'We offer a 30-day money-back guarantee for all paid plans. If you\'re not completely satisfied, contact us within 30 days of your purchase for a full refund, no questions asked.'
    },
    {
      question: 'How can I support AcademOra as a startup?',
      answer: 'We appreciate your support! You can help by: upgrading to Plus, referring friends (get rewards!), leaving reviews, making a donation, or spreading the word on social media. Every bit helps us continue our mission of making education accessible.'
    }
  ]

  const stats = [
    { label: 'Students Helped', value: '10,000+', icon: <Users className="w-6 h-6" /> },
    { label: 'Universities Listed', value: '1,000+', icon: <Globe className="w-6 h-6" /> },
    { label: 'Success Rate', value: '94%', icon: <TrendingUp className="w-6 h-6" /> },
    { label: 'Countries Covered', value: '50+', icon: <Award className="w-6 h-6" /> }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-30">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full blur-3xl"
              style={{
                left: `${10 + (i * 15)}%`,
                top: `${10 + (i * 12)}%`,
                width: `${200 + (i * 50)}px`,
                height: `${200 + (i * 50)}px`,
                background: `radial-gradient(circle, ${
                  ['#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#ef4444'][i]
                } 0%, transparent 70%)`,
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 8 + (i * 2),
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.5
              }}
            />
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            {/* Badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-6 py-3 mb-8 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-xl rounded-full border border-purple-500/30"
              animate={{ 
                boxShadow: [
                  "0 0 20px rgba(168, 85, 247, 0.4)", 
                  "0 0 40px rgba(236, 72, 153, 0.6)", 
                  "0 0 20px rgba(168, 85, 247, 0.4)"
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Sparkles className="w-5 h-5 text-purple-300" />
              <span className="text-sm font-semibold text-white">
                Transparent Pricing • No Hidden Fees
              </span>
            </motion.div>

            {/* Main Heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 leading-tight">
              <span className="block bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
                Choose Your Path
              </span>
              <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 bg-clip-text text-transparent">
                to Academic Success
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Start with our <span className="text-green-400 font-semibold">free plan forever</span>, 
              or unlock powerful tools with <span className="text-purple-400 font-semibold">Plus</span> — 
              now with a 7-day free trial!
            </p>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-12 max-w-4xl mx-auto"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
                >
                  <div className="flex justify-center mb-3 text-purple-400">
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
            
            {/* Billing Toggle */}
            <motion.div 
              className="inline-flex items-center gap-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full p-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <button
                onClick={() => setIsYearly(false)}
                className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 ${
                  !isYearly 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 relative ${
                  isYearly 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Yearly
                <motion.span 
                  className="absolute -top-2 -right-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-2 py-1 rounded-full font-bold"
                  animate={{ scale: [1, 1.1, 1], rotate: [-5, 5, -5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Save 17%
                </motion.span>
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan, index) => {
              const displayPrice = isYearly && plan.yearlyPrice ? plan.yearlyPrice / 12 : plan.price
              const totalYearlyPrice = isYearly && plan.yearlyPrice ? plan.yearlyPrice : plan.price * 12
              
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -8, scale: plan.highlighted ? 1.02 : 1 }}
                  className={`relative ${plan.highlighted ? 'lg:scale-105 z-10' : ''}`}
                >
                  {/* Card */}
                  <div className={`relative h-full bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-xl rounded-3xl ${
                    plan.highlighted 
                      ? 'shadow-2xl shadow-purple-500/20 ring-2 ring-purple-500/50' 
                      : ''
                  } overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10`}>
                    
                    {/* Badge */}
                    {plan.badge && !plan.comingSoon && (
                      <div className="absolute top-0 left-0 right-0">
                        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white text-center py-2 px-4 text-sm font-bold">
                          <Sparkles className="w-4 h-4 inline mr-2" />
                          {plan.badge}
                        </div>
                      </div>
                    )}
                    
                    {plan.comingSoon && (
                      <div className="absolute top-0 left-0 right-0">
                        <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white text-center py-2 px-4 text-sm font-bold">
                          <Zap className="w-4 h-4 inline mr-2" />
                          Coming Soon
                        </div>
                      </div>
                    )}
                    
                    <div className={`p-8 ${plan.badge || plan.comingSoon ? 'pt-16' : ''}`}>
                      {/* Icon & Name */}
                      <div className="mb-6">
                        <motion.div 
                          className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${plan.gradient} text-white mb-4 shadow-lg`}
                          whileHover={{ rotate: 360, scale: 1.1 }}
                          transition={{ duration: 0.6 }}
                        >
                          {plan.icon}
                        </motion.div>
                        <h3 className="text-2xl font-bold text-white mb-1">{plan.name}</h3>
                        <div className="text-sm font-semibold bg-gradient-to-r from-gray-400 to-gray-500 bg-clip-text text-transparent mb-2">
                          {plan.tagline}
                        </div>
                        <p className="text-gray-400 text-sm">{plan.description}</p>
                      </div>

                      {/* Price */}
                      <div className="mb-8">
                        {!plan.comingSoon ? (
                          <>
                            <div className="flex items-baseline mb-2">
                              <span className="text-5xl font-black bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                ${displayPrice}
                              </span>
                              <span className="text-gray-500 ml-2 font-medium">/month</span>
                            </div>
                            {isYearly && plan.yearlyPrice && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">
                                  ${totalYearlyPrice}/year
                                </span>
                                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full font-semibold">
                                  Save ${((plan.price * 12) - totalYearlyPrice).toFixed(0)}
                                </span>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-3xl font-bold text-amber-400">
                            Launching Soon
                          </div>
                        )}
                      </div>

                      {/* Features */}
                      <div className="space-y-3 mb-8">
                        {plan.features.map((feature, idx) => (
                          <motion.div 
                            key={idx} 
                            className="flex items-start gap-3"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.6 + (idx * 0.05) }}
                          >
                            <div className="flex-shrink-0 mt-0.5">
                              <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${plan.gradient} flex items-center justify-center`}>
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            </div>
                            <span className="text-gray-300 text-sm leading-tight">{feature}</span>
                          </motion.div>
                        ))}
                        
                        {plan.notIncluded?.map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-3 opacity-30">
                            <div className="flex-shrink-0 mt-0.5">
                              <div className="w-5 h-5 rounded-full bg-gray-700 flex items-center justify-center">
                                <X className="w-3 h-3 text-gray-500" />
                              </div>
                            </div>
                            <span className="text-gray-600 text-sm leading-tight line-through">{feature}</span>
                          </div>
                        ))}
                      </div>

                      {/* CTA Button */}
                      <Link
                        to={plan.comingSoon ? '#' : '/register'}
                        onClick={(e) => plan.comingSoon && e.preventDefault()}
                      >
                        <motion.button
                          className={`w-full py-4 px-6 rounded-xl font-bold text-sm transition-all duration-300 ${
                            plan.comingSoon
                              ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                              : plan.highlighted
                              ? `bg-gradient-to-r ${plan.gradient} text-white shadow-lg hover:shadow-2xl hover:shadow-purple-500/30`
                              : plan.id === 'free'
                              ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                              : `bg-gradient-to-r ${plan.gradient} text-white hover:shadow-xl`
                          }`}
                          whileHover={plan.comingSoon ? {} : { scale: 1.02 }}
                          whileTap={plan.comingSoon ? {} : { scale: 0.98 }}
                          disabled={plan.comingSoon}
                        >
                          <span className="flex items-center justify-center gap-2">
                            {plan.buttonText}
                            {!plan.comingSoon && <ArrowRight className="w-4 h-4" />}
                          </span>
                        </motion.button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16 flex flex-wrap items-center justify-center gap-8 text-gray-400 text-sm"
          >
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-400" />
              <span>Secure Payment</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-400" />
              <span>30-Day Money Back</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-400" />
              <span>Cancel Anytime</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gradient-to-b from-gray-900 via-black to-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Frequently Asked Questions
              </span>
            </h2>
            <p className="text-xl text-gray-400">
              Everything you need to know about our pricing
            </p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="relative bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10"
              >
                <motion.button
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="w-full px-8 py-6 text-left flex items-center justify-between group"
                  whileHover={{ backgroundColor: "rgba(139, 92, 246, 0.05)" }}
                >
                  <span className="font-semibold text-white text-lg pr-8 group-hover:text-purple-300 transition-colors">{faq.question}</span>
                  <motion.div
                    animate={{ rotate: activeFaq === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0"
                  >
                    <ChevronDown className="w-6 h-6 text-purple-400" />
                  </motion.div>
                </motion.button>
                <AnimatePresence>
                  {activeFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-8 pb-6">
                        <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-black to-pink-900/30" />
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            {/* Badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-6 py-3 mb-8 bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-xl rounded-full border border-green-500/30"
              animate={{ 
                boxShadow: [
                  "0 0 20px rgba(16, 185, 129, 0.3)", 
                  "0 0 40px rgba(16, 185, 129, 0.5)", 
                  "0 0 20px rgba(16, 185, 129, 0.3)"
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Rocket className="w-5 h-5 text-green-300" />
              <span className="text-sm font-semibold text-white">
                Ready to Start Your Journey?
              </span>
            </motion.div>

            {/* Heading */}
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 leading-tight">
              <span className="block bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent mb-2">
                Begin Your Search Today
              </span>
              <span className="block bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Start Free Forever
              </span>
            </h2>
            
            <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Join thousands of students who found their perfect university match with AcademOra. 
              No credit card required. Upgrade anytime.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/register">
                <motion.button
                  className="group px-10 py-5 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full font-bold text-lg text-white shadow-2xl shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-300 flex items-center gap-3"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
              
              <Link to="/universities">
                <motion.button
                  className="px-10 py-5 bg-white/10 backdrop-blur-xl border-2 border-white/20 rounded-full font-bold text-lg text-white hover:bg-white/20 hover:border-white/30 transition-all duration-300"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Browse Universities
                </motion.button>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-gray-400 text-sm">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-400" />
                <span>100% Secure</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                <span>4.9/5 Rating</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                <span>10,000+ Students</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-400" />
                <span>Instant Access</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
