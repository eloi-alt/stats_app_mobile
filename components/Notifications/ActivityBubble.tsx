'use client'

import { useState, useMemo, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

interface Activity {
  id: string
  friendName?: string
  friendAvatar?: string
  type: 'financial' | 'sport' | 'social' | 'achievement' | 'health'
  message: string
  timestamp: string
  icon: string
  color: string
  category: 'perso' | 'amis'
}

const activities: Activity[] = [
  // Activités personnelles
  {
    id: 'p1',
    type: 'financial',
    message: 'Vous avez atteint 75% de votre objectif financier mensuel',
    timestamp: '1h',
    icon: 'fa-coins',
    color: 'var(--accent-gold)',
    category: 'perso',
  },
  {
    id: 'p2',
    type: 'health',
    message: 'Nouveau record de sommeil : 8h30 cette semaine',
    timestamp: '3h',
    icon: 'fa-heart-pulse',
    color: 'var(--accent-sage)',
    category: 'perso',
  },
  {
    id: 'p3',
    type: 'achievement',
    message: 'Achievement débloqué : "10 pays visités"',
    timestamp: '1j',
    icon: 'fa-trophy',
    color: 'var(--accent-lavender)',
    category: 'perso',
  },
  // Activités des amis
  {
    id: 'a1',
    friendName: 'Ugo',
    friendAvatar: '/ugo.png',
    type: 'financial',
    message: 'a atteint son objectif financier de l\'année !',
    timestamp: '2h',
    icon: 'fa-coins',
    color: 'var(--accent-gold)',
    category: 'amis',
  },
  {
    id: 'a2',
    friendName: 'Théo',
    friendAvatar: '/theo.png',
    type: 'sport',
    message: 'a battu son record de sport',
    timestamp: '5h',
    icon: 'fa-person-running',
    color: 'var(--accent-sage)',
    category: 'amis',
  },
  {
    id: 'a3',
    friendName: 'Ugo',
    friendAvatar: '/ugo.png',
    type: 'social',
    message: 'a rejoint un nouveau cercle',
    timestamp: '1j',
    icon: 'fa-users',
    color: 'var(--accent-rose)',
    category: 'amis',
  },
  {
    id: 'a4',
    friendName: 'Théo',
    friendAvatar: '/theo.png',
    type: 'achievement',
    message: 'a débloqué un nouvel achievement',
    timestamp: '2j',
    icon: 'fa-trophy',
    color: 'var(--accent-lavender)',
    category: 'amis',
  },
  {
    id: 'a5',
    friendName: 'Ugo',
    friendAvatar: '/ugo.png',
    type: 'health',
    message: 'a amélioré son score de santé',
    timestamp: '3j',
    icon: 'fa-heart-pulse',
    color: 'var(--accent-sage)',
    category: 'amis',
  },
]

export default function ActivityBubble() {
  const { t } = useLanguage()
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeCategory, setActiveCategory] = useState<'perso' | 'amis'>('perso')
  const [viewedActivities, setViewedActivities] = useState<Set<string>>(new Set())

  const filteredActivities = useMemo(() => {
    return activities.filter(activity => activity.category === activeCategory)
  }, [activeCategory])

  // Marquer les activités comme vues quand on change de catégorie ou qu'on ouvre la bulle
  useEffect(() => {
    if (isExpanded) {
      const categoryActivities = activities.filter(a => a.category === activeCategory)
      const newViewed = new Set(viewedActivities)
      categoryActivities.forEach(activity => {
        newViewed.add(activity.id)
      })
      setViewedActivities(newViewed)
    }
  }, [isExpanded, activeCategory])

  // Compter les activités non vues par catégorie
  const persoUnreadCount = useMemo(() => {
    return activities.filter(a => a.category === 'perso' && !viewedActivities.has(a.id)).length
  }, [viewedActivities])

  const amisUnreadCount = useMemo(() => {
    return activities.filter(a => a.category === 'amis' && !viewedActivities.has(a.id)).length
  }, [viewedActivities])

  const totalUnreadCount = persoUnreadCount + amisUnreadCount

  const persoCount = activities.filter(a => a.category === 'perso').length
  const amisCount = activities.filter(a => a.category === 'amis').length

  return (
    <>
      {/* Simple bouton icône cloche - POSITION FIXÉE EN HAUT À GAUCHE, NUMÉRO À CÔTÉ */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          setIsExpanded(!isExpanded)
        }}
        className="fixed top-4 left-0 z-[10005] flex items-center gap-2 px-4 transition-opacity active:opacity-70 pointer-events-auto w-auto max-w-max"
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          // Ensure it doesn't block clicks to the right by forcing narrow width
          right: 'auto',
          width: 'auto',
          maxWidth: '120px',
        }}
      >
        <i
          className="fa-solid fa-bell"
          style={{
            color: 'var(--text-primary)',
            fontSize: '24px',
          }}
        />
        {totalUnreadCount > 0 && (
          <div
            className="text-sm font-semibold"
            style={{
              color: 'var(--accent-rose)',
            }}
          >
            {totalUnreadCount}
          </div>
        )}
      </button>

      {/* Bulle dépliée */}
      {isExpanded && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[10004]"
            onClick={() => setIsExpanded(false)}
            style={{
              background: 'rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          />

          {/* Bulle de notifications */}
          <div
            className="fixed top-16 left-4 z-[10005] apple-glass rounded-2xl p-5 shadow-2xl"
            style={{
              width: 'calc(100% - 32px)',
              maxWidth: '400px',
              maxHeight: '70vh',
              animation: 'slideDown 0.3s cubic-bezier(0.19, 1, 0.22, 1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3
                className="text-base font-semibold"
                style={{
                  color: 'var(--text-primary)',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {t('activity') || 'Activity'}
              </h3>
              <button
                onClick={() => setIsExpanded(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-all active:scale-95"
                style={{
                  background: 'rgba(0, 0, 0, 0.04)',
                  color: 'var(--text-tertiary)',
                }}
              >
                <i className="fa-solid fa-xmark text-xs" />
              </button>
            </div>

            {/* Catégories Perso / Amis */}
            <div className="flex gap-2 p-1 rounded-xl mb-4" style={{ background: 'rgba(0, 0, 0, 0.03)' }}>
              <button
                onClick={() => setActiveCategory('perso')}
                className={`flex-1 text-center py-2 text-xs font-medium rounded-lg transition-all ${activeCategory === 'perso' ? 'shadow-sm' : ''
                  }`}
                style={{
                  background: activeCategory === 'perso' ? 'white' : 'transparent',
                  color: activeCategory === 'perso' ? 'var(--text-primary)' : 'var(--text-muted)',
                  boxShadow: activeCategory === 'perso' ? '0 2px 8px rgba(0,0,0,0.04)' : 'none',
                }}
              >
                {t('perso')} {persoUnreadCount > 0 && `(${persoUnreadCount})`}
              </button>
              <button
                onClick={() => setActiveCategory('amis')}
                className={`flex-1 text-center py-2 text-xs font-medium rounded-lg transition-all ${activeCategory === 'amis' ? 'shadow-sm' : ''
                  }`}
                style={{
                  background: activeCategory === 'amis' ? 'white' : 'transparent',
                  color: activeCategory === 'amis' ? 'var(--text-primary)' : 'var(--text-muted)',
                  boxShadow: activeCategory === 'amis' ? '0 2px 8px rgba(0,0,0,0.04)' : 'none',
                }}
              >
                {t('amis')} {amisUnreadCount > 0 && `(${amisUnreadCount})`}
              </button>
            </div>

            {/* Liste des activités filtrées */}
            <div className="space-y-3 max-h-[50vh] overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
              {filteredActivities.length === 0 ? (
                <div className="text-center py-8">
                  <p
                    className="text-sm"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    {activeCategory === 'perso' ? t('noActivityPerso') : t('noActivityAmis')}
                  </p>
                </div>
              ) : (
                filteredActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-xl transition-colors active:bg-black/[0.02]"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${activity.color}15` }}
                    >
                      <i
                        className={`fa-solid ${activity.icon} text-base`}
                        style={{ color: activity.color }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      {activity.category === 'amis' && activity.friendName ? (
                        <div className="flex items-center gap-2 mb-1">
                          <div className="avatar-fade" style={{ width: '28px', height: '28px' }}>
                            <img
                              src={activity.friendAvatar}
                              className="w-full h-full rounded-full object-cover"
                              alt={activity.friendName}
                            />
                          </div>
                          <span
                            className="text-sm font-medium"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {activity.friendName}
                          </span>
                        </div>
                      ) : (
                        <div
                          className="text-sm font-medium mb-1"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {t('you')}
                        </div>
                      )}
                      <p
                        className="text-xs leading-relaxed"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {activity.message}
                      </p>
                      <span
                        className="text-[10px] mt-1 block opacity-60"
                        style={{ color: 'var(--text-tertiary)' }}
                      >
                        {t('ago')} {activity.timestamp}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <style jsx>{`
            @keyframes slideDown {
              from { 
                opacity: 0;
                transform: translateY(-20px) scale(0.95);
              }
              to { 
                opacity: 1;
                transform: translateY(0) scale(1);
              }
            }
          `}</style>
        </>
      )}
    </>
  )
}

