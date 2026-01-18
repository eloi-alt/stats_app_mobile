'use client'

import React, { useRef, useState, useMemo, useCallback } from 'react'
import { Canvas, useFrame, useThree, ThreeElements } from '@react-three/fiber'
import {
    MeshDistortMaterial,
    ArcballControls,
    Environment,
    Lightformer
} from '@react-three/drei'
import { easing } from 'maath'
import * as THREE from 'three'

// -----------------------------------------------------------------------------
// 1. Définition des Interfaces et Props
// -----------------------------------------------------------------------------

type LiquidBlobProps = ThreeElements['mesh'] & {
    /** Score d'harmonie (0-100) de l'utilisateur - détermine la couleur de BASE */
    harmonyScore: number;
    /** Indique si l'utilisateur est en train de drag/spin */
    isDragging: boolean;
    /** Callback pour le clic sur la sphère */
    onClick?: () => void;
    /** Intensité de la distorsion (0.0 à 1.0) */
    distort?: number;
    /** Vitesse de l'animation de distorsion */
    speed?: number;
    /** Rayon de la sphère de base */
    radius?: number;
    /** Rugosité de surface (0 = miroir, 1 = mat) */
    roughness?: number;
}

// -----------------------------------------------------------------------------
// 2. Utilitaire de Couleur d'Harmonie
//    Rouge (0%) → Orange → Jaune → Vert clair → Vert émeraude (100%)
// -----------------------------------------------------------------------------

function getHarmonyColor(score: number): THREE.Color {
    // Clamp entre 0 et 100
    const s = Math.min(Math.max(score, 0), 100) / 100;

    // Palette d'harmonie (du moins bon au meilleur)
    // 0% = Rouge anxieux
    // 25% = Orange en difficulté
    // 50% = Jaune neutre
    // 75% = Vert clair positif
    // 100% = Vert émeraude harmonieux

    const harmonyPalette = [
        new THREE.Color('#ff1744'), // 0%  - Rouge vif saturé
        new THREE.Color('#ff6d00'), // 25% - Orange électrique
        new THREE.Color('#ffea00'), // 50% - Jaune vif
        new THREE.Color('#76ff03'), // 75% - Vert lime néon
        new THREE.Color('#1de9b6'), // 100% - Turquoise vibrant
    ];

    // Interpolation entre les couleurs de la palette
    const segmentCount = harmonyPalette.length - 1;
    const segment = s * segmentCount;
    const index = Math.floor(segment);
    const blend = segment - index;

    if (index >= segmentCount) {
        return harmonyPalette[segmentCount].clone();
    }

    return new THREE.Color().lerpColors(
        harmonyPalette[index],
        harmonyPalette[index + 1],
        blend
    );
}

// -----------------------------------------------------------------------------
// 3. Le Composant Mesh (L'Objet Liquide)
// -----------------------------------------------------------------------------

const LiquidBlob: React.FC<LiquidBlobProps> = ({
    harmonyScore,
    isDragging,
    onClick,
    distort = 0.5,
    speed = 2,
    radius = 1,
    roughness = 0.2,
    ...props
}) => {
    const meshRef = useRef<THREE.Mesh>(null!);
    // eslint-disable-next-line
    const materialRef = useRef<any>(null);
    const [hovered, setHovered] = useState(false);
    const pointerDownPos = useRef<{ x: number; y: number } | null>(null);
    const { camera } = useThree();

    const geometryArgs = useMemo<[number, number, number]>(() => [radius, 64, 64], [radius]);

    // Couleur de BASE = harmonie de l'utilisateur (données de la DB)
    const harmonyColor = useMemo(() => getHarmonyColor(harmonyScore), [harmonyScore]);

    // Refs pour la physique de rotation
    const prevCameraQuat = useRef(new THREE.Quaternion())
    const rotationalEnergy = useRef(0)
    const accumulatedRotation = useRef(0)

    // Palette de spin dynamique (spectre arc-en-ciel vif pour le spin)
    const spinPalette = useMemo(() => [
        new THREE.Color('#ff0055'), // Rose vif
        new THREE.Color('#ff6600'), // Orange électrique
        new THREE.Color('#ffcc00'), // Jaune vif
        new THREE.Color('#00ff88'), // Vert néon
        new THREE.Color('#00ccff'), // Cyan électrique
        new THREE.Color('#6600ff'), // Violet profond
        new THREE.Color('#ff00aa'), // Magenta
    ], [])

    // Animation de la couleur basée sur la rotation
    useFrame((state, delta) => {
        if (!meshRef.current || !materialRef.current) return;

        // 1. Calculer le changement de rotation de la CAMÉRA (ArcballControls)
        const currentCameraQuat = camera.quaternion.clone()
        const angleChanged = prevCameraQuat.current.angleTo(currentCameraQuat)
        prevCameraQuat.current.copy(currentCameraQuat)

        // Accumuler la rotation totale (pilote le cycle de couleur)
        accumulatedRotation.current += angleChanged

        // 2. Calculer l'énergie rotationnelle (vitesse du spin)
        if (isDragging && angleChanged > 0.001) {
            // Plus on spin vite, plus l'énergie augmente rapidement
            rotationalEnergy.current = Math.min(rotationalEnergy.current + angleChanged * 20, 1)
        }

        // 3. Dissipation de l'énergie (retour progressif vers harmonie)
        // Plus lent quand on drag, plus rapide au repos
        const decayRate = isDragging ? 0.3 : 2.5;
        rotationalEnergy.current = THREE.MathUtils.lerp(rotationalEnergy.current, 0, delta * decayRate)

        // Clamp
        const energyIntensity = Math.min(Math.max(rotationalEnergy.current, 0), 1)

        // 4. Déterminer la couleur cible
        let targetColor: THREE.Color;

        if (energyIntensity > 0.01) {
            // === SPIN ACTIF : Couleur dynamique basée sur vitesse et amplitude ===

            // A. Cycle de teinte basé sur la rotation accumulée
            const hueCycleSpeed = 0.3; // Vitesse du cycle de couleur
            const hueCycle = (accumulatedRotation.current * hueCycleSpeed) % 1.0

            // B. Interpoler dans la palette de spin
            const paletteIndex = hueCycle * spinPalette.length
            const index1 = Math.floor(paletteIndex) % spinPalette.length
            const index2 = (index1 + 1) % spinPalette.length
            const blendFactor = paletteIndex - Math.floor(paletteIndex)

            const spinColor = new THREE.Color().copy(spinPalette[index1])
            spinColor.lerp(spinPalette[index2], blendFactor)

            // C. Boost de saturation et luminosité selon l'énergie (effet néon)
            const hsl = { h: 0, s: 0, l: 0 }
            spinColor.getHSL(hsl)
            const saturationBoost = 0.8 + (energyIntensity * 0.2)
            const lightnessBoost = 0.45 + (energyIntensity * 0.25)
            spinColor.setHSL(hsl.h, saturationBoost, lightnessBoost)

            // D. Mélanger entre couleur harmonie et couleur spin selon l'énergie
            // À 0% d'énergie = 100% harmonie, à 100% d'énergie = 100% spin
            targetColor = new THREE.Color().copy(harmonyColor)
            targetColor.lerp(spinColor, energyIntensity)
        } else {
            // === REPOS : Retour à la couleur d'harmonie de l'utilisateur ===
            targetColor = harmonyColor.clone()
        }

        // 5. Appliquer la couleur avec interpolation douce
        easing.dampC(materialRef.current.color, targetColor, 0.15, delta)

        // Rotation automatique lente quand pas en drag
        if (!isDragging) {
            meshRef.current.rotation.y += delta * 0.08
        }

        // Scale au survol
        const targetScale = hovered ? 1.12 : 1.0
        meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1)
    })

    const handlePointerDown = useCallback((e: any) => {
        pointerDownPos.current = { x: e.clientX, y: e.clientY }
    }, [])

    const handlePointerUp = useCallback((e: any) => {
        if (pointerDownPos.current) {
            const dx = e.clientX - pointerDownPos.current.x
            const dy = e.clientY - pointerDownPos.current.y
            const distance = Math.sqrt(dx * dx + dy * dy)

            if (distance < 5 && onClick) {
                onClick()
            }

            pointerDownPos.current = null
        }
    }, [onClick])

    return (
        <mesh
            ref={meshRef}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            {...props}
        >
            <sphereGeometry args={geometryArgs} />
            <MeshDistortMaterial
                ref={materialRef}
                color={harmonyColor}
                attach="material"
                distort={distort}
                speed={speed}
                roughness={roughness}
                metalness={0.35}
                bumpScale={0.005}
                clearcoat={1.0}
                clearcoatRoughness={0.1}
                radius={1}
                envMapIntensity={1.8}
            />
        </mesh>
    );
};

// -----------------------------------------------------------------------------
// 4. Le Composant Principal (Container)
// -----------------------------------------------------------------------------

interface EmulsionSphereProps {
    /** Score d'harmonie de l'utilisateur (0-100) - connecté à la base de données */
    number: number;
    onClick?: () => void;
}

export default function EmulsionSphere({ number, onClick }: EmulsionSphereProps) {
    const [isDragging, setIsDragging] = useState(false)

    const handleDragStart = useCallback(() => {
        setIsDragging(true)
    }, [])

    const handleDragEnd = useCallback(() => {
        setIsDragging(false)
    }, [])

    return (
        <div style={{
            width: '100%',
            height: '300px',
            touchAction: 'none',
            cursor: isDragging ? 'grabbing' : 'grab',
            position: 'relative',
            zIndex: 10100,
            overflow: 'visible',
        }}>
            <Canvas
                camera={{ position: [0, 0, 4.5], fov: 45 }}
                dpr={[1, 2]}
                gl={{ antialias: true, alpha: true }}
            >
                {/* Éclairage de base */}
                <ambientLight intensity={0.4} />

                {/* Environnement HDR - Rosendal Park Sunset */}
                <Environment
                    files="/rosendal_park_sunset_puresky_4k.exr"
                    background={false}
                />

                {/* 
                    Sphère - Couleur basée sur l'harmonie de l'utilisateur
                    - Au repos : couleur = représentation de l'harmonie (rouge=bas, vert=haut)
                    - En spin : couleur = spectre dynamique basé sur vitesse/amplitude
                    - Relâchement : retour progressif vers couleur harmonie
                */}
                <LiquidBlob
                    harmonyScore={number}
                    isDragging={isDragging}
                    onClick={onClick}
                    distort={0.4}
                    speed={2}
                    radius={1.2}
                />

                {/* ArcballControls pour rotation infinie */}
                <ArcballControls
                    makeDefault
                    enableZoom={false}
                    enablePan={false}
                    dampingFactor={0.05}
                    onStart={handleDragStart}
                    onEnd={handleDragEnd}
                />
            </Canvas>
        </div>
    );
}
