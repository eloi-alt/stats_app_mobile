'use client'

import { useState, useMemo } from 'react'

interface Country {
    code: string
    name: string
    visits: number
    lastVisit?: string
}

interface WorldMapCardProps {
    visitedCountries?: Country[]
    onClick?: () => void
}

// Simplified SVG paths for world regions (optimized for small display)
const WORLD_REGIONS = {
    // North America
    NA: "M45 45 L95 35 L115 55 L90 85 L55 90 L30 70 Z",
    // South America
    SA: "M70 110 L90 95 L95 130 L80 165 L60 145 L55 115 Z",
    // Europe
    EU: "M135 40 L165 35 L175 55 L160 70 L140 65 L130 50 Z",
    // Africa
    AF: "M130 75 L170 70 L175 120 L150 150 L120 135 L115 95 Z",
    // Asia
    AS: "M170 30 L250 25 L260 80 L220 100 L175 90 L165 55 Z",
    // Oceania
    OC: "M230 120 L270 115 L275 145 L250 155 L225 145 Z",
    // Russia/North Asia
    RU: "M170 15 L260 10 L265 40 L175 45 Z",
}

// Country to region mapping
const COUNTRY_REGIONS: Record<string, string> = {
    US: 'NA', CA: 'NA', MX: 'NA',
    BR: 'SA', AR: 'SA', CL: 'SA', CO: 'SA', PE: 'SA',
    FR: 'EU', DE: 'EU', IT: 'EU', ES: 'EU', GB: 'EU', PT: 'EU', NL: 'EU', BE: 'EU', CH: 'EU', AT: 'EU', GR: 'EU', PL: 'EU', CZ: 'EU', SE: 'EU', NO: 'EU', DK: 'EU', FI: 'EU', IE: 'EU',
    MA: 'AF', EG: 'AF', ZA: 'AF', KE: 'AF', NG: 'AF', TN: 'AF', SN: 'AF',
    JP: 'AS', CN: 'AS', KR: 'AS', TH: 'AS', VN: 'AS', ID: 'AS', MY: 'AS', SG: 'AS', PH: 'AS', IN: 'AS', AE: 'AS', TR: 'AS', IL: 'AS',
    AU: 'OC', NZ: 'OC', FJ: 'OC',
    RU: 'RU',
}

// Total countries in the world (UN member states)
const TOTAL_COUNTRIES = 195

// Explorer status based on countries visited
const getExplorerStatus = (count: number): { title: string; icon: string; color: string } => {
    if (count >= 100) return { title: 'Légende Mondiale', icon: 'fa-crown', color: 'var(--accent-gold)' }
    if (count >= 50) return { title: 'Grand Explorateur', icon: 'fa-globe', color: 'var(--accent-purple)' }
    if (count >= 25) return { title: 'Voyageur Aguerri', icon: 'fa-plane', color: 'var(--accent-cyan)' }
    if (count >= 10) return { title: 'Aventurier', icon: 'fa-compass', color: 'var(--accent-green)' }
    if (count >= 5) return { title: 'Explorateur', icon: 'fa-map', color: 'var(--accent-blue)' }
    return { title: 'Novice', icon: 'fa-seedling', color: 'var(--accent-orange)' }
}

// Country flag emoji from code
const getFlagEmoji = (countryCode: string): string => {
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0))
    return String.fromCodePoint(...codePoints)
}

export default function WorldMapCard({ visitedCountries = [], onClick }: WorldMapCardProps) {
    const [hoveredRegion, setHoveredRegion] = useState<string | null>(null)

    // Calculate visited regions with intensity
    const regionIntensity = useMemo(() => {
        const intensity: Record<string, number> = {}
        visitedCountries.forEach(country => {
            const region = COUNTRY_REGIONS[country.code]
            if (region) {
                intensity[region] = (intensity[region] || 0) + country.visits
            }
        })
        // Normalize to 0-1
        const maxIntensity = Math.max(...Object.values(intensity), 1)
        Object.keys(intensity).forEach(key => {
            intensity[key] = intensity[key] / maxIntensity
        })
        return intensity
    }, [visitedCountries])

    // Calculate visited regions set
    const visitedRegions = useMemo(() => {
        const regions = new Set<string>()
        visitedCountries.forEach(country => {
            const region = COUNTRY_REGIONS[country.code]
            if (region) regions.add(region)
        })
        return regions
    }, [visitedCountries])

    const explorerStatus = getExplorerStatus(visitedCountries.length)
    const worldPercentage = Math.round((visitedCountries.length / TOTAL_COUNTRIES) * 100)

    // Sort countries by visits (most visited first)
    const sortedCountries = useMemo(() => {
        return [...visitedCountries].sort((a, b) => b.visits - a.visits)
    }, [visitedCountries])

    // Get heatmap color based on intensity
    const getHeatmapColor = (region: string, intensity: number): string => {
        if (!visitedRegions.has(region)) {
            return 'rgba(255, 255, 255, 0.05)'
        }
        // Gradient from cyan to purple based on intensity
        const r = Math.round(100 + intensity * 91) // 100 -> 191
        const g = Math.round(210 - intensity * 120) // 210 -> 90
        const b = Math.round(255 - intensity * 13) // 255 -> 242
        return `rgba(${r}, ${g}, ${b}, ${0.4 + intensity * 0.4})`
    }

    return (
        <div
            className="glass cursor-pointer relative overflow-hidden"
            onClick={onClick}
        >
            {/* Decorative glow effect */}
            <div
                className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-20"
                style={{ background: explorerStatus.color }}
            />

            {/* Header */}
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                    <div className="text-[11px] uppercase tracking-widest text-gray-400 font-bold flex items-center gap-2">
                        <i className={`fa-solid ${explorerStatus.icon}`} style={{ color: explorerStatus.color }} />
                        CARTE D&apos;EXPLORATION
                    </div>
                    <div className="text-lg font-bold text-white mt-1">{explorerStatus.title}</div>
                </div>
                <div className="text-right">
                    <div
                        className="text-2xl font-extrabold"
                        style={{ color: explorerStatus.color }}
                    >
                        {worldPercentage}%
                    </div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wide">du monde</div>
                </div>
            </div>

            {/* Mini World Map SVG */}
            <div className="relative bg-black/20 rounded-2xl p-3 mb-4 overflow-hidden">
                <svg
                    viewBox="0 0 300 170"
                    className="w-full h-auto"
                    style={{ filter: 'drop-shadow(0 0 8px rgba(100, 210, 255, 0.2))' }}
                >
                    {/* Grid lines for style */}
                    <defs>
                        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                        </pattern>
                        <linearGradient id="mapGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="var(--accent-cyan)" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="var(--accent-purple)" stopOpacity="0.3" />
                        </linearGradient>
                    </defs>
                    <rect width="300" height="170" fill="url(#grid)" />

                    {/* World regions */}
                    {Object.entries(WORLD_REGIONS).map(([region, path]) => (
                        <path
                            key={region}
                            d={path}
                            fill={getHeatmapColor(region, regionIntensity[region] || 0)}
                            stroke={visitedRegions.has(region) ? 'rgba(100, 210, 255, 0.6)' : 'rgba(255, 255, 255, 0.1)'}
                            strokeWidth={visitedRegions.has(region) ? 1.5 : 0.5}
                            className="transition-all duration-300"
                            onMouseEnter={() => setHoveredRegion(region)}
                            onMouseLeave={() => setHoveredRegion(null)}
                            style={{
                                filter: hoveredRegion === region ? 'brightness(1.3)' : 'none',
                                transform: hoveredRegion === region ? 'scale(1.02)' : 'scale(1)',
                                transformOrigin: 'center',
                            }}
                        />
                    ))}

                    {/* Pulsing dots for visited regions */}
                    {visitedRegions.size > 0 && (
                        <>
                            {visitedRegions.has('NA') && <circle cx="70" cy="60" r="3" fill="var(--accent-cyan)" className="animate-pulse" />}
                            {visitedRegions.has('SA') && <circle cx="75" cy="130" r="3" fill="var(--accent-cyan)" className="animate-pulse" />}
                            {visitedRegions.has('EU') && <circle cx="150" cy="50" r="3" fill="var(--accent-cyan)" className="animate-pulse" />}
                            {visitedRegions.has('AF') && <circle cx="145" cy="110" r="3" fill="var(--accent-cyan)" className="animate-pulse" />}
                            {visitedRegions.has('AS') && <circle cx="215" cy="60" r="3" fill="var(--accent-cyan)" className="animate-pulse" />}
                            {visitedRegions.has('OC') && <circle cx="250" cy="135" r="3" fill="var(--accent-cyan)" className="animate-pulse" />}
                            {visitedRegions.has('RU') && <circle cx="215" cy="25" r="3" fill="var(--accent-cyan)" className="animate-pulse" />}
                        </>
                    )}
                </svg>

                {/* Region label on hover */}
                {hoveredRegion && (
                    <div className="absolute bottom-2 left-2 text-[10px] text-cyan-400 font-mono bg-black/50 px-2 py-1 rounded">
                        {hoveredRegion === 'NA' && 'Amérique du Nord'}
                        {hoveredRegion === 'SA' && 'Amérique du Sud'}
                        {hoveredRegion === 'EU' && 'Europe'}
                        {hoveredRegion === 'AF' && 'Afrique'}
                        {hoveredRegion === 'AS' && 'Asie'}
                        {hoveredRegion === 'OC' && 'Océanie'}
                        {hoveredRegion === 'RU' && 'Russie'}
                    </div>
                )}
            </div>

            {/* Stats bar */}
            <div className="flex justify-around mb-4 text-center">
                <div>
                    <div className="text-xl font-bold text-white">{visitedCountries.length}</div>
                    <div className="text-[9px] text-gray-500 uppercase tracking-wider">Pays</div>
                </div>
                <div className="w-px bg-white/10" />
                <div>
                    <div className="text-xl font-bold text-white">{visitedRegions.size}</div>
                    <div className="text-[9px] text-gray-500 uppercase tracking-wider">Continents</div>
                </div>
                <div className="w-px bg-white/10" />
                <div>
                    <div className="text-xl font-bold text-white">
                        {sortedCountries.reduce((acc, c) => acc + c.visits, 0)}
                    </div>
                    <div className="text-[9px] text-gray-500 uppercase tracking-wider">Visites</div>
                </div>
            </div>

            {/* Countries list (heatmap style) */}
            {sortedCountries.length > 0 && (
                <div className="space-y-2">
                    <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                        Pays Visités
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {sortedCountries.slice(0, 12).map((country, index) => {
                            // Heat intensity based on visits (more visits = more intense)
                            const maxVisits = Math.max(...sortedCountries.map(c => c.visits))
                            const intensity = country.visits / maxVisits
                            const hue = 180 + (intensity * 100) // cyan to purple

                            return (
                                <div
                                    key={country.code}
                                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105"
                                    style={{
                                        background: `hsla(${hue}, 70%, 50%, ${0.15 + intensity * 0.2})`,
                                        border: `1px solid hsla(${hue}, 70%, 50%, ${0.3 + intensity * 0.3})`,
                                        color: `hsla(${hue}, 70%, 75%, 1)`,
                                    }}
                                    title={`${country.name} - ${country.visits} visite(s)`}
                                >
                                    <span className="text-sm">{getFlagEmoji(country.code)}</span>
                                    <span>{country.code}</span>
                                    {country.visits > 1 && (
                                        <span
                                            className="text-[9px] opacity-70 ml-0.5"
                                        >
                                            ×{country.visits}
                                        </span>
                                    )}
                                </div>
                            )
                        })}
                        {sortedCountries.length > 12 && (
                            <div className="flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium bg-white/5 text-gray-400 border border-white/10">
                                +{sortedCountries.length - 12}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Empty state */}
            {visitedCountries.length === 0 && (
                <div className="text-center py-6">
                    <i className="fa-solid fa-globe text-4xl text-gray-600 mb-3" />
                    <div className="text-sm text-gray-500">Aucun pays enregistré</div>
                    <div className="text-xs text-gray-600 mt-1">Commencez votre exploration !</div>
                </div>
            )}

            {/* Progress bar */}
            <div className="mt-4">
                <div className="bar-bg">
                    <div
                        className="bar-fill relative overflow-hidden"
                        style={{
                            width: `${worldPercentage}%`,
                            background: `linear-gradient(90deg, var(--accent-cyan), var(--accent-purple))`,
                        }}
                    >
                        {/* Shimmer effect */}
                        <div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                            style={{
                                animation: 'shimmer 2s infinite',
                            }}
                        />
                    </div>
                </div>
                <div className="flex justify-between text-[9px] text-gray-500 mt-1.5 px-0.5">
                    <span>{visitedCountries.length} / {TOTAL_COUNTRIES} pays</span>
                    <span>Objectif: Légende (100 pays)</span>
                </div>
            </div>

            {/* Chevron indicator */}
            <i className="fa-solid fa-chevron-right absolute right-5 top-1/2 -translate-y-1/2 opacity-20 text-white" />

            {/* Shimmer animation style */}
            <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
        </div>
    )
}

