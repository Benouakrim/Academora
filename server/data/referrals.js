import prisma from '../database/prisma.js';

// Helper: generate a local code (fallback if DB function not available)
const generateLocalCode = () =>
  Math.random().toString(36).substring(2, 10).toUpperCase();

export const referrals = {
  // Get or create referral code for user
  async getOrCreateCode(userId) {
    try {
      // Check if user already has a code
      const existing = await prisma.referralCode.findUnique({
        where: { userId },
      });

      if (existing) {
        return existing;
      }

      // Generate code locally (no DB function in Prisma)
      let code = generateLocalCode();

      // Fetch expiry days setting
      let expiresAt = null;
      try {
        const setting = await prisma.referralSetting.findUnique({
          where: { settingKey: 'referral_expiry_days' },
        });
        const expiryDays = parseInt(setting?.settingValue || '365', 10);
        if (expiryDays > 0) {
          const d = new Date();
          d.setDate(d.getDate() + expiryDays);
          expiresAt = d;
        }
      } catch {}

      // Insert new code (retry once on conflict)
      let inserted = null;
      for (let i = 0; i < 2; i++) {
        try {
          inserted = await prisma.referralCode.create({
            data: {
              userId,
              code,
              expiresAt,
              active: true,
            },
          });
          break;
        } catch (error) {
          // If conflict on code, regenerate and retry
          if (error.code === 'P2002') {
            code = generateLocalCode();
            continue;
          }
          throw error;
        }
      }
      return inserted || { code, userId, expiresAt };
    } catch (error) {
      console.error('Error creating referral code:', error);
      // Return a safe fallback to avoid breaking the route
      return { code: generateLocalCode(), userId, expiresAt: null };
    }
  },

  // Validate referral code
  async validateCode(code) {
    try {
      const referralCode = await prisma.referralCode.findFirst({
        where: {
          code,
          active: true,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } },
          ],
        },
        include: {
          user: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });
      return referralCode || null;
    } catch (error) {
      console.error('Error validating referral code:', error);
      return null;
    }
  },

  // Create referral relationship
  async createReferral(referrerUserId, referredUserId, code) {
    try {
      const referral = await prisma.referral.create({
        data: {
          referrerId: referrerUserId,
          referredId: referredUserId,
          referralCode: code,
          status: 'pending',
        },
      });
      
      // Update user's referred_by_code
      await prisma.user.update({
        where: { id: referredUserId },
        data: { referredByCode: code },
      });
      
      return referral;
    } catch (error) {
      console.error('Error creating referral:', error);
      return null;
    }
  },

  // Mark referral as completed (e.g., user verified email or completed profile)
  async completeReferral(referredUserId) {
    try {
      const referral = await prisma.referral.findFirst({
        where: {
          referredId: referredUserId,
          status: 'pending',
        },
      });
      
      if (!referral) return null;
      
      const updated = await prisma.referral.update({
        where: { id: referral.id },
        data: {
          status: 'completed',
          completedAt: new Date(),
        },
      });
      
      // Optionally, reward application could be handled via DB trigger or separate service
      return updated;
    } catch (error) {
      console.error('Error completing referral:', error);
      return null;
    }
  },

  // Get user's referral stats
  async getUserStats(userId) {
    try {
      const code = await prisma.referralCode.findUnique({
        where: { userId },
        select: {
          code: true,
          totalUses: true,
          createdAt: true,
          expiresAt: true,
        },
      });
      
      if (!code) return null;
      
      // Count referrals
      const totalReferrals = await prisma.referral.count({
        where: { referrerId: userId },
      });
      
      const pendingReferrals = await prisma.referral.count({
        where: {
          referrerId: userId,
          status: 'pending',
        },
      });
      
      const completedReferrals = await prisma.referral.count({
        where: {
          referrerId: userId,
          status: 'completed',
        },
      });
      
      return {
        code: code.code,
        total_uses: code.totalUses || 0,
        code_created_at: code.createdAt,
        expires_at: code.expiresAt,
        total_referrals: totalReferrals,
        pending_referrals: pendingReferrals,
        completed_referrals: completedReferrals,
        rewarded_referrals: 0,
        total_rewards: 0,
      };
    } catch (error) {
      console.error('Error fetching user referral stats:', error);
      return null;
    }
  },

  // Get user's referred users
  async getUserReferrals(userId, limit = 50, offset = 0) {
    try {
      const referrals = await prisma.referral.findMany({
        where: { referrerId: userId },
        select: {
          id: true,
          referredId: true,
          status: true,
          createdAt: true,
          completedAt: true,
          referralCode: true,
          referred: {
            select: {
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      });
      
      // Map to expected format
      return referrals.map(r => ({
        id: r.id,
        referred_email: r.referred?.email || '',
        status: r.status,
        created_at: r.createdAt,
        completed_at: r.completedAt,
      }));
    } catch (error) {
      console.error('Error fetching user referrals:', error);
      return [];
    }
  },

  // Get user's rewards
  async getUserRewards(userId) {
    try {
      const rewards = await prisma.referralReward.findMany({
        where: {
          OR: [
            { referrerId: userId },
            { referredId: userId },
          ],
        },
        select: {
          id: true,
          rewardType: true,
          rewardValue: true,
          appliedAt: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      
      return rewards.map(r => ({
        id: r.id,
        reward_type: r.rewardType,
        reward_value: r.rewardValue,
        description: '',
        applied_at: r.appliedAt || r.createdAt,
      }));
    } catch (error) {
      console.error('Error fetching user rewards:', error);
      return [];
    }
  }
};
