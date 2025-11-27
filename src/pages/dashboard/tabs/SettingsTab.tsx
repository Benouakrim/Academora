import { FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Settings, Lock, Mail, Phone, Database, Download, Trash2, ShieldAlert, Shield, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { UserProfile, ProfileForm, PasswordForm } from '../types'
import InputField from '../../../components/dashboard/InputField'
import ToggleField from '../../../components/dashboard/ToggleField'
import { profileAPI } from '../../../lib/api'

const inputLightClass = 'rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200'

interface SettingsTabProps {
  user: UserProfile | null
  clerkUser: any
  profileForm: ProfileForm
  passwordForm: PasswordForm
  coreLocked: boolean
  saving: boolean
  error: string | null
  successMessage: string | null
  showPassword: boolean
  showCurrentPassword: boolean
  newEmail: string
  newPhone: string
  emailCode: string
  phoneCode: string
  pendingEmailId: string | null
  pendingPhoneId: string | null
  formattedAccountType: string
  onProfileUpdate: (e: FormEvent) => void
  onToggleCoreLock: () => void
  onChangePassword: () => void
  onAddEmail: () => void
  onVerifyEmail: () => void
  onRemoveEmail: (emailId: string) => void
  onSetPrimaryEmail: (emailId: string) => void
  onAddPhone: () => void
  onVerifyPhone: () => void
  onRemovePhone: (phoneId: string) => void
  onManageData: () => void
  onExportData: () => void
  onDeleteData: () => void
  onDeleteAccountClick: () => void
  onUpdateProfileForm: (updates: Partial<ProfileForm>) => void
  onUpdatePasswordForm: (updates: Partial<PasswordForm>) => void
  onUpdateNewEmail: (value: string) => void
  onUpdateNewPhone: (value: string) => void
  onUpdateEmailCode: (value: string) => void
  onUpdatePhoneCode: (value: string) => void
  onToggleShowPassword: () => void
  onToggleShowCurrentPassword: () => void
}

export function SettingsTab({
  user,
  clerkUser,
  profileForm,
  passwordForm,
  coreLocked,
  saving,
  error,
  successMessage,
  showPassword,
  showCurrentPassword,
  newEmail,
  newPhone,
  emailCode,
  phoneCode,
  pendingEmailId,
  pendingPhoneId,
  formattedAccountType,
  onProfileUpdate,
  onToggleCoreLock,
  onChangePassword,
  onAddEmail,
  onVerifyEmail,
  onRemoveEmail,
  onSetPrimaryEmail,
  onAddPhone,
  onVerifyPhone,
  onRemovePhone,
  onManageData,
  onExportData,
  onDeleteData,
  onDeleteAccountClick,
  onUpdateProfileForm,
  onUpdatePasswordForm,
  onUpdateNewEmail,
  onUpdateNewPhone,
  onUpdateEmailCode,
  onUpdatePhoneCode,
  onToggleShowPassword,
  onToggleShowCurrentPassword,
}: SettingsTabProps) {
  return (
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
        <form onSubmit={onProfileUpdate} className="mt-6 space-y-4">
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/80 p-3 text-xs text-slate-600">
            <span>Core profile fields are {coreLocked ? 'locked' : 'unlocked'}.</span>
            <button
              type="button"
              onClick={onToggleCoreLock}
              className="rounded-md bg-primary-600 px-3 py-1 font-semibold text-white hover:bg-primary-700"
            >{coreLocked ? 'Unlock' : 'Lock'}</button>
          </div>
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
              onChange={(value) => onUpdateProfileForm({ given_name: value })}
              disabled={coreLocked}
            />
            <InputField
              label="Last name"
              value={profileForm.family_name}
              onChange={(value) => onUpdateProfileForm({ family_name: value })}
              disabled={coreLocked}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <InputField
              label="Full name"
              value={profileForm.full_name}
              onChange={(value) => onUpdateProfileForm({ full_name: value })}
            />
            <InputField
              label="Public username"
              value={profileForm.username}
              onChange={(value) => onUpdateProfileForm({ username: value })}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <InputField
              label="Title"
              value={profileForm.title}
              onChange={(value) => onUpdateProfileForm({ title: value })}
            />
            <InputField
              label="Headline"
              value={profileForm.headline}
              onChange={(value) => onUpdateProfileForm({ headline: value })}
            />
          </div>

          <InputField
            label="Date of birth"
            type="date"
            value={profileForm.date_of_birth}
            onChange={(value) => onUpdateProfileForm({ date_of_birth: value })}
            disabled={coreLocked}
          />

          <InputField
            label="Location"
            value={profileForm.location}
            onChange={(value) => onUpdateProfileForm({ location: value })}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <InputField
              label="Email"
              type="email"
              required
              value={profileForm.email}
              onChange={(value) => onUpdateProfileForm({ email: value })}
              disabled={coreLocked}
            />
            <InputField
              label="Phone"
              value={profileForm.phone}
              onChange={(value) => onUpdateProfileForm({ phone: value })}
            />
          </div>

          <div className="grid gap-4">
            <textarea
              className={inputLightClass}
              rows={3}
              placeholder="Bio"
              value={profileForm.bio}
              onChange={(e) => onUpdateProfileForm({ bio: e.target.value })}
            />
            <div className="grid gap-3 md:grid-cols-2">
              <InputField
                label="Website"
                value={profileForm.website_url}
                onChange={(value) => onUpdateProfileForm({ website_url: value })}
              />
              <InputField
                label="LinkedIn"
                value={profileForm.linkedin_url}
                onChange={(value) => onUpdateProfileForm({ linkedin_url: value })}
              />
              <InputField
                label="GitHub"
                value={profileForm.github_url}
                onChange={(value) => onUpdateProfileForm({ github_url: value })}
              />
              <InputField
                label="Twitter / X"
                value={profileForm.twitter_url}
                onChange={(value) => onUpdateProfileForm({ twitter_url: value })}
              />
              <InputField
                label="Portfolio"
                value={profileForm.portfolio_url}
                onChange={(value) => onUpdateProfileForm({ portfolio_url: value })}
              />
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50/80 p-4">
            <p className="text-sm font-semibold text-slate-900">Onboarding preferences</p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <InputField
                label="Persona / role"
                value={profileForm.persona_role}
                onChange={(value) => onUpdateProfileForm({ persona_role: value })}
                disabled={coreLocked}
              />
              <InputField
                label="Focus area"
                value={profileForm.focus_area}
                onChange={(value) => onUpdateProfileForm({ focus_area: value })}
                disabled={coreLocked}
              />
              <InputField
                label="Primary goal"
                value={profileForm.primary_goal}
                onChange={(value) => onUpdateProfileForm({ primary_goal: value })}
                disabled={coreLocked}
              />
              <InputField
                label="Timeline"
                value={profileForm.timeline}
                onChange={(value) => onUpdateProfileForm({ timeline: value })}
                disabled={coreLocked}
              />
              {(profileForm.account_type === 'institution' || profileForm.organization_name) && (
                <InputField
                  label="Organization name"
                  value={profileForm.organization_name}
                  onChange={(value) => onUpdateProfileForm({ organization_name: value })}
                  disabled={coreLocked}
                />
              )}
              {(profileForm.account_type === 'institution' || profileForm.organization_type) && (
                <InputField
                  label="Organization type"
                  value={profileForm.organization_type}
                  onChange={(value) => onUpdateProfileForm({ organization_type: value })}
                  disabled={coreLocked}
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
                onChange={(value) => onUpdateProfileForm({ is_profile_public: value })}
              />
              <ToggleField
                label="Show email"
                checked={profileForm.show_email}
                onChange={(value) => onUpdateProfileForm({ show_email: value })}
              />
              <ToggleField
                label="Show saved items"
                checked={profileForm.show_saved}
                onChange={(value) => onUpdateProfileForm({ show_saved: value })}
              />
              <ToggleField
                label="Show reviews"
                checked={profileForm.show_reviews}
                onChange={(value) => onUpdateProfileForm({ show_reviews: value })}
              />
              <ToggleField
                label="Show socials"
                checked={profileForm.show_socials}
                onChange={(value) => onUpdateProfileForm({ show_socials: value })}
              />
              <ToggleField
                label="Show activity"
                checked={profileForm.show_activity}
                onChange={(value) => onUpdateProfileForm({ show_activity: value })}
              />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Subscription status</label>
              <select
                className={inputLightClass}
                value={profileForm.subscription_status}
                onChange={(e) => onUpdateProfileForm({ subscription_status: e.target.value })}
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
        
        <form onSubmit={async (e) => { e.preventDefault(); onChangePassword(); }} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Current password</label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                className={`${inputLightClass} pr-10`}
                value={passwordForm.currentPassword}
                onChange={(e) => onUpdatePasswordForm({ currentPassword: e.target.value })}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                onClick={onToggleShowCurrentPassword}
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
                minLength={8}
                value={passwordForm.newPassword}
                onChange={(e) => onUpdatePasswordForm({ newPassword: e.target.value })}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                onClick={onToggleShowPassword}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-500">Must be at least 8 characters.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Confirm new password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              className={inputLightClass}
              minLength={8}
              value={passwordForm.confirmPassword}
              onChange={(e) => onUpdatePasswordForm({ confirmPassword: e.target.value })}
              required
            />
          </div>

          <button type="submit" disabled={saving} className="btn-primary w-fit">
            {saving ? 'Updating…' : 'Update password'}
          </button>
        </form>

        {/* Two-Factor Authentication */}
        <div className="mt-6 rounded-2xl bg-slate-50/80 p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary-500" />
                Two-factor authentication (2FA)
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {clerkUser?.twoFactorEnabled 
                  ? 'Extra security is enabled for your account'
                  : 'Add an extra layer of security to your account'}
              </p>
            </div>
            {clerkUser?.twoFactorEnabled ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                <CheckCircle2 className="h-3 w-3" />
                Enabled
              </span>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => window.open('/account?tab=security', '_blank')}
            className="mt-3 inline-flex items-center gap-2 rounded-xl border border-primary-200 bg-primary-50 px-3 py-2 text-xs font-semibold text-primary-600 transition hover:bg-primary-100"
          >
            <Shield className="h-4 w-4" />
            {clerkUser?.twoFactorEnabled ? 'Manage 2FA' : 'Enable 2FA'}
          </button>
        </div>
      </motion.section>

      {/* Email Management */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="rounded-3xl border border-slate-100 bg-white p-6 shadow-md"
      >
        <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Mail className="h-5 w-5 text-primary-500" />
          Email addresses
        </h3>
        <p className="mt-2 text-sm text-slate-500">
          Manage your email addresses for login and communications.
        </p>

        <div className="mt-4 space-y-3">
          {clerkUser?.emailAddresses.map((email: any) => (
            <div key={email.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">{email.emailAddress}</p>
                <div className="mt-1 flex items-center gap-2">
                  {email.id === clerkUser.primaryEmailAddressId && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-2 py-0.5 text-xs font-semibold text-primary-700">
                      Primary
                    </span>
                  )}
                  {email.verification?.status === 'verified' ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                      <CheckCircle2 className="h-3 w-3" />
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                      Pending
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {email.id !== clerkUser.primaryEmailAddressId && email.verification?.status === 'verified' && (
                  <button
                    onClick={() => onSetPrimaryEmail(email.id)}
                    className="text-xs font-medium text-primary-600 hover:text-primary-700"
                  >
                    Set primary
                  </button>
                )}
                {email.id !== clerkUser.primaryEmailAddressId && (
                  <button
                    onClick={() => onRemoveEmail(email.id)}
                    className="text-xs font-medium text-red-500 hover:text-red-600"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add new email */}
        <div className="mt-4 rounded-2xl bg-slate-50/80 p-4">
          <p className="text-sm font-semibold text-slate-900">Add email address</p>
          <div className="mt-3 space-y-3">
            <input
              type="email"
              placeholder="new.email@example.com"
              value={newEmail}
              onChange={(e) => onUpdateNewEmail(e.target.value)}
              className={inputLightClass}
            />
            {pendingEmailId ? (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Enter verification code"
                  value={emailCode}
                  onChange={(e) => onUpdateEmailCode(e.target.value)}
                  className={inputLightClass}
                  maxLength={6}
                />
                <button
                  onClick={onVerifyEmail}
                  disabled={saving}
                  className="btn-primary text-sm w-full"
                >
                  {saving ? 'Verifying...' : 'Verify email'}
                </button>
              </div>
            ) : (
              <button
                onClick={onAddEmail}
                disabled={saving || !newEmail.trim()}
                className="btn-primary text-sm w-full"
              >
                {saving ? 'Sending...' : 'Add email'}
              </button>
            )}
          </div>
        </div>
      </motion.section>

      {/* Phone Management */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="rounded-3xl border border-slate-100 bg-white p-6 shadow-md"
      >
        <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Phone className="h-5 w-5 text-primary-500" />
          Phone numbers
        </h3>
        <p className="mt-2 text-sm text-slate-500">
          Add phone numbers for account recovery and 2FA.
        </p>

        <div className="mt-4 space-y-3">
          {clerkUser?.phoneNumbers.length === 0 && (
            <p className="text-sm text-slate-500">No phone numbers added yet.</p>
          )}
          {clerkUser?.phoneNumbers.map((phone: any) => (
            <div key={phone.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">{phone.phoneNumber}</p>
                <div className="mt-1">
                  {phone.verification?.status === 'verified' ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                      <CheckCircle2 className="h-3 w-3" />
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                      Pending
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => onRemovePhone(phone.id)}
                className="text-xs font-medium text-red-500 hover:text-red-600"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Add new phone */}
        <div className="mt-4 rounded-2xl bg-slate-50/80 p-4">
          <p className="text-sm font-semibold text-slate-900">Add phone number</p>
          <div className="mt-3 space-y-3">
            <input
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={newPhone}
              onChange={(e) => onUpdateNewPhone(e.target.value)}
              className={inputLightClass}
            />
            {pendingPhoneId ? (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Enter verification code"
                  value={phoneCode}
                  onChange={(e) => onUpdatePhoneCode(e.target.value)}
                  className={inputLightClass}
                  maxLength={6}
                />
                <button
                  onClick={onVerifyPhone}
                  disabled={saving}
                  className="btn-primary text-sm w-full"
                >
                  {saving ? 'Verifying...' : 'Verify phone'}
                </button>
              </div>
            ) : (
              <button
                onClick={onAddPhone}
                disabled={saving || !newPhone.trim()}
                className="btn-primary text-sm w-full"
              >
                {saving ? 'Sending...' : 'Add phone'}
              </button>
            )}
          </div>
        </div>
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
            onClick={onManageData}
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
            onClick={onExportData}
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
            onClick={onDeleteData}
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
                  onClick={onDeleteAccountClick}
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
}

