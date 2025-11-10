# MVP Launch Checklist

## ✅ Completed

### Security
- ✅ Helmet for security headers
- ✅ CORS configuration
- ✅ Rate limiting (general + auth-specific)
- ✅ Request body validation with Zod
- ✅ Password reset flow with email
- ✅ JWT token authentication
- ✅ Role-based access control (admin/user)

### Backend Infrastructure
- ✅ Pino structured logging
- ✅ Sentry error tracking (server)
- ✅ Centralized error handling
- ✅ `.env.example` with all required keys
- ✅ Stripe checkout & webhook integration
- ✅ Data export endpoint (GDPR)
- ✅ Moderation schema for reviews & micro-content
- ✅ Test suite setup with Vitest

### Frontend
- ✅ Global error boundary
- ✅ Cookie consent banner
- ✅ Sentry React SDK installed

### DevOps
- ✅ CI workflow (GitHub Actions)
- ✅ Validation schemas for auth, matching, profile, reviews

---

## 🔧 Manual Configuration Required

### 1. **Environment Variables**
Copy `.env.example` to `.env` and fill in:

```bash
# Required for MVP
JWT_SECRET=<generate-random-64-char-string>
SUPABASE_URL=<your-supabase-project-url>
SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-role-key>
MAILJET_API_KEY=<your-mailjet-key>
MAILJET_API_SECRET=<your-mailjet-secret>
MAILJET_SENDER_EMAIL=no-reply@yourdomain.com
STRIPE_SECRET_KEY=<your-stripe-secret-key>
STRIPE_WEBHOOK_SECRET=<your-stripe-webhook-secret>
SENTRY_DSN=<your-sentry-dsn>

# Optional but recommended
STRIPE_PRICE_FREE=<stripe-price-id>
STRIPE_PRICE_PRO=<stripe-price-id>
STRIPE_PRICE_TEAM=<stripe-price-id>
```

### 2. **Stripe Setup**
1. Create products & prices in Stripe Dashboard
2. Copy price IDs to `.env`
3. Set up webhook endpoint: `https://yourdomain.com/api/billing/webhook`
4. Add webhook secret to `.env`
5. Enable events: `checkout.session.completed`

### 3. **Mailjet Setup**
1. Create Mailjet account
2. Generate API credentials
3. Verify sender email domain
4. Add credentials to `.env`

### 4. **Sentry Setup**
1. Create Sentry project
2. Copy DSN
3. Add to `.env` for both server and frontend

### 5. **Database Migrations**
Run pending migrations:
```bash
npm run db:migrate
```

Apply moderation schema:
```sql
psql -f server/database/migrations/27_add_moderation_status.sql
```

### 6. **GitHub Secrets**
Add to GitHub repo settings → Secrets:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

---

## ⚠️ Known Gaps (Non-blocking for MVP)

### Email Verification
- Signup creates accounts without email verification
- **Recommendation**: Add email verification token flow post-MVP

### Account Lockout
- No brute-force protection on login
- **Recommendation**: Track failed attempts, lock after 5 failures

### i18n Completion
- Many strings still hardcoded in components
- **Recommendation**: Externalize to locale JSON files

### Notifications Real-time
- No WebSocket/polling implementation
- **Recommendation**: Add notification polling or use Supabase Realtime

### SEO Metadata
- Dynamic pages lack structured metadata
- **Recommendation**: Add react-helmet-async for per-page SEO

### Accessibility
- Missing ARIA labels on some interactive elements
- **Recommendation**: Run axe-core audit and fix violations

### Advanced Analytics
- Stub endpoints for advanced analytics dashboard
- **Recommendation**: Implement actual query logic or hide UI

---

## 🚀 Launch Steps

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your keys
   ```

3. **Run migrations**
   ```bash
   npm run db:migrate
   ```

4. **Create admin user**
   ```bash
   npm run db:create-admin
   ```

5. **Start development servers**
   ```bash
   npm run dev:all
   ```

6. **Run tests**
   ```bash
   npm test
   ```

7. **Build for production**
   ```bash
   npm run build
   npm run build:server  # (currently no-op for Node)
   ```

8. **Deploy**
   - Frontend: Deploy `dist/` to Vercel/Netlify
   - Backend: Deploy to Heroku/Railway/Render with env vars
   - Set `NODE_ENV=production`

---

## 📊 Security Audit

Before launch:
```bash
npm audit fix
npm run lint
```

Check for:
- [ ] No secrets committed to git
- [ ] CORS origins restricted in production
- [ ] Rate limits appropriate for traffic
- [ ] Stripe webhook signature validation enabled
- [ ] Sentry environment set correctly
- [ ] HTTPS enforced in production
- [ ] CSP headers configured (currently disabled for simplicity)

---

## 📞 Support

If you need help:
1. Check server logs for errors
2. Review Sentry for exceptions
3. Test Stripe webhooks with CLI: `stripe listen --forward-to localhost:3001/api/billing/webhook`
4. Verify Supabase RLS policies are correct

**Good luck with your MVP launch! 🎉**
