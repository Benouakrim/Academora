# Migration Environment Variables Guide

This document lists all environment variables needed for the Supabase → (Neon, Prisma, Clerk, Cloudinary) migration.

## Required Environment Variables

### Database (Neon) - NEW
```env
DATABASE_URL=postgresql://neondb_owner:npg_RaE0nISUl2XH@ep-misty-hall-ag9ov68x-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

**⚠️ Temporarily needed for introspection:**
```env
# Add your Supabase DATABASE_URL here temporarily for schema introspection
# Find it at: Supabase Dashboard → Settings → Database → Connection string (URI format)
# Format: postgresql://postgres.[ref]:[password]@db.[ref].supabase.co:5432/postgres
# DATABASE_URL_SUPABASE=postgresql://...
```

### Clerk Authentication - NEW
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_YnVyc3Rpbmctb3dsLTMxLmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=sk_test_nYYD7p6z9FngeZlJ87icZmmxkQqyYyUSe0ymBMjXvE
CLERK_WEBHOOK_SECRET=whsec_...  # Get from Clerk Dashboard → Webhooks → Signing Secret
```

**Note:** 
- `VITE_CLERK_PUBLISHABLE_KEY` is exposed to the frontend (the `VITE_` prefix ensures Vite exposes it).
- `CLERK_WEBHOOK_SECRET` is required for the webhook endpoint at `/api/clerk-webhook` to sync Clerk users to your database.
- After setting up Clerk webhooks in your Clerk Dashboard, copy the webhook signing secret and set it as `CLERK_WEBHOOK_SECRET`.

### Cloudinary File Storage - NEW
```env
CLOUDINARY_CLOUD_NAME=ddgnmnyvr
CLOUDINARY_API_KEY=656975733652753
CLOUDINARY_API_SECRET=uCfKsrJduP-1jmiYN8YoXQUyuvY
```

## Existing Environment Variables (Keep These)

Keep your existing environment variables for:
- `JWT_SECRET` (will be replaced by Clerk, but may need temporarily)
- `PORT`
- `VITE_API_URL`
- `MAILJET_API_KEY` / `MAILJET_API_SECRET`
- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET`
- `SENTRY_DSN`
- Any other existing variables

## Variables to Remove (Optional - Keep for now)

Some routes still use Supabase temporarily. You can remove these after migrating remaining routes:
- `SUPABASE_URL` - Still used by some routes (see PHASE4_CLEANUP.md)
- `SUPABASE_KEY` - Still used by some routes
- `SUPABASE_SERVICE_ROLE_KEY` - Still used by some routes
- `SUPABASE_ANON_KEY` (if exists) - Can be removed
- `VITE_SUPABASE_URL` (if exists) - Already removed from frontend
- `VITE_SUPABASE_ANON_KEY` (if exists) - Already removed from frontend

**Note**: Keep Supabase env vars for now until all routes are migrated to Prisma.

## Migration Steps

1. ✅ Dependencies added to package.json
2. ✅ Database schema introspected with Prisma
3. ✅ DATABASE_URL updated to Neon
4. ✅ Schema pushed to Neon
5. ✅ All main SQL queries migrated to Prisma (18 data files)
6. ✅ Clerk authentication set up
7. ✅ Cloudinary file storage set up
8. ✅ Supabase package removed from dependencies
9. ⏳ **IN PROGRESS**: Migrate remaining routes that still use Supabase directly
   - See `PHASE4_CLEANUP.md` for details

