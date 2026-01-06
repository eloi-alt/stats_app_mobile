'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import dynamic from 'next/dynamic'
import Navbar from '../Navbar'
import CountryDetailModal from '../Modals/CountryDetailModal'
import EmptyModuleState from '../UI/EmptyModuleState'
import { visitedCountries, ThomasMorel } from '@/data/mockData'
import { useLanguage } from '@/contexts/LanguageContext'
import { useVisitor } from '@/contexts/VisitorContext'
import { useTravelData } from '@/hooks/useTravelData'
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
  lastVisit?: string
  regions?: string[]
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
  const [showCountryModal, setShowCountryModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showToast, setShowToast] = useState<string | null>(null)
  const [isMapFullscreen, setIsMapFullscreen] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

  // Pattern mounted pour éviter les erreurs SSR
  useEffect(() => {
    setMounted(true)
  }, [])

  // Stats from the data - use real data or mock data based on visitor mode
  const stats = useMemo(() => {
    if (isVisitor) {
      return {
        totalCountries: visitedCountries.length,
        totalDistanceKm: ThomasMorel.moduleB.stats.totalDistanceKm,
        currentYearDistanceKm: ThomasMorel.moduleB.stats.currentYear.distanceKm,
        trips: ThomasMorel.moduleB.trips.length,
      }
    }
    return {
      totalCountries: travelData.totalCountriesVisited,
      totalDistanceKm: travelData.totalDistanceKm,
      currentYearDistanceKm: travelData.totalDistanceKm, // TODO: Filter by year
      trips: travelData.totalTrips,
    }
  }, [isVisitor, travelData])

  // Show empty state for authenticated users without any travel data
  const showEmptyState = !isVisitor && !travelData.isLoading && !travelData.hasAnyData

  // Loading state
  if (!isVisitor && travelData.isLoading) {
    return (
      <div className="content">
        <Navbar
          title={t('world')}
          subtitle={t('exploration')}
          showAvatar={false}
          scrollContainerRef={scrollContainerRef}
          isHidden={isMapFullscreen}
        />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: 'var(--accent-sky) transparent transparent transparent' }}
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
          title={t('world')}
          subtitle={t('exploration')}
          showAvatar={false}
          scrollContainerRef={scrollContainerRef}
        />
        <EmptyModuleState
          moduleName="Monde"
          moduleIcon="fa-globe"
          moduleColor="var(--accent-sky)"
          title="Commencez votre exploration"
          description="Ajoutez votre premier voyage pour visualiser vos découvertes sur le globe et suivre votre progression d'explorateur."
          actionLabel="Ajouter un voyage"
          onAction={() => setShowAddModal(true)}
        />
      </div>
    )
  }

  // Get country details
  const getCountryDetails = (code: string): CountryInfo | null => {
    const country = ThomasMorel.moduleB.countriesVisited.find(c => c.code === code)
    if (!country) return null
    return {
      code: country.code,
      name: country.name,
      visits: country.visitCount,
      lastVisit: country.lastVisit,
      regions: country.regions?.map(r => r.name),
    }
  }

  // Handle country click from globe
  const handleCountryClick = (country: { code: string; name: string; visits: number }) => {
    const details = getCountryDetails(country.code)
    setSelectedCountry(details || { code: country.code, name: country.name, visits: country.visits })
  }

  // Transform visited countries for Globe3D
  const globeCountries = useMemo(() =>
    visitedCountries.map(c => ({
      code: c.code,
      name: c.name,
      lat: 0,
      lng: 0,
      visits: c.visits,
    }))
    , [])

  const handleAddTrip = () => {
    setShowToast(t('tripAdded'))
    setShowAddModal(false)
    setTimeout(() => setShowToast(null), 2000)
  }

  // Calculate exploration level
  const TOTAL_COUNTRIES = 195 // UN-recognized countries
  const explorationPercentage = (stats.totalCountries / TOTAL_COUNTRIES) * 100

  const getExplorationLevel = (percentage: number): string => {
    if (percentage <= 10) return 'Débutant'
    if (percentage <= 25) return 'Petit Aventurier'
    if (percentage <= 50) return 'Aventurier'
    if (percentage <= 75) return 'Grand Voyageur'
    return 'Explorateur Confirmé'
  }

  return (
    <div ref={scrollContainerRef} className="content">
      <Navbar
        title={t('world')}
        subtitle={t('exploration')}
        showAvatar={false}
        scrollContainerRef={scrollContainerRef}
        isHidden={isMapFullscreen}
      />

      {/* Exploration Level Indicator */}
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

      {/* Mapbox Globe - Seamless borderless integration */}
      <div className="mb-8">
        <MapboxGlobe
          height="calc(90vh - 180px)"
          onFullscreenChange={(isFullscreen) => {
            setIsMapFullscreen(isFullscreen)
            onFullscreenChange?.(isFullscreen)
          }}
        />
      </div>

      {/* Stats Grid - Moved below globe */}
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
            {stats.trips}
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
            {(stats.totalDistanceKm / 1000).toFixed(0)}k
          </div>
          <div className="text-[9px] uppercase tracking-wider mt-1" style={{ color: 'var(--text-muted)' }}>
            {t('km2025')}
          </div>
        </div>
      </div>

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
          {t('visitedCountries')}
        </span>
        <div className="h-px flex-1" style={{ background: 'var(--border-subtle)' }} />
      </div>

      <div className="grid grid-cols-2 gap-2 mb-5">
        {visitedCountries.slice(0, 8).map(country => (
          <button
            key={country.code}
            onClick={() => {
              const details = getCountryDetails(country.code)
              setSelectedCountry(details || { code: country.code, name: country.name, visits: country.visits })
            }}
            className="p-3 rounded-xl flex items-center gap-2 transition-all active:scale-95"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <span className="text-2xl">{getFlagEmoji(country.code)}</span>
            <div className="flex-1 text-left">
              <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{country.name}</div>
              <div className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{country.visits} visit{country.visits > 1 ? 's' : ''}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Add Trip Button */}
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

      {/* Country info popup */}
      {selectedCountry && (
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
              <p
                className="text-xs"
                style={{ color: 'var(--text-tertiary)' }}
              >
                {selectedCountry.visits} visit{selectedCountry.visits > 1 ? 's' : ''}
                {selectedCountry.lastVisit && ` • Last: ${new Date(selectedCountry.lastVisit).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`}
              </p>
            </div>
          </div>

          {selectedCountry.regions && selectedCountry.regions.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {selectedCountry.regions.slice(0, 3).map((region) => (
                <span
                  key={region}
                  className="px-2.5 py-1 rounded-full text-[10px] font-medium"
                  style={{
                    background: 'rgba(201, 169, 98, 0.1)',
                    color: 'var(--accent-gold)',
                  }}
                >
                  {region}
                </span>
              ))}
            </div>
          )}

          {/* View Details button */}
          <button
            onClick={() => {
              setShowCountryModal(true)
            }}
            className="w-full py-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-all active:scale-95"
            style={{
              background: 'var(--accent-sky)',
              color: 'white',
            }}
          >
            <i className="fa-solid fa-expand" />
            View Full Details
          </button>
        </div>
      )}

      {/* Add trip modal */}
      {mounted && showAddModal && createPortal(
        <div
          className="fixed inset-0 z-[99999] flex flex-col justify-end"
          onClick={() => setShowAddModal(false)}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md" />
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full bg-[var(--bg-elevated)] rounded-t-[32px] pb-safe pt-6 px-5 shadow-[0_-8px_40px_rgba(0,0,0,0.15)] max-h-[85vh] overflow-y-auto cursor-default"
          >
            <div className="w-10 h-1 rounded-full mx-auto mb-6" style={{ background: 'var(--separator-color)' }} />
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              style={{
                background: 'var(--hover-overlay)',
                color: 'var(--text-tertiary)',
              }}
            >
              <i className="fa-solid fa-xmark text-sm" />
            </button>
            <h3
              className="text-xl font-light text-display mb-6 pr-10"
              style={{ color: 'var(--text-primary)' }}
            >
              {t('addNewTrip')}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-tertiary mb-1 block">{t('destination')}</label>
                <input
                  type="text"
                  placeholder={t('whereGoing')}
                  className="apple-input w-full"
                  style={{
                    background: 'rgba(0, 0, 0, 0.03)',
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    borderRadius: '12px',
                    padding: '14px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-tertiary mb-1 block">{t('start')}</label>
                  <input type="date" className="apple-input w-full" style={{ background: 'rgba(0, 0, 0, 0.03)', border: '1px solid rgba(0, 0, 0, 0.08)', borderRadius: '12px', padding: '12px' }} />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-tertiary mb-1 block">{t('end')}</label>
                  <input type="date" className="apple-input w-full" style={{ background: 'rgba(0, 0, 0, 0.03)', border: '1px solid rgba(0, 0, 0, 0.08)', borderRadius: '12px', padding: '12px' }} />
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-tertiary mb-1 block">{t('purpose')}</label>
                <div className="flex flex-wrap gap-2">
                  {[t('leisure'), t('work'), t('family'), t('adventure')].map(tag => (
                    <button key={tag} className="px-4 py-2 rounded-xl text-xs font-medium border border-black/5 bg-black/5 hover:bg-black/10 transition-colors">
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-8">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-4 rounded-2xl text-sm font-medium"
                style={{ background: 'var(--hover-overlay)', color: 'var(--text-secondary)' }}
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleAddTrip}
                className="flex-1 py-4 rounded-2xl text-sm font-medium"
                style={{ background: 'var(--accent-sky)', color: 'white' }}
              >
                {t('add')}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Toast */}
      {showToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[1000] px-6 py-3 rounded-2xl shadow-xl animate-fade-in" style={{ background: 'var(--text-primary)', color: 'white' }}>
          <i className="fa-solid fa-check mr-2" />
          {showToast}
        </div>
      )}

      <style jsx>{`
        @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes fade-in-centered { from { opacity: 0; transform: translate(-50%, -20px); } to { opacity: 1; transform: translate(-50%, 0); } }
      `}</style>

      {/* Country Detail Modal */}
      {selectedCountry && (
        <CountryDetailModal
          isOpen={showCountryModal}
          onClose={() => setShowCountryModal(false)}
          countryCode={selectedCountry.code}
          countryName={selectedCountry.name}
        />
      )}
    </div>
  )
}
