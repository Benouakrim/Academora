import express from 'express';
import { createUser, findUserByEmail, verifyPassword, updatePasswordByEmail } from '../data/users.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '../services/email.js';
import fetch from 'node-fetch';
import { parseUserToken, requireUser } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { signupSchema, loginSchema, forgotSchema, resetSchema } from '../validation/authSchemas.js';
import { referrals } from '../data/referrals.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Simple in-memory store for password reset tokens (for dev only)
// Structure: { email: { token: string, expires: number } }
const resetTokens = new Map();

// Sign up
router.post('/signup', validate(signupSchema), async (req, res) => {
  try {
    const { identifier, email: bodyEmail, phone: bodyPhone, password, accountType, referralCode } = req.validated;
    const normalizedIdentifier = identifier ? String(identifier).trim() : '';

    if (!normalizedIdentifier && !bodyEmail) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    let email = bodyEmail ? String(bodyEmail).toLowerCase() : null;
    let phone = bodyPhone || null;

    if (normalizedIdentifier) {
      if (emailRegex.test(normalizedIdentifier)) {
        email = normalizedIdentifier.toLowerCase();
      } else {
        phone = normalizedIdentifier;
      }
    }

    if (!email) {
      return res.status(400).json({ error: 'Please provide a valid email address' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Validate referral code if provided
    let validReferralCode = null;
    if (referralCode) {
      const validation = await referrals.validateCode(referralCode);
      if (!validation.valid) {
        return res.status(400).json({ error: validation.error || 'Invalid referral code' });
      }
      validReferralCode = referralCode;
    }

    // Create user with 'user' role by default
    const user = await createUser({
      email,
      password,
      role: 'user',
      phone,
      accountType: accountType || null,
      referredByCode: validReferralCode,
    });

    // Create referral relationship if referral code was used
    if (validReferralCode) {
      try {
        await referrals.createReferral(validReferralCode, user.id);
      } catch (referralError) {
        // Log error but don't fail signup
        console.error('Failed to create referral relationship:', referralError);
      }
    }

    const tokenPayload = {
      id: user.id,
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    const token = jwt.sign(tokenPayload, JWT_SECRET);

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        account_type: user.account_type,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.validated;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await findUserByEmail(email);

    if (!user || !(await verifyPassword(user, password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Include role in JWT token
    const tokenPayload = {
      id: user.id,
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    const token = jwt.sign(tokenPayload, JWT_SECRET);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        account_type: user.account_type,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current user (protected route) - Now uses Clerk
router.get('/me', requireUser, async (req, res) => {
  try {
    const { getCurrentUser } = await import('../middleware/auth.js');
    const user = await getCurrentUser(req);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      plan: user.planId || user.plan,
      subscription_status: user.subscriptionStatus,
      clerkId: user.clerkId,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Request password reset (dev implementation: logs token link to console)
router.post('/forgot', validate(forgotSchema), async (req, res) => {
  try {
    const { email } = req.validated;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await findUserByEmail(email);
    // Always respond with success to avoid leaking whether email exists
    if (!user) {
      console.log(`Password reset requested for non-existent email: ${email}`);
      return res.json({ message: 'If the email exists, a reset link was sent' });
    }

    // Generate secure random token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = Date.now() + 1000 * 60 * 60; // 1 hour
    resetTokens.set(email, { token, expires });

    // Use FRONTEND_URL if provided, otherwise use current host or default to localhost:5173
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetLink = `${frontendUrl.replace(/\/$/, '')}/password/reset?email=${encodeURIComponent(email)}&token=${token}`;

    console.log(`Generated reset token for ${email}: ${token}`);
    console.log(`Reset link: ${resetLink}`);

    // Check if Mailjet is configured
    const mailjetConfigured = process.env.MAILJET_API_KEY && process.env.MAILJET_API_SECRET;
    
    if (mailjetConfigured) {
      // Send reset email using Mailjet
      const emailSent = await sendPasswordResetEmail(email, resetLink);
      
      if (!emailSent) {
        console.warn('Failed to send password reset email via Mailjet, but user can use the console link');
      }
    } else {
      console.warn('Mailjet not configured - user must use the console link for development');
    }

    return res.json({ 
      message: 'If the email exists, a reset link was sent',
      devNote: mailjetConfigured ? 'Email sent via Mailjet' : 'Check server console for reset link (development mode)'
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Perform password reset using token
router.post('/reset', validate(resetSchema), async (req, res) => {
  try {
    const { email, token, password } = req.validated;
    if (!email || !token || !password) return res.status(400).json({ error: 'Email, token and new password are required' });

    const stored = resetTokens.get(email);
    if (!stored || stored.token !== token || stored.expires < Date.now()) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    // Update password
    await updatePasswordByEmail(email, password);

    // Clear token
    resetTokens.delete(email);

    return res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

// --- OAuth (Google & LinkedIn) ---

// Google OAuth using authorization code flow
// Simple in-memory state store for dev (prevents CSRF)
const oauthStates = new Set();

router.get('/oauth/google/start', (req, res) => {
  // Guard against missing configuration
  if (process.env.GOOGLE_OAUTH_ENABLED === 'false') {
    return res.status(503).json({ error: 'Google OAuth disabled' });
  }
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return res.status(503).json({ error: 'Google OAuth not configured (GOOGLE_CLIENT_ID missing)' });
  }
  const redirectUri = (process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 3001}`) + '/api/auth/oauth/google/callback';
  const scope = encodeURIComponent('openid email profile');
  // Generate a random state and keep it shortly
  const state = Math.random().toString(36).slice(2);
  oauthStates.add(state);
  setTimeout(() => oauthStates.delete(state), 10 * 60 * 1000); // 10 minutes
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${state}`;
  res.redirect(authUrl);
});

router.get('/oauth/google/callback', async (req, res) => {
  try {
    const code = req.query.code;
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      return res.status(503).json({ error: 'Google OAuth not configured (client id/secret missing)' });
    }
    const redirectUri = (process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 3001}`) + '/api/auth/oauth/google/callback';

    // Validate state if present
    if (req.query.state && !oauthStates.has(String(req.query.state))) {
      return res.status(400).json({ error: 'Invalid OAuth state' });
    }
    oauthStates.delete(String(req.query.state || ''));

    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: String(code || ''),
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });
    const tokenJson = await tokenRes.json();
    const idToken = tokenJson.id_token;

    if (!idToken) return res.status(400).json({ error: 'Failed to obtain id_token' });

    // Verify id_token and get email
    const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
    const verify = await verifyRes.json();
    const email = verify?.email;
    if (!email) return res.status(400).json({ error: 'Email missing from Google token' });

    // Find or create user
    let user = await findUserByEmail(email);
    if (!user) {
      // Create with random password
      const randomPassword = crypto.randomBytes(16).toString('hex');
      user = await createUser({ email, password: randomPassword, role: 'user' });
    }

    const tokenPayload = { id: user.id, userId: user.id, email: user.email, role: user.role };
    const token = jwt.sign(tokenPayload, JWT_SECRET);

    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const redirectTo = `${frontendUrl.replace(/\/$/, '')}/login?oauth=google&token=${encodeURIComponent(token)}`;
    res.redirect(redirectTo);
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    res.status(500).json({ error: 'OAuth failed' });
  }
});

// LinkedIn OAuth (authorization code flow)
router.get('/oauth/linkedin/start', (req, res) => {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const redirectUri = (process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 3001}`) + '/api/auth/oauth/linkedin/callback';
  const scope = encodeURIComponent('r_liteprofile r_emailaddress');
  const state = 'state';
  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${state}`;
  res.redirect(authUrl);
});

router.get('/oauth/linkedin/callback', async (req, res) => {
  try {
    const code = req.query.code;
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
    const redirectUri = (process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 3001}`) + '/api/auth/oauth/linkedin/callback';

    // Exchange code for access token
    const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: String(code || ''),
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });
    const tokenJson = await tokenRes.json();
    const accessToken = tokenJson.access_token;
    if (!accessToken) return res.status(400).json({ error: 'Failed to obtain access_token' });

    // Fetch user email
    const emailRes = await fetch('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const emailJson = await emailRes.json();
    const email = emailJson?.elements?.[0]?.['handle~']?.emailAddress;
    if (!email) return res.status(400).json({ error: 'Email missing from LinkedIn' });

    // Find or create user
    let user = await findUserByEmail(email);
    if (!user) {
      const randomPassword = crypto.randomBytes(16).toString('hex');
      user = await createUser({ email, password: randomPassword, role: 'user' });
    }

    const tokenPayload = { id: user.id, userId: user.id, email: user.email, role: user.role };
    const token = jwt.sign(tokenPayload, JWT_SECRET);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const redirectTo = `${frontendUrl.replace(/\/$/, '')}/login?oauth=linkedin&token=${encodeURIComponent(token)}`;
    res.redirect(redirectTo);
  } catch (error) {
    console.error('LinkedIn OAuth callback error:', error);
    res.status(500).json({ error: 'OAuth failed' });
  }
});

