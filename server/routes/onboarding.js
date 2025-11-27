import express from 'express';
import { parseUserToken, requireUser } from '../middleware/auth.js';
import { upsertUserOnboarding } from '../data/onboarding.js';
import { updateUserProfile, getUserProfile, findUserByClerkId, createOrUpdateUserFromClerk } from '../data/users.js';
import { getAuth } from '@clerk/express';
import { clerkClient } from '@clerk/clerk-sdk-node';

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

  // Common: email from wizard
  const email = trimmed(answers.email || answers.contactEmail) || null;
  if (email) updates.email = email;

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

    // Explicit Clerk configuration check to avoid opaque 500s
    if (!process.env.CLERK_SECRET_KEY) {
      console.error('[Onboarding] Clerk backend keys missing (CLERK_SECRET_KEY).');
      return res.status(503).json({ error: 'Authentication service not configured. Please retry after setup.' });
    }

    // Lazy user creation to avoid race with webhook
    const { userId: clerkId } = getAuth(req);
    if (!clerkId) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    let dbUser = await findUserByClerkId(clerkId);
    if (!dbUser) {
      try {
        // Fetch latest user data from Clerk and upsert into DB
        const clerkUser = await clerkClient.users.getUser(clerkId);
        dbUser = await createOrUpdateUserFromClerk(clerkUser);
        console.log('[Onboarding] Lazily created DB user for Clerk ID:', clerkId);
      } catch (lazyErr) {
        console.error('[Onboarding] Lazy user creation failed:', lazyErr);
        // Continue with a graceful error; frontend may retry
        return res.status(503).json({ error: 'Profile not synchronized yet. Please retry shortly.' });
      }
    }

    await upsertUserOnboarding(dbUser.id, accountType, answers, metadata);

    const updates = deriveUserUpdates(accountType, answers);
    if (updates && Object.keys(updates).length > 0) {
      await updateUserProfile(dbUser.id, updates);
    }

    const profile = await getUserProfile(dbUser.id);
    res.json({ success: true, profile });
  } catch (error) {
    console.error('Onboarding submission error:', error);
    res.status(500).json({ error: error.message || 'Failed to store onboarding data' });
  }
});

export default router;

