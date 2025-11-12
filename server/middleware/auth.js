import jwt from 'jsonwebtoken';
import { findUserById } from '../data/users.js';

// This is the new standard:
// It TRIES to authenticate. If a token is present and valid,
// it attaches req.user. If not, it just calls next().
// This allows routes to be used by both anonymous and logged-in users.
export const parseUserToken = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id || decoded.userId;
    if (!userId) {
      req.user = null;
      return next();
    }
    // Fetch full user details, including plan and role
    const user = await findUserById(userId);
    if (user) {
      // Exclude password from the req.user object
      const { password, ...userWithoutPassword } = user;
      req.user = userWithoutPassword;
    } else {
      req.user = null;
    }
  } catch (error) {
    req.user = null;
  }

  next();
};

// Middleware to REQUIRE a valid user.
export const requireUser = (req, res, next) => {
  console.log('[AUTH] requireUser check, req.user:', req.user ? `${req.user.id} (${req.user.email})` : 'NULL');
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  next();
};

// Middleware to REQUIRE an admin user.
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  next();
};

// Replace old ad-hoc token verification
// This file now exports all auth middleware.

