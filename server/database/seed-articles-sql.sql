-- SQL script to seed articles directly in Supabase SQL Editor
-- This script assumes you have at least one user in the users table
-- If you don't have a user, create one first or use the seed-articles.js script

-- First, get a user ID to use as author_id (replace 'YOUR_USER_EMAIL' with an actual email)
-- Or use a fixed UUID if you know your user ID

-- Option 1: If you know your user ID, replace it in the INSERT statements below
-- Option 2: Use this query to get a user ID:
-- SELECT id FROM users LIMIT 1;

-- Example: Insert 5 sample articles
-- Replace 'USER_ID_HERE' with an actual UUID from your users table

INSERT INTO articles (title, slug, content, excerpt, category, author_id, published, featured_image) VALUES
(
  'How to Choose the Right University: A Complete Guide',
  'how-to-choose-right-university',
  '<h2>Introduction</h2><p>Choosing the right university is one of the most important decisions you''ll make in your academic journey. This comprehensive guide will help you navigate the selection process.</p><h2>1. Define Your Goals</h2><p>Before you start looking at universities, take time to understand what you want to achieve. Consider your career aspirations, preferred field of study, location preferences, and budget constraints.</p><h2>2. Research Programs</h2><p>Look for universities that excel in your chosen field. Check program rankings, faculty credentials, research opportunities, and alumni success stories.</p><h2>Conclusion</h2><p>Take your time, do thorough research, and trust your instincts.</p>',
  'A comprehensive guide to help you make informed decisions when choosing the right university for your academic journey.',
  'Education',
  (SELECT id FROM users LIMIT 1), -- Uses first user as author
  true,
  'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800'
),
(
  'Study Abroad: Everything You Need to Know',
  'study-abroad-complete-guide',
  '<h2>Why Study Abroad?</h2><p>Studying abroad offers incredible opportunities for personal growth, cultural immersion, and academic excellence. It''s an experience that can transform your worldview and career prospects.</p><h2>Popular Destinations</h2><p>Some of the most popular study abroad destinations include the United States, United Kingdom, Canada, Germany, and Australia.</p><h2>Application Process</h2><p>The application process typically involves researching programs, preparing documents, taking standardized tests, applying for visas, and securing financial aid.</p>',
  'Discover everything you need to know about studying abroad, from choosing a destination to handling the application process.',
  'Study Abroad',
  (SELECT id FROM users LIMIT 1),
  true,
  'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800'
),
(
  'Top 10 Engineering Fields with Best Career Prospects',
  'top-10-engineering-fields-career-prospects',
  '<h2>Introduction</h2><p>Engineering is one of the most versatile and rewarding career paths. Here are the top 10 engineering fields with excellent career prospects.</p><h2>1. Software Engineering</h2><p>With digital transformation accelerating, software engineers are in high demand.</p><h2>2. Artificial Intelligence & Machine Learning</h2><p>AI engineers design and develop intelligent systems.</p><h2>Conclusion</h2><p>Each engineering field offers unique opportunities. Choose based on your interests and career goals.</p>',
  'Explore the top 10 engineering fields with the best career prospects, salary potential, and growth opportunities.',
  'Education',
  (SELECT id FROM users LIMIT 1),
  true,
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800'
),
(
  'University Application Deadlines: Complete Timeline Guide',
  'university-application-deadlines-timeline',
  '<h2>Understanding Application Deadlines</h2><p>Missing an application deadline can mean waiting another year. Here''s a comprehensive timeline to keep you on track.</p><h2>Key Deadlines</h2><p>Early Decision: November 1, Regular Decision: January 1-15, UCAS (UK): January 15</p><h2>Tips for Success</h2><p>Create a master calendar with all deadlines, set reminders 2 weeks before each deadline, and submit applications early.</p>',
  'Stay organized with this complete timeline guide to university application deadlines, helping you never miss an important date.',
  'Tips',
  (SELECT id FROM users LIMIT 1),
  true,
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800'
),
(
  'Scholarships for International Students: Where to Find Funding',
  'scholarships-international-students-funding',
  '<h2>Introduction</h2><p>Finding scholarships can significantly reduce the financial burden of studying abroad. Here''s where to look for funding opportunities.</p><h2>Types of Scholarships</h2><p>Merit-based, need-based, country-specific, and subject-specific scholarships are available.</p><h2>Where to Find</h2><p>Check university websites, government programs like Fulbright and Chevening, and private organizations.</p><h2>Application Tips</h2><p>Start searching early, apply to multiple scholarships, tailor each application, and write compelling essays.</p>',
  'Discover where to find scholarships for international students and learn how to increase your chances of securing funding for your studies.',
  'Education',
  (SELECT id FROM users LIMIT 1),
  true,
  'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800'
);

-- Verify the articles were inserted
SELECT id, title, slug, published, created_at FROM articles ORDER BY created_at DESC LIMIT 5;

