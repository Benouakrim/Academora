# ⚠️ Known Issues - AcademOra

**Last Updated**: 2025-11-10  
**Purpose**: Track technical debt, bugs, and documented exceptions

> **For AI Agents**: Check this BEFORE claiming something is broken - it might be a known issue

---

## 📋 Issue Categories

1. **🐛 Bugs**: Confirmed issues that need fixing
2. **🔧 Technical Debt**: Code that works but should be refactored
3. **⚡ Performance**: Known performance bottlenecks
4. **♿ Accessibility**: A11y issues to address
5. **📱 Mobile**: Mobile-specific issues
6. **✅ Documented Exceptions**: Intentional deviations from standards

---

## ✅ Documented Exceptions (Not Bugs)

These violate normal rules but are INTENTIONAL and DOCUMENTED:

### EX-001: Dynamic Chart Colors (ComparisonCharts.tsx)
**Status**: ✅ ACCEPTED  
**Rule Violated**: NO inline styles policy  
**Location**: `src/components/ComparisonCharts.tsx`

**Why It Exists**:
- Recharts library requires dynamic color props
- Chart colors must respond to data dynamically
- No way to pre-define all possible color combinations in CSS

**Code Example**:
```tsx
<Bar dataKey="tuition" fill={universityColors[index]} />
<Line stroke={colorPalette[dataKey]} />
```

**Review Date**: Next major Recharts version upgrade

---

### EX-002: Slider Thumb Gradients (MatchingEnginePage.tsx)
**Status**: ✅ ACCEPTED  
**Rule Violated**: NO inline styles policy  
**Location**: `src/pages/MatchingEnginePage.tsx`

**Why It Exists**:
- Slider requires real-time gradient calculation based on thumb position
- Gradient changes as user drags slider
- CSS cannot dynamically calculate based on JavaScript state

**Code Example**:
```tsx
<input 
  type="range"
  style={{
    background: `linear-gradient(to right, 
      #3b82f6 0%, 
      #3b82f6 ${(value / max) * 100}%, 
      #e5e7eb ${(value / max) * 100}%, 
      #e5e7eb 100%)`
  }}
/>
```

**Possible Future Solution**: CSS custom properties + JavaScript updates  
**Review Date**: Q1 2026

---

### EX-003: Dynamic Animation Durations (AnimatedBackground.tsx)
**Status**: ✅ ACCEPTED  
**Rule Violated**: NO inline styles policy (technically uses inline styles internally)  
**Location**: `src/components/AnimatedBackground.tsx`

**Why It Exists**:
- Framer Motion requires style props for dynamic animations
- Duration is passed as a prop and must be dynamic
- This is the CORRECT way to use Framer Motion

**Code Example**:
```tsx
<motion.div
  animate={{
    x: [0, 100, 0],
    y: [0, 100, 0],
  }}
  transition={{ duration: props.duration }}
/>
```

**Justification**: This is framework requirement, not a violation  
**Review Date**: N/A (permanent exception)

---

## 🐛 Active Bugs

### BUG-001: Password Reset Email Delay
**Severity**: 🟡 Medium  
**Status**: 🔍 Investigating  
**Reported**: 2025-11-09  
**Affected**: `/auth/forgot-password` endpoint

**Description**:
Password reset emails sometimes take 2-5 minutes to arrive instead of immediately.

**Impact**:
- User frustration
- Support tickets
- Potential for users to request multiple resets

**Root Cause**:
Likely Mailjet API rate limiting or queue processing delay

**Workaround**:
Show message: "Email may take up to 5 minutes to arrive"

**Assigned To**: Backend team  
**Target Fix**: 2025-11-15

**Related Files**:
- `server/routes/auth.js`
- `server/services/email.js`

---

### BUG-002: Mobile Navigation Flicker
**Severity**: 🟢 Low  
**Status**: 📝 Confirmed  
**Reported**: 2025-11-08  
**Affected**: Mobile menu on all pages

**Description**:
Mobile navigation menu briefly flickers (shows/hides) on initial page load.

**Impact**:
- Minor UX annoyance
- No functional impact

**Root Cause**:
React hydration mismatch - server renders closed, client opens briefly before state initializes

**Workaround**:
None needed - cosmetic only

**Solution Ideas**:
1. Add loading state to prevent flash
2. Use CSS-only initial state
3. Improve hydration timing

**Priority**: P3  
**Target Fix**: Backlog

**Related Files**:
- `src/components/Navbar.tsx`

---

### BUG-003: Article Search Case Sensitivity
**Severity**: 🟡 Medium  
**Status**: 🔍 Investigating  
**Reported**: 2025-11-07  
**Affected**: `/blog` search functionality

**Description**:
Search for "College" returns different results than "college"

**Impact**:
- Users miss relevant articles
- Inconsistent search experience

**Root Cause**:
PostgreSQL full-text search not using case-insensitive comparison

**Workaround**:
Tell users to search in lowercase

**Solution**:
Update query to use `ILIKE` instead of `LIKE`, or configure ts_vector properly

**Priority**: P2  
**Target Fix**: 2025-11-12

**Related Files**:
- `server/data/articles.js` (line 45)
- `server/routes/blog.js`

---

## 🔧 Technical Debt

### DEBT-001: No Automated Testing
**Impact**: 🔴 High  
**Status**: 📋 Planned  
**Created**: 2025-11-01

**Description**:
Zero automated tests - all testing is manual

**Why It Exists**:
- MVP prioritization
- Small initial team
- Rapid development phase

**Impact**:
- High risk of regressions
- Slower development (manual testing)
- Difficult to refactor confidently

**Action Plan**:
1. Add Vitest for unit tests (Week of 2025-11-18)
2. Add React Testing Library (Week of 2025-11-25)
3. Add Playwright for E2E (Week of 2025-12-02)
4. Achieve 80% coverage (Q1 2026)

**Priority**: P1  
**Owner**: Engineering Lead

---

### DEBT-002: Inconsistent Error Handling
**Impact**: 🟡 Medium  
**Status**: 📋 Planned  
**Created**: 2025-11-05

**Description**:
Error handling varies across the codebase:
- Some routes use try-catch with proper messages
- Some routes just throw errors
- Frontend sometimes shows generic "Error occurred"
- No centralized error logging

**Examples**:
```javascript
// Good
try {
  const data = await service.getData();
  res.json(data);
} catch (error) {
  res.status(500).json({ error: error.message });
}

// Bad
const data = await service.getData(); // Might crash server
res.json(data);
```

**Solution**:
1. Create global error handler middleware
2. Define error response standard
3. Add error tracking (Sentry)
4. Update all routes to use standard

**Priority**: P2  
**Target**: 2025-11-20

**Related Files**:
- All route files in `server/routes/`
- Need: `server/middleware/errorHandler.js`

---

### DEBT-003: No Database Migrations System
**Impact**: 🟡 Medium  
**Status**: 📋 Planned  
**Created**: 2025-11-03

**Description**:
Database schema changes are done manually via SQL scripts with no versioning or rollback capability.

**Why It Exists**:
- Small team
- Infrequent schema changes
- Development phase

**Impact**:
- Risk of missing migrations in production
- No rollback capability
- Manual coordination required

**Solution**:
Implement migration system (Knex.js or Supabase Migrations)

**Priority**: P2  
**Target**: 2025-12-01

**Related Files**:
- `server/database/` (all SQL files)

---

### DEBT-004: Large Component Files
**Impact**: 🟢 Low  
**Status**: 📝 Acknowledged  
**Created**: 2025-11-06

**Description**:
Some components exceed 500 lines and handle too many responsibilities.

**Offenders**:
- `UniversityDetailPage.tsx` (800+ lines)
- `AdminDashboard.tsx` (650+ lines)
- `MatchingEnginePage.tsx` (700+ lines)

**Why It Exists**:
- Rapid development
- Feature completeness prioritized over structure

**Solution**:
Break into smaller components:
```
UniversityDetailPage/
├── index.tsx (orchestration)
├── UniversityHeader.tsx
├── UniversityStats.tsx
├── UniversityFinancials.tsx
└── UniversityReviews.tsx
```

**Priority**: P3  
**Target**: Backlog

---

## ⚡ Performance Issues

### PERF-001: No Image Optimization
**Impact**: 🟡 Medium  
**Status**: 📋 Planned  
**Reported**: 2025-11-08

**Description**:
Images are uploaded as-is with no:
- Resizing
- Compression
- WebP conversion
- Lazy loading

**Impact**:
- Slow page loads
- Excessive bandwidth usage
- Poor mobile experience

**Metrics**:
- Homepage: 3.2s load time (should be <1.5s)
- University detail: 5.1s load time (should be <2s)

**Solution**:
1. Add image processing pipeline (Sharp.js)
2. Generate multiple sizes (thumbnail, medium, large)
3. Serve WebP with fallback
4. Implement lazy loading

**Priority**: P1  
**Target**: 2025-11-15

**Related Files**:
- `server/routes/upload.js`
- Need: `server/services/imageProcessing.js`

---

### PERF-002: No API Response Caching
**Impact**: 🟡 Medium  
**Status**: 📋 Planned  
**Reported**: 2025-11-09

**Description**:
Every API request hits the database, even for frequently accessed data that rarely changes.

**Examples**:
- University list (changes once per day)
- Static pages (changes once per week)
- Article list (changes hourly)

**Impact**:
- Unnecessary database load
- Slower response times
- Higher hosting costs

**Solution**:
Implement Redis caching:
```javascript
// Cache university list for 1 hour
const cached = await redis.get('universities:all');
if (cached) return JSON.parse(cached);

const data = await db.query('...');
await redis.setex('universities:all', 3600, JSON.stringify(data));
return data;
```

**Priority**: P2  
**Target**: 2025-11-22

---

### PERF-003: Inefficient University Search
**Impact**: 🟡 Medium  
**Status**: 🔍 Investigating  
**Reported**: 2025-11-07

**Description**:
Search queries scan entire universities table without proper indexing strategy.

**Metrics**:
- Simple search: 150-300ms
- Search with filters: 500-800ms
- Should be: <50ms

**Solution**:
1. Add GIN indexes for full-text search
2. Implement Elasticsearch for advanced search
3. Use materialized views for common queries

**Priority**: P2  
**Target**: 2025-11-18

**Related Files**:
- `server/data/universities.js`
- `server/database/schema.sql` (need new indexes)

---

## ♿ Accessibility Issues

### A11Y-001: Missing ARIA Labels
**Impact**: 🟡 Medium  
**Status**: 📋 Planned  
**Reported**: 2025-11-09

**Description**:
Many interactive elements lack proper ARIA labels for screen readers.

**Examples**:
- Save buttons (just icon, no label)
- Filter dropdowns (no aria-label)
- Modal close buttons (no aria-label)

**Impact**:
- Screen reader users cannot navigate effectively
- WCAG 2.1 Level A violations

**Solution**:
Audit all components and add:
```tsx
<button aria-label="Save university">
  <HeartIcon />
</button>
```

**Priority**: P2  
**Target**: 2025-11-25

**Related Files**:
- `src/components/SaveButton.tsx`
- All modal components

---

### A11Y-002: Insufficient Color Contrast
**Impact**: 🟢 Low  
**Status**: 📋 Planned  
**Reported**: 2025-11-08

**Description**:
Some text/background combinations fail WCAG AA contrast requirements.

**Examples**:
- Gray-500 text on gray-100 background (ratio 2.8:1, needs 4.5:1)
- Primary-400 text on white (ratio 3.2:1, needs 4.5:1)

**Solution**:
Update design tokens to ensure minimum 4.5:1 contrast ratio

**Priority**: P3  
**Target**: Backlog

**Related Files**:
- `src/styles/tokens/colors.css`

---

## 📱 Mobile Issues

### MOBILE-001: Comparison Table Overflow
**Impact**: 🟡 Medium  
**Status**: 📋 Planned  
**Reported**: 2025-11-10

**Description**:
University comparison table doesn't scroll horizontally on mobile, cutting off content.

**Impact**:
- Users cannot see all comparison data
- Poor mobile UX

**Solution**:
Wrap table in scrollable container:
```tsx
<div className="overflow-x-auto -mx-4 px-4">
  <table className="min-w-full">
    {/* ... */}
  </table>
</div>
```

**Priority**: P2  
**Target**: 2025-11-13

**Related Files**:
- `src/pages/UniversityComparePage.tsx`

---

### MOBILE-002: Modal Touch Scroll Issues
**Impact**: 🟢 Low  
**Status**: 📝 Confirmed  
**Reported**: 2025-11-09

**Description**:
On iOS Safari, scrolling inside modals sometimes scrolls the page behind the modal.

**Impact**:
- Minor UX annoyance
- Confusing navigation

**Root Cause**:
Missing `touch-action: none` on modal backdrop

**Solution**:
```tsx
<div 
  className="fixed inset-0" 
  style={{ touchAction: 'none' }}
>
  <div className="overflow-y-auto">
    {content}
  </div>
</div>
```

**Priority**: P3  
**Target**: Backlog

---

## 🔍 Investigation Needed

### INV-001: Intermittent 500 Errors on Login
**Status**: 🔍 Under Investigation  
**Reported**: 2025-11-10  
**Frequency**: ~2% of login attempts

**Description**:
Occasional 500 errors on login with no clear pattern.

**What We Know**:
- Only happens on production
- Cannot reproduce in development
- No error logs in server console
- Supabase Auth might be timing out

**Next Steps**:
1. Add detailed logging to auth middleware
2. Check Supabase connection pooling
3. Monitor for 1 week
4. Re-evaluate

**Assigned To**: Backend team

---

## 📊 Statistics

**Current Status** (2025-11-10):
- Total Known Issues: 15
- 🔴 High Priority: 2
- 🟡 Medium Priority: 8
- 🟢 Low Priority: 5
- ✅ Documented Exceptions: 3

**Resolution Timeline**:
- This Week: 2 issues
- Next Week: 4 issues
- This Month: 10 issues
- Backlog: 5 issues

---

## 🔄 Recently Resolved

### ~~BUG-999: Inline Styles Everywhere~~ ✅ FIXED
**Fixed**: 2025-11-10  
**Solution**: Created AnimatedBackground and ProgressBar components  
**Result**: 90% reduction in inline styles (27/30 eliminated)

### ~~BUG-998: BlogPage Border Styling~~ ✅ FIXED
**Fixed**: 2025-11-10  
**Solution**: Removed outdated border styles  
**Result**: Clean, consistent design

---

## 📝 Reporting New Issues

**Use this template**:

```markdown
### BUG-XXX: [Short Title]
**Severity**: 🔴/🟡/🟢  
**Status**: 📝 New / 🔍 Investigating / 📋 Planned / ✅ Fixed  
**Reported**: YYYY-MM-DD  
**Affected**: [Component/Page/Feature]

**Description**:
What's wrong?

**Impact**:
How does this affect users?

**Root Cause**:
Why is this happening? (if known)

**Workaround**:
Temporary solution (if any)

**Solution**:
How to fix permanently

**Priority**: P1/P2/P3  
**Target Fix**: YYYY-MM-DD

**Related Files**:
- file1.tsx
- file2.ts
```

---

## 🔗 Related Documentation

- **Recent changes**: See CHANGELOG.md
- **Architecture decisions**: See ARCHITECTURE.md
- **Code conventions**: See PHILOSOPHY.md
- **File locations**: See FILE_REGISTRY.md

---

**Remember**: Update this file when:
- ✅ Discovering new bugs
- ✅ Creating documented exceptions
- ✅ Resolving existing issues
- ✅ Changing issue priority
- ✅ Adding workarounds

**Don't let issues hide in Slack or email - document them here!**
