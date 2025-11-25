import { clerkMiddleware, getAuth, requireAuth } from '@clerk/express';
import { findUserByClerkId, findUserByEmail } from '../data/users.js';

// Clerk middleware - parses auth token and attaches Clerk session info to req.auth
// This is non-blocking - it will parse the token if present, but won't fail if absent
// Wrap in error handling to prevent crashes
export const parseUserToken = (req, res, next) => {
  try {
    return clerkMiddleware()(req, res, next);
  } catch (error) {
    console.error('❌ Clerk middleware error:', error.message);
    // Continue without auth if Clerk fails
    next();
  }
};

// Middleware to REQUIRE a valid Clerk session
// This will return 401 if user is not authenticated
export const requireUser = requireAuth();

// Middleware to REQUIRE an admin user
export const requireAdmin = async (req, res, next) => {
  try {
    // First ensure user is authenticated
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    // Get user from database to check role
    const user = await findUserByClerkId(userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found in database.' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required.' });
    }

    // Attach user to request for convenience
    req.user = user;
    next();
  } catch (error) {
    console.error('[AUTH] requireAdmin error:', error);
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

