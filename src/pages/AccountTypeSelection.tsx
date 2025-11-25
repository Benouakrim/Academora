import { Link, useNavigate } from 'react-router-dom'
import { Building, GraduationCap, Sparkles, Users } from 'lucide-react'

type AccountTypeKey = 'individual' | 'institution'

interface AccountType {
  id: AccountTypeKey
  title: string
  description: string
  highlight: string
  icon: JSX.Element
  benefits: string[]
}

const ACCOUNT_TYPES: Record<AccountTypeKey, AccountType> = {
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
  }
}

export default function AccountTypeSelection() {
  const navigate = useNavigate()

  const handleSelectAccountType = (type: AccountTypeKey) => {
    // Navigate to signup with account type parameter
    navigate(`/signup?type=${type}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <header className="mb-12 flex flex-col gap-4 text-center">
          <Link to="/" className="mx-auto flex items-center gap-3 text-primary-600">
            <GraduationCap className="h-10 w-10" />
            <span className="text-3xl font-semibold tracking-tight">AcademOra</span>
          </Link>
          <div>
            <h1 className="mt-4 text-4xl font-bold text-gray-900 md:text-5xl">
              Choose Your Account Type
            </h1>
            <p className="mt-3 text-lg text-gray-600">
              Select the account type that best fits your needs to get started
            </p>
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          {Object.values(ACCOUNT_TYPES).map((type) => (
            <div
              key={type.id}
              className="group relative cursor-pointer rounded-3xl border-2 border-gray-200 bg-white p-8 shadow-lg transition-all duration-300 hover:border-primary-500 hover:shadow-xl"
              onClick={() => handleSelectAccountType(type.id)}
            >
              <div className="mb-6 flex items-start gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 group-hover:bg-primary-100 transition-colors">
                  {type.icon}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900">{type.title}</h2>
                  <p className="mt-2 text-sm text-gray-600">{type.highlight}</p>
                </div>
              </div>

              <p className="mb-6 text-gray-700">{type.description}</p>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-900">What you'll get:</p>
                <ul className="space-y-2">
                  {type.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-2 text-sm text-gray-600">
                      <Sparkles className="h-4 w-4 text-primary-500" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                className="mt-8 w-full rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-200/50 transition hover:bg-primary-700 group-hover:shadow-xl"
                onClick={(e) => {
                  e.stopPropagation()
                  handleSelectAccountType(type.id)
                }}
              >
                Continue with {type.title}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

