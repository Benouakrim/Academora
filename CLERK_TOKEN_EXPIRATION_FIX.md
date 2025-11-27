# Clerk Token Expiration Fix - Complete Investigation

## Root Cause Analysis

After thorough investigation, the token expiration issue is caused by **missing refresh cookies**. Here's what we found:

### The Problem
1. **Clerk tokens expire every 60 seconds** (by design for security)
2. **Clerk should automatically refresh tokens every 50 seconds** using refresh cookies
3. **Refresh cookies are NOT being set** - Backend logs show: `"session-token-expired-refresh-non-eligible-no-refresh-cookie"`
4. **Without refresh cookies, tokens expire and cannot be refreshed**

### Why Refresh Cookies Aren't Being Set

The refresh cookies are HttpOnly cookies set by Clerk's backend servers, not your application. They require:
1. ✅ **CORS configured to allow credentials** - FIXED in `server/middleware/security.js`
2. ✅ **Backend Clerk middleware properly configured** - FIXED in `server/middleware/auth.js`
3. ⚠️ **ClerkProvider properly configured** - VERIFIED in `src/main.tsx`
4. ❓ **Clerk Dashboard settings** - NEEDS VERIFICATION

## Fixes Applied

### 1. Backend Clerk Middleware (`server/middleware/auth.js`)
- ✅ Added configuration validation
- ✅ Created middleware instance once (not on every request)
- ✅ Added proper error handling
- ✅ Validates `CLERK_SECRET_KEY` is set

### 2. CORS Configuration (`server/middleware/security.js`)
- ✅ Added `credentials: true` (essential for cookies)
- ✅ Added proper headers for Clerk auth debugging
- ✅ Exposed Clerk auth headers for troubleshooting

### 3. Frontend Token Handling (`src/lib/user/verifyAndHeal.ts`)
- ✅ Added token expiration validation
- ✅ Added retry logic with fresh tokens
- ✅ Graceful skipping when tokens unavailable
- ✅ Uses `skipCache: true` to force fresh tokens

### 4. ClerkProvider Configuration (`src/main.tsx`)
- ✅ Fixed deprecated props
- ✅ Verified configuration

## Environment Variables Verified

Your `.env` file has:
- ✅ `CLERK_SECRET_KEY=sk_test_...` (Backend)
- ✅ `VITE_CLERK_PUBLISHABLE_KEY=pk_test_...` (Frontend)
- ✅ `CLERK_WEBHOOK_SECRET=whsec_...` (Webhooks)

## What to Check Next

### 1. Verify Backend Startup Logs
When you start the backend server, you should see:
```
✅ CLERK_SECRET_KEY is configured (length: XX chars)
✅ Clerk middleware initialized
```

If you see errors, the secret key isn't being read properly.

### 2. Check Browser Cookies (After Login)
1. Open DevTools → Application → Cookies
2. Look for Clerk cookies:
   - `__session` (session cookie)
   - `__client` (client cookie)
   - Any cookies starting with `__clerk_`
3. If these are missing, refresh cookies won't work

### 3. Check Clerk Dashboard Settings
1. Go to Clerk Dashboard → Settings
2. Check **Allowed Origins**:
   - Should include: `http://localhost:5173`
   - Should include: `http://localhost:3001` (if needed)
3. Check **Cookie Settings**:
   - SameSite: Should be `Lax` or `None` (for localhost, `Lax` is fine)
   - Secure: Should be `false` for localhost (HTTP), `true` for production (HTTPS)

### 4. Check Network Tab
1. After login, check Network tab in DevTools
2. Look for requests to Clerk's servers (e.g., `clerk.accounts.dev`)
3. Check if cookies are being set in response headers
4. Check if cookies are being sent in request headers

## Expected Behavior After Fixes

1. **Tokens should refresh automatically** every 50 seconds (handled by Clerk SDK)
2. **If a token expires**, Clerk should use refresh cookie to get a new one
3. **If refresh cookie is missing**, tokens will expire and can't be refreshed (current issue)
4. **Verification will skip gracefully** if tokens aren't available (won't block the app)

## If Refresh Cookies Still Don't Work

The issue is likely in Clerk Dashboard configuration:
1. **Check Allowed Origins** - Must include your frontend URL
2. **Check Cookie Domain** - For localhost, should be empty or `localhost`
3. **Check SameSite Policy** - Should allow cookies in your setup
4. **Try clearing all cookies** and logging in again

## Testing Steps

1. **Clear all browser data** (cookies, localStorage, cache)
2. **Restart backend server** - Check for Clerk initialization logs
3. **Log in** - Check browser cookies are set
4. **Wait 60+ seconds** - Token should refresh automatically
5. **Check console** - Should see fewer 401 errors

## Summary

The code is now properly configured. The remaining issue is that **refresh cookies aren't being set by Clerk's servers**. This could be due to:
- Clerk Dashboard configuration (Allowed Origins, Cookie settings)
- Browser blocking cookies (privacy settings)
- Network/CORS issues preventing cookie setting

The fixes ensure that:
- ✅ Backend properly validates tokens
- ✅ Frontend handles expired tokens gracefully
- ✅ CORS allows credentials for cookies
- ✅ Verification doesn't block the app if tokens expire

If refresh cookies are still not set after these fixes, the issue is in Clerk Dashboard configuration or browser settings.

