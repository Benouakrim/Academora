/**
 * Test script to verify Clerk and Neon database field alignment
 * Compares actual data from both sources to identify mismatches
 */

import { clerkClient } from '@clerk/clerk-sdk-node';
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

// Clerk user fields we expect
const CLERK_FIELDS = {
  id: 'string',
  firstName: 'string | null',
  lastName: 'string | null',
  username: 'string | null',
  emailAddresses: 'array',
  phoneNumbers: 'array',
  imageUrl: 'string | null',
  createdAt: 'number',
  updatedAt: 'number',
};

// Neon database fields from Prisma schema
const NEON_FIELDS = {
  id: 'uuid',
  clerk_id: 'string | null',
  email: 'string | null',
  phone: 'string | null',
  first_name: 'string | null',
  last_name: 'string | null',
  full_name: 'string | null',
  username: 'string | null',
  avatar_url: 'string | null',
  date_of_birth: 'date | null',
  title: 'string | null',
  headline: 'string | null',
  location: 'string | null',
  website_url: 'string | null',
  linkedin_url: 'string | null',
  github_url: 'string | null',
  twitter_url: 'string | null',
  portfolio_url: 'string | null',
  bio: 'text | null',
  persona_role: 'string | null',
  focus_area: 'text | null',
  primary_goal: 'text | null',
  timeline: 'string | null',
  organization_name: 'string | null',
  organization_type: 'string | null',
  account_type: 'enum',
  role: 'enum',
  plan: 'enum',
  plan_id: 'uuid | null',
  subscription_status: 'text | null',
  email_verified: 'boolean',
  phone_verified: 'boolean',
  status: 'enum',
  is_profile_public: 'boolean',
  show_email: 'boolean',
  show_saved: 'boolean',
  show_reviews: 'boolean',
  show_socials: 'boolean',
  show_activity: 'boolean',
  created_at: 'timestamptz',
  updated_at: 'timestamptz',
  last_login_at: 'timestamptz | null',
};

// Mapping between Clerk and Neon
const FIELD_MAPPING = {
  // Clerk → Neon
  'id': 'clerk_id',
  'firstName': 'first_name',
  'lastName': 'last_name',
  'imageUrl': 'avatar_url',
  'emailAddresses[0].emailAddress': 'email',
  'phoneNumbers[0].phoneNumber': 'phone',
  'emailAddresses[0].verification.status': 'email_verified',
};

async function getClerkUser(clerkId) {
  try {
    const user = await clerkClient.users.getUser(clerkId);
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      emailAddresses: user.emailAddresses || [],
      phoneNumbers: user.phoneNumbers || [],
      imageUrl: user.imageUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      primaryEmailAddressId: user.primaryEmailAddressId,
      primaryPhoneNumberId: user.primaryPhoneNumberId,
    };
  } catch (error) {
    console.error(`[ERROR] Failed to fetch Clerk user ${clerkId}:`, error.message);
    return null;
  }
}

async function getNeonUser(clerkId) {
  try {
    const result = await pool.query(
      `SELECT * FROM users WHERE clerk_id = $1`,
      [clerkId]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error(`[ERROR] Failed to fetch Neon user for clerk_id ${clerkId}:`, error.message);
    return null;
  }
}

async function checkDatabaseSchema() {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable, character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);
    
    const actualColumns = {};
    result.rows.forEach(row => {
      actualColumns[row.column_name] = {
        type: row.data_type,
        nullable: row.is_nullable === 'YES',
        maxLength: row.character_maximum_length,
      };
    });
    
    return actualColumns;
  } catch (error) {
    console.error('[ERROR] Failed to check database schema:', error.message);
    return null;
  }
}

function compareFields(clerkUser, neonUser, schema) {
  const issues = [];
  const warnings = [];
  const info = [];

  // Check if clerk_id matches
  if (clerkUser && neonUser) {
    if (clerkUser.id !== neonUser.clerk_id) {
      issues.push({
        type: 'MISMATCH',
        field: 'clerk_id',
        clerk: clerkUser.id,
        neon: neonUser.clerk_id,
        message: 'Clerk ID does not match',
      });
    } else {
      info.push({ field: 'clerk_id', status: 'MATCH', value: clerkUser.id });
    }
  }

  // Check name fields
  if (clerkUser && neonUser) {
    if (clerkUser.firstName !== neonUser.first_name) {
      warnings.push({
        type: 'MISMATCH',
        field: 'first_name',
        clerk: clerkUser.firstName,
        neon: neonUser.first_name,
        message: 'First name mismatch',
      });
    } else if (clerkUser.firstName) {
      info.push({ field: 'first_name', status: 'MATCH', value: clerkUser.firstName });
    }

    if (clerkUser.lastName !== neonUser.last_name) {
      warnings.push({
        type: 'MISMATCH',
        field: 'last_name',
        clerk: clerkUser.lastName,
        neon: neonUser.last_name,
        message: 'Last name mismatch',
      });
    } else if (clerkUser.lastName) {
      info.push({ field: 'last_name', status: 'MATCH', value: clerkUser.lastName });
    }
  }

  // Check email
  if (clerkUser && neonUser) {
    const primaryEmail = clerkUser.emailAddresses?.find(
      e => e.id === clerkUser.primaryEmailAddressId
    )?.emailAddress;
    
    if (primaryEmail !== neonUser.email) {
      warnings.push({
        type: 'MISMATCH',
        field: 'email',
        clerk: primaryEmail,
        neon: neonUser.email,
        message: 'Email mismatch',
      });
    } else if (primaryEmail) {
      info.push({ field: 'email', status: 'MATCH', value: primaryEmail });
    }
  }

  // Check username
  if (clerkUser && neonUser) {
    if (clerkUser.username !== neonUser.username) {
      warnings.push({
        type: 'MISMATCH',
        field: 'username',
        clerk: clerkUser.username,
        neon: neonUser.username,
        message: 'Username mismatch',
      });
    } else if (clerkUser.username) {
      info.push({ field: 'username', status: 'MATCH', value: clerkUser.username });
    }
  }

  // Check avatar
  if (clerkUser && neonUser) {
    if (clerkUser.imageUrl !== neonUser.avatar_url) {
      warnings.push({
        type: 'MISMATCH',
        field: 'avatar_url',
        clerk: clerkUser.imageUrl,
        neon: neonUser.avatar_url,
        message: 'Avatar URL mismatch',
      });
    } else if (clerkUser.imageUrl) {
      info.push({ field: 'avatar_url', status: 'MATCH', value: clerkUser.imageUrl });
    }
  }

  // Check schema for missing columns
  if (schema) {
    const expectedColumns = Object.keys(NEON_FIELDS);
    const missingColumns = expectedColumns.filter(col => !schema[col]);
    
    if (missingColumns.length > 0) {
      issues.push({
        type: 'MISSING_COLUMN',
        columns: missingColumns,
        message: 'Database columns missing from schema',
      });
    }
  }

  return { issues, warnings, info };
}

async function testSync() {
  console.log('🔍 Testing Clerk ↔ Neon Database Sync\n');
  console.log('=' .repeat(60));

  // Check database schema
  console.log('\n📋 Checking database schema...');
  const schema = await checkDatabaseSchema();
  if (schema) {
    console.log(`✅ Found ${Object.keys(schema).length} columns in users table`);
  } else {
    console.log('❌ Failed to check schema');
    process.exit(1);
  }

  // Get a test user from Clerk
  console.log('\n👤 Fetching test user from Clerk...');
  let testClerkId = null;
  try {
    const users = await clerkClient.users.getUserList({ limit: 1 });
    if (users.data.length === 0) {
      console.log('⚠️  No users found in Clerk. Please create a test user first.');
      process.exit(0);
    }
    testClerkId = users.data[0].id;
    console.log(`✅ Found test user: ${testClerkId}`);
  } catch (error) {
    console.error('❌ Failed to fetch users from Clerk:', error.message);
    process.exit(1);
  }

  // Get user from both sources
  console.log('\n📥 Fetching user data...');
  const clerkUser = await getClerkUser(testClerkId);
  const neonUser = await getNeonUser(testClerkId);

  if (!clerkUser) {
    console.log('❌ Failed to fetch Clerk user');
    process.exit(1);
  }

  if (!neonUser) {
    console.log('⚠️  User not found in Neon database. This is expected for new users.');
    console.log('   Run a sync to create the user in Neon.');
    process.exit(0);
  }

  // Compare fields
  console.log('\n🔬 Comparing fields...');
  const { issues, warnings, info } = compareFields(clerkUser, neonUser, schema);

  // Print results
  console.log('\n' + '='.repeat(60));
  console.log('📊 COMPARISON RESULTS\n');

  if (info.length > 0) {
    console.log('✅ Matching fields:');
    info.forEach(item => {
      console.log(`   ${item.field}: ${item.value || '(null)'}`);
    });
    console.log('');
  }

  if (warnings.length > 0) {
    console.log('⚠️  Warnings (data mismatches):');
    warnings.forEach(w => {
      console.log(`   ${w.field}:`);
      console.log(`     Clerk: ${w.clerk || '(null)'}`);
      console.log(`     Neon:  ${w.neon || '(null)'}`);
    });
    console.log('');
  }

  if (issues.length > 0) {
    console.log('❌ Critical issues:');
    issues.forEach(issue => {
      if (issue.type === 'MISSING_COLUMN') {
        console.log(`   Missing columns: ${issue.columns.join(', ')}`);
      } else {
        console.log(`   ${issue.field}: ${issue.message}`);
        console.log(`     Clerk: ${issue.clerk || '(null)'}`);
        console.log(`     Neon:  ${issue.neon || '(null)'}`);
      }
    });
    console.log('');
  }

  // Summary
  console.log('='.repeat(60));
  console.log('📈 SUMMARY\n');
  console.log(`   Matching fields: ${info.length}`);
  console.log(`   Warnings: ${warnings.length}`);
  console.log(`   Critical issues: ${issues.length}`);

  if (issues.length === 0 && warnings.length === 0) {
    console.log('\n✅ All fields are properly aligned!');
  } else if (issues.length > 0) {
    console.log('\n❌ Critical issues found. Please run migrations to fix.');
    process.exit(1);
  } else {
    console.log('\n⚠️  Some data mismatches found, but schema is correct.');
    console.log('   These may be due to unsynced data. Run a sync to update.');
  }

  await pool.end();
}

// Run test
testSync().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

