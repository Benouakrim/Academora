import pool from '../database/supabase.js';

export const siteSettings = {
  // Get a setting value
  async getSetting(key) {
    try {
      const result = await pool.query(
        'SELECT setting_value FROM site_settings WHERE setting_key = $1',
        [key]
      );
      return result.rows[0]?.setting_value || null;
    } catch (error) {
      console.error('Error fetching setting:', error);
      throw error;
    }
  },

  // Get all settings
  async getAllSettings() {
    try {
      const result = await pool.query(
        'SELECT setting_key, setting_value, description FROM site_settings ORDER BY setting_key'
      );
      return result.rows;
    } catch (error) {
      console.error('Error fetching settings:', error);
      throw error;
    }
  },

  // Update a setting
  async updateSetting(key, value) {
    try {
      const result = await pool.query(
        `INSERT INTO site_settings (setting_key, setting_value, updated_at)
         VALUES ($1, $2, CURRENT_TIMESTAMP)
         ON CONFLICT (setting_key) 
         DO UPDATE SET setting_value = $2, updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [key, value]
      );
      return result.rows[0];
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
