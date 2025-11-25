# Debugging Steps for 403 "Admin access required" Error

## Changes Made

1. **Moved userArticlesRoutes before microContentRoutes** in `server/app.js` to ensure routes match in correct order
2. **Removed duplicate `parseUserToken`** from route definitions (already applied globally)
3. **Added comprehensive logging** to track authentication flow
4. **Added database error handling** to detect RLS issues

## Next Steps to Debug

### 1. Restart Your Backend Server
```bash
# Stop the current server and restart it
npm run dev
# or
node server/index.js
```

### 2. Check Backend Console Logs

When you try to save/submit an article, you should see logs like:
```
[AUTH] parseUserToken: User found { id: '...', email: '...', role: 'user' }
[AUTH] requireUser check: { path: '/submit', method: 'POST', hasUser: true, ... }
[userArticles] /submit: userId ... status draft
```

**If you see:**
- `req.user: NULL` → Authentication is failing
- `User not found for userId` → User doesn't exist in database
- `parseUserToken error` → JWT token is invalid or expired
- Database errors about "row-level security" → RLS is still enabled

### 3. Test the Test Endpoint

Try accessing: `http://localhost:3001/api/user-articles/test`

This should return: `{ "message": "User articles route is working", "path": "/test" }`

If this doesn't work, the route isn't being reached at all.

### 4. Verify RLS is Disabled

Run this in Supabase SQL Editor:
```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('articles', 'categories', 'taxonomy_terms');

-- If rowsecurity is true, disable it:
ALTER TABLE public.articles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.taxonomy_terms DISABLE ROW LEVEL SECURITY;
```

### 5. Check Your JWT Token

In browser console:
```javascript
const token = localStorage.getItem('token');
console.log('Token exists:', !!token);
// Decode it (without verification) to see contents
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Token payload:', payload);
```

### 6. Verify User Role

Check your user's role in the database:
```sql
SELECT id, email, role FROM users WHERE email = 'your-email@example.com';
```

The role should be `'user'` (not `'admin'`), but that's fine for user-articles routes.

## Common Issues

### Issue: "Admin access required" error persists
**Solution:** Check if `microContentRoutes` is somehow matching the request. The route order fix should prevent this.

### Issue: Authentication required (401)
**Solution:** 
- Check if JWT token is being sent in Authorization header
- Verify JWT_SECRET is set in backend .env
- Check if token is expired

### Issue: Database errors about RLS
**Solution:** Run the SQL script to disable RLS on articles, categories, and taxonomy_terms tables.

### Issue: User not found
**Solution:** The user ID in the JWT token doesn't match any user in the database. Check if user exists.

## What to Share

If the issue persists, please share:
1. Backend console logs when you try to save/submit
2. Response from `/api/user-articles/test` endpoint
3. Output of RLS check query
4. Any error messages from browser console

