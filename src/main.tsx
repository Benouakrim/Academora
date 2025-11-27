import React from 'react'
import ReactDOM from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App.tsx'
import './index.css'
import './i18n/config'
import ErrorBoundary from './components/system/ErrorBoundary'

// Get Clerk publishable key from environment
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_YnVyc3Rpbmctb3dsLTMxLmNsZXJrLmFjY291bnRzLmRldiQ'

if (!clerkPubKey) {
  console.warn('VITE_CLERK_PUBLISHABLE_KEY is not set. Clerk authentication will not work.')
}

// Configure Clerk - Clerk handles cookies automatically (HttpOnly cookies for refresh tokens)
// The key is ensuring CORS allows credentials and we use skipCache when needed
const clerkConfig = {
  publishableKey: clerkPubKey,
  // Clerk automatically manages cookies for session and refresh tokens
  // These are HttpOnly cookies set by Clerk's backend, not configurable from frontend
  // The critical part is ensuring CORS allows credentials (done in server/middleware/security.js)
  signInUrl: '/login',
  signUpUrl: '/signup',
  // Use fallbackRedirectUrl instead of deprecated afterSignInUrl/afterSignUpUrl
  fallbackRedirectUrl: '/dashboard',
  // CRITICAL: Ensure Clerk can set cookies by configuring the domain
  // If your app runs on localhost, Clerk should automatically handle cookies
  // But if there are domain issues, you might need to configure this
  // For localhost development, this should work automatically
  // For production, you may need to set domain: '.yourdomain.com'
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ClerkProvider {...clerkConfig}>
        <App />
      </ClerkProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)

