# 📁 File Registry - AcademOra

**Last Updated**: 2025-11-10  
**Purpose**: Complete inventory of codebase files with their purposes and relationships

> **Critical**: Check this file BEFORE creating new files to avoid duplication

---

## 📖 How to Use This Registry

**Before creating ANY new file:**
1. Search this document for similar functionality
2. Check if the file already exists
3. Verify you're following naming conventions
4. Update this registry after creating new files

**Search Tips:**
- `Ctrl+F` to search by feature name
- Look in the appropriate section (Pages, Components, etc.)
- Check "Related Files" to understand dependencies

---

## 🗂️ Directory Structure Overview

```
academora/
├── src/
│   ├── components/       # 50+ reusable UI components
│   ├── pages/           # 60+ route pages
│   ├── hooks/           # 10+ custom React hooks
│   ├── lib/             # Services, utilities, API clients
│   ├── context/         # React contexts (Auth, Access Control)
│   ├── styles/          # Design system tokens
│   ├── types/           # TypeScript definitions
│   └── devtools/        # Development utilities
│
├── server/
│   ├── routes/          # Express API routes
│   ├── services/        # Business logic
│   ├── data/            # Data access layer
│   ├── middleware/      # Express middleware
│   └── validation/      # Input validation
│
├── .ai/                 # AI agent documentation (THIS SYSTEM)
├── docs/                # Feature documentation
└── public/              # Static assets
```

---

## 📄 PAGES (src/pages/)

### Core Pages

#### **HomePage.tsx**
- **Purpose**: Landing page with hero, features, testimonials
- **Route**: `/`
- **Features**: Animated backgrounds, video showcase, feature grid
- **Components Used**: AnimatedBackground, FeatureModal
- **Status**: ✅ Production
- **Last Modified**: 2025-11-10 (Refactored animated background)

#### **ExplorePage.tsx**
- **Purpose**: Feature showcase with status indicators (Live/Beta/Coming Soon)
- **Route**: `/explore`
- **Features**: 16 feature cards with filtering, search, modal details
- **Components Used**: AnimatedBackground
- **Status**: ✅ Production
- **Created**: 2025-11-10

#### **AboutPage.tsx**
- **Purpose**: Company mission, vision, team information
- **Route**: `/about`
- **Features**: Animated background, mission cards
- **Status**: ✅ Production
- **Last Modified**: 2025-11-10 (Refactored animated background)

#### **ContactPage.tsx**
- **Purpose**: Contact form and company information
- **Route**: `/contact`
- **Features**: Form submission, contact details
- **Status**: ✅ Production
- **Last Modified**: 2025-11-10 (Refactored animated background)

#### **CareersPage.tsx**
- **Purpose**: Job opportunities and team roles
- **Route**: `/careers`
- **Features**: Role cards with monetization details
- **Status**: ✅ Production
- **Last Modified**: 2025-11-10 (Refactored animated background)

#### **PricingPage.tsx**
- **Purpose**: Subscription plans and pricing
- **Route**: `/pricing`
- **Features**: Plan comparison, feature matrix
- **Status**: ✅ Production

#### **DocsPage.tsx**
- **Purpose**: Platform documentation hub
- **Route**: `/docs`
- **Features**: Searchable documentation, categories
- **Status**: ✅ Production
- **Last Modified**: 2025-11-10 (Refactored animated background)

### Authentication Pages

#### **LoginPage.tsx**
- **Purpose**: User authentication
- **Route**: `/login`
- **Features**: Email/password login, social auth
- **Related**: AuthContext, useAuth hook
- **Status**: ✅ Production

#### **SignUpPage.tsx**
- **Purpose**: New user registration
- **Route**: `/signup`
- **Features**: Multi-step signup, account type selection, password strength indicator
- **Components Used**: ProgressBar (password strength)
- **Status**: ✅ Production
- **Last Modified**: 2025-11-10 (Added ProgressBar component)

#### **RegisterPage.tsx**
- **Purpose**: Alternative registration flow
- **Route**: `/register`
- **Status**: ✅ Production

#### **PasswordResetRequest.tsx**
- **Purpose**: Request password reset email
- **Route**: `/password-reset-request`
- **Status**: ✅ Production

#### **PasswordReset.tsx**
- **Purpose**: Reset password with token
- **Route**: `/password-reset/:token`
- **Status**: ✅ Production

### University Pages

#### **UniversityDetailPage.tsx**
- **Purpose**: Comprehensive university information
- **Route**: `/universities/:id`
- **Features**: 
  - Acceptance rate, financial aid, student body stats
  - Graduation rates, employment data
  - Reviews, comparisons, micro-content
  - Financial aid predictor, career trajectory
- **Components Used**: ProgressBar (11 instances), FinancialAidPredictor, CareerTrajectoryHeatmap
- **Status**: ✅ Production
- **Last Modified**: 2025-11-10 (Refactored to use ProgressBar component)

#### **UniversityComparePage.tsx**
- **Purpose**: Side-by-side university comparison
- **Route**: `/compare`
- **Features**: Multi-university comparison, charts, export
- **Components Used**: ComparisonCharts
- **Status**: ✅ Production

#### **UniversityClaimPage.tsx**
- **Purpose**: University representatives claim ownership
- **Route**: `/universities/:id/claim`
- **Features**: Verification process, claim submission
- **Status**: ✅ Production

#### **UniversityGroupDetailPage.tsx**
- **Purpose**: University group/network information
- **Route**: `/groups/:id`
- **Features**: Group member universities, shared characteristics
- **Status**: ✅ Production

### Matching & Discovery Pages

#### **MatchingEnginePage.tsx**
- **Purpose**: AI-powered university matching wizard
- **Route**: `/matching`
- **Features**: Multi-step form, criteria selection, AI matching
- **Status**: ✅ Production
- **Note**: Contains dynamic slider gradients (documented exception)

#### **MatchingDashboardPage.tsx**
- **Purpose**: View and manage matching results
- **Route**: `/matching/dashboard`
- **Features**: Match cards, filters, saved comparisons
- **Status**: ✅ Production
- **Last Modified**: 2025-11-10 (Refactored loading bar)

#### **OrientationPage.tsx**
- **Purpose**: Academic orientation hub
- **Route**: `/orientation`
- **Features**: Category navigation, animated backgrounds
- **Components Used**: AnimatedBackground
- **Status**: ✅ Production
- **Last Modified**: 2025-11-10 (Refactored animated background)

#### **OrientationCategoryPage.tsx**
- **Purpose**: Orientation content by category
- **Route**: `/orientation/category/:slug`
- **Status**: ✅ Production

#### **OrientationDetailPage.tsx**
- **Purpose**: Individual orientation article
- **Route**: `/orientation/:slug`
- **Status**: ✅ Production

#### **CategoryPage.tsx**
- **Purpose**: Browse content by category
- **Route**: `/category/:slug`
- **Status**: ✅ Production

### Blog & Content Pages

#### **BlogPage.tsx**
- **Purpose**: Article listing and filtering
- **Route**: `/blog`
- **Features**: Search, category filters, pagination
- **Components Used**: AnimatedBackground
- **Status**: ✅ Production
- **Last Modified**: 2025-11-10 (Refactored animated background, removed borders)

#### **ArticlePage.tsx**
- **Purpose**: Individual article display
- **Route**: `/blog/:slug`
- **Features**: Markdown rendering, comments, views tracking
- **Status**: ✅ Production
- **Last Modified**: 2025-11-10 (Removed inline background style)

#### **ArticleEditor.tsx**
- **Purpose**: Admin article creation/editing
- **Route**: `/admin/articles/edit/:id`
- **Features**: Rich text editor, SEO fields, media upload
- **Status**: ✅ Production

#### **UserArticleEditor.tsx**
- **Purpose**: User-submitted article creation
- **Route**: `/my-articles/new`
- **Features**: Simplified editor, submission workflow
- **Status**: ✅ Production

#### **MyArticles.tsx**
- **Purpose**: User's article management dashboard
- **Route**: `/my-articles`
- **Features**: Draft/published articles, edit/delete
- **Status**: ✅ Production

### Dashboard & User Pages

#### **DashboardPage.tsx**
- **Purpose**: User personal dashboard
- **Route**: `/dashboard`
- **Features**: Overview, saved items, recent activity
- **Status**: ✅ Production

#### **PublicUserProfilePage.tsx**
- **Purpose**: Public-facing user profile
- **Route**: `/users/:username`
- **Features**: Bio, articles, reviews, activity
- **Status**: ✅ Production

#### **ReferralDashboard.tsx**
- **Purpose**: User referral program management
- **Route**: `/referrals`
- **Features**: Referral links, earnings, statistics
- **Status**: ✅ Production

### Advanced Features

#### **FutureMixerDashboard.tsx**
- **Purpose**: Career and academic scenario planning
- **Route**: `/future-mixer`
- **Features**: Scenario creation, trajectory planning
- **Components Used**: ScenarioMixer
- **Status**: ✅ Production

#### **LocalizedContentPage.tsx**
- **Purpose**: Manage localized/translated content
- **Route**: `/admin/localized-content`
- **Features**: Translation management, progress tracking
- **Components Used**: ProgressBar
- **Status**: ✅ Production
- **Last Modified**: 2025-11-10 (Added ProgressBar component)

#### **AdvancedAnalyticsPage.tsx**
- **Purpose**: Platform analytics dashboard
- **Route**: `/admin/analytics`
- **Features**: User analytics, engagement metrics
- **Components Used**: AdvancedAnalyticsDashboard (with ProgressBar)
- **Status**: ✅ Production
- **Last Modified**: 2025-11-10 (Added ProgressBar component)

### Admin Pages (src/pages/admin/)

#### **AdminDashboard.tsx**
- **Purpose**: Admin control panel
- **Route**: `/admin`
- **Features**: Statistics, quick actions, system health
- **Status**: ✅ Production

#### **AdminUniversitiesPage.tsx**
- **Purpose**: University management
- **Route**: `/admin/universities`
- **Features**: CRUD operations, bulk actions
- **Status**: ✅ Production

#### **UniversityEditor.tsx**
- **Purpose**: Create/edit university details
- **Route**: `/admin/universities/edit/:id`
- **Status**: ✅ Production

#### **AdminUsersPage.tsx**
- **Purpose**: User management
- **Route**: `/admin/users`
- **Features**: User list, role management, actions
- **Status**: ✅ Production

#### **AdminGroupsPage.tsx**
- **Purpose**: University group management
- **Route**: `/admin/groups`
- **Status**: ✅ Production

#### **GroupEditor.tsx**
- **Purpose**: Create/edit university groups
- **Route**: `/admin/groups/edit/:id`
- **Status**: ✅ Production

#### **ArticlesList.tsx**
- **Purpose**: Admin article management
- **Route**: `/admin/articles`
- **Status**: ✅ Production

#### **ArticleAnalyticsPage.tsx**
- **Purpose**: Article performance metrics
- **Route**: `/admin/articles/analytics`
- **Status**: ✅ Production

#### **CategoriesPage.tsx**
- **Purpose**: Content category management
- **Route**: `/admin/categories`
- **Status**: ✅ Production

#### **TagsPage.tsx**
- **Purpose**: Tag management
- **Route**: `/admin/tags`
- **Status**: ✅ Production

#### **TaxonomiesPage.tsx**
- **Purpose**: Taxonomy system management
- **Route**: `/admin/taxonomies`
- **Status**: ✅ Production

#### **AdminClaimsPage.tsx**
- **Purpose**: University claim requests management
- **Route**: `/admin/claims`
- **Status**: ✅ Production

#### **AdminReferrals.tsx**
- **Purpose**: Referral program administration
- **Route**: `/admin/referrals`
- **Status**: ✅ Production

#### **PlansManagementPage.tsx**
- **Purpose**: Subscription plan configuration
- **Route**: `/admin/plans`
- **Status**: ✅ Production

#### **FeatureUsagePage.tsx**
- **Purpose**: Feature usage analytics
- **Route**: `/admin/feature-usage`
- **Status**: ✅ Production

#### **AdminReviewPortal.tsx**
- **Purpose**: Review content submissions
- **Route**: `/admin/review-portal`
- **Status**: ✅ Production

#### **PagesManagementPage.tsx**
- **Purpose**: Static page management
- **Route**: `/admin/pages`
- **Status**: ✅ Production

#### **UnifiedPageEditor.tsx**
- **Purpose**: Universal page content editor
- **Route**: `/admin/pages/edit/:id`
- **Status**: ✅ Production

#### **AdminAboutPage.tsx**
- **Purpose**: Edit About page content
- **Route**: `/admin/about`
- **Status**: ✅ Production

#### **AdminContactPage.tsx**
- **Purpose**: Edit Contact page content
- **Route**: `/admin/contact`
- **Status**: ✅ Production

#### **AdminCookiePage.tsx**
- **Purpose**: Cookie consent management
- **Route**: `/admin/cookies`
- **Status**: ✅ Production

#### **AdminMediaPage.tsx**
- **Purpose**: Media library management
- **Route**: `/admin/media`
- **Status**: ✅ Production

### Utility Pages

#### **StaticPage.tsx**
- **Purpose**: Render dynamic static content
- **Route**: `/pages/:slug`
- **Status**: ✅ Production
- **Last Modified**: 2025-11-10 (Converted inline styles to Tailwind)

#### **PolicyPage.tsx**
- **Purpose**: Terms, Privacy Policy display
- **Route**: `/policy/:type`
- **Status**: ✅ Production

#### **NotFound.tsx**
- **Purpose**: 404 error page
- **Route**: `*` (catch-all)
- **Status**: ✅ Production

#### **DevDashboard.tsx**
- **Purpose**: Development tools and debugging
- **Route**: `/dev`
- **Status**: 🛠️ Development only

#### **DocumentationPage.tsx**
- **Purpose**: Technical documentation
- **Route**: `/documentation`
- **Status**: ✅ Production

#### **EcosystemDocsPage.tsx**
- **Purpose**: Ecosystem documentation
- **Route**: `/ecosystem-docs`
- **Status**: ✅ Production

#### **JoinPage.tsx**
- **Purpose**: Community join/signup
- **Route**: `/join`
- **Status**: ✅ Production

---

## 🧩 COMPONENTS (src/components/)

### Design System Components

#### **AnimatedBackground.tsx** ⭐ NEW
- **Purpose**: Reusable animated radial gradient backgrounds
- **Props**: `colors`, `orbCount`, `orbSize`, `duration`
- **Used In**: HomePage, ExplorePage, BlogPage, OrientationPage, AboutPage, ContactPage, DocsPage, CareersPage
- **Created**: 2025-11-10
- **Status**: ✅ Production

#### **ProgressBar.tsx** ⭐ NEW
- **Purpose**: Dynamic progress indicators
- **Props**: `value`, `variant`, `label`, `showLabel`, `height`, `animated`
- **Variants**: primary, success, warning, danger, info, purple, blue, green
- **Used In**: UniversityDetailPage (11×), SignUpPage, LocalizedContentPage, AdvancedAnalyticsDashboard
- **Created**: 2025-11-10
- **Status**: ✅ Production

### Layout Components

#### **Layout.tsx**
- **Purpose**: Main app layout wrapper
- **Features**: Navbar, Footer, content wrapper
- **Status**: ✅ Production

#### **Navbar.tsx**
- **Purpose**: Main navigation bar
- **Features**: Responsive menu, dropdown navigation (Read, Discover, Dashboard, Admin), user authentication state, notifications bell
- **Routes**:
  - **Dashboard Dropdown** (logged-in users): /dashboard (Profile & Settings), /matching-engine (Find Match), /compare (Compare Universities), /referrals (Referrals)
  - **Admin Dropdown** (admin users): /admin (Dashboard), /admin/users, /admin/universities, /admin/articles, /admin/analytics, /admin/pages, /admin/media
  - **Read Dropdown**: /blog, /docs, /my-articles, /write-article
  - **Discover Dropdown**: /about, /contact, /policy, /careers
- **Status**: ✅ Production
- **Last Modified**: 2025-01-11 (Fixed Dashboard and Admin dropdowns with correct existing routes)

#### **Footer.tsx**
- **Purpose**: Site footer
- **Features**: Links, social media, copyright
- **Routes**:
  - **Quick Links**: /blog, /orientation, /matching-engine, /about, /careers, /pricing
  - **Resources**: /contact, /policy, /docs, /compare
- **Status**: ✅ Production
- **Last Modified**: 2025-01-11 (Updated links to use existing routes only)

#### **AdminMenu.tsx**
- **Purpose**: Admin sidebar navigation
- **Features**: Collapsible menu, route highlighting
- **Status**: ✅ Production
- **Last Modified**: 2025-11-10 (Converted inline styles to Tailwind)

### UI Components

#### **SaveButton.tsx**
- **Purpose**: Save/unsave universities button
- **Features**: Toggle saved state, icon animation
- **Status**: ✅ Production

#### **SEO.tsx**
- **Purpose**: Meta tags and SEO management
- **Props**: `title`, `description`, `keywords`, `image`
- **Status**: ✅ Production

#### **Notification.tsx**
- **Purpose**: Toast notifications system
- **Features**: Success/error/info notifications
- **Status**: ✅ Production

#### **FeatureModal.tsx**
- **Purpose**: Feature detail modal
- **Features**: Modal dialog with feature information
- **Status**: ✅ Production

#### **ImageUpload.tsx**
- **Purpose**: Image upload component
- **Features**: Drag-drop, preview, upload to Supabase
- **Status**: ✅ Production

#### **LanguageSwitcher.tsx**
- **Purpose**: Language selection dropdown
- **Features**: i18n integration
- **Status**: ✅ Production

#### **CookieConsent.tsx**
- **Purpose**: GDPR cookie consent banner
- **Features**: Customizable preferences
- **Status**: ✅ Production

#### **LogoutConfirmDialog.tsx**
- **Purpose**: Logout confirmation modal
- **Status**: ✅ Production

### Complex Feature Components

#### **ComparisonCharts.tsx**
- **Purpose**: University comparison visualizations
- **Features**: Bar charts, radar charts, cost comparison
- **Used In**: UniversityComparePage
- **Status**: ✅ Production
- **Note**: Contains dynamic chart colors (documented exception)

#### **FinancialAidPredictor.tsx**
- **Purpose**: AI-powered financial aid estimation
- **Features**: Form inputs, prediction algorithm, results display
- **Used In**: UniversityDetailPage
- **Status**: ✅ Production

#### **CareerTrajectoryHeatmap.tsx**
- **Purpose**: Career path visualization
- **Features**: Heatmap chart, career data
- **Used In**: UniversityDetailPage
- **Status**: ✅ Production

#### **ScenarioMixer.tsx**
- **Purpose**: Career scenario planning tool
- **Features**: Scenario creation, comparison
- **Used In**: FutureMixerDashboard
- **Status**: ✅ Production

#### **MentorshipSystem.tsx**
- **Purpose**: Mentorship matching and management
- **Features**: Mentor profiles, connection requests
- **Used In**: UniversityDetailPage
- **Status**: ✅ Production

#### **UniversityMicroContent.tsx**
- **Purpose**: Quick tips and micro-content display
- **Features**: Tip cards, categories
- **Used In**: UniversityDetailPage
- **Status**: ✅ Production

#### **MicroContentEditor.tsx**
- **Purpose**: Create/edit micro-content
- **Features**: Rich editor, category selection
- **Status**: ✅ Production

#### **ArticleComments.tsx**
- **Purpose**: Article comment system
- **Features**: Nested comments, reactions
- **Used In**: ArticlePage
- **Status**: ✅ Production

#### **SavedItemsCollaboration.tsx**
- **Purpose**: Collaborate on saved items
- **Features**: Sharing, collaboration tools
- **Status**: ✅ Production

### Specialized Components

#### **AdvancedAnalyticsDashboard.tsx**
- **Purpose**: Advanced analytics visualization
- **Features**: Charts, metrics, filters
- **Components Used**: ProgressBar
- **Used In**: AdvancedAnalyticsPage
- **Status**: ✅ Production
- **Last Modified**: 2025-11-10 (Added ProgressBar component)

#### **LocalizedContentHub.tsx**
- **Purpose**: Localized content management interface
- **Status**: ✅ Production

#### **LocalizedContentEditor.tsx**
- **Purpose**: Edit localized content
- **Status**: ✅ Production

#### **EditorToolbar.tsx**
- **Purpose**: Rich text editor toolbar
- **Used In**: Article editors
- **Status**: ✅ Production

### Admin Components (src/components/admin/)

#### **ArticleAnalyticsDashboard.tsx**
- **Purpose**: Article-specific analytics
- **Status**: ✅ Production

#### **AdminCookieManager.tsx**
- **Purpose**: Cookie settings management interface
- **Status**: ✅ Production

### Matching Components (src/components/matching/)

#### **UniversityCard.tsx**
- **Purpose**: University card for matching results
- **Status**: ✅ Production

#### **MixerModule.tsx**
- **Purpose**: Mixer module for matching
- **Status**: ✅ Production

### Mixer Components (src/components/mixer/)

#### **UniversityMixerCard.tsx**
- **Purpose**: University card for scenario mixer
- **Status**: ✅ Production

#### **MixerModule.tsx**
- **Purpose**: Mixer module for scenarios
- **Status**: ✅ Production

### System Components (src/components/system/)

#### **ErrorBoundary.tsx**
- **Purpose**: React error boundary
- **Features**: Error catching, fallback UI
- **Status**: ✅ Production

### Dev Components (src/components/dev/)

#### **DevNavigator.tsx**
- **Purpose**: Development navigation tool
- **Status**: 🛠️ Development only

---

## 🎣 HOOKS (src/hooks/)

#### **useAuth.ts**
- **Purpose**: Authentication state and methods
- **Returns**: `user`, `login`, `logout`, `loading`
- **Used Throughout**: All auth-required pages
- **Status**: ✅ Production

#### **useDebounce.ts**
- **Purpose**: Debounce value changes
- **Use Case**: Search inputs, API calls
- **Status**: ✅ Production

#### **useLocalStorage.ts**
- **Purpose**: Persistent local storage state
- **Use Case**: User preferences, settings
- **Status**: ✅ Production

#### **useMediaQuery.ts**
- **Purpose**: Responsive design breakpoints
- **Use Case**: Mobile/desktop conditional rendering
- **Status**: ✅ Production

#### **usePagination.ts**
- **Purpose**: Pagination logic
- **Use Case**: Lists, tables
- **Status**: ✅ Production

*(Note: Full hooks inventory to be completed in HOOKS_LIBRARY.md)*

---

## 🔧 SERVICES (src/lib/services/)

#### **universitiesService.ts**
- **Purpose**: University CRUD operations
- **Methods**: `getAll`, `getById`, `create`, `update`, `delete`, `search`
- **Status**: ✅ Production

#### **BlogService.ts**
- **Purpose**: Blog/article operations
- **Methods**: `getArticles`, `getBySlug`, `create`, `update`, `trackView`
- **Status**: ✅ Production

#### **AuthService.ts**
- **Purpose**: Authentication operations
- **Methods**: `login`, `signup`, `logout`, `resetPassword`
- **Status**: ✅ Production

#### **ReviewsService.ts**
- **Purpose**: University review operations
- **Status**: ✅ Production

#### **microContentService.ts**
- **Purpose**: Micro-content management
- **Status**: ✅ Production

*(Note: Full services inventory to be completed in API_CONTRACTS.md)*

---

## 🎨 STYLES (src/styles/)

### Design Tokens (src/styles/tokens/)

#### **colors.css**
- **Purpose**: Color palette definitions
- **Variables**: Primary, secondary, accent colors
- **Status**: ✅ Production

#### **spacing.css**
- **Purpose**: Spacing scale
- **Status**: ✅ Production

#### **typography.css**
- **Purpose**: Font system
- **Status**: ✅ Production

#### **borders.css**
- **Purpose**: Border styles
- **Status**: ✅ Production

#### **shadows.css**
- **Purpose**: Shadow definitions
- **Status**: ✅ Production

#### **gradients.css**
- **Purpose**: Gradient patterns
- **Status**: ✅ Production

#### **animations.css**
- **Purpose**: Animation presets
- **Status**: ✅ Production

#### **effects.css**
- **Purpose**: Visual effects
- **Status**: ✅ Production

#### **index.css**
- **Purpose**: Token aggregator
- **Status**: ✅ Production

### Other Styles

#### **designSystem.ts**
- **Purpose**: TypeScript design system utilities
- **Status**: ✅ Production

#### **editor.css**
- **Purpose**: Rich text editor styles
- **Status**: ✅ Production

---

## 🌐 CONTEXT (src/context/)

#### **AuthContext.tsx**
- **Purpose**: Global authentication state
- **Provides**: `user`, `loading`, `login`, `logout`, `signup`
- **Used**: App-wide authentication
- **Status**: ✅ Production

#### **AccessControlContext.tsx**
- **Purpose**: User permissions and access control
- **Provides**: `canAccess`, `hasPermission`, `userRole`
- **Status**: ✅ Production

---

## 🗄️ SERVER FILES (server/)

### Routes (server/routes/)

#### **universitiesRoutes.js**
- **Endpoints**: `/api/universities/*`
- **Operations**: CRUD, search, filters
- **Status**: ✅ Production

#### **articlesRoutes.js**
- **Endpoints**: `/api/articles/*`
- **Status**: ✅ Production

#### **authRoutes.js**
- **Endpoints**: `/api/auth/*`
- **Status**: ✅ Production

#### **reviewsRoutes.js**
- **Endpoints**: `/api/reviews/*`
- **Status**: ✅ Production

*(Note: Full API documentation in API_CONTRACTS.md)*

### Data Layer (server/data/)

#### **universities.js**
- **Purpose**: University database operations
- **Status**: ✅ Production

#### **articles.js**
- **Purpose**: Article database operations
- **Status**: ✅ Production

#### **users.js**
- **Purpose**: User database operations
- **Status**: ✅ Production

*(Full data layer inventory available)*

---

## 📚 DOCUMENTATION (.ai/, docs/, root)

### AI Documentation (.ai/)
- **INDEX.md**: This navigation system
- **PHILOSOPHY.md**: Code structure and conventions
- **FILE_REGISTRY.md**: This file
- **ARCHITECTURE.md**: System design patterns
- **TECH_STACK.md**: Technologies and dependencies
- **DESIGN_SYSTEM.md**: Styling architecture
- **CHANGELOG.md**: Change history
- **KNOWN_ISSUES.md**: Bugs and technical debt

### Feature Documentation (docs/)
- Individual feature guides (20+ files)
- Setup guides
- Implementation guides

### Root Documentation
- **STYLE_GUIDELINES.md**: NO inline styles rule
- **MVP_LAUNCH_GUIDE.md**: Launch checklist
- Various feature completion summaries

---

## 🔍 Quick Reference Tables

### Most Important Files to Check

| When doing... | Check these files first |
|---------------|-------------------------|
| Adding a page | HomePage.tsx, ExplorePage.tsx (patterns) |
| Adding UI component | AnimatedBackground.tsx, ProgressBar.tsx (structure) |
| Styling anything | DESIGN_SYSTEM.md, src/styles/tokens/ |
| Fetching data | src/lib/services/*.ts |
| Auth-related | AuthContext.tsx, useAuth.ts |
| Admin features | Admin pages, AdminMenu.tsx |

### Files Modified Recently (2025-11-10)

| File | Change | Reason |
|------|--------|--------|
| AnimatedBackground.tsx | Created | Eliminate inline gradient styles |
| ProgressBar.tsx | Created | Eliminate inline progress styles |
| UniversityDetailPage.tsx | Refactored | Use ProgressBar component |
| BlogPage.tsx | Refactored | Use AnimatedBackground, remove borders |
| HomePage.tsx | Refactored | Use AnimatedBackground |
| ExplorePage.tsx | Created & Refactored | Feature showcase + AnimatedBackground |
| OrientationPage.tsx | Refactored | Use AnimatedBackground |
| AboutPage.tsx | Refactored | Use AnimatedBackground |
| ContactPage.tsx | Refactored | Use AnimatedBackground |
| DocsPage.tsx | Refactored | Use AnimatedBackground |
| CareersPage.tsx | Refactored | Use AnimatedBackground |
| SignUpPage.tsx | Refactored | Use ProgressBar |
| LocalizedContentPage.tsx | Refactored | Use ProgressBar |
| AdvancedAnalyticsDashboard.tsx | Refactored | Use ProgressBar |
| AdminMenu.tsx | Refactored | Tailwind utilities |
| StaticPage.tsx | Refactored | Tailwind utilities |
| ArticlePage.tsx | Refactored | Tailwind utilities |

---

## 📝 Maintenance Notes

**Update This Registry When:**
- ✅ Creating new files
- ✅ Deleting files
- ✅ Major refactoring
- ✅ Adding new features
- ✅ Changing file purposes

**Registry Format:**
```markdown
#### **FileName.tsx**
- **Purpose**: Clear one-line description
- **Route**: (if applicable)
- **Features**: Bullet list of main features
- **Components Used**: Dependencies
- **Status**: ✅/🛠️/❌
- **Last Modified**: Date and reason
- **Related Files**: Links to dependencies
```

---

## 🎯 Next Steps

**If you need:**
- **More detail on components** → See COMPONENTS_LIBRARY.md
- **API endpoints** → See API_CONTRACTS.md
- **Database schema** → See DATABASE_SCHEMA.md
- **Code patterns** → See ARCHITECTURE.md
- **Styling rules** → See DESIGN_SYSTEM.md

**Remember**: This registry prevents duplication and maintains codebase sanity. Keep it updated!
