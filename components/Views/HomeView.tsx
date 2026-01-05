'use client'

import { useState, useMemo, useRef, useCallback } from 'react'
import Navbar from '../Navbar'
import { Module, HomeUserProfile } from '@/data/mockData'
import { useLanguage } from '@/contexts/LanguageContext'
import { getCurrentHarmonyScore } from '@/utils/harmonyCalculator'
import { getModuleHistoryValues, getModuleAverages, getModuleHistory } from '@/utils/moduleData'
import { getUnreadCount } from '@/data/notificationData'
import haptics from '@/utils/haptics'
import HarmonyHistoryModal from '../Modals/HarmonyHistoryModal'
import NotificationPanel from '../NotificationPanel'
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

export default function HomeView({
  userProfile,
  modules,
  onAvatarClick,
  onObjectiveClick,
}: HomeViewProps) {
  const { t } = useLanguage()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [harmonyModalOpen, setHarmonyModalOpen] = useState(false)
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [notificationsVersion, setNotificationsVersion] = useState(0)

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
      // Trigger refresh
      haptics.medium()
      setIsRefreshing(true)
    }
    setPullDistance(0)
    touchStartY.current = 0
  }, [pullDistance, isRefreshing])

  // Handle refresh completion
  const handleRefreshComplete = useCallback(() => {
    setIsRefreshing(false)
    haptics.success()
    // Here you would typically refetch data from Supabase
  }, [])

  // Handle card click with haptic
  const handleCardClick = useCallback((module: Module, colors: { primary: string }) => {
    haptics.light()
    onObjectiveClick(
      module.title,
      `${module.percentage}%`,
      module.detailSubtitle,
      colors.primary
    )
  }, [onObjectiveClick])

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
        scrollContainerRef={scrollContainerRef}
      />

      {/* Greeting section */}
      <div className="text-center mb-8 fade-in">
        <p
          className="text-sm font-medium tracking-wide mb-1"
          style={{ color: 'var(--text-tertiary)' }}
        >
          {greeting},
        </p>
        <h1
          className="text-3xl font-light text-display mb-2"
          style={{ color: 'var(--text-primary)' }}
        >
          {firstName}
        </h1>
        <p
          className="text-xs tracking-wide"
          style={{ color: 'var(--text-muted)' }}
        >
          {t('week')} {currentWeek} • {currentYear}
        </p>
      </div>

      {/* Main performance 3D Sphere with pull-to-refresh */}
      <div
        className="flex justify-center mb-4 emulsion-sphere-wrapper"
        style={{
          transform: pullDistance > 0 ? `translateY(${pullDistance * 0.3}px)` : 'none',
          transition: pullDistance === 0 ? 'transform 0.3s ease-out' : 'none',
          position: 'relative',
          zIndex: 10100, // Higher than navbar (10001) and avatar (10010)
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

      {/* Quick stats - Lowered to give more space to sphere */}
      <div
        className="flex justify-around mb-8 py-4 rounded-2xl mt-0"
        style={{ background: 'var(--hover-overlay)' }}
      >
        <div className="text-center">
          <div
            className="text-2xl font-light text-display"
            style={{ color: moduleColors[stats.topModule.id]?.primary || 'var(--accent-gold)' }}
          >
            {stats.topModule.percentage}%
          </div>
          <div className="text-[10px] tracking-wide uppercase mt-1" style={{ color: 'var(--text-tertiary)' }}>
            {t(moduleColors[stats.topModule.id]?.nameKey) || stats.topModule.title}
          </div>
          <div className="text-[9px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {t('best')}
          </div>
        </div>

        <div className="w-px" style={{ background: 'var(--border-subtle)' }} />

        <div className="text-center">
          <div
            className="text-2xl font-light text-display"
            style={{ color: 'var(--text-primary)' }}
          >
            {userProfile.connections}
          </div>
          <div className="text-[10px] tracking-wide uppercase mt-1" style={{ color: 'var(--text-tertiary)' }}>
            {t('connections')}
          </div>
          <div className="text-[9px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {t('tracked')}
          </div>
        </div>

        <div className="w-px" style={{ background: 'var(--border-subtle)' }} />

        <div className="text-center">
          <div
            className="text-2xl font-light text-display"
            style={{ color: moduleColors[stats.lowModule.id]?.primary || 'var(--accent-rose)' }}
          >
            {stats.lowModule.percentage}%
          </div>
          <div className="text-[10px] tracking-wide uppercase mt-1" style={{ color: 'var(--text-tertiary)' }}>
            {t(moduleColors[stats.lowModule.id]?.nameKey) || stats.lowModule.title}
          </div>
          <div className="text-[9px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {t('toImprove')}
          </div>
        </div>
      </div>

      {/* Spacer to push 'Your Domains' just below the fold */}
      <div style={{ height: '60px' }} />

      {/* Section title */}
      <div className="flex items-center gap-3 mb-5 px-1">
        <div className="h-px flex-1" style={{ background: 'var(--border-subtle)' }} />
        <span
          className="text-sm tracking-[0.15em] uppercase font-semibold"
          style={{
            color: 'var(--text-primary)',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {t('yourDomains')}
        </span>
        <div className="h-px flex-1" style={{ background: 'var(--border-subtle)' }} />
      </div>

      {/* Widgets améliorés - Grille 2 colonnes */}
      <div className="grid grid-cols-2 gap-3">
        {modules.map((module, index) => {
          const colors = moduleColors[module.id] || { primary: '#C9A962', light: 'rgba(201, 169, 98, 0.1)', name: module.title }
          const history = getModuleHistoryValues(module.id)
          const historyData = getModuleHistory(module.id)
          const averages = getModuleAverages(module.id)

          return (
            <div
              key={module.id}
              className="rounded-2xl p-4 cursor-pointer fade-in transition-all active:scale-[0.98]"
              onClick={() => handleCardClick(module, colors)}
              style={{
                animationDelay: `${index * 80}ms`,
                background: 'var(--bg-card)',
                border: '1px solid var(--border-light)',
                boxShadow: 'var(--shadow-md)',
                backdropFilter: 'blur(20px)',
                minHeight: '180px',
              }}
            >
              {/* Widget amélioré avec graphique intégré */}
              <div className="flex flex-col h-full">
                {/* Header avec icône et score */}
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: colors.light }}
                  >
                    <i className={`${module.icon} text-base`} style={{ color: colors.primary }} />
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span
                      className="text-2xl font-light text-display leading-none"
                      style={{ color: colors.primary }}
                    >
                      {module.percentage}
                    </span>
                    <span
                      className="text-xs ml-0.5"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      %
                    </span>
                  </div>
                </div>

                {/* Titre */}
                <h3
                  className="text-sm font-medium mb-3"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {t(colors.nameKey)}
                </h3>

                {/* Graphique principal - Plus grand et visible */}
                <div className="flex-1 mb-3 flex items-center justify-center" style={{ minHeight: '80px' }}>
                  <ModuleChart
                    data={history}
                    color={colors.primary}
                    friendsAvg={averages.friends}
                    nationalAvg={averages.national}
                    worldwideAvg={averages.worldwide}
                    height={80}
                    weekLabels={historyData.weeks}
                  />
                </div>

                {/* Progress bar compacte en bas */}
                <div className="bar-bg mt-auto" style={{ height: '4px', borderRadius: '2px' }}>
                  <div
                    className="bar-fill transition-all duration-500"
                    style={{
                      width: `${module.percentage}%`,
                      background: `linear-gradient(90deg, ${colors.primary}, ${colors.primary}88)`,
                      height: '100%',
                      borderRadius: '2px',
                    }}
                  />
                </div>

                {/* Légende des moyennes - Discrète */}
                <div className="flex items-center justify-between mt-2 text-[9px]" style={{ color: 'var(--text-tertiary)' }}>
                  <span>{t('friends')}: {averages.friends}%</span>
                  <span>•</span>
                  <span>{t('global')}: {averages.worldwide}%</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="h-4" />

      <HarmonyHistoryModal
        isOpen={harmonyModalOpen}
        onClose={() => setHarmonyModalOpen(false)}
      />

      <NotificationPanel
        isOpen={notificationPanelOpen}
        onClose={() => setNotificationPanelOpen(false)}
        onRefresh={handleNotificationRefresh}
      />
    </div>
  )
}

