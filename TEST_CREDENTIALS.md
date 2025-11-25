# 🧪 Test User Credentials

This file contains login credentials for testing and development.

## 👥 Test Users

### 1. 🔴 ADMIN User
- **Email:** `admin@academora.com`
- **Password:** `Admin123!`
- **Username:** `admin`
- **Role:** `admin`
- **Account Type:** `student`
- **Plan:** `premium`
- **Status:** Active, Email Verified

**Use this account for:**
- Admin dashboard access
- Content management
- User management
- System configuration

---

### 2. 🟢 Student User (Free Plan)
- **Email:** `student@academora.com`
- **Password:** `Student123!`
- **Username:** `jstudent`
- **Role:** `user`
- **Account Type:** `student`
- **Plan:** `free`
- **Status:** Active, Email Verified

**Use this account for:**
- Testing free user features
- Student-specific functionality
- Basic feature access

---

### 3. 🟡 Parent User (Premium Plan)
- **Email:** `parent@academora.com`
- **Password:** `Parent123!`
- **Username:** `sparent`
- **Role:** `user`
- **Account Type:** `parent`
- **Plan:** `premium`
- **Status:** Active, Email Verified

**Use this account for:**
- Testing premium features
- Parent-specific functionality
- Advanced feature access

---

### 4. 🔵 Counselor User (Premium Plan)
- **Email:** `counselor@academora.com`
- **Password:** `Counselor123!`
- **Username:** `mcounselor`
- **Role:** `user`
- **Account Type:** `counselor`
- **Plan:** `premium`
- **Status:** Active, Email Verified

**Use this account for:**
- Testing counselor features
- Professional account functionality
- Premium feature access

---

### 5. 🟣 Developer User (Free Plan)
- **Email:** `developer@academora.com`
- **Password:** `Dev123!`
- **Username:** `adeveloper`
- **Role:** `user`
- **Account Type:** `student`
- **Plan:** `free`
- **Status:** Active, Email Verified

**Use this account for:**
- Testing free user limitations
- Development and debugging
- Feature testing

---

## 📊 Mock Data Created

The database has been populated with:

- ✅ **5 Test Users** (as listed above)
- ✅ **8 Universities** (Harvard, MIT, Stanford, UC Berkeley, Yale, Princeton, Columbia, Michigan)
- ✅ **3 Articles** (Admissions guides, Financial aid, College applications)
- ✅ **5 Reviews** (User reviews for universities)
- ✅ **5 Saved Items** (Users have saved universities)

## 🔄 Re-seeding the Database

To re-run the seed script and populate fresh data:

```bash
npm run db:seed-mock
```

**Note:** The script will skip existing records, so it's safe to run multiple times.

## 🗑️ Clearing Test Data

To clear all test data and start fresh:

1. Connect to your database
2. Delete records from tables (in order):
   - `saved_items`
   - `reviews`
   - `articles`
   - `universities`
   - `users`

Or use SQL:
```sql
TRUNCATE TABLE saved_items, reviews, articles, universities, users CASCADE;
```

Then re-run: `npm run db:seed-mock`

---

## 🔐 Security Note

⚠️ **IMPORTANT:** These are test credentials for development only. Never use these in production!

- Change all passwords in production
- Use strong, unique passwords
- Enable additional security measures
- Never commit this file to public repositories

---

## 📝 Quick Reference

| Role | Email | Password | Plan |
|------|-------|----------|------|
| Admin | admin@academora.com | Admin123! | Premium |
| Student | student@academora.com | Student123! | Free |
| Parent | parent@academora.com | Parent123! | Premium |
| Counselor | counselor@academora.com | Counselor123! | Premium |
| Developer | developer@academora.com | Dev123! | Free |

---

**Last Updated:** After database seeding
**Database:** Neon PostgreSQL

