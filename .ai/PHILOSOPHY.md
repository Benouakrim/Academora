# 🏛️ Code Philosophy - AcademOra

**Last Updated**: 2025-11-10  
**Status**: Living Document

---

## 🎯 Core Philosophy

> "Consistency over cleverness. Clarity over brevity. Reusability over repetition."

AcademOra follows a **component-driven, design-system-first** architecture built on React, TypeScript, and Tailwind CSS. Every decision prioritizes **maintainability**, **scalability**, and **developer experience**.

---

## 📐 Architectural Principles

### 1. Component-Driven Development
**Principle**: Build UI as composable, reusable components

**Rules**:
- Components are the atomic units of UI
- Extract repeated patterns into components (3+ uses = component)
- Components should be single-responsibility
- Prefer composition over inheritance

**Example**:
```tsx
// ✅ GOOD - Reusable, composable
<AnimatedBackground colors={['#8b5cf6']} orbCount={4} />

// ❌ BAD - Repeated inline implementation
<div style={{ background: 'radial-gradient...' }} />
```

### 2. Design System First
**Principle**: All styling through centralized design tokens

**Rules**:
- NO inline styles (see DESIGN_SYSTEM.md for exceptions)
- Use Tailwind utilities first
- Use design system components second
- Create new components for complex patterns
- All colors/spacing from `src/styles/tokens/`

**Example**:
```tsx
// ✅ GOOD - Design system
<ProgressBar value={75} variant="success" />

// ❌ BAD - Inline styles
<div style={{ width: '75%' }} className="bg-green-500" />
```

### 3. Convention Over Configuration
**Principle**: Follow established patterns, don't reinvent

**Rules**:
- Use existing patterns from ARCHITECTURE.md
- Maintain naming conventions (see below)
- Follow file structure conventions
- Replicate existing successful patterns

### 4. Explicit Over Implicit
**Principle**: Code should be self-documenting

**Rules**:
- Clear, descriptive names (no abbreviations)
- TypeScript types for everything
- JSDoc comments for public APIs
- Explicit imports (no wildcards except icons)

**Example**:
```tsx
// ✅ GOOD - Clear and explicit
interface ProgressBarProps {
  /** Progress value as percentage (0-100) */
  value: number
  /** Color variant for the bar */
  variant?: 'primary' | 'success'
}

// ❌ BAD - Unclear and implicit
interface Props {
  val: number
  type?: string
}
```

### 5. Separation of Concerns
**Principle**: Each file/function has one clear purpose

**Structure**:
- **Pages**: Route components, orchestration only
- **Components**: Reusable UI, no business logic
- **Hooks**: Stateful logic, reusable
- **Services**: API calls, data transformations
- **Context**: Global state management
- **Utils**: Pure helper functions

---

## 📛 Naming Conventions

### Files and Folders

#### Pages (src/pages/)
```
Pattern: PascalCase + "Page" suffix
Examples:
  ✅ HomePage.tsx
  ✅ UniversityDetailPage.tsx
  ✅ MatchingEnginePage.tsx
  
  ❌ home.tsx
  ❌ University.tsx
  ❌ matching-engine-page.tsx
```

#### Components (src/components/)
```
Pattern: PascalCase, descriptive noun
Examples:
  ✅ AnimatedBackground.tsx
  ✅ ProgressBar.tsx
  ✅ UniversityCard.tsx
  ✅ SaveButton.tsx
  
  ❌ animated-background.tsx
  ❌ progress.tsx
  ❌ Card.tsx (too generic)
```

#### Hooks (src/hooks/)
```
Pattern: camelCase, "use" prefix
Examples:
  ✅ useAuth.ts
  ✅ useUniversityData.ts
  ✅ useDebounce.ts
  
  ❌ Auth.ts
  ❌ university-data.ts
  ❌ UseDebounce.ts
```

#### Services (src/lib/services/)
```
Pattern: PascalCase + "Service" suffix
Examples:
  ✅ universitiesService.ts
  ✅ BlogService.ts
  ✅ AuthService.ts
  
  ❌ universities.ts
  ❌ blog-service.ts
```

#### Utilities (src/lib/)
```
Pattern: camelCase, descriptive verb/noun
Examples:
  ✅ formatters.ts
  ✅ validators.ts
  ✅ dateHelpers.ts
  
  ❌ utils.ts (too generic)
  ❌ helpers.ts (too vague)
```

#### API Routes (server/routes/)
```
Pattern: camelCase + "Routes" suffix
Examples:
  ✅ universitiesRoutes.js
  ✅ articlesRoutes.js
  ✅ authRoutes.js
  
  ❌ universities.js
  ❌ articles-routes.js
```

### Variables and Functions

#### React Components
```tsx
// PascalCase for component names
export default function ProgressBar() { }
export function AnimatedBackground() { }

// camelCase for props
interface ProgressBarProps {
  value: number
  showLabel: boolean
}
```

#### Hooks
```tsx
// camelCase with "use" prefix
export function useAuth() { }
export function useDebounce(value, delay) { }
```

#### Functions
```tsx
// camelCase, descriptive verb + noun
function fetchUniversities() { }
function handleSubmit() { }
function validateEmail() { }

// ❌ BAD
function get() { }
function submit() { }
function check() { }
```

#### Constants
```tsx
// SCREAMING_SNAKE_CASE for true constants
const API_BASE_URL = 'https://api.example.com'
const MAX_RETRY_ATTEMPTS = 3

// camelCase for configuration objects
const apiConfig = { timeout: 5000 }
```

#### Boolean Variables
```tsx
// Use "is", "has", "should" prefixes
const isLoading = true
const hasAccess = false
const shouldRender = true

// ❌ BAD
const loading = true
const access = false
const render = true
```

### CSS Classes (Tailwind)

```tsx
// Tailwind utilities, ordered logically:
// 1. Layout (flex, grid, block)
// 2. Positioning (relative, absolute)
// 3. Sizing (w-, h-, max-, min-)
// 4. Spacing (m-, p-)
// 5. Typography (text-, font-)
// 6. Colors (bg-, text-, border-)
// 7. Effects (shadow-, opacity-, transition-)

// ✅ GOOD - Logical order
<div className="flex items-center justify-between w-full p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">

// ❌ BAD - Random order
<div className="shadow-md hover:shadow-lg bg-white transition-shadow p-4 rounded-lg flex w-full items-center justify-between">
```

---

## 📁 File Structure Conventions

### Project Root
```
academora/
├── .ai/                    # AI documentation (this system)
├── src/                    # Frontend source code
├── server/                 # Backend API
├── docs/                   # Feature documentation
├── public/                 # Static assets
├── scripts/                # Database scripts
└── [config files]          # vite.config.ts, tailwind.config.js, etc.
```

### Source Directory (src/)
```
src/
├── components/            # Reusable UI components
│   ├── AnimatedBackground.tsx
│   ├── ProgressBar.tsx
│   └── [ComponentName].tsx
│
├── pages/                 # Route pages
│   ├── HomePage.tsx
│   ├── UniversityDetailPage.tsx
│   └── [PageName]Page.tsx
│
├── hooks/                 # Custom React hooks
│   ├── useAuth.ts
│   └── use[HookName].ts
│
├── lib/                   # Libraries and utilities
│   ├── api.ts            # API client
│   ├── services/         # Service layer
│   │   ├── universitiesService.ts
│   │   └── [name]Service.ts
│   └── [utilities].ts
│
├── context/              # React contexts
│   ├── AuthContext.tsx
│   └── [Context]Context.tsx
│
├── styles/               # Design system
│   └── tokens/          # Design tokens
│       ├── colors.css
│       ├── spacing.css
│       └── [token].css
│
├── types/                # TypeScript definitions
│   └── [domain].d.ts
│
├── App.tsx              # Root app component
├── main.tsx             # Entry point
└── index.css            # Global styles
```

### Server Directory (server/)
```
server/
├── routes/               # Express routes
│   ├── universitiesRoutes.js
│   └── [resource]Routes.js
│
├── services/            # Business logic
│   └── [service].js
│
├── middleware/          # Express middleware
│   ├── auth.js
│   └── [middleware].js
│
├── validation/          # Input validation
│   └── [validator].js
│
├── data/                # Data access layer
│   └── [resource].js
│
├── database/            # Database scripts
│   └── [migration].sql
│
├── app.js               # Express app setup
└── index.js             # Server entry point
```

---

## 🎨 Component Structure

### Standard Component Template
```tsx
// 1. Imports (grouped logically)
import { useState } from 'react'              // React
import { motion } from 'framer-motion'        // Third-party
import { ChevronRight } from 'lucide-react'   // Icons
import Button from './Button'                 // Local components

// 2. Types/Interfaces
interface MyComponentProps {
  /** Clear description of what this prop does */
  title: string
  /** Optional prop with default value described */
  variant?: 'primary' | 'secondary'
  /** Callback description with parameter details */
  onSubmit?: (data: FormData) => void
  /** Additional CSS classes */
  className?: string
}

// 3. JSDoc comment
/**
 * MyComponent - Brief one-line description
 * 
 * Longer description of what this component does, when to use it,
 * and any important behavioral notes.
 * 
 * @example
 * <MyComponent 
 *   title="Hello" 
 *   variant="primary"
 *   onSubmit={handleSubmit}
 * />
 */

// 4. Component definition
export default function MyComponent({
  title,
  variant = 'primary',
  onSubmit,
  className = ''
}: MyComponentProps) {
  // 5. Hooks (ordered: state, effects, refs, custom)
  const [isOpen, setIsOpen] = useState(false)
  
  // 6. Derived state / computed values
  const buttonClass = `btn-${variant}`
  
  // 7. Event handlers
  const handleClick = () => {
    setIsOpen(!isOpen)
    onSubmit?.()
  }
  
  // 8. Early returns
  if (!title) {
    return null
  }
  
  // 9. Main render
  return (
    <div className={`component-wrapper ${className}`}>
      <h2>{title}</h2>
      <button onClick={handleClick}>
        Toggle
      </button>
    </div>
  )
}

// 10. Sub-components (if tightly coupled)
function SubComponent() {
  return <div>Internal component</div>
}
```

### Page Component Template
```tsx
// Pages are orchestrators - minimal logic, mostly composition

import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import SEO from '../components/SEO'
import AnimatedBackground from '../components/AnimatedBackground'
import { universitiesService } from '../lib/services/universitiesService'

export default function UniversityDetailPage() {
  // 1. Route params
  const { id } = useParams()
  
  // 2. State
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // 3. Data fetching
  useEffect(() => {
    async function fetchData() {
      const result = await universitiesService.getById(id)
      setData(result)
      setLoading(false)
    }
    fetchData()
  }, [id])
  
  // 4. Loading state
  if (loading) return <LoadingSpinner />
  
  // 5. Layout composition
  return (
    <div className="page-container">
      <SEO title={data.name} />
      <AnimatedBackground />
      
      <div className="content">
        {/* Compose from components */}
        <UniversityHeader data={data} />
        <UniversityStats data={data} />
        <UniversityReviews universityId={id} />
      </div>
    </div>
  )
}
```

---

## 🔧 Service Layer Pattern

### Service Structure
```typescript
// src/lib/services/universitiesService.ts

/**
 * Universities Service
 * 
 * Handles all university-related data operations.
 * Centralizes API calls and data transformations.
 */

import { supabase } from '../supabaseClient'

export const UniversitiesService = {
  /**
   * Get all universities with optional filtering
   */
  async getAll(filters = {}) {
    try {
      let query = supabase.from('universities').select('*')
      
      if (filters.country) {
        query = query.eq('country', filters.country)
      }
      
      const { data, error } = await query
      if (error) throw error
      
      return data
    } catch (error) {
      console.error('Error fetching universities:', error)
      throw error
    }
  },
  
  /**
   * Get university by ID
   */
  async getById(id: string) {
    // Implementation
  },
  
  /**
   * Create new university
   */
  async create(universityData: UniversityInput) {
    // Implementation
  }
}

// Export as singleton
export default UniversitiesService
```

---

## 🎣 Custom Hooks Pattern

### Hook Structure
```typescript
// src/hooks/useUniversityData.ts

import { useState, useEffect } from 'react'
import { UniversitiesService } from '../lib/services/universitiesService'

interface UseUniversityDataOptions {
  filters?: Record<string, any>
  enabled?: boolean
}

/**
 * useUniversityData - Fetch and manage university data
 * 
 * @param options - Configuration options
 * @returns University data, loading state, error, and refetch function
 * 
 * @example
 * const { data, loading, error, refetch } = useUniversityData({
 *   filters: { country: 'USA' }
 * })
 */
export function useUniversityData(options: UseUniversityDataOptions = {}) {
  const { filters = {}, enabled = true } = options
  
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  async function fetchData() {
    if (!enabled) return
    
    try {
      setLoading(true)
      const result = await UniversitiesService.getAll(filters)
      setData(result)
      setError(null)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    fetchData()
  }, [JSON.stringify(filters), enabled])
  
  return {
    data,
    loading,
    error,
    refetch: fetchData
  }
}
```

---

## 🎯 State Management Strategy

### Local State (useState)
**Use for**: Component-specific UI state
```tsx
const [isOpen, setIsOpen] = useState(false)
const [inputValue, setInputValue] = useState('')
```

### Context (React Context)
**Use for**: Cross-cutting concerns (auth, theme)
```tsx
// src/context/AuthContext.tsx
const AuthContext = createContext<AuthContextType>(null)

export function useAuth() {
  return useContext(AuthContext)
}
```

### URL State (useSearchParams)
**Use for**: Filterable/shareable state
```tsx
const [searchParams, setSearchParams] = useSearchParams()
const category = searchParams.get('category')
```

---

## 📝 TypeScript Conventions

### Type vs Interface
```typescript
// Use INTERFACE for objects that can be extended
interface University {
  id: string
  name: string
}

interface DetailedUniversity extends University {
  description: string
}

// Use TYPE for unions, primitives, utilities
type Status = 'active' | 'inactive' | 'pending'
type Optional<T> = T | null
```

### Prop Types
```typescript
// Always define prop types, even if empty
interface MyComponentProps {
  // Props here
}

// Mark optional props with ?
interface ButtonProps {
  label: string           // Required
  variant?: 'primary'     // Optional
  onClick?: () => void    // Optional callback
}
```

---

## 🧪 Error Handling

### Try-Catch Pattern
```typescript
try {
  const data = await fetchData()
  return data
} catch (error) {
  console.error('Descriptive error message:', error)
  // Handle error appropriately
  throw error // or return fallback
}
```

### User-Facing Errors
```typescript
try {
  await submitForm(data)
  toast.success('Form submitted successfully')
} catch (error) {
  toast.error('Failed to submit form. Please try again.')
  console.error(error) // Log for debugging
}
```

---

## 📚 Import Order

```typescript
// 1. React imports
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

// 2. Third-party libraries
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'

// 3. Icons (can use wildcard for lucide-react)
import { ChevronRight, Plus, X } from 'lucide-react'

// 4. Local components
import Button from '../components/Button'
import Card from '../components/Card'

// 5. Hooks
import { useAuth } from '../hooks/useAuth'

// 6. Services/utilities
import { universitiesService } from '../lib/services/universitiesService'

// 7. Types
import type { University } from '../types/university'

// 8. Styles (if any)
import './styles.css'
```

---

## ✅ Code Quality Checklist

Before committing code, verify:

**Naming**:
- [ ] Files follow naming conventions
- [ ] Variables/functions are descriptive
- [ ] No abbreviations or unclear names

**Structure**:
- [ ] Component follows template structure
- [ ] Imports are ordered correctly
- [ ] Types are defined for all props
- [ ] Early returns for loading/error states

**Styling**:
- [ ] NO inline styles (check DESIGN_SYSTEM.md exceptions)
- [ ] Using Tailwind utilities or design components
- [ ] Following design token system

**Reusability**:
- [ ] Checked FILE_REGISTRY.md for existing functionality
- [ ] Not duplicating existing components/functions
- [ ] Extracted repeated patterns

**Documentation**:
- [ ] JSDoc comments for public APIs
- [ ] Clear prop descriptions
- [ ] Usage examples where helpful

**Testing**:
- [ ] Component renders without errors
- [ ] Interactive elements work
- [ ] Edge cases handled

---

## 🚫 Anti-Patterns to Avoid

### ❌ Inline Styles
```tsx
// NEVER do this
<div style={{ width: '100%', padding: '1rem' }}>
```

### ❌ Generic Names
```tsx
// BAD
const data = fetchData()
function handle() { }
const temp = value

// GOOD
const universities = fetchUniversities()
function handleSubmit() { }
const previousValue = value
```

### ❌ Massive Components
```tsx
// If component is > 300 lines, break it down
// Extract sub-components
// Move logic to hooks
// Split into multiple files if needed
```

### ❌ Business Logic in Components
```tsx
// BAD - API call directly in component
function MyComponent() {
  useEffect(() => {
    fetch('/api/universities').then(...)
  }, [])
}

// GOOD - Use service layer
function MyComponent() {
  const { data } = useUniversityData()
}
```

### ❌ Prop Drilling
```tsx
// If passing props through 3+ levels, use Context or composition
```

---

## 🎓 Learning the Patterns

### Study These Files
1. `src/components/AnimatedBackground.tsx` - Component structure
2. `src/components/ProgressBar.tsx` - Props and variants
3. `src/pages/UniversityDetailPage.tsx` - Page composition
4. `src/hooks/useAuth.ts` - Custom hook pattern
5. `src/lib/services/universitiesService.ts` - Service layer

### Before Creating New Code
1. Search codebase for similar functionality
2. Check COMPONENTS_LIBRARY.md for reusable components
3. Check ARCHITECTURE.md for structural patterns
4. Replicate successful patterns

---

## 📖 Related Documentation

- [Design System](./DESIGN_SYSTEM.md) - Styling architecture
- [Architecture Guide](./ARCHITECTURE.md) - Structural patterns
- [Components Library](./COMPONENTS_LIBRARY.md) - Available components
- [File Registry](./FILE_REGISTRY.md) - Complete file inventory

---

**Remember**: Consistency is more valuable than perfection. Follow these conventions religiously, and the codebase remains maintainable, scalable, and a joy to work with.
