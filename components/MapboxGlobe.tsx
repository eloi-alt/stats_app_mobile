'use client'

import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { COUNTRY_NAMES, FriendCountryVisit } from '@/hooks/useTravelData'

// --- Configuration ---
const MAPBOX_TOKEN = 'pk.eyJ1IjoiZWxvaWNhcnJlbGV0IiwiYSI6ImNtanUzY3EyZTJja2UzY3NkZTdtMzBkbHQifQ.o6Xn-vIpPhSr6yloB9AIzw'

// Map ISO 2-letter to ISO 3-letter codes for Mapbox
const ISO2_TO_ISO3: Record<string, string> = {
    'FR': 'FRA', 'ES': 'ESP', 'IT': 'ITA', 'GB': 'GBR', 'DE': 'DEU',
    'US': 'USA', 'CA': 'CAN', 'MX': 'MEX', 'BR': 'BRA', 'AR': 'ARG',
    'JP': 'JPN', 'CN': 'CHN', 'KR': 'KOR', 'IN': 'IND', 'TH': 'THA',
    'VN': 'VNM', 'ID': 'IDN', 'MY': 'MYS', 'SG': 'SGP', 'PH': 'PHL',
    'AU': 'AUS', 'NZ': 'NZL', 'ZA': 'ZAF', 'EG': 'EGY', 'MA': 'MAR',
    'TN': 'TUN', 'KE': 'KEN', 'TZ': 'TZA', 'GH': 'GHA', 'NG': 'NGA',
    'RU': 'RUS', 'UA': 'UKR', 'PL': 'POL', 'CZ': 'CZE', 'AT': 'AUT',
    'CH': 'CHE', 'NL': 'NLD', 'BE': 'BEL', 'DK': 'DNK', 'SE': 'SWE',
    'NO': 'NOR', 'FI': 'FIN', 'IS': 'ISL', 'IE': 'IRL', 'PT': 'PRT',
    'GR': 'GRC', 'TR': 'TUR', 'IL': 'ISR', 'AE': 'ARE', 'SA': 'SAU',
    'QA': 'QAT', 'OM': 'OMN', 'KW': 'KWT', 'JO': 'JOR', 'LB': 'LBN',
    'CL': 'CHL', 'PE': 'PER', 'CO': 'COL', 'VE': 'VEN', 'EC': 'ECU',
    'UY': 'URY', 'PY': 'PRY', 'BO': 'BOL', 'CR': 'CRI', 'PA': 'PAN',
    'CU': 'CUB', 'DO': 'DOM', 'JM': 'JAM', 'TT': 'TTO', 'BS': 'BHS',
    'HU': 'HUN', 'RO': 'ROU', 'BG': 'BGR', 'HR': 'HRV', 'RS': 'SRB',
    'SI': 'SVN', 'SK': 'SVK', 'EE': 'EST', 'LV': 'LVA', 'LT': 'LTU',
    'GE': 'GEO', 'AM': 'ARM', 'AZ': 'AZE', 'KZ': 'KAZ', 'UZ': 'UZB',
    'PK': 'PAK', 'BD': 'BGD', 'LK': 'LKA', 'NP': 'NPL', 'BT': 'BTN',
    'MM': 'MMR', 'KH': 'KHM', 'LA': 'LAO', 'MN': 'MNG', 'TW': 'TWN',
    'HK': 'HKG', 'MO': 'MAC', 'BN': 'BRN', 'MV': 'MDV', 'FJ': 'FJI',
    'AF': 'AFG', 'AL': 'ALB', 'DZ': 'DZA', 'AD': 'AND', 'AO': 'AGO',
    'AG': 'ATG', 'BA': 'BIH', 'BW': 'BWA', 'BJ': 'BEN', 'BB': 'BRB',
    'BY': 'BLR', 'BZ': 'BLZ', 'BF': 'BFA', 'BI': 'BDI', 'CM': 'CMR',
    'CV': 'CPV', 'CF': 'CAF', 'TD': 'TCD', 'KM': 'COM', 'CG': 'COG',
    'CD': 'COD', 'CY': 'CYP', 'DJ': 'DJI', 'DM': 'DMA', 'SV': 'SLV',
    'GQ': 'GNQ', 'ER': 'ERI', 'SZ': 'SWZ', 'ET': 'ETH', 'GA': 'GAB',
    'GM': 'GMB', 'GD': 'GRD', 'GT': 'GTM', 'GN': 'GIN', 'GW': 'GNB',
    'GY': 'GUY', 'HT': 'HTI', 'HN': 'HND', 'IQ': 'IRQ', 'IR': 'IRN',
    'KI': 'KIR', 'KP': 'PRK', 'XK': 'XKX', 'KG': 'KGZ', 'LR': 'LBR',
    'LY': 'LBY', 'LI': 'LIE', 'LU': 'LUX', 'MG': 'MDG', 'MW': 'MWI',
    'ML': 'MLI', 'MT': 'MLT', 'MH': 'MHL', 'MR': 'MRT', 'MU': 'MUS',
    'FM': 'FSM', 'MD': 'MDA', 'MC': 'MCO', 'ME': 'MNE', 'MZ': 'MOZ',
    'NA': 'NAM', 'NR': 'NRU', 'NI': 'NIC', 'NE': 'NER', 'MK': 'MKD',
    'PW': 'PLW', 'PS': 'PSE', 'PG': 'PNG', 'RW': 'RWA', 'KN': 'KNA',
    'LC': 'LCA', 'VC': 'VCT', 'WS': 'WSM', 'SM': 'SMR', 'ST': 'STP',
    'SN': 'SEN', 'SC': 'SYC', 'SL': 'SLE', 'SB': 'SLB', 'SO': 'SOM',
    'SS': 'SSD', 'SD': 'SDN', 'SR': 'SUR', 'SY': 'SYR', 'TJ': 'TJK',
    'TL': 'TLS', 'TG': 'TGO', 'TO': 'TON', 'TM': 'TKM', 'TV': 'TUV',
    'UG': 'UGA', 'VA': 'VAT', 'VU': 'VUT', 'YE': 'YEM', 'ZM': 'ZMB',
    'ZW': 'ZWE',
}

// Convert ISO 2 code to ISO 3 for Mapbox layer filtering
const toIso3 = (iso2: string): string => ISO2_TO_ISO3[iso2.toUpperCase()] || iso2

const getCountryFlag = (isoCode: string): string => {
    // Use 2-letter code for flag emoji
    const iso2Code = isoCode.length === 3
        ? (Object.entries(ISO2_TO_ISO3).find(([, v]) => v === isoCode)?.[0] || isoCode.slice(0, 2))
        : isoCode
    const codePoints = iso2Code
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0))
    return String.fromCodePoint(...codePoints)
}

// Home position (Paris/Europe)
const HOME_CENTER: [number, number] = [2.35, 48.85]
const HOME_ZOOM = 1.0

// Theme colors
const THEME_COLORS = {
    gold: '#C9A962',
    sage: '#8BA888',
    sky: '#A5C4D4',
    friend: '#A78BFA',
}

interface VisitedCountryData {
    code: string
    name: string
    visitYears?: number[]
}

interface MapboxGlobeProps {
    height?: string
    onReady?: () => void
    onFullscreenChange?: (isFullscreen: boolean) => void
    // Supabase data props
    userCountries?: VisitedCountryData[]
    friendsCountries?: FriendCountryVisit[]
    showFriendsMode?: boolean
    onToggleFriendsMode?: () => void
    isDemo?: boolean
    onCountryClick?: (countryCode: string, countryName: string) => void
}

export default function MapboxGlobe({
    height = '342px',
    onReady,
    onFullscreenChange,
    userCountries = [],
    friendsCountries = [],
    showFriendsMode = false,
    onToggleFriendsMode,
    isDemo = false,
    onCountryClick
}: MapboxGlobeProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null)
    const mapRef = useRef<mapboxgl.Map | null>(null)
    const spinIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const isSpinningRef = useRef(true)

    const [mapInstance, setMapInstance] = useState<mapboxgl.Map | null>(null)
    const [isLoaded, setIsLoaded] = useState(false)
    const [isExpanded, setIsExpanded] = useState(false)
    const [selectedCountry, setSelectedCountry] = useState<{ code: string, name: string, visitors: { name: string, years: number[] }[] } | null>(null)
    const [isSatelliteView, setIsSatelliteView] = useState(false)

    const SATELLITE_STYLE = 'mapbox://styles/mapbox/satellite-streets-v12'
    const MONOCHROME_STYLE = 'mapbox://styles/mapbox/light-v11'

    // Convert userCountries to ISO3 codes for Mapbox
    const visitedCountriesIso3 = useMemo(() => {
        const iso3Codes = userCountries.map(c => toIso3(c.code))
        console.log('[MapboxGlobe] userCountries received:', userCountries.length, userCountries.map(c => c.code))
        console.log('[MapboxGlobe] ISO3 codes:', iso3Codes)
        return iso3Codes
    }, [userCountries])

    // Convert friendsCountries to ISO3 codes
    const friendCountriesIso3 = useMemo(() => {
        if (!showFriendsMode) return []
        const uniqueCodes = new Set(friendsCountries.map(fc => toIso3(fc.country_code)))
        return Array.from(uniqueCodes)
    }, [friendsCountries, showFriendsMode])

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

    const startSpin = useCallback(() => {
        if (spinIntervalRef.current) return
        isSpinningRef.current = true
        spinIntervalRef.current = setInterval(() => {
            if (!mapRef.current || !isSpinningRef.current) return
            const zoom = mapRef.current.getZoom()
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

    const stopSpin = useCallback(() => {
        isSpinningRef.current = false
        if (spinIntervalRef.current) {
            clearInterval(spinIntervalRef.current)
            spinIntervalRef.current = null
        }
    }, [])

    const toggleFullscreen = () => {
        const nextState = !isExpanded
        setIsExpanded(nextState)
        if (onFullscreenChange) {
            onFullscreenChange(nextState)
        }
        setTimeout(() => {
            if (mapRef.current) {
                mapRef.current.resize()
                if (!nextState) flyToHome()
            }
        }, 300)
    }

    // Update map filters when countries change
    useEffect(() => {
        console.log('[MapboxGlobe] Layer update effect triggered', {
            isLoaded,
            visitedCountriesIso3,
            mapExists: !!mapRef.current
        })

        if (!mapRef.current || !isLoaded) return
        const map = mapRef.current

        console.log('[MapboxGlobe] Updating layers with', visitedCountriesIso3.length, 'countries')

        // Update User Layer
        if (map.getLayer('visited-countries-fill')) {
            if (visitedCountriesIso3.length > 0) {
                map.setFilter('visited-countries-fill', ['in', 'iso_3166_1_alpha_3', ...visitedCountriesIso3])
                map.setLayoutProperty('visited-countries-fill', 'visibility', 'visible')
                console.log('[MapboxGlobe] Set filter for visited-countries-fill:', visitedCountriesIso3)
            } else {
                map.setLayoutProperty('visited-countries-fill', 'visibility', 'none')
            }
        }
        if (map.getLayer('visited-countries-outline')) {
            if (visitedCountriesIso3.length > 0) {
                map.setFilter('visited-countries-outline', ['in', 'iso_3166_1_alpha_3', ...visitedCountriesIso3])
                map.setLayoutProperty('visited-countries-outline', 'visibility', 'visible')
            } else {
                map.setLayoutProperty('visited-countries-outline', 'visibility', 'none')
            }
        }

        // Update Friend Layer
        if (map.getLayer('friends-countries-fill')) {
            if (friendCountriesIso3.length > 0 && showFriendsMode) {
                map.setFilter('friends-countries-fill', ['in', 'iso_3166_1_alpha_3', ...friendCountriesIso3])
                map.setLayoutProperty('friends-countries-fill', 'visibility', 'visible')
            } else {
                map.setLayoutProperty('friends-countries-fill', 'visibility', 'none')
            }
        }
    }, [visitedCountriesIso3, friendCountriesIso3, showFriendsMode, isLoaded, mapInstance])

    useEffect(() => {
        if (mapRef.current || !mapContainerRef.current) return

        mapboxgl.accessToken = MAPBOX_TOKEN

        const map = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: 'mapbox://styles/mapbox/light-v11',
            projection: 'globe' as unknown as mapboxgl.Projection,
            center: HOME_CENTER,
            zoom: HOME_ZOOM,
            minZoom: 1,  // Prevent zooming out too far
            maxZoom: 6,  // Limit max zoom for performance (fewer tiles)
            pitch: 0,
            bearing: 0,
            antialias: false,  // Disable for better performance
            attributionControl: false,
            fadeDuration: 0,  // Instant layer transitions
        })

        mapRef.current = map
        setMapInstance(map)  // Trigger re-render for layer updates

        map.on('style.load', () => {
            map.setFog(null)

            // Country boundaries source (lightweight vector tiles)
            map.addSource('country-boundaries', {
                type: 'vector',
                url: 'mapbox://mapbox.country-boundaries-v1',
            })

            // Friends Layer
            map.addLayer({
                id: 'friends-countries-fill',
                type: 'fill',
                source: 'country-boundaries',
                'source-layer': 'country_boundaries',
                paint: {
                    'fill-color': THEME_COLORS.friend,
                    'fill-opacity': 0.4,
                },
                layout: { visibility: 'none' },
                filter: ['in', 'iso_3166_1_alpha_3', ''],
            })

            // User Layer
            map.addLayer({
                id: 'visited-countries-fill',
                type: 'fill',
                source: 'country-boundaries',
                'source-layer': 'country_boundaries',
                paint: {
                    'fill-color': THEME_COLORS.gold,
                    'fill-opacity': 0.5,
                },
                layout: { visibility: 'none' },
                filter: ['in', 'iso_3166_1_alpha_3', ''],
            })

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
                layout: { visibility: 'none' },
                filter: ['in', 'iso_3166_1_alpha_3', ''],
            })

            // Click handler
            map.on('click', (e) => {
                const features = map.queryRenderedFeatures(e.point, {
                    layers: ['visited-countries-fill', 'friends-countries-fill']
                })

                if (features.length > 0) {
                    const countryCodeIso3 = features[0].properties?.iso_3166_1_alpha_3
                    // Convert ISO3 back to ISO2
                    const countryCodeIso2 = Object.entries(ISO2_TO_ISO3).find(([, v]) => v === countryCodeIso3)?.[0] || countryCodeIso3
                    const countryName = COUNTRY_NAMES[countryCodeIso2] || countryCodeIso3

                    if (onCountryClick) {
                        onCountryClick(countryCodeIso2, countryName)
                    } else {
                        // Show internal popup
                        const visitors: { name: string, years: number[] }[] = []

                        // Check user countries
                        const userCountry = userCountries.find(c => c.code === countryCodeIso2)
                        if (userCountry?.visitYears && userCountry.visitYears.length > 0) {
                            visitors.push({ name: 'You', years: userCountry.visitYears })
                        }

                        // Check friends
                        const friendsForCountry = friendsCountries.filter(fc => fc.country_code === countryCodeIso2)
                        friendsForCountry.forEach(fc => {
                            const years = [fc.last_visit_year || fc.first_visit_year].filter(Boolean) as number[]
                            if (years.length > 0) {
                                visitors.push({ name: fc.full_name || fc.username, years })
                            }
                        })

                        if (visitors.length > 0) {
                            setSelectedCountry({ code: countryCodeIso2, name: countryName, visitors })
                        }
                    }
                }
            })

            setIsLoaded(true)
            if (onReady) onReady()
            setTimeout(() => startSpin(), 500)
        })

        const pauseSpin = () => stopSpin()
        const resumeSpin = () => {
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

        return () => {
            stopSpin()
            map.remove()
            mapRef.current = null
        }
    }, [onReady, startSpin, stopSpin, userCountries, friendsCountries, onCountryClick])

    useEffect(() => {
        if (!mapRef.current || !isLoaded) return
        const map = mapRef.current

        // Only set fog if style is fully loaded to avoid error
        if (!map.isStyleLoaded()) return

        // Show space fog in satellite mode (fullscreen or not)
        if (isSatelliteView) {
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
    }, [isExpanded, isLoaded, isSatelliteView])

    const switchMapStyle = useCallback((toSatellite: boolean) => {
        if (!mapRef.current) return
        const map = mapRef.current
        const newStyle = toSatellite ? SATELLITE_STYLE : MONOCHROME_STYLE
        setIsSatelliteView(toSatellite)
        map.setStyle(newStyle)

        map.once('style.load', () => {
            // Only load DEM terrain in satellite mode (for 3D effect)
            if (toSatellite && !map.getSource('mapbox-dem')) {
                map.addSource('mapbox-dem', {
                    type: 'raster-dem',
                    url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
                    tileSize: 512,
                    maxzoom: 10,  // Reduced from 14 for faster loading
                })
                map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.2 })  // Reduced exaggeration
            }

            if (!map.getSource('country-boundaries')) {
                map.addSource('country-boundaries', {
                    type: 'vector',
                    url: 'mapbox://mapbox.country-boundaries-v1',
                })
            }

            if (!map.getLayer('friends-countries-fill')) {
                map.addLayer({
                    id: 'friends-countries-fill',
                    type: 'fill',
                    source: 'country-boundaries',
                    'source-layer': 'country_boundaries',
                    paint: { 'fill-color': THEME_COLORS.friend, 'fill-opacity': 0.5 },
                    layout: { visibility: showFriendsMode ? 'visible' : 'none' },
                    filter: ['in', 'iso_3166_1_alpha_3', ...friendCountriesIso3],
                })
            }

            if (!map.getLayer('visited-countries-fill')) {
                map.addLayer({
                    id: 'visited-countries-fill',
                    type: 'fill',
                    source: 'country-boundaries',
                    'source-layer': 'country_boundaries',
                    paint: { 'fill-color': THEME_COLORS.gold, 'fill-opacity': 0.6 },
                    filter: ['in', 'iso_3166_1_alpha_3', ...visitedCountriesIso3],
                })
            }

            if (!map.getLayer('visited-countries-outline')) {
                map.addLayer({
                    id: 'visited-countries-outline',
                    type: 'line',
                    source: 'country-boundaries',
                    'source-layer': 'country_boundaries',
                    paint: { 'line-color': THEME_COLORS.gold, 'line-width': 1.5, 'line-opacity': 0.8 },
                    filter: ['in', 'iso_3166_1_alpha_3', ...visitedCountriesIso3],
                })
            }

            // Space fog only in satellite mode
            if (toSatellite) {
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
    }, [friendCountriesIso3, visitedCountriesIso3, showFriendsMode, isExpanded])

    return (
        <div
            className={`mapbox-globe-container transition-all duration-500 ease-in-out ${isExpanded ? 'fullscreen' : ''}`}
            style={{
                position: isExpanded ? 'fixed' : 'relative',
                top: isExpanded ? 0 : 'auto',
                left: isExpanded ? 0 : 'auto',
                width: isExpanded ? '100%' : '100%',
                height: isExpanded ? '100%' : height,
                zIndex: isExpanded ? 9999 : 1,
                // Fullscreen background: white for normal mode, dark space for satellite
                background: isExpanded
                    ? (isSatelliteView ? 'rgb(5, 5, 15)' : '#ffffff')
                    : 'transparent'
            }}
        >
            <div
                ref={mapContainerRef}
                style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: isExpanded ? '0' : '24px',
                    overflow: 'hidden',
                }}
            />

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

            {isLoaded && (
                <>
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

                    {/* Control Panel - Shown in both normal and fullscreen */}
                    <div
                        className="absolute top-3 right-3 rounded-2xl p-3 shadow-lg z-10"
                        style={{
                            background: isSatelliteView ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.95)',
                            backdropFilter: 'blur(20px)',
                            border: isSatelliteView ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(0,0,0,0.08)',
                        }}
                    >
                        <div className="flex flex-col gap-3">
                            {/* Satellite Toggle */}
                            <button
                                onClick={() => switchMapStyle(!isSatelliteView)}
                                className="flex items-center justify-between gap-3 w-full"
                            >
                                <span
                                    className="text-xs font-medium flex items-center gap-2"
                                    style={{ color: isSatelliteView ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.7)' }}
                                >
                                    🛰️ Satellite
                                </span>
                                <div
                                    className="w-9 h-5 rounded-full transition-colors relative"
                                    style={{
                                        background: isSatelliteView ? THEME_COLORS.gold : 'rgba(0,0,0,0.2)'
                                    }}
                                >
                                    <div
                                        className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all"
                                        style={{ left: isSatelliteView ? '18px' : '2px' }}
                                    />
                                </div>
                            </button>

                            {/* Friends Toggle - Only show when not in demo mode */}
                            {!isDemo && onToggleFriendsMode && (
                                <>
                                    <div
                                        className="w-full h-px"
                                        style={{ background: isSatelliteView ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)' }}
                                    />
                                    <button
                                        onClick={onToggleFriendsMode}
                                        className="flex items-center justify-between gap-3 w-full"
                                    >
                                        <span
                                            className="text-xs font-medium flex items-center gap-2"
                                            style={{ color: showFriendsMode ? THEME_COLORS.friend : (isSatelliteView ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.7)') }}
                                        >
                                            <i className={`fa-solid ${showFriendsMode ? 'fa-users' : 'fa-user'}`} />
                                            {showFriendsMode ? 'Amis' : 'Moi seul'}
                                        </span>
                                        <div
                                            className="w-9 h-5 rounded-full transition-colors relative"
                                            style={{
                                                background: showFriendsMode ? THEME_COLORS.friend : 'rgba(0,0,0,0.2)'
                                            }}
                                        >
                                            <div
                                                className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all"
                                                style={{ left: showFriendsMode ? '18px' : '2px' }}
                                            />
                                        </div>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

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
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-md" />
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="relative w-full bg-[var(--bg-elevated)] rounded-t-[32px] pb-safe pt-6 px-5 shadow-[0_-8px_40px_rgba(0,0,0,0.15)] max-h-[70vh] overflow-y-auto"
                    >
                        <div className="w-10 h-1 rounded-full bg-black/10 mx-auto mb-6" />
                        <div className="flex items-center gap-4 mb-6">
                            <div className="text-6xl">{getCountryFlag(selectedCountry.code)}</div>
                            <div>
                                <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{selectedCountry.name}</h2>
                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{selectedCountry.visitors.length} visiteur{selectedCountry.visitors.length > 1 ? 's' : ''}</p>
                            </div>
                        </div>
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
                            Voir sur Maps
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
                .mapbox-globe-container :global(.mapboxgl-ctrl-bottom-left),
                .mapbox-globe-container :global(.mapboxgl-ctrl-bottom-right) {
                    opacity: 0.3;
                    font-size: 9px;
                }
                .mapbox-globe-container :global(.mapboxgl-ctrl-logo) {
                    opacity: 0.2 !important;
                    width: 50px !important;
                }
            `}</style>
        </div>
    )
}
