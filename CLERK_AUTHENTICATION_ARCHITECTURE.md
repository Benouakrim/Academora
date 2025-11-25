# Clerk Authentication Architecture

## How It Works

### Two-Stage User Creation

**Stage 1: Clerk (Authentication)**
- User signs up/login through Clerk
- Clerk stores: email, password hash, OAuth tokens, session data
- Clerk handles: password reset, email verification, 2FA, social login
- Clerk generates a unique `clerk_id` (e.g., `user_2abc123...`)

**Stage 2: Neon Database (Application Data)**
- When user is created in Clerk, webhook automatically fires
- Webhook creates corresponding record in Neon database
- Neon stores: `clerk_id`, `role`, `preferences`, `onboarding_data`, etc.
- The `clerk_id` links Clerk auth to your app data

## The Complete Flow

```
1. User Signs Up
   └─> Clerk creates auth record (email, password, etc.)
   └─> Clerk generates clerk_id: "user_2abc123..."

2. Webhook Syncs (Automatic)
   └─> Clerk sends webhook to /api/clerk-webhook
   └─> Backend creates user in Neon with clerk_id
   └─> Now user exists in BOTH places:
       - Clerk: Authentication data
       - Neon: Application data

3. User Logs In
   └─> User enters email/password in Clerk
   └─> Clerk validates credentials
   └─> Clerk returns session token with clerk_id

4. Application Access
   └─> Frontend sends requests with Clerk token
   └─> Backend extracts clerk_id from token
   └─> Backend looks up user in Neon by clerk_id
   └─> Application uses data from Neon (role, preferences, etc.)
```

## Code Flow

### 1. User Signs Up (Frontend)
```typescript
// User clicks "Create Account" → Account Type Selection
// → Clerk SignUp component → User enters email/password
// → Clerk creates user → Returns session
```

### 2. Webhook Syncs (Backend)
```javascript
// server/routes/clerkWebhook.js
router.post('/clerk-webhook', async (req, res) => {
  const clerkUser = evt.data; // From Clerk
  await createOrUpdateUserFromClerk(clerkUser);
  // Creates user in Neon with clerk_id
});
```

### 3. User Logs In (Frontend)
```typescript
// User enters credentials in Clerk SignIn component
// Clerk validates → Returns session token
// Frontend stores token → Sends with API requests
```

### 4. Backend Finds User (Backend)
```javascript
// server/middleware/auth.js
export const getCurrentUser = async (req) => {
  const { userId } = getAuth(req); // userId = clerk_id from Clerk token
  const user = await findUserByClerkId(userId); // Lookup in Neon by clerk_id
  return user; // Returns user from Neon database
};
```

## Why This Architecture?

### Clerk Handles:
- ✅ Password hashing & security
- ✅ Email verification
- ✅ Password reset flows
- ✅ OAuth (Google, GitHub, etc.)
- ✅ 2FA/MFA
- ✅ Session management
- ✅ User management UI

### Neon Database Stores:
- ✅ Application-specific data (role, preferences)
- ✅ Onboarding answers
- ✅ User profile (bio, avatar, etc.)
- ✅ Subscription status
- ✅ Feature access
- ✅ Custom business logic

## Important Points

1. **Users ARE created in Clerk first** - Clerk is the source of truth for authentication
2. **Neon stores app data** - Linked via `clerk_id`
3. **Webhook syncs automatically** - No manual user creation needed
4. **If webhook fails** - User exists in Clerk but not in Neon (will be created on next login attempt)

## What Happens If User Exists in Clerk But Not Neon?

The `getCurrentUser` function has a fallback:
```javascript
// If user doesn't exist in DB, try to find by email (for migration)
if (!user && req.auth?.sessionClaims?.email) {
  user = await findUserByEmail(req.auth.sessionClaims.email);
}
```

But ideally, the webhook should create the user immediately after Clerk signup.

## Verification

After a user signs up, check both:

**Clerk Dashboard:**
- Go to Users → See user with email and clerk_id

**Neon Database:**
```sql
SELECT id, email, clerk_id, role, first_name, last_name 
FROM users 
WHERE clerk_id IS NOT NULL;
```

Both should have the same email, and Neon should have the `clerk_id` from Clerk.

---

**Summary**: Clerk = Authentication, Neon = Application Data. They work together via `clerk_id`!

