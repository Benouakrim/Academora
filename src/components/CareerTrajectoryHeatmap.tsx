import { useState, useMemo } from 'react'
import { BarChart3, Info } from 'lucide-react'

interface University {
  id: string
  name: string
  employment_rate_6mo?: number
  avg_starting_salary?: number
  post_study_work_visa_months?: number
  alumni_network_strength?: number
  location_country?: string
}

interface UserPreferences {
  weight_salary?: number
  weight_visa?: number
  weight_career?: number
  max_budget?: number
}

interface CareerHeatmapProps {
  universities: University[]
  userPreferences?: UserPreferences
}

interface DataPoint {
  university: University
  x: number // Visa Flexibility (0-100)
  y: number // Salary Potential (0-100)
  score: number
  size: number // Employment rate
}

export default function CareerTrajectoryHeatmap({ universities, userPreferences }: CareerHeatmapProps) {
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null)
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null)
  const [viewMode, setViewMode] = useState<'scatter' | 'quadrant'>('quadrant')

  // Process data for visualization
  const dataPoints = useMemo(() => {
    return universities.map(uni => {
      // Calculate Visa Flexibility Score (0-100)
      const visaScore = Math.min(100, 
        (uni.post_study_work_visa_months || 0) * 2 + // 0-50 points for visa months
        (uni.alumni_network_strength || 0) * 10 // 0-50 points for alumni network
      )

      // Calculate Salary Potential Score (0-100)
      const maxSalary = 150000 // $150k as reference max
      const salaryScore = Math.min(100, 
        ((uni.avg_starting_salary || 0) / maxSalary) * 100
      )

      // Calculate weighted score based on user preferences
      const salaryWeight = userPreferences?.weight_salary || 0.5
      const visaWeight = userPreferences?.weight_visa || 0.3
      const careerWeight = userPreferences?.weight_career || 0.2
      
      const score = 
        (salaryScore * salaryWeight) +
        (visaScore * visaWeight) +
        ((uni.employment_rate_6mo || 0) * careerWeight)

      return {
        university: uni,
        x: visaScore,
        y: salaryScore,
        score,
        size: uni.employment_rate_6mo || 50
      }
    })
  }, [universities, userPreferences])

  // Calculate quadrant boundaries
  const quadrants = useMemo(() => {
    const avgX = dataPoints.reduce((sum, p) => sum + p.x, 0) / dataPoints.length
    const avgY = dataPoints.reduce((sum, p) => sum + p.y, 0) / dataPoints.length
    return { avgX, avgY }
  }, [dataPoints])

  // SVG dimensions and scales
  const width = 600
  const height = 400
  const margin = { top: 40, right: 40, bottom: 60, left: 60 }
  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  // Scales
  const xScale = (value: number) => (value / 100) * innerWidth
  const yScale = (value: number) => innerHeight - (value / 100) * innerHeight

  // Get color based on score and quadrant
  const getPointColor = (point: DataPoint) => {
    if (viewMode === 'quadrant') {
      const inHighVisaHighSalary = point.x >= quadrants.avgX && point.y >= quadrants.avgY
      const inLowVisaHighSalary = point.x < quadrants.avgX && point.y >= quadrants.avgY
      const inHighVisaLowSalary = point.x >= quadrants.avgX && point.y < quadrants.avgY

  if (inHighVisaHighSalary) return 'var(--heatmap-best)' // Best quadrant
  if (inLowVisaHighSalary) return 'var(--heatmap-good)' // High salary, low visa
  if (inHighVisaLowSalary) return 'var(--heatmap-caution)' // High visa, low salary
  return 'var(--heatmap-risk)' // Challenging quadrant
    }
    
    // Score-based coloring
  if (point.score >= 80) return 'var(--heatmap-best)'
  if (point.score >= 60) return 'var(--heatmap-good)'
  if (point.score >= 40) return 'var(--heatmap-caution)'
  return 'var(--heatmap-risk)'
  }

  if (dataPoints.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8 text-gray-500">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No career data available for comparison</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-6 w-6" />
            <div>
              <h3 className="text-lg font-bold">Career Trajectory Heatmap</h3>
              <p className="text-purple-100 text-sm">Visa Flexibility vs. Salary Potential</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'scatter' ? 'quadrant' : 'scatter')}
              className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition-colors"
            >
              {viewMode === 'scatter' ? 'Quadrant View' : 'Score View'}
            </button>
          </div>
        </div>
      </div>

      {/* Visualization */}
      <div className="p-6">
        <div className="mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <Info className="h-4 w-4" />
            <span>Interactive chart showing career outcomes. Click points for details.</span>
          </div>
        </div>

        <div className="relative bg-gray-50 rounded-lg p-4 overflow-x-auto">
          <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
            {/* Grid lines */}
            {viewMode === 'quadrant' && (
              <>
                {/* Vertical quadrant line */}
                <line
                  x1={margin.left + xScale(quadrants.avgX)}
                  y1={margin.top}
                  x2={margin.left + xScale(quadrants.avgX)}
                  y2={margin.top + innerHeight}
                  stroke="#d1d5db"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
                {/* Horizontal quadrant line */}
                <line
                  x1={margin.left}
                  y1={margin.top + yScale(quadrants.avgY)}
                  x2={margin.left + innerWidth}
                  y2={margin.top + yScale(quadrants.avgY)}
                  stroke="#d1d5db"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
              </>
            )}

            {/* Axes */}
            <line
              x1={margin.left}
              y1={margin.top + innerHeight}
              x2={margin.left + innerWidth}
              y2={margin.top + innerHeight}
              stroke="#374151"
              strokeWidth="2"
            />
            <line
              x1={margin.left}
              y1={margin.top}
              x2={margin.left}
              y2={margin.top + innerHeight}
              stroke="#374151"
              strokeWidth="2"
            />

            {/* X-axis labels */}
            <text x={margin.left + innerWidth / 2} y={height - 10} textAnchor="middle" className="text-sm font-medium fill-gray-700">
              Visa Flexibility Score
            </text>
            <text x={margin.left} y={height - 25} textAnchor="middle" className="text-xs fill-gray-500">Low</text>
            <text x={margin.left + innerWidth} y={height - 25} textAnchor="middle" className="text-xs fill-gray-500">High</text>

            {/* Y-axis labels */}
            <text x={20} y={margin.top + innerHeight / 2} textAnchor="middle" className="text-sm font-medium fill-gray-700" transform={`rotate(-90 20 ${margin.top + innerHeight / 2})`}>
              Salary Potential Score
            </text>
            <text x={margin.left - 10} y={margin.top + innerHeight} textAnchor="end" className="text-xs fill-gray-500">Low</text>
            <text x={margin.left - 10} y={margin.top} textAnchor="end" className="text-xs fill-gray-500">High</text>

            {/* Quadrant labels */}
            {viewMode === 'quadrant' && (
              <>
                <text x={margin.left + innerWidth * 0.75} y={margin.top + 20} textAnchor="middle" className="text-xs font-medium fill-green-600">
                  High Visa, High Salary
                </text>
                <text x={margin.left + innerWidth * 0.25} y={margin.top + 20} textAnchor="middle" className="text-xs font-medium fill-blue-600">
                  Low Visa, High Salary
                </text>
                <text x={margin.left + innerWidth * 0.75} y={margin.top + innerHeight - 5} textAnchor="middle" className="text-xs font-medium fill-orange-600">
                  High Visa, Low Salary
                </text>
                <text x={margin.left + innerWidth * 0.25} y={margin.top + innerHeight - 5} textAnchor="middle" className="text-xs font-medium fill-red-600">
                  Low Visa, Low Salary
                </text>
              </>
            )}

            {/* Data points */}
            {dataPoints.map((point) => (
              <g key={point.university.id}>
                <circle
                  cx={margin.left + xScale(point.x)}
                  cy={margin.top + yScale(point.y)}
                  r={Math.max(6, Math.min(15, point.size / 10))}
                  fill={getPointColor(point)}
                  stroke="white"
                  strokeWidth="2"
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setSelectedUniversity(point.university)}
                  onMouseEnter={() => setHoveredPoint(point)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
                
                {/* Tooltip on hover */}
                {hoveredPoint?.university.id === point.university.id && (
                  <g>
                    <rect
                      x={margin.left + xScale(point.x) + 10}
                      y={margin.top + yScale(point.y) - 30}
                      width={200}
                      height={60}
                      fill="white"
                      stroke="#d1d5db"
                      strokeWidth="1"
                      rx="4"
                    />
                    <text x={margin.left + xScale(point.x) + 15} y={margin.top + yScale(point.y) - 10} className="text-xs font-medium fill-gray-900">
                      {point.university.name}
                    </text>
                    <text x={margin.left + xScale(point.x) + 15} y={margin.top + yScale(point.y) + 5} className="text-xs fill-gray-600">
                      Score: {point.score.toFixed(1)}
                    </text>
                    <text x={margin.left + xScale(point.x) + 15} y={margin.top + yScale(point.y) + 20} className="text-xs fill-gray-600">
                      Employment: {point.size}%
                    </text>
                  </g>
                )}
              </g>
            ))}
          </svg>
        </div>

        {/* Legend */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {viewMode === 'quadrant' ? (
            <>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700">High Visa, High Salary</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Low Visa, High Salary</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                <span className="text-sm text-gray-700">High Visa, Low Salary</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Low Visa, Low Salary</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Excellent (80+)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Good (60-79)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Fair (40-59)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Challenging (&lt;40)</span>
              </div>
            </>
          )}
        </div>

        {/* Selected University Details */}
        {selectedUniversity && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900">{selectedUniversity.name}</h4>
              <button
                onClick={() => setSelectedUniversity(null)}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                Clear
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Employment Rate:</span>
                <span className="ml-2 font-medium">{selectedUniversity.employment_rate_6mo}%</span>
              </div>
              <div>
                <span className="text-gray-600">Avg. Salary:</span>
                <span className="ml-2 font-medium">${selectedUniversity.avg_starting_salary?.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-600">Work Visa:</span>
                <span className="ml-2 font-medium">{selectedUniversity.post_study_work_visa_months} months</span>
              </div>
              <div>
                <span className="text-gray-600">Alumni Network:</span>
                <span className="ml-2 font-medium">{selectedUniversity.alumni_network_strength}/5</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
