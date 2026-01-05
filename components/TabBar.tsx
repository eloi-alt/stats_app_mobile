'use client'

import { useRef } from 'react'
import { motion, PanInfo } from 'framer-motion'
import { useLanguage } from '@/contexts/LanguageContext'

interface TabBarProps {
  activeTab: string
  onTabChange: (tabId: string) => void
}

const TABS = [
  { id: 'view-physio', icon: 'fa-heart-pulse', labelKey: 'health' },
  { id: 'view-social', icon: 'fa-users', labelKey: 'trueCircle' },
  { id: 'view-home', icon: 'fa-house', labelKey: 'home' },
  { id: 'view-map', icon: 'fa-globe', labelKey: 'world' },
  { id: 'view-pro', icon: 'fa-briefcase', labelKey: 'career' },
]

export default function TabBar({ activeTab, onTabChange }: TabBarProps) {
  const { t } = useLanguage()
  const tabBarRef = useRef<HTMLElement>(null)

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const velocity = info.velocity.x
    const offset = info.offset.x
    const threshold = 30

    const currentIndex = TABS.findIndex((t) => t.id === activeTab)

    // Swipe right (positive) -> next tab
    if (velocity > 200 || offset > threshold) {
      if (currentIndex < TABS.length - 1) {
        onTabChange(TABS[currentIndex + 1].id)
      }
      return
    }

    // Swipe left (negative) -> previous tab
    if (velocity < -200 || offset < -threshold) {
      if (currentIndex > 0) {
        onTabChange(TABS[currentIndex - 1].id)
      }
      return
    }
  }

  return (
    <motion.nav
      ref={tabBarRef}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.1}
      onDragEnd={handleDragEnd}
      className="fixed bottom-0 left-0 right-0 h-[80px] rounded-t-[32px] flex justify-around items-center z-[9000] backdrop-blur-xl cursor-grab active:cursor-grabbing"
      style={{
        paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))',
        paddingTop: '12px',
        background: 'var(--bg-card)',
        borderTop: '1px solid var(--border-light)',
        boxShadow: '0 -4px 30px rgba(0, 0, 0, 0.08)',
        touchAction: 'pan-y',
      }}
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id

        return (
          <button
            key={tab.id}
            className="flex flex-col items-center justify-center transition-all duration-300 relative"
            onClick={() => onTabChange(tab.id)}
            style={{
              width: '44px',
              height: '44px',
            }}
            aria-label={t(tab.labelKey)}
            aria-current={isActive ? 'page' : undefined}
          >
            <div
              className="flex items-center justify-center"
              style={{
                width: '40px',
                height: '40px',
              }}
            >
              <i
                className={`fa-solid ${tab.icon}`}
                style={{
                  fontSize: isActive ? '24px' : '18px',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  opacity: isActive ? 1 : 0.7,
                  transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  transform: isActive ? 'scale(1.2)' : 'scale(1)',
                }}
              />
            </div>
          </button>
        )
      })}
    </motion.nav>
  )
}
