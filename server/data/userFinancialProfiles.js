import prisma from '../database/prisma.js';

const toNumberOrNull = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const toBooleanOrNull = (value) => {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
  }
  return Boolean(value);
};

const normalizeProfile = (record) => {
  if (!record) return null;
  return {
    user_id: record.userId,
    household_income: record.householdIncome,
    family_size: record.familySize,
    savings: record.savings,
    investments: record.investments,
    college_savings_529: record.collegeSavings529,
    expected_family_contribution: record.expectedFamilyContribution,
    eligible_for_pell_grant: record.eligibleForPellGrant,
    eligible_for_state_aid: record.eligibleForStateAid,
    created_at: record.createdAt,
    updated_at: record.updatedAt,
  };
};

export async function getFinancialProfile(userId) {
  try {
    const profile = await prisma.userFinancialProfile.findUnique({
      where: { userId },
    });
    return normalizeProfile(profile);
  } catch (error) {
    throw error;
  }
}

export async function upsertFinancialProfile(userId, payload) {
  try {
    const rawIncome = toNumberOrNull(payload?.household_income || payload?.family_income);

    const profile = await prisma.userFinancialProfile.upsert({
      where: { userId },
      update: {
        householdIncome: rawIncome !== null ? Math.round(rawIncome) : null,
        familySize: toNumberOrNull(payload?.family_size),
        savings: toNumberOrNull(payload?.savings),
        investments: toNumberOrNull(payload?.investments),
        collegeSavings529: toNumberOrNull(payload?.college_savings_529),
        expectedFamilyContribution: toNumberOrNull(payload?.expected_family_contribution),
        eligibleForPellGrant: toBooleanOrNull(payload?.eligible_for_pell_grant),
        eligibleForStateAid: toBooleanOrNull(payload?.eligible_for_state_aid),
      },
      create: {
        userId,
        householdIncome: rawIncome !== null ? Math.round(rawIncome) : null,
        familySize: toNumberOrNull(payload?.family_size),
        savings: toNumberOrNull(payload?.savings),
        investments: toNumberOrNull(payload?.investments),
        collegeSavings529: toNumberOrNull(payload?.college_savings_529),
        expectedFamilyContribution: toNumberOrNull(payload?.expected_family_contribution),
        eligibleForPellGrant: toBooleanOrNull(payload?.eligible_for_pell_grant),
        eligibleForStateAid: toBooleanOrNull(payload?.eligible_for_state_aid),
      },
    });

    return normalizeProfile(profile);
  } catch (error) {
    throw error;
  }
}
