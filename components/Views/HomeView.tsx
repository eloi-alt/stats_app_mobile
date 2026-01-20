'use client'

import { useState, useMemo, useRef, useCallback } from 'react'
import Navbar from '../Navbar'
import { Module, HomeUserProfile } from '@/data/mockData'
import { useLanguage } from '@/contexts/LanguageContext'
import { getCurrentHarmonyScore, getHistoryForPeriod } from '@/utils/harmonyCalculator'
import { getModuleHistoryValues, getModuleAverages, getModuleHistory } from '@/utils/moduleData'
import { getUnreadCount } from '@/data/notificationData'
import haptics from '@/utils/haptics'
import HarmonyHistoryModal from '../Modals/HarmonyHistoryModal'
import NotificationPanel from '../NotificationPanel'
import ModuleDetailModal from '../Modals/ModuleDetailModal'
import ModuleChart from '../Cards/ModuleChart'
import dynamic from 'next/dynamic'
import CanvasSkeleton from '../Skeletons/CanvasSkeleton'

// Dynamic import for EmulsionSphere to avoid SSR issues with Three.js
const EmulsionSphere = dynamic(() => import('../Visualizations/EmulsionSphere'), {
  ssr: false,
  loading: () => <CanvasSkeleton type="sphere" height="280px" />
})

// Utility function to get ISO week number
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

interface HomeViewProps {
  userProfile: HomeUserProfile
  modules: Module[]
  pinnedModuleId: string
  isReorderMode: boolean
  onAvatarClick: () => void
  onObjectiveClick: (title: string, value: string, subtitle: string, color: string) => void
  onPinModule: (moduleId: string) => void
  onMoveUp: (moduleId: string) => void
  onMoveDown: (moduleId: string) => void
  onToggleReorderMode: () => void
}

// Module colors in spiritual palette
const moduleColors: Record<string, { primary: string; light: string; nameKey: string }> = {
  'A': { primary: '#8BA888', light: 'rgba(139, 168, 136, 0.1)', nameKey: 'moduleHealth' },
  'B': { primary: '#A5C4D4', light: 'rgba(165, 196, 212, 0.1)', nameKey: 'moduleWorld' },
  'C': { primary: '#C9A962', light: 'rgba(201, 169, 98, 0.1)', nameKey: 'moduleFinance' },
  'D': { primary: '#B8A5D4', light: 'rgba(184, 165, 212, 0.1)', nameKey: 'moduleAchievements' },
  'E': { primary: '#D4A5A5', light: 'rgba(212, 165, 165, 0.1)', nameKey: 'moduleCircle' },
}

// Pull-to-refresh threshold in pixels
const PULL_THRESHOLD = 80

// Selected module state type
interface SelectedModule {
  module: Module
  colors: { primary: string; light: string; nameKey: string }
  history: number[]
  weekLabels: string[]
  averages: { friends: number; national: number; worldwide: number }
}

export default function HomeView({
  userProfile,
  modules,
  onAvatarClick,
}: HomeViewProps) {
  const { t } = useLanguage()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [harmonyModalOpen, setHarmonyModalOpen] = useState(false)
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [notificationsVersion, setNotificationsVersion] = useState(0)
  const [selectedModule, setSelectedModule] = useState<SelectedModule | null>(null)

  // Get unread notification count - reactive to notificationsVersion
  const unreadCount = useMemo(() => getUnreadCount(), [notificationsVersion])

  const handleNotificationRefresh = useCallback(() => {
    setNotificationsVersion(v => v + 1)
  }, [])

  // Pull-to-refresh state
  const touchStartY = useRef(0)
  const [pullDistance, setPullDistance] = useState(0)

  // Calculate Harmony with historical data and degressive coefficients
  const harmonyScore = useMemo(() => getCurrentHarmonyScore(), [])

  // Calculate overall stats
  const stats = useMemo(() => {
    const avgScore = Math.round(modules.reduce((acc, m) => acc + m.percentage, 0) / modules.length)
    const topModule = modules.reduce((a, b) => a.percentage > b.percentage ? a : b)
    const lowModule = modules.reduce((a, b) => a.percentage < b.percentage ? a : b)
    return { avgScore, topModule, lowModule }
  }, [modules])

  // Get greeting based on time
  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return t('goodMorning')
    if (hour < 18) return t('goodAfternoon')
    return t('goodEvening')
  }, [t])

  const firstName = userProfile?.name?.split(' ')[0] || 'User'

  // System date for year and week
  const currentDate = useMemo(() => new Date(), [])
  const currentYear = currentDate.getFullYear()
  const currentWeek = getWeekNumber(currentDate)

  // Pull-to-refresh handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (scrollContainerRef.current?.scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY
    }
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartY.current > 0 && scrollContainerRef.current?.scrollTop === 0) {
      const currentY = e.touches[0].clientY
      const distance = Math.max(0, currentY - touchStartY.current)
      setPullDistance(Math.min(distance, PULL_THRESHOLD * 1.5))
    }
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
      haptics.medium()
      setIsRefreshing(true)
    }
    setPullDistance(0)
    touchStartY.current = 0
  }, [pullDistance, isRefreshing])

  // Handle card click - open detail modal
  const handleCardClick = useCallback((module: Module, colors: typeof moduleColors['A']) => {
    haptics.light()
    const history = getModuleHistoryValues(module.id)
    const historyData = getModuleHistory(module.id)
    const averages = getModuleAverages(module.id)

    setSelectedModule({
      module,
      colors,
      history,
      weekLabels: historyData.weeks,
      averages
    })
  }, [])

  // Handle harmony modal with haptic
  const handleHarmonyClick = useCallback(() => {
    if (!isRefreshing) {
      haptics.medium()
      setHarmonyModalOpen(true)
    }
  }, [isRefreshing])

  return (
    <div
      ref={scrollContainerRef}
      className="content"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <Navbar
        onAvatarClick={onAvatarClick}
        onNotificationClick={() => {
          haptics.light()
          setNotificationPanelOpen(true)
        }}
        notificationCount={unreadCount}
        showAvatar={true}
        avatarUrl={userProfile.avatar}
        scrollContainerRef={scrollContainerRef}
      />

      {/* Greeting section - compact */}
      <div className="text-center mb-5 fade-in">
        <p
          className="text-sm font-medium tracking-wide mb-0.5"
          style={{ color: 'var(--text-tertiary)' }}
        >
          {greeting},
        </p>
        <h1
          className="text-2xl font-light text-display mb-1"
          style={{ color: 'var(--text-primary)' }}
        >
          {firstName}
        </h1>
        <p
          className="text-[10px] tracking-wide"
          style={{ color: 'var(--text-muted)' }}
        >
          {t('week')} {currentWeek} • {currentYear}
        </p>
      </div>

      {/* Main performance 3D Sphere */}
      <div
        className="flex justify-center mb-3 emulsion-sphere-wrapper"
        style={{
          transform: pullDistance > 0 ? `translateY(${pullDistance * 0.3}px)` : 'none',
          transition: pullDistance === 0 ? 'transform 0.3s ease-out' : 'none',
          position: 'relative',
          zIndex: 10100,
          overflow: 'visible',
        }}
      >
        <EmulsionSphere
          number={harmonyScore}
          onClick={handleHarmonyClick}
        />
      </div>

      {/* Pull indicator */}
      {pullDistance > 0 && !isRefreshing && (
        <div
          className="absolute left-1/2 -translate-x-1/2 text-xs font-medium tracking-wide"
          style={{
            top: '120px',
            color: pullDistance >= PULL_THRESHOLD ? 'var(--text-primary)' : 'var(--text-muted)',
            opacity: Math.min(pullDistance / PULL_THRESHOLD, 1),
            transition: 'color 0.2s ease'
          }}
        >
          {pullDistance >= PULL_THRESHOLD ? t('releaseToRefresh') : t('pullToRefresh')}
        </div>
      )}

      {/* Quick stats - Compact */}
      <div
        className="flex justify-around mb-3 py-2.5 rounded-xl"
        style={{ background: 'var(--hover-overlay)' }}
      >
        <div className="text-center px-2">
          <div
            className="text-lg font-light text-display"
            style={{ color: moduleColors[stats.topModule.id]?.primary || 'var(--accent-gold)' }}
          >
            {stats.topModule.percentage}%
          </div>
          <div className="text-[8px] tracking-wide uppercase" style={{ color: 'var(--text-muted)' }}>
            {t('best')}
          </div>
        </div>

        <div className="w-px" style={{ background: 'var(--border-subtle)' }} />

        <div className="text-center px-2">
          <div
            className="text-lg font-light text-display"
            style={{ color: 'var(--text-primary)' }}
          >
            {userProfile.connections}
          </div>
          <div className="text-[8px] tracking-wide uppercase" style={{ color: 'var(--text-muted)' }}>
            {t('connections')}
          </div>
        </div>

        <div className="w-px" style={{ background: 'var(--border-subtle)' }} />

        <div className="text-center px-2">
          <div
            className="text-lg font-light text-display"
            style={{ color: moduleColors[stats.lowModule.id]?.primary || 'var(--accent-rose)' }}
          >
            {stats.lowModule.percentage}%
          </div>
          <div className="text-[8px] tracking-wide uppercase" style={{ color: 'var(--text-muted)' }}>
            {t('toImprove')}
          </div>
        </div>
      </div>

      {/* Section title - compact */}
      <div className="flex items-center gap-2 mb-2.5 px-1">
        <div className="h-px flex-1" style={{ background: 'var(--border-subtle)' }} />
        <span
          className="text-[10px] tracking-[0.12em] uppercase font-semibold"
          style={{ color: 'var(--text-tertiary)' }}
        >
          {t('yourDomains')}
        </span>
        <div className="h-px flex-1" style={{ background: 'var(--border-subtle)' }} />
      </div>

      {/* Compact Module Cards - 2x2 Grid */}
      <div className="grid grid-cols-2 gap-2">
        {modules.map((module, index) => {
          const colors = moduleColors[module.id] || { primary: '#C9A962', light: 'rgba(201, 169, 98, 0.1)', nameKey: module.title }
          const history = getModuleHistoryValues(module.id)
          const historyData = getModuleHistory(module.id)

          // Calculate trend
          const trend = history.length >= 2
            ? history[history.length - 1] - history[history.length - 2]
            : 0

          return (
            <div
              key={module.id}
              className="rounded-2xl p-3 cursor-pointer fade-in transition-all active:scale-[0.97]"
              onClick={() => handleCardClick(module, colors)}
              style={{
                animationDelay: `${index * 50}ms`,
                background: 'var(--bg-card)',
                border: '1px solid var(--border-light)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              {/* Ultra-compact card layout */}
              <div className="flex flex-col" style={{ minHeight: '100px' }}>
                {/* Header row: Icon + Title + Score */}
                <div className="flex items-center gap-2 mb-1.5">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: colors.light }}
                  >
                    <i className={`${module.icon} text-xs`} style={{ color: colors.primary }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className="text-[11px] font-medium truncate leading-tight"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {t(colors.nameKey)}
                    </h3>
                  </div>
                  <div className="flex items-baseline gap-0.5 flex-shrink-0">
                    <span
                      className="text-lg font-light text-display leading-none"
                      style={{ color: colors.primary }}
                    >
                      {module.percentage}
                    </span>
                    <span
                      className="text-[9px]"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      %
                    </span>
                  </div>
                </div>

                {/* Sparkline chart */}
                <div className="flex-1 flex items-center px-0.5" style={{ minHeight: '36px' }}>
                  <ModuleChart
                    data={history}
                    color={colors.primary}
                    height={36}
                    weekLabels={historyData.weeks}
                    compact={true}
                    showAverages={false}
                  />
                </div>

                {/* Bottom row: Week label + Trend */}
                <div className="flex items-center justify-between mt-1 pt-1" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                  <span
                    className="text-[8px]"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {historyData.weeks[historyData.weeks.length - 1] || ''}
                  </span>
                  {trend !== 0 ? (
                    <div
                      className="flex items-center gap-0.5 text-[9px] font-medium px-1.5 py-0.5 rounded-full"
                      style={{
                        color: trend > 0 ? 'var(--accent-sage)' : 'var(--accent-rose)',
                        background: trend > 0 ? 'rgba(139, 168, 136, 0.1)' : 'rgba(212, 165, 165, 0.1)'
                      }}
                    >
                      <i className={`fa-solid ${trend > 0 ? 'fa-arrow-up' : 'fa-arrow-down'} text-[7px]`} />
                      {Math.abs(trend)}
                    </div>
                  ) : (
                    <div
                      className="text-[8px] px-1.5 py-0.5 rounded-full"
                      style={{ color: 'var(--text-muted)', background: 'var(--hover-overlay)' }}
                    >
                      —
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="h-4" />

      {/* Modals */}
      <HarmonyHistoryModal
        isOpen={harmonyModalOpen}
        onClose={() => setHarmonyModalOpen(false)}
      />

      <NotificationPanel
        isOpen={notificationPanelOpen}
        onClose={() => setNotificationPanelOpen(false)}
        onRefresh={handleNotificationRefresh}
      />

      {/* Module Detail Modal */}
      {selectedModule && (
        <ModuleDetailModal
          isOpen={!!selectedModule}
          onClose={() => setSelectedModule(null)}
          title={t(selectedModule.colors.nameKey)}
          value={`${selectedModule.module.percentage}%`}
          subtitle={selectedModule.module.detailSubtitle}
          color={selectedModule.colors.primary}
          moduleId={selectedModule.module.id}
          historyData={selectedModule.history}
          weekLabels={selectedModule.weekLabels}
          averages={selectedModule.averages}
        />
      )}
    </div>
  )
}
