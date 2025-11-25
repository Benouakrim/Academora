import prisma from '../database/prisma.js';

const resolvePlanContext = async (user) => {
  if (!user) {
    return { planKey: 'anonymous', planId: null };
  }

  if (!user.planId) {
    return { planKey: 'free', planId: null };
  }

  try {
    const plan = await prisma.plan.findUnique({
      where: { id: user.planId },
      select: { id: true, key: true }
    });
    
    if (!plan) {
      return { planKey: 'free', planId: user.planId };
    }
    
    return {
      planKey: plan.key || 'free',
      planId: plan.id || user.planId,
    };
  } catch (err) {
    console.error('Unexpected error resolving plan:', err);
    return { planKey: 'free', planId: user.planId };
  }
};

const fetchPlanLimit = async (planKey, featureKey) => {
  try {
    const plan = await prisma.plan.findFirst({
      where: { key: planKey },
      select: { id: true }
    });
    
    if (!plan) {
      return null;
    }

    const planFeature = await prisma.planFeature.findFirst({
      where: {
        planId: plan.id,
        featureKey: featureKey
      },
      select: {
        accessLevel: true,
        limitValue: true
      }
    });

    return planFeature || null;
  } catch (error) {
    console.error('Unexpected error fetching plan limits:', error);
    return null;
  }
};

const fetchUserOverride = async (userId, featureKey) => {
  try {
    // User feature overrides table doesn't exist in current schema
    // Return null for now - can be added later if needed
    return null;
  } catch (err) {
    console.error('Unexpected error fetching user override:', err);
    return null;
  }
};

const buildEffectiveLimit = (planLimit, override) => {
  if (override) {
    return {
      accessLevel: override.accessLevel,
      limitValue: override.limitValue ?? 0,
      source: 'override',
    };
  }

  if (planLimit) {
    return {
      accessLevel: planLimit.accessLevel,
      limitValue: planLimit.limitValue ?? 0,
      source: 'plan',
    };
  }

  return null;
};

const getUsageCount = async ({ userId, identifier, featureKey }) => {
  try {
    if (userId) {
      const count = await prisma.userFeatureUsage.count({
        where: {
          userId: userId,
          featureKey: featureKey
        }
      });
      return count;
    } else if (identifier) {
      const count = await prisma.anonymousFeatureUsage.count({
        where: {
          identifier: identifier,
          featureKey: featureKey
        }
      });
      return count;
    }
    return 0;
  } catch (error) {
    console.error('Error getting usage count:', error);
    return 0;
  }
};

const formatLimitResponse = (limit, usageCount) => {
  if (!limit) {
    return {
      configured: false,
      accessLevel: null,
      limitValue: null,
      remaining: null,
      used: usageCount,
      source: null,
    };
  }

  const isUnlimited = limit.accessLevel === 'unlimited';
  const remaining = isUnlimited
    ? null
    : Math.max((limit.limitValue ?? 0) - usageCount, 0);

  return {
    configured: true,
    accessLevel: limit.accessLevel,
    limitValue: limit.limitValue ?? 0,
    remaining,
    used: usageCount,
    source: limit.source,
  };
};

export const checkFeatureAccess = (featureKey) => {
  return async (req, res, next) => {
    try {
      if (req.user?.role === 'admin') {
        return next();
      }

      const { planKey } = await resolvePlanContext(req.user);
      const identifier = req.user ? req.user.id : req.ip;

      const planLimit = await fetchPlanLimit(planKey, featureKey);
      const override = req.user ? await fetchUserOverride(req.user.id, featureKey) : null;
      const effectiveLimit = buildEffectiveLimit(planLimit, override);

      if (!effectiveLimit) {
        return res.status(403).json({
          error: 'Access denied. Feature not configured for your plan.',
          code: 'FEATURE_NOT_CONFIGURED',
        });
      }

      if (effectiveLimit.accessLevel === 'unlimited') {
        return next();
      }

      const usageCount = await getUsageCount({
        userId: req.user?.id,
        identifier: req.user ? null : req.ip,
        featureKey,
      });

      if (usageCount >= (effectiveLimit.limitValue ?? 0)) {
        const code = req.user ? 'UPGRADE_REQUIRED' : 'LOGIN_REQUIRED';
        const message = req.user
          ? "You've reached your limit for this feature. Upgrade to a Pro plan for unlimited access."
          : 'Please register for a free account to use this feature.';

        return res.status(403).json({
          error: message,
          code,
          limit: formatLimitResponse(effectiveLimit, usageCount),
        });
      }

      next();
    } catch (error) {
      console.error('Error in checkFeatureAccess middleware:', error);
      res.status(500).json({ error: 'Internal server error during access check.' });
    }
  };
};

export const logUsage = (featureKey) => {
  return async (req, res, next) => {
    res.on('finish', async () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          if (req.user) {
            await prisma.userFeatureUsage.create({
              data: {
                userId: req.user.id,
                featureKey: featureKey
              }
            });
          } else {
            await prisma.anonymousFeatureUsage.create({
              data: {
                identifier: req.ip || 'unknown',
                featureKey: featureKey
              }
            });
          }
        } catch (err) {
          console.error('Exception in logUsage:', err);
        }
      }
    });

    next();
  };
};

export const getFeatureUsageSummary = async ({ user, ip, featureKey }) => {
  const { planKey } = await resolvePlanContext(user);
  const planLimit = await fetchPlanLimit(planKey, featureKey);
  const override = user ? await fetchUserOverride(user.id, featureKey) : null;
  const effectiveLimit = buildEffectiveLimit(planLimit, override);

  if (user?.role === 'admin') {
    const usageCount = await getUsageCount({
      userId: user.id,
      identifier: null,
      featureKey,
    });
    return {
      planKey: 'admin',
      configured: true,
      accessLevel: 'unlimited',
      limitValue: null,
      remaining: null,
      used: usageCount,
      source: 'admin',
    };
  }

  try {
    const usageCount = await getUsageCount({
      userId: user?.id,
      identifier: user ? null : ip,
      featureKey,
    });

    return {
      planKey,
      ...formatLimitResponse(effectiveLimit, usageCount),
    };
  } catch (error) {
    console.error('Failed to compute feature usage summary:', error);
    throw error;
  }
};

export const resetFeatureUsage = async ({ userId, featureKey }) => {
  try {
    await prisma.userFeatureUsage.deleteMany({
      where: {
        userId: userId,
        featureKey: featureKey
      }
    });
  } catch (error) {
    throw error;
  }
};

export const upsertUserFeatureOverride = async ({ userId, featureKey, accessLevel, limitValue }) => {
  try {
    // User feature overrides table doesn't exist in current schema
    // This would need to be added to the Prisma schema first
    console.warn('upsertUserFeatureOverride: Table not implemented yet');
    return null;
  } catch (error) {
    throw error;
  }
};

export const deleteUserFeatureOverride = async ({ userId, featureKey }) => {
  try {
    // User feature overrides table doesn't exist in current schema
    console.warn('deleteUserFeatureOverride: Table not implemented yet');
  } catch (error) {
    throw error;
  }
};
