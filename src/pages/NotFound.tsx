import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md text-center p-8 bg-white rounded-lg shadow">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-4">404</h1>
        <p className="text-gray-600 mb-6">Sorry, the page you're looking for doesn't exist.</p>
        <Link to="/" className="inline-block px-6 py-2 rounded bg-primary-600 text-white font-semibold">Go home</Link>
      </div>
    </div>
  )
}
