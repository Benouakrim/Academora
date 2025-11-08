import express from 'express';
import { parseUserToken, requireUser } from '../middleware/auth.js';
import { upsertUserOnboarding } from '../data/onboarding.js';
import { updateUserProfile, getUserProfile } from '../data/users.js';

const router = express.Router();

router.use(parseUserToken);
router.use(requireUser);

function normalizeDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

function deriveUserUpdates(accountType, answers) {
  const trimmed = (val) => (typeof val === 'string' ? val.trim() : val);
  const updates = { account_type: accountType };

  if (accountType === 'individual') {
    const givenName = trimmed(answers.givenName) || null;
    const familyName = trimmed(answers.familyName) || null;
    const fullName = [givenName, familyName].filter(Boolean).join(' ') || null;
    updates.given_name = givenName;
    updates.family_name = familyName;
    updates.full_name = fullName;
    updates.date_of_birth = normalizeDate(answers.dateOfBirth);
    updates.persona_role = trimmed(answers.role) || null;
    updates.focus_area = trimmed(answers.focusArea) || null;
    updates.primary_goal = trimmed(answers.primaryGoal) || null;
    updates.timeline = trimmed(answers.timeline) || null;
  } else {
    const givenName = trimmed(answers.contactGivenName) || null;
    const familyName = trimmed(answers.contactFamilyName) || null;
    const fullName =
      trimmed(answers.contactName) ||
      [givenName, familyName].filter(Boolean).join(' ') ||
      null;
    updates.given_name = givenName;
    updates.family_name = familyName;
    updates.full_name = fullName;
    updates.date_of_birth = normalizeDate(answers.contactDateOfBirth);
    updates.persona_role = trimmed(answers.organizationType) || 'institution_contact';
    updates.focus_area = trimmed(answers.useCases) || null;
    updates.primary_goal = trimmed(answers.studentVolume) || null;
    updates.timeline = trimmed(answers.timeline) || null;
    updates.organization_name = trimmed(answers.organizationName) || null;
    updates.organization_type = trimmed(answers.organizationType) || null;
    if (answers.contactPhone) {
      updates.phone = trimmed(answers.contactPhone) || null;
    }
  }

  return updates;
}

router.post('/', async (req, res) => {
  try {
    const { accountType, answers, metadata = {} } = req.body || {};
    if (!accountType || !answers || typeof answers !== 'object') {
      return res.status(400).json({ error: 'accountType and answers are required' });
    }

    await upsertUserOnboarding(req.user.id, accountType, answers, metadata);

    const updates = deriveUserUpdates(accountType, answers);
    if (updates && Object.keys(updates).length > 0) {
      await updateUserProfile(req.user.id, updates);
    }

    const profile = await getUserProfile(req.user.id);
    res.json({ success: true, profile });
  } catch (error) {
    console.error('Onboarding submission error:', error);
    res.status(500).json({ error: error.message || 'Failed to store onboarding data' });
  }
});

export default router;

