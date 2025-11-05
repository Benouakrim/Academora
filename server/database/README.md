# Supabase Database Setup

## Step 1: Get Your Supabase Keys

1. Go to https://supabase.com/dashboard
2. Select your project (or create a new one)
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL**: `https://snflmjoiarpvtvqoawvz.supabase.co` (already provided)
   - **service_role key**: This is the secret key for server-side operations

## Step 2: Create Environment Variables

Create or update your `.env` file in the root directory:

```env
# Supabase Configuration
SUPABASE_URL=https://snflmjoiarpvtvqoawvz.supabase.co
SUPABASE_KEY=your_service_role_key_here
# OR use SUPABASE_SERVICE_ROLE_KEY
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Other settings
PORT=3001
JWT_SECRET=your-secret-key-change-in-production
VITE_API_URL=http://localhost:3001/api
```

**Important**: Use the `service_role` key (not `anon` key) for server-side operations. This key has admin privileges and bypasses Row Level Security.

## Step 3: Run the Database Schema

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the contents of `server/database/schema.sql`
5. Click **Run** (or press Ctrl/Cmd + Enter)

This will create:
- `users` table
- `articles` table
- `orientation_resources` table
- Indexes for performance
- Triggers for automatic `updated_at` timestamps

## Step 4: Verify Tables

Go to **Table Editor** in Supabase Dashboard and verify all three tables are created:
- ✅ users
- ✅ articles
- ✅ orientation_resources

## Step 5: Test the Connection

1. Start your server: `npm run dev:server`
2. Try creating a user account through the signup page
3. Check Supabase **Table Editor** to see the user in the `users` table

## Security Notes

- **Never commit** your `.env` file to Git
- The `service_role` key has admin privileges - keep it secret
- For production, consider enabling Row Level Security (RLS) policies
- Passwords are automatically hashed with bcrypt before storage

## Troubleshooting

### Error: "Invalid API key"
- Make sure you're using the `service_role` key (not `anon` key)
- Check that `SUPABASE_KEY` is set in your `.env` file

### Error: "relation does not exist"
- Make sure you ran the schema.sql in Supabase SQL Editor
- Check that table names match exactly (case-sensitive)

### Error: "duplicate key value"
- This means a unique constraint violation (e.g., duplicate email or slug)
- Check your data for duplicates

