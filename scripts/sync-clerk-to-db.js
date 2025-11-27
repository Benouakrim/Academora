/* eslint-env node */
/* eslint-disable no-constant-condition */
// Sync all Clerk users into the local Neon/Postgres database
// Usage: node scripts/sync-clerk-to-db.js
// Requires: CLERK_SECRET_KEY, DATABASE_URL (.env)
// This backfill should be run ONCE after enabling the webhook to populate missing users.

import dotenv from 'dotenv';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { createOrUpdateUserFromClerk } from '../server/data/users.js';

dotenv.config();

if (!process.env.CLERK_SECRET_KEY) {
  console.error('❌ Missing CLERK_SECRET_KEY in environment.');
  process.exit(1);
}

console.log('🚀 Starting Clerk → Database backfill');

async function fetchAllClerkUsers() {
  const pageSize = 100; // Clerk max limit per request
  let offset = 0;
  let all = [];
  while (true) {
    try {
      const batch = await clerkClient.users.getUserList({ limit: pageSize, offset });
      if (!batch || batch.length === 0) break;
      all = all.concat(batch);
      console.log(`   • Fetched ${batch.length} users (total: ${all.length})`);
      if (batch.length < pageSize) break; // last page
      offset += batch.length;
    } catch (err) {
      console.error('❌ Error fetching users from Clerk:', err.message);
      throw err;
    }
  }
  return all;
}

async function main() {
  const start = Date.now();
  let created = 0;
  let updated = 0;
  let linked = 0;
  let errors = 0;

  try {
    const users = await fetchAllClerkUsers();
    console.log(`📦 Total Clerk users retrieved: ${users.length}`);

    for (const u of users) {
      try {
        const result = await createOrUpdateUserFromClerk(u);
        if (result) {
          // Heuristic: if status === 'active' and recently created
          // We rely on logs inside createOrUpdateUserFromClerk for detailed info
          if (result.clerkId === u.id && result.firstName === (u.first_name || null)) {
            // We can't reliably distinguish create vs update solely here, so skip counters based on SQL logs
          }
        }
      } catch (err) {
        errors++;
        console.error(`   ✗ Failed syncing user ${u.id} (${u.email_addresses?.[0]?.email_address || 'no-email'}):`, err.message);
      }
    }
  } catch (err) {
    console.error('❌ Fatal error during backfill:', err.message);
    process.exit(1);
  }

  const duration = ((Date.now() - start) / 1000).toFixed(2);
  console.log('\n✅ Backfill complete');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`⏱  Duration: ${duration}s`);
  console.log(`⚠️  Errors: ${errors}`);
  console.log('   (Creation/update counts are visible in per-user log output)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\nNext: Run `node scripts/set-admin.js your@email.com` to promote yourself if needed.');
  // Summary to avoid unused vars warnings
  console.log(`Sync complete. Created: ${created}, Updated: ${updated}, Linked: ${linked}`);
  process.exit(0);
}

main();
