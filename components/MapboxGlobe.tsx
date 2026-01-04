'use client'

import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { USER_TRIPS, FRIENDS_DATA, COUNTRY_CODES } from '@/data/worldData'

// --- Configuration ---
const MAPBOX_TOKEN = 'pk.eyJ1IjoiZWxvaWNhcnJlbGV0IiwiYSI6ImNtanUzY3EyZTJja2UzY3NkZTdtMzBkbHQifQ.o6Xn-vIpPhSr6yloB9AIzw'

// Helper function to get country flag emoji from ISO code
// Map ISO 3166-1 alpha-3 codes to alpha-2 codes for flag emojis
const ISO3_TO_ISO2: Record<string, string> = {
    'FRA': 'FR', 'ESP': 'ES', 'ITA': 'IT', 'GBR': 'GB', 'DEU': 'DE',
    'USA': 'US', 'CAN': 'CA', 'MEX': 'MX', 'BRA': 'BR', 'ARG': 'AR',
    'JPN': 'JP', 'CHN': 'CN', 'KOR': 'KR', 'IND': 'IN', 'THA': 'TH',
    'VNM': 'VN', 'IDN': 'ID', 'MYS': 'MY', 'SGP': 'SG', 'PHL': 'PH',
    'AUS': 'AU', 'NZL': 'NZ', 'ZAF': 'ZA', 'EGY': 'EG', 'MAR': 'MA',
    'TUN': 'TN', 'KEN': 'KE', 'TZA': 'TZ', 'GHA': 'GH', 'NGA': 'NG',
    'RUS': 'RU', 'UKR': 'UA', 'POL': 'PL', 'CZE': 'CZ', 'AUT': 'AT',
    'CHE': 'CH', 'NLD': 'NL', 'BEL': 'BE', 'DNK': 'DK', 'SWE': 'SE',
    'NOR': 'NO', 'FIN': 'FI', 'ISL': 'IS', 'IRL': 'IE', 'PRT': 'PT',
    'GRC': 'GR', 'TUR': 'TR', 'ISR': 'IL', 'ARE': 'AE', 'SAU': 'SA',
    'QAT': 'QA', 'OMN': 'OM', 'KWT': 'KW', 'JOR': 'JO', 'LBN': 'LB',
    'CHL': 'CL', 'PER': 'PE', 'COL': 'CO', 'VEN': 'VE', 'ECU': 'EC',
    'URY': 'UY', 'PRY': 'PY', 'BOL': 'BO', 'CRI': 'CR', 'PAN': 'PA',
    'CUB': 'CU', 'DOM': 'DO', 'JAM': 'JM', 'TTO': 'TT', 'BHS': 'BS',
    'HUN': 'HU', 'ROU': 'RO', 'BGR': 'BG', 'HRV': 'HR', 'SRB': 'RS',
    'SVN': 'SI', 'SVK': 'SK', 'EST': 'EE', 'LVA': 'LV', 'LTU': 'LT',
    'GEO': 'GE', 'ARM': 'AM', 'AZE': 'AZ', 'KAZ': 'KZ', 'UZB': 'UZ',
    'PAK': 'PK', 'BGD': 'BD', 'LKA': 'LK', 'NPL': 'NP', 'BTN': 'BT',
    'MMR': 'MM', 'KHM': 'KH', 'LAO': 'LA', 'MNG': 'MN', 'TWN': 'TW',
    'HKG': 'HK', 'MAC': 'MO', 'BRN': 'BN', 'MDV': 'MV', 'FJI': 'FJ',
}

const getCountryFlag = (isoCode: string): string => {
    // Convert 3-letter code to 2-letter code if needed
    const iso2Code = isoCode.length === 3 ? (ISO3_TO_ISO2[isoCode] || isoCode.slice(0, 2)) : isoCode
    const codePoints = iso2Code
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0))
    return String.fromCodePoint(...codePoints)
}

// Home position (Paris/Europe)
const HOME_CENTER: [number, number] = [2.35, 48.85]
const HOME_ZOOM = 1.0 // Lower zoom to show full globe

// Theme colors from the app
const THEME_COLORS = {
    gold: '#C9A962',
    sage: '#8BA888',
    sky: '#A5C4D4',
    friend: '#A78BFA', // Light purple for friends
}

interface MapboxGlobeProps {
    height?: string
    onReady?: () => void
    onFullscreenChange?: (isFullscreen: boolean) => void
}

export default function MapboxGlobe({ height = '342px', onReady, onFullscreenChange }: MapboxGlobeProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null)
    const mapRef = useRef<mapboxgl.Map | null>(null)
    const spinIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const isSpinningRef = useRef(true)

    const [isLoaded, setIsLoaded] = useState(false)
    const [isExpanded, setIsExpanded] = useState(false)
    const [selectedYear, setSelectedYear] = useState<number>(2026)
    const [showFriends, setShowFriends] = useState(false)
    const [selectedCountry, setSelectedCountry] = useState<{ code: string, name: string, visitors: { name: string, years: number[] }[] } | null>(null)
    const [isSatelliteView, setIsSatelliteView] = useState(false)

    // Map style URLs
    const SATELLITE_STYLE = 'mapbox://styles/mapbox/satellite-streets-v12'
    const MONOCHROME_STYLE = 'mapbox://styles/mapbox/light-v11'

    // Compute visited countries based on filters
    const visitedCountries = useMemo(() => {
        // Collect countries up to the selected year
        const countries = new Set<string>()
        USER_TRIPS.forEach(trip => {
            if (trip.year <= selectedYear) {
                trip.countries.forEach(c => countries.add(c))
            }
        })
        return Array.from(countries)
    }, [selectedYear])

    // Compute friends visited countries
    const friendCountries = useMemo(() => {
        if (!showFriends) return []
        const countries = new Set<string>()

        FRIENDS_DATA.forEach(friend => {
            friend.trips.forEach(trip => {
                // Friends data also respects the time filter for consistency
                if (trip.year <= selectedYear) {
                    trip.countries.forEach(c => countries.add(c))
                }
            })
        })

        // Remove countries already visited by user to avoid clash (or keep for overlap logic)
        // For now, we'll just show them. Overlap handling is done via layer ordering.
        return Array.from(countries)
    }, [showFriends, selectedYear])

    // Fly to home position
    const flyToHome = useCallback(() => {
        if (!mapRef.current) return

        mapRef.current.flyTo({
            center: HOME_CENTER,
            zoom: HOME_ZOOM,
            pitch: 0,
            bearing: 0,
            speed: 0.8,
            curve: 1.5,
            essential: true,
        })
    }, [])

    // Start auto-rotation
    const startSpin = useCallback(() => {
        if (spinIntervalRef.current) return

        isSpinningRef.current = true
        spinIntervalRef.current = setInterval(() => {
            if (!mapRef.current || !isSpinningRef.current) return

            const zoom = mapRef.current.getZoom()
            // Only spin at low zoom levels (planetary view)
            if (zoom < 4) {
                const center = mapRef.current.getCenter()
                center.lng -= 0.15
                mapRef.current.easeTo({
                    center,
                    duration: 1000,
                    easing: (n) => n,
                })
            }
        }, 1000)
    }, [])

    // Stop auto-rotation
    const stopSpin = useCallback(() => {
        isSpinningRef.current = false
        if (spinIntervalRef.current) {
            clearInterval(spinIntervalRef.current)
            spinIntervalRef.current = null
        }
    }, [])

    // Handle expand/collapse
    const toggleFullscreen = () => {
        const nextState = !isExpanded
        setIsExpanded(nextState)

        // Notify parent of fullscreen state change
        if (onFullscreenChange) {
            onFullscreenChange(nextState)
        }

        // Resize map after transition
        setTimeout(() => {
            if (mapRef.current) {
                mapRef.current.resize()
                // Recenter if needed
                if (!nextState) flyToHome()
            }
        }, 300)
    }

    // Update map filters when state changes
    useEffect(() => {
        if (!mapRef.current || !isLoaded) return

        const map = mapRef.current

        // Update User Layer
        if (map.getLayer('visited-countries-fill')) {
            map.setFilter('visited-countries-fill', ['in', 'iso_3166_1_alpha_3', ...visitedCountries])
        }
        if (map.getLayer('visited-countries-outline')) {
            map.setFilter('visited-countries-outline', ['in', 'iso_3166_1_alpha_3', ...visitedCountries])
        }

        // Update Friend Layer
        if (map.getLayer('friends-countries-fill')) {
            map.setFilter('friends-countries-fill', ['in', 'iso_3166_1_alpha_3', ...friendCountries])
            map.setLayoutProperty('friends-countries-fill', 'visibility', showFriends ? 'visible' : 'none')
        }

    }, [visitedCountries, friendCountries, showFriends, isLoaded])

    useEffect(() => {
        if (mapRef.current || !mapContainerRef.current) return

        mapboxgl.accessToken = MAPBOX_TOKEN

        // Create the map with globe projection
        const map = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: 'mapbox://styles/mapbox/light-v11',
            projection: 'globe' as unknown as mapboxgl.Projection,
            center: HOME_CENTER,
            zoom: HOME_ZOOM,
            pitch: 0,
            bearing: 0,
            antialias: true,
            attributionControl: false,
        })

        mapRef.current = map

        // Configure atmosphere when style loads
        map.on('style.load', () => {
            // Remove fog/atmosphere for clean floating globe effect
            map.setFog(null)

            // Add terrain for 3D relief
            map.addSource('mapbox-dem', {
                type: 'raster-dem',
                url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
                tileSize: 512,
                maxzoom: 14,
            })
            map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 })

            // Add country boundaries source
            map.addSource('country-boundaries', {
                type: 'vector',
                url: 'mapbox://mapbox.country-boundaries-v1',
            })

            // --- FRIENDS LAYER (Below User Layer) ---
            map.addLayer({
                id: 'friends-countries-fill',
                type: 'fill',
                source: 'country-boundaries',
                'source-layer': 'country_boundaries',
                paint: {
                    'fill-color': THEME_COLORS.friend,
                    'fill-opacity': 0.4,
                },
                layout: {
                    visibility: 'none'
                },
                filter: ['in', 'iso_3166_1_alpha_3', ...friendCountries],
            })

            // --- USER LAYER ---
            // Add highlight layer for visited countries
            map.addLayer({
                id: 'visited-countries-fill',
                type: 'fill',
                source: 'country-boundaries',
                'source-layer': 'country_boundaries',
                paint: {
                    'fill-color': THEME_COLORS.gold,
                    'fill-opacity': 0.5,
                },
                filter: ['in', 'iso_3166_1_alpha_3', ...visitedCountries],
            })

            // Add outline for visited countries
            map.addLayer({
                id: 'visited-countries-outline',
                type: 'line',
                source: 'country-boundaries',
                'source-layer': 'country_boundaries',
                paint: {
                    'line-color': THEME_COLORS.gold,
                    'line-width': 1.5,
                    'line-opacity': 0.8,
                },
                filter: ['in', 'iso_3166_1_alpha_3', ...visitedCountries],
            })

            // Add click handler for countries (after layers are created)
            map.on('click', (e) => {
                const features = map.queryRenderedFeatures(e.point, {
                    layers: ['visited-countries-fill', 'friends-countries-fill']
                })

                if (features.length > 0) {
                    const countryCode = features[0].properties?.iso_3166_1_alpha_3
                    const countryName = Object.keys(COUNTRY_CODES).find(key => COUNTRY_CODES[key] === countryCode) || countryCode

                    // Find who visited this country
                    const visitors: { name: string, years: number[] }[] = []

                    // Check user
                    const userYears: number[] = []
                    USER_TRIPS.forEach(trip => {
                        if (trip.countries.includes(countryCode)) {
                            userYears.push(trip.year)
                        }
                    })
                    if (userYears.length > 0) {
                        visitors.push({ name: 'You', years: userYears.sort((a, b) => b - a) })
                    }

                    // Check friends
                    FRIENDS_DATA.forEach(friend => {
                        const friendYears: number[] = []
                        friend.trips.forEach(trip => {
                            if (trip.countries.includes(countryCode)) {
                                friendYears.push(trip.year)
                            }
                        })
                        if (friendYears.length > 0) {
                            visitors.push({ name: friend.name, years: friendYears.sort((a, b) => b - a) })
                        }
                    })

                    if (visitors.length > 0) {
                        setSelectedCountry({ code: countryCode, name: countryName, visitors })
                    }
                }
            })

            setIsLoaded(true)
            if (onReady) onReady()

            // Start spinning after a short delay
            setTimeout(() => startSpin(), 500)
        })

        // Pause spin on user interaction
        const pauseSpin = () => stopSpin()
        const resumeSpin = () => {
            // Resume spin after user stops interacting
            setTimeout(() => {
                if (!mapRef.current) return
                const zoom = mapRef.current.getZoom()
                if (zoom < 4) startSpin()
            }, 3000)
        }

        map.on('mousedown', pauseSpin)
        map.on('touchstart', pauseSpin)
        map.on('dragstart', pauseSpin)
        map.on('zoomstart', pauseSpin)
        map.on('moveend', resumeSpin)

        // Cleanup on unmount
        return () => {
            stopSpin()
            map.remove()
            mapRef.current = null
        }
    }, [onReady, startSpin, stopSpin]) // Removed dynamic deps from this effect to prevent map reload

    // Toggle fog based on fullscreen state
    useEffect(() => {
        if (!mapRef.current || !isLoaded) return
        const map = mapRef.current

        if (isExpanded) {
            // Restore space atmosphere in fullscreen
            map.setFog({
                color: 'rgb(5, 5, 20)',
                'high-color': 'rgb(20, 20, 60)',
                'horizon-blend': 0.05,
                'space-color': 'rgb(5, 5, 15)',
                'star-intensity': 0.6
            })
        } else {
            // Remove fog for transparent background in card view
            map.setFog(null)
        }
    }, [isExpanded, isLoaded])

    // Function to switch map style
    const switchMapStyle = useCallback((toSatellite: boolean) => {
        if (!mapRef.current) return
        const map = mapRef.current
        const newStyle = toSatellite ? SATELLITE_STYLE : MONOCHROME_STYLE

        setIsSatelliteView(toSatellite)
        map.setStyle(newStyle)

        // Re-add layers after style loads
        map.once('style.load', () => {
            // Re-add terrain
            if (!map.getSource('mapbox-dem')) {
                map.addSource('mapbox-dem', {
                    type: 'raster-dem',
                    url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
                    tileSize: 512,
                    maxzoom: 14,
                })
                map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 })
            }

            // Re-add country boundaries
            if (!map.getSource('country-boundaries')) {
                map.addSource('country-boundaries', {
                    type: 'vector',
                    url: 'mapbox://mapbox.country-boundaries-v1',
                })
            }

            // Re-add friend layer
            if (!map.getLayer('friends-countries-fill')) {
                map.addLayer({
                    id: 'friends-countries-fill',
                    type: 'fill',
                    source: 'country-boundaries',
                    'source-layer': 'country_boundaries',
                    paint: {
                        'fill-color': THEME_COLORS.friend,
                        'fill-opacity': 0.5,
                    },
                    layout: { visibility: showFriends ? 'visible' : 'none' },
                    filter: ['in', 'iso_3166_1_alpha_3', ...friendCountries],
                })
            }

            // Re-add user layers
            if (!map.getLayer('visited-countries-fill')) {
                map.addLayer({
                    id: 'visited-countries-fill',
                    type: 'fill',
                    source: 'country-boundaries',
                    'source-layer': 'country_boundaries',
                    paint: {
                        'fill-color': THEME_COLORS.gold,
                        'fill-opacity': 0.6,
                    },
                    filter: ['in', 'iso_3166_1_alpha_3', ...visitedCountries],
                })
            }

            if (!map.getLayer('visited-countries-outline')) {
                map.addLayer({
                    id: 'visited-countries-outline',
                    type: 'line',
                    source: 'country-boundaries',
                    'source-layer': 'country_boundaries',
                    paint: {
                        'line-color': THEME_COLORS.gold,
                        'line-width': 1.5,
                        'line-opacity': 0.8,
                    },
                    filter: ['in', 'iso_3166_1_alpha_3', ...visitedCountries],
                })
            }

            // Re-apply fog based on current state
            if (isExpanded) {
                map.setFog({
                    color: 'rgb(5, 5, 20)',
                    'high-color': 'rgb(20, 20, 60)',
                    'horizon-blend': 0.05,
                    'space-color': 'rgb(5, 5, 15)',
                    'star-intensity': 0.6
                })
            } else {
                map.setFog(null)
            }
        })
    }, [SATELLITE_STYLE, MONOCHROME_STYLE, friendCountries, visitedCountries, showFriends, isExpanded])

    return (
        <div
            className={`mapbox-globe-container transition-all duration-500 ease-in-out ${isExpanded ? 'fullscreen' : ''}`}
            style={{
                position: isExpanded ? 'fixed' : 'relative',
                top: isExpanded ? 0 : 'auto',
                left: isExpanded ? 0 : 'auto',
                width: isExpanded ? '100%' : '100%',
                height: isExpanded ? '100%' : height,
                zIndex: isExpanded ? 50 : 1,
                background: 'transparent'
            }}
        >
            {/* Map container */}
            <div
                ref={mapContainerRef}
                style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: isExpanded ? '0' : '24px',
                    overflow: 'hidden',
                }}
            />

            {/* Loading overlay */}
            {!isLoaded && (
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(26, 26, 26, 0.9)',
                        borderRadius: '24px',
                    }}
                >
                    <div
                        style={{
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            border: '2px solid rgba(255,255,255,0.1)',
                            borderTopColor: THEME_COLORS.gold,
                            animation: 'spin 1s linear infinite',
                        }}
                    />
                </div>
            )}

            {/* CONTROLS OVERLAY - Only visible when loaded */}
            {isLoaded && (
                <>
                    {/* Expand/Collapse Button - Bottom-right above Home button when collapsed, Top-left when expanded */}
                    <button
                        onClick={toggleFullscreen}
                        className={`absolute ${isExpanded ? 'top-4 left-4' : 'bottom-20 right-4'} w-10 h-10 rounded-full flex items-center justify-center bg-white/95 backdrop-blur-md border border-black/5 hover:bg-white transition-all z-10 shadow-lg`}
                        style={{ color: THEME_COLORS.gold }}
                    >
                        {isExpanded ? (
                            <i className="fa-solid fa-compress text-sm" />
                        ) : (
                            <i className="fa-solid fa-expand text-sm" />
                        )}
                    </button>

                    {/* Fullscreen Controls Panel - Top Right */}
                    {isExpanded && (
                        <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-3 shadow-lg animate-in fade-in slide-in-from-right-4 z-10" style={{ width: '180px' }}>
                            {/* Year Slider */}
                            <div className="mb-3">
                                <div className="flex justify-between text-[10px] text-white/80 mb-1.5">
                                    <span>Year</span>
                                    <span className="font-bold" style={{ color: THEME_COLORS.gold }}>{selectedYear}</span>
                                </div>
                                <input
                                    type="range"
                                    min="2022"
                                    max="2026"
                                    step="1"
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                    className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
                                    style={{ accentColor: THEME_COLORS.gold }}
                                />
                            </div>

                            {/* Friends Toggle */}
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs text-white/90">Friends</span>
                                <button
                                    onClick={() => setShowFriends(!showFriends)}
                                    className={`w-9 h-5 rounded-full transition-colors relative ${showFriends ? 'bg-indigo-400/80' : 'bg-white/20'}`}
                                >
                                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${showFriends ? 'translate-x-4' : 'translate-x-0'}`} />
                                </button>
                            </div>

                            {/* Map Style Toggle (Satellite / Monochrome) */}
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-white/90">Satellite</span>
                                <button
                                    onClick={() => switchMapStyle(!isSatelliteView)}
                                    className={`w-9 h-5 rounded-full transition-colors relative ${isSatelliteView ? 'bg-emerald-400/80' : 'bg-white/20'}`}
                                >
                                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${isSatelliteView ? 'translate-x-4' : 'translate-x-0'}`} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Home button */}
                    <button
                        onClick={flyToHome}
                        aria-label="Retour à la position d'origine"
                        style={{
                            position: 'absolute',
                            bottom: isExpanded ? 80 : 16,
                            right: 16,
                            width: 44,
                            height: 44,
                            borderRadius: '50%',
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(10px)',
                            border: 'none',
                            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.05)'
                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.2)'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)'
                            e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.15)'
                        }}
                    >
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke={THEME_COLORS.gold}
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                    </button>
                </>
            )}

            {/* Country Details Bottom Sheet */}
            {selectedCountry && (
                <div
                    className="fixed inset-0 z-[99999] flex flex-col justify-end"
                    onClick={() => setSelectedCountry(null)}
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-md" />

                    {/* Bottom Sheet Content */}
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="relative w-full bg-[var(--bg-elevated)] rounded-t-[32px] pb-safe pt-6 px-5 shadow-[0_-8px_40px_rgba(0,0,0,0.15)] max-h-[70vh] overflow-y-auto animate-slide-up"
                    >
                        {/* Handle bar */}
                        <div className="w-10 h-1 rounded-full bg-black/10 mx-auto mb-6" />

                        {/* Country Header */}
                        <div className="flex items-center gap-4 mb-6">
                            <div className="text-6xl">{getCountryFlag(selectedCountry.code)}</div>
                            <div>
                                <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{selectedCountry.name}</h2>
                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{selectedCountry.visitors.length} visitor{selectedCountry.visitors.length > 1 ? 's' : ''}</p>
                            </div>
                        </div>

                        {/* Visitors List */}
                        <div className="space-y-4 mb-6">
                            {selectedCountry.visitors.map((visitor, idx) => (
                                <div key={idx} className="p-4 rounded-2xl" style={{ background: 'var(--bg-secondary)' }}>
                                    <div className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{visitor.name}</div>
                                    <div className="flex flex-wrap gap-2">
                                        {visitor.years.map((year, yearIdx) => (
                                            <span
                                                key={yearIdx}
                                                className="px-3 py-1 rounded-full text-xs font-medium"
                                                style={{
                                                    background: visitor.name === 'You' ? THEME_COLORS.gold : THEME_COLORS.friend,
                                                    color: '#fff'
                                                }}
                                            >
                                                {year}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Navigation Button */}
                        <button
                            onClick={() => {
                                const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
                                const url = isIOS
                                    ? `maps://maps.apple.com/?q=${encodeURIComponent(selectedCountry.name)}`
                                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedCountry.name)}`
                                window.open(url, '_blank')
                            }}
                            className="w-full py-4 rounded-2xl font-semibold text-white flex items-center justify-center gap-2 transition-transform active:scale-95"
                            style={{ background: THEME_COLORS.gold }}
                        >
                            <i className="fa-solid fa-location-dot" />
                            Go to {selectedCountry.name}
                        </button>
                    </div>
                </div>
            )}


            <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .mapbox-globe-container.fullscreen {
            border-radius: 0;
        }
        /* Minimize Mapbox watermark while keeping ToS compliance */
        .mapbox-globe-container :global(.mapboxgl-ctrl-bottom-left),
        .mapbox-globe-container :global(.mapboxgl-ctrl-bottom-right) {
            opacity: 0.3;
            font-size: 9px;
        }
        .mapbox-globe-container :global(.mapboxgl-ctrl-bottom-left):hover,
        .mapbox-globe-container :global(.mapboxgl-ctrl-bottom-right):hover {
            opacity: 1;
        }
        .mapbox-globe-container :global(.mapboxgl-ctrl-logo) {
            opacity: 0.2 !important;
            width: 50px !important;
        }
      `}</style>
        </div>
    )
}
