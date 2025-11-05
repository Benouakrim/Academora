import express from 'express';
import { createUser, findUserByEmail, verifyPassword, updatePasswordByEmail } from '../data/users.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '../services/email.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Simple in-memory store for password reset tokens (for dev only)
// Structure: { email: { token: string, expires: number } }
const resetTokens = new Map();

// Sign up
router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create user with 'user' role by default
    const user = await createUser(email, password, 'user');
    
    // Include role in JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        role: user.role 
      }, 
      JWT_SECRET
    );

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await findUserByEmail(email);

    if (!user || !(await verifyPassword(user, password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Include role in JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        role: user.role 
      }, 
      JWT_SECRET
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current user (protected route)
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await findUserByEmail(req.user.email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Middleware to verify JWT token
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// Middleware to check if user is admin
export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  next();
}

// Request password reset (dev implementation: logs token link to console)
router.post('/forgot', async (req, res) => {
  try {
    const { email } = req.body;
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
router.post('/reset', async (req, res) => {
  try {
    const { email, token, password } = req.body;
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

