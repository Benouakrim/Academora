# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - 2024-11-16

### Major Migration: Supabase → Neon + Prisma + Clerk + Cloudinary

This release represents a complete decoupling from Supabase into a specialized, modular stack.

### Added

#### Database (Neon + Prisma)
- **Prisma ORM Integration**
  - Added `@prisma/client` and `prisma` dependencies
  - Created `prisma/schema.prisma` with full database schema introspection
  - Created `server/database/prisma.js` - Prisma client singleton
  - Migrated 18 data layer files from Supabase to Prisma:
    - `server/data/articles.js`
    - `server/data/staticPages.js`
    - `server/data/orientation.js`
    - `server/data/universities.js`
    - `server/data/referrals.js`
    - `server/data/savedItems.js`
    - `server/data/savedComparisons.js`
    - `server/data/notifications.js`
    - `server/data/articleViews.js`
    - `server/data/articleComments.js`
    - `server/data/microContent.js`
    - `server/data/siteVideos.js`
    - `server/data/userFinancialProfiles.js`
    - `server/data/taxonomies.js`
    - `server/data/universityClaims.js`
    - `server/data/universityGroups.js`
    - `server/data/users.js`
    - `server/data/siteSettings.js`

#### Authentication (Clerk)
- **Backend Authentication**
  - Added `@clerk/express` dependency
  - Updated `server/middleware/auth.js` to use Clerk middleware
  - Created `server/routes/clerkWebhook.js` for user synchronization
  - Added webhook signature verification with `svix`
  - Implemented `createOrUpdateUserFromClerk()` for automatic user sync
  - Updated `getCurrentUser()` to fetch user from Clerk session
  - Added `findUserByClerkId()` helper function

- **Frontend Authentication**
  - Added `@clerk/clerk-react` dependency
  - Wrapped app with `ClerkProvider` in `src/main.tsx`
  - Replaced `src/pages/LoginPage.tsx` with Clerk `<SignIn />` component
  - Replaced `src/pages/SignUpPage.tsx` with Clerk `<SignUp />` component
  - Updated `src/components/Navbar.tsx` to use Clerk hooks and components:
    - `useUser()` and `useAuth()` hooks
    - `<UserButton />` and `<SignInButton />` components
  - Updated `src/lib/api.ts` to handle Clerk authentication tokens
  - Removed custom authentication logic and JWT handling

#### File Storage (Cloudinary)
- **Cloudinary Integration**
  - Added `cloudinary` dependency
  - Created `server/services/cloudinary.js` service with:
    - `uploadToCloudinary()` - Upload files to Cloudinary
    - `deleteFromCloudinary()` - Delete files by public_id or URL
    - `extractPublicId()` - Extract public_id from Cloudinary URLs
    - `getOptimizedUrl()` - Generate optimized image URLs with transformations

- **Upload Routes Migration**
  - Updated `server/routes/upload.js`:
    - Changed from `multer.diskStorage` to `multer.memoryStorage`
    - Image upload endpoint now uploads to Cloudinary
    - Video upload endpoint now uploads to Cloudinary
    - Delete endpoint now deletes from Cloudinary
    - Returns full Cloudinary URLs instead of relative paths
    - Increased image limit from 5MB to 10MB

- **Frontend Updates**
  - Updated `src/components/ImageUpload.tsx` to use Cloudinary URLs directly
  - Updated `src/pages/admin/AdminMediaPage.tsx` for Cloudinary URLs
  - Updated `src/lib/api.ts` upload functions for Cloudinary

#### Development Tools
- **ngrok Setup**
  - Added `ngrok` to devDependencies
  - Created `scripts/start-ngrok.js` for local webhook testing
  - Added `npm run ngrok` command
  - Created `NGROK_SETUP.md` documentation
  - Created `NGROK_QUICK_START.md` quick reference

### Changed

#### Database
- **Connection Management**
  - Migrated from Supabase client to Neon PostgreSQL with Prisma
  - Updated `DATABASE_URL` to use Neon connection string
  - All queries now use Prisma ORM instead of raw SQL/Supabase client
  - UUID generation migrated from `uuid_generate_v4()` to `gen_random_uuid()`

#### Authentication
- **Backend**
  - Removed JWT token generation and verification
  - Removed custom password hashing for Clerk-managed users
  - Updated `requireAdmin` to use Clerk authentication
  - Authentication now non-blocking via Clerk middleware
  - User password field made nullable to support Clerk users

- **Frontend**
  - Removed custom login/signup forms
  - Removed JWT token storage and management
  - Authentication state now managed by Clerk
  - API calls now use Clerk tokens automatically

#### File Storage
- **Storage Backend**
  - Migrated from local filesystem (`public/uploads/`) to Cloudinary
  - Files now stored in Cloudinary folders:
    - Images: `academora/images`
    - Videos: `academora/videos`
  - Automatic image optimization enabled
  - Support for video transformations

- **URLs**
  - Image/video URLs now return full Cloudinary URLs
  - Removed URL prefixing logic in frontend
  - Backward compatible with existing local file URLs

#### Environment Variables
- **New Required Variables**
  - `DATABASE_URL` - Neon PostgreSQL connection string
  - `VITE_CLERK_PUBLISHABLE_KEY` - Clerk frontend publishable key
  - `CLERK_SECRET_KEY` - Clerk backend secret key
  - `CLERK_WEBHOOK_SECRET` - Clerk webhook signing secret (from webhook dashboard)
  - `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
  - `CLOUDINARY_API_KEY` - Cloudinary API key
  - `CLOUDINARY_API_SECRET` - Cloudinary API secret
  - `NGROK_AUTHTOKEN` - Optional, for persistent ngrok URLs

- **Variables to Keep Temporarily**
  - `SUPABASE_URL` - Still used by some routes (see PHASE4_CLEANUP.md)
  - `SUPABASE_SERVICE_ROLE_KEY` - Still used by some routes

- **Variables Removed**
  - `VITE_SUPABASE_URL` - No longer needed (Clerk handles auth)
  - `VITE_SUPABASE_ANON_KEY` - No longer needed

### Deprecated

- **Supabase Client**
  - `server/database/supabase.js` - Archived, marked for removal
  - `src/lib/supabaseClient.ts` - Removed (no longer used)
  - `@supabase/supabase-js` - Moved to devDependencies (temporary)
  - Direct Supabase queries in routes - Migrate to Prisma data layer

### Removed

- **Files Removed**
  - `src/lib/supabaseClient.ts` - Replaced by Clerk

- **Dependencies Removed from Production**
  - `@supabase/supabase-js` - Moved to devDependencies (temporary)

### Fixed

- **UUID Function Compatibility**
  - Fixed `uuid_generate_v4()` compatibility issue with Neon
  - Migrated to `gen_random_uuid()` which is standard PostgreSQL

- **Database Connection**
  - Added `sslmode=require` to connection strings for secure connections
  - Fixed connection string format for Neon

### Security

- **Authentication**
  - Moved to Clerk for better security and compliance
  - Webhook signature verification with Svix
  - Automatic session management and token refresh

- **File Storage**
  - Files now served via Cloudinary CDN with secure URLs
  - Automatic HTTPS enforcement

### Documentation

- **New Documentation**
  - `MIGRATION_COMPLETE.md` - Complete migration summary
  - `PHASE4_CLEANUP.md` - Tracks remaining routes to migrate
  - `MIGRATION_ENV_VARS.md` - Updated environment variables guide
  - `NGROK_SETUP.md` - ngrok setup guide for webhook testing
  - `NGROK_QUICK_START.md` - Quick reference for ngrok

### Migration Notes

#### Routes Still Using Supabase (To Be Migrated)
The following routes still use Supabase directly and should be migrated to Prisma:
- `server/routes/reviews.js`
- `server/routes/billing.js`
- `server/routes/dataExport.js`
- `server/routes/matching.js`
- `server/routes/adminFeatures.js`
- `server/routes/savedMatches.js`
- `server/routes/adminAnalytics.js`
- `server/routes/userPreferences.js`
- `server/routes/profileSections.js`
- `server/routes/sitemap.js`
- `server/routes/usersPublic.js`
- `server/services/matchingService.js`
- `server/middleware/accessControl.js`

See `PHASE4_CLEANUP.md` for detailed migration status.

#### Breaking Changes
- **Authentication**: Custom login/signup forms removed - use Clerk UI components
- **File URLs**: Image/video URLs now return full Cloudinary URLs instead of relative paths
- **Database**: Some routes may need updates if they directly query Supabase

#### Upgrade Guide
1. Install new dependencies: `npm install`
2. Update environment variables (see `MIGRATION_ENV_VARS.md`)
3. Set up Clerk webhook endpoint (see `NGROK_SETUP.md`)
4. Run Prisma migrations: `npx prisma migrate dev`
5. Test authentication flow
6. Verify file uploads work with Cloudinary
7. Migrate remaining routes from Supabase to Prisma (optional)

### Technical Details

#### Prisma Schema Updates
- Added `clerkId` field to `User` model with unique constraint
- Made `password` field nullable for Clerk users
- Replaced `uuid_generate_v4()` with `gen_random_uuid()`
- Added indexes for better query performance

#### Clerk Integration
- Webhook endpoint: `/api/clerk-webhook`
- Subscribed events: `user.created`, `user.updated`, `user.deleted`
- Automatic user synchronization on signup/update
- User linking via email for existing users

#### Cloudinary Configuration
- Resource type: Auto-detect (image/video)
- Folder structure: Organized by type
- Automatic format optimization (quality: auto, fetch_format: auto)
- Video eager transformations for optimized delivery

### Known Issues & Fixes

#### User Migration
- **Issue:** Existing users (admin, free users) from Supabase cannot log in
- **Fix:** Created `scripts/migrate-existing-users.js` to migrate users to Clerk
- **Action Required:** Run migration script and notify users to reset passwords
- **See:** `USER_MIGRATION_GUIDE.md` and `MIGRATION_USER_CONCERNS.md`

#### Custom UI Restoration
- **Issue:** Lost custom styling in signup/login pages
- **Fix:** Created custom styled Clerk components (`ClerkSignIn.tsx`, `ClerkSignUp.tsx`)
- **Result:** Sign in/up pages now match website theme
- **Onboarding Wizard:** Preserved and still works after Clerk signup
- **See:** `CUSTOM_UI_RESTORATION.md`

#### Phone Number Support
- **Issue:** France phone numbers not supported by Clerk
- **Fix:** Made phone optional in Clerk Dashboard
- **Alternative:** Phone collected in onboarding wizard (optional)
- **Action Required:** Configure Clerk Dashboard → Settings → Phone Numbers
- **See:** `CLERK_PHONE_FIX.md`

---

## [Previous Versions]

For changes prior to this migration, see git history.

