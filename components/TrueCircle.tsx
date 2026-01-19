'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

// ============================================================================
// TYPES
// ============================================================================
interface TrueCircleContact {
    id: string
    name: string
    age: number
    group: 'FAMILY' | 'WORK' | 'FRIENDS'
    layerRank: number
    connectionDate: Date
    imagePath: string
}

interface TrueCircleProps {
    contacts: TrueCircleContact[]
    embedded?: boolean
    onFullscreenRequest?: () => void
    onContactClick?: (contact: TrueCircleContact) => void
}

interface SphereNode {
    index: number
    name: string
    age: number
    group: string
    layerRank: number
    connectionDate: Date
    imagePath: string
    baseX: number
    baseY: number
    baseZ: number
    color: { r: number; g: number; b: number }
    isOrphan?: boolean
}

interface Connection {
    index1: number
    index2: number
    data: {
        name1: string
        name2: string
        connectionDate: Date
        rank: number
    }
}

// ============================================================================
// EUROPEAN NAMES (from TrueCircle) 
// ============================================================================
const europeanNames = [
    "Sophie", "Lucas", "Emma", "Thomas", "Léa", "Hugo", "Camille", "Antoine", "Marie", "Pierre",
    "Julie", "Nicolas", "Claire", "Alexandre", "Sarah", "Maxime", "Laura", "Julien", "Manon", "Romain",
    "Chloé", "Baptiste", "Élise", "Vincent", "Anaïs", "Matthieu", "Pauline", "Sébastien", "Marion", "Guillaume",
    "Amélie", "Florian", "Lucie", "Adrien", "Justine", "Raphaël", "Émilie", "Benjamin", "Céline", "Jérôme"
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
function nameToFilename(name: string): string {
    return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "")
}

function toSuperscript(num: number): string {
    const supers: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵' }
    return supers[String(num)] || ''
}

function generateConnectionDate(rank: number): Date {
    const now = new Date()
    const currentYear = now.getFullYear()
    let minYearsAgo: number, maxYearsAgo: number

    if (rank === 1) { minYearsAgo = 10; maxYearsAgo = 19 }
    else if (rank === 2) { minYearsAgo = 5; maxYearsAgo = 12 }
    else if (rank === 3) { minYearsAgo = 2; maxYearsAgo = 8 }
    else { minYearsAgo = 0; maxYearsAgo = 5 }

    const yearsAgo = minYearsAgo + Math.random() * (maxYearsAgo - minYearsAgo)
    const date = new Date(now)
    date.setFullYear(currentYear - Math.floor(yearsAgo))
    date.setMonth(Math.floor(Math.random() * 12))
    date.setDate(Math.floor(Math.random() * 28) + 1)

    if (date > now) date.setTime(now.getTime() - Math.random() * 86400000)
    return date
}

// ============================================================================
// TRUECIRCLE COMPONENT
// ============================================================================
export default function TrueCircle({
    contacts,
    embedded = true,
    onFullscreenRequest,
    onContactClick
}: TrueCircleProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const animationFrameRef = useRef<number>()
    const imageCache = useRef<Record<string, HTMLImageElement | null>>({})

    // State
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [selectedNode, setSelectedNode] = useState<SphereNode | null>(null)

    // Refs for animation state
    const stateRef = useRef({
        sphereNodes: [] as SphereNode[],
        connections: [] as Connection[],
        currentRotation: { x: 0, y: 0 },
        targetRotation: { x: 0, y: 0 },
        zoomLevel: 1.0,
        targetZoom: 1.0,
        vizOffset: { x: 0, y: 0 },
        isDragging: false,
        lastTouchX: 0,
        lastTouchY: 0,
        autoRotating: true,
        autoRotationAngle: 0,
        maxRank: 1,
        showConnections: true,
        showCenterLinks: true,
        hoveredNodeIndex: -1,
        clickedNodeIndex: -2,
    })

    const baseRadius = embedded ? 80 : 110

    // Initialize nodes from contacts or generate default
    const initializeNodes = useCallback(() => {
        const state = stateRef.current
        const nodes: SphereNode[] = []

        // Layer configuration
        const counts: Record<number, number> = { 1: 10, 2: 40, 3: 100, 4: 400, 5: 1500 }
        const inc = embedded ? 35 : 45

        let globalIndex = 0
        for (let rank = 1; rank <= state.maxRank; rank++) {
            const nodeCount = counts[rank] || 40
            const radius = baseRadius + (rank - 1) * inc

            for (let i = 0; i < nodeCount; i++) {
                const phi = Math.acos(-1 + (2 * i) / nodeCount)
                const theta = Math.sqrt(nodeCount * Math.PI) * phi

                // First 2 nodes of rank 1 are "Parents"
                const isParent = rank === 1 && globalIndex < 2
                const name = isParent
                    ? (globalIndex === 0 ? "Maman" : "Papa")
                    : europeanNames[globalIndex % europeanNames.length]

                nodes.push({
                    index: globalIndex,
                    name,
                    age: isParent ? 50 : (20 + ((globalIndex * 7919) % 40)),
                    group: isParent ? 'FAMILY' : (['FAMILY', 'WORK', 'FRIENDS'] as const)[globalIndex % 3],
                    layerRank: rank,
                    connectionDate: isParent ? new Date(new Date().getFullYear() - 20, 0, 1) : generateConnectionDate(rank),
                    imagePath: `/truecircle/${nameToFilename(name)}.jpg`,
                    baseX: radius * Math.cos(theta) * Math.sin(phi),
                    baseY: radius * Math.sin(theta) * Math.sin(phi),
                    baseZ: radius * Math.cos(phi),
                    color: { r: 10 + Math.random() * 50, g: 10 + Math.random() * 50, b: 10 + Math.random() * 50 },
                    isOrphan: true,
                })
                globalIndex++
            }
        }

        // Sort by connection date
        nodes.sort((a, b) => a.connectionDate.getTime() - b.connectionDate.getTime())
        nodes.forEach((n, i) => n.index = i)

        state.sphereNodes = nodes

        // Generate connections
        generateConnections()
    }, [embedded, baseRadius])

    const generateConnections = useCallback(() => {
        const state = stateRef.current
        const connections: Connection[] = []
        const nodes = state.sphereNodes

        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const n1 = nodes[i], n2 = nodes[j]
                const d = Math.sqrt(
                    Math.pow(n1.baseX - n2.baseX, 2) +
                    Math.pow(n1.baseY - n2.baseY, 2) +
                    Math.pow(n1.baseZ - n2.baseZ, 2)
                )

                if (d < baseRadius * 2.5) {
                    const rank1 = n1.layerRank, rank2 = n2.layerRank
                    let prob = 0.05 * 0.5
                    if (rank1 === 1 && rank2 === 1) prob = 0.8 * 0.5
                    else if (rank1 === rank2) prob = 0.15 * 0.5

                    if (Math.random() < prob) {
                        connections.push({
                            index1: i,
                            index2: j,
                            data: {
                                name1: n1.name,
                                name2: n2.name,
                                connectionDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000 * 5),
                                rank: Math.max(rank1, rank2),
                            },
                        })
                    }
                }
            }
        }

        state.connections = connections
    }, [baseRadius])

    // Liquid Glass Bubble Renderer
    const drawLiquidBubble = useCallback((
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        radius: number,
        img: HTMLImageElement | null
    ) => {
        // Fake drop shadow
        const shadowRadius = radius * 1.3
        const shadowGrad = ctx.createRadialGradient(x, y + radius * 0.2, radius * 0.8, x, y + radius * 0.2, shadowRadius)
        shadowGrad.addColorStop(0, "rgba(75, 0, 130, 0.2)")
        shadowGrad.addColorStop(1, "rgba(75, 0, 130, 0)")
        ctx.fillStyle = shadowGrad
        ctx.beginPath()
        ctx.arc(x, y + radius * 0.2, shadowRadius, 0, Math.PI * 2)
        ctx.fill()

        // Base circle
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.fillStyle = "rgba(255, 255, 255, 0.1)"
        ctx.fill()

        // Image
        if (img && img.complete && img.naturalWidth > 0) {
            const imgRadius = radius * 0.90
            ctx.save()
            ctx.beginPath()
            ctx.arc(x, y, imgRadius, 0, Math.PI * 2)
            ctx.clip()
            ctx.drawImage(img, x - imgRadius, y - imgRadius, imgRadius * 2, imgRadius * 2)
            ctx.restore()
        }

        // Inner shadows & volume
        ctx.save()
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.clip()

        // Top-left light
        const gradLight = ctx.createRadialGradient(x - radius * 0.3, y - radius * 0.3, radius * 0.1, x, y, radius)
        gradLight.addColorStop(0, "rgba(255, 255, 255, 0.2)")
        gradLight.addColorStop(1, "rgba(255, 255, 255, 0)")
        ctx.fillStyle = gradLight
        ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2)

        // Bottom-right dark
        const gradDark = ctx.createRadialGradient(x + radius * 0.4, y + radius * 0.4, radius * 0.1, x, y, radius * 1.2)
        gradDark.addColorStop(0, "rgba(0, 0, 0, 0.4)")
        gradDark.addColorStop(1, "rgba(0, 0, 0, 0)")
        ctx.fillStyle = gradDark
        ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2)
        ctx.restore()

        // Border
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.strokeStyle = "rgba(255, 255, 255, 0.25)"
        ctx.lineWidth = 1
        ctx.stroke()

        // Glare overlay
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
    }, [])

    // Get or load image
    const getImage = useCallback((node: SphereNode): HTMLImageElement | null => {
        const cache = imageCache.current
        const key = node.index.toString()

        if (cache[key] !== undefined) return cache[key]

        cache[key] = null
        const img = new Image()
        img.onload = () => { cache[key] = img }
        img.onerror = () => { cache[key] = null }
        img.src = node.imagePath

        return null
    }, [])

    // Main render loop
    const draw = useCallback(() => {
        const canvas = canvasRef.current
        const container = containerRef.current
        if (!canvas || !container) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const state = stateRef.current
        const vizWidth = canvas.width
        const vizHeight = canvas.height

        ctx.clearRect(0, 0, vizWidth, vizHeight)

        // Animation
        state.zoomLevel += (state.targetZoom - state.zoomLevel) * 0.1

        if (state.autoRotating && !state.isDragging) {
            state.autoRotationAngle += embedded ? 0.003 : 0.002
            state.currentRotation.x = Math.sin(state.autoRotationAngle) * 0.3
            state.currentRotation.y = Math.cos(state.autoRotationAngle) * 0.3
        } else {
            state.currentRotation.x += (state.targetRotation.x - state.currentRotation.x) * 0.1
            state.currentRotation.y += (state.targetRotation.y - state.currentRotation.y) * 0.1
        }

        let scale = (Math.min(vizWidth, vizHeight) / (embedded ? 300 : 550)) * state.zoomLevel
        const cx = (vizWidth / 2) + state.vizOffset.x
        const cy = (vizHeight / 2) + state.vizOffset.y
        const rotX = state.currentRotation.y * 4.5
        const rotY = state.currentRotation.x * 4.5
        const perspective = 850 * scale

        // Project center (ELOI)
        const cP = perspective / (perspective + 0)
        const centerProj = { x: cx, y: cy, scale: cP }

        // Project nodes
        const projected: Array<{
            x: number
            y: number
            z: number
            scale: number
            node: SphereNode
            index: number
        }> = []

        state.sphereNodes.forEach(node => {
            if (node.layerRank > state.maxRank) return

            const nX = node.baseX * scale
            const nY = node.baseY * scale
            const nZ = node.baseZ * scale

            const x1 = nX * Math.cos(rotY) - nZ * Math.sin(rotY)
            const z1 = nZ * Math.cos(rotY) + nX * Math.sin(rotY)
            const y2 = nY * Math.cos(rotX) - z1 * Math.sin(rotX)
            const z2 = z1 * Math.cos(rotX) + nY * Math.sin(rotX)
            const p = perspective / (perspective + z2)

            projected.push({
                x: cx + x1 * p,
                y: cy + y2 * p,
                z: z2,
                scale: p,
                node,
                index: node.index,
            })
        })

        // Draw center links
        if (state.showCenterLinks) {
            projected.forEach(p => {
                ctx.beginPath()
                ctx.moveTo(centerProj.x, centerProj.y)
                ctx.lineTo(p.x, p.y)
                ctx.strokeStyle = `rgba(0,0,0,${0.08 * p.scale})`
                ctx.lineWidth = 0.5
                ctx.stroke()
            })
        }

        // Draw connections
        if (state.showConnections) {
            state.connections.forEach(c => {
                if (c.data.rank > state.maxRank) return
                const p1 = projected.find(p => p.index === c.index1)
                const p2 = projected.find(p => p.index === c.index2)
                if (!p1 || !p2) return

                ctx.beginPath()
                ctx.moveTo(p1.x, p1.y)
                ctx.lineTo(p2.x, p2.y)
                ctx.strokeStyle = `rgba(0,0,0,0.12)`
                ctx.lineWidth = 1
                ctx.stroke()
            })
        }

        // Draw center (ELOI)
        const cR = (embedded ? 4 : 5) * scale * centerProj.scale
        const showPhotos = state.zoomLevel >= (embedded ? 1.5 : 2.5)

        if (showPhotos) {
            const centerImg = getImage({ index: -1, imagePath: '/truecircle/eloii.jpg' } as SphereNode)
            if (centerImg && centerImg.complete) {
                const photoR = Math.max(cR * 1.5, embedded ? 20 : 30)
                drawLiquidBubble(ctx, centerProj.x, centerProj.y, photoR, centerImg)
            } else {
                ctx.beginPath()
                ctx.arc(centerProj.x, centerProj.y, cR * 1.3, 0, Math.PI * 2)
                ctx.fillStyle = '#000'
                ctx.fill()
            }
        } else {
            ctx.beginPath()
            ctx.arc(centerProj.x, centerProj.y, cR, 0, Math.PI * 2)
            ctx.fillStyle = '#000'
            ctx.fill()
        }

        // Draw nodes (back to front)
        projected.sort((a, b) => b.z - a.z).forEach(p => {
            let r = ((embedded ? 2 : 2.5) * scale) * p.scale
            if (p.index === state.hoveredNodeIndex || p.index === state.clickedNodeIndex) r *= 1.5

            if (showPhotos) {
                const img = getImage(p.node)
                if (img && img.complete && img.naturalWidth > 0) {
                    const photoR = Math.max(r * 1.8, embedded ? 12 : 20)
                    drawLiquidBubble(ctx, p.x, p.y, photoR, img)
                } else {
                    ctx.beginPath()
                    ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
                    ctx.fillStyle = `rgba(${p.node.color.r},${p.node.color.g},${p.node.color.b},${p.scale})`
                    ctx.fill()
                }
            } else {
                ctx.beginPath()
                ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
                ctx.fillStyle = `rgba(${p.node.color.r},${p.node.color.g},${p.node.color.b},${p.scale})`
                ctx.fill()
            }
        })

        // Fullscreen button hint (embedded mode)
        if (embedded) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'
            ctx.beginPath()
            ctx.roundRect(vizWidth - 36, vizHeight - 36, 28, 28, 6)
            ctx.fill()

            ctx.strokeStyle = 'white'
            ctx.lineWidth = 1.5
            ctx.beginPath()
            // Expand icon
            ctx.moveTo(vizWidth - 28, vizHeight - 28)
            ctx.lineTo(vizWidth - 20, vizHeight - 28)
            ctx.moveTo(vizWidth - 28, vizHeight - 28)
            ctx.lineTo(vizWidth - 28, vizHeight - 20)

            ctx.moveTo(vizWidth - 16, vizHeight - 12)
            ctx.lineTo(vizWidth - 16, vizHeight - 20)
            ctx.moveTo(vizWidth - 16, vizHeight - 12)
            ctx.lineTo(vizWidth - 24, vizHeight - 12)
            ctx.stroke()
        }

        animationFrameRef.current = requestAnimationFrame(draw)
    }, [embedded, drawLiquidBubble, getImage])

    // Resize handler
    const handleResize = useCallback(() => {
        const canvas = canvasRef.current
        const container = containerRef.current
        if (!canvas || !container) return

        const rect = container.getBoundingClientRect()
        const dpr = window.devicePixelRatio || 1
        canvas.width = rect.width * dpr
        canvas.height = rect.height * dpr
        canvas.style.width = `${rect.width}px`
        canvas.style.height = `${rect.height}px`

        const ctx = canvas.getContext('2d')
        if (ctx) ctx.scale(dpr, dpr)
    }, [])

    // Touch/mouse handlers
    const handlePointerDown = useCallback((e: React.PointerEvent) => {
        const state = stateRef.current
        state.isDragging = true
        state.lastTouchX = e.clientX
        state.lastTouchY = e.clientY
        state.autoRotating = false
    }, [])

    const handlePointerMove = useCallback((e: React.PointerEvent) => {
        const state = stateRef.current
        if (!state.isDragging) return

        const dx = e.clientX - state.lastTouchX
        const dy = e.clientY - state.lastTouchY

        state.targetRotation.x += dy * 0.005
        state.targetRotation.y += dx * 0.005

        state.lastTouchX = e.clientX
        state.lastTouchY = e.clientY
    }, [])

    const handlePointerUp = useCallback(() => {
        stateRef.current.isDragging = false
    }, [])

    const handleClick = useCallback((e: React.MouseEvent) => {
        const canvas = canvasRef.current
        if (!canvas) return

        const rect = canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        // Check fullscreen button in embedded mode
        if (embedded && x > rect.width - 40 && y > rect.height - 40) {
            if (onFullscreenRequest) onFullscreenRequest()
            setIsFullscreen(true)
            return
        }

        // TODO: Implement node hit detection
    }, [embedded, onFullscreenRequest])

    const handleWheel = useCallback((e: React.WheelEvent) => {
        e.preventDefault()
        const state = stateRef.current
        state.targetZoom = Math.max(0.5, Math.min(5, state.targetZoom - e.deltaY * 0.001))
    }, [])

    // Initialize
    useEffect(() => {
        initializeNodes()
        handleResize()
        draw()

        window.addEventListener('resize', handleResize)

        return () => {
            window.removeEventListener('resize', handleResize)
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current)
            }
        }
    }, [initializeNodes, handleResize, draw])

    // Fullscreen component
    if (isFullscreen) {
        return (
            <div
                className="fixed inset-0 z-[1000]"
                style={{ touchAction: 'none', background: 'var(--bg-primary)' }}
            >
                {/* Close button */}
                <button
                    className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center"
                    style={{
                        background: 'var(--glass-bg)',
                        backdropFilter: 'blur(10px)',
                    }}
                    onClick={() => setIsFullscreen(false)}
                >
                    <i className="fa-solid fa-xmark text-lg" style={{ color: 'var(--text-primary)' }} />
                </button>

                <div ref={containerRef} className="w-full h-full">
                    <canvas
                        ref={canvasRef}
                        className="w-full h-full"
                        style={{ touchAction: 'none' }}
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerLeave={handlePointerUp}
                        onClick={handleClick}
                        onWheel={handleWheel}
                    />
                </div>

                {/* Bottom label */}
                <div
                    className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl"
                    style={{
                        background: 'var(--overlay-bg)',
                        backdropFilter: 'blur(10px)',
                    }}
                >
                    <span className="text-xs font-medium" style={{ color: 'var(--text-inverse)' }}>TrueCircle Network</span>
                </div>
            </div>
        )
    }

    // Embedded component
    return (
        <div
            ref={containerRef}
            className="relative rounded-2xl overflow-hidden cursor-pointer transition-all active:scale-[0.98]"
            style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-light)',
                boxShadow: 'var(--shadow-md)',
                backdropFilter: 'blur(20px)',
                height: '200px',
            }}
        >
            <canvas
                ref={canvasRef}
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'block',
                    touchAction: 'none',
                }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                onClick={handleClick}
                onWheel={handleWheel}
            />
            {/* Label */}
            <div
                className="absolute bottom-3 left-3 text-center"
                style={{
                    background: 'var(--overlay-bg)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: '8px',
                    padding: '6px 12px',
                }}
            >
                <span className="text-[10px] font-medium" style={{ color: 'var(--text-inverse)' }}>TrueCircle Network</span>
            </div>

            {/* Expand button */}
            <button
                className="absolute bottom-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center transition-all active:scale-95"
                style={{
                    background: 'var(--overlay-bg)',
                    backdropFilter: 'blur(8px)',
                }}
                onClick={(e) => {
                    e.stopPropagation()
                    setIsFullscreen(true)
                    if (onFullscreenRequest) onFullscreenRequest()
                }}
            >
                <i className="fa-solid fa-expand text-xs" style={{ color: 'var(--text-inverse)' }} />
            </button>
        </div>
    )
}
