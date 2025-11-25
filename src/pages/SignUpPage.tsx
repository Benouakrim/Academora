import { useNavigate, useSearchParams } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import ClerkSignUp from '../components/ClerkSignUp'

export default function SignUpPage() {
  const navigate = useNavigate()
  const { isSignedIn } = useAuth()
  const [searchParams] = useSearchParams()
  const accountType = searchParams.get('type')

  // Redirect if already signed in
  useEffect(() => {
    if (isSignedIn) {
      navigate('/dashboard', { replace: true })
    }
  }, [isSignedIn, navigate])

  // Redirect to account type selection if no type provided
  useEffect(() => {
    if (!accountType || !['individual', 'institution'].includes(accountType)) {
      navigate('/choose-account', { replace: true })
    }
  }, [accountType, navigate])

  if (!accountType || !['individual', 'institution'].includes(accountType)) {
    return null // Will redirect
  }

  return <ClerkSignUp />
}
