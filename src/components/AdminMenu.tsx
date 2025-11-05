import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Image,
  File,
  Palette,
  Users,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';

interface AdminMenuProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function AdminMenu({ isOpen, onToggle }: AdminMenuProps) {
  const location = useLocation();

  const menuItems = [
    {
      name: 'Dashboard',
      icon: LayoutDashboard,
      path: '/admin',
      description: 'Overview and statistics'
    },
    {
      name: 'Posts',
      icon: FileText,
      path: '/admin/articles',
      description: 'Manage articles and blog posts'
    },
    {
      name: 'Media',
      icon: Image,
      path: '/admin/media',
      description: 'Upload and manage media files'
    },
    {
      name: 'Pages',
      icon: File,
      path: '/admin/pages',
      description: 'Create and edit static pages'
    },
    {
      name: 'Appearance',
      icon: Palette,
      path: '/admin/appearance',
      description: 'Customize theme and layout'
    },
    {
      name: 'Users',
      icon: Users,
      path: '/admin/users',
      description: 'Manage user accounts'
    }
  ];

  const isActive = (path: string) => {
    if (path === '/admin' && location.pathname === '/admin') return true;
    if (path !== '/admin' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Menu Panel */}
      <div
        className={`
          fixed top-0 left-0 h-full bg-white shadow-2xl z-50 transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          w-72
        `}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Menu className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Admin Menu</h2>
                <p className="text-blue-100 text-sm">Management Panel</p>
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

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onToggle}
                  className={`
                    flex items-center gap-4 p-4 rounded-xl transition-all duration-200 group
                    ${active
                      ? 'bg-blue-50 text-blue-700 border-2 border-blue-200 shadow-sm'
                      : 'hover:bg-gray-50 text-gray-700 hover:shadow-sm border-2 border-transparent'
                    }
                  `}
                >
                  <div className={`
                    p-2.5 rounded-lg transition-all duration-200
                    ${active ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'}
                  `}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">{item.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                  </div>
                  <ChevronRight className={`
                    h-4 w-4 transition-all duration-200
                    ${active ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-600'}
                  `} />
                </Link>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="mt-8 p-4 bg-gray-50 rounded-xl">
            <h3 className="font-semibold text-gray-800 mb-3 text-sm">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                to="/admin/articles/new"
                onClick={onToggle}
                className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-sm transition-all duration-200 text-sm text-gray-700 hover:text-blue-600"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                <span className="font-medium">Create New Article</span>
              </Link>
              <Link
                to="/admin/media"
                onClick={onToggle}
                className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-sm transition-all duration-200 text-sm text-gray-700 hover:text-blue-600"
              >
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Image className="h-4 w-4 text-green-600" />
                </div>
                <span className="font-medium">Upload Media</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>System Online</span>
          </div>
        </div>
      </div>
    </>
  );
}
