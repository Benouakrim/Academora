import prisma from '../database/prisma.js';

// Note: user_onboarding table may need to be added to schema
// For now, using user preferences as a placeholder if needed
export async function upsertUserOnboarding(userId, accountType, answers, metadata = {}) {
  try {
    // Note: This requires a user_onboarding table in schema
    // For now, storing in a JSON field or user preferences
    // This is a placeholder - adjust based on actual schema
    throw new Error('user_onboarding table needs to be added to schema');
  } catch (error) {
    throw error;
  }
}

export async function getUserOnboarding(userId) {
  try {
    // Note: This requires a user_onboarding table in schema
    // This is a placeholder - adjust based on actual schema
    return null;
  } catch (error) {
    throw error;
  }
}
