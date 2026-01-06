'use client'

import { useState, useMemo } from 'react'
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
  DetailedHistoryPoint
} from '@/utils/harmonyCalculator'

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
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState<'score' | 'objectives' | 'insights'>('score')
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week')
  const [showInfoTooltip, setShowInfoTooltip] = useState(false)
  const [editingObjective, setEditingObjective] = useState<string | null>(null)
  const [localObjectives, setLocalObjectives] = useState<HarmonyObjective[]>([])
  const [showTrendAnalysis, setShowTrendAnalysis] = useState(false)
  const [showExpandedReport, setShowExpandedReport] = useState(false)

  const harmonyData = useMemo(() => getHarmonyData(), [])

  // Dynamic history based on selected period
  const history = useMemo(() => getHistoryForPeriod(selectedPeriod), [selectedPeriod])

  // Trend analysis for current period
  const trendAnalysis = useMemo(() => generateTrendAnalysis(selectedPeriod), [selectedPeriod])

  // Expanded AI report
  const expandedReport = useMemo(() => generateExpandedAIReport(), [])

  // Initialize local objectives from harmonyData
  useMemo(() => {
    if (localObjectives.length === 0) {
      setLocalObjectives([...harmonyData.objectives])
    }
  }, [harmonyData.objectives])

  // Chart calculations
  const chartHeight = 160
  const chartWidth = 280
  const padding = 20

  const maxValue = Math.max(...history.map(h => h.value), 100)
  const minValue = Math.min(...history.map(h => h.value), 0)

  const getX = (index: number) => padding + (index * (chartWidth - 2 * padding) / (history.length - 1))
  const getY = (value: number) => chartHeight - padding - ((value - minValue) / (maxValue - minValue)) * (chartHeight - 2 * padding)

  const generatePath = (data: DetailedHistoryPoint[]) => {
    return data.map((point, index) => {
      const x = getX(index)
      const y = getY(point.value)
      return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
    }).join(' ')
  }

  const userPath = generatePath(history)

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
                {tab === 'score' ? 'Évolution' : tab === 'objectives' ? 'Objectifs' : 'Guide IA'}
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
                <svg width={chartWidth} height={chartHeight} style={{ overflow: 'visible' }}>
                  {/* Grid */}
                  {[25, 50, 75].map((value) => (
                    <line
                      key={value}
                      x1={padding}
                      y1={getY(value)}
                      x2={chartWidth - padding}
                      y2={getY(value)}
                      stroke="var(--border-light)"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                  ))}
                  {/* User line */}
                  <path d={userPath} fill="none" stroke={getScoreColor(harmonyData.alignmentScore)} strokeWidth="2.5" />
                  {/* Points with labels */}
                  {history.map((point, index) => (
                    <g key={index}>
                      <circle
                        cx={getX(index)}
                        cy={getY(point.value)}
                        r="4"
                        fill={getScoreColor(point.value)}
                      />
                      <text
                        x={getX(index)}
                        y={chartHeight - 4}
                        textAnchor="middle"
                        fontSize="8"
                        fill="var(--text-muted)"
                      >
                        {point.label}
                      </text>
                    </g>
                  ))}
                </svg>
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
              {/* AI Insight Card - Expandable */}
              <div
                className="p-4 rounded-2xl cursor-pointer transition-all hover:scale-[1.01]"
                style={{
                  background: 'linear-gradient(135deg, rgba(184, 165, 212, 0.15) 0%, rgba(165, 196, 212, 0.15) 100%)',
                  border: '1px solid var(--glass-border)'
                }}
                onClick={() => setShowExpandedReport(true)}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
                    <i className="fa-solid fa-wand-magic-sparkles text-sm" style={{ color: 'var(--accent-lavender)' }} />
                  </div>
                  <span className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                    Guide IA
                  </span>
                  <i className="fa-solid fa-expand ml-auto text-xs" style={{ color: 'var(--text-muted)' }} />
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                  {harmonyData.aiInsight}
                </p>
                <p className="text-[10px] mt-2" style={{ color: 'var(--text-muted)' }}>
                  Cliquer pour voir le rapport complet →
                </p>
              </div>

              {/* Quick actions */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  className="p-3 rounded-xl text-left transition-all hover:scale-[1.02]"
                  style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
                  onClick={() => setShowTrendAnalysis(true)}
                >
                  <i className="fa-solid fa-chart-line text-xs mb-1" style={{ color: 'var(--accent-sage)' }} />
                  <div className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>Analyser tendances</div>
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
    </>
  )
}
