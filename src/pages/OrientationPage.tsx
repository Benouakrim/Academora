import { Link } from 'react-router-dom'
import { GraduationCap, Building2, Globe, FileText, Scale } from 'lucide-react'

const categories = [
  {
    name: 'Fields',
    slug: 'fields',
    description: 'Explore different academic fields and programs',
    icon: GraduationCap,
    color: 'bg-blue-500',
  },
  {
    name: 'Schools',
    slug: 'schools',
    description: 'Compare schools and universities worldwide',
    icon: Building2,
    color: 'bg-green-500',
  },
  {
    name: 'Study Abroad',
    slug: 'study-abroad',
    description: 'International study opportunities and programs',
    icon: Globe,
    color: 'bg-purple-500',
  },
  {
    name: 'Procedures',
    slug: 'procedures',
    description: 'Step-by-step guides for applications and admissions',
    icon: FileText,
    color: 'bg-orange-500',
  },
  {
    name: 'Comparisons',
    slug: 'comparisons',
    description: 'Compare programs, schools, and opportunities',
    icon: Scale,
    color: 'bg-red-500',
  },
]

export default function OrientationPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Academic Orientation
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comprehensive resources to guide your academic decisions and career path
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <Link
                key={category.slug}
                to={`/orientation/${category.slug}`}
                className="card group hover:scale-105 transition-transform duration-200"
              >
                <div className={`${category.color} w-16 h-16 rounded-xl flex items-center justify-center mb-4 text-white`}>
                  <Icon className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-bold mb-2 text-gray-900 group-hover:text-primary-600 transition-colors">
                  {category.name}
                </h2>
                <p className="text-gray-600">{category.description}</p>
                <div className="mt-4 text-primary-600 font-semibold group-hover:text-primary-700">
                  Explore →
                </div>
              </Link>
            )
          })}
        </div>

        {/* Info Section */}
        <div className="mt-20 bg-white rounded-xl shadow-lg p-8 md:p-12">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Your Academic Journey, Simplified
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              AcademOra provides comprehensive orientation resources to help you make informed
              decisions about your education. Whether you're choosing a field, selecting a school,
              planning to study abroad, or navigating procedures, we've got you covered.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600 mb-2">1000+</div>
                <div className="text-gray-600">Resources</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600 mb-2">500+</div>
                <div className="text-gray-600">Schools</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600 mb-2">50+</div>
                <div className="text-gray-600">Countries</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

