import { ReactNode, useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import AdminMenu from './AdminMenu'
import CookieConsent from './CookieConsent'
import { getCurrentUser } from '../lib/api'
import { CookieManager } from '../lib/cookies'
import DevNavigator from './dev/DevNavigator'
import { registerVisitedPath } from '../devtools/routeRegistry'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Initialize cookie management
    CookieManager.initialize();
    
    // Track visited paths for Dev Navigator (helps surface dynamic instances)
    if (import.meta.env.DEV) {
      registerVisitedPath(location.pathname)
      // Trigger backend scanner (non-blocking)
      fetch((import.meta as any).env?.VITE_API_URL?.replace(/\/$/, '') + '/dev/scan').catch(()=>{})
    }
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

  // Determine if footer should be hidden (editor pages)
  const shouldHideFooter = () => {
    const pathname = location.pathname;
    
    // Editor routes that should hide footer
    const editorPatterns = [
      /^\/admin\/articles\/(new|edit\/)/,  // /admin/articles/new or /admin/articles/edit/:id
      /^\/admin\/pages\/(new|.*\/edit)$/,   // /admin/pages/new or /admin/pages/:slug/edit
      /^\/admin\/universities\/(new|edit\/)/, // /admin/universities/new or /admin/universities/edit/:id
      /^\/admin\/university-groups\/(new|edit\/)/, // /admin/university-groups/new or /admin/university-groups/edit/:id
    ];
    
    return editorPatterns.some(pattern => pattern.test(pathname));
  };

  const hideFooter = shouldHideFooter();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar 
        onAdminMenuToggle={() => setShowAdminMenu(!showAdminMenu)}
        showAdminMenu={showAdminMenu}
        isAdmin={isAdmin}
      />
      <main className="flex-grow">
        {children}
      </main>
      {!hideFooter && <Footer />}
      {isAdmin && (
        <AdminMenu 
          isOpen={showAdminMenu} 
          onToggle={() => setShowAdminMenu(!showAdminMenu)} 
        />
      )}
      <CookieConsent />
      {import.meta.env.DEV && (
        <DevNavigator />
      )}
    </div>
  )
}

