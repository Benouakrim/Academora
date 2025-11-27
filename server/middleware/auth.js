import { clerkMiddleware, getAuth, requireAuth } from '@clerk/express';
import { findUserByClerkId, findUserByEmail, createOrUpdateUserFromClerk, syncUserToDb } from '../data/users.js';
import { clerkClient } from '@clerk/clerk-sdk-node';

// CRITICAL: Verify Clerk secret key is set
// Clerk Express middleware automatically reads from CLERK_SECRET_KEY environment variable
// But we need to ensure it's set for proper token validation and refresh
// Note: This check runs at module load time, but dotenv.config() should have run in app.js first

// CRITICAL: Create Clerk middleware ONCE and reuse it
// clerkMiddleware() automatically reads CLERK_SECRET_KEY from environment
// Creating it once ensures consistent configuration and better performance
// NOTE: Clock tolerance/leeway is not directly configurable in @clerk/express v1.0.0
// If clock skew issues persist, ensure server time is accurate (use NTP)
// Or upgrade to newer @clerk/express version that supports clock tolerance
let clerkMiddlewareInstance = null;

// Function to initialize and get Clerk middleware instance
function getClerkMiddleware() {
  // Check if CLERK_SECRET_KEY is set
  const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
  
  if (!CLERK_SECRET_KEY) {
    if (!getClerkMiddleware._warned) {
      console.error('❌ CLERK_SECRET_KEY is not set in environment variables!');
      console.error('   Clerk authentication will NOT work properly.');
      console.error('   Set CLERK_SECRET_KEY in your .env file');
      console.error('   Get it from: Clerk Dashboard → API Keys → Secret Key');
      getClerkMiddleware._warned = true;
    }
    return null;
  }
  
  // Create middleware instance once if it doesn't exist
  if (!clerkMiddlewareInstance) {
    try {
      // clerkMiddleware() reads CLERK_SECRET_KEY from environment automatically
      // It handles token validation, refresh cookies, and session management
      clerkMiddlewareInstance = clerkMiddleware();
      
      if (!getClerkMiddleware._logged) {
        console.log('✅ CLERK_SECRET_KEY is configured (length:', CLERK_SECRET_KEY.length, 'chars)');
        console.log('✅ Clerk middleware initialized');
        getClerkMiddleware._logged = true;
      }
    } catch (error) {
      console.error('❌ Failed to initialize Clerk middleware:', error?.message || error);
      return null;
    }
  }
  
  return clerkMiddlewareInstance;
}

// Clerk middleware - parses auth token and attaches Clerk session info to req.auth
// This is non-blocking - it will parse the token if present, but won't fail if absent
// Wrap in error handling to prevent crashes
export const parseUserToken = (req, res, next) => {
  const middleware = getClerkMiddleware();
  
  if (!middleware) {
    // If Clerk not configured, skip auth parsing but continue
    return next();
  }
  
  try {
    // Use the pre-initialized middleware instance
    // This middleware validates tokens and handles refresh cookies automatically
    return middleware(req, res, next);
  } catch (error) {
    console.error('❌ Clerk middleware error:', error?.message || error);
    // Continue without auth if Clerk fails
    next();
  }
};

// Middleware to REQUIRE a valid Clerk session
// requireAuth() automatically reads CLERK_SECRET_KEY from environment
// This will return 401 if user is not authenticated or token is invalid/expired
export const requireUser = requireAuth();

// Middleware to REQUIRE an admin user
export const requireAdmin = async (req, res, next) => {
  try {
    // Ensure Clerk auth is present
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    // Look up full user record in application DB by Clerk ID
    const dbUser = await findUserByClerkId(userId);
    if (!dbUser) {
      // Edge case: Clerk session exists but user not yet synced (webhook delay / backfill required)
      return res.status(403).json({ error: 'Profile not synchronized.' });
    }

    if (dbUser.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required.' });
    }

    // Attach for downstream handlers
    req.user = dbUser;
    next();
  } catch (error) {
    console.error('[AUTH] requireAdmin error:', error.message);
    return res.status(500).json({ error: 'Authentication check failed.' });
  }
};

// Helper to get current user from Clerk session and sync with database
export const getCurrentUser = async (req) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return null;
    }

    // Find user in database by Clerk ID
    let user = await findUserByClerkId(userId);
    
    // If user doesn't exist in DB, try to find by email (for migration purposes)
    if (!user && req.auth?.sessionClaims?.email) {
      user = await findUserByEmail(req.auth.sessionClaims.email);
    }

    return user || null;
  } catch (error) {
    console.error('[AUTH] getCurrentUser error:', error);
    return null;
  }
};

// Self-healing middleware: ensures a DB user exists for the current Clerk session
export const ensureSyncedUser = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    let dbUser = await findUserByClerkId(userId);
    if (!dbUser) {
      try {
        const clerkUser = await clerkClient.users.getUser(userId);
        dbUser = await syncUserToDb(clerkUser);
        console.log('[AUTH] Self-healed: upserted DB user for Clerk ID:', userId);
      } catch (syncErr) {
        console.error('[AUTH] Self-heal failed:', syncErr?.message || syncErr);
        return res.status(503).json({ error: 'Profile not synchronized yet. Please retry shortly.' });
      }
    }

    req.user = dbUser;
    next();
  } catch (error) {
    console.error('[AUTH] ensureSyncedUser error:', error?.message || error);
    return res.status(500).json({ error: 'Authentication check failed.' });
  }
};

