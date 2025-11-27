import { ComponentType, FormEvent, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Building, GraduationCap, Landmark, MinusCircle, Plus, ShieldCheck, Sparkles, Users } from 'lucide-react'
import { useAuth, useUser } from '@clerk/clerk-react'
import { onboardingAPI, usersAPI } from '../lib/api'

const classNames = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(' ')

type AccountTypeKey = 'individual' | 'institution'

type ContactGroupKey = 'individualEmail' | 'individualPhone' | 'institutionEmail' | 'institutionPhone'

type FieldCommon = {
  name: string
  label: string
  placeholder?: string
  description?: string
  required?: boolean
  group?: ContactGroupKey
  dynamicIndex?: number
}

type FieldConfig =
  | (FieldCommon & {
      type?: 'text' | 'email' | 'password' | 'date' | 'tel'
      component?: 'input'
    })
  | (FieldCommon & {
      component: 'select'
      options: { value: string; label: string }[]
    })
  | (FieldCommon & {
      component: 'textarea'
    })
  | (FieldCommon & {
      component: 'multiselect'
      options: { value: string; label: string }[]
    })

interface WizardStep {
  id: string
  title: string
  subtitle: string
  fields: FieldConfig[]
}

const parseMultiSelectValue = (rawValue: string | undefined): string[] => {
  if (!rawValue) return []
  try {
    const parsed = JSON.parse(rawValue)
    if (Array.isArray(parsed)) {
      return parsed.map((entry) => String(entry))
    }
  } catch (error) {
    // fall through to comma parsing
  }
  return rawValue
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
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

const INSTITUTION_USE_CASE_OPTIONS = [
  { value: 'student-admissions', label: 'Student admissions' },
  { value: 'alumni-engagement', label: 'Alumni engagement' },
  { value: 'partnership-tracking', label: 'Partner relationship tracking' },
  { value: 'scholarship-management', label: 'Scholarship management' },
  { value: 'workforce-development', label: 'Workforce development' },
  { value: 'analytics-reporting', label: 'Analytics & reporting' },
  { value: 'marketing-outreach', label: 'Marketing & outreach' },
  { value: 'learner-support', label: 'Learner support services' },
]

type ContactFieldTemplate = {
  name: string
  label: string
  placeholder: string
  required: boolean
  type: 'email' | 'tel'
}

const CONTACT_GROUP_CONFIG: Record<ContactGroupKey, { min: number; max: number; fields: ContactFieldTemplate[] }> = {
  individualEmail: {
    min: 1,
    max: 3,
    fields: [
      { name: 'email', label: 'Primary email address', placeholder: 'you@example.com', required: true, type: 'email' },
      {
        name: 'emailExtra1',
        label: 'Additional email address 2',
        placeholder: 'team@yourdomain.com',
        required: true,
        type: 'email',
      },
      {
        name: 'emailExtra2',
        label: 'Additional email address 3',
        placeholder: 'support@yourdomain.com',
        required: true,
        type: 'email',
      },
    ],
  },
  individualPhone: {
    min: 0,
    max: 3,
    fields: [
      {
        name: 'phone',
        label: 'Primary phone number',
        placeholder: '+1 (555) 123-4567',
        required: false,
        type: 'tel',
      },
      {
        name: 'phoneExtra1',
        label: 'Additional phone number 2',
        placeholder: '+1 (555) 234-5678',
        required: true,
        type: 'tel',
      },
      {
        name: 'phoneExtra2',
        label: 'Additional phone number 3',
        placeholder: '+1 (555) 345-6789',
        required: true,
        type: 'tel',
      },
    ],
  },
  institutionEmail: {
    min: 1,
    max: 5,
    fields: [
      {
        name: 'contactEmail',
        label: 'Primary contact email',
        placeholder: 'you@institution.org',
        required: true,
        type: 'email',
      },
      {
        name: 'contactEmailExtra1',
        label: 'Additional contact email 2',
        placeholder: 'team@institution.org',
        required: true,
        type: 'email',
      },
      {
        name: 'contactEmailExtra2',
        label: 'Additional contact email 3',
        placeholder: 'support@institution.org',
        required: true,
        type: 'email',
      },
      {
        name: 'contactEmailExtra3',
        label: 'Additional contact email 4',
        placeholder: 'info@institution.org',
        required: true,
        type: 'email',
      },
      {
        name: 'contactEmailExtra4',
        label: 'Additional contact email 5',
        placeholder: 'admin@institution.org',
        required: true,
        type: 'email',
      },
    ],
  },
  institutionPhone: {
    min: 0,
    max: 5,
    fields: [
      {
        name: 'contactPhone',
        label: 'Primary contact phone number',
        placeholder: '+1 (555) 123-4567',
        required: false,
        type: 'tel',
      },
      {
        name: 'contactPhoneExtra1',
        label: 'Additional contact phone number 2',
        placeholder: '+1 (555) 234-5678',
        required: true,
        type: 'tel',
      },
      {
        name: 'contactPhoneExtra2',
        label: 'Additional contact phone number 3',
        placeholder: '+1 (555) 345-6789',
        required: true,
        type: 'tel',
      },
      {
        name: 'contactPhoneExtra3',
        label: 'Additional contact phone number 4',
        placeholder: '+1 (555) 456-7890',
        required: true,
        type: 'tel',
      },
      {
        name: 'contactPhoneExtra4',
        label: 'Additional contact phone number 5',
        placeholder: '+1 (555) 567-8901',
        required: true,
        type: 'tel',
      },
    ],
  },
}

const CONTACT_FIELD_NAME_SET = new Set(
  Object.values(CONTACT_GROUP_CONFIG)
    .map((config) => config.fields.map((field) => field.name))
    .flat()
)

const buildContactFields = (group: ContactGroupKey, count: number): FieldConfig[] => {
  const config = CONTACT_GROUP_CONFIG[group]
  return config.fields.slice(0, count).map((template, index) => ({
    name: template.name,
    label: template.label,
    placeholder: template.placeholder,
    required: index === 0 ? template.required : true,
    type: template.type,
    component: 'input',
    group,
    dynamicIndex: index,
  }))
}

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
        component: 'multiselect',
        placeholder: 'Select one or more primary use cases.',
        description: 'Select all that apply. We use this to tailor your workspace setup.',
        options: INSTITUTION_USE_CASE_OPTIONS,
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
Object.values(CONTACT_GROUP_CONFIG).forEach((config) => {
  config.fields.forEach((field) => {
    if (!(field.name in baseFormData)) {
      baseFormData[field.name] = ''
    }
  })
})

export default function RegisterPage() {
  const navigate = useNavigate()
  const { isSignedIn, isLoaded, getToken } = useAuth()
  const { user: clerkUser } = useUser()
  const [searchParams] = useSearchParams()
  const accountTypeParam = (searchParams.get('type') || '').toLowerCase() as AccountTypeKey | ''
  const selectedType = useMemo(() => ACCOUNT_TYPE_CONFIG[accountTypeParam as AccountTypeKey], [accountTypeParam])
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [formData, setFormData] = useState<FormDataState>(baseFormData)

  // Redirect to signup if not authenticated (Clerk)
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate('/signup', { replace: true })
    }
  }, [isLoaded, isSignedIn, navigate])
  const [contactFieldCounts, setContactFieldCounts] = useState<Record<ContactGroupKey, number>>({
    individualEmail: CONTACT_GROUP_CONFIG.individualEmail.min,
    individualPhone: CONTACT_GROUP_CONFIG.individualPhone.min,
    institutionEmail: CONTACT_GROUP_CONFIG.institutionEmail.min,
    institutionPhone: Math.max(CONTACT_GROUP_CONFIG.institutionPhone.min, 1),
  })
  const [error, setError] = useState<string | null>(null)
  const [ageWarning, setAgeWarning] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [submissionNote, setSubmissionNote] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [prefilledContact, setPrefilledContact] = useState(false)

  const steps = selectedType?.steps ?? []
  const currentStep = steps[currentStepIndex]

  const currentFields = useMemo(() => {
    if (!currentStep) return []
    const nonContactFields = currentStep.fields
      .filter((field) => !CONTACT_FIELD_NAME_SET.has(field.name))
      .map((field) => ({ ...field })) as FieldConfig[]

    if (!selectedType) {
      return nonContactFields
    }

    if (currentStep.id === 'contact') {
      if (selectedType.id === 'individual') {
        return [
          ...buildContactFields('individualEmail', contactFieldCounts.individualEmail),
          ...buildContactFields('individualPhone', contactFieldCounts.individualPhone),
          ...nonContactFields,
        ]
      }
      if (selectedType.id === 'institution') {
        return [
          ...buildContactFields('institutionEmail', contactFieldCounts.institutionEmail),
          ...buildContactFields('institutionPhone', contactFieldCounts.institutionPhone),
          ...nonContactFields,
        ]
      }
    }

    return nonContactFields
  }, [contactFieldCounts, currentStep, selectedType])

  useEffect(() => {
    if (!selectedType) {
      navigate('/signup', { replace: true })
    }
  }, [navigate, selectedType])

  useEffect(() => {
    if (!selectedType || prefilledContact) return
    if (typeof window === 'undefined') return

    try {
      const storedContact = localStorage.getItem('academora:pendingSignUpContact')
      const parsed = storedContact ? (JSON.parse(storedContact) as { type?: string; email?: string; phone?: string }) : {}

      const clerkEmail = clerkUser?.primaryEmailAddress?.emailAddress || clerkUser?.emailAddresses?.[0]?.emailAddress
      const clerkFirst = clerkUser?.firstName || ''
      const clerkLast = clerkUser?.lastName || ''

      setFormData((prev) => {
        const next = { ...prev }
        // Email
        const emailToUse = parsed.email || clerkEmail || ''
        if (emailToUse) {
          if (!next.email) next.email = emailToUse
          if (!next.contactEmail) next.contactEmail = emailToUse
        }
        // Phone
        if (parsed.phone) {
          if (!next.contactPhone) next.contactPhone = parsed.phone
          if (!next.phone) next.phone = parsed.phone
        }
        // Names
        if (clerkFirst && !next.givenName) next.givenName = clerkFirst
        if (clerkLast && !next.familyName) next.familyName = clerkLast
        if (!next.contactGivenName && clerkFirst) next.contactGivenName = clerkFirst
        if (!next.contactFamilyName && clerkLast) next.contactFamilyName = clerkLast
        return next
      })
      setContactFieldCounts((prev) => {
        if (!selectedType) return prev
        const nextCounts = { ...prev }
        const haveEmail = parsed.email || clerkEmail
        const havePhone = parsed.phone
        if (haveEmail) {
          if (selectedType.id === 'individual') {
            nextCounts.individualEmail = Math.max(prev.individualEmail, 1)
          } else if (selectedType.id === 'institution') {
            nextCounts.institutionEmail = Math.max(prev.institutionEmail, 1)
          }
        }
        if (havePhone) {
          if (selectedType.id === 'individual') {
            nextCounts.individualPhone = Math.max(prev.individualPhone, 1)
          } else if (selectedType.id === 'institution') {
            nextCounts.institutionPhone = Math.max(prev.institutionPhone, 1)
          }
        }
        return nextCounts
      })
    } catch (storageError) {
      console.warn('Unable to pre-fill onboarding contact details', storageError)
    } finally {
      setPrefilledContact(true)
      try {
        localStorage.removeItem('academora:pendingSignUpContact')
      } catch (cleanupError) {
        console.warn('Unable to clear pending sign-up contact storage', cleanupError)
      }
    }
  }, [prefilledContact, selectedType, clerkUser])

  const handleFieldChange = (name: string, value: string) => {
    setError(null)
    setFormData((prev) => ({ ...prev, [name]: value }))
    if ([
      'dateOfBirth',
      'contactDateOfBirth'
    ].includes(name)) {
      if (!value) {
        setAgeWarning(null)
        return
      }
      const birthDate = new Date(value)
      if (Number.isNaN(birthDate.getTime())) {
        setAgeWarning(null)
        return
      }
      const today = new Date()
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      if (age < 16) {
        setAgeWarning("You're under 16 years old, so you can't continue.")
      } else {
        setAgeWarning(null)
      }
    }
  }

  const handleAddContactField = (group: ContactGroupKey) => {
    setContactFieldCounts((prev) => {
      const config = CONTACT_GROUP_CONFIG[group]
      if (prev[group] >= config.max) {
        return prev
      }
      return { ...prev, [group]: prev[group] + 1 }
    })
  }

  const handleRemoveContactField = (group: ContactGroupKey, fieldName: string) => {
    const config = CONTACT_GROUP_CONFIG[group]
    setContactFieldCounts((prev) => {
      const activeCount = prev[group]
      const index = config.fields.findIndex((field) => field.name === fieldName)
      if (index === -1 || index !== activeCount - 1 || activeCount <= config.min) {
        return prev
      }
      const nextCount = Math.max(config.min, activeCount - 1)
      return { ...prev, [group]: nextCount }
    })
    setFormData((prev) => ({ ...prev, [fieldName]: '' }))
  }

  const validateStep = (fields: FieldConfig[]) => {
    const missingField = fields.find((field) => {
      if (!field.required) return false
      const value = formData[field.name]
      if (field.component === 'multiselect') {
        return parseMultiSelectValue(value).length === 0
      }
      return !value?.trim()
    })
    if (missingField) {
      setError(`${missingField.label} is required`)
      return false
    }
    setError(null)
    return true
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!selectedType || !steps.length || !currentStep || !clerkUser) {
      navigate('/signup')
      return
    }

    if (!validateStep(currentFields)) return

    if (ageWarning) {
      setError("You're under 16 years old, so you can't continue.")
      return
    }

    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1)
      return
    }

    setIsSubmitting(true)
    setError(null)
    setSuccess(false)
    setSubmissionNote(null)

    const submitOnce = async () => {
      try {
        const normalizedAnswers: Record<string, string> = { ...formData }
        const useCaseRaw = formData.useCases as string | undefined
        
        if (useCaseRaw !== undefined) {
          const selectedUseCases = parseMultiSelectValue(useCaseRaw)
          if (selectedUseCases.length > 0) {
            const readable = selectedUseCases
              .map((value) => INSTITUTION_USE_CASE_OPTIONS.find((option) => option.value === value)?.label || value)
              .join(', ')
            normalizedAnswers.useCases = readable
          } else {
            normalizedAnswers.useCases = ''
          }
        }

      const submissionPayload = {
        accountType: selectedType.id,
        answers: normalizedAnswers,
        metadata: {
          completedAt: new Date().toISOString(),
          stepsCompleted: steps.length,
        },
      }

      const response = await onboardingAPI.submit(submissionPayload)
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('academora:lastOnboarding', JSON.stringify(submissionPayload))
          // Mark onboarding completion timestamp to prevent immediate redirect loops
          localStorage.setItem('academora:onboardingComplete', Date.now().toString())
        } catch (storageError) {
          console.warn('Unable to persist onboarding snapshot', storageError)
        }
      }

      if (response?.error) {
        setSubmissionNote('We saved your answers locally. You can revisit settings later if anything looks off.')
      }

      setSuccess(true)

      // Dual-write profile + contact data to Clerk + Neon
      try {
        // Wait a bit to ensure session is fully established
        await new Promise(resolve => setTimeout(resolve, 200))
        // Explicitly get the token before making the API call
        let token = await getToken({ skipCache: true })
        // Retry once if token is not available (session might still be initializing)
        if (!token) {
          await new Promise(resolve => setTimeout(resolve, 300))
          token = await getToken({ skipCache: true })
        }
        if (!token) {
          console.error('[RegisterPage] No Clerk token available for dual-sync after retries')
          throw new Error('Authentication token not available')
        }

        const firstName = selectedType.id === 'individual' ? normalizedAnswers.givenName : normalizedAnswers.contactGivenName
        const lastName = selectedType.id === 'individual' ? normalizedAnswers.familyName : normalizedAnswers.contactFamilyName
        const primaryEmail = selectedType.id === 'individual' ? normalizedAnswers.email : normalizedAnswers.contactEmail
        const emailExtraKeys = selectedType.id === 'individual'
          ? ['emailExtra1', 'emailExtra2']
          : ['contactEmailExtra1', 'contactEmailExtra2', 'contactEmailExtra3', 'contactEmailExtra4']
        const emails = emailExtraKeys
          .map(k => normalizedAnswers[k])
          .filter(v => v && v.trim() && v !== primaryEmail)
        const phoneKeys = selectedType.id === 'individual'
          ? ['phone', 'phoneExtra1', 'phoneExtra2']
          : ['contactPhone', 'contactPhoneExtra1', 'contactPhoneExtra2', 'contactPhoneExtra3', 'contactPhoneExtra4']
        const phoneNumbers = phoneKeys
          .map(k => normalizedAnswers[k])
          .filter(v => v && v.trim())
        const dualPayload: any = {
          firstName,
          lastName,
          primaryEmail,
          emails,
          phoneNumbers,
          accountType: selectedType.id,
          focusArea: normalizedAnswers.focusArea || undefined,
          personaRole: normalizedAnswers.role || undefined,
          organizationName: normalizedAnswers.organizationName || undefined,
          organizationType: normalizedAnswers.organizationType || undefined,
          // Include dateOfBirth directly in payload for syncing to database
          dateOfBirth: normalizedAnswers.dateOfBirth || normalizedAnswers.contactDateOfBirth || undefined,
          onboardingComplete: true,
          metadata: {
            ...(normalizedAnswers.dateOfBirth && { dateOfBirth: normalizedAnswers.dateOfBirth }),
            ...(normalizedAnswers.country && { country: normalizedAnswers.country }),
            ...(normalizedAnswers.preferredLanguage && { preferredLanguage: normalizedAnswers.preferredLanguage }),
          }
        }
        
        // Pass token explicitly to ensure authentication
        await usersAPI.dualSync(dualPayload, token)
      } catch (dualErr: any) {
        console.warn('Dual-sync after onboarding failed:', dualErr?.message || dualErr)
        try {
          // Try fallback sync with explicit token
          const token = await getToken({ skipCache: true })
          if (token) {
            await usersAPI.sync(token)
          } else {
            console.warn('[RegisterPage] No token available for fallback sync')
          }
        } catch (syncErr) {
          console.warn('Fallback sync also failed:', syncErr)
        }
      }

      // Redirect to dashboard after a short delay to allow sync to complete
      setTimeout(() => {
        navigate('/dashboard')
      }, 1200)
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
        console.error('Onboarding submission error:', error)
        setError(errorMessage)
        throw error
      }
    }

    try {
      await submitOnce()
    } catch (firstError: any) {
      console.error('First submission attempt failed:', firstError)
      // Simple retry after short delay for race conditions / transient locks
      await new Promise((resolve) => setTimeout(resolve, 1000))
      try {
        await submitOnce()
      } catch (secondError: any) {
        console.error('Second submission attempt failed:', secondError)
        setError('We\'re wrapping up your account setup. Please try clicking Finish again in a moment.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!selectedType || !currentStep) {
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
            <h3 className="text-xl font-semibold text-gray-900">{currentStep.title}</h3>
            <p className="mt-1 text-sm text-gray-600">{currentStep.subtitle}</p>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {currentFields.map((field) => {
                const fieldValue = formData[field.name] || ''
                const isDateField = field.component !== 'select' && field.component !== 'textarea' && field.component !== 'multiselect' && field.type === 'date'
                const contactGroup = field.group
                const contactConfig = contactGroup ? CONTACT_GROUP_CONFIG[contactGroup] : null
                const activeCount = contactGroup ? contactFieldCounts[contactGroup] : null
                const isEmailGroup = contactGroup ? contactGroup.includes('Email') : false
                const canAdd =
                  !!contactGroup &&
                  !!contactConfig &&
                  activeCount !== null &&
                  field.dynamicIndex === activeCount - 1 &&
                  activeCount < contactConfig.max
                const canRemove =
                  !!contactGroup &&
                  !!contactConfig &&
                  activeCount !== null &&
                  activeCount > contactConfig.min &&
                  field.dynamicIndex === activeCount - 1
                const showOptionalNote = !!contactGroup && field.dynamicIndex === 0 && !field.required
                return (
                  <div
                    key={field.name}
                    className={classNames('space-y-2', field.component === 'multiselect' ? 'md:col-span-2' : '')}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 space-y-2">
                        <label htmlFor={field.name} className="text-sm font-medium text-gray-700">
                          {field.label}
                          {field.required && <span className="text-red-500"> *</span>}
                        </label>
                        {renderField(field, fieldValue, handleFieldChange, isDateField ? ageWarning : null)}
                        {'description' in field && field.description && (
                          <p className="text-xs text-gray-500">{field.description}</p>
                        )}
                        {isDateField && ageWarning && <p className="text-xs text-red-500">{ageWarning}</p>}
                        {showOptionalNote && <p className="text-xs text-gray-400">Optional</p>}
                      </div>
                      {contactGroup && (
                        <div className="flex flex-col gap-2 pt-7">
                          {canAdd && (
                            <button
                              type="button"
                              onClick={() => handleAddContactField(contactGroup)}
                              className="inline-flex items-center gap-1 rounded-full border border-primary-100 bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700 hover:bg-primary-100"
                            >
                              <Plus className="h-4 w-4" />
                              {isEmailGroup ? 'Add email' : 'Add phone'}
                            </button>
                          )}
                          {canRemove && (
                            <button
                              type="button"
                              onClick={() => handleRemoveContactField(contactGroup, field.name)}
                              className="inline-flex items-center gap-1 rounded-full border border-red-100 bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-100"
                            >
                              <MinusCircle className="h-4 w-4" />
                              {isEmailGroup ? 'Remove email' : 'Remove phone'}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
              {currentStep.id === 'contact' && selectedType.id === 'individual' && contactFieldCounts.individualPhone === 0 && (
                <div className="md:col-span-2 flex items-center justify-between rounded-xl border border-dashed border-gray-200 bg-white px-4 py-3">
                  <p className="text-sm text-gray-500">No phone numbers added yet.</p>
                  <button
                    type="button"
                    onClick={() => handleAddContactField('individualPhone')}
                    className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700 hover:bg-primary-100"
                  >
                    <Plus className="h-4 w-4" />
                    Add phone
                  </button>
                </div>
              )}
              {currentStep.id === 'contact' && selectedType.id === 'institution' && contactFieldCounts.institutionPhone === 0 && (
                <div className="md:col-span-2 flex items-center justify-between rounded-xl border border-dashed border-gray-200 bg-white px-4 py-3">
                  <p className="text-sm text-gray-500">No phone numbers added yet.</p>
                  <button
                    type="button"
                    onClick={() => handleAddContactField('institutionPhone')}
                    className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700 hover:bg-primary-100"
                  >
                    <Plus className="h-4 w-4" />
                    Add phone
                  </button>
                </div>
              )}
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
                disabled={isSubmitting || !!ageWarning}
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
  onChange: (name: string, nextValue: string) => void,
  warning: string | null = null
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

  if (field.component === 'multiselect') {
    const selectedValues = parseMultiSelectValue(value)
    const toggleValue = (optionValue: string) => {
      const isSelected = selectedValues.includes(optionValue)
      const nextValues = isSelected
        ? selectedValues.filter((entry) => entry !== optionValue)
        : [...selectedValues, optionValue]
      onChange(field.name, JSON.stringify(nextValues))
    }

    return (
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {field.options.map((option) => {
            const isSelected = selectedValues.includes(option.value)
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleValue(option.value)}
                className={classNames(
                  'rounded-full border px-3 py-1.5 text-xs font-semibold transition',
                  isSelected
                    ? 'border-primary-200 bg-primary-50 text-primary-700 shadow-sm hover:bg-primary-100'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-100'
                )}
              >
                {option.label}
              </button>
            )
          })}
        </div>
        {selectedValues.length > 0 ? (
          <div className="flex flex-wrap gap-2 text-xs text-primary-700">
            {selectedValues.map((selection) => {
              const label = field.options.find((option) => option.value === selection)?.label || selection
              return (
                <span
                  key={selection}
                  className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1 text-primary-700"
                >
                  {label}
                </span>
              )
            })}
          </div>
        ) : (
          <p className="text-xs text-gray-500">
            {field.placeholder || 'Select all that apply to your organization.'}
          </p>
        )}
      </div>
    )
  }

  return (
    <input
      id={field.name}
      name={field.name}
      type={field.type || 'text'}
      value={value}
      max={field.type === 'date' ? new Date().toISOString().split('T')[0] : undefined}
      onChange={(event) => onChange(field.name, event.target.value)}
      placeholder={field.placeholder}
      inputMode={field.type === 'tel' ? 'tel' : undefined}
      className={`${baseClasses} ${warning ? 'border-red-300 focus:border-red-400 focus:ring-red-200' : ''}`}
    />
  )
}


