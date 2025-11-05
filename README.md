# AcademOra

A modern blog and SaaS platform for academic orientation, study guidance, and educational resources.

## Features

- 📚 Blog with articles on academic topics
- 🎓 Orientation resources (fields, schools, study abroad, procedures, comparisons)
- 🔐 User authentication with Express.js and JWT
- 💼 SaaS features for premium content
- 📱 Fully responsive design
- 🌐 Multi-language support (English, French, Arabic)
- 📝 Admin dashboard for article management

## Tech Stack

### Frontend
- **Vite** - Build tool and dev server
- **React** - UI library
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **React Router** - Client-side routing
- **React i18next** - Internationalization

### Backend
- **Express.js** - Node.js web framework
- **Supabase** - PostgreSQL database (managed)
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing
- **CORS** - Cross-origin resource sharing

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Supabase account (free at https://supabase.com)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up Supabase:
   - Create account at https://supabase.com
   - Create a new project
   - Get your Project URL and Service Role Key (Settings → API)
   - Run the SQL schema from `server/database/schema.sql` in Supabase SQL Editor

3. Create a `.env` file in the root directory:
```env
PORT=3001
JWT_SECRET=your-secret-key-change-in-production
VITE_API_URL=http://localhost:3001/api

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key-here
# OR use SUPABASE_SERVICE_ROLE_KEY
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Important**: Use the `service_role` key (not `anon` key) from Supabase Settings → API → service_role key.

4. Start the development servers:

   **Option 1: Run both frontend and backend together**
   ```bash
   npm run dev:all
   ```

   **Option 2: Run separately**
   
   Terminal 1 (Backend):
   ```bash
   npm run dev:server
   ```
   
   Terminal 2 (Frontend):
   ```bash
   npm run dev
   ```

5. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001/api
   - Admin Dashboard: http://localhost:5173/admin (after login)

   ## Email (password reset) configuration

   The app supports sending password reset links by email. By default (development) the server will log reset links to the console. To send real emails you must configure SMTP environment variables in your `.env` file.

   Add the following to your `.env`:

   ```env
   # Optional: where to build frontend reset links (defaults to current host)
   FRONTEND_URL=http://localhost:5173

   # SMTP settings (required to send real emails)
   SMTP_HOST=smtp.example.com
   SMTP_PORT=587
   SMTP_SECURE=false # true for port 465
   SMTP_USER=your-smtp-user
   SMTP_PASS=your-smtp-password
   SMTP_FROM="AcademOra <no-reply@example.com>"
   ```

   Recommended options for testing:
   - Mailtrap (https://mailtrap.io) — good for development testing without sending real mail.
   - SendGrid / Mailgun / SES — for production delivery.

   If SMTP is not configured the server will still generate reset links and will log them to the server console for developer testing. Make sure to restart the server after updating `.env`.

6. Build for production:
```bash
npm run build
```

## Database Setup

1. **Create Supabase Project**
   - Go to https://supabase.com/dashboard
   - Create a new project
   - Wait for project setup (~2 minutes)

2. **Run Database Schema**
   - Go to SQL Editor in Supabase Dashboard
   - Copy and paste contents of `server/database/schema.sql`
   - Click Run

3. **Get Your Keys**
   - Go to Settings → API
   - Copy:
     - Project URL
     - service_role key (secret key for server operations)

4. **Add to .env**
   ```env
   SUPABASE_URL=your-project-url
   SUPABASE_KEY=your-service-role-key
   ```

See `server/database/README.md` for detailed setup instructions.

## Project Structure

```
.
├── server/              # Express.js backend
│   ├── index.js        # Server entry point
│   ├── database/       # Database configuration
│   │   ├── supabase.js # Supabase client
│   │   ├── schema.sql  # Database schema
│   │   └── README.md   # Setup instructions
│   ├── routes/         # API routes
│   │   ├── auth.js     # Authentication routes
│   │   ├── blog.js     # Blog routes
│   │   ├── orientation.js # Orientation routes
│   │   └── admin.js    # Admin routes (CRUD operations)
│   └── data/           # Database operations
│       ├── users.js    # User database functions
│       ├── articles.js # Article database functions
│       └── orientation.js # Orientation database functions
├── src/                 # React frontend
│   ├── components/     # Reusable UI components
│   ├── pages/          # Page components
│   │   ├── AdminDashboard.tsx # Admin article management
│   │   └── ArticleEditor.tsx  # Create/edit articles
│   ├── lib/            # Utilities and API client
│   ├── i18n/           # Translation files
│   └── App.tsx         # Main app component with routing
└── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Sign in
- `GET /api/auth/me` - Get current user (protected)

### Blog
- `GET /api/blog` - Get all published articles
- `GET /api/blog/:slug` - Get article by slug

### Orientation
- `GET /api/orientation` - Get all resources
- `GET /api/orientation/category/:category` - Get resources by category
- `GET /api/orientation/:category/:slug` - Get resource by category and slug

### Admin (Protected - requires authentication)
- `GET /api/admin/articles` - Get all articles (including drafts)
- `GET /api/admin/articles/:id` - Get article by ID
- `POST /api/admin/articles` - Create new article
- `PUT /api/admin/articles/:id` - Update article
- `DELETE /api/admin/articles/:id` - Delete article

## Database Tables

### users
- `id` (UUID) - Primary key
- `email` (VARCHAR) - Unique email address
- `password` (VARCHAR) - Hashed password (bcrypt)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### articles
- `id` (UUID) - Primary key
- `title` (VARCHAR) - Article title
- `slug` (VARCHAR) - URL-friendly slug (unique)
- `content` (TEXT) - HTML content
- `excerpt` (TEXT) - Short summary
- `category` (VARCHAR) - Article category
- `author_id` (UUID) - Foreign key to users
- `published` (BOOLEAN) - Publication status
- `featured_image` (VARCHAR) - Optional image URL
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### orientation_resources
- `id` (UUID) - Primary key
- `title` (VARCHAR) - Resource title
- `slug` (VARCHAR) - URL-friendly slug
- `content` (TEXT) - HTML content
- `category` (VARCHAR) - One of: fields, schools, study-abroad, procedures, comparisons
- `featured` (BOOLEAN) - Featured status
- `premium` (BOOLEAN) - Premium content flag
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## Admin Features

Access the admin dashboard at `/admin` (requires login):

- View all articles (published and drafts)
- Create new articles
- Edit existing articles
- Delete articles
- Publish/unpublish articles
- View article status

## Deployment

### Recommended Stack

1. **Database**: Supabase (already set up)
2. **Backend**: Railway.app or Render.com
3. **Frontend**: Vercel or Netlify

See deployment documentation for detailed instructions.

## License

MIT
