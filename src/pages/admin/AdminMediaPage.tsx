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
  Sparkles,
  EyeOff,
  Clock,
  ExternalLink,
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
  created_at?: string | null
  updated_at?: string | null
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

const FALLBACK_HERO_IMAGE =
  'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1280&q=80'

const getDomain = (value?: string | null) => {
  if (!value) return null
  try {
    const url = new URL(value)
    return url.hostname.replace(/^www\./, '')
  } catch {
    return value
  }
}

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
  const [heroCopySuccess, setHeroCopySuccess] = useState(false)

  const apiOrigin = useMemo(resolveApiOrigin, [])

  useEffect(() => {
    fetchVideos()
  }, [])

  const sortedVideos = useMemo(() => {
    return [...videos].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
  }, [videos])

  const activeVideos = useMemo(
    () => sortedVideos.filter((video) => video.is_active),
    [sortedVideos]
  )

  const inactiveCount = useMemo(
    () => Math.max(sortedVideos.length - activeVideos.length, 0),
    [sortedVideos.length, activeVideos.length]
  )

  const heroVideo = useMemo(() => {
    if (sortedVideos.length === 0) return null
    const firstActive = sortedVideos.find((video) => video.is_active)
    return firstActive ?? sortedVideos[0]
  }, [sortedVideos])

  const heroPreview = useMemo(() => {
    if (heroVideo?.thumbnail_url) {
      return toAbsolute(heroVideo.thumbnail_url, apiOrigin) || FALLBACK_HERO_IMAGE
    }
    return FALLBACK_HERO_IMAGE
  }, [heroVideo, apiOrigin])

  const heroVideoLink = useMemo(() => {
    if (!heroVideo?.video_url) return null
    return toAbsolute(heroVideo.video_url, apiOrigin)
  }, [heroVideo, apiOrigin])

  const latestUpdate = useMemo(() => {
    let latest: Date | null = null
    sortedVideos.forEach((video) => {
      const ts = video.updated_at ?? video.created_at
      if (!ts) return
      const candidate = new Date(ts)
      if (!latest || candidate > latest) {
        latest = candidate
      }
    })
    return latest
  }, [sortedVideos])

  const formattedLastUpdated = useMemo(() => {
    if (!latestUpdate) return 'No updates yet'
    return latestUpdate.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }, [latestUpdate])

  const mediaStats = useMemo(
    () => [
      {
        label: 'Active videos',
        value: activeVideos.length.toString(),
        subLabel:
          sortedVideos.length > 0
            ? `${activeVideos.length}/${sortedVideos.length} visible`
            : 'Add your first video',
        icon: Sparkles,
      },
      {
        label: 'Hidden videos',
        value: inactiveCount.toString(),
        subLabel:
          inactiveCount === 0
            ? 'All entries published'
            : 'Hidden from the public carousel',
        icon: EyeOff,
      },
      {
        label: 'Last updated',
        value: formattedLastUpdated,
        subLabel: heroVideo
          ? `Hero source • position ${heroVideo.position ?? 0}`
          : 'Hero not yet configured',
        icon: Clock,
      },
    ],
    [activeVideos.length, sortedVideos.length, inactiveCount, formattedLastUpdated, heroVideo]
  )

  const previewThumbnail = useMemo(
    () =>
      form.thumbnail_url
        ? toAbsolute(form.thumbnail_url, apiOrigin)
        : heroPreview,
    [form.thumbnail_url, apiOrigin, heroPreview]
  )

  const previewVideoDomain = useMemo(
    () => getDomain(form.video_url),
    [form.video_url]
  )

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
        // Cloudinary returns full URL, no need to prefix
        setForm((prev) => ({ ...prev, video_url: result.videoUrl }))
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
        // Cloudinary returns full URL, no need to prefix
        setForm((prev) => ({ ...prev, thumbnail_url: result.imageUrl }))
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

  const handleCopyHeroImage = async () => {
    if (!heroPreview) return
    try {
      await navigator.clipboard.writeText(heroPreview)
      setHeroCopySuccess(true)
      setTimeout(() => setHeroCopySuccess(false), 2000)
    } catch (err) {
      console.error('Failed to copy hero image url', err)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950/5 px-6 py-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <h1 className="flex items-center gap-3 text-3xl font-bold text-slate-900">
              <ImagePlus className="h-7 w-7 text-primary-600" />
              Media Studio
            </h1>
            <p className="max-w-3xl text-sm text-slate-500">
              Manage the images and videos that shape the public experience. Updates apply immediately
              to the home page hero, carousel, and other marketing surfaces.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={fetchVideos}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-100"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh data
            </button>
            <button
              onClick={handleImportSamples}
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl border border-primary-200 bg-primary-50 px-4 py-2 text-xs font-semibold text-primary-600 transition hover:bg-primary-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus className="h-3.5 w-3.5" />
              Add sample set
            </button>
          </div>
        </header>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <motion.section layout className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
          <motion.div
            layout
            className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-md"
          >
            <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
              <div className="relative">
                <img
                  src={heroPreview}
                  alt={heroVideo?.title || 'Home hero preview'}
                  className="h-full min-h-[280px] w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/35 via-transparent to-transparent" />
                <div className="absolute left-6 top-6 inline-flex items-center gap-2 rounded-full bg-white/85 px-3 py-1 text-[11px] font-semibold text-slate-700 shadow">
                  <Sparkles className="h-3.5 w-3.5 text-primary-500" />
                  Home hero source
                </div>
                {heroVideo && (
                  <div className="absolute bottom-6 left-6 max-w-sm rounded-2xl bg-slate-900/80 px-4 py-3 text-white shadow-lg backdrop-blur">
                    <p className="text-sm font-semibold">
                      {heroVideo.title || 'Untitled video'}
                    </p>
                    {heroVideo.description && (
                      <p className="mt-1 text-xs text-white/80 line-clamp-2">{heroVideo.description}</p>
                    )}
                  </div>
                )}
              </div>
              <div className="flex h-full flex-col justify-between p-6">
                <div className="space-y-4">
                  <div>
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                      <Sparkles className="h-5 w-5 text-primary-600" />
                      Hero banner overview
                    </h2>
                    <p className="text-xs text-slate-500">
                      The first active entry in your list powers the home hero media. Update its thumbnail
                      and description here then jump directly into editing.
                    </p>
                  </div>
                  <dl className="space-y-3 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-slate-500">Current source</dt>
                      <dd className="max-w-[220px] truncate text-right font-medium text-slate-900">
                        {heroVideo?.title || 'Not configured'}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-slate-500">Position</dt>
                      <dd className="font-medium text-slate-900">{heroVideo?.position ?? '—'}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-slate-500">Status</dt>
                      <dd>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                            heroVideo?.is_active
                              ? 'bg-green-100 text-green-600'
                              : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {heroVideo?.is_active ? 'Active' : 'Hidden'}
                        </span>
                      </dd>
                    </div>
                  </dl>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleCopyHeroImage}
                    className="inline-flex items-center gap-2 rounded-xl border border-primary-200 bg-primary-50 px-4 py-2 text-xs font-semibold text-primary-600 transition hover:bg-primary-100"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    {heroCopySuccess ? 'Copied!' : 'Copy hero image URL'}
                  </button>
                  {heroVideo && (
                    <button
                      onClick={() => handleEdit(heroVideo)}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
                    >
                      Edit hero video
                    </button>
                  )}
                  {heroVideoLink && (
                    <a
                      href={heroVideoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
                    >
                      Open video
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div layout className="space-y-6">
            <motion.div layout className="grid gap-3 sm:grid-cols-3">
              {mediaStats.map((stat) => {
                const Icon = stat.icon
                const numeric = Number.isNaN(Number(stat.value)) ? stat.value : Number(stat.value).toLocaleString()
                return (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        {stat.label}
                      </span>
                      <Icon className="h-4 w-4 text-primary-500" />
                    </div>
                    <div className="mt-3 text-2xl font-semibold text-slate-900">{numeric}</div>
                    <p className="mt-1 text-[11px] text-slate-500">{stat.subLabel}</p>
                  </div>
                )
              })}
            </motion.div>

            <motion.section
              layout
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Image hosting</h2>
                  <p className="text-xs text-slate-500">
                    Upload a static image and copy the hosted URL for articles, landing pages, or
                    hero backgrounds.
                  </p>
                </div>
                {imageUrl && (
                  <button
                    onClick={() => setImageUrl('')}
                    className="rounded-xl border border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-500 transition hover:bg-slate-100"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="mt-4">
                <ImageUpload value={imageUrl} onChange={setImageUrl} />
              </div>

              {imageUrl && (
                <div className="mt-4 space-y-3">
                  <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 text-xs text-slate-500">
                    {imageUrl}
                  </div>
                  <button
                    onClick={handleCopyImageUrl}
                    className="inline-flex items-center gap-2 rounded-xl border border-primary-200 bg-primary-50 px-4 py-2 text-xs font-semibold text-primary-600 transition hover:bg-primary-100"
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
          </motion.div>
        </motion.section>

        <motion.section
          layout
          className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-md"
        >
          <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50/80 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                <Video className="h-5 w-5 text-primary-600" />
                Video & hero manager
              </h2>
              <p className="text-xs text-slate-500">
                Create, reorder, and publish the videos that power the home page carousel and hero.
              </p>
            </div>
            {editingId && (
              <button
                onClick={resetForm}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
              >
                Cancel editing
              </button>
            )}
          </div>

          <div className="grid gap-8 px-6 py-6 xl:grid-cols-[1.05fr,0.95fr]">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
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
                        {uploadingVideo ? 'Uploading…' : 'Upload'}
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
                      Embed code (optional)
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
                      Thumbnail image
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
                        {uploadingThumbnail ? 'Uploading…' : 'Upload'}
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
                        Sort order
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
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                {editingId ? 'Update video' : 'Add video'}
              </button>
            </form>

            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
                <h3 className="text-sm font-semibold text-slate-700">Live preview</h3>
                <p className="text-xs text-slate-500">
                  See how this entry will appear in the carousel and hero banner.
                </p>
                <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  {previewThumbnail ? (
                    <img
                      src={previewThumbnail}
                      alt="Draft thumbnail preview"
                      className="h-40 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-40 items-center justify-center text-xs text-slate-400">
                      Add a thumbnail to generate a preview.
                    </div>
                  )}
                </div>
                <dl className="mt-4 space-y-1 text-xs text-slate-500">
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                    <dt>Title</dt>
                    <dd className="font-semibold text-slate-600">
                      {form.title || 'Untitled video'}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-200/60 py-2">
                    <dt>Source</dt>
                    <dd className="text-slate-600">{previewVideoDomain || '—'}</dd>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <dt>Status</dt>
                    <dd>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          form.is_active ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {form.is_active ? 'Will be active' : 'Will be hidden'}
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-800">Video library</h3>
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
                      Sample set
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center rounded-2xl border border-dashed border-slate-300 py-12 text-sm text-slate-500">
                    <Video className="mr-2 h-4 w-4 animate-pulse" />
                    Loading videos…
                  </div>
                ) : sortedVideos.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 py-12 text-center text-sm text-slate-500">
                    No videos configured yet. Add one using the form on the left.
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {sortedVideos.map((video) => {
                      const preview = video.thumbnail_url
                        ? toAbsolute(video.thumbnail_url, apiOrigin)
                        : FALLBACK_HERO_IMAGE
                      const domain = getDomain(video.video_url)
                      const isHero = heroVideo?.id === video.id
                      return (
                        <motion.article
                          key={video.id}
                          layout
                          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-primary-200"
                        >
                          <div className="relative h-40 overflow-hidden border-b border-slate-200 bg-slate-100">
                            <img
                              src={preview}
                              alt={video.title || 'Video thumbnail'}
                              className="h-full w-full object-cover"
                            />
                            {isHero && (
                              <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-primary-600 px-3 py-1 text-[11px] font-semibold text-white shadow">
                                <Sparkles className="h-3 w-3" />
                                Home hero
                              </span>
                            )}
                          </div>
                          <div className="space-y-3 p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-1">
                                <h4 className="text-sm font-semibold text-slate-900">
                                  {video.title || 'Untitled video'}
                                </h4>
                                <p className="text-[11px] text-slate-500">
                                  {domain
                                    ? `Source: ${domain}`
                                    : video.embed_code
                                    ? 'Embedded player'
                                    : 'No link yet'}
                                </p>
                              </div>
                              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500">
                                {video.position ?? 0}
                              </span>
                            </div>
                            {video.description && (
                              <p className="text-xs text-slate-600 line-clamp-3">
                                {video.description}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-2">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                  video.is_active ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-500'
                                }`}
                              >
                                {video.is_active ? 'Active' : 'Hidden'}
                              </span>
                              {video.embed_code && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                                  <Video className="h-3 w-3" />
                                  Embed
                                </span>
                              )}
                              {video.video_url && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                                  <LinkIcon className="h-3 w-3" />
                                  Link
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEdit(video)}
                                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-primary-200 px-3 py-1.5 text-xs font-semibold text-primary-600 transition hover:bg-primary-50"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(video.id)}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-500 transition hover:bg-red-50"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete
                              </button>
                            </div>
                          </div>
                        </motion.article>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  )
}


