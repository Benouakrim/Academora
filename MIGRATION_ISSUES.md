# Migration Issues & Solutions

This document addresses critical issues discovered during the migration from Supabase to Clerk.

## 🔴 Issue 1: Existing Users Not Migrated

### Problem
- Users already registered in Supabase (admin, free users) are NOT automatically migrated
- Clerk webhook only handles NEW users created after migration
- Existing users cannot log in because:
  - Their passwords are hashed differently (Supabase vs Clerk)
  - They don't exist in Clerk
  - No `clerkId` link exists

### Solution Required
Create a migration script that:
1. Reads all users from Supabase (old database)
2. For each user:
   - Creates a Clerk user via Clerk API (or manual invitation)
   - Links Clerk user to database user via `clerkId`
   - Preserves password (or forces password reset)
   - Maintains role (admin/user)
3. Updates all existing users to have `clerkId`

### Implementation
See `scripts/migrate-existing-users.js` (to be created)

---

## 🔴 Issue 2: Lost Custom Signup Wizard UI

### Problem
- **Before**: Beautiful multi-step wizard (`RegisterPage.tsx`) with:
  - Dual account types (Individual/Institution)
  - Multi-step forms with progress indicators
  - Custom styling matching website theme
  - Onboarding data collection
- **After**: Replaced with Clerk's default `<SignUp />` component
  - Generic styling (doesn't match theme)
  - No multi-step wizard
  - No account type selection
  - No custom onboarding fields

### Solution Required

#### Option A: Custom Clerk UI (Recommended)
Use Clerk's `<SignIn />` and `<SignUp />` with custom appearance:
- Customize colors, fonts, styling to match theme
- Use Clerk's appearance customization API
- Keep the flow but integrate with Clerk auth

#### Option B: Headless Clerk + Custom UI
- Use Clerk's headless SDK (`@clerk/clerk-sdk-node`)
- Build completely custom UI
- Handle authentication manually
- More work but full control

### Implementation
- Update `src/pages/SignUpPage.tsx` to use Clerk with custom appearance
- Update `src/pages/LoginPage.tsx` to use Clerk with custom appearance
- Create appearance config matching theme

---

## 🔴 Issue 3: Custom Sign In Page Lost

### Problem
- **Before**: Custom styled login page matching website theme
- **After**: Generic Clerk `<SignIn />` component with default styling

### Solution Required
Same as Issue 2 - use Clerk with custom appearance or headless mode.

---

## 🔴 Issue 4: France Phone Numbers Not Supported

### Problem
Clerk shows error: "Phone numbers from this country (France) are currently not supported."

### Solution Required

#### Option 1: Enable Phone Support in Clerk Dashboard
1. Go to Clerk Dashboard → Settings → Phone Numbers
2. Check if France needs to be enabled
3. May require plan upgrade

#### Option 2: Disable Phone Authentication
- Make phone optional in Clerk settings
- Use email-only authentication
- Add phone later in profile settings (not during signup)

#### Option 3: Use Email as Primary
- Remove phone requirement from signup
- Collect phone in onboarding wizard (optional)
- Don't use phone for authentication

### Recommended
Option 3 - Make phone optional and collect it in the onboarding wizard instead.

---

## Implementation Priority

### High Priority (Blocks Users)
1. ✅ **Existing User Migration** - Create migration script
2. ✅ **Custom UI** - Restore signup wizard styling
3. ✅ **Phone Number Fix** - Make phone optional

### Medium Priority
4. Update onboarding flow to work with Clerk
5. Test all authentication flows

### Low Priority
6. Optimize appearance customization
7. Add more customization options

