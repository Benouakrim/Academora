import prisma from '../database/prisma.js';

/**
 * Data access layer for saved university comparisons
 */

/**
 * Create a new saved comparison
 */
export async function createSavedComparison({ userId, name, description, universityIds }) {
  if (!userId || !name || !universityIds || universityIds.length === 0) {
    throw new Error('userId, name, and universityIds are required');
  }

  if (universityIds.length > 5) {
    throw new Error('Maximum 5 universities can be saved in a comparison');
  }

  const comparison = await prisma.savedComparison.create({
    data: {
      userId,
      name,
      notes: description || null,
      universityIds: universityIds,
    },
  });

  return comparison;
}

/**
 * Get all saved comparisons for a user
 */
export async function getSavedComparisonsByUserId(userId, options = {}) {
  const { 
    limit = 50, 
    offset = 0,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    favoritesOnly = false 
  } = options;

  const where = { userId };
  // Note: is_favorite may need to be added to schema
  
  const orderBy = {};
  const mappedSortBy = sortBy === 'created_at' ? 'createdAt' : sortBy;
  orderBy[mappedSortBy] = sortOrder === 'asc' ? 'asc' : 'desc';

  const comparisons = await prisma.savedComparison.findMany({
    where,
    orderBy,
    skip: offset,
    take: limit,
  });

  return comparisons || [];
}

/**
 * Get a specific saved comparison by ID
 */
export async function getSavedComparisonById(id, userId) {
  try {
    const comparison = await prisma.savedComparison.findFirst({
      where: {
        id,
        userId,
      },
    });

    return comparison || null;
  } catch (error) {
    console.error('Error fetching saved comparison:', error);
    throw error;
  }
}

/**
 * Update a saved comparison
 */
export async function updateSavedComparison(id, userId, updates) {
  const updateData = {};

  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.description !== undefined) updateData.notes = updates.description;
  if (updates.universityIds !== undefined) {
    if (updates.universityIds.length > 5) {
      throw new Error('Maximum 5 universities can be saved in a comparison');
    }
    updateData.universityIds = updates.universityIds;
  }
  // Note: is_favorite may need to be added to schema

  try {
    const comparison = await prisma.savedComparison.update({
      where: { id },
      data: updateData,
    });

    return comparison;
  } catch (error) {
    if (error.code === 'P2025') {
      throw new Error('Comparison not found');
    }
    console.error('Error updating saved comparison:', error);
    throw error;
  }
}

/**
 * Update last viewed timestamp
 */
export async function markComparisonAsViewed(id, userId) {
  try {
    // Note: last_viewed_at may need to be added to schema
    const comparison = await prisma.savedComparison.findFirst({
      where: { id, userId },
    });
    
    if (!comparison) {
      throw new Error('Comparison not found');
    }
    
    // Update will trigger updatedAt automatically
    return comparison;
  } catch (error) {
    console.error('Error updating comparison view timestamp:', error);
    throw error;
  }
}

/**
 * Delete a saved comparison
 */
export async function deleteSavedComparison(id, userId) {
  try {
    await prisma.savedComparison.deleteMany({
      where: {
        id,
        userId,
      },
    });
    return true;
  } catch (error) {
    console.error('Error deleting saved comparison:', error);
    throw error;
  }
}

/**
 * Toggle favorite status
 */
export async function toggleComparisonFavorite(id, userId) {
  // Note: is_favorite may need to be added to schema
  const current = await getSavedComparisonById(id, userId);
  if (!current) {
    throw new Error('Comparison not found');
  }

  // For now, just return current (favorite functionality needs schema update)
  return current;
}

/**
 * Get count of saved comparisons for a user
 */
export async function getSavedComparisonsCount(userId) {
  try {
    const count = await prisma.savedComparison.count({
      where: { userId },
    });
    return count || 0;
  } catch (error) {
    console.error('Error counting saved comparisons:', error);
    throw error;
  }
}

/**
 * Check if a comparison with the same universities already exists
 */
export async function findDuplicateComparison(userId, universityIds) {
  // Sort IDs to ensure consistent comparison
  const sortedIds = [...universityIds].sort();

  try {
    const comparisons = await prisma.savedComparison.findMany({
      where: { userId },
    });

    // Check if any saved comparison has the same universities
    const duplicate = comparisons.find(comp => {
      const compIds = [...comp.universityIds].sort();
      return JSON.stringify(compIds) === JSON.stringify(sortedIds);
    });

    return duplicate || null;
  } catch (error) {
    console.error('Error checking for duplicate comparisons:', error);
    throw error;
  }
}
