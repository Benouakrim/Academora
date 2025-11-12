import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts'
import { TrendingUp, DollarSign, Award, Users, Target } from 'lucide-react'

interface University {
  id: string
  name: string
  ranking_global?: number
  acceptance_rate?: number
  avg_tuition_per_year?: number
  avg_gpa_admitted?: number
  total_enrollment?: number
  graduation_rate_6yr?: number
  avg_starting_salary?: number
  student_faculty_ratio?: number
  international_student_percentage?: number
  [key: string]: any
}

interface ChartViewProps {
  universities: University[]
  predictions: any[] | null
}

// Chart color palette now sourced from CSS variables (themes can override)
const COLORS = [
  'var(--chart-color-1)',
  'var(--chart-color-2)',
  'var(--chart-color-3)',
  'var(--chart-color-4)',
  'var(--chart-color-5)',
  'var(--chart-color-6)'
]

export default function ComparisonCharts({ universities, predictions }: ChartViewProps) {
  // Prepare data for various charts
  
  // Cost comparison data
  const costData = universities.map((u, idx) => {
    const prediction = predictions?.find(p => p.university_id === u.id)
    return {
      name: u.name.length > 20 ? u.name.substring(0, 20) + '...' : u.name,
      fullName: u.name,
      tuition: u.avg_tuition_per_year || 0,
      predictedCost: prediction?.prediction.total_out_of_pocket || u.avg_tuition_per_year || 0,
      aid: prediction?.prediction.estimated_aid || 0,
      color: COLORS[idx % COLORS.length],
    }
  })

  // Academic profile radar data
  const maxRanking = Math.max(...universities.map(u => u.ranking_global || 1000).filter(r => r > 0))
  const radarData = [
    {
      metric: 'Ranking',
      ...universities.reduce((acc, u, idx) => {
        // Invert ranking so higher is better (closer to 1 = 100%)
        const score = u.ranking_global ? ((maxRanking - u.ranking_global + 1) / maxRanking) * 100 : 0
        acc[`uni${idx}`] = Math.round(score)
        return acc
      }, {} as Record<string, number>),
    },
    {
      metric: 'Selectivity',
      ...universities.reduce((acc, u, idx) => {
        // Lower acceptance rate = more selective = higher score
        const score = u.acceptance_rate ? (100 - u.acceptance_rate) : 0
        acc[`uni${idx}`] = Math.round(score)
        return acc
      }, {} as Record<string, number>),
    },
    {
      metric: 'Graduation',
      ...universities.reduce((acc, u, idx) => {
        acc[`uni${idx}`] = u.graduation_rate_6yr || 0
        return acc
      }, {} as Record<string, number>),
    },
    {
      metric: 'Student:Faculty',
      ...universities.reduce((acc, u, idx) => {
        // Lower ratio is better, normalize to 0-100 (assuming 1:1 = 100, 25:1 = 0)
        const ratio = u.student_faculty_ratio || 15
        const score = Math.max(0, Math.min(100, 100 - ((ratio - 1) * 4)))
        acc[`uni${idx}`] = Math.round(score)
        return acc
      }, {} as Record<string, number>),
    },
    {
      metric: 'International',
      ...universities.reduce((acc, u, idx) => {
        acc[`uni${idx}`] = u.international_student_percentage || 0
        return acc
      }, {} as Record<string, number>),
    },
  ]

  // Enrollment comparison
  const enrollmentData = universities.map((u, idx) => ({
    name: u.name.length > 20 ? u.name.substring(0, 20) + '...' : u.name,
    fullName: u.name,
    enrollment: u.total_enrollment || 0,
    color: COLORS[idx % COLORS.length],
  }))

  // Outcomes comparison
  const outcomesData = universities.map((u, idx) => ({
    name: u.name.length > 15 ? u.name.substring(0, 15) + '...' : u.name,
    fullName: u.name,
    graduation: u.graduation_rate_6yr || 0,
    employment: u.employment_rate_after_graduation || 0,
    salary: (u.avg_starting_salary || 0) / 1000, // Convert to thousands
    color: COLORS[idx % COLORS.length],
  }))

  // Acceptance rate pie chart
  const acceptanceData = universities
    .filter(u => u.acceptance_rate)
    .map((u, idx) => ({
      name: u.name,
      value: u.acceptance_rate,
      color: COLORS[idx % COLORS.length],
    }))

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-xl border">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
              {entry.name.toLowerCase().includes('salary') && 'k'}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Cost Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border shadow-sm p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <DollarSign className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Cost Comparison</h3>
            <p className="text-sm text-gray-600">Annual tuition and predicted costs with aid</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={costData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis 
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="tuition" name="Listed Tuition" fill="var(--chart-color-1)" radius={[8, 8, 0, 0]} />
            {predictions && (
              <>
                <Bar dataKey="predictedCost" name="Your Predicted Cost" fill="var(--chart-color-2)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="aid" name="Estimated Aid" fill="var(--chart-color-4)" radius={[8, 8, 0, 0]} />
              </>
            )}
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Academic Profile Radar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl border shadow-sm p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Award className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Academic Profile</h3>
            <p className="text-sm text-gray-600">Comprehensive comparison across key academic metrics</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="var(--chart-grid)" />
            <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12, fill: 'var(--chart-tick)' }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
            <Tooltip />
            <Legend />
            {universities.map((u, idx) => (
              <Radar
                key={u.id}
                name={u.name.length > 25 ? u.name.substring(0, 25) + '...' : u.name}
                dataKey={`uni${idx}`}
                stroke={COLORS[idx % COLORS.length]}
                fill={COLORS[idx % COLORS.length]}
                fillOpacity={0.3}
              />
            ))}
          </RadarChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Enrollment Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl border shadow-sm p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Student Enrollment</h3>
              <p className="text-sm text-gray-600">Total student body size</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={enrollmentData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis 
                type="number" 
                tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}
                tick={{ fontSize: 12 }}
              />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="enrollment" name="Total Enrollment" radius={[0, 8, 8, 0]}>
                {enrollmentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Acceptance Rate Pie */}
        {acceptanceData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white rounded-xl border shadow-sm p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-pink-100 rounded-lg">
                <Target className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Selectivity</h3>
                <p className="text-sm text-gray-600">Acceptance rates comparison</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={acceptanceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${(name || '').substring(0, 15)}: ${value}%`}
                  outerRadius={80}
                  fill="var(--chart-color-2)"
                  dataKey="value"
                >
                  {acceptanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </div>

      {/* Outcomes Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl border shadow-sm p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-orange-100 rounded-lg">
            <TrendingUp className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Student Outcomes</h3>
            <p className="text-sm text-gray-600">Graduation rates, employment, and starting salaries</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={outcomesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              tick={{ fontSize: 12 }}
              label={{ value: 'Salary ($k)', angle: -90, position: 'insideRight', style: { fontSize: 12 } }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="graduation" 
              name="Graduation Rate (%)" 
              stroke="var(--chart-color-1)" 
              strokeWidth={3}
              dot={{ r: 5, fill: 'var(--chart-color-1)' }}
            />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="employment" 
              name="Employment Rate (%)" 
              stroke="var(--chart-color-4)" 
              strokeWidth={3}
              dot={{ r: 5, fill: 'var(--chart-color-4)' }}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="salary" 
              name="Starting Salary ($k)" 
              stroke="var(--chart-color-5)" 
              strokeWidth={3}
              dot={{ r: 5, fill: 'var(--chart-color-5)' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Legend for university colors */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6"
      >
        <h4 className="text-sm font-semibold text-gray-900 mb-3">University Color Legend</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {universities.map((u, idx) => (
            <div key={u.id} className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded"
                style={{ backgroundColor: COLORS[idx % COLORS.length] }}
              />
              <span className="text-sm text-gray-700">{u.name}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
