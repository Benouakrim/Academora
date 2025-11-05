import { useState, useEffect } from 'react';

interface PageContent {
  title: string;
  content: string;
  meta_title: string;
  meta_description: string;
  updated_at: string;
}

export default function AboutUsPage() {
  const [pageContent, setPageContent] = useState<PageContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching page content
    // In real implementation, this would come from your API
    const mockContent: PageContent = {
      title: "About AcademOra",
      content: `
        <h2>Our Mission</h2>
        <p>At AcademOra, we are dedicated to transforming the way students discover and pursue their educational paths. Our mission is to provide comprehensive academic orientation and guidance that empowers students to make informed decisions about their future. We believe that every student, regardless of their background or location, deserves access to quality educational resources and personalized guidance to unlock their full potential.</p>
        
        <h2>Who We Are</h2>
        <p>Founded in 2020, AcademOra emerged from a simple yet powerful observation: students worldwide often struggle with navigating the complex landscape of educational opportunities. Our team comprises passionate educators, experienced counselors, technology innovators, and former admissions professionals who have collectively spent decades helping students find their ideal academic paths.</p>
        
        <p>Our diverse team brings together expertise from prestigious institutions, cutting-edge technology companies, and grassroots educational organizations. This unique blend allows us to understand both the traditional challenges students face and the innovative solutions needed to address them in the digital age.</p>
        
        <h2>What We Offer</h2>
        <h3>Comprehensive Academic Guidance</h3>
        <p>Our platform provides personalized counseling tailored to each student's unique interests, strengths, and goals. Through advanced algorithms and human expertise, we help students identify academic fields that align with their passions and career aspirations.</p>
        
        <h3>Extensive Field Exploration</h3>
        <p>Explore over 200 academic fields with detailed information about curriculum requirements, career prospects, salary expectations, and industry trends. Our comprehensive database is regularly updated to reflect the latest developments in each field.</p>
        
        <h3>Global School Directory</h3>
        <p>Access detailed profiles of thousands of educational institutions worldwide, including universities, colleges, vocational schools, and specialized programs. Compare institutions based on rankings, admission requirements, tuition costs, and student outcomes.</p>
        
        <h3>Study Abroad Support</h3>
        <p>Navigate the complexities of international education with our comprehensive study abroad resources. From visa requirements to cultural adaptation tips, we guide students through every step of their international academic journey.</p>
        
        <h3>Application Assistance</h3>
        <p>Receive expert guidance on admission procedures, essay writing, interview preparation, and scholarship applications. Our success rate speaks for itself – over 85% of students who use our application guidance get accepted to their top-choice institutions.</p>
        
        <h2>Our Impact</h2>
        <p>Since our inception, AcademOra has helped over 50,000 students from 120+ countries make informed educational decisions. Our platform has been recognized by educational institutions worldwide for its innovative approach to student guidance and its commitment to accessibility.</p>
        
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; border-radius: 1rem; margin: 2rem 0;">
          <h3 style="color: white; margin-bottom: 1rem;">By the Numbers</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; text-align: center;">
            <div>
              <div style="font-size: 2rem; font-weight: bold;">50,000+</div>
              <div>Students Guided</div>
            </div>
            <div>
              <div style="font-size: 2rem; font-weight: bold;">200+</div>
              <div>Academic Fields</div>
            </div>
            <div>
              <div style="font-size: 2rem; font-weight: bold;">1,200+</div>
              <div>Institution Partners</div>
            </div>
            <div>
              <div style="font-size: 2rem; font-weight: bold;">85%</div>
              <div>Success Rate</div>
            </div>
          </div>
        </div>
        
        <h2>Our Values</h2>
        <div style="display: grid; gap: 1.5rem; margin: 2rem 0;">
          <div style="padding: 1.5rem; background: #f8fafc; border-left: 4px solid #3b82f6; border-radius: 0.5rem;">
            <h4 style="color: #1e40af; margin-bottom: 0.5rem;"><strong>Accessibility</strong></h4>
            <p>Education should be accessible to everyone. We're committed to breaking down barriers to educational information and guidance, ensuring that students from all backgrounds can pursue their academic dreams.</p>
          </div>
          
          <div style="padding: 1.5rem; background: #f8fafc; border-left: 4px solid #10b981; border-radius: 0.5rem;">
            <h4 style="color: #047857; margin-bottom: 0.5rem;"><strong>Quality</strong></h4>
            <p>We provide accurate, up-to-date, and comprehensive information. Our content is reviewed by educational experts and regularly updated to reflect the latest trends and requirements in academia.</p>
          </div>
          
          <div style="padding: 1.5rem; background: #f8fafc; border-left: 4px solid #8b5cf6; border-radius: 0.5rem;">
            <h4 style="color: #6d28d9; margin-bottom: 0.5rem;"><strong>Innovation</strong></h4>
            <p>We leverage cutting-edge technology and data science to provide personalized recommendations and insights. Our platform continuously evolves to meet the changing needs of students and educational institutions.</p>
          </div>
          
          <div style="padding: 1.5rem; background: #f8fafc; border-left: 4px solid #f59e0b; border-radius: 0.5rem;">
            <h4 style="color: #d97706; margin-bottom: 0.5rem;"><strong>Support</strong></h4>
            <p>We're committed to supporting students throughout their entire academic journey, from initial exploration to admission and beyond. Our team of experts is always available to provide guidance and answer questions.</p>
          </div>
        </div>
        
        <h2>Our Team</h2>
        <p>Behind AcademOra is a diverse team of professionals united by a common passion for education. Our team includes:</p>
        <ul>
          <li><strong>Education Counselors:</strong> Certified professionals with 10+ years of experience in academic guidance</li>
          <li><strong>Subject Matter Experts:</strong> Specialists in various academic fields providing accurate, up-to-date information</li>
          <li><strong>Technology Innovators:</strong> Engineers and data scientists building cutting-edge guidance tools</li>
          <li><strong>Former Admissions Officers:</strong> Insiders from top universities sharing valuable insights</li>
          <li><strong>Student Success Coaches:</strong> Professionals dedicated to helping students achieve their goals</li>
        </ul>
        
        <h2>Partnerships & Recognition</h2>
        <p>AcademOra is proud to partner with leading educational institutions, government agencies, and nonprofit organizations worldwide. Our platform has been recognized with numerous awards for innovation in educational technology and commitment to student success.</p>
        
        <p>We work closely with universities to ensure our information accurately reflects admission requirements and program details. Our institutional partners trust us to connect them with qualified, well-informed students who are excellent fits for their programs.</p>
        
        <h2>Looking to the Future</h2>
        <p>As we look ahead, AcademOra remains committed to our founding mission while embracing new opportunities to serve students better. We're continuously expanding our platform with new features, including AI-powered career matching, virtual campus tours, and enhanced scholarship matching capabilities.</p>
        
        <p>Our vision is a world where every student can confidently navigate their educational journey, supported by comprehensive guidance and unlimited opportunities. Join us as we work to make this vision a reality.</p>
        
        <h2>Get in Touch</h2>
        <p>Have questions about our services? Want to partner with us? Or simply need guidance on your academic journey? We're here to help. Reach out to our team and let us support you in achieving your educational goals.</p>
        
        <p><strong>Together, we can unlock your academic potential and pave the way for a brighter future.</strong></p>
      `,
      meta_title: "About AcademOra - Academic Orientation & Guidance Platform",
      meta_description: "Learn about AcademOra's mission to provide comprehensive academic orientation and guidance to students worldwide.",
      updated_at: new Date().toISOString()
    };

    setTimeout(() => {
      setPageContent(mockContent);
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!pageContent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h1>
            <p className="text-gray-600">The about page you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-16">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 xl:px-16">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white text-center">
              {pageContent.title}
            </h1>
          </div>

          {/* Content */}
          <div className="px-10 py-16">
            <div 
              className="prose prose-lg max-w-none prose-headings:mb-6 prose-p:mb-4 prose-ul:mb-4 prose-li:mb-2 prose-h2:mt-8 prose-h3:mt-6 prose-h4:mt-4 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: pageContent.content }}
            />
            
            {/* Last Updated */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center">
                Last updated: {new Date(pageContent.updated_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-12 text-white">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Join 50,000+ Students on Their Academic Journey
            </h2>
            <p className="text-lg md:text-xl mb-10 text-blue-100 max-w-3xl mx-auto">
              Take the first step towards a brighter future. Our expert counselors are ready to guide you to success.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <a
                href="/orientation"
                className="px-10 py-4 bg-white text-blue-600 rounded-lg hover:bg-blue-50 Transition-all duration-200 shadow-md hover:shadow-lg font-semibold text-lg"
              >
                Explore Academic Fields
              </a>
              <a
                href="/contact"
                className="px-10 py-4 bg-transparent border-2 border-white text-white rounded-lg hover:bg-white hover:text-blue-600 Transition-all duration-200 font-semibold text-lg"
              >
                Talk to a Counselor
              </a>
            </div>
            <div className="mt-8 flex justify-center space-x-12 text-sm md:text-base">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span>Available 24/7</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                <span>Expert Counselors</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
                <span>85% Success Rate</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
