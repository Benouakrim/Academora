/**
 * Custom Clerk Sign In Component with Theme Styling
 * 
 * This component wraps Clerk's SignIn component with custom appearance
 * that matches the AcademOra theme.
 * 
 * Features:
 * - Custom colors matching website theme
 * - Gradient background
 * - Theme-consistent styling
 * - Redirects to dashboard after login
 */

import { SignIn } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

export default function ClerkSignIn() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to continue to AcademOra
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
          <SignIn
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
            }}
            routing="path"
            path="/login"
            signUpUrl="/signup"
            afterSignInUrl="/dashboard"
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

