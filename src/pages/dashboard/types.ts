export interface Experience {
  id: string
  title: string
  company?: string
  location?: string
  start_date?: string
  end_date?: string
  current?: boolean
  description?: string
  updated_at?: string
  created_at?: string
}

export interface SavedItem {
  id: string
  item_id: string
  item_type: string
  created_at?: string
  note?: string
  item_data?: { title?: string; excerpt?: string }
}

export interface UserProfile {
  id?: string
  email?: string
  given_name?: string
  family_name?: string
  full_name?: string
  date_of_birth?: string
  username?: string
  title?: string
  headline?: string
  location?: string
  phone?: string
  bio?: string
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
  subscription_status?: string
  account_type?: string
  persona_role?: string
  focus_area?: string
  primary_goal?: string
  timeline?: string
  organization_name?: string
  organization_type?: string
  onboarding?: { answers?: Record<string, unknown> }
  role?: string
}

export interface EducationItem {
  id: string
  school: string
  degree?: string
  field?: string
  start_year?: string | number
  end_year?: string | number
  description?: string
  updated_at?: string
  created_at?: string
}

export interface ProfileForm {
  email: string
  full_name: string
  given_name: string
  family_name: string
  date_of_birth: string
  username: string
  title: string
  headline: string
  location: string
  phone: string
  bio: string
  website_url: string
  linkedin_url: string
  github_url: string
  twitter_url: string
  portfolio_url: string
  is_profile_public: boolean
  show_email: boolean
  show_saved: boolean
  show_reviews: boolean
  show_socials: boolean
  show_activity: boolean
  subscription_status: string
  account_type: string
  persona_role: string
  focus_area: string
  primary_goal: string
  timeline: string
  organization_name: string
  organization_type: string
}

export interface PasswordForm {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export type TabId = 'overview' | 'insights' | 'collections' | 'activity' | 'settings' | 'support'

