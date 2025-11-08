import { useEffect, useMemo, useState } from 'react'
import { MessageCircle, Trash2, Loader2 } from 'lucide-react'
import { blogAPI, getCurrentUser } from '../lib/api'

type CommentAuthor = {
  id: string
  email?: string | null
  username?: string | null
  full_name?: string | null
  avatar_url?: string | null
  given_name?: string | null
  family_name?: string | null
} | null

export type ArticleComment = {
  id: string
  article_id: string
  user_id: string | null
  content: string
  created_at: string
  updated_at: string
  is_deleted: boolean
  author: CommentAuthor
}

type ArticleCommentsProps = {
  slug: string
}

const displayAuthorName = (author: CommentAuthor, fallbackEmail?: string | null) => {
  if (!author) {
    return 'Anonymous user'
  }
  if (author.full_name && author.full_name.trim()) return author.full_name
  const composed = [author.given_name, author.family_name].filter(Boolean).join(' ').trim()
  if (composed) return composed
  if (author.username) return author.username
  if (fallbackEmail) return fallbackEmail
  if (author.email) return author.email
  return 'AcademOra member'
}

const formatDateTime = (iso: string) => {
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

export default function ArticleComments({ slug }: ArticleCommentsProps) {
  const [comments, setComments] = useState<ArticleComment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [currentUser, setCurrentUserState] = useState(getCurrentUser())

  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUserState(user)
  }, [])

  useEffect(() => {
    let isMounted = true

    async function fetchComments() {
      setLoading(true)
      setError(null)
      try {
        const data = await blogAPI.getComments(slug)
        if (isMounted) {
          setComments(Array.isArray(data) ? data : [])
        }
      } catch (err: any) {
        console.error('Failed to load article comments', err)
        if (isMounted) {
          setError(err?.message || 'Failed to load comments.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchComments()

    return () => {
      isMounted = false
    }
  }, [slug])

  const canPost = useMemo(() => Boolean(currentUser), [currentUser])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!canPost) {
      setError('Please log in to post a comment.')
      return
    }
    const trimmed = content.trim()
    if (!trimmed) {
      setError('Comment cannot be empty.')
      return
    }
    if (trimmed.length > 2000) {
      setError('Comment is too long. Please keep it under 2000 characters.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const newComment = await blogAPI.addComment(slug, trimmed)
      setComments((prev) => [...prev, newComment])
      setContent('')
    } catch (err: any) {
      console.error('Failed to post comment', err)
      setError(err?.message || err?.error || 'Failed to post comment.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (commentId: string) => {
    setDeletingId(commentId)
    setError(null)
    try {
      await blogAPI.deleteComment(slug, commentId)
      setComments((prev) => prev.filter((comment) => comment.id !== commentId))
    } catch (err: any) {
      console.error('Failed to delete comment', err)
      setError(err?.message || err?.error || 'Failed to delete comment.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sm:p-8">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary-50 rounded-lg text-primary-600">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Discussion</h2>
            <p className="text-sm text-gray-500">
              Join the conversation. Be respectful and keep it constructive.
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 text-sm text-gray-500">
          {comments.length}
          <span className="hidden sm:inline">comment{comments.length === 1 ? '' : 's'}</span>
        </span>
      </header>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {canPost ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <label htmlFor="comment" className="sr-only">
            Add a comment
          </label>
          <textarea
            id="comment"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Share your thoughts..."
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-700 shadow-sm focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-200 transition"
            rows={4}
            maxLength={2000}
            disabled={submitting}
          />
          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs text-gray-400">{2000 - content.length} characters remaining</p>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-primary-300"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? 'Posting…' : 'Post Comment'}
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-8 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <strong className="font-semibold">Want to join the discussion?</strong>{' '}
          <span>Log in or create an account to share your perspective.</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-10 text-gray-500">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading comments…
        </div>
      ) : comments.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-500">
          No comments yet. Be the first to share your thoughts!
        </p>
      ) : (
        <ul className="space-y-6">
          {comments.map((comment) => {
            const isOwner = currentUser && comment.user_id === currentUser.id
            const isAdmin = currentUser && (currentUser.role === 'admin' || currentUser.email === 'admin@academora.com')
            const canDelete = isOwner || isAdmin
            return (
              <li
                key={comment.id}
                className="rounded-xl border border-gray-100 bg-gray-50/60 p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {displayAuthorName(comment.author, comment.author?.email)}
                    </p>
                    <p className="text-xs text-gray-400">{formatDateTime(comment.created_at)}</p>
                  </div>
                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => handleDelete(comment.id)}
                      disabled={deletingId === comment.id}
                      className="inline-flex items-center gap-1 rounded-md border border-transparent bg-white px-3 py-1.5 text-xs font-medium text-gray-500 shadow-sm transition hover:border-red-200 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deletingId === comment.id ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Removing…
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-3.5 w-3.5" />
                          Remove
                        </>
                      )}
                    </button>
                  )}
                </div>
                <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-gray-700">{comment.content}</p>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}


