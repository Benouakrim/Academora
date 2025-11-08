import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Building, GraduationCap, Layers, Users } from 'lucide-react'
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
      await authAPI.signup(identifier, password, { accountType: selectedAccountType.id })
      navigate(`/register?type=${encodeURIComponent(selectedAccountType.id)}`)
    } catch (signUpError: any) {
      setError(signUpError.message || 'An error occurred during sign up')
    } finally {
      setLoading(false)
    }
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

            <div>
              <button
                type="submit"
                disabled={loading || !selectedAccountType}
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
    </div>
  )
}

