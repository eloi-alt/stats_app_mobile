'use client'

interface ObjectiveCardProps {
  title: string
  percentage: number
  color: string
  subtitle: string
  icon?: string
  onClick?: () => void
}

export default function ObjectiveCard({
  title,
  percentage,
  color,
  subtitle,
  icon,
  onClick,
}: ObjectiveCardProps) {
  return (
    <div 
      className="glass cursor-pointer relative" 
      onClick={onClick}
      style={{
        borderLeft: `3px solid ${color}`,
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon && (
            <i 
              className={`${icon} text-sm`} 
              style={{ color }} 
            />
          )}
          <span 
            className="text-[11px] uppercase tracking-[0.15em] font-medium"
            style={{ color: 'var(--text-tertiary)' }}
          >
            {title}
          </span>
        </div>
        <span 
          className="text-lg font-light text-display"
          style={{ color }}
        >
          {percentage}%
        </span>
      </div>
      
      <div className="bar-bg">
        <div
          className="bar-fill"
          style={{ 
            width: `${percentage}%`, 
            background: `linear-gradient(90deg, ${color}, ${color}88)`,
          }}
        />
      </div>
      
      <div 
        className="text-xs mt-2 font-normal"
        style={{ color: 'var(--text-secondary)' }}
      >
        {subtitle}
      </div>
      
      <i
        className="fa-solid fa-chevron-right absolute right-5 top-1/2 -translate-y-1/2 text-xs"
        style={{ color: 'var(--text-muted)' }}
      />
    </div>
  )
}
