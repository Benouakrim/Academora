# Database Connection Fix

## Problem
You're getting `ECONNREFUSED` errors because the PostgreSQL database connection is not configured properly.

## Solution

The server needs direct PostgreSQL connection credentials. Add one of these to your `.env` file:

### Option 1: DATABASE_URL (Recommended)

Add this line to your `.env` file:

```env
DATABASE_URL=postgresql://postgres.snflmjoiarpvtvqoawvz:[YOUR-DB-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**To get your database password:**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **Database**
4. Find the **Database password** section
5. If you don't remember it, click **Reset database password**
6. Copy the password and replace `[YOUR-DB-PASSWORD]` in the DATABASE_URL above

### Option 2: Individual Variables

Alternatively, add these to your `.env` file:

```env
DB_PASSWORD=[YOUR-DB-PASSWORD]
SUPABASE_URL=https://snflmjoiarpvtvqoawvz.supabase.co
```

The server will automatically construct the connection string from these.

## After Adding Credentials

1. **Restart your backend server**:
   ```bash
   npm run server
   ```

2. **Test the connection**:
   ```bash
   npm run db:test-pool
   ```

3. **Try saving an article again**

The connection should now work!

