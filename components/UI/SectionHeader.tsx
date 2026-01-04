'use client'

interface SectionHeaderProps {
    title: string
    uppercase?: boolean
    centered?: boolean
    className?: string
}

export default function SectionHeader({
    title,
    uppercase = true,
    centered = true,
    className = '',
}: SectionHeaderProps) {
    return (
        <div className={`flex items-center gap-3 mb-4 px-1 ${className}`}>
            {centered && (
                <div className="h-px flex-1" style={{ background: 'var(--border-subtle)' }} aria-hidden="true" />
            )}
            <h2
                className={`font-semibold ${uppercase ? 'text-[10px] tracking-[0.2em] uppercase' : 'text-sm tracking-[0.15em]'}`}
                style={{
                    color: centered ? 'var(--text-tertiary)' : 'var(--text-primary)',
                    fontFamily: 'Inter, sans-serif',
                }}
            >
                {title}
            </h2>
            {centered && (
                <div className="h-px flex-1" style={{ background: 'var(--border-subtle)' }} aria-hidden="true" />
            )}
        </div>
    )
}
