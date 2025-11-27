/**
 * Run the schema fix migration
 */

import pool from './pool.js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { readFileSync } from 'fs';

// Load .env from root
const rootEnvPath = path.resolve(process.cwd(), '../.env');
if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
} else {
  dotenv.config();
}

async function runMigration() {
  try {
    console.log('🔄 Running schema fix migration...\n');
    
    const migrationPath = path.join(process.cwd(), 'database', 'migrations', '28_fix_name_columns_and_sync_clerk_neon.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');
    
    // Split by semicolons and execute each statement
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`Executing ${statements.length} statements...\n`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          await pool.query(statement);
          console.log(`✅ Statement ${i + 1}/${statements.length} executed`);
        } catch (error) {
          // Some errors are expected (e.g., column already exists)
          if (error.message.includes('already exists') || 
              error.message.includes('does not exist') ||
              error.message.includes('duplicate')) {
            console.log(`⚠️  Statement ${i + 1}/${statements.length} skipped: ${error.message.split('\n')[0]}`);
          } else {
            console.error(`❌ Statement ${i + 1}/${statements.length} failed:`, error.message);
            throw error;
          }
        }
      }
    }
    
    console.log('\n✅ Migration completed successfully!\n');
    
    // Verify the fix
    console.log('🔍 Verifying schema...\n');
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' 
        AND table_name = 'users'
        AND column_name IN ('first_name', 'last_name', 'given_name', 'family_name', 'clerk_id', 'email')
      ORDER BY column_name
    `);
    
    console.log('Relevant columns:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    
    const hasGivenName = result.rows.some(r => r.column_name === 'given_name');
    const hasFamilyName = result.rows.some(r => r.column_name === 'family_name');
    
    if (hasGivenName || hasFamilyName) {
      console.log('\n⚠️  Warning: given_name or family_name still exist. They should be removed.');
    } else {
      console.log('\n✅ Redundant columns (given_name, family_name) have been removed.');
    }
    
    await pool.end();
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    await pool.end();
    process.exit(1);
  }
}

runMigration();

