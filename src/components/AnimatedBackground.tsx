import { motion } from 'framer-motion';

interface AnimatedBackgroundProps {
  /** Array of color values for the animated orbs. Uses design tokens by default */
  colors?: string[];
  /** Number of animated orbs to display */
  orbCount?: number;
  /** Size of each orb in pixels */
  orbSize?: number;
  /** Animation duration in seconds */
  duration?: number;
  /** Additional CSS classes for the container */
  className?: string;
}

/**
 * AnimatedBackground Component
 * 
 * Renders animated radial gradient orbs for page backgrounds.
 * Replaces inline style={background: radial-gradient(...)} patterns.
 * Uses colors from design system (src/styles/tokens/colors.css)
 * 
 * @example
 * // Default usage (6 orbs with primary colors)
 * <AnimatedBackground />
 * 
 * @example
 * // Custom colors and count
 * <AnimatedBackground 
 *   colors={['#8b5cf6', '#3b82f6', '#10b981']} 
 *   orbCount={3}
 * />
 */
export default function AnimatedBackground({
  colors: customColors,
  orbCount = 6,
  orbSize = 400,
  duration = 20,
  className = '',
}: AnimatedBackgroundProps) {
  // Default color palette from design tokens (src/styles/tokens/colors.css)
  const defaultColors = [
    'var(--ambient-color-1)',
    'var(--ambient-color-2)',
    'var(--ambient-color-3)',
    'var(--ambient-color-4)',
    // Fallback extras map back to chart colors if orbCount > 4
    'var(--chart-color-5)',
    'var(--chart-color-6)'
  ];

  const orbColors = customColors || defaultColors;

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {Array.from({ length: orbCount }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-3xl opacity-20"
          style={{
            width: orbSize,
            height: orbSize,
            background: `radial-gradient(circle, ${orbColors[i % orbColors.length]} 0%, transparent 70%)`,
          }}
          animate={{
            x: [
              Math.random() * window.innerWidth,
              Math.random() * window.innerWidth,
              Math.random() * window.innerWidth,
            ],
            y: [
              Math.random() * window.innerHeight,
              Math.random() * window.innerHeight,
              Math.random() * window.innerHeight,
            ],
          }}
          transition={{
            duration,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
}
