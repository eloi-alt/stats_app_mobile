'use client'

import { useEffect, useRef, useCallback } from 'react'
import createGlobe from 'cobe'

interface Country {
  code: string
  name: string
  lat: number
  lng: number
  visits: number
}

interface Globe3DProps {
  visitedCountries: Country[]
  onCountryClick?: (country: Country) => void
}

// Country coordinates database
const COUNTRY_COORDS: Record<string, { lat: number; lng: number }> = {
  FR: { lat: 46.2276, lng: 2.2137 },
  US: { lat: 37.0902, lng: -95.7129 },
  JP: { lat: 36.2048, lng: 138.2529 },
  AU: { lat: -25.2744, lng: 133.7751 },
  ID: { lat: -0.7893, lng: 113.9213 },
  RU: { lat: 61.524, lng: 105.3188 },
  AE: { lat: 23.4241, lng: 53.8478 },
  MX: { lat: 23.6345, lng: -102.5528 },
  ES: { lat: 40.4637, lng: -3.7492 },
  IT: { lat: 41.8719, lng: 12.5674 },
  TH: { lat: 15.87, lng: 100.9925 },
  PT: { lat: 39.3999, lng: -8.2245 },
  GB: { lat: 55.3781, lng: -3.436 },
  DE: { lat: 51.1657, lng: 10.4515 },
  CN: { lat: 35.8617, lng: 104.1954 },
  BR: { lat: -14.235, lng: -51.9253 },
  IN: { lat: 20.5937, lng: 78.9629 },
  CA: { lat: 56.1304, lng: -106.3468 },
}

// Convert lat/lng to phi/theta for cobe
const locationToAngles = (lat: number, lng: number): { phi: number; theta: number } => {
  return {
    phi: (90 - lat) * (Math.PI / 180),
    theta: (lng + 180) * (Math.PI / 180),
  }
}

// Paris coordinates for snap-back (home position)
const HOME_LOCATION = { lat: 48.8566, lng: 2.3522 } // Paris
const HOME_ANGLES = locationToAngles(HOME_LOCATION.lat, HOME_LOCATION.lng)

// Initial phi showing Europe/France
const INITIAL_PHI = Math.PI * 0.4 // Start position facing Europe
const INITIAL_THETA = 0.25

export default function Globe3D({ visitedCountries }: Globe3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const globeRef = useRef<ReturnType<typeof createGlobe> | null>(null)
  
  // Interaction state refs
  const pointerInteracting = useRef<number | null>(null)
  const pointerInteractionMovement = useRef({ x: 0, y: 0 })
  const phiRef = useRef(INITIAL_PHI)
  const thetaRef = useRef(INITIAL_THETA)
  const velocityRef = useRef({ phi: 0, theta: 0 })
  const lastInteractionTime = useRef(Date.now())
  const isReturningHome = useRef(false)
  
  // Snap-back delay (2 seconds)
  const SNAP_BACK_DELAY = 2000
  const SNAP_BACK_SPEED = 0.03 // Lerp factor
  const FRICTION = 0.95 // Inertia friction
  const SENSITIVITY = 0.004 // Pointer movement sensitivity

  // Convert visited countries to markers format for cobe
  const markers = visitedCountries
    .map(country => {
      const coords = COUNTRY_COORDS[country.code]
      if (!coords) return null
      return {
        location: [coords.lat, coords.lng] as [number, number],
        size: 0.06 + Math.min(country.visits * 0.015, 0.08),
      }
    })
    .filter(Boolean) as { location: [number, number]; size: number }[]

  // Handle pointer down
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerInteracting.current = e.clientX
    pointerInteractionMovement.current = { x: e.clientX, y: e.clientY }
    isReturningHome.current = false
    // Reset velocity on new interaction
    velocityRef.current = { phi: 0, theta: 0 }
    
    if (canvasRef.current) {
      canvasRef.current.style.cursor = 'grabbing'
    }
  }, [])

  // Handle pointer move
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (pointerInteracting.current !== null) {
      const deltaX = e.clientX - pointerInteractionMovement.current.x
      const deltaY = e.clientY - pointerInteractionMovement.current.y
      
      // Update velocities for inertia
      velocityRef.current = {
        phi: deltaX * SENSITIVITY,
        theta: -deltaY * SENSITIVITY * 0.5, // Less sensitive vertically
      }
      
      // Update position
      phiRef.current += velocityRef.current.phi
      thetaRef.current += velocityRef.current.theta
      
      // Clamp theta to prevent flipping
      thetaRef.current = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, thetaRef.current))
      
      pointerInteractionMovement.current = { x: e.clientX, y: e.clientY }
      lastInteractionTime.current = Date.now()
    }
  }, [])

  // Handle pointer up
  const handlePointerUp = useCallback(() => {
    pointerInteracting.current = null
    lastInteractionTime.current = Date.now()
    
    if (canvasRef.current) {
      canvasRef.current.style.cursor = 'grab'
    }
  }, [])

  // Handle pointer leave
  const handlePointerOut = useCallback(() => {
    if (pointerInteracting.current !== null) {
      pointerInteracting.current = null
      lastInteractionTime.current = Date.now()
      
      if (canvasRef.current) {
        canvasRef.current.style.cursor = 'grab'
      }
    }
  }, [])

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const width = Math.min(rect.width * 2, 800) // Cap at 800 for performance

    globeRef.current = createGlobe(canvas, {
      devicePixelRatio: 2,
      width: width,
      height: width,
      phi: phiRef.current,
      theta: thetaRef.current,
      dark: 1,
      diffuse: 1.4,
      mapSamples: 20000,
      mapBrightness: 8,
      baseColor: [0.15, 0.15, 0.15],
      markerColor: [0.79, 0.66, 0.38], // Gold #C9A962
      glowColor: [0.18, 0.18, 0.18],
      markers: markers,
      scale: 1.05,
      onRender: (state) => {
        const now = Date.now()
        const timeSinceInteraction = now - lastInteractionTime.current
        
        // If not currently dragging
        if (pointerInteracting.current === null) {
          // Apply inertia (momentum after release)
          if (Math.abs(velocityRef.current.phi) > 0.0001 || Math.abs(velocityRef.current.theta) > 0.0001) {
            phiRef.current += velocityRef.current.phi
            thetaRef.current += velocityRef.current.theta
            
            // Apply friction to slow down
            velocityRef.current.phi *= FRICTION
            velocityRef.current.theta *= FRICTION
            
            // Stop if velocity is too small
            if (Math.abs(velocityRef.current.phi) < 0.0001) velocityRef.current.phi = 0
            if (Math.abs(velocityRef.current.theta) < 0.0001) velocityRef.current.theta = 0
          }
          
          // Snap-back to home position after delay
          if (timeSinceInteraction > SNAP_BACK_DELAY) {
            isReturningHome.current = true
            
            // Target position: Europe/France centered
            const targetPhi = INITIAL_PHI
            const targetTheta = INITIAL_THETA
            
            // Lerp towards home position (spring effect)
            const phiDiff = targetPhi - phiRef.current
            const thetaDiff = targetTheta - thetaRef.current
            
            // Normalize phi difference for shortest path
            let normalizedPhiDiff = phiDiff
            if (Math.abs(phiDiff) > Math.PI) {
              normalizedPhiDiff = phiDiff > 0 ? phiDiff - 2 * Math.PI : phiDiff + 2 * Math.PI
            }
            
            phiRef.current += normalizedPhiDiff * SNAP_BACK_SPEED
            thetaRef.current += thetaDiff * SNAP_BACK_SPEED
          }
        }
        
        // Clamp theta
        thetaRef.current = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, thetaRef.current))
        
        // Update globe state
        state.phi = phiRef.current
        state.theta = thetaRef.current
        state.width = width
        state.height = width
      },
    })

    return () => {
      if (globeRef.current) {
        globeRef.current.destroy()
        globeRef.current = null
      }
    }
  }, [markers])

  return (
    <div className="globe-container w-full flex items-center justify-center">
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerOut={handlePointerOut}
        onPointerCancel={handlePointerOut}
        style={{
          width: '100%',
          height: '380px',
          maxWidth: '380px',
          aspectRatio: '1',
          contain: 'layout paint size',
          cursor: 'grab',
          touchAction: 'none',
        }}
      />
    </div>
  )
}
