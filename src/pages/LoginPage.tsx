import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import ClerkSignIn from '../components/ClerkSignIn'

export default function LoginPage() {
  const navigate = useNavigate()
  const { isSignedIn } = useAuth()

  // Redirect if already signed in
  useEffect(() => {
    if (isSignedIn) {
      navigate('/dashboard', { replace: true })
    }
  }, [isSignedIn, navigate])

  return <ClerkSignIn />
}
