'use client'

import { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  onClick?: () => void
  className?: string
  style?: React.CSSProperties
}

export default function GlassCard({ children, onClick, className = '', style }: GlassCardProps) {
  return (
    <div
      className={`apple-glass rounded-3xl ${className}`}
      onClick={onClick}
      style={{
        padding: '20px',
        marginBottom: '12px',
        ...style,
      }}
    >
      {children}
    </div>
  )
}
