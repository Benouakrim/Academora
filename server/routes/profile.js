import express from 'express';
import { parseUserToken, requireUser } from '../middleware/auth.js';
import { updateUserProfile, updatePasswordById, getUserProfile } from '../data/users.js';
import { validate } from '../middleware/validate.js';
import { updateProfileSchema, changePasswordSchema } from '../validation/profileSchemas.js';

const router = express.Router();

// All routes require authentication
router.use(parseUserToken);
router.use(requireUser);

// GET /api/profile - Get current user profile
router.get('/', async (req, res) => {
  try {
    const profile = await getUserProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/profile - Update user profile
router.put('/', validate(updateProfileSchema), async (req, res) => {
  try {
    const {
      email,
      full_name,
      given_name,
      family_name,
      date_of_birth,
      phone,
      bio,
      avatar_url,
      subscription_status,
      subscription_expires_at,
      account_type,
      persona_role,
      focus_area,
      primary_goal,
      timeline,
      organization_name,
      organization_type,
      username,
      title,
      headline,
      location,
      website_url,
      linkedin_url,
      github_url,
      twitter_url,
      portfolio_url,
      is_profile_public,
      show_email,
      show_saved,
      show_reviews,
      show_socials,
      show_activity,
  } = req.validated;
    
    const updates = {};
    if (email !== undefined) updates.email = email;
    if (full_name !== undefined) updates.full_name = full_name;
    if (given_name !== undefined) updates.given_name = given_name;
    if (family_name !== undefined) updates.family_name = family_name;
    if (date_of_birth !== undefined) updates.date_of_birth = date_of_birth;
    if (username !== undefined) updates.username = username;
    if (title !== undefined) updates.title = title;
    if (headline !== undefined) updates.headline = headline;
    if (location !== undefined) updates.location = location;
    if (phone !== undefined) updates.phone = phone;
    if (bio !== undefined) updates.bio = bio;
    if (website_url !== undefined) updates.website_url = website_url;
    if (linkedin_url !== undefined) updates.linkedin_url = linkedin_url;
    if (github_url !== undefined) updates.github_url = github_url;
    if (twitter_url !== undefined) updates.twitter_url = twitter_url;
    if (portfolio_url !== undefined) updates.portfolio_url = portfolio_url;
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;
    if (subscription_status !== undefined) updates.subscription_status = subscription_status;
    if (subscription_expires_at !== undefined) updates.subscription_expires_at = subscription_expires_at;
    if (account_type !== undefined) updates.account_type = account_type;
    if (persona_role !== undefined) updates.persona_role = persona_role;
    if (focus_area !== undefined) updates.focus_area = focus_area;
    if (primary_goal !== undefined) updates.primary_goal = primary_goal;
    if (timeline !== undefined) updates.timeline = timeline;
    if (organization_name !== undefined) updates.organization_name = organization_name;
    if (organization_type !== undefined) updates.organization_type = organization_type;
    if (is_profile_public !== undefined) updates.is_profile_public = is_profile_public;
    if (show_email !== undefined) updates.show_email = show_email;
    if (show_saved !== undefined) updates.show_saved = show_saved;
    if (show_reviews !== undefined) updates.show_reviews = show_reviews;
    if (show_socials !== undefined) updates.show_socials = show_socials;
    if (show_activity !== undefined) updates.show_activity = show_activity;

    const updated = await updateUserProfile(req.user.id, updates);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/profile/password - Update password
router.put('/password', validate(changePasswordSchema), async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.validated;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const updated = await updatePasswordById(req.user.id, currentPassword, newPassword);
    res.json({ message: 'Password updated successfully', user: updated });
  } catch (error) {
    if (error.message === 'Current password is incorrect') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

export default router;

