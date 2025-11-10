# Referral System Implementation Guide

## Overview

A comprehensive referral system has been implemented to track user referrals, manage referral codes, and reward users for bringing new members to the platform. The system includes both user-facing features and admin management tools.

## Database Schema

### Tables Created

The system creates four main tables:

1. **referral_codes**: Stores unique referral codes for each user
   - `code` (VARCHAR, PK): Unique 8-character referral code
   - `user_id` (UUID, FK): User who owns the code
   - `uses_count` (INTEGER): Number of times code has been used
   - `is_active` (BOOLEAN): Whether the code is active
   - `created_at`, `expires_at`: Timestamps

2. **referrals**: Tracks referral relationships
   - `id` (UUID, PK): Unique identifier
   - `referrer_user_id` (UUID, FK): User who referred
   - `referred_user_id` (UUID, FK): User who was referred
   - `referral_code` (VARCHAR, FK): Code used
   - `status` (VARCHAR): 'pending' or 'completed'
   - `created_at`, `completed_at`: Timestamps

3. **referral_rewards**: Tracks rewards given to referrers
   - `id` (UUID, PK): Unique identifier
   - `referrer_user_id` (UUID, FK): User receiving reward
   - `referral_id` (UUID, FK): Associated referral
   - `reward_type` (VARCHAR): Type of reward
   - `reward_value` (INTEGER): Numeric value
   - `applied_at`: Timestamp

4. **referral_settings**: System-wide configuration
   - `id` (SERIAL, PK): Settings ID (always 1)
   - `rewards_enabled` (BOOLEAN): Enable/disable rewards
   - `points_per_referral` (INTEGER): Points awarded per referral
   - `min_referrals_for_reward` (INTEGER): Minimum referrals needed
   - `max_uses_per_code` (INTEGER): Max uses per code (0 = unlimited)
   - `code_expiry_days` (INTEGER): Days until code expires (0 = never)

### User Table Additions

Two columns added to the `users` table:
- `referred_by_code` (VARCHAR): Code used during signup
- `referral_count` (INTEGER): Total successful referrals

## Backend Implementation

### Data Layer (`server/data/referrals.js`)

Provides core data operations:

- `getOrCreateCode(userId)`: Get user's code or create new one
- `validateCode(code)`: Check if code is valid and active
- `createReferral(code, referredUserId)`: Create referral relationship
- `completeReferral(referralId)`: Mark referral as complete and apply rewards
- `getUserStats(userId)`: Get user's referral statistics
- `getUserReferrals(userId)`: List user's referrals
- `getUserRewards(userId)`: Get user's earned rewards

### User Routes (`server/routes/referrals.js`)

User-facing endpoints:

- `GET /api/referrals/my-code`: Get current user's referral code and stats
- `GET /api/referrals/my-referrals`: List user's referrals
- `GET /api/referrals/my-rewards`: Get user's earned rewards
- `GET /api/referrals/validate/:code`: Validate referral code (public)

### Admin Routes (`server/routes/adminReferrals.js`)

Admin management endpoints:

- `GET /api/admin/referrals/all`: List all referrals (with filters)
- `GET /api/admin/referrals/stats`: System-wide statistics
- `GET /api/admin/referrals/codes`: List all referral codes
- `PUT /api/admin/referrals/codes/:code/status`: Enable/disable codes
- `GET /api/admin/referrals/settings`: Get system settings
- `PUT /api/admin/referrals/settings`: Update system settings
- `POST /api/admin/referrals/rewards/:id/apply`: Manually apply reward
- `GET /api/admin/referrals/user/:userId`: Get user's referral details

### Authentication Integration

Modified `server/routes/auth.js` signup to:
1. Accept optional `referralCode` parameter
2. Validate code before user creation
3. Store code in `referred_by_code` field
4. Create referral relationship after successful signup

## Frontend Implementation

### User Dashboard (`src/pages/ReferralDashboard.tsx`)

Features:
- **Statistics Cards**: Total, completed, pending referrals, and rewards
- **Referral Code Display**: Large, copyable code with share options
- **Referral Link**: Full URL with copy functionality
- **Social Sharing**: Email, Facebook, Twitter, LinkedIn
- **Referrals List**: All referred users with status
- **Rewards History**: All earned rewards with details

### Admin Panel (`src/pages/admin/AdminReferrals.tsx`)

Four main tabs:

1. **Overview**:
   - 6 key metrics (total, completed, pending, rewards, active codes, unique referrers)
   - Top referrers leaderboard

2. **All Referrals**:
   - Searchable/filterable table
   - Export to CSV functionality
   - Pagination for large datasets

3. **Referral Codes**:
   - List all codes with usage stats
   - Toggle active/inactive status
   - User associations

4. **Settings**:
   - Enable/disable rewards system
   - Configure points per referral
   - Set minimum referrals for rewards
   - Max uses per code
   - Code expiry settings

### Navigation Integration

- **User Menu**: Added "Referrals" link with Gift icon
- **Admin Menu**: Added "Referral System" under analytics section
- **Routes**: Registered `/referrals` and `/admin/referrals`

## Migration Instructions

1. **Run Database Migration**:
   ```bash
   psql -U your_username -d your_database -f server/database/migrations/add-referral-system.sql
   ```

2. **Verify Tables Created**:
   ```sql
   \dt referral*
   ```

3. **Check Default Settings**:
   ```sql
   SELECT * FROM referral_settings;
   ```

## Usage Flow

### User Signup with Referral

1. User A generates referral code: `ABC12345`
2. User A shares link: `https://academora.com/signup?ref=ABC12345`
3. User B clicks link and signs up
4. System validates code and creates user
5. Referral relationship created with status 'pending'
6. When User B completes onboarding/verification (implement trigger):
   - Call `completeReferral(referralId)`
   - Status changes to 'completed'
   - Rewards applied to User A
   - User A's `referral_count` incremented

### Admin Management

1. **Monitor Referrals**:
   - View overview dashboard
   - Check top referrers
   - Review individual referrals

2. **Code Management**:
   - Deactivate suspicious codes
   - Monitor usage patterns
   - Track expiry dates

3. **Configure System**:
   - Adjust reward amounts
   - Set minimum thresholds
   - Enable/disable features

## Completion Trigger

The system provides `completeReferral()` function but does NOT automatically complete referrals. You need to decide when a referral is "completed" and call this function.

**Common completion triggers**:
- Email verification
- First login after signup
- Profile completion
- First purchase/action
- Time-based (X days active)

**Example Implementation**:
```javascript
// In your verification/onboarding completion handler
import { referrals } from '../data/referrals.js';

async function handleUserVerification(userId) {
  // Find pending referral for this user
  const { data: referral } = await supabase
    .from('referrals')
    .select('id')
    .eq('referred_user_id', userId)
    .eq('status', 'pending')
    .maybeSingle();

  if (referral) {
    await referrals.completeReferral(referral.id);
  }
}
```

## Reward Types

The system supports flexible reward types. Default is 'points', but you can implement:
- `'points'`: Loyalty/reward points
- `'credit'`: Account credit
- `'subscription'`: Free subscription time
- `'feature'`: Unlock premium features
- `'badge'`: Achievement badges

Modify `apply_referral_reward()` function in migration to customize reward logic.

## Security Considerations

1. **Code Validation**: All codes validated before use
2. **Expiry Checking**: Expired codes automatically rejected
3. **Active Status**: Inactive codes cannot be used
4. **Use Limits**: Optional max uses per code
5. **Admin Controls**: Full visibility and control

## API Response Examples

### Get My Code
```json
{
  "code": {
    "code": "ABC12345",
    "uses_count": 3,
    "is_active": true
  },
  "stats": {
    "total_referrals": 3,
    "completed_referrals": 2,
    "pending_referrals": 1,
    "total_rewards": 200
  }
}
```

### Validate Code
```json
{
  "valid": true,
  "referrer_email": "referrer@example.com"
}
```

### Admin Stats
```json
{
  "stats": {
    "total_referrals": 150,
    "completed_referrals": 120,
    "pending_referrals": 30,
    "total_rewards_given": 12000,
    "active_codes": 45,
    "unique_referrers": 40
  },
  "top_referrers": [
    {
      "user_id": "uuid",
      "email": "top@example.com",
      "referral_count": 15,
      "completed_count": 12
    }
  ]
}
```

## Testing Checklist

- [ ] Run database migration successfully
- [ ] Create account and verify referral code generated
- [ ] Share referral link and sign up new user
- [ ] Check referral appears in dashboard as 'pending'
- [ ] Manually complete referral and verify reward
- [ ] Test code validation endpoint
- [ ] Access admin panel and view statistics
- [ ] Filter/search referrals in admin panel
- [ ] Export referrals to CSV
- [ ] Modify system settings
- [ ] Deactivate a code and verify it cannot be used
- [ ] Test code expiry (if configured)
- [ ] Test max uses limit (if configured)

## Future Enhancements

Potential additions:
1. **Tiered Rewards**: Different rewards based on referral count
2. **Leaderboards**: Public top referrers page
3. **Referral Campaigns**: Time-limited bonus rewards
4. **Email Notifications**: Alert users of completed referrals
5. **Analytics Dashboard**: Charts and graphs for referral trends
6. **Social Media Integration**: Direct share buttons
7. **Bulk Code Generation**: Generate codes for marketing campaigns
8. **Referral Milestones**: Badges/achievements for referral goals

## Support

For issues or questions:
1. Check database connection and table creation
2. Verify JWT authentication is working
3. Check browser console for API errors
4. Review server logs for backend errors
5. Ensure all routes are registered in `app.js`

## Files Modified/Created

### Created:
- `server/database/migrations/add-referral-system.sql`
- `server/data/referrals.js`
- `server/routes/referrals.js`
- `server/routes/adminReferrals.js`
- `src/pages/ReferralDashboard.tsx`
- `src/pages/admin/AdminReferrals.tsx`

### Modified:
- `server/routes/auth.js` - Added referral code handling in signup
- `server/data/users.js` - Added `referredByCode` parameter
- `server/validation/authSchemas.js` - Added `referralCode` to schema
- `server/app.js` - Registered referral routes
- `src/App.tsx` - Added referral routes
- `src/components/Navbar.tsx` - Added referrals link
- `src/components/AdminMenu.tsx` - Added referral management link

---

**Status**: ✅ Implementation Complete - Ready for Migration and Testing
