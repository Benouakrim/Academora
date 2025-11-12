# 🗄️ Database Schema - AcademOra

**Last Updated**: 2025-11-10  
**Database**: PostgreSQL 15 (via Supabase)  
**Purpose**: Complete database structure and relationships

> **For AI Agents**: Reference this before writing any database queries or migrations

---

## 📊 Schema Overview

```
Core Tables:
├── users                      # User accounts
├── universities               # University profiles
├── university_groups          # University networks
├── articles                   # Blog content
├── reviews                    # University reviews
├── saved_items                # User's saved universities
├── saved_comparisons          # Saved university comparisons
└── referrals                  # Referral tracking

Content & Features:
├── article_views              # Article analytics
├── article_comments           # Comment system
├── micro_content              # Quick tips
├── orientation_resources      # Orientation content
├── static_pages               # CMS pages
└── site_settings              # App configuration

User Data:
├── user_financial_profiles    # Financial information
├── university_claims          # Claim requests
├── notifications              # User notifications
└── user_preferences           # User settings
```

---

## 👤 users

Core user accounts table.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE,
  password VARCHAR(255) NOT NULL,
  
  -- Profile
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  username VARCHAR(50) UNIQUE,
  bio TEXT,
  avatar_url VARCHAR(500),
  
  -- Account info
  account_type VARCHAR(50) DEFAULT 'student',  -- student | parent | counselor | university
  role VARCHAR(20) DEFAULT 'user',              -- user | admin | moderator
  plan VARCHAR(20) DEFAULT 'free',              -- free | premium | enterprise
  
  -- Status
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'active',          -- active | suspended | deleted
  
  -- Referrals
  referral_code VARCHAR(20) UNIQUE,
  referred_by UUID REFERENCES users(id),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_referral_code ON users(referral_code);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_plan ON users(plan);
```

**Relationships**:
- One user → Many articles (as author)
- One user → Many reviews
- One user → Many saved items
- One user → Many referrals (as referrer)
- One user → One financial profile

---

## 🎓 universities

University profiles and data.

```sql
CREATE TABLE universities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Basic info
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  logo_url VARCHAR(500),
  website VARCHAR(255),
  
  -- Location
  address VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(2),
  zip_code VARCHAR(10),
  country VARCHAR(100) DEFAULT 'USA',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Type & Classification
  type VARCHAR(50),                    -- public | private
  classification VARCHAR(100),         -- R1, R2, etc.
  religious_affiliation VARCHAR(100),
  
  -- Admissions
  acceptance_rate DECIMAL(5, 2),
  application_deadline DATE,
  early_decision_deadline DATE,
  
  -- Costs
  tuition_in_state DECIMAL(10, 2),
  tuition_out_state DECIMAL(10, 2),
  room_and_board DECIMAL(10, 2),
  total_cost_in_state DECIMAL(10, 2),
  total_cost_out_state DECIMAL(10, 2),
  
  -- Financial Aid
  average_financial_aid DECIMAL(10, 2),
  percent_receiving_aid DECIMAL(5, 2),
  average_net_price DECIMAL(10, 2),
  
  -- Student Body
  student_population INTEGER,
  undergraduate_population INTEGER,
  graduate_population INTEGER,
  student_faculty_ratio VARCHAR(10),
  percent_male DECIMAL(5, 2),
  percent_female DECIMAL(5, 2),
  
  -- Outcomes
  graduation_rate DECIMAL(5, 2),
  retention_rate DECIMAL(5, 2),
  employment_rate DECIMAL(5, 2),
  average_starting_salary DECIMAL(10, 2),
  
  -- Academic
  sat_math_25 INTEGER,
  sat_math_75 INTEGER,
  sat_verbal_25 INTEGER,
  sat_verbal_75 INTEGER,
  act_composite_25 INTEGER,
  act_composite_75 INTEGER,
  average_gpa DECIMAL(3, 2),
  
  -- Rankings (JSON for flexibility)
  rankings JSONB,
  
  -- Features
  verified BOOLEAN DEFAULT FALSE,
  claimed BOOLEAN DEFAULT FALSE,
  premium BOOLEAN DEFAULT FALSE,
  
  -- SEO
  meta_title VARCHAR(255),
  meta_description TEXT,
  meta_keywords TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_universities_slug ON universities(slug);
CREATE INDEX idx_universities_state ON universities(state);
CREATE INDEX idx_universities_type ON universities(type);
CREATE INDEX idx_universities_name ON universities USING gin(to_tsvector('english', name));
CREATE INDEX idx_universities_verified ON universities(verified);
```

**Relationships**:
- One university → Many reviews
- One university → Many saved items
- One university → Many micro content items
- One university → Many claims
- Many universities ↔ Many groups (via junction table)

---

## 🏫 university_groups

University networks (Ivy League, Big Ten, etc.).

```sql
CREATE TABLE university_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  logo_url VARCHAR(500),
  website VARCHAR(255),
  member_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Junction table for many-to-many relationship
CREATE TABLE university_group_members (
  university_id UUID REFERENCES universities(id) ON DELETE CASCADE,
  group_id UUID REFERENCES university_groups(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (university_id, group_id)
);

-- Indexes
CREATE INDEX idx_group_members_university ON university_group_members(university_id);
CREATE INDEX idx_group_members_group ON university_group_members(group_id);
```

---

## 📝 articles

Blog posts and content.

```sql
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Content
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image VARCHAR(500),
  
  -- Classification
  category VARCHAR(100) NOT NULL,
  category_type VARCHAR(50) DEFAULT 'standard',  -- standard | orientation | news
  tags TEXT[],
  
  -- Author
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  author_name VARCHAR(255),
  
  -- Status
  published BOOLEAN DEFAULT FALSE,
  featured BOOLEAN DEFAULT FALSE,
  premium BOOLEAN DEFAULT FALSE,
  allow_comments BOOLEAN DEFAULT TRUE,
  
  -- SEO
  meta_title VARCHAR(255),
  meta_description TEXT,
  meta_keywords TEXT,
  
  -- Analytics
  view_count INTEGER DEFAULT 0,
  
  -- Timestamps
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_category ON articles(category);
CREATE INDEX idx_articles_published ON articles(published);
CREATE INDEX idx_articles_author ON articles(author_id);
CREATE INDEX idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX idx_articles_title_search ON articles USING gin(to_tsvector('english', title || ' ' || excerpt));
```

**Relationships**:
- One article → One user (author)
- One article → Many comments
- One article → Many views (tracking)

---

## ⭐ reviews

University reviews by users.

```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Ratings (1-5 scale)
  rating DECIMAL(2, 1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
  academic_rating DECIMAL(2, 1) CHECK (academic_rating >= 1 AND academic_rating <= 5),
  campus_rating DECIMAL(2, 1) CHECK (campus_rating >= 1 AND campus_rating <= 5),
  career_rating DECIMAL(2, 1) CHECK (career_rating >= 1 AND career_rating <= 5),
  social_rating DECIMAL(2, 1) CHECK (social_rating >= 1 AND social_rating <= 5),
  
  -- Content
  title VARCHAR(255),
  content TEXT NOT NULL,
  
  -- Metadata
  verified BOOLEAN DEFAULT FALSE,
  anonymous BOOLEAN DEFAULT FALSE,
  helpful_count INTEGER DEFAULT 0,
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending',  -- pending | approved | rejected
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- One review per user per university
  UNIQUE(university_id, user_id)
);

-- Indexes
CREATE INDEX idx_reviews_university ON reviews(university_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_status ON reviews(status);
```

---

## 💾 saved_items

User's saved universities.

```sql
CREATE TABLE saved_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  
  notes TEXT,
  folder VARCHAR(100),  -- For organization
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- One save per user per university
  UNIQUE(user_id, university_id)
);

-- Indexes
CREATE INDEX idx_saved_items_user ON saved_items(user_id);
CREATE INDEX idx_saved_items_university ON saved_items(university_id);
CREATE INDEX idx_saved_items_folder ON saved_items(folder);
```

---

## 🔄 saved_comparisons

Saved university comparisons.

```sql
CREATE TABLE saved_comparisons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  name VARCHAR(255),
  university_ids UUID[] NOT NULL,  -- Array of university IDs
  
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_saved_comparisons_user ON saved_comparisons(user_id);
CREATE INDEX idx_saved_comparisons_universities ON saved_comparisons USING gin(university_ids);
```

---

## 📊 article_views

Article view tracking and analytics.

```sql
CREATE TABLE article_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Session tracking
  session_id VARCHAR(255),
  ip_address INET,
  user_agent TEXT,
  
  -- Context
  referrer VARCHAR(500),
  country VARCHAR(100),
  device_type VARCHAR(50),  -- desktop | mobile | tablet
  
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_article_views_article ON article_views(article_id);
CREATE INDEX idx_article_views_user ON article_views(user_id);
CREATE INDEX idx_article_views_viewed_at ON article_views(viewed_at DESC);
CREATE INDEX idx_article_views_session ON article_views(session_id);
```

---

## 💬 article_comments

Comment system for articles.

```sql
CREATE TABLE article_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  content TEXT NOT NULL,
  
  -- Nested comments
  parent_comment_id UUID REFERENCES article_comments(id) ON DELETE CASCADE,
  
  -- Moderation
  status VARCHAR(20) DEFAULT 'approved',  -- pending | approved | rejected | deleted
  
  -- Engagement
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_comments_article ON article_comments(article_id);
CREATE INDEX idx_comments_user ON article_comments(user_id);
CREATE INDEX idx_comments_parent ON article_comments(parent_comment_id);
CREATE INDEX idx_comments_status ON article_comments(status);
```

---

## 💡 micro_content

Quick tips and micro-content for universities.

```sql
CREATE TABLE micro_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  university_id UUID REFERENCES universities(id) ON DELETE CASCADE,
  
  category VARCHAR(100) NOT NULL,  -- application_tips | financial_aid | campus_life | etc.
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  
  priority INTEGER DEFAULT 0,  -- Display order
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_micro_content_university ON micro_content(university_id);
CREATE INDEX idx_micro_content_category ON micro_content(category);
CREATE INDEX idx_micro_content_priority ON micro_content(priority);
```

---

## 🧭 orientation_resources

Orientation and guide content.

```sql
CREATE TABLE orientation_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  
  category VARCHAR(50) NOT NULL CHECK (category IN ('fields', 'schools', 'study-abroad', 'procedures', 'comparisons')),
  
  featured BOOLEAN DEFAULT FALSE,
  premium BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(category, slug)
);

-- Indexes
CREATE INDEX idx_orientation_category ON orientation_resources(category);
CREATE INDEX idx_orientation_slug ON orientation_resources(category, slug);
CREATE INDEX idx_orientation_featured ON orientation_resources(featured);
```

---

## 📄 static_pages

CMS pages (About, Contact, etc.).

```sql
CREATE TABLE static_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  
  -- SEO
  meta_title VARCHAR(255),
  meta_description TEXT,
  
  published BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_static_pages_slug ON static_pages(slug);
CREATE INDEX idx_static_pages_published ON static_pages(published);
```

---

## 🎁 referrals

Referral tracking system.

```sql
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  referral_code VARCHAR(20) NOT NULL,
  referred_email VARCHAR(255),
  
  status VARCHAR(20) DEFAULT 'pending',  -- pending | completed | expired
  
  -- Rewards
  reward_amount DECIMAL(10, 2) DEFAULT 0,
  reward_paid BOOLEAN DEFAULT FALSE,
  
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX idx_referrals_referred ON referrals(referred_user_id);
CREATE INDEX idx_referrals_code ON referrals(referral_code);
CREATE INDEX idx_referrals_status ON referrals(status);
```

---

## 🏢 university_claims

University claim requests.

```sql
CREATE TABLE university_claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Verification info
  position VARCHAR(100),
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  documentation_url VARCHAR(500),
  
  message TEXT,
  
  status VARCHAR(20) DEFAULT 'pending',  -- pending | approved | rejected
  
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_claims_university ON university_claims(university_id);
CREATE INDEX idx_claims_user ON university_claims(user_id);
CREATE INDEX idx_claims_status ON university_claims(status);
```

---

## 💰 user_financial_profiles

User financial information for matching.

```sql
CREATE TABLE user_financial_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Income
  household_income DECIMAL(12, 2),
  family_size INTEGER,
  
  -- Assets
  savings DECIMAL(12, 2),
  investments DECIMAL(12, 2),
  
  -- Education savings
  college_savings_529 DECIMAL(12, 2),
  
  -- Expected contribution
  expected_family_contribution DECIMAL(10, 2),
  
  -- Status
  eligible_for_pell_grant BOOLEAN DEFAULT FALSE,
  eligible_for_state_aid BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_financial_profiles_user ON user_financial_profiles(user_id);
```

---

## 🔔 notifications

User notification system.

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  type VARCHAR(50) NOT NULL,  -- review_reply | new_article | system | etc.
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  
  link VARCHAR(500),
  
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
```

---

## ⚙️ site_settings

Application configuration.

```sql
CREATE TABLE site_settings (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'string',  -- string | number | boolean | json
  description TEXT,
  
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Example settings
INSERT INTO site_settings (key, value, type, description) VALUES
  ('maintenance_mode', 'false', 'boolean', 'Enable maintenance mode'),
  ('featured_universities', '[]', 'json', 'Array of featured university IDs'),
  ('max_comparisons', '5', 'number', 'Maximum universities in a comparison');
```

---

## 🔒 Row Level Security (RLS) Policies

### users
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);
```

### saved_items
```sql
ALTER TABLE saved_items ENABLE ROW LEVEL SECURITY;

-- Users can CRUD their own saved items
CREATE POLICY "Users can manage own saved items"
  ON saved_items FOR ALL
  USING (auth.uid() = user_id);
```

### reviews
```sql
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read approved reviews
CREATE POLICY "Anyone can read approved reviews"
  ON reviews FOR SELECT
  USING (status = 'approved');

-- Users can create reviews
CREATE POLICY "Users can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update own reviews
CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() = user_id);
```

---

## 🔄 Database Functions & Triggers

### Update Timestamp Trigger
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Repeat for other tables...
```

### Calculate Average Rating
```sql
CREATE OR REPLACE FUNCTION calculate_university_rating(university_uuid UUID)
RETURNS DECIMAL AS $$
  SELECT AVG(rating) FROM reviews
  WHERE university_id = university_uuid AND status = 'approved'
$$ LANGUAGE SQL;
```

---

## 📈 Performance Indexes

All major query paths are indexed:
- Foreign key columns
- Frequently filtered columns (status, published, etc.)
- Full-text search columns (name, title, content)
- Timestamp columns for sorting
- Compound indexes for common query patterns

---

## 🔗 Relationship Diagram

```
users ────┬──── articles (author)
          ├──── reviews
          ├──── saved_items
          ├──── saved_comparisons
          ├──── referrals (referrer)
          ├──── university_claims
          ├──── user_financial_profiles
          └──── notifications

universities ────┬──── reviews
                 ├──── saved_items
                 ├──── micro_content
                 ├──── university_claims
                 └──── university_group_members

articles ────┬──── article_views
             └──── article_comments
```

---

## 🛠️ Maintenance

**Update this file when:**
- ✅ Adding new tables
- ✅ Modifying table structures
- ✅ Adding/changing indexes
- ✅ Creating new RLS policies
- ✅ Adding database functions
- ✅ Changing relationships

**Migration Strategy**:
1. Create SQL migration file in `server/database/`
2. Test in development
3. Document changes here
4. Deploy to production
5. Update seed data if needed

---

**Last Major Updates:**
- 2025-11-10: Initial comprehensive schema documentation
