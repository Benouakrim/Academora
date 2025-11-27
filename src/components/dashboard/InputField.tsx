import React from 'react'

interface InputFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

export function InputField({ label, value, onChange, type = 'text', required, disabled, className }: InputFieldProps) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <input
        type={type}
        value={value}
        required={required}
        disabled={disabled}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        className="rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
      />
    </div>
  )
}

export default InputField
