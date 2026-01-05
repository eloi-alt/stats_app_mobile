'use client'

import { ReactNode, useState, useEffect } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'

interface SwipeableViewContainerProps {
    activeView: string
    views: { id: string; content: ReactNode }[]
    onViewChange: (viewId: string) => void
    disabled?: boolean
}

export default function SwipeableViewContainer({
    activeView,
    views,
    onViewChange,
    disabled = false,
}: SwipeableViewContainerProps) {
    const [direction, setDirection] = useState(0)
    const [isDragging, setIsDragging] = useState(false)

    const currentIndex = views.findIndex((v) => v.id === activeView)

    const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        setIsDragging(false)

        if (disabled) return

        const threshold = 50
        const velocity = info.velocity.x
        const offset = info.offset.x

        // Swipe rapide vers la gauche -> vue suivante
        if (velocity < -500 || offset < -threshold) {
            if (currentIndex < views.length - 1) {
                setDirection(1)
                onViewChange(views[currentIndex + 1].id)
            }
            return
        }

        // Swipe rapide vers la droite -> vue précédente
        if (velocity > 500 || offset > threshold) {
            if (currentIndex > 0) {
                setDirection(-1)
                onViewChange(views[currentIndex - 1].id)
            }
            return
        }
    }

    // Update direction when view changes externally
    useEffect(() => {
        const newIndex = views.findIndex((v) => v.id === activeView)
        if (newIndex > currentIndex) {
            setDirection(1)
        } else if (newIndex < currentIndex) {
            setDirection(-1)
        }
    }, [activeView])

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? '100%' : '-100%',
            opacity: 0,
        }),
        center: {
            x: 0,
            opacity: 1,
        },
        exit: (direction: number) => ({
            x: direction > 0 ? '-100%' : '100%',
            opacity: 0,
        }),
    }

    return (
        <div className="relative w-full h-full overflow-hidden">
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
                <motion.div
                    key={activeView}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                        x: { type: 'spring', stiffness: 300, damping: 30 },
                        opacity: { duration: 0.2 },
                    }}
                    drag={disabled ? false : 'x'}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragStart={() => setIsDragging(true)}
                    onDragEnd={handleDragEnd}
                    className="absolute inset-0"
                    style={{
                        touchAction: 'pan-y',
                    }}
                >
                    {views.find((v) => v.id === activeView)?.content}
                </motion.div>
            </AnimatePresence>

            {/* Optional: Swipe indicators */}
            {isDragging && (
                <>
                    {currentIndex > 0 && (
                        <div
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center opacity-50"
                            style={{ background: 'var(--glass-bg)' }}
                        >
                            <i className="fa-solid fa-chevron-left text-xs" style={{ color: 'var(--text-muted)' }} />
                        </div>
                    )}
                    {currentIndex < views.length - 1 && (
                        <div
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center opacity-50"
                            style={{ background: 'var(--glass-bg)' }}
                        >
                            <i className="fa-solid fa-chevron-right text-xs" style={{ color: 'var(--text-muted)' }} />
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
