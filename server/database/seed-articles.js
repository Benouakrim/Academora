import supabase from './supabase.js';
import dotenv from 'dotenv';

dotenv.config();

// Sample articles to seed the database
const articles = [
  {
    title: 'How to Choose the Right University: A Complete Guide',
    slug: 'how-to-choose-right-university',
    content: `
      <h2>Introduction</h2>
      <p>Choosing the right university is one of the most important decisions you'll make in your academic journey. This comprehensive guide will help you navigate the selection process.</p>
      
      <h2>1. Define Your Goals</h2>
      <p>Before you start looking at universities, take time to understand what you want to achieve. Consider:</p>
      <ul>
        <li>Your career aspirations</li>
        <li>Preferred field of study</li>
        <li>Location preferences</li>
        <li>Budget constraints</li>
      </ul>
      
      <h2>2. Research Programs</h2>
      <p>Look for universities that excel in your chosen field. Check:</p>
      <ul>
        <li>Program rankings</li>
        <li>Faculty credentials</li>
        <li>Research opportunities</li>
        <li>Alumni success stories</li>
      </ul>
      
      <h2>3. Consider Location</h2>
      <p>Location can significantly impact your university experience. Think about:</p>
      <ul>
        <li>Proximity to home</li>
        <li>Cost of living</li>
        <li>Job opportunities in the area</li>
        <li>Climate and lifestyle</li>
      </ul>
      
      <h2>4. Evaluate Costs</h2>
      <p>Consider the total cost of attendance, including:</p>
      <ul>
        <li>Tuition fees</li>
        <li>Accommodation</li>
        <li>Living expenses</li>
        <li>Available scholarships</li>
      </ul>
      
      <h2>Conclusion</h2>
      <p>Take your time, do thorough research, and trust your instincts. The right university for you is one that aligns with your goals, values, and aspirations.</p>
    `,
    excerpt: 'A comprehensive guide to help you make informed decisions when choosing the right university for your academic journey.',
    category: 'Education',
    published: true,
    featured_image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800',
  },
  {
    title: 'Study Abroad: Everything You Need to Know',
    slug: 'study-abroad-complete-guide',
    content: `
      <h2>Why Study Abroad?</h2>
      <p>Studying abroad offers incredible opportunities for personal growth, cultural immersion, and academic excellence. It's an experience that can transform your worldview and career prospects.</p>
      
      <h2>Popular Destinations</h2>
      <p>Some of the most popular study abroad destinations include:</p>
      <ul>
        <li><strong>United States:</strong> Home to many top-ranked universities</li>
        <li><strong>United Kingdom:</strong> Rich academic tradition and history</li>
        <li><strong>Canada:</strong> Welcoming environment and quality education</li>
        <li><strong>Germany:</strong> Low tuition fees for international students</li>
        <li><strong>Australia:</strong> High-quality education and beautiful landscapes</li>
      </ul>
      
      <h2>Application Process</h2>
      <p>The application process typically involves:</p>
      <ol>
        <li>Researching programs and universities</li>
        <li>Preparing application documents (transcripts, recommendations, essays)</li>
        <li>Taking required standardized tests (TOEFL, IELTS, SAT, etc.)</li>
        <li>Applying for student visas</li>
        <li>Securing financial aid or scholarships</li>
      </ol>
      
      <h2>Financial Planning</h2>
      <p>Studying abroad can be expensive. Consider:</p>
      <ul>
        <li>Tuition fees</li>
        <li>Living expenses</li>
        <li>Travel costs</li>
        <li>Health insurance</li>
        <li>Visa fees</li>
      </ul>
      <p>Research scholarships, grants, and financial aid options early in the process.</p>
      
      <h2>Tips for Success</h2>
      <p>To make the most of your study abroad experience:</p>
      <ul>
        <li>Start planning early</li>
        <li>Learn about the local culture</li>
        <li>Connect with other international students</li>
        <li>Keep an open mind</li>
        <li>Document your journey</li>
      </ul>
    `,
    excerpt: 'Discover everything you need to know about studying abroad, from choosing a destination to handling the application process.',
    category: 'Study Abroad',
    published: true,
    featured_image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800',
  },
  {
    title: 'Top 10 Engineering Fields with Best Career Prospects',
    slug: 'top-10-engineering-fields-career-prospects',
    content: `
      <h2>Introduction</h2>
      <p>Engineering is one of the most versatile and rewarding career paths. Here are the top 10 engineering fields with excellent career prospects in 2024 and beyond.</p>
      
      <h2>1. Software Engineering</h2>
      <p>With the digital transformation accelerating, software engineers are in high demand. Average salary: $120,000-$180,000.</p>
      
      <h2>2. Artificial Intelligence & Machine Learning</h2>
      <p>AI engineers design and develop intelligent systems. This field is rapidly growing with opportunities across industries.</p>
      
      <h2>3. Biomedical Engineering</h2>
      <p>Combines engineering principles with medical sciences to improve healthcare. Growing demand in medical device development.</p>
      
      <h2>4. Environmental Engineering</h2>
      <p>Focuses on protecting the environment and human health. Increasingly important for sustainable development.</p>
      
      <h2>5. Civil Engineering</h2>
      <p>Essential for infrastructure development. Stable demand with good job security and competitive salaries.</p>
      
      <h2>6. Electrical Engineering</h2>
      <p>Covers power systems, electronics, and telecommunications. Broad range of career opportunities.</p>
      
      <h2>7. Mechanical Engineering</h2>
      <p>One of the most versatile engineering disciplines. Applies across many industries from automotive to aerospace.</p>
      
      <h2>8. Data Engineering</h2>
      <p>Builds and maintains data infrastructure. Critical for businesses making data-driven decisions.</p>
      
      <h2>9. Chemical Engineering</h2>
      <p>Works in pharmaceuticals, energy, materials, and process industries. Strong foundation for various careers.</p>
      
      <h2>10. Aerospace Engineering</h2>
      <p>Designs aircraft, spacecraft, and related systems. Exciting opportunities in both commercial and defense sectors.</p>
      
      <h2>Conclusion</h2>
      <p>Each engineering field offers unique opportunities. Choose based on your interests, skills, and career goals. Many engineers transition between fields throughout their careers.</p>
    `,
    excerpt: 'Explore the top 10 engineering fields with the best career prospects, salary potential, and growth opportunities.',
    category: 'Education',
    published: true,
    featured_image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
  },
  {
    title: 'University Application Deadlines: Complete Timeline Guide',
    slug: 'university-application-deadlines-timeline',
    content: `
      <h2>Understanding Application Deadlines</h2>
      <p>Missing an application deadline can mean waiting another year. Here's a comprehensive timeline to keep you on track.</p>
      
      <h2>12-18 Months Before</h2>
      <ul>
        <li>Research universities and programs</li>
        <li>Take standardized tests (SAT, ACT, TOEFL, IELTS)</li>
        <li>Build your academic profile</li>
        <li>Start gathering recommendation letters</li>
      </ul>
      
      <h2>6-12 Months Before</h2>
      <ul>
        <li><strong>Early Decision/Early Action:</strong> November 1-15</li>
        <li>Begin writing personal statements and essays</li>
        <li>Request official transcripts</li>
        <li>Prepare application portfolios (if required)</li>
      </ul>
      
      <h2>3-6 Months Before</h2>
      <ul>
        <li><strong>Regular Decision:</strong> January 1-15</li>
        <li>Finalize all application materials</li>
        <li>Submit financial aid applications (FAFSA, etc.)</li>
        <li>Double-check all requirements</li>
      </ul>
      
      <h2>Key Deadlines by Region</h2>
      
      <h3>United States</h3>
      <ul>
        <li>Early Decision: November 1</li>
        <li>Early Action: November 1</li>
        <li>Regular Decision: January 1-15</li>
        <li>Rolling Admissions: Varies</li>
      </ul>
      
      <h3>United Kingdom</h3>
      <ul>
        <li>UCAS Deadline: January 15 (most courses)</li>
        <li>Medicine/Dentistry/Veterinary: October 15</li>
      </ul>
      
      <h3>Canada</h3>
      <ul>
        <li>Varies by university (typically December-March)</li>
      </ul>
      
      <h2>Tips for Success</h2>
      <ul>
        <li>Create a master calendar with all deadlines</li>
        <li>Set reminders 2 weeks before each deadline</li>
        <li>Submit applications early (not at the last minute)</li>
        <li>Keep copies of all submitted materials</li>
      </ul>
    `,
    excerpt: 'Stay organized with this complete timeline guide to university application deadlines, helping you never miss an important date.',
    category: 'Tips',
    published: true,
    featured_image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
  },
  {
    title: 'Scholarships for International Students: Where to Find Funding',
    slug: 'scholarships-international-students-funding',
    content: `
      <h2>Introduction</h2>
      <p>Finding scholarships can significantly reduce the financial burden of studying abroad. Here's where to look for funding opportunities.</p>
      
      <h2>Types of Scholarships</h2>
      
      <h3>1. Merit-Based Scholarships</h3>
      <p>Awarded based on academic excellence, talents, or achievements. Examples include:</p>
      <ul>
        <li>Academic excellence scholarships</li>
        <li>Sports scholarships</li>
        <li>Arts and music scholarships</li>
      </ul>
      
      <h3>2. Need-Based Scholarships</h3>
      <p>Based on financial need. Requires documentation of family income and expenses.</p>
      
      <h3>3. Country-Specific Scholarships</h3>
      <p>Available for students from specific countries or regions.</p>
      
      <h3>4. Subject-Specific Scholarships</h3>
      <p>For specific fields of study (STEM, humanities, etc.)</p>
      
      <h2>Where to Find Scholarships</h2>
      
      <h3>University Scholarships</h3>
      <p>Most universities offer scholarships for international students. Check:</p>
      <ul>
        <li>University financial aid office</li>
        <li>Department-specific scholarships</li>
        <li>Admission office websites</li>
      </ul>
      
      <h3>Government Scholarships</h3>
      <ul>
        <li><strong>Fulbright Program</strong> (USA)</li>
        <li><strong>Chevening Scholarships</strong> (UK)</li>
        <li><strong>DAAD Scholarships</strong> (Germany)</li>
        <li><strong>Australia Awards</strong> (Australia)</li>
      </ul>
      
      <h3>Private Organizations</h3>
      <ul>
        <li>Rotary Foundation</li>
        <li>World Bank Scholarships</li>
        <li>Organization-specific grants</li>
      </ul>
      
      <h2>Application Tips</h2>
      <ul>
        <li>Start searching early (1-2 years before studies)</li>
        <li>Apply to multiple scholarships</li>
        <li>Tailor each application</li>
        <li>Meet all deadlines</li>
        <li>Write compelling essays</li>
        <li>Get strong recommendation letters</li>
      </ul>
      
      <h2>Common Requirements</h2>
      <ul>
        <li>Academic transcripts</li>
        <li>Proof of language proficiency</li>
        <li>Personal statement or essay</li>
        <li>Letters of recommendation</li>
        <li>Financial documentation</li>
        <li>Proof of acceptance to university</li>
      </ul>
    `,
    excerpt: 'Discover where to find scholarships for international students and learn how to increase your chances of securing funding for your studies.',
    category: 'Education',
    published: true,
    featured_image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800',
  },
];

async function seedArticles() {
  console.log('Starting to seed articles...');

  try {
    // First, we need to check if we have a user to use as author_id
    // For seeding purposes, we'll need to create a test user or use an existing one
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    let authorId;

    if (userError || !users || users.length === 0) {
      console.log('No users found. Creating a test user for articles...');
      
      // Create a test user if none exists (for seeding purposes)
      const testEmail = `test-author-${Date.now()}@academora.com`;
      const testPassword = 'TestPassword123!';
      
      // Note: We need to hash the password - in a real scenario, use bcrypt
      // For seeding, we'll need to use the createUser function or create directly
      // Let's create it directly with a hashed password
      const bcrypt = (await import('bcrypt')).default;
      const hashedPassword = await bcrypt.hash(testPassword, 10);
      
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([{ email: testEmail, password: hashedPassword }])
        .select('id')
        .single();

      if (createError) {
        console.error('Error creating test user:', createError);
        throw createError;
      }

      authorId = newUser.id;
      console.log(`Created test user with ID: ${authorId}`);
    } else {
      authorId = users[0].id;
      console.log(`Using existing user with ID: ${authorId}`);
    }

    // Insert articles
    const articlesToInsert = articles.map(article => ({
      ...article,
      author_id: authorId,
      content: article.content.trim(), // Clean up whitespace
    }));

    const { data, error } = await supabase
      .from('articles')
      .insert(articlesToInsert)
      .select();

    if (error) {
      console.error('Error seeding articles:', error);
      throw error;
    }

    console.log(`\n✅ Successfully seeded ${data.length} articles:`);
    data.forEach((article, index) => {
      console.log(`${index + 1}. ${article.title} (${article.slug})`);
    });
    console.log('\n✨ Database seeding complete!');

  } catch (error) {
    console.error('Failed to seed articles:', error);
    process.exit(1);
  }
}

// Run the seed function
seedArticles();

