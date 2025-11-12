// AcademOra Design System - Matching Homepage Style
export const colors = {
  // Primary dark theme colors (bind to CSS variables; actual shades depend on theme/mode)
  background: {
    primary: 'var(--color-bg-primary)',
    secondary: 'var(--color-bg-secondary)',
    tertiary: 'var(--color-gray-900)',
    gradient: 'from-black via-purple-950/20 to-black',
    card: 'from-gray-800/50 to-gray-900/50',
    overlay: 'bg-white/5 backdrop-blur-md',
    border: 'border-gray-700/50'
  },
  
  // Vibrant gradient colors (from homepage)
  gradients: {
    primary: 'from-purple-600 to-pink-600',
    secondary: 'from-blue-600 to-cyan-600', 
    tertiary: 'from-green-600 to-emerald-600',
    quaternary: 'from-orange-600 to-red-600',
    quinary: 'from-indigo-600 to-purple-600',
    success: 'from-green-600 to-emerald-600',
    hero: 'from-purple-400 via-pink-400 to-blue-400',
    text: 'from-white via-purple-200 to-blue-200'
  },
  
  // Text colors
  text: {
    primary: 'var(--color-text-primary)',
    secondary: 'var(--color-text-secondary)',
    tertiary: 'var(--color-text-tertiary)',
    muted: 'var(--color-gray-500)',
    accent: {
      purple: 'var(--color-purple-400)',
      pink: 'var(--color-pink-300)',
      blue: 'var(--color-blue-300)',
      green: 'var(--color-green-300)',
      orange: 'var(--color-orange-300)'
    }
  },
  
  // Interactive colors
  interactive: {
    hover: 'hover:bg-white/10',
    focus: 'focus:ring-2 focus:ring-purple-500',
    shadow: 'hover:shadow-purple-500/25',
    glow: '0 0 20px rgba(139, 92, 246, 0.5)'
  }
}

// Animation presets
export const animations = {
  // Page transitions
  pageTransition: {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: "easeOut" }
  },
  
  // Card hover effects
  cardHover: {
    whileHover: { y: -10, scale: 1.02 },
    transition: { duration: 0.3 }
  },
  
  // Floating animation (like homepage orbs)
  floating: {
    animate: {
      scale: [1, 1.2, 1],
      opacity: [0.3, 0.6, 0.3],
      x: [0, 30, 0],
      y: [0, -30, 0],
    },
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  },
  
  // Glow pulse effect
  glowPulse: {
    animate: {
      boxShadow: ["0 0 20px rgba(139, 92, 246, 0.5)", "0 0 40px rgba(139, 92, 246, 0.8)", "0 0 20px rgba(139, 92, 246, 0.5)"]
    },
    transition: { duration: 2, repeat: Infinity }
  },
  
  // Text gradient animation
  textGradient: {
    animate: {
      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
    },
    transition: { duration: 3, repeat: Infinity },
    style: { backgroundSize: "200% 200%" }
  },
  
  // Staggered children animation
  staggerChildren: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { staggerChildren: 0.1 }
  }
}

// Component styles
export const components = {
  // Card component style
  card: {
    base: 'bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 transition-all duration-300',
    hover: 'hover:border-purple-500/50 hover:shadow-2xl',
    padding: 'p-6'
  },
  
  // Button styles
  button: {
    primary: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300',
    secondary: 'border border-white/30 text-white hover:bg-white/10 rounded-full font-semibold transition-all duration-300 backdrop-blur-sm',
    ghost: 'text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300'
  },
  
  // Input styles
  input: {
    base: 'bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300',
    placeholder: 'placeholder-gray-400'
  },
  
  // Typography
  typography: {
    h1: 'text-6xl md:text-8xl lg:text-9xl font-black leading-none',
    h2: 'text-4xl md:text-5xl font-bold',
    h3: 'text-2xl md:text-3xl font-bold',
    body: 'text-gray-300',
    accent: 'bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent'
  }
}

// Layout patterns
export const layout = {
  section: 'py-20 bg-gradient-to-b from-black to-gray-900',
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  hero: 'min-h-screen flex items-center justify-center',
  cardGrid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'
}

// Utility classes for consistent styling
export const utils = {
  // Gradient text
  gradientText: (gradient: string = 'from-purple-400 to-pink-400') => 
    `bg-gradient-to-r ${gradient} bg-clip-text text-transparent`,
  
  // Glow effect
  glow: (color: string = 'purple') => 
    `shadow-${color}-500/25`,
  
  // Backdrop blur
  blur: (strength: string = 'sm') => 
    `backdrop-blur-${strength}`,
  
  // Interactive states
  interactive: (base: string, hover: string = '') => 
    `${base} transition-all duration-300 ${hover}`
}

// Dark theme Tailwind extensions
export const darkTheme = {
  extend: {
    colors: {
      background: colors.background.primary,
      foreground: colors.text.primary
    },
    animation: {
      'float': 'float 6s ease-in-out infinite',
      'glow': 'glow 2s ease-in-out infinite',
      'gradient': 'gradient 3s ease-in-out infinite'
    },
    keyframes: {
      float: {
        '0%, 100%': { transform: 'translateY(0px)' },
        '50%': { transform: 'translateY(-20px)' }
      },
      glow: {
        '0%, 100%': { boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)' },
        '50%': { boxShadow: '0 0 40px rgba(139, 92, 246, 0.8)' }
      },
      gradient: {
        '0%, 100%': { backgroundPosition: '0% 50%' },
        '50%': { backgroundPosition: '100% 50%' }
      }
    }
  }
}
