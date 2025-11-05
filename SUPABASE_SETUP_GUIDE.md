# Supabase Setup Guide for AcademOra

This guide will help you set up your Supabase database and get articles displaying on your website.

## Step 1: Get Your Supabase Credentials

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in or create an account (it's free)
3. **Create a new project** (if you don't have one):
   - Click "New Project"
   - Choose a name for your project
   - Set a database password (save this!)
   - Select a region close to you
   - Wait ~2 minutes for setup to complete

4. **Get your API keys**:
   - In your project dashboard, go to **Settings** (gear icon) → **API**
   - You'll see:
     - **Project URL**: Something like `https://xxxxx.supabase.co`
     - **service_role key**: A long string (this is what you need!)
   - ⚠️ **IMPORTANT**: Copy the **service_role** key (NOT the anon/public key)
   - This key has admin privileges - keep it secret!

## Step 2: Update Your .env File

1. Open the `.env` file in your project root
2. Find this line:
   ```
   SUPABASE_KEY=YOUR_SERVICE_ROLE_KEY_HERE
   ```
3. Replace `YOUR_SERVICE_ROLE_KEY_HERE` with your actual service_role key
4. If your Project URL is different, update this line too:
   ```
   SUPABASE_URL=https://snflmjoiarpvtvqoawvz.supabase.co
   ```
5. Save the file

## Step 3: Set Up Your Database Schema

1. In Supabase Dashboard, go to **SQL Editor** (left sidebar)
2. Click **New Query**
3. Open the file `server/database/schema.sql` in your project
4. Copy ALL the contents
5. Paste into the SQL Editor
6. Click **Run** (or press `Ctrl+Enter` / `Cmd+Enter`)
7. You should see "Success. No rows returned"
8. ✅ This creates:
   - `users` table
   - `articles` table
   - `orientation_resources` table
   - Indexes and triggers

## Step 4: Verify Your Setup

Run this command in your terminal:
```bash
npm run db:verify
```

This will check:
- ✅ Your environment variables are set correctly
- ✅ Database connection works
- ✅ All tables exist
- ✅ If there are any articles

If everything passes, you're good to go!

## Step 5: Add Sample Articles (Optional)

If you want sample articles to test with:
```bash
npm run db:seed
```

This will add 5 sample articles to your database.

## Step 6: Restart Your Server

After updating `.env`, restart your server:
1. Stop the current server (Ctrl+C in the server terminal)
2. Start it again:
   ```bash
   npm run dev:server
   ```

## Step 7: Test Your Website

1. Make sure your frontend is running: `npm run dev`
2. Go to [http://localhost:5173/blog](http://localhost:5173/blog)
3. You should now see articles! 🎉

## Troubleshooting

### Error: "Invalid API key"
- Make sure you copied the **service_role** key (not anon key)
- Check that there are no extra spaces in your `.env` file
- Make sure you restarted the server after updating `.env`

### Error: "relation does not exist"
- Run the `schema.sql` file in Supabase SQL Editor (Step 3)
- Make sure all SQL ran successfully

### Error: "Cannot connect to API"
- Make sure the server is running: `npm run dev:server`
- Check that port 3001 is not blocked by firewall

### No articles showing
- Check if articles exist: Run `npm run db:verify`
- Make sure articles have `published: true`
- Run `npm run db:seed` to add sample articles

### Still having issues?
1. Run `npm run db:verify` to see what's wrong
2. Check the server terminal for error messages
3. Check your browser console (F12) for frontend errors

## Quick Checklist

- [ ] Created Supabase project
- [ ] Got service_role key from Settings → API
- [ ] Updated `.env` file with service_role key
- [ ] Ran `schema.sql` in Supabase SQL Editor
- [ ] Ran `npm run db:verify` - all checks passed
- [ ] Restarted server after updating `.env`
- [ ] Articles are showing on `/blog` page

---

**Need help?** Check the error messages - they're designed to tell you exactly what's wrong!

