import { motion } from 'framer-motion'
import { BarChart3, User, Save, Users, GraduationCap, Sparkles, Compass, BookOpen, FileText, PenSquare, Mail } from 'lucide-react'
import { UserProfile, ProfileForm, Experience, EducationItem } from '../types'
import { DashboardHighlight } from '../components/DashboardHighlight'
import { QuickAction } from '../components/QuickAction'
import DetailField from '../../../components/dashboard/DetailField'

interface OverviewTabProps {
  user: UserProfile | null
  profileForm: ProfileForm
  savedItemsCount: number
  articlesCount: number
  resourcesCount: number
  experiences: Experience[]
  savedUniversities: { id: string; university_id: string; note?: string; created_at: string }[]
  formattedAccountType: string
}

export function OverviewTab({
  user,
  profileForm,
  savedItemsCount,
  articlesCount,
  resourcesCount,
  experiences,
  savedUniversities,
  formattedAccountType,
}: OverviewTabProps) {
  const onboardingAnswers = ((user?.onboarding?.answers as Record<string, unknown>) || {}) ?? {}
  const formatDate = (value?: string | null) => {
    if (!value) return ''
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return ''
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  }
  const getAns = (key: string): string => {
    const v = onboardingAnswers[key]
    return typeof v === 'string' ? v : ''
  }

  const detailRows = [
    {
      label: 'Account type',
      value: formattedAccountType || getAns('accountType') || getAns('account_type'),
    },
    { label: 'First name', value: user?.given_name || getAns('givenName') },
    { label: 'Last name', value: user?.family_name || getAns('familyName') },
    {
      label: 'Date of birth',
      value: formatDate(user?.date_of_birth || getAns('dateOfBirth')),
    },
    { label: 'Contact email', value: getAns('contactEmail') },
    { label: 'Phone', value: user?.phone || getAns('contactPhone') },
    {
      label: 'Persona role',
      value: user?.persona_role || getAns('role') || getAns('organizationType'),
    },
    { label: 'Focus area', value: user?.focus_area || getAns('focusArea') },
    {
      label: 'Primary goal',
      value: user?.primary_goal || getAns('primaryGoal') || getAns('useCases'),
    },
    { label: 'Timeline', value: user?.timeline || getAns('timeline') || getAns('studentVolume') },
    { label: 'Organization', value: user?.organization_name || getAns('organizationName') },
    { label: 'Organization type', value: user?.organization_type || getAns('organizationType') },
  ]

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid gap-6 md:grid-cols-2 xl:grid-cols-4"
      >
        {[
          {
            title: 'Profile completeness',
            value: `${Math.min(100, Math.round((Object.values(profileForm).filter(Boolean).length / 26) * 100))}%`,
            icon: User,
            accent: 'from-primary-500 to-primary-700',
          },
          {
            title: 'Saved items',
            value: savedItemsCount,
            icon: Save,
            accent: 'from-emerald-500 to-emerald-600',
          },
          {
            title: 'Experiences logged',
            value: experiences.length,
            icon: Users,
            accent: 'from-blue-500 to-blue-600',
          },
          {
            title: 'Universities saved',
            value: savedUniversities.length,
            icon: GraduationCap,
            accent: 'from-amber-500 to-orange-500',
          },
        ].map((card) => (
          <motion.div
            key={card.title}
            whileHover={{ y: -4 }}
            className="relative overflow-hidden rounded-3xl bg-white p-6 shadow-lg shadow-primary-500/5"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${card.accent} opacity-10`} />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{card.title}</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">{card.value}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50">
                <card.icon className="h-6 w-6 text-primary-600" />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid gap-6 lg:grid-cols-2"
      >
        <div className="rounded-3xl border border-primary-100 bg-white/90 p-6 shadow-md">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Sparkles className="h-5 w-5 text-primary-500" />
            Personalized quick actions
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Explore the areas you interact with most. We keep this section fresh as your journey evolves.
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <QuickAction icon={Compass} title="University Matcher" description="Refresh your matches" to="/matching-engine" />
            <QuickAction icon={BookOpen} title="Read Articles" description="New guidance weekly" to="/blog" />
            <QuickAction icon={FileText} title="My Articles" description="Review your published work" to="/my-articles" />
            <QuickAction icon={PenSquare} title="Write Article" description="Share your insights with the community" to="/write-article" />
            <QuickAction icon={GraduationCap} title="Orientation Hub" description="Explore curated tracks" to="/orientation" />
            <QuickAction icon={Mail} title="Stay in touch" description="Update your notifications" to="/contact" />
          </div>
        </div>

        <motion.div
          className="rounded-3xl border border-primary-100 bg-white/90 p-6 shadow-md"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <BarChart3 className="h-5 w-5 text-primary-500" />
            Recent highlights
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <DashboardHighlight
              label="Saved items"
              value={`${savedItemsCount} total`}
              accent="bg-primary-100 text-primary-700"
            />
            <DashboardHighlight
              label="Articles read"
              value={`${articlesCount} this month`}
              accent="bg-emerald-100 text-emerald-700"
            />
            <DashboardHighlight
              label="Resources saved"
              value={`${resourcesCount} total`}
              accent="bg-blue-100 text-blue-700"
            />
            <DashboardHighlight
              label="Subscription"
              value={user?.subscription_status === 'premium' ? 'Premium access' : 'Free tier'}
              accent="bg-amber-100 text-amber-700"
            />
          </ul>
        </motion.div>
      </motion.div>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="rounded-3xl border border-slate-100 bg-white p-6 shadow-md"
      >
        <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <User className="h-5 w-5 text-primary-500" />
          Profile snapshot
        </h3>
        <p className="mt-2 text-sm text-slate-500">
          Key details from your onboarding and profile settings. Update anything from the settings tab.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {detailRows.map((row) => (
            <DetailField key={row.label} label={row.label} value={row.value} />
          ))}
        </div>
      </motion.section>
    </div>
  )
}

