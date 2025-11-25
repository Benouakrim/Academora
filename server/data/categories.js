import prisma from '../database/prisma.js';

// Note: categories table may not exist in schema - may be using taxonomies instead
// This is a placeholder that can be removed if categories are handled via taxonomies
export async function getAllCategories(type = null) {
  try {
    // If categories table doesn't exist, use taxonomy terms instead
    const terms = await prisma.taxonomyTerm.findMany({
      where: type ? {
        taxonomy: {
          key: type,
        },
      } : {},
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' },
      ],
    });
    return terms || [];
  } catch (error) {
    throw error;
  }
}

// Placeholder functions - adjust based on whether categories table exists
export async function getCategoryById(id) {
  // Note: May need to use taxonomy terms instead
  return null;
}

export async function getCategoryBySlug(slug, type = null) {
  // Note: May need to use taxonomy terms instead
  return null;
}

export async function createCategory(categoryData) {
  // Note: May need to use taxonomy terms instead
  throw new Error('Categories may need to use taxonomies - check schema');
}

export async function updateCategory(id, categoryData) {
  // Note: May need to use taxonomy terms instead
  throw new Error('Categories may need to use taxonomies - check schema');
}

export async function deleteCategory(id) {
  // Note: May need to use taxonomy terms instead
  throw new Error('Categories may need to use taxonomies - check schema');
}
