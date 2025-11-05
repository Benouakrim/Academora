import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { User, BookOpen, GraduationCap, LogOut } from 'lucide-react'
import { authAPI, getCurrentUser } from '../lib/api'

interface UserType {
  id: string
  email: string
  role?: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserType | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      navigate('/login')
      return
    }
    setUser(currentUser)
    setLoading(false)
  }, [navigate])

  const handleSignOut = () => {
    authAPI.logout()
    navigate('/')
  }

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.email}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-2">
            <div className="card mb-6">
              <div className="flex items-center mb-6">
                <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mr-4">
                  <User className="h-8 w-8 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
                  <p className="text-gray-600">{user?.email}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <p className="text-gray-900">{user?.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    User ID
                  </label>
                  <p className="text-gray-900 font-mono text-sm">{user?.id}</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  to="/orientation"
                  className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-primary-600 hover:bg-primary-50 transition-colors"
                >
                  <GraduationCap className="h-6 w-6 text-primary-600 mr-3" />
                  <span className="font-semibold">Browse Orientation</span>
                </Link>
                <Link
                  to="/blog"
                  className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-primary-600 hover:bg-primary-50 transition-colors"
                >
                  <BookOpen className="h-6 w-6 text-primary-600 mr-3" />
                  <span className="font-semibold">Read Articles</span>
                </Link>
                {user?.role === 'admin' && (
                  <>
                    <Link
                      to="/admin"
                      className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-primary-600 hover:bg-primary-50 transition-colors"
                    >
                      <GraduationCap className="h-6 w-6 text-primary-600 mr-3" />
                      <span className="font-semibold">Manage Articles</span>
                    </Link>
                    <Link
                      to="/admin/articles/new"
                      className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-primary-600 hover:bg-primary-50 transition-colors"
                    >
                      <BookOpen className="h-6 w-6 text-primary-600 mr-3" />
                      <span className="font-semibold">Write New Article</span>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Info */}
            <div className="card">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Account</h3>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center space-x-2 text-red-600 hover:text-red-700 font-semibold py-2 px-4 rounded-lg border-2 border-red-200 hover:border-red-300 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>

            {/* Stats */}
            <div className="card">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Your Activity</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Articles Read</span>
                  <span className="font-semibold">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Resources Saved</span>
                  <span className="font-semibold">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Premium Content</span>
                  <span className="font-semibold text-primary-600">Accessible</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

