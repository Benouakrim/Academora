import { ReactNode, useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import AdminMenu from './AdminMenu'
import { getCurrentUser } from '../lib/api'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Check if user is admin
    const user = getCurrentUser();
    const adminRoutes = ['/admin', '/admin/', '/admin/articles', '/admin/users'];
    const isAdminRoute = adminRoutes.some(route => location.pathname.startsWith(route));
    
    if (user && (user.role === 'admin' || isAdminRoute)) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
      setShowAdminMenu(false);
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar 
        onAdminMenuToggle={() => setShowAdminMenu(!showAdminMenu)}
        showAdminMenu={showAdminMenu}
      />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      {isAdmin && (
        <AdminMenu 
          isOpen={showAdminMenu} 
          onToggle={() => setShowAdminMenu(!showAdminMenu)} 
        />
      )}
    </div>
  )
}

