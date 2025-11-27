import pool from '../database/pool.js';
import bcrypt from 'bcrypt';
import { getUserOnboarding } from './onboarding.js';
import { z } from 'zod';

function generateBaseUsername(email) {
  try {
    const base = String(email).split('@')[0] || 'user'
    return base.toLowerCase().replace(/[^a-z0-9-]+/g, '-')
  } catch { return 'user' }
}

async function ensureUniqueUsername(candidate) {
  let username = candidate
  for (let i = 0; i < 3; i++) {
    const result = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) return username;
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

  // Hash password before storing
  const hashedPassword = await bcrypt.hash(password, 10);

  // Generate unique username
  const base = generateBaseUsername(email)
  const username = await ensureUniqueUsername(base)

  // Determine default plan (free)
  let planId = null;
  try {
    const planResult = await pool.query('SELECT id FROM plans WHERE key = $1', ['free']);
    if (planResult.rows.length > 0) {
      planId = planResult.rows[0].id;
    }
  } catch (planLookupError) {
    console.error('Exception while fetching free plan:', planLookupError);
  }

  // Insert user into database
  try {
    const result = await pool.query(
      `INSERT INTO users (email, password, role, username, plan_id, phone, account_type, first_name, last_name, status, email_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id, email, role, plan_id as "planId", subscription_status as "subscriptionStatus", 
                 created_at as "createdAt", username, account_type as "accountType", 
                 first_name as "firstName", last_name as "lastName", phone`,
      [email, hashedPassword, role || 'user', username, planId, phone || null, accountType || null, 
       givenName || null, familyName || null, 'active', false]
    );

    return result.rows[0];
  } catch (error) {
    // Handle unique constraint violation (duplicate email)
    if (error.code === '23505') {
      throw new Error('User already exists');
    }
    throw error;
  }
}

export async function listUsers() {
  try {
    const result = await pool.query(
      `SELECT id, email, role, created_at as "createdAt", username, avatar_url as "avatarUrl", 
              account_type as "accountType"
       FROM users 
       ORDER BY created_at DESC`
    );
    return result.rows;
  } catch (error) {
    throw error;
  }
}

export async function findUserByEmail(email) {
  try {
    const result = await pool.query(
      `SELECT id, email, password, role, plan_id as "planId", subscription_status as "subscriptionStatus",
              created_at as "createdAt", username, phone, account_type as "accountType",
              first_name as "firstName", last_name as "lastName", clerk_id as "clerkId"
       FROM users WHERE email = $1`,
      [email]
    );
    return result.rows[0] || null;
  } catch (error) {
    throw error;
  }
}

export async function findUserByClerkId(clerkId) {
  try {
    const result = await pool.query(
      `SELECT id, email, password, role, plan_id as "planId", subscription_status as "subscriptionStatus",
              created_at as "createdAt", username, phone, account_type as "accountType",
              first_name as "firstName", last_name as "lastName", clerk_id as "clerkId", avatar_url as "avatarUrl"
       FROM users WHERE clerk_id = $1`,
      [clerkId]
    );
    return result.rows[0] || null;
  } catch (error) {
    throw error;
  }
}

// Create or update user from Clerk webhook
export async function createOrUpdateUserFromClerk(clerkUserData) {
  try {
    // Extract and validate Clerk data
    const email = clerkUserData.email_addresses?.[0]?.email_address || null;
    const phone = clerkUserData.phone_numbers?.[0]?.phone_number || null;
    const clerkId = clerkUserData.id;
    const firstName = clerkUserData.first_name || null;
    const lastName = clerkUserData.last_name || null;
    const avatarUrl = clerkUserData.image_url || null;
    const emailVerified = clerkUserData.email_addresses?.[0]?.verification?.status === 'verified';
    
    // Validate: must have either email or phone (support phone-only accounts)
    if (!clerkId) {
      const errorMsg = `Missing required Clerk data - clerkId: ${clerkId}`;
      console.error('[Clerk Sync Error]', errorMsg);
      throw new Error(errorMsg);
    }

    if (!email && !phone) {
      const errorMsg = `Missing required Clerk data - must have either email or phone. email: ${email}, phone: ${phone}, clerkId: ${clerkId}`;
      console.error('[Clerk Sync Error]', errorMsg);
      throw new Error(errorMsg);
    }
    
    // Generate username: prefer Clerk username, fallback to sanitized email local part or phone-based
    let username = clerkUserData.username;
    if (!username) {
      if (email) {
        const base = generateBaseUsername(email);
        username = await ensureUniqueUsername(base);
      } else if (phone) {
        // For phone-only accounts, generate username from phone (sanitized)
        const phoneBase = phone.replace(/[^0-9]/g, '').slice(-8) || 'user';
        username = await ensureUniqueUsername(`user-${phoneBase}`);
      } else {
        // Fallback: use timestamp-based username
        username = await ensureUniqueUsername(`user-${Date.now().toString().slice(-6)}`);
      }
    }

    const userIdentifier = email || phone || clerkId;
    console.log(`[Clerk Sync] Processing user: ${userIdentifier} (${clerkId})`);

    // Determine default plan (free)
    let planId = null;
    try {
      const planResult = await pool.query('SELECT id FROM plans WHERE key = $1', ['free']);
      if (planResult.rows.length > 0) {
        planId = planResult.rows[0].id;
      }
    } catch (planLookupError) {
      console.error('[Clerk Sync] Warning: Could not fetch free plan:', planLookupError.message);
    }

    // Strategy 1: Check if user exists with this clerkId
    let user = await findUserByClerkId(clerkId);
    
    if (user) {
      console.log(`[Clerk Sync] Updating existing user by clerkId: ${user.id}`);
      const result = await pool.query(
        `UPDATE users 
         SET email = COALESCE($1, email), phone = COALESCE($8, phone), first_name = $2, last_name = $3, avatar_url = $4, 
             email_verified = $5, username = COALESCE($6, username), updated_at = CURRENT_TIMESTAMP
         WHERE clerk_id = $7
         RETURNING id, email, role, plan_id as "planId", subscription_status as "subscriptionStatus",
                   created_at as "createdAt", username, phone, account_type as "accountType",
                   first_name as "firstName", last_name as "lastName", clerk_id as "clerkId", 
                   avatar_url as "avatarUrl", status`,
        [email, firstName, lastName, avatarUrl, emailVerified, username, clerkId, phone]
      );
      return result.rows[0];
    }

    // Strategy 2: Check if legacy user exists by email (migration scenario) - only if email exists
    let existingUser = null;
    if (email) {
      existingUser = await findUserByEmail(email);
      
      if (existingUser && !existingUser.clerkId) {
        console.log(`[Clerk Sync] Linking legacy user to Clerk: ${existingUser.id}`);
        const result = await pool.query(
          `UPDATE users 
           SET clerk_id = $1, 
               first_name = COALESCE($2, first_name), 
               last_name = COALESCE($3, last_name), 
               avatar_url = COALESCE($4, avatar_url), 
               username = COALESCE($5, username),
               email_verified = $6,
               phone = COALESCE($8, phone),
               updated_at = CURRENT_TIMESTAMP
           WHERE email = $7 AND clerk_id IS NULL
           RETURNING id, email, role, plan_id as "planId", subscription_status as "subscriptionStatus",
                     created_at as "createdAt", username, phone, account_type as "accountType",
                     first_name as "firstName", last_name as "lastName", clerk_id as "clerkId", 
                     avatar_url as "avatarUrl", status`,
          [clerkId, firstName, lastName, avatarUrl, username, emailVerified, email, phone]
        );
        
        if (result.rows.length > 0) {
          return result.rows[0];
        }
        // Fallthrough if another process linked the user between our check and update
      }
    }

    // Strategy 3: Create new user
    console.log(`[Clerk Sync] Creating new user for: ${userIdentifier}`);
    if (!username) {
      if (email) {
        const base = generateBaseUsername(email);
        username = await ensureUniqueUsername(base);
      } else if (phone) {
        const phoneBase = phone.replace(/[^0-9]/g, '').slice(-8) || 'user';
        username = await ensureUniqueUsername(`user-${phoneBase}`);
      } else {
        username = await ensureUniqueUsername(`user-${Date.now().toString().slice(-6)}`);
      }
    }

    const result = await pool.query(
      `INSERT INTO users (email, phone, clerk_id, password, role, username, plan_id, first_name, last_name, 
                          avatar_url, email_verified, status)
       VALUES ($1, $2, $3, NULL, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id, email, role, plan_id as "planId", subscription_status as "subscriptionStatus",
                 created_at as "createdAt", username, phone, account_type as "accountType",
                 first_name as "firstName", last_name as "lastName", clerk_id as "clerkId", 
                 avatar_url as "avatarUrl", status`,
      [email, phone, clerkId, 'user', username, planId, firstName, lastName, avatarUrl, emailVerified, 'active']
    );

    console.log(`[Clerk Sync] Successfully created user: ${result.rows[0].id}`);
    return result.rows[0];

  } catch (error) {
    console.error('[Clerk Sync Error] Failed to sync user:', {
      error: error.message,
      stack: error.stack,
      clerkUserId: clerkUserData?.id,
      email: clerkUserData?.email_addresses?.[0]?.email_address,
      code: error.code
    });
    throw error;
  }
}

// Idempotent upsert using ON CONFLICT for dual-write/self-heal
const ClerkUserSchema = z.object({
  id: z.string(),
  email_addresses: z.array(z.object({
    email_address: z.string().email(),
    verification: z.object({ status: z.string().optional() }).optional(),
  })).optional(),
  first_name: z.string().nullable().optional(),
  last_name: z.string().nullable().optional(),
  image_url: z.string().url().nullable().optional(),
  username: z.string().nullable().optional(),
});

export async function syncUserToDb(clerkUserLike) {
  const parsed = ClerkUserSchema.safeParse(clerkUserLike);
  if (!parsed.success) {
    throw new Error(`Invalid Clerk user payload: ${parsed.error.message}`);
  }

  const clerkId = parsed.data.id;
  const email = parsed.data.email_addresses?.[0]?.email_address;
  const firstName = parsed.data.first_name || null;
  const lastName = parsed.data.last_name || null;
  const avatarUrl = parsed.data.image_url || null;
  const emailVerified = parsed.data.email_addresses?.[0]?.verification?.status === 'verified';

  if (!email) {
    // allow accounts without email: store null, but still maintain record
    // some Clerk setups may allow phone-only; we keep minimal record
  }

  // prefer provided username; else generate based on email
  let username = parsed.data.username || null;
  if (!username && email) {
    const base = generateBaseUsername(email);
    username = await ensureUniqueUsername(base);
  }

  // default plan lookup (free)
  let planId = null;
  try {
    const planResult = await pool.query('SELECT id FROM plans WHERE key = $1', ['free']);
    if (planResult.rows.length > 0) planId = planResult.rows[0].id;
  } catch {}

  // Perform upsert on clerk_id to ensure idempotency
  const result = await pool.query(
    `INSERT INTO users (clerk_id, email, role, username, plan_id, first_name, last_name, avatar_url, email_verified, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'active')
     ON CONFLICT (clerk_id)
     DO UPDATE SET 
       email = COALESCE(EXCLUDED.email, users.email),
       first_name = COALESCE(EXCLUDED.first_name, users.first_name),
       last_name = COALESCE(EXCLUDED.last_name, users.last_name),
       avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
       email_verified = COALESCE(EXCLUDED.email_verified, users.email_verified),
       username = COALESCE(EXCLUDED.username, users.username),
       plan_id = COALESCE(EXCLUDED.plan_id, users.plan_id),
       updated_at = CURRENT_TIMESTAMP
     RETURNING id, email, role, plan_id as "planId", subscription_status as "subscriptionStatus",
               created_at as "createdAt", username, phone, account_type as "accountType",
               first_name as "firstName", last_name as "lastName", clerk_id as "clerkId", avatar_url as "avatarUrl", status`,
    [clerkId, email || null, 'user', username, planId, firstName, lastName, avatarUrl, emailVerified]
  );

  return result.rows[0];
}

export async function findUserById(id) {
  try {
    const result = await pool.query(
      `SELECT id, email, role, plan_id as "planId", subscription_status as "subscriptionStatus",
              created_at as "createdAt", username, avatar_url as "avatarUrl", account_type as "accountType",
              first_name as "firstName", last_name as "lastName", phone
       FROM users WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  } catch (error) {
    throw error;
  }
}

export async function verifyPassword(user, password) {
  if (!user.password) {
    return false; // Clerk users don't have passwords
  }
  return await bcrypt.compare(password, user.password);
}

export async function updatePasswordByEmail(email, newPassword) {
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  try {
    const result = await pool.query(
      `UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP
       WHERE email = $2
       RETURNING id, email, role, created_at as "createdAt"`,
      [hashedPassword, email]
    );
    
    if (result.rows.length === 0) {
      throw new Error('User not found');
    }
    
    return result.rows[0];
  } catch (error) {
    if (error.message === 'User not found') {
      throw error;
    }
    throw error;
  }
}

export async function updatePasswordById(userId, currentPassword, newPassword) {
  // Get full user data including password
  const result = await pool.query(
    `SELECT id, email, password, role, created_at as "createdAt", subscription_status as "subscriptionStatus",
            phone, bio, avatar_url as "avatarUrl"
     FROM users WHERE id = $1`,
    [userId]
  );

  if (result.rows.length === 0) {
    throw new Error('User not found');
  }

  const fullUser = result.rows[0];

  // Verify current password
  const isValid = await verifyPassword(fullUser, currentPassword);
  if (!isValid) {
    throw new Error('Current password is incorrect');
  }

  // Update password
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  try {
    const updateResult = await pool.query(
      `UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, email, role, created_at as "createdAt", subscription_status as "subscriptionStatus",
                 phone, bio, avatar_url as "avatarUrl"`,
      [hashedPassword, userId]
    );
    return updateResult.rows[0];
  } catch (error) {
    throw error;
  }
}

export async function updateUserProfile(userId, updates) {
  const updateFields = [];
  const updateValues = [];
  let paramIndex = 1;

  // Map fields to database column names (handle both camelCase and snake_case)
  if (updates.email !== undefined) {
    updateFields.push(`email = $${paramIndex++}`);
    updateValues.push(updates.email);
  }
  if (updates.username !== undefined) {
    updateFields.push(`username = $${paramIndex++}`);
    updateValues.push(updates.username || null);
  }
  if (updates.firstName !== undefined || updates.given_name !== undefined) {
    updateFields.push(`first_name = $${paramIndex++}`);
    updateValues.push(updates.firstName || updates.given_name || null);
  }
  if (updates.lastName !== undefined || updates.family_name !== undefined) {
    updateFields.push(`last_name = $${paramIndex++}`);
    updateValues.push(updates.lastName || updates.family_name || null);
  }
  if (updates.fullName !== undefined || updates.full_name !== undefined) {
    updateFields.push(`full_name = $${paramIndex++}`);
    updateValues.push(updates.fullName || updates.full_name || null);
  }
  if (updates.phone !== undefined) {
    updateFields.push(`phone = $${paramIndex++}`);
    updateValues.push(updates.phone || null);
  }
  if (updates.bio !== undefined) {
    updateFields.push(`bio = $${paramIndex++}`);
    updateValues.push(updates.bio || null);
  }
  if (updates.avatarUrl !== undefined || updates.avatar_url !== undefined) {
    updateFields.push(`avatar_url = $${paramIndex++}`);
    updateValues.push(updates.avatarUrl || updates.avatar_url || null);
  }
  if (updates.dateOfBirth !== undefined || updates.date_of_birth !== undefined) {
    updateFields.push(`date_of_birth = $${paramIndex++}`);
    updateValues.push(updates.dateOfBirth || updates.date_of_birth || null);
  }
  if (updates.title !== undefined) {
    updateFields.push(`title = $${paramIndex++}`);
    updateValues.push(updates.title || null);
  }
  if (updates.headline !== undefined) {
    updateFields.push(`headline = $${paramIndex++}`);
    updateValues.push(updates.headline || null);
  }
  if (updates.location !== undefined) {
    updateFields.push(`location = $${paramIndex++}`);
    updateValues.push(updates.location || null);
  }
  if (updates.websiteUrl !== undefined || updates.website_url !== undefined) {
    updateFields.push(`website_url = $${paramIndex++}`);
    updateValues.push(updates.websiteUrl || updates.website_url || null);
  }
  if (updates.linkedinUrl !== undefined || updates.linkedin_url !== undefined) {
    updateFields.push(`linkedin_url = $${paramIndex++}`);
    updateValues.push(updates.linkedinUrl || updates.linkedin_url || null);
  }
  if (updates.githubUrl !== undefined || updates.github_url !== undefined) {
    updateFields.push(`github_url = $${paramIndex++}`);
    updateValues.push(updates.githubUrl || updates.github_url || null);
  }
  if (updates.twitterUrl !== undefined || updates.twitter_url !== undefined) {
    updateFields.push(`twitter_url = $${paramIndex++}`);
    updateValues.push(updates.twitterUrl || updates.twitter_url || null);
  }
  if (updates.portfolioUrl !== undefined || updates.portfolio_url !== undefined) {
    updateFields.push(`portfolio_url = $${paramIndex++}`);
    updateValues.push(updates.portfolioUrl || updates.portfolio_url || null);
  }
  if (updates.personaRole !== undefined || updates.persona_role !== undefined) {
    updateFields.push(`persona_role = $${paramIndex++}`);
    updateValues.push(updates.personaRole || updates.persona_role || null);
  }
  if (updates.focusArea !== undefined || updates.focus_area !== undefined) {
    updateFields.push(`focus_area = $${paramIndex++}`);
    updateValues.push(updates.focusArea || updates.focus_area || null);
  }
  if (updates.primaryGoal !== undefined || updates.primary_goal !== undefined) {
    updateFields.push(`primary_goal = $${paramIndex++}`);
    updateValues.push(updates.primaryGoal || updates.primary_goal || null);
  }
  if (updates.timeline !== undefined) {
    updateFields.push(`timeline = $${paramIndex++}`);
    updateValues.push(updates.timeline || null);
  }
  if (updates.organizationName !== undefined || updates.organization_name !== undefined) {
    updateFields.push(`organization_name = $${paramIndex++}`);
    updateValues.push(updates.organizationName || updates.organization_name || null);
  }
  if (updates.organizationType !== undefined || updates.organization_type !== undefined) {
    updateFields.push(`organization_type = $${paramIndex++}`);
    updateValues.push(updates.organizationType || updates.organization_type || null);
  }
  if (updates.isProfilePublic !== undefined || updates.is_profile_public !== undefined) {
    updateFields.push(`is_profile_public = $${paramIndex++}`);
    updateValues.push(updates.isProfilePublic ?? updates.is_profile_public ?? true);
  }
  if (updates.showEmail !== undefined || updates.show_email !== undefined) {
    updateFields.push(`show_email = $${paramIndex++}`);
    updateValues.push(updates.showEmail ?? updates.show_email ?? false);
  }
  if (updates.showSaved !== undefined || updates.show_saved !== undefined) {
    updateFields.push(`show_saved = $${paramIndex++}`);
    updateValues.push(updates.showSaved ?? updates.show_saved ?? false);
  }
  if (updates.showReviews !== undefined || updates.show_reviews !== undefined) {
    updateFields.push(`show_reviews = $${paramIndex++}`);
    updateValues.push(updates.showReviews ?? updates.show_reviews ?? true);
  }
  if (updates.showSocials !== undefined || updates.show_socials !== undefined) {
    updateFields.push(`show_socials = $${paramIndex++}`);
    updateValues.push(updates.showSocials ?? updates.show_socials ?? true);
  }
  if (updates.showActivity !== undefined || updates.show_activity !== undefined) {
    updateFields.push(`show_activity = $${paramIndex++}`);
    updateValues.push(updates.showActivity ?? updates.show_activity ?? true);
  }
  if (updates.subscriptionStatus !== undefined || updates.subscription_status !== undefined) {
    updateFields.push(`subscription_status = $${paramIndex++}`);
    updateValues.push(updates.subscriptionStatus || updates.subscription_status);
  }
  if (updates.accountType !== undefined || updates.account_type !== undefined) {
    updateFields.push(`account_type = $${paramIndex++}`);
    updateValues.push(updates.accountType || updates.account_type || null);
  }

  if (updateFields.length === 0) {
    throw new Error('No fields to update');
  }

  updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
  updateValues.push(userId);

  try {
    const result = await pool.query(
      `UPDATE users SET ${updateFields.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING id, email, role, created_at, subscription_status,
                 username, first_name, last_name, full_name,
                 phone, bio, avatar_url, account_type,
                 date_of_birth, title, headline, location,
                 website_url, linkedin_url, github_url,
                 twitter_url, portfolio_url,
                 persona_role, focus_area, primary_goal,
                 timeline, organization_name, organization_type,
                 is_profile_public, show_email, show_saved,
                 show_reviews, show_socials, show_activity`,
      updateValues
    );

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    return result.rows[0];
  } catch (error) {
    if (error.code === '23505') {
      throw new Error('Email already exists');
    }
    throw error;
  }
}

export async function getUserProfile(userId) {
  try {
    const result = await pool.query(
      `SELECT id, email, role, created_at as "createdAt", subscription_status as "subscriptionStatus",
              username, first_name, last_name, full_name,
              phone, bio, avatar_url, account_type,
              date_of_birth, title, headline, location,
              website_url, linkedin_url, github_url,
              twitter_url, portfolio_url,
              persona_role, focus_area, primary_goal,
              timeline, organization_name, organization_type,
              is_profile_public, show_email, show_saved,
              show_reviews, show_socials, show_activity
       FROM users WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) return null;

    const user = result.rows[0];
    const onboarding = await getUserOnboarding(userId);
    
    // Add aliases for compatibility (Dashboard expects both snake_case and given_name/family_name)
    return { 
      ...user, 
      onboarding,
      // Aliases for frontend compatibility
      given_name: user.first_name,
      family_name: user.last_name,
      avatar_url: user.avatar_url,
    };
  } catch (error) {
    throw error;
  }
}
