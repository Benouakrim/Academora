import { useEffect, useMemo, useState } from 'react'
import { useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import LinkExtension from '@tiptap/extension-link'
import ImageExtension from '@tiptap/extension-image'
import { TextStyle } from '@tiptap/extension-text-style'
import { FontSize } from '../extensions/FontSize'
import { adminAPI, api } from '../lib/api'

type Mode = 'admin' | 'user'

export interface EditorFormData {
  title: string
  slug: string
  content: string
  excerpt: string
  category: string
  term_ids: string[]
  published: boolean
  featured_image: string
  meta_title: string
  meta_description: string
  meta_keywords: string
  focus_keyword: string
  og_image: string
  canonical_url: string
}

export function useArticleEditor(mode: Mode, id?: string) {
  const isUserMode = mode === 'user'
  const isEditMode = Boolean(id)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string; type: string }>>([])
  const [termsByTaxonomy, setTermsByTaxonomy] = useState<Record<string, Array<{ id: string; name: string }>>>({})
  const [submissionLimit, setSubmissionLimit] = useState<null | { canSubmit: boolean; pendingCount: number; maxPending: number; remaining: number }>(null)

  const [formData, setFormData] = useState<EditorFormData>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    category: 'General',
    term_ids: [],
    published: false,
    featured_image: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    focus_keyword: '',
    og_image: '',
    canonical_url: '',
  })

  const dedupedExtensions = useMemo(() => {
    const base = [
      StarterKit,
      Underline,
      TextStyle,
      FontSize,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight,
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-blue-400 underline cursor-pointer' },
      }),
      ImageExtension.configure({ HTMLAttributes: { class: 'max-w-full h-auto rounded-lg' } }),
    ] as any[]
    const seen = new Map<string, any>()
    for (const ext of base) {
      const name = (ext && (ext as any).name) || ''
      if (name && !seen.has(name)) seen.set(name, ext)
    }
    return Array.from(seen.values())
  }, [])

  const editor = useEditor({
    extensions: dedupedExtensions,
    content: formData.content,
    editorProps: {
      attributes: {
        class:
          'prose prose-invert max-w-none focus:outline-none min-h-[500px] px-10 py-8 prose-headings:mb-6 prose-p:mb-4 prose-ul:mb-4 prose-li:mb-2 prose-h2:mt-8 prose-h3:mt-6 prose-h4:mt-4 leading-relaxed',
      },
    },
    onUpdate: ({ editor }) => setFormData((prev) => ({ ...prev, content: editor.getHTML() })),
  })

  // Data loaders
  useEffect(() => {
    loadCategories()
    // Load taxonomies for both admin and user editors
    loadTaxonomyTerms()
    if (isEditMode && id) {
      if (isUserMode) loadUserArticle()
      else loadAdminArticle()
    }
    if (isUserMode) loadSubmissionLimit()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function loadCategories() {
    try {
      let data: any = []
      if (isUserMode) {
        // Prefer public/user endpoint to avoid admin 403
        data = await api.get('/categories?type=blog')
      } else {
        data = await adminAPI.getAllCategories('blog')
      }
      const arr = Array.isArray(data) ? data : (Array.isArray(data?.categories) ? data.categories : [])
      setCategories(arr)
      // Set default category to first available, or update if current doesn't exist
      if (arr.length > 0) {
        const currentCategoryExists = arr.some(c => c.name === formData.category)
        if (!formData.category || !currentCategoryExists) {
          setFormData((p) => ({ ...p, category: arr[0].name }))
        }
      }
    } catch {
      setCategories([
        { id: '1', name: 'General', slug: 'general', type: 'blog' },
        { id: '2', name: 'Education', slug: 'education', type: 'blog' },
        { id: '3', name: 'Tips', slug: 'tips', type: 'blog' },
      ])
    }
  }

  const TAXONOMY_KEYS = useMemo(() => ['scope', 'content_type', 'topic', 'field'], [])

  async function loadTaxonomyTerms() {
    try {
      const entries: [string, Array<{ id: string; name: string }>] [] = []
      for (const key of TAXONOMY_KEYS) {
        let data: any = []
        if (isUserMode) {
          // Try public taxonomy endpoint
          data = await api.get(`/taxonomy-terms?taxonomy=${encodeURIComponent(key)}`)
        } else {
          data = await adminAPI.listTerms(key)
        }
        const list = Array.isArray(data) ? data : (Array.isArray(data?.terms) ? data.terms : [])
        const simplified = list.map((t: any) => ({ id: String(t.id), name: t.name }))
        entries.push([key, simplified])
      }
      setTermsByTaxonomy(Object.fromEntries(entries))
    } catch (err) {
      console.warn('Taxonomy terms unavailable', err)
    }
  }

  async function loadAdminArticle() {
    try {
      setLoading(true)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      if (!id || !uuidRegex.test(id)) throw new Error('Invalid article id')
      const article = await adminAPI.getArticleById(id)
      const termIds = Array.isArray(article.terms) ? article.terms.map((t: any) => t.id).filter(Boolean) : []
      setFormData({
        title: article.title || '',
        slug: article.slug || '',
        content: article.content || '',
        excerpt: article.excerpt || '',
        category: article.category || 'General',
        term_ids: termIds,
        published: article.published || false,
        featured_image: article.featured_image || '',
        meta_title: article.meta_title || article.title || '',
        meta_description: article.meta_description || article.excerpt || '',
        meta_keywords: article.meta_keywords || '',
        focus_keyword: article.focus_keyword || '',
        og_image: article.og_image || article.featured_image || '',
        canonical_url: article.canonical_url || '',
      })
    } catch (err: any) {
      setError(err.message || 'Failed to load article')
    } finally {
      setLoading(false)
    }
  }

  async function loadUserArticle() {
    try {
      setLoading(true)
      if (!id) return
      const token = localStorage.getItem('token')
      const res = await fetch(`${import.meta.env.VITE_API_URL}/user-articles/my-articles`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      const article = Array.isArray(data.articles) ? data.articles.find((a: any) => a.id === Number(id)) : null
      if (!article) throw new Error('Article not found')
      setFormData({
        title: article.title || '',
        slug: article.slug || '',
        content: article.content || '',
        excerpt: article.excerpt || '',
        category: article.category || 'General',
        term_ids: [],
        published: false,
        featured_image: article.featured_image || '',
        meta_title: article.meta_title || article.title || '',
        meta_description: article.meta_description || article.excerpt || '',
        meta_keywords: article.meta_keywords || '',
        focus_keyword: article.focus_keyword || '',
        og_image: article.og_image || article.featured_image || '',
        canonical_url: article.canonical_url || '',
      })
    } catch (err: any) {
      setError(err.message || 'Failed to load article')
    } finally {
      setLoading(false)
    }
  }

  async function loadSubmissionLimit() {
    try {
      const token = localStorage.getItem('token')
      if (!token) return
      const data = await api.get('/user-articles/can-submit')
      if (data && typeof data === 'object') setSubmissionLimit(data)
    } catch {
      // ignore 403 gracefully
    }
  }

  // Handlers
  function generateSlug(title: string) {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }

  function handleTitleChange(title: string) {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title),
      meta_title: prev.meta_title || title,
    }))
  }

  function handleInputChange(name: keyof EditorFormData, value: any) {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  function handleExcerptChange(excerpt: string) {
    setFormData((prev) => ({ ...prev, excerpt, meta_description: prev.meta_description || excerpt }))
  }

  function toggleTerm(termId: string) {
    setFormData((prev) => {
      const exists = prev.term_ids.includes(termId)
      return { ...prev, term_ids: exists ? prev.term_ids.filter((id) => id !== termId) : [...prev.term_ids, termId] }
    })
  }

  // Saves
  async function adminSave() {
    setSaving(true)
    setError(null)
    try {
      if (isEditMode && id) await adminAPI.updateArticle(id, formData)
      else await adminAPI.createArticle(formData)
      setMessage('Saved successfully')
    } catch (err: any) {
      setError(err.message || 'Failed to save article')
    } finally {
      setSaving(false)
    }
  }

  async function userSave(status: 'draft' | 'pending') {
    setSaving(true)
    setError(null)
    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Please log in to save your article')
      if (status === 'pending' && (!formData.title || !formData.content || !formData.category)) {
        throw new Error('Title, content, and category are required for submission')
      }
      if (status === 'pending' && submissionLimit && !submissionLimit.canSubmit && !isEditMode) {
        throw new Error(`You have reached the limit of ${submissionLimit.maxPending} pending articles.`)
      }
      // Try to find category by name (case-insensitive)
      let categoryObj = categories.find((c) => 
        c.name.toLowerCase() === formData.category?.toLowerCase() ||
        c.name === formData.category
      )
      
      // If category not found but we have categories, use the first one
      if (!categoryObj && categories.length > 0) {
        console.warn('[useArticleEditor] Category not found:', formData.category, 'Using first available category:', categories[0].name)
        categoryObj = categories[0]
        // Update formData to match
        setFormData((p) => ({ ...p, category: categories[0].name }))
      }
      
      // Log for debugging
      console.log('[useArticleEditor] Category mapping:', {
        categoryName: formData.category,
        categoryObj: categoryObj,
        categoryId: categoryObj ? categoryObj.id : null,
        allCategories: categories.map(c => ({ id: c.id, name: c.name, slug: c.slug })),
        categoriesCount: categories.length
      })
      const body = {
        id: isEditMode ? (isNaN(Number(id)) ? undefined : Number(id)) : undefined,
        title: formData.title,
        slug: formData.slug || (formData.title ? formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : ''),
        excerpt: formData.excerpt,
        content: formData.content,
        featured_image: formData.featured_image,
        category_id: categoryObj ? (isNaN(Number(categoryObj.id)) ? categoryObj.id : Number(categoryObj.id)) : null,
        category: formData.category || 'General', // Send category name as fallback
        tags: [] as string[],
        meta_title: formData.meta_title,
        meta_description: formData.meta_description,
        status,
      }
      console.log('[useArticleEditor] Request body:', { ...body, content: body.content ? `${body.content.substring(0, 50)}...` : null })
      const resp = await fetch(`${import.meta.env.VITE_API_URL}/user-articles/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      })
      const data = await resp.json()
      if (!resp.ok) {
        console.error('[useArticleEditor] Save failed:', {
          status: resp.status,
          statusText: resp.statusText,
          error: data?.error,
          details: data?.details,
          code: data?.code,
          hint: data?.hint,
          errorType: data?.errorType,
          received: data?.received,
          fullResponse: data
        })
        const errorMsg = data?.error || 'Failed to save'
        let details = ''
        if (data?.details) details = `: ${data.details}`
        if (data?.hint && !details) details = ` (${data.hint})`
        if (data?.code && data.code !== 'UNKNOWN' && data.code !== 'UNKNOWN_ERROR') {
          details = `${details} [Code: ${data.code}]`
        }
        throw new Error(errorMsg + details)
      }
      setMessage(data?.message || 'Saved successfully')
    } catch (err: any) {
      setError(err.message || 'Failed to save article')
    } finally {
      setSaving(false)
    }
  }

  return {
    // mode & state
    mode,
    isUserMode,
    isEditMode,
    loading,
    saving,
    error,
    setError,
    message,
    setMessage,
    // data
    categories,
    termsByTaxonomy,
    TAXONOMY_KEYS,
    submissionLimit,
    // form
    formData,
    setFormData,
    handleTitleChange,
    handleInputChange,
    handleExcerptChange,
    toggleTerm,
    // editor
    editor,
    // actions
    adminSave,
    userSave,
  }
}
