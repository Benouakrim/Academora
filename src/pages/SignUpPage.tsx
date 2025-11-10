import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Building, GraduationCap, Layers, Users, Mail, FileText, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react'
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

const COUNTRY_CODES = [
  { value: '+1', label: 'United States (+1)' },
  { value: '+44', label: 'United Kingdom (+44)' },
  { value: '+212', label: 'Morocco (+212)' },
  { value: '+33', label: 'France (+33)' },
  { value: '+34', label: 'Spain (+34)' },
  { value: '+49', label: 'Germany (+49)' },
  { value: '+216', label: 'Tunisia (+216)' },
  { value: '+213', label: 'Algeria (+213)' },
  { value: '+20', label: 'Egypt (+20)' },
  { value: '+971', label: 'UAE (+971)' },
]

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const passwordRequirements = [
  { id: 'length', label: 'At least 10 characters', test: (password: string) => password.length >= 10 },
  { id: 'lower', label: 'Contains a lowercase letter', test: (password: string) => /[a-z]/.test(password) },
  { id: 'upper', label: 'Contains an uppercase letter', test: (password: string) => /[A-Z]/.test(password) },
  { id: 'number', label: 'Contains a number', test: (password: string) => /\d/.test(password) },
  { id: 'symbol', label: 'Contains a special character', test: (password: string) => /[^A-Za-z0-9]/.test(password) },
]

type PasswordStrength = {
  score: number
  percent: number
  label: 'Weak' | 'Moderate' | 'Strong'
}

const evaluatePasswordStrength = (password: string): PasswordStrength => {
  const requirementScore = passwordRequirements.reduce(
    (score, requirement) => score + (requirement.test(password) ? 1 : 0),
    0
  )
  const lengthBonus = password.length >= 16 ? 2 : password.length >= 12 ? 1 : 0
  const rawScore = requirementScore + lengthBonus
  const percent = Math.min(100, Math.round((rawScore / (passwordRequirements.length + 2)) * 100))

  let label: PasswordStrength['label'] = 'Weak'
  if (percent >= 80) {
    label = 'Strong'
  } else if (percent >= 50) {
    label = 'Moderate'
  }

  return { score: rawScore, percent, label }
}

const generateStrongPassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{};:,.<>?'
  const length = 16
  let password = ''
  const cryptoRef = typeof globalThis !== 'undefined' ? (globalThis.crypto ?? undefined) : undefined
  const getRandomValues = (cryptoRef?.getRandomValues
    ? cryptoRef.getRandomValues.bind(cryptoRef)
    : (array: Uint32Array) => {
        for (let i = 0; i < array.length; i++) {
          array[i] = Math.floor(Math.random() * 4294967296)
        }
        return array
      }) as (array: Uint32Array) => Uint32Array
  const randomArray = getRandomValues(new Uint32Array(length))
  for (let i = 0; i < length; i++) {
    password += chars[randomArray[i] % chars.length]
  }
  return password
}

const ensurePlus = (code: string) => (code.startsWith('+') ? code : `+${code.replace(/[^\d]/g, '')}`)

const getDigits = (value: string) => value.replace(/\D/g, '')

const findCountryOptionByDigits = (digits: string) =>
  COUNTRY_CODES.find((option) => digits.startsWith(option.value.replace(/\D/g, '')))

const normalizePhoneNumber = (
  rawInput: string,
  selectedCountryCode: string
): { e164: string; national: string; countryCode: string } | null => {
  const trimmed = rawInput.trim()
  if (!trimmed) return null

  const cleaned = trimmed.replace(/[\s\-()_.]/g, '')
  const selectedDigits = getDigits(selectedCountryCode)
  const selectedWithPlus = ensurePlus(selectedCountryCode || '+1')

  const buildFromNational = (digits: string) => {
    const digitOnly = getDigits(digits)
    if (!digitOnly) return null
    const withoutLeadingZeros = digitOnly.replace(/^0+/, '') || digitOnly
    if (!selectedDigits) return null
    const e164 = `+${selectedDigits}${withoutLeadingZeros}`
    return {
      e164,
      national: withoutLeadingZeros,
      countryCode: selectedWithPlus,
    }
  }

  const handleInternational = (digits: string) => {
    if (!digits) return null
    const matchedOption = findCountryOptionByDigits(digits)
    if (matchedOption) {
      const matchDigits = getDigits(matchedOption.value)
      const nationalDigits = digits.slice(matchDigits.length) || digits
      return {
        e164: `+${digits}`,
        national: nationalDigits.replace(/^0+/, '') || nationalDigits,
        countryCode: matchedOption.value,
      }
    }
    if (selectedDigits && digits.startsWith(selectedDigits)) {
      const nationalDigits = digits.slice(selectedDigits.length) || digits
      return {
        e164: `+${digits}`,
        national: nationalDigits.replace(/^0+/, '') || nationalDigits,
        countryCode: selectedWithPlus,
      }
    }
    return buildFromNational(digits)
  }

  if (cleaned.startsWith('+')) {
    const digits = getDigits(cleaned)
    return handleInternational(digits)
  }

  if (cleaned.startsWith('00')) {
    const digits = getDigits(cleaned.slice(2))
    return handleInternational(digits)
  }

  const digits = getDigits(cleaned)
  if (!digits) return null

  if (selectedDigits && digits.startsWith(selectedDigits)) {
    const nationalDigits = digits.slice(selectedDigits.length) || digits
    return {
      e164: `+${digits}`,
      national: nationalDigits.replace(/^0+/, '') || nationalDigits,
      countryCode: selectedWithPlus,
    }
  }

  const matchedOption = findCountryOptionByDigits(digits)
  if (matchedOption) {
    const matchDigits = getDigits(matchedOption.value)
    const nationalDigits = digits.slice(matchDigits.length) || digits
    return {
      e164: `+${digits}`,
      national: nationalDigits.replace(/^0+/, '') || nationalDigits,
      countryCode: matchedOption.value,
    }
  }

  return buildFromNational(digits)
}

export default function SignUpPage() {
  const [identifierType, setIdentifierType] = useState<'email' | 'phone'>('email')
  const [emailIdentifier, setEmailIdentifier] = useState('')
  const [phoneCountryCode, setPhoneCountryCode] = useState(COUNTRY_CODES[0].value)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{ identifier?: string; password?: string; confirmPassword?: string }>(
    {}
  )
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>(evaluatePasswordStrength(''))
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
    setPasswordStrength(evaluatePasswordStrength(password))
  }, [password])

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

    const nextFieldErrors: { identifier?: string; password?: string; confirmPassword?: string } = {}
    let identifierValue = ''
    let normalizedPhone = ''

    let resolvedCountryCode = phoneCountryCode

    if (identifierType === 'email') {
      const trimmedEmail = emailIdentifier.trim()
      if (!emailPattern.test(trimmedEmail)) {
        nextFieldErrors.identifier = 'Enter a valid email address.'
      } else {
        identifierValue = trimmedEmail.toLowerCase()
      }
    } else {
      const formattedPhone = normalizePhoneNumber(phoneNumber, phoneCountryCode)
      if (!formattedPhone || formattedPhone.national.length < 4) {
        nextFieldErrors.identifier = 'Enter a valid phone number.'
      } else {
        identifierValue = formattedPhone.e164
        normalizedPhone = formattedPhone.national
        resolvedCountryCode = formattedPhone.countryCode
        if (resolvedCountryCode !== phoneCountryCode) {
          setPhoneCountryCode(resolvedCountryCode)
        }
      }
    }

    if (password !== confirmPassword) {
      nextFieldErrors.confirmPassword = 'Passwords do not match.'
    }

    const unmetRequirements = passwordRequirements.filter((requirement) => !requirement.test(password))
    if (unmetRequirements.length > 0) {
      nextFieldErrors.password = 'Password is not strong enough.'
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors)
      setError('Please fix the highlighted issues before continuing.')
      return
    }

    setFieldErrors({})
    setLoading(true)
    setError(null)

    try {
      const extraSignupData = { 
        accountType: selectedAccountType.id,
        emailPreferences,
        acceptedTerms: true,
        acceptedTermsDate: new Date().toISOString(),
        contactMethod: identifierType,
      }

      if (identifierType === 'email') {
        extraSignupData['preferredSignupEmail'] = identifierValue
      } else {
        extraSignupData['preferredSignupPhone'] = identifierValue
        extraSignupData['preferredSignupCountryCode'] = resolvedCountryCode
      }

      await authAPI.signup(identifierValue, password, extraSignupData)
      try {
        localStorage.setItem(
          'academora:pendingSignUpContact',
          JSON.stringify({
            type: identifierType,
            email: identifierType === 'email' ? identifierValue : '',
            phone: identifierType === 'phone' ? identifierValue : '',
            countryCode: identifierType === 'phone' ? resolvedCountryCode : '',
            rawPhone: identifierType === 'phone' ? normalizedPhone : '',
          })
        )
      } catch (storageError) {
        console.warn('Unable to store pending sign-up contact info', storageError)
      }
      navigate(`/register?type=${encodeURIComponent(selectedAccountType.id)}`)
    } catch (signUpError: any) {
      const rawMessage = signUpError?.message || 'An error occurred during sign up'
      if (identifierType === 'phone' && typeof rawMessage === 'string' && rawMessage.toLowerCase().includes('email')) {
        setError('Please provide a valid phone number.')
      } else {
        setError(rawMessage)
      }
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
              <h3 className="text-lg font-semibold text-gray-900 mb-3">3. Eligibility</h3>
              <p>AcademOra is intended for individuals who are at least 16 years old. By creating an account, you confirm that you meet this minimum age requirement and that, if you are under the legal age of majority in your jurisdiction, you have permission from a parent or legal guardian to use the service.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">4. Account Responsibilities</h3>
              <p>To access certain features of our service, you must register for an account. You are responsible for:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Providing accurate, current, and complete information</li>
                <li>Maintaining the confidentiality of your password</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us of any unauthorized use of your account</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">5. Privacy and Data Protection</h3>
              <p>Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices. By using AcademOra, you consent to the collection and use of information in accordance with our Privacy Policy.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">6. Prohibited Uses</h3>
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
              <h3 className="text-lg font-semibold text-gray-900 mb-3">7. Content and Intellectual Property</h3>
              <p>You retain ownership of any content you submit to our service. By submitting content, you grant us a license to use, modify, and display it for the purpose of providing our service. The service and its original content, features, and functionality are and will remain the exclusive property of AcademOra and its licensors.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">8. Termination</h3>
              <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including if you breach the Terms. Upon termination, your right to use the service will cease immediately.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">9. Limitation of Liability</h3>
              <p>In no event shall AcademOra, its directors, employees, partners, agents, suppliers, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the service.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">10. Changes to Terms</h3>
              <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">11. Contact Information</h3>
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
    <div className="relative min-h-screen bg-gray-50 py-12 lg:py-16">
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

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 lg:flex-row lg:items-start xl:gap-16">
        <div className="space-y-6 lg:w-[40%]">
          <Link to="/" className="flex items-center gap-2 text-primary-600">
            <GraduationCap className="h-12 w-12" />
            <span className="text-3xl font-bold">AcademOra</span>
          </Link>

          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold text-gray-900">Create your account</h2>
            <p className="text-sm text-gray-600">
              Or{' '}
              <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                sign in to your existing account
              </Link>
            </p>
          </div>

          <section className="rounded-3xl border border-gray-200 bg-white/90 p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary-600">Account type</p>
            <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4">
              {selectedAccountType ? (
                <>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100">
                      {selectedAccountType.icon}
                    </span>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">{selectedAccountType.name} account</h3>
                      <p className="text-xs text-gray-500">{selectedAccountType.headline}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-full border border-primary-100 bg-white px-3 py-1 text-xs font-semibold text-primary-600 hover:bg-primary-50"
                    onClick={() => setShowAccountTypeModal(true)}
                  >
                    Change
                  </button>
                </>
              ) : (
                <div className="flex w-full items-center justify-between text-sm text-gray-600">
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
            {selectedAccountType && (
              <ul className="mt-4 space-y-1 text-xs text-gray-500">
                {selectedAccountType.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-2">
                    <span className="block h-1.5 w-1.5 rounded-full bg-primary-500" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <p className="text-xs text-gray-500">You will complete a short onboarding after this step.</p>
        </div>

        <div className="flex-1">
          <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-xl lg:p-10">
            <div className="grid gap-3 md:grid-cols-2">
              {OAUTH_PROVIDERS.map((provider) => (
                <a
                  key={provider.id}
                  href={`${API_URL}${provider.endpoint}`}
                  className="inline-flex items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white py-2.5 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-500">
                    {provider.icon}
                  </span>
                  {provider.label}
                </a>
              ))}
            </div>

            <div className="my-6 flex items-center gap-2 text-xs text-gray-400">
              <div className="flex-1 h-px bg-gray-200" /> OR <div className="flex-1 h-px bg-gray-200" />
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div>
                <div className="flex items-center justify-between gap-3">
                  <label className="text-sm font-medium text-gray-700">Sign up with</label>
                  <div className="inline-flex overflow-hidden rounded-full border border-gray-200 bg-gray-50 p-1 text-xs font-semibold text-gray-600">
                    <button
                      type="button"
                      className={`rounded-full px-3 py-1.5 transition ${
                        identifierType === 'email' ? 'bg-primary-600 text-white shadow-sm' : 'hover:bg-white'
                      }`}
                      onClick={() => {
                        setIdentifierType('email')
                        setFieldErrors((prev) => ({ ...prev, identifier: undefined }))
                      }}
                    >
                      Email
                    </button>
                    <button
                      type="button"
                      className={`rounded-full px-3 py-1.5 transition ${
                        identifierType === 'phone' ? 'bg-primary-600 text-white shadow-sm' : 'hover:bg-white'
                      }`}
                      onClick={() => {
                        setIdentifierType('phone')
                        setFieldErrors((prev) => ({ ...prev, identifier: undefined }))
                      }}
                    >
                      Phone
                    </button>
                  </div>
                </div>

                {identifierType === 'email' ? (
                  <div className="mt-3 space-y-1">
                    <input
                      id="identifier-email"
                      name="identifier-email"
                      type="email"
                      autoComplete="email"
                      value={emailIdentifier}
                      onChange={(e) => {
                        setEmailIdentifier(e.target.value)
                        if (fieldErrors.identifier) {
                          setFieldErrors((prev) => ({ ...prev, identifier: undefined }))
                        }
                      }}
                      className={`block w-full rounded-xl border px-3 py-2 shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        fieldErrors.identifier ? 'border-red-300 focus:border-red-400 focus:ring-red-300' : 'border-gray-300 focus:border-primary-500'
                      }`}
                      placeholder="you@example.com"
                      required={identifierType === 'email'}
                    />
                    <p className="text-xs text-gray-500">We will use this email to pre-fill your onboarding details.</p>
                    {fieldErrors.identifier && (
                      <p className="text-xs font-medium text-red-600">{fieldErrors.identifier}</p>
                    )}
                  </div>
                ) : (
                  <div className="mt-3 space-y-2">
                    <div className="flex gap-3">
                      <select
                        id="identifier-country"
                        name="identifier-country"
                        value={phoneCountryCode}
                        onChange={(event) => {
                          setPhoneCountryCode(event.target.value)
                          if (fieldErrors.identifier) {
                            setFieldErrors((prev) => ({ ...prev, identifier: undefined }))
                          }
                        }}
                        className={`w-36 rounded-xl border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                          fieldErrors.identifier ? 'border-red-300 focus:border-red-400 focus:ring-red-300' : 'border-gray-300 focus:border-primary-500'
                        }`}
                        required={identifierType === 'phone'}
                      >
                        {COUNTRY_CODES.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <input
                        id="identifier-phone"
                        name="identifier-phone"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel-national"
                        value={phoneNumber}
                        onChange={(event) => {
                          const value = event.target.value.replace(/[^\d\s\-()+]/g, '')
                          setPhoneNumber(value)
                          if (fieldErrors.identifier) {
                            setFieldErrors((prev) => ({ ...prev, identifier: undefined }))
                          }
                        }}
                        className={`flex-1 rounded-xl border px-3 py-2 shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                          fieldErrors.identifier ? 'border-red-300 focus:border-red-400 focus:ring-red-300' : 'border-gray-300 focus:border-primary-500'
                        }`}
                        placeholder="555 123 456"
                        required={identifierType === 'phone'}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      We will send important updates to this number and pre-fill onboarding fields.
                    </p>
                    {fieldErrors.identifier && (
                      <p className="text-xs font-medium text-red-600">{fieldErrors.identifier}</p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between gap-3">
                  <label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const suggestion = generateStrongPassword()
                      setPassword(suggestion)
                      setConfirmPassword(suggestion)
                      setFieldErrors((prev) => ({ ...prev, password: undefined, confirmPassword: undefined }))
                    }}
                    className="text-xs font-semibold text-primary-600 hover:text-primary-700"
                  >
                    Suggest strong password
                  </button>
                </div>
                <div className="mt-1 space-y-3">
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        if (fieldErrors.password) {
                          setFieldErrors((prev) => ({ ...prev, password: undefined }))
                        }
                      }}
                      className={`block w-full rounded-xl border px-3 py-2 pr-16 shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        fieldErrors.password ? 'border-red-300 focus:border-red-400 focus:ring-red-300' : 'border-gray-300 focus:border-primary-500'
                      }`}
                      placeholder="Create a strong password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-3 flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-primary-600"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <div>
                    <div className="h-2 w-full rounded-full bg-gray-200">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          passwordStrength.label === 'Strong'
                            ? 'bg-emerald-500'
                            : passwordStrength.label === 'Moderate'
                            ? 'bg-amber-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.max(8, passwordStrength.percent)}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs font-medium text-gray-600">
                      Strength: <span className="capitalize">{passwordStrength.label.toLowerCase()}</span>
                    </p>
                  </div>
                  <ul className="space-y-1 text-xs">
                    {passwordRequirements.map((requirement) => {
                      const met = requirement.test(password)
                      return (
                        <li key={requirement.id} className="flex items-center gap-2">
                          {met ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                          ) : (
                            <AlertCircle className="h-3.5 w-3.5 text-red-400" />
                          )}
                          <span className={met ? 'text-gray-600' : 'text-gray-500'}>{requirement.label}</span>
                        </li>
                      )
                    })}
                  </ul>
                  {fieldErrors.password && (
                    <p className="text-xs font-medium text-red-600">{fieldErrors.password}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm password
                </label>
                <div className="mt-1 space-y-1">
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value)
                        if (fieldErrors.confirmPassword) {
                          setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }))
                        }
                      }}
                      className={`block w-full rounded-xl border px-3 py-2 pr-16 shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        fieldErrors.confirmPassword
                          ? 'border-red-300 focus:border-red-400 focus:ring-red-300'
                          : 'border-gray-300 focus:border-primary-500'
                      }`}
                      placeholder="Repeat your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-3 flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-primary-600"
                      aria-label={showConfirmPassword ? 'Hide confirmation password' : 'Show confirmation password'}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      {showConfirmPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  {fieldErrors.confirmPassword && (
                    <p className="text-xs font-medium text-red-600">{fieldErrors.confirmPassword}</p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Email Preferences</span>
                  <span className="text-xs text-gray-500">(Optional)</span>
                </div>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailPreferences.marketing}
                    onChange={(e) => setEmailPreferences((prev) => ({ ...prev, marketing: e.target.checked }))}
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
                    onChange={(e) => setEmailPreferences((prev) => ({ ...prev, newsletter: e.target.checked }))}
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
                    onChange={(e) => setEmailPreferences((prev) => ({ ...prev, updates: e.target.checked }))}
                    className="mt-1 h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Product updates</span>
                    <p className="text-gray-500">Important announcements about your account and service changes</p>
                  </div>
                </label>
              </div>

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
                      </button>{' '}
                      and{' '}
                      <Link to="/policy" className="text-primary-600 hover:text-primary-500 underline font-medium">
                        Privacy Policy
                      </Link>
                      . You confirm that you are at least 16 years old and, if applicable,
                      have consent from a parent or legal guardian.
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

              <button
                type="submit"
                disabled={loading || !selectedAccountType || !acceptTerms}
                className="w-full flex justify-center py-3 px-4 rounded-xl shadow-sm text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating account…' : 'Create account and continue'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {showTermsModal && <TermsAndConditionsModal />}
    </div>
  )
}
