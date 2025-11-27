import { ReactNode, useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import AdminMenu from './AdminMenu'
import UserMenu from './UserMenu'
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
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasUserSession, setHasUserSession] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Initialize cookie management
    CookieManager.initialize();
    
    // Track visited paths for Dev Navigator (helps surface dynamic instances)
    if (import.meta.env.DEV) {
      registerVisitedPath(location.pathname)
      // Trigger backend scanner (non-blocking) - throttled to once per 30 seconds
      const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
      if (apiUrl) {
        const lastScan = sessionStorage.getItem('dev-scan-last');
        const now = Date.now();
        if (!lastScan || now - parseInt(lastScan, 10) > 30000) {
          sessionStorage.setItem('dev-scan-last', now.toString());
          fetch(apiUrl.replace(/\/$/, '') + '/dev/scan').catch(()=>{});
        }
      }
    }
    // Check if user is admin
    const user = getCurrentUser() as { role?: string } | null;
    const adminRoutes = ['/admin', '/admin/', '/admin/articles', '/admin/users'];
    const isAdminRoute = adminRoutes.some(route => location.pathname.startsWith(route));
    
    setHasUserSession(Boolean(user));

    if (user && (user.role === 'admin' || isAdminRoute)) {
      setShowUserMenu(false);
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
      setShowAdminMenu(false);
    }

    if (!user) {
      setShowUserMenu(false);
    }
  }, [location.pathname]);

  // Determine if footer should be hidden (editor pages)
  const shouldHideFooter = () => {
    const pathname = location.pathname;
    
    // Editor routes that should hide footer
        const editorPatterns = [
          /^\/admin\/articles\/(new|edit\/)?/,  // keep backward compatibility
          /^\/admin\/articles\/(new|edit\/)\d?.*/,  // relaxed match
          /^\/admin\/pages\/(new|.*\/edit)$/,
          /^\/admin\/universities\/(new|edit\/)\d?.*/,
          /^\/admin\/university-groups\/(new|edit\/)\d?.*/,
          /^\/write-article(\/\d+)?$/,
          /^\/admin\/[\w-]+\/Posts\/(add|edit\/.*)$/,
          /^\/user\/[\w-]+\/Posts\/(add|edit\/.*)$/,
          /^\/admin\/review$/,
        ];
    
    return editorPatterns.some(pattern => pattern.test(pathname));
  };

  const hideFooter = shouldHideFooter();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar 
        onAdminMenuToggle={() => setShowAdminMenu(!showAdminMenu)}
        showAdminMenu={showAdminMenu}
        onUserMenuToggle={() => setShowUserMenu(!showUserMenu)}
        showUserMenu={showUserMenu}
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
      {!isAdmin && hasUserSession && (
        <UserMenu
          isOpen={showUserMenu}
          onToggle={() => setShowUserMenu(!showUserMenu)}
        />
      )}
      <CookieConsent />
      {import.meta.env.DEV && (
        <DevNavigator />
      )}
    </div>
  )
}

