# Field Mapping Analysis: Clerk ↔ Neon ↔ Dashboard ↔ Onboarding

## Critical Issues Found

### 1. **Name Field Inconsistency** ⚠️
- **Database (Prisma Schema)**: `first_name`, `last_name` (snake_case)
- **Migration File**: Adds `given_name`, `family_name` (conflict!)
- **Frontend/Dashboard**: Uses `given_name`, `family_name` (snake_case)
- **Clerk API**: Uses `first_name`, `last_name` (snake_case)
- **Dual-Sync Route**: Maps to `given_name`, `family_name` (works via `updateUserProfile` mapping)
- **Profile Route**: Accepts `given_name`/`family_name` → maps to `first_name`/`last_name` ✅

**Status**: Currently works because `updateUserProfile` handles both, but should standardize on `first_name`/`last_name` to match Prisma schema.

### 2. **Missing Fields in Dual-Sync**
- `dateOfBirth` is in metadata but not synced to Neon database
- `country` is in metadata but doesn't exist in schema
- `preferredLanguage` is in metadata but doesn't exist in schema

### 3. **Field Name Mappings**

#### Clerk → Neon (via syncUserToDb)
- `clerkUserData.first_name` → `users.first_name` ✅
- `clerkUserData.last_name` → `users.last_name` ✅
- `clerkUserData.email_addresses[0].email_address` → `users.email` ✅
- `clerkUserData.image_url` → `users.avatar_url` ✅
- `clerkUserData.username` → `users.username` ✅

#### Onboarding Wizard → Neon (via dual-sync)
- `givenName` / `contactGivenName` → `firstName` → `given_name` → `first_name` (via updateUserProfile) ✅
- `familyName` / `contactFamilyName` → `lastName` → `family_name` → `last_name` (via updateUserProfile) ✅
- `email` / `contactEmail` → `primaryEmail` → `users.email` ✅
- `role` → `personaRole` → `users.persona_role` ✅
- `focusArea` → `focusArea` → `users.focus_area` ✅
- `primaryGoal` → `primaryGoal` → `users.primary_goal` ✅
- `timeline` → `timeline` → `users.timeline` ✅
- `organizationName` → `organizationName` → `users.organization_name` ✅
- `organizationType` → `organizationType` → `users.organization_type` ✅
- `dateOfBirth` / `contactDateOfBirth` → ❌ **NOT SYNCED** (only in metadata)

#### Dashboard Settings → Neon (via profile route)
- `given_name` → `users.first_name` ✅
- `family_name` → `users.last_name` ✅
- `full_name` → `users.full_name` ✅
- `email` → `users.email` ✅
- `phone` → `users.phone` ✅
- `bio` → `users.bio` ✅
- `website_url` → `users.website_url` ✅
- `linkedin_url` → `users.linkedin_url` ✅
- `github_url` → `users.github_url` ✅
- `twitter_url` → `users.twitter_url` ✅
- `portfolio_url` → `users.portfolio_url` ✅
- `title` → `users.title` ✅
- `headline` → `users.headline` ✅
- `location` → `users.location` ✅
- `date_of_birth` → `users.date_of_birth` ✅
- `persona_role` → `users.persona_role` ✅
- `focus_area` → `users.focus_area` ✅
- `primary_goal` → `users.primary_goal` ✅
- `timeline` → `users.timeline` ✅
- `organization_name` → `users.organization_name` ✅
- `organization_type` → `users.organization_type` ✅
- `is_profile_public` → `users.is_profile_public` ✅
- `show_email` → `users.show_email` ✅
- `show_saved` → `users.show_saved` ✅
- `show_reviews` → `users.show_reviews` ✅
- `show_socials` → `users.show_socials` ✅
- `show_activity` → `users.show_activity` ✅

## Field Comparison Table

| Field | Clerk | Neon DB | Dashboard | Onboarding | Dual-Sync | Status |
|-------|-------|---------|-----------|------------|-----------|--------|
| First Name | `first_name` | `first_name` | `given_name` | `givenName` | `firstName` → `given_name` | ⚠️ Works but inconsistent |
| Last Name | `last_name` | `last_name` | `family_name` | `familyName` | `lastName` → `family_name` | ⚠️ Works but inconsistent |
| Email | `email_addresses[]` | `email` | `email` | `email`/`contactEmail` | `primaryEmail` → `email` | ✅ |
| Phone | `phone_numbers[]` | `phone` | `phone` | `phone`/`contactPhone` | `phoneNumbers[0]` → `phone` | ✅ |
| Username | `username` | `username` | `username` | N/A | N/A | ✅ |
| Avatar | `image_url` | `avatar_url` | `avatar_url` | N/A | N/A | ✅ |
| Date of Birth | N/A | `date_of_birth` | `date_of_birth` | `dateOfBirth` | ❌ Missing | ❌ |
| Bio | N/A | `bio` | `bio` | N/A | N/A | ✅ |
| Title | N/A | `title` | `title` | N/A | N/A | ✅ |
| Headline | N/A | `headline` | `headline` | N/A | N/A | ✅ |
| Location | N/A | `location` | `location` | N/A | N/A | ✅ |
| Website | N/A | `website_url` | `website_url` | N/A | N/A | ✅ |
| LinkedIn | N/A | `linkedin_url` | `linkedin_url` | N/A | N/A | ✅ |
| GitHub | N/A | `github_url` | `github_url` | N/A | N/A | ✅ |
| Twitter | N/A | `twitter_url` | `twitter_url` | N/A | N/A | ✅ |
| Portfolio | N/A | `portfolio_url` | `portfolio_url` | N/A | N/A | ✅ |
| Persona Role | N/A | `persona_role` | `persona_role` | `role` | `personaRole` → `persona_role` | ✅ |
| Focus Area | N/A | `focus_area` | `focus_area` | `focusArea` | `focusArea` → `focus_area` | ✅ |
| Primary Goal | N/A | `primary_goal` | `primary_goal` | `primaryGoal` | `primaryGoal` → `primary_goal` | ✅ |
| Timeline | N/A | `timeline` | `timeline` | `timeline` | `timeline` → `timeline` | ✅ |
| Org Name | N/A | `organization_name` | `organization_name` | `organizationName` | `organizationName` → `organization_name` | ✅ |
| Org Type | N/A | `organization_type` | `organization_type` | `organizationType` | `organizationType` → `organization_type` | ✅ |
| Account Type | N/A | `account_type` | `account_type` | `accountType` | `accountType` → `account_type` | ✅ |
| Country | N/A | ❌ Not in schema | ❌ Not in schema | `country` | ❌ Only in metadata | ❌ |
| Preferred Language | N/A | ❌ Not in schema | ❌ Not in schema | `preferredLanguage` | ❌ Only in metadata | ❌ |

## Recommendations

1. **Standardize on `first_name`/`last_name`** - Update dual-sync to use `first_name`/`last_name` directly
2. **Add `dateOfBirth` to dual-sync** - Sync date of birth from onboarding to database
3. **Consider adding `country` and `preferredLanguage`** to schema if needed
4. **Remove `given_name`/`family_name` columns** if migration was applied (or update Prisma schema if they exist)

