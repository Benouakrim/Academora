import prisma from '../database/prisma.js';

export async function listMicroContentForUniversity(universityId) {
  try {
    const content = await prisma.microContent.findMany({
      where: { universityId },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    });
    return content || [];
  } catch (error) {
    throw error;
  }
}

export async function listAllMicroContent() {
  try {
    const content = await prisma.microContent.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return content || [];
  } catch (error) {
    throw error;
  }
}

export async function getMicroContentById(id) {
  try {
    const content = await prisma.microContent.findUnique({
      where: { id },
    });
    return content || null;
  } catch (error) {
    throw error;
  }
}

export async function createMicroContent(payload) {
  try {
    const content = await prisma.microContent.create({
      data: {
        universityId: payload.university_id || null,
        category: payload.content_type || payload.category || '',
        title: payload.title || '',
        content: payload.content || '',
        priority: payload.priority ?? 0,
        // Note: media_url, link_url, status, publish_date, expiry_date, created_by may need schema updates
      },
    });
    return content;
  } catch (error) {
    throw error;
  }
}

export async function updateMicroContent(id, payload) {
  try {
    const updateData = {};
    if (payload.content_type !== undefined || payload.category !== undefined) {
      updateData.category = payload.content_type || payload.category;
    }
    if (payload.title !== undefined) updateData.title = payload.title;
    if (payload.content !== undefined) updateData.content = payload.content;
    if (payload.priority !== undefined) updateData.priority = payload.priority;
    // Note: media_url, link_url, status, publish_date, expiry_date may need schema updates

    const content = await prisma.microContent.update({
      where: { id },
      data: updateData,
    });

    return content || null;
  } catch (error) {
    if (error.code === 'P2025') {
      return null;
    }
    throw error;
  }
}

export async function deleteMicroContent(id) {
  try {
    await prisma.microContent.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    throw error;
  }
}
