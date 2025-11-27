import React from 'react'

interface ToggleFieldProps {
  label: string
  checked: boolean
  onChange: (value: boolean) => void
  className?: string
}

export function ToggleField({ label, checked, onChange, className }: ToggleFieldProps) {
  return (
    <label
      className={
        `flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/80 p-3 text-sm text-slate-600 ${className || ''}`
      }
    >
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.checked)}
        className="h-4 w-4 accent-primary-600"
      />
    </label>
  )
}

export default ToggleField
