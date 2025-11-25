import prisma from '../database/prisma.js';

export async function listPublicSiteVideos() {
  try {
    const videos = await prisma.siteVideo.findMany({
      where: { isActive: true },
      orderBy: [
        { position: 'asc' },
        { createdAt: 'asc' },
      ],
    });
    return videos || [];
  } catch (error) {
    throw error;
  }
}

export async function listAllSiteVideos() {
  try {
    const videos = await prisma.siteVideo.findMany({
      orderBy: [
        { position: 'asc' },
        { createdAt: 'asc' },
      ],
    });
    return videos || [];
  } catch (error) {
    throw error;
  }
}

export async function createSiteVideo(payload) {
  try {
    const video = await prisma.siteVideo.create({
      data: {
        title: payload.title || '',
        description: payload.description || null,
        videoUrl: payload.video_url || null,
        embedCode: payload.embed_code || null,
        thumbnailUrl: payload.thumbnail_url || null,
        position: payload.position ?? 0,
        isActive: payload.is_active ?? true,
      },
    });
    return video;
  } catch (error) {
    throw error;
  }
}

export async function updateSiteVideo(id, payload) {
  try {
    const updateData = {};
    if (payload.title !== undefined) updateData.title = payload.title;
    if (payload.description !== undefined) updateData.description = payload.description;
    if (payload.video_url !== undefined) updateData.videoUrl = payload.video_url;
    if (payload.embed_code !== undefined) updateData.embedCode = payload.embed_code;
    if (payload.thumbnail_url !== undefined) updateData.thumbnailUrl = payload.thumbnail_url;
    if (payload.position !== undefined) updateData.position = payload.position;
    if (payload.is_active !== undefined) updateData.isActive = payload.is_active;

    const video = await prisma.siteVideo.update({
      where: { id },
      data: updateData,
    });

    return video;
  } catch (error) {
    if (error.code === 'P2025') {
      return null;
    }
    throw error;
  }
}

export async function deleteSiteVideo(id) {
  try {
    await prisma.siteVideo.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    throw error;
  }
}
