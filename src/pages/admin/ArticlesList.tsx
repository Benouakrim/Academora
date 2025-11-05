import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminAPI } from '../../lib/api'

interface Row {
  id: string
  title: string
  slug: string
  category?: string
  published?: boolean
  created_at: string
  updated_at: string
}

export default function ArticlesList() {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(false)
  const [q, setQ] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const data = await adminAPI.getAllArticles()
        setRows(Array.isArray(data) ? data : [])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = rows.filter(r => !q || r.title?.toLowerCase().includes(q.toLowerCase()) || r.slug?.toLowerCase().includes(q.toLowerCase()))

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Articles</h1>
          <Link to="/admin/articles/new" className="btn-primary">New Article</Link>
        </div>
        <div className="mb-4">
          <input value={q} onChange={(e)=> setQ(e.target.value)} placeholder="Search by title or slug" className="w-full sm:w-80 px-3 py-2 border rounded-md" />
        </div>
        <div className="bg-white rounded-xl shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">Loading…</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{r.title}</div>
                      <div className="text-xs text-gray-500">/{r.slug}</div>
                    </td>
                    <td className="px-6 py-4">
                      {r.published ? <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Published</span> : <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Draft</span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(r.updated_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/admin/articles/edit/${r.id}`} className="text-primary-600 hover:text-primary-700 font-semibold">Edit</Link>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No articles</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}


