'use client'

import { useMemo } from 'react'

interface Country {
  code: string
  name: string
  visits: number
  lastVisit?: string
}

interface HeroWorldCardProps {
  visitedCountries: Country[]
  totalCountries?: number
  onClick?: () => void
}

// Country positions on SVG map (approximate center points)
const COUNTRY_POSITIONS: Record<string, { x: number; y: number }> = {
  // Europe
  FR: { x: 145, y: 52 }, DE: { x: 155, y: 48 }, IT: { x: 158, y: 58 },
  ES: { x: 135, y: 60 }, GB: { x: 140, y: 44 }, PT: { x: 128, y: 60 },
  NL: { x: 150, y: 45 }, BE: { x: 148, y: 47 }, CH: { x: 153, y: 52 },
  AT: { x: 160, y: 52 }, GR: { x: 170, y: 64 }, PL: { x: 165, y: 46 },
  SE: { x: 162, y: 34 }, NO: { x: 155, y: 30 }, DK: { x: 155, y: 40 },
  FI: { x: 172, y: 28 }, IE: { x: 132, y: 44 }, CZ: { x: 160, y: 48 },
  // Americas
  US: { x: 70, y: 55 }, CA: { x: 65, y: 38 }, MX: { x: 55, y: 75 },
  BR: { x: 85, y: 120 }, AR: { x: 75, y: 150 }, CL: { x: 70, y: 145 },
  CO: { x: 70, y: 95 }, PE: { x: 68, y: 108 },
  // Asia
  JP: { x: 268, y: 58 }, CN: { x: 235, y: 60 }, KR: { x: 258, y: 58 },
  TH: { x: 230, y: 85 }, VN: { x: 238, y: 82 }, ID: { x: 245, y: 105 },
  MY: { x: 235, y: 95 }, SG: { x: 235, y: 98 }, PH: { x: 252, y: 85 },
  IN: { x: 210, y: 78 }, AE: { x: 195, y: 75 }, TR: { x: 178, y: 62 },
  IL: { x: 180, y: 68 }, RU: { x: 200, y: 35 },
  // Africa
  MA: { x: 135, y: 70 }, EG: { x: 175, y: 72 }, ZA: { x: 172, y: 140 },
  KE: { x: 180, y: 105 }, NG: { x: 155, y: 90 }, TN: { x: 155, y: 68 },
  SN: { x: 128, y: 85 },
  // Oceania
  AU: { x: 258, y: 135 }, NZ: { x: 285, y: 150 }, FJ: { x: 295, y: 120 },
}

// Simplified world map path
const WORLD_PATH = `
  M40,50 L100,35 L110,55 L85,85 L50,90 L25,70 Z
  M65,105 L90,92 L95,130 L75,165 L55,140 L50,110 Z
  M130,35 L175,30 L180,65 L155,75 L125,68 L120,45 Z
  M125,80 L175,75 L180,125 L150,155 L115,140 L110,100 Z
  M175,20 L275,15 L280,95 L225,105 L175,95 L170,55 Z
  M235,115 L280,110 L285,150 L255,160 L230,150 Z
`

const getFlagEmoji = (countryCode: string): string => {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}

export default function HeroWorldCard({ visitedCountries, totalCountries = 195, onClick }: HeroWorldCardProps) {
  const percentage = Math.round((visitedCountries.length / totalCountries) * 100)

  // Get top 5 most visited countries
  const topCountries = useMemo(() => {
    return [...visitedCountries]
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 5)
  }, [visitedCountries])

  // Calculate unique continents
  const continents = useMemo(() => {
    const continentMap: Record<string, string[]> = {
      europe: ['FR', 'DE', 'IT', 'ES', 'GB', 'PT', 'NL', 'BE', 'CH', 'AT', 'GR', 'PL', 'SE', 'NO', 'DK', 'FI', 'IE', 'CZ'],
      americas: ['US', 'CA', 'MX', 'BR', 'AR', 'CL', 'CO', 'PE'],
      asia: ['JP', 'CN', 'KR', 'TH', 'VN', 'ID', 'MY', 'SG', 'PH', 'IN', 'AE', 'TR', 'IL', 'RU'],
      africa: ['MA', 'EG', 'ZA', 'KE', 'NG', 'TN', 'SN'],
      oceania: ['AU', 'NZ', 'FJ'],
    }
    const visited = new Set<string>()
    visitedCountries.forEach(c => {
      Object.entries(continentMap).forEach(([continent, codes]) => {
        if (codes.includes(c.code)) visited.add(continent)
      })
    })
    return visited.size
  }, [visitedCountries])

  return (
    <div
      className="relative overflow-hidden cursor-pointer rounded-[32px] mb-4"
      onClick={onClick}
      style={{
        background: 'linear-gradient(135deg, rgba(20, 30, 48, 0.95) 0%, rgba(17, 23, 41, 0.98) 100%)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        boxShadow: '0 8px 40px rgba(59, 130, 246, 0.15), inset 0 1px 0 rgba(255,255,255,0.05)',
      }}
    >
      {/* Animated gradient background */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: 'radial-gradient(ellipse at 30% 20%, rgba(59, 130, 246, 0.4) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)',
        }}
      />

      {/* Pin indicator */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <span className="text-[9px] uppercase tracking-widest text-amber-400/80 font-bold">Épinglé</span>
        <div className="w-6 h-6 rounded-full bg-amber-400/20 flex items-center justify-center">
          <i className="fa-solid fa-thumbtack text-amber-400 text-[10px]" />
        </div>
      </div>

      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="text-3xl">🌍</div>
          <div>
            <h2 className="text-xl font-bold text-white">Carte d&apos;Exploration</h2>
            <p className="text-sm text-blue-300/70">Voyageur Aguerri</p>
          </div>
        </div>

        {/* SVG World Map */}
        <div className="relative bg-black/30 rounded-2xl p-4 mb-5 overflow-hidden">
          <svg
            viewBox="0 0 320 180"
            className="w-full h-auto"
            style={{ filter: 'drop-shadow(0 0 12px rgba(59, 130, 246, 0.3))' }}
          >
            {/* Grid pattern */}
            <defs>
              <pattern id="heroGrid" width="16" height="16" patternUnits="userSpaceOnUse">
                <circle cx="8" cy="8" r="0.5" fill="rgba(255,255,255,0.08)" />
              </pattern>
              <radialGradient id="mapGlow" cx="50%" cy="50%" r="60%">
                <stop offset="0%" stopColor="rgba(59, 130, 246, 0.15)" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <rect width="320" height="180" fill="url(#heroGrid)" />
            <rect width="320" height="180" fill="url(#mapGlow)" />

            {/* World outline */}
            <path
              d={WORLD_PATH}
              fill="rgba(255, 255, 255, 0.03)"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="0.5"
            />

            {/* Visited country dots with glow */}
            {visitedCountries.map((country, idx) => {
              const pos = COUNTRY_POSITIONS[country.code]
              if (!pos) return null

              const intensity = Math.min(1, country.visits / 5)
              const radius = 3 + intensity * 3

              return (
                <g key={country.code}>
                  {/* Glow effect */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={radius * 2.5}
                    fill={`rgba(59, 130, 246, ${0.1 + intensity * 0.2})`}
                    className="animate-pulse"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  />
                  {/* Main dot */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={radius}
                    fill={`rgba(96, 165, 250, ${0.7 + intensity * 0.3})`}
                    stroke="rgba(255, 255, 255, 0.5)"
                    strokeWidth="0.5"
                    filter="url(#glow)"
                  />
                  {/* Center bright point */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={1}
                    fill="white"
                  />
                </g>
              )
            })}

            {/* Connection lines between nearby visited countries */}
            {visitedCountries.slice(0, 8).map((country, idx) => {
              const pos = COUNTRY_POSITIONS[country.code]
              const nextCountry = visitedCountries[idx + 1]
              const nextPos = nextCountry ? COUNTRY_POSITIONS[nextCountry.code] : null

              if (!pos || !nextPos) return null

              const distance = Math.sqrt(Math.pow(nextPos.x - pos.x, 2) + Math.pow(nextPos.y - pos.y, 2))
              if (distance > 60) return null

              return (
                <line
                  key={`line-${country.code}`}
                  x1={pos.x}
                  y1={pos.y}
                  x2={nextPos.x}
                  y2={nextPos.y}
                  stroke="rgba(59, 130, 246, 0.2)"
                  strokeWidth="0.5"
                  strokeDasharray="2,2"
                />
              )
            })}
          </svg>
        </div>

        {/* Stats row */}
        <div className="flex justify-between items-center mb-5">
          <div className="flex gap-6">
            <div className="text-center">
              <div className="text-3xl font-extrabold text-white">{visitedCountries.length}</div>
              <div className="text-[10px] uppercase tracking-wider text-gray-400">Pays</div>
            </div>
            <div className="w-px bg-white/10" />
            <div className="text-center">
              <div className="text-3xl font-extrabold text-white">{continents}</div>
              <div className="text-[10px] uppercase tracking-wider text-gray-400">Continents</div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-4xl font-black text-blue-400">{percentage}%</div>
            <div className="text-[10px] uppercase tracking-wider text-gray-500">du monde</div>
          </div>
        </div>

        {/* Country flags row */}
        <div className="flex flex-wrap gap-2 mb-4">
          {topCountries.map((country) => (
            <div
              key={country.code}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{
                background: 'rgba(59, 130, 246, 0.15)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
              }}
            >
              <span className="text-base">{getFlagEmoji(country.code)}</span>
              <span className="text-blue-300">{country.name}</span>
              {country.visits > 1 && (
                <span className="text-blue-400/60 text-[10px]">×{country.visits}</span>
              )}
            </div>
          ))}
          {visitedCountries.length > 5 && (
            <div className="flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-white/5 text-gray-400">
              +{visitedCountries.length - 5}
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="relative">
          <div className="h-2 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full relative overflow-hidden"
              style={{
                width: `${percentage}%`,
                background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
              }}
            >
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                style={{ animation: 'shimmer 2s infinite' }}
              />
            </div>
          </div>
          <div className="flex justify-between text-[9px] text-gray-500 mt-1.5">
            <span>Prochain objectif: 15 pays</span>
            <span>Légende: 100 pays</span>
          </div>
        </div>
      </div>

      {/* Chevron */}
      <i className="fa-solid fa-chevron-right absolute right-5 top-1/2 -translate-y-1/2 opacity-20 text-white text-lg" />

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  )
}

