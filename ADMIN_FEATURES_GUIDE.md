# Admin Article Management & SEO Features Guide

This guide explains the new admin features for article management with SEO settings.

## ✅ Features Implemented

### 1. Enhanced Admin Dashboard (`/admin`)
- **Article Management Table**: View all articles with details
- **Stats Dashboard**: Shows total articles, published count, drafts count, and filtered count
- **Search Functionality**: Search articles by title, slug, excerpt, or category
- **Filter by Status**: Filter articles by all/published/draft
- **Quick Actions**: 
  - View article (for published articles)
  - Edit article
  - Delete article
- **Write New Article Button**: Prominent button to create new articles

### 2. Article Editor (`/admin/articles/new` or `/admin/articles/edit/:id`)
- **Full Article Editing**: 
  - Title, Slug, Excerpt, Content (HTML)
  - Category selection
  - Featured Image URL
  - Publish/Draft toggle

- **SEO Settings Section** (WordPress-style):
  - **Collapsible Section**: Click to expand/collapse
  - **Focus Keyword**: Main keyword for ranking
  - **Meta Title**: SEO title (auto-fills from title if empty)
    - Character counter (60 max)
    - Recommended: 50-60 characters
  - **Meta Description**: SEO description (auto-fills from excerpt if empty)
    - Character counter (160 max)
    - Recommended: 150-160 characters
  - **Meta Keywords**: Comma-separated keywords
  - **OG Image**: Open Graph image for social media sharing
    - Falls back to featured image if empty
  - **Canonical URL**: Preferred URL for SEO (prevents duplicate content)

### 3. Dashboard Integration
- **User Dashboard**: Added "Write New Article" button for admins
- **Quick Access**: Easy navigation to admin features

## 📋 Required Supabase Setup

### Step 1: Add SEO Columns to Articles Table

Run this SQL in Supabase SQL Editor:

1. Go to **Supabase Dashboard** → Your Project
2. Navigate to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Open the file `server/database/add-seo-columns.sql` from your project
5. Copy ALL the SQL code
6. Paste into the SQL Editor
7. Click **Run** (or press Ctrl+Enter / Cmd+Enter)
8. You should see "Success" messages

**What this does:**
- Adds `meta_title` column
- Adds `meta_description` column
- Adds `meta_keywords` column
- Adds `og_image` column (Open Graph image)
- Adds `canonical_url` column
- Adds `focus_keyword` column
- Creates indexes for better performance
- Sets default values for existing articles

## 🎨 Features Overview

### Admin Dashboard Features:
- ✅ **Article List**: Table view of all articles
- ✅ **Statistics Cards**: Total, Published, Drafts, Filtered count
- ✅ **Search Bar**: Real-time search through articles
- ✅ **Status Filter**: Filter by All/Published/Drafts
- ✅ **Quick Actions**: Edit, Delete, View buttons
- ✅ **New Article Button**: Write new articles

### Article Editor Features:
- ✅ **Basic Fields**: Title, Slug, Excerpt, Content, Category, Featured Image
- ✅ **Publish/Draft Toggle**: Control article visibility
- ✅ **SEO Section**: 
  - Focus Keyword
  - Meta Title (with character counter)
  - Meta Description (with character counter)
  - Meta Keywords
  - OG Image (for social sharing)
  - Canonical URL
- ✅ **Auto-fill**: SEO fields auto-fill from title/excerpt
- ✅ **Validation**: Character limits for meta fields

### User Dashboard:
- ✅ **Admin Links**: "Manage Articles" and "Write New Article" buttons (for admins only)

## 🚀 How to Use

### Creating a New Article:

1. Go to `/admin` or click "Write New Article" button
2. Fill in basic article fields:
   - Title (auto-generates slug)
   - Content (HTML format)
   - Excerpt
   - Category
   - Featured Image (optional)
3. Expand **SEO Settings** section (click the header)
4. Fill in SEO fields:
   - Focus Keyword (main keyword)
   - Meta Title (50-60 chars recommended)
   - Meta Description (150-160 chars recommended)
   - Meta Keywords (comma-separated)
   - OG Image (for social sharing)
   - Canonical URL (if needed)
5. Toggle "Publish" checkbox if you want it visible immediately
6. Click "Save Article"

### Managing Articles:

1. Go to `/admin`
2. Use **Search** to find specific articles
3. Use **Filter** to show only published or drafts
4. Click **Edit** icon to modify an article
5. Click **View** icon to see published article
6. Click **Delete** icon to remove an article

### Editing Articles:

1. Click **Edit** icon on any article in the admin dashboard
2. Modify any field (content, SEO settings, images, etc.)
3. Click "Save Article" to update

## 🔍 SEO Best Practices

### Meta Title:
- **Length**: 50-60 characters (optimal for search results)
- **Include**: Focus keyword at the beginning
- **Tip**: Make it compelling and click-worthy

### Meta Description:
- **Length**: 150-160 characters (optimal for search snippets)
- **Include**: Call-to-action, focus keyword
- **Tip**: Write as if describing the article to someone

### Focus Keyword:
- Choose ONE main keyword per article
- Use it naturally in title, content, and meta fields
- Research keywords using tools like Google Keyword Planner

### Meta Keywords:
- 5-10 relevant keywords
- Include variations and related terms
- Separate with commas

### OG Image:
- **Size**: 1200x630 pixels (recommended)
- **Format**: JPG or PNG
- **Purpose**: Shown when sharing on Facebook, Twitter, etc.

### Canonical URL:
- Use if content exists in multiple locations
- Points search engines to preferred version
- Prevents duplicate content penalties

## 📝 Quick Reference

### Admin URLs:
- **Article Management**: `/admin`
- **Create New Article**: `/admin/articles/new`
- **Edit Article**: `/admin/articles/edit/:id`

### Navigation:
- **From User Dashboard**: Click "Manage Articles" or "Write New Article" (admin only)
- **From Navbar**: Click "Admin" link (admin only)
- **From Admin Dashboard**: Click "Write New Article" button

## ✅ Checklist

- [ ] Run `add-seo-columns.sql` in Supabase SQL Editor
- [ ] Verify SEO columns exist in `articles` table
- [ ] Test creating a new article with SEO settings
- [ ] Test editing an article and updating SEO fields
- [ ] Test search functionality in admin dashboard
- [ ] Test filter functionality (published/draft)
- [ ] Verify published articles appear on `/blog` page

## 🎉 What's New

### Before:
- Basic article creation/editing
- No SEO settings
- Simple admin dashboard

### After:
- ✅ WordPress-style SEO settings
- ✅ Enhanced admin dashboard with stats and search
- ✅ Better article management interface
- ✅ SEO fields for better search engine optimization
- ✅ Social media sharing support (OG images)

---

**Need help?** All features are ready to use once you run the SQL to add SEO columns!

