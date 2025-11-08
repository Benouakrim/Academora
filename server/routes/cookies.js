import express from 'express';
import { parseUserToken } from '../middleware/auth.js';

const router = express.Router();

// Mock database for cookie preferences (in production, use your actual database)
const cookiePreferences = new Map(); // userId -> preferences
const cookieAnalytics = {
  totalUsers: 0,
  consentGiven: 0,
  categoryStats: {
    necessary: 0,
    functional: 0,
    analytics: 0,
    marketing: 0,
    preferences: 0
  },
  recentActivity: []
};

// GET /api/cookies/preferences - Get user's cookie preferences
router.get('/preferences', parseUserToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const preferences = cookiePreferences.get(userId) || {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
      preferences: false,
      lastUpdated: new Date().toISOString(),
      version: '1.0'
    };

    res.json(preferences);
  } catch (error) {
    console.error('Error fetching cookie preferences:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/cookies/preferences - Save user's cookie preferences
router.post('/preferences', parseUserToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { necessary, functional, analytics, marketing, preferences } = req.body;

    const userPreferences = {
      necessary: true, // Always true for essential cookies
      functional: Boolean(functional),
      analytics: Boolean(analytics),
      marketing: Boolean(marketing),
      preferences: Boolean(preferences),
      lastUpdated: new Date().toISOString(),
      version: '1.0'
    };

    // Save preferences
    cookiePreferences.set(userId, userPreferences);

    // Update analytics
    if (!cookieAnalytics.totalUsers || !cookiePreferences.has(userId)) {
      cookieAnalytics.totalUsers++;
    }
    
    if (!cookieAnalytics.consentGiven || !cookiePreferences.has(userId)) {
      cookieAnalytics.consentGiven++;
    }

    // Update category statistics
    Object.keys(userPreferences).forEach(category => {
      if (category !== 'lastUpdated' && category !== 'version') {
        if (userPreferences[category]) {
          cookieAnalytics.categoryStats[category]++;
        }
      }
    });

    // Add to recent activity
    cookieAnalytics.recentActivity.unshift({
      timestamp: new Date().toISOString(),
      userId,
      action: 'User updated cookie preferences',
      preferences: userPreferences,
      userAgent: req.get('User-Agent')
    });

    // Keep only last 100 activities
    cookieAnalytics.recentActivity = cookieAnalytics.recentActivity.slice(0, 100);

    res.json({
      success: true,
      preferences: userPreferences,
      message: 'Cookie preferences saved successfully'
    });
  } catch (error) {
    console.error('Error saving cookie preferences:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/cookies/analytics - Get cookie analytics (admin only)
router.get('/analytics', parseUserToken, async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const analytics = {
      totalUsers: cookieAnalytics.totalUsers,
      consentRate: cookieAnalytics.totalUsers > 0 
        ? Math.round((cookieAnalytics.consentGiven / cookieAnalytics.totalUsers) * 100 * 10) / 10
        : 0,
      categoryAcceptance: {},
      recentActivity: cookieAnalytics.recentActivity.slice(0, 10) // Return last 10 activities
    };

    // Calculate acceptance rates for each category
    Object.keys(cookieAnalytics.categoryStats).forEach(category => {
      analytics.categoryAcceptance[category] = cookieAnalytics.totalUsers > 0
        ? Math.round((cookieAnalytics.categoryStats[category] / cookieAnalytics.totalUsers) * 100 * 10) / 10
        : 0;
    });

    res.json(analytics);
  } catch (error) {
    console.error('Error fetching cookie analytics:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/cookies/reset-all - Reset all user preferences (admin only)
router.post('/reset-all', parseUserToken, async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const resetCount = cookiePreferences.size;
    
    // Clear all preferences
    cookiePreferences.clear();
    
    // Reset analytics
    cookieAnalytics.totalUsers = 0;
    cookieAnalytics.consentGiven = 0;
    cookieAnalytics.categoryStats = {
      necessary: 0,
      functional: 0,
      analytics: 0,
      marketing: 0,
      preferences: 0
    };
    cookieAnalytics.recentActivity = [];

    // Add admin action to activity log
    cookieAnalytics.recentActivity.push({
      timestamp: new Date().toISOString(),
      userId: user.id,
      action: 'Admin reset all cookie preferences',
      resetCount,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: `Reset preferences for ${resetCount} users`,
      resetCount
    });
  } catch (error) {
    console.error('Error resetting all preferences:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/cookies/apply-defaults - Apply default preferences to all users (admin only)
router.post('/apply-defaults', parseUserToken, async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { necessary, functional, analytics, marketing, preferences } = req.body;

    const defaultPreferences = {
      necessary: true,
      functional: Boolean(functional),
      analytics: Boolean(analytics),
      marketing: Boolean(marketing),
      preferences: Boolean(preferences),
      lastUpdated: new Date().toISOString(),
      version: '1.0'
    };

    // Get all user IDs (in production, you'd query your user database)
    const userIds = Array.from(cookiePreferences.keys());
    
    // Apply defaults to all existing users
    let updatedCount = 0;
    userIds.forEach(userId => {
      cookiePreferences.set(userId, defaultPreferences);
      updatedCount++;
    });

    // Add admin action to activity log
    cookieAnalytics.recentActivity.unshift({
      timestamp: new Date().toISOString(),
      userId: user.id,
      action: 'Admin applied default preferences to all users',
      defaultPreferences,
      updatedCount,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: `Applied default preferences to ${updatedCount} users`,
      updatedCount,
      defaultPreferences
    });
  } catch (error) {
    console.error('Error applying default preferences:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/cookies/export - Export cookie data (admin only)
router.get('/export', parseUserToken, async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const exportData = {
      preferences: Object.fromEntries(cookiePreferences),
      analytics: cookieAnalytics,
      exportDate: new Date().toISOString(),
      exportedBy: user.id
    };

    res.json(exportData);
  } catch (error) {
    console.error('Error exporting cookie data:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/cookies/preferences - Delete user's cookie preferences
router.delete('/preferences', parseUserToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const existed = cookiePreferences.has(userId);
    cookiePreferences.delete(userId);

    // Update analytics
    if (existed) {
      cookieAnalytics.consentGiven = Math.max(0, cookieAnalytics.consentGiven - 1);
    }

    res.json({
      success: true,
      message: 'Cookie preferences deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting cookie preferences:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
