import prisma from '../database/prisma.js';

// Get static page by slug
export async function getStaticPageBySlug(slug) {
  try {
    const page = await prisma.staticPage.findUnique({
      where: { slug },
    });

    return page || null;
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch static page from database');
  }
}

// Get all static pages (for admin)
export async function getAllStaticPages() {
  try {
    const pages = await prisma.staticPage.findMany({
      orderBy: { updatedAt: 'desc' },
    });
    return pages || [];
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch static pages from database');
  }
}

// Create or update static page
export async function upsertStaticPage(pageData) {
  try {
    const { 
      slug, 
      title, 
      content, 
      meta_title, 
      meta_description,
      published = false,
      // Note: status, visibility_areas, sort_order may need to be added to schema
    } = pageData;

    const page = await prisma.staticPage.upsert({
      where: { slug },
      update: {
        title,
        content,
        metaTitle: meta_title || null,
        metaDescription: meta_description || null,
        published: published || false,
      },
      create: {
        slug,
        title,
        content,
        metaTitle: meta_title || null,
        metaDescription: meta_description || null,
        published: published || false,
      },
    });

    return page;
  } catch (error) {
    throw new Error(error.message || 'Failed to save static page to database');
  }
}

// Get pages for navbar (published pages with navbar visibility)
export async function getNavbarPages() {
  try {
    const pages = await prisma.staticPage.findMany({
      where: { published: true },
      select: {
        id: true,
        slug: true,
        title: true,
      },
      orderBy: { title: 'asc' },
    });

    // Note: visibility_areas filtering may need schema update
    return pages || [];
  } catch (error) {
    console.error('❌ getNavbarPages error:', error);
    throw new Error(error.message || 'Failed to fetch navbar pages from database');
  }
}

// Delete static page
export async function deleteStaticPage(slug) {
  try {
    await prisma.staticPage.delete({
      where: { slug },
    });
    return true;
  } catch (error) {
    if (error.code === 'P2025') {
      // Record not found
      return false;
    }
    throw new Error(error.message || 'Failed to delete static page from database');
  }
}

