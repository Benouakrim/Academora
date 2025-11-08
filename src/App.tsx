import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { trackRoutePath as track } from './devtools/routeRegistry'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import BlogPage from './pages/BlogPage'
import ArticlePage from './pages/ArticlePage'
import CategoryPage from './pages/CategoryPage'
import OrientationPage from './pages/OrientationPage'
import OrientationCategoryPage from './pages/OrientationCategoryPage'
import OrientationDetailPage from './pages/OrientationDetailPage'
import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUpPage'
import RegisterPage from './pages/RegisterPage'
import PasswordResetRequest from './pages/PasswordResetRequest'
import PasswordReset from './pages/PasswordReset'
import NotFound from './pages/NotFound'
import DashboardPage from './pages/DashboardPage'
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminClaimsPage = lazy(() => import('./pages/admin/AdminClaimsPage'))
const ArticleEditor = lazy(() => import('./pages/ArticleEditor'))
const ArticlesList = lazy(() => import('./pages/admin/ArticlesList'))
const TaxonomiesPage = lazy(() => import('./pages/admin/TaxonomiesPage'))
const TagsPage = lazy(() => import('./pages/admin/TagsPage'))
const AdminUsersPage = lazy(() => import('./pages/AdminUsersPage'))
const PlansManagementPage = lazy(() => import('./pages/admin/PlansManagementPage'))
import PricingPage from './pages/PricingPage'
import UnifiedPageEditor from './pages/admin/UnifiedPageEditor'
import PagesManagementPage from './pages/PagesManagementPage'
import MatchingDashboardPage from './pages/MatchingDashboardPage' // Future Mixer dashboard
const AdminUniversitiesPage = lazy(() => import('./pages/admin/AdminUniversitiesPage'))
const UniversityEditor = lazy(() => import('./pages/admin/UniversityEditor'))
const LocalizedContentPage = lazy(() => import('./pages/LocalizedContentPage'))
const AdvancedAnalyticsPage = lazy(() => import('./pages/AdvancedAnalyticsPage'))
import UniversityDetailPage from './pages/UniversityDetailPage'
import UniversityGroupDetailPage from './pages/UniversityGroupDetailPage'
const AdminGroupsPage = lazy(() => import('./pages/admin/AdminGroupsPage'))
const GroupEditor = lazy(() => import('./pages/admin/GroupEditor'))
import UniversityClaimPage from './pages/UniversityClaimPage'
const AdminAboutPage = lazy(() => import('./pages/admin/AdminAboutPage'))
const AdminContactPage = lazy(() => import('./pages/admin/AdminContactPage'))
import UniversityComparePage from './pages/UniversityComparePage'
import PublicUserProfilePage from './pages/PublicUserProfilePage'
const DevDashboard = lazy(() => import('./pages/DevDashboard'))
import DocumentationPage from './pages/DocumentationPage'
import DocsPage from './pages/DocsPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import PolicyPage from './pages/PolicyPage'
import CareersPage from './pages/CareersPage'
import { AccessControlProvider } from './context/AccessControlContext'
const FeatureUsagePage = lazy(() => import('./pages/admin/FeatureUsagePage'))
const AdminMediaPage = lazy(() => import('./pages/admin/AdminMediaPage'))

function App() {
  return (
    <AccessControlProvider>
    <Router>
      <Layout>
        <Suspense fallback={<div className="p-6">Loading...</div>}>
        <Routes>
          <Route path={track("/")} element={<HomePage />} />
          <Route path={track("/login")} element={<LoginPage />} />
          <Route path={track("/signup")} element={<SignUpPage />} />
          <Route path={track("/register")} element={<RegisterPage />} />
          <Route path={track("/password/forgot")} element={<PasswordResetRequest />} />
          <Route path={track("/password/reset")} element={<PasswordReset />} />
          <Route path={track("/dashboard")} element={<DashboardPage />} />
          <Route path={track("/matching-engine")} element={<MatchingDashboardPage />} />
          <Route path={track("/admin")} element={<AdminDashboard />} />
          <Route path={track("/admin/users")} element={<AdminUsersPage />} />
          <Route path={track("/admin/university-claims")} element={<AdminClaimsPage />} />
          <Route path={track("/admin/university-claims/:id")} element={<AdminClaimsPage />} />
          <Route path={track("/admin/universities")} element={<AdminUniversitiesPage />} />
          <Route path={track("/admin/universities/new")} element={<UniversityEditor />} />
          <Route path={track("/admin/universities/edit/:id")} element={<UniversityEditor />} />
          <Route path={track("/admin/university-groups")} element={<AdminGroupsPage />} />
          <Route path={track("/admin/university-groups/new")} element={<GroupEditor />} />
          <Route path={track("/admin/university-groups/edit/:id")} element={<GroupEditor />} />
          <Route path={track("/admin/plans")} element={<PlansManagementPage />} />
          <Route path={track("/admin/articles")} element={<ArticlesList />} />
          <Route path={track("/admin/articles/new")} element={<ArticleEditor />} />
          <Route path={track("/admin/articles/edit/:id")} element={<ArticleEditor />} />
          <Route path={track("/admin/pages")} element={<PagesManagementPage />} />
          <Route path={track("/admin/pages/new")} element={<UnifiedPageEditor />} />
          <Route path={track("/admin/pages/:slug/edit")} element={<UnifiedPageEditor />} />
          <Route path={track("/admin/about")} element={<AdminAboutPage />} />
          <Route path={track("/admin/contact")} element={<AdminContactPage />} />
          <Route path={track("/admin/features/usage")} element={<FeatureUsagePage />} />
          <Route path={track("/admin/categories")} element={<TaxonomiesPage />} />
          <Route path={track("/admin/taxonomies")} element={<TaxonomiesPage />} />
          <Route path={track("/admin/tags")} element={<TagsPage />} />
          <Route path={track("/admin/localized-content")} element={<LocalizedContentPage />} />
          <Route path={track("/admin/analytics")} element={<AdvancedAnalyticsPage />} />
          <Route path={track("/admin/media")} element={<AdminMediaPage />} />
          <Route path={track("/about")} element={<AboutPage />} />
          <Route path={track("/contact")} element={<ContactPage />} />
          <Route path={track("/policy")} element={<PolicyPage />} />
          <Route path={track("/careers")} element={<CareersPage />} />
          <Route path={track("/pricing")} element={<PricingPage />} />
          <Route path={track("/blog")} element={<BlogPage />} />
          <Route path={track("/blog/category/:categoryName")} element={<CategoryPage />} />
          <Route path={track("/blog/:slug")} element={<ArticlePage />} />
          <Route path={track("/orientation")} element={<OrientationPage />} />
          <Route path={track("/orientation/:category")} element={<OrientationCategoryPage />} />
          <Route path={track("/orientation/:category/:slug")} element={<OrientationDetailPage />} />
          <Route path={track("/universities/:slug")} element={<UniversityDetailPage />} />
          <Route path={track("/university-groups/:slug")} element={<UniversityGroupDetailPage />} />
          <Route path={track("/compare")} element={<UniversityComparePage />} />
          <Route path={track("/docs/:slug")} element={<DocumentationPage />} />
          <Route path={track("/docs")} element={<DocsPage />} />
          <Route path={track("/u/:username")} element={<PublicUserProfilePage />} />
          {import.meta.env.DEV && (
            <Route path={track("/__dev")} element={<DevDashboard />} />
          )}
          <Route path={track("/university-claims/claim")} element={<UniversityClaimPage />} />
          <Route path={track("*")} element={<NotFound />} />
        </Routes>
        </Suspense>
      </Layout>
    </Router>
    </AccessControlProvider>
  )
}

export default App

