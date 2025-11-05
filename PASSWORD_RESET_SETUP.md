# Password Reset Email Setup Guide

This guide explains how the password reset functionality works in AcademOra and how to configure it.

## How It Works

1. **User Request**: User enters their email on the forgot password page (`/password/forgot`)
2. **Token Generation**: Server generates a secure token and stores it in memory
3. **Email Sending**: Server sends reset email via Mailjet (if configured) or logs link to console
4. **User Reset**: User clicks email link or uses console link to reset password (`/password/reset`)

## Current Implementation Status

✅ **Frontend Components**: 
- Password reset request form (`PasswordResetRequest.tsx`)
- Password reset form (`PasswordReset.tsx`)
- Proper routing in `App.tsx`
- "Forgot password" link in login page

✅ **Backend API**:
- `/api/auth/forgot` - Request password reset
- `/api/auth/reset` - Perform password reset
- Mailjet integration in `email.js`

✅ **Security Features**:
- Secure token generation using crypto
- Token expiration (1 hour)
- Email existence protection (always returns success)
- Password validation (minimum 6 characters)

## Configuration Required

### 1. Environment Variables

Add these to your `.env` file:

```bash
# Mailjet Configuration (get from https://app.mailjet.com/account/api_keys)
MAILJET_API_KEY=your-mailjet-api-key
MAILJET_API_SECRET=your-mailjet-api-secret

# Frontend URL (where users will be directed)
FRONTEND_URL=http://localhost:5173
```

### 2. Mailjet Setup

1. Sign up at [Mailjet](https://www.mailjet.com/)
2. Go to Account Settings → API Keys
3. Create a new API key with sending permissions
4. Add the API key and secret to your `.env` file
5. Verify your sender domain/email in Mailjet settings

### 3. Development Mode (Without Email)

If you haven't configured Mailjet yet, the system still works:
- Reset links are logged to the server console
- Users can copy-paste the link from console to reset password
- Perfect for development and testing

## Testing the Password Reset

### Option 1: With Mailjet Configured
1. Start your server: `npm run dev:server`
2. Start your frontend: `npm run dev`
3. Go to `/password/forgot`
4. Enter your email
5. Check your email for reset link
6. Click link to reset password

### Option 2: Development Mode (No Email)
1. Start your server: `npm run dev:server`
2. Start your frontend: `npm run dev`
3. Go to `/password/forgot`
4. Enter your email
5. Check server console for reset link output
6. Copy-paste the link into your browser
7. Reset your password

## Example Console Output (Development Mode)

```
Generated reset token for user@example.com: a1b2c3d4e5f6...
Reset link: http://localhost:5173/password/reset?email=user%40example.com&token=a1b2c3d4e5f6...
Mailjet not configured - user must use the console link for development
```

## Troubleshooting

### Email Not Sending
- Check that Mailjet API keys are correctly set in `.env`
- Verify sender email is configured in Mailjet
- Check server console for error messages
- In development, use the console link as fallback

### Link Not Working
- Ensure FRONTEND_URL is correctly set
- Check that frontend server is running on the specified port
- Verify token hasn't expired (1 hour timeout)

### Password Reset Failing
- Check that the token matches exactly
- Ensure token hasn't expired
- Verify email exists in the database

## Production Considerations

1. **Mailjet Configuration**: Always configure Mailjet in production
2. **Frontend URL**: Set FRONTEND_URL to your production domain
3. **Token Storage**: Consider using Redis or database for token storage in production
4. **Rate Limiting**: Add rate limiting to prevent abuse
5. **Email Templates**: Customize email templates for your brand

## Files Involved

- `src/pages/PasswordResetRequest.tsx` - Forgot password form
- `src/pages/PasswordReset.tsx` - Password reset form
- `src/lib/api.ts` - API client functions
- `server/routes/auth.js` - Backend password reset endpoints
- `server/services/email.js` - Mailjet email service
- `src/App.tsx` - Routing configuration
