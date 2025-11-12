import { motion } from 'framer-motion';

interface ProgressBarProps {
  /** Progress value as a percentage (0-100) */
  value: number;
  /** Color variant for the progress bar */
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'blue' | 'green';
  /** Height of the progress bar */
  height?: 'sm' | 'md' | 'lg';
  /** Whether to show percentage label */
  showLabel?: boolean;
  /** Whether to animate the progress bar */
  animated?: boolean;
  /** Additional CSS classes for the container */
  className?: string;
  /** Label text to display above the bar */
  label?: string;
}

/**
 * ProgressBar Component
 * 
 * A reusable progress bar component that replaces inline style={{ width: `${percentage}%` }} patterns.
 * Uses design system colors and follows Tailwind conventions.
 * 
 * @example
 * // Basic usage
 * <ProgressBar value={75} />
 * 
 * @example
 * // With label and custom variant
 * <ProgressBar 
 *   value={85} 
 *   variant="success" 
 *   label="Acceptance Rate"
 *   showLabel 
 * />
 * 
 * @example
 * // Password strength indicator
 * <ProgressBar 
 *   value={passwordStrength} 
 *   variant={strength > 70 ? 'success' : 'warning'} 
 *   height="sm"
 *   animated 
 * />
 */
export default function ProgressBar({
  value,
  variant = 'primary',
  height = 'md',
  showLabel = false,
  animated = true,
  className = '',
  label,
}: ProgressBarProps) {
  // Clamp value between 0 and 100
  const clampedValue = Math.min(Math.max(value, 0), 100);

  // Height variants using design tokens
  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  // Color variants from design system
  const variantClasses = {
    primary: 'bg-gradient-to-r from-purple-500 to-blue-500',
    success: 'bg-gradient-to-r from-green-500 to-emerald-500',
    warning: 'bg-gradient-to-r from-yellow-500 to-orange-500',
    danger: 'bg-gradient-to-r from-red-500 to-rose-500',
    info: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    purple: 'bg-purple-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
  };

  const ProgressElement = animated ? motion.div : 'div';
  const progressProps = animated
    ? {
        initial: { width: 0 },
        animate: { width: `${clampedValue}%` },
        transition: { duration: 0.6, ease: 'easeOut' as const },
      }
    : { style: { width: `${clampedValue}%` } };

  return (
    <div className={className}>
      {/* Optional Label */}
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-300">{label}</span>
          {showLabel && (
            <span className="text-sm font-medium text-white">{clampedValue}%</span>
          )}
        </div>
      )}

      {/* Progress Bar Container */}
      <div className={`relative w-full ${heightClasses[height]} bg-gray-800 rounded-full overflow-hidden`}>
        {/* Progress Fill */}
        <ProgressElement
          className={`absolute inset-y-0 left-0 rounded-full ${variantClasses[variant]}`}
          {...progressProps}
        />
      </div>

      {/* Standalone Label (if no top label) */}
      {!label && showLabel && (
        <div className="mt-1 text-xs text-gray-400 text-right">{clampedValue}%</div>
      )}
    </div>
  );
}
