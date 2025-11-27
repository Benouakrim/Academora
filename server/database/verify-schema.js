import pool from './pool.js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

const rootEnvPath = path.resolve(process.cwd(), '../.env');
if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
} else {
  dotenv.config();
}

async function verify() {
  try {
    console.log('Checking database schema...\n');
    
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' 
        AND table_name = 'users'
        AND column_name IN (
          'id', 'clerk_id', 'email', 'phone', 
          'first_name', 'last_name', 'full_name',
          'given_name', 'family_name',
          'username', 'avatar_url', 'bio',
          'date_of_birth', 'title', 'headline', 'location',
          'website_url', 'linkedin_url', 'github_url', 'twitter_url', 'portfolio_url',
          'persona_role', 'focus_area', 'primary_goal', 'timeline',
          'organization_name', 'organization_type',
          'account_type', 'role', 'plan', 'plan_id',
          'email_verified', 'phone_verified', 'status',
          'is_profile_public', 'show_email', 'show_saved', 'show_reviews', 'show_socials', 'show_activity'
        )
      ORDER BY column_name
    `);
    
    console.log(`Found ${result.rows.length} relevant columns:\n`);
    result.rows.forEach(row => {
      console.log(`  ${row.column_name.padEnd(25)} ${row.data_type.padEnd(25)} nullable: ${row.is_nullable}`);
    });
    
    const columnNames = result.rows.map(r => r.column_name);
    
    // Check for issues
    const issues = [];
    
    if (columnNames.includes('given_name')) {
      issues.push('❌ given_name column exists (should be removed, use first_name)');
    }
    if (columnNames.includes('family_name')) {
      issues.push('❌ family_name column exists (should be removed, use last_name)');
    }
    if (!columnNames.includes('first_name')) {
      issues.push('❌ first_name column missing');
    }
    if (!columnNames.includes('last_name')) {
      issues.push('❌ last_name column missing');
    }
    if (!columnNames.includes('clerk_id')) {
      issues.push('❌ clerk_id column missing');
    }
    
    console.log('\n' + '='.repeat(60));
    if (issues.length > 0) {
      console.log('\n⚠️  Issues found:\n');
      issues.forEach(issue => console.log(`  ${issue}`));
      console.log('\n💡 Run the migration to fix these issues.');
    } else {
      console.log('\n✅ Schema looks good! All required columns exist.');
    }
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

verify();

