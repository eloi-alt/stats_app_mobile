'use client'

import { useEffect, useRef, useState } from 'react'
import GlassCard from '../Cards/GlassCard'

interface MapViewProps {
  mapContainerId: string
}

export default function MapView({ mapContainerId }: MapViewProps) {
  const [activeLayer, setActiveLayer] = useState<'mine' | 'friends' | 'all'>('mine')
  const mapRef = useRef<any>(null)
  const layersRef = useRef<any>({})

  useEffect(() => {
    if (typeof window === 'undefined') return
    
    // Dynamically import Leaflet
    import('leaflet').then((L) => {
      if (!mapRef.current) {
        const map = L.default.map(mapContainerId, {
          zoomControl: false,
          attributionControl: false,
        }).setView([20, 0], 2)

        L.default.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map)

        mapRef.current = map

        // Fake rich data
        const me2025 = [
          [48.85, 2.35],
          [40.71, -74],
          [34.05, -118],
          [25.76, -80],
          [19.43, -99],
        ] // Paris->NY->LA->Miami->Mexico
        const meAll = [
          [48.85, 2.35],
          [35.68, 139],
          [-33.86, 151],
          [-8.7, 115],
          [55.75, 37],
          [25.2, 55],
        ] // + Tokyo, Sydney, Bali, Moscow, Dubai

        const friends = [
          [[51.5, -0.09], [40.41, -3.7], [38.72, -9.13]], // London->Madrid->Lisbon
          [[52.52, 13.4], [41.9, 12.49], [37.98, 23.72]], // Berlin->Rome->Athens
          [[35.68, 139], [37.56, 126.9], [1.35, 103.8]], // Tokyo->Seoul->Singapore
          [[-22.9, -43.1], [-34.6, -58.3], [-33.4, -70.6]], // Rio->BA->Santiago
        ]

        layersRef.current.mine2025 = L.default.layerGroup([
          L.default.polyline(me2025, { color: '#FF9F0A', weight: 2.5 }),
          ...me2025.map((p: any) => L.default.circleMarker(p, { radius: 4, color: '#FF9F0A', fillOpacity: 1 })),
        ])

        layersRef.current.mineAll = L.default.layerGroup([
          L.default.polyline(meAll, { color: '#FF9F0A', weight: 1, opacity: 0.4, dashArray: '4,4' }),
          ...meAll.map((p: any) => L.default.circleMarker(p, { radius: 3, color: '#FF9F0A', fillOpacity: 0.4 })),
        ])

        layersRef.current.friends = L.default.layerGroup(
          friends.map((path: any) => L.default.polyline(path, { color: '#0A84FF', weight: 1.5, opacity: 0.7 }))
        )
        friends.flat().forEach((p: any) => {
          layersRef.current.friends.addLayer(
            L.default.circleMarker(p, { radius: 2, color: '#0A84FF', fillOpacity: 0.7 })
          )
        })

        layersRef.current.mine2025.addTo(map)
      }
    })

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [mapContainerId])

  const toggleLayer = (mode: 'mine' | 'friends' | 'all') => {
    const map = mapRef.current
    const layers = layersRef.current

    if (!map) return

    Object.values(layers).forEach((layer: any) => {
      if (layer && map.hasLayer(layer)) {
        map.removeLayer(layer)
      }
    })

    if (mode === 'mine' && layers.mine2025) {
      layers.mine2025.addTo(map)
    } else if (mode === 'all') {
      if (layers.mine2025) layers.mine2025.addTo(map)
      if (layers.mineAll) layers.mineAll.addTo(map)
    } else if (mode === 'friends') {
      if (layers.friends) layers.friends.addTo(map)
      if (layers.mine2025) layers.mine2025.addTo(map)
    }

    setActiveLayer(mode)
  }

  return (
    <>
      <div
        id={mapContainerId}
        className="w-full h-full absolute top-0 left-0 z-0"
        style={{ filter: 'saturate(1.1) contrast(1.1)' }}
      />

      <div className="absolute top-[70px] left-5 right-5 z-[50]">
        <GlassCard className="p-4 flex justify-between items-center backdrop-blur-[20px]">
          <div>
            <div className="text-[11px] uppercase tracking-widest text-gray-400 mb-0 font-bold m-0">
              Statut
            </div>
            <div className="font-extrabold text-sm text-white">NOMADE DIGITAL</div>
          </div>
          <div className="text-right">
            <div className="text-[11px] uppercase tracking-widest text-gray-400 mb-0 font-bold m-0">
              Distance 2025
            </div>
            <div className="font-extrabold text-sm text-accent-orange">42 100 KM</div>
          </div>
        </GlassCard>
      </div>

      <div className="absolute top-[120px] right-5 z-[500] flex flex-col gap-2.5">
        <button
          className={`w-11 h-11 rounded-full flex items-center justify-center text-lg cursor-pointer transition-all duration-300 ${
            activeLayer === 'mine'
              ? 'bg-accent-blue text-white border-accent-blue'
              : 'bg-black/60 text-white border-white/10'
          }`}
          style={{
            background: activeLayer === 'mine' ? '#0A84FF' : 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${activeLayer === 'mine' ? '#0A84FF' : 'rgba(255,255,255,0.1)'}`,
          }}
          onClick={() => toggleLayer('mine')}
        >
          <i className="fa-solid fa-user" />
        </button>
        <button
          className={`w-11 h-11 rounded-full flex items-center justify-center text-lg cursor-pointer transition-all duration-300 ${
            activeLayer === 'friends'
              ? 'bg-accent-blue text-white border-accent-blue'
              : 'bg-black/60 text-white border-white/10'
          }`}
          style={{
            background: activeLayer === 'friends' ? '#0A84FF' : 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${activeLayer === 'friends' ? '#0A84FF' : 'rgba(255,255,255,0.1)'}`,
          }}
          onClick={() => toggleLayer('friends')}
        >
          <i className="fa-solid fa-users" />
        </button>
        <button
          className={`w-11 h-11 rounded-full flex items-center justify-center text-[10px] font-extrabold tracking-tight cursor-pointer transition-all duration-300 ${
            activeLayer === 'all'
              ? 'bg-accent-blue text-white border-accent-blue'
              : 'bg-black/60 text-white border-white/10'
          }`}
          style={{
            background: activeLayer === 'all' ? '#0A84FF' : 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${activeLayer === 'all' ? '#0A84FF' : 'rgba(255,255,255,0.1)'}`,
          }}
          onClick={() => toggleLayer('all')}
        >
          ALL
        </button>
      </div>
    </>
  )
}

