import { useNavigate, useSearchParams } from 'react-router-dom'
import { useEffect, useState, FormEvent } from 'react'
import { useAuth, useSignUp } from '@clerk/clerk-react'
import { usersAPI } from '../lib/api'

type Step = 'form' | 'verify'

export default function SignUpPage() {
  const navigate = useNavigate()
  const { isSignedIn, getToken } = useAuth()
  const { signUp, setActive, isLoaded } = useSignUp()
  const [searchParams] = useSearchParams()
  const accountType = searchParams.get('type') || 'individual'

  const [step, setStep] = useState<Step>('form')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  useEffect(() => {
    if (isSignedIn) navigate('/dashboard', { replace: true })
  }, [isSignedIn, navigate])

  useEffect(() => {
    if (!accountType || !['individual', 'institution'].includes(accountType)) {
      navigate('/choose-account', { replace: true })
    }
  }, [accountType, navigate])

  if (!accountType || !['individual', 'institution'].includes(accountType)) {
    return null
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    if (!isLoaded) return
    setError(null)
    setInfo(null)
    setLoading(true)
    try {
      await signUp!.create({ emailAddress: email, password, firstName, lastName })
      await signUp!.prepareEmailAddressVerification({ strategy: 'email_code' })
      setInfo('Verification code sent to your email. Enter it below to complete signup.')
      setStep('verify')
    } catch (err: any) {
      const msg = err?.errors?.[0]?.message || err.message || 'Signup failed'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  async function handleVerify(e: FormEvent) {
    e.preventDefault()
    if (!isLoaded) return
    setError(null)
    setLoading(true)
    try {
      const result = await signUp!.attemptEmailAddressVerification({ code })
      if (result.status === 'complete') {
        await setActive!({ session: result.createdSessionId })
        // Wait a bit for session to be fully established before getting token
        await new Promise(resolve => setTimeout(resolve, 300))
        // Dual-write: create/update Neon record with initial profile data (non-blocking)
        try {
          const token = await getToken({ skipCache: true })
          if (token) {
            await usersAPI.dualSync({ firstName, lastName, primaryEmail: email }, token)
          } else {
            console.warn('[SignUpPage] No token available for dual-sync')
          }
        } catch (dualErr: any) {
          console.warn('Dual-sync after signup failed:', dualErr?.message || dualErr)
          try {
            const token = await getToken({ skipCache: true })
            if (token) {
              await usersAPI.sync(token)
            }
          } catch {}
        }
        navigate(`/register?type=${accountType}`)
      } else {
        setError('Additional verification required. Contact support if this persists.')
      }
    } catch (err: any) {
      const msg = err?.errors?.[0]?.message || err.message || 'Verification failed'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="mt-2 text-sm text-gray-600">Join AcademOra to start your educational journey</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
          {step === 'form' && (
            <form onSubmit={handleCreate} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="firstName">First Name</label>
                <input id="firstName" type="text" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-primary-500" value={firstName} onChange={e => setFirstName(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="lastName">Last Name</label>
                <input id="lastName" type="text" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-primary-500" value={lastName} onChange={e => setLastName(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">Email</label>
                <input id="email" type="email" autoComplete="email" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-primary-500" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">Password</label>
                <input id="password" type="password" autoComplete="new-password" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-primary-500" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              {error && <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
              <button type="submit" disabled={loading || !isLoaded} className="w-full rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
              <p className="text-xs text-gray-500">By creating an account you agree to our Terms & Privacy Policy.</p>
            </form>
          )}
          {step === 'verify' && (
            <form onSubmit={handleVerify} className="space-y-5">
              <div className="text-sm text-gray-700">Enter the 6-digit code sent to <strong>{email}</strong></div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="code">Verification Code</label>
                <input id="code" type="text" inputMode="numeric" pattern="[0-9]*" maxLength={6} className="tracking-widest text-center w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-primary-500" value={code} onChange={e => setCode(e.target.value)} required />
              </div>
              {info && <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700">{info}</div>}
              {error && <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
              <button type="submit" disabled={loading || code.length < 6} className="w-full rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Verifying...' : 'Verify & Continue'}
              </button>
              <button type="button" onClick={() => { setStep('form'); setCode(''); }} className="w-full text-center text-xs text-gray-500 hover:text-gray-700">← Edit details</button>
            </form>
          )}
        </div>
        <div className="mt-6 text-center">
          <button onClick={() => navigate('/login')} className="text-sm text-gray-600 hover:text-gray-900">
            Already have an account? <span className="text-primary-600">Sign in</span>
          </button>
        </div>
        <div className="mt-4 text-center">
          <button onClick={() => navigate('/')} className="text-xs text-gray-500 hover:text-gray-700" type="button">← Back to home</button>
        </div>
      </div>
    </div>
  )
}
