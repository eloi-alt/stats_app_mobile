'use client'

import { useEffect, useState, ReactNode, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence, PanInfo, useMotionValue, useTransform } from 'framer-motion'

interface ViewSheetProps {
    isOpen: boolean
    onClose: () => void
    children: ReactNode
    title?: string
}

/**
 * ViewSheet - A full-screen overlay view that can be swiped down to close
 * Used for Profile, Settings, and other secondary views
 */
export default function ViewSheet({
    isOpen,
    onClose,
    children,
    title,
}: ViewSheetProps) {
    const [mounted, setMounted] = useState(false)
    const contentRef = useRef<HTMLDivElement>(null)
    const y = useMotionValue(0)
    const opacity = useTransform(y, [0, 200], [1, 0.5])
    const scale = useTransform(y, [0, 200], [1, 0.95])

    // SSR safety
    useEffect(() => {
        setMounted(true)
    }, [])

    // Reset on open
    useEffect(() => {
        if (isOpen) {
            y.set(0)
            // Prevent body scroll
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen, y])

    const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const threshold = 100
        const velocity = info.velocity.y

        // Fast swipe down or dragged past threshold -> close
        if (velocity > 500 || info.offset.y > threshold) {
            onClose()
            return
        }

        // Otherwise snap back
        y.set(0)
    }

    // Only allow drag when scrolled to top
    const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        if (contentRef.current) {
            const isAtTop = contentRef.current.scrollTop <= 0
            // If not at top, prevent downward drag
            if (!isAtTop && info.offset.y > 0) {
                y.set(0)
            }
        }
    }

    if (!mounted) return null

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[9990] bg-black/40 backdrop-blur-sm"
                    />

                    {/* Sheet Container */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{
                            type: 'spring',
                            damping: 25,
                            stiffness: 300,
                            mass: 0.5,
                        }}
                        drag="y"
                        dragConstraints={{ top: 0, bottom: 0 }}
                        dragElastic={{ top: 0, bottom: 0.3 }}
                        onDrag={handleDrag}
                        onDragEnd={handleDragEnd}
                        style={{ y, opacity, scale }}
                        className="fixed inset-x-0 top-12 bottom-0 z-[9995] flex flex-col overflow-hidden"
                    >
                        {/* Main content area */}
                        <div
                            className="flex-1 rounded-t-[32px] flex flex-col overflow-hidden"
                            style={{
                                background: 'var(--bg-primary)',
                                boxShadow: '0 -8px 40px rgba(0, 0, 0, 0.2)',
                            }}
                        >
                            {/* Drag handle */}
                            <div className="flex-shrink-0 pt-3 pb-1 flex justify-center cursor-grab active:cursor-grabbing touch-none">
                                <div
                                    className="w-10 h-1 rounded-full"
                                    style={{ background: 'var(--separator-color)' }}
                                />
                            </div>

                            {/* Close indicator */}
                            <div className="flex-shrink-0 px-4 pb-2 flex items-center justify-between">
                                <button
                                    onClick={onClose}
                                    className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                                    style={{ background: 'var(--glass-bg)' }}
                                >
                                    <i className="fa-solid fa-chevron-down text-sm" style={{ color: 'var(--text-secondary)' }} />
                                </button>
                                {title && (
                                    <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                                        {title}
                                    </span>
                                )}
                                <div style={{ width: 32 }} />
                            </div>

                            {/* Scrollable content */}
                            <div
                                ref={contentRef}
                                className="flex-1 overflow-y-auto"
                                style={{ WebkitOverflowScrolling: 'touch' as any }}
                            >
                                {children}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    )
}
