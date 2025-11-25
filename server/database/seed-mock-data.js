import pool from './pool.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Comprehensive seed script to populate Neon database with mock data
 * Creates users, universities, articles, reviews, and more
 */

// Test Users Credentials (will be displayed at the end)
const testUsers = [
  {
    email: 'admin@academora.com',
    password: 'Admin123!',
    role: 'admin',
    first_name: 'Admin',
    last_name: 'User',
    username: 'admin',
    account_type: 'student',
    plan: 'premium'
  },
  {
    email: 'student@academora.com',
    password: 'Student123!',
    role: 'user',
    first_name: 'John',
    last_name: 'Student',
    username: 'jstudent',
    account_type: 'student',
    plan: 'free'
  },
  {
    email: 'parent@academora.com',
    password: 'Parent123!',
    role: 'user',
    first_name: 'Sarah',
    last_name: 'Parent',
    username: 'sparent',
    account_type: 'parent',
    plan: 'premium'
  },
  {
    email: 'counselor@academora.com',
    password: 'Counselor123!',
    role: 'user',
    first_name: 'Michael',
    last_name: 'Counselor',
    username: 'mcounselor',
    account_type: 'counselor',
    plan: 'premium'
  },
  {
    email: 'developer@academora.com',
    password: 'Dev123!',
    role: 'user',
    first_name: 'Alex',
    last_name: 'Developer',
    username: 'adeveloper',
    account_type: 'student',
    plan: 'free'
  }
];

// Sample Universities
const universities = [
  {
    name: 'Harvard University',
    slug: 'harvard-university',
    description: 'A private Ivy League research university in Cambridge, Massachusetts.',
    city: 'Cambridge',
    state: 'MA',
    country: 'USA',
    type: 'private',
    classification: 'R1',
    acceptance_rate: 4.0,
    tuition_in_state: 54269,
    tuition_out_state: 54269,
    student_population: 23000,
    graduation_rate: 97.0,
    verified: true
  },
  {
    name: 'Massachusetts Institute of Technology',
    slug: 'mit',
    description: 'A private research university in Cambridge, Massachusetts, known for its engineering and technology programs.',
    city: 'Cambridge',
    state: 'MA',
    country: 'USA',
    type: 'private',
    classification: 'R1',
    acceptance_rate: 6.7,
    tuition_in_state: 53790,
    tuition_out_state: 53790,
    student_population: 11520,
    graduation_rate: 95.0,
    verified: true
  },
  {
    name: 'Stanford University',
    slug: 'stanford-university',
    description: 'A private research university in Stanford, California, known for its entrepreneurial culture.',
    city: 'Stanford',
    state: 'CA',
    country: 'USA',
    type: 'private',
    classification: 'R1',
    acceptance_rate: 4.3,
    tuition_in_state: 56169,
    tuition_out_state: 56169,
    student_population: 17000,
    graduation_rate: 96.0,
    verified: true
  },
  {
    name: 'University of California, Berkeley',
    slug: 'uc-berkeley',
    description: 'A public research university in Berkeley, California, part of the UC system.',
    city: 'Berkeley',
    state: 'CA',
    country: 'USA',
    type: 'public',
    classification: 'R1',
    acceptance_rate: 14.5,
    tuition_in_state: 14253,
    tuition_out_state: 44253,
    student_population: 45000,
    graduation_rate: 92.0,
    verified: true
  },
  {
    name: 'Yale University',
    slug: 'yale-university',
    description: 'A private Ivy League research university in New Haven, Connecticut.',
    city: 'New Haven',
    state: 'CT',
    country: 'USA',
    type: 'private',
    classification: 'R1',
    acceptance_rate: 5.3,
    tuition_in_state: 59950,
    tuition_out_state: 59950,
    student_population: 13000,
    graduation_rate: 98.0,
    verified: true
  },
  {
    name: 'Princeton University',
    slug: 'princeton-university',
    description: 'A private Ivy League research university in Princeton, New Jersey.',
    city: 'Princeton',
    state: 'NJ',
    country: 'USA',
    type: 'private',
    classification: 'R1',
    acceptance_rate: 5.8,
    tuition_in_state: 56010,
    tuition_out_state: 56010,
    student_population: 8400,
    graduation_rate: 98.0,
    verified: true
  },
  {
    name: 'Columbia University',
    slug: 'columbia-university',
    description: 'A private Ivy League research university in New York City.',
    city: 'New York',
    state: 'NY',
    country: 'USA',
    type: 'private',
    classification: 'R1',
    acceptance_rate: 5.1,
    tuition_in_state: 63530,
    tuition_out_state: 63530,
    student_population: 33000,
    graduation_rate: 96.0,
    verified: true
  },
  {
    name: 'University of Michigan',
    slug: 'university-of-michigan',
    description: 'A public research university in Ann Arbor, Michigan.',
    city: 'Ann Arbor',
    state: 'MI',
    country: 'USA',
    type: 'public',
    classification: 'R1',
    acceptance_rate: 20.2,
    tuition_in_state: 16678,
    tuition_out_state: 54197,
    student_population: 47000,
    graduation_rate: 93.0,
    verified: true
  }
];

// Sample Articles
const articles = [
  {
    title: 'How to Choose the Right University for Your Career Goals',
    slug: 'how-to-choose-right-university',
    excerpt: 'A comprehensive guide to selecting a university that aligns with your career aspirations and personal goals.',
    category: 'admissions',
    content: `<h2>Introduction</h2>
<p>Choosing the right university is one of the most important decisions you'll make for your academic and professional future. This comprehensive guide will help you navigate through the selection process.</p>

<h2>1. Define Your Career Goals</h2>
<p>Before selecting a university, it's crucial to have a clear understanding of your career aspirations. Consider:</p>
<ul>
  <li>What field interests you most?</li>
  <li>What are your long-term career objectives?</li>
  <li>What type of work environment do you prefer?</li>
</ul>

<h2>2. Research University Programs</h2>
<p>Look into the specific programs offered by each university. Check:</p>
<ul>
  <li>Program rankings and accreditation</li>
  <li>Course curriculum and structure</li>
  <li>Faculty expertise and research opportunities</li>
</ul>

<h2>3. Consider Location and Culture</h2>
<p>The university's location can significantly impact your experience. Consider factors such as:</p>
<ul>
  <li>Urban vs. rural setting</li>
  <li>Climate and weather</li>
  <li>Cost of living</li>
  <li>Campus culture and student life</li>
</ul>

<h2>Conclusion</h2>
<p>Take your time to research and visit universities if possible. The right fit will help you achieve your academic and career goals.</p>`,
    published: true
  },
  {
    title: 'Understanding Financial Aid and Scholarships',
    slug: 'understanding-financial-aid-scholarships',
    excerpt: 'Learn about different types of financial aid, how to apply, and tips for maximizing your scholarship opportunities.',
    category: 'financial-aid',
    content: `<h2>Types of Financial Aid</h2>
<p>There are several types of financial aid available to students:</p>
<ul>
  <li><strong>Grants:</strong> Need-based aid that doesn't need to be repaid</li>
  <li><strong>Scholarships:</strong> Merit or need-based aid that doesn't need to be repaid</li>
  <li><strong>Loans:</strong> Money borrowed that must be repaid with interest</li>
  <li><strong>Work-Study:</strong> Part-time employment to help pay for education</li>
</ul>

<h2>How to Apply</h2>
<p>The first step is completing the FAFSA (Free Application for Federal Student Aid). This form determines your eligibility for federal aid.</p>

<h2>Tips for Maximizing Aid</h2>
<ul>
  <li>Apply early - many programs have limited funding</li>
  <li>Research institutional scholarships</li>
  <li>Look for external scholarship opportunities</li>
  <li>Maintain good academic standing</li>
</ul>`,
    published: true
  },
  {
    title: 'The Complete Guide to College Applications',
    slug: 'complete-guide-college-applications',
    excerpt: 'Step-by-step guide to navigating the college application process, from choosing schools to submitting materials.',
    category: 'admissions',
    content: `<h2>Application Timeline</h2>
<p>Start preparing your applications well in advance:</p>
<ul>
  <li><strong>Junior Year:</strong> Take standardized tests, research schools</li>
  <li><strong>Summer Before Senior Year:</strong> Write essays, gather recommendations</li>
  <li><strong>Fall Senior Year:</strong> Submit applications</li>
  <li><strong>Spring Senior Year:</strong> Make final decision</li>
</ul>

<h2>Required Materials</h2>
<ul>
  <li>High school transcript</li>
  <li>Standardized test scores (SAT/ACT)</li>
  <li>Letters of recommendation</li>
  <li>Personal statement/essays</li>
  <li>Application fee</li>
</ul>

<h2>Tips for Success</h2>
<p>Start early, stay organized, and don't be afraid to ask for help from counselors and teachers.</p>`,
    published: true
  }
];

async function createUsers() {
  console.log('👤 Creating test users...\n');
  const userIds = [];
  
  for (const userData of testUsers) {
    try {
      // Check if user exists
      const existing = await pool.query('SELECT id FROM users WHERE email = $1', [userData.email]);
      
      if (existing.rows.length > 0) {
        console.log(`  ⚠️  User ${userData.email} already exists, skipping...`);
        userIds.push(existing.rows[0].id);
        continue;
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Insert user
      const result = await pool.query(
        `INSERT INTO users (email, password, role, first_name, last_name, username, account_type, plan, email_verified, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING id, email, role`,
        [
          userData.email,
          hashedPassword,
          userData.role,
          userData.first_name,
          userData.last_name,
          userData.username,
          userData.account_type,
          userData.plan,
          true, // email_verified
          'active' // status
        ]
      );
      
      userIds.push(result.rows[0].id);
      console.log(`  ✅ Created ${userData.role}: ${userData.email}`);
    } catch (error) {
      console.error(`  ❌ Error creating user ${userData.email}:`, error.message);
    }
  }
  
  return userIds;
}

async function createUniversities() {
  console.log('\n🎓 Creating universities...\n');
  const universityIds = [];
  
  for (const uni of universities) {
    try {
      // Check if exists
      const existing = await pool.query('SELECT id FROM universities WHERE slug = $1', [uni.slug]);
      
      if (existing.rows.length > 0) {
        console.log(`  ⚠️  University ${uni.name} already exists, skipping...`);
        universityIds.push(existing.rows[0].id);
        continue;
      }
      
      const result = await pool.query(
        `INSERT INTO universities (
          name, slug, description, city, state, country, type, classification,
          acceptance_rate, tuition_in_state, tuition_out_state, student_population,
          graduation_rate, verified
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING id`,
        [
          uni.name, uni.slug, uni.description, uni.city, uni.state, uni.country,
          uni.type, uni.classification, uni.acceptance_rate,
          uni.tuition_in_state, uni.tuition_out_state, uni.student_population,
          uni.graduation_rate, uni.verified
        ]
      );
      
      universityIds.push(result.rows[0].id);
      console.log(`  ✅ Created: ${uni.name}`);
    } catch (error) {
      console.error(`  ❌ Error creating university ${uni.name}:`, error.message);
    }
  }
  
  return universityIds;
}

async function createArticles(userIds) {
  console.log('\n📝 Creating articles...\n');
  const authorId = userIds[0]; // Use first user (admin) as author
  
  for (const article of articles) {
    try {
      // Check if exists
      const existing = await pool.query('SELECT id FROM articles WHERE slug = $1', [article.slug]);
      
      if (existing.rows.length > 0) {
        console.log(`  ⚠️  Article "${article.title}" already exists, skipping...`);
        continue;
      }
      
      await pool.query(
        `INSERT INTO articles (title, slug, content, excerpt, category, author_id, published)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [article.title, article.slug, article.content, article.excerpt, article.category, authorId, article.published]
      );
      
      console.log(`  ✅ Created: ${article.title}`);
    } catch (error) {
      console.error(`  ❌ Error creating article "${article.title}":`, error.message);
    }
  }
}

async function createReviews(userIds, universityIds) {
  console.log('\n⭐ Creating reviews...\n');
  
  const reviews = [
    { rating: 5, comment: 'Excellent university with outstanding faculty and resources!' },
    { rating: 4, comment: 'Great experience overall, though some facilities could be improved.' },
    { rating: 5, comment: 'Amazing campus culture and academic programs.' },
    { rating: 4, comment: 'Good value for money, especially for in-state students.' },
    { rating: 3, comment: 'Decent university, but the location could be better.' }
  ];
  
  // Create reviews from different users for different universities
  for (let i = 0; i < Math.min(userIds.length, universityIds.length, reviews.length); i++) {
    try {
      const userId = userIds[i];
      const universityId = universityIds[i];
      const review = reviews[i];
      
      // Check if review exists
      const existing = await pool.query(
        'SELECT id FROM reviews WHERE user_id = $1 AND university_id = $2',
        [userId, universityId]
      );
      
      if (existing.rows.length > 0) {
        continue;
      }
      
      await pool.query(
        `INSERT INTO reviews (user_id, university_id, rating, content, status)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, universityId, review.rating, review.comment, 'approved']
      );
      
      console.log(`  ✅ Created review (${review.rating}⭐) for university ${i + 1}`);
    } catch (error) {
      console.error(`  ❌ Error creating review:`, error.message);
    }
  }
}

async function createSavedItems(userIds, universityIds) {
  console.log('\n💾 Creating saved items...\n');
  
  // Each user saves a few universities
  for (let i = 0; i < userIds.length && i < universityIds.length; i++) {
    try {
      const userId = userIds[i];
      const universityId = universityIds[i];
      
      // Check if exists
      const existing = await pool.query(
        'SELECT id FROM saved_items WHERE user_id = $1 AND university_id = $2',
        [userId, universityId]
      );
      
      if (existing.rows.length > 0) {
        continue;
      }
      
      await pool.query(
        'INSERT INTO saved_items (user_id, university_id) VALUES ($1, $2)',
        [userId, universityId]
      );
      
      console.log(`  ✅ User ${i + 1} saved university ${i + 1}`);
    } catch (error) {
      // Table might not exist, skip silently
      if (!error.message.includes('relation') && !error.message.includes('does not exist')) {
        console.error(`  ❌ Error creating saved item:`, error.message);
      }
    }
  }
}

async function main() {
  console.log('🚀 Starting database seeding...\n');
  console.log('═'.repeat(60));
  
  try {
    // Test connection
    await pool.query('SELECT 1');
    console.log('✅ Database connection successful\n');
    
    // Create users
    const userIds = await createUsers();
    
    // Create universities
    const universityIds = await createUniversities();
    
    // Create articles
    await createArticles(userIds);
    
    // Create reviews
    await createReviews(userIds, universityIds);
    
    // Create saved items (if table exists)
    await createSavedItems(userIds, universityIds);
    
    console.log('\n' + '═'.repeat(60));
    console.log('✅ Database seeding completed!\n');
    
    // Display credentials
    console.log('📋 TEST USER CREDENTIALS:\n');
    console.log('═'.repeat(60));
    testUsers.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.role.toUpperCase()}: ${user.first_name} ${user.last_name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Password: ${user.password}`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Account Type: ${user.account_type}`);
      console.log(`   Plan: ${user.plan}`);
    });
    console.log('\n' + '═'.repeat(60));
    console.log('\n💡 You can now use these credentials to test the application!');
    console.log('   The admin user has full access to all features.\n');
    
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

