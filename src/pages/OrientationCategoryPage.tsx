import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Lock, Star } from 'lucide-react'
import { orientationAPI } from '../lib/api'
import { getCurrentUser } from '../lib/api'

interface Resource {
  id: string
  title: string
  slug: string
  content: string
  category: string
  featured: boolean
  premium: boolean
  created_at: string
}

const categoryNames: Record<string, string> = {
  fields: 'Fields & Programs',
  schools: 'Schools & Universities',
  'study-abroad': 'Study Abroad',
  procedures: 'Procedures & Guides',
  comparisons: 'Comparisons',
}

export default function OrientationCategoryPage() {
  const { category } = useParams<{ category: string }>()
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    async function fetchResources() {
      if (!category) return

      try {
        const data = await orientationAPI.getResourcesByCategory(category)
        setResources(data || [])
      } catch (error) {
        console.error('Error fetching resources:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchResources()
  }, [category])

  const handleResourceClick = (resource: Resource) => {
    if (resource.premium) {
      // Check if user is authenticated
      const user = getCurrentUser()
      if (user) {
        navigate(`/orientation/${category}/${resource.slug}`)
      } else {
        navigate('/login')
      }
    } else {
      navigate(`/orientation/${category}/${resource.slug}`)
    }
  }

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Loading resources...</p>
          </div>
        </div>
      </div>
    )
  }

  const categoryName = category ? categoryNames[category] || category : 'Category'

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <Link to="/orientation" className="text-primary-600 hover:text-primary-700 mb-4 inline-block">
            ← Back to Orientation
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {categoryName}
          </h1>
          <p className="text-xl text-gray-600">
            Explore our comprehensive resources in this category
          </p>
        </div>

        {resources.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-lg">
            <p className="text-xl text-gray-600 mb-4">No resources found in this category.</p>
            <p className="text-gray-500">Check back soon for new content!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {resources.map((resource) => (
              <div
                key={resource.id}
                className="card group cursor-pointer relative"
                onClick={() => handleResourceClick(resource)}
              >
                {resource.featured && (
                  <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-semibold flex items-center">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </div>
                )}
                {resource.premium && (
                  <div className="absolute top-4 left-4 bg-primary-600 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center">
                    <Lock className="h-3 w-3 mr-1" />
                    Premium
                  </div>
                )}
                <h2 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-primary-600 transition-colors pr-20">
                  {resource.title}
                </h2>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {resource.content ? resource.content.substring(0, 150) + '...' : 'No content available'}
                </p>
                <div className="flex items-center text-primary-600 font-semibold">
                  {resource.premium ? (
                    <>
                      <Lock className="h-4 w-4 mr-1" />
                      <span>Premium Content</span>
                    </>
                  ) : (
                    <>
                      Read More <ArrowRight className="h-4 w-4 ml-1" />
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

