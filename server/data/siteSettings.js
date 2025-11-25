import prisma from '../database/prisma.js';

export const siteSettings = {
  // Get a setting value
  async getSetting(key) {
    try {
      const setting = await prisma.siteSetting.findUnique({
        where: { key },
        select: { value: true },
      });
      return setting?.value || null;
    } catch (error) {
      console.error('Error fetching setting:', error);
      throw error;
    }
  },

  // Get all settings
  async getAllSettings() {
    try {
      const settings = await prisma.siteSetting.findMany({
        orderBy: { key: 'asc' },
        select: {
          key: true,
          value: true,
          description: true,
        },
      });
      return settings;
    } catch (error) {
      console.error('Error fetching settings:', error);
      throw error;
    }
  },

  // Update a setting
  async updateSetting(key, value) {
    try {
      const setting = await prisma.siteSetting.upsert({
        where: { key },
        update: {
          value,
          updatedAt: new Date(),
        },
        create: {
          key,
          value,
          type: 'string',
        },
      });
      return setting;
    } catch (error) {
      console.error('Error updating setting:', error);
      throw error;
    }
  },

  // Get max pending articles limit
  async getMaxPendingArticles() {
    try {
      const value = await this.getSetting('max_pending_articles_per_user');
      return parseInt(value) || 3;
    } catch (error) {
      return 3; // Default fallback
    }
  }
};
