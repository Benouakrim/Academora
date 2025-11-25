import { clerkClient } from '@clerk/clerk-sdk-node';
import pool from './pool.js';
import dotenv from 'dotenv';

dotenv.config();

// Test users to create in Clerk and link to Neon
// Phone numbers in E.164 format (required by Clerk): +[country code][number]
// Using US format: +1 (area code) (exchange) (number)
const testUsers = [
  {
    email: 'admin@academora.com',
    password: 'Admin123!',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    phone: '+14155551234' // +1 (415) 555-1234
  },
  {
    email: 'student@academora.com',
    password: 'Student123!',
    firstName: 'John',
    lastName: 'Student',
    role: 'user',
    phone: '+14155551235' // +1 (415) 555-1235
  },
  {
    email: 'parent@academora.com',
    password: 'Parent123!',
    firstName: 'Sarah',
    lastName: 'Parent',
    role: 'user',
    phone: '+14155551236' // +1 (415) 555-1236
  },
  {
    email: 'counselor@academora.com',
    password: 'Counselor123!',
    firstName: 'Michael',
    lastName: 'Counselor',
    role: 'user',
    phone: '+14155551237' // +1 (415) 555-1237
  },
  {
    email: 'developer@academora.com',
    password: 'Dev123!',
    firstName: 'Alex',
    lastName: 'Developer',
    role: 'user',
    phone: '+14155551238' // +1 (415) 555-1238
  }
];

async function createClerkUsers() {
  const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
  
  if (!CLERK_SECRET_KEY) {
    console.error('❌ CLERK_SECRET_KEY is not set in .env file');
    console.error('   Get it from: Clerk Dashboard → API Keys → Secret Key');
    console.error('   Add to .env: CLERK_SECRET_KEY=sk_test_...');
    process.exit(1);
  }

  console.log('🚀 Creating users in Clerk and linking to Neon database...\n');
  console.log(`📋 Using Clerk Secret Key: ${CLERK_SECRET_KEY.substring(0, 10)}...\n`);

  for (const userData of testUsers) {
    try {
      console.log(`📝 Processing: ${userData.email}`);

      // Check if user exists in Neon database
      const dbResult = await pool.query(
        'SELECT id, email, clerk_id FROM users WHERE email = $1',
        [userData.email]
      );

      if (dbResult.rows.length === 0) {
        console.log(`   ⚠️  User not found in Neon database. Skipping...`);
        console.log(`   💡 Run 'npm run db:seed-mock' first to create users in Neon\n`);
        continue;
      }

      const dbUser = dbResult.rows[0];

      // If user already has clerk_id, check if it exists in Clerk
      if (dbUser.clerk_id) {
        try {
          const existingClerkUser = await clerkClient.users.getUser(dbUser.clerk_id);
          console.log(`   ✅ User already exists in Clerk: ${existingClerkUser.id}`);
          console.log(`   ✅ Already linked to Neon database\n`);
          continue;
        } catch (error) {
          // User doesn't exist in Clerk, continue to create
          console.log(`   ⚠️  Clerk ID exists but user not found in Clerk. Creating new...`);
        }
      }

      // Check if user exists in Clerk by email
      let clerkUser = null;
      try {
        // Try to find user by listing all and filtering
        const allUsers = await clerkClient.users.getUserList({ limit: 500 });
        if (allUsers && allUsers.data && Array.isArray(allUsers.data)) {
          clerkUser = allUsers.data.find(u => 
            u.emailAddresses?.some(e => e.emailAddress === userData.email)
          );
          if (clerkUser) {
            console.log(`   ℹ️  User already exists in Clerk: ${clerkUser.id}`);
          }
        }
      } catch (error) {
        console.log(`   ℹ️  Error checking for existing user: ${error.message}`);
        // Continue to create
      }

      // Create user in Clerk if doesn't exist
      if (!clerkUser) {
        try {
          console.log(`   🔨 Creating user in Clerk with phone: ${userData.phone}...`);
          // Create user with phone number (Clerk requires it)
          // Phone must be in E.164 format: +[country code][number]
          clerkUser = await clerkClient.users.createUser({
            emailAddress: [userData.email],
            password: userData.password,
            firstName: userData.firstName,
            lastName: userData.lastName,
            phoneNumber: [userData.phone], // E.164 format: +14155551234
            skipPasswordChecks: true, // Allow simple passwords for testing
            skipPasswordRequirement: true,
          });
          console.log(`   ✅ Created in Clerk: ${clerkUser.id}`);
        } catch (error) {
          console.error(`   ❌ Error creating user in Clerk:`, error.message);
          if (error.errors) {
            console.error(`   Error details:`, JSON.stringify(error.errors, null, 2));
          }
          
          // If phone number format is the issue, log it for debugging
          if (error.errors?.some(e => 
            e.message?.includes('phone_number') || 
            e.longMessage?.includes('phone_number') ||
            e.code === 'form_data_missing'
          )) {
            console.error(`   ⚠️  Phone number issue detected. Phone used: ${userData.phone}`);
            console.error(`   💡 Phone must be in E.164 format: +[country code][number]`);
            console.error(`   💡 Example: +14155551234 (US), +33123456789 (France)`);
          }
          
          // Try to find user one more time (maybe it was created despite the error)
          try {
            const allUsers = await clerkClient.users.getUserList({ limit: 500 });
            if (allUsers && allUsers.data && Array.isArray(allUsers.data)) {
              clerkUser = allUsers.data.find(u => 
                u.emailAddresses?.some(e => e.emailAddress === userData.email)
              );
              if (clerkUser) {
                console.log(`   ✅ Found existing user in Clerk: ${clerkUser.id}`);
              } else {
                console.error(`   ❌ Could not create user - check phone number format`);
                continue; // Skip this user
              }
            } else {
              console.error(`   ❌ Could not retrieve user list`);
              continue; // Skip this user
            }
          } catch (findError) {
            console.error(`   ❌ Could not find user after creation error: ${findError.message}`);
            continue; // Skip this user
          }
        }
      }

      // Link Clerk user to Neon database
      if (clerkUser && clerkUser.id) {
        try {
          const updateResult = await pool.query(
            `UPDATE users 
             SET clerk_id = $1, 
                 first_name = COALESCE($2, first_name),
                 last_name = COALESCE($3, last_name),
                 phone = $4,
                 email_verified = $5,
                 updated_at = CURRENT_TIMESTAMP
             WHERE email = $6
             RETURNING id, email, clerk_id, role`,
            [
              clerkUser.id,
              userData.firstName || null,
              userData.lastName || null,
              userData.phone || null,
              true, // Email verified
              userData.email
            ]
          );

          if (updateResult.rows.length > 0) {
            const updatedUser = updateResult.rows[0];
            console.log(`   ✅ Linked to Neon database`);
            console.log(`   📊 Neon User ID: ${updatedUser.id}`);
            console.log(`   🔗 Clerk ID: ${updatedUser.clerk_id}`);
            console.log(`   👤 Role: ${updatedUser.role}\n`);
          } else {
            console.log(`   ⚠️  Failed to update Neon database\n`);
          }
        } catch (dbError) {
          console.error(`   ❌ Error updating Neon database: ${dbError.message}\n`);
        }
      } else {
        console.log(`   ⚠️  No Clerk user ID available. Skipping link.\n`);
      }

    } catch (error) {
      console.error(`   ❌ Error processing ${userData.email}:`, error.message);
      if (error.stack) {
        console.error(`   Stack: ${error.stack}\n`);
      } else {
        console.error(`   Error object:`, error, '\n');
      }
    }
  }

  console.log('✨ Done! Users are now linked between Clerk and Neon.\n');
  console.log('📋 Summary:');
  console.log('   - Users can now login via Clerk');
  console.log('   - Backend will find them in Neon by clerk_id');
  console.log('   - All test credentials are in TEST_CREDENTIALS.md\n');
}

createClerkUsers()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  });
