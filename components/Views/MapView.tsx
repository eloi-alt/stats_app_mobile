'use client'

import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import dynamic from 'next/dynamic'
import Navbar from '../Navbar'
import AddCountryModal from '../Modals/AddCountryModal'
import CountryFriendsModal from '../Modals/CountryFriendsModal'
import { useLanguage } from '@/contexts/LanguageContext'
import { useVisitor } from '@/contexts/VisitorContext'
import { useTravelData, COUNTRY_NAMES, FriendCountryVisit } from '@/hooks/useTravelData'
import CanvasSkeleton from '../Skeletons/CanvasSkeleton'

// Dynamic import for MapboxGlobe to avoid SSR issues
const MapboxGlobe = dynamic(() => import('../MapboxGlobe'), {
  ssr: false,
  loading: () => <CanvasSkeleton type="globe" height="380px" />,
})

interface MapViewProps {
  mapContainerId: string
  onFullscreenChange?: (isFullscreen: boolean) => void
}

interface CountryInfo {
  code: string
  name: string
  visits: number
  lastVisitYear?: number
  firstVisitYear?: number
}

// Country flag emoji from code
const getFlagEmoji = (countryCode: string): string => {
  if (!countryCode) return '🏳️'
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}

export default function MapView({ mapContainerId, onFullscreenChange }: MapViewProps) {
  const { t } = useLanguage()
  const { isVisitor } = useVisitor()
  const travelData = useTravelData()
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const [mounted, setMounted] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState<CountryInfo | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showToast, setShowToast] = useState<string | null>(null)
  const [isMapFullscreen, setIsMapFullscreen] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

  // Friends toggle
  const [showFriendsMode, setShowFriendsMode] = useState(false)
  const [friendsCountries, setFriendsCountries] = useState<FriendCountryVisit[]>([])
  const [showFriendsModal, setShowFriendsModal] = useState(false)
  const [selectedFriendCountry, setSelectedFriendCountry] = useState<{ code: string; name: string } | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Load friends countries when toggle is enabled
  useEffect(() => {
    if (showFriendsMode && !travelData.isDemo) {
      travelData.getFriendsCountries().then(setFriendsCountries)
    }
  }, [showFriendsMode, travelData])

  // Stats from real data
  const stats = useMemo(() => ({
    totalCountries: travelData.totalCountries,
    totalTrips: travelData.totalTrips,
    totalCities: travelData.totalCities,
  }), [travelData])

  // Countries for display (user's or friends' based on toggle)
  const displayCountries = useMemo(() => {
    if (showFriendsMode) {
      // Group friends countries and count unique countries
      const countryMap = new Map<string, number>()
      friendsCountries.forEach(fc => {
        countryMap.set(fc.country_code, (countryMap.get(fc.country_code) || 0) + 1)
      })
      return Array.from(countryMap.entries()).map(([code, friendCount]) => ({
        code,
        name: COUNTRY_NAMES[code] || code,
        visits: friendCount,
        isFriend: true
      }))
    }
    return travelData.countries.map(c => ({
      code: c.country_code,
      name: c.country_name,
      visits: c.visit_count,
      lastVisitYear: c.last_visit_year,
      firstVisitYear: c.first_visit_year,
      isFriend: false
    }))
  }, [showFriendsMode, friendsCountries, travelData.countries])

  // Handle country click
  const handleCountryClick = (country: { code: string; name: string; visits: number }) => {
    if (showFriendsMode) {
      // Show friends who visited this country
      setSelectedFriendCountry({ code: country.code, name: country.name })
      setShowFriendsModal(true)
    } else {
      const userCountry = travelData.countries.find(c => c.country_code === country.code)
      setSelectedCountry({
        code: country.code,
        name: country.name,
        visits: country.visits,
        lastVisitYear: userCountry?.last_visit_year,
        firstVisitYear: userCountry?.first_visit_year
      })
    }
  }

  // Handle delete country
  const handleDeleteCountry = async (countryCode: string) => {
    const country = travelData.countries.find(c => c.country_code === countryCode)
    if (country) {
      const success = await travelData.deleteCountry(country.id)
      if (success) {
        setSelectedCountry(null)
        setShowToast('Pays supprimé')
        setTimeout(() => setShowToast(null), 2000)
      }
    }
  }

  // Calculate exploration level
  const TOTAL_COUNTRIES = 195
  const explorationPercentage = (stats.totalCountries / TOTAL_COUNTRIES) * 100

  const getExplorationLevel = (percentage: number): string => {
    if (percentage <= 10) return 'Débutant'
    if (percentage <= 25) return 'Petit Aventurier'
    if (percentage <= 50) return 'Aventurier'
    if (percentage <= 75) return 'Grand Voyageur'
    return 'Explorateur Confirmé'
  }

  // Memoized callback for getFriendsForCountry
  const getFriendsForCountryCallback = useCallback(
    (countryCode: string) => travelData.getFriendsForCountry(countryCode),
    [travelData]
  )

  return (
    <div ref={scrollContainerRef} className="content">
      <Navbar
        title={t('world')}
        subtitle={t('exploration')}
        showAvatar={false}
        scrollContainerRef={scrollContainerRef}
        isHidden={isMapFullscreen}
      />

      {/* Friends toggle is now inside MapboxGlobe */}

      {/* Exploration Level Indicator */}
      {!showFriendsMode && (
        <div className="mb-4 px-1">
          <div className="flex items-center justify-center gap-2">
            <span
              className="text-[10px] uppercase tracking-[0.2em] font-medium"
              style={{ color: 'var(--text-secondary)' }}
            >
              Niveau d&apos;exploration : {getExplorationLevel(explorationPercentage)}
            </span>
            <button
              onClick={() => setShowTooltip(!showTooltip)}
              className="relative w-4 h-4 rounded-full flex items-center justify-center transition-colors"
              style={{
                background: 'rgba(201, 169, 98, 0.15)',
                border: '1px solid rgba(201, 169, 98, 0.3)'
              }}
            >
              <i className="fa-solid fa-info text-[8px]" style={{ color: 'var(--accent-gold)' }} />
            </button>
          </div>

          {/* Tooltip */}
          {showTooltip && (
            <div
              className="absolute left-1/2 -translate-x-1/2 mt-2 px-4 py-3 rounded-xl z-50 shadow-lg animate-fade-in"
              style={{
                background: 'var(--bg-elevated)',
                backdropFilter: 'blur(20px)',
                border: '1px solid var(--border-light)',
                width: '200px'
              }}
            >
              <div className="text-center">
                <div className="text-2xl font-light mb-1" style={{ color: 'var(--accent-gold)' }}>
                  {explorationPercentage.toFixed(1)}%
                </div>
                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {stats.totalCountries} / {TOTAL_COUNTRIES} pays
                </div>
                <div className="text-[10px] mt-2" style={{ color: 'var(--text-tertiary)' }}>
                  Exploration de la Terre
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Friends mode indicator */}
      {showFriendsMode && (
        <div className="mb-4 px-1">
          <div className="flex items-center justify-center gap-2">
            <span
              className="text-[10px] uppercase tracking-[0.2em] font-medium"
              style={{ color: 'var(--accent-sage)' }}
            >
              <i className="fa-solid fa-users mr-2" />
              Mode Amis : {friendsCountries.length} visites de vos amis
            </span>
          </div>
        </div>
      )}

      {/* Mapbox Globe */}
      <div className="mb-8">
        <MapboxGlobe
          height="calc(90vh - 180px)"
          onFullscreenChange={(isFullscreen) => {
            setIsMapFullscreen(isFullscreen)
            onFullscreenChange?.(isFullscreen)
          }}
          userCountries={travelData.countries.map(c => ({
            code: c.country_code,
            name: c.country_name,
            visitYears: [c.first_visit_year, c.last_visit_year].filter(Boolean) as number[]
          }))}
          friendsCountries={friendsCountries}
          showFriendsMode={showFriendsMode}
          onToggleFriendsMode={() => setShowFriendsMode(!showFriendsMode)}
          isDemo={travelData.isDemo}
          onCountryClick={(countryCode, countryName) => {
            if (showFriendsMode) {
              setSelectedFriendCountry({ code: countryCode, name: countryName })
              setShowFriendsModal(true)
            } else {
              const userCountry = travelData.countries.find(c => c.country_code === countryCode)
              if (userCountry) {
                setSelectedCountry({
                  code: countryCode,
                  name: countryName,
                  visits: userCountry.visit_count,
                  lastVisitYear: userCountry.last_visit_year,
                  firstVisitYear: userCountry.first_visit_year
                })
              }
            }
          }}
        />
      </div>


      {/* Stats Grid */}
      {!showFriendsMode && (
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div
            className="rounded-2xl p-4 text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(165, 196, 212, 0.1) 0%, rgba(165, 196, 212, 0.05) 100%)',
              border: '1px solid rgba(165, 196, 212, 0.2)',
            }}
          >
            <div className="text-xl font-light text-display" style={{ color: 'var(--accent-sky)' }}>
              {stats.totalCountries}
            </div>
            <div className="text-[9px] uppercase tracking-wider mt-1" style={{ color: 'var(--text-muted)' }}>
              {t('countries')}
            </div>
          </div>
          <div
            className="rounded-2xl p-4 text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(201, 169, 98, 0.1) 0%, rgba(201, 169, 98, 0.05) 100%)',
              border: '1px solid rgba(201, 169, 98, 0.2)',
            }}
          >
            <div className="text-xl font-light text-display" style={{ color: 'var(--accent-gold)' }}>
              {stats.totalTrips}
            </div>
            <div className="text-[9px] uppercase tracking-wider mt-1" style={{ color: 'var(--text-muted)' }}>
              {t('trips')}
            </div>
          </div>
          <div
            className="rounded-2xl p-4 text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(139, 168, 136, 0.1) 0%, rgba(139, 168, 136, 0.05) 100%)',
              border: '1px solid rgba(139, 168, 136, 0.2)',
            }}
          >
            <div className="text-xl font-light text-display" style={{ color: 'var(--accent-sage)' }}>
              {stats.totalCities}
            </div>
            <div className="text-[9px] uppercase tracking-wider mt-1" style={{ color: 'var(--text-muted)' }}>
              {t('cities')}
            </div>
          </div>
        </div>
      )}

      {/* Section: Visited Countries */}
      <div className="flex items-center gap-3 mb-4 px-1">
        <div className="h-px flex-1" style={{ background: 'var(--border-subtle)' }} />
        <span
          className="text-sm tracking-[0.15em] uppercase font-semibold"
          style={{
            color: 'var(--text-primary)',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {showFriendsMode ? 'Pays des Amis' : t('visitedCountries')}
        </span>
        <div className="h-px flex-1" style={{ background: 'var(--border-subtle)' }} />
      </div>

      {/* Countries Grid */}
      <div className="grid grid-cols-2 gap-2 mb-5">
        {displayCountries.slice(0, 8).map(country => (
          <button
            key={country.code}
            onClick={() => handleCountryClick(country)}
            className="p-3 rounded-xl flex items-center gap-2 transition-all active:scale-95"
            style={{
              background: showFriendsMode
                ? 'linear-gradient(135deg, rgba(139, 168, 136, 0.1) 0%, rgba(139, 168, 136, 0.05) 100%)'
                : 'var(--bg-card)',
              border: showFriendsMode
                ? '1px solid rgba(139, 168, 136, 0.2)'
                : '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <span className="text-2xl">{getFlagEmoji(country.code)}</span>
            <div className="flex-1 text-left">
              <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {country.name}
              </div>
              <div className="text-[10px]" style={{ color: showFriendsMode ? 'var(--accent-sage)' : 'var(--text-tertiary)' }}>
                {showFriendsMode
                  ? `${country.visits} ami${country.visits > 1 ? 's' : ''}`
                  : `${country.visits} visite${country.visits > 1 ? 's' : ''}`
                }
              </div>
            </div>
            {showFriendsMode && (
              <i className="fa-solid fa-chevron-right text-xs" style={{ color: 'var(--text-tertiary)' }} />
            )}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {displayCountries.length === 0 && !travelData.isLoading && (
        <div className="text-center py-8" style={{ color: 'var(--text-tertiary)' }}>
          <i className="fa-solid fa-globe text-4xl mb-3 block opacity-30" />
          <p className="text-sm">
            {showFriendsMode
              ? 'Vos amis n\'ont pas encore partagé leurs voyages'
              : 'Aucun pays visité'
            }
          </p>
          {!showFriendsMode && (
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Ajoutez votre premier voyage !
            </p>
          )}
        </div>
      )}

      {/* Add Trip Button */}
      {!showFriendsMode && (
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-98 mb-4"
          style={{
            background: 'linear-gradient(135deg, #C9A962 0%, #D4C4A8 100%)',
            color: 'white',
            boxShadow: '0 4px 16px rgba(201, 169, 98, 0.3)',
          }}
        >
          <i className="fa-solid fa-plus" />
          <span className="font-medium">{t('addNewTrip')}</span>
        </button>
      )}

      {/* Country info popup (user's countries only) */}
      {selectedCountry && !showFriendsMode && (
        <div
          className="fixed bottom-[130px] left-[20px] right-[20px] z-[500] rounded-2xl p-4"
          style={{
            background: 'var(--bg-elevated)',
            backdropFilter: 'blur(20px)',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border-light)',
            animation: 'slideUp 0.3s ease-out',
          }}
        >
          <button
            onClick={() => setSelectedCountry(null)}
            className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center transition-colors"
            style={{ background: 'var(--hover-overlay)' }}
          >
            <i className="fa-solid fa-xmark text-xs" style={{ color: 'var(--text-muted)' }} />
          </button>

          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{getFlagEmoji(selectedCountry.code)}</span>
            <div>
              <h3
                className="text-lg font-light"
                style={{
                  color: 'var(--text-primary)',
                  fontFamily: 'Cormorant Garamond, Georgia, serif',
                }}
              >
                {selectedCountry.name}
              </h3>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                {selectedCountry.visits} visite{selectedCountry.visits > 1 ? 's' : ''}
                {selectedCountry.lastVisitYear && ` • Dernière: ${selectedCountry.lastVisitYear}`}
              </p>
            </div>
          </div>

          {/* Years visited */}
          {(selectedCountry.firstVisitYear || selectedCountry.lastVisitYear) && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {selectedCountry.firstVisitYear && (
                <span
                  className="px-2.5 py-1 rounded-full text-[10px] font-medium"
                  style={{
                    background: 'rgba(165, 196, 212, 0.1)',
                    color: 'var(--accent-sky)',
                  }}
                >
                  Première visite: {selectedCountry.firstVisitYear}
                </span>
              )}
              {selectedCountry.lastVisitYear && selectedCountry.lastVisitYear !== selectedCountry.firstVisitYear && (
                <span
                  className="px-2.5 py-1 rounded-full text-[10px] font-medium"
                  style={{
                    background: 'rgba(201, 169, 98, 0.1)',
                    color: 'var(--accent-gold)',
                  }}
                >
                  Dernière visite: {selectedCountry.lastVisitYear}
                </span>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => handleDeleteCountry(selectedCountry.code)}
              className="flex-1 py-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-all active:scale-95"
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.2)'
              }}
            >
              <i className="fa-solid fa-trash" />
              Supprimer
            </button>
            <button
              onClick={() => {
                setSelectedCountry(null)
                setShowAddModal(true)
              }}
              className="flex-1 py-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-all active:scale-95"
              style={{
                background: 'var(--accent-sky)',
                color: 'white',
              }}
            >
              <i className="fa-solid fa-plus" />
              Ajouter voyage
            </button>
          </div>
        </div>
      )}

      {/* Add Country Modal */}
      {mounted && (
        <AddCountryModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAddCountry={travelData.addCountry}
          onAddTrip={travelData.addTrip}
          onUploadPhoto={travelData.uploadTripPhoto}
          isDemo={travelData.isDemo}
        />
      )}

      {/* Friends Country Modal */}
      {mounted && selectedFriendCountry && (
        <CountryFriendsModal
          isOpen={showFriendsModal}
          onClose={() => {
            setShowFriendsModal(false)
            setSelectedFriendCountry(null)
          }}
          countryCode={selectedFriendCountry.code}
          countryName={selectedFriendCountry.name}
          getFriendsForCountry={getFriendsForCountryCallback}
        />
      )}

      {/* Toast */}
      {showToast && (
        <div
          className="fixed top-24 left-1/2 -translate-x-1/2 z-[1000] px-6 py-3 rounded-2xl shadow-xl animate-fade-in"
          style={{ background: 'var(--text-primary)', color: 'white' }}
        >
          <i className="fa-solid fa-check mr-2" />
          {showToast}
        </div>
      )}

      <style jsx>{`
        @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes fade-in-centered { from { opacity: 0; transform: translate(-50%, -20px); } to { opacity: 1; transform: translate(-50%, 0); } }
      `}</style>
    </div>
  )
}
