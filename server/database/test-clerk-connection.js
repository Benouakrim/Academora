import { clerkClient } from '@clerk/clerk-sdk-node';
import dotenv from 'dotenv';

dotenv.config();

async function testClerkConnection() {
  const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
  
  console.log('🧪 Testing Clerk Connection...\n');
  
  if (!CLERK_SECRET_KEY) {
    console.error('❌ CLERK_SECRET_KEY is not set in .env file');
    console.error('   Get it from: Clerk Dashboard → API Keys → Secret Key');
    process.exit(1);
  }
  
  console.log(`✅ CLERK_SECRET_KEY found: ${CLERK_SECRET_KEY.substring(0, 10)}...`);
  console.log(`   Full key length: ${CLERK_SECRET_KEY.length} characters\n`);
  
  try {
    console.log('📡 Testing Clerk API connection...');
    
    // Try to list users (this will verify the connection works)
    const users = await clerkClient.users.getUserList({ limit: 10 });
    
    console.log(`✅ Clerk connection successful!`);
    console.log(`   Found ${users.data?.length || 0} users in Clerk\n`);
    
    if (users.data && users.data.length > 0) {
      console.log('📋 Existing users in Clerk:');
      users.data.forEach((user, index) => {
        const email = user.emailAddresses?.[0]?.emailAddress || 'No email';
        console.log(`   ${index + 1}. ${email} (ID: ${user.id})`);
      });
    }
    
    // Test creating a user
    console.log('\n🧪 Testing user creation...');
    const testEmail = `test-${Date.now()}@academora.com`;
    
    try {
      const newUser = await clerkClient.users.createUser({
        emailAddress: [testEmail],
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User',
        skipPasswordChecks: true,
        skipPasswordRequirement: true,
      });
      
      console.log(`✅ Test user created successfully!`);
      console.log(`   Email: ${testEmail}`);
      console.log(`   Clerk ID: ${newUser.id}\n`);
      
      // Clean up - delete test user
      console.log('🧹 Cleaning up test user...');
      await clerkClient.users.deleteUser(newUser.id);
      console.log('✅ Test user deleted\n');
      
    } catch (createError) {
      console.error('❌ Error creating test user:', createError.message);
      if (createError.errors) {
        console.error('   Errors:', JSON.stringify(createError.errors, null, 2));
      }
    }
    
    console.log('✨ Clerk connection test complete!\n');
    
  } catch (error) {
    console.error('❌ Clerk connection failed:', error.message);
    if (error.status) {
      console.error(`   Status: ${error.status}`);
    }
    if (error.errors) {
      console.error('   Errors:', JSON.stringify(error.errors, null, 2));
    }
    console.error('   Full error:', error);
    process.exit(1);
  }
}

testClerkConnection()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

