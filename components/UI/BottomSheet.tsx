'use client'

import { useEffect, useState, ReactNode, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence, PanInfo, useMotionValue, useTransform } from 'framer-motion'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  initialHeight?: string // ex: "60vh"
  maxHeight?: string // ex: "90vh"
  showCloseButton?: boolean
}

export default function BottomSheet({
  isOpen,
  onClose,
  children,
  initialHeight = "60vh",
  maxHeight = "90vh",
  showCloseButton = true
}: BottomSheetProps) {
  const [mounted, setMounted] = useState(false)
  const [currentHeight, setCurrentHeight] = useState(initialHeight)
  const contentRef = useRef<HTMLDivElement>(null)
  const y = useMotionValue(0)

  // Sécurité SSR
  useEffect(() => {
    setMounted(true)
  }, [])

  // Réinitialiser la hauteur quand la modale s'ouvre
  useEffect(() => {
    if (isOpen) {
      setCurrentHeight(initialHeight)
      y.set(0)
    }
  }, [isOpen, initialHeight, y])

  // Convertir les hauteurs en pixels pour les calculs
  const getHeightInPx = (height: string) => {
    if (height.includes('vh')) {
      const vh = parseFloat(height)
      return (window.innerHeight * vh) / 100
    }
    return parseFloat(height)
  }

  // Gestion du drag avec snap points
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50 // Seuil en pixels pour déclencher une action
    const velocity = info.velocity.y
    const offset = info.offset.y

    const initialPx = getHeightInPx(initialHeight)
    const maxPx = getHeightInPx(maxHeight)
    const currentPx = getHeightInPx(currentHeight)

    // Si on glisse vite vers le bas (> 500) -> fermer
    if (velocity > 500) {
      onClose()
      return
    }

    // Si on glisse vers le bas au-delà du seuil -> fermer
    if (offset > threshold && currentPx <= initialPx) {
      onClose()
      return
    }

    // Si on glisse vers le haut au-delà du seuil -> étendre
    if (offset < -threshold && currentPx < maxPx) {
      setCurrentHeight(maxHeight)
      return
    }

    // Si on glisse vers le bas depuis la position étendue -> réduire
    if (offset > threshold && currentPx >= maxPx) {
      setCurrentHeight(initialHeight)
      return
    }

    // Sinon, revenir à la hauteur actuelle
    y.set(0)
  }

  // Variants pour l'animation d'entrée/sortie
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  }

  const sheetVariants = {
    hidden: { y: "100%" },
    visible: { y: 0 },
    exit: { y: "100%" }
  }

  // Gérer le conflit entre drag et scroll
  const handleDragStart = () => {
    if (contentRef.current) {
      const isAtTop = contentRef.current.scrollTop === 0
      // On ne permet le drag que si le contenu est scrollé en haut
      return isAtTop
    }
    return true
  }

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop avec animation */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[99990] bg-black/40 backdrop-blur-md"
          />

          {/* Draggable Sheet */}
          <motion.div
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            dragMomentum={false}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            variants={sheetVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 300,
              mass: 0.5
            }}
            className="fixed bottom-0 left-0 right-0 z-[99999] bg-[var(--bg-elevated)] rounded-t-[32px] shadow-[0_-8px_40px_rgba(0,0,0,0.15)] flex flex-col"
            style={{
              height: currentHeight,
              maxHeight: maxHeight,
              y: y
            }}
          >
            {/* Handle Area (Zone de grip) - Zone principale pour drag */}
            <div
              className="w-full pt-4 pb-2 cursor-grab active:cursor-grabbing flex justify-center touch-none"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <div
                className="w-10 h-1 rounded-full"
                style={{ background: 'var(--separator-color)' }}
              />
            </div>

            {/* Close button */}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center transition-colors z-10"
                style={{
                  background: 'var(--hover-overlay)',
                  color: 'var(--text-tertiary)',
                }}
              >
                <i className="fa-solid fa-xmark text-sm" />
              </button>
            )}

            {/* Content avec scroll interne */}
            <div
              ref={contentRef}
              className="flex-1 overflow-y-auto px-5 pb-safe"
              style={{
                WebkitOverflowScrolling: 'touch' as any,
              }}
            >
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}


