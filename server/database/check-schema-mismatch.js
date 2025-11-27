/**
 * Check for schema mismatches between Prisma schema and actual database
 */

import pool from './pool.js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load .env from root
const rootEnvPath = path.resolve(process.cwd(), '../.env');
if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
} else {
  dotenv.config();
}

// Expected columns from Prisma schema
const EXPECTED_COLUMNS = {
  id: 'uuid',
  clerk_id: 'character varying',
  email: 'character varying',
  phone: 'character varying',
  password: 'character varying',
  first_name: 'character varying',
  last_name: 'character varying',
  full_name: 'character varying',
  username: 'character varying',
  bio: 'text',
  avatar_url: 'character varying',
  date_of_birth: 'date',
  title: 'character varying',
  headline: 'character varying',
  location: 'character varying',
  website_url: 'character varying',
  linkedin_url: 'character varying',
  github_url: 'character varying',
  twitter_url: 'character varying',
  portfolio_url: 'character varying',
  persona_role: 'character varying',
  focus_area: 'text',
  primary_goal: 'text',
  timeline: 'character varying',
  organization_name: 'character varying',
  organization_type: 'character varying',
  account_type: 'USER-DEFINED', // enum
  role: 'USER-DEFINED', // enum
  plan: 'USER-DEFINED', // enum
  plan_id: 'uuid',
  subscription_status: 'text',
  email_verified: 'boolean',
  phone_verified: 'boolean',
  status: 'USER-DEFINED', // enum
  is_profile_public: 'boolean',
  show_email: 'boolean',
  show_saved: 'boolean',
  show_reviews: 'boolean',
  show_socials: 'boolean',
  show_activity: 'boolean',
  referral_code: 'character varying',
  referred_by: 'uuid',
  referred_by_code: 'character varying',
  referral_count: 'integer',
  created_at: 'timestamp with time zone',
  updated_at: 'timestamp with time zone',
  last_login_at: 'timestamp with time zone',
};

async function checkSchema() {
  try {
    console.log('🔍 Checking database schema...\n');

    const result = await pool.query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        character_maximum_length,
        column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' 
        AND table_name = 'users'
      ORDER BY ordinal_position
    `);

    const actualColumns = {};
    result.rows.forEach(row => {
      actualColumns[row.column_name] = {
        type: row.data_type,
        nullable: row.is_nullable === 'YES',
        maxLength: row.character_maximum_length,
        default: row.column_default,
      };
    });

    console.log(`Found ${Object.keys(actualColumns).length} columns in users table\n`);

    // Check for missing columns
    const missingColumns = [];
    const extraColumns = [];
    const typeMismatches = [];

    for (const [colName, expectedType] of Object.entries(EXPECTED_COLUMNS)) {
      if (!actualColumns[colName]) {
        missingColumns.push({ name: colName, expectedType });
      }
    }

    for (const colName of Object.keys(actualColumns)) {
      if (!EXPECTED_COLUMNS[colName] && !colName.startsWith('_')) {
        extraColumns.push({ name: colName, actualType: actualColumns[colName].type });
      }
    }

    // Print results
    if (missingColumns.length > 0) {
      console.log('❌ MISSING COLUMNS:\n');
      missingColumns.forEach(col => {
        console.log(`   - ${col.name} (expected: ${col.expectedType})`);
      });
      console.log('');
    } else {
      console.log('✅ All expected columns exist\n');
    }

    if (extraColumns.length > 0) {
      console.log('⚠️  EXTRA COLUMNS (not in Prisma schema):\n');
      extraColumns.forEach(col => {
        console.log(`   - ${col.name} (${col.actualType})`);
      });
      console.log('');
    }

    if (missingColumns.length === 0 && extraColumns.length === 0) {
      console.log('✅ Schema matches Prisma definition!\n');
    }

    // Generate migration if needed
    if (missingColumns.length > 0) {
      console.log('📝 Generating migration SQL...\n');
      const migrationSQL = generateMigration(missingColumns);
      console.log(migrationSQL);
      console.log('\n💾 Save this to a migration file if needed.\n');
    }

    await pool.end();
    return { missingColumns, extraColumns };
  } catch (error) {
    console.error('❌ Error checking schema:', error.message);
    await pool.end();
    process.exit(1);
  }
}

function generateMigration(missingColumns) {
  const statements = [];
  
  statements.push('-- Migration: Add missing columns to users table');
  statements.push('-- Generated automatically by schema check\n');

  missingColumns.forEach(col => {
    let sqlType = 'TEXT';
    
    if (col.expectedType === 'uuid') {
      sqlType = 'UUID';
    } else if (col.expectedType === 'boolean') {
      sqlType = 'BOOLEAN DEFAULT false';
    } else if (col.expectedType === 'integer') {
      sqlType = 'INTEGER DEFAULT 0';
    } else if (col.expectedType === 'date') {
      sqlType = 'DATE';
    } else if (col.expectedType === 'timestamp with time zone') {
      sqlType = 'TIMESTAMPTZ';
    } else if (col.expectedType === 'text') {
      sqlType = 'TEXT';
    } else if (col.expectedType === 'character varying') {
      sqlType = 'VARCHAR(255)';
    } else if (col.expectedType === 'USER-DEFINED') {
      // Skip enum types - they should already exist
      return;
    }

    const nullable = col.name === 'email' ? '' : 'NULL'; // email is nullable now
    statements.push(`ALTER TABLE users ADD COLUMN IF NOT EXISTS ${col.name} ${sqlType} ${nullable};`);
  });

  return statements.join('\n');
}

checkSchema();

