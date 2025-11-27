/* eslint-env node */
/**
 * Migration script: Add profile fields to users table
 * Run with: node scripts/migrate-profile-fields.js
 */

import pool from '../server/database/pool.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  console.log('🔄 Running profile fields migration...\n');

  try {
    // Read the SQL migration file
    const sqlPath = path.join(__dirname, '../prisma/add-profile-fields.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Execute the migration
    await pool.query(sql);

    console.log('✅ Migration completed successfully!');
    console.log('\n📋 Added columns:');
    console.log('   - full_name, date_of_birth, title, headline, location');
    console.log('   - website_url, linkedin_url, github_url, twitter_url, portfolio_url');
    console.log('   - persona_role, focus_area, primary_goal, timeline');
    console.log('   - organization_name, organization_type');
    console.log('   - is_profile_public, show_email, show_saved, show_reviews, show_socials, show_activity');
    console.log('\n✨ Your Neon database is now ready to store all profile data!');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    if (error.code) {
      console.error('   Error code:', error.code);
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
