import express from 'express';
import { parseUserToken, requireUser } from '../middleware/auth.js';
import { syncUserToDb, updateUserProfile, findUserByClerkId } from '../data/users.js';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { getAuth } from '@clerk/express';

const router = express.Router();

router.use(parseUserToken);
router.use(requireUser);

// POST /api/users/dual-sync
// Body may include: firstName, lastName, emails (array), primaryEmail, phoneNumbers (array), accountType, profile fields
router.post('/', async (req, res) => {
  try {
    const { userId: clerkId } = getAuth(req);
    if (!clerkId) return res.status(401).json({ error: 'Authentication required.' });

    const {
      firstName,
      lastName,
      primaryEmail,
      emails,
      phoneNumbers,
      accountType,
      focusArea,
      personaRole,
      primaryGoal,
      timeline,
      organizationName,
      organizationType,
      dateOfBirth,
      metadata,
    } = req.body || {};

    // Fetch Clerk user and prepare updates
    const clerkUser = await clerkClient.users.getUser(clerkId);
    const clerkUpdates = {};
    if (typeof firstName === 'string' && firstName.trim() && firstName !== clerkUser.firstName) {
      clerkUpdates.firstName = firstName.trim();
    }
    if (typeof lastName === 'string' && lastName.trim() && lastName !== clerkUser.lastName) {
      clerkUpdates.lastName = lastName.trim();
    }
    // Update primary email if provided and different
    if (primaryEmail && typeof primaryEmail === 'string') {
      const existingPrimary = clerkUser.emailAddresses.find(e => e.id === clerkUser.primaryEmailAddressId)?.emailAddress;
      if (existingPrimary !== primaryEmail) {
        // If email exists among Clerk emails, set as primary; else create then set
        let target = clerkUser.emailAddresses.find(e => e.emailAddress === primaryEmail);
        if (!target) {
          target = await clerkClient.emailAddresses.createEmailAddress({ userId: clerkId, emailAddress: primaryEmail });
        }
        clerkUpdates.primaryEmailAddressId = target.id;
      }
    }
    // Additional emails
    if (Array.isArray(emails)) {
      const existingEmails = new Set(clerkUser.emailAddresses.map(e => e.emailAddress));
      for (const em of emails) {
        if (typeof em === 'string' && em.trim() && !existingEmails.has(em.trim())) {
          await clerkClient.emailAddresses.createEmailAddress({ userId: clerkId, emailAddress: em.trim() });
        }
      }
    }
    // Phone numbers
    if (Array.isArray(phoneNumbers)) {
      const existingPhones = new Set(clerkUser.phoneNumbers.map(p => p.phoneNumber));
      for (const pn of phoneNumbers) {
        if (typeof pn === 'string' && pn.trim() && !existingPhones.has(pn.trim())) {
          await clerkClient.phoneNumbers.createPhoneNumber({ userId: clerkId, phoneNumber: pn.trim() });
        }
      }
    }

    // Apply Clerk profile updates (names / primary email) if needed
    if (Object.keys(clerkUpdates).length > 0) {
      await clerkClient.users.updateUser(clerkId, clerkUpdates);
    }

    // Re-fetch to have latest for Neon upsert
    const refreshedClerkUser = await clerkClient.users.getUser(clerkId);
    const dbUser = await syncUserToDb(refreshedClerkUser);

    // Map additional profile attributes for Neon
    const neonUpdates = {};
    if (accountType) neonUpdates.account_type = accountType;
    if (focusArea) neonUpdates.focus_area = focusArea;
    if (personaRole) neonUpdates.persona_role = personaRole;
    if (primaryGoal) neonUpdates.primary_goal = primaryGoal;
    if (timeline) neonUpdates.timeline = timeline;
    if (organizationName) neonUpdates.organization_name = organizationName;
    if (organizationType) neonUpdates.organization_type = organizationType;
    // Keep first/last name in sync (in case changed via wizard)
    // Use given_name/family_name for compatibility with updateUserProfile mapping
    if (firstName) neonUpdates.given_name = firstName;
    if (lastName) neonUpdates.family_name = lastName;
    if (primaryEmail) neonUpdates.email = primaryEmail;
    // Sync date of birth from payload or metadata
    if (dateOfBirth) {
      neonUpdates.date_of_birth = dateOfBirth;
    } else if (metadata?.dateOfBirth) {
      neonUpdates.date_of_birth = metadata.dateOfBirth;
    }
    // If we added phone numbers, set primary one as phone (first of array or existing Clerk primary phone)
    if (Array.isArray(phoneNumbers) && phoneNumbers.length > 0) {
      neonUpdates.phone = phoneNumbers[0];
    }

    if (Object.keys(neonUpdates).length > 0) {
      await updateUserProfile(dbUser.id, neonUpdates);
    }

    const finalUser = await findUserByClerkId(clerkId);
    return res.json({ success: true, user: finalUser });
  } catch (error) {
    console.error('[DualSync] Error:', error);
    return res.status(500).json({ error: 'Dual-write synchronization failed.' });
  }
});

export default router;