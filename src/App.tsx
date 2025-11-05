import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import BlogPage from './pages/BlogPage'
import ArticlePage from './pages/ArticlePage'
import OrientationPage from './pages/OrientationPage'
import OrientationCategoryPage from './pages/OrientationCategoryPage'
import OrientationDetailPage from './pages/OrientationDetailPage'
import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUpPage'
import PasswordResetRequest from './pages/PasswordResetRequest'
import PasswordReset from './pages/PasswordReset'
import NotFound from './pages/NotFound'
import DashboardPage from './pages/DashboardPage'
import AdminDashboard from './pages/AdminDashboard'
import ArticleEditor from './pages/ArticleEditor'
import ArticlesList from './pages/admin/ArticlesList'
import CategoriesPage from './pages/admin/CategoriesPage'
import TagsPage from './pages/admin/TagsPage'
import AdminUsersPage from './pages/AdminUsersPage'
import AboutUsPage from './pages/AboutUsPage'
import ContactUsPage from './pages/ContactUsPage'
import PageEditor from './pages/PageEditor'
import PagesManagementPage from './pages/PagesManagementPage'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/password/forgot" element={<PasswordResetRequest />} />
          <Route path="/password/reset" element={<PasswordReset />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/articles" element={<ArticlesList />} />
          <Route path="/admin/articles/new" element={<ArticleEditor />} />
          <Route path="/admin/articles/edit/:id" element={<ArticleEditor />} />
          <Route path="/admin/pages" element={<PagesManagementPage />} />
          <Route path="/admin/pages/new" element={<PageEditor />} />
          <Route path="/admin/pages/:id/edit" element={<PageEditor />} />
          <Route path="/admin/categories" element={<CategoriesPage />} />
          <Route path="/admin/tags" element={<TagsPage />} />
          <Route path="/about" element={<AboutUsPage />} />
          <Route path="/contact" element={<ContactUsPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<ArticlePage />} />
          <Route path="/orientation" element={<OrientationPage />} />
          <Route path="/orientation/:category" element={<OrientationCategoryPage />} />
          <Route path="/orientation/:category/:slug" element={<OrientationDetailPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App

