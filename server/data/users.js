import supabase from '../database/supabase.js';
import bcrypt from 'bcrypt';
import { getUserOnboarding } from './onboarding.js';

function generateBaseUsername(email) {
  try {
    const base = String(email).split('@')[0] || 'user'
    return base.toLowerCase().replace(/[^a-z0-9\-]+/g, '-')
  } catch { return 'user' }
}

async function ensureUniqueUsername(candidate) {
  let username = candidate
  for (let i = 0; i < 3; i++) {
    const { data, error } = await supabase.from('users').select('id').eq('username', username).maybeSingle()
    if (!error && !data) return username
    username = `${candidate}-${Math.random().toString(36).slice(2, 6)}`
  }
  return `${candidate}-${Date.now().toString().slice(-4)}`
}

export async function createUser(optionsOrEmail, maybePassword, maybeRole = 'user') {
  const options =
    typeof optionsOrEmail === 'object'
      ? optionsOrEmail
      : {
          email: optionsOrEmail,
          password: maybePassword,
          role: maybeRole,
        };

  const {
    email,
    password,
    role = 'user',
    phone = null,
    accountType = null,
    referredByCode = null,
    givenName = null,
    familyName = null,
    dateOfBirth = null,
    personaRole = null,
    focusArea = null,
    primaryGoal = null,
    timeline = null,
    organizationName = null,
    organizationType = null,
  } = options;

  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  try {
    // Hash password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate unique username
    const base = generateBaseUsername(email)
    const username = await ensureUniqueUsername(base)

    // Determine default plan (free)
    let planId = null;
    try {
      const { data: planData, error: planError } = await supabase
        .from('plans')
        .select('id')
        .eq('key', 'free')
        .maybeSingle();
      if (planError) {
        console.error('Failed to fetch free plan for new user:', planError);
      }
      planId = planData?.id || null;
    } catch (planLookupError) {
      console.error('Exception while fetching free plan:', planLookupError);
    }

    // Insert user into Supabase
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          email,
          phone: phone ? String(phone).trim() : null,
          password: hashedPassword,
          role: role || 'user', // Default to 'user' role
          username,
          plan_id: planId,
          account_type: accountType || null,
          referred_by_code: referredByCode || null,
          given_name: givenName || null,
          family_name: familyName || null,
          date_of_birth: dateOfBirth || null,
          full_name: [givenName, familyName].filter(Boolean).join(' ') || null,
          persona_role: personaRole || null,
          focus_area: focusArea || null,
          primary_goal: primaryGoal || null,
          timeline: timeline || null,
          organization_name: organizationName || null,
          organization_type: organizationType || null,
        },
      ])
      .select(
        'id, email, role, plan_id, subscription_status, created_at, username, account_type, given_name, family_name, date_of_birth, phone, full_name, persona_role, focus_area, primary_goal, timeline, organization_name, organization_type'
      )
      .single();

    if (error) {
      // Handle unique constraint violation (duplicate email)
      if (error.code === '23505') {
        throw new Error('User already exists');
      }
      throw error;
    }

    return data;
  } catch (error) {
    throw error;
  }
}

export async function listUsers() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, role, created_at, username, full_name, avatar_url, last_seen, account_type')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    throw error;
  }
}

export async function findUserByEmail(email) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(
        'id, email, password, role, plan_id, subscription_status, created_at, username, phone, account_type, given_name, family_name, date_of_birth'
      )
      .eq('email', email)
      .single();

    if (error) {
      // If no rows found, return null
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data || null;
  } catch (error) {
    throw error;
  }
}

export async function findUserById(id) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(
        'id, email, role, plan_id, subscription_status, created_at, username, full_name, avatar_url, account_type, given_name, family_name, date_of_birth, phone'
      )
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data || null;
  } catch (error) {
    throw error;
  }
}

export async function verifyPassword(user, password) {
  return await bcrypt.compare(password, user.password);
}

export async function updatePasswordByEmail(email, newPassword) {
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const { data, error } = await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('email', email)
      .select('id, email, role, created_at')
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
}

export async function updatePasswordById(userId, currentPassword, newPassword) {
  try {
    const user = await findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Get full user data including password
    const { data: fullUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (fetchError) throw fetchError;

    // Verify current password
    const isValid = await verifyPassword(fullUser, currentPassword);
    if (!isValid) {
      throw new Error('Current password is incorrect');
    }

    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const { data, error } = await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('id', userId)
      .select('id, email, role, created_at, subscription_status, full_name, phone, bio, avatar_url')
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
}

export async function updateUserProfile(userId, updates) {
  try {
    const updateData = {};
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.full_name !== undefined) updateData.full_name = updates.full_name || null;
    if (updates.given_name !== undefined) updateData.given_name = updates.given_name || null;
    if (updates.family_name !== undefined) updateData.family_name = updates.family_name || null;
    if (updates.date_of_birth !== undefined) updateData.date_of_birth = updates.date_of_birth || null;
    if (updates.username !== undefined) updateData.username = updates.username || null;
    if (updates.title !== undefined) updateData.title = updates.title || null;
    if (updates.headline !== undefined) updateData.headline = updates.headline || null;
    if (updates.location !== undefined) updateData.location = updates.location || null;
    if (updates.phone !== undefined) updateData.phone = updates.phone || null;
    if (updates.bio !== undefined) updateData.bio = updates.bio || null;
    if (updates.avatar_url !== undefined) updateData.avatar_url = updates.avatar_url || null;
    if (updates.website_url !== undefined) updateData.website_url = updates.website_url || null;
    if (updates.linkedin_url !== undefined) updateData.linkedin_url = updates.linkedin_url || null;
    if (updates.github_url !== undefined) updateData.github_url = updates.github_url || null;
    if (updates.twitter_url !== undefined) updateData.twitter_url = updates.twitter_url || null;
    if (updates.portfolio_url !== undefined) updateData.portfolio_url = updates.portfolio_url || null;
    if (updates.subscription_status !== undefined) updateData.subscription_status = updates.subscription_status;
    if (updates.subscription_expires_at !== undefined) updateData.subscription_expires_at = updates.subscription_expires_at || null;
    if (updates.account_type !== undefined) updateData.account_type = updates.account_type || null;
    if (updates.persona_role !== undefined) updateData.persona_role = updates.persona_role || null;
    if (updates.focus_area !== undefined) updateData.focus_area = updates.focus_area || null;
    if (updates.primary_goal !== undefined) updateData.primary_goal = updates.primary_goal || null;
    if (updates.timeline !== undefined) updateData.timeline = updates.timeline || null;
    if (updates.organization_name !== undefined) updateData.organization_name = updates.organization_name || null;
    if (updates.organization_type !== undefined) updateData.organization_type = updates.organization_type || null;
    // privacy
    if (updates.is_profile_public !== undefined) updateData.is_profile_public = !!updates.is_profile_public;
    if (updates.show_email !== undefined) updateData.show_email = !!updates.show_email;
    if (updates.show_saved !== undefined) updateData.show_saved = !!updates.show_saved;
    if (updates.show_reviews !== undefined) updateData.show_reviews = !!updates.show_reviews;
    if (updates.show_socials !== undefined) updateData.show_socials = !!updates.show_socials;
    if (updates.show_activity !== undefined) updateData.show_activity = !!updates.show_activity;

    if (
      (updates.given_name !== undefined || updates.family_name !== undefined) &&
      updates.full_name === undefined
    ) {
      const composedName = [updates.given_name ?? null, updates.family_name ?? null]
        .filter((part) => typeof part === 'string' && part.trim().length > 0)
        .join(' ');
      updateData.full_name = composedName || null;
    }

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select(
        'id, email, role, created_at, subscription_status, subscription_expires_at, full_name, given_name, family_name, date_of_birth, username, title, headline, location, phone, bio, avatar_url, website_url, linkedin_url, github_url, twitter_url, portfolio_url, is_profile_public, show_email, show_saved, show_reviews, show_socials, show_activity, account_type, persona_role, focus_area, primary_goal, timeline, organization_name, organization_type'
      )
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error('Email already exists');
      }
      throw error;
    }
    return data;
  } catch (error) {
    throw error;
  }
}

export async function getUserProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(
        'id, email, role, created_at, subscription_status, subscription_expires_at, full_name, given_name, family_name, date_of_birth, username, title, headline, location, phone, bio, avatar_url, website_url, linkedin_url, github_url, twitter_url, portfolio_url, is_profile_public, show_email, show_saved, show_reviews, show_socials, show_activity, account_type, persona_role, focus_area, primary_goal, timeline, organization_name, organization_type'
      )
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    const onboarding = await getUserOnboarding(userId);
    return { ...data, onboarding };
  } catch (error) {
    throw error;
  }
}