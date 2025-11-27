import { Link, useLocation } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard,
  Sparkles,
  GitCompare,
  BookOpen,
  FileText,
  PenSquare,
  Gift,
  Building2,
  Compass,
  Menu,
  X,
  ChevronRight,
  MessageCircle,
  Shield,
  Phone,
  Settings,
} from 'lucide-react'

interface UserMenuProps {
  isOpen: boolean
  onToggle: () => void
}

const MENU_ITEMS: Array<{
  name: string
  path: string
  icon: LucideIcon
  description: string
}> = [
  {
    name: 'Dashboard Home',
    path: '/dashboard',
    icon: LayoutDashboard,
    description: 'See your overview and account activity',
  },
  {
    name: 'Edit Profile',
    path: '/dashboard?tab=settings',
    icon: Settings,
    description: 'Update your name, bio, and interests',
  },
  {
    name: 'Services Hub',
    path: '/orientation',
    icon: Compass,
    description: 'Explore personalized guidance services',
  },
  {
    name: 'Matching Engine',
    path: '/matching-engine',
    icon: Sparkles,
    description: 'Discover tailored program matches',
  },
  {
    name: 'Compare Universities',
    path: '/compare',
    icon: GitCompare,
    description: 'Side-by-side university comparisons',
  },
  {
    name: 'Referrals',
    path: '/referrals',
    icon: Gift,
    description: 'Share AcademOra and earn rewards',
  },
  {
    name: 'Blog',
    path: '/blog',
    icon: BookOpen,
    description: 'Latest stories and guidance',
  },
  {
    name: 'Our Company',
    path: '/our-company',
    icon: Building2,
    description: 'Learn about the team behind AcademOra',
  },
  {
    name: 'My Articles',
    path: '/my-articles',
    icon: FileText,
    description: 'Manage your published work',
  },
  {
    name: 'Write Article',
    path: '/write-article',
    icon: PenSquare,
    description: 'Share your insights with the community',
  },
]

const QUICK_ACTIONS: Array<{ label: string; path: string; icon: LucideIcon }> = [
  {
    label: 'Message support',
    path: '/our-company?tab=contact',
    icon: MessageCircle,
  },
  {
    label: 'Privacy controls',
    path: '/our-company?tab=policy',
    icon: Shield,
  },
  {
    label: 'Account security (Clerk)',
    path: '/account',
    icon: Shield,
  },
]

export default function UserMenu({ isOpen, onToggle }: UserMenuProps) {
  const location = useLocation()

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard'
    }
    if (path === '/my-articles' || path === '/write-article') {
      return location.pathname.startsWith(path)
    }
    return location.pathname.startsWith(path)
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      <div
        className={`
          fixed top-0 left-0 h-full bg-white shadow-2xl z-50 transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          w-80 flex flex-col
        `}
      >
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Menu className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">User Menu</h2>
                <p className="text-indigo-100 text-sm">Quick access to your tools</p>
              </div>
            </div>
            <button
              onClick={onToggle}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 min-h-0">
          <div className="space-y-2">
            {MENU_ITEMS.map((item) => {
              const Icon = item.icon
              const active = isActive(item.path)

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onToggle}
                  className={`
                    flex items-center gap-4 p-4 rounded-xl transition-all duration-200 group
                    ${active
                      ? 'bg-indigo-50 text-indigo-700 border-2 border-indigo-200 shadow-sm'
                      : 'hover:bg-gray-50 text-gray-700 hover:shadow-sm border-2 border-transparent'}
                  `}
                >
                  <div
                    className={`
                      p-2.5 rounded-lg transition-all duration-200
                      ${active ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'}
                    `}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">{item.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                  </div>
                  <ChevronRight
                    className={`
                      h-4 w-4 transition-all duration-200
                      ${active ? 'text-indigo-700' : 'text-gray-400 group-hover:text-gray-600'}
                    `}
                  />
                </Link>
              )
            })}
          </div>

          <div className="mt-8 p-4 bg-gray-50 rounded-xl">
            <h3 className="font-semibold text-gray-800 mb-3 text-sm">Quick Actions</h3>
            <div className="space-y-2">
              {QUICK_ACTIONS.map((action) => {
                const Icon = action.icon
                return (
                  <Link
                    key={action.label}
                    to={action.path}
                    onClick={onToggle}
                    className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-sm transition-all duration-200 text-sm text-gray-700 hover:text-indigo-600"
                  >
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Icon className="h-4 w-4 text-indigo-600" />
                    </div>
                    <span className="font-medium">{action.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Your workspace is ready</span>
          </div>
        </div>
      </div>
    </>
  )
}

