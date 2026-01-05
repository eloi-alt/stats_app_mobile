'use client'

import { ReactNode, useEffect, useState, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence, PanInfo, useMotionValue } from 'framer-motion'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  id: string
  title?: string
}

export default function Modal({ isOpen, onClose, children, id, title }: ModalProps) {
  const [mounted, setMounted] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const y = useMotionValue(0)

  // 1. Montage sécurisé
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // 2. Focus trap and keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
    // Tab trap
    if (e.key === 'Tab' && modalRef.current) {
      const focusable = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const first = focusable[0] as HTMLElement
      const last = focusable[focusable.length - 1] as HTMLElement
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last?.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first?.focus()
      }
    }
  }, [onClose])

  useEffect(() => {
    if (isOpen && mounted) {
      document.addEventListener('keydown', handleKeyDown)
      setTimeout(() => closeButtonRef.current?.focus(), 100)
    }
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, mounted, handleKeyDown])

  useEffect(() => {
    if (isOpen && mounted && typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden'
    } else {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = 'unset'
      }
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = 'unset'
      }
    }
  }, [isOpen, mounted])

  // Reset y on open
  useEffect(() => {
    if (isOpen) {
      y.set(0)
    }
  }, [isOpen, y])

  // Swipe to close handler
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 80
    const velocity = info.velocity.y

    // Fast swipe down or past threshold -> close
    if (velocity > 500 || info.offset.y > threshold) {
      onClose()
      return
    }

    // Snap back
    y.set(0)
  }

  // Only allow drag when content is at top
  const canDrag = () => {
    if (contentRef.current) {
      return contentRef.current.scrollTop <= 0
    }
    return true
  }

  if (!isOpen || !mounted || typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          id={id}
          className="fixed inset-0 z-[10010] flex flex-col justify-end"
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? `${id}-title` : undefined}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 backdrop-blur-md"
            style={{ background: 'var(--bg-overlay)' }}
            aria-hidden="true"
          />

          {/* Modal content - Draggable */}
          <motion.div
            ref={modalRef}
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
            dragElastic={{ top: 0, bottom: 0.2 }}
            dragListener={canDrag()}
            onDragEnd={handleDragEnd}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full rounded-t-[32px] pb-safe pt-2 max-h-[85vh] flex flex-col cursor-default"
            style={{
              y,
              background: 'var(--bg-elevated)',
              boxShadow: '0 -8px 40px rgba(0, 0, 0, 0.15)',
              borderTop: '1px solid var(--border-light)',
            }}
          >
            {/* Drag handle */}
            <div className="flex-shrink-0 pt-2 pb-4 flex justify-center cursor-grab active:cursor-grabbing touch-none">
              <div
                className="w-10 h-1 rounded-full"
                style={{ background: 'var(--separator-color)' }}
                aria-hidden="true"
              />
            </div>

            {/* Close button */}
            <button
              ref={closeButtonRef}
              className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors z-10"
              style={{
                background: 'var(--hover-overlay)',
                color: 'var(--text-tertiary)',
              }}
              onClick={onClose}
              aria-label="Close modal"
            >
              <i className="fa-solid fa-xmark text-sm" aria-hidden="true" />
            </button>

            {/* Title */}
            {title && (
              <h2
                id={`${id}-title`}
                className="text-xl font-light text-display mb-5 pr-10 px-5 flex-shrink-0"
                style={{ color: 'var(--text-primary)' }}
              >
                {title}
              </h2>
            )}

            {/* Scrollable content */}
            <div
              ref={contentRef}
              className="flex-1 overflow-y-auto px-5"
              style={{ WebkitOverflowScrolling: 'touch' as any }}
            >
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
