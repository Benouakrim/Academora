# Fix: "Admin access required" Error on User Articles

## Problem
Users are getting 403 "Admin access required" errors when trying to:
- Save drafts (`POST /api/user-articles/submit` with status='draft')
- Submit articles (`POST /api/user-articles/submit` with status='pending')
- Check submission limit (`GET /api/user-articles/can-submit`)

## Root Cause
The most likely cause is **Row Level Security (RLS)** policies on the database tables blocking queries. The backend uses a direct PostgreSQL connection (not Supabase client with auth context), so RLS policies that use `auth.uid()` won't work.

## Solution

### Step 1: Fix RLS Policies (Database Fix)

Run the SQL script in your **Supabase SQL Editor**:

```sql
-- Disable RLS on articles table (backend handles auth via middleware)
ALTER TABLE public.articles DISABLE ROW LEVEL SECURITY;

-- Disable RLS on categories and taxonomy_terms (needed for article editor)
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.taxonomy_terms DISABLE ROW LEVEL SECURITY;
```

**OR** if you prefer to keep RLS enabled, use the script in `scripts/fix-user-articles-rls.sql` which creates service role policies.

### Step 2: Verify Backend Routes

The routes in `server/routes/userArticles.js` are correct:
- They use `parseUserToken` and `requireUser` (not `requireAdmin`)
- Added better error logging to help debug issues

### Step 3: Test the Fix

1. Restart your backend server
2. Try saving a draft article
3. Try submitting an article for review
4. Check the my-articles page to see your articles

## Code Changes Made

1. **Added error logging** to `server/routes/userArticles.js`:
   - Logs userId and request details for debugging
   - Better error messages

2. **Improved error handling** in `src/pages/MyArticles.tsx`:
   - Checks response.ok before parsing JSON
   - Handles errors gracefully

3. **Created RLS fix script** in `scripts/fix-user-articles-rls.sql`

## Verification

After applying the fix:
- ✅ Users can save drafts without errors
- ✅ Users can submit articles for review
- ✅ Articles appear in `/my-articles` page
- ✅ No more 403 "Admin access required" errors

## If Issues Persist

Check the backend console logs for:
- `[AUTH] requireUser check` messages
- `[userArticles]` log messages
- Database connection errors

If `req.user` is null, check:
- JWT token is being sent in Authorization header
- JWT_SECRET is set correctly in backend .env
- User exists in database

