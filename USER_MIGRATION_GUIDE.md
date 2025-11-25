# User Migration Guide: Existing Users from Supabase

## Problem

After migrating from Supabase to Clerk, **existing users** (admin, free users, etc.) cannot log in because:

1. They don't have Clerk accounts
2. No `clerkId` link exists in the database
3. Their passwords are stored in Supabase (old database)

## Solution

Use the migration script to:
1. Create Clerk accounts for all existing users
2. Link Clerk accounts to database users via `clerkId`
3. Send password reset emails (users will set new passwords)

## Steps to Migrate Users

### Step 1: Install Dependencies

The migration script uses `@clerk/clerk-sdk-node` which is already installed.

### Step 2: Run Migration Script

#### Option A: Migrate from Neon Database (Recommended)

If users are already in the Neon database:

```bash
node scripts/migrate-existing-users.js
```

This will:
- Find all users without `clerkId` in Neon database
- Create Clerk accounts for each user
- Link Clerk accounts via `clerkId`
- Send password reset emails

#### Option B: Migrate from Supabase (If Old DB Still Accessible)

If you need to read from the old Supabase database:

```bash
node scripts/migrate-existing-users.js --from-supabase
```

Make sure these environment variables are set:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Step 3: Notify Users

After migration, users need to:

1. **Check their email** for password reset link from Clerk
2. **Click the reset link** and set a new password
3. **Log in** with their email and new Clerk password

**Important**: Users CANNOT use their old Supabase passwords. They MUST reset through Clerk.

### Step 4: Verify Migration

Check that all users have `clerkId`:

```sql
-- In your Neon database
SELECT id, email, role, clerk_id 
FROM users 
WHERE clerk_id IS NULL;
```

Should return 0 rows after successful migration.

## For Admin Users

Admin users will maintain their `role: 'admin'` status in the database. After migration:

1. Admin receives password reset email
2. Admin resets password through Clerk
3. Admin logs in and retains admin access (role is preserved)

## Manual Migration (If Script Fails)

If automatic migration fails, you can manually create users:

1. **Go to Clerk Dashboard** → Users
2. **Create user manually** for each existing user
3. **Copy the Clerk User ID**
4. **Update database**:
   ```sql
   UPDATE users 
   SET clerk_id = 'user_clerk_id_here'
   WHERE email = 'user@example.com';
   ```
5. **Send password reset** from Clerk Dashboard → Users → User → Send password reset

## Troubleshooting

### Error: "User already exists in Clerk"
- The script will automatically try to link to existing Clerk user
- Check if user was created manually

### Error: "Email already in use"
- User may have already signed up with Clerk
- Script will attempt to link automatically

### Users Not Receiving Password Reset Emails
1. Check Clerk Dashboard → Settings → Email
2. Verify SMTP configuration
3. Manually send reset from Clerk Dashboard

### Migration Partially Completed
- Re-run the script - it's safe to run multiple times
- Script skips users already linked to Clerk
- Check logs for specific errors

## After Migration

Once all users are migrated:

1. ✅ All users have `clerkId` in database
2. ✅ All users can log in with Clerk
3. ✅ Old Supabase passwords are no longer used
4. ✅ Admin roles are preserved

## Security Notes

- ⚠️ Old passwords are NOT migrated (security best practice)
- ✅ Users must reset passwords through Clerk
- ✅ This ensures all passwords meet Clerk's security standards
- ✅ Prevents password reuse vulnerabilities

