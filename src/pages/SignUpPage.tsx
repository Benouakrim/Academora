import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Building, GraduationCap, Layers, Users, Mail, FileText, AlertCircle } from 'lucide-react'
import { authAPI, setAuthToken, setCurrentUser } from '../lib/api'

type AccountTypeOption = {
  id: string
  name: string
  headline: string
  description: string
  icon: JSX.Element
  benefits: string[]
}

const ACCOUNT_TYPES: AccountTypeOption[] = [
  {
    id: 'individual',
    name: 'Individual',
    headline: 'Plan your next academic or career leap with personalized guidance.',
    description: 'Students, entrepreneurs, and professionals unlock tailored matches, scholarships, and mentorship.',
    icon: <Users className="h-10 w-10 text-primary-500" />,
    benefits: [
      'Personalized matching recommendations',
      'Scholarship alerts & admissions support',
      'Mentorship and peer community access',
    ],
  },
  {
    id: 'institution',
    name: 'Institution',
    headline: 'Coordinate admissions, outreach, and partnerships from a shared hub.',
    description: 'Universities, schools, ministries, and corporate academies manage programs and insights together.',
    icon: <Building className="h-10 w-10 text-primary-500" />,
    benefits: [
      'Multi-campus analytics dashboards',
      'Content, programs, and lead management',
      'Dedicated concierge onboarding',
    ],
  },
]

const OAUTH_PROVIDERS = [
  { id: 'google', label: 'Continue with Google', endpoint: '/auth/oauth/google/start', icon: 'G' },
  { id: 'microsoft', label: 'Continue with Microsoft', endpoint: '/auth/oauth/microsoft/start', icon: 'MS' },
  { id: 'github', label: 'Continue with GitHub', endpoint: '/auth/oauth/github/start', icon: 'GH' },
  { id: 'linkedin', label: 'Continue with LinkedIn', endpoint: '/auth/oauth/linkedin/start', icon: 'IN' },
]

export default function SignUpPage() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAccountTypeModal, setShowAccountTypeModal] = useState(true)
  const [selectedAccountTypeId, setSelectedAccountTypeId] = useState<string | null>(null)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [emailPreferences, setEmailPreferences] = useState({
    marketing: false,
    newsletter: false,
    updates: false
  })
  const [showTermsModal, setShowTermsModal] = useState(false)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001/api'

  const selectedAccountType = useMemo(
    () => ACCOUNT_TYPES.find((type) => type.id === selectedAccountTypeId) || null,
    [selectedAccountTypeId]
  )

  useEffect(() => {
    if (selectedAccountType) {
      setShowAccountTypeModal(false)
    }
  }, [selectedAccountType])

  useEffect(() => {
    document.body.style.overflow = showAccountTypeModal ? 'hidden' : 'auto'
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [showAccountTypeModal])

  // Handle OAuth redirect token
  useEffect(() => {
    const token = searchParams.get('token')
    const oauth = searchParams.get('oauth')
    if (token && oauth) {
      ;(async () => {
        try {
          setAuthToken(token)
          const me = await authAPI.getCurrentUser()
          setCurrentUser(me)
          navigate('/dashboard', { replace: true })
        } catch (e: any) {
          setError(e?.message || 'OAuth sign up failed')
        }
      })()
    }
  }, [navigate, searchParams])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedAccountType) {
      setError('Select the account type that best fits your goals before continuing.')
      return
    }

    if (!acceptTerms) {
      setError('You must accept the Terms and Conditions to create an account.')
      return
    }

    setLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      await authAPI.signup(identifier, password, { 
        accountType: selectedAccountType.id,
        emailPreferences,
        acceptedTerms: true,
        acceptedTermsDate: new Date().toISOString()
      })
      navigate(`/register?type=${encodeURIComponent(selectedAccountType.id)}`)
    } catch (signUpError: any) {
      setError(signUpError.message || 'An error occurred during sign up')
    } finally {
      setLoading(false)
    }
  }

  const TermsAndConditionsModal = () => {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
        <div className="max-w-4xl w-full max-h-[90vh] bg-white rounded-3xl shadow-2xl p-8 sm:p-10 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary-600" />
              <h2 className="text-2xl font-bold text-gray-900">Terms and Conditions</h2>
            </div>
            <button
              type="button"
              onClick={() => setShowTermsModal(false)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="prose prose-sm max-w-none text-gray-600 space-y-6">
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h3>
              <p>By accessing and using AcademOra, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">2. Use License</h3>
              <p>Permission is granted to temporarily access the materials (information or software) on AcademOra for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>modify or copy the materials</li>
                <li>use the materials for any commercial purpose or for any public display</li>
                <li>attempt to reverse engineer any software contained on AcademOra</li>
                <li>remove any copyright or other proprietary notations from the materials</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">3. Account Responsibilities</h3>
              <p>To access certain features of our service, you must register for an account. You are responsible for:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Providing accurate, current, and complete information</li>
                <li>Maintaining the confidentiality of your password</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us of any unauthorized use of your account</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">4. Privacy and Data Protection</h3>
              <p>Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices. By using AcademOra, you consent to the collection and use of information in accordance with our Privacy Policy.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">5. Prohibited Uses</h3>
              <p>You may not use our service for any unlawful or unauthorized purpose. You agree not to:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Submit false or misleading information</li>
                <li>Use automated tools to access our service</li>
                <li>Interfere with or disrupt the service or servers</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">6. Content and Intellectual Property</h3>
              <p>You retain ownership of any content you submit to our service. By submitting content, you grant us a license to use, modify, and display it for the purpose of providing our service. The service and its original content, features, and functionality are and will remain the exclusive property of AcademOra and its licensors.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">7. Termination</h3>
              <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including if you breach the Terms. Upon termination, your right to use the service will cease immediately.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">8. Limitation of Liability</h3>
              <p>In no event shall AcademOra, its directors, employees, partners, agents, suppliers, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the service.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">9. Changes to Terms</h3>
              <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">10. Contact Information</h3>
              <p>Questions about the Terms should be sent to us at legal@academora.com.</p>
            </section>

            <div className="bg-gray-50 rounded-lg p-4 mt-6">
              <p className="text-sm text-gray-600">
                <strong>Last updated:</strong> {new Date().toLocaleDateString()}<br />
                By creating an account, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowTermsModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                setAcceptTerms(true)
                setShowTermsModal(false)
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
            >
              Accept Terms
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {showAccountTypeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="max-w-4xl w-full rounded-3xl bg-white shadow-2xl p-8 sm:p-10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-primary-600">Choose your setup</p>
                <h2 className="mt-2 text-3xl font-bold text-gray-900">How will you be using AcademOra?</h2>
                <p className="mt-2 text-sm text-gray-600">
                  Pick the account type that matches your goals. You can add more roles later.
                </p>
              </div>
              <Layers className="h-10 w-10 text-primary-500" />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {ACCOUNT_TYPES.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSelectedAccountTypeId(option.id)}
                  className="group rounded-2xl border border-gray-200 bg-gray-50 p-6 text-left transition hover:border-primary-200 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-50">
                      {option.icon}
                    </span>
                    <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700">
                      Recommended
                    </span>
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-gray-900">{option.name} Account</h3>
                  <p className="mt-2 text-sm text-gray-600">{option.headline}</p>
                  <p className="mt-3 text-sm text-gray-500">{option.description}</p>
                  <ul className="mt-4 space-y-2 text-sm text-gray-600">
                    {option.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-start gap-2 text-left">
                        <span className="mt-1 block h-1.5 w-1.5 rounded-full bg-primary-500" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 inline-flex items-center gap-2 text-primary-600 font-medium">
                    Continue
                    <span aria-hidden className="text-lg transition-transform group-hover:translate-x-1">→</span>
                  </div>
                </button>
              ))}
            </div>
            <p className="mt-6 text-xs text-gray-400 text-center">
              Not sure which to pick? You can change this later in your profile settings.
            </p>
          </div>
        </div>
      )}

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link to="/" className="flex justify-center items-center space-x-2">
          <GraduationCap className="h-12 w-12 text-primary-600" />
          <span className="text-3xl font-bold text-primary-600">AcademOra</span>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Create your account</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
            sign in to your existing account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-6 shadow-xl sm:rounded-3xl sm:px-10 border border-gray-100">
          <div className="mb-6">
            <p className="text-sm font-semibold text-primary-600 uppercase tracking-wide">Account type</p>
            <div className="mt-3 flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 p-4">
              {selectedAccountType ? (
                <>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100">
                      {selectedAccountType.icon}
                    </span>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">
                        {selectedAccountType.name} account
                      </h3>
                      <p className="text-xs text-gray-500">{selectedAccountType.headline}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-full border border-primary-100 bg-white px-3 py-1 text-xs font-semibold text-primary-600 hover:bg-primary-50"
                    onClick={() => {
                      setShowAccountTypeModal(true)
                    }}
                  >
                    Change
                  </button>
                </>
              ) : (
                <div className="w-full text-sm text-gray-600 flex items-center justify-between">
                  <span>Select an account type to continue.</span>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-full border border-primary-100 bg-white px-3 py-1 text-xs font-semibold text-primary-600 hover:bg-primary-50"
                    onClick={() => setShowAccountTypeModal(true)}
                  >
                    Choose
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {OAUTH_PROVIDERS.map((provider) => (
              <a
                key={provider.id}
                href={`${API_URL}${provider.endpoint}`}
                className="w-full inline-flex items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white py-2.5 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-500">
                  {provider.icon}
                </span>
                {provider.label}
              </a>
            ))}
            <div className="my-4 flex items-center gap-2 text-xs text-gray-400">
              <div className="flex-1 h-px bg-gray-200" /> OR <div className="flex-1 h-px bg-gray-200" />
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="identifier"
                  name="identifier"
                  type="email"
                  autoComplete="email"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="••••••••"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">Must be at least 6 characters</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm password
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Repeat your password"
                />
              </div>
            </div>

            {/* Email Preferences */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Email Preferences</span>
                <span className="text-xs text-gray-500">(Optional)</span>
              </div>
              
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailPreferences.marketing}
                  onChange={(e) => setEmailPreferences(prev => ({ ...prev, marketing: e.target.checked }))}
                  className="mt-1 h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Marketing emails</span>
                  <p className="text-gray-500">Receive promotional offers and partner recommendations</p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailPreferences.newsletter}
                  onChange={(e) => setEmailPreferences(prev => ({ ...prev, newsletter: e.target.checked }))}
                  className="mt-1 h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Newsletter</span>
                  <p className="text-gray-500">Get updates about new features and educational insights</p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailPreferences.updates}
                  onChange={(e) => setEmailPreferences(prev => ({ ...prev, updates: e.target.checked }))}
                  className="mt-1 h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Product updates</span>
                  <p className="text-gray-500">Important announcements about your account and service changes</p>
                </div>
              </label>
            </div>

            {/* Terms and Conditions */}
            <div className="border-t border-gray-200 pt-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  required
                />
                <div className="text-sm text-gray-600">
                  <span className="font-medium">I accept the Terms and Conditions</span>
                  <p className="text-gray-500">
                    By creating an account, you agree to our{' '}
                    <button
                      type="button"
                      onClick={() => setShowTermsModal(true)}
                      className="text-primary-600 hover:text-primary-500 underline font-medium"
                    >
                      Terms and Conditions
                    </button>
                    {' '}and{' '}
                    <Link to="/policy" className="text-primary-600 hover:text-primary-500 underline font-medium">
                      Privacy Policy
                    </Link>
                  </p>
                </div>
              </label>
              
              {!acceptTerms && (
                <div className="mt-2 flex items-start gap-2 text-amber-600 text-xs">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>You must accept the Terms and Conditions to create an account.</span>
                </div>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || !selectedAccountType || !acceptTerms}
                className="w-full flex justify-center py-3 px-4 rounded-xl shadow-sm text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating account…' : 'Create account and continue'}
              </button>
              <p className="mt-2 text-xs text-gray-500 text-center">
                You will complete a short onboarding after this step.
              </p>
            </div>
          </form>
        </div>
      </div>
      
      {/* Terms and Conditions Modal */}
      {showTermsModal && <TermsAndConditionsModal />}
    </div>
  )
}

