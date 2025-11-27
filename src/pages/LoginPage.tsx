import { useNavigate } from 'react-router-dom'
import { useEffect, useState, FormEvent } from 'react'
import { useAuth, useSignIn, useUser } from '@clerk/clerk-react'
import { verifyAndHealUser } from '../lib/user/verifyAndHeal'

export default function LoginPage() {
  const navigate = useNavigate()
  const { isSignedIn, getToken } = useAuth()
  const { signIn, setActive, isLoaded } = useSignIn()
  const { user: clerkUser } = useUser()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Only redirect if signed in AND Clerk is loaded
    // Don't redirect if there's a sync issue - let user stay on login page
    if (isLoaded && isSignedIn) {
      // Run verification and healing before redirect
      const runVerification = async () => {
        try {
          // Wait longer for session to be fully established (2-3 seconds)
          await new Promise(resolve => setTimeout(resolve, 2000))
          
          // Check if we can get a valid token before attempting verification
          // This helps avoid unnecessary verification attempts with expired sessions
          const testToken = await getToken({ skipCache: true })
          if (!testToken) {
            console.warn('[Login] No token available, session may not be ready yet')
            return // Don't proceed with verification if no token
          }
          
          // verifyAndHealUser will now handle session readiness internally
          // Use skipCache to force fresh token (helps with refresh cookie issues)
          console.log('[Login] Running user verification and healing on auto-redirect...')
          // Pass a wrapper that uses skipCache
          await verifyAndHealUser(testToken, clerkUser || undefined, () => getToken({ skipCache: true }))
        } catch (error) {
          console.error('[Login] Verification failed on auto-redirect:', error)
          // Non-blocking
        }
      }
      
      runVerification()
      
      // Longer delay to allow session establishment and sync operations to complete
      const timer = setTimeout(() => {
        navigate('/dashboard', { replace: true })
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isSignedIn, isLoaded, navigate, getToken, clerkUser])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!isLoaded) return
    setError(null)
    setLoading(true)
    try {
      const result = await signIn!.create({ identifier: email, password })
      if (result.status === 'complete') {
        await setActive!({ session: result.createdSessionId })
        
        // Wait longer for session to be fully established (2-3 seconds)
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Verify and heal user after login
        // verifyAndHealUser will now handle session readiness internally
        try {
          // Wait a moment for session to be established
          await new Promise(resolve => setTimeout(resolve, 500))
          
          // Use skipCache to force fresh token (helps with refresh cookie issues)
          const token = await getToken({ skipCache: true })
          if (!token) {
            console.warn('[Login] No token available after login, session may not be ready')
            setError('Session not ready. Please try again.')
            setLoading(false)
            return
          }
          
          console.log('[Login] Running user verification and healing...')
          // Pass a wrapper that uses skipCache
          const healResult = await verifyAndHealUser(token, clerkUser || undefined, () => getToken({ skipCache: true }))
          
          if (healResult.dataLost) {
            console.error('[Login] User data lost:', healResult.error)
            // Error is already shown to user in verifyAndHealUser
          } else if (healResult.healed) {
            console.log('[Login] ✅ User data restored successfully')
          }
        } catch (healError) {
          console.error('[Login] Verification/healing failed:', healError)
          // Non-blocking - continue with navigation
        }
        
        navigate('/dashboard')
      } else {
        console.warn('[Login] Additional verification required', result)
        setError('Additional verification required. Please complete MFA in the provided flow.')
      }
    } catch (err: any) {
      const msg = err?.errors?.[0]?.message || err.message || 'Login failed'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="mt-2 text-sm text-gray-600">Sign in to continue to AcademOra</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-primary-500"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-primary-500"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
            )}
            <button
              type="submit"
              disabled={loading || !isLoaded}
              className="w-full rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <div className="mt-6 text-center text-sm">
            <button
              onClick={() => navigate('/password/forgot')}
              className="text-primary-600 hover:text-primary-700"
              type="button"
            >Forgot password?</button>
          </div>
        </div>
        <div className="mt-6 text-center">
          <button onClick={() => navigate('/signup?type=individual')} className="text-sm text-gray-600 hover:text-gray-900">
            Need an account? <span className="text-primary-600">Create one</span>
          </button>
        </div>
        <div className="mt-4 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-xs text-gray-500 hover:text-gray-700"
            type="button"
          >← Back to home</button>
        </div>
      </div>
    </div>
  )
}
