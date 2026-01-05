'use client'

import { ReactNode, useState } from 'react'
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion'

interface SwipeAction {
    icon: string
    color: string
    bgColor: string
    label: string
    onClick: () => void
}

interface SwipeableCardProps {
    children: ReactNode
    leftActions?: SwipeAction[]
    rightActions?: SwipeAction[]
    className?: string
}

/**
 * SwipeableCard - A card that reveals actions when swiped horizontally
 * Used for contact cards, objective cards, etc.
 */
export default function SwipeableCard({
    children,
    leftActions = [],
    rightActions = [],
    className = '',
}: SwipeableCardProps) {
    const [isRevealed, setIsRevealed] = useState<'left' | 'right' | null>(null)
    const x = useMotionValue(0)

    // Calculate opacity of action buttons based on drag distance
    const leftOpacity = useTransform(x, [0, 80], [0, 1])
    const rightOpacity = useTransform(x, [-80, 0], [1, 0])

    const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const threshold = 60
        const velocity = info.velocity.x
        const offset = info.offset.x

        // Swipe right -> reveal left actions
        if ((velocity > 300 || offset > threshold) && leftActions.length > 0) {
            setIsRevealed('left')
            return
        }

        // Swipe left -> reveal right actions
        if ((velocity < -300 || offset < -threshold) && rightActions.length > 0) {
            setIsRevealed('right')
            return
        }

        // Reset
        setIsRevealed(null)
    }

    const handleActionClick = (action: SwipeAction) => {
        action.onClick()
        setIsRevealed(null)
    }

    const handleCardClick = () => {
        if (isRevealed) {
            setIsRevealed(null)
        }
    }

    return (
        <div className={`relative overflow-hidden rounded-2xl ${className}`}>
            {/* Left Actions (revealed on swipe right) */}
            {leftActions.length > 0 && (
                <motion.div
                    className="absolute left-0 top-0 bottom-0 flex items-center gap-2 pl-3"
                    style={{ opacity: isRevealed === 'left' ? 1 : leftOpacity }}
                >
                    {leftActions.map((action, index) => (
                        <button
                            key={index}
                            onClick={() => handleActionClick(action)}
                            className="w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-1 transition-transform active:scale-95"
                            style={{ background: action.bgColor }}
                        >
                            <i className={`fa-solid ${action.icon} text-sm`} style={{ color: action.color }} />
                            <span className="text-[9px]" style={{ color: action.color }}>{action.label}</span>
                        </button>
                    ))}
                </motion.div>
            )}

            {/* Right Actions (revealed on swipe left) */}
            {rightActions.length > 0 && (
                <motion.div
                    className="absolute right-0 top-0 bottom-0 flex items-center gap-2 pr-3"
                    style={{ opacity: isRevealed === 'right' ? 1 : rightOpacity }}
                >
                    {rightActions.map((action, index) => (
                        <button
                            key={index}
                            onClick={() => handleActionClick(action)}
                            className="w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-1 transition-transform active:scale-95"
                            style={{ background: action.bgColor }}
                        >
                            <i className={`fa-solid ${action.icon} text-sm`} style={{ color: action.color }} />
                            <span className="text-[9px]" style={{ color: action.color }}>{action.label}</span>
                        </button>
                    ))}
                </motion.div>
            )}

            {/* Main Card Content */}
            <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.1}
                onDragEnd={handleDragEnd}
                onClick={handleCardClick}
                animate={{
                    x: isRevealed === 'left' ? 140 : isRevealed === 'right' ? -140 : 0,
                }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                style={{ x, touchAction: 'pan-y' }}
                className="relative z-10 cursor-grab active:cursor-grabbing"
            >
                {children}
            </motion.div>
        </div>
    )
}
