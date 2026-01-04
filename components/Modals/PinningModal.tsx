'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Module } from '@/data/mockData'

interface PinningModalProps {
  isOpen: boolean
  onClose: () => void
  modules: Module[]
  currentPinnedId: string
  onPinModule: (moduleId: string) => void
}

export default function PinningModal({
  isOpen,
  onClose,
  modules,
  currentPinnedId,
  onPinModule,
}: PinningModalProps) {
  const [mounted, setMounted] = useState(false)

  // Pattern mounted pour éviter les erreurs SSR
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSelect = (moduleId: string) => {
    onPinModule(moduleId)
    onClose()
  }

  if (!isOpen || !mounted) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex flex-col justify-end"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md" />

      {/* Modal content - Bottom Sheet Standard */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full bg-[var(--bg-elevated)] rounded-t-[32px] pb-safe pt-6 px-6 shadow-[0_-8px_40px_rgba(0,0,0,0.15)] max-h-[85vh] overflow-y-auto cursor-default animate-slide-up"
      >
        {/* Handle bar */}
        <div className="w-10 h-1 rounded-full bg-black/10 mx-auto mb-6" />

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white">Épingler un module</h2>
            <p className="text-sm text-gray-400">Choisissez le module à afficher en premier</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:bg-white/20 transition-colors"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        {/* Module list */}
        <div className="space-y-2">
          {modules.map((module) => {
            const isPinned = module.id === currentPinnedId

            return (
              <button
                key={module.id}
                onClick={() => handleSelect(module.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 ${isPinned
                  ? 'bg-amber-500/10 border border-amber-500/30'
                  : 'bg-white/5 border border-transparent hover:bg-white/10'
                  }`}
              >
                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{ background: `${module.color}15` }}
                >
                  {module.icon}
                </div>

                {/* Info */}
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{module.title}</span>
                    {isPinned && (
                      <span className="text-[9px] uppercase tracking-wider text-amber-400 bg-amber-400/20 px-2 py-0.5 rounded-full">
                        Épinglé
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-400">{module.subtitle}</div>
                </div>

                {/* Score */}
                <div className="text-right">
                  <div
                    className="text-lg font-bold"
                    style={{ color: module.color }}
                  >
                    {module.percentage}%
                  </div>
                </div>

                {/* Pin icon */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isPinned ? 'bg-amber-400 text-black' : 'bg-white/10 text-gray-500'
                  }`}>
                  <i className={`fa-solid ${isPinned ? 'fa-thumbtack' : 'fa-plus'} text-xs`} />
                </div>
              </button>
            )
          })}
        </div>

        {/* Info text */}
        <div className="mt-6 text-center text-xs text-gray-500">
          Le module épinglé s&apos;affichera en grand sur votre écran d&apos;accueil
        </div>
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
    document.body
  )
}

