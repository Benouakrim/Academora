# ngrok Quick Start ✅

## ngrok is Ready!

✅ **Installed:** ngrok v3.33.0 at `C:\Users\ayper\ngrok\ngrok.exe`  
✅ **Authtoken:** Configured and saved  
✅ **Script:** `npm run ngrok` ready to use

---

## Start ngrok in 3 Steps:

### 1. Start your backend server (Terminal 1):
```bash
npm run dev:server
```

### 2. Start ngrok (Terminal 2):
```bash
npm run ngrok
```

Or directly:
```bash
C:\Users\ayper\ngrok\ngrok.exe http 3001
```

### 3. Copy the URL and configure Clerk:

**From ngrok output, you'll see something like:**
```
https://kaylyn-smorzando-elizbeth.ngrok-free.dev
```

**Configure Clerk Webhook:**
1. Go to https://dashboard.clerk.com → **Webhooks**
2. Click **Add Endpoint**
3. **Endpoint URL:** `https://kaylyn-smorzando-elizbeth.ngrok-free.dev/api/clerk-webhook`
4. **Description:** `Sync Clerk users to AcademOra database`
5. **Subscribe to Events:**
   - ✅ `user.created`
   - ✅ `user.updated`
   - ✅ `user.deleted`
6. Click **Create**
7. **Copy the Signing Secret** (starts with `whsec_...`)
8. Add to `.env`:
   ```env
   CLERK_WEBHOOK_SECRET=whsec_your_secret_here
   ```
9. **Restart your server** to load the secret

---

## Notes:

- **URL Changes:** Free ngrok accounts get a new URL each time you restart
- **To Keep Same URL:** Get an ngrok account and use a reserved domain (paid feature)
- **Stop ngrok:** Press `Ctrl+C` in the ngrok terminal

---

## Troubleshooting:

**If `npm run ngrok` doesn't work:**
- Use the full path: `C:\Users\ayper\ngrok\ngrok.exe http 3001`
- Or add `C:\Users\ayper\ngrok` to your Windows PATH

**To add to PATH:**
1. Press `Win + X` → System → Advanced system settings
2. Click "Environment Variables"
3. Under "User variables", select "Path" → Edit
4. Click "New" → Add: `C:\Users\ayper\ngrok`
5. Click OK on all dialogs
6. Restart your terminal

