# Clerk ↔ Neon Database Schema Sync Report

## Summary

This document outlines the field mapping between Clerk and Neon databases, identifies inconsistencies, and provides migration steps to fix them.

## Field Mapping

### Clerk → Neon Mapping

| Clerk Field | Neon Column | Type | Status |
|------------|-------------|------|--------|
| `id` | `clerk_id` | VARCHAR(255) | ✅ |
| `firstName` | `first_name` | VARCHAR(100) | ✅ |
| `lastName` | `last_name` | VARCHAR(100) | ✅ |
| `username` | `username` | VARCHAR(50) | ✅ |
| `emailAddresses[0].emailAddress` | `email` | VARCHAR(255) | ✅ |
| `phoneNumbers[0].phoneNumber` | `phone` | VARCHAR(20) | ✅ |
| `imageUrl` | `avatar_url` | VARCHAR(500) | ✅ |
| `emailAddresses[0].verification.status === 'verified'` | `email_verified` | BOOLEAN | ✅ |

### Issues Found

1. **Name Column Inconsistency** ⚠️
   - Migration `24_add_user_onboarding_data.sql` adds `given_name` and `family_name`
   - Prisma schema uses `first_name` and `last_name`
   - **Fix**: Migration `28_fix_name_columns_and_sync_clerk_neon.sql` standardizes on `first_name`/`last_name`

2. **Missing Columns** (if migration not run)
   - Some columns from Prisma schema may not exist in database
   - **Fix**: Migration `28_fix_name_columns_and_sync_clerk_neon.sql` adds all required columns

## Migration Steps

### Step 1: Run the Schema Fix Migration

```bash
cd server
node database/run-schema-fix.js
```

Or manually run the SQL:

```bash
psql $DATABASE_URL -f database/migrations/28_fix_name_columns_and_sync_clerk_neon.sql
```

### Step 2: Verify Schema

```bash
cd server
node database/verify-schema.js
```

### Step 3: Test Sync

```bash
cd server
node database/test-clerk-neon-sync.js
```

## Expected Database Schema

After migration, the `users` table should have:

### Core Identity
- `id` (UUID, primary key)
- `clerk_id` (VARCHAR(255), unique, nullable)
- `email` (VARCHAR(255), unique, nullable - for phone-only accounts)
- `phone` (VARCHAR(20), unique, nullable)
- `password` (VARCHAR(255), nullable - Clerk users don't have passwords)

### Name Fields (Standardized)
- `first_name` (VARCHAR(100), nullable) ✅ **Use this**
- `last_name` (VARCHAR(100), nullable) ✅ **Use this**
- `full_name` (VARCHAR(200), nullable)
- ❌ `given_name` (should be removed)
- ❌ `family_name` (should be removed)

### Profile
- `username` (VARCHAR(50), unique, nullable)
- `bio` (TEXT, nullable)
- `avatar_url` (VARCHAR(500), nullable)
- `date_of_birth` (DATE, nullable)
- `title` (VARCHAR(100), nullable)
- `headline` (VARCHAR(255), nullable)
- `location` (VARCHAR(200), nullable)

### Social Links
- `website_url` (VARCHAR(500), nullable)
- `linkedin_url` (VARCHAR(500), nullable)
- `github_url` (VARCHAR(500), nullable)
- `twitter_url` (VARCHAR(500), nullable)
- `portfolio_url` (VARCHAR(500), nullable)

### Onboarding & Preferences
- `persona_role` (VARCHAR(100), nullable)
- `focus_area` (TEXT, nullable)
- `primary_goal` (TEXT, nullable)
- `timeline` (VARCHAR(100), nullable)
- `organization_name` (VARCHAR(255), nullable)
- `organization_type` (VARCHAR(100), nullable)
- `is_profile_public` (BOOLEAN, default: true)
- `show_email` (BOOLEAN, default: false)
- `show_saved` (BOOLEAN, default: false)
- `show_reviews` (BOOLEAN, default: true)
- `show_socials` (BOOLEAN, default: true)
- `show_activity` (BOOLEAN, default: true)

### Account & Status
- `account_type` (TEXT, nullable)
- `role` (ENUM: user, admin)
- `plan` (ENUM: free, premium, enterprise)
- `plan_id` (UUID, nullable)
- `subscription_status` (TEXT, nullable)
- `email_verified` (BOOLEAN, default: false)
- `phone_verified` (BOOLEAN, default: false)
- `status` (ENUM: active, inactive, suspended, default: active)

### Timestamps
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)
- `last_login_at` (TIMESTAMPTZ, nullable)

## Code References

### Where Clerk Fields Are Mapped

1. **`server/data/users.js`** - `syncUserToDb()` function
   - Maps Clerk user to Neon database
   - Uses `first_name` and `last_name` ✅

2. **`server/routes/usersDualSync.js`** - Dual-write route
   - Updates both Clerk and Neon
   - Uses `given_name`/`family_name` → mapped to `first_name`/`last_name` via `updateUserProfile()` ✅

3. **`server/routes/profile.js`** - Profile update route
   - Accepts `given_name`/`family_name` from frontend
   - Maps to `first_name`/`last_name` in database ✅
   - Syncs back to Clerk

4. **`server/data/users.js`** - `updateUserProfile()` function
   - Handles both `given_name`/`family_name` and `firstName`/`lastName`
   - Maps to `first_name`/`last_name` in database ✅

## Verification Checklist

- [ ] Migration `28_fix_name_columns_and_sync_clerk_neon.sql` has been run
- [ ] `given_name` and `family_name` columns have been removed
- [ ] `first_name` and `last_name` columns exist
- [ ] All required columns from Prisma schema exist
- [ ] Test user can be synced from Clerk to Neon
- [ ] Test user data matches between Clerk and Neon

## Next Steps

1. Run the migration to fix schema inconsistencies
2. Verify the schema matches Prisma definition
3. Test the sync process with a real user
4. Update any code that still references `given_name`/`family_name` directly

