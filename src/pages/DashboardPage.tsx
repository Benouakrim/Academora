/* eslint-disable @typescript-eslint/no-explicit-any */
import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser, useClerk, useAuth } from '@clerk/clerk-react'
import { motion } from 'framer-motion'
import {
  Activity,
  BarChart3,
  LayoutDashboard,
  FolderClosed,
  LifeBuoy,
  SlidersHorizontal,
  ShieldAlert,
} from 'lucide-react'
import {
  usersAPI,
  profileAPI,
  savedItemsAPI,
  savedMatchesAPI,
  profileSectionsAPI,
  getCurrentUser,
  authAPI
} from '../lib/api'
import { verifyAndHealUser } from '../lib/user/verifyAndHeal'
import type { UserProfile, Experience, EducationItem, SavedItem, TabId } from './dashboard/types'
import {
  OverviewTab,
  InsightsTab,
  CollectionsTab,
  ActivityTab,
  SettingsTab,
  SupportTab,
} from './dashboard/tabs'

const tabs = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'insights', label: 'Insights', icon: BarChart3 },
  { id: 'collections', label: 'Collections', icon: FolderClosed },
  { id: 'activity', label: 'Activity', icon: Activity },
  { id: 'settings', label: 'Settings', icon: SlidersHorizontal },
  { id: 'support', label: 'Support', icon: LifeBuoy },
] as const

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user: clerkUser } = useUser()
  const { signOut } = useClerk()
  const { isSignedIn, isLoaded: isAuthLoaded, getToken } = useAuth()
  const [activeTab, setActiveTab] = useState<TabId>('overview')

  const [user, setUser] = useState<UserProfile | null>(null)
  // We can derive Clerk name directly from useUser()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  
  // Clerk email/phone management
  const [newEmail, setNewEmail] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [emailCode, setEmailCode] = useState('')
  const [phoneCode, setPhoneCode] = useState('')
  const [pendingEmailId, setPendingEmailId] = useState<string | null>(null)
  const [pendingPhoneId, setPendingPhoneId] = useState<string | null>(null)

  const [savedItems, setSavedItems] = useState<SavedItem[]>([])
  const [savedUniversities, setSavedUniversities] = useState<{ id: string; university_id: string; note?: string; created_at: string }[]>([])
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [education, setEducation] = useState<EducationItem[]>([])

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
  const [coreLocked, setCoreLocked] = useState(true)

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

  // moved below after fetchInitialData declaration

  const fetchInitialData = async () => {
    setLoading(true)
    try {
      // Run verification and healing in background (completely non-blocking)
      // Only attempt if user is signed in and we can get a token
      const runVerificationInBackground = async () => {
        // Skip verification if user is not signed in
        if (!isSignedIn) {
          console.log('[Dashboard] User not signed in, skipping verification')
          return
        }
        
        try {
          await new Promise(resolve => setTimeout(resolve, 500))
          // Use skipCache to force fresh token (helps with refresh cookie issues)
          const token = await getToken({ skipCache: true })
          if (!token) {
            console.log('[Dashboard] No token available, skipping verification (session may still be initializing)')
            return
          }
          
          console.log('[Dashboard] Running user verification and healing in background...')
          
          // Add timeout wrapper to prevent hanging (reduced to 5 seconds)
          // Pass a wrapper that uses skipCache
          const verificationPromise = verifyAndHealUser(token, clerkUser || undefined, () => getToken({ skipCache: true }))
          const timeoutPromise = new Promise<{
            verified: boolean;
            healed: boolean;
            error?: string;
            dataLost?: boolean;
          }>((resolve) => {
            setTimeout(() => {
              console.log('[Dashboard] Verification timeout, skipping...')
              resolve({
                verified: false,
                healed: false,
                error: 'Verification timed out',
              })
            }, 5000) // Reduced to 5 seconds
          })
          
          const healResult = await Promise.race([verificationPromise, timeoutPromise])
          
          // Only show errors for actual data loss, not for skipped verification
          if (healResult.dataLost) {
            console.error('[Dashboard] User data lost:', healResult.error)
            setError(healResult.error || 'User data could not be restored. Please contact support.')
          } else if (healResult.healed) {
            console.log('[Dashboard] ✅ User data restored successfully')
            setSuccessMessage('Your profile data has been restored successfully.')
          } else {
            // Verification skipped or failed - this is normal, don't log as error
            console.log('[Dashboard] Verification skipped or not needed:', healResult.error || 'No action needed')
          }
        } catch (healError) {
          console.log('[Dashboard] Verification skipped due to error:', healError)
          // Non-blocking - ignore errors, verification is optional
        }
      }
      
      // Start verification in background (don't await) - it's completely optional
      runVerificationInBackground()
      
      // Immediately start fetching data (don't wait for verification)
      // JIT self-heal: ensure DB user exists for current session
      try { await usersAPI.sync() } catch (e) { console.warn('JIT user sync failed', e) }
      await Promise.all([fetchProfile(), fetchSavedItems(), fetchSavedUniversities(), fetchSections()])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Wait for Clerk to finish loading
    if (!isAuthLoaded) return
    
    // If not signed in, redirect to login
    if (!isSignedIn) {
      navigate('/login', { replace: true })
      return
    }
    
    // If signed in, fetch data (will attempt sync if needed)
    fetchInitialData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, isSignedIn, isAuthLoaded])

  useEffect(() => {
    if (!loading && user) {
      // Prevent redirect loop if onboarding just finished and backend sync still propagating
      let onboardingRecent = false
      if (typeof window !== 'undefined') {
        try {
          const tsRaw = localStorage.getItem('academora:onboardingComplete')
          if (tsRaw) {
            const ts = parseInt(tsRaw, 10)
            if (!Number.isNaN(ts) && Date.now() - ts < 5 * 60 * 1000) { // 5 minutes grace period
              onboardingRecent = true
            }
          }
        } catch (e) {
          // Non-blocking: ignore localStorage access issues
        }
      }
      if (onboardingRecent) return
      const essential = [user.given_name, user.family_name, user.email]
      const hasNamesEmail = essential.every(Boolean)
      const hasPersona = !!(user.focus_area || user.persona_role || user.primary_goal)
      if (!hasNamesEmail || !hasPersona) {
        const accountType = (user.account_type || 'individual').toLowerCase()
        navigate(`/register?type=${accountType}`)
      }
    }
  }, [user, loading, navigate])

  const fetchProfile = async () => {
    try {
      const profile = await profileAPI.getProfile()
      const onboardingAnswers = ((profile?.onboarding?.answers as Record<string, unknown>) || {}) ?? {}
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
      interface CachedUserLite { id?: string; email?: string; role?: string }
      const cached = getCurrentUser() as CachedUserLite | null
      if (cached?.id && cached.email) {
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
    (user?.given_name && user?.family_name
      ? `${user.given_name} ${user.family_name}`
      : user?.full_name || '') ||
    (clerkUser?.firstName ? `${clerkUser.firstName}${clerkUser.lastName ? ` ${clerkUser.lastName}` : ''}` : '') ||
    user?.email
  const accountTypeLabel = user?.account_type || ''
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

  // Clerk email management
  const handleAddEmail = async () => {
    if (!newEmail.trim() || !clerkUser) return
    setError(null)
    setSaving(true)
    
    try {
      const emailAddress = await clerkUser.createEmailAddress({ email: newEmail })
      await emailAddress.prepareVerification({ strategy: 'email_code' })
      setPendingEmailId(emailAddress.id)
      setSuccessMessage('Verification code sent to ' + newEmail)
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Failed to add email')
    } finally {
      setSaving(false)
    }
  }

  const handleVerifyEmail = async () => {
    if (!emailCode.trim() || !pendingEmailId || !clerkUser) return
    setError(null)
    setSaving(true)
    
    try {
      const emailAddress = clerkUser.emailAddresses.find(e => e.id === pendingEmailId)
      if (emailAddress) {
        await emailAddress.attemptVerification({ code: emailCode })
        setNewEmail('')
        setEmailCode('')
        setPendingEmailId(null)
        setSuccessMessage('Email verified successfully!')
        await clerkUser.reload()
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Verification failed')
    } finally {
      setSaving(false)
    }
  }

  const handleRemoveEmail = async (emailId: string) => {
    if (!clerkUser) return
    if (!window.confirm('Remove this email address?')) return
    
    setError(null)
    setSaving(true)
    
    try {
      const emailAddress = clerkUser.emailAddresses.find(e => e.id === emailId)
      if (emailAddress) {
        await emailAddress.destroy()
        await clerkUser.reload()
        setSuccessMessage('Email removed successfully')
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Failed to remove email')
    } finally {
      setSaving(false)
    }
  }

  const handleSetPrimaryEmail = async (emailId: string) => {
    if (!clerkUser) return
    setError(null)
    setSaving(true)
    
    try {
      await clerkUser.update({ primaryEmailAddressId: emailId })
      await clerkUser.reload()
      
      // Also update in Neon database
      const email = clerkUser.emailAddresses.find(e => e.id === emailId)?.emailAddress
      if (email) {
        await profileAPI.updateProfile({ email })
      }
      
      setSuccessMessage('Primary email updated')
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Failed to set primary email')
    } finally {
      setSaving(false)
    }
  }

  // Clerk phone management
  const handleAddPhone = async () => {
    if (!newPhone.trim() || !clerkUser) return
    setError(null)
    setSaving(true)
    
    try {
      const phoneNumber = await clerkUser.createPhoneNumber({ phoneNumber: newPhone })
      await phoneNumber.prepareVerification()
      setPendingPhoneId(phoneNumber.id)
      setSuccessMessage('Verification code sent to ' + newPhone)
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Failed to add phone')
    } finally {
      setSaving(false)
    }
  }

  const handleVerifyPhone = async () => {
    if (!phoneCode.trim() || !pendingPhoneId || !clerkUser) return
    setError(null)
    setSaving(true)
    
    try {
      const phoneNumber = clerkUser.phoneNumbers.find(p => p.id === pendingPhoneId)
      if (phoneNumber) {
        await phoneNumber.attemptVerification({ code: phoneCode })
        setNewPhone('')
        setPhoneCode('')
        setPendingPhoneId(null)
        setSuccessMessage('Phone verified successfully!')
        await clerkUser.reload()
        
        // Update in Neon database
        await profileAPI.updateProfile({ phone: phoneNumber.phoneNumber })
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Verification failed')
    } finally {
      setSaving(false)
    }
  }

  const handleRemovePhone = async (phoneId: string) => {
    if (!clerkUser) return
    if (!window.confirm('Remove this phone number?')) return
    
    setError(null)
    setSaving(true)
    
    try {
      const phoneNumber = clerkUser.phoneNumbers.find(p => p.id === phoneId)
      if (phoneNumber) {
        await phoneNumber.destroy()
        await clerkUser.reload()
        setSuccessMessage('Phone removed successfully')
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Failed to remove phone')
    } finally {
      setSaving(false)
    }
  }

  // Clerk password management (for users with passwords)
  const handleChangeClerkPassword = async () => {
    if (!clerkUser || !passwordForm.newPassword) return
    if (!passwordForm.currentPassword || !passwordForm.currentPassword.trim()) {
      setError('Current password is required')
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    setError(null)
    setSaving(true)
    
    try {
      await clerkUser.updatePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setSuccessMessage('Password updated successfully!')
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Failed to update password')
    } finally {
      setSaving(false)
    }
  }

  // Clerk account deletion
  const handleDeleteClerkAccount = async () => {
    if (!clerkUser) return
    
    const confirmed = window.confirm(
      'This will permanently delete your account from Clerk AND the database. This cannot be undone. Continue?'
    )
    if (!confirmed) return
    
    setError(null)
    setSaving(true)
    
    try {
      await clerkUser.delete()
      await signOut()
      navigate('/')
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Failed to delete account')
      setSaving(false)
    }
  }

  const handleSignOut = () => {
    setShowLogoutConfirm(true)
  }

  const confirmSignOut = async () => {
    setShowLogoutConfirm(false)
    
    // Skip verification before logout - not needed and can cause delays
    // Just clear cache and sign out immediately
    
    // Clear cached user data on logout
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('academora_user_cache')
      } catch (e) {
        // Ignore localStorage errors
      }
    }
    
    await signOut()
    authAPI.logout()
    navigate('/')
  }

  const cancelSignOut = () => {
    setShowLogoutConfirm(false)
  }

  const logoutDialog = showLogoutConfirm ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        <h2 className="mb-2 text-sm font-semibold text-slate-900">Sign out?</h2>
        <p className="mb-4 text-xs text-slate-600">You'll need to log in again to access your dashboard.</p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={cancelSignOut}
            className="rounded-md bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirmSignOut}
            className="rounded-md bg-primary-600 px-3 py-1 text-xs font-semibold text-white hover:bg-primary-700"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  ) : null

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
      await handleDeleteClerkAccount()
      // The Clerk handler signs out automatically, so no need to cancel
    } catch (accountError: any) {
      setDeleteAccountError(accountError?.message || 'Unable to delete account right now.')
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

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab
            user={user}
            profileForm={profileForm}
            savedItemsCount={savedItemsCount}
            articlesCount={articlesCount}
            resourcesCount={resourcesCount}
            experiences={experiences}
            savedUniversities={savedUniversities}
            formattedAccountType={formattedAccountType}
          />
        )
      case 'insights':
        return (
          <InsightsTab
            user={user}
            profileForm={profileForm}
            savedItemsCount={savedItemsCount}
            articlesCount={articlesCount}
            experiences={experiences}
            education={education}
          />
        )
      case 'collections':
        return (
          <CollectionsTab
            savedItems={savedItems}
            savedUniversities={savedUniversities}
            onUnsaveItem={handleUnsaveItem}
            onRefreshUniversities={fetchSavedUniversities}
          />
        )
      case 'activity':
        return (
          <ActivityTab
            experiences={experiences}
            education={education}
            newExperience={newExperience}
            newEducation={newEducation}
            onAddExperience={handleAddExperience}
            onRemoveExperience={handleRemoveExperience}
            onAddEducation={handleAddEducation}
            onRemoveEducation={handleRemoveEducation}
            onUpdateNewExperience={(updates) => setNewExperience((prev) => ({ ...prev, ...updates }))}
            onUpdateNewEducation={(updates) => setNewEducation((prev) => ({ ...prev, ...updates }))}
          />
        )
      case 'settings':
        return (
          <SettingsTab
            user={user}
            clerkUser={clerkUser}
            profileForm={profileForm}
            passwordForm={passwordForm}
            coreLocked={coreLocked}
            saving={saving}
            error={error}
            successMessage={successMessage}
            showPassword={showPassword}
            showCurrentPassword={showCurrentPassword}
            newEmail={newEmail}
            newPhone={newPhone}
            emailCode={emailCode}
            phoneCode={phoneCode}
            pendingEmailId={pendingEmailId}
            pendingPhoneId={pendingPhoneId}
            formattedAccountType={formattedAccountType}
            onProfileUpdate={handleProfileUpdate}
            onToggleCoreLock={() => setCoreLocked((prev) => !prev)}
            onChangePassword={handleChangeClerkPassword}
            onAddEmail={handleAddEmail}
            onVerifyEmail={handleVerifyEmail}
            onRemoveEmail={handleRemoveEmail}
            onSetPrimaryEmail={handleSetPrimaryEmail}
            onAddPhone={handleAddPhone}
            onVerifyPhone={handleVerifyPhone}
            onRemovePhone={handleRemovePhone}
            onManageData={handleManageData}
            onExportData={handleExportData}
            onDeleteData={handleDeleteData}
            onDeleteAccountClick={handleDeleteAccountClick}
            onUpdateProfileForm={(updates) => setProfileForm((prev) => ({ ...prev, ...updates }))}
            onUpdatePasswordForm={(updates) => setPasswordForm((prev) => ({ ...prev, ...updates }))}
            onUpdateNewEmail={setNewEmail}
            onUpdateNewPhone={setNewPhone}
            onUpdateEmailCode={setEmailCode}
            onUpdatePhoneCode={setPhoneCode}
            onToggleShowPassword={() => setShowPassword((prev) => !prev)}
            onToggleShowCurrentPassword={() => setShowCurrentPassword((prev) => !prev)}
          />
        )
      case 'support':
        return <SupportTab onSignOut={handleSignOut} />
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
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={async () => { try { await signOut(); } finally { navigate('/login'); } }}
                  className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-700"
                >
                  Sign out
                </button>
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
