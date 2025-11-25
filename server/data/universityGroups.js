import prisma from '../database/prisma.js';

export async function getAllGroups() {
  try {
    const groups = await prisma.universityGroup.findMany({
      orderBy: { name: 'asc' },
    });
    return groups || [];
  } catch (error) {
    throw error;
  }
}

export async function getGroupById(id) {
  try {
    const group = await prisma.universityGroup.findUnique({
      where: { id },
    });
    return group || null;
  } catch (error) {
    throw error;
  }
}

export async function getGroupBySlug(slug) {
  try {
    const group = await prisma.universityGroup.findUnique({
      where: { slug },
    });
    return group || null;
  } catch (error) {
    throw error;
  }
}

export async function getGroupWithUniversities(groupId) {
  try {
    const group = await prisma.universityGroup.findUnique({
      where: { id: groupId },
      include: {
        members: {
          include: {
            university: true,
          },
        },
      },
    });

    if (!group) return null;

    return {
      ...group,
      universities: group.members.map(m => m.university),
    };
  } catch (error) {
    throw error;
  }
}

export async function getGroupWithUniversitiesBySlug(slug) {
  try {
    const group = await prisma.universityGroup.findUnique({
      where: { slug },
      include: {
        members: {
          include: {
            university: true,
          },
        },
      },
    });

    if (!group) return null;

    return {
      ...group,
      universities: group.members.map(m => m.university),
    };
  } catch (error) {
    throw error;
  }
}

export async function createGroup(payload) {
  try {
    const group = await prisma.universityGroup.create({
      data: {
        name: payload.name || '',
        slug: payload.slug || '',
        description: payload.description || null,
        logoUrl: payload.logo_url || null,
        website: payload.website_url || null,
        // Note: Many fields may need schema updates (short_name, hero_image_url, etc.)
      },
    });
    return group;
  } catch (error) {
    throw error;
  }
}

export async function updateGroup(id, payload) {
  try {
    const updateData = {};
    if (payload.name !== undefined) updateData.name = payload.name;
    if (payload.slug !== undefined) updateData.slug = payload.slug;
    if (payload.description !== undefined) updateData.description = payload.description || null;
    if (payload.logo_url !== undefined) updateData.logoUrl = payload.logo_url || null;
    if (payload.website_url !== undefined) updateData.website = payload.website_url || null;
    // Note: Many fields may need schema updates

    const group = await prisma.universityGroup.update({
      where: { id },
      data: updateData,
    });
    return group || null;
  } catch (error) {
    if (error.code === 'P2025') {
      return null;
    }
    throw error;
  }
}

export async function deleteGroup(id) {
  try {
    // Members will be deleted via cascade
    await prisma.universityGroup.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    if (error.code === 'P2025') {
      return false;
    }
    throw error;
  }
}
