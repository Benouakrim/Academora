# 🏗️ Architecture - AcademOra

**Last Updated**: 2025-11-10  
**Purpose**: System design patterns, architectural decisions, and code organization

> **For AI Agents**: Understand the WHY behind the structure before making changes

---

## 📐 Architectural Principles

### 1. **Separation of Concerns**
- UI Components are presentation-only
- Business logic lives in services
- Data access is isolated in data layer
- State management via Context API

### 2. **Component-Driven Development**
- Reusable components in `src/components/`
- Pages compose components
- Shared UI patterns extracted to components
- **Recent**: AnimatedBackground, ProgressBar extracted to eliminate inline styles

### 3. **Type Safety First**
- TypeScript everywhere
- Strict mode enabled
- Interfaces defined in `src/types/`
- Zod for runtime validation

### 4. **Design System Consistency**
- NO inline styles (see DESIGN_SYSTEM.md)
- Tailwind utilities for all styling
- Design tokens in `src/styles/tokens/`
- Custom components for complex patterns

### 5. **Performance by Default**
- Code splitting via React Router
- Lazy loading for routes
- Image optimization
- Debounced search inputs

---

## 🗂️ Project Structure

```
academora/
│
├── 📱 FRONTEND (src/)
│   ├── pages/              # Route components (44+ pages)
│   ├── components/         # Reusable UI components (50+)
│   ├── hooks/              # Custom React hooks
│   ├── context/            # Global state (Auth, AccessControl)
│   ├── lib/                # Services, utilities, API clients
│   ├── styles/             # Design tokens, global styles
│   ├── types/              # TypeScript definitions
│   ├── i18n/               # Internationalization
│   └── devtools/           # Development utilities
│
├── 🔧 BACKEND (server/)
│   ├── routes/             # Express route handlers
│   ├── services/           # Business logic layer
│   ├── data/               # Database access layer
│   ├── middleware/         # Express middleware
│   ├── validation/         # Input validation schemas
│   └── database/           # SQL scripts, migrations
│
├── 📚 DOCUMENTATION
│   ├── .ai/                # AI agent documentation (THIS SYSTEM)
│   ├── docs/               # Feature documentation
│   └── *.md                # Root documentation files
│
├── 🌐 PUBLIC ASSETS (public/)
│   └── uploads/            # User-uploaded files
│
└── ⚙️ CONFIG FILES (root)
    ├── vite.config.ts      # Vite build configuration
    ├── tailwind.config.js  # Tailwind CSS configuration
    ├── tsconfig.json       # TypeScript configuration
    └── package.json        # Dependencies and scripts
```

---

## 🎨 Frontend Architecture

### Component Hierarchy

```
App.tsx
├── Layout.tsx
│   ├── Navbar.tsx
│   ├── <Page Component>
│   │   ├── Feature Components
│   │   │   ├── UI Components
│   │   │   └── System Components (AnimatedBackground, ProgressBar)
│   │   └── Form Components
│   └── Footer.tsx
└── ErrorBoundary.tsx
```

### Component Categories

#### 1. **Pages** (`src/pages/`)
- **Purpose**: Route-level components
- **Naming**: `{Feature}Page.tsx` (e.g., `HomePage.tsx`)
- **Responsibilities**:
  - Fetch data via services
  - Compose feature components
  - Handle page-level state
  - Define SEO metadata

**Example Structure:**
```typescript
export default function UniversityDetailPage() {
  // 1. Data fetching
  const { id } = useParams();
  const [university, setUniversity] = useState(null);
  
  // 2. Effects
  useEffect(() => {
    loadUniversity();
  }, [id]);
  
  // 3. Render
  return (
    <>
      <SEO title={university.name} />
      <AnimatedBackground />
      <UniversityHeader university={university} />
      <UniversityStats stats={university.stats} />
      <FinancialAidPredictor universityId={id} />
    </>
  );
}
```

#### 2. **Feature Components** (`src/components/`)
- **Purpose**: Complex, feature-specific functionality
- **Naming**: `{Feature}{Component}.tsx`
- **Examples**: `FinancialAidPredictor.tsx`, `ComparisonCharts.tsx`
- **Characteristics**:
  - Self-contained functionality
  - Manage internal state
  - Call services if needed
  - Compose UI components

#### 3. **UI Components** (`src/components/`)
- **Purpose**: Pure presentation, reusable
- **Naming**: `{Component}.tsx`
- **Examples**: `ProgressBar.tsx`, `SaveButton.tsx`
- **Characteristics**:
  - Props-driven
  - No business logic
  - No API calls
  - Fully typed props

**Example:**
```typescript
interface ProgressBarProps {
  value: number;
  variant?: 'primary' | 'success' | 'danger';
  label?: string;
}

export default function ProgressBar({ 
  value, 
  variant = 'primary', 
  label 
}: ProgressBarProps) {
  return (
    <div className="w-full">
      {label && <span>{label}</span>}
      <div className="progress-bar">
        <div 
          className={`progress-fill-${variant}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
```

#### 4. **Layout Components**
- **Purpose**: Structural wrapping
- **Examples**: `Layout.tsx`, `Navbar.tsx`, `Footer.tsx`
- **Characteristics**:
  - Define page structure
  - Consistent across pages
  - Handle global UI state

#### 5. **System Components**
- **Purpose**: Cross-cutting concerns
- **Examples**: `ErrorBoundary.tsx`, `SEO.tsx`
- **Characteristics**:
  - Enhance functionality
  - Wrap other components
  - Provide infrastructure

### State Management Pattern

#### **Local State** (useState)
```typescript
// Use for: Component-specific UI state
const [isOpen, setIsOpen] = useState(false);
const [formData, setFormData] = useState({});
```

#### **Context API** (React Context)
```typescript
// Use for: Global app state
// Examples: Auth, Access Control, Theme

// Definition (AuthContext.tsx)
export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Usage (any component)
const { user, login } = useContext(AuthContext);
```

#### **Custom Hooks** (Encapsulate logic)
```typescript
// Use for: Reusable stateful logic
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
```

### Data Fetching Pattern

**Services Layer** (`src/lib/services/`)
```typescript
// universitiesService.ts
export const universitiesService = {
  async getAll(filters?: UniversityFilters) {
    const { data, error } = await supabase
      .from('universities')
      .select('*')
      .match(filters);
    
    if (error) throw error;
    return data;
  },
  
  async getById(id: string) {
    // ...
  }
};
```

**Usage in Components:**
```typescript
// UniversityDetailPage.tsx
useEffect(() => {
  async function loadUniversity() {
    try {
      setLoading(true);
      const data = await universitiesService.getById(id);
      setUniversity(data);
    } catch (error) {
      toast.error('Failed to load university');
    } finally {
      setLoading(false);
    }
  }
  
  loadUniversity();
}, [id]);
```

### Routing Architecture

**Main Router** (`App.tsx`)
```typescript
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AccessControlProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Layout><HomePage /></Layout>} />
            <Route path="/explore" element={<Layout><ExplorePage /></Layout>} />
            
            {/* Protected routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Layout><DashboardPage /></Layout>
                </ProtectedRoute>
              } 
            />
            
            {/* Admin routes */}
            <Route 
              path="/admin/*" 
              element={
                <AdminRoute>
                  <AdminLayout><Outlet /></AdminLayout>
                </AdminRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="universities" element={<AdminUniversitiesPage />} />
              {/* More admin routes */}
            </Route>
          </Routes>
        </AccessControlProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
```

---

## 🔧 Backend Architecture

### Three-Layer Architecture

```
CLIENT REQUEST
      ↓
[1. ROUTES LAYER]      # Express route handlers
      ↓
[2. SERVICES LAYER]    # Business logic
      ↓
[3. DATA LAYER]        # Database operations
      ↓
DATABASE (Supabase)
```

### 1. Routes Layer (`server/routes/`)

**Purpose**: Handle HTTP requests, validate input, call services

```javascript
// universitiesRoutes.js
const express = require('express');
const router = express.Router();
const universitiesService = require('../services/universitiesService');
const { validateUniversity } = require('../validation/universitySchema');

router.get('/', async (req, res) => {
  try {
    const universities = await universitiesService.getAll(req.query);
    res.json(universities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', validateUniversity, async (req, res) => {
  try {
    const university = await universitiesService.create(req.body);
    res.status(201).json(university);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
```

### 2. Services Layer (`server/services/`)

**Purpose**: Business logic, orchestration, error handling

```javascript
// universitiesService.js
const universitiesData = require('../data/universities');
const emailService = require('./emailService');

module.exports = {
  async create(universityData) {
    // Business logic
    if (!universityData.verified) {
      universityData.status = 'pending';
    }
    
    // Create university
    const university = await universitiesData.create(universityData);
    
    // Send notification
    await emailService.sendNewUniversityNotification(university);
    
    return university;
  },
  
  async getAll(filters) {
    return universitiesData.findAll(filters);
  }
};
```

### 3. Data Layer (`server/data/`)

**Purpose**: Database operations, raw queries

```javascript
// universities.js
const { supabase } = require('../lib/supabaseClient');

module.exports = {
  async findAll(filters = {}) {
    let query = supabase.from('universities').select('*');
    
    if (filters.state) {
      query = query.eq('state', filters.state);
    }
    
    if (filters.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    return data;
  },
  
  async create(universityData) {
    const { data, error } = await supabase
      .from('universities')
      .insert([universityData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};
```

### Middleware Pattern

**Applied in order:**

1. **Security** (helmet, cors)
2. **Logging** (morgan)
3. **Body Parsing** (express.json)
4. **Rate Limiting** (express-rate-limit)
5. **Authentication** (custom middleware)
6. **Authorization** (custom middleware)
7. **Validation** (Zod schemas)

**Example:**
```javascript
// server/middleware/auth.js
async function requireAuth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error) throw error;
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}
```

---

## 🗄️ Database Architecture

### Supabase + PostgreSQL

#### **Connection Pattern**
```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

#### **Security: Row Level Security (RLS)**

Policies defined for each table:
- `users` - Users can read/update own profile
- `articles` - Public read, admin write
- `reviews` - Authenticated users can create, own reviews editable
- `saved_items` - Users can CRUD own saved items

**Example Policy:**
```sql
-- Users can only view their own saved items
CREATE POLICY "Users can view own saved items"
ON saved_items FOR SELECT
USING (auth.uid() = user_id);
```

#### **Real-time Subscriptions** (Future)
```typescript
// Example: Real-time comments
supabase
  .channel('comments')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'article_comments' },
    (payload) => {
      setComments(prev => [...prev, payload.new]);
    }
  )
  .subscribe();
```

---

## 🎯 Design Patterns

### 1. **Composition Over Inheritance**
```typescript
// ❌ Avoid: Class-based inheritance
class BaseCard extends React.Component { }
class UniversityCard extends BaseCard { }

// ✅ Prefer: Functional composition
function Card({ children, variant }) { }
function UniversityCard({ university }) {
  return <Card variant="university">{/* content */}</Card>;
}
```

### 2. **Render Props / Children Pattern**
```typescript
function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;
  return <div className="modal">{children}</div>;
}

// Usage
<Modal isOpen={isOpen} onClose={closeModal}>
  <ModalContent />
</Modal>
```

### 3. **Custom Hooks for Logic Reuse**
```typescript
// useDebounce.ts
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  
  return debouncedValue;
}

// Usage
const debouncedSearch = useDebounce(searchTerm, 500);
```

### 4. **Service Pattern for API Calls**
```typescript
// Always use services, never direct API calls in components
// ❌ Avoid:
const response = await fetch('/api/universities');

// ✅ Prefer:
const universities = await universitiesService.getAll();
```

### 5. **Error Boundary Pattern**
```typescript
<ErrorBoundary fallback={<ErrorPage />}>
  <App />
</ErrorBoundary>
```

---

## 🔐 Security Architecture

### Authentication Flow

```
1. User enters credentials
2. Frontend calls AuthService.login()
3. AuthService calls Supabase Auth
4. Supabase returns JWT token + user
5. Token stored in session
6. AuthContext updated with user
7. Protected routes check AuthContext
8. Token sent in Authorization header for API calls
```

### Authorization Layers

1. **Route Level** (Protected routes)
2. **API Level** (Middleware checks)
3. **Database Level** (RLS policies)

### Access Control

```typescript
// AccessControlContext.tsx
export function AccessControlProvider({ children }) {
  const { user } = useAuth();
  
  const canAccess = (resource: string, action: string) => {
    // Role-based access control logic
    return hasPermission(user.role, resource, action);
  };
  
  return (
    <AccessControlContext.Provider value={{ canAccess }}>
      {children}
    </AccessControlContext.Provider>
  );
}
```

---

## 🚀 Performance Architecture

### Code Splitting
```typescript
// Lazy load routes
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));

<Suspense fallback={<LoadingSpinner />}>
  <AdminDashboard />
</Suspense>
```

### Memoization
```typescript
// Expensive calculations
const expensiveValue = useMemo(() => {
  return complexCalculation(data);
}, [data]);

// Prevent re-renders
const MemoizedComponent = memo(ExpensiveComponent);
```

### Image Optimization
- WebP format preferred
- Lazy loading with `loading="lazy"`
- Responsive images via Tailwind
- CDN delivery via Supabase Storage

---

## 📊 Error Handling Architecture

### Frontend
```typescript
// 1. Component-level
try {
  await action();
} catch (error) {
  toast.error(error.message);
}

// 2. Page-level
<ErrorBoundary>
  <Page />
</ErrorBoundary>

// 3. Global error handling (future)
window.onerror = (message, source, lineno, colno, error) => {
  // Send to error tracking service
};
```

### Backend
```javascript
// 1. Route-level try-catch
router.get('/', async (req, res) => {
  try {
    const data = await service.getData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});
```

---

## 🔄 Data Flow Diagram

```
USER INTERACTION
       ↓
[React Component]
       ↓
[Custom Hook] (optional)
       ↓
[Service Layer]
       ↓
[Supabase Client]
       ↓
[PostgreSQL Database]
       ↓
[Response flows back up]
       ↓
[Component updates state]
       ↓
[UI re-renders]
```

---

## 📝 Architectural Decisions Record (ADR)

### ADR-001: Tailwind CSS + Design Tokens
**Decision**: Use Tailwind CSS with custom design tokens, NO inline styles  
**Rationale**: Consistency, maintainability, design system enforcement  
**Status**: ✅ Implemented (2025-11-10)

### ADR-002: Context API for State
**Decision**: Use React Context API instead of Redux  
**Rationale**: Simpler, less boilerplate, sufficient for app size  
**Status**: ✅ Implemented

### ADR-003: Supabase for Backend
**Decision**: Use Supabase (PostgreSQL + Auth + Storage)  
**Rationale**: Rapid development, built-in auth, real-time capabilities  
**Status**: ✅ Implemented

### ADR-004: Three-Layer Backend
**Decision**: Routes → Services → Data separation  
**Rationale**: Clear separation of concerns, testable, maintainable  
**Status**: ✅ Implemented

### ADR-005: TypeScript Everywhere
**Decision**: Use TypeScript for all new code  
**Rationale**: Type safety, better IDE support, catch errors early  
**Status**: ✅ Implemented

---

## 🎓 Best Practices Summary

1. **Components**: Keep them small, single-responsibility
2. **State**: Lift state up only when needed
3. **Services**: Always use for API calls
4. **Styling**: Use design system, NO inline styles
5. **Types**: Define interfaces for all props and data
6. **Errors**: Handle gracefully, show user-friendly messages
7. **Performance**: Lazy load, memoize, optimize images
8. **Security**: Validate input, sanitize output, use RLS
9. **Testing**: Write tests for critical paths (future)
10. **Documentation**: Update docs when architecture changes

---

## 🔗 Related Documentation

- **Code structure**: See PHILOSOPHY.md
- **File inventory**: See FILE_REGISTRY.md
- **Technologies**: See TECH_STACK.md
- **Styling system**: See DESIGN_SYSTEM.md
- **Database schema**: See DATABASE_SCHEMA.md
- **API contracts**: See API_CONTRACTS.md

---

**Remember**: Architecture evolves. When making significant changes, update this document and create an ADR entry.
