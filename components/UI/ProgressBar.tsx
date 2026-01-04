'use client'

interface ProgressBarProps {
    progress: number
    color?: string
    height?: string
    showLabel?: boolean
    label?: string
    className?: string
}

export default function ProgressBar({
    progress,
    color = 'var(--accent-sage)',
    height = '6px',
    showLabel = false,
    label,
    className = '',
}: ProgressBarProps) {
    const clampedProgress = Math.min(100, Math.max(0, progress))

    return (
        <div className={className}>
            {showLabel && (
                <div className="flex justify-between text-[10px] mb-1">
                    <span style={{ color: 'var(--text-tertiary)' }}>{label}</span>
                    <span style={{ color }}>{Math.round(clampedProgress)}%</span>
                </div>
            )}
            <div
                className="relative rounded-full overflow-hidden"
                style={{ background: 'rgba(0, 0, 0, 0.04)', height }}
                role="progressbar"
                aria-valuenow={clampedProgress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={label || 'Progress'}
            >
                <div
                    className="absolute left-0 top-0 h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                        width: `${clampedProgress}%`,
                        background: color,
                    }}
                />
            </div>
        </div>
    )
}
