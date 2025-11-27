/* eslint-env node */
// Promote a user to admin role using Prisma
// Usage: node scripts/set-admin.js user@example.com
// Requires: DATABASE_URL in .env

import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error('❌ Missing email argument.');
    console.log('Usage: node scripts/set-admin.js user@example.com');
    process.exit(1);
  }

  try {
    console.log(`🔍 Looking up user with email: ${email}`);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.error('❌ User not found in database. Run sync-clerk-to-db first if this is a Clerk user.');
      process.exit(1);
    }

    if (user.role === 'admin') {
      console.log('ℹ️  User is already an admin. Nothing to do.');
      process.exit(0);
    }

    const updated = await prisma.user.update({ where: { id: user.id }, data: { role: 'admin' } });
    console.log('✅ Promotion successful!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`User ID   : ${updated.id}`);
    console.log(`Email     : ${updated.email}`);
    console.log(`New Role  : ${updated.role}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('You now have admin access. Re-login if necessary.');
  } catch (err) {
    console.error('❌ Error promoting user:', err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
