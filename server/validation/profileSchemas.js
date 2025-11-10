import { z } from 'zod';

export const updateProfileSchema = z.object({
  email: z.string().email().optional(),
  full_name: z.string().max(200).optional().nullable(),
  given_name: z.string().max(100).optional().nullable(),
  family_name: z.string().max(100).optional().nullable(),
  date_of_birth: z.string().optional().nullable(),
  phone: z.string().max(40).optional().nullable(),
  bio: z.string().max(2000).optional().nullable(),
  avatar_url: z.string().url().optional().nullable(),
  username: z.string().max(60).optional().nullable(),
  title: z.string().max(120).optional().nullable(),
  headline: z.string().max(240).optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  website_url: z.string().url().optional().nullable(),
  linkedin_url: z.string().url().optional().nullable(),
  github_url: z.string().url().optional().nullable(),
  twitter_url: z.string().url().optional().nullable(),
  portfolio_url: z.string().url().optional().nullable(),
  account_type: z.string().optional().nullable(),
  persona_role: z.string().optional().nullable(),
  focus_area: z.string().optional().nullable(),
  primary_goal: z.string().optional().nullable(),
  timeline: z.string().optional().nullable(),
  organization_name: z.string().optional().nullable(),
  organization_type: z.string().optional().nullable(),
  is_profile_public: z.boolean().optional(),
  show_email: z.boolean().optional(),
  show_saved: z.boolean().optional(),
  show_reviews: z.boolean().optional(),
  show_socials: z.boolean().optional(),
  show_activity: z.boolean().optional(),
}).partial();

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6),
});
