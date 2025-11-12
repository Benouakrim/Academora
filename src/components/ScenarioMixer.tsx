import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Settings, 
  Sliders, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  RotateCcw,
  Zap,
  Info
} from 'lucide-react'

interface ScenarioAdjustment {
  criterion: string
  originalValue: number | string
  newValue: number | string
  impact: 'positive' | 'negative' | 'neutral'
  description: string
}

interface University {
  id: string
  name: string
  country: string
  description?: string
  image_url?: string
  avg_tuition_per_year: number
  min_gpa: number
  interests: string[]
  application_deadline: string
  required_tests?: string[]
  program_url?: string
}

interface Criteria {
  interests: string[]
  minGpa: number
  maxBudget: number
  country: string
}

interface ScenarioMixerProps {
  originalCriteria: Criteria
  originalResults: University[]
  onScenarioChange: (scenarioResults: University[]) => void
}

export default function ScenarioMixer({ 
  originalCriteria, 
  originalResults, 
  onScenarioChange 
}: ScenarioMixerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeAdjustments, setActiveAdjustments] = useState<ScenarioAdjustment[]>([])
  const [loading, setLoading] = useState(false)
  const [currentScenario, setCurrentScenario] = useState<Partial<Criteria>>({})

  // Calculate match score (simplified version - in real app this would match backend logic)
  const calculateMatchScore = (criteria: Criteria, university: University): number => {
    let score = 50 // Base score
    
    // GPA matching
    if (criteria.minGpa >= university.min_gpa) {
      score += 20
    } else {
      score -= 10
    }
    
    // Budget matching
    if (criteria.maxBudget >= university.avg_tuition_per_year) {
      score += 20
    } else {
      score -= 15
    }
    
    // Country matching
    if (criteria.country === 'Any' || criteria.country === university.country) {
      score += 10
    }
    
    // Interest matching
    const matchingInterests = criteria.interests.filter(interest => 
      university.interests.includes(interest)
    )
    score += matchingInterests.length * 5
    
    return Math.max(0, Math.min(100, score))
  }

  // Apply scenario adjustments
  const applyScenario = async () => {
    setLoading(true)
    
    try {
      const modifiedCriteria = {
        ...originalCriteria,
        ...currentScenario
      }
      
      // Simulate API call with local calculation for demo
      // In production, this would call the actual matching API
      const scoredResults = originalResults.map(uni => ({
        ...uni,
        scenarioScore: calculateMatchScore(modifiedCriteria, uni),
        originalScore: calculateMatchScore(originalCriteria, uni)
      })).sort((a, b) => b.scenarioScore - a.scenarioScore).slice(0, 20)
      
      onScenarioChange(scoredResults)
      
      // Calculate impacts
      const adjustments: ScenarioAdjustment[] = []
      
      Object.entries(currentScenario).forEach(([key, value]) => {
        if (value !== undefined && value !== originalCriteria[key as keyof Criteria]) {
          let impact: 'positive' | 'negative' | 'neutral' = 'neutral'
          let description = ''
          
          if (key === 'minGpa') {
            const diff = (value as number) - (originalCriteria.minGpa as number)
            if (diff > 0) {
              impact = 'positive'
              description = `Higher GPA may unlock more competitive universities`
            } else if (diff < 0) {
              impact = 'negative'
              description = `Lower GPA may reduce match opportunities`
            }
          } else if (key === 'maxBudget') {
            const diff = (value as number) - (originalCriteria.maxBudget as number)
            if (diff > 0) {
              impact = 'positive'
              description = `Higher budget opens more university options`
            } else if (diff < 0) {
              impact = 'negative'
              description = `Lower budget may limit available universities`
            }
          } else if (key === 'country') {
            if (value === 'Any') {
              impact = 'positive'
              description = `Expanding to all countries increases options`
            } else {
              impact = 'neutral'
              description = `Focusing on specific country`
            }
          } else if (key === 'interests') {
            const newInterests = value as string[]
            const diff = newInterests.length - originalCriteria.interests.length
            if (diff > 0) {
              impact = 'positive'
              description = `Adding interests may reveal new specializations`
            } else if (diff < 0) {
              impact = 'negative'
              description = `Removing interests may narrow options`
            }
          }
          
          adjustments.push({
            criterion: key,
            originalValue: originalCriteria[key as keyof Criteria] as number | string,
            newValue: value as number | string,
            impact,
            description
          })
        }
      })
      
      setActiveAdjustments(adjustments)
    } catch (error) {
      console.error('Error applying scenario:', error)
    } finally {
      setLoading(false)
    }
  }

  // Reset scenario
  const resetScenario = () => {
    setCurrentScenario({})
    setActiveAdjustments([])
    onScenarioChange(originalResults)
  }

  // Update scenario value
  const updateScenarioValue = (criterion: string, value: any) => {
    setCurrentScenario(prev => ({
      ...prev,
      [criterion]: value
    }))
  }

  // Get impact icon
  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'positive':
        return <TrendingUp className="w-4 h-4 text-green-400" />
      case 'negative':
        return <TrendingDown className="w-4 h-4 text-red-400" />
      default:
        return <Minus className="w-4 h-4 text-gray-400" />
    }
  }

  // Check if there are active adjustments
  const hasAdjustments = Object.keys(currentScenario).length > 0

  return (
    <div className="relative">
      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
          hasAdjustments 
            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25' 
            : 'bg-gray-800/50 text-gray-300 border border-gray-700/50 hover:bg-gray-700/50'
        }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Sliders className="w-4 h-4" />
        <span>What If Scenarios</span>
        {hasAdjustments && (
          <motion.div
            className="w-2 h-2 bg-white rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </motion.button>

      {/* Scenario Mixer Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 z-50 bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-2xl shadow-black/50 overflow-hidden"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-purple-400" />
                  <h3 className="text-lg font-bold text-white">Scenario Mixer</h3>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Info className="w-3 h-3" />
                    <span>Adjust criteria to see impact</span>
                  </div>
                </div>
                <motion.button
                  onClick={resetScenario}
                  disabled={!hasAdjustments}
                  className="flex items-center gap-2 px-3 py-1 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  whileHover={hasAdjustments ? { scale: 1.05 } : {}}
                  whileTap={hasAdjustments ? { scale: 0.95 } : {}}
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </motion.button>
              </div>

              {/* Adjustment Controls */}
              <div className="space-y-4 mb-6">
                {/* GPA Adjustment */}
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-gray-300">GPA</label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {originalCriteria.minGpa.toFixed(1)} → {(currentScenario.minGpa ?? originalCriteria.minGpa).toFixed(1)}
                      </span>
                      {(currentScenario.minGpa && currentScenario.minGpa !== originalCriteria.minGpa) && (
                        <TrendingUp className="w-3 h-3 text-green-400" />
                      )}
                    </div>
                  </div>
                  <input
                    type="range"
                    min="2.0"
                    max="4.0"
                    step="0.1"
                    value={currentScenario.minGpa ?? originalCriteria.minGpa}
                    onChange={(e) => updateScenarioValue('minGpa', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-700/50 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, var(--slider-progress-academic) 0%, var(--slider-progress-academic) ${(((currentScenario.minGpa ?? originalCriteria.minGpa) - 2.0) / 2.0) * 100}%, var(--slider-track) ${(((currentScenario.minGpa ?? originalCriteria.minGpa) - 2.0) / 2.0) * 100}%, var(--slider-track) 100%)`
                    }}
                  />
                </div>

                {/* Budget Adjustment */}
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-gray-300">Budget</label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        ${originalCriteria.maxBudget.toLocaleString()} → ${(currentScenario.maxBudget ?? originalCriteria.maxBudget).toLocaleString()}
                      </span>
                      {(currentScenario.maxBudget && currentScenario.maxBudget !== originalCriteria.maxBudget) && (
                        <TrendingUp className="w-3 h-3 text-green-400" />
                      )}
                    </div>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="80000"
                    step="1000"
                    value={currentScenario.maxBudget ?? originalCriteria.maxBudget}
                    onChange={(e) => updateScenarioValue('maxBudget', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-700/50 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, var(--slider-progress-budget) 0%, var(--slider-progress-budget) ${(((currentScenario.maxBudget ?? originalCriteria.maxBudget) - 1000) / 79000) * 100}%, var(--slider-track) ${(((currentScenario.maxBudget ?? originalCriteria.maxBudget) - 1000) / 79000) * 100}%, var(--slider-track) 100%)`
                    }}
                  />
                </div>

                {/* Country Adjustment */}
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-gray-300">Country</label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {originalCriteria.country} → {currentScenario.country ?? originalCriteria.country}
                      </span>
                      {(currentScenario.country && currentScenario.country !== originalCriteria.country) && (
                        <Minus className="w-3 h-3 text-gray-400" />
                      )}
                    </div>
                  </div>
                  <select
                    value={currentScenario.country ?? originalCriteria.country}
                    onChange={(e) => updateScenarioValue('country', e.target.value)}
                    className="w-full p-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-sm focus:border-purple-500/50 focus:outline-none"
                  >
                    <option value="Any">Any</option>
                    <option value="USA">USA</option>
                    <option value="Canada">Canada</option>
                    <option value="France">France</option>
                    <option value="UK">UK</option>
                  </select>
                </div>
              </div>

              {/* Active Adjustments Summary */}
              {activeAdjustments.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-400 mb-3">Impact Summary</h4>
                  <div className="space-y-2">
                    {activeAdjustments.map((adjustment, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-3 p-3 bg-gray-800/30 rounded-lg border border-gray-700/30"
                      >
                        {getImpactIcon(adjustment.impact)}
                        <div className="flex-1">
                          <p className="text-sm text-gray-300">{adjustment.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <motion.button
                  onClick={applyScenario}
                  disabled={!hasAdjustments || loading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-500 hover:to-pink-500 transition-all"
                  whileHover={hasAdjustments && !loading ? { scale: 1.02 } : {}}
                  whileTap={hasAdjustments && !loading ? { scale: 0.98 } : {}}
                >
                  {loading ? (
                    <motion.div
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  ) : (
                    <Zap className="w-4 h-4" />
                  )}
                  {loading ? 'Calculating...' : 'Apply Scenario'}
                </motion.button>
                
                <motion.button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-gray-700/50 text-gray-300 rounded-xl font-medium hover:bg-gray-600/50 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Close
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
