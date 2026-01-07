'use client'

import { useState, useMemo, useRef } from 'react'
import Navbar from '../Navbar'
import PhysioCard from '../Cards/PhysioCard'
import BottomSheet from '../UI/BottomSheet'
import GoalSettingModal from '../Modals/GoalSettingModal'
import HealthDataEntryModal from '../Modals/HealthDataEntryModal'
import BodyDataEntryModal from '../Modals/BodyDataEntryModal'
import EmptyModuleState from '../UI/EmptyModuleState'
import { PhysioMetric, ThomasMorel } from '@/data/mockData'
import { useLanguage } from '@/contexts/LanguageContext'
import { useVisitor } from '@/contexts/VisitorContext'
import { useHealthData } from '@/hooks/useHealthData'
import { useProfileData } from '@/hooks/useProfileData'

interface PhysioViewProps {
  metrics: PhysioMetric[]
  aiAnalysis: {
    title: string
    message: string
  }
  onAvatarClick: () => void
  onCardClick: (title: string, value: string, subtitle: string, color: string) => void
}

export default function PhysioView({ metrics, aiAnalysis, onAvatarClick, onCardClick }: PhysioViewProps) {
  const { t } = useLanguage()
  const { isVisitor } = useVisitor()
  const healthData = useHealthData()
  const profileData = useProfileData()

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showBodyDataModal, setShowBodyDataModal] = useState(false)
  const [selectedMetricType, setSelectedMetricType] = useState<'sleep' | 'activity' | 'weight' | 'hydration' | 'body' | null>(null)
  const [showToast, setShowToast] = useState<string | null>(null)
  const [aiAnalysisExpanded, setAiAnalysisExpanded] = useState(false)

  // Goal-setting modal state
  const [showGoalModal, setShowGoalModal] = useState(false)
  const [selectedGoalMetric, setSelectedGoalMetric] = useState<{
    id: string
    label: string
    color: string
  } | null>(null)

  const [metricGoals, setMetricGoals] = useState<{ [key: string]: { target: number; current: number } }>({
    'sleep': { target: 8, current: 5.6 },
    'activity': { target: 300, current: 210 },
    'steps': { target: 10000, current: 7000 },
    'weight': { target: 70, current: 70 },
    'hrv': { target: 50, current: 35 },
    'hydration': { target: 2.5, current: 1.75 },
  })

  // Metric units mapping
  const metricUnits: { [key: string]: string } = {
    'sleep': 'h',
    'activity': 'min',
    'steps': 'steps',
    'weight': 'kg',
    'hrv': 'ms',
    'hydration': 'L',
  }

  // Generate trend data for each metric (7 days)
  const metricTrends = useMemo(() => {
    const trends: { [key: string]: number[] } = {}
    Object.keys(metricGoals).forEach(key => {
      const goal = metricGoals[key]
      const baseValue = goal.current
      const trend: number[] = []
      for (let i = 6; i >= 0; i--) {
        const variation = (Math.random() - 0.4) * (baseValue * 0.15)
        trend.push(Math.max(0, baseValue + variation - (i * 0.05 * baseValue)))
      }
      trend[6] = baseValue // Today's value is accurate
      trends[key] = trend
    })
    return trends
  }, [metricGoals])

  const latestMeasurement = isVisitor ? ThomasMorel.moduleA.measurements[0] : (
    healthData.bodyMeasurements.length > 0 ? healthData.bodyMeasurements[0] : null
  )
  const latestSport = isVisitor ? ThomasMorel.moduleA.sport[0] : (
    healthData.sportSessions.length > 0 ? healthData.sportSessions[0] : null
  )

  // Check if user has required body data for composition section
  const hasBodyData = isVisitor || (
    profileData.profile?.height &&
    profileData.profile?.weight &&
    profileData.profile?.gender
  )

  // Show empty state for authenticated users without body data (height, weight, gender)
  // Once user enters body data, show metrics even if no activity data yet
  const showEmptyState = !isVisitor && !profileData.isLoading && !hasBodyData

  // Loading state
  if (!isVisitor && (healthData.isLoading || profileData.isLoading)) {
    return (
      <div className="content">
        <Navbar
          title={t('health')}
          subtitle={t('balance')}
          onAvatarClick={onAvatarClick}
          showAvatar={false}
          scrollContainerRef={scrollContainerRef}
        />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: 'var(--accent-sage) transparent transparent transparent' }}
          />
        </div>
      </div>
    )
  }

  // Empty state for new users
  if (showEmptyState) {
    return (
      <div ref={scrollContainerRef} className="content">
        <Navbar
          title={t('health')}
          subtitle={t('balance')}
          onAvatarClick={onAvatarClick}
          showAvatar={false}
          scrollContainerRef={scrollContainerRef}
        />
        <EmptyModuleState
          moduleName="Santé"
          moduleIcon="fa-heart-pulse"
          moduleColor="var(--accent-sage)"
          title="Commencez à suivre votre santé"
          description="Renseignez vos informations corporelles pour débloquer le suivi de vos métriques santé."
          actionLabel="Ajouter mes données"
          onAction={() => setShowBodyDataModal(true)}
        />

        {/* Body Data Entry Modal - Available even in empty state */}
        {profileData.profile?.id && (
          <BodyDataEntryModal
            isOpen={showBodyDataModal}
            onClose={() => setShowBodyDataModal(false)}
            userId={profileData.profile.id}
            currentData={{
              dateOfBirth: profileData.profile.dateOfBirth || undefined,
              gender: profileData.profile.gender || undefined,
              height: profileData.profile.height || undefined,
              weight: profileData.profile.weight || undefined,
            }}
            onSave={() => {
              setShowToast('Données enregistrées')
              setTimeout(() => setShowToast(null), 2000)
              // Force page reload to refresh data
              window.location.reload()
            }}
          />
        )}
      </div>
    )
  }

  // Map metric label/id to our modal types
  const mapMetricToType = (metricId: string): 'sleep' | 'activity' | 'weight' | 'hydration' | 'body' | null => {
    const mapping: { [key: string]: 'sleep' | 'activity' | 'weight' | 'hydration' | 'body' } = {
      'sleep': 'sleep',
      'sommeil': 'sleep',
      'activity': 'activity',
      'activité': 'activity',
      'workout': 'activity',
      'steps': 'activity',
      'pas': 'activity',
      'weight': 'weight',
      'poids': 'weight',
      'hydration': 'hydration',
      'eau': 'hydration',
      'water': 'hydration',
      'hrv': 'body',
      'body': 'body',
      'composition': 'body'
    }
    return mapping[metricId.toLowerCase()] || null
  }

  const handleLogData = (metricId: string) => {
    const type = mapMetricToType(metricId)
    if (type) {
      setSelectedMetricType(type)
      setShowAddModal(true)
    }
  }

  const handleSaveData = () => {
    setShowToast(t('saved'))
    setShowAddModal(false)
    setTimeout(() => setShowToast(null), 2000)
  }

  // Handle goal setting
  const handleOpenGoalModal = (metricId: string, label: string, color: string) => {
    setSelectedGoalMetric({ id: metricId, label, color })
    setShowGoalModal(true)
  }

  const handleSaveGoal = (metricId: string, newTarget: number) => {
    setMetricGoals(prev => ({
      ...prev,
      [metricId.toLowerCase()]: {
        ...prev[metricId.toLowerCase()],
        target: newTarget,
      }
    }))
    setShowToast(t('saved'))
    setTimeout(() => setShowToast(null), 2000)
  }

  return (
    <div ref={scrollContainerRef} className="content">
      <Navbar
        title={t('health')}
        subtitle={t('balance')}
        onAvatarClick={onAvatarClick}
        showAvatar={false}
        scrollContainerRef={scrollContainerRef}
      />

      {/* AI Analysis Card - Cliquable avec hover */}
      <div
        className="rounded-2xl p-5 mb-5 cursor-pointer transition-all active:scale-[0.98]"
        onClick={() => setAiAnalysisExpanded(!aiAnalysisExpanded)}
        style={{
          background: 'linear-gradient(135deg, rgba(139, 168, 136, 0.1) 0%, rgba(139, 168, 136, 0.05) 100%)',
          border: '1px solid rgba(139, 168, 136, 0.15)',
        }}
      >
        <div className="flex gap-4 items-start">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(139, 168, 136, 0.15)' }}
          >
            <i className="fa-solid fa-leaf" style={{ color: 'var(--accent-sage)' }} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <div
                className="font-medium text-sm"
                style={{ color: 'var(--text-primary)' }}
              >
                {aiAnalysis.title}
              </div>
              <i
                className={`fa-solid ${aiAnalysisExpanded ? 'fa-chevron-up' : 'fa-chevron-down'} text-xs transition-transform`}
                style={{ color: 'var(--text-tertiary)' }}
              />
            </div>
            <div
              className="text-xs leading-relaxed transition-all"
              style={{
                color: 'var(--text-secondary)',
                maxHeight: aiAnalysisExpanded ? '500px' : '60px',
                overflow: 'hidden',
              }}
            >
              {aiAnalysis.message}
            </div>
            {!aiAnalysisExpanded && (
              <div className="text-[10px] mt-2" style={{ color: 'var(--accent-sage)' }}>
                {t('readMore')}
              </div>
            )}
            {aiAnalysisExpanded && (
              <div
                className="text-xs leading-relaxed mt-3 pt-3"
                style={{
                  color: 'var(--text-secondary)',
                  borderTop: '1px solid rgba(139, 168, 136, 0.15)',
                }}
              >
                {t('aiHealthAnalysis')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Latest activity card */}
      {latestSport && (
        <div
          className="rounded-2xl p-4 mb-5 flex items-center gap-4"
          style={{
            background: 'rgba(201, 169, 98, 0.06)',
            border: '1px solid rgba(201, 169, 98, 0.1)',
          }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(201, 169, 98, 0.15)' }}
          >
            <i className="fa-solid fa-fire text-lg" style={{ color: 'var(--accent-gold)' }} />
          </div>
          <div className="flex-1">
            <div
              className="text-sm font-medium"
              style={{ color: 'var(--text-primary)' }}
            >
              {t('lastActivity')}
            </div>
            <div
              className="text-xs mt-0.5"
              style={{ color: 'var(--text-tertiary)' }}
            >
              {latestSport.type} • {latestSport.duration}min • {(latestSport as any).caloriesBurned || (latestSport as any).calories_burned || 0} kcal
            </div>
          </div>
          <div
            className="text-xs font-medium px-3 py-1 rounded-full"
            style={{
              background: latestSport.intensity === 'high' ? 'rgba(212, 165, 165, 0.2)' : 'rgba(139, 168, 136, 0.2)',
              color: latestSport.intensity === 'high' ? 'var(--accent-rose)' : 'var(--accent-sage)',
            }}
          >
            {latestSport.intensity === 'high' ? t('intensityIntense') : latestSport.intensity === 'moderate' ? t('intensityModerate') : t('intensityLight')}
          </div>
        </div>
      )}

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
          {t('metrics')}
        </span>
        <div className="h-px flex-1" style={{ background: 'var(--border-subtle)' }} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {metrics.map((metric, index) => {
          const goal = metricGoals[metric.id.toLowerCase()] || { target: 100, current: metric.progress }
          const progressPercent = goal.target > 0 ? (goal.current / goal.target) * 100 : 0
          const isGoalReached = progressPercent >= 100

          const trendData = metricTrends[metric.id.toLowerCase()] || []

          return (
            <PhysioCard
              key={metric.id}
              icon={metric.icon}
              label={metric.label}
              value={metric.value}
              valueColor={metric.valueColor}
              progress={isGoalReached ? 100 : progressPercent}
              progressColor={metric.progressColor}
              showProgress={isGoalReached}
              goal={goal.target}
              current={goal.current}
              trendData={trendData}
              onClick={() => {
                handleLogData(metric.id)
              }}
              onGoalClick={() => handleOpenGoalModal(metric.id, metric.label, metric.progressColor)}
              style={{ animationDelay: `${index * 60}ms` }}
            />
          )
        })}
      </div>

      {/* Body composition section - Uses profile data or body measurements */}
      {hasBodyData && (
        <>
          <div className="flex items-center gap-3 mb-5 mt-6 px-1">
            <div className="h-px flex-1" style={{ background: 'var(--border-subtle)' }} />
            <span
              className="text-sm tracking-[0.15em] uppercase font-semibold"
              style={{
                color: 'var(--text-primary)',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {t('bodyComposition')}
            </span>
            <div className="h-px flex-1" style={{ background: 'var(--border-subtle)' }} />
          </div>

          <div
            className="glass cursor-pointer transition-all active:scale-[0.98] rounded-2xl p-5 mb-5"
            onClick={() => setShowBodyDataModal(true)}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-md)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* Use body measurements if available, otherwise use profile data */}
            {(() => {
              // Get data from measurements first, then fall back to profile
              // Note: height is only stored in profile, not in body_measurements
              const weight = latestMeasurement?.weight || profileData.profile?.weight || 0
              const height = profileData.profile?.height || 170
              const bmi = height > 0 ? weight / ((height / 100) ** 2) : 0
              const bodyFat = (latestMeasurement as any)?.bodyFatPercentage || (latestMeasurement as any)?.body_fat_percentage
              const muscleMass = (latestMeasurement as any)?.muscleMass || (latestMeasurement as any)?.muscle_mass

              return (
                <>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div
                        className="text-xl font-light text-display"
                        style={{ color: 'var(--accent-gold)' }}
                      >
                        {weight || '--'}
                      </div>
                      <div className="text-[9px] uppercase tracking-wider mt-1" style={{ color: 'var(--text-muted)' }}>
                        kg
                      </div>
                    </div>
                    <div>
                      <div
                        className="text-xl font-light text-display"
                        style={{ color: bmi < 18.5 ? 'var(--accent-sky)' : bmi < 25 ? 'var(--accent-sage)' : bmi < 30 ? 'var(--accent-gold)' : 'var(--accent-rose)' }}
                      >
                        {bmi > 0 ? bmi.toFixed(1) : '--'}
                      </div>
                      <div className="text-[9px] uppercase tracking-wider mt-1" style={{ color: 'var(--text-muted)' }}>
                        IMC
                      </div>
                    </div>
                    <div>
                      <div
                        className="text-xl font-light text-display"
                        style={{ color: 'var(--accent-lavender)' }}
                      >
                        {height || '--'}
                      </div>
                      <div className="text-[9px] uppercase tracking-wider mt-1" style={{ color: 'var(--text-muted)' }}>
                        cm
                      </div>
                    </div>
                  </div>

                  {/* Only show advanced stats if we have body measurements */}
                  {latestMeasurement && (bodyFat || muscleMass) && (
                    <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border-light)' }}>
                      {bodyFat && (
                        <div className="flex justify-between text-xs mb-2">
                          <span style={{ color: 'var(--text-tertiary)' }}>{t('bodyFat')}</span>
                          <span style={{ color: 'var(--accent-sage)' }}>{bodyFat}%</span>
                        </div>
                      )}
                      {muscleMass && (
                        <div className="flex justify-between text-xs">
                          <span style={{ color: 'var(--text-tertiary)' }}>{t('muscleMass')}</span>
                          <span style={{ color: 'var(--accent-lavender)' }}>{muscleMass} kg</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Edit hint */}
                  <div className="mt-4 pt-3 flex items-center justify-center gap-2" style={{ borderTop: '1px solid var(--border-light)' }}>
                    <i className="fa-solid fa-pen-to-square text-xs" style={{ color: 'var(--text-muted)' }} />
                    <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      Appuyez pour modifier
                    </span>
                  </div>
                </>
              )
            })()}
          </div>
        </>
      )}

      {/* Espace en bas pour permettre le scroll complet jusqu'au bloc "body composition" */}
      <div className="h-32 mb-12" style={{ minHeight: '120px' }} />

      {/* Health Data Entry Modal */}
      {profileData.profile?.id && (
        <HealthDataEntryModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          userId={profileData.profile.id}
          metricType={selectedMetricType}
          onSave={() => {
            setShowToast(t('saved'))
            setTimeout(() => setShowToast(null), 2000)
            // Refresh health data
            healthData.refetch?.()
          }}
        />
      )}

      <style jsx>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>

      {/* Toast */}
      {showToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[600] px-5 py-3 rounded-xl" style={{ background: 'var(--accent-sage)', color: 'white', boxShadow: '0 8px 24px rgba(139, 168, 136, 0.3)', animation: 'fadeInToast 0.2s ease-out' }}>
          <i className="fa-solid fa-check mr-2" />{showToast}
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInToast {
          from { opacity: 0; transform: translate(-50%, -10px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-fadeInToast { animation: fadeInToast 0.2s ease-out; }
      `}</style>

      {/* Goal Setting Modal */}
      {selectedGoalMetric && (
        <GoalSettingModal
          isOpen={showGoalModal}
          onClose={() => setShowGoalModal(false)}
          metricId={selectedGoalMetric.id}
          metricLabel={selectedGoalMetric.label}
          currentValue={metricGoals[selectedGoalMetric.id.toLowerCase()]?.current || 0}
          currentTarget={metricGoals[selectedGoalMetric.id.toLowerCase()]?.target || 100}
          unit={metricUnits[selectedGoalMetric.id.toLowerCase()] || ''}
          color={selectedGoalMetric.color}
          onSave={handleSaveGoal}
        />
      )}
    </div>
  )
}