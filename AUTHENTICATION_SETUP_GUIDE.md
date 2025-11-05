# Role-Based Authentication Setup Guide

This guide explains how to set up admin and user authentication in AcademOra.

## ✅ Code Changes Completed

All code changes have been implemented:
- ✅ Database schema updated (role column added)
- ✅ Backend authentication updated (JWT includes role)
- ✅ Admin routes protected with `requireAdmin` middleware
- ✅ Frontend components updated (Navbar & Dashboard check role)
- ✅ Admin user creation script created

## 📋 Required Supabase Setup

### Step 1: Add Role Column to Users Table

You need to run SQL in Supabase to add the `role` column:

1. Go to **Supabase Dashboard** → Your Project
2. Navigate to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Open the file `server/database/add-role-column.sql` from your project
5. Copy ALL the SQL code
6. Paste into the SQL Editor
7. Click **Run** (or press Ctrl+Enter / Cmd+Enter)
8. You should see "Success" message

**What this does:**
- Adds `role` column to `users` table (default: 'user')
- Adds constraint: role must be 'user' or 'admin'
- Creates index for faster role lookups
- Sets existing users to 'user' role

### Step 2: Create Your First Admin User

You have **2 options**:

#### Option A: Using the Script (Recommended)
```bash
npm run db:create-admin your-email@example.com YourPassword123
```

**Example:**
```bash
npm run db:create-admin admin@academora.com AdminPassword123!
```

This will:
- Create a new admin user if email doesn't exist
- OR update existing user to admin role

#### Option B: Using SQL in Supabase
1. First, sign up a regular user through `/signup` page
2. Go to **Supabase Dashboard** → **SQL Editor**
3. Run this SQL (replace email with your admin email):
```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'your-admin-email@example.com';
```

## 🧪 Testing Your Setup

### Test Regular User:
1. Go to `/signup` and create a new account
2. User should have `role: 'user'` (default)
3. User can access `/dashboard` but NOT `/admin`
4. Admin link should NOT appear in navbar

### Test Admin User:
1. Create admin user using script or SQL
2. Login with admin credentials
3. Admin should see "Admin" link in navbar
4. Admin can access `/admin` dashboard
5. Admin can manage articles (create, edit, delete)

## 🔒 How It Works

### Backend:
- **Signup**: Always creates users with `role: 'user'`
- **Login**: JWT token includes `role` field
- **Protected Routes**: 
  - `/api/admin/*` requires `authenticateToken` + `requireAdmin`
  - Regular users get 403 error when accessing admin routes

### Frontend:
- **Navbar**: Shows "Admin" link only if `user.role === 'admin'`
- **Dashboard**: Shows admin section only for admins
- **Role Check**: Automatically checks role from JWT token

## 🛠️ Troubleshooting

### Issue: "Admin access required" error
- **Cause**: User doesn't have admin role
- **Fix**: Make sure you ran the SQL to add role column, then create admin user

### Issue: Admin link not showing
- **Cause**: User role not included in JWT or not updated in localStorage
- **Fix**: Log out and log back in to refresh token

### Issue: Cannot create admin user
- **Cause**: Role column doesn't exist or script has error
- **Fix**: 
  1. Run `server/database/add-role-column.sql` in Supabase
  2. Verify column exists: Check Table Editor → users table → should see `role` column

### Issue: Getting 403 on admin routes
- **Cause**: JWT token doesn't include role or role is not 'admin'
- **Fix**: 
  1. Make sure role column exists
  2. Verify user has `role: 'admin'` in database
  3. Log out and log back in to get new JWT with role

## 📝 Quick Reference

### Create Admin User:
```bash
npm run db:create-admin email@example.com password
```

### Check User Role (SQL):
```sql
SELECT id, email, role FROM users;
```

### Update User to Admin (SQL):
```sql
UPDATE users SET role = 'admin' WHERE email = 'email@example.com';
```

### Make Admin Regular User (SQL):
```sql
UPDATE users SET role = 'user' WHERE email = 'email@example.com';
```

## ✅ Verification Checklist

- [ ] Role column added to users table (run `add-role-column.sql`)
- [ ] Admin user created (using script or SQL)
- [ ] Can login as regular user (should see dashboard, no admin link)
- [ ] Can login as admin (should see admin link in navbar)
- [ ] Admin can access `/admin` route
- [ ] Regular user gets 403 when accessing `/admin` route

## 🎉 Next Steps

Once setup is complete:
1. Login as admin and test article management
2. Create test regular users to verify they can't access admin
3. Test that admin can create/edit/delete articles
4. Verify frontend shows/hides admin features based on role

---

**Need help?** Check the error messages - they tell you exactly what's wrong!

