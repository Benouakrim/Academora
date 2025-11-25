import pool from '../database/pool.js';
import bcrypt from 'bcrypt';
import { getUserOnboarding } from './onboarding.js';

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
export async function createOrUpdateUserFromClerk(clerkUser) {
  try {
    const email = clerkUser.email_addresses?.[0]?.email_address;
    const firstName = clerkUser.first_name;
    const lastName = clerkUser.last_name;
    const clerkId = clerkUser.id;
    const imageUrl = clerkUser.image_url;
    const emailVerified = clerkUser.email_addresses?.[0]?.verification?.status === 'verified';

    if (!email || !clerkId) {
      throw new Error('Email and Clerk ID are required');
    }

    // Check if user exists by clerkId
    let user = await findUserByClerkId(clerkId);
    
    if (user) {
      // Update existing user
      const result = await pool.query(
        `UPDATE users 
         SET email = $1, first_name = $2, last_name = $3, avatar_url = $4, email_verified = $5, updated_at = CURRENT_TIMESTAMP
         WHERE clerk_id = $6
         RETURNING id, email, role, plan_id as "planId", subscription_status as "subscriptionStatus",
                   created_at as "createdAt", username, phone, account_type as "accountType",
                   first_name as "firstName", last_name as "lastName", clerk_id as "clerkId", avatar_url as "avatarUrl"`,
        [email, firstName || null, lastName || null, imageUrl || null, emailVerified, clerkId]
      );
      user = result.rows[0];
    } else {
      // Check if user exists by email (for migration)
      const existingUser = await findUserByEmail(email);
      
      if (existingUser) {
        // Link existing user to Clerk
        const result = await pool.query(
          `UPDATE users 
           SET clerk_id = $1, first_name = COALESCE($2, first_name), last_name = COALESCE($3, last_name), 
               avatar_url = COALESCE($4, avatar_url), email_verified = $5, updated_at = CURRENT_TIMESTAMP
           WHERE email = $6
           RETURNING id, email, role, plan_id as "planId", subscription_status as "subscriptionStatus",
                     created_at as "createdAt", username, phone, account_type as "accountType",
                     first_name as "firstName", last_name as "lastName", clerk_id as "clerkId", avatar_url as "avatarUrl"`,
          [clerkId, firstName || null, lastName || null, imageUrl || null, emailVerified, email]
        );
        user = result.rows[0];
      } else {
        // Create new user
        const base = generateBaseUsername(email);
        const username = await ensureUniqueUsername(base);

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

        const result = await pool.query(
          `INSERT INTO users (email, clerk_id, password, role, username, plan_id, first_name, last_name, avatar_url, email_verified, status)
           VALUES ($1, $2, NULL, $3, $4, $5, $6, $7, $8, $9, $10)
           RETURNING id, email, role, plan_id as "planId", subscription_status as "subscriptionStatus",
                     created_at as "createdAt", username, phone, account_type as "accountType",
                     first_name as "firstName", last_name as "lastName", clerk_id as "clerkId", avatar_url as "avatarUrl"`,
          [email, clerkId, 'user', username, planId, firstName || null, lastName || null, 
           imageUrl || null, emailVerified, 'active']
        );
        user = result.rows[0];
      }
    }

    return user;
  } catch (error) {
    console.error('Error in createOrUpdateUserFromClerk:', error);
    throw error;
  }
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

  // Map fields to database column names
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
       RETURNING id, email, role, created_at as "createdAt", subscription_status as "subscriptionStatus",
                 username, first_name as "firstName", last_name as "lastName", phone, bio, avatar_url as "avatarUrl",
                 account_type as "accountType"`,
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
              username, first_name as "firstName", last_name as "lastName", phone, bio, avatar_url as "avatarUrl",
              account_type as "accountType"
       FROM users WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) return null;

    const user = result.rows[0];
    const onboarding = await getUserOnboarding(userId);
    return { ...user, onboarding };
  } catch (error) {
    throw error;
  }
}
