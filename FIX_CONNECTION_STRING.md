# Fix: "Tenant or user not found" Error

## Problem
You're getting "Tenant or user not found [Code: XX000]" error when trying to save articles.

## Solution

The issue is with your `DATABASE_URL` format. The pooler connection string might not be working. Update your `.env` file to use the **direct database connection** instead of the pooler.

### Update Your .env File

**Current (Pooler - might not work):**
```env
DATABASE_URL=postgresql://postgres.snflmjoiarpvtvqoawvz:[AyAcademOra200000]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**Change to (Direct connection - recommended):**
```env
DATABASE_URL=postgresql://postgres.snflmjoiarpvtvqoawvz:AyAcademOra200000@db.snflmjoiarpvtvqoawvz.supabase.co:5432/postgres
```

**Key changes:**
1. Changed from `pooler.supabase.com:6543` to `db.{project-ref}.supabase.co:5432`
2. Removed brackets `[]` around the password
3. If password has special characters, they'll be auto-encoded

### Alternative: URL-encode the password

If your password has special characters, you can also URL-encode it manually:
```env
DATABASE_URL=postgresql://postgres.snflmjoiarpvtvqoawvz:AyAcademOra200000@db.snflmjoiarpvtvqoawvz.supabase.co:5432/postgres
```

## After Updating

1. **Restart your backend server:**
   ```bash
   npm run server
   ```

2. **Test the connection:**
   ```bash
   npm run db:test-pool
   ```

3. **Try saving an article again**

The code will now automatically convert pooler URLs to direct connection URLs if needed.

