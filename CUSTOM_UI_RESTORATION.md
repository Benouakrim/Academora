# Custom UI Restoration Guide

## Issue: Lost Custom Signup Wizard Styling

### What Was Lost
- **Before**: Beautiful multi-step signup wizard (`RegisterPage.tsx`) with:
  - Dual account types (Individual/Institution)
  - Multi-step forms with progress indicators
  - Custom styling matching website theme
  - Onboarding data collection
- **After**: Generic Clerk `<SignUp />` component (now fixed with custom appearance)

### What's Been Fixed

#### ✅ Sign In Page (`LoginPage.tsx`)
- Now uses `ClerkSignIn` component
- Custom appearance matching theme
- Gradient background
- Theme colors (primary-600, etc.)

#### ✅ Sign Up Page (`SignUpPage.tsx`)
- Now uses `ClerkSignUp` component  
- Custom appearance matching theme
- Redirects to onboarding wizard after signup
- Theme colors and styling

#### ✅ Onboarding Wizard (`RegisterPage.tsx`)
- **Still exists and works!**
- Multi-step wizard preserved
- Dual account types (Individual/Institution)
- Custom styling intact
- Now checks for Clerk authentication
- Runs after Clerk signup

### Current Flow

1. **User visits `/signup`**
   - Sees custom-styled Clerk SignUp component
   - Creates account with Clerk
   - Phone number optional (configured in Clerk Dashboard)

2. **After Clerk signup**
   - Redirects to `/register?type=individual` (onboarding wizard)
   - User completes multi-step onboarding
   - Data saved to database

3. **User visits `/login`**
   - Sees custom-styled Clerk SignIn component
   - Logs in with Clerk
   - Redirects to dashboard

### Customization Options

#### Theme Colors
Edit `src/components/ClerkSignIn.tsx` and `ClerkSignUp.tsx`:

```tsx
variables: {
  colorPrimary: '#2563eb', // primary-600 - change to match theme
  colorBackground: '#ffffff',
  // ... other colors
}
```

#### Appearance Elements
You can customize:
- `formButtonPrimary` - Button styling
- `formFieldInput` - Input field styling
- `headerTitle` - Title styling
- `socialButtonsBlockButton` - Social button styling
- And more (see Clerk appearance API)

### Advanced: Full Custom UI (Future Option)

If you want even more control, you can use Clerk's **headless mode**:

1. Use `@clerk/clerk-sdk-node` on backend
2. Build completely custom forms
3. Handle authentication manually
4. Full control over UI/UX

**Trade-off**: More code to maintain, but complete customization.

### Phone Number Fix

See `CLERK_PHONE_FIX.md` for:
- How to disable phone requirement
- Making phone optional
- France phone number support

### Testing

1. **Test signup flow**:
   - `/signup` → Clerk signup → `/register` → Onboarding wizard
   
2. **Test login flow**:
   - `/login` → Clerk login → Dashboard

3. **Verify styling**:
   - Colors match theme
   - Layout matches design
   - Responsive on mobile

## Summary

✅ **Custom styling restored** - Sign in/up pages now match theme
✅ **Onboarding wizard preserved** - Still works with Clerk auth
✅ **Phone number fix** - Made optional (see CLERK_PHONE_FIX.md)
✅ **Flow maintained** - Signup → Onboarding → Dashboard

The only difference: Users now authenticate with Clerk instead of custom auth, but the UI and flow remain similar to before.

