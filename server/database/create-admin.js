import pool from './pool.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

async function createAdminUser(email, password) {
  try {
    // Check if user already exists
    const existingResult = await pool.query(
      'SELECT id, email, role FROM users WHERE email = $1',
      [email]
    );

    if (existingResult.rows.length > 0) {
      // Update existing user to admin
      const updateResult = await pool.query(
        'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, email, role',
        ['admin', existingResult.rows[0].id]
      );

      if (updateResult.rows.length > 0) {
        const data = updateResult.rows[0];
        console.log('✅ Existing user updated to admin:', data.email);
        console.log('   User ID:', data.id);
        console.log('   Role:', data.role);
        return;
      }
    }

    // Create new admin user
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await pool.query(
      `INSERT INTO users (email, password, role, email_verified, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, role`,
      [email, hashedPassword, 'admin', true, 'active']
    );

    if (result.rows.length > 0) {
      const data = result.rows[0];
      console.log('✅ Admin user created:', data.email);
      console.log('   User ID:', data.id);
      console.log('   Role:', data.role);
    }
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
