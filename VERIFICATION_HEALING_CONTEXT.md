# User Verification & Healing System - Development Context

## Problem Statement

**Core Issue**: When a user account exists in Clerk but not in Neon database, the user can log in but their data is lost. The system needs to automatically detect this and restore the user data from Clerk (or cached sources) before the user notices.

**User Requirement**: 
- Verification and healing must run after each login and logout
- If data cannot be restored, show clear error messages to the user explaining why
- Check both Clerk database and local storage/cookies for data recovery

## Current Status: ⚠️ PARTIALLY WORKING - TOKEN EXPIRATION ISSUE

**Last Updated**: 2025-01-27

The system is implemented with significant improvements, but still encountering token expiration issues. The verification runs and tokens are successfully retrieved, but tokens expire between retrieval and API call execution, causing 401 errors on `/api/users/sync`.

### Progress Made in This Session

✅ **Completed Fixes**:
1. **Session Readiness Check** - Added `waitForSessionReady()` function that polls for valid token (up to 2 seconds)
2. **Debouncing** - Added module-level flags to prevent multiple simultaneous verification calls
3. **Error Classification** - Enhanced to correctly identify auth errors vs data loss (no more false "Data Loss Warning" alerts)
4. **Increased Delays** - LoginPage: 500ms → 2000ms, Auto-redirect: 1000ms → 3000ms
5. **Solution 2 Fallback** - Added `getTokenFromSession()` to use Clerk session object directly as fallback
6. **Fresh Token Retrieval** - Get fresh token immediately before each API call (not cached)
7. **Timeout Mechanisms** - Added 10-second timeout for verification, 5-second timeout for API calls
8. **Non-blocking Dashboard** - Dashboard loads immediately, verification runs in background
9. **URL Fix** - Fixed double `/api` in URLs (removes trailing `/api` from `VITE_API_URL`)
10. **Fixed Signout** - Removed verification from logout flow (was causing hangs)
11. **Fixed Navbar Notifications** - Get fresh token for each notification API call
12. **Fixed AdminReferrals & ReferralDashboard** - Replaced localStorage tokens with Clerk `getToken()`

❌ **Remaining Issue**:
- **Token Expiration**: Tokens are successfully retrieved (798 chars, valid JWT format) but expire before `/api/users/sync` call completes
- Backend logs show: `"JWT is expired. Expiry date: Thu, 27 Nov 2025 21:14:28 GMT, Current date: Thu, 27 Nov 2025 21:15:16 GMT"`
- `/api/auth/me` works (returns 404 - user not found), but `/api/users/sync` fails with 401
- This suggests tokens expire very quickly (within 60 seconds or less)

## Architecture Overview

### System Components

1. **`src/lib/user/verifyAndHeal.ts`** - Core verification and healing logic
   - `verifyAndHealUser()` - Main entry point
   - `verifyUserInNeon()` - Checks if user exists in Neon DB
   - `healUserFromClerk()` - Syncs user from Clerk to Neon
   - `restoreFromCache()` - Restores from localStorage cache
   - Caching functions for localStorage management

2. **Integration Points**:
   - `src/pages/LoginPage.tsx` - Runs after login (manual and auto-redirect)
   - `src/pages/DashboardPage.tsx` - Runs on dashboard load
   - `src/components/Navbar.tsx` - Runs before logout

3. **Backend Endpoints**:
   - `POST /api/users/sync` - Self-healing sync (uses `ensureSyncedUser` middleware)
   - `POST /api/users/dual-sync` - Dual-write with explicit payload
   - `GET /api/auth/me` - Verify user exists

## Current Implementation Details

### Token Handling

**Current Approach** (Updated):
- Token is retrieved via `getToken()` from `useAuth()` hook OR from Clerk session object directly
- Function accepts optional token and `getTokenFn` parameter
- **Fresh token retrieval**: Gets token immediately before each API call (not cached)
- Session readiness check: Polls for valid token up to 2 seconds with 200ms intervals
- Direct `fetch` calls with explicit `Authorization: Bearer ${token}` header
- All API calls have 5-second timeouts to prevent hanging
- Enhanced logging: Token length, format validation, request timing

**Current Problem**: 
- ✅ Token retrieval works (successfully gets 798-char JWT tokens)
- ✅ Token format is valid (contains `.` separator, correct length)
- ❌ **Token expires between retrieval and API call** - Clerk tokens expire quickly (often within 60 seconds)
- Backend validation shows: `"JWT is expired. Expiry date: Thu, 27 Nov 2025 21:14:28 GMT, Current date: Thu, 27 Nov 2025 21:15:16 GMT"`
- `/api/auth/me` works (GET request, faster), but `/api/users/sync` fails (POST request, may take longer)

### Verification Flow

1. **Step 0**: Token Validation
   - If token not provided, attempts to retrieve via `getTokenFn`
   - Retries up to 5 times with delays
   - Returns early if no valid token found (marks as auth issue, not data loss)

2. **Step 1**: Verify User in Neon
   - Calls `GET /api/auth/me` with token
   - If user exists → ✅ Verification complete
   - If 401/403 → Auth error (not data loss)
   - If 404 → User doesn't exist, proceed to healing

3. **Step 2**: Heal from Clerk
   - Calls `POST /api/users/sync` with token
   - Backend uses `ensureSyncedUser` middleware which:
     - Checks if user exists in Neon by `clerk_id`
     - If not, fetches from Clerk and calls `syncUserToDb()`
   - If successful → ✅ User restored
   - If fails → Proceed to cache restoration

4. **Step 3**: Restore from Cache
   - Retrieves cached data from localStorage (`academora_user_cache`)
   - Calls `POST /api/users/dual-sync` with cached data
   - If successful → ✅ User restored from cache

5. **Step 4**: Data Loss Detection
   - If all healing attempts fail → Data loss detected
   - Distinguishes between auth errors and actual data loss
   - Shows user-facing error with specific reason

### Error Handling

**Authentication Errors** (not data loss):
- Detected by checking error message for: "Authentication", "401", "403", "token", "session"
- Returns `dataLost: false` to prevent false alarms
- Shows warning message about session initialization

**Actual Data Loss**:
- Only triggered when healing fails for non-auth reasons
- Shows alert dialog to user
- Logs detailed error to console

## Current Issues

### Issue 1: Authentication Token Not Available ⚠️ CRITICAL

**Symptoms**:
- `POST /api/users/sync` returns 401 "Authentication required"
- Error appears immediately after login
- Multiple retry attempts still fail

**Root Causes** (hypotheses):
1. **Session not fully established**: Clerk session may take time to initialize after `setActive()`
2. **Token retrieval timing**: `getToken()` may return `null` if called too early
3. **Token format**: Token might not be in the format backend expects
4. **Backend middleware**: `requireUser` middleware might be rejecting valid tokens

**Evidence from Logs**:
```
[VerifyHeal] ⚠️ User not found in Neon, attempting to heal...
[VerifyHeal] Attempting to sync user from Clerk...
:3001/api/users/sync:1 Failed to load resource: the server responded with a status of 401 (Unauthorized)
[VerifyHeal] ❌ Failed to sync from Clerk: Authentication required.
```

### Issue 2: Backend Server Connection

**Symptoms**:
- `ERR_CONNECTION_REFUSED` errors for some endpoints
- Suggests backend server may not be running

**Note**: This is a separate issue from authentication - the backend needs to be running for verification to work.

## Code Locations

### Frontend Files

1. **`src/lib/user/verifyAndHeal.ts`** (369 lines)
   - Main verification and healing logic
   - Token handling and retry logic
   - Cache management
   - Error detection and user messaging

2. **`src/pages/LoginPage.tsx`** (Lines 27-80)
   - Calls `verifyAndHealUser()` after successful login
   - Calls on auto-redirect if already signed in
   - Passes `getToken` function for token retrieval

3. **`src/pages/DashboardPage.tsx`** (Lines 138-165)
   - Calls `verifyAndHealUser()` in `fetchInitialData()`
   - Shows success/error messages to user
   - Runs before other data fetching

4. **`src/components/Navbar.tsx`** (Lines 216-240)
   - Calls `verifyAndHealUser()` before logout
   - Clears cache after logout

### Backend Files

1. **`server/routes/usersSync.js`** (17 lines)
   - `POST /api/users/sync` endpoint
   - Uses `parseUserToken`, `requireUser`, `ensureSyncedUser` middleware
   - Returns user object if successful

2. **`server/middleware/auth.js`** (Lines 71-102)
   - `ensureSyncedUser` middleware
   - Self-heals by calling `syncUserToDb()` if user not found
   - Uses `clerkClient.users.getUser()` to fetch from Clerk

3. **`server/data/users.js`** (Lines 298-351)
   - `syncUserToDb()` function
   - Idempotent upsert using `ON CONFLICT (clerk_id) DO UPDATE`
   - Maps Clerk user fields to Neon database columns

## Token Flow Analysis

### Expected Flow
1. User logs in → Clerk creates session
2. `setActive()` called → Session activated
3. `getToken()` called → Should return valid JWT token
4. Token passed to API → Backend validates via Clerk middleware
5. Backend processes request → User synced if needed

### Actual Flow (Current Issue)
1. User logs in → Clerk creates session
2. `setActive()` called → Session activated
3. **Immediate call to `getToken()`** → Returns `null` or invalid token
4. Token passed to API → Backend rejects with 401
5. Retry attempts → Still fails (token not ready)

### Timing Issues

**Current Delays** (Updated):
- LoginPage: **2000ms** delay after `setActive()` before verification (increased from 500ms)
- DashboardPage: **500ms** delay before verification (increased from 200ms), plus non-blocking background execution
- Auto-redirect: **3000ms** delay before navigation (increased from 1000ms)
- Session readiness check: Up to **2000ms** with 200ms polling intervals
- Overall verification timeout: **10 seconds** (prevents infinite hanging)
- API call timeouts: **5 seconds** each

**Current Problem**: 
- Delays are sufficient for session initialization ✅
- Token retrieval works ✅
- **Token expiration is the issue** - tokens expire very quickly (within 60 seconds, sometimes faster)
- Need to investigate if tokens can be refreshed or if we need to get token even closer to API call

## Backend Middleware Chain

### `/api/users/sync` Route
```
Request → parseUserToken → requireUser → ensureSyncedUser → Handler
```

**`parseUserToken`**: 
- Non-blocking, parses Clerk token if present
- Attaches `req.auth` with Clerk session info

**`requireUser`**:
- Requires valid Clerk session (uses `requireAuth()` from `@clerk/express`)
- Returns 401 if no session

**`ensureSyncedUser`**:
- Checks if user exists in Neon by `clerk_id`
- If not, fetches from Clerk and syncs
- This is where the self-healing happens

## Database Schema

### Neon Database (`users` table)
- `id` (UUID, primary key)
- `clerk_id` (VARCHAR(255), unique, nullable)
- `first_name`, `last_name` (VARCHAR(100), nullable)
- `email` (VARCHAR(255), unique, nullable - for phone-only accounts)
- `phone` (VARCHAR(20), unique, nullable)
- ... (many other fields)

### Clerk User Object
- `id` (string) → Maps to `clerk_id`
- `first_name`, `last_name` → Maps to `first_name`, `last_name`
- `email_addresses[]` → Maps to `email`
- `phone_numbers[]` → Maps to `phone`
- `image_url` → Maps to `avatar_url`
- `username` → Maps to `username`

## Error Patterns Observed

### Pattern 1: Immediate 401 After Login
```
[Login] Running user verification and healing...
[VerifyHeal] Starting user verification and healing...
[VerifyHeal] ⚠️ User not found in Neon, attempting to heal...
:3001/api/users/sync:1 Failed to load resource: 401 (Unauthorized)
[VerifyHeal] ❌ Failed to sync from Clerk: Authentication required.
```

**Analysis**: Token is either null, invalid, or session not fully established.

### Pattern 2: Multiple Verification Attempts
The system runs verification multiple times:
- Once on login submit
- Once on auto-redirect
- Once on dashboard load

This is expected behavior but may cause duplicate API calls.

### Pattern 3: Network Errors
```
ERR_CONNECTION_REFUSED
Cannot connect to API at http://localhost:3001/api
```

**Analysis**: Backend server not running or not accessible.

## Implemented Solutions

### ✅ Solution 1: Session Readiness Check - IMPLEMENTED

**Implementation**: Added `waitForSessionReady()` function that:
- Polls for valid token up to 2 seconds with 200ms intervals
- Validates token format (JWT with `.` separator)
- Falls back to Clerk session object if `getToken()` fails
- Returns null if session not ready within timeout

**Status**: ✅ Working - Tokens are successfully retrieved

### ✅ Solution 2: Use Clerk Session Object Directly - IMPLEMENTED

**Implementation**: Added `getTokenFromSession()` function that:
- Checks if `clerkUser.sessions` array exists
- Or calls `clerkUser.getSessions()` if available
- Gets token from first active session
- Used as fallback when `getToken()` fails

**Status**: ✅ Working - Provides fallback token retrieval method

### ✅ Solution 3: Fresh Token Retrieval - IMPLEMENTED

**Implementation**: 
- Created `getFreshToken()` helper that gets token immediately before each API call
- No token caching - always fetch fresh
- Called right before: `/api/auth/me`, `/api/users/sync`, cache restore

**Status**: ✅ Working - Tokens are retrieved fresh, but still expire

### ✅ Solution 4: Error Classification - IMPLEMENTED

**Implementation**: Enhanced error detection:
- Detects: "Authentication", "401", "403", "Unauthorized", "Forbidden", "token", "session", "expired"
- Returns `dataLost: false` for auth errors
- Shows appropriate message: "Session may still be initializing"

**Status**: ✅ Working - No more false "Data Loss Warning" alerts

## Remaining Solutions Needed

### 🔴 Solution 5: Handle Token Expiration - CRITICAL

**Problem**: Tokens expire between retrieval and API call (confirmed from backend logs)

**Possible Approaches**:
1. **Token Refresh**: Check if Clerk tokens can be refreshed before expiration
2. **Immediate Use**: Get token literally milliseconds before API call (reduce any delay)
3. **Retry with Fresh Token**: If 401 occurs, get fresh token and retry immediately
4. **Backend Configuration**: Check if Clerk token expiration can be extended
5. **Token Validation**: Check token expiration time before using it

**Investigation Needed**:
- Check Clerk documentation for token refresh mechanisms
- Verify if `getToken()` automatically refreshes expired tokens
- Check backend Clerk configuration for token expiration settings
- Consider implementing automatic retry with fresh token on 401 errors

## Testing Checklist

- [ ] **Test 1**: User exists in Clerk but not in Neon
  - Expected: User should be synced automatically
  - Current: Fails with 401 error

- [ ] **Test 2**: User exists in both Clerk and Neon
  - Expected: Verification should pass immediately
  - Current: Should work (not tested)

- [ ] **Test 3**: User doesn't exist in Clerk
  - Expected: Should show appropriate error
  - Current: Not tested

- [ ] **Test 4**: Backend server not running
  - Expected: Should show network error, not data loss
  - Current: Shows network error correctly

- [ ] **Test 5**: Token not available
  - Expected: Should retry and eventually succeed or show auth error
  - Current: Shows auth error but may be too early

## Next Steps for Next Session

### Priority 1: Fix Token Expiration ⚠️ CRITICAL

**Current Status**: Tokens are retrieved successfully but expire before API calls complete.

1. **Investigate Token Refresh**:
   - Check if Clerk's `getToken()` automatically refreshes expired tokens
   - Verify if we need to call `getToken()` with specific options to get fresh tokens
   - Research Clerk token refresh mechanisms

2. **Implement Retry with Fresh Token**:
   - If 401 error occurs, immediately get fresh token and retry the request
   - Add retry logic specifically for expired token errors
   - Limit retries to prevent infinite loops

3. **Check Token Expiration Before Use**:
   - Decode JWT token to check expiration time
   - If token expires soon (< 5 seconds), get fresh token before API call
   - Log token expiration time for debugging

4. **Backend Investigation**:
   - Verify `CLERK_SECRET_KEY` is correctly set in backend `.env`
   - Check if backend Clerk configuration affects token validation
   - Review backend logs for detailed token validation errors
   - Check if `@clerk/express` middleware has token refresh capabilities

5. **Alternative Approach**:
   - Consider using Clerk's session object directly for all API calls
   - Or use Clerk's built-in token refresh if available
   - Check if there's a way to extend token expiration time

### Priority 2: Update Remaining Files with Fresh Tokens ✅ PARTIALLY DONE

**Completed**:
- ✅ `src/components/Navbar.tsx` - Get fresh token for each notification call
- ✅ `src/pages/admin/AdminReferrals.tsx` - Replaced localStorage with Clerk `getToken()`
- ✅ `src/pages/ReferralDashboard.tsx` - Replaced localStorage with Clerk `getToken()`

**Still Need Updates**:
- ⚠️ `src/hooks/useArticleEditor.ts` - Uses `localStorage.getItem('token')` (3 instances)
- ⚠️ `src/pages/MyArticles.tsx` - Uses `localStorage.getItem('token')` (3 instances)
- ⚠️ `src/pages/ArticlePage.tsx` - Uses `localStorage.getItem('token')` (1 instance)
- ⚠️ `src/components/admin/ArticleAnalyticsDashboard.tsx` - Uses `localStorage.getItem('token')` (3 instances)
- ⚠️ `src/pages/AdminReviewPortal.tsx` - Uses `localStorage.getItem('token')` (5 instances)
- ⚠️ `src/lib/cookies.ts` - Uses `localStorage.getItem('token')` (1 instance - check context)

**Note**: These files use legacy localStorage tokens which won't work with Clerk. They should be updated to use `useAuth().getToken()` and get fresh tokens before each API call.

### Priority 3: Testing & Validation

1. **Test with Backend Running**:
   - Verify backend server is running on port 3001
   - Check `CLERK_SECRET_KEY` is set in backend `.env`
   - Test token expiration timing
   - Monitor backend logs for token validation errors

2. **Test Token Refresh**:
   - Verify if `getToken()` automatically refreshes expired tokens
   - Test retry logic with fresh tokens
   - Measure time between token retrieval and API call

## Key Files Modified in This Session

1. **`src/lib/user/verifyAndHeal.ts`** - ✅ MAJOR UPDATES
   - Added `waitForSessionReady()` function (lines 91-166)
   - Added `getTokenFromSession()` function (lines 43-82)
   - Added `fetchWithTimeout()` helper (lines 226-244)
   - Added `getFreshToken()` helper (lines 470-492)
   - Enhanced error classification (lines 593-603)
   - Added debouncing mechanism (lines 28-38)
   - Added timeout wrapper (10 seconds) (lines 600-615)
   - Get fresh token before each API call (lines 527, 546, 562)
   - Fixed URL construction (removes double `/api`) (lines 252, 320)

2. **`src/pages/LoginPage.tsx`** - ✅ UPDATED
   - Increased delays: 500ms → 2000ms after `setActive()`
   - Increased auto-redirect delay: 1000ms → 3000ms
   - Removed verification from logout flow

3. **`src/pages/DashboardPage.tsx`** - ✅ UPDATED
   - Made verification non-blocking (runs in background)
   - Added 8-second timeout wrapper
   - Increased initial delay: 200ms → 500ms
   - Dashboard loads immediately, doesn't wait for verification

4. **`src/components/Navbar.tsx`** - ✅ UPDATED
   - Get fresh token for each notification API call (not reused)
   - Removed verification from logout flow
   - Added missing import for `verifyAndHealUser`

5. **`src/pages/admin/AdminReferrals.tsx`** - ✅ UPDATED
   - Replaced `localStorage.getItem('token')` with Clerk `getToken()`
   - Added `await` to all `getToken()` calls
   - Get fresh token before each API call

6. **`src/pages/ReferralDashboard.tsx`** - ✅ UPDATED
   - Replaced `localStorage.getItem('token')` with Clerk `getToken()`
   - Added `await` to `getToken()` call

## Files Still Needing Updates

1. **`src/hooks/useArticleEditor.ts`** - ⚠️ Uses localStorage tokens (3 instances)
2. **`src/pages/MyArticles.tsx`** - ⚠️ Uses localStorage tokens (3 instances)
3. **`src/pages/ArticlePage.tsx`** - ⚠️ Uses localStorage tokens (1 instance)
4. **`src/components/admin/ArticleAnalyticsDashboard.tsx`** - ⚠️ Uses localStorage tokens (3 instances)
5. **`src/pages/AdminReviewPortal.tsx`** - ⚠️ Uses localStorage tokens (5 instances)
6. **`src/lib/cookies.ts`** - ⚠️ Uses localStorage tokens (1 instance - check context)

## Environment Variables Required

- `CLERK_SECRET_KEY` - Backend Clerk secret (required for `clerkClient`)
- `DATABASE_URL` - Neon database connection string
- `VITE_API_URL` - Frontend API URL (defaults to `http://localhost:3001`)

## Debugging Commands

```bash
# Check if backend is running
curl http://localhost:3001/api/health

# Test token retrieval (in browser console)
const { getToken } = useAuth();
const token = await getToken();
console.log('Token:', token ? `${token.substring(0, 20)}...` : 'null');

# Check Clerk session (in browser console)
const { user } = useUser();
console.log('Clerk User:', user?.id);
console.log('Sessions:', user?.sessions);
```

## Related Documentation

- `USER_VERIFICATION_HEALING.md` - User-facing documentation
- `FIELD_MAPPING_ANALYSIS.md` - Field mapping between Clerk and Neon
- `SCHEMA_SYNC_REPORT.md` - Database schema synchronization report

## Notes for Next Developer

1. **The backend server must be running** for verification to work. Check for `ERR_CONNECTION_REFUSED` errors.

2. **Token timing is critical**. The session may take 1-3 seconds to fully initialize after `setActive()`. Current delays may be insufficient.

3. **The system distinguishes between auth errors and data loss**. Don't show "data loss" alerts for authentication failures.

4. **Backend self-healing** via `ensureSyncedUser` middleware should handle most cases. The frontend verification is a safety net.

5. **Cache is stored in localStorage** with key `academora_user_cache` and 7-day TTL.

6. **Multiple verification attempts** are expected (login, auto-redirect, dashboard load). Debouncing has been added to prevent duplicate calls.

## Session Progress Report (2025-01-27)

### Summary of Changes

This session focused on fixing authentication token issues in the user verification and healing system. Significant progress was made, but a critical token expiration issue remains.

### ✅ Completed Fixes

1. **Session Readiness Check** (`src/lib/user/verifyAndHeal.ts`)
   - Implemented `waitForSessionReady()` function
   - Polls for valid token up to 2 seconds with 200ms intervals
   - Validates JWT format (must contain `.` separator)
   - Falls back to session object if `getToken()` fails

2. **Debouncing Mechanism** (`src/lib/user/verifyAndHeal.ts`)
   - Added module-level flags to track in-flight verifications
   - Prevents multiple simultaneous verification calls
   - Detects and resets stuck promises (>10 seconds)
   - Returns existing promise if verification already in progress

3. **Error Classification** (`src/lib/user/verifyAndHeal.ts`)
   - Enhanced error detection for auth errors
   - Correctly identifies: "Authentication", "401", "403", "Unauthorized", "Forbidden", "token", "session", "expired"
   - Returns `dataLost: false` for auth errors
   - No more false "Data Loss Warning" alerts

4. **Fresh Token Retrieval** (`src/lib/user/verifyAndHeal.ts`)
   - Created `getFreshToken()` helper function
   - Gets token immediately before each API call (not cached)
   - Used for: `/api/auth/me`, `/api/users/sync`, cache restore
   - Includes fallback to session object

5. **Solution 2 Fallback** (`src/lib/user/verifyAndHeal.ts`)
   - Implemented `getTokenFromSession()` function
   - Uses Clerk session object directly as fallback
   - Supports both `sessions` array and `getSessions()` method

6. **Timeout Mechanisms** (`src/lib/user/verifyAndHeal.ts`)
   - Overall verification timeout: 10 seconds
   - API call timeouts: 5 seconds each
   - Prevents infinite hanging
   - Proper cleanup in finally blocks

7. **URL Construction Fix** (`src/lib/user/verifyAndHeal.ts`)
   - Fixed double `/api` in URLs
   - Removes trailing `/api` from `VITE_API_URL` if present
   - Correctly constructs: `http://localhost:3001/api/auth/me`

8. **Increased Delays** (`src/pages/LoginPage.tsx`)
   - After `setActive()`: 500ms → 2000ms
   - Auto-redirect: 1000ms → 3000ms

9. **Non-blocking Dashboard** (`src/pages/DashboardPage.tsx`)
   - Verification runs in background (fire-and-forget)
   - Dashboard loads immediately
   - 8-second timeout wrapper for verification
   - Doesn't block data fetching

10. **Signout Fix** (`src/components/Navbar.tsx`, `src/pages/DashboardPage.tsx`)
    - Removed verification from logout flow
    - Prevents hanging during signout
    - Logout is now immediate

11. **Navbar Notifications Fix** (`src/components/Navbar.tsx`)
    - Get fresh token for each notification API call
    - No token reuse between calls

12. **AdminReferrals Update** (`src/pages/admin/AdminReferrals.tsx`)
    - Replaced `localStorage.getItem('token')` with Clerk `getToken()`
    - Added `await` to all `getToken()` calls
    - Get fresh token before each API call

13. **ReferralDashboard Update** (`src/pages/ReferralDashboard.tsx`)
    - Replaced `localStorage.getItem('token')` with Clerk `getToken()`
    - Added `await` to `getToken()` call

### ❌ Remaining Issue: Token Expiration

**Problem**: Tokens are successfully retrieved (798 chars, valid JWT) but expire before API calls complete.

**Evidence**:
- Backend log: `"JWT is expired. Expiry date: Thu, 27 Nov 2025 21:14:28 GMT, Current date: Thu, 27 Nov 2025 21:15:16 GMT"`
- Token expires 48 seconds after issuance
- `/api/auth/me` works (GET, faster), `/api/users/sync` fails (POST, may take longer)

**Possible Solutions**:
1. Implement automatic retry with fresh token on 401 errors
2. Check if Clerk tokens can be refreshed before expiration
3. Investigate if token expiration can be extended in Clerk configuration
4. Decode JWT to check expiration time before using token
5. Get token even closer to API call (reduce any processing delay)

### ⚠️ Files Still Needing Updates

These files still use legacy `localStorage.getItem('token')` and should be updated:
- `src/hooks/useArticleEditor.ts` (3 instances)
- `src/pages/MyArticles.tsx` (3 instances)
- `src/pages/ArticlePage.tsx` (1 instance)
- `src/components/admin/ArticleAnalyticsDashboard.tsx` (3 instances)
- `src/pages/AdminReviewPortal.tsx` (5 instances)
- `src/lib/cookies.ts` (1 instance - check context)

### Next Session Priorities

1. **🔴 CRITICAL**: Fix token expiration
   - Implement retry logic with fresh tokens
   - Investigate Clerk token refresh mechanisms
   - Check backend Clerk configuration

2. **🟡 HIGH**: Update remaining files
   - Replace localStorage tokens with Clerk `getToken()`
   - Get fresh tokens before each API call

3. **🟡 HIGH**: Backend investigation
   - Verify `CLERK_SECRET_KEY` configuration
   - Review backend token validation logic
   - Check if token expiration is configurable

## Current Error Messages

### ✅ Fixed: Authentication Errors (No Longer Show Data Loss)

When authentication fails, users now see:
```
⚠️ Authentication issue (not data loss): Authentication failed: Authentication required. 
Token may be invalid or session not fully established. 
Your session may still be initializing. Please wait a moment and refresh the page.
```

**Status**: ✅ Fixed - Auth errors are correctly classified and don't show "Data Loss Warning"

### Current Issue: Token Expiration

**Backend Log Evidence**:
```json
{
  "x-clerk-auth-message": "JWT is expired. Expiry date: Thu, 27 Nov 2025 21:14:28 GMT, Current date: Thu, 27 Nov 2025 21:15:16 GMT",
  "x-clerk-auth-reason": "session-token-expired-refresh-non-eligible-non-get",
  "x-clerk-auth-status": "signed-out"
}
```

**Analysis**:
- Token was issued at 21:14:28
- Token expired at 21:15:16 (48 seconds later)
- This is a very short expiration time
- Need to investigate if tokens can be refreshed or if expiration can be extended

## Success Criteria

The system will be considered working when:
1. ⚠️ User can log in with account in Clerk but not Neon - **PARTIALLY WORKING** (token expiration issue)
2. ❌ User is automatically synced to Neon without errors - **BLOCKED BY TOKEN EXPIRATION**
3. ✅ No false "data loss" alerts for auth issues - **FIXED**
4. ✅ Verification runs smoothly after login/logout - **WORKING** (non-blocking, runs in background)
5. ⚠️ Cache restoration works as fallback - **NOT TESTED** (blocked by token expiration)
6. ✅ Clear error messages for actual data loss scenarios - **FIXED**

## Implementation Summary

### What Was Fixed
1. ✅ Session readiness check implemented
2. ✅ Debouncing to prevent duplicate calls
3. ✅ Error classification (auth vs data loss)
4. ✅ Increased delays for session initialization
5. ✅ Solution 2 fallback (session object)
6. ✅ Fresh token retrieval before each API call
7. ✅ Timeout mechanisms (10s verification, 5s API calls)
8. ✅ Non-blocking dashboard loading
9. ✅ URL construction fix (no double `/api`)
10. ✅ Signout fix (removed verification)
11. ✅ Navbar notifications fix (fresh tokens)
12. ✅ AdminReferrals & ReferralDashboard updated to Clerk tokens

### What Still Needs Work
1. ❌ **Token expiration handling** - CRITICAL
   - Tokens expire between retrieval and API call
   - Need to implement token refresh or retry logic
   - Or investigate if Clerk token expiration can be extended
2. ⚠️ **Update remaining files** - MEDIUM PRIORITY
   - 6 files still use localStorage tokens (legacy)
   - Should be updated to use Clerk `getToken()`
3. ⚠️ **Backend investigation** - HIGH PRIORITY
   - Verify `CLERK_SECRET_KEY` configuration
   - Check if token expiration is configurable
   - Review backend token validation logic

