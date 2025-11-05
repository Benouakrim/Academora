import supabase from './supabase.js';
import bcrypt from 'bcrypt';

// Sample articles data
const sampleArticles = [
  {
    title: 'How to Choose the Right University for Your Career Goals',
    slug: 'how-to-choose-right-university',
    content: `
      <h2>Introduction</h2>
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
        <li>Climate and geographical preferences</li>
        <li>Cultural fit and diversity</li>
      </ul>
      
      <h2>Conclusion</h2>
      <p>Take your time to research and visit universities when possible. The right choice will align with your academic interests, career goals, and personal preferences.</p>
    `,
    excerpt: 'A comprehensive guide to help you select the perfect university that aligns with your career goals and personal preferences.',
    category: 'Education',
    published: true,
    featured_image: null,
  },
  {
    title: '10 Essential Tips for International Students Studying Abroad',
    slug: '10-tips-international-students',
    content: `
      <h2>Introduction</h2>
      <p>Studying abroad is an exciting adventure that offers incredible opportunities for personal and academic growth. However, it also comes with unique challenges. Here are 10 essential tips to help you succeed.</p>
      
      <h2>1. Prepare Your Documents Early</h2>
      <p>Start preparing your visa, passport, and academic documents well in advance. Processing times can vary significantly.</p>
      
      <h2>2. Learn the Local Language</h2>
      <p>Even if your courses are in English, learning the local language will enhance your experience and help you integrate better.</p>
      
      <h2>3. Research the Culture</h2>
      <p>Understanding cultural norms and expectations will help you avoid misunderstandings and make meaningful connections.</p>
      
      <h2>4. Budget Wisely</h2>
      <p>Create a realistic budget that accounts for tuition, accommodation, food, transportation, and unexpected expenses.</p>
      
      <h2>5. Find Accommodation Early</h2>
      <p>Secure your housing before arriving. University dorms, homestays, and shared apartments are common options.</p>
      
      <h2>6. Build a Support Network</h2>
      <p>Connect with other international students, join clubs, and participate in orientation activities to build friendships.</p>
      
      <h2>7. Stay Connected with Home</h2>
      <p>Regular communication with family and friends back home can help combat homesickness.</p>
      
      <h2>8. Explore Academically</h2>
      <p>Take advantage of unique courses, research opportunities, and academic resources not available at home.</p>
      
      <h2>9. Travel When Possible</h2>
      <p>Use your time abroad to explore the country and nearby regions. Travel broadens your perspective.</p>
      
      <h2>10. Stay Healthy</h2>
      <p>Take care of your physical and mental health. Find healthcare providers, maintain a healthy routine, and seek help when needed.</p>
      
      <h2>Conclusion</h2>
      <p>Studying abroad is a transformative experience. With proper preparation and an open mind, you can make the most of this incredible opportunity.</p>
    `,
    excerpt: 'Essential tips and advice for international students to navigate their study abroad experience successfully.',
    category: 'Study Abroad',
    published: true,
    featured_image: null,
  },
  {
    title: 'Understanding Different Academic Fields: A Complete Guide',
    slug: 'understanding-academic-fields-guide',
    content: `
      <h2>Introduction</h2>
      <p>The world of academia is vast and diverse, with countless fields of study to explore. This guide will help you understand the major academic disciplines and how to choose the right one for you.</p>
      
      <h2>STEM Fields (Science, Technology, Engineering, Mathematics)</h2>
      <p>STEM fields focus on scientific inquiry, technological innovation, and quantitative analysis. Popular fields include:</p>
      <ul>
        <li><strong>Computer Science:</strong> Software development, AI, cybersecurity</li>
        <li><strong>Engineering:</strong> Mechanical, electrical, civil, biomedical</li>
        <li><strong>Natural Sciences:</strong> Biology, chemistry, physics, environmental science</li>
        <li><strong>Mathematics:</strong> Applied math, statistics, data science</li>
      </ul>
      
      <h2>Social Sciences</h2>
      <p>Social sciences study human behavior and society. Key fields include:</p>
      <ul>
        <li><strong>Psychology:</strong> Human behavior and mental processes</li>
        <li><strong>Sociology:</strong> Social structures and relationships</li>
        <li><strong>Economics:</strong> Market systems and financial behavior</li>
        <li><strong>Political Science:</strong> Government and political systems</li>
      </ul>
      
      <h2>Humanities</h2>
      <p>Humanities explore human culture, history, and expression. Major areas include:</p>
      <ul>
        <li><strong>Literature:</strong> Literary analysis and creative writing</li>
        <li><strong>History:</strong> Historical research and interpretation</li>
        <li><strong>Philosophy:</strong> Critical thinking and ethical reasoning</li>
        <li><strong>Languages:</strong> Linguistic study and cultural immersion</li>
      </ul>
      
      <h2>Arts and Creative Fields</h2>
      <p>Creative fields emphasize artistic expression and innovation:</p>
      <ul>
        <li><strong>Visual Arts:</strong> Painting, sculpture, digital arts</li>
        <li><strong>Performing Arts:</strong> Theater, music, dance</li>
        <li><strong>Design:</strong> Graphic design, fashion, architecture</li>
      </ul>
      
      <h2>Business and Professional Fields</h2>
      <p>Business programs prepare students for careers in commerce and management:</p>
      <ul>
        <li><strong>Business Administration:</strong> Management, strategy, entrepreneurship</li>
        <li><strong>Finance:</strong> Banking, investment, financial planning</li>
        <li><strong>Marketing:</strong> Branding, advertising, market research</li>
      </ul>
      
      <h2>How to Choose Your Field</h2>
      <p>Consider these factors when selecting an academic field:</p>
      <ul>
        <li>Your interests and passions</li>
        <li>Career opportunities and job market</li>
        <li>Academic strengths and skills</li>
        <li>Long-term career goals</li>
        <li>Work-life balance preferences</li>
      </ul>
      
      <h2>Conclusion</h2>
      <p>Each academic field offers unique perspectives and career paths. Take time to explore your interests, talk to professionals in different fields, and consider how each discipline aligns with your goals and values.</p>
    `,
    excerpt: 'A comprehensive overview of major academic disciplines to help you understand different fields of study and make informed choices.',
    category: 'Orientation',
    published: true,
    featured_image: null,
  },
  {
    title: 'Application Process: Step-by-Step Guide for University Admissions',
    slug: 'university-admissions-step-by-step',
    content: `
      <h2>Introduction</h2>
      <p>The university application process can seem overwhelming, but breaking it down into manageable steps makes it much easier. This guide will walk you through each stage of the application process.</p>
      
      <h2>Step 1: Research and Create a List (12-18 months before)</h2>
      <p>Start early by researching universities that match your interests, academic profile, and career goals. Create a list of:</p>
      <ul>
        <li><strong>Reach schools:</strong> Competitive but achievable</li>
        <li><strong>Target schools:</strong> Good fit based on your profile</li>
        <li><strong>Safety schools:</strong> Strong likelihood of acceptance</li>
      </ul>
      
      <h2>Step 2: Understand Requirements (10-12 months before)</h2>
      <p>Each university has specific requirements. Common elements include:</p>
      <ul>
        <li>Academic transcripts</li>
        <li>Standardized test scores (SAT, ACT, TOEFL, IELTS)</li>
        <li>Letters of recommendation</li>
        <li>Personal statement or essay</li>
        <li>Portfolio (for arts programs)</li>
      </ul>
      
      <h2>Step 3: Prepare Standardized Tests (9-12 months before)</h2>
      <p>Register for and prepare for required standardized tests:</p>
      <ul>
        <li>Take practice tests to identify areas for improvement</li>
        <li>Consider test prep courses or tutoring</li>
        <li>Allow time for multiple attempts if needed</li>
      </ul>
      
      <h2>Step 4: Request Transcripts and Recommendations (6-9 months before)</h2>
      <p>Contact your school to request official transcripts. Ask teachers, counselors, or employers for recommendation letters well in advance.</p>
      
      <h2>Step 5: Write Your Personal Statement (4-6 months before)</h2>
      <p>Your personal statement is crucial. Tips for writing:</p>
      <ul>
        <li>Tell a compelling story that showcases your personality</li>
        <li>Be authentic and specific</li>
        <li>Show passion for your chosen field</li>
        <li>Get feedback from mentors or writing centers</li>
      </ul>
      
      <h2>Step 6: Complete Applications (2-4 months before deadlines)</h2>
      <p>Fill out all application forms carefully:</p>
      <ul>
        <li>Double-check all information for accuracy</li>
        <li>Meet all requirements for each university</li>
        <li>Submit supplementary materials</li>
        <li>Pay application fees</li>
      </ul>
      
      <h2>Step 7: Submit Before Deadlines</h2>
      <p>Submit all applications before deadlines. Early decision/action deadlines are typically in November, while regular decision is usually in January.</p>
      
      <h2>Step 8: Follow Up</h2>
      <p>After submitting, check your application status regularly and respond promptly to any requests for additional information.</p>
      
      <h2>Conclusion</h2>
      <p>Starting early, staying organized, and paying attention to details are key to a successful application process. Good luck with your applications!</p>
    `,
    excerpt: 'A detailed step-by-step guide to navigating the university application process from research to submission.',
    category: 'Procedures',
    published: true,
    featured_image: null,
  },
  {
    title: 'Scholarship Opportunities: How to Find and Apply for Financial Aid',
    slug: 'scholarship-opportunities-guide',
    content: `
      <h2>Introduction</h2>
      <p>Financing your education is a crucial concern for many students. Scholarships can significantly reduce the financial burden. This guide will help you find and successfully apply for scholarships.</p>
      
      <h2>Types of Scholarships</h2>
      <p>Understanding different scholarship types will help you identify opportunities:</p>
      
      <h3>1. Merit-Based Scholarships</h3>
      <p>Awarded based on academic achievement, talent, or accomplishments. Examples include:</p>
      <ul>
        <li>Academic excellence scholarships</li>
        <li>Artistic or athletic scholarships</li>
        <li>Leadership scholarships</li>
      </ul>
      
      <h3>2. Need-Based Scholarships</h3>
      <p>Awarded based on financial need. Requires demonstrating financial hardship through:</p>
      <ul>
        <li>Financial aid forms (FAFSA, CSS Profile)</li>
        <li>Income documentation</li>
        <li>Family financial information</li>
      </ul>
      
      <h3>3. Field-Specific Scholarships</h3>
      <p>Available for students in specific majors or fields of study. Many professional organizations offer these.</p>
      
      <h3>4. Demographic-Based Scholarships</h3>
      <p>Awarded to students from specific backgrounds, including:</p>
      <ul>
        <li>Ethnic or cultural groups</li>
        <li>First-generation college students</li>
        <li>Women in STEM</li>
        <li>LGBTQ+ students</li>
      </ul>
      
      <h2>Where to Find Scholarships</h2>
      <ul>
        <li><strong>University websites:</strong> Check financial aid pages</li>
        <li><strong>Scholarship databases:</strong> Fastweb, Scholarships.com, College Board</li>
        <li><strong>Professional organizations:</strong> Industry-specific groups</li>
        <li><strong>Local sources:</strong> Community foundations, local businesses</li>
        <li><strong>Government programs:</strong> Federal and state financial aid</li>
      </ul>
      
      <h2>How to Apply Successfully</h2>
      
      <h3>1. Start Early</h3>
      <p>Begin searching for scholarships as early as possible, ideally 12-18 months before you need the funding.</p>
      
      <h3>2. Read Requirements Carefully</h3>
      <p>Only apply for scholarships you're eligible for. Pay attention to:</p>
      <ul>
        <li>Deadlines</li>
        <li>Eligibility criteria</li>
        <li>Required documents</li>
        <li>Essay prompts</li>
      </ul>
      
      <h3>3. Write Strong Essays</h3>
      <p>Many scholarships require essays. Tips for success:</p>
      <ul>
        <li>Address the prompt directly</li>
        <li>Be specific and authentic</li>
        <li>Show how you meet the scholarship's goals</li>
        <li>Edit and proofread carefully</li>
      </ul>
      
      <h3>4. Get Strong Recommendations</h3>
      <p>Choose recommenders who know you well and can speak to your qualifications. Provide them with context and your resume.</p>
      
      <h3>5. Stay Organized</h3>
      <p>Keep track of:</p>
      <ul>
        <li>Application deadlines</li>
        <li>Required documents</li>
        <li>Submission confirmations</li>
        <li>Follow-up dates</li>
      </ul>
      
      <h3>6. Apply to Multiple Scholarships</h3>
      <p>Don't put all your hopes on one scholarship. Apply to many to increase your chances.</p>
      
      <h2>Common Mistakes to Avoid</h2>
      <ul>
        <li>Missing deadlines</li>
        <li>Not following instructions exactly</li>
        <li>Submitting incomplete applications</li>
        <li>Not proofreading</li>
        <li>Giving up too early</li>
      </ul>
      
      <h2>Conclusion</h2>
      <p>Finding and securing scholarships takes time and effort, but the financial benefits make it worthwhile. Start early, stay organized, and don't be discouraged by rejections. Each application is a learning opportunity.</p>
    `,
    excerpt: 'Comprehensive guide to finding scholarship opportunities and tips for submitting successful applications.',
    category: 'Tips',
    published: true,
    featured_image: null,
  },
];

// Sample orientation resources data
const sampleOrientationResources = [
  {
    title: 'How to Evaluate and Choose a School',
    slug: 'evaluate-and-choose-school',
    content: `
      <h2>Overview</h2>
      <p>Learn how to evaluate schools based on accreditation, programs, location, outcomes, and student experience.</p>
      <h2>Key Criteria</h2>
      <ul>
        <li>Program quality and ranking</li>
        <li>Graduate outcomes and employability</li>
        <li>Campus life and support services</li>
        <li>Costs, scholarships, and ROI</li>
      </ul>
    `,
    category: 'schools',
    featured: true,
    premium: false,
  },
  {
    title: 'Choosing Your Field: A Practical Framework',
    slug: 'choosing-your-field-framework',
    content: `
      <h2>Find Your Fit</h2>
      <p>Use this framework to align your interests, skills, and career goals with the right academic field.</p>
      <h2>Framework</h2>
      <ol>
        <li>Identify interests and strengths</li>
        <li>Explore career paths and market demand</li>
        <li>Match programs to outcomes</li>
        <li>Pilot with projects and internships</li>
      </ol>
    `,
    category: 'fields',
    featured: true,
    premium: false,
  },
  {
    title: 'University Application Procedures: Step-by-Step',
    slug: 'university-application-procedures',
    content: `
      <h2>Process</h2>
      <p>A concise step-by-step guide to the core application procedures most universities follow.</p>
      <h2>Steps</h2>
      <ol>
        <li>Shortlist programs and deadlines</li>
        <li>Prepare tests and documents</li>
        <li>Write statements and get recommendations</li>
        <li>Submit and track applications</li>
      </ol>
    `,
    category: 'procedures',
    featured: false,
    premium: false,
  },
];

async function seedArticles() {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Step 1: Create a test author user if needed
    console.log('📝 Checking for test author user...');
    
    // Try to find existing admin user
    let { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'admin@academora.com')
      .single();

    let authorId;

    if (!existingUser) {
      console.log('👤 Creating test author user...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert([
          {
            email: 'admin@academora.com',
            password: hashedPassword,
          },
        ])
        .select('id')
        .single();

      if (userError) {
        throw userError;
      }

      authorId = newUser.id;
      console.log('✅ Test author created:', authorId);
    } else {
      authorId = existingUser.id;
      console.log('✅ Using existing author:', authorId);
    }

    // Step 2: Check for existing articles
    console.log('\n📚 Checking existing articles...');
    const { data: existingArticles } = await supabase
      .from('articles')
      .select('slug');

    const existingSlugs = new Set(existingArticles?.map(a => a.slug) || []);

    // Step 3: Insert articles
    console.log('\n📝 Inserting articles...\n');
    let created = 0;
    let skipped = 0;

    for (const article of sampleArticles) {
      if (existingSlugs.has(article.slug)) {
        console.log(`⏭️  Skipping "${article.title}" (already exists)`);
        skipped++;
        continue;
      }

      const { data, error } = await supabase
        .from('articles')
        .insert([
          {
            ...article,
            content: article.content.trim(),
            author_id: authorId,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error(`❌ Error inserting "${article.title}":`, error.message);
      } else {
        console.log(`✅ Created: "${article.title}"`);
        created++;
      }
    }

    console.log('\n✨ Seeding complete!');
    console.log(`📊 Results: ${created} created, ${skipped} skipped`);
    
    if (created > 0) {
      console.log('\n🎉 Articles are now available in your database!');
      console.log('💡 Visit http://localhost:5173/blog to see them');
    }

  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

async function seedOrientationResources() {
  try {
    console.log('\n🧭 Checking existing orientation resources...');
    const { data: existing } = await supabase
      .from('orientation_resources')
      .select('category, slug');

    const existingKeys = new Set((existing || []).map(r => `${r.category}:${r.slug}`));

    console.log('\n🧩 Inserting orientation resources...\n');
    let created = 0;
    let skipped = 0;

    for (const resource of sampleOrientationResources) {
      const key = `${resource.category}:${resource.slug}`;
      if (existingKeys.has(key)) {
        console.log(`⏭️  Skipping "${resource.title}" (${key}) (already exists)`);
        skipped++;
        continue;
      }

      const { error } = await supabase
        .from('orientation_resources')
        .insert([
          {
            ...resource,
            content: resource.content.trim(),
          },
        ]);

      if (error) {
        console.error(`❌ Error inserting "${resource.title}":`, error.message);
      } else {
        console.log(`✅ Created: "${resource.title}"`);
        created++;
      }
    }

    console.log(`\n🧭 Orientation seeding done: ${created} created, ${skipped} skipped`);
    if (created > 0) {
      console.log('💡 Visit http://localhost:5173/orientation to see them');
    }
  } catch (error) {
    console.error('❌ Orientation seeding failed:', error.message);
    throw error;
  }
}

// Run seeding
(async () => {
  try {
    await seedArticles();
    await seedOrientationResources();
    console.log('\n✅ Seed script completed');
    process.exit(0);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
})();

