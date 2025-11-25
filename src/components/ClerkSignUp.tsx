/**
 * Custom Clerk Sign Up Component with Theme Styling
 * 
 * This component wraps Clerk's SignUp component with custom appearance
 * that matches the AcademOra theme. After signup, redirects to onboarding wizard.
 * 
 * Note: Phone number is optional (configured in Clerk Dashboard)
 * See CLERK_PHONE_FIX.md for phone number configuration
 */

import { SignUp } from '@clerk/clerk-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function ClerkSignUp() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const accountType = searchParams.get('type') || 'individual';

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="mt-2 text-sm text-gray-600">
            Join AcademOra to start your educational journey
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
          <SignUp
            appearance={{
              elements: {
                rootBox: 'w-full',
                card: 'shadow-none border-0 bg-transparent',
                headerTitle: 'text-2xl font-bold text-gray-900',
                headerSubtitle: 'text-sm text-gray-600',
                socialButtonsBlockButton: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
                socialButtonsBlockButtonText: 'text-gray-700',
                formButtonPrimary: 'bg-primary-600 hover:bg-primary-700 text-white',
                formFieldInput: 'border-gray-300 focus:border-primary-500 focus:ring-primary-500',
                formFieldLabel: 'text-gray-700',
                footerActionLink: 'text-primary-600 hover:text-primary-700',
                identityPreviewText: 'text-gray-700',
                identityPreviewEditButton: 'text-primary-600',
                formResendCodeLink: 'text-primary-600',
                // Hide phone number field (Issue #4)
                formFieldInputShowPasswordButton: 'text-primary-600',
              },
              variables: {
                colorPrimary: '#2563eb', // primary-600
                colorBackground: '#ffffff',
                colorInputBackground: '#ffffff',
                colorInputText: '#111827',
                colorText: '#374151',
                colorTextSecondary: '#6b7280',
                borderRadius: '0.75rem',
                fontFamily: 'inherit',
              },
              layout: {
                socialButtonsPlacement: 'top',
                socialButtonsVariant: 'blockButton',
              },
            }}
            routing="path"
            path="/signup"
            signInUrl="/login"
            afterSignUpUrl={`/register?type=${accountType}`}
            // Phone number is optional (configured in Clerk Dashboard)
            // See CLERK_PHONE_FIX.md for configuration
          />
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← Back to home
          </button>
        </div>
      </div>
    </div>
  );
}

