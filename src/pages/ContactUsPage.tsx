import { useState } from 'react';
import { Mail, Phone, MapPin, Send, Clock, Users } from 'lucide-react';

export default function ContactUsPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    type: 'general' // general, support, partnership, feedback
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In real implementation, send to your backend
      console.log('Contact form submitted:', formData);
      
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        type: 'general'
      });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
      
      // Reset status after 5 seconds
      if (submitStatus !== 'idle') {
        setTimeout(() => setSubmitStatus('idle'), 5000);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-16">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 xl:px-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Get in Touch
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Have questions about your academic journey? Need guidance on choosing the right field? Our team of experienced education counselors is here to help you every step of the way.
          </p>
          <div className="mt-10 flex justify-center space-x-12">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">24-48h</div>
              <div className="text-base text-gray-600 mt-1">Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600">50K+</div>
              <div className="text-base text-gray-600 mt-1">Students Helped</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600">4.9/5</div>
              <div className="text-base text-gray-600 mt-1">Satisfaction Rate</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Get in Touch</h2>
              
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Email Us</h3>
                    <p className="text-gray-600">hello@academora.com</p>
                    <p className="text-sm text-gray-500">General inquiries & partnerships</p>
                    <p className="text-gray-600 mt-1">support@academora.com</p>
                    <p className="text-sm text-gray-500">Student support & technical help</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Call Us</h3>
                    <p className="text-gray-600">+1 (555) 123-4567</p>
                    <p className="text-sm text-gray-500">Main office & counseling services</p>
                    <p className="text-gray-600 mt-1">+1 (555) 123-4567</p>
                    <p className="text-sm text-gray-500">Emergency student support</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Visit Us</h3>
                    <p className="text-gray-600">AcademOra Headquarters</p>
                    <p className="text-gray-600">123 Education Boulevard, Suite 100</p>
                    <p className="text-gray-600">Boston, MA 02108</p>
                    <p className="text-sm text-gray-500">United States</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Business Hours</h3>
                    <p className="text-gray-600">Monday - Friday: 8:00 AM - 8:00 PM EST</p>
                    <p className="text-gray-600">Saturday: 10:00 AM - 4:00 PM EST</p>
                    <p className="text-gray-600">Sunday: 12:00 PM - 4:00 PM EST</p>
                    <p className="text-sm text-gray-500 mt-1">24/7 email support available</p>
                  </div>
                </div>
              </div>

              {/* Services Available */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="flex items-center space-x-3 mb-4">
                  <Users className="h-5 w-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Our Services</h3>
                </div>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Academic field exploration & guidance</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>University application assistance</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Career counseling & planning</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>Study abroad program guidance</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                    <span>Scholarship & financial aid advice</span>
                  </div>
                </div>
              </div>

              {/* Response Time */}
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">24h</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900">Quick Response</h4>
                    <p className="text-sm text-blue-700">We respond to all inquiries within 24 hours</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Send us a Message</h2>
              
              {submitStatus === 'success' && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-medium">Thank you for your message! We'll get back to you soon.</p>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 font-medium">Something went wrong. Please try again later.</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-5 py-4 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-5 py-4 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                    How can we help you? *
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                    className="w-full px-5 py-4 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="general">General Information</option>
                    <option value="academic">Academic Guidance & Counseling</option>
                    <option value="university">University Application Help</option>
                    <option value="career">Career Planning & Advice</option>
                    <option value="studyabroad">Study Abroad Programs</option>
                    <option value="scholarship">Scholarship & Financial Aid</option>
                    <option value="support">Technical Support</option>
                    <option value="partnership">Partnership Opportunities</option>
                    <option value="feedback">Feedback & Suggestions</option>
                    <option value="complaint">Report an Issue</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-5 py-4 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="How can we help you?"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-5 py-4 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Fields marked with * are required
                  </p>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-md hover:shadow-lg"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 bg-white rounded-2xl shadow-xl p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 text-lg">How quickly will I receive a response?</h3>
                <p className="text-gray-600 leading-relaxed">We respond to all inquiries within 24 hours during business days. For urgent academic matters, we offer priority response within 4-6 hours.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">What kind of academic guidance do you provide?</h3>
                <p className="text-gray-600">We offer comprehensive guidance including field exploration, university selection, application assistance, career planning, and study abroad counseling.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Are your counseling services personalized?</h3>
                <p className="text-gray-600">Yes! All our guidance is tailored to your individual interests, academic background, career goals, and personal circumstances.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Do you help with university applications?</h3>
                <p className="text-gray-600">Absolutely. We assist with everything from choosing universities to essay writing, interview preparation, and submission guidance.</p>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">What are your service fees?</h3>
                <p className="text-gray-600">Basic orientation resources are completely free. Premium services include personalized counseling (starting at $50/session) and comprehensive application packages.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Can you help me find scholarships?</h3>
                <p className="text-gray-600">Yes, we provide scholarship matching services, application guidance, and financial aid counseling to help make education more affordable.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Do you work with international students?</h3>
                <p className="text-gray-600">Absolutely! We specialize in helping international students with university selection, visa applications, and cultural adaptation guidance.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">How can I schedule a counseling session?</h3>
                <p className="text-gray-600">Simply contact us through this form or call our office. We'll match you with the right counselor and schedule a convenient time for your session.</p>
              </div>
            </div>
          </div>
          
          {/* Additional Help Section */}
          <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Still have questions?</h3>
              <p className="text-gray-600 mb-4">Our team is here to help you navigate your academic journey with confidence.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="tel:+15551234567"
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Phone className="h-4 w-4" />
                  <span>Call Us Now</span>
                </a>
                <a
                  href="mailto:hello@academora.com"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Mail className="h-4 w-4" />
                  <span>Email Us</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
