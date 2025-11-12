# Style Guidelines - AcademOra

## Core Principle
**NO INLINE STYLES** - All styling must use design tokens and Tailwind CSS utilities.

## Architecture

### Design System Location
All design tokens are centralized in `src/styles/tokens/`:
- `colors.css` - Color palette
- `spacing.css` - Spacing scale
- `typography.css` - Font system
- `borders.css` - Border styles
- `shadows.css` - Shadow definitions
- `gradients.css` - Gradient patterns
- `animations.css` - Animation presets
- `effects.css` - Visual effects

### Style Priority
1. **Tailwind Utilities** (First Choice)
2. **Design System Components** (Reusable patterns)
3. **CSS Modules** (Complex, scoped styles)
4. **Inline Styles** (NEVER - See exceptions below)

## Reusable Components

### AnimatedBackground
**Purpose**: Animated radial gradient orbs for page backgrounds

**Usage**:
```tsx
import AnimatedBackground from '../components/AnimatedBackground'

<AnimatedBackground 
  colors={['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b']} 
  orbCount={4}
  duration={15}
/>
```

**Replaced Pattern**:
```tsx
// ❌ WRONG - Inline style
<div style={{ background: `radial-gradient(circle, #8b5cf6 0%, transparent 70%)` }} />
```

### ProgressBar
**Purpose**: Progress indicators with dynamic width

**Usage**:
```tsx
import ProgressBar from '../components/ProgressBar'

<ProgressBar 
  value={75}
  variant="success"
  label="Completion Rate"
  showLabel
/>
```

**Replaced Pattern**:
```tsx
// ❌ WRONG - Inline style
<div style={{ width: `${percentage}%` }} className="bg-blue-600 h-2" />
```

## Common Conversions

### Text Transformation
```tsx
// ❌ WRONG
<span style={{ textTransform: 'capitalize' }}>text</span>

// ✅ CORRECT
<span className="capitalize">text</span>
```

### Layout
```tsx
// ❌ WRONG
<div style={{ minHeight: 0, margin: 0, padding: 0 }}>

// ✅ CORRECT  
<div className="min-h-0 m-0 p-0">
```

### Background Colors
```tsx
// ❌ WRONG
<div style={{ background: 'transparent' }}>

// ✅ CORRECT
<div className="bg-transparent">
```

### Dimensions
```tsx
// ❌ WRONG
<div style={{ width: '100%', height: '400px' }}>

// ✅ CORRECT
<div className="w-full h-[400px]">
```

## Exceptions (When Inline Styles Are Allowed)

### 1. Performance Optimizations
**Allowed for browser rendering hints**:
```tsx
// ✅ ACCEPTABLE - Performance hint
<div style={{ willChange: 'transform', contain: 'layout' }}>
```

### 2. Dynamic Chart/Graph Calculations
**Allowed for data visualizations**:
```tsx
// ✅ ACCEPTABLE - Dynamic chart data
<div style={{ width: `${dataPoint.percentage}%` }} />
```

### 3. Third-Party Component Props
**Allowed when required by library APIs**:
```tsx
// ✅ ACCEPTABLE - Library requirement
<MarkdownPreview style={{ background: 'transparent' }} />
```

### 4. Complex Dynamic Gradients
**Allowed for slider indicators with dynamic calculations**:
```tsx
// ✅ ACCEPTABLE - Complex slider gradient
<input 
  type="range"
  style={{
    background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${percent}%, #374151 ${percent}%, #374151 100%)`
  }}
/>
```

## Development Workflow

### Before Creating Inline Styles
Ask yourself:
1. **Can I use a Tailwind class?** → Use it
2. **Is this a repeated pattern?** → Create a component
3. **Is this dynamic data visualization?** → Exception allowed
4. **Is this a performance hint?** → Exception allowed
5. **None of the above?** → Refactor your approach

### Code Review Checklist
- [ ] No inline `style={{}}` except documented exceptions
- [ ] All colors from design tokens
- [ ] All spacing using Tailwind scale
- [ ] Repeated patterns extracted to components
- [ ] Design system components used where applicable

## Migration Strategy

### Step 1: Identify Inline Styles
```bash
# Find all inline styles in your code
grep -r "style={{" src/
```

### Step 2: Categorize
- **Simple styles** → Convert to Tailwind immediately
- **Progress bars** → Use `<ProgressBar>` component
- **Animated backgrounds** → Use `<AnimatedBackground>` component
- **Complex visualizations** → Document as exception

### Step 3: Refactor
1. Replace simple inline styles with Tailwind
2. Extract repeated patterns into components
3. Document remaining exceptions with comments

## Component Creation Guidelines

### When to Create a New Component
Create a reusable component when:
- Pattern appears 3+ times across codebase
- Inline styles required for dynamic behavior
- Complex styling logic needs encapsulation

### Component Template
```tsx
interface MyComponentProps {
  /** Clear prop descriptions */
  value: number
  variant?: 'primary' | 'secondary'
  className?: string
}

/**
 * Component description
 * 
 * @example
 * <MyComponent value={50} variant="primary" />
 */
export default function MyComponent({ 
  value, 
  variant = 'primary',
  className = ''
}: MyComponentProps) {
  // Use design tokens
  const colors = {
    primary: 'bg-purple-500',
    secondary: 'bg-blue-500'
  }
  
  return (
    <div className={`${colors[variant]} ${className}`}>
      {/* Component implementation */}
    </div>
  )
}
```

## Resources

- Design System: `src/styles/tokens/`
- Example Components: `src/components/AnimatedBackground.tsx`, `src/components/ProgressBar.tsx`
- Tailwind Config: `tailwind.config.js`
- Migration Examples: `STYLE_MIGRATION_EXAMPLES.md`

## Enforcement

### Pre-commit Hook (Recommended)
```bash
# Add to .git/hooks/pre-commit
if git diff --cached --name-only | grep -E '\\.(tsx|jsx)$' | xargs grep -l 'style={{'; then
  echo "⚠️  Warning: Inline styles detected. Please use Tailwind or design system components."
  echo "See STYLE_GUIDELINES.md for details."
  exit 1
fi
```

### ESLint Rule (Future)
Consider adding `eslint-plugin-react` rule:
```json
{
  "rules": {
    "react/forbid-component-props": ["warn", { "forbid": ["style"] }]
  }
}
```

---

## Summary

✅ **DO**:
- Use Tailwind utilities
- Use design system components (`AnimatedBackground`, `ProgressBar`)
- Extract repeated patterns
- Document exceptions with comments

❌ **DON'T**:
- Add inline `style={{}}` for simple styling
- Duplicate gradient/progress bar logic
- Mix inline styles with Tailwind
- Forget to check design tokens first

**Remember**: Consistency and maintainability over convenience. Every inline style makes the codebase harder to maintain and theme.
