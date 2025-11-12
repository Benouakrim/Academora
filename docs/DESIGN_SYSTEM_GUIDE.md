# Design System Documentation

## Overview

The AcademOra design system is a comprehensive, token-based styling architecture that centralizes all visual design decisions into CSS variables. This makes the entire application theme easily customizable and maintainable.

## Architecture

```
src/styles/
├── tokens/              # Design tokens (CSS variables)
│   ├── colors.css       # All color variables
│   ├── spacing.css      # Padding, margin, gap values
│   ├── typography.css   # Font families, sizes, weights
│   ├── borders.css      # Border widths and radius
│   ├── shadows.css      # Box shadows and elevation
│   ├── animations.css   # Transitions and keyframes
│   ├── effects.css      # Opacity, blur, filters, z-index
│   ├── gradients.css    # Gradient definitions
│   └── index.css        # Imports all tokens
├── components/          # Component-level styles
│   ├── buttons.css      # Button styles
│   ├── cards.css        # Card styles
│   ├── forms.css        # Form and input styles
│   ├── utilities.css    # Utility classes
│   └── index.css        # Imports all components
└── editor.css          # Rich text editor styles
```

## Design Tokens

Design tokens are CSS variables that define the visual properties of your design system. They provide a single source of truth for all styling decisions.

### Colors

All colors are defined in `src/styles/tokens/colors.css`.

#### Primary Colors
```css
var(--color-primary-50)    /* Lightest */
var(--color-primary-100)
...
var(--color-primary-900)   /* Darkest */
var(--color-primary-950)
```

#### Usage in Components
```jsx
// In Tailwind classes
<div className="bg-primary-600 text-white">...</div>

// In custom CSS
.my-component {
  background-color: var(--color-primary-600);
  color: var(--color-white);
}
```

#### Color Categories

1. **Primary Colors**: Main brand colors (`--color-primary-*`)
2. **Neutral Colors**: Grays and backgrounds (`--color-neutral-*`)
3. **Accent Colors**: Secondary brand colors (`--color-accent-*`)
4. **Semantic Colors**: Status colors
   - Success: `--color-success-*`
   - Error: `--color-error-*`
   - Warning: `--color-warning-*`
   - Info: `--color-info-*`
5. **Gradient Colors**: For visual effects
   - Purple: `--color-purple-*`
   - Pink: `--color-pink-*`
   - Blue: `--color-blue-*`
   - Green: `--color-green-*`
   - And more...

#### Changing the Color Scheme

To change the entire color scheme of the application:

1. Open `src/styles/tokens/colors.css`
2. Modify the color values in the `:root` section
3. Save the file - changes apply globally!

Example:
```css
:root {
  /* Change primary blue to green */
  --color-primary-600: #059669;  /* Was: #3c638d */
  --color-primary-700: #047857;  /* Was: #2f4e70 */
}
```

### Spacing

Defined in `src/styles/tokens/spacing.css`. Uses a consistent scale based on 4px increments.

```css
var(--spacing-1)    /* 4px */
var(--spacing-2)    /* 8px */
var(--spacing-3)    /* 12px */
var(--spacing-4)    /* 16px */
var(--spacing-6)    /* 24px */
var(--spacing-8)    /* 32px */
...
```

#### Semantic Spacing
```css
var(--spacing-component-sm)   /* Component padding small */
var(--spacing-component-md)   /* Component padding medium */
var(--spacing-component-lg)   /* Component padding large */
var(--spacing-section-md)     /* Section spacing */
var(--spacing-gap-md)         /* Grid/flex gaps */
```

### Typography

Defined in `src/styles/tokens/typography.css`.

#### Font Families
```css
var(--font-primary)    /* Sans-serif */
var(--font-secondary)  /* Serif */
var(--font-code)       /* Monospace */
```

#### Font Sizes
```css
var(--font-size-xs)    /* 12px */
var(--font-size-sm)    /* 14px */
var(--font-size-base)  /* 16px */
var(--font-size-lg)    /* 18px */
var(--font-size-xl)    /* 20px */
var(--font-size-2xl)   /* 24px */
...
```

#### Font Weights
```css
var(--font-weight-normal)     /* 400 */
var(--font-weight-medium)     /* 500 */
var(--font-weight-semibold)   /* 600 */
var(--font-weight-bold)       /* 700 */
```

#### Headings
Pre-configured heading styles:
```css
var(--heading-h1-size)
var(--heading-h1-weight)
var(--heading-h1-line-height)
```

### Borders & Radius

Defined in `src/styles/tokens/borders.css`.

```css
var(--radius-sm)      /* 2px */
var(--radius-base)    /* 4px */
var(--radius-md)      /* 6px */
var(--radius-lg)      /* 8px */
var(--radius-xl)      /* 12px */
var(--radius-2xl)     /* 16px */
var(--radius-3xl)     /* 24px */
var(--radius-full)    /* Circle/pill shape */
```

#### Semantic Radius
```css
var(--radius-button)  /* Button corners */
var(--radius-card)    /* Card corners */
var(--radius-modal)   /* Modal corners */
var(--radius-input)   /* Input corners */
```

### Shadows

Defined in `src/styles/tokens/shadows.css`.

```css
var(--shadow-sm)      /* Small shadow */
var(--shadow-md)      /* Medium shadow */
var(--shadow-lg)      /* Large shadow */
var(--shadow-xl)      /* Extra large shadow */
var(--shadow-2xl)     /* 2X large shadow */
```

#### Colored Shadows
```css
var(--shadow-primary-lg)   /* Primary colored shadow */
var(--shadow-success-md)   /* Success colored shadow */
var(--shadow-purple-xl)    /* Purple glow effect */
```

#### Semantic Shadows
```css
var(--shadow-card)         /* Default card shadow */
var(--shadow-card-hover)   /* Card hover shadow */
var(--shadow-button)       /* Button shadow */
var(--shadow-modal)        /* Modal shadow */
```

### Animations

Defined in `src/styles/tokens/animations.css`.

#### Durations
```css
var(--duration-fast)     /* 150ms */
var(--duration-normal)   /* 300ms */
var(--duration-slow)     /* 500ms */
```

#### Easing Functions
```css
var(--ease-in)
var(--ease-out)
var(--ease-in-out)
var(--ease-default)
```

#### Pre-built Animations

Available as utility classes:
- `.animate-fadeIn` - Fade in effect
- `.animate-slideDown` - Slide down effect
- `.animate-spin` - Spinning animation
- `.animate-pulse` - Pulsing animation
- `.animate-bounce` - Bouncing animation
- And many more...

### Gradients

Defined in `src/styles/tokens/gradients.css`.

```css
var(--gradient-primary)         /* Primary brand gradient */
var(--gradient-purple-pink)     /* Purple to pink */
var(--gradient-green)           /* Green gradient */
var(--gradient-rainbow)         /* Multi-color gradient */
```

#### Text Gradients
Use with utility classes:
```jsx
<h1 className="text-gradient-purple-pink">
  Gradient Text
</h1>
```

Or in CSS:
```css
.my-heading {
  background: var(--text-gradient-purple-pink);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

### Effects

Defined in `src/styles/tokens/effects.css`.

#### Opacity
```css
var(--opacity-0)       /* 0 */
var(--opacity-50)      /* 0.5 */
var(--opacity-100)     /* 1 */
```

#### Backdrop Blur
```css
var(--blur-sm)         /* 4px */
var(--blur-md)         /* 12px */
var(--blur-lg)         /* 16px */
```

#### Glass Morphism
```css
var(--backdrop-glass)        /* Glass effect */
var(--backdrop-glass-light)  /* Light glass */
var(--backdrop-glass-dark)   /* Dark glass */
```

Use with utility classes:
```jsx
<div className="glass-effect">
  Glass morphism effect
</div>
```

#### Z-Index
```css
var(--z-dropdown)      /* 10 */
var(--z-sticky)        /* 20 */
var(--z-modal)         /* 50 */
var(--z-tooltip)       /* 50 */
```

## Component Styles

### Buttons

Defined in `src/styles/components/buttons.css`.

#### Base Button
```jsx
<button className="btn-base btn-primary">
  Primary Button
</button>
```

#### Variants
- `.btn-primary` - Primary button
- `.btn-secondary` - Secondary button
- `.btn-outline` - Outline button
- `.btn-ghost` - Ghost button
- `.btn-gradient-purple` - Gradient button
- `.btn-success` - Success button
- `.btn-error` - Error button
- `.btn-warning` - Warning button

#### Sizes
- `.btn-xs` - Extra small
- `.btn-sm` - Small
- `.btn-md` - Medium (default)
- `.btn-lg` - Large
- `.btn-xl` - Extra large

#### Shapes
- `.btn-rounded` - Fully rounded
- `.btn-pill` - Pill shape
- `.btn-square` - Square corners

#### States
- `.btn-loading` - Loading state
- `:disabled` - Disabled state

### Cards

Defined in `src/styles/components/cards.css`.

#### Base Card
```jsx
<div className="card">
  Card content
</div>
```

#### Variants
- `.card-elevated` - Elevated shadow
- `.card-flat` - No shadow
- `.card-glass` - Glass morphism
- `.card-gradient` - Gradient background

#### Sizes
- `.card-sm` - Small padding
- `.card-md` - Medium padding
- `.card-lg` - Large padding
- `.card-xl` - Extra large padding

#### Sections
- `.card-header` - Card header
- `.card-body` - Card body
- `.card-footer` - Card footer

#### States
- `.card-interactive` - Hover effects
- `.card-selected` - Selected state

### Forms

Defined in `src/styles/components/forms.css`.

#### Text Inputs
```jsx
<input 
  type="text" 
  className="input-base input-md" 
  placeholder="Enter text..."
/>
```

#### Variants
- `.input-base` - Base input styles
- `.input-rounded` - Rounded input
- `.input-borderless` - No border

#### Sizes
- `.input-sm` - Small
- `.input-md` - Medium
- `.input-lg` - Large

#### States
- `.input-error` - Error state
- `.input-success` - Success state
- `.input-warning` - Warning state

#### Other Form Elements
- `.textarea` - Text area
- `.select` - Select dropdown
- `.checkbox` - Checkbox
- `.radio` - Radio button
- `.toggle` - Toggle switch

### Utilities

Defined in `src/styles/components/utilities.css`.

#### Badges
```jsx
<span className="badge badge-primary">New</span>
```

#### Alerts
```jsx
<div className="alert alert-success">
  Success message
</div>
```

#### Avatars
```jsx
<img src="..." className="avatar avatar-md" />
```

#### Spinners
```jsx
<div className="spinner"></div>
```

#### Progress Bars
```jsx
<div className="progress">
  <div className="progress-bar" style={{width: '60%'}}></div>
</div>
```

## Tailwind Integration

The design system is fully integrated with Tailwind CSS. All tokens are available as Tailwind utilities:

```jsx
// Colors
<div className="bg-primary-600 text-white">...</div>

// Spacing
<div className="p-4 m-2 gap-3">...</div>

// Border radius
<div className="rounded-xl">...</div>

// Shadows
<div className="shadow-lg">...</div>

// Animations
<div className="transition-all duration-300">...</div>
```

## Quick Start Guide

### Changing the Theme

1. **Change Primary Color**:
   - Edit `src/styles/tokens/colors.css`
   - Modify `--color-primary-*` variables

2. **Change Spacing Scale**:
   - Edit `src/styles/tokens/spacing.css`
   - Modify spacing values

3. **Change Typography**:
   - Edit `src/styles/tokens/typography.css`
   - Change font families, sizes, or weights

4. **Change Border Radius**:
   - Edit `src/styles/tokens/borders.css`
   - Adjust radius values for sharper or rounder corners

5. **Change Shadows**:
   - Edit `src/styles/tokens/shadows.css`
   - Modify shadow definitions

### Creating Custom Components

```css
/* In your component CSS file */
.my-custom-component {
  /* Use design tokens */
  background: var(--color-primary-600);
  color: var(--color-white);
  padding: var(--spacing-4);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  transition: all var(--duration-normal) var(--ease-default);
}

.my-custom-component:hover {
  background: var(--color-primary-700);
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}
```

### Using in React Components

```tsx
// Option 1: Tailwind classes (recommended)
<button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-all duration-300">
  Click Me
</button>

// Option 2: Component classes
<button className="btn-base btn-primary btn-md">
  Click Me
</button>

// Option 3: Inline styles with CSS variables
<div style={{
  backgroundColor: 'var(--color-primary-600)',
  padding: 'var(--spacing-4)',
  borderRadius: 'var(--radius-lg)'
}}>
  Content
</div>
```

## Best Practices

1. **Always use design tokens** instead of hardcoded values
2. **Prefer Tailwind utilities** for simple styling
3. **Use component classes** for complex, reusable patterns
4. **Create custom CSS** only when necessary
5. **Keep tokens semantic** - use meaningful names
6. **Document custom additions** to the design system
7. **Test theme changes** across the entire application

## Migration Guide

### From Hardcoded Values

**Before:**
```css
.old-button {
  background: #3c638d;
  padding: 8px 16px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
```

**After:**
```css
.new-button {
  background: var(--color-primary-600);
  padding: var(--spacing-2) var(--spacing-4);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}
```

### From Inline Styles

**Before:**
```jsx
<div style={{
  background: '#8b5cf6',
  padding: '16px',
  borderRadius: '12px'
}}>
```

**After:**
```jsx
<div className="bg-purple-500 p-4 rounded-xl">
```

Or with CSS variables:
```jsx
<div style={{
  background: 'var(--color-purple-500)',
  padding: 'var(--spacing-4)',
  borderRadius: 'var(--radius-xl)'
}}>
```

## Troubleshooting

### Colors not updating
- Make sure `src/styles/tokens/index.css` is imported in `src/index.css`
- Clear your browser cache
- Check that CSS variables are defined in `:root`

### Tailwind classes not working
- Verify `tailwind.config.js` is correctly configured
- Make sure Tailwind is processing your CSS files
- Check that the content paths include your component files

### Animation not playing
- Ensure animations are imported from `tokens/animations.css`
- Verify animation class names are correct
- Check browser DevTools for CSS errors

## Resources

- [CSS Variables (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Design Tokens (Style Dictionary)](https://amzn.github.io/style-dictionary/)

## Contributing

When adding new design tokens:

1. Add them to the appropriate token file
2. Update this documentation
3. Add corresponding Tailwind configuration if needed
4. Test across multiple components
5. Ensure backward compatibility

---

**Last Updated**: November 2025  
**Version**: 1.0.0

## Theming

The app supports multiple themes (`default`, `verdant`) and two modes (`dark`, `light`). Only colors and fonts change across themes; layout, spacing, radii, and animations remain consistent.

Runtime
- `ThemeProvider` applies `theme-<name>` and `mode-<mode>` classes to `<body>`.
- Preferences are saved in LocalStorage (`ao_theme_pref`) and applied pre-hydration to avoid FOUC.

CSS variables
- Theme/mode overrides are scoped in `src/styles/themes.css` under `body.theme-<name>.mode-<mode>`.
- Key variables: `--chart-color-1..6`, `--chart-grid`, `--chart-axis`, `--chart-tick`, `--slider-track`, `--slider-progress-academic`, `--slider-progress-budget`, `--ambient-color-1..4`, `--heatmap-best`, `--heatmap-good`, `--heatmap-caution`, `--heatmap-risk`.

Integration examples
- Charts: `ComparisonCharts.tsx` uses `var(--chart-color-*)` and grid/tick vars.
- Sliders: Matching/Scenario sliders use `--slider-*` linear gradients.
- Decorative orbs: `AnimatedBackground.tsx` uses `--ambient-*`.
