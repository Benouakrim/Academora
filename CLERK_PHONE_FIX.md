# Fix: France Phone Numbers Not Supported

## Problem
Clerk shows error: "Phone numbers from this country (France) are currently not supported."

## Solution: Disable Phone Number Requirement

### Option 1: Make Phone Optional in Clerk Dashboard (Recommended)

1. **Go to Clerk Dashboard:**
   - Visit: https://dashboard.clerk.com
   - Navigate to: **Settings** → **Phone Numbers**

2. **Configure Phone Settings:**
   - **Enable phone numbers**: Toggle OFF (or keep ON if you want optional)
   - **Make phone optional**: Enable this option
   - **Required countries**: Remove France or leave empty
   - **Blocked countries**: Don't block France (leave empty)

3. **Update Sign Up Configuration:**
   - Go to: **User & Authentication** → **Email, Phone, Username**
   - Under **Phone numbers**:
     - Set to **Optional** (not required)
     - Or disable entirely if you don't need phone auth

### Option 2: Update Code to Skip Phone (Already Implemented)

The `ClerkSignUp` component already handles this by:
- Making phone optional in the signup flow
- Collecting phone later in the onboarding wizard (optional)
- Not using phone for authentication

### Option 3: Contact Clerk Support (For Production)

If you need France phone support:
1. Contact Clerk support: support@clerk.com
2. Request France phone number support
3. May require plan upgrade or feature request approval

## Recommended Approach

**Use Email-Only Authentication** with optional phone collection in onboarding:

1. ✅ Disable phone requirement in Clerk Dashboard
2. ✅ Keep phone optional in signup (current implementation)
3. ✅ Collect phone number in onboarding wizard (`RegisterPage.tsx`) - optional
4. ✅ Users can add phone later in profile settings if needed

This approach:
- ✅ Works for all countries
- ✅ Maintains user experience
- ✅ Still allows phone collection (just not for auth)
- ✅ Matches common SaaS patterns

## Testing

After disabling phone requirement:
1. Try signing up with a France-based user
2. Phone field should be optional or hidden
3. Email-only authentication should work
4. Phone can be added later in profile/onboarding

