# Phase 4: Final Cleanup - Supabase Removal

## Status: In Progress

This document tracks the cleanup of Supabase dependencies and migration to Prisma/Clerk/Cloudinary.

## Completed ✅

1. **Database Migration**: All 18 main data files migrated to Prisma
2. **Authentication**: Migrated to Clerk
3. **File Storage**: Migrated to Cloudinary

## Remaining Supabase Usage

The following files still use Supabase directly and need to be migrated to Prisma:

### Routes Still Using Supabase:
1. `server/routes/reviews.js` - Review CRUD operations
2. `server/routes/billing.js` - Plans lookup (needs Prisma migration)
3. `server/routes/dataExport.js` - User data export (uses multiple Supabase queries)
4. `server/routes/matching.js` - User preferences lookup
5. `server/routes/adminFeatures.js` - Features/plans management
6. `server/routes/savedMatches.js` - Saved matches (may already have Prisma equivalent)
7. `server/routes/adminAnalytics.js` - Analytics queries
8. `server/routes/userPreferences.js` - User preferences
9. `server/routes/profileSections.js` - Profile sections
10. `server/routes/sitemap.js` - Sitemap generation
11. `server/routes/usersPublic.js` - Public user profiles

### Services Still Using Supabase:
1. `server/services/matchingService.js` - Matching algorithm

### Middleware Still Using Supabase:
1. `server/middleware/accessControl.js` - Feature access control

### Scripts/Database Utilities (Can be archived):
1. `server/database/check-article-category.js`
2. `server/database/check-categories.js`
3. `server/database/check-schema.js`
4. `server/database/seed.js` (may need update for Prisma)
5. `server/database/create-admin.js` (may need update)
6. `server/database/verify-setup.js` (may need update)
7. `server/database/add-more-articles.js`
8. `scripts/check-videos.js`

### Frontend (Can be removed):
1. `src/lib/supabaseClient.ts` - No longer needed (Clerk handles auth)

## Immediate Actions

### 1. Remove Supabase Package
```bash
npm uninstall @supabase/supabase-js
```

### 2. Remove Supabase Client Files
- `server/database/supabase.js` - Can be deleted or archived
- `src/lib/supabaseClient.ts` - Can be deleted

### 3. Update Environment Variables Documentation
- Remove Supabase-related env vars from docs
- Update `.env.example` if it exists

### 4. Update Package.json
- Remove `@supabase/supabase-js` from dependencies

## Files That Can Be Safely Removed/Archived

1. `server/database/supabase.js` - No longer needed
2. `src/lib/supabaseClient.ts` - Replaced by Clerk
3. Documentation files referencing Supabase (archive, don't delete)

## Next Steps for Remaining Routes

These routes need Prisma migrations. They can be migrated incrementally:

1. **Reviews** - Create `server/data/reviews.js` with Prisma queries
2. **Plans** - Check if plans table exists in Prisma schema, create `server/data/plans.js`
3. **User Preferences** - Create `server/data/userPreferences.js`
4. **Profile Sections** - Create `server/data/profileSections.js`
5. **Features/Plans** - Create `server/data/plans.js` and `server/data/features.js`

## Notes

- Some routes may fail after removing Supabase - these need to be migrated first
- Consider keeping `server/database/supabase.js` as a backup for now, commenting it out
- The `/uploads` static file serving can remain for backward compatibility with old local files

