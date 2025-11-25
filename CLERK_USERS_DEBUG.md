# Debugging Clerk User Creation

## Quick Test

First, test if Clerk connection works:

```bash
npm run db:test-clerk
```

This will:
- ✅ Verify `CLERK_SECRET_KEY` is set
- ✅ Test Clerk API connection
- ✅ Try creating a test user
- ✅ Show any errors

## Common Issues

### Issue 1: CLERK_SECRET_KEY Not Set

**Symptoms:**
```
❌ CLERK_SECRET_KEY is not set in .env file
```

**Fix:**
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Go to **API Keys** → **Secret Keys**
4. Copy the **Secret Key** (starts with `sk_test_` or `sk_live_`)
5. Add to `.env`:
   ```env
   CLERK_SECRET_KEY=sk_test_your_key_here
   ```
6. Restart terminal/IDE to reload environment

### Issue 2: Wrong Secret Key

**Symptoms:**
```
❌ Clerk connection failed: Unauthorized
Status: 401
```

**Fix:**
- Make sure you're using the **Secret Key** (not Publishable Key)
- Secret keys start with `sk_test_` or `sk_live_`
- Publishable keys start with `pk_test_` or `pk_live_` (wrong one!)

### Issue 3: Users Don't Exist in Neon

**Symptoms:**
```
⚠️  User not found in Neon database. Skipping...
💡 Run 'npm run db:seed-mock' first to create users in Neon
```

**Fix:**
```bash
# First, run the migration to add clerk_id column
psql $DATABASE_URL -f server/database/migrations/25_add_clerk_integration.sql

# Then seed the database
npm run db:seed-mock

# Finally, create users in Clerk
npm run db:create-clerk-users
```

### Issue 4: Clerk API Errors

**Symptoms:**
```
❌ Error creating user in Clerk: [error message]
```

**Common errors:**
- **"Email already exists"** - User already in Clerk, script will link them
- **"Invalid password"** - Password doesn't meet Clerk's requirements
- **"Rate limit exceeded"** - Too many requests, wait a few minutes

## Step-by-Step Debugging

### Step 1: Verify Environment
```bash
# Check if CLERK_SECRET_KEY is set
node -e "console.log('CLERK_SECRET_KEY:', process.env.CLERK_SECRET_KEY ? 'SET' : 'NOT SET')"
```

### Step 2: Test Clerk Connection
```bash
npm run db:test-clerk
```

### Step 3: Check Neon Database
```bash
# Verify users exist in Neon
psql $DATABASE_URL -c "SELECT email, clerk_id FROM users WHERE email LIKE '%@academora.com';"
```

### Step 4: Run User Creation
```bash
npm run db:create-clerk-users
```

## Manual Creation (Alternative)

If the script doesn't work, you can create users manually:

### Option 1: Via Clerk Dashboard
1. Go to Clerk Dashboard → **Users**
2. Click **+ Add User**
3. Enter email, password, first name, last name
4. Copy the `user_id` (clerk_id)
5. Update Neon database:
   ```sql
   UPDATE users 
   SET clerk_id = 'user_2abc123...', 
       first_name = 'Admin',
       last_name = 'User',
       email_verified = true
   WHERE email = 'admin@academora.com';
   ```

### Option 2: Via Clerk API (curl)
```bash
curl -X POST https://api.clerk.com/v1/users \
  -H "Authorization: Bearer $CLERK_SECRET_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email_address": ["admin@academora.com"],
    "password": "Admin123!",
    "first_name": "Admin",
    "last_name": "User",
    "skip_password_checks": true,
    "skip_password_requirement": true
  }'
```

Then update Neon with the returned `id`.

## Verification

After running the script, verify:

### In Clerk Dashboard:
1. Go to **Users**
2. Should see all 5 users listed
3. Each has email, name, and verified status

### In Neon Database:
```sql
SELECT email, clerk_id, first_name, last_name, email_verified, role
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

All should have:
- ✅ `clerk_id` populated (starts with `user_`)
- ✅ `first_name` and `last_name` set
- ✅ `email_verified = true`

## Still Not Working?

1. **Check script output** - Look for specific error messages
2. **Run test script** - `npm run db:test-clerk` to isolate the issue
3. **Check Clerk Dashboard** - Verify API key permissions
4. **Check logs** - Look for detailed error messages in script output

---

**Next Steps:**
- Run `npm run db:test-clerk` first to verify connection
- Then run `npm run db:create-clerk-users` to create users
- Check the output for specific error messages

