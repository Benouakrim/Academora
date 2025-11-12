import { motion } from 'framer-motion'
import SEO from '../components/SEO'
import { Shield, Lock, Eye, Cookie, User, Database, Mail, Settings } from 'lucide-react'
import { useState } from 'react'

export default function PolicyPage() {
  const [activeSection, setActiveSection] = useState('privacy')

  const sections = [
    { id: 'privacy', title: 'Privacy Policy', icon: Shield },
    { id: 'cookies', title: 'Cookie Policy', icon: Cookie },
    { id: 'terms', title: 'Terms of Service', icon: Lock },
    { id: 'data', title: 'Data Protection', icon: Database }
  ]

  const renderContent = () => {
    switch(activeSection) {
      case 'privacy':
        return <PrivacyPolicy />
      case 'cookies':
        return <CookiePolicy />
      case 'terms':
        return <TermsOfService />
      case 'data':
        return <DataProtection />
      default:
        return <PrivacyPolicy />
    }
  }

  return (
    <div className="relative bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] min-h-screen py-20 overflow-hidden">
      <SEO title="Privacy & Policy - AcademOra" description="Comprehensive privacy policy, cookie policy, terms of service and data protection information for AcademOra" />
      
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
              <Shield className="w-4 h-4 text-yellow-300" />
              <span className="text-sm font-medium text-yellow-200">Our Policies</span>
            </motion.div>
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-6">
            <span className="bg-gradient-to-r from-white via-yellow-200 to-orange-200 bg-clip-text text-transparent">
              Privacy & Policy
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
            Your privacy and security are our top priorities. Learn how we protect your data.
          </p>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex flex-wrap justify-center gap-2 bg-gray-900/50 backdrop-blur-sm rounded-2xl p-2 border border-gray-800/50">
            {sections.map((section) => {
              const Icon = section.icon
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    activeSection === section.id
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {section.title}
                </button>
              )
            })}
          </div>
        </motion.div>

        {/* Content Area */}
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-3xl border border-gray-700/50 p-8 md:p-12"
        >
          {renderContent()}
        </motion.div>
      </div>
    </div>
  )
}

function PrivacyPolicy() {
  return (
    <div className="space-y-8">
      <div className="text-center mb-12">
        <Shield className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-white mb-4">Privacy Policy</h2>
        <p className="text-gray-300 text-lg">Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="space-y-6 text-gray-300">
        <section>
          <h3 className="text-xl font-semibold text-white mb-3">1. Information We Collect</h3>
          <p className="mb-4">We collect information you provide directly to us, such as when you create an account, use our services, or contact us.</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Account information (name, email, password)</li>
            <li>Profile data and preferences</li>
            <li>Academic and professional information</li>
            <li>Communication with universities and other users</li>
            <li>Usage data and analytics information</li>
          </ul>
        </section>

        <section>
          <h3 className="text-xl font-semibold text-white mb-3">2. Eligibility & Age Requirement</h3>
          <p>AcademOra is designed for users who are at least 16 years old. By accessing our services, you confirm that you meet this minimum age requirement and, where applicable, have the permission of a parent or legal guardian.</p>
        </section>

        <section>
          <h3 className="text-xl font-semibold text-white mb-3">3. How We Use Your Information</h3>
          <p className="mb-4">We use the information we collect to provide, maintain, and improve our services:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>To create and manage your account</li>
            <li>To connect you with educational opportunities</li>
            <li>To personalize your experience</li>
            <li>To communicate with you about our services</li>
            <li>To analyze usage and improve our platform</li>
          </ul>
        </section>

        <section>
          <h3 className="text-xl font-semibold text-white mb-3">4. Information Sharing</h3>
          <p className="mb-4">We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>With universities you choose to connect with</li>
            <li>With service providers who assist in operating our platform</li>
            <li>When required by law or to protect our rights</li>
          </ul>
        </section>

        <section>
          <h3 className="text-xl font-semibold text-white mb-3">5. Data Security</h3>
          <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
        </section>

        <section>
          <h3 className="text-xl font-semibold text-white mb-3">6. Your Rights</h3>
          <p className="mb-4">You have the right to:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Access and update your personal information</li>
            <li>Delete your account and associated data</li>
            <li>Opt out of marketing communications</li>
            <li>Request a copy of your data</li>
          </ul>
        </section>
      </div>
    </div>
  )
}

function CookiePolicy() {
  return (
    <div className="space-y-8">
      <div className="text-center mb-12">
        <Cookie className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-white mb-4">Cookie Policy</h2>
        <p className="text-gray-300 text-lg">Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="space-y-6 text-gray-300">
        <section>
          <h3 className="text-xl font-semibold text-white mb-3">What Are Cookies?</h3>
          <p>Cookies are small text files that are stored on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and tracking usage patterns.</p>
        </section>

        <section>
          <h3 className="text-xl font-semibold text-white mb-3">Types of Cookies We Use</h3>
          
          <div className="space-y-4">
            <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-5 h-5 text-green-400" />
                <h4 className="font-semibold text-white">Essential Cookies</h4>
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">Always Required</span>
              </div>
              <p className="text-sm">Required for the website to function properly, including authentication and security features.</p>
            </div>

            <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
              <div className="flex items-center gap-3 mb-2">
                <User className="w-5 h-5 text-blue-400" />
                <h4 className="font-semibold text-white">Functional Cookies</h4>
                <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">Optional</span>
              </div>
              <p className="text-sm">Enable enhanced functionality and personalization, such as language preferences and user settings.</p>
            </div>

            <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
              <div className="flex items-center gap-3 mb-2">
                <Settings className="w-5 h-5 text-purple-400" />
                <h4 className="font-semibold text-white">Preference Cookies</h4>
                <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">Optional</span>
              </div>
              <p className="text-sm">Remember your user preferences and settings to provide a more personalized experience.</p>
            </div>

            <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
              <div className="flex items-center gap-3 mb-2">
                <Eye className="w-5 h-5 text-orange-400" />
                <h4 className="font-semibold text-white">Analytics Cookies</h4>
                <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded">Optional</span>
              </div>
              <p className="text-sm">Help us understand how visitors interact with our website by collecting and reporting information anonymously.</p>
            </div>

            <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
              <div className="flex items-center gap-3 mb-2">
                <Mail className="w-5 h-5 text-red-400" />
                <h4 className="font-semibold text-white">Marketing Cookies</h4>
                <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">Optional</span>
              </div>
              <p className="text-sm">Used to track visitors across websites to display relevant advertisements and marketing campaigns.</p>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-xl font-semibold text-white mb-3">Managing Your Cookie Preferences</h3>
          <p className="mb-4">You have several options to manage cookies:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Use our cookie consent banner when you first visit the site</li>
            <li>Click the cookie icon in the bottom-right corner to change preferences anytime</li>
            <li>Adjust your browser settings to block or delete cookies</li>
            <li>Contact us at privacy@academora.com for assistance</li>
          </ul>
        </section>

        <section>
          <h3 className="text-xl font-semibold text-white mb-3">Cookie Duration</h3>
          <p className="mb-4">Different cookies have different lifespans:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>Session cookies:</strong> Deleted when you close your browser</li>
            <li><strong>Persistent cookies:</strong> Remain on your device for a set period (typically 30 days to 1 year)</li>
            <li><strong>Authentication cookies:</strong> Last for 30 days or until you log out</li>
          </ul>
        </section>

        <section>
          <h3 className="text-xl font-semibold text-white mb-3">Third-Party Cookies</h3>
          <p>We may use third-party services that set their own cookies, including:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Analytics services (Google Analytics, etc.)</li>
            <li>Social media platforms</li>
            <li>Advertising networks</li>
            <li>Payment processors</li>
          </ul>
        </section>

        <section>
          <h3 className="text-xl font-semibold text-white mb-3">Updates to This Policy</h3>
          <p>We may update this cookie policy from time to time to reflect changes in our practices or for operational, legal, or regulatory reasons. The updated policy will be posted on this page with the revised date.</p>
        </section>
      </div>
    </div>
  )
}

function TermsOfService() {
  return (
    <div className="space-y-8">
      <div className="text-center mb-12">
        <Lock className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-white mb-4">Terms of Service</h2>
        <p className="text-gray-300 text-lg">Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="space-y-6 text-gray-300">
        <section>
          <h3 className="text-xl font-semibold text-white mb-3">1. Acceptance of Terms</h3>
          <p>By accessing and using AcademOra, you accept and agree to be bound by the terms and provision of this agreement.</p>
        </section>

        <section>
          <h3 className="text-xl font-semibold text-white mb-3">2. Use License</h3>
          <p>Permission is granted to temporarily access the materials (information or software) on AcademOra for personal, non-commercial transitory viewing only.</p>
        </section>

        <section>
          <h3 className="text-xl font-semibold text-white mb-3">3. Eligibility</h3>
          <p>Our services are intended for individuals who are at least 16 years old. By creating an account, you confirm that you meet this age requirement and, if you are under the age of majority where you live, that you have permission from a parent or legal guardian to use AcademOra.</p>
        </section>

        <section>
          <h3 className="text-xl font-semibold text-white mb-3">4. User Accounts</h3>
          <p className="mb-4">To access certain features of our service, you must register for an account. You agree to:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Provide accurate, current, and complete information</li>
            <li>Maintain and update your account information</li>
            <li>Keep your password secure</li>
            <li>Accept responsibility for all activities under your account</li>
          </ul>
        </section>

        <section>
          <h3 className="text-xl font-semibold text-white mb-3">5. Prohibited Uses</h3>
          <p className="mb-4">You may not use our service for any unlawful or unauthorized purpose. You agree not to:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Violate any applicable laws or regulations</li>
            <li>Infringe on intellectual property rights</li>
            <li>Harass, abuse, or harm other users</li>
            <li>Submit false or misleading information</li>
            <li>Use automated tools to access our service</li>
          </ul>
        </section>

        <section>
          <h3 className="text-xl font-semibold text-white mb-3">6. Content</h3>
          <p>You retain ownership of any content you submit to our service. By submitting content, you grant us a license to use, modify, and display it for the purpose of providing our service.</p>
        </section>

        <section>
          <h3 className="text-xl font-semibold text-white mb-3">7. Termination</h3>
          <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including if you breach the Terms.</p>
        </section>
      </div>
    </div>
  )
}

function DataProtection() {
  return (
    <div className="space-y-8">
      <div className="text-center mb-12">
        <Database className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-white mb-4">Data Protection</h2>
        <p className="text-gray-300 text-lg">Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="space-y-6 text-gray-300">
        <section>
          <h3 className="text-xl font-semibold text-white mb-3">Data Protection Principles</h3>
          <p className="mb-4">We are committed to protecting your personal data and follow these principles:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>Lawfulness:</strong> We process data legally and transparently</li>
            <li><strong>Limitation:</strong> We collect only necessary data for specified purposes</li>
            <li><strong>Accuracy:</strong> We ensure your data is accurate and up-to-date</li>
            <li><strong>Security:</strong> We implement robust security measures to protect your data</li>
            <li><strong>Accountability:</strong> We are responsible for and demonstrate compliance</li>
          </ul>
        </section>

        <section>
          <h3 className="text-xl font-semibold text-white mb-3">Security Measures</h3>
          <p className="mb-4">We implement multiple layers of security to protect your data:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>SSL/TLS encryption for all data transmissions</li>
            <li>Regular security audits and penetration testing</li>
            <li>Employee training on data protection practices</li>
            <li>Access controls and authentication systems</li>
            <li>Secure data storage and backup procedures</li>
          </ul>
        </section>

        <section>
          <h3 className="text-xl font-semibold text-white mb-3">Data Breach Response</h3>
          <p>In the event of a data breach, we will:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Immediately investigate and contain the breach</li>
            <li>Notify affected users within 72 hours</li>
            <li>Work with authorities and regulatory bodies</li>
            <li>Take steps to prevent future breaches</li>
          </ul>
        </section>

        <section>
          <h3 className="text-xl font-semibold text-white mb-3">International Data Transfers</h3>
          <p>Your data may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for international data transfers in compliance with applicable data protection laws.</p>
        </section>

        <section>
          <h3 className="text-xl font-semibold text-white mb-3">Contact for Data Protection</h3>
          <p>If you have questions about data protection or need to exercise your rights, contact our Data Protection Officer at:</p>
          <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50 mt-4">
            <p className="font-semibold text-white">Email:</p>
            <p>dpo@academora.com</p>
            <p className="font-semibold text-white mt-3">Address:</p>
            <p>AcademOra Data Protection<br />
            123 Privacy Street<br />
            Security City, SC 12345</p>
          </div>
        </section>
      </div>
    </div>
  )
}
