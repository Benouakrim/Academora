

type Props = {
  value: number
  min?: number
  max?: number
  step?: number
  onChange: (v: number) => void
  label?: string
}

export default function RangeSlider({ value, min = 0, max = 100, step = 1, onChange, label }: Props) {
  const percentage = ((value - min) / (max - min || 1)) * 100

  return (
    <div className="space-y-2.5">
      {label && <div className="text-sm font-semibold text-slate-800 tracking-tight">{label}</div>}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[180px] md:max-w-[320px]">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full appearance-none h-2 rounded-full bg-slate-200/80 focus:outline-none focus:ring-2 focus:ring-primary-200"
            style={{
              background: `linear-gradient(90deg, var(--slider-progress-academic) ${percentage}%, var(--slider-track) ${percentage}%)`,
            }}
          />
        </div>
        <div className="inline-flex min-w-[64px] items-center justify-center rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-sm font-semibold text-slate-700 shadow-sm">
          {value}
        </div>
      </div>
    </div>
  )
}
