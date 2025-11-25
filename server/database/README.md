# Database Setup

## Step 1: Get Your Database Credentials

1. Set up a PostgreSQL database (Neon, Supabase, or any PostgreSQL instance)
2. Get your database connection string or credentials:
   - **Connection String**: `postgresql://user:password@host:port/database`
   - Or individual credentials: host, port, database, user, password

## Step 2: Create Environment Variables

Create or update your `.env` file in the root directory:

```env
# Database Configuration (Option 1 - Recommended)
DATABASE_URL=postgresql://user:password@host:port/database

# OR Database Configuration (Option 2 - Individual Variables)
DB_HOST=your-database-host
DB_PORT=5432
DB_NAME=your-database-name
DB_USER=your-username
DB_PASSWORD=your-password

# Other settings
PORT=3001
JWT_SECRET=your-secret-key-change-in-production
VITE_API_URL=http://localhost:3001/api
```

## Step 3: Run the Database Schema

1. Connect to your PostgreSQL database (using psql, pgAdmin, or your provider's SQL editor)
2. Run the SQL schema from `server/database/schema.sql`
3. This will create:
   - `users` table
   - `articles` table
   - `orientation_resources` table
   - Indexes for performance
   - Triggers for automatic `updated_at` timestamps

## Step 4: Verify Tables

Run the verification script:
```bash
npm run db:verify
```

This will check:
- ✅ Database connection works
- ✅ All required tables exist
- ✅ Tables have data (if seeded)

## Step 5: Seed Mock Data (Optional)

To populate the database with test data:
```bash
npm run db:seed-mock
```

This creates:
- 5 test users (including 1 admin)
- 8 universities
- 3 articles
- Reviews and saved items

See `TEST_CREDENTIALS.md` for login credentials.

## Step 6: Test the Connection

1. Start your server: `npm run dev:server`
2. Check the console for "✅ PostgreSQL pool connected"
3. Try creating a user account through the signup page
4. Verify data in your database

## Security Notes

- **Never commit** your `.env` file to Git
- Keep database credentials secret
- Use strong passwords for database users
- For production, consider enabling Row Level Security (RLS) policies
- Passwords are automatically hashed with bcrypt before storage

## Troubleshooting

### Error: "Missing database credentials"
- Make sure `DATABASE_URL` or `DB_*` variables are set in your `.env` file
- Check that the connection string format is correct

### Error: "relation does not exist"
- Make sure you ran the schema.sql in your database
- Check that table names match exactly (case-sensitive)

### Error: "duplicate key value"
- This means a unique constraint violation (e.g., duplicate email or slug)
- Check your data for duplicates

### Error: "Connection refused"
- Verify your database host and port are correct
- Check that your database is running and accessible
- For cloud databases, ensure your IP is whitelisted (if required)
