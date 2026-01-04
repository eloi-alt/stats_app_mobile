'use client'

import React from 'react'

interface ModuleCardSkeletonProps {
    /** Optional className for additional styling */
    className?: string
}

/**
 * Skeleton loader for Module domain cards
 * Matches the layout of actual domain cards in HomeView
 */
export default function ModuleCardSkeleton({ className = '' }: ModuleCardSkeletonProps) {
    return (
        <div
            className={`rounded-2xl p-4 animate-pulse ${className}`}
            style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-light)',
                boxShadow: 'var(--shadow-md)',
                backdropFilter: 'blur(20px)',
                minHeight: '180px',
            }}
        >
            <div className="flex flex-col h-full">
                {/* Header with icon and score placeholder */}
                <div className="flex items-center justify-between mb-3">
                    {/* Icon placeholder */}
                    <div
                        className="w-10 h-10 rounded-xl"
                        style={{ background: 'var(--hover-overlay)' }}
                    />
                    {/* Score placeholder */}
                    <div
                        className="w-12 h-7 rounded"
                        style={{ background: 'var(--hover-overlay)' }}
                    />
                </div>

                {/* Title placeholder */}
                <div
                    className="w-16 h-4 rounded mb-3"
                    style={{ background: 'var(--active-overlay)' }}
                />

                {/* Chart area placeholder */}
                <div
                    className="flex-1 mb-3 rounded-lg flex items-center justify-center"
                    style={{
                        minHeight: '80px',
                        background: 'var(--hover-overlay)',
                    }}
                >
                    {/* Simulated chart line */}
                    <svg width="140" height="40" className="opacity-30">
                        <path
                            d="M 10 30 Q 35 15, 70 25 T 130 20"
                            fill="none"
                            stroke="var(--text-tertiary)"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                    </svg>
                </div>

                {/* Progress bar placeholder */}
                <div
                    className="h-1 rounded-full w-full"
                    style={{ background: 'var(--hover-overlay)' }}
                />

                {/* Legend placeholder */}
                <div className="flex items-center justify-between mt-2">
                    <div
                        className="w-16 h-2 rounded"
                        style={{ background: 'var(--hover-overlay)' }}
                    />
                    <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: 'var(--hover-overlay)' }}
                    />
                    <div
                        className="w-12 h-2 rounded"
                        style={{ background: 'var(--hover-overlay)' }}
                    />
                </div>
            </div>
        </div>
    )
}
