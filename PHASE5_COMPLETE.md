# Phase 5 Complete: Profile Data Flow Fix

## Problem Identified
The Neon database was missing essential profile columns, causing:
1. User data not persisting after onboarding wizard
2. Settings fields appearing empty despite filling the wizard
3. Dashboard greeting showing email instead of name

## Root Cause
The `users` table schema was incomplete - it lacked these columns:
- `full_name`, `date_of_birth`, `title`, `headline`, `location`
- Social URLs: `website_url`, `linkedin_url`, `github_url`, `twitter_url`, `portfolio_url`
- Onboarding fields: `persona_role`, `focus_area`, `primary_goal`, `timeline`, `organization_name`, `organization_type`
- Privacy toggles: `is_profile_public`, `show_email`, `show_saved`, `show_reviews`, `show_socials`, `show_activity`

## Solution Implemented

### 1. **Database Migration** ✅
Created `prisma/add-profile-fields.sql` with all missing columns.

### 2. **Prisma Schema Updated** ✅
Updated `prisma/schema.prisma` to reflect the new columns.

### 3. **Backend Data Layer Fixed** ✅
- `server/data/users.js`:
  - `updateUserProfile()`: Now handles all 20+ profile fields
  - `getUserProfile()`: Returns complete profile data
  - Both functions properly map snake_case DB columns to camelCase API responses

### 4. **Onboarding Flow Enhanced** ✅
- `server/routes/onboarding.js`:
  - `deriveUserUpdates()` now extracts and persists `email` from wizard
  - All wizard fields (names, dates, roles, goals) saved to DB
  - Lazy user creation ensures DB record exists before saving

### 5. **Frontend Wizard Prefilled** ✅
- `src/pages/RegisterPage.tsx`:
  - Uses Clerk `useUser()` to prefill first name, last name, email
  - Users see their Clerk data auto-populated

### 6. **Dashboard Enhanced** ✅
- `src/pages/DashboardPage.tsx`:
  - Fetches both Clerk (`/api/auth/me`) and Neon (`/api/profile`) data
  - Display name priority: **DB names → Clerk names → email**
  - Shows "Welcome back, [FirstName LastName]"

### 7. **Profile Sync to Clerk** ✅
- `server/routes/profile.js`:
  - Name changes push back to Clerk via `clerkClient.users.updateUser()`
  - Keeps both systems synchronized

## Migration Steps (REQUIRED)

### Run the Database Migration

```powershell
# Run this command to add the missing columns to your Neon database
node scripts/migrate-profile-fields.js
```

This will:
- Add all 22 missing profile columns to the `users` table
- Create indexes for performance
- Preserve all existing user data

### Alternative: Manual SQL Execution
If you prefer, copy the contents of `prisma/add-profile-fields.sql` and run it directly in your Neon SQL Editor.

## Testing Checklist

After running the migration:

1. **Sign up a new user**:
   - Go to `/signup?type=individual`
   - Enter credentials
   - Verify: email code received and verified

2. **Complete onboarding wizard**:
   - Check: First name, last name, email are **pre-filled** from Clerk
   - Fill remaining fields (role, focus area, goals, etc.)
   - Submit wizard

3. **Verify Dashboard**:
   - Navigate to `/dashboard`
   - Check: Header shows "Welcome back, [Your Name]" (not email)
   - Click "Settings" tab

4. **Verify Settings persistence**:
   - All fields from wizard should be populated:
     - ✅ First name, Last name, Full name
     - ✅ Email, Phone
     - ✅ Date of birth
     - ✅ Persona/role, Focus area, Primary goal, Timeline
     - ✅ Organization details (if institution)
     - ✅ Privacy toggles
   - Edit any field and click "Save changes"
   - Refresh page - changes should persist

5. **Verify Clerk sync**:
   - Change first/last name in Settings
   - Open Clerk Dashboard (clerk.com)
   - Check: Name updated in Clerk too

## Files Changed

### Database
- ✅ `prisma/add-profile-fields.sql` (NEW) - Migration script
- ✅ `prisma/schema.prisma` - Added 22 profile fields to User model
- ✅ `scripts/migrate-profile-fields.js` (NEW) - Migration runner

### Backend
- ✅ `server/data/users.js` - Extended updateUserProfile & getUserProfile
- ✅ `server/routes/onboarding.js` - Added email persistence
- ✅ `server/routes/profile.js` - Added Clerk name sync
- ✅ `server/routes/auth.js` - Enhanced /me endpoint

### Frontend
- ✅ `src/pages/RegisterPage.tsx` - Auto-fill wizard from Clerk
- ✅ `src/pages/DashboardPage.tsx` - Enhanced greeting with DB names
- ✅ `src/components/UserMenu.tsx` - Clearer profile vs security links

## Data Flow (Complete)

```
1. User signs up via Clerk
   ↓
2. Clerk webhook fires → creates user in Neon (name, email, clerk_id)
   ↓
3. User lands on wizard (/register)
   ↓
4. Wizard pre-fills: firstName, lastName, email from Clerk
   ↓
5. User completes wizard fields
   ↓
6. POST /api/onboarding
   - Lazy user creation if webhook pending
   - Saves onboarding answers
   - Calls updateUserProfile with all fields
   ↓
7. User redirected to /dashboard
   ↓
8. Dashboard fetches:
   - GET /api/auth/me (Clerk session info)
   - GET /api/profile (Complete Neon profile)
   ↓
9. Settings displays all persisted data
   ↓
10. User edits profile → PUT /api/profile
    - Updates Neon DB
    - Syncs names to Clerk
```

## Summary

**Before**: Wizard data lost, settings empty, DB incomplete
**After**: Full data persistence, settings populated, Neon is single source of truth

## Next Steps

1. **Run the migration** (required): `node scripts/migrate-profile-fields.js`
2. Test the complete flow with a new signup
3. Optional: Run `node scripts/sync-clerk-to-db.js` to backfill any existing Clerk users

---

**Migration is mandatory** - Without running `migrate-profile-fields.js`, the new code will fail because the database columns don't exist yet.
