import prisma from '../database/prisma.js';

export async function getSavedItems(userId, itemType = null) {
  try {
    const where = {
      userId,
      // Note: item_type may need to be added to schema if it exists
    };

    const items = await prisma.savedItem.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        university: true,
      },
    });

    return items || [];
  } catch (error) {
    throw error;
  }
}

export async function saveItem(userId, itemType, itemId, itemData = null) {
  try {
    // Assuming saved_items is for universities (based on schema)
    const item = await prisma.savedItem.create({
      data: {
        userId,
        universityId: itemId, // Assuming itemId is universityId
        notes: itemData?.notes || null,
        folder: itemData?.folder || null,
      },
      include: {
        university: true,
      },
    });
    return item;
  } catch (error) {
    // If duplicate, just return existing
    if (error.code === 'P2002') {
      return await getSavedItem(userId, itemType, itemId);
    }
    throw error;
  }
}

export async function unsaveItem(userId, itemType, itemId) {
  try {
    await prisma.savedItem.deleteMany({
      where: {
        userId,
        universityId: itemId, // Assuming itemId is universityId
      },
    });
    return true;
  } catch (error) {
    throw error;
  }
}

export async function getSavedItem(userId, itemType, itemId) {
  try {
    const item = await prisma.savedItem.findFirst({
      where: {
        userId,
        universityId: itemId, // Assuming itemId is universityId
      },
      include: {
        university: true,
      },
    });
    return item || null;
  } catch (error) {
    throw error;
  }
}

export async function isItemSaved(userId, itemType, itemId) {
  try {
    const item = await getSavedItem(userId, itemType, itemId);
    return !!item;
  } catch (error) {
    return false;
  }
}

export async function getSavedItemsCount(userId) {
  try {
    const count = await prisma.savedItem.count({
      where: { userId },
    });
    return count || 0;
  } catch (error) {
    throw error;
  }
}

