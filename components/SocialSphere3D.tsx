'use client'

import { useEffect, useRef } from 'react'

interface SocialSphere3DProps {
  contacts: Array<{
    id: string
    name: string
    relationshipType?: string
    avatar?: string
  }>
  userAvatar?: string
  onClick?: (contact: { id: string; name: string }) => void
}

export default function SocialSphere3D({ contacts, userAvatar, onClick }: SocialSphere3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctxOrNull = canvas.getContext('2d')
    if (!ctxOrNull) return
    const ctx = ctxOrNull // Now ctx is guaranteed non-null

    let animationId: number
    let width: number
    let height: number

    // ============================================
    // CONSTANTS FROM TESTMOBILE.HTML
    // ============================================
    const baseRadius = 110 // Same as testmobile
    const PHOTO_ZOOM_THRESHOLD = 2.5 // Show photos above this zoom

    // ============================================
    // STATE (mirrors testmobile.html exactly)
    // ============================================
    let currentRotation = { x: 0, y: 0 }
    let targetRotation = { x: 0, y: 0 }
    let zoomLevel = 1.0
    let targetZoom = 1.0
    let vizOffset = { x: 0, y: 0 }
    let autoRotationAngle = 0
    let autoRotating = true

    let isDragging = false
    let touchStartX = 0, touchStartY = 0
    let lastTouchX = 0, lastTouchY = 0
    let hasMoved = false
    let initialPinchDistance = 0
    let initialZoom = 1.0
    let lastPinchCenterX: number | undefined
    let lastPinchCenterY: number | undefined
    let initialPinchMidpoint = { x: 0, y: 0 }
    let gestureMode: 'pan' | 'zoom' | null = null

    // ============================================
    // IMAGE CACHE
    // ============================================
    const imageCache: { [key: string]: HTMLImageElement } = {}

    function loadImage(src: string, id: string): HTMLImageElement | null {
      if (imageCache[id]) return imageCache[id]
      if (imageCache[id] === undefined) {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => { imageCache[id] = img }
        img.onerror = () => { /* silently fail */ }
        img.src = src
        imageCache[id] = img // Store the loading image
      }
      return imageCache[id]?.complete ? imageCache[id] : null
    }

    // ============================================
    // CREATE NODES - FIBONACCI DISTRIBUTION (from testmobile)
    // ============================================
    interface SphereNode {
      baseX: number
      baseY: number
      baseZ: number
      name: string
      id: string
      avatar?: string
      color: { r: number; g: number; b: number }
      layerRank: number
      index: number
    }

    const sphereNodes: SphereNode[] = []
    const nodeCount = contacts.length

    contacts.forEach((contact, i) => {
      // Fibonacci Lattice distribution (exact same as testmobile.html)
      const phi = Math.acos(-1 + (2 * i) / Math.max(nodeCount, 1))
      const theta = Math.sqrt(Math.max(nodeCount, 1) * Math.PI) * phi
      const radius = baseRadius

      sphereNodes.push({
        baseX: radius * Math.cos(theta) * Math.sin(phi),
        baseY: radius * Math.sin(theta) * Math.sin(phi),
        baseZ: radius * Math.cos(phi),
        name: contact.name,
        id: contact.id,
        avatar: contact.avatar,
        color: { r: 139, g: 168, b: 136 }, // Default color
        layerRank: 1,
        index: i
      })
    })

    // ============================================
    // DRAW LIQUID BUBBLE (exact copy from testmobile.html)
    // ============================================
    function drawLiquidBubble(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, img: HTMLImageElement | null) {
      // 1. FAKE DROP SHADOW
      const shadowRadius = radius * 1.3
      const shadowGrad = ctx.createRadialGradient(x, y + radius * 0.2, radius * 0.8, x, y + radius * 0.2, shadowRadius)
      shadowGrad.addColorStop(0, "rgba(75, 0, 130, 0.2)")
      shadowGrad.addColorStop(1, "rgba(75, 0, 130, 0)")
      ctx.fillStyle = shadowGrad
      ctx.beginPath()
      ctx.arc(x, y + radius * 0.2, shadowRadius, 0, Math.PI * 2)
      ctx.fill()

      // Base Circle
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fillStyle = "rgba(255, 255, 255, 0.1)"
      ctx.fill()

      // 2. IMAGE
      if (img && img.complete) {
        const imgRadius = radius * 0.90
        ctx.save()
        ctx.beginPath()
        ctx.arc(x, y, imgRadius, 0, Math.PI * 2)
        ctx.clip()
        ctx.drawImage(img, x - imgRadius, y - imgRadius, imgRadius * 2, imgRadius * 2)
        ctx.restore()
      }

      // 3. INNER SHADOWS & VOLUME
      ctx.save()
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.clip()

      // Top-Left Light
      const gradLight = ctx.createRadialGradient(x - radius * 0.3, y - radius * 0.3, radius * 0.1, x, y, radius)
      gradLight.addColorStop(0, "rgba(255, 255, 255, 0.2)")
      gradLight.addColorStop(1, "rgba(255, 255, 255, 0)")
      ctx.fillStyle = gradLight
      ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2)

      // Bottom-Right Dark
      const gradDark = ctx.createRadialGradient(x + radius * 0.4, y + radius * 0.4, radius * 0.1, x, y, radius * 1.2)
      gradDark.addColorStop(0, "rgba(0, 0, 0, 0.4)")
      gradDark.addColorStop(1, "rgba(0, 0, 0, 0)")
      ctx.fillStyle = gradDark
      ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2)

      ctx.restore()

      // 4. BORDER
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.strokeStyle = "rgba(255, 255, 255, 0.25)"
      ctx.lineWidth = 1
      ctx.stroke()

      // 5. GLARE OVERLAY
      ctx.save()
      const gx = x - radius * 0.4
      const gy = y - radius * 0.4

      const glareGrad = ctx.createRadialGradient(gx, gy, 0, gx, gy, radius * 1.5)
      glareGrad.addColorStop(0, "rgba(255, 255, 255, 0.4)")
      glareGrad.addColorStop(0.2, "rgba(255, 255, 255, 0.05)")
      glareGrad.addColorStop(0.6, "rgba(255, 255, 255, 0)")

      ctx.globalCompositeOperation = 'screen'
      ctx.fillStyle = glareGrad
      ctx.beginPath()
      ctx.arc(x, y, radius * 0.9, 0, Math.PI * 2)
      ctx.fill()

      // Specular highlight
      ctx.translate(x + radius * 0.5, y + radius * 0.5)
      ctx.rotate(-Math.PI / 4)
      ctx.beginPath()
      ctx.ellipse(0, 0, radius * 0.15, radius * 0.08, 0, 0, Math.PI * 2)
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)"
      ctx.fill()

      ctx.restore()
    }

    // ============================================
    // MAIN RENDER LOOP (drawTrueCircle from testmobile.html)
    // ============================================
    function drawTrueCircle() {
      ctx.clearRect(0, 0, width, height)

      // Smooth zoom
      zoomLevel += (targetZoom - zoomLevel) * 0.1

      // Auto-rotation (exact same as testmobile)
      if (autoRotating && !isDragging) {
        autoRotationAngle += 0.002
        currentRotation.x = Math.sin(autoRotationAngle) * 0.3
        currentRotation.y = Math.cos(autoRotationAngle) * 0.3
      } else {
        currentRotation.x += (targetRotation.x - currentRotation.x) * 0.1
        currentRotation.y += (targetRotation.y - currentRotation.y) * 0.1
      }

      // Scale calculation (exact same as testmobile: screenSize/550)
      let scale = (Math.min(width, height) / 550) * zoomLevel

      const cx = (width / 2) + vizOffset.x
      const cy = (height / 2) + vizOffset.y
      const rotX = currentRotation.y * 4.5 // Note: testmobile swaps x/y for rotation
      const rotY = currentRotation.x * 4.5
      const perspective = 850 * scale

      // Project Center (User Node) - exact same as testmobile.html
      // Even though baseX/Y/Z are 0, we follow the projection math for consistency
      const centerProj = { x: cx, y: cy, scale: 1, z: 0 }

      // Project all nodes
      const projected = sphereNodes.map(node => {
        const nX = node.baseX * scale
        const nY = node.baseY * scale
        const nZ = node.baseZ * scale

        // Rotation around Y axis (Yaw)
        const x1 = nX * Math.cos(rotY) - nZ * Math.sin(rotY)
        const z1 = nZ * Math.cos(rotY) + nX * Math.sin(rotY)

        // Rotation around X axis (Pitch)
        const y2 = nY * Math.cos(rotX) - z1 * Math.sin(rotX)
        const z2 = z1 * Math.cos(rotX) + nY * Math.sin(rotX)

        // Perspective projection
        const p = perspective / (perspective + z2)

        return {
          x: cx + x1 * p,
          y: cy + y2 * p,
          z: z2,
          scale: p,
          node
        }
      })

      // Generate and draw connections between nearby nodes
      projected.forEach((p1, i1) => {
        projected.forEach((p2, i2) => {
          if (i1 >= i2) return
          const n1 = sphereNodes[i1], n2 = sphereNodes[i2]
          const d = Math.sqrt(
            (n1.baseX - n2.baseX) ** 2 +
            (n1.baseY - n2.baseY) ** 2 +
            (n1.baseZ - n2.baseZ) ** 2
          )
          // Connection threshold: baseRadius * 2.5 for Rank 1
          if (d < baseRadius * 2.5) {
            // Rank 1 connections - solid lines without random flickering
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = `rgba(0,0,0,${0.15 * Math.min(p1.scale, p2.scale)})`
            ctx.lineWidth = 1
            ctx.stroke()
          }
        })
      })

      // Draw center to node connections (from testmobile.html)
      projected.forEach(p => {
        ctx.beginPath()
        ctx.moveTo(centerProj.x, centerProj.y)
        ctx.lineTo(p.x, p.y)
        ctx.strokeStyle = `rgba(0,0,0,${0.1 * p.scale})`
        ctx.lineWidth = 0.5
        ctx.stroke()
      })

      // Sort by Z for proper depth ordering (back to front)
      projected.sort((a, b) => b.z - a.z)

      // Determine if we should show photos
      const showPhotos = zoomLevel >= PHOTO_ZOOM_THRESHOLD

      // Draw Center Node (User) - from testmobile.html
      let cR = (5 * scale) * centerProj.scale;
      if (showPhotos) {
        // Draw center with user photo
        const centerImg = userAvatar ? loadImage(userAvatar, 'user_center') : null;
        if (centerImg && centerImg.complete) {
          let photoR = Math.max(cR * 1.5, 30);
          drawLiquidBubble(ctx, centerProj.x, centerProj.y, photoR, centerImg);
        } else {
          ctx.beginPath(); ctx.arc(centerProj.x, centerProj.y, cR * 1.3, 0, Math.PI * 2);
          ctx.fillStyle = '#000'; ctx.fill();
        }
      } else {
        ctx.beginPath(); ctx.arc(centerProj.x, centerProj.y, cR, 0, Math.PI * 2);
        ctx.fillStyle = '#000'; ctx.fill();
      }

      // Draw nodes
      projected.forEach(p => {
        let r = (2.5 * scale) * p.scale

        if (showPhotos) {
          // Photo mode - larger circular photos
          const img = p.node.avatar ? loadImage(p.node.avatar, p.node.id) : null
          const photoR = Math.max(r * 1.8, 20) // Minimum 20px radius

          if (img && img.complete) {
            drawLiquidBubble(ctx, p.x, p.y, photoR, img)
          } else {
            // Fallback to colored circle while loading
            ctx.beginPath()
            ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(${p.node.color.r},${p.node.color.g},${p.node.color.b},${p.scale})`
            ctx.fill()
          }
        } else {
          // Normal mode - colored dots
          ctx.beginPath()
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${p.node.color.r},${p.node.color.g},${p.node.color.b},${p.scale})`
          ctx.fill()
        }
      })

      animationId = requestAnimationFrame(drawTrueCircle)
    }

    // ============================================
    // EVENT HANDLERS (exact same as testmobile.html)
    // ============================================
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault()
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX
        touchStartY = e.touches[0].clientY
        lastTouchX = touchStartX
        lastTouchY = touchStartY
        isDragging = true
        hasMoved = false
        autoRotating = false
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX
        const dy = e.touches[0].clientY - e.touches[1].clientY
        initialPinchDistance = Math.sqrt(dx * dx + dy * dy)
        initialPinchMidpoint = {
          x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
          y: (e.touches[0].clientY + e.touches[1].clientY) / 2
        }
        initialZoom = targetZoom
        gestureMode = null
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      if (e.touches.length === 1 && isDragging) {
        const dx = e.touches[0].clientX - lastTouchX
        const dy = e.touches[0].clientY - lastTouchY
        if (Math.abs(e.touches[0].clientX - touchStartX) > 5 || Math.abs(e.touches[0].clientY - touchStartY) > 5) {
          hasMoved = true
        }
        targetRotation.x += dy * 0.005
        targetRotation.y += dx * 0.005
        lastTouchX = e.touches[0].clientX
        lastTouchY = e.touches[0].clientY
        autoRotating = false
      } else if (e.touches.length === 2) {
        const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2
        const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2
        const dx = e.touches[0].clientX - e.touches[1].clientX
        const dy = e.touches[0].clientY - e.touches[1].clientY
        const currentDist = Math.sqrt(dx * dx + dy * dy)

        if (gestureMode === null) {
          const moveDist = Math.sqrt((centerX - initialPinchMidpoint.x) ** 2 + (centerY - initialPinchMidpoint.y) ** 2)
          const zoomDist = Math.abs(currentDist - initialPinchDistance)
          if (moveDist > 20) gestureMode = 'pan'
          else if (zoomDist > 30) gestureMode = 'zoom'
        }

        if (gestureMode === 'zoom') {
          targetZoom = Math.max(0.1, Math.min(10.0, initialZoom * (currentDist / initialPinchDistance)))
        } else if (gestureMode === 'pan') {
          if (lastPinchCenterX !== undefined) {
            vizOffset.x += centerX - lastPinchCenterX
            vizOffset.y += centerY - lastPinchCenterY!
          }
        }
        lastPinchCenterX = centerX
        lastPinchCenterY = centerY
        autoRotating = false
      }
    }

    const handleTouchEnd = () => {
      isDragging = false
      lastPinchCenterX = undefined
      lastPinchCenterY = undefined
    }

    const handleMouseDown = (e: MouseEvent) => {
      touchStartX = e.clientX
      touchStartY = e.clientY
      lastTouchX = touchStartX
      lastTouchY = touchStartY
      isDragging = true
      hasMoved = false
      autoRotating = false
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      const dx = e.clientX - lastTouchX
      const dy = e.clientY - lastTouchY
      if (Math.abs(e.clientX - touchStartX) > 5 || Math.abs(e.clientY - touchStartY) > 5) {
        hasMoved = true
      }
      targetRotation.x += dy * 0.005
      targetRotation.y += dx * 0.005
      lastTouchX = e.clientX
      lastTouchY = e.clientY
    }

    const handleMouseUp = () => {
      isDragging = false
    }

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      const delta = e.deltaY * -0.001
      targetZoom = Math.max(0.1, Math.min(10.0, targetZoom + delta))
    }

    // ============================================
    // INITIALIZATION
    // ============================================
    function resize() {
      const rect = canvas!.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas!.width = rect.width * dpr
      canvas!.height = rect.height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0) // Reset and scale
      width = rect.width
      height = rect.height
      console.log('[SocialSphere3D] resize:', { width, height, dpr, nodeCount: sphereNodes.length })
    }

    console.log('[SocialSphere3D] initialized with', contacts.length, 'contacts')
    console.log('[SocialSphere3D] sphereNodes:', sphereNodes)

    resize()

    // Attach event listeners
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false })
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false })
    canvas.addEventListener('touchend', handleTouchEnd)
    canvas.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    canvas.addEventListener('wheel', handleWheel, { passive: false })

    // Start animation
    drawTrueCircle()

    // ResizeObserver for responsiveness
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(animationId)
      resize()
      drawTrueCircle() // Restart animation after resize
    })
    observer.observe(canvas)

    // Cleanup
    return () => {
      observer.disconnect()
      cancelAnimationFrame(animationId)
      canvas.removeEventListener('touchstart', handleTouchStart)
      canvas.removeEventListener('touchmove', handleTouchMove)
      canvas.removeEventListener('touchend', handleTouchEnd)
      canvas.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      canvas.removeEventListener('wheel', handleWheel)
    }
  }, [contacts, onClick])

  return (
    <div
      className="relative w-full h-full"
      style={{
        background: 'transparent',
        border: 'none',
        boxShadow: 'none',
        backdropFilter: 'none',
      }}
    >
      <canvas
        ref={canvasRef}
        className="block w-full h-full"
        style={{ touchAction: 'none' }}
      />

      {/* Bouton "Lancer TrueCircle" - smaller */}
      <button
        onClick={() => window.location.href = "/testmobile.html"}
        className="absolute top-3 right-3 px-2.5 py-1 rounded-xl flex items-center gap-1.5 transition-all active:scale-95 hover:brightness-110 shadow-md"
        style={{
          background: 'rgba(25, 25, 25, 0.8)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          zIndex: 100
        }}
      >
        <span className="text-[9px] font-semibold text-white/95 tracking-wide">TC</span>
        <i className="fa-solid fa-arrow-right-from-bracket text-[7px] text-white/60" />
      </button>

      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
    </div>
  )
}
