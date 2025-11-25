# ngrok Setup Guide for Clerk Webhooks

This guide will help you set up ngrok to expose your local development server to the internet, allowing Clerk webhooks to reach your application.

## ✅ ngrok is Already Installed!

ngrok v3.33.0 is installed at: `C:\Users\ayper\ngrok\ngrok.exe`

**Quick Start:**

1. **Start your backend server:**
   ```bash
   npm run dev:server
   ```

2. **In a new terminal, start ngrok:**
   ```bash
   npm run ngrok
   ```
   Or run directly:
   ```bash
   C:\Users\ayper\ngrok\ngrok.exe http 3001
   ```

3. **Copy the public URL** from ngrok output and configure Clerk webhook

---

## Detailed Setup

### Option 1: Use npm Script (ngrok is installed)

1. **Download ngrok:**
   - Visit https://ngrok.com/download
   - Download for Windows
   - Extract `ngrok.exe` to a folder (e.g., `C:\ngrok`)
   - **Option A:** Add the folder to your PATH
   - **Option B:** Keep it in a folder and use full path

2. **Verify installation:**
   ```bash
   ngrok version
   ```

**Then use the npm script:**

1. **Start your backend server:**
   ```bash
   npm run dev:server
   ```

2. **In a new terminal, start ngrok:**
   ```bash
   npm run ngrok
   ```

3. **Copy the public URL** shown in the terminal (e.g., `https://abc123.ngrok.io`)

4. **Configure Clerk Webhook:**
   - Go to [Clerk Dashboard](https://dashboard.clerk.com) → **Webhooks**
   - Click **Add Endpoint**
   - **Endpoint URL:** `https://abc123.ngrok.io/api/clerk-webhook`
   - **Description:** `Sync Clerk users to AcademOra database`
   - **Subscribe to Events:** Select:
     - ✅ `user.created`
     - ✅ `user.updated`
     - ✅ `user.deleted`
   - Click **Create**
   - **Copy the Signing Secret** (starts with `whsec_...`)
   - Add it to your `.env` file:
     ```env
     CLERK_WEBHOOK_SECRET=whsec_...
     ```

5. **Restart your server** to load the new webhook secret

### Option 2: Use ngrok CLI Directly (Recommended)

This is the most reliable method. Simply run:

1. **Start your backend server:**
   ```bash
   npm run dev:server
   ```

2. **In a new terminal, start ngrok:**
   ```bash
   ngrok http 3001 --authtoken YOUR_NGROK_AUTHTOKEN
   ```
   Or if you've configured the authtoken globally:
   ```bash
   ngrok http 3001
   ```

3. **Copy the public URL** from ngrok output (e.g., `https://abc123.ngrok.io`)

## Important Notes

### URL Changes
- **Free ngrok accounts** get a new random URL each time you restart ngrok
- If the URL changes, you'll need to update the Clerk webhook endpoint
- **Solution:** Get a free ngrok account and add `NGROK_AUTHTOKEN` to `.env` for more stable URLs, or upgrade for a static domain

### Security
- ⚠️ **Only use ngrok in development** - never in production
- When ngrok is running, your local server is exposed to the internet
- Stop ngrok when you're done testing (Ctrl+C)

### Testing Webhooks
1. Make sure both your server and ngrok are running
2. Sign up a new user via Clerk
3. Check your server logs - you should see: `User user.created: ...`
4. Check your database - the user should be created/updated

## Troubleshooting

### "ngrok not found"
- Make sure you've run `npm install` first
- Try running `npm run ngrok` from the project root

### "Connection refused"
- Make sure your backend server is running on port 3001
- Check that `PORT=3001` is set in your `.env`

### "Webhook verification failed"
- Make sure `CLERK_WEBHOOK_SECRET` is set in `.env`
- Restart your server after adding the secret
- Verify the webhook URL in Clerk matches your ngrok URL exactly

### URL keeps changing
- Get a free ngrok account at https://dashboard.ngrok.com
- Add `NGROK_AUTHTOKEN=your_token` to `.env`
- Upgrade to ngrok Pro for a static domain (optional)

## Production Setup

For production, you don't need ngrok:
- Deploy your application to a server (e.g., Vercel, Railway, Render)
- Use your production domain for the Clerk webhook
- Example: `https://yourdomain.com/api/clerk-webhook`

