import prisma from '../database/prisma.js';

// Helper to convert comma-separated string -> string[]
function csvToArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

// Helper to normalize numeric fields
function toNumberOrNull(val) {
  if (val === undefined || val === null || val === '') return null;
  const n = Number(val);
  return Number.isNaN(n) ? null : n;
}

export async function getMatchingUniversities(criteria) {
  try {
    const where = {};

    // Note: Array overlap queries need special handling in Prisma
    // interests, degree_levels, languages may need to be handled differently
    // For now, we'll simplify and note that these fields may need schema updates
    
    if (criteria?.maxBudget) {
      where.tuitionInState = { lte: criteria.maxBudget };
      // Also check out-of-state
      where.OR = [
        { tuitionInState: { lte: criteria.maxBudget } },
        { tuitionOutState: { lte: criteria.maxBudget } },
      ];
    }

    if (criteria?.minGpa) {
      where.averageGpa = { gte: criteria.minGpa };
    }

    if (criteria?.country && criteria.country.toLowerCase() !== 'any') {
      where.country = criteria.country;
    }

    const universities = await prisma.university.findMany({
      where,
      orderBy: { tuitionInState: 'asc' },
    });

    return universities || [];
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch matching universities');
  }
}

export async function getAllUniversities() {
  try {
    const universities = await prisma.university.findMany({
      orderBy: { name: 'asc' },
    });
    return universities || [];
  } catch (error) {
    throw error;
  }
}

export async function getUniversityById(id) {
  try {
    const university = await prisma.university.findUnique({
      where: { id },
    });
    return university || null;
  } catch (error) {
    throw error;
  }
}

export async function getUniversityBySlug(slug) {
  try {
    const university = await prisma.university.findUnique({
      where: { slug },
    });
    return university || null;
  } catch (error) {
    throw error;
  }
}

export async function createUniversity(payload) {
  try {
    // Generate slug from name if not provided
    const slug = payload.slug || payload.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    const university = await prisma.university.create({
      data: {
        name: payload.name || '',
        slug: slug || '',
        country: payload.country || 'USA',
        description: payload.description || null,
        logoUrl: payload.image_url || payload.logo_url || null,
        website: payload.program_url || payload.website || null,
        tuitionInState: toNumberOrNull(payload.avg_tuition_per_year || payload.tuition_in_state),
        tuitionOutState: toNumberOrNull(payload.tuition_out_state),
        averageGpa: toNumberOrNull(payload.min_gpa || payload.average_gpa),
        applicationDeadline: payload.application_deadline ? new Date(payload.application_deadline) : null,
        acceptanceRate: toNumberOrNull(payload.acceptance_rate),
        // Note: Many fields like interests, degree_levels, languages, etc. may need schema updates
        // rankings can be stored in the JSONB field
        rankings: payload.ranking_world ? { world: payload.ranking_world } : null,
      },
    });

    return university;
  } catch (error) {
    if (error.code === 'P2002') {
      throw new Error('University with this slug already exists');
    }
    throw error;
  }
}

export async function updateUniversity(id, payload) {
  try {
    const update = {};
    
    // Map snake_case to camelCase for Prisma
    if (payload.name !== undefined) update.name = payload.name;
    if (payload.slug !== undefined) update.slug = payload.slug;
    if (payload.country !== undefined) update.country = payload.country;
    if (payload.description !== undefined) update.description = payload.description;
    if (payload.image_url !== undefined || payload.logo_url !== undefined) {
      update.logoUrl = payload.image_url || payload.logo_url || null;
    }
    if (payload.program_url !== undefined || payload.website !== undefined) {
      update.website = payload.program_url || payload.website || null;
    }
    if (payload.avg_tuition_per_year !== undefined || payload.tuition_in_state !== undefined) {
      update.tuitionInState = toNumberOrNull(payload.avg_tuition_per_year || payload.tuition_in_state);
    }
    if (payload.tuition_out_state !== undefined) update.tuitionOutState = toNumberOrNull(payload.tuition_out_state);
    if (payload.min_gpa !== undefined || payload.average_gpa !== undefined) {
      update.averageGpa = toNumberOrNull(payload.min_gpa || payload.average_gpa);
    }
    if (payload.application_deadline !== undefined) {
      update.applicationDeadline = payload.application_deadline ? new Date(payload.application_deadline) : null;
    }
    if (payload.acceptance_rate !== undefined) update.acceptanceRate = toNumberOrNull(payload.acceptance_rate);
    // Note: Many fields may need schema updates (interests, degree_levels, etc.)
    if (payload.ranking_world !== undefined) {
      update.rankings = payload.ranking_world ? { world: payload.ranking_world } : null;
    }

    const university = await prisma.university.update({
      where: { id },
      data: update,
    });

    return university;
  } catch (error) {
    if (error.code === 'P2025') {
      // Record not found
      return null;
    }
    throw error;
  }
}

export async function deleteUniversity(id) {
  try {
    await prisma.university.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    if (error.code === 'P2025') {
      // Record not found
      return false;
    }
    throw error;
  }
}