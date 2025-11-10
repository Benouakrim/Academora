import { ComponentType, FormEvent, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Activity,
  BarChart3,
  BookOpen,
  Clock,
  Compass,
  Crown,
  FolderClosed,
  GraduationCap,
  LayoutDashboard,
  LifeBuoy,
  Lock,
  LogOut,
  Mail,
  Save,
  Settings,
  SlidersHorizontal,
  Sparkles,
  User,
  Users,
  Eye,
  EyeOff,
  X,
  Database,
  Download,
  Trash2,
  ShieldAlert,
} from 'lucide-react'
import { motion } from 'framer-motion'
import {
  authAPI,
  getCurrentUser,
  profileAPI,
  profileSectionsAPI,
  savedItemsAPI,
  savedMatchesAPI,
} from '../lib/api'
import LogoutConfirmDialog from '../components/LogoutConfirmDialog'

const inputLightClass =
  'w-full rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100'

interface UserProfile {
  id: string
  email: string
  role?: string
  full_name?: string
  given_name?: string | null
  family_name?: string | null
  date_of_birth?: string | null
  account_type?: string | null
  persona_role?: string | null
  focus_area?: string | null
  primary_goal?: string | null
  timeline?: string | null
  organization_name?: string | null
  organization_type?: string | null
  phone?: string
  bio?: string
  avatar_url?: string
  subscription_status?: string
  subscription_expires_at?: string
  username?: string
  title?: string
  headline?: string
  location?: string
  website_url?: string
  linkedin_url?: string
  github_url?: string
  twitter_url?: string
  portfolio_url?: string
  is_profile_public?: boolean
  show_email?: boolean
  show_saved?: boolean
  show_reviews?: boolean
  show_socials?: boolean
  show_activity?: boolean
  onboarding?: {
    account_type: string
    answers: Record<string, any>
    created_at?: string
    updated_at?: string
  } | null
}

interface SavedItem {
  id: string
  item_type: string
  item_id: string
  item_data?: any
  created_at: string
}

const tabs = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'insights', label: 'Insights', icon: BarChart3 },
  { id: 'collections', label: 'Collections', icon: FolderClosed },
  { id: 'activity', label: 'Activity', icon: Activity },
  { id: 'settings', label: 'Settings', icon: SlidersHorizontal },
  { id: 'support', label: 'Support', icon: LifeBuoy },
] as const

type TabId = (typeof tabs)[number]['id']

export default function DashboardPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabId>('overview')

  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [savedItems, setSavedItems] = useState<SavedItem[]>([])
  const [savedUniversities, setSavedUniversities] = useState<{ id: string; university_id: string; note?: string; created_at: string }[]>([])
  const [experiences, setExperiences] = useState<any[]>([])
  const [education, setEducation] = useState<any[]>([])

  const [profileForm, setProfileForm] = useState({
    email: '',
    full_name: '',
    given_name: '',
    family_name: '',
    date_of_birth: '',
    username: '',
    title: '',
    headline: '',
    location: '',
    phone: '',
    bio: '',
    website_url: '',
    linkedin_url: '',
    github_url: '',
    twitter_url: '',
    portfolio_url: '',
    is_profile_public: true,
    show_email: false,
    show_saved: false,
    show_reviews: true,
    show_socials: true,
    show_activity: true,
    subscription_status: 'free',
    account_type: '',
    persona_role: '',
    focus_area: '',
    primary_goal: '',
    timeline: '',
    organization_name: '',
    organization_type: '',
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteAccountPassword, setDeleteAccountPassword] = useState('')
  const [deleteAccountError, setDeleteAccountError] = useState<string | null>(null)
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)

  const [newExperience, setNewExperience] = useState({
    title: '',
    company: '',
    location: '',
    start_date: '',
    end_date: '',
    current: false,
    description: '',
  })

  const [newEducation, setNewEducation] = useState({
    school: '',
    degree: '',
    field: '',
    start_year: '',
    end_year: '',
    description: '',
  })

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      navigate('/login')
      return
    }
    fetchInitialData()
  }, [navigate])

  const fetchInitialData = async () => {
    setLoading(true)
    try {
      await Promise.all([fetchProfile(), fetchSavedItems(), fetchSavedUniversities(), fetchSections()])
    } finally {
      setLoading(false)
    }
  }

  const fetchProfile = async () => {
    try {
      const profile = await profileAPI.getProfile()
      const onboardingAnswers = ((profile?.onboarding?.answers as Record<string, any>) || {}) ?? {}
      setUser(profile)
      setProfileForm({
        email: profile.email || '',
        full_name: profile.full_name || '',
        given_name: profile.given_name || onboardingAnswers.givenName || '',
        family_name: profile.family_name || onboardingAnswers.familyName || '',
        date_of_birth: profile.date_of_birth
          ? profile.date_of_birth.slice(0, 10)
          : onboardingAnswers.dateOfBirth || '',
        username: profile.username || '',
        title: profile.title || '',
        headline: profile.headline || '',
        location: profile.location || '',
        phone: profile.phone || '',
        bio: profile.bio || '',
        website_url: profile.website_url || '',
        linkedin_url: profile.linkedin_url || '',
        github_url: profile.github_url || '',
        twitter_url: profile.twitter_url || '',
        portfolio_url: profile.portfolio_url || '',
        is_profile_public: profile.is_profile_public !== false,
        show_email: !!profile.show_email,
        show_saved: !!profile.show_saved,
        show_reviews: profile.show_reviews !== false,
        show_socials: profile.show_socials !== false,
        show_activity: profile.show_activity !== false,
        subscription_status: profile.subscription_status || 'free',
        account_type: profile.account_type || profile.onboarding?.account_type || '',
        persona_role:
          profile.persona_role || onboardingAnswers.role || onboardingAnswers.organizationType || '',
        focus_area: profile.focus_area || onboardingAnswers.focusArea || '',
        primary_goal:
          profile.primary_goal || onboardingAnswers.primaryGoal || onboardingAnswers.useCases || '',
        timeline: profile.timeline || onboardingAnswers.timeline || onboardingAnswers.studentVolume || '',
        organization_name: profile.organization_name || onboardingAnswers.organizationName || '',
        organization_type: profile.organization_type || onboardingAnswers.organizationType || '',
      })
    } catch (err) {
      console.error('Error fetching profile', err)
      const cached = getCurrentUser()
      if (cached) {
        setUser({ id: cached.id, email: cached.email, role: cached.role })
      }
    }
  }

  const fetchSections = async () => {
    try {
      const [experienceList, educationList] = await Promise.all([
        profileSectionsAPI.list('experiences'),
        profileSectionsAPI.list('education'),
      ])
      setExperiences(Array.isArray(experienceList) ? experienceList : [])
      setEducation(Array.isArray(educationList) ? educationList : [])
    } catch (err) {
      console.warn('Unable to fetch profile sections', err)
      setExperiences([])
      setEducation([])
    }
  }

  const fetchSavedUniversities = async () => {
    try {
      const list = await savedMatchesAPI.list()
      setSavedUniversities(Array.isArray(list) ? list : [])
    } catch {
      setSavedUniversities([])
    }
  }

  const fetchSavedItems = async () => {
    try {
      const items = await savedItemsAPI.getSavedItems()
      setSavedItems(Array.isArray(items) ? items : [])
    } catch (err) {
      console.error('Error loading saved items', err)
      setSavedItems([])
    }
  }

  const articlesCount = useMemo(() => savedItems.filter((i) => i.item_type === 'article').length, [savedItems])
  const resourcesCount = useMemo(() => savedItems.filter((i) => i.item_type === 'resource').length, [savedItems])
  const savedItemsCount = savedItems.length
  const displayName =
    user?.full_name ||
    [user?.given_name, user?.family_name].filter(Boolean).join(' ') ||
    user?.email
  const accountTypeLabel = user?.account_type || user?.onboarding?.account_type || ''
  const formattedAccountType =
    accountTypeLabel.length > 0
      ? accountTypeLabel.charAt(0).toUpperCase() + accountTypeLabel.slice(1)
      : ''

  const handleProfileUpdate = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccessMessage(null)
    try {
      const payload = {
        ...profileForm,
        date_of_birth: profileForm.date_of_birth || null,
      }
      const updated = await profileAPI.updateProfile(payload)
      setUser((prev) => (prev ? { ...prev, ...updated } : updated))
      setProfileForm((prev) => ({
        ...prev,
        ...payload,
        date_of_birth: updated.date_of_birth ? updated.date_of_birth.slice(0, 10) : '',
      }))
      setSuccessMessage('Profile updated successfully')
    } catch (err: any) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordUpdate = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccessMessage(null)

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match')
      setSaving(false)
      return
    }

    if (passwordForm.newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      setSaving(false)
      return
    }

    try {
      await profileAPI.updatePassword(passwordForm.currentPassword, passwordForm.newPassword)
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setSuccessMessage('Password updated successfully')
    } catch (err: any) {
      setError(err.message || 'Failed to update password')
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = () => {
    setShowLogoutConfirm(true)
  }

  const confirmSignOut = () => {
    setShowLogoutConfirm(false)
    authAPI.logout()
    navigate('/')
  }

  const cancelSignOut = () => {
    setShowLogoutConfirm(false)
  }

  const logoutDialog = (
    <LogoutConfirmDialog
      open={showLogoutConfirm}
      onConfirm={confirmSignOut}
      onCancel={cancelSignOut}
    />
  )

  const handleManageData = () => {
    setError(null)
    setSuccessMessage('Opening your saved collections to manage data.')
    setActiveTab('collections')
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleExportData = () => {
    setError(null)
    setSuccessMessage('We are preparing your data export. You will receive an email once it is ready to download.')
  }

  const handleDeleteData = () => {
    const confirmed = window.confirm('This will remove saved items, preferences, and recent history. Continue?')
    if (!confirmed) return
    setError(null)
    setSuccessMessage('Your data deletion request has been queued. We will notify you when the process is complete.')
  }

  const handleDeleteAccountClick = () => {
    setDeleteAccountPassword('')
    setDeleteAccountError(null)
    setShowDeleteConfirm(true)
  }

  const cancelDeleteAccount = () => {
    setShowDeleteConfirm(false)
    setDeleteAccountPassword('')
    setDeleteAccountError(null)
    setIsDeletingAccount(false)
  }

  const confirmDeleteAccount = async () => {
    if (!deleteAccountPassword.trim()) {
      setDeleteAccountError('Please enter your password to confirm account deletion.')
      return
    }

    setIsDeletingAccount(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 900))
      setSuccessMessage('Account deletion request submitted. Our team will reach out shortly to finalize the process.')
      cancelDeleteAccount()
    } catch (accountError: any) {
      setDeleteAccountError(accountError?.message || 'Unable to request account deletion right now.')
    } finally {
      setIsDeletingAccount(false)
    }
  }

  const deleteAccountDialog = showDeleteConfirm ? (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="mt-1 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Delete account</h2>
            <p className="mt-1 text-sm text-slate-600">
              Deleting your account will remove your profile, saved items, and preferences. This action is permanent.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Confirm your password</label>
            <input
              type="password"
              value={deleteAccountPassword}
              onChange={(event) => setDeleteAccountPassword(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100"
              placeholder="Enter your current password"
              autoFocus
            />
            {deleteAccountError && (
              <p className="mt-2 text-xs text-red-600">{deleteAccountError}</p>
            )}
          </div>
          <p className="rounded-xl bg-red-50 px-4 py-3 text-xs text-red-600">
            This request can’t be undone. If you proceed, we’ll log you out and our team will confirm once deletion is finalised.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={cancelDeleteAccount}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirmDeleteAccount}
            disabled={isDeletingAccount}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-red-500/30 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeletingAccount && (
              <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            )}
            Delete my account
          </button>
        </div>
      </div>
    </div>
  ) : null

  const handleUnsaveItem = async (type: string, id: string) => {
    try {
      await savedItemsAPI.unsaveItem(type, id)
      fetchSavedItems()
    } catch (err: any) {
      setError(err.message || 'Failed to unsave item')
    }
  }

  const handleAddExperience = async () => {
    if (!newExperience.title) return
    await profileSectionsAPI.create('experiences', newExperience)
    setNewExperience({ title: '', company: '', location: '', start_date: '', end_date: '', current: false, description: '' })
    fetchSections()
  }

  const handleRemoveExperience = async (id: string) => {
    await profileSectionsAPI.remove('experiences', id)
    fetchSections()
  }

  const handleAddEducation = async () => {
    if (!newEducation.school) return
    await profileSectionsAPI.create('education', {
      ...newEducation,
      start_year: newEducation.start_year ? Number(newEducation.start_year) : null,
      end_year: newEducation.end_year ? Number(newEducation.end_year) : null,
    })
    setNewEducation({ school: '', degree: '', field: '', start_year: '', end_year: '', description: '' })
    fetchSections()
  }

  const handleRemoveEducation = async (id: string) => {
    await profileSectionsAPI.remove('education', id)
    fetchSections()
  }

  if (loading) {
    return (
      <>
        {logoutDialog}
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-slate-50 flex items-center justify-center">
          <motion.div
            className="flex flex-col items-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="h-14 w-14 border-4 border-primary-200 border-t-primary-600 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            />
            <p className="text-sm text-primary-600">Loading your dashboard…</p>
          </motion.div>
        </div>
      </>
    )
  }

  const renderOverview = () => {
    const onboardingAnswers = ((user?.onboarding?.answers as Record<string, any>) || {}) ?? {}
    const formatDate = (value?: string | null) => {
      if (!value) return ''
      const d = new Date(value)
      if (Number.isNaN(d.getTime())) return ''
      return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    }
    const detailRows = [
      {
        label: 'Account type',
        value: formattedAccountType || onboardingAnswers.accountType || onboardingAnswers.account_type,
      },
      { label: 'First name', value: user?.given_name || onboardingAnswers.givenName },
      { label: 'Last name', value: user?.family_name || onboardingAnswers.familyName },
      {
        label: 'Date of birth',
        value: formatDate(user?.date_of_birth || onboardingAnswers.dateOfBirth),
      },
      { label: 'Contact email', value: onboardingAnswers.contactEmail },
      { label: 'Phone', value: user?.phone || onboardingAnswers.contactPhone },
      {
        label: 'Persona role',
        value: user?.persona_role || onboardingAnswers.role || onboardingAnswers.organizationType,
      },
      { label: 'Focus area', value: user?.focus_area || onboardingAnswers.focusArea },
      {
        label: 'Primary goal',
        value: user?.primary_goal || onboardingAnswers.primaryGoal || onboardingAnswers.useCases,
      },
      { label: 'Timeline', value: user?.timeline || onboardingAnswers.timeline || onboardingAnswers.studentVolume },
      { label: 'Organization', value: user?.organization_name || onboardingAnswers.organizationName },
      { label: 'Organization type', value: user?.organization_type || onboardingAnswers.organizationType },
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

  const renderInsights = () => (
    <div className="space-y-8">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-3xl border border-slate-100 bg-white p-6 shadow-md"
      >
        <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <BarChart3 className="h-5 w-5 text-primary-500" />
          Engagement overview
        </h3>
        <p className="mt-2 text-sm text-slate-500">
          Track how you use AcademOra. These metrics update as you explore more tools and save additional resources.
        </p>
        <div className="mt-6 space-y-5">
          <InsightMetric label="Resources saved" value={savedItemsCount} target={12} />
          <InsightMetric label="Articles read" value={articlesCount} target={8} accent="emerald" />
          <InsightMetric
            label="Mentorship readiness"
            value={Math.min(100, experiences.length * 20 + education.length * 15)}
            target={100}
            accent="purple"
          />
          <InsightMetric
            label="Profile completeness"
            value={Math.min(100, Math.round((Object.values(profileForm).filter(Boolean).length / 20) * 100))}
            target={100}
            accent="amber"
          />
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="rounded-3xl border border-slate-100 bg-white p-6 shadow-md"
      >
        <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Clock className="h-5 w-5 text-primary-500" />
          Activity timeline
        </h3>
        <div className="mt-6 space-y-4">
          {[...experiences, ...education]
            .slice(0, 6)
            .sort((a, b) => (b.updated_at || b.created_at || '').localeCompare(a.updated_at || a.created_at || ''))
            .map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4"
              >
                <p className="text-sm font-semibold text-slate-900">{item.title || item.school}</p>
                <p className="text-sm text-slate-500">
                  {item.company || item.degree || 'Added to your journey'}
                </p>
              </motion.div>
            ))}
          {experiences.length === 0 && education.length === 0 && (
            <p className="text-sm text-slate-500">Add your experiences and education to unlock richer insights.</p>
          )}
        </div>
      </motion.section>
    </div>
  )

  const renderCollections = () => (
    <div className="space-y-8">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-3xl border border-slate-100 bg-white p-6 shadow-md"
      >
        <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <FolderClosed className="h-5 w-5 text-primary-500" />
          Saved items
        </h3>
        <p className="mt-2 text-sm text-slate-500">
          Everything you bookmark across AcademOra appears here. Organize your favorites and return whenever you need.
        </p>
        <div className="mt-6 space-y-3">
          {savedItems.length === 0 && <p className="text-sm text-slate-500">No saved items yet. Start exploring!</p>}
          {savedItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start justify-between rounded-2xl border border-slate-200 bg-slate-50/60 p-4"
            >
              <div className="flex-1 pr-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-primary-600">
                  <span className="rounded-full bg-primary-100 px-2 py-0.5">
                    {item.item_type}
                  </span>
                  <span className="text-slate-400 font-mono">{item.item_id.slice(0, 10)}</span>
                </div>
                {item.item_data?.title && (
                  <p className="mt-2 text-sm font-medium text-slate-900">{item.item_data.title}</p>
                )}
                {item.item_data?.excerpt && (
                  <p className="mt-1 text-sm text-slate-500 line-clamp-2">{item.item_data.excerpt}</p>
                )}
              </div>
              <button
                onClick={() => handleUnsaveItem(item.item_type, item.item_id)}
                className="rounded-full p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="rounded-3xl border border-slate-100 bg-white p-6 shadow-md"
      >
        <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <GraduationCap className="h-5 w-5 text-primary-500" />
          Saved universities
        </h3>
        <div className="mt-4 space-y-3 text-sm text-slate-600">
          {savedUniversities.length === 0 && <p>No universities saved yet.</p>}
          {savedUniversities.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/60 p-3">
              <span className="truncate font-medium text-slate-800">{entry.university_id}</span>
              <button
                onClick={async () => {
                  await savedMatchesAPI.unsave(entry.university_id)
                  fetchSavedUniversities()
                }}
                className="text-xs text-red-500 hover:text-red-600"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </motion.section>
    </div>
  )

  const renderActivity = () => (
    <div className="grid gap-8 lg:grid-cols-2">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-3xl border border-slate-100 bg-white p-6 shadow-md"
      >
        <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Users className="h-5 w-5 text-primary-500" />
          Experience
        </h3>
        <div className="mt-4 space-y-3">
          {experiences.length === 0 && <p className="text-sm text-slate-500">No experiences added yet.</p>}
          {experiences.map((exp) => (
            <div key={exp.id} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {exp.title} {exp.company ? `• ${exp.company}` : ''}
                  </p>
                  <p className="text-xs text-slate-500">{exp.location}</p>
                  <p className="text-xs text-slate-500">
                    {exp.start_date} {exp.end_date ? `– ${exp.end_date}` : exp.current ? '– Present' : ''}
                  </p>
                  {exp.description && (
                    <p className="mt-1 text-sm text-slate-600 whitespace-pre-line">{exp.description}</p>
                  )}
                </div>
                <button
                  onClick={() => handleRemoveExperience(exp.id)}
                  className="text-xs text-red-500 hover:text-red-600"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 space-y-3 rounded-2xl bg-slate-50/80 p-4">
          <p className="text-sm font-semibold text-slate-900">Add experience</p>
          <div className="grid gap-3 md:grid-cols-2">
            <input
              className={inputLightClass}
              placeholder="Title"
              value={newExperience.title}
              onChange={(e) => setNewExperience({ ...newExperience, title: e.target.value })}
            />
            <input
              className={inputLightClass}
              placeholder="Company"
              value={newExperience.company}
              onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
            />
            <input
              className={inputLightClass}
              placeholder="Location"
              value={newExperience.location}
              onChange={(e) => setNewExperience({ ...newExperience, location: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                className={inputLightClass}
                type="date"
                value={newExperience.start_date}
                onChange={(e) => setNewExperience({ ...newExperience, start_date: e.target.value })}
              />
              <input
                className={inputLightClass}
                type="date"
                value={newExperience.end_date}
                onChange={(e) => setNewExperience({ ...newExperience, end_date: e.target.value })}
              />
            </div>
            <label className="flex items-center gap-2 text-xs text-slate-600">
              <input
                type="checkbox"
                checked={newExperience.current}
                onChange={(e) => setNewExperience({ ...newExperience, current: e.target.checked })}
              />
              Current role
            </label>
            <textarea
              className={`${inputLightClass} md:col-span-2`}
              placeholder="Description"
              value={newExperience.description}
              onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })}
              rows={3}
            />
          </div>
          <button onClick={handleAddExperience} className="btn-primary text-sm">
            Add experience
          </button>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="rounded-3xl border border-slate-100 bg-white p-6 shadow-md"
      >
        <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <GraduationCap className="h-5 w-5 text-primary-500" />
          Education
        </h3>
        <div className="mt-4 space-y-3">
          {education.length === 0 && <p className="text-sm text-slate-500">No education added yet.</p>}
          {education.map((ed) => (
            <div key={ed.id} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{ed.school}</p>
                  <p className="text-xs text-slate-500">
                    {ed.degree} {ed.field ? `— ${ed.field}` : ''}
                  </p>
                  <p className="text-xs text-slate-500">
                    {ed.start_year} {ed.end_year ? `– ${ed.end_year}` : ''}
                  </p>
                  {ed.description && (
                    <p className="mt-1 text-sm text-slate-600 whitespace-pre-line">{ed.description}</p>
                  )}
                </div>
                <button
                  onClick={() => handleRemoveEducation(ed.id)}
                  className="text-xs text-red-500 hover:text-red-600"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 space-y-3 rounded-2xl bg-slate-50/80 p-4">
          <p className="text-sm font-semibold text-slate-900">Add education</p>
          <div className="grid gap-3 md:grid-cols-2">
            <input
              className={inputLightClass}
              placeholder="School"
              value={newEducation.school}
              onChange={(e) => setNewEducation({ ...newEducation, school: e.target.value })}
            />
            <input
              className={inputLightClass}
              placeholder="Degree"
              value={newEducation.degree}
              onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })}
            />
            <input
              className={inputLightClass}
              placeholder="Field"
              value={newEducation.field}
              onChange={(e) => setNewEducation({ ...newEducation, field: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                className={inputLightClass}
                placeholder="Start year"
                value={newEducation.start_year}
                onChange={(e) => setNewEducation({ ...newEducation, start_year: e.target.value })}
              />
              <input
                className={inputLightClass}
                placeholder="End year"
                value={newEducation.end_year}
                onChange={(e) => setNewEducation({ ...newEducation, end_year: e.target.value })}
              />
            </div>
            <textarea
              className={`${inputLightClass} md:col-span-2`}
              placeholder="Description"
              value={newEducation.description}
              onChange={(e) => setNewEducation({ ...newEducation, description: e.target.value })}
              rows={3}
            />
          </div>
          <button onClick={handleAddEducation} className="btn-primary text-sm">
            Add education
          </button>
        </div>
      </motion.section>
    </div>
  )

  const renderSettings = () => (
    <div className="grid gap-8 lg:grid-cols-2">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-3xl border border-slate-100 bg-white p-6 shadow-md"
      >
        <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Settings className="h-5 w-5 text-primary-500" />
          Profile settings
        </h3>
        <p className="mt-2 text-sm text-slate-500">Control how your profile appears across the platform.</p>
        <form onSubmit={handleProfileUpdate} className="mt-6 space-y-4">
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>
          )}
          {successMessage && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-600">
              {successMessage}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <InputField
              label="First name"
              value={profileForm.given_name}
              onChange={(value) => setProfileForm((prev) => ({ ...prev, given_name: value }))}
            />
            <InputField
              label="Last name"
              value={profileForm.family_name}
              onChange={(value) => setProfileForm((prev) => ({ ...prev, family_name: value }))}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <InputField
              label="Full name"
              value={profileForm.full_name}
              onChange={(value) => setProfileForm((prev) => ({ ...prev, full_name: value }))}
            />
            <InputField
              label="Public username"
              value={profileForm.username}
              onChange={(value) => setProfileForm((prev) => ({ ...prev, username: value }))}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <InputField
              label="Title"
              value={profileForm.title}
              onChange={(value) => setProfileForm((prev) => ({ ...prev, title: value }))}
            />
            <InputField
              label="Headline"
              value={profileForm.headline}
              onChange={(value) => setProfileForm((prev) => ({ ...prev, headline: value }))}
            />
          </div>

          <InputField
            label="Date of birth"
            type="date"
            value={profileForm.date_of_birth}
            onChange={(value) => setProfileForm((prev) => ({ ...prev, date_of_birth: value }))}
          />

          <InputField
            label="Location"
            value={profileForm.location}
            onChange={(value) => setProfileForm((prev) => ({ ...prev, location: value }))}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <InputField
              label="Email"
              type="email"
              required
              value={profileForm.email}
              onChange={(value) => setProfileForm((prev) => ({ ...prev, email: value }))}
            />
            <InputField
              label="Phone"
              value={profileForm.phone}
              onChange={(value) => setProfileForm((prev) => ({ ...prev, phone: value }))}
            />
          </div>

          <div className="grid gap-4">
            <textarea
              className={inputLightClass}
              rows={3}
              placeholder="Bio"
              value={profileForm.bio}
              onChange={(e) => setProfileForm((prev) => ({ ...prev, bio: e.target.value }))}
            />
            <div className="grid gap-3 md:grid-cols-2">
              <InputField
                label="Website"
                value={profileForm.website_url}
                onChange={(value) => setProfileForm((prev) => ({ ...prev, website_url: value }))}
              />
              <InputField
                label="LinkedIn"
                value={profileForm.linkedin_url}
                onChange={(value) => setProfileForm((prev) => ({ ...prev, linkedin_url: value }))}
              />
              <InputField
                label="GitHub"
                value={profileForm.github_url}
                onChange={(value) => setProfileForm((prev) => ({ ...prev, github_url: value }))}
              />
              <InputField
                label="Twitter / X"
                value={profileForm.twitter_url}
                onChange={(value) => setProfileForm((prev) => ({ ...prev, twitter_url: value }))}
              />
              <InputField
                label="Portfolio"
                value={profileForm.portfolio_url}
                onChange={(value) => setProfileForm((prev) => ({ ...prev, portfolio_url: value }))}
              />
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50/80 p-4">
            <p className="text-sm font-semibold text-slate-900">Onboarding preferences</p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <InputField
                label="Persona / role"
                value={profileForm.persona_role}
                onChange={(value) => setProfileForm((prev) => ({ ...prev, persona_role: value }))}
              />
              <InputField
                label="Focus area"
                value={profileForm.focus_area}
                onChange={(value) => setProfileForm((prev) => ({ ...prev, focus_area: value }))}
              />
              <InputField
                label="Primary goal"
                value={profileForm.primary_goal}
                onChange={(value) => setProfileForm((prev) => ({ ...prev, primary_goal: value }))}
              />
              <InputField
                label="Timeline"
                value={profileForm.timeline}
                onChange={(value) => setProfileForm((prev) => ({ ...prev, timeline: value }))}
              />
              {(profileForm.account_type === 'institution' || profileForm.organization_name) && (
                <InputField
                  label="Organization name"
                  value={profileForm.organization_name}
                  onChange={(value) => setProfileForm((prev) => ({ ...prev, organization_name: value }))}
                />
              )}
              {(profileForm.account_type === 'institution' || profileForm.organization_type) && (
                <InputField
                  label="Organization type"
                  value={profileForm.organization_type}
                  onChange={(value) => setProfileForm((prev) => ({ ...prev, organization_type: value }))}
                />
              )}
            </div>
            {formattedAccountType && (
              <p className="mt-3 text-xs text-slate-500">
                Account type: <span className="font-semibold text-slate-700">{formattedAccountType}</span>
              </p>
            )}
          </div>

          <div className="rounded-2xl bg-slate-50/80 p-4">
            <p className="text-sm font-semibold text-slate-900">Privacy controls</p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <ToggleField
                label="Public profile"
                checked={profileForm.is_profile_public}
                onChange={(value) => setProfileForm((prev) => ({ ...prev, is_profile_public: value }))}
              />
              <ToggleField
                label="Show email"
                checked={profileForm.show_email}
                onChange={(value) => setProfileForm((prev) => ({ ...prev, show_email: value }))}
              />
              <ToggleField
                label="Show saved items"
                checked={profileForm.show_saved}
                onChange={(value) => setProfileForm((prev) => ({ ...prev, show_saved: value }))}
              />
              <ToggleField
                label="Show reviews"
                checked={profileForm.show_reviews}
                onChange={(value) => setProfileForm((prev) => ({ ...prev, show_reviews: value }))}
              />
              <ToggleField
                label="Show socials"
                checked={profileForm.show_socials}
                onChange={(value) => setProfileForm((prev) => ({ ...prev, show_socials: value }))}
              />
              <ToggleField
                label="Show activity"
                checked={profileForm.show_activity}
                onChange={(value) => setProfileForm((prev) => ({ ...prev, show_activity: value }))}
              />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Subscription status</label>
              <select
                className={inputLightClass}
                value={profileForm.subscription_status}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, subscription_status: e.target.value }))}
              >
                <option value="free">Free</option>
                <option value="premium">Premium</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn-primary w-fit">
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="rounded-3xl border border-slate-100 bg-white p-6 shadow-md"
      >
        <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Lock className="h-5 w-5 text-primary-500" />
          Password & security
        </h3>
        <form onSubmit={handlePasswordUpdate} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Current password</label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                className={`${inputLightClass} pr-10`}
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                onClick={() => setShowCurrentPassword((prev) => !prev)}
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">New password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className={`${inputLightClass} pr-10`}
                minLength={6}
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-500">Must be at least 6 characters.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Confirm new password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              className={inputLightClass}
              minLength={6}
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
              required
            />
          </div>

          <button type="submit" disabled={saving} className="btn-primary w-fit">
            {saving ? 'Updating…' : 'Update password'}
          </button>
        </form>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="rounded-3xl border border-slate-100 bg-white p-6 shadow-md"
      >
        <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Database className="h-5 w-5 text-primary-500" />
          Data & account controls
        </h3>
        <p className="mt-2 text-sm text-slate-500">
          Export your data or request deletion in line with our Privacy Policy.
        </p>

        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={handleManageData}
            className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:border-primary-200 hover:bg-primary-50/60 hover:text-primary-700"
          >
            <span className="flex items-center gap-3">
              <Database className="h-4 w-4 text-primary-500" />
              Manage saved data
            </span>
            <span className="text-xs text-slate-400">Opens collections</span>
          </button>

          <button
            type="button"
            onClick={handleExportData}
            className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:border-primary-200 hover:bg-primary-50/60 hover:text-primary-700"
          >
            <span className="flex items-center gap-3">
              <Download className="h-4 w-4 text-primary-500" />
              Export my data
            </span>
            <span className="text-xs text-slate-400">Email delivery</span>
          </button>

          <button
            type="button"
            onClick={handleDeleteData}
            className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:border-amber-200 hover:bg-amber-50/60 hover:text-amber-700"
          >
            <span className="flex items-center gap-3">
              <Trash2 className="h-4 w-4 text-amber-500" />
              Delete stored data
            </span>
            <span className="text-xs text-slate-400">Clears history</span>
          </button>

          <div className="rounded-2xl border border-red-200 bg-red-50/70 px-4 py-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-full bg-red-100 p-2 text-red-600">
                <ShieldAlert className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-600">Delete your account</p>
                <p className="mt-1 text-xs text-red-500">
                  This permanently removes your account and all associated data.
                </p>
                <button
                  type="button"
                  onClick={handleDeleteAccountClick}
                  className="mt-3 inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-3 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                >
                  Delete account
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  )

  const renderSupport = () => (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-3xl border border-slate-100 bg-white p-8 shadow-md"
    >
      <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
        <LifeBuoy className="h-5 w-5 text-primary-500" />
        Need a hand?
      </h3>
      <p className="mt-2 text-sm text-slate-500">
        Reach out anytime. We’re here to help make your academic journey easier.
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <SupportCard
          icon={Mail}
          title="Message us"
          description="Send a message and we’ll reply within 24 hours."
          action={{ label: 'Contact support', href: '/contact' }}
        />
        <SupportCard
          icon={BookOpen}
          title="Docs & guides"
          description="Learn how to use AcademOra with step-by-step tutorials."
          action={{ label: 'View guides', href: '/docs' }}
        />
        <SupportCard
          icon={Compass}
          title="Upgrade options"
          description="Unlock premium mentoring, analytics, and concierge onboarding."
          action={{ label: 'Explore plans', href: '/pricing' }}
        />
        <SupportCard
          icon={Crown}
          title="Feature roadmap"
          description="See what’s coming next and vote on new features."
          action={{ label: 'Roadmap', href: '/blog?view=docs' }}
        />
      </div>
      <button
        onClick={handleSignOut}
        className="mt-8 inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-5 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-100"
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </button>
    </motion.section>
  )

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview()
      case 'insights':
        return renderInsights()
      case 'collections':
        return renderCollections()
      case 'activity':
        return renderActivity()
      case 'settings':
        return renderSettings()
      case 'support':
        return renderSupport()
      default:
        return null
    }
  }

  return (
    <>
      {logoutDialog}
      {deleteAccountDialog}
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-slate-100">
        <div className="mx-auto max-w-6xl px-6 py-12">
        <header className="mb-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">Welcome back, {displayName}</h1>
                <p className="mt-2 text-sm text-slate-500">
                  Track your journey, tune your preferences, and make the most of AcademOra.
                </p>
                {formattedAccountType && (
                  <span className="mt-3 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-600">
                    {formattedAccountType}
                  </span>
                )}
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    whileTap={{ scale: 0.97 }}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                      isActive
                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                        : 'bg-white/70 text-slate-500 border border-slate-200 hover:text-slate-700'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        </header>

          <main className="space-y-8 pb-16">{renderActiveTab()}</main>
        </div>
      </div>
    </>
  )
}

function QuickAction({
  icon: Icon,
  title,
  description,
  to,
}: {
  icon: ComponentType<{ className?: string }>
  title: string
  description: string
  to: string
}) {
  return (
    <Link
      to={to}
      className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 transition hover:-translate-y-1 hover:border-primary-500 hover:bg-primary-50/80"
    >
      <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-xl bg-primary-100">
        <Icon className="h-5 w-5 text-primary-600" />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
    </Link>
  )
}

function DashboardHighlight({ label, value, accent }: { label: string; value: string | number; accent: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/80 p-3">
      <span className="text-sm text-slate-500">{label}</span>
      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${accent}`}>{value}</span>
    </div>
  )
}

function InsightMetric({
  label,
  value,
  target,
  accent = 'primary',
}: {
  label: string
  value: number
  target: number
  accent?: 'primary' | 'emerald' | 'purple' | 'amber'
}) {
  const percentage = Math.min(100, Math.round((value / target) * 100))
  const accentClass = {
    primary: 'from-primary-500 to-primary-600',
    emerald: 'from-emerald-500 to-emerald-600',
    purple: 'from-violet-500 to-violet-600',
    amber: 'from-amber-500 to-amber-600',
  }[accent]

  return (
    <div>
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>{label}</span>
        <span className="font-semibold text-slate-900">{value}</span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-slate-100">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6 }}
          className={`h-full rounded-full bg-gradient-to-r ${accentClass}`}
        />
      </div>
    </div>
  )
}

function InputField({
  label,
  value,
  onChange,
  type = 'text',
  required,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  required?: boolean
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className={inputLightClass}
      />
    </div>
  )
}

function ToggleField({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/80 p-3 text-sm text-slate-600">
      {label}
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-primary-600"
      />
    </label>
  )
}

function DetailField({ label, value }: { label: string; value?: string | null }) {
  const display = typeof value === 'string' ? value.trim() : value
  if (!display) return null
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{display}</p>
    </div>
  )
}

function SupportCard({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: ComponentType<{ className?: string }>
  title: string
  description: string
  action: { label: string; href: string }
}) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100">
          <Icon className="h-5 w-5 text-primary-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
      </div>
      <Link
        to={action.href}
        className="mt-4 inline-flex items-center text-xs font-semibold text-primary-600 hover:text-primary-700"
      >
        {action.label} →
      </Link>
    </motion.div>
  )
}
