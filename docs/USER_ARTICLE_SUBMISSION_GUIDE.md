# User Article Submission & Review System

## Overview
Implemented a comprehensive user article submission system with admin review, analytics dashboard, and spam prevention mechanisms.

## Features Implemented

### 1. Database Schema (`server/database/migrations/add-article-review-system.sql`)
- **Article Status System**: Added status column with values: draft, pending, approved, rejected, published
- **Review Tracking**: submitted_at, reviewed_at, reviewed_by, rejection_reason columns
- **Site Settings Table**: Configurable limits and system settings
- **Article Analytics Table**: Tracks views, likes, comments, shares per day
- **Automatic Analytics**: Function to increment metrics

### 2. Backend API Routes

#### User Article Routes (`server/routes/userArticles.js`)
- `GET /api/user-articles/my-articles` - Get user's own articles with analytics
- `GET /api/user-articles/my-articles/:id/analytics` - Get detailed analytics for specific article
- `GET /api/user-articles/can-submit` - Check if user can submit new article (limit check)
- `POST /api/user-articles/submit` - Create/update article (draft or pending)
- `DELETE /api/user-articles/:id` - Delete draft or rejected article

#### Admin Review Routes (`server/routes/articleReview.js`)
- `GET /api/article-review/pending` - Get all pending articles
- `GET /api/article-review/reviewed` - Get reviewed articles (approved/rejected)
- `GET /api/article-review/:id` - Get single article details
- `POST /api/article-review/:id/approve` - Approve article (with optional immediate publish)
- `POST /api/article-review/:id/reject` - Reject article with reason
- `POST /api/article-review/:id/publish` - Publish approved article
- `GET /api/article-review/stats/overview` - Get review statistics
- `PUT /api/article-review/settings` - Update system settings (max pending limit)
- `GET /api/article-review/settings/current` - Get current settings

### 3. Frontend Pages

#### User Article Editor (`src/pages/UserArticleEditor.tsx`)
- Full-featured article editor with Tiptap rich text editor
- Save as draft or submit for review
- Live submission limit display
- Category selection, tags, featured image upload
- SEO settings (meta title/description)
- Validation before submission
- Edit existing drafts/rejected articles

#### My Articles Dashboard (`src/pages/MyArticles.tsx`)
- View all user's articles with status badges
- Filter by status (all, draft, pending, published, rejected)
- Real-time submission limit tracking
- Performance analytics for published articles:
  - Views, likes, comments, shares
- Edit draft or rejected articles
- Delete draft or rejected articles
- Display rejection reasons
- Show review status and reviewer info

#### Admin Review Portal (`src/pages/AdminReviewPortal.tsx`)
- View all pending articles
- Side-by-side article list and preview
- Author information and history
- Review statistics dashboard
- Two approval options:
  - Approve & Publish (immediate)
  - Approve Only (publish later)
- Rejection with required reason
- Configurable settings panel for submission limits
- Real-time stats: pending, approved, rejected, published counts

### 4. Spam Prevention System

#### Submission Limits
- Configurable max pending articles per user (default: 3)
- Admin can adjust from 1-20 via settings
- User sees remaining slots before submission
- Cannot submit new article when limit reached
- Limit resets when article is reviewed (approved/rejected)

#### Workflow
1. User writes article → saves as draft (no limit)
2. User submits for review → counts toward limit
3. Admin reviews → approves or rejects
4. When reviewed, slot becomes available again
5. User can write another article

### 5. Article Status Flow

```
draft → pending → approved → published
                ↘ rejected
```

- **Draft**: Saved locally, can edit anytime, doesn't count toward limit
- **Pending**: Submitted for review, counts toward limit, cannot edit
- **Approved**: Admin approved, ready to publish (or publish immediately)
- **Rejected**: Admin rejected with reason, user can edit and resubmit, doesn't count toward limit
- **Published**: Live on website, cannot edit (admin only)

### 6. Analytics System

#### Daily Metrics
- Views, likes, comments, shares tracked per article per day
- 30-day historical data
- Aggregated totals

#### User Dashboard Analytics
- Real-time performance metrics
- Visual comparison across articles
- Author can only see their own articles' analytics

## Setup Instructions

### 1. Run Database Migration

```bash
# Start your PostgreSQL database first
# Then run the migration
psql -U postgres -d academora -f server/database/migrations/add-article-review-system.sql
```

Or use Node.js:
```bash
node server/database/migrate.js
```

### 2. Update Navigation Links

Add these links to your navigation menu:

**For Regular Users:**
- My Articles: `/my-articles`
- Write Article: `/write-article`

**For Admins:**
- Review Portal: `/admin/review`

### 3. Environment Variables
No new environment variables needed. Uses existing authentication and database config.

## Usage

### For Users

1. **Write New Article**
   - Navigate to `/write-article`
   - Fill in title, content, category, etc.
   - Save as draft OR submit for review
   - Check pending limit before submission

2. **Manage Articles**
   - Go to `/my-articles`
   - View all articles with status
   - Edit drafts or rejected articles
   - Delete unwanted drafts
   - Track performance of published articles

3. **Resubmit Rejected Articles**
   - Open rejected article from My Articles
   - Fix issues mentioned in rejection reason
   - Resubmit for review

### For Admins

1. **Review Submissions**
   - Go to `/admin/review`
   - See all pending articles
   - Click article to preview
   - Choose action:
     - Approve & Publish (goes live immediately)
     - Approve Only (publish later manually)
     - Reject (provide reason)

2. **Configure Limits**
   - Click Settings in Review Portal
   - Adjust "Max Pending Articles Per User"
   - Save settings

3. **Monitor Stats**
   - View dashboard with counts
   - Track active contributors
   - See approval/rejection rates

## Key Features

✅ **User Submission** - Users can write and submit articles
✅ **Admin Moderation** - All content reviewed before publishing
✅ **Spam Prevention** - Configurable submission limits
✅ **Draft System** - Save work without submitting
✅ **Analytics Dashboard** - Track article performance
✅ **Status Tracking** - Users see review status in real-time
✅ **Rejection Feedback** - Clear reasons for rejection
✅ **Rich Text Editor** - Full Tiptap editor with formatting
✅ **Image Upload** - Local image upload support
✅ **SEO Support** - Meta tags and descriptions
✅ **Responsive Design** - Works on all devices

## API Security

- All user article routes require authentication (`requireAuth`)
- Users can only access their own articles
- Admin review routes require admin role (`requireAdmin`)
- Deletion only allowed for drafts and rejected articles
- Published articles cannot be edited by users

## Future Enhancements

- Email notifications for review decisions
- Article revision history
- Co-authoring support
- Scheduled publishing
- A/B testing for titles/images
- Advanced analytics with charts
- Comment moderation
- Article categories by user level
- Featured author badges
- Contribution leaderboard

## Files Created/Modified

### New Files
- `server/database/migrations/add-article-review-system.sql`
- `server/data/siteSettings.js`
- `server/routes/userArticles.js`
- `server/routes/articleReview.js`
- `src/pages/UserArticleEditor.tsx`
- `src/pages/MyArticles.tsx`
- `src/pages/AdminReviewPortal.tsx`
- `src/extensions/FontSize.ts`

### Modified Files
- `server/app.js` - Added new routes
- `src/App.tsx` - Added new page routes
- `src/components/EditorToolbar.tsx` - Added font size, fixed link insertion, added image upload
- `src/pages/ArticleEditor.tsx` - Added TextStyle and FontSize extensions

## Testing Checklist

- [ ] Run database migration
- [ ] Test user article creation (draft)
- [ ] Test user article submission (pending)
- [ ] Test submission limit enforcement
- [ ] Test admin approval (immediate publish)
- [ ] Test admin approval (approve only)
- [ ] Test admin rejection with reason
- [ ] Test user viewing rejection reason
- [ ] Test editing rejected articles
- [ ] Test analytics display
- [ ] Test settings update
- [ ] Test deletion of drafts/rejected articles
- [ ] Test prevention of editing published articles

## Support

If you encounter issues:
1. Check database migration ran successfully
2. Verify authentication tokens are valid
3. Check console for API errors
4. Ensure user has correct role (user vs admin)
5. Verify submission limits are configured correctly
