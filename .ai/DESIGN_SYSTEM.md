# 🎨 Design System - AcademOra

**Last Updated**: 2025-11-10  
**Purpose**: Complete styling architecture and design token reference

> **⛔ CRITICAL RULE**: NO INLINE STYLES. Use this design system for ALL styling.

---

## 🚨 The Golden Rule

### ⛔ NEVER DO THIS:
```tsx
<div style={{ background: 'linear-gradient(...)' }}>  ❌
<div style={{ width: `${progress}%` }}>               ❌
<div style={{ color: '#3b82f6' }}>                    ❌
```

### ✅ ALWAYS DO THIS:
```tsx
<AnimatedBackground colors={['primary', 'secondary']} />  ✅
<ProgressBar value={progress} variant="primary" />        ✅
<div className="text-primary-600">                        ✅
```

---

## 📂 Design System Structure

```
src/styles/
├── tokens/              # Design tokens (source of truth)
│   ├── colors.css      # Color palette
│   ├── spacing.css     # Spacing scale
│   ├── typography.css  # Font system
│   ├── borders.css     # Border utilities
│   ├── shadows.css     # Shadow definitions
│   ├── gradients.css   # Gradient patterns
│   ├── animations.css  # Animation presets
│   ├── effects.css     # Visual effects
│   └── index.css       # Token aggregator
│
├── designSystem.ts     # TypeScript utilities
└── editor.css          # Editor-specific styles

tailwind.config.js      # Extends tokens into Tailwind
```

---

## 🎨 Color System

### Color Palette Structure

Each color has 10 shades (50-900) following Tailwind convention:

```css
/* colors.css */
:root {
  /* Primary - Blue */
  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-200: #bfdbfe;
  --color-primary-300: #93c5fd;
  --color-primary-400: #60a5fa;
  --color-primary-500: #3b82f6;  /* Base */
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;
  --color-primary-800: #1e40af;
  --color-primary-900: #1e3a8a;
  
  /* Secondary - Purple */
  --color-secondary-50: #faf5ff;
  --color-secondary-500: #a855f7;  /* Base */
  --color-secondary-900: #581c87;
  
  /* Accent - Amber */
  --color-accent-50: #fffbeb;
  --color-accent-500: #f59e0b;  /* Base */
  --color-accent-900: #78350f;
  
  /* Semantic Colors */
  --color-success-500: #10b981;
  --color-warning-500: #f59e0b;
  --color-error-500: #ef4444;
  --color-info-500: #3b82f6;
  
  /* Neutrals */
  --color-gray-50: #f9fafb;
  --color-gray-500: #6b7280;
  --color-gray-900: #111827;
}
```

### Usage in Tailwind

```tsx
// Text colors
<h1 className="text-primary-600">Title</h1>
<p className="text-gray-700">Body text</p>

// Background colors
<div className="bg-primary-50">Light background</div>
<div className="bg-secondary-500">Colored background</div>

// Border colors
<div className="border border-gray-200">Bordered</div>

// Hover states
<button className="bg-primary-600 hover:bg-primary-700">
  Button
</button>
```

### Color Usage Guidelines

| Color | Use For | Examples |
|-------|---------|----------|
| **Primary (Blue)** | Main actions, links, emphasis | Buttons, links, progress bars |
| **Secondary (Purple)** | Secondary actions, accents | Save button, badges |
| **Accent (Amber)** | Highlights, CTAs | Featured items, special badges |
| **Success (Green)** | Success states, positive data | Success messages, high acceptance rates |
| **Warning (Yellow)** | Warnings, cautions | Warning messages, moderate values |
| **Error (Red)** | Errors, destructive actions | Error messages, delete buttons |
| **Info (Blue)** | Information, neutral states | Info messages, tooltips |
| **Gray** | Text, borders, backgrounds | Body text, dividers, containers |

---

## 📏 Spacing System

### Spacing Scale

```css
/* spacing.css */
:root {
  --spacing-0: 0;
  --spacing-1: 0.25rem;   /* 4px */
  --spacing-2: 0.5rem;    /* 8px */
  --spacing-3: 0.75rem;   /* 12px */
  --spacing-4: 1rem;      /* 16px */
  --spacing-5: 1.25rem;   /* 20px */
  --spacing-6: 1.5rem;    /* 24px */
  --spacing-8: 2rem;      /* 32px */
  --spacing-10: 2.5rem;   /* 40px */
  --spacing-12: 3rem;     /* 48px */
  --spacing-16: 4rem;     /* 64px */
  --spacing-20: 5rem;     /* 80px */
  --spacing-24: 6rem;     /* 96px */
  --spacing-32: 8rem;     /* 128px */
}
```

### Usage

```tsx
// Padding
<div className="p-4">All sides 16px</div>
<div className="px-6 py-4">Horizontal 24px, Vertical 16px</div>
<div className="pt-8 pb-12">Top 32px, Bottom 48px</div>

// Margin
<div className="m-4">Margin 16px</div>
<div className="mt-8 mb-4">Top 32px, Bottom 16px</div>
<div className="mx-auto">Center horizontally</div>

// Gap (Flexbox/Grid)
<div className="flex gap-4">Items separated by 16px</div>
<div className="grid gap-6">Grid gap 24px</div>

// Space between
<div className="space-y-4">Children separated by 16px</div>
```

### Spacing Guidelines

- **Tight**: `2-4` (8-16px) - Between related items
- **Normal**: `4-6` (16-24px) - Default component spacing
- **Loose**: `8-12` (32-48px) - Between sections
- **Section**: `16-24` (64-96px) - Between major sections

---

## 🔤 Typography System

### Font Families

```css
/* typography.css */
:root {
  --font-primary: 'Inter', system-ui, -apple-system, sans-serif;
  --font-heading: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'Fira Code', 'Courier New', monospace;
}
```

### Font Sizes

```css
:root {
  --text-xs: 0.75rem;     /* 12px */
  --text-sm: 0.875rem;    /* 14px */
  --text-base: 1rem;      /* 16px */
  --text-lg: 1.125rem;    /* 18px */
  --text-xl: 1.25rem;     /* 20px */
  --text-2xl: 1.5rem;     /* 24px */
  --text-3xl: 1.875rem;   /* 30px */
  --text-4xl: 2.25rem;    /* 36px */
  --text-5xl: 3rem;       /* 48px */
  --text-6xl: 3.75rem;    /* 60px */
}
```

### Font Weights

```css
:root {
  --font-light: 300;
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  --font-extrabold: 800;
}
```

### Usage

```tsx
// Headings
<h1 className="text-4xl font-bold text-gray-900">Main Title</h1>
<h2 className="text-3xl font-semibold text-gray-800">Section Title</h2>
<h3 className="text-2xl font-medium text-gray-800">Subsection</h3>

// Body text
<p className="text-base text-gray-700 leading-relaxed">Body text</p>
<span className="text-sm text-gray-600">Small text</span>

// Special text
<code className="font-mono text-sm bg-gray-100 px-2 py-1">Code</code>
<strong className="font-semibold">Bold text</strong>
```

### Typography Guidelines

| Element | Size | Weight | Use For |
|---------|------|--------|---------|
| **H1** | 4xl-6xl | bold | Page titles |
| **H2** | 3xl-4xl | semibold | Section headings |
| **H3** | 2xl-3xl | medium | Subsection headings |
| **H4** | xl-2xl | medium | Component headings |
| **Body** | base | normal | Main content |
| **Small** | sm | normal | Secondary content |
| **Tiny** | xs | normal | Labels, captions |

---

## 🔲 Borders System

### Border Widths

```css
/* borders.css */
:root {
  --border-0: 0;
  --border-1: 1px;
  --border-2: 2px;
  --border-4: 4px;
  --border-8: 8px;
}
```

### Border Radius

```css
:root {
  --radius-none: 0;
  --radius-sm: 0.125rem;   /* 2px */
  --radius-default: 0.25rem;  /* 4px */
  --radius-md: 0.375rem;   /* 6px */
  --radius-lg: 0.5rem;     /* 8px */
  --radius-xl: 0.75rem;    /* 12px */
  --radius-2xl: 1rem;      /* 16px */
  --radius-3xl: 1.5rem;    /* 24px */
  --radius-full: 9999px;   /* Circular */
}
```

### Usage

```tsx
// Border width
<div className="border">1px border</div>
<div className="border-2">2px border</div>

// Border sides
<div className="border-t">Top border only</div>
<div className="border-b">Bottom border only</div>

// Border radius
<div className="rounded">4px radius</div>
<div className="rounded-lg">8px radius</div>
<div className="rounded-full">Circular</div>
<div className="rounded-t-lg">Top corners only</div>

// Border colors
<div className="border border-gray-200">Light border</div>
<div className="border-2 border-primary-500">Colored border</div>
```

---

## 🌫️ Shadows System

### Shadow Definitions

```css
/* shadows.css */
:root {
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-default: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  --shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  --shadow-inner: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);
}
```

### Usage

```tsx
// Cards
<div className="shadow-md rounded-lg">Card with medium shadow</div>

// Hover effects
<button className="shadow hover:shadow-lg transition-shadow">
  Button
</button>

// Elevated elements
<div className="shadow-xl">Highly elevated</div>

// Inset
<input className="shadow-inner" />
```

### Shadow Guidelines

| Shadow | Use For | Example |
|--------|---------|---------|
| **sm** | Subtle elevation | Form inputs |
| **default** | Standard cards | Content cards |
| **md** | Emphasized cards | Feature cards |
| **lg** | Modals, dropdowns | Modal dialogs |
| **xl** | Hero elements | Hero sections |
| **2xl** | Extreme elevation | Floating action buttons |
| **inner** | Inset/pressed | Input fields |

---

## 🌈 Gradients System

### Predefined Gradients

```css
/* gradients.css */
:root {
  /* Primary gradient */
  --gradient-primary: linear-gradient(135deg, 
    var(--color-primary-500), 
    var(--color-secondary-500)
  );
  
  /* Accent gradient */
  --gradient-accent: linear-gradient(135deg, 
    var(--color-accent-500), 
    var(--color-primary-500)
  );
  
  /* Success gradient */
  --gradient-success: linear-gradient(135deg, 
    var(--color-success-400), 
    var(--color-success-600)
  );
}
```

### Usage with Tailwind

```tsx
// Background gradients
<div className="bg-gradient-to-r from-primary-500 to-secondary-500">
  Gradient background
</div>

<div className="bg-gradient-to-br from-accent-400 via-primary-500 to-secondary-600">
  Multi-stop gradient
</div>

// Text gradients
<h1 className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
  Gradient text
</h1>
```

### ⚠️ Gradient Exception

**Animated backgrounds with dynamic colors** use the `AnimatedBackground` component:

```tsx
// ✅ Correct way for animated gradients
<AnimatedBackground 
  colors={['#3b82f6', '#a855f7']}
  orbCount={3}
  duration={20}
/>

// ❌ Wrong - don't use inline styles
<div style={{ background: 'radial-gradient(...)' }} />
```

---

## ✨ Animations System

### Animation Presets

```css
/* animations.css */
:root {
  --transition-fast: 150ms ease-in-out;
  --transition-base: 200ms ease-in-out;
  --transition-slow: 300ms ease-in-out;
  
  --duration-fast: 150ms;
  --duration-base: 200ms;
  --duration-slow: 300ms;
  --duration-slower: 500ms;
}

/* Keyframe animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

### Usage

```tsx
// Transitions
<button className="transition-colors duration-200 hover:bg-primary-700">
  Button with color transition
</button>

<div className="transition-all duration-300 hover:scale-105">
  Scale on hover
</div>

// Built-in animations
<div className="animate-pulse">Loading...</div>
<div className="animate-bounce">Bouncing</div>
<div className="animate-spin">Spinning</div>

// Custom animations with Framer Motion
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>
```

---

## 🧩 Component System

### Standard Components

#### **AnimatedBackground** ⭐ NEW
```tsx
import AnimatedBackground from '@/components/AnimatedBackground';

<AnimatedBackground 
  colors={['#3b82f6', '#a855f7', '#f59e0b']}
  orbCount={3}
  orbSize="500px"
  duration={20}
/>
```

**Props:**
- `colors`: Array of hex colors
- `orbCount`: Number of orbs (default: 3)
- `orbSize`: Size of each orb (default: "600px")
- `duration`: Animation duration in seconds (default: 20)

#### **ProgressBar** ⭐ NEW
```tsx
import ProgressBar from '@/components/ProgressBar';

<ProgressBar 
  value={75}
  variant="primary"
  label="Acceptance Rate"
  showLabel={true}
  height="md"
  animated={true}
/>
```

**Props:**
- `value`: Percentage (0-100)
- `variant`: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'blue' | 'green'
- `label`: Optional label text
- `showLabel`: Show label (default: false)
- `height`: 'sm' | 'md' | 'lg' (default: 'md')
- `animated`: Animate on mount (default: true)

---

## 📱 Responsive Design

### Breakpoints

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    screens: {
      'sm': '640px',   // Mobile landscape
      'md': '768px',   // Tablet
      'lg': '1024px',  // Desktop
      'xl': '1280px',  // Large desktop
      '2xl': '1536px', // Extra large
    }
  }
}
```

### Usage

```tsx
// Responsive classes
<div className="text-base md:text-lg lg:text-xl">
  Responsive text size
</div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  Responsive grid
</div>

<div className="hidden md:block">
  Visible on tablet and up
</div>

<div className="block md:hidden">
  Visible on mobile only
</div>
```

---

## 🎯 Common Patterns

### Card Pattern
```tsx
<div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
  <h3 className="text-xl font-semibold text-gray-900 mb-2">Title</h3>
  <p className="text-gray-600">Content</p>
</div>
```

### Button Pattern
```tsx
// Primary button
<button className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors">
  Primary Action
</button>

// Secondary button
<button className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
  Secondary Action
</button>

// Danger button
<button className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors">
  Delete
</button>
```

### Form Input Pattern
```tsx
<div className="space-y-2">
  <label className="block text-sm font-medium text-gray-700">
    Label
  </label>
  <input 
    type="text"
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
    placeholder="Enter value"
  />
</div>
```

### Section Pattern
```tsx
<section className="py-16 px-4 md:px-8 lg:px-16">
  <div className="max-w-7xl mx-auto">
    <h2 className="text-3xl font-bold text-gray-900 mb-8">Section Title</h2>
    {/* Content */}
  </div>
</section>
```

---

## 🚫 Documented Exceptions

### When Inline Styles ARE Allowed

1. **Dynamic Chart Colors** (ComparisonCharts.tsx)
   - Reason: Recharts requires dynamic color props
   - Example: `<Bar dataKey="value" fill={color} />`

2. **Slider Thumb Gradients** (MatchingEnginePage.tsx)
   - Reason: Dynamic slider position requires calculated gradients
   - Example: Slider track gradient based on value

3. **Dynamic Progress Percentages** (Before ProgressBar component)
   - Solution: NOW use `<ProgressBar value={percentage} />`
   - This exception is DEPRECATED

All exceptions must be:
- ✅ Documented in KNOWN_ISSUES.md
- ✅ Justified with technical reasoning
- ✅ Reviewed regularly for refactor opportunities

---

## 🔧 Utility Classes Reference

### Display
```tsx
block, inline-block, inline, flex, inline-flex, grid, inline-grid, hidden
```

### Position
```tsx
static, fixed, absolute, relative, sticky
```

### Flexbox
```tsx
flex-row, flex-col, flex-wrap, items-center, items-start, items-end, 
justify-center, justify-between, justify-around, gap-4
```

### Grid
```tsx
grid-cols-3, gap-4, col-span-2, row-span-2
```

### Width/Height
```tsx
w-full, w-1/2, w-screen, h-screen, h-full, min-h-screen, max-w-7xl
```

### Overflow
```tsx
overflow-hidden, overflow-auto, overflow-scroll, truncate
```

---

## 📚 Additional Resources

- **Full color palette**: `src/styles/tokens/colors.css`
- **All spacing values**: `src/styles/tokens/spacing.css`
- **Typography system**: `src/styles/tokens/typography.css`
- **Tailwind docs**: https://tailwindcss.com/docs
- **Framer Motion docs**: https://www.framer.com/motion/

---

## 🛠️ Maintenance

**Update this file when:**
- ✅ Adding new design tokens
- ✅ Creating new reusable components
- ✅ Changing color palette
- ✅ Modifying spacing scale
- ✅ Adding animation presets
- ✅ Documenting style exceptions

**Remember**: This is the **SINGLE SOURCE OF TRUTH** for all styling decisions.
