# Quick Reference: Verification & Healing System

**Last Updated**: 2025-01-27

## Current Problem

**Issue**: Tokens are successfully retrieved but expire before API calls complete, causing 401 errors.

**Error Pattern**:
```
[VerifyHeal] ✅ Fresh token obtained (length: 798 chars)
[VerifyHeal] Getting fresh token for /api/users/sync call...
[VerifyHeal] Attempting to sync user from Clerk...
:3001/api/users/sync:1 Failed to load resource: 401 (Unauthorized)
Backend: "JWT is expired. Expiry date: Thu, 27 Nov 2025 21:14:28 GMT, Current date: Thu, 27 Nov 2025 21:15:16 GMT"
```

**Root Cause**: Clerk JWT tokens expire very quickly (within 60 seconds, sometimes faster). Even though we get fresh tokens immediately before API calls, they expire before the request completes.

## Progress Made ✅

### Completed Fixes
1. ✅ **Session Readiness Check** - Polls for valid token up to 2 seconds
2. ✅ **Debouncing** - Prevents multiple simultaneous verification calls
3. ✅ **Error Classification** - Auth errors no longer show "Data Loss Warning"
4. ✅ **Increased Delays** - LoginPage: 2000ms, Auto-redirect: 3000ms
5. ✅ **Solution 2 Fallback** - Uses Clerk session object directly
6. ✅ **Fresh Token Retrieval** - Gets token immediately before each API call
7. ✅ **Timeout Mechanisms** - 10s verification timeout, 5s API call timeouts
8. ✅ **Non-blocking Dashboard** - Loads immediately, verification in background
9. ✅ **URL Fix** - Fixed double `/api` in URLs
10. ✅ **Signout Fix** - Removed verification from logout
11. ✅ **Navbar Notifications** - Get fresh token for each call
12. ✅ **AdminReferrals & ReferralDashboard** - Updated to Clerk tokens

## Current Issue: Token Expiration 🔴

### Immediate Actions Needed

1. **Investigate Token Refresh**
   - Check if Clerk's `getToken()` automatically refreshes expired tokens
   - Research Clerk token refresh mechanisms
   - Verify if tokens can be refreshed before expiration

2. **Implement Retry Logic**
   - If 401 error occurs, get fresh token and retry immediately
   - Add retry limit (max 2-3 retries)
   - Log retry attempts for debugging

3. **Check Backend Configuration**
   - Verify `CLERK_SECRET_KEY` is set in backend `.env`
   - Check backend logs for detailed token validation errors
   - Review `@clerk/express` middleware configuration

4. **Test Token Expiration Timing**
   - Decode JWT to check expiration time
   - Measure time between token retrieval and API call
   - Log token expiration time for debugging

## Key Code Locations (Updated)

| File | Line Range | Purpose | Status |
|------|------------|---------|--------|
| `src/lib/user/verifyAndHeal.ts` | 423-707 | Main verification function | ✅ Updated |
| `src/lib/user/verifyAndHeal.ts` | 91-166 | Session readiness check | ✅ New |
| `src/lib/user/verifyAndHeal.ts` | 43-82 | Session object fallback | ✅ New |
| `src/lib/user/verifyAndHeal.ts` | 226-244 | Fetch with timeout | ✅ New |
| `src/lib/user/verifyAndHeal.ts` | 470-492 | Fresh token helper | ✅ New |
| `src/lib/user/verifyAndHeal.ts` | 249-309 | Verify user in Neon | ✅ Updated |
| `src/lib/user/verifyAndHeal.ts` | 314-372 | Clerk sync function | ✅ Updated |
| `src/pages/LoginPage.tsx` | 17-44, 46-89 | Login verification | ✅ Updated |
| `src/pages/DashboardPage.tsx` | 139-198 | Dashboard verification | ✅ Updated |
| `src/components/Navbar.tsx` | 135-209 | Notifications (fresh tokens) | ✅ Updated |
| `src/pages/admin/AdminReferrals.tsx` | 63, 96-239 | Admin referrals (Clerk tokens) | ✅ Updated |
| `src/pages/ReferralDashboard.tsx` | 57, 63-79 | Referral dashboard (Clerk tokens) | ✅ Updated |
| `server/routes/usersSync.js` | 7 | Backend sync endpoint | ⚠️ Check config |
| `server/middleware/auth.js` | 75-100 | Self-healing middleware | ⚠️ Check config |

## Testing Steps

1. **Start backend server**: `npm run dev:server`
2. **Create user in Clerk** (via signup)
3. **Delete user from Neon** (manually in database)
4. **Try to log in**
5. **Expected**: User should be synced automatically
6. **Current**: Fails with 401 error

## Debug Commands

```javascript
// In browser console after login:
const { getToken, isSignedIn } = useAuth();
const { user } = useUser();

// Check token
const token = await getToken();
console.log('Token available:', !!token);
console.log('Token length:', token?.length);

// Check session
console.log('Signed in:', isSignedIn);
console.log('User ID:', user?.id);
console.log('Sessions:', user?.sessions);
```

## Next Steps Priority

1. **🔴 CRITICAL**: Fix token expiration issue
   - Implement token refresh or retry logic
   - Investigate if Clerk tokens can be refreshed
   - Check backend Clerk configuration

2. **🟡 HIGH**: Update remaining files with Clerk tokens
   - `useArticleEditor.ts` (3 instances)
   - `MyArticles.tsx` (3 instances)
   - `ArticlePage.tsx` (1 instance)
   - `ArticleAnalyticsDashboard.tsx` (3 instances)
   - `AdminReviewPortal.tsx` (5 instances)
   - `lib/cookies.ts` (1 instance - check context)

3. **🟡 HIGH**: Backend investigation
   - Verify `CLERK_SECRET_KEY` configuration
   - Check backend logs for token validation details
   - Review `@clerk/express` middleware setup

4. **🟢 MEDIUM**: Testing
   - Test with backend server running
   - Verify token refresh mechanisms
   - Test retry logic with fresh tokens

5. **🟢 LOW**: Optimize and polish
   - Reduce logging verbosity in production
   - Cache verification results (if appropriate)
   - Performance optimization

## What Was Fixed ✅

- ✅ Session readiness check
- ✅ Debouncing mechanism
- ✅ Error classification (auth vs data loss)
- ✅ Increased delays
- ✅ Solution 2 fallback (session object)
- ✅ Fresh token retrieval
- ✅ Timeout mechanisms
- ✅ Non-blocking dashboard
- ✅ URL construction fix
- ✅ Signout fix
- ✅ Navbar notifications fix
- ✅ AdminReferrals & ReferralDashboard updates

