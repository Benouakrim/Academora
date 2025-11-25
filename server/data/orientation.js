import prisma from '../database/prisma.js';

// Get all resources
export async function getResources() {
  try {
    const resources = await prisma.orientationResource.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return resources || [];
  } catch (error) {
    throw error;
  }
}

// Get resources by category
export async function getResourcesByCategory(category) {
  try {
    const resources = await prisma.orientationResource.findMany({
      where: { category },
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' },
      ],
    });
    return resources || [];
  } catch (error) {
    throw error;
  }
}

// Get resource by slug and category
export async function getResourceBySlug(category, slug) {
  try {
    const resource = await prisma.orientationResource.findFirst({
      where: {
        category,
        slug,
      },
    });

    return resource || null;
  } catch (error) {
    throw error;
  }
}
