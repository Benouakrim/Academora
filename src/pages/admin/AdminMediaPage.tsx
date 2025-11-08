import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Play,
  Video,
  Upload,
  RefreshCw,
  Plus,
  Trash2,
  Save,
  Link as LinkIcon,
  Image as ImageIcon,
  ImagePlus,
  Copy,
  Check,
} from 'lucide-react'
import { videosAPI, uploadAPI } from '../../lib/api'
import ImageUpload from '../../components/ImageUpload'

type SiteVideo = {
  id: string
  title: string
  description?: string | null
  video_url?: string | null
  embed_code?: string | null
  thumbnail_url?: string | null
  position?: number | null
  is_active?: boolean | null
}

type VideoFormState = {
  title: string
  description: string
  video_url: string
  embed_code: string
  thumbnail_url: string
  position: number
  is_active: boolean
}

const sampleVideos: Omit<VideoFormState, 'position'>[] = [
  {
    title: 'Discover AcademOra in 90 Seconds',
    description:
      'Learn how AcademOra helps you explore universities, compare options, and match with the perfect program.',
    video_url: 'https://www.youtube.com/watch?v=ysz5S6PUM-U',
    embed_code: '',
    thumbnail_url: '',
    is_active: true,
  },
  {
    title: 'Match With The Right University',
    description:
      'See how our smart matching engine analyzes your profile to recommend best-fit universities.',
    video_url: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
    embed_code: '',
    thumbnail_url: '',
    is_active: true,
  },
  {
    title: 'Plan Your Academic Journey',
    description: 'From financial planning to mentorship, watch how AcademOra guides every step.',
    video_url: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
    embed_code: '',
    thumbnail_url: '',
    is_active: true,
  },
]

const initialForm: VideoFormState = {
  title: '',
  description: '',
  video_url: '',
  embed_code: '',
  thumbnail_url: '',
  position: 0,
  is_active: true,
}

const resolveApiOrigin = () => {
  const raw = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
  try {
    const url = new URL(raw)
    if (url.pathname.endsWith('/api')) {
      url.pathname = url.pathname.replace(/\/api$/, '')
    }
    return url.origin + url.pathname.replace(/\/$/, '')
  } catch {
    return raw.replace(/\/api$/, '')
  }
}

const toAbsolute = (value?: string | null, origin?: string) => {
  if (!value) return ''
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  if (trimmed.startsWith('//')) return `${window.location.protocol}${trimmed}`
  if (trimmed.startsWith('/')) {
    return `${origin ?? resolveApiOrigin()}${trimmed}`
  }
  return trimmed
}

export default function AdminMediaPage() {
  const [videos, setVideos] = useState<SiteVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<VideoFormState>(initialForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false)
  const [imageUrl, setImageUrl] = useState<string>('')
  const [copySuccess, setCopySuccess] = useState(false)

  const apiOrigin = useMemo(resolveApiOrigin, [])

  useEffect(() => {
    fetchVideos()
  }, [])

  const sortedVideos = useMemo(() => {
    return [...videos].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
  }, [videos])

  async function fetchVideos() {
    try {
      setLoading(true)
      setError(null)
      const data = await videosAPI.listAdmin()
      setVideos(Array.isArray(data) ? data : [])
    } catch (err: any) {
      console.error(err)
      setError(err?.message || 'Failed to load videos')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setEditingId(null)
    setForm(initialForm)
  }

  const handleEdit = (video: SiteVideo) => {
    setEditingId(video.id)
    setForm({
      title: video.title ?? '',
      description: video.description ?? '',
      video_url: video.video_url ?? '',
      embed_code: video.embed_code ?? '',
      thumbnail_url: video.thumbnail_url ?? '',
      position: video.position ?? 0,
      is_active: video.is_active ?? true,
    })
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this video entry?')) return
    try {
      await videosAPI.remove(id)
      setVideos((prev) => prev.filter((v) => v.id !== id))
      if (editingId === id) {
        resetForm()
      }
    } catch (err: any) {
      console.error(err)
      setError(err?.message || 'Failed to delete video')
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    const payload = {
      ...form,
      position: Number.isFinite(form.position) ? form.position : 0,
    }

    try {
      if (editingId) {
        const updated = await videosAPI.update(editingId, payload)
        setVideos((prev) => prev.map((video) => (video.id === editingId ? updated : video)))
      } else {
        const created = await videosAPI.create(payload)
        setVideos((prev) => [...prev, created])
      }
      resetForm()
    } catch (err: any) {
      console.error(err)
      setError(err?.message || 'Failed to save video')
    } finally {
      setSubmitting(false)
    }
  }

  const handleVideoUpload = async (file: File) => {
    try {
      setUploadingVideo(true)
      const result = await uploadAPI.uploadVideo(file)
      if (result?.videoUrl) {
        const absolute = toAbsolute(result.videoUrl, apiOrigin)
        setForm((prev) => ({ ...prev, video_url: absolute }))
      }
    } catch (err: any) {
      console.error(err)
      setError(err?.message || 'Video upload failed')
    } finally {
      setUploadingVideo(false)
    }
  }

  const handleThumbnailUpload = async (file: File) => {
    try {
      setUploadingThumbnail(true)
      const result = await uploadAPI.uploadImage(file)
      if (result?.imageUrl) {
        const absolute = toAbsolute(result.imageUrl, apiOrigin)
        setForm((prev) => ({ ...prev, thumbnail_url: absolute }))
      }
    } catch (err: any) {
      console.error(err)
      setError(err?.message || 'Thumbnail upload failed')
    } finally {
      setUploadingThumbnail(false)
    }
  }

  const handleImportSamples = async () => {
    if (!window.confirm('This will add 3 sample YouTube videos. Continue?')) {
      return
    }

    try {
      setSubmitting(true)
      let positionOffset = videos.length
      const created: SiteVideo[] = []

      for (const sample of sampleVideos) {
        positionOffset += 1
        const payload = {
          ...sample,
          position: positionOffset,
        }
        const video = await videosAPI.create(payload)
        created.push(video)
      }

      setVideos((prev) => [...prev, ...created])
    } catch (err: any) {
      console.error(err)
      setError(err?.message || 'Failed to import sample videos')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCopyImageUrl = async () => {
    if (!imageUrl) return
    try {
      await navigator.clipboard.writeText(imageUrl)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error('Failed to copy image url', err)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto max-w-6xl space-y-10">
        <header className="space-y-2">
          <h1 className="flex items-center gap-3 text-3xl font-bold text-slate-900">
            <ImagePlus className="h-7 w-7 text-primary-600" />
            Media Library
          </h1>
          <p className="max-w-3xl text-sm text-slate-500">
            Upload and manage the media assets that power the landing experience. Add home page
            showcase videos, upload MP4 demos, or grab hosted image URLs for other pages.
          </p>
        </header>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[2fr,3fr]">
          {/* Quick Image Upload */}
          <motion.section
            layout
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Image Hosting</h2>
                <p className="text-xs text-slate-500">
                  Upload an image and copy the hosted URL for use across the site.
                </p>
              </div>
            </div>

            <ImageUpload value={imageUrl} onChange={setImageUrl} />

            {imageUrl && (
              <div className="mt-4 space-y-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 text-xs text-slate-500">
                  {imageUrl}
                </div>
                <button
                  onClick={handleCopyImageUrl}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary-50 px-4 py-2 text-xs font-semibold text-primary-600 transition hover:bg-primary-100"
                >
                  {copySuccess ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copy image URL
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.section>

          {/* Video Showcase Manager */}
          <motion.section
            layout
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900">
                  <Play className="h-5 w-5 text-primary-600" />
                  Landing Page Video Showcase
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  These videos feed the “See how it works” carousel on the home page.
                </p>
              </div>
              {editingId && (
                <button
                  onClick={resetForm}
                  className="text-sm font-medium text-primary-600 transition hover:text-primary-700"
                >
                  Cancel edit
                </button>
              )}
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.4fr,1fr]">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Title</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    placeholder="Short descriptive title"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, description: e.target.value }))
                    }
                    rows={3}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    placeholder="Optional supporting text displayed beside the video"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Video URL
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        value={form.video_url}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, video_url: e.target.value }))
                        }
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                        placeholder="https://www.youtube.com/watch?v=..."
                      />
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50">
                        <Upload className="h-3.5 w-3.5" />
                        {uploadingVideo ? 'Uploading...' : 'Upload'}
                        <input
                          type="file"
                          accept="video/*"
                          className="hidden"
                          disabled={uploadingVideo}
                          onChange={(event) => {
                            const file = event.target.files?.[0]
                            if (file) {
                              handleVideoUpload(file)
                            }
                          }}
                        />
                      </label>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      Provide a streaming link (YouTube, Vimeo) or upload an MP4/WebM file.
                    </p>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Embed Code (optional)
                    </label>
                    <textarea
                      value={form.embed_code}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, embed_code: e.target.value }))
                      }
                      rows={3}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                      placeholder="<iframe src='https://player.vimeo.com/...'></iframe>"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 flex items-center gap-2 text-sm font-medium text-slate-700">
                      Thumbnail Image
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                        Optional
                      </span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        value={form.thumbnail_url}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, thumbnail_url: e.target.value }))
                        }
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                        placeholder="https://..."
                      />
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50">
                        <ImageIcon className="h-3.5 w-3.5" />
                        {uploadingThumbnail ? 'Uploading...' : 'Upload'}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploadingThumbnail}
                          onChange={(event) => {
                            const file = event.target.files?.[0]
                            if (file) {
                              handleThumbnailUpload(file)
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">
                        Sort Order
                      </label>
                      <input
                        type="number"
                        value={form.position}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            position: Number(e.target.value),
                          }))
                        }
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                      />
                    </div>
                    <div className="flex items-end">
                      <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
                        <input
                          type="checkbox"
                          checked={form.is_active}
                          onChange={(e) =>
                            setForm((prev) => ({ ...prev, is_active: e.target.checked }))
                          }
                          className="h-4 w-4 accent-primary-600"
                        />
                        Active
                      </label>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />
                  {editingId ? 'Update Video' : 'Add Video'}
                </button>
              </form>

              <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-800">Current videos</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={fetchVideos}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-100"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Refresh
                    </button>
                    <button
                      onClick={handleImportSamples}
                      disabled={submitting}
                      className="inline-flex items-center gap-2 rounded-xl border border-primary-200 bg-primary-50 px-3 py-1.5 text-[11px] font-semibold text-primary-600 transition hover:bg-primary-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Plus className="h-3 w-3" />
                      Add sample videos
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-10 text-sm text-slate-500">
                    <Video className="mr-2 h-4 w-4 animate-pulse" />
                    Loading videos…
                  </div>
                ) : sortedVideos.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 py-10 text-center text-sm text-slate-500">
                    No videos configured yet. Add one using the form.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sortedVideos.map((video) => (
                      <motion.div
                        key={video.id}
                        layout
                        className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-primary-200"
                      >
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-500">
                                {video.position ?? 0}
                              </span>
                              <div>
                                <h4 className="text-base font-semibold text-slate-900">
                                  {video.title}
                                </h4>
                                <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-500">
                                  {video.video_url && (
                                    <span className="inline-flex items-center gap-1">
                                      <LinkIcon className="h-3 w-3" />
                                      Link
                                    </span>
                                  )}
                                  {video.embed_code && (
                                    <span className="inline-flex items-center gap-1">
                                      <Video className="h-3 w-3" />
                                      Embed
                                    </span>
                                  )}
                                  <span
                                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                      video.is_active
                                        ? 'bg-green-100 text-green-600'
                                        : 'bg-slate-200 text-slate-500'
                                    }`}
                                  >
                                    {video.is_active ? 'Active' : 'Hidden'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            {video.description && (
                              <p className="mt-3 text-xs text-slate-600">{video.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs font-semibold">
                            <button
                              onClick={() => handleEdit(video)}
                              className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary-200 px-3 py-1.5 text-primary-600 transition hover:bg-primary-50"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(video.id)}
                              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-3 py-1.5 text-red-500 transition hover:bg-red-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  )
}


