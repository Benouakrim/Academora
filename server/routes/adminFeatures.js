import { Router } from 'express';
import pool from '../database/pool.js';
import { parseUserToken, requireAdmin } from '../middleware/auth.js';
import {
  resetFeatureUsage,
  upsertUserFeatureOverride,
  deleteUserFeatureOverride,
} from '../middleware/accessControl.js';

const router = Router();

router.use(parseUserToken, requireAdmin); // All routes here are admin-only

// Get all plans
router.get('/plans', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM plans ORDER BY created_at');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all features
router.get('/features', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM features ORDER BY created_at');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all rules (plan_features)
router.get('/plan-features', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM plan_features ORDER BY plan_id, feature_key');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update or Create a plan-feature rule
router.post('/plan-features', async (req, res) => {
  try {
    const { plan_id, feature_key, access_level, limit_value } = req.body;

    const result = await pool.query(
      `INSERT INTO plan_features (plan_id, feature_key, access_level, limit_value)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (plan_id, feature_key)
       DO UPDATE SET access_level = $3, limit_value = $4
       RETURNING *`,
      [plan_id, feature_key, access_level, limit_value]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Aggregate usage for admins
router.get('/usage', async (req, res) => {
  try {
    const { userId, featureKey } = req.query;

    let usersQuery = 'SELECT id, email, first_name, last_name, plan_id FROM users';
    const usersParams = [];
    if (userId) {
      usersQuery += ' WHERE id = $1';
      usersParams.push(userId);
    }
    const usersResult = await pool.query(usersQuery, usersParams);
    const users = usersResult.rows;

    if (!users || users.length === 0) {
      return res.json([]);
    }

    const featuresResult = await pool.query('SELECT key, name FROM features');
    const features = featuresResult.rows;

    const plansResult = await pool.query('SELECT id, key, name FROM plans');
    const plans = plansResult.rows;

    const planFeaturesResult = await pool.query('SELECT plan_id, feature_key, access_level, limit_value FROM plan_features');
    const planFeatures = planFeaturesResult.rows;

    let overridesQuery = 'SELECT user_id, feature_key, access_level, limit_value FROM user_feature_overrides WHERE 1=1';
    const overridesParams = [];
    let paramCount = 1;
    if (userId) {
      overridesQuery += ` AND user_id = $${paramCount++}`;
      overridesParams.push(userId);
    }
    if (featureKey) {
      overridesQuery += ` AND feature_key = $${paramCount++}`;
      overridesParams.push(featureKey);
    }
    const overridesResult = await pool.query(overridesQuery, overridesParams);
    const overrides = overridesResult.rows;

    let usageQuery = 'SELECT user_id, feature_key FROM user_feature_usage WHERE 1=1';
    const usageParams = [];
    paramCount = 1;
    if (userId) {
      usageQuery += ` AND user_id = $${paramCount++}`;
      usageParams.push(userId);
    }
    if (featureKey) {
      usageQuery += ` AND feature_key = $${paramCount++}`;
      usageParams.push(featureKey);
    }
    const usageResult = await pool.query(usageQuery, usageParams);
    const usageRows = usageResult.rows;

    const planById = new Map(plans?.map((plan) => [plan.id, plan]) || []);
    const freePlanId = plans?.find((plan) => plan.key === 'free')?.id || null;
    const featureNameMap = new Map(features?.map((f) => [f.key, f.name]) || []);

    const overridesMap = new Map(
      (overrides || []).map((override) => [
        `${override.user_id}:${override.feature_key}`,
        override,
      ]),
    );

    const usageMap = new Map();
    (usageRows || []).forEach((row) => {
      const key = `${row.user_id}:${row.feature_key}`;
      usageMap.set(key, (usageMap.get(key) || 0) + 1);
    });

    const addKey = (set, key) => {
      if (!featureKey || featureKey === key) {
        set.add(key);
      }
    };

    const results = [];

    users.forEach((user) => {
      const planId = user.plan_id || freePlanId;
      const plan = planId ? planById.get(planId) : null;
      const planKey = plan?.key || (user.plan_id ? 'custom' : 'free');

      const planFeatureList = planFeatures?.filter((pf) => pf.plan_id === planId) || [];

      const userOverrides = (overrides || []).filter((override) => override.user_id === user.id);
      const userUsageRows = (usageRows || []).filter((usage) => usage.user_id === user.id);

      if (userOverrides.length === 0 && userUsageRows.length === 0) {
        return;
      }

      const relevantFeatureKeys = new Set();
      userOverrides.forEach((override) => addKey(relevantFeatureKeys, override.feature_key));
      userUsageRows.forEach((usage) => addKey(relevantFeatureKeys, usage.feature_key));

      relevantFeatureKeys.forEach((key) => {
        const mapKey = `${user.id}:${key}`;
        const usageCount = usageMap.get(mapKey) || 0;
        const override = overridesMap.get(mapKey) || null;
        const planLimit = planFeatureList.find((pf) => pf.feature_key === key) || null;
        const effective = override || planLimit || null;

        const accessLevel = effective?.access_level || null;
        const limitValue = effective?.limit_value ?? 0;
        const unlimited = accessLevel === 'unlimited';
        const remaining = !effective
          ? null
          : unlimited
            ? null
            : Math.max(limitValue - usageCount, 0);

        results.push({
          user_id: user.id,
          email: user.email,
          full_name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || null,
          plan_key: planKey,
          feature_key: key,
          feature_name: featureNameMap.get(key) || key,
          usage_count: usageCount,
          access_level: accessLevel,
          limit_value: limitValue,
          remaining,
          configured: Boolean(effective),
          source: override ? 'override' : planLimit ? 'plan' : null,
          override: override
            ? {
                access_level: override.access_level,
                limit_value: override.limit_value,
              }
            : null,
        });
      });
    });

    results.sort((a, b) => {
      if (a.email === b.email) {
        return a.feature_key.localeCompare(b.feature_key);
      }
      return (a.email || '').localeCompare(b.email || '');
    });

    res.json(results);
  } catch (error) {
    console.error('Failed to fetch feature usage:', error);
    res.status(500).json({ error: 'Failed to fetch feature usage.' });
  }
});

router.post('/usage/reset', async (req, res) => {
  const { user_id, feature_key } = req.body || {};

  if (!user_id || !feature_key) {
    return res.status(400).json({ error: 'user_id and feature_key are required.' });
  }

  try {
    await resetFeatureUsage({ userId: user_id, featureKey: feature_key });
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to reset feature usage:', error);
    res.status(500).json({ error: 'Failed to reset feature usage.' });
  }
});

router.post('/overrides', async (req, res) => {
  const { user_id, feature_key, access_level = 'count', limit_value } = req.body || {};

  if (!user_id || !feature_key) {
    return res.status(400).json({ error: 'user_id and feature_key are required.' });
  }

  try {
    const data = await upsertUserFeatureOverride({
      userId: user_id,
      featureKey: feature_key,
      access_level,
      limit_value,
    });
    res.json({ success: true, data });
  } catch (error) {
    console.error('Failed to upsert feature override:', error);
    res.status(500).json({ error: 'Failed to upsert feature override.' });
  }
});

router.delete('/overrides', async (req, res) => {
  const { user_id, feature_key } = req.body || {};

  if (!user_id || !feature_key) {
    return res.status(400).json({ error: 'user_id and feature_key are required.' });
  }

  try {
    await deleteUserFeatureOverride({ userId: user_id, featureKey: feature_key });
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete feature override:', error);
    res.status(500).json({ error: 'Failed to delete feature override.' });
  }
});

export default router;
