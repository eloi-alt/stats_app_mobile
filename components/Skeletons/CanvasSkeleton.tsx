'use client'

import React from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

interface CanvasSkeletonProps {
    /** Height of the skeleton container */
    height?: string
    /** Optional className for additional styling */
    className?: string
    /** Type of skeleton - sphere or globe */
    type?: 'sphere' | 'globe'
}

/**
 * Skeleton loader for Canvas/3D components
 * Shows a pulsing placeholder while 3D content loads
 */
export default function CanvasSkeleton({
    height = '280px',
    className = '',
    type = 'sphere'
}: CanvasSkeletonProps) {
    const { t } = useLanguage()

    return (
        <div
            className={`relative flex items-center justify-center ${className}`}
            style={{
                height,
                width: '100%',
            }}
        >
            {/* Pulsing circle placeholder */}
            <div
                className="animate-pulse rounded-full"
                style={{
                    width: type === 'sphere' ? '180px' : '300px',
                    height: type === 'sphere' ? '180px' : '300px',
                    background: type === 'sphere'
                        ? 'linear-gradient(135deg, rgba(140, 200, 150, 0.3) 0%, rgba(100, 160, 180, 0.3) 100%)'
                        : 'linear-gradient(135deg, rgba(100, 150, 200, 0.3) 0%, rgba(80, 120, 160, 0.2) 100%)',
                    boxShadow: '0 0 40px rgba(140, 200, 150, 0.15)',
                }}
            />

            {/* Loading text */}
            <div
                className="absolute bottom-4 text-xs tracking-wide uppercase animate-pulse"
                style={{ color: 'var(--text-muted)' }}
            >
                {t('loading')}
            </div>
        </div>
    )
}
