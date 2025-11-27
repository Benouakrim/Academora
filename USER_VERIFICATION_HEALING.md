# User Verification and Self-Healing System

## Overview

This system ensures that users who exist in Clerk but not in Neon database are automatically restored. It runs verification and healing after each login and logout to prevent data loss.

## How It Works

### 1. **Verification Phase**
- Checks if user exists in Neon database
- If user exists → ✅ Verification complete
- If user doesn't exist → Proceed to healing

### 2. **Healing Phase** (if user not found in Neon)

**Step 1: Sync from Clerk** (Primary)
- Attempts to sync user data from Clerk to Neon
- Uses `POST /api/users/sync` endpoint
- Most reliable source of truth

**Step 2: Restore from Cache** (Fallback)
- If Clerk sync fails, attempts to restore from localStorage cache
- Uses cached user data (email, name, account type, etc.)
- Calls `POST /api/users/dual-sync` with cached data

**Step 3: Data Loss Detection**
- If both healing attempts fail, detects data loss
- Shows user-facing error with specific reason
- Logs detailed error to console

### 3. **Error Handling**

When data is lost and cannot be restored:
- **Console Error**: Detailed error message with reason
- **User Alert**: Browser alert with user-friendly message
- **Error State**: Sets error state in UI (DashboardPage)

## Integration Points

### Login Flow (`src/pages/LoginPage.tsx`)
- Runs after successful login
- Runs on auto-redirect if already signed in
- Non-blocking (doesn't prevent navigation)

### Logout Flow (`src/components/Navbar.tsx` & `src/pages/DashboardPage.tsx`)
- Runs before signOut() is called
- Clears cached user data after logout
- Ensures data is synced before logout

### Dashboard Load (`src/pages/DashboardPage.tsx`)
- Runs when dashboard loads
- Part of `fetchInitialData()` function
- Shows success message if data was restored

## Caching System

### LocalStorage Cache
- **Key**: `academora_user_cache`
- **TTL**: 7 days
- **Data Stored**:
  - User ID
  - Email
  - First/Last name
  - Username
  - Clerk ID
  - Account type
  - Other profile fields

### Cache Lifecycle
- **Created**: After successful verification or healing
- **Updated**: After successful profile updates
- **Cleared**: On logout

## API Endpoints Used

1. **`GET /api/auth/me`** - Verify user exists in Neon
2. **`POST /api/users/sync`** - Sync user from Clerk to Neon
3. **`POST /api/users/dual-sync`** - Dual-write with cached data

## Error Messages

### Data Loss Error Format
```
⚠️ DATA LOST ⚠️

Data Loss Detected: Your account exists in Clerk but your profile data 
could not be restored in our database. 

Reason: [specific error reason]

Please contact support or try signing up again.
```

### Common Error Reasons
- `User data not found in Clerk or cache`
- `Sync completed but no user data returned`
- `Network error: [details]`
- `Authentication error: [details]`

## Usage

### Manual Verification
```typescript
import { verifyAndHealUser } from '../lib/user/verifyAndHeal'

const token = await getToken()
const result = await verifyAndHealUser(token, clerkUser)

if (result.dataLost) {
  console.error('Data lost:', result.error)
} else if (result.healed) {
  console.log('User restored:', result.user)
}
```

### Clear Cache
```typescript
import { clearUserCache } from '../lib/user/verifyAndHeal'

clearUserCache() // Call on logout
```

### Update Cache
```typescript
import { updateUserCache } from '../lib/user/verifyAndHeal'

updateUserCache({
  id: user.id,
  email: user.email,
  firstName: user.firstName,
  // ... other fields
})
```

## Testing

To test the verification and healing system:

1. **Create a user in Clerk but not in Neon**:
   - Sign up via Clerk
   - Manually delete user from Neon database
   - Try to log in
   - System should detect and restore user

2. **Test cache restoration**:
   - Sign in (creates cache)
   - Delete user from Neon
   - Disconnect from internet
   - Try to log in
   - System should attempt cache restoration

3. **Test data loss detection**:
   - Create user in Clerk
   - Delete from Neon
   - Clear localStorage cache
   - Disable sync endpoint
   - Try to log in
   - Should show data loss error

## Monitoring

Check browser console for logs:
- `[VerifyHeal] Starting user verification and healing...`
- `[VerifyHeal] ✅ User exists in Neon database`
- `[VerifyHeal] ⚠️ User not found in Neon, attempting to heal...`
- `[VerifyHeal] ✅ User successfully synced from Clerk`
- `[VerifyHeal] ❌ DATA LOST: [reason]`

## Future Improvements

- [ ] Add retry logic for failed syncs
- [ ] Add telemetry/metrics for healing success rate
- [ ] Add admin dashboard to view healing events
- [ ] Add email notification for data loss events
- [ ] Add support ticket creation on data loss

