# Referral Dashboard Fix: "Admin access required" Error

## Problem
Users are seeing "Admin access required" error when trying to access the referral dashboard at `/referrals`.

## Root Cause
The referral system routes (`/api/referrals/*`) were applying the `parseUserToken` middleware twice - once globally in `app.js` and again at the route level. This caused `req.user` to be potentially nullified or misconfigured, leading to authentication failures.

Additionally, if Row Level Security (RLS) is enabled on the referral tables without proper policies, users cannot access their own data even with valid authentication.

## Solution

### Step 1: Fix Route Middleware (CODE FIX - Already Applied)

The file `server/routes/referrals.js` has been updated to remove duplicate `parseUserToken` middleware calls. The global middleware in `app.js` is sufficient.

**Changed:**
```javascript
// BEFORE:
router.get('/my-code', parseUserToken, requireUser, async (req, res) => {

// AFTER:
router.get('/my-code', requireUser, async (req, res) => {
```

This fix has been applied to all three protected routes: `/my-code`, `/my-referrals`, and `/my-rewards`.

### Step 2: Run the RLS Policy Fix Script (DATABASE FIX)

### Step 2: Run the RLS Policy Fix Script (DATABASE FIX)

Execute the following script in your **Supabase SQL Editor**:

```bash
server/database/fix-referrals-rls.sql
```

Or manually run the updated schema:

```bash
server/database/referrals-schema.sql
```

This will:
1. Enable RLS on all referral tables
2. Create policies allowing users to view their own data
3. Create policies allowing admins to view all data
4. Allow the service role to perform privileged operations

### Step 3: Verify Your Environment Variables

Make sure your `.env` file has the correct Supabase credentials:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
# Note: SUPABASE_KEY (anon key) is for client-side, not server-side
```

**Important:** The backend MUST use `SUPABASE_SERVICE_ROLE_KEY` (not the anon key) to bypass RLS for system operations like creating referral codes.

### Step 4: Restart Your Backend Server

After updating the code and database, restart your server to load the changes:

```bash
# Stop the server (Ctrl+C in the terminal running the server)
# Then restart it
npm run dev
```

**Or** if using the node terminal in VS Code, just restart it.

### Step 5: Clear Browser Cache and Test

1. Clear your browser's local storage and cookies for the site
2. Log out and log back in to get a fresh JWT token
3. Navigate to `/referrals` and test the dashboard

## How the Fix Works

### RLS Policies Created

#### For `referral_codes` table:
- ✅ Users can view/create/update their own codes
- ✅ Admins can view all codes

#### For `referrals` table:
- ✅ Users can view referrals where they are the referrer
- ✅ Users can view referrals where they are the referred person
- ✅ Service role can insert/update (for system operations)
- ✅ Admins can view all referrals

#### For `referral_rewards` table:
- ✅ Users can view their own rewards (as referrer or referred)
- ✅ Service role can manage all rewards
- ✅ Admins can view all rewards

#### For `referral_settings` table:
- ✅ Anyone can read settings (needed for expiry calculations)
- ✅ Only admins can modify settings

## Troubleshooting

### Still getting "Admin access required"?

1. **Check if you're using the service role key:**
   ```bash
   # In your server logs, you should see:
   # "Using SUPABASE_SERVICE_ROLE_KEY for server operations"
   # NOT "Using anon SUPABASE_KEY"
   ```

2. **Verify RLS policies exist:**
   ```sql
   SELECT tablename, policyname 
   FROM pg_policies 
   WHERE tablename IN ('referral_codes', 'referrals', 'referral_rewards', 'referral_settings');
   ```
   You should see 15 policies total.

3. **Check if JWT token has correct user ID:**
   - Open browser DevTools → Application → Local Storage
   - Check the `token` value
   - Decode it at https://jwt.io
   - Verify it has a valid `id` or `userId` field

4. **Verify your `users` table has the user:**
   ```sql
   SELECT id, email, role FROM users WHERE id = 'your-user-id';
   ```

5. **Check server logs for detailed errors:**
   The backend logs will show the actual Supabase error if RLS is blocking access.

### Still not working?

The issue might be with JWT token verification. Check:

1. `server/middleware/auth.js` - Ensure `parseUserToken` and `requireUser` are working
2. Frontend token storage - Verify token is being sent in `Authorization: Bearer <token>` header
3. Token expiry - If your token expired, log out and log back in

## API Routes Affected

These routes now work correctly for regular users:

- `GET /api/referrals/my-code` - Get your referral code
- `GET /api/referrals/my-referrals` - List your referrals  
- `GET /api/referrals/my-rewards` - View your rewards
- `GET /api/referrals/validate/:code` - Validate a code (public)

Admin-only routes (not affected by this fix):

- `GET /api/admin/referrals/*` - Admin management endpoints

## Testing the Fix

After applying the fix, test with a regular user account:

1. Log in as a non-admin user
2. Navigate to `/referrals`
3. You should see:
   - Your referral code
   - Stats (may be 0 if you haven't referred anyone)
   - Option to copy/share your code
   - No "Admin access required" error

## Related Files

- `server/database/referrals-schema.sql` - Main schema with RLS policies
- `server/database/fix-referrals-rls.sql` - Quick fix script
- `server/routes/referrals.js` - User API endpoints
- `server/routes/adminReferrals.js` - Admin API endpoints (unchanged)
- `server/data/referrals.js` - Data access layer
- `src/pages/ReferralDashboard.tsx` - Frontend dashboard
- `src/lib/api.ts` - API client (`referralsAPI`)

## Summary

The fix adds proper Row Level Security policies to allow:
- ✅ Regular users to access their own referral data
- ✅ Admins to access all referral data
- ✅ Service role to perform system operations

No code changes needed - only database policy configuration!
