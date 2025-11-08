import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/auth.js';
import blogRoutes from './routes/blog.js';
import orientationRoutes from './routes/orientation.js';
import adminRoutes from './routes/admin.js';
import adminFeaturesRoutes from './routes/adminFeatures.js';
import uploadRoutes from './routes/upload.js';
import matchingRoutes from './routes/matching.js';
import adminUniversityRoutes from './routes/adminUniversities.js';
import universitiesRoutes from './routes/universities.js';
import universityGroupsRoutes from './routes/universityGroups.js';
import compareRoutes from './routes/compare.js';
import adminUniversityGroupsRoutes from './routes/adminUniversityGroups.js';
import profileRoutes from './routes/profile.js';
import savedItemsRoutes from './routes/savedItems.js';
import universityClaimsRoutes from './routes/universityClaims.js';
import adminUniversityClaimsRoutes from './routes/adminUniversityClaims.js';
import staticPagesRoutes from './routes/staticPages.js';
import adminStaticPagesRoutes from './routes/adminStaticPages.js';
import userPreferencesRoutes from './routes/userPreferences.js';
import savedMatchesRoutes from './routes/savedMatches.js';
import reviewsRoutes from './routes/reviews.js';
import notificationsRoutes from './routes/notifications.js';
import microContentRoutes from './routes/microContent.js';
import adminAnalyticsRoutes from './routes/adminAnalytics.js';
import usersPublicRoutes from './routes/usersPublic.js';
import profileSectionsRoutes from './routes/profileSections.js';
import financialProfileRoutes from './routes/financialProfile.js';
import devRoutes from './routes/dev.js';
import sitemapRoutes from './routes/sitemap.js';
import accessStatusRoutes from './routes/accessStatus.js';
import onboardingRoutes from './routes/onboarding.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from public directory
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/orientation', orientationRoutes);
app.use('/api/admin/features', adminFeaturesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/user-preferences', userPreferencesRoutes);
app.use('/api/saved-matches', savedMatchesRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api', microContentRoutes);
app.use('/api/admin/analytics', adminAnalyticsRoutes);
app.use('/api/users', usersPublicRoutes);
app.use('/api/profile-sections', profileSectionsRoutes);
app.use('/api/profile/financial', financialProfileRoutes);
app.use('/api/dev', devRoutes);
app.use('/', sitemapRoutes);
// Public universities (no auth required)
app.use('/api/universities', universitiesRoutes);
// Public university groups (no auth required)
app.use('/api/university-groups', universityGroupsRoutes);
// University comparison workspace (feature-gated)
app.use('/api/compare', compareRoutes);
// Admin universities CRUD
app.use('/api/admin/universities', adminUniversityRoutes);
// Admin university groups CRUD
app.use('/api/admin/university-groups', adminUniversityGroupsRoutes);
// User profile management
app.use('/api/profile', profileRoutes);
app.use('/api/onboarding', onboardingRoutes);
// Saved items
app.use('/api/saved-items', savedItemsRoutes);
// University claims (public routes for users)
app.use('/api/university-claims', universityClaimsRoutes);
// Admin university claims management
app.use('/api/admin/university-claims', adminUniversityClaimsRoutes);
// Public static pages
app.use('/api/pages', staticPagesRoutes);
// Admin static pages management
app.use('/api/admin/pages', adminStaticPagesRoutes);
// Feature access status
app.use('/api/access', accessStatusRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'AcademOra API is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

