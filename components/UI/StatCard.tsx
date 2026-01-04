'use client'

interface StatCardProps {
    value: string | number
    label: string
    icon?: string
    color?: string
    className?: string
}

export default function StatCard({
    value,
    label,
    icon,
    color = 'var(--accent-gold)',
    className = '',
}: StatCardProps) {
    return (
        <div
            className={`rounded-xl p-4 text-center ${className}`}
            style={{
                background: `${color}10`,
                border: `1px solid ${color}20`,
            }}
            role="group"
            aria-label={`${label}: ${value}`}
        >
            {icon && (
                <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2"
                    style={{ background: `${color}15` }}
                    aria-hidden="true"
                >
                    <i className={icon} style={{ color }} />
                </div>
            )}
            <div
                className="text-xl font-light text-display"
                style={{ color }}
                role="status"
                aria-live="polite"
            >
                {value}
            </div>
            <div
                className="text-[9px] uppercase tracking-wider mt-1"
                style={{ color: 'var(--text-muted)' }}
            >
                {label}
            </div>
        </div>
    )
}
