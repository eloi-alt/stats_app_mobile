'use client'

interface ComparisonCardProps {
  icon: string
  iconColor: string
  label: string
  value: string
  myProgress: number
  otherProgress: number
  myColor: string
  onClick?: () => void
}

export default function ComparisonCard({
  icon,
  iconColor,
  label,
  value,
  myProgress,
  otherProgress,
  myColor,
  onClick,
}: ComparisonCardProps) {
  return (
    <div
      className={`flex items-center mb-5 gap-4 ${onClick ? 'cursor-pointer transition-all active:scale-[0.98] hover:bg-black/[0.02] -mx-2 px-2 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400' : ''}`}
      onClick={onClick}
      onKeyDown={onClick ? (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onClick()) : undefined}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
      aria-label={onClick ? `${label}: ${value}. Click for details` : undefined}
    >
      <div
        className="w-10 h-10 flex items-center justify-center rounded-xl"
        style={{ background: `${iconColor}10`, color: iconColor }}
        aria-hidden="true"
      >
        <i className={`${icon} text-sm`} aria-hidden="true"></i>
      </div>
      <div className="flex-1">
        <div className="flex justify-between text-[12px] font-medium mb-2">
          <span style={{ color: 'var(--text-primary)' }}>{label}</span>
          <span
            className="transition-opacity duration-300"
            style={{ color: myColor }}
            role="status"
            aria-live="polite"
          >
            {value}
          </span>
        </div>
        <div className="flex flex-col gap-1.5" role="group" aria-label={`${label} comparison progress`}>
          <div
            className="relative h-1.5 rounded-full"
            style={{ background: 'rgba(0,0,0,0.03)' }}
            role="progressbar"
            aria-valuenow={myProgress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Your progress"
          >
            <div
              className="absolute top-0 left-0 h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${myProgress}%`, background: myColor }}
            />
          </div>
          <div
            className="relative h-1 rounded-full"
            style={{ background: 'rgba(0,0,0,0.02)' }}
            role="progressbar"
            aria-valuenow={otherProgress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Comparison group progress"
          >
            <div
              className="absolute top-0 left-0 h-full rounded-full opacity-30 transition-all duration-700 ease-out"
              style={{ width: `${otherProgress}%`, background: 'var(--text-secondary)' }}
            />
          </div>
        </div>
      </div>
      {onClick && (
        <i className="fa-solid fa-chevron-right text-xs" style={{ color: 'var(--text-muted)' }} aria-hidden="true" />
      )}
    </div>
  )
}

