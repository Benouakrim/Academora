-- CreateEnum
CREATE TYPE "LimitType" AS ENUM ('count', 'unlimited');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "ReferralStatus" AS ENUM ('pending', 'completed', 'rewarded');

-- CreateEnum
CREATE TYPE "ArticleStatus" AS ENUM ('draft', 'pending', 'approved', 'rejected', 'published');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'suspended', 'deleted');

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('student', 'parent', 'counselor', 'university');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('user', 'admin', 'moderator');

-- CreateEnum
CREATE TYPE "UserPlan" AS ENUM ('free', 'premium', 'enterprise');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" VARCHAR(255),
    "phone" VARCHAR(20),
    "password" VARCHAR(255),
    "clerk_id" VARCHAR(255),
    "first_name" VARCHAR(100),
    "last_name" VARCHAR(100),
    "full_name" VARCHAR(200),
    "username" VARCHAR(50),
    "bio" TEXT,
    "avatar_url" VARCHAR(500),
    "date_of_birth" DATE,
    "title" VARCHAR(100),
    "headline" VARCHAR(255),
    "location" VARCHAR(200),
    "website_url" VARCHAR(500),
    "linkedin_url" VARCHAR(500),
    "github_url" VARCHAR(500),
    "twitter_url" VARCHAR(500),
    "portfolio_url" VARCHAR(500),
    "persona_role" VARCHAR(100),
    "focus_area" TEXT,
    "primary_goal" TEXT,
    "timeline" VARCHAR(100),
    "organization_name" VARCHAR(255),
    "organization_type" VARCHAR(100),
    "is_profile_public" BOOLEAN NOT NULL DEFAULT true,
    "show_email" BOOLEAN NOT NULL DEFAULT false,
    "show_saved" BOOLEAN NOT NULL DEFAULT false,
    "show_reviews" BOOLEAN NOT NULL DEFAULT true,
    "show_socials" BOOLEAN NOT NULL DEFAULT true,
    "show_activity" BOOLEAN NOT NULL DEFAULT true,
    "account_type" "AccountType" NOT NULL DEFAULT 'student',
    "role" "UserRole" NOT NULL DEFAULT 'user',
    "plan" "UserPlan" NOT NULL DEFAULT 'free',
    "plan_id" UUID,
    "subscription_status" TEXT,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "phone_verified" BOOLEAN NOT NULL DEFAULT false,
    "status" "UserStatus" NOT NULL DEFAULT 'active',
    "referral_code" VARCHAR(20),
    "referred_by" UUID,
    "referred_by_code" VARCHAR(20),
    "referral_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_login_at" TIMESTAMPTZ(6),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "universities" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "logo_url" VARCHAR(500),
    "website" VARCHAR(255),
    "address" VARCHAR(255),
    "city" VARCHAR(100),
    "state" VARCHAR(2),
    "zip_code" VARCHAR(10),
    "country" VARCHAR(100) NOT NULL DEFAULT 'USA',
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "type" VARCHAR(50),
    "classification" VARCHAR(100),
    "religious_affiliation" VARCHAR(100),
    "acceptance_rate" DECIMAL(5,2),
    "application_deadline" DATE,
    "early_decision_deadline" DATE,
    "tuition_in_state" DECIMAL(10,2),
    "tuition_out_state" DECIMAL(10,2),
    "room_and_board" DECIMAL(10,2),
    "total_cost_in_state" DECIMAL(10,2),
    "total_cost_out_state" DECIMAL(10,2),
    "average_financial_aid" DECIMAL(10,2),
    "percent_receiving_aid" DECIMAL(5,2),
    "average_net_price" DECIMAL(10,2),
    "student_population" INTEGER,
    "undergraduate_population" INTEGER,
    "graduate_population" INTEGER,
    "student_faculty_ratio" VARCHAR(10),
    "percent_male" DECIMAL(5,2),
    "percent_female" DECIMAL(5,2),
    "graduation_rate" DECIMAL(5,2),
    "retention_rate" DECIMAL(5,2),
    "employment_rate" DECIMAL(5,2),
    "average_starting_salary" DECIMAL(10,2),
    "sat_math_25" INTEGER,
    "sat_math_75" INTEGER,
    "sat_verbal_25" INTEGER,
    "sat_verbal_75" INTEGER,
    "act_composite_25" INTEGER,
    "act_composite_75" INTEGER,
    "average_gpa" DECIMAL(3,2),
    "rankings" JSONB,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "claimed" BOOLEAN NOT NULL DEFAULT false,
    "premium" BOOLEAN NOT NULL DEFAULT false,
    "meta_title" VARCHAR(255),
    "meta_description" TEXT,
    "meta_keywords" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "universities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "university_groups" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "logo_url" VARCHAR(500),
    "website" VARCHAR(255),
    "member_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "university_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "university_group_members" (
    "university_id" UUID NOT NULL,
    "group_id" UUID NOT NULL,
    "joined_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "university_group_members_pkey" PRIMARY KEY ("university_id","group_id")
);

-- CreateTable
CREATE TABLE "articles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "featured_image" VARCHAR(500),
    "category" VARCHAR(100) NOT NULL,
    "category_type" VARCHAR(50) NOT NULL DEFAULT 'standard',
    "tags" TEXT[],
    "author_id" UUID,
    "author_name" VARCHAR(255),
    "published" BOOLEAN NOT NULL DEFAULT false,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "premium" BOOLEAN NOT NULL DEFAULT false,
    "allow_comments" BOOLEAN NOT NULL DEFAULT true,
    "status" "ArticleStatus" NOT NULL DEFAULT 'published',
    "submitted_at" TIMESTAMPTZ(6),
    "reviewed_at" TIMESTAMPTZ(6),
    "reviewed_by" UUID,
    "rejection_reason" TEXT,
    "meta_title" VARCHAR(255),
    "meta_description" TEXT,
    "meta_keywords" TEXT,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "published_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "university_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "rating" DECIMAL(2,1) NOT NULL,
    "academic_rating" DECIMAL(2,1),
    "campus_rating" DECIMAL(2,1),
    "career_rating" DECIMAL(2,1),
    "social_rating" DECIMAL(2,1),
    "title" VARCHAR(255),
    "content" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "anonymous" BOOLEAN NOT NULL DEFAULT false,
    "helpful_count" INTEGER NOT NULL DEFAULT 0,
    "status" "ReviewStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "university_id" UUID NOT NULL,
    "notes" TEXT,
    "folder" VARCHAR(100),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_comparisons" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "name" VARCHAR(255),
    "university_ids" UUID[],
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_comparisons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referrals" (
    "id" SERIAL NOT NULL,
    "referrer_id" UUID NOT NULL,
    "referred_id" UUID NOT NULL,
    "referral_code" VARCHAR(20) NOT NULL,
    "status" "ReferralStatus" NOT NULL DEFAULT 'pending',
    "completed_at" TIMESTAMPTZ(6),
    "reward_given" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "referrals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referral_codes" (
    "id" SERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "total_uses" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "expires_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "referral_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referral_rewards" (
    "id" SERIAL NOT NULL,
    "referral_id" INTEGER NOT NULL,
    "referrer_id" UUID NOT NULL,
    "referred_id" UUID NOT NULL,
    "reward_type" VARCHAR(50) NOT NULL,
    "reward_value" TEXT NOT NULL,
    "applied" BOOLEAN NOT NULL DEFAULT false,
    "applied_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "referral_rewards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referral_settings" (
    "id" SERIAL NOT NULL,
    "setting_key" VARCHAR(100) NOT NULL,
    "setting_value" TEXT NOT NULL,
    "description" TEXT,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "referral_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_views" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "article_id" UUID NOT NULL,
    "user_id" UUID,
    "session_id" VARCHAR(255),
    "ip_address" INET,
    "user_agent" TEXT,
    "referrer" VARCHAR(500),
    "country" VARCHAR(100),
    "device_type" VARCHAR(50),
    "viewed_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "article_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_comments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "article_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "parent_comment_id" UUID,
    "status" VARCHAR(20) NOT NULL DEFAULT 'approved',
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "downvotes" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "article_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "micro_content" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "university_id" UUID,
    "category" VARCHAR(100) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "micro_content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orientation_resources" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "premium" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orientation_resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "static_pages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "slug" VARCHAR(255) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "meta_title" VARCHAR(255),
    "meta_description" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "static_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_videos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "description" TEXT,
    "video_url" TEXT,
    "embed_code" TEXT,
    "thumbnail_url" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "site_videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "university_claims" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "university_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "position" VARCHAR(100),
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20),
    "documentation_url" VARCHAR(500),
    "message" TEXT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "reviewed_by" UUID,
    "reviewed_at" TIMESTAMPTZ(6),
    "admin_notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "university_claims_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_financial_profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "household_income" DECIMAL(12,2),
    "family_size" INTEGER,
    "savings" DECIMAL(12,2),
    "investments" DECIMAL(12,2),
    "college_savings_529" DECIMAL(12,2),
    "expected_family_contribution" DECIMAL(10,2),
    "eligible_for_pell_grant" BOOLEAN NOT NULL DEFAULT false,
    "eligible_for_state_aid" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_financial_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "link" VARCHAR(500),
    "read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_preferences" (
    "user_id" UUID NOT NULL,
    "weight_tuition" DECIMAL(4,3) NOT NULL DEFAULT 0.5,
    "weight_location" DECIMAL(4,3) NOT NULL DEFAULT 0.5,
    "weight_ranking" DECIMAL(4,3) NOT NULL DEFAULT 0.5,
    "weight_program" DECIMAL(4,3) NOT NULL DEFAULT 0.5,
    "weight_language" DECIMAL(4,3) NOT NULL DEFAULT 0.5,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "taxonomies" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "taxonomies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "taxonomy_terms" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "taxonomy_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "taxonomy_terms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_terms" (
    "article_id" UUID NOT NULL,
    "term_id" UUID NOT NULL,

    CONSTRAINT "article_terms_pkey" PRIMARY KEY ("article_id","term_id")
);

-- CreateTable
CREATE TABLE "plans" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "price" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "features" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_features" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "plan_id" UUID NOT NULL,
    "feature_key" TEXT NOT NULL,
    "access_level" "LimitType" NOT NULL DEFAULT 'count',
    "limit_value" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "plan_features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_feature_usage" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "feature_key" TEXT NOT NULL,
    "used_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_feature_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "anonymous_feature_usage" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "identifier" TEXT NOT NULL,
    "feature_key" TEXT NOT NULL,
    "used_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "anonymous_feature_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_settings" (
    "key" VARCHAR(100) NOT NULL,
    "value" TEXT NOT NULL,
    "type" VARCHAR(20) NOT NULL DEFAULT 'string',
    "description" TEXT,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "article_performance_stats" (
    "id" SERIAL NOT NULL,
    "article_id" UUID NOT NULL,
    "date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "views" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "article_performance_stats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_clerk_id_key" ON "users"("clerk_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_referral_code_key" ON "users"("referral_code");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_username_idx" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_referral_code_idx" ON "users"("referral_code");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_plan_idx" ON "users"("plan");

-- CreateIndex
CREATE INDEX "users_clerk_id_idx" ON "users"("clerk_id");

-- CreateIndex
CREATE INDEX "users_organization_name_idx" ON "users"("organization_name");

-- CreateIndex
CREATE INDEX "users_persona_role_idx" ON "users"("persona_role");

-- CreateIndex
CREATE UNIQUE INDEX "universities_slug_key" ON "universities"("slug");

-- CreateIndex
CREATE INDEX "universities_slug_idx" ON "universities"("slug");

-- CreateIndex
CREATE INDEX "universities_state_idx" ON "universities"("state");

-- CreateIndex
CREATE INDEX "universities_type_idx" ON "universities"("type");

-- CreateIndex
CREATE INDEX "universities_verified_idx" ON "universities"("verified");

-- CreateIndex
CREATE UNIQUE INDEX "university_groups_slug_key" ON "university_groups"("slug");

-- CreateIndex
CREATE INDEX "university_group_members_university_id_idx" ON "university_group_members"("university_id");

-- CreateIndex
CREATE INDEX "university_group_members_group_id_idx" ON "university_group_members"("group_id");

-- CreateIndex
CREATE UNIQUE INDEX "articles_slug_key" ON "articles"("slug");

-- CreateIndex
CREATE INDEX "articles_slug_idx" ON "articles"("slug");

-- CreateIndex
CREATE INDEX "articles_category_idx" ON "articles"("category");

-- CreateIndex
CREATE INDEX "articles_published_idx" ON "articles"("published");

-- CreateIndex
CREATE INDEX "articles_author_id_idx" ON "articles"("author_id");

-- CreateIndex
CREATE INDEX "articles_status_idx" ON "articles"("status");

-- CreateIndex
CREATE INDEX "articles_author_id_status_idx" ON "articles"("author_id", "status");

-- CreateIndex
CREATE INDEX "reviews_university_id_idx" ON "reviews"("university_id");

-- CreateIndex
CREATE INDEX "reviews_user_id_idx" ON "reviews"("user_id");

-- CreateIndex
CREATE INDEX "reviews_rating_idx" ON "reviews"("rating");

-- CreateIndex
CREATE INDEX "reviews_status_idx" ON "reviews"("status");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_university_id_user_id_key" ON "reviews"("university_id", "user_id");

-- CreateIndex
CREATE INDEX "saved_items_user_id_idx" ON "saved_items"("user_id");

-- CreateIndex
CREATE INDEX "saved_items_university_id_idx" ON "saved_items"("university_id");

-- CreateIndex
CREATE INDEX "saved_items_folder_idx" ON "saved_items"("folder");

-- CreateIndex
CREATE UNIQUE INDEX "saved_items_user_id_university_id_key" ON "saved_items"("user_id", "university_id");

-- CreateIndex
CREATE INDEX "saved_comparisons_user_id_idx" ON "saved_comparisons"("user_id");

-- CreateIndex
CREATE INDEX "referrals_referrer_id_idx" ON "referrals"("referrer_id");

-- CreateIndex
CREATE INDEX "referrals_referred_id_idx" ON "referrals"("referred_id");

-- CreateIndex
CREATE INDEX "referrals_status_idx" ON "referrals"("status");

-- CreateIndex
CREATE UNIQUE INDEX "referrals_referred_id_key" ON "referrals"("referred_id");

-- CreateIndex
CREATE UNIQUE INDEX "referral_codes_code_key" ON "referral_codes"("code");

-- CreateIndex
CREATE INDEX "referral_codes_user_id_idx" ON "referral_codes"("user_id");

-- CreateIndex
CREATE INDEX "referral_codes_code_idx" ON "referral_codes"("code");

-- CreateIndex
CREATE UNIQUE INDEX "referral_codes_user_id_key" ON "referral_codes"("user_id");

-- CreateIndex
CREATE INDEX "referral_rewards_referrer_id_idx" ON "referral_rewards"("referrer_id");

-- CreateIndex
CREATE INDEX "referral_rewards_referred_id_idx" ON "referral_rewards"("referred_id");

-- CreateIndex
CREATE UNIQUE INDEX "referral_settings_setting_key_key" ON "referral_settings"("setting_key");

-- CreateIndex
CREATE INDEX "article_views_article_id_idx" ON "article_views"("article_id");

-- CreateIndex
CREATE INDEX "article_views_user_id_idx" ON "article_views"("user_id");

-- CreateIndex
CREATE INDEX "article_views_viewed_at_idx" ON "article_views"("viewed_at" DESC);

-- CreateIndex
CREATE INDEX "article_views_session_id_idx" ON "article_views"("session_id");

-- CreateIndex
CREATE INDEX "article_comments_article_id_idx" ON "article_comments"("article_id");

-- CreateIndex
CREATE INDEX "article_comments_user_id_idx" ON "article_comments"("user_id");

-- CreateIndex
CREATE INDEX "article_comments_parent_comment_id_idx" ON "article_comments"("parent_comment_id");

-- CreateIndex
CREATE INDEX "article_comments_status_idx" ON "article_comments"("status");

-- CreateIndex
CREATE INDEX "micro_content_university_id_idx" ON "micro_content"("university_id");

-- CreateIndex
CREATE INDEX "micro_content_category_idx" ON "micro_content"("category");

-- CreateIndex
CREATE INDEX "micro_content_priority_idx" ON "micro_content"("priority");

-- CreateIndex
CREATE INDEX "orientation_resources_category_idx" ON "orientation_resources"("category");

-- CreateIndex
CREATE INDEX "orientation_resources_featured_idx" ON "orientation_resources"("featured");

-- CreateIndex
CREATE UNIQUE INDEX "orientation_resources_category_slug_key" ON "orientation_resources"("category", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "static_pages_slug_key" ON "static_pages"("slug");

-- CreateIndex
CREATE INDEX "static_pages_slug_idx" ON "static_pages"("slug");

-- CreateIndex
CREATE INDEX "static_pages_published_idx" ON "static_pages"("published");

-- CreateIndex
CREATE INDEX "site_videos_position_idx" ON "site_videos"("position");

-- CreateIndex
CREATE INDEX "site_videos_is_active_idx" ON "site_videos"("is_active");

-- CreateIndex
CREATE INDEX "university_claims_university_id_idx" ON "university_claims"("university_id");

-- CreateIndex
CREATE INDEX "university_claims_user_id_idx" ON "university_claims"("user_id");

-- CreateIndex
CREATE INDEX "university_claims_status_idx" ON "university_claims"("status");

-- CreateIndex
CREATE UNIQUE INDEX "user_financial_profiles_user_id_key" ON "user_financial_profiles"("user_id");

-- CreateIndex
CREATE INDEX "user_financial_profiles_user_id_idx" ON "user_financial_profiles"("user_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_idx" ON "notifications"("user_id");

-- CreateIndex
CREATE INDEX "notifications_read_idx" ON "notifications"("read");

-- CreateIndex
CREATE INDEX "notifications_created_at_idx" ON "notifications"("created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "taxonomies_key_key" ON "taxonomies"("key");

-- CreateIndex
CREATE INDEX "taxonomies_key_idx" ON "taxonomies"("key");

-- CreateIndex
CREATE INDEX "taxonomy_terms_taxonomy_id_idx" ON "taxonomy_terms"("taxonomy_id");

-- CreateIndex
CREATE UNIQUE INDEX "taxonomy_terms_taxonomy_id_slug_key" ON "taxonomy_terms"("taxonomy_id", "slug");

-- CreateIndex
CREATE INDEX "article_terms_article_id_idx" ON "article_terms"("article_id");

-- CreateIndex
CREATE INDEX "article_terms_term_id_idx" ON "article_terms"("term_id");

-- CreateIndex
CREATE UNIQUE INDEX "plans_key_key" ON "plans"("key");

-- CreateIndex
CREATE UNIQUE INDEX "features_key_key" ON "features"("key");

-- CreateIndex
CREATE UNIQUE INDEX "plan_features_plan_id_feature_key_key" ON "plan_features"("plan_id", "feature_key");

-- CreateIndex
CREATE INDEX "user_feature_usage_user_id_idx" ON "user_feature_usage"("user_id");

-- CreateIndex
CREATE INDEX "user_feature_usage_feature_key_idx" ON "user_feature_usage"("feature_key");

-- CreateIndex
CREATE INDEX "anonymous_feature_usage_identifier_idx" ON "anonymous_feature_usage"("identifier");

-- CreateIndex
CREATE INDEX "anonymous_feature_usage_feature_key_idx" ON "anonymous_feature_usage"("feature_key");

-- CreateIndex
CREATE INDEX "article_performance_stats_article_id_date_idx" ON "article_performance_stats"("article_id", "date");

-- CreateIndex
CREATE INDEX "article_performance_stats_date_idx" ON "article_performance_stats"("date");

-- CreateIndex
CREATE UNIQUE INDEX "article_performance_stats_article_id_date_key" ON "article_performance_stats"("article_id", "date");

-- AddForeignKey
ALTER TABLE "university_group_members" ADD CONSTRAINT "university_group_members_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "universities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "university_group_members" ADD CONSTRAINT "university_group_members_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "university_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "universities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_items" ADD CONSTRAINT "saved_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_items" ADD CONSTRAINT "saved_items_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "universities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_comparisons" ADD CONSTRAINT "saved_comparisons_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referrer_id_fkey" FOREIGN KEY ("referrer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referred_id_fkey" FOREIGN KEY ("referred_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_codes" ADD CONSTRAINT "referral_codes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_rewards" ADD CONSTRAINT "referral_rewards_referral_id_fkey" FOREIGN KEY ("referral_id") REFERENCES "referrals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_rewards" ADD CONSTRAINT "referral_rewards_referrer_id_fkey" FOREIGN KEY ("referrer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_rewards" ADD CONSTRAINT "referral_rewards_referred_id_fkey" FOREIGN KEY ("referred_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_views" ADD CONSTRAINT "article_views_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_views" ADD CONSTRAINT "article_views_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_comments" ADD CONSTRAINT "article_comments_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_comments" ADD CONSTRAINT "article_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "micro_content" ADD CONSTRAINT "micro_content_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "universities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "university_claims" ADD CONSTRAINT "university_claims_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "universities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "university_claims" ADD CONSTRAINT "university_claims_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_financial_profiles" ADD CONSTRAINT "user_financial_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "taxonomy_terms" ADD CONSTRAINT "taxonomy_terms_taxonomy_id_fkey" FOREIGN KEY ("taxonomy_id") REFERENCES "taxonomies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_terms" ADD CONSTRAINT "article_terms_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_terms" ADD CONSTRAINT "article_terms_term_id_fkey" FOREIGN KEY ("term_id") REFERENCES "taxonomy_terms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_features" ADD CONSTRAINT "plan_features_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_features" ADD CONSTRAINT "plan_features_feature_key_fkey" FOREIGN KEY ("feature_key") REFERENCES "features"("key") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_feature_usage" ADD CONSTRAINT "user_feature_usage_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_feature_usage" ADD CONSTRAINT "user_feature_usage_feature_key_fkey" FOREIGN KEY ("feature_key") REFERENCES "features"("key") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anonymous_feature_usage" ADD CONSTRAINT "anonymous_feature_usage_feature_key_fkey" FOREIGN KEY ("feature_key") REFERENCES "features"("key") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_performance_stats" ADD CONSTRAINT "article_performance_stats_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
