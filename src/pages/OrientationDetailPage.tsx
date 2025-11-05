import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Lock } from 'lucide-react'
import { orientationAPI, getCurrentUser } from '../lib/api'

interface Resource {
  id: string
  title: string
  slug: string
  content: string
  category: string
  premium: boolean
  created_at: string
}

export default function OrientationDetailPage() {
  const { category, slug } = useParams<{ category: string; slug: string }>()
  const [resource, setResource] = useState<Resource | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const user = getCurrentUser()
    setIsAuthenticated(!!user)
  }, [])

  useEffect(() => {
    async function fetchResource() {
      if (!slug || !category) return

      try {
        const resourceData = await orientationAPI.getResource(category, slug)
        
        if (resourceData) {
          setResource(resourceData as Resource)

          // If resource is premium and user is not authenticated, redirect to login
          const user = getCurrentUser()
          if (resourceData.premium && !user) {
            navigate('/login')
            return
          }
          setIsAuthenticated(!!user)
        }
      } catch (error) {
        console.error('Error fetching resource:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchResource()
  }, [slug, category, navigate])

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Loading resource...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!resource) {
    return (
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold mb-4">Resource Not Found</h1>
            <p className="text-gray-600 mb-6">The resource you're looking for doesn't exist.</p>
            <Link to="/orientation" className="btn-primary">
              Back to Orientation
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (resource.premium && !isAuthenticated) {
    return (
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20 bg-white rounded-xl shadow-lg p-12">
            <Lock className="h-16 w-16 text-primary-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">Premium Content</h1>
            <p className="text-gray-600 mb-6">
              This resource is available for premium members only. Please log in or sign up to access it.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/login" className="btn-primary">
                Log In
              </Link>
              <Link to="/signup" className="btn-secondary">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to={`/orientation/${category}`}
          className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to {category}
        </Link>

        <article className="bg-white rounded-xl shadow-lg p-8 md:p-12">
          <div className="mb-6 flex items-center justify-between">
            <span className="inline-block bg-primary-100 text-primary-700 text-sm font-semibold px-4 py-1 rounded-full">
              {category}
            </span>
            {resource.premium && (
              <span className="inline-flex items-center bg-yellow-100 text-yellow-800 text-sm font-semibold px-4 py-1 rounded-full">
                <Lock className="h-3 w-3 mr-1" />
                Premium
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
            {resource.title}
          </h1>

          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: resource.content }}
          />
        </article>
      </div>
    </div>
  )
}

