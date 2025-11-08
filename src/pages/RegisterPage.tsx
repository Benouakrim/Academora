import { ComponentType, FormEvent, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Building, GraduationCap, Landmark, ShieldCheck, Sparkles, Users } from 'lucide-react'
import { onboardingAPI } from '../lib/api'

const classNames = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(' ')

type AccountTypeKey = 'individual' | 'institution'

type FieldConfig =
  | {
      name: string
      label: string
      placeholder?: string
      description?: string
      required?: boolean
      type?: 'text' | 'email' | 'password' | 'date'
      component?: 'input'
    }
  | {
      name: string
      label: string
      placeholder?: string
      description?: string
      required?: boolean
      component: 'select'
      options: { value: string; label: string }[]
    }
  | {
      name: string
      label: string
      placeholder?: string
      description?: string
      required?: boolean
      component: 'textarea'
    }

interface WizardStep {
  id: string
  title: string
  subtitle: string
  fields: FieldConfig[]
}

interface AccountType {
  id: AccountTypeKey
  title: string
  description: string
  highlight: string
  icon: JSX.Element
  benefits: string[]
  steps: WizardStep[]
}

const individualSteps: WizardStep[] = [
  {
    id: 'personal',
    title: 'Tell us about you',
    subtitle: 'We use this information to personalize your dashboard.',
    fields: [
      { name: 'givenName', label: 'First name', placeholder: 'Alex', required: true },
      { name: 'familyName', label: 'Last name', placeholder: 'Johnson', required: true },
      {
        name: 'dateOfBirth',
        label: 'Date of birth',
        component: 'input',
        type: 'date',
        required: true,
      },
      {
        name: 'role',
        label: 'Primary role',
        component: 'select',
        options: [
          { value: 'student', label: 'Student' },
          { value: 'entrepreneur', label: 'Entrepreneur' },
          { value: 'professional', label: 'Professional / Executive' },
          { value: 'parent', label: 'Parent / Guardian' },
          { value: 'other', label: 'Other' }
        ],
        required: true
      },
      {
        name: 'focusArea',
        label: 'Focus area',
        placeholder: 'e.g., Business analytics, product design, campus life'
      }
    ]
  },
  {
    id: 'contact',
    title: 'How can we reach you?',
    subtitle: 'Add your contact details so we can send updates and match results.',
    fields: [
      { name: 'email', label: 'Email address', placeholder: 'you@example.com', type: 'email', required: true },
      { name: 'country', label: 'Country / Region', placeholder: 'United States, Canada, Morocco…', required: true },
      {
        name: 'preferredLanguage',
        label: 'Preferred language',
        component: 'select',
        options: [
          { value: 'en', label: 'English' },
          { value: 'fr', label: 'French' },
          { value: 'ar', label: 'Arabic' },
          { value: 'es', label: 'Spanish' }
        ],
        required: true
      }
    ]
  },
  {
    id: 'goals',
    title: 'Plan your journey',
    subtitle: 'Tell us what you want to accomplish so we can tailor recommendations.',
    fields: [
      {
        name: 'primaryGoal',
        label: 'What is your primary goal?',
        component: 'textarea',
        placeholder: 'Scholarships, transfer programs, graduate studies, etc.',
        required: true
      },
      {
        name: 'timeline',
        label: 'Target start date',
        placeholder: 'Fall 2025, ASAP, still exploring…'
      }
    ]
  }
]

const institutionSteps: WizardStep[] = [
  {
    id: 'organization',
    title: 'Organization profile',
    subtitle: 'Introduce your institution so we can set up the right workspace.',
    fields: [
      { name: 'organizationName', label: 'Institution / organization name', placeholder: 'AcademOra University', required: true },
      { name: 'contactGivenName', label: 'Primary contact first name', placeholder: 'Fatima', required: true },
      { name: 'contactFamilyName', label: 'Primary contact last name', placeholder: 'Zahra', required: true },
      {
        name: 'contactDateOfBirth',
        label: 'Primary contact date of birth',
        component: 'input',
        type: 'date',
        required: true,
      },
      {
        name: 'organizationType',
        label: 'Organization type',
        component: 'select',
        options: [
          { value: 'university', label: 'University or College' },
          { value: 'school', label: 'School / Academy' },
          { value: 'government', label: 'Government or Administration' },
          { value: 'company', label: 'Company / Corporate Partner' },
          { value: 'nonprofit', label: 'Non-profit Organization' }
        ],
        required: true
      },
      { name: 'website', label: 'Official website', placeholder: 'https://www.example.edu' }
    ]
  },
  {
    id: 'contact',
    title: 'Primary contact',
    subtitle: 'Who will manage the account and approvals?',
    fields: [
      { name: 'contactEmail', label: 'Work email', placeholder: 'you@institution.org', type: 'email', required: true },
      { name: 'contactPhone', label: 'Phone number', placeholder: '+1 (555) 123-4567' }
    ]
  },
  {
    id: 'intent',
    title: 'Implementation goals',
    subtitle: 'Help us understand what you want to achieve with AcademOra.',
    fields: [
      {
        name: 'useCases',
        label: 'Primary use cases',
        component: 'textarea',
        placeholder: 'Student admissions, alumni engagement, partnership tracking…',
        description: 'You can list multiple comma-separated goals.',
        required: true
      },
      {
        name: 'studentVolume',
        label: 'Learner / member volume',
        component: 'select',
        options: [
          { value: 'under-100', label: 'Under 100' },
          { value: '100-500', label: '100 – 500' },
          { value: '500-2000', label: '500 – 2,000' },
          { value: '2000-10000', label: '2,000 – 10,000' },
          { value: 'over-10000', label: '10,000+' }
        ],
        required: true
      }
    ]
  }
]

const ACCOUNT_TYPE_CONFIG: Record<AccountTypeKey, AccountType> = {
  individual: {
    id: 'individual',
    title: 'Individual Journey',
    description: 'Discover tailored programs, financing options, and campuses based on your ambitions.',
    highlight: 'Perfect for students, entrepreneurs, and professionals planning their next step.',
    icon: <Users className="h-8 w-8 text-primary-500" />,
    benefits: [
      'Personalized orientation tracks',
      'Scholarship matching alerts',
      'Mentorship and peer community access'
    ],
    steps: individualSteps
  },
  institution: {
    id: 'institution',
    title: 'Institutional Workspace',
    description: 'Engage prospects, manage programs, and collaborate with partners in one dashboard.',
    highlight: 'Designed for universities, ministries, accelerators, and corporate academies.',
    icon: <Building className="h-8 w-8 text-primary-500" />,
    benefits: [
      'Multi-campus analytics and reporting',
      'Content and admissions management',
      'Dedicated onboarding concierge'
    ],
    steps: institutionSteps
  }
}

type FormDataState = Record<string, string>

const baseFormData: FormDataState = {}
Object.values(ACCOUNT_TYPE_CONFIG).forEach((type) => {
  type.steps.forEach((step) => {
    step.fields.forEach((field) => {
      baseFormData[field.name] = ''
    })
  })
})

export default function RegisterPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const accountTypeParam = (searchParams.get('type') || '').toLowerCase() as AccountTypeKey | ''
  const selectedType = useMemo(() => ACCOUNT_TYPE_CONFIG[accountTypeParam as AccountTypeKey], [accountTypeParam])
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [formData, setFormData] = useState<FormDataState>(baseFormData)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [submissionNote, setSubmissionNote] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const steps = selectedType?.steps ?? []

  useEffect(() => {
    if (!selectedType) {
      navigate('/signup', { replace: true })
    }
  }, [navigate, selectedType])

  const handleFieldChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const validateStep = (step: WizardStep) => {
    const missingField = step.fields.find((field) => field.required && !formData[field.name]?.trim())
    if (missingField) {
      setError(`${missingField.label} is required`)
      return false
    }
    setError(null)
    return true
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!selectedType || !steps.length) {
      navigate('/signup')
      return
    }

    const currentStep = steps[currentStepIndex]
    if (!validateStep(currentStep)) return

    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1)
      return
    }

    setIsSubmitting(true)
    setError(null)
    setSuccess(false)
    setSubmissionNote(null)

    try {
      const submissionPayload = {
        accountType: selectedType.id,
        answers: formData,
        metadata: {
          completedAt: new Date().toISOString(),
          stepsCompleted: steps.length,
        },
      }

      const response = await onboardingAPI.submit(submissionPayload)
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('academora:lastOnboarding', JSON.stringify(submissionPayload))
        } catch (storageError) {
          console.warn('Unable to persist onboarding snapshot', storageError)
        }
      }

      if (response?.error) {
        setSubmissionNote('We saved your answers locally. You can revisit settings later if anything looks off.')
      }

      setSuccess(true)
      setTimeout(() => {
        navigate('/dashboard')
      }, 1200)
    } catch (submissionError: any) {
      setError(submissionError?.message || 'Something went wrong while creating your account.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!selectedType) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <header className="mb-10 flex flex-col gap-4 text-center">
          <Link to="/" className="mx-auto flex items-center gap-3 text-primary-600">
            <GraduationCap className="h-10 w-10" />
            <span className="text-3xl font-semibold tracking-tight">AcademOra</span>
          </Link>
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-100 px-4 py-2 text-sm font-medium text-primary-700">
              <Sparkles className="h-4 w-4" />
              Guided onboarding
            </div>
            <h1 className="mt-4 text-3xl font-bold text-gray-900 md:text-4xl">
              Finish setting up your {selectedType.title.toLowerCase()}
            </h1>
            <p className="mt-3 text-base text-gray-600">
              Your credentials are ready. Share a few more details so we can tailor the workspace to your goals.
            </p>
          </div>
        </header>

        <section className="mb-8 rounded-3xl border border-primary-100 bg-white/90 p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50">
                {selectedType.icon}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{selectedType.title}</h2>
                <p className="text-sm text-gray-600">{selectedType.highlight}</p>
                <ul className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
                  {selectedType.benefits.map((benefit) => (
                    <li
                      key={benefit}
                      className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1 text-primary-600"
                    >
                      <ShieldCheck className="h-3 w-3" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="text-sm font-semibold text-primary-600 hover:text-primary-700"
            >
              Switch account type
            </button>
          </div>
        </section>

        <form onSubmit={handleSubmit} className="rounded-3xl border border-gray-100 bg-white p-8 shadow-lg lg:p-12">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <button
              type="button"
              onClick={() => (currentStepIndex === 0 ? navigate('/signup') : setCurrentStepIndex((prev) => Math.max(prev - 1, 0)))}
              className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              ← Back
            </button>
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Landmark className="h-5 w-5 text-primary-500" />
              Step {currentStepIndex + 1} of {steps.length}
            </div>
          </div>

          <div className="mb-6 flex items-center gap-3">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center gap-3">
                <div
                  className={classNames(
                    'flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold',
                    index === currentStepIndex
                      ? 'border-primary-500 bg-primary-500 text-white'
                      : index < currentStepIndex
                      ? 'border-primary-200 bg-primary-100 text-primary-700'
                      : 'border-gray-200 bg-gray-100 text-gray-500'
                  )}
                >
                  {index + 1}
                </div>
                {index < steps.length - 1 && <div className="h-px w-12 bg-gray-200" />}
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6">
            <h3 className="text-xl font-semibold text-gray-900">{steps[currentStepIndex].title}</h3>
            <p className="mt-1 text-sm text-gray-600">{steps[currentStepIndex].subtitle}</p>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {steps[currentStepIndex].fields.map((field) => (
                <div key={field.name} className="space-y-2">
                  <label htmlFor={field.name} className="text-sm font-medium text-gray-700">
                    {field.label}
                    {field.required && <span className="text-red-500"> *</span>}
                  </label>
                  {renderField(field, formData[field.name] || '', handleFieldChange)}
                  {'description' in field && field.description && (
                    <p className="text-xs text-gray-500">{field.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
          )}
          {success && (
            <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              All done! Redirecting you to your dashboard…
              {submissionNote && <p className="mt-1 text-xs text-emerald-600/80">{submissionNote}</p>}
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-xs text-gray-500">
              By continuing you agree to our{' '}
              <Link to="/policy" className="font-medium text-primary-600 hover:text-primary-500">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/policy" className="font-medium text-primary-600 hover:text-primary-500">
                Privacy Policy
              </Link>
              .
            </p>
            <div className="flex items-center gap-3">
              {currentStepIndex > 0 && (
                <button
                  type="button"
                  onClick={() => setCurrentStepIndex((prev) => Math.max(prev - 1, 0))}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
                >
                  Back
                </button>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-primary-200/50 transition hover:bg-primary-700 disabled:opacity-60"
              >
                {currentStepIndex < steps.length - 1 ? 'Continue' : isSubmitting ? 'Finishing…' : 'Finish onboarding'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

function renderField(
  field: FieldConfig,
  value: string,
  onChange: (name: string, nextValue: string) => void
) {
  const baseClasses =
    'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition'

  if (field.component === 'select') {
    return (
      <select
        id={field.name}
        name={field.name}
        value={value}
        onChange={(event) => onChange(field.name, event.target.value)}
        className={baseClasses}
      >
        <option value="">Select…</option>
        {field.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    )
  }

  if (field.component === 'textarea') {
    return (
      <textarea
        id={field.name}
        name={field.name}
        rows={4}
        value={value}
        onChange={(event) => onChange(field.name, event.target.value)}
        placeholder={field.placeholder}
        className={classNames(baseClasses, 'resize-none')}
      />
    )
  }

  return (
    <input
      id={field.name}
      name={field.name}
      type={field.type || 'text'}
      value={value}
      onChange={(event) => onChange(field.name, event.target.value)}
      placeholder={field.placeholder}
      className={baseClasses}
    />
  )
}


