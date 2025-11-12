import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { matchingAPI, getCurrentUser } from '../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
  Compass,
  DollarSign,
  Book,
  Flag,
  CheckCircle,
  Calendar,
  Sparkles,
  MapPin,
  FileText,
  Building,
  Target,
  Zap,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import ScenarioMixer from '../components/ScenarioMixer';

// --- Data Types ---

interface University {
  id: string;
  name: string;
  country: string;
  description?: string;
  image_url?: string;
  avg_tuition_per_year: number;
  min_gpa: number;
  interests: string[];
  application_deadline: string;
  required_tests?: string[];
  program_url?: string;
  scenarioScore?: number;
  originalScore?: number;
}

interface Criteria {
  interests: string[];
  minGpa: number;
  maxBudget: number;
  country: string;
}

const allInterests = [
  'Computer Science',
  'Engineering',
  'Business',
  'Medicine',
  'Humanities',
  'Arts',
  'Physics',
  'Mathematics',
  'Biology',
  'Law',
  'Trades',
  'Nursing',
  'Liberal Arts',
];

const allCountries = ['Any', 'USA', 'Canada', 'France', 'UK'];

// --- Utility Components ---

const StepHeader = ({ icon: Icon, title, description }: { icon: any; title: string; description: string }) => (
  <div className="flex items-center gap-4 mb-6">
    <motion.div
      className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-sm text-purple-400 rounded-xl flex items-center justify-center border border-purple-500/30"
      whileHover={{ scale: 1.1, rotate: 5 }}
      transition={{ duration: 0.3 }}
    >
      <Icon className="w-6 h-6" />
    </motion.div>
    <div>
      <h2 className="text-2xl font-bold text-white">{title}</h2>
      <p className="text-gray-400">{description}</p>
    </div>
  </div>
);

const Checkbox = ({ id, label, checked, onChange }: { id: string, label: string, checked: boolean, onChange: () => void}) => (
  <motion.label
    htmlFor={id}
    onClick={onChange}
    className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all backdrop-blur-sm ${
      checked 
        ? 'bg-purple-500/20 border-purple-500/50 shadow-lg shadow-purple-500/25' 
        : 'bg-gray-800/50 border-gray-700/50 hover:border-purple-500/30 hover:bg-purple-900/10'
    }`}
    whileTap={{ scale: 0.98 }}
    whileHover={{ scale: 1.02 }}
  >
    <motion.div
      className={`w-6 h-6 rounded-md flex-shrink-0 flex items-center justify-center border-2 ${
        checked 
          ? 'bg-purple-600 border-purple-600' 
          : 'bg-gray-700/50 border-gray-600'
      }`}
      animate={checked ? { scale: [1, 1.2, 1] } : {}}
      transition={{ duration: 0.3 }}
    >
      {checked && <CheckCircle className="w-4 h-4 text-white" />}
    </motion.div>
    <span className={`font-medium ${checked ? 'text-purple-300' : 'text-gray-300'}`}>{label}</span>
  </motion.label>
);

// --- Main Component ---

export default function MatchingEnginePage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [criteria, setCriteria] = useState<Criteria>({
    interests: [],
    minGpa: 2.5,
    maxBudget: 30000,
    country: 'Any',
  });
  const [results, setResults] = useState<University[]>([]);
  const [scenarioResults, setScenarioResults] = useState<University[]>([]);
  const [isScenarioActive, setIsScenarioActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      navigate('/login');
    }
  }, [navigate]);

  const handleInterestToggle = (interest: string) => {
    setCriteria(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleCriteriaChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCriteria(prev => ({
      ...prev,
      [name]: name === 'minGpa' || name === 'maxBudget' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setResults([]);
    setScenarioResults([]);
    setIsScenarioActive(false);
    try {
      const matches = await matchingAPI.getMatches(criteria);
      setResults(matches);
      setCurrentStep(5); // Move to results step
    } catch (err: any) {
      setError(err.message || 'Failed to find matches.');
    } finally {
      setLoading(false);
    }
  };

  const handleScenarioChange = (scenarioData: University[]) => {
    setScenarioResults(scenarioData);
    setIsScenarioActive(scenarioData.length > 0);
  };

  const resetToOriginal = () => {
    setIsScenarioActive(false);
    setScenarioResults([]);
  };

  const nextStep = () => setCurrentStep(s => (s < 4 ? s + 1 : s));
  const prevStep = () => setCurrentStep(s => (s > 1 ? s - 1 : s));

  const steps = [
    // --- Step 1: Interests ---
    {
      id: 1,
      title: "What are your interests?",
      description: "Select one or more fields you're passionate about.",
      icon: Book,
      content: (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {allInterests.map(interest => (
            <Checkbox
              key={interest}
              id={interest}
              label={interest}
              checked={criteria.interests.includes(interest)}
              onChange={() => handleInterestToggle(interest)}
            />
          ))}
        </div>
      )
    },
    // --- Step 2: Academics ---
    {
      id: 2,
      title: "What are your academics?",
      description: "Provide your current Grade Point Average (GPA).",
      icon: Building,
      content: (
        <div className="space-y-6">
          <label htmlFor="minGpa" className="block text-sm font-medium text-gray-300">
            Your GPA (on a 4.0 scale)
          </label>
          <div className="flex items-center gap-6">
            <input
              type="range"
              id="minGpa"
              name="minGpa"
              min="2.0"
              max="4.0"
              step="0.1"
              value={criteria.minGpa}
              onChange={handleCriteriaChange}
              className="w-full h-3 bg-gray-700/50 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, var(--slider-progress-academic) 0%, var(--slider-progress-academic) ${((criteria.minGpa - 2.0) / 2.0) * 100}%, var(--slider-track) ${((criteria.minGpa - 2.0) / 2.0) * 100}%, var(--slider-track) 100%)`
              }}
            />
            <motion.div
              className="text-3xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent w-24 text-center"
              key={criteria.minGpa}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              {criteria.minGpa.toFixed(1)}
            </motion.div>
          </div>
        </div>
      )
    },
    // --- Step 3: Financials ---
    {
      id: 3,
      title: "What's your budget?",
      description: "What is the maximum annual tuition you can afford?",
      icon: DollarSign,
      content: (
        <div className="space-y-6">
          <label htmlFor="maxBudget" className="block text-sm font-medium text-gray-300">
            Max Annual Tuition Budget
          </label>
          <div className="flex items-center gap-6">
            <input
              type="range"
              id="maxBudget"
              name="maxBudget"
              min="1000"
              max="80000"
              step="1000"
              value={criteria.maxBudget}
              onChange={handleCriteriaChange}
              className="w-full h-3 bg-gray-700/50 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, var(--slider-progress-budget) 0%, var(--slider-progress-budget) ${((criteria.maxBudget - 1000) / 79000) * 100}%, var(--slider-track) ${((criteria.maxBudget - 1000) / 79000) * 100}%, var(--slider-track) 100%)`
              }}
            />
            <motion.div
              className="text-3xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent w-32 text-center"
              key={criteria.maxBudget}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              ${criteria.maxBudget.toLocaleString()}
            </motion.div>
          </div>
        </div>
      )
    },
    // --- Step 4: Location ---
    {
      id: 4,
      title: "Where to?",
      description: "Select your preferred country of study.",
      icon: Flag,
      content: (
        <div className="space-y-6">
          <label htmlFor="country" className="block text-sm font-medium text-gray-300">
            Preferred Country
          </label>
          <select
            id="country"
            name="country"
            value={criteria.country}
            onChange={handleCriteriaChange}
            className="w-full p-4 bg-gray-800/50 backdrop-blur-sm border-2 border-gray-700/50 rounded-xl text-lg text-white focus:border-purple-500/50 focus:ring-purple-500/50 focus:outline-none"
          >
            {allCountries.map(country => (
              <option key={country} value={country} className="bg-gray-800">{country}</option>
            ))}
          </select>
        </div>
      )
    },
  ];

  const currentStepData = steps.find(s => s.id === currentStep);
  const progressPercent = (currentStep / 4) * 100;

  return (
    <div className="relative bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] min-h-screen py-20 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full mix-blend-screen"
            style={{
              left: `${5 + (i * 35)}%`,
              top: `${10 + (i * 25)}%`,
              width: `${180 + (i * 90)}px`,
              height: `${180 + (i * 90)}px`,
              background: `radial-gradient(circle, ${['var(--ambient-color-1)', 'var(--ambient-color-2)', 'var(--ambient-color-3)', 'var(--ambient-color-4)'][i]} 0%, transparent 70%)`,
            }}
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.1, 0.25, 0.1],
            }}
            transition={{
              duration: 7 + (i * 0.5),
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5
            }}
          />
        ))}
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-3xl border border-gray-700/50 overflow-hidden"
        >
          {/* Header */}
          <div className="p-8 border-b border-gray-700/50">
            <div className="flex items-center gap-4 mb-4">
              <motion.div
                className="p-3 bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-sm rounded-2xl border border-purple-500/30"
                animate={{ 
                  boxShadow: ["0 0 20px rgba(139, 92, 246, 0.5)", "0 0 40px rgba(139, 92, 246, 0.8)", "0 0 20px rgba(139, 92, 246, 0.5)"]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Target className="w-8 h-8 text-purple-400" />
              </motion.div>
              <h1 className="text-3xl md:text-4xl font-black">
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                  University Matching Engine
                </span>
              </h1>
            </div>
            <p className="text-gray-300 text-lg">Find your perfect university and get a personalized plan.</p>
          </div>

          <AnimatePresence mode="wait">
            {/* --- Results View (Step 5) --- */}
            {currentStep === 5 ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="p-8"
              >
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Sparkles className="text-purple-400" />
                      </motion.div>
                      <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        {isScenarioActive ? 'Scenario Results' : 'Your Personalized Matches'}
                      </span>
                    </h2>
                    {isScenarioActive && (
                      <motion.button
                        onClick={resetToOriginal}
                        className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Original
                      </motion.button>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <ScenarioMixer
                      originalCriteria={criteria}
                      originalResults={results}
                      onScenarioChange={handleScenarioChange}
                    />
                    <motion.button
                      onClick={() => setCurrentStep(1)}
                      className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Zap className="w-4 h-4" />
                      Start Over
                    </motion.button>
                  </div>
                </div>

                {loading && (
                  <div className="flex justify-center items-center py-20">
                    <motion.div
                      className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-400 rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                )}

                {error && (
                  <div className="bg-red-900/20 backdrop-blur-sm border border-red-500/30 text-red-300 px-4 py-3 rounded-xl mb-6">
                    {error}
                  </div>
                )}

                {!loading && (isScenarioActive ? scenarioResults : results).length === 0 && (
                  <div className="text-center py-20">
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-12 border border-gray-700/50">
                      <Target className="w-16 h-16 text-gray-400 mx-auto mb-6" />
                      <h3 className="text-xl font-semibold text-gray-300 mb-3">
                        {isScenarioActive ? 'No matches for this scenario' : 'No matches found'}
                      </h3>
                      <p className="text-gray-500">
                        {isScenarioActive ? 'Try adjusting your scenario criteria.' : 'Try adjusting your criteria for a broader search.'}
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  {(isScenarioActive ? scenarioResults : results).map((uni, index) => (
                    <motion.div
                      key={`${uni.id}-${isScenarioActive ? 'scenario' : 'original'}`}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border rounded-2xl overflow-hidden hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 ${
                        isScenarioActive ? 'border-blue-500/30' : 'border-gray-700/50'
                      }`}
                    >
                      <div className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-bold text-white">{uni.name}</h3>
                              {isScenarioActive && uni.scenarioScore !== undefined && uni.originalScore !== undefined && (
                                <motion.div
                                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                    uni.scenarioScore > uni.originalScore 
                                      ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                                      : uni.scenarioScore < uni.originalScore
                                      ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                      : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                                  }`}
                                  initial={{ scale: 0.8 }}
                                  animate={{ scale: 1 }}
                                  transition={{ delay: index * 0.1 + 0.2 }}
                                >
                                  {uni.scenarioScore > uni.originalScore ? (
                                    <TrendingUp className="w-3 h-3" />
                                  ) : uni.scenarioScore < uni.originalScore ? (
                                    <TrendingDown className="w-3 h-3" />
                                  ) : (
                                    <Minus className="w-3 h-3" />
                                  )}
                                  {uni.scenarioScore > uni.originalScore ? '+' : ''}{uni.scenarioScore - uni.originalScore}%
                                </motion.div>
                              )}
                            </div>
                            <p className="flex items-center gap-2 text-gray-400 font-medium">
                              <MapPin className="w-4 h-4 text-purple-400" /> {uni.country}
                            </p>
                          </div>
                          <div className="text-right">
                            <motion.div 
                              className="text-2xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent"
                              initial={{ scale: 0.8 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: index * 0.1 + 0.2 }}
                            >
                              ${uni.avg_tuition_per_year.toLocaleString()}
                              <span className="text-sm font-normal text-gray-500">/year</span>
                            </motion.div>
                            {isScenarioActive && uni.scenarioScore !== undefined && (
                              <motion.div
                                className="text-sm text-gray-400 mt-1"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.1 + 0.3 }}
                              >
                                Match Score: {uni.scenarioScore}%
                              </motion.div>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-gray-400 mt-4 leading-relaxed">{uni.description}</p>
                        
                        <div className="flex flex-wrap gap-2 mt-4">
                          {uni.interests.map(interest => (
                            <motion.span 
                              key={interest} 
                              className="text-xs font-medium bg-purple-500/20 backdrop-blur-sm text-purple-300 px-3 py-1 rounded-full border border-purple-500/30"
                              whileHover={{ scale: 1.05 }}
                              transition={{ duration: 0.2 }}
                            >
                              {interest}
                            </motion.span>
                          ))}
                        </div>
                      </div>

                      {/* --- Roadmap --- */}
                      <div className="bg-gray-800/50 backdrop-blur-sm px-6 py-4 border-t border-gray-700/50">
                        <h4 className="text-sm font-semibold text-gray-300 uppercase mb-3">Your Roadmap</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-red-400" />
                            <div>
                              <p className="text-xs text-gray-500">Apply By</p>
                              <p className="font-medium text-gray-300">
                                {uni.application_deadline ? new Date(uni.application_deadline).toLocaleDateString() : 'N/A'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-blue-400" />
                            <div>
                              <p className="text-xs text-gray-500">Tests</p>
                              <p className="font-medium text-gray-300">
                                {uni.required_tests?.join(', ') || 'Check Website'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Link 
                              to={uni.program_url || '#'} 
                              target="_blank" 
                              className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
                            >
                              <Compass className="w-4 h-4" />
                              <span className="font-medium">Visit Program Page</span>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : (
              // --- Form Steps (1-4) ---
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="p-8"
              >
                {/* Progress Bar */}
                <div className="mb-8">
                  <div className="flex justify-between text-sm font-medium text-gray-400 mb-3">
                    <span>Step {currentStep} of 4</span>
                    <span>{Math.round(progressPercent)}% Complete</span>
                  </div>
                  <div className="w-full bg-gray-700/50 rounded-full h-3">
                    <motion.div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 0.5, ease: 'easeInOut' }}
                    />
                  </div>
                </div>

                {/* Step Content */}
                {currentStepData && (
                  <>
                    <StepHeader
                      icon={currentStepData.icon}
                      title={currentStepData.title}
                      description={currentStepData.description}
                    />
                    <div className="mt-6">
                      {currentStepData.content}
                    </div>
                  </>
                )}

                {/* Navigation */}
                <div className="flex justify-between items-center mt-10 pt-6 border-t border-gray-700/50">
                  <motion.button
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl text-gray-300 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: currentStep > 1 ? 1.05 : 1 }}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </motion.button>

                  {currentStep < 4 ? (
                    <motion.button
                      onClick={nextStep}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-lg shadow-purple-500/30 border border-purple-500/30"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Next
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  ) : (
                    <motion.button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 shadow-lg shadow-green-500/30 border border-green-500/30"
                      whileHover={{ scale: loading ? 1 : 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {loading ? (
                        <motion.div
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      Find Matches
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
