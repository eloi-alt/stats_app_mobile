'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import Modal from './Modal'
import BottomSheet from '../UI/BottomSheet'
import { useLanguage } from '@/contexts/LanguageContext'
import {
  getHarmonyData,
  calculateObjectiveProgress,
  getHistoryForPeriod,
  generateTrendAnalysis,
  generateExpandedAIReport,
  HarmonyDimension,
  HarmonyObjective,
  DetailedHistoryPoint,
  getAIHarmonyAnalysis,
  HarmonyAIResponse
} from '@/utils/harmonyCalculator'
import PerformanceAreaChart from '../Charts/PerformanceAreaChart'
import LogarithmicHistoryChart from '../Charts/LogarithmicHistoryChart'
import DimensionRadarChart from '../Charts/DimensionRadarChart'

interface HarmonyHistoryModalProps {
  isOpen: boolean
  onClose: () => void
}

// Dimension display configuration
const dimensionConfig: { [key in HarmonyDimension]: { icon: string; label: string; color: string } } = {
  health: { icon: 'fa-heart-pulse', label: 'Santé', color: '#8BA888' },
  finance: { icon: 'fa-coins', label: 'Finance', color: '#C9A962' },
  social: { icon: 'fa-users', label: 'Social', color: '#D4A5A5' },
  career: { icon: 'fa-briefcase', label: 'Carrière', color: '#B8A5D4' },
  world: { icon: 'fa-globe', label: 'Monde', color: '#A5C4D4' },
}

// Get color based on score (red to green)
function getScoreColor(score: number): string {
  if (score >= 80) return '#00897b'
  if (score >= 60) return '#7cb342'
  if (score >= 40) return '#fdd835'
  if (score >= 20) return '#fb8c00'
  return '#e53935'
}

// Get proximity label based on priority
function getPriorityLabel(priority: 'high' | 'medium' | 'low'): { label: string; bgColor: string; textColor: string } {
  switch (priority) {
    case 'high':
      return { label: 'Prioritaire', bgColor: 'rgba(184, 165, 212, 0.15)', textColor: '#B8A5D4' }
    case 'medium':
      return { label: 'En cours', bgColor: 'rgba(201, 169, 98, 0.15)', textColor: '#C9A962' }
    case 'low':
      return { label: 'À planifier', bgColor: 'var(--glass-bg)', textColor: 'var(--text-muted)' }
  }
}

export default function HarmonyHistoryModal({ isOpen, onClose }: HarmonyHistoryModalProps) {
  const { t, language } = useLanguage()
  const [activeTab, setActiveTab] = useState<'score' | 'objectives' | 'insights'>('score')
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week')
  const [showInfoTooltip, setShowInfoTooltip] = useState(false)
  const [editingObjective, setEditingObjective] = useState<string | null>(null)
  const [localObjectives, setLocalObjectives] = useState<HarmonyObjective[]>([])
  const [showTrendAnalysis, setShowTrendAnalysis] = useState(false)
  const [showExpandedReport, setShowExpandedReport] = useState(false)
  const [showAIDiagnosis, setShowAIDiagnosis] = useState(false)

  // AI State
  const [aiAnalysis, setAiAnalysis] = useState<HarmonyAIResponse | null>(null)
  const [isAILoading, setIsAILoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)

  const harmonyData = useMemo(() => getHarmonyData(), [])

  // Dynamic history based on selected period
  const history = useMemo(() => getHistoryForPeriod(selectedPeriod), [selectedPeriod])

  // Trend analysis for current period
  const trendAnalysis = useMemo(() => generateTrendAnalysis(selectedPeriod), [selectedPeriod])

  // Expanded AI report
  const expandedReport = useMemo(() => generateExpandedAIReport(), [])

  // Load AI analysis when modal opens
  const loadAIAnalysis = useCallback(async (forceRefresh = false) => {
    if (isAILoading) return

    setIsAILoading(true)
    setAiError(null)

    try {
      const result = await getAIHarmonyAnalysis(forceRefresh, language)
      setAiAnalysis(result)
    } catch (error) {
      console.error('AI analysis error:', error)
      setAiError('Analyse IA indisponible')
    } finally {
      setIsAILoading(false)
    }
  }, [isAILoading, language])

  // Trigger AI analysis when modal opens
  useEffect(() => {
    if (isOpen && !aiAnalysis && !isAILoading) {
      loadAIAnalysis()
    }
  }, [isOpen, aiAnalysis, isAILoading, loadAIAnalysis])

  // Initialize local objectives from harmonyData
  useMemo(() => {
    if (localObjectives.length === 0) {
      setLocalObjectives([...harmonyData.objectives])
    }
  }, [harmonyData.objectives])

  // Chart Data Preparation
  const evolutionData = useMemo(() => {
    return history.map(point => ({
      label: point.label,
      value: point.value
    }))
  }, [history])

  const radarData = useMemo(() => {
    return (Object.keys(dimensionConfig) as HarmonyDimension[]).map(dim => ({
      subject: dimensionConfig[dim].label,
      A: harmonyData.dimensionScores[dim],
      fullMark: 100
    }))
  }, [harmonyData])

  // Use localObjectives for display
  const objectives = localObjectives.length > 0 ? localObjectives : harmonyData.objectives

  // Group objectives by dimension
  const objectivesByDimension = useMemo(() => {
    const grouped: { [key in HarmonyDimension]?: HarmonyObjective[] } = {}
    objectives.forEach(obj => {
      if (!grouped[obj.dimension]) grouped[obj.dimension] = []
      grouped[obj.dimension]!.push(obj)
    })
    return grouped
  }, [objectives])

  // Update objective value
  const handleUpdateObjective = (id: string, newCurrent: number) => {
    setLocalObjectives(prev => prev.map(obj =>
      obj.id === id ? { ...obj, current: newCurrent } : obj
    ))
    setEditingObjective(null)
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} id="modal-harmony-guide" title={t('harmonyGuide')}>
        <div className="mb-4">

          {/* Main Score Display with Info Button */}
          <div className="text-center mb-5 relative">
            <div className="flex items-center justify-center gap-2">
              <div
                className="text-5xl font-light text-display"
                style={{ color: getScoreColor(harmonyData.alignmentScore) }}
              >
                {harmonyData.alignmentScore}
              </div>
              <button
                className="w-6 h-6 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
                onClick={() => setShowInfoTooltip(!showInfoTooltip)}
              >
                <i className="fa-solid fa-info text-[10px]" style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>
            <div className="text-xs uppercase tracking-wider mt-1" style={{ color: 'var(--text-muted)' }}>
              Score d&apos;Alignement
            </div>

            {/* Info Tooltip */}
            {showInfoTooltip && (
              <div
                className="absolute top-16 left-1/2 -translate-x-1/2 w-[260px] p-4 rounded-2xl z-50 text-left"
                style={{
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--glass-border)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)'
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                    Qu&apos;est-ce que l&apos;Harmony ?
                  </span>
                  <button onClick={() => setShowInfoTooltip(false)}>
                    <i className="fa-solid fa-xmark text-xs" style={{ color: 'var(--text-muted)' }} />
                  </button>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  Le score Harmony mesure ton <strong>alignement de vie</strong> : à quel point tes actions quotidiennes
                  te rapprochent de tes objectifs personnels.
                </p>
                <p className="text-xs leading-relaxed mt-2" style={{ color: 'var(--text-secondary)' }}>
                  Il analyse 5 dimensions clés de ta vie.
                </p>
              </div>
            )}
          </div>

          {/* Dimension Scores Row */}
          <div className="flex justify-between mb-5 px-2">
            {(Object.keys(dimensionConfig) as HarmonyDimension[]).map(dim => (
              <div key={dim} className="text-center">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-1"
                  style={{ background: `${dimensionConfig[dim].color}20` }}
                >
                  <i
                    className={`fa-solid ${dimensionConfig[dim].icon} text-sm`}
                    style={{ color: dimensionConfig[dim].color }}
                  />
                </div>
                <div className="text-xs font-medium" style={{ color: getScoreColor(harmonyData.dimensionScores[dim]) }}>
                  {harmonyData.dimensionScores[dim]}%
                </div>
              </div>
            ))}
          </div>

          {/* Tab Selector */}
          <div className="flex gap-1 p-1 rounded-xl mb-4" style={{ background: 'var(--glass-bg)' }}>
            {(['score', 'objectives', 'insights'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="flex-1 py-2 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: activeTab === tab ? 'var(--bg-primary)' : 'transparent',
                  color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-muted)',
                  boxShadow: activeTab === tab ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                {tab === 'score' ? 'Évolution' : tab === 'objectives' ? 'Objectifs' : 'Conseils'}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'score' && (
            <div className="space-y-4">
              {/* Period selector */}
              <div className="flex gap-2">
                {(['week', 'month', 'year'] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className="flex-1 py-1.5 rounded-lg text-xs transition-all"
                    style={{
                      background: selectedPeriod === period ? 'var(--text-primary)' : 'transparent',
                      color: selectedPeriod === period ? 'var(--bg-primary)' : 'var(--text-muted)',
                    }}
                  >
                    {period === 'week' ? 'Semaine' : period === 'month' ? 'Mois' : 'Année'}
                  </button>
                ))}
              </div>

              {/* Dynamic Chart */}
              <div className="rounded-xl p-3" style={{ background: 'var(--glass-bg)' }}>
                <LogarithmicHistoryChart
                  data={evolutionData.map(d => d.value)}
                  weekLabels={evolutionData.map(d => d.label)}
                  color={getScoreColor(harmonyData.alignmentScore)}
                  height={220}
                  scale="log"
                />
              </div>

              {/* Period stats */}
              <div className="flex justify-between text-xs px-2" style={{ color: 'var(--text-muted)' }}>
                <span>Min: {Math.min(...history.map(h => h.value))}%</span>
                <span>Moy: {Math.round(history.reduce((a, h) => a + h.value, 0) / history.length)}%</span>
                <span>Max: {Math.max(...history.map(h => h.value))}%</span>
              </div>
            </div>
          )}

          {activeTab === 'objectives' && (
            <div className="space-y-4 max-h-[300px] overflow-y-auto">
              {(Object.keys(dimensionConfig) as HarmonyDimension[]).map(dim => (
                <div key={dim}>
                  <div className="flex items-center gap-2 mb-2">
                    <i className={`fa-solid ${dimensionConfig[dim].icon} text-xs`} style={{ color: dimensionConfig[dim].color }} />
                    <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                      {dimensionConfig[dim].label}
                    </span>
                    <span className="text-xs ml-auto" style={{ color: getScoreColor(harmonyData.dimensionScores[dim]) }}>
                      {harmonyData.dimensionScores[dim]}%
                    </span>
                  </div>

                  {objectivesByDimension[dim]?.map(obj => {
                    const progress = calculateObjectiveProgress(obj)
                    const priorityStyle = getPriorityLabel(obj.priority)
                    const isEditing = editingObjective === obj.id

                    return (
                      <div
                        key={obj.id}
                        className="p-3 rounded-xl mb-2"
                        style={{ background: 'var(--glass-bg)' }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                              {obj.title}
                            </div>
                            {isEditing ? (
                              <div className="flex items-center gap-2 mt-1">
                                <input
                                  type="number"
                                  defaultValue={obj.current}
                                  className="w-20 px-2 py-1 rounded-lg text-xs"
                                  style={{
                                    background: 'var(--bg-primary)',
                                    border: '1px solid var(--glass-border)',
                                    color: 'var(--text-primary)'
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleUpdateObjective(obj.id, parseFloat((e.target as HTMLInputElement).value))
                                    }
                                  }}
                                  autoFocus
                                />
                                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>/ {obj.target} {obj.unit}</span>
                              </div>
                            ) : (
                              <div
                                className="text-xs mt-0.5 flex items-center gap-1 cursor-pointer hover:underline"
                                style={{ color: 'var(--text-muted)' }}
                                onClick={() => setEditingObjective(obj.id)}
                              >
                                {obj.current} / {obj.target} {obj.unit}
                                <i className="fa-solid fa-pen text-[8px] ml-1 opacity-50" />
                              </div>
                            )}
                          </div>
                          <span
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{
                              background: priorityStyle.bgColor,
                              color: priorityStyle.textColor
                            }}
                          >
                            {priorityStyle.label}
                          </span>
                        </div>

                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border-light)' }}>
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${Math.min(100, progress)}%`,
                              background: getScoreColor(progress)
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="space-y-4">
              {/* Dimension Balance (Radar) */}
              <div className="mb-4 p-3 rounded-xl" style={{ background: 'var(--glass-bg)' }}>
                <div className="text-xs font-medium uppercase tracking-wide mb-2 text-center" style={{ color: 'var(--text-muted)' }}>
                  Équilibre
                </div>
                <DimensionRadarChart
                  data={radarData}
                  color="#B8A5D4"
                  height={220}
                />
              </div>

              {/* AI Status Badge */}
              {aiAnalysis && (
                <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--glass-bg)' }}>
                  <div className="flex items-center gap-2">
                    <div
                      className="px-2 py-1 rounded-full text-xs font-medium"
                      style={{
                        background: aiAnalysis.harmony_score.tier === 'Souverain' ? 'rgba(0, 137, 123, 0.15)' :
                          aiAnalysis.harmony_score.tier === 'Aligné' ? 'rgba(124, 179, 66, 0.15)' :
                            aiAnalysis.harmony_score.tier === 'En Construction' ? 'rgba(253, 216, 53, 0.15)' :
                              'rgba(251, 140, 0, 0.15)',
                        color: aiAnalysis.harmony_score.tier === 'Souverain' ? '#00897b' :
                          aiAnalysis.harmony_score.tier === 'Aligné' ? '#7cb342' :
                            aiAnalysis.harmony_score.tier === 'En Construction' ? '#fdd835' :
                              '#fb8c00',
                      }}
                    >
                      {aiAnalysis.harmony_score.tier}
                    </div>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      <i className={`fa-solid ${aiAnalysis.harmony_score.trend === 'Convergence' ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'} mr-1`} />
                      {aiAnalysis.harmony_score.trend_detail || aiAnalysis.harmony_score.trend}
                    </span>
                  </div>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Score: {aiAnalysis.harmony_score.value}%
                  </span>
                </div>
              )}

              {/* Warnings */}
              {aiAnalysis?.warnings && aiAnalysis.warnings.length > 0 && (
                <div className="space-y-2">
                  {aiAnalysis.warnings.map((warning, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl flex items-start gap-2"
                      style={{
                        background: warning.severity === 'Critique' ? 'rgba(229, 57, 53, 0.15)' :
                          warning.severity === 'Alerte' ? 'rgba(251, 140, 0, 0.15)' :
                            warning.severity === 'Attention' ? 'rgba(253, 216, 53, 0.15)' :
                              'rgba(165, 196, 212, 0.15)',
                      }}
                    >
                      <i className={`fa-solid ${warning.severity === 'Critique' ? 'fa-circle-exclamation' : warning.severity === 'Alerte' ? 'fa-triangle-exclamation' : 'fa-info-circle'} text-xs mt-0.5`}
                        style={{
                          color: warning.severity === 'Critique' ? '#e53935' :
                            warning.severity === 'Alerte' ? '#fb8c00' :
                              warning.severity === 'Attention' ? '#fdd835' : '#A5C4D4'
                        }}
                      />
                      <p className="text-xs" style={{ color: 'var(--text-primary)' }}>{warning.message}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* AI Archetype Card */}
              {aiAnalysis?.archetype && (
                <div
                  className="p-4 rounded-2xl cursor-pointer transition-all hover:scale-[1.01]"
                  style={{
                    background: 'linear-gradient(135deg, rgba(184, 165, 212, 0.2) 0%, rgba(201, 169, 98, 0.1) 100%)',
                    border: '1px solid var(--glass-border)'
                  }}
                  onClick={() => setShowAIDiagnosis(true)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <i className="fa-solid fa-brain text-sm" style={{ color: 'var(--accent-lavender)' }} />
                    <span className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                      Ton Archétype
                    </span>
                  </div>
                  <p className="text-base font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                    {aiAnalysis.archetype.name || 'Analyse en cours...'}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {aiAnalysis.archetype.description || ''}
                  </p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {aiAnalysis.archetype.forces?.slice(0, 2).map((force, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-full text-[10px]" style={{ background: 'rgba(139, 168, 136, 0.2)', color: '#8BA888' }}>
                        ✓ {force}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Loading State */}
              {isAILoading && (
                <div className="p-4 rounded-2xl text-center" style={{ background: 'var(--glass-bg)' }}>
                  <i className="fa-solid fa-spinner fa-spin text-lg mb-2" style={{ color: 'var(--accent-lavender)' }} />
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Analyse IA en cours...</p>
                </div>
              )}

              {/* Error State */}
              {aiError && !isAILoading && (
                <div className="p-4 rounded-2xl" style={{ background: 'rgba(229, 57, 53, 0.1)' }}>
                  <p className="text-xs text-center" style={{ color: '#e53935' }}>{aiError}</p>
                  <button
                    className="mt-2 text-xs w-full py-2 rounded-lg"
                    style={{ background: 'var(--glass-bg)', color: 'var(--text-primary)' }}
                    onClick={() => loadAIAnalysis(true)}
                  >
                    Réessayer
                  </button>
                </div>
              )}

              {/* Pillar Scores Grid */}
              {aiAnalysis?.pillar_scores && (
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'vitality', label: 'Vitalité', icon: 'fa-heart-pulse', color: '#8BA888', data: aiAnalysis.pillar_scores.vitality },
                    { key: 'sovereignty', label: 'Souveraineté', icon: 'fa-coins', color: '#C9A962', data: aiAnalysis.pillar_scores.sovereignty },
                    { key: 'connection', label: 'Connexion', icon: 'fa-users', color: '#D4A5A5', data: aiAnalysis.pillar_scores.connection },
                    { key: 'expansion', label: 'Expansion', icon: 'fa-rocket', color: '#A5C4D4', data: aiAnalysis.pillar_scores.expansion },
                  ].map(({ key, label, icon, color, data }) => (
                    <div key={key} className="p-3 rounded-xl" style={{ background: 'var(--glass-bg)' }}>
                      <div className="flex items-center gap-2 mb-2">
                        <i className={`fa-solid ${icon} text-xs`} style={{ color }} />
                        <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{label}</span>
                        <span
                          className="ml-auto px-1.5 py-0.5 rounded-full text-[10px]"
                          style={{
                            background: data.status === 'Excellent' ? 'rgba(0, 137, 123, 0.15)' :
                              data.status === 'Bon' ? 'rgba(124, 179, 66, 0.15)' :
                                data.status === 'Moyen' ? 'rgba(253, 216, 53, 0.15)' :
                                  'rgba(251, 140, 0, 0.15)',
                            color: data.status === 'Excellent' ? '#00897b' :
                              data.status === 'Bon' ? '#7cb342' :
                                data.status === 'Moyen' ? '#fdd835' : '#fb8c00',
                          }}
                        >
                          {data.score}%
                        </span>
                      </div>
                      <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{data.key_metric}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Conseils (Prioritized Recommendations) */}
              {aiAnalysis?.conseils && aiAnalysis.conseils.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-medium uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>
                    <i className="fa-solid fa-lightbulb mr-1" style={{ color: 'var(--accent-gold)' }} />
                    Conseils Prioritaires
                  </div>
                  {aiAnalysis.conseils.slice(0, 3).map((conseil, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl"
                      style={{
                        background: conseil.type === 'ACTION' ? 'rgba(139, 168, 136, 0.12)' : 'rgba(201, 169, 98, 0.12)',
                        border: `1px solid ${conseil.type === 'ACTION' ? 'rgba(139, 168, 136, 0.3)' : 'rgba(201, 169, 98, 0.3)'}`
                      }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium"
                          style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                        >
                          {conseil.priority}
                        </span>
                        <span
                          className="px-1.5 py-0.5 rounded-full text-[10px] uppercase"
                          style={{
                            background: conseil.type === 'ACTION' ? 'rgba(124, 179, 66, 0.2)' : 'rgba(201, 169, 98, 0.2)',
                            color: conseil.type === 'ACTION' ? '#7cb342' : '#C9A962'
                          }}
                        >
                          {conseil.type === 'ACTION' ? 'Agir' : 'Ajuster Objectif'}
                        </span>
                        <span className="ml-auto text-[10px]" style={{ color: 'var(--text-muted)' }}>{conseil.timeline}</span>
                      </div>
                      <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                        {conseil.conseil}
                      </p>
                      <div className="flex items-center gap-2 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        <span><i className="fa-solid fa-bullseye mr-1" />{conseil.pillar}</span>
                        <span className="ml-auto" style={{ color: '#8BA888' }}>{conseil.impact_attendu}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Objective Adjustments */}
              {aiAnalysis?.objective_adjustments && aiAnalysis.objective_adjustments.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-medium uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>
                    <i className="fa-solid fa-sliders mr-1" style={{ color: 'var(--accent-coral)' }} />
                    Ajustements d'Objectifs Suggérés
                  </div>
                  {aiAnalysis.objective_adjustments.map((adj, idx) => (
                    <div key={idx} className="p-3 rounded-xl" style={{ background: 'var(--glass-bg)' }}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{adj.pillar}</span>
                        <span
                          className="ml-auto px-1.5 py-0.5 rounded-full text-[10px]"
                          style={{
                            background: adj.recommended_adjustment === 'Augmenter' ? 'rgba(124, 179, 66, 0.2)' :
                              adj.recommended_adjustment === 'Réduire' ? 'rgba(201, 169, 98, 0.2)' : 'rgba(165, 196, 212, 0.2)',
                            color: adj.recommended_adjustment === 'Augmenter' ? '#7cb342' :
                              adj.recommended_adjustment === 'Réduire' ? '#C9A962' : '#A5C4D4'
                          }}
                        >
                          <i className={`fa-solid ${adj.recommended_adjustment === 'Augmenter' ? 'fa-arrow-up' : adj.recommended_adjustment === 'Réduire' ? 'fa-arrow-down' : 'fa-equals'} mr-1`} />
                          {adj.recommended_adjustment}
                        </span>
                      </div>
                      <p className="text-[10px] mb-1" style={{ color: 'var(--text-muted)' }}>
                        {adj.current_objective} → <strong style={{ color: 'var(--text-primary)' }}>{adj.new_target}</strong>
                      </p>
                      <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{adj.justification}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Trend Cards */}
              {aiAnalysis && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-xl" style={{ background: 'var(--glass-bg)' }}>
                    <div className="text-[10px] uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>Cette semaine</div>
                    <div className="flex items-center gap-1">
                      <i className={`fa-solid ${aiAnalysis.weekly_trend.direction === 'Amélioration' ? 'fa-arrow-up' : aiAnalysis.weekly_trend.direction === 'Dégradation' ? 'fa-arrow-down' : 'fa-minus'} text-xs`}
                        style={{
                          color: aiAnalysis.weekly_trend.direction === 'Amélioration' ? '#7cb342' :
                            aiAnalysis.weekly_trend.direction === 'Dégradation' ? '#e53935' : '#A5C4D4'
                        }}
                      />
                      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {aiAnalysis.weekly_trend.delta > 0 ? '+' : ''}{aiAnalysis.weekly_trend.delta} pts
                      </span>
                    </div>
                    <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>{aiAnalysis.weekly_trend.insight}</p>
                  </div>
                  <div className="p-3 rounded-xl" style={{ background: 'var(--glass-bg)' }}>
                    <div className="text-[10px] uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>Ce mois</div>
                    <div className="flex items-center gap-1">
                      <i className={`fa-solid ${aiAnalysis.monthly_trend.direction === 'Amélioration' ? 'fa-arrow-up' : aiAnalysis.monthly_trend.direction === 'Dégradation' ? 'fa-arrow-down' : 'fa-minus'} text-xs`}
                        style={{
                          color: aiAnalysis.monthly_trend.direction === 'Amélioration' ? '#7cb342' :
                            aiAnalysis.monthly_trend.direction === 'Dégradation' ? '#e53935' : '#A5C4D4'
                        }}
                      />
                      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {aiAnalysis.monthly_trend.delta > 0 ? '+' : ''}{aiAnalysis.monthly_trend.delta} pts
                      </span>
                    </div>
                    <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>{aiAnalysis.monthly_trend.insight}</p>
                  </div>
                </div>
              )}

              {/* Quick actions */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  className="p-3 rounded-xl text-left transition-all hover:scale-[1.02]"
                  style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
                  onClick={() => setShowAIDiagnosis(true)}
                >
                  <i className="fa-solid fa-stethoscope text-xs mb-1" style={{ color: 'var(--accent-lavender)' }} />
                  <div className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>Diagnostic Complet</div>
                </button>
                <button
                  className="p-3 rounded-xl text-left transition-all hover:scale-[1.02]"
                  style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
                  onClick={() => setActiveTab('objectives')}
                >
                  <i className="fa-solid fa-bullseye text-xs mb-1" style={{ color: 'var(--accent-coral)' }} />
                  <div className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>Ajuster objectifs</div>
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Trend Analysis Sheet */}
      <BottomSheet
        isOpen={showTrendAnalysis}
        onClose={() => setShowTrendAnalysis(false)}
        initialHeight="70vh"
        maxHeight="90vh"
        showCloseButton={true}
      >
        <div className="px-2">
          <h3 className="text-lg font-light text-display mb-4" style={{ color: 'var(--text-primary)' }}>
            <i className="fa-solid fa-chart-line mr-2" style={{ color: 'var(--accent-sage)' }} />
            Analyse des Tendances
          </h3>

          {/* Period selector */}
          <div className="flex gap-2 mb-4">
            {(['week', 'month', 'year'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className="flex-1 py-2 rounded-lg text-xs transition-all"
                style={{
                  background: selectedPeriod === period ? 'var(--text-primary)' : 'var(--glass-bg)',
                  color: selectedPeriod === period ? 'var(--bg-primary)' : 'var(--text-muted)',
                }}
              >
                {period === 'week' ? 'Semaine' : period === 'month' ? 'Mois' : 'Année'}
              </button>
            ))}
          </div>

          {/* Summary */}
          <div className="p-4 rounded-2xl mb-4" style={{ background: 'var(--glass-bg)' }}>
            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{trendAnalysis.summary}</p>
          </div>

          {/* Seasonal Note */}
          <div className="p-3 rounded-xl mb-4" style={{ background: 'rgba(201, 169, 98, 0.1)' }}>
            <p className="text-xs" style={{ color: 'var(--accent-gold)' }}>{trendAnalysis.seasonalNote}</p>
          </div>

          {/* Dimension Details */}
          <div className="space-y-3 mb-4">
            {trendAnalysis.details.map(detail => (
              <div
                key={detail.dimension}
                className="p-3 rounded-xl flex items-center gap-3"
                style={{ background: 'var(--glass-bg)' }}
              >
                <i
                  className={`fa-solid ${dimensionConfig[detail.dimension].icon}`}
                  style={{ color: dimensionConfig[detail.dimension].color }}
                />
                <div className="flex-1">
                  <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {dimensionConfig[detail.dimension].label}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {detail.insight}
                  </div>
                </div>
                <i
                  className={`fa-solid ${detail.trend === 'up' ? 'fa-arrow-up' : detail.trend === 'down' ? 'fa-arrow-down' : 'fa-minus'}`}
                  style={{
                    color: detail.trend === 'up' ? '#7cb342' : detail.trend === 'down' ? '#e53935' : 'var(--text-muted)'
                  }}
                />
              </div>
            ))}
          </div>

          {/* Recommendations */}
          <h4 className="text-xs uppercase tracking-wide font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
            Recommandations
          </h4>
          <div className="space-y-2">
            {trendAnalysis.recommendations.map((rec, i) => (
              <div key={i} className="p-3 rounded-lg text-sm" style={{ background: 'var(--glass-bg)', color: 'var(--text-primary)' }}>
                {rec}
              </div>
            ))}
          </div>
        </div>
      </BottomSheet>

      {/* Expanded AI Report Sheet */}
      <BottomSheet
        isOpen={showExpandedReport}
        onClose={() => setShowExpandedReport(false)}
        initialHeight="85vh"
        maxHeight="95vh"
        showCloseButton={true}
      >
        <div className="px-2">
          <h3 className="text-lg font-light text-display mb-2" style={{ color: 'var(--text-primary)' }}>
            <i className="fa-solid fa-wand-magic-sparkles mr-2" style={{ color: 'var(--accent-lavender)' }} />
            {expandedReport.title}
          </h3>

          {/* Overall Assessment */}
          <div className="p-4 rounded-2xl mb-4" style={{
            background: 'linear-gradient(135deg, rgba(184, 165, 212, 0.1) 0%, rgba(165, 196, 212, 0.1) 100%)'
          }}>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
              {expandedReport.overallAssessment}
            </p>
          </div>

          {/* Dimension Analysis */}
          <h4 className="text-xs uppercase tracking-wide font-medium mb-3" style={{ color: 'var(--text-muted)' }}>
            Analyse par Dimension
          </h4>
          <div className="space-y-3 mb-4">
            {expandedReport.dimensionAnalysis.map(dim => (
              <div
                key={dim.dimension}
                className="p-4 rounded-xl"
                style={{ background: 'var(--glass-bg)' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <i className={`fa-solid ${dimensionConfig[dim.dimension].icon}`} style={{ color: dimensionConfig[dim.dimension].color }} />
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {dimensionConfig[dim.dimension].label}
                    </span>
                  </div>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      background: getScoreColor(dim.score) + '20',
                      color: getScoreColor(dim.score)
                    }}
                  >
                    {dim.status}
                  </span>
                </div>

                <div className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                  <strong>Points forts:</strong> {dim.strengths.join(', ')}
                </div>
                <div className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                  <strong>À améliorer:</strong> {dim.improvements.join(', ')}
                </div>
                <div className="text-xs p-2 rounded-lg" style={{ background: 'var(--bg-primary)', color: 'var(--accent-gold)' }}>
                  🎯 {dim.nextSteps}
                </div>
              </div>
            ))}
          </div>

          {/* Life Balance & Focus */}
          <div className="grid grid-cols-1 gap-3 mb-4">
            <div className="p-3 rounded-xl" style={{ background: 'rgba(139, 168, 136, 0.1)' }}>
              <h5 className="text-xs font-medium mb-1" style={{ color: 'var(--accent-sage)' }}>
                <i className="fa-solid fa-scale-balanced mr-1" /> Équilibre de Vie
              </h5>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{expandedReport.lifeBalance}</p>
            </div>
            <div className="p-3 rounded-xl" style={{ background: 'rgba(201, 169, 98, 0.1)' }}>
              <h5 className="text-xs font-medium mb-1" style={{ color: 'var(--accent-gold)' }}>
                <i className="fa-solid fa-bullseye mr-1" /> Focus du Mois
              </h5>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{expandedReport.monthlyFocus}</p>
            </div>
            <div className="p-3 rounded-xl" style={{ background: 'rgba(184, 165, 212, 0.1)' }}>
              <h5 className="text-xs font-medium mb-1" style={{ color: 'var(--accent-lavender)' }}>
                <i className="fa-solid fa-compass mr-1" /> Vision Long Terme
              </h5>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{expandedReport.longtermVision}</p>
            </div>
          </div>
        </div>
      </BottomSheet>

      {/* AI Systemic Diagnosis Sheet */}
      <BottomSheet
        isOpen={showAIDiagnosis}
        onClose={() => setShowAIDiagnosis(false)}
        initialHeight="75vh"
        maxHeight="90vh"
        showCloseButton={true}
      >
        <div className="px-2">
          <h3 className="text-lg font-light text-display mb-4" style={{ color: 'var(--text-primary)' }}>
            <i className="fa-solid fa-brain mr-2" style={{ color: 'var(--accent-lavender)' }} />
            Diagnostic Systémique IA
          </h3>

          {aiAnalysis && (
            <>
              {/* Archetype */}
              {aiAnalysis?.archetype && (
                <div className="p-4 rounded-2xl mb-4" style={{
                  background: 'linear-gradient(135deg, rgba(184, 165, 212, 0.15) 0%, rgba(201, 169, 98, 0.1) 100%)'
                }}>
                  <div className="text-xs uppercase tracking-wide font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
                    Ton Archétype
                  </div>
                  <p className="text-xl font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    {aiAnalysis.archetype.name || 'Analyse en cours...'}
                  </p>
                  <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                    {aiAnalysis.archetype.description || ''}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {aiAnalysis.archetype.forces?.map((force, idx) => (
                      <span key={idx} className="px-2 py-1 rounded-full text-xs" style={{ background: 'rgba(124, 179, 66, 0.15)', color: '#7cb342' }}>
                        <i className="fa-solid fa-check mr-1" />{force}
                      </span>
                    ))}
                    {aiAnalysis.archetype.faiblesses?.map((faiblesse, idx) => (
                      <span key={idx} className="px-2 py-1 rounded-full text-xs" style={{ background: 'rgba(229, 57, 53, 0.15)', color: '#e53935' }}>
                        <i className="fa-solid fa-exclamation mr-1" />{faiblesse}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Pillar Assessments */}
              {aiAnalysis?.pillar_scores && (
                <>
                  <h4 className="text-xs uppercase tracking-wide font-medium mb-3" style={{ color: 'var(--text-muted)' }}>
                    Analyse par Pilier
                  </h4>
                  <div className="space-y-2 mb-4">
                    {[
                      { key: 'vitality', label: 'Vitalité', icon: 'fa-heart-pulse', color: '#8BA888', data: aiAnalysis.pillar_scores.vitality },
                      { key: 'sovereignty', label: 'Souveraineté', icon: 'fa-coins', color: '#C9A962', data: aiAnalysis.pillar_scores.sovereignty },
                      { key: 'connection', label: 'Connexion', icon: 'fa-users', color: '#D4A5A5', data: aiAnalysis.pillar_scores.connection },
                      { key: 'expansion', label: 'Expansion', icon: 'fa-rocket', color: '#A5C4D4', data: aiAnalysis.pillar_scores.expansion },
                    ].filter(item => item.data).map(({ key, label, icon, color, data }) => (
                      <div key={key} className="p-3 rounded-xl" style={{ background: 'var(--glass-bg)' }}>
                        <div className="flex items-center gap-2 mb-2">
                          <i className={`fa-solid ${icon} text-xs`} style={{ color }} />
                          <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{label}</span>
                          <span
                            className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-medium"
                            style={{
                              background: data?.status === 'Excellent' ? 'rgba(0, 137, 123, 0.15)' :
                                data?.status === 'Bon' ? 'rgba(124, 179, 66, 0.15)' :
                                  data?.status === 'Moyen' ? 'rgba(253, 216, 53, 0.15)' :
                                    data?.status === 'Préoccupant' ? 'rgba(251, 140, 0, 0.15)' : 'rgba(229, 57, 53, 0.15)',
                              color: data?.status === 'Excellent' ? '#00897b' :
                                data?.status === 'Bon' ? '#7cb342' :
                                  data?.status === 'Moyen' ? '#fdd835' :
                                    data?.status === 'Préoccupant' ? '#fb8c00' : '#e53935',
                            }}
                          >
                            {data?.score ?? 0}% - {data?.status || 'N/A'}
                          </span>
                        </div>
                        <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{data?.key_metric || ''}</p>
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{data?.honest_assessment || ''}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Trend Analysis Detail */}
              {aiAnalysis?.weekly_trend && aiAnalysis?.monthly_trend && (
                <>
                  <h4 className="text-xs uppercase tracking-wide font-medium mb-3" style={{ color: 'var(--text-muted)' }}>
                    Évolution Temporelle
                  </h4>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-3 rounded-xl" style={{ background: 'var(--glass-bg)' }}>
                      <div className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>Semaine</div>
                      <div className="flex items-center gap-2 mb-1">
                        <i className={`fa-solid ${aiAnalysis.weekly_trend.direction === 'Amélioration' ? 'fa-arrow-up' : aiAnalysis.weekly_trend.direction === 'Dégradation' ? 'fa-arrow-down' : 'fa-minus'}`}
                          style={{ color: aiAnalysis.weekly_trend.direction === 'Amélioration' ? '#7cb342' : aiAnalysis.weekly_trend.direction === 'Dégradation' ? '#e53935' : '#A5C4D4' }}
                        />
                        <span className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>
                          {(aiAnalysis.weekly_trend.delta ?? 0) > 0 ? '+' : ''}{aiAnalysis.weekly_trend.delta ?? 0} pts
                        </span>
                      </div>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{aiAnalysis.weekly_trend.insight || ''}</p>
                    </div>
                    <div className="p-3 rounded-xl" style={{ background: 'var(--glass-bg)' }}>
                      <div className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>Mois</div>
                      <div className="flex items-center gap-2 mb-1">
                        <i className={`fa-solid ${aiAnalysis.monthly_trend.direction === 'Amélioration' ? 'fa-arrow-up' : aiAnalysis.monthly_trend.direction === 'Dégradation' ? 'fa-arrow-down' : 'fa-minus'}`}
                          style={{ color: aiAnalysis.monthly_trend.direction === 'Amélioration' ? '#7cb342' : aiAnalysis.monthly_trend.direction === 'Dégradation' ? '#e53935' : '#A5C4D4' }}
                        />
                        <span className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>
                          {(aiAnalysis.monthly_trend.delta ?? 0) > 0 ? '+' : ''}{aiAnalysis.monthly_trend.delta ?? 0} pts
                        </span>
                      </div>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{aiAnalysis.monthly_trend.insight || ''}</p>
                    </div>
                  </div>
                </>
              )}

              {/* Conseils Summary */}
              {aiAnalysis.conseils && aiAnalysis.conseils.length > 0 && (
                <>
                  <h4 className="text-xs uppercase tracking-wide font-medium mb-3" style={{ color: 'var(--text-muted)' }}>
                    Plan d'Action
                  </h4>
                  <div className="space-y-2 mb-4">
                    {aiAnalysis.conseils.map((conseil, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl"
                        style={{
                          background: conseil.type === 'ACTION' ? 'rgba(139, 168, 136, 0.12)' : 'rgba(201, 169, 98, 0.12)',
                          border: `1px solid ${conseil.type === 'ACTION' ? 'rgba(139, 168, 136, 0.3)' : 'rgba(201, 169, 98, 0.3)'}`
                        }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                            style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                            {conseil.priority}
                          </span>
                          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{conseil.pillar}</span>
                          <span
                            className="ml-auto px-2 py-0.5 rounded-full text-[10px]"
                            style={{
                              background: conseil.type === 'ACTION' ? 'rgba(124, 179, 66, 0.2)' : 'rgba(201, 169, 98, 0.2)',
                              color: conseil.type === 'ACTION' ? '#7cb342' : '#C9A962'
                            }}
                          >
                            {conseil.type === 'ACTION' ? 'Agir' : 'Ajuster'}
                          </span>
                        </div>
                        <p className="text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{conseil.conseil}</p>
                        <div className="flex items-center justify-between text-xs">
                          <span style={{ color: 'var(--text-muted)' }}><i className="fa-solid fa-clock mr-1" />{conseil.timeline}</span>
                          <span style={{ color: '#8BA888' }}>{conseil.impact_attendu}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </BottomSheet>
    </>
  )
}

