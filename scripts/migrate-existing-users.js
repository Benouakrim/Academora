/**
 * Migrate Existing Users from Supabase to Clerk
 * 
 * This script migrates users from the old Supabase database to the new Neon database
 * and links them to Clerk accounts.
 * 
 * IMPORTANT: Users will need to reset their passwords through Clerk after migration.
 * 
 * Usage:
 *   node scripts/migrate-existing-users.js
 * 
 * Environment Variables Required:
 *   - DATABASE_URL (Neon) - Target database
 *   - CLERK_SECRET_KEY - Clerk API key for creating users
 *   - SUPABASE_URL (optional) - Old Supabase URL for reading users
 *   - SUPABASE_SERVICE_ROLE_KEY (optional) - For reading from Supabase
 * 
 * Alternative: If users are already in Neon database, this script will:
 *   1. Create Clerk accounts for each user
 *   2. Link Clerk accounts to existing database users via clerkId
 *   3. Send password reset emails via Clerk
 */

import dotenv from 'dotenv';
import prisma from '../server/database/prisma.js';
import { createClerkClient } from '@clerk/clerk-sdk-node';

dotenv.config();

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

// Option 1: Read from Neon database (users already migrated)
async function migrateFromNeon() {
  console.log('📋 Reading users from Neon database...');
  
  const users = await prisma.user.findMany({
    where: {
      clerkId: null, // Users without Clerk ID
      email: { not: null },
    },
    select: {
      id: true,
      email: true,
      role: true,
      firstName: true,
      lastName: true,
      phone: true,
      username: true,
    },
  });

  console.log(`Found ${users.length} users without Clerk ID`);

  for (const user of users) {
    try {
      console.log(`\n🔄 Migrating user: ${user.email} (${user.role})`);

      // Create Clerk user
      const clerkUser = await clerkClient.users.createUser({
        emailAddress: [user.email],
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        phoneNumber: user.phone ? [user.phone] : undefined,
        username: user.username || undefined,
        skipPasswordChecks: false,
        skipPasswordRequirement: true, // User will reset password
        publicMetadata: {
          migratedFromSupabase: true,
          originalUserId: user.id,
          role: user.role,
        },
      });

      console.log(`  ✅ Created Clerk user: ${clerkUser.id}`);

      // Link to database user
      await prisma.user.update({
        where: { id: user.id },
        data: { clerkId: clerkUser.id },
      });

      console.log(`  ✅ Linked Clerk ID: ${clerkUser.id}`);

      // Send password reset email
      try {
        await clerkClient.users.createPasswordResetToken({
          userId: clerkUser.id,
        });
        console.log(`  ✅ Password reset email sent`);
      } catch (emailError) {
        console.warn(`  ⚠️  Could not send password reset: ${emailError.message}`);
      }

    } catch (error) {
      console.error(`  ❌ Error migrating ${user.email}:`, error.message);
      
      // If user already exists in Clerk, try to link
      if (error.message?.includes('already exists') || error.status === 422) {
        console.log(`  🔍 User may already exist in Clerk, attempting to link...`);
        
        try {
          // Search for user in Clerk by email
          const clerkUsers = await clerkClient.users.getUserList({
            emailAddress: [user.email],
          });

          if (clerkUsers.data.length > 0) {
            const existingClerkUser = clerkUsers.data[0];
            await prisma.user.update({
              where: { id: user.id },
              data: { clerkId: existingClerkUser.id },
            });
            console.log(`  ✅ Linked to existing Clerk user: ${existingClerkUser.id}`);
          }
        } catch (linkError) {
          console.error(`  ❌ Could not link: ${linkError.message}`);
        }
      }
    }
  }

  console.log('\n✅ Migration complete!');
  console.log('\n📧 Users will need to:');
  console.log('   1. Check their email for password reset link');
  console.log('   2. Reset their password through Clerk');
  console.log('   3. Log in with their new Clerk password');
}

// Option 2: Read from Supabase and migrate (if old database still accessible)
async function migrateFromSupabase() {
  const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
  
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required for this option');
    return;
  }

  console.log('📋 Reading users from Supabase...');
  
  const supabase = createSupabaseClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: users, error } = await supabase
    .from('users')
    .select('id, email, role, full_name, phone, username, password')
    .not('email', 'is', null);

  if (error) {
    console.error('❌ Error reading from Supabase:', error);
    return;
  }

  console.log(`Found ${users.length} users in Supabase`);

  for (const user of users) {
    try {
      console.log(`\n🔄 Migrating user: ${user.email} (${user.role})`);

      // Check if user already exists in Neon
      let dbUser = await prisma.user.findUnique({
        where: { email: user.email },
        select: { id: true, clerkId: true },
      });

      // If not in Neon, create in Neon first
      if (!dbUser) {
        const nameParts = (user.full_name || '').split(' ');
        dbUser = await prisma.user.create({
          data: {
            email: user.email,
            password: user.password, // Keep old password hash temporarily
            role: user.role || 'user',
            username: user.username || `user-${user.id.slice(0, 8)}`,
            phone: user.phone || null,
            firstName: nameParts[0] || null,
            lastName: nameParts.slice(1).join(' ') || null,
          },
          select: { id: true, clerkId: true },
        });
        console.log(`  ✅ Created user in Neon: ${dbUser.id}`);
      }

      // If already linked to Clerk, skip
      if (dbUser.clerkId) {
        console.log(`  ⏭️  Already linked to Clerk: ${dbUser.clerkId}`);
        continue;
      }

      // Create Clerk user
      const nameParts = (user.full_name || '').split(' ');
      const clerkUser = await clerkClient.users.createUser({
        emailAddress: [user.email],
        firstName: nameParts[0] || undefined,
        lastName: nameParts.slice(1).join(' ') || undefined,
        phoneNumber: user.phone ? [user.phone] : undefined,
        username: user.username || undefined,
        skipPasswordChecks: false,
        skipPasswordRequirement: true,
        publicMetadata: {
          migratedFromSupabase: true,
          originalUserId: user.id,
          role: user.role,
        },
      });

      console.log(`  ✅ Created Clerk user: ${clerkUser.id}`);

      // Link to database user
      await prisma.user.update({
        where: { id: dbUser.id },
        data: { clerkId: clerkUser.id },
      });

      console.log(`  ✅ Linked Clerk ID: ${clerkUser.id}`);

      // Send password reset
      try {
        await clerkClient.users.createPasswordResetToken({
          userId: clerkUser.id,
        });
        console.log(`  ✅ Password reset email sent`);
      } catch (emailError) {
        console.warn(`  ⚠️  Could not send password reset: ${emailError.message}`);
      }

    } catch (error) {
      console.error(`  ❌ Error migrating ${user.email}:`, error.message);
    }
  }

  console.log('\n✅ Migration complete!');
}

// Main execution
async function main() {
  console.log('🚀 Starting user migration...\n');

  if (process.argv.includes('--from-supabase')) {
    await migrateFromSupabase();
  } else {
    await migrateFromNeon();
  }
}

main().catch(console.error);

