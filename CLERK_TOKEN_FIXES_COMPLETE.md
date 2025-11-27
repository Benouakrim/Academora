# Complete Clerk Token Expiration Fixes

## ✅ Solutions Implemented

### 1. Skip Cache (✅ COMPLETE)
**Status**: ✅ **FULLY IMPLEMENTED**

All `getToken()` calls now use `skipCache: true`:
- ✅ `src/lib/user/verifyAndHeal.ts` - All token retrievals
- ✅ `src/pages/LoginPage.tsx` - Login and auto-redirect flows
- ✅ `src/pages/DashboardPage.tsx` - Background verification
- ✅ `src/components/Navbar.tsx` - Notification polling

**What this fixes**: Forces Clerk to fetch fresh tokens from the server instead of using cached (potentially expired) tokens.

---

### 2. Clock Skew (⚠️ PARTIAL - Needs Manual Configuration)

**Status**: ⚠️ **NEEDS CLERK DASHBOARD CONFIGURATION**

**The Problem**: If your server's clock is ahead of the user's clock, tokens appear expired even when they're valid.

**Code Changes**: Clerk Express v1.0.0 doesn't expose clock tolerance directly. However, we've:
- ✅ Optimized middleware initialization (creates once, reuses)
- ✅ Added proper error handling
- ✅ Validated configuration on startup

**Manual Fix Required**:
1. **Check System Time**: Ensure your server (Neon/Backend) has accurate time
   ```bash
   # On your server, check time sync
   date
   # Should match your local time within a few seconds
   ```

2. **Clerk Dashboard** (if available):
   - Go to Clerk Dashboard → Settings → Advanced
   - Look for "Clock Tolerance" or "Token Leeway" settings
   - Set to 5-10 seconds if available

3. **Alternative**: If clock skew persists, consider using NTP (Network Time Protocol) to sync server time.

**Note**: Clerk Express middleware handles token validation internally. If clock skew is severe, you may need to upgrade to a newer version of `@clerk/express` that supports clock tolerance configuration.

---

### 3. Browser Tracking Prevention (⚠️ PARTIAL - Needs Custom Domain)

**Status**: ⚠️ **CORS CONFIGURED, BUT NEEDS CUSTOM DOMAIN FOR PRODUCTION**

**Code Changes**:
- ✅ CORS configured with `credentials: true` in `server/middleware/security.js`
- ✅ Proper headers exposed for Clerk auth debugging
- ✅ Allowed origins configured

**The Problem**: Browsers (Safari, Brave, Chrome Incognito) block third-party cookies. Clerk's `__session` cookie is considered third-party if it comes from `clerk.accounts.dev`.

**Manual Fix Required**:

**For Development**:
- ✅ Test in normal browser mode (not Incognito)
- ✅ Disable "Block Third-Party Cookies" in browser settings (for testing only)

**For Production** (CRITICAL):
1. **Set up Custom Domain in Clerk Dashboard**:
   - Go to Clerk Dashboard → Settings → Domains
   - Add a custom domain (e.g., `auth.yourdomain.com`)
   - Follow Clerk's instructions to set up CNAME record
   - This makes cookies "first-party" instead of "third-party"

2. **Update Environment Variables**:
   ```env
   # After setting up custom domain, Clerk will provide new URLs
   CLERK_FRONTEND_API_URL=https://auth.yourdomain.com
   ```

3. **Update Frontend Configuration**:
   - Update `src/main.tsx` if ClerkProvider needs domain configuration
   - Clerk should automatically use custom domain if configured in Dashboard

**Why This Matters**: Without a custom domain, browsers will block Clerk's refresh cookies, causing tokens to expire without being refreshable.

---

### 4. Clerk Dashboard Settings (❌ NOT CHECKED - Needs Manual Verification)

**Status**: ❌ **REQUIRES MANUAL CHECK IN CLERK DASHBOARD**

**Critical Settings to Verify**:

1. **Session Lifetime**:
   - Go to Clerk Dashboard → Configure → Sessions
   - **Session Lifetime**: Should be long (e.g., 7 days, not 60 seconds)
   - **Inactivity Timeout**: Should be reasonable (e.g., 30 minutes to 1 hour)
   - **Note**: Token lifetime (60 seconds) cannot be changed on free/standard plans, but session lifetime should be long

2. **Allowed Origins**:
   - Go to Clerk Dashboard → Settings → Allowed Origins
   - Must include: `http://localhost:5173` (your frontend)
   - Must include: `http://localhost:3001` (if needed for API calls)
   - For production: Add your production domain

3. **Cookie Settings**:
   - Go to Clerk Dashboard → Settings → Cookies (if available)
   - **SameSite**: Should be `Lax` for localhost, `None` for cross-domain (requires Secure)
   - **Secure**: `false` for localhost (HTTP), `true` for production (HTTPS)

4. **API Keys**:
   - Verify `CLERK_SECRET_KEY` matches Dashboard → API Keys → Secret Key
   - Verify `VITE_CLERK_PUBLISHABLE_KEY` matches Dashboard → API Keys → Publishable Key

---

## Implementation Checklist

### ✅ Code Changes (Complete)
- [x] All `getToken()` calls use `skipCache: true`
- [x] CORS configured with `credentials: true`
- [x] Clerk middleware optimized (created once, reused)
- [x] Configuration validation on startup
- [x] Proper error handling and logging

### ⚠️ Manual Configuration Required
- [ ] **Check System Time**: Verify server clock is accurate
- [ ] **Clerk Dashboard - Sessions**: Verify session lifetime is long (7 days)
- [ ] **Clerk Dashboard - Allowed Origins**: Add `http://localhost:5173`
- [ ] **Clerk Dashboard - Custom Domain**: Set up for production (if needed)
- [ ] **Browser Settings**: Test in normal mode (not Incognito) for development

---

## Testing Steps

1. **Clear All Data**:
   ```bash
   # Clear browser cookies, localStorage, cache
   # Or use DevTools → Application → Clear Storage
   ```

2. **Restart Backend**:
   ```bash
   npm run dev:server
   # Check for: "✅ CLERK_SECRET_KEY is configured"
   # Check for: "✅ Clerk middleware initialized"
   ```

3. **Login and Check Cookies**:
   - Open DevTools → Application → Cookies
   - Look for `__session` or `__clerk_*` cookies
   - If missing, refresh cookies aren't being set

4. **Monitor Token Refresh**:
   - Wait 60+ seconds after login
   - Check Network tab for requests to Clerk servers
   - Tokens should refresh automatically every 50 seconds

5. **Check for 401 Errors**:
   - Should see fewer 401 errors
   - If still seeing errors, check Clerk Dashboard settings

---

## Expected Behavior After All Fixes

1. ✅ Tokens refresh automatically every 50 seconds (Clerk SDK handles this)
2. ✅ If a token expires, Clerk uses refresh cookie to get a new one
3. ✅ Clock skew of up to 5-10 seconds is tolerated (if configured)
4. ✅ Browsers don't block refresh cookies (with custom domain in production)
5. ✅ Sessions last 7 days (not 60 seconds)
6. ✅ Verification gracefully skips if tokens unavailable (doesn't block app)

---

## If Issues Persist

1. **Check Backend Logs**: Look for Clerk initialization messages
2. **Check Browser Console**: Look for Clerk SDK errors
3. **Check Network Tab**: Verify requests to Clerk servers succeed
4. **Check Cookies**: Verify `__session` cookie is set after login
5. **Check Clerk Dashboard**: Verify all settings are correct
6. **Check System Time**: Verify server clock is accurate

---

## Summary

**Code Fixes**: ✅ **COMPLETE**
- Skip cache implemented everywhere
- CORS properly configured
- Middleware optimized

**Manual Configuration**: ⚠️ **REQUIRED**
- Clerk Dashboard session settings
- Allowed origins
- Custom domain (for production)
- System time verification

The code is now properly configured. Remaining issues are likely due to Clerk Dashboard settings or browser cookie blocking, which require manual configuration.

