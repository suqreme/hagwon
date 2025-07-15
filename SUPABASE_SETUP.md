# 🗄️ Supabase Database Setup Guide

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" → Sign up with GitHub
3. Click "New Project"
4. **Organization:** Create new or select existing
5. **Project Name:** `eduroot-production` (or similar)
6. **Database Password:** Generate strong password (save it!)
7. **Region:** Choose closest to your target users
8. Click "Create new project"

## Step 2: Run Database Schema

1. In Supabase dashboard → **SQL Editor**
2. Copy the entire contents of `supabase/schema.sql`
3. Paste and click "Run"
4. ✅ All tables and security policies will be created

## Step 3: Get Environment Variables

In Supabase dashboard → **Settings** → **API**:

```bash
# Copy these to Vercel Environment Variables
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 4: Configure Authentication

In Supabase dashboard → **Authentication** → **Settings**:

1. **Site URL:** `https://www.hagwon.app` (your production domain)
2. **Redirect URLs:** Add:
   - `https://www.hagwon.app/auth/callback`
   - `http://localhost:3000/auth/callback` (for development)

3. **Email Templates:** Customize signup/reset emails with your branding

**IMPORTANT:** Make sure to update your live domain in the Site URL and Redirect URLs, otherwise email confirmations will redirect to localhost!

## Step 5: Enable Authentication Providers

**Authentication** → **Providers**:
- ✅ **Email** (enabled by default)
- ✅ **Google** (optional - for easier signup)
- ✅ **GitHub** (optional - for developers)

## Step 6: Add to Vercel

In Vercel dashboard → **Settings** → **Environment Variables**:

1. Add the three environment variables from Step 3
2. **Redeploy** your application
3. ✅ Database features now work!

## 🎯 What This Enables

### ✅ User Features
- Account creation & login
- Progress tracking across lessons
- Quiz results saved
- Achievement system
- Subscription management

### ✅ Admin Features  
- View all users
- Manage help requests
- Track platform usage
- Donor management

### ✅ Community Features
- Help request submissions
- Impact tracking
- Donation coordination

## 🚀 Testing Database

After setup, test these features:
1. **Signup:** Create account on your live site
2. **Login:** Sign in successfully  
3. **Lesson:** Complete a lesson, check progress saves
4. **Quiz:** Take quiz, verify results stored
5. **Help Request:** Submit community support request

## 🔒 Security Features

- **Row Level Security:** Users only access their own data
- **Real-time subscriptions:** Live updates
- **Automatic backups:** Daily database backups
- **SSL encryption:** All data encrypted in transit

## 📊 Database Tables Created

1. **user_profiles** - User accounts & settings
2. **user_progress** - Lesson completion tracking  
3. **lessons** - AI-generated lesson content
4. **quiz_results** - Quiz scores & answers
5. **user_gamification** - XP, badges, achievements
6. **subscriptions** - Payment & hardship management
7. **help_requests** - Community support requests
8. **offline_content** - Downloaded lessons for offline use

Your EduRoot platform now has enterprise-grade data management! 🌍

## 🐛 Troubleshooting

### Issue: "Database error" or "Failed to fetch user profile"

**Quick Fix for Development:**
1. In Supabase Dashboard → SQL Editor
2. Run the contents of `supabase/disable_rls_temporarily.sql`
3. This disables Row Level Security for testing

**Proper Fix:**
1. Ensure the database schema is applied correctly
2. Check that the `handle_new_user()` trigger is working
3. Verify environment variables are set in Vercel

### Issue: Admin redirect not working

**Solution:**
1. Create a user account normally through the app
2. In Supabase Dashboard → SQL Editor  
3. Run the contents of `supabase/create_admin_user.sql`
4. Update the email to match your account

### Issue: Subscription features not working

**Check:**
1. Database tables `subscriptions` and `hardship_requests` exist
2. User profile has correct `subscription_plan` field
3. AuthContext `canAccessFeature()` function works

### Enable Debug Logging

Add to your `.env.local`:
```bash
NEXT_PUBLIC_DEBUG_AUTH=true
```

This will show detailed authentication logs in the browser console.