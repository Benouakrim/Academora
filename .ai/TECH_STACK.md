# 🛠️ Tech Stack - AcademOra

**Last Updated**: 2025-11-10  
**Purpose**: Complete inventory of technologies, frameworks, and dependencies

> **For AI Agents**: Check this file to understand what technologies are available before suggesting alternatives

---

## 📊 Stack Overview

```
Frontend: React 18 + TypeScript + Vite
Styling: Tailwind CSS 3 + Custom Design Tokens
Backend: Node.js + Express.js
Database: PostgreSQL (via Supabase)
Animation: Framer Motion
State Management: React Context API
Auth: Supabase Auth
Email: Mailjet
```

---

## 🎨 Frontend Stack

### Core Framework
- **React** `18.2.0`
  - Component-based UI framework
  - Hooks API for state management
  - Context API for global state
  - Used: App-wide

- **TypeScript** `5.6.3`
  - Type safety
  - Enhanced IDE support
  - Interfaces in `src/types/`
  - Used: All `.tsx` and `.ts` files

- **Vite** `7.1.12`
  - Build tool and dev server
  - Fast HMR (Hot Module Replacement)
  - Config: `vite.config.ts`
  - Used: Development and production builds

### Routing
- **React Router DOM** `7.1.1`
  - Client-side routing
  - Used in: `App.tsx`, all page components
  - Features: Nested routes, protected routes, lazy loading

### Styling

#### **Tailwind CSS** `3.3.6`
- Utility-first CSS framework
- Config: `tailwind.config.js`
- PostCSS Config: `postcss.config.js`
- Custom tokens: `src/styles/tokens/`
- **Critical**: NO inline styles allowed (see DESIGN_SYSTEM.md)

#### **Design System**
- Location: `src/styles/tokens/`
- Files:
  - `colors.css` - Color palette
  - `spacing.css` - Spacing scale
  - `typography.css` - Font system
  - `borders.css` - Border utilities
  - `shadows.css` - Shadow definitions
  - `gradients.css` - Gradient patterns
  - `animations.css` - Animation presets
  - `effects.css` - Visual effects

#### **Framer Motion** `12.23.24`
- Animation library
- Used for: Page transitions, component animations
- Examples: AnimatedBackground.tsx, modal animations
- Features: Spring animations, variants, gestures

### UI Components & Utilities

- **Lucide React** `0.462.0`
  - Icon library
  - Used: Throughout UI for consistent icons
  - Import: `import { IconName } from 'lucide-react'`

- **React Hot Toast** `2.4.1`
  - Notification system
  - Used in: Form submissions, errors, success messages
  - Config: `src/components/Notification.tsx`

- **React Markdown** `9.0.1`
  - Markdown rendering
  - Used in: BlogPage, ArticlePage, documentation pages
  - Supports: GitHub Flavored Markdown

- **React Syntax Highlighter** `15.6.1`
  - Code syntax highlighting
  - Used in: Code blocks in articles and docs
  - Theme: Configured in article renderer

### Forms & Validation

- **Zod** `3.24.1`
  - TypeScript-first schema validation
  - Used in: Form validation throughout app
  - Location: `server/validation/` and inline validations

### Date & Time

- **date-fns** `4.1.0`
  - Date manipulation and formatting
  - Used in: Article dates, user activity timestamps
  - Features: Lightweight, modular

### Internationalization

- **i18next** `23.16.8`
- **react-i18next** `15.1.3`
  - Multi-language support
  - Config: `src/i18n/`
  - Languages: English (default), additional configured
  - Used: Throughout app for translatable content

### Charts & Visualizations

- **Recharts** `2.15.0`
  - React chart library
  - Used in:
    - ComparisonCharts.tsx
    - AdvancedAnalyticsDashboard.tsx
    - CareerTrajectoryHeatmap.tsx
  - Chart types: Bar, Line, Radar, Area

---

## 🔧 Backend Stack

### Runtime & Framework
- **Node.js** `20+`
  - JavaScript runtime
  - Used: Server-side execution

- **Express.js** `4.21.2`
  - Web application framework
  - Location: `server/app.js`, `server/index.js`
  - Features: Routing, middleware, REST API

### Database & ORM

#### **Supabase** (PostgreSQL)
- **@supabase/supabase-js** `2.48.1`
  - PostgreSQL database (hosted)
  - Real-time capabilities
  - Row Level Security (RLS)
  - Config: Environment variables
  - Client: `src/lib/supabase.ts`

**Main Tables:**
- `universities` - University data
- `articles` - Blog articles
- `users` - User accounts
- `reviews` - University reviews
- `saved_items` - Saved universities
- `saved_comparisons` - Saved comparisons
- `article_views` - View tracking
- `article_comments` - Comment system
- `referrals` - Referral tracking
- `university_claims` - Claim requests
- `user_financial_profiles` - Financial data
- `micro_content` - Quick tips
- `site_settings` - App configuration

*(See DATABASE_SCHEMA.md for detailed schema)*

### Authentication

- **Supabase Auth**
  - Email/password authentication
  - Social auth (Google, GitHub - configurable)
  - Password reset flow
  - JWT tokens
  - Session management
  - Used: AuthContext.tsx, useAuth hook

### Email Service

- **Mailjet**
  - Transactional emails
  - Templates for:
    - Welcome emails
    - Password reset
    - Referral invitations
    - Admin notifications
  - Config: Environment variables
  - Service: `server/services/emailService.js`

### Middleware

- **cors** `2.8.5`
  - Cross-Origin Resource Sharing
  - Config: `server/app.js`

- **helmet** `8.0.0`
  - Security headers
  - Used: App-wide security

- **express-rate-limit** `7.5.0`
  - API rate limiting
  - Prevents abuse
  - Config: `server/middleware/rateLimiter.js`

- **morgan** `1.10.0`
  - HTTP request logger
  - Used: Development and production logging

### File Upload

- **multer** `1.4.5-lts.1`
  - File upload handling
  - Used in: Image uploads
  - Storage: Supabase Storage
  - Config: `server/middleware/upload.js`

---

## 🔨 Development Tools

### Build Tools

- **esbuild** `0.24.0`
  - Fast JavaScript bundler
  - Used by Vite internally

- **PostCSS** `8.5.1`
  - CSS transformation
  - Plugins: Tailwind CSS, Autoprefixer
  - Config: `postcss.config.js`

- **Autoprefixer** `10.4.20`
  - CSS vendor prefixes
  - Used: Automatic browser compatibility

### TypeScript Configuration

- **tsconfig.json** - Main TypeScript config
- **tsconfig.node.json** - Node-specific config
- **jsconfig.json** - JavaScript support

### Code Quality

- **ESLint** (via Vite plugin)
  - Code linting
  - TypeScript rules
  - React rules

### Type Definitions

- **@types/node** `22.10.1`
- **@types/react** `18.3.17`
- **@types/react-dom** `18.3.5`
- Additional type packages for libraries

---

## 📦 Package Management

- **npm** or **pnpm**
  - Package manager
  - Lock file: `package-lock.json` or `pnpm-lock.yaml`
  - Scripts: See `package.json`

### Key npm Scripts

```json
{
  "dev": "vite",                    // Start dev server
  "build": "tsc && vite build",     // Production build
  "preview": "vite preview",        // Preview production build
  "server": "node server/index.js", // Start backend server
  "server:dev": "nodemon server/index.js" // Dev backend with auto-reload
}
```

---

## 🌐 Environment Variables

### Frontend (.env)
```bash
VITE_SUPABASE_URL=           # Supabase project URL
VITE_SUPABASE_ANON_KEY=      # Supabase public key
VITE_API_URL=                # Backend API URL
```

### Backend (.env)
```bash
# Database
SUPABASE_URL=                # Supabase project URL
SUPABASE_SERVICE_KEY=        # Supabase service role key

# Email
MAILJET_API_KEY=             # Mailjet public key
MAILJET_SECRET_KEY=          # Mailjet private key
MAILJET_FROM_EMAIL=          # Sender email
MAILJET_FROM_NAME=           # Sender name

# Server
PORT=                        # Server port (default: 3001)
NODE_ENV=                    # development | production

# Security
JWT_SECRET=                  # JWT signing secret
CORS_ORIGIN=                 # Allowed origins
```

---

## 📱 Browser Support

### Supported Browsers
- Chrome/Edge: Last 2 versions
- Firefox: Last 2 versions
- Safari: Last 2 versions
- Mobile browsers: iOS Safari, Chrome Mobile

### Polyfills
- Modern browsers only (ES2020+)
- No IE11 support

---

## 🚀 Deployment Stack

### Frontend Hosting
- **Platform**: Vercel / Netlify (recommended)
- **Build Command**: `npm run build`
- **Output Directory**: `dist/`
- **Node Version**: 20+

### Backend Hosting
- **Platform**: Railway / Render / DigitalOcean
- **Start Command**: `npm run server`
- **Port**: Dynamic (from env)
- **Health Check**: `/health` endpoint

### Database
- **Supabase Cloud**
  - Managed PostgreSQL
  - Automatic backups
  - Built-in connection pooling

### CDN & Assets
- **Supabase Storage**
  - User uploads
  - University images
  - Article media

---

## 📚 Additional Libraries

### Utility Libraries

- **clsx** `2.1.1`
  - Conditional class names
  - Used: Throughout for dynamic Tailwind classes

- **nanoid** `5.0.9`
  - Unique ID generation
  - Used: Component keys, temporary IDs

### React Ecosystem

- **react-error-boundary** `4.1.2`
  - Error boundaries
  - Used: ErrorBoundary.tsx

- **react-intersection-observer** `9.14.0`
  - Lazy loading
  - Scroll animations
  - Used: Performance optimization

---

## 🔄 Version Control

- **Git**
  - Repository: GitHub
  - Branch: `main`
  - Workflow: Feature branches → PR → Main

---

## 📊 Monitoring & Analytics (Future)

- **Sentry** (Planned)
  - Error tracking
  - Performance monitoring

- **Google Analytics** (Planned)
  - User analytics
  - Page views

---

## ⚠️ Important Notes

### Dependency Rules

1. **Always use exact versions** for critical packages
2. **Test updates** in development before production
3. **Check breaking changes** before major version bumps
4. **Document** any new dependencies in this file

### Performance Considerations

- **Bundle size**: Monitor with `npm run build`
- **Tree shaking**: Enabled via Vite
- **Code splitting**: Lazy load routes
- **Image optimization**: Use WebP, lazy loading

### Security

- **Dependencies**: Run `npm audit` regularly
- **Environment variables**: Never commit `.env` files
- **API keys**: Use environment variables only
- **CORS**: Properly configured for production

---

## 🔗 Related Documentation

- **Package versions**: See `package.json`
- **Build configuration**: See `vite.config.ts`
- **TypeScript config**: See `tsconfig.json`
- **Tailwind config**: See `tailwind.config.js`
- **API endpoints**: See API_CONTRACTS.md
- **Database schema**: See DATABASE_SCHEMA.md

---

## 📝 Maintenance

**Update this file when:**
- ✅ Adding new dependencies
- ✅ Updating major versions
- ✅ Changing build tools
- ✅ Adding new services (email, analytics, etc.)
- ✅ Modifying deployment configuration

**Last Major Updates:**
- 2025-11-10: Initial documentation
- Framer Motion 12.23.24 added for animations
- Vite 7.1.12 for improved build performance
