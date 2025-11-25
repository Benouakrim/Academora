import prisma from '../database/prisma.js';

export async function listNotificationsByUser(userId, limit = 50) {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      select: {
        id: true,
        type: true,
        title: true,
        message: true,
        link: true, // Note: action_url maps to link in schema
        read: true, // Note: is_read maps to read in schema
        readAt: true,
        createdAt: true,
        // Note: metadata may need to be added to schema
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return notifications || [];
  } catch (error) {
    throw error;
  }
}

export async function getUnreadCount(userId) {
  try {
    const count = await prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    });
    return count || 0;
  } catch (error) {
    throw error;
  }
}

export async function markNotificationRead(userId, id) {
  try {
    const notification = await prisma.notification.updateMany({
      where: {
        id,
        userId,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });
    
    const updated = await prisma.notification.findUnique({
      where: { id },
      select: {
        id: true,
        read: true,
        readAt: true,
      },
    });
    
    return updated;
  } catch (error) {
    throw error;
  }
}

export async function markAllNotificationsRead(userId) {
  try {
    await prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });
    return true;
  } catch (error) {
    throw error;
  }
}

export async function createNotification({ user_id, type, title, message, action_url, metadata, status }) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: user_id,
        type,
        title,
        message,
        link: action_url || null,
        // Note: metadata may need to be added to schema
      },
      select: {
        id: true,
        userId: true,
        type: true,
        title: true,
        message: true,
        link: true,
        read: true,
        createdAt: true,
      },
    });
    return notification;
  } catch (error) {
    throw error;
  }
}

