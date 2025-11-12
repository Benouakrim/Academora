# 🔌 API Contracts - AcademOra

**Last Updated**: 2025-11-10  
**Base URL**: `http://localhost:3001/api` (Development)  
**Purpose**: Complete API endpoint documentation

> **For AI Agents**: Use these exact endpoints and schemas when implementing API calls

---

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [Universities](#universities)
3. [Blog & Articles](#blog--articles)
4. [Reviews](#reviews)
5. [Saved Items](#saved-items)
6. [Comparisons](#comparisons)
7. [Matching Engine](#matching-engine)
8. [User Profile](#user-profile)
9. [Referrals](#referrals)
10. [Admin Endpoints](#admin-endpoints)
11. [Micro Content](#micro-content)
12. [Static Pages](#static-pages)
13. [Orientation](#orientation)

---

## 🔐 Authentication

**Base Path**: `/api/auth`

### POST /auth/signup
Register a new user account.

**Request Body**:
```json
{
  "identifier": "user@example.com",  // Email or phone
  "email": "user@example.com",       // Optional if identifier is email
  "phone": "+1234567890",            // Optional
  "password": "securePassword123",   // Min 6 characters
  "accountType": "student",          // student | parent | counselor | university
  "referralCode": "ABC123"           // Optional
}
```

**Response** (201):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "phone": "+1234567890",
    "role": "user",
    "plan": "free",
    "accountType": "student",
    "created_at": "2025-11-10T12:00:00Z"
  }
}
```

**Errors**:
- `400`: Invalid input or user already exists
- `500`: Server error

---

### POST /auth/login
Authenticate existing user.

**Request Body**:
```json
{
  "identifier": "user@example.com",  // Email or phone
  "password": "securePassword123"
}
```

**Response** (200):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "user",
    "plan": "premium",
    "created_at": "2025-11-10T12:00:00Z"
  }
}
```

**Errors**:
- `400`: Invalid credentials
- `404`: User not found
- `500`: Server error

---

### POST /auth/forgot-password
Request password reset email.

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Response** (200):
```json
{
  "message": "Password reset email sent"
}
```

**Errors**:
- `404`: User not found
- `500`: Server error

---

### POST /auth/reset-password
Reset password with token.

**Request Body**:
```json
{
  "token": "reset-token-from-email",
  "password": "newSecurePassword123"
}
```

**Response** (200):
```json
{
  "message": "Password updated successfully"
}
```

**Errors**:
- `400`: Invalid or expired token
- `500`: Server error

---

### GET /auth/me
Get current user profile.

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "role": "user",
  "plan": "premium",
  "created_at": "2025-11-10T12:00:00Z"
}
```

**Errors**:
- `401`: Unauthorized (no token or invalid)
- `500`: Server error

---

## 🎓 Universities

**Base Path**: `/api/universities`

### GET /universities
Get all universities (public).

**Query Parameters**:
```
?state=CA              // Filter by state
?search=harvard        // Search by name
?type=public           // public | private
?limit=20              // Results per page
?offset=0              // Pagination offset
```

**Response** (200):
```json
[
  {
    "id": "uuid",
    "name": "Harvard University",
    "slug": "harvard-university",
    "state": "MA",
    "type": "private",
    "acceptance_rate": 3.4,
    "tuition_in_state": 57261,
    "tuition_out_state": 57261,
    "graduation_rate": 98,
    "student_population": 31000,
    "average_financial_aid": 55000,
    "logo_url": "https://...",
    "website": "https://harvard.edu",
    "created_at": "2025-11-10T12:00:00Z"
  }
]
```

---

### GET /universities/:slug
Get single university by slug (public).

**Response** (200):
```json
{
  "id": "uuid",
  "name": "Harvard University",
  "slug": "harvard-university",
  "state": "MA",
  "city": "Cambridge",
  "type": "private",
  "acceptance_rate": 3.4,
  "tuition_in_state": 57261,
  "tuition_out_state": 57261,
  "graduation_rate": 98,
  "student_population": 31000,
  "average_financial_aid": 55000,
  "employment_rate": 95,
  "average_starting_salary": 75000,
  "description": "Founded in 1636...",
  "logo_url": "https://...",
  "website": "https://harvard.edu",
  "created_at": "2025-11-10T12:00:00Z"
}
```

**Errors**:
- `404`: University not found
- `500`: Server error

---

### GET /universities/:universityId/micro-content
Get micro-content (quick tips) for a university.

**Response** (200):
```json
[
  {
    "id": "uuid",
    "university_id": "uuid",
    "category": "application_tips",
    "title": "Early Action Deadline",
    "content": "Harvard offers single-choice early action...",
    "priority": 1,
    "created_at": "2025-11-10T12:00:00Z"
  }
]
```

---

## 📝 Blog & Articles

**Base Path**: `/api/blog`

### GET /blog
Get all published articles.

**Query Parameters**:
```
?category=admissions   // Filter by category
?limit=20              // Results per page
?offset=0              // Pagination offset
```

**Response** (200):
```json
[
  {
    "id": "uuid",
    "title": "How to Write a College Essay",
    "slug": "how-to-write-college-essay",
    "excerpt": "Learn the secrets to crafting...",
    "content": "Full article content...",
    "category": "admissions",
    "category_type": "standard",
    "author_id": "uuid",
    "author_name": "John Doe",
    "featured_image": "https://...",
    "published": true,
    "premium": false,
    "meta_title": "College Essay Writing Guide",
    "meta_description": "Complete guide...",
    "view_count": 1234,
    "created_at": "2025-11-10T12:00:00Z",
    "updated_at": "2025-11-10T12:00:00Z"
  }
]
```

---

### GET /blog/:slug
Get single article by slug.

**Response** (200):
```json
{
  "id": "uuid",
  "title": "How to Write a College Essay",
  "slug": "how-to-write-college-essay",
  "content": "Full article content in markdown...",
  "excerpt": "Learn the secrets...",
  "category": "admissions",
  "author_id": "uuid",
  "author_name": "John Doe",
  "featured_image": "https://...",
  "published": true,
  "premium": false,
  "meta_title": "College Essay Writing Guide",
  "meta_description": "Complete guide...",
  "view_count": 1234,
  "created_at": "2025-11-10T12:00:00Z"
}
```

**Errors**:
- `404`: Article not found
- `403`: Premium content requires authentication
- `500`: Server error

---

### POST /blog/:slug/view
Track article view (analytics).

**Headers**:
```
Authorization: Bearer <token>  // Optional
```

**Response** (201):
```json
{
  "message": "View tracked",
  "view_count": 1235
}
```

---

### GET /blog/:slug/comments
Get comments for an article.

**Response** (200):
```json
[
  {
    "id": "uuid",
    "article_id": "uuid",
    "user_id": "uuid",
    "user_name": "Jane Doe",
    "content": "Great article!",
    "parent_comment_id": null,
    "created_at": "2025-11-10T12:00:00Z",
    "replies": [
      {
        "id": "uuid",
        "content": "Thanks!",
        "user_name": "Author",
        "created_at": "2025-11-10T12:30:00Z"
      }
    ]
  }
]
```

---

### POST /blog/:slug/comments
Create a comment (requires auth).

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "content": "Great article!",
  "parent_comment_id": "uuid"  // Optional for replies
}
```

**Response** (201):
```json
{
  "id": "uuid",
  "article_id": "uuid",
  "user_id": "uuid",
  "content": "Great article!",
  "created_at": "2025-11-10T12:00:00Z"
}
```

**Errors**:
- `401`: Unauthorized
- `400`: Invalid input
- `500`: Server error

---

### DELETE /blog/:slug/comments/:commentId
Delete own comment (requires auth).

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "message": "Comment deleted"
}
```

**Errors**:
- `401`: Unauthorized
- `403`: Not comment owner
- `404`: Comment not found
- `500`: Server error

---

## ⭐ Reviews

**Base Path**: `/api/reviews`

### GET /reviews
Get all reviews for a university.

**Query Parameters**:
```
?universityId=uuid     // Required
?limit=20              // Results per page
?offset=0              // Pagination offset
```

**Response** (200):
```json
[
  {
    "id": "uuid",
    "university_id": "uuid",
    "user_id": "uuid",
    "user_name": "Student Name",
    "rating": 4.5,
    "academic_rating": 5,
    "campus_rating": 4,
    "career_rating": 5,
    "social_rating": 4,
    "title": "Great experience!",
    "content": "I loved my time here...",
    "verified": true,
    "helpful_count": 42,
    "created_at": "2025-11-10T12:00:00Z"
  }
]
```

---

### POST /reviews
Create a review (requires auth).

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "university_id": "uuid",
  "rating": 4.5,
  "academic_rating": 5,
  "campus_rating": 4,
  "career_rating": 5,
  "social_rating": 4,
  "title": "Great experience!",
  "content": "I loved my time here..."
}
```

**Response** (201):
```json
{
  "id": "uuid",
  "university_id": "uuid",
  "user_id": "uuid",
  "rating": 4.5,
  "created_at": "2025-11-10T12:00:00Z"
}
```

**Errors**:
- `401`: Unauthorized
- `400`: Invalid input or duplicate review
- `500`: Server error

---

## 💾 Saved Items

**Base Path**: `/api/saved-items`

### GET /saved-items
Get user's saved universities (requires auth).

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200):
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "university_id": "uuid",
    "university": {
      "name": "Harvard University",
      "slug": "harvard-university",
      "logo_url": "https://..."
    },
    "notes": "My top choice",
    "created_at": "2025-11-10T12:00:00Z"
  }
]
```

---

### POST /saved-items
Save a university (requires auth).

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "university_id": "uuid",
  "notes": "My top choice"  // Optional
}
```

**Response** (201):
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "university_id": "uuid",
  "created_at": "2025-11-10T12:00:00Z"
}
```

**Errors**:
- `401`: Unauthorized
- `400`: Already saved or invalid input
- `500`: Server error

---

### DELETE /saved-items/:id
Remove saved university (requires auth).

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "message": "University removed from saved items"
}
```

**Errors**:
- `401`: Unauthorized
- `403`: Not owner
- `404`: Not found
- `500`: Server error

---

## 🔄 Comparisons

**Base Path**: `/api/compare`

### POST /compare
Save a comparison (requires auth).

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "university_ids": ["uuid1", "uuid2", "uuid3"],
  "name": "My Top 3 Choices"  // Optional
}
```

**Response** (201):
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "university_ids": ["uuid1", "uuid2", "uuid3"],
  "name": "My Top 3 Choices",
  "created_at": "2025-11-10T12:00:00Z"
}
```

---

### GET /compare
Get user's saved comparisons (requires auth).

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200):
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "university_ids": ["uuid1", "uuid2"],
    "name": "My Top Choices",
    "universities": [
      {
        "id": "uuid1",
        "name": "Harvard",
        "slug": "harvard-university"
      },
      {
        "id": "uuid2",
        "name": "MIT",
        "slug": "mit"
      }
    ],
    "created_at": "2025-11-10T12:00:00Z"
  }
]
```

---

## 🎯 Matching Engine

**Base Path**: `/api/matching`

### POST /matching/results
Get university matches based on criteria (requires auth).

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "preferences": {
    "location": ["CA", "NY"],
    "type": "private",
    "majors": ["Computer Science"],
    "budget": 50000,
    "gpa": 3.8,
    "sat": 1450
  }
}
```

**Response** (200):
```json
{
  "matches": [
    {
      "university": {
        "id": "uuid",
        "name": "Stanford University",
        "slug": "stanford"
      },
      "match_score": 95,
      "reasons": [
        "Strong CS program",
        "Located in California",
        "Within budget with aid"
      ]
    }
  ]
}
```

---

## 👤 User Profile

**Base Path**: `/api/profile`

### GET /profile
Get current user's profile (requires auth).

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "phone": "+1234567890",
  "first_name": "John",
  "last_name": "Doe",
  "account_type": "student",
  "role": "user",
  "plan": "premium",
  "bio": "High school senior...",
  "avatar_url": "https://...",
  "created_at": "2025-11-10T12:00:00Z"
}
```

---

### PATCH /profile
Update user profile (requires auth).

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "bio": "Updated bio...",
  "avatar_url": "https://..."
}
```

**Response** (200):
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "bio": "Updated bio...",
  "updated_at": "2025-11-10T12:00:00Z"
}
```

---

## 🎁 Referrals

**Base Path**: `/api/referrals`

### GET /referrals
Get user's referral stats (requires auth).

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "referral_code": "ABC123",
  "referral_link": "https://academora.com/signup?ref=ABC123",
  "total_referrals": 10,
  "successful_referrals": 7,
  "earnings": 140.00,
  "referrals": [
    {
      "id": "uuid",
      "referred_email": "friend@example.com",
      "status": "completed",
      "created_at": "2025-11-10T12:00:00Z"
    }
  ]
}
```

---

### POST /referrals/generate
Generate referral code (requires auth).

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (201):
```json
{
  "referral_code": "ABC123",
  "referral_link": "https://academora.com/signup?ref=ABC123"
}
```

---

## 🔧 Admin Endpoints

**Base Path**: `/api/admin`

All admin endpoints require:
```
Authorization: Bearer <token>
X-User-Role: admin
```

### GET /admin/universities
List all universities (admin).

**Response** (200): Same as `/api/universities` but includes unpublished

---

### POST /admin/universities
Create university (admin).

**Request Body**:
```json
{
  "name": "New University",
  "slug": "new-university",
  "state": "CA",
  "type": "public",
  "tuition_in_state": 15000,
  "acceptance_rate": 45
  // ... other fields
}
```

---

### PATCH /admin/universities/:id
Update university (admin).

---

### DELETE /admin/universities/:id
Delete university (admin).

---

### GET /admin/users
List all users (admin).

---

### PATCH /admin/users/:id
Update user (admin, change role/plan).

---

### GET /admin/analytics
Get platform analytics (admin).

**Response** (200):
```json
{
  "total_users": 10000,
  "total_universities": 500,
  "total_articles": 200,
  "active_users_today": 150,
  "top_universities": [],
  "top_articles": []
}
```

---

## 💡 Micro Content

**Base Path**: `/api/micro-content`

### GET /micro-content
Get all micro-content (admin).

---

### POST /micro-content
Create micro-content (admin).

**Request Body**:
```json
{
  "university_id": "uuid",
  "category": "application_tips",
  "title": "Early Action Deadline",
  "content": "Deadline is November 1st",
  "priority": 1
}
```

---

## 📄 Static Pages

**Base Path**: `/api/static-pages`

### GET /static-pages
Get all static pages.

**Response** (200):
```json
[
  {
    "id": "uuid",
    "slug": "about",
    "title": "About Us",
    "content": "Page content...",
    "meta_title": "About AcademOra",
    "meta_description": "Learn about us",
    "published": true
  }
]
```

---

### GET /static-pages/:slug
Get single static page by slug.

---

## 🧭 Orientation

**Base Path**: `/api/orientation`

### GET /orientation
Get orientation resources.

**Query Parameters**:
```
?category=fields       // fields | schools | study-abroad | procedures | comparisons
```

**Response** (200):
```json
[
  {
    "id": "uuid",
    "title": "Engineering Fields Overview",
    "slug": "engineering-fields-overview",
    "content": "Full content...",
    "category": "fields",
    "featured": true,
    "premium": false,
    "created_at": "2025-11-10T12:00:00Z"
  }
]
```

---

### GET /orientation/:slug
Get single orientation resource.

---

## 📤 File Upload

**Base Path**: `/api/upload`

### POST /upload/image
Upload image (requires auth).

**Headers**:
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body** (form-data):
```
file: <image file>
```

**Response** (200):
```json
{
  "url": "https://supabase.co/storage/v1/object/public/uploads/filename.jpg"
}
```

**Errors**:
- `401`: Unauthorized
- `400`: Invalid file type or size
- `500`: Upload failed

---

## 🔒 Authentication Patterns

### Bearer Token
All protected endpoints require:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Expiry
- Tokens expire after 7 days
- Refresh by calling `/api/auth/me`
- 401 response requires re-authentication

---

## ⚠️ Error Response Format

All errors follow this structure:

```json
{
  "error": "Error message here",
  "code": "ERROR_CODE",  // Optional
  "details": {}          // Optional additional info
}
```

**Common Status Codes**:
- `200`: Success
- `201`: Created
- `400`: Bad Request (invalid input)
- `401`: Unauthorized (missing/invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error

---

## 🔗 Related Documentation

- **Database schema**: See DATABASE_SCHEMA.md
- **Service layer**: See FILE_REGISTRY.md (Services section)
- **Frontend usage**: See ARCHITECTURE.md (Data Fetching Pattern)
- **Authentication flow**: See ARCHITECTURE.md (Security Architecture)

---

## 📝 Maintenance

**Update this file when:**
- ✅ Adding new endpoints
- ✅ Changing request/response schemas
- ✅ Modifying authentication requirements
- ✅ Adding new query parameters
- ✅ Changing error responses

**Last Major Updates:**
- 2025-11-10: Initial comprehensive documentation
