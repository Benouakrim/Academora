# RLS Policy Fix Summary

## Problem
Standard users received 403 errors on multiple endpoints:
- `GET /api/categories?type=blog` → 403
- `GET /api/taxonomy-terms?taxonomy=scope` → 403
- `GET /api/user-articles/can-submit` → 403
- `POST /api/user-articles/submit` → 403

The root cause was **RLS (Row-Level Security)** blocking queries for authenticated non-admin users.

## Root Cause
When a user logged in, the `parseUserToken` middleware attached their JWT to all requests. The Supabase client then ran queries **as that user**, not as the service account. Because the `'user'` role had no RLS policies allowing SELECT on `categories` or `taxonomy_terms`, Supabase blocked those queries, returning 403.

Similarly, articles table queries failed because RLS lacked policies for user-owned reads/writes.

## Solution

### 1. Created Public API Routes
Created two new public route files:
- **`server/routes/categories.js`**: Public GET endpoints for categories
- **`server/routes/taxonomyTerms.js`**: Public GET endpoints for taxonomy terms

These routes are mounted in `app.js`:
```js
app.use('/api/categories', categoriesRoutes);
app.use('/api/taxonomy-terms', taxonomyTermsRoutes);
```

### 2. Fixed Image Upload URL
The frontend was trying incorrect endpoints (`/api/user-uploads/image`, `/api/user/upload/image`). Changed `src/lib/api.ts` to use `/api/upload/image` directly.

The backend route already had correct middleware (`requireUser`, not `requireAdmin`).

### 3. Created RLS Policy Script
Created `scripts/rls-policies-fix.sql` with the following policies:

**For `articles` table:**
- Allow users to SELECT their own articles (WHERE `auth.uid() = author_id`)
- Allow users to INSERT new articles (WITH CHECK `auth.uid() = author_id`)
- Allow users to UPDATE their own articles

**For public tables:**
- Allow public read access to `categories` (USING `true`)
- Allow public read access to `taxonomy_terms` (USING `true`)

### 4. Next Steps
1. **Run the SQL script** in your Supabase SQL Editor:
   - Go to your Supabase project → SQL
   - Paste the contents of `scripts/rls-policies-fix.sql`
   - Execute the script

2. **Restart your backend** to load the new public routes:
   ```powershell
   # Stop current server (Ctrl+C)
   cd server; node index.js
   ```

3. **Test in the browser** as a standard user:
   - Should be able to load categories and taxonomy terms
   - Should be able to submit articles
   - Should be able to upload images

## Files Modified
- `src/lib/api.ts` (fixed upload URL)
- `server/app.js` (added public categories/taxonomy routes)
- `server/routes/categories.js` (created)
- `server/routes/taxonomyTerms.js` (created)
- `scripts/rls-policies-fix.sql` (created)

## Notes
- The `userArticles.js` route already used `requireUser` correctly
- The issue was **RLS at the database level**, not Express middleware
- Public routes bypass admin middleware while RLS policies control database-level access
