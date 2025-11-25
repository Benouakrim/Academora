# Setting Up Test Users in Clerk

## Problem

The seed script created users in Neon database, but they don't exist in Clerk. Since authentication goes through Clerk first, those users can't log in.

## Solution

Run the script to create users in Clerk and link them to Neon database.

## Steps

### 1. Get Clerk Secret Key

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Go to **API Keys** (left sidebar)
4. Copy the **Secret Key** (starts with `sk_test_` or `sk_live_`)

### 2. Add to .env

Add the secret key to your `.env` file:

```env
CLERK_SECRET_KEY=sk_test_your_secret_key_here
```

### 3. Run the Migration (If Not Done)

Make sure the Clerk integration columns exist:

```sql
-- Run in your Neon database
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS clerk_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT,
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended'));

CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON public.users(clerk_id);

ALTER TABLE public.users
  ALTER COLUMN password DROP NOT NULL;
```

Or use the migration file:
```bash
psql $DATABASE_URL -f server/database/migrations/25_add_clerk_integration.sql
```

### 4. Ensure Users Exist in Neon

Make sure the test users exist in Neon database:

```bash
npm run db:seed-mock
```

This creates 5 test users:
- admin@academora.com
- student@academora.com
- parent@academora.com
- counselor@academora.com
- developer@academora.com

### 5. Create Users in Clerk and Link

Run the script to create users in Clerk and link them:

```bash
npm run db:create-clerk-users
```

This script will:
1. ✅ Check if users exist in Neon database
2. ✅ Create users in Clerk (if they don't exist)
3. ✅ Link Clerk users to Neon database via `clerk_id`
4. ✅ Update user info (first_name, last_name, email_verified)

## What the Script Does

For each test user:

1. **Checks Neon Database**: Verifies user exists
2. **Checks Clerk**: Looks for existing user by email or clerk_id
3. **Creates in Clerk**: If not found, creates user with:
   - Email address
   - Password
   - First name & Last name
4. **Links to Neon**: Updates Neon database with:
   - `clerk_id` from Clerk
   - `first_name` and `last_name`
   - `email_verified = true`

## Test Users Created

| Email | Password | Role | Clerk ID |
|-------|----------|------|----------|
| admin@academora.com | Admin123! | admin | user_... |
| student@academora.com | Student123! | user | user_... |
| parent@academora.com | Parent123! | user | user_... |
| counselor@academora.com | Counselor123! | user | user_... |
| developer@academora.com | Dev123! | user | user_... |

## Verification

### Check in Clerk Dashboard:
1. Go to **Users** in Clerk Dashboard
2. You should see all 5 users listed
3. Each user should have email, name, and be verified

### Check in Neon Database:
```sql
SELECT id, email, clerk_id, first_name, last_name, role, email_verified
FROM users
WHERE email IN (
  'admin@academora.com',
  'student@academora.com',
  'parent@academora.com',
  'counselor@academora.com',
  'developer@academora.com'
)
ORDER BY email;
```

All users should have:
- ✅ `clerk_id` populated (starts with `user_`)
- ✅ `first_name` and `last_name` set
- ✅ `email_verified = true`

### Test Login:
1. Go to `/login` page
2. Try logging in with any test user credentials
3. Should successfully authenticate via Clerk
4. Backend should find user in Neon by `clerk_id`

## Troubleshooting

### Error: "CLERK_SECRET_KEY is not set"
- Make sure you added `CLERK_SECRET_KEY` to `.env` file
- Restart your terminal/IDE to reload environment variables

### Error: "User not found in Neon database"
- Run `npm run db:seed-mock` first to create users in Neon
- Then run `npm run db:create-clerk-users`

### Error: "User already exists in Clerk"
- The script will detect and link existing Clerk users
- No action needed, it will update the Neon database

### Users can't login after setup
- Verify `clerk_id` is set in Neon: `SELECT clerk_id FROM users WHERE email = '...'`
- Check Clerk Dashboard to confirm user exists
- Verify webhook is configured (for future users)

## Next Steps

After setup:
1. ✅ Users can login via Clerk
2. ✅ Backend finds users in Neon by `clerk_id`
3. ✅ All features work with proper authentication
4. ✅ Future users will sync automatically via webhook

---

**Note**: The script is idempotent - you can run it multiple times safely. It will skip users that are already linked.

