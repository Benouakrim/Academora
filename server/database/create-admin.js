import supabase from './supabase.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

async function createAdminUser(email, password) {
  try {
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('email', email)
      .single();

    if (existingUser) {
      // Update existing user to admin
      const { data, error } = await supabase
        .from('users')
        .update({ role: 'admin' })
        .eq('id', existingUser.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating user to admin:', error);
        return;
      }

      console.log('✅ Existing user updated to admin:', data.email);
      console.log('   User ID:', data.id);
      console.log('   Role:', data.role);
      return;
    }

    // Create new admin user
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          email,
          password: hashedPassword,
          role: 'admin',
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating admin:', error);
      return;
    }

    console.log('✅ Admin user created:', data.email);
    console.log('   User ID:', data.id);
    console.log('   Role:', data.role);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Get email and password from command line arguments
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error('Usage: node create-admin.js <email> <password>');
  console.error('Example: node create-admin.js admin@example.com MySecurePassword123');
  process.exit(1);
}

createAdminUser(email, password).then(() => {
  console.log('\n✨ Done! You can now login with this admin account.');
  process.exit(0);
});

