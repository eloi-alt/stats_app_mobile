'use client'

import { ReactNode, useEffect, useState, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'

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
      // Focus close button when modal opens
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

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  // 2. Condition d'arrêt stricte : Si pas monté OU pas de document -> RETURN NULL
  if (!isOpen || !mounted || typeof document === 'undefined') return null

  // 3. Rendu Portal sécurisé avec document.body
  return createPortal(
    <div
      id={id}
      className="fixed inset-0 z-[10010] flex flex-col justify-end"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? `${id}-title` : undefined}
    >
      {/* Backdrop - Plus sombre en dark mode */}
      <div
        className="absolute inset-0 backdrop-blur-md"
        style={{
          background: 'var(--bg-overlay)',
        }}
        aria-hidden="true"
      />

      {/* Modal content - Bottom Sheet Standard */}
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full rounded-t-[32px] pb-safe pt-6 px-5 max-h-[85vh] overflow-y-auto cursor-default animate-slide-up"
        style={{
          background: 'var(--bg-elevated)',
          boxShadow: '0 -8px 40px rgba(0, 0, 0, 0.15)',
          // Hairline border for dark mode elevation
          borderTop: '1px solid var(--border-light)',
        }}
      >
        {/* Handle bar - Adaptatif au thème */}
        <div
          className="w-10 h-1 rounded-full mx-auto mb-6"
          style={{ background: 'var(--separator-color)' }}
          aria-hidden="true"
        />

        {/* Close button - Dark mode support */}
        <button
          ref={closeButtonRef}
          className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors"
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
            className="text-xl font-light text-display mb-5 pr-10"
            style={{ color: 'var(--text-primary)' }}
          >
            {title}
          </h2>
        )}

        {children}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>,
    document.body // <--- CIBLE DU PORTAL OBLIGATOIRE
  )
}
