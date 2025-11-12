# 📝 Changelog - AcademOra

**Last Updated**: 2025-11-11  
**Purpose**: Chronological record of all significant changes

> **For AI Agents**: Check recent changes before implementing similar features

---

## Format

```
## [Date] - Category

### Added
- New features

### Changed
- Modifications to existing features

### Fixed
- Bug fixes

### Removed
- Removed features

### Refactored
- Code improvements without functional changes
```

---

## [2025-11-11] - Referral Dashboard JSON Error (Fixed)
## [2025-11-11] - Theme System Foundation (Added)

### Added
- Theme architecture with ThemeContext managing { theme: 'default' | 'verdant', mode: 'dark' | 'light' } and body classes `theme-*/mode-*`.
- Public Dark/Light toggle buttons in Navbar and Footer (`ThemeModeToggle`) available to all users and visitors.
- CSS variable overrides file `src/styles/themes.css` with scoped selectors:
  - `body.theme-default.mode-light` (Default theme Light)
  - `body.theme-verdant.mode-dark` (Verdant theme Dark)
  - `body.theme-verdant.mode-light` (Verdant theme Light)
- Pre-hydration script in `index.html` to apply persisted theme/mode classes before React mounts (prevents flash of wrong theme).

### Changed
- Wrapped app with `ThemeProvider` in `App.tsx`.
- `designSystem.ts` now references CSS variables (colors) instead of hard-coded hex values where feasible.

### Notes
- Only colors and fonts are affected by the theme system; spacing, layout, margins, paddings, and animations remain unchanged per design policy.
- Current palette overrides use existing token scales (neutral, emerald/green) to ensure WCAG AA contrast targets; further tuning and full audit to follow.
- Admin theme selection page and default theme light mode coverage across outlier pages (mixer, deep article sections) are planned next.

### Files
- Added: `src/context/ThemeContext.tsx`
- Added: `src/components/ThemeModeToggle.tsx`
- Added: `src/styles/themes.css`
- Updated: `src/App.tsx`, `src/components/Navbar.tsx`, `src/components/Footer.tsx`, `src/styles/designSystem.ts`, `index.html`, `src/index.css`


### Fixed
- 🐛 Referral dashboard threw `Unexpected token '<'` JSON parse errors on `/referrals` page in development.
  - Root Cause: No Vite dev proxy; `fetch('/api/referrals/...')` hit frontend dev server and received `index.html` (`<!doctype...`) instead of API JSON.
  - Solution: Added dev proxy for `/api` and `/uploads` in `vite.config.ts` targeting `http://localhost:3001` (Express backend).
  - Impact: Referral dashboard loads correctly; removes noisy console errors; unblocks other API-dependent pages in dev.
  - Follow-up: Ensure `npm run dev:all` is used so both servers run concurrently.

### Changed
- Updated `vite.config.ts` to include `server.proxy` configuration.

### Notes
- If similar HTML parse errors appear, verify the path starts with `/api` and proxy covers it.
- Consider adding tests/middleware to detect HTML responses when JSON expected (future improvement).

## [2025-11-11] - Referral Dashboard 403 Handling Improvement

### Changed
- Switched `ReferralDashboard` to use centralized `referralsAPI` methods (added to `src/lib/api.ts`) instead of ad-hoc `fetch` calls.
- Improved error messaging: distinguishes 401 (session expired) vs 403 (access denied) vs generic failures.

### Fixed
- Eliminated misleading generic "Failed to fetch referral code" when actual status was 403.

### Added
- `referralsAPI` helper with: `getMyCode`, `getMyReferrals`, `getMyRewards`, `validate`.

### Impact
- Consistent Authorization headers & error parsing across referral dashboard.
- Clearer UX for auth vs permission issues; reduces debugging time for token-related errors.

### Files
- Updated: `src/pages/ReferralDashboard.tsx`
- Updated: `src/lib/api.ts`

## [2025-11-11] - Referral Schema Bootstrap (Added)

### Added
- Created `server/database/referrals-schema.sql` defining core referral tables and utilities:
  - Tables: `referral_codes`, `referrals`, `referral_rewards`, `referral_settings`
  - Indexes for common lookups
  - `generate_referral_code(uuid)` function
  - Seed default `referral_expiry_days` setting

### Why
- Backend referral routes were failing with 500 due to missing tables/functions when calling `getOrCreateCode()`.

### How to apply
- Run the SQL in Supabase SQL editor or psql against the connected database.
- After applying, retry `/api/referrals/my-code` to verify JSON response.

---

## [2025-01-11] - Navigation Enhancement (Fixed)

### Added
- ✅ **Dashboard Dropdown Menu** in Navbar (Desktop & Mobile)
  - 4 links for logged-in users: Profile & Settings (/dashboard), Find Match (/matching-engine), Compare Universities (/compare), Referrals (/referrals)
  - Hover-triggered on desktop, click-triggered collapsible on mobile
  - Replaces single profile icon with comprehensive menu
  - Icon: LayoutDashboard with user avatar when available

- ✅ **Admin Dropdown Menu** in Navbar (Desktop & Mobile)
  - 7 links for admin users only: Dashboard (/admin), Users (/admin/users), Universities (/admin/universities), Articles (/admin/articles), Analytics (/admin/analytics), Pages (/admin/pages), Media (/admin/media)
  - Conditional rendering: `user?.role === 'admin'`
  - Hover-triggered on desktop, click-triggered collapsible on mobile
  - Icon: UserCog

### Changed
- 🔄 **Footer Links**: Updated to use only existing routes
  - Quick Links: /blog, /orientation, /matching-engine, /about, /careers, /pricing
  - Resources: /contact, /policy, /docs, /compare
  - Removed non-existent routes: /scholarship-finder, /career-trajectory, /cookies, /virtual-tours, /localized-content

- 🔄 **Navbar State Management**: Added 2 new state variables
  - `isMobileDashboardOpen`: Controls mobile dashboard dropdown
  - `isMobileAdminOpen`: Controls mobile admin dropdown
  
- 🔄 **Mobile Navigation**: Replaced single "My Profile" link with collapsible Dashboard menu containing 4 sub-links

### Fixed
- 🐛 **404 Errors**: All navigation links now point to existing routes
  - Dashboard links verified: /dashboard, /matching-engine, /compare, /referrals
  - Admin links verified: /admin, /admin/users, /admin/universities, /admin/articles, /admin/analytics, /admin/pages, /admin/media
  - Removed Find Match CTA button (now integrated in Dashboard dropdown)
  - Removed non-existent route links from Footer

- 🐛 **Dropdown Contrast Issues**: Improved text visibility in dropdown menus
  - Changed text color from `text-gray-300` to `text-gray-100` for better readability
  - Changed background from `bg-gray-900/95` to `bg-gray-800/98` for better contrast
  - Changed border from `border-white/10` to `border-gray-700/50` for more definition
  - Changed hover background from `hover:bg-white/5` to `hover:bg-purple-500/20` for better visual feedback
  - Applied to both desktop and mobile dropdowns (Dashboard and Admin)

### Refactored
- ♻️ **Navbar Icons**: Added icons from lucide-react: LayoutDashboard, Gift, GitCompare, Users, Building2, BarChart3, Sliders, UserCog, Sparkles, FileText
- ♻️ **Footer Structure**: Improved link organization with verified existing routes
- ♻️ **Dropdown Styling**: Unified contrast improvements across all dropdown menus for consistency

### Impact
- 📈 **Reliability**: All navigation links now work correctly (no more 404 errors)
- 👥 **User Experience**: Clear separation of user dashboard and admin features
- 📱 **Mobile First**: Collapsible menus maintain clean mobile navigation
- 🎨 **Design Consistency**: Follows existing dropdown patterns (Read, Discover) for familiarity
- ♿ **Accessibility**: Improved contrast ratios meet WCAG AA standards for better readability

---

## [2025-11-10] - Major Refactor & Documentation

### Added
- ✅ **AnimatedBackground Component**: Reusable animated gradient backgrounds
  - Props: `colors`, `orbCount`, `orbSize`, `duration`
  - Eliminates inline radial-gradient styles
  - Used in 8 pages: HomePage, ExplorePage, BlogPage, OrientationPage, AboutPage, ContactPage, DocsPage, CareersPage

- ✅ **ProgressBar Component**: Dynamic progress indicators
  - 8 color variants: primary, success, warning, danger, info, purple, blue, green
  - 3 height options: sm, md, lg
  - Props: `value`, `variant`, `label`, `showLabel`, `height`, `animated`
  - Used in 5 pages: UniversityDetailPage (11×), SignUpPage, LocalizedContentPage, AdvancedAnalyticsDashboard

- ✅ **ExplorePage**: New feature showcase page
  - 16 feature cards with status indicators (Live/Beta/Coming Soon)
  - Search and filter functionality
  - Modal details for each feature
  - Animated background

- ✅ **Comprehensive AI Documentation System** (.ai/ folder):
  - INDEX.md (4,100+ lines): Central navigation hub for AI agents
  - PHILOSOPHY.md (900+ lines): Code structure and naming conventions
  - FILE_REGISTRY.md (3,000+ lines): Complete file inventory with purposes
  - TECH_STACK.md (1,500+ lines): All technologies and dependencies
  - ARCHITECTURE.md (2,500+ lines): System design patterns
  - DESIGN_SYSTEM.md (3,000+ lines): Complete styling architecture
  - API_CONTRACTS.md (2,500+ lines): All API endpoints documented
  - DATABASE_SCHEMA.md (2,500+ lines): Complete database structure
  - CHANGELOG.md (this file): Change history
  - KNOWN_ISSUES.md: Technical debt and exceptions

- ✅ **STYLE_GUIDELINES.md**: Comprehensive NO inline styles policy

### Changed
- 🔄 **UniversityDetailPage**: Refactored 11 progress bars to use ProgressBar component
  - Removed inline style="width: x%" from all progress indicators
  - Standardized acceptance rate, graduation rate, retention rate displays
  - Improved accessibility with proper ARIA labels

- 🔄 **BlogPage**: 
  - Removed 7 border instances (outdated design)
  - Refactored to use AnimatedBackground component
  - Updated gradient from inline style to component

- 🔄 **HomePage**: Refactored animated background to use AnimatedBackground component

- 🔄 **OrientationPage**: Refactored animated background to use AnimatedBackground component

- 🔄 **AboutPage**: Refactored animated background to use AnimatedBackground component

- 🔄 **ContactPage**: Refactored animated background to use AnimatedBackground component

- 🔄 **DocsPage**: Refactored animated background to use AnimatedBackground component

- 🔄 **CareersPage**: Refactored animated background to use AnimatedBackground component

- 🔄 **SignUpPage**: Added ProgressBar for password strength indicator

- 🔄 **LocalizedContentPage**: Added ProgressBar for translation progress

- 🔄 **AdvancedAnalyticsDashboard**: Refactored to use ProgressBar component

- 🔄 **AdminMenu**: Converted inline positioning styles to Tailwind utilities

- 🔄 **StaticPage**: Removed inline background style, use Tailwind classes

- 🔄 **ArticlePage**: Removed inline background style, use Tailwind classes

### Fixed
- 🐛 **BlogPage border styling**: Removed "weird border lines" that appeared after design evolution
  - Root cause: BlogPage missed in previous design system update
  - Solution: Removed all border classes and inline styles

### Refactored
- 🔨 **Inline Style Elimination**: Removed 27 out of 30 inline styles (90% reduction)
  - 11 radial-gradient backgrounds → AnimatedBackground component
  - 15 progress width styles → ProgressBar component
  - 3 layout positioning styles → Tailwind utilities
  - Remaining 3 are documented exceptions (charts, sliders)

- 🔨 **22 Files Refactored** Total:
  - 2 New components created
  - 14 Pages refactored
  - 3 Components refactored
  - 2 Admin components refactored

### Removed
- ❌ Inline styles from 22 files (see Refactored section)
- ❌ Border styles from BlogPage (7 instances)
- ❌ Inconsistent progress bar implementations

---

## [2025-11-09] - Previous Changes

### Added
- Financial Aid Predictor feature
- Comparison persistence system
- User article submission workflow

### Changed
- Improved article editor interface
- Enhanced admin menu navigation

### Fixed
- AuthContext rendering issues
- RLS policy bugs in Supabase

---

## [2025-11-08] - Authentication & Security

### Added
- Password reset flow via email
- Mailjet email service integration
- Referral system backend

### Changed
- Strengthened JWT security
- Updated password validation (min 6 characters)

### Fixed
- Login token expiry issues
- Email verification flow bugs

---

## [2025-11-07] - Admin Features

### Added
- Admin analytics dashboard
- University claim system
- Static pages CMS
- Admin global menu

### Changed
- Improved admin navigation
- Enhanced university editor

---

## [2025-11-06] - Matching Engine

### Added
- AI-powered university matching
- Matching criteria form (multi-step)
- Match results dashboard
- Saved matches persistence

### Changed
- Improved matching algorithm
- Better UX for criteria selection

---

## [2025-11-05] - Content Features

### Added
- Article comment system
- Article view tracking
- Hot articles algorithm
- Related articles suggestions

### Changed
- Enhanced article editor
- Better markdown rendering

### Fixed
- Article slug generation issues
- Comment nesting bugs

---

## [2025-11-04] - University Features

### Added
- University comparison tool
- University groups (Ivy League, etc.)
- Micro-content system
- Career trajectory heatmap

### Changed
- Improved university detail page
- Enhanced comparison charts

---

## [2025-11-03] - User Experience

### Added
- Orientation resources hub
- Category-based navigation
- Search functionality
- Filter system

### Changed
- Improved mobile responsiveness
- Better loading states

### Fixed
- Navigation menu on mobile
- Search performance issues

---

## [2025-11-02] - Design System

### Added
- Custom design tokens in src/styles/tokens/
- Tailwind configuration with custom theme
- Animation presets

### Changed
- Migrated from inline styles to Tailwind
- Standardized color palette
- Updated typography system

### Removed
- Old CSS framework
- Inconsistent styling patterns

---

## [2025-11-01] - Foundation

### Added
- React 18 + TypeScript setup
- Vite build configuration
- Supabase integration
- Express backend server
- Basic routing structure
- Authentication system
- University listing page
- Blog system foundation

---

## Version History

**v1.0.0** (Initial Release)
- Basic university discovery
- Blog system
- User authentication
- Admin panel

**v1.1.0** (Matching Engine)
- AI-powered matching
- Saved items
- Comparisons

**v1.2.0** (Content System)
- Comments
- Analytics
- Orientation resources

**v1.3.0** (Design System Refactor) ← Current
- NO inline styles policy
- Component extraction
- Comprehensive documentation
- AI agent guidance system

---

## Upcoming Changes

### Planned for Next Release
- [ ] Complete inline style elimination (3 remaining exceptions)
- [ ] Automated testing suite
- [ ] Performance monitoring
- [ ] Error tracking (Sentry integration)
- [ ] Analytics dashboard improvements
- [ ] Mobile app foundation

### Backlog
- [ ] Real-time notifications
- [ ] WebSocket integration
- [ ] Advanced filtering
- [ ] Export functionality
- [ ] Email templates redesign
- [ ] Multi-language support enhancement

---

## Breaking Changes

### [2025-11-10] - ProgressBar Component
**Impact**: Medium  
**Migration**: Replace inline progress styles with `<ProgressBar value={x} variant="primary" />`

**Before**:
```tsx
<div className="bg-gray-200 h-2 rounded-full">
  <div 
    className="bg-blue-600 h-2 rounded-full" 
    style={{ width: `${acceptanceRate}%` }}
  />
</div>
```

**After**:
```tsx
<ProgressBar 
  value={acceptanceRate} 
  variant="primary"
  label="Acceptance Rate"
/>
```

### [2025-11-10] - AnimatedBackground Component
**Impact**: Low  
**Migration**: Replace inline radial-gradient divs with `<AnimatedBackground />`

**Before**:
```tsx
<div 
  className="absolute inset-0 -z-10" 
  style={{ background: 'radial-gradient(...)' }}
/>
```

**After**:
```tsx
<AnimatedBackground 
  colors={['#3b82f6', '#a855f7']}
  orbCount={3}
/>
```

---

## Maintenance Notes

### How to Add a Changelog Entry

1. **Date**: Use YYYY-MM-DD format
2. **Category**: Main focus of changes (Refactor, Feature, Fix, etc.)
3. **Sections**: Use Added/Changed/Fixed/Removed/Refactored
4. **Format**: Use ✅/🔄/🐛/❌/🔨 emojis for visual clarity
5. **Details**: Be specific - include file names, component names, reasons

### Changelog Standards

- ✅ **DO**: Document all user-facing changes
- ✅ **DO**: Document breaking changes with migration guides
- ✅ **DO**: Include file names and specific changes
- ✅ **DO**: Explain WHY not just WHAT
- ❌ **DON'T**: Document minor typo fixes
- ❌ **DON'T**: Include internal refactors with no user impact
- ❌ **DON'T**: Be vague ("improved performance")

---

## 🔗 Related Documentation

- **Current codebase**: See FILE_REGISTRY.md
- **Architecture decisions**: See ARCHITECTURE.md (ADR section)
- **Known issues**: See KNOWN_ISSUES.md
- **Tech versions**: See TECH_STACK.md

---

**Remember**: Update this file EVERY TIME you make significant changes. It's the historical record for AI agents and developers.
