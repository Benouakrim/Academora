import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, MapPin, DollarSign, GraduationCap, Users, TrendingUp, Building,
  Globe, Award, BookOpen, Globe2, Briefcase,
  CheckCircle, XCircle, AlertCircle, ExternalLink, School, Trophy,
  Zap, Shield, Home, Loader2, X, DollarSign as DollarIcon, BarChart3
} from 'lucide-react'
import { getCurrentUser, financialProfileAPI } from '../lib/api'
import { UniversitiesService } from '../lib/services/universitiesService'
import { ReviewsService } from '../lib/services/reviewsService'
import SaveButton from '../components/SaveButton'
import SEO from '../components/SEO'
import ProgressBar from '../components/ProgressBar'
import FinancialAidPredictor from '../components/FinancialAidPredictor'
import CareerTrajectoryHeatmap from '../components/CareerTrajectoryHeatmap'
import MentorshipSystem from '../components/MentorshipSystem'
import UniversityMicroContent from '../components/UniversityMicroContent'
import MicroContentEditor from '../components/MicroContentEditor'
import { MicroContent } from '../lib/services/microContentService'

interface University {
  id: string
  name: string
  short_name?: string
  slug?: string
  logo_url?: string
  hero_image_url?: string
  image_url?: string
  website_url?: string
  program_url?: string
  description?: string
  
  // General Identity & Metadata
  established_year?: number
  institution_type?: string
  religious_affiliation?: string
  
  // Location & Campus Vibe
  location_country?: string
  location_city?: string
  location_state_province?: string
  location_coordinates?: any
  campus_setting?: string
  campus_size_acres?: number
  housing_availability?: string
  climate_zone?: string
  nearest_major_airport?: string
  student_life_tags?: string[]
  
  // Detailed Academics
  interests?: string[]
  degree_levels_offered?: string[]
  academic_calendar?: string
  faculty_to_student_ratio?: string
  research_activity_level?: string
  programs_count?: number
  top_ranked_programs?: string[]
  study_abroad_opportunities?: boolean
  languages_of_instruction?: string[]
  accreditation_body?: string
  
  // Admissions & Selectivity
  acceptance_rate?: number
  application_fee?: number
  application_deadlines?: any
  standardized_test_policy?: string
  sat_score_25th_percentile?: number
  sat_score_75th_percentile?: number
  act_score_avg?: number
  min_gpa_requirement?: number
  avg_gpa_admitted?: number
  required_tests?: string[]
  international_english_reqs?: any
  
  // Financials & Aid
  tuition_in_state?: number
  tuition_out_of_state?: number
  tuition_international?: number
  avg_tuition_per_year?: number
  cost_of_living_est?: number
  percentage_receiving_aid?: number
  avg_financial_aid_package?: number
  scholarships_international?: boolean
  need_blind_admission?: boolean
  
  // Student Demographics
  total_enrollment?: number
  undergrad_enrollment?: number
  grad_enrollment?: number
  percentage_international?: number
  gender_ratio?: string
  retention_rate_first_year?: number
  
  // Future Outcomes
  graduation_rate_4yr?: number
  graduation_rate_6yr?: number
  employment_rate_6mo?: number
  avg_starting_salary?: number
  internship_placement_support?: number
  alumni_network_strength?: number
  post_study_work_visa_months?: number
  
  // Legacy
  ranking_world?: number
  country?: string
}

interface UserProfile {
  gpa?: number
  sat_score?: number
  act_score?: number
  family_income?: number
  international_student?: boolean
  in_state?: boolean
  first_generation?: boolean
  special_talents?: string[]
}

interface FinancialProfileFormState {
  gpa: string
  sat_score: string
  act_score: string
  family_income: string
  international_student: boolean
  in_state: boolean
  first_generation: boolean
  special_talents: string
}

export default function UniversityDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [university, setUniversity] = useState<University | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [imageError, setImageError] = useState(false)
  const [reviews, setReviews] = useState<any[]>([])
  const [myRating, setMyRating] = useState<number>(0)
  const [myComment, setMyComment] = useState<string>('')
  const [savingReview, setSavingReview] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(() => getCurrentUser())
  const [financialProfileLoading, setFinancialProfileLoading] = useState(false)
  const [financialProfileError, setFinancialProfileError] = useState<string | null>(null)
  const [showFinancialProfileModal, setShowFinancialProfileModal] = useState(false)
  const [financialProfileSaving, setFinancialProfileSaving] = useState(false)
  const [financialProfileModalError, setFinancialProfileModalError] = useState<string | null>(null)
  const [financialProfileForm, setFinancialProfileForm] = useState<FinancialProfileFormState>({
    gpa: '',
    sat_score: '',
    act_score: '',
    family_income: '',
    international_student: false,
    in_state: false,
    first_generation: false,
    special_talents: ''
  })
  const [showMicroContentEditor, setShowMicroContentEditor] = useState(false)
  const [editingMicroContent, setEditingMicroContent] = useState<any>(null)
  const [isUniversityOwner] = useState(false)

  const refreshFinancialProfile = useCallback(async () => {
    const storedUser = getCurrentUser()
    setCurrentUser(storedUser)

    if (!storedUser) {
      setUserProfile(null)
      return
    }

    try {
      setFinancialProfileLoading(true)
      setFinancialProfileError(null)
      const profile = await financialProfileAPI.getProfile()

      if (profile) {
        setUserProfile({
          gpa: profile.gpa ?? undefined,
          sat_score: profile.sat_score ?? undefined,
          act_score: profile.act_score ?? undefined,
          family_income: profile.family_income ?? undefined,
          international_student: profile.international_student ?? undefined,
          in_state: profile.in_state ?? undefined,
          first_generation: profile.first_generation ?? undefined,
          special_talents: Array.isArray(profile.special_talents) ? profile.special_talents : []
        })
      } else {
        setUserProfile(null)
      }
    } catch (error: any) {
      setFinancialProfileError(error.message || 'Failed to load financial profile')
      setUserProfile(null)
    } finally {
      setFinancialProfileLoading(false)
    }
  }, [])

  useEffect(() => {
    async function fetchUniversity() {
      if (!slug) {
        setError('University slug is required')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const data = await UniversitiesService.getUniversityBySlug(slug)
        if (data) {
          setUniversity(data)
        } else {
          setError('University not found')
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load university')
      } finally {
        setLoading(false)
      }
    }

    fetchUniversity()
  }, [slug])

  useEffect(() => {
    refreshFinancialProfile()
  }, [refreshFinancialProfile])

  useEffect(() => {
    async function loadReviews() {
      try {
        if (university?.id) {
          const list = await ReviewsService.list(university.id)
          setReviews(Array.isArray(list) ? list : [])
        }
      } catch {}
    }
    loadReviews()
  }, [university?.id])

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!university?.id || !myRating) return
    setSavingReview(true)
    try {
      await ReviewsService.upsert(university.id, myRating, myComment || undefined)
      const list = await ReviewsService.list(university.id)
      setReviews(Array.isArray(list) ? list : [])
      setMyComment('')
    } catch (err) {
      // no-op
    } finally {
      setSavingReview(false)
    }
  }

  const handleCreateMicroContent = () => {
    setEditingMicroContent(null)
    setShowMicroContentEditor(true)
  }

  const handleEditMicroContent = (content: MicroContent) => {
    setEditingMicroContent(content)
    setShowMicroContentEditor(true)
  }

  const handleSaveMicroContent = (_content: MicroContent) => {
    setShowMicroContentEditor(false)
    setEditingMicroContent(null)
    // Refresh the micro-content section
    window.location.reload()
  }

  const handleCancelMicroContent = () => {
    setShowMicroContentEditor(false)
    setEditingMicroContent(null)
  }

  const handleOpenFinancialProfileModal = () => {
    const storedUser = getCurrentUser()
    if (!storedUser) {
      navigate('/login')
      return
    }

    setCurrentUser(storedUser)
    setFinancialProfileForm({
      gpa: userProfile?.gpa !== undefined && userProfile?.gpa !== null ? String(userProfile.gpa) : '',
      sat_score: userProfile?.sat_score !== undefined && userProfile?.sat_score !== null ? String(userProfile.sat_score) : '',
      act_score: userProfile?.act_score !== undefined && userProfile?.act_score !== null ? String(userProfile.act_score) : '',
      family_income: userProfile?.family_income !== undefined && userProfile?.family_income !== null ? String(userProfile.family_income) : '',
      international_student: userProfile?.international_student ?? false,
      in_state: userProfile?.in_state ?? false,
      first_generation: userProfile?.first_generation ?? false,
      special_talents: userProfile?.special_talents?.join(', ') || ''
    })
    setFinancialProfileModalError(null)
    setShowFinancialProfileModal(true)
  }

  const handleCloseFinancialProfileModal = () => {
    setShowFinancialProfileModal(false)
    setFinancialProfileModalError(null)
  }

  const handleFinancialProfileInputChange = <K extends keyof FinancialProfileFormState>(field: K, value: FinancialProfileFormState[K]) => {
    setFinancialProfileForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmitFinancialProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    const storedUser = currentUser || getCurrentUser()
    if (!storedUser) {
      navigate('/login')
      return
    }

    const parseNumber = (value: string) => {
      const trimmed = value.trim()
      if (!trimmed) return null
      const num = Number(trimmed)
      return Number.isFinite(num) ? num : null
    }

    const gpaValue = parseNumber(financialProfileForm.gpa)
    if (gpaValue !== null && (gpaValue < 0 || gpaValue > 4.5)) {
      setFinancialProfileModalError('Please enter a GPA between 0.0 and 4.5')
      return
    }

    const satValue = parseNumber(financialProfileForm.sat_score)
    if (satValue !== null && (satValue < 400 || satValue > 1600)) {
      setFinancialProfileModalError('SAT score should be between 400 and 1600')
      return
    }

    const actValue = parseNumber(financialProfileForm.act_score)
    if (actValue !== null && (actValue < 1 || actValue > 36)) {
      setFinancialProfileModalError('ACT score should be between 1 and 36')
      return
    }

    const incomeValue = parseNumber(financialProfileForm.family_income)
    if (incomeValue !== null && incomeValue < 0) {
      setFinancialProfileModalError('Family income cannot be negative')
      return
    }

    setFinancialProfileSaving(true)
    setFinancialProfileModalError(null)

    try {
      const payload = {
        gpa: gpaValue,
        sat_score: satValue,
        act_score: actValue,
        family_income: incomeValue,
        international_student: financialProfileForm.international_student,
        in_state: financialProfileForm.in_state,
        first_generation: financialProfileForm.first_generation,
        special_talents: financialProfileForm.special_talents
          .split(',')
          .map(item => item.trim())
          .filter(Boolean)
      }

      const saved = await financialProfileAPI.updateProfile(payload)

      setUserProfile({
        gpa: saved.gpa ?? undefined,
        sat_score: saved.sat_score ?? undefined,
        act_score: saved.act_score ?? undefined,
        family_income: saved.family_income ?? undefined,
        international_student: saved.international_student ?? undefined,
        in_state: saved.in_state ?? undefined,
        first_generation: saved.first_generation ?? undefined,
        special_talents: Array.isArray(saved.special_talents) ? saved.special_talents : []
      })
      setShowFinancialProfileModal(false)
      await refreshFinancialProfile()
    } catch (error: any) {
      setFinancialProfileModalError(error.message || 'Failed to save financial profile')
    } finally {
      setFinancialProfileSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading university...</p>
        </div>
      </div>
    )
  }

  if (error || !university) {
    return (
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-white rounded-lg shadow-lg p-12">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">University Not Found</h1>
            <p className="text-gray-600 mb-6">{error || 'The university you are looking for does not exist.'}</p>
            <Link to="/orientation/schools" className="btn-primary inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Schools
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const location = university.location_city || ''
  const country = university.location_country || university.country || ''
  const tuition = university.tuition_international || university.avg_tuition_per_year || 0
  const totalCost = tuition + (university.cost_of_living_est || 0)

  // Helper function to parse JSON fields
  const parseJson = (value: any) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value)
      } catch {
        return null
      }
    }
    return value
  }

  const applicationDeadlines = parseJson(university.application_deadlines)
  const englishReqs = parseJson(university.international_english_reqs)

  return (
    <div className="bg-gray-50 min-h-screen">
      <SEO title={`${university.name} | AcademOra`} description={university.description?.slice(0, 150)} />
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link
            to="/orientation/schools"
            className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-6 text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Schools
          </Link>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Logo */}
            <div className="flex-shrink-0">
              {university.logo_url && !imageError ? (
                <img
                  src={university.logo_url}
                  alt={university.name}
                  className="w-32 h-32 object-contain bg-white rounded-lg p-4 shadow-lg"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-32 h-32 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-4xl font-bold">
                  {(university.name || 'U')[0].toUpperCase()}
                </div>
              )}
            </div>

            {/* Header Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold mb-2">{university.name}</h1>
                  {university.short_name && (
                    <p className="text-xl text-white/90 mb-2">{university.short_name}</p>
                  )}
                  {(location || country) && (
                    <div className="flex items-center gap-2 text-white/90">
                      <MapPin className="h-5 w-5" />
                      <span>{location ? `${location}, ` : ''}{country}</span>
                      {university.campus_setting && <span className="text-white/70">• {university.campus_setting}</span>}
                    </div>
                  )}
                </div>
                {university.ranking_world && (
                  <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg text-center">
                    <div className="text-sm text-white/80">World Ranking</div>
                    <div className="text-3xl font-bold">#{university.ranking_world}</div>
                  </div>
                )}
              </div>

              {university.description && (
                <p className="text-white/90 text-lg mb-4 max-w-3xl">{university.description}</p>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {university.acceptance_rate && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <div className="text-xs text-white/80 mb-1">Acceptance Rate</div>
                    <div className="text-2xl font-bold">{university.acceptance_rate}%</div>
                  </div>
                )}
                {tuition > 0 && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <div className="text-xs text-white/80 mb-1">Annual Tuition</div>
                    <div className="text-2xl font-bold">${(tuition / 1000).toFixed(0)}k</div>
                  </div>
                )}
                {university.total_enrollment && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <div className="text-xs text-white/80 mb-1">Total Students</div>
                    <div className="text-2xl font-bold">{university.total_enrollment.toLocaleString()}</div>
                  </div>
                )}
                {university.established_year && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <div className="text-xs text-white/80 mb-1">Established</div>
                    <div className="text-2xl font-bold">{university.established_year}</div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 mt-6">
                <SaveButton
                  itemType="university"
                  itemId={university.id}
                  itemData={{ name: university.name, slug: university.slug, location: `${location}, ${country}` }}
                  className="bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30"
                />
                {university.website_url && (
                  <a
                    href={university.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-white text-primary-600 px-4 py-2 rounded-lg font-semibold hover:bg-white/90 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Visit Website
                  </a>
                )}
                {university.program_url && (
                  <a
                    href={university.program_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-semibold hover:bg-white/30 transition-colors"
                  >
                    <School className="h-4 w-4" />
                    View Programs
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. General Identity & Metadata */}
            <SectionCard
              icon={<Building className="h-6 w-6" />}
              title="General Information"
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoItem label="Institution Type" value={university.institution_type} />
                <InfoItem label="Established" value={university.established_year?.toString()} />
                <InfoItem label="Religious Affiliation" value={university.religious_affiliation || 'None'} />
                {university.faculty_to_student_ratio && (
                  <InfoItem label="Faculty to Student Ratio" value={university.faculty_to_student_ratio} />
                )}
              </div>
            </SectionCard>

            {/* Student Reviews */}
            <SectionCard
              icon={<Users className="h-6 w-6" />}
              title="Student Reviews"
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <div className="space-y-6">
                <form onSubmit={submitReview} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex flex-col md:flex-row md:items-center gap-3">
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Your Rating</div>
                      <select value={myRating} onChange={(e)=> setMyRating(Number(e.target.value))} className="border rounded px-2 py-1 text-sm">
                        <option value={0}>Select…</option>
                        {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} / 5</option>)}
                      </select>
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-gray-600 mb-1">Comment (optional)</div>
                      <input value={myComment} onChange={(e)=> setMyComment(e.target.value)} placeholder="Share your experience"
                        className="w-full border rounded px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <button disabled={!myRating || savingReview} className="btn-primary text-sm">
                        {savingReview ? 'Saving…' : 'Submit'}
                      </button>
                    </div>
                  </div>
                </form>

                <div className="divide-y">
                  {reviews.length === 0 ? (
                    <div className="text-sm text-gray-500">No reviews yet.</div>
                  ) : reviews.map((r) => (
                    <div key={r.id} className="py-3">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold text-gray-900">{r.rating} / 5</div>
                        <div className="text-xs text-gray-500">{new Date(r.created_at).toLocaleDateString()}</div>
                      </div>
                      {r.comment && <div className="text-sm text-gray-700 mt-1">{r.comment}</div>}
                    </div>
                  ))}
                </div>
              </div>
            </SectionCard>

            {/* 2. Location & Campus Vibe */}
            <SectionCard
              icon={<MapPin className="h-6 w-6" />}
              title="Location & Campus"
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoItem label="City" value={location || 'N/A'} />
                <InfoItem label="State/Province" value={university.location_state_province || 'N/A'} />
                <InfoItem label="Country" value={country || 'N/A'} />
                <InfoItem label="Campus Setting" value={university.campus_setting || 'N/A'} />
                {university.campus_size_acres && (
                  <InfoItem label="Campus Size" value={`${university.campus_size_acres.toLocaleString()} acres`} />
                )}
                <InfoItem label="Climate Zone" value={university.climate_zone || 'N/A'} />
                <InfoItem label="Housing" value={university.housing_availability || 'N/A'} />
                {university.nearest_major_airport && (
                  <InfoItem label="Nearest Airport" value={university.nearest_major_airport} />
                )}
              </div>
              {university.student_life_tags && university.student_life_tags.length > 0 && (
                <div className="mt-6">
                  <div className="text-sm font-medium text-gray-700 mb-3">Student Life Tags</div>
                  <div className="flex flex-wrap gap-2">
                    {university.student_life_tags.map((tag, idx) => (
                      <span key={idx} className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </SectionCard>

            {/* 3. Detailed Academics */}
            <SectionCard
              icon={<GraduationCap className="h-6 w-6" />}
              title="Academics"
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {university.degree_levels_offered && university.degree_levels_offered.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2">Degree Levels</div>
                      <div className="flex flex-wrap gap-2">
                        {university.degree_levels_offered.map((level, idx) => (
                          <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                            {level}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <InfoItem label="Academic Calendar" value={university.academic_calendar || 'N/A'} />
                  <InfoItem label="Research Activity" value={university.research_activity_level || 'N/A'} />
                  {university.programs_count && (
                    <InfoItem label="Total Programs" value={university.programs_count.toLocaleString()} />
                  )}
                  {university.languages_of_instruction && university.languages_of_instruction.length > 0 && (
                    <div className="md:col-span-2">
                      <div className="text-sm font-medium text-gray-700 mb-2">Languages of Instruction</div>
                      <div className="flex flex-wrap gap-2">
                        {university.languages_of_instruction.map((lang, idx) => (
                          <span key={idx} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {university.top_ranked_programs && university.top_ranked_programs.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-yellow-600" />
                      Top Ranked Programs
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {university.top_ranked_programs.map((program, idx) => (
                        <span key={idx} className="px-4 py-2 bg-yellow-50 text-yellow-800 rounded-lg text-sm font-semibold border border-yellow-200">
                          {program}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {university.interests && university.interests.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-3">Academic Fields</div>
                    <div className="flex flex-wrap gap-2">
                      {university.interests.map((interest, idx) => (
                        <span key={idx} className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-3">
                    {university.study_abroad_opportunities ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-400" />
                    )}
                    <span className="text-sm text-gray-700">Study Abroad Available</span>
                  </div>
                  {university.accreditation_body && (
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="text-xs text-gray-500">Accredited by</div>
                        <div className="text-sm font-medium text-gray-900">{university.accreditation_body}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </SectionCard>

            {/* 4. Admissions & Selectivity */}
            <SectionCard
              icon={<BookOpen className="h-6 w-6" />}
              title="Admissions & Selectivity"
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <div className="space-y-6">
                {/* Acceptance Rate with Progress Bar */}
                {university.acceptance_rate && (
                  <div>
                    <ProgressBar
                      value={university.acceptance_rate}
                      variant="primary"
                      label="Acceptance Rate"
                      showLabel
                    />
                    <div className="mt-1 text-xs text-gray-500">
                      {university.acceptance_rate < 20 ? 'Highly Selective' : 
                       university.acceptance_rate < 50 ? 'Selective' : 
                       university.acceptance_rate < 80 ? 'Moderately Selective' : 'Less Selective'}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoItem label="Application Fee" value={university.application_fee ? `$${university.application_fee}` : 'N/A'} />
                  <InfoItem label="Test Policy" value={university.standardized_test_policy || 'N/A'} />
                  {university.sat_score_25th_percentile && university.sat_score_75th_percentile && (
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2">SAT Score Range</div>
                      <div className="text-lg font-semibold text-gray-900">
                        {university.sat_score_25th_percentile} - {university.sat_score_75th_percentile}
                      </div>
                    </div>
                  )}
                  {university.act_score_avg && (
                    <InfoItem label="Average ACT Score" value={university.act_score_avg.toString()} />
                  )}
                  {university.min_gpa_requirement && (
                    <InfoItem label="Min. GPA Requirement" value={university.min_gpa_requirement.toFixed(1)} />
                  )}
                  {university.avg_gpa_admitted && (
                    <InfoItem label="Average GPA Admitted" value={university.avg_gpa_admitted.toFixed(1)} />
                  )}
                </div>

                {applicationDeadlines && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-3">Application Deadlines</div>
                    <div className="space-y-2">
                      {Object.entries(applicationDeadlines).map(([type, date]: [string, any]) => (
                        <div key={type} className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-lg">
                          <span className="text-sm font-medium text-gray-700 capitalize">
                            {type.replace('_', ' ')}
                          </span>
                          <span className="text-sm text-gray-900 font-semibold">{date}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {university.required_tests && university.required_tests.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">Required Tests</div>
                    <div className="flex flex-wrap gap-2">
                      {university.required_tests.map((test, idx) => (
                        <span key={idx} className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-sm">
                          {test}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {englishReqs && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">English Requirements (International)</div>
                    <div className="grid grid-cols-2 gap-4">
                      {englishReqs.toefl_min && (
                        <div className="bg-blue-50 px-4 py-2 rounded-lg">
                          <div className="text-xs text-gray-600 mb-1">TOEFL</div>
                          <div className="text-lg font-bold text-gray-900">Min: {englishReqs.toefl_min}</div>
                        </div>
                      )}
                      {englishReqs.ielts_min && (
                        <div className="bg-blue-50 px-4 py-2 rounded-lg">
                          <div className="text-xs text-gray-600 mb-1">IELTS</div>
                          <div className="text-lg font-bold text-gray-900">Min: {englishReqs.ielts_min}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </SectionCard>

            {/* 5. Financials & Aid */}
            <SectionCard
              icon={<DollarSign className="h-6 w-6" />}
              title="Financials & Aid"
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <div className="space-y-6">
                {/* Tuition Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {university.tuition_in_state && (
                    <StatCard
                      label="In-State Tuition"
                      value={`$${(university.tuition_in_state / 1000).toFixed(0)}k`}
                      icon={<Home className="h-5 w-5" />}
                      color="blue"
                    />
                  )}
                  {university.tuition_out_of_state && (
                    <StatCard
                      label="Out-of-State"
                      value={`$${(university.tuition_out_of_state / 1000).toFixed(0)}k`}
                      icon={<Globe className="h-5 w-5" />}
                      color="purple"
                    />
                  )}
                  {university.tuition_international && (
                    <StatCard
                      label="International"
                      value={`$${(university.tuition_international / 1000).toFixed(0)}k`}
                      icon={<Globe2 className="h-5 w-5" />}
                      color="green"
                    />
                  )}
                </div>

                {university.cost_of_living_est && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Cost of Living (Annual)</span>
                      <span className="text-lg font-bold text-gray-900">${university.cost_of_living_est.toLocaleString()}</span>
                    </div>
                  </div>
                )}

                {totalCost > 0 && (
                  <div className="bg-gradient-to-r from-primary-50 to-primary-100 p-4 rounded-lg border border-primary-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Estimated Total Cost (Tuition + Living)</span>
                      <span className="text-2xl font-bold text-primary-700">${totalCost.toLocaleString()}/yr</span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200">
                  {university.percentage_receiving_aid && (
                    <div>
                      <ProgressBar
                        value={university.percentage_receiving_aid}
                        variant="success"
                        label="% Receiving Financial Aid"
                        showLabel
                      />
                    </div>
                  )}
                  {university.avg_financial_aid_package && (
                    <InfoItem
                      label="Average Aid Package"
                      value={`$${university.avg_financial_aid_package.toLocaleString()}`}
                    />
                  )}
                </div>

                <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    {university.scholarships_international ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-400" />
                    )}
                    <span className="text-sm text-gray-700">International Scholarships Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {university.need_blind_admission ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-400" />
                    )}
                    <span className="text-sm text-gray-700">Need-Blind Admission</span>
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Financial Aid Predictor */}
            <div className="mt-6 space-y-3">
              {financialProfileLoading && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading your financial profile...</span>
                </div>
              )}
              {financialProfileError && (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>{financialProfileError}</span>
                </div>
              )}
              <FinancialAidPredictor 
                university={university} 
                userProfile={userProfile || undefined}
                onRequestCompleteProfile={handleOpenFinancialProfileModal}
              />
            </div>

            {/* 6. Student Demographics */}
            <SectionCard
              icon={<Users className="h-6 w-6" />}
              title="Student Demographics"
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <div className="space-y-6">
                {/* Enrollment Breakdown */}
                {university.total_enrollment && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-lg font-semibold text-gray-900">Total Enrollment</span>
                      <span className="text-3xl font-bold text-primary-600">{university.total_enrollment.toLocaleString()}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {university.undergrad_enrollment && (
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="text-xs text-gray-600 mb-1">Undergraduate</div>
                          <div className="text-xl font-bold text-gray-900">{university.undergrad_enrollment.toLocaleString()}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {((university.undergrad_enrollment / university.total_enrollment) * 100).toFixed(1)}%
                          </div>
                        </div>
                      )}
                      {university.grad_enrollment && (
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <div className="text-xs text-gray-600 mb-1">Graduate</div>
                          <div className="text-xl font-bold text-gray-900">{university.grad_enrollment.toLocaleString()}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {((university.grad_enrollment / university.total_enrollment) * 100).toFixed(1)}%
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {university.percentage_international && (
                    <div>
                      <ProgressBar
                        value={university.percentage_international}
                        variant="info"
                        label="International Students"
                        showLabel
                      />
                    </div>
                  )}
                  {university.gender_ratio && (
                    <InfoItem label="Gender Ratio" value={university.gender_ratio} />
                  )}
                  {university.retention_rate_first_year && (
                    <div>
                      <ProgressBar
                        value={university.retention_rate_first_year}
                        variant="success"
                        label="First Year Retention Rate"
                        showLabel
                      />
                    </div>
                  )}
                </div>
              </div>
            </SectionCard>

            {/* 7. Future Outcomes */}
            <SectionCard
              icon={<TrendingUp className="h-6 w-6" />}
              title="Future Outcomes"
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <div className="space-y-6">
                {/* Graduation Rates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {university.graduation_rate_4yr && (
                    <div>
                      <ProgressBar
                        value={university.graduation_rate_4yr}
                        variant="info"
                        label="4-Year Graduation Rate"
                        showLabel
                        height="lg"
                      />
                    </div>
                  )}
                  {university.graduation_rate_6yr && (
                    <div>
                      <ProgressBar
                        value={university.graduation_rate_6yr}
                        variant="success"
                        label="6-Year Graduation Rate"
                        showLabel
                        height="lg"
                      />
                    </div>
                  )}
                </div>

                {/* Employment & Salary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {university.employment_rate_6mo && (
                    <div>
                      <ProgressBar
                        value={university.employment_rate_6mo}
                        variant="primary"
                        label="Employment Rate (6 months)"
                        showLabel
                        height="lg"
                      />
                    </div>
                  )}
                  {university.avg_starting_salary && (
                    <StatCard
                      label="Average Starting Salary"
                      value={`$${university.avg_starting_salary.toLocaleString()}`}
                      icon={<Briefcase className="h-5 w-5" />}
                      color="green"
                    />
                  )}
                </div>

                {/* Support Ratings */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                  {university.internship_placement_support && (
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2">Internship Support</div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <ProgressBar 
                            value={(university.internship_placement_support / 5) * 100}
                            variant="info"
                          />
                        </div>
                        <span className="text-sm font-bold text-gray-900">{university.internship_placement_support}/5</span>
                      </div>
                    </div>
                  )}
                  {university.alumni_network_strength && (
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2">Alumni Network</div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <ProgressBar 
                            value={(university.alumni_network_strength / 5) * 100}
                            variant="purple"
                          />
                        </div>
                        <span className="text-sm font-bold text-gray-900">{university.alumni_network_strength}/5</span>
                      </div>
                    </div>
                  )}
                  {university.post_study_work_visa_months && (
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2">Post-Study Work Visa</div>
                      <div className="text-2xl font-bold text-gray-900">{university.post_study_work_visa_months} months</div>
                      <div className="text-xs text-gray-500 mt-1">Work authorization period</div>
                    </div>
                  )}
                </div>
              </div>
            </SectionCard>

            {/* Career Trajectory Heatmap */}
            <div className="mt-6">
              <CareerTrajectoryHeatmap 
                universities={[university]} 
                userPreferences={{
                  weight_salary: 0.5,
                  weight_visa: 0.3,
                  weight_career: 0.2
                }}
              />
            </div>

            {/* Mentorship System */}
            <div className="mt-6">
              <MentorshipSystem 
                currentUser={{
                  id: 'current-user',
                  name: 'Current Student',
                  university: university.name,
                  international_student: true
                }}
              />
            </div>

            {/* University Micro-Content */}
            <div className="mt-6">
              <UniversityMicroContent 
                universityId={university.id}
                isOwner={isUniversityOwner}
                onEdit={handleEditMicroContent}
                onCreateNew={handleCreateMicroContent}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary-600" />
                Quick Stats
              </h3>
              <div className="space-y-4">
                {university.acceptance_rate && (
                  <StatRow label="Acceptance Rate" value={`${university.acceptance_rate}%`} />
                )}
                {tuition > 0 && (
                  <StatRow label="Tuition (Intl)" value={`$${(tuition / 1000).toFixed(0)}k/yr`} />
                )}
                {university.total_enrollment && (
                  <StatRow label="Total Enrollment" value={university.total_enrollment.toLocaleString()} />
                )}
                {university.percentage_international && (
                  <StatRow label="International" value={`${university.percentage_international}%`} />
                )}
                {university.graduation_rate_6yr && (
                  <StatRow label="6-Year Graduation" value={`${university.graduation_rate_6yr}%`} />
                )}
                {university.avg_starting_salary && (
                  <StatRow label="Avg. Starting Salary" value={`$${(university.avg_starting_salary / 1000).toFixed(0)}k`} />
                )}
              </div>
            </div>

            {/* Key Highlights */}
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg shadow-sm p-6 border border-primary-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary-600" />
                Key Highlights
              </h3>
              <div className="space-y-3">
                {university.ranking_world && (
                  <HighlightItem icon={<Trophy className="h-4 w-4" />} text={`World Rank: #${university.ranking_world}`} />
                )}
                {university.top_ranked_programs && university.top_ranked_programs.length > 0 && (
                  <HighlightItem icon={<Award className="h-4 w-4" />} text={`Top Programs: ${university.top_ranked_programs.slice(0, 2).join(', ')}`} />
                )}
                {university.research_activity_level && (
                  <HighlightItem icon={<Zap className="h-4 w-4" />} text={`Research: ${university.research_activity_level}`} />
                )}
                {university.post_study_work_visa_months && (
                  <HighlightItem icon={<Globe className="h-4 w-4" />} text={`Work Visa: ${university.post_study_work_visa_months} months`} />
                )}
                {university.scholarships_international && (
                  <HighlightItem icon={<DollarIcon className="h-4 w-4" />} text="International Scholarships Available" />
                )}
              </div>
            </div>

            {/* Contact & Links */}
            {(university.website_url || university.program_url) && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <ExternalLink className="h-5 w-5 text-primary-600" />
                  Quick Links
                </h3>
                <div className="space-y-3">
                  {university.website_url && (
                    <a
                      href={university.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Official Website
                    </a>
                  )}
                  {university.program_url && (
                    <a
                      href={university.program_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm"
                    >
                      <School className="h-4 w-4" />
                      Academic Programs
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

    {/* Financial Profile Modal */}
    {showFinancialProfileModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Financial Aid Profile</h3>
              <p className="text-sm text-gray-500">We use this to personalize your aid predictions.</p>
            </div>
            <button
              onClick={handleCloseFinancialProfileModal}
              className="rounded-full p-2 text-gray-400 hover:text-gray-600 transition-colors"
              type="button"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmitFinancialProfile} className="px-6 py-5 space-y-5">
            {financialProfileModalError && (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span>{financialProfileModalError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GPA</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="4.5"
                  value={financialProfileForm.gpa}
                  onChange={(e) => handleFinancialProfileInputChange('gpa', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                  placeholder="e.g. 3.8"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SAT Score</label>
                <input
                  type="number"
                  min="400"
                  max="1600"
                  value={financialProfileForm.sat_score}
                  onChange={(e) => handleFinancialProfileInputChange('sat_score', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ACT Score</label>
                <input
                  type="number"
                  min="1"
                  max="36"
                  value={financialProfileForm.act_score}
                  onChange={(e) => handleFinancialProfileInputChange('act_score', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Family Income (USD)</label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={financialProfileForm.family_income}
                  onChange={(e) => handleFinancialProfileInputChange('family_income', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                  placeholder="e.g. 65000"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <label className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                <input
                  type="checkbox"
                  checked={financialProfileForm.international_student}
                  onChange={(e) => handleFinancialProfileInputChange('international_student', e.target.checked)}
                />
                <span>International student</span>
              </label>
              <label className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                <input
                  type="checkbox"
                  checked={financialProfileForm.in_state}
                  onChange={(e) => handleFinancialProfileInputChange('in_state', e.target.checked)}
                />
                <span>In-state applicant</span>
              </label>
              <label className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                <input
                  type="checkbox"
                  checked={financialProfileForm.first_generation}
                  onChange={(e) => handleFinancialProfileInputChange('first_generation', e.target.checked)}
                />
                <span>First-generation</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Special talents or awards</label>
              <textarea
                value={financialProfileForm.special_talents}
                onChange={(e) => handleFinancialProfileInputChange('special_talents', e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                placeholder="e.g. Research award, varsity athlete, music scholarship"
              />
              <p className="mt-1 text-xs text-gray-500">Separate multiple items with commas.</p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleCloseFinancialProfileModal}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                disabled={financialProfileSaving}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={financialProfileSaving}
                className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {financialProfileSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                Save profile
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

      {/* Micro-Content Editor Modal */}
      {showMicroContentEditor && (
        <MicroContentEditor
          universityId={university.id}
          content={editingMicroContent}
          onSave={handleSaveMicroContent}
          onCancel={handleCancelMicroContent}
        />
      )}
    </div>
  )
}

// Helper Components
function SectionCard({ icon, title, children, className = '' }: { icon: React.ReactNode; title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
        <div className="text-primary-600">{icon}</div>
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      </div>
      {children}
    </div>
  )
}

function InfoItem({ label, value }: { label: string; value: string | number | undefined | null }) {
  if (!value && value !== 0) return null
  return (
    <div>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="text-sm font-semibold text-gray-900">{value}</div>
    </div>
  )
}

function StatCard({ label, value, icon, color = 'blue' }: { label: string; value: string; icon: React.ReactNode; color?: 'blue' | 'purple' | 'green' | 'orange' }) {
  const colorClasses: Record<'blue' | 'purple' | 'green' | 'orange', string> = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
  }
  return (
    <div className={`${colorClasses[color]} p-4 rounded-lg`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <div className="text-xs font-medium opacity-80">{label}</div>
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  )
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm font-bold text-gray-900">{value}</span>
    </div>
  )
}

function HighlightItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-700">
      <div className="text-primary-600">{icon}</div>
      <span>{text}</span>
    </div>
  )
}

