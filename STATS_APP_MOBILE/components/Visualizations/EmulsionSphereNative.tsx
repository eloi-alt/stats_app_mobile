import React, { useRef, useState, useMemo, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { Canvas, useFrame, useThree, ThreeElements } from '@react-three/fiber/native';
import {
    MeshDistortMaterial,
    ArcballControls,
    Environment,
} from '@react-three/drei/native';
import * as THREE from 'three';

// -----------------------------------------------------------------------------
// 1. Interfaces & Props
// -----------------------------------------------------------------------------

type LiquidBlobProps = ThreeElements['mesh'] & {
    harmonyScore: number;
    isDragging: boolean;
    onClick?: () => void;
    distort?: number;
    speed?: number;
    radius?: number;
    roughness?: number;
}

// -----------------------------------------------------------------------------
// 2. Color Utility (Harmony)
// -----------------------------------------------------------------------------

function getHarmonyColor(score: number): THREE.Color {
    const s = Math.min(Math.max(score, 0), 100) / 100;
    const harmonyPalette = [
        new THREE.Color('#ff1744'), // 0%
        new THREE.Color('#ff6d00'), // 25%
        new THREE.Color('#ffea00'), // 50%
        new THREE.Color('#76ff03'), // 75%
        new THREE.Color('#1de9b6'), // 100%
    ];

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
// 3. Mesh Component (Liquid Object)
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
    const materialRef = useRef<any>(null);
    const pointerDownPos = useRef<{ x: number; y: number } | null>(null);
    const { camera } = useThree();

    const geometryArgs = useMemo<[number, number, number]>(() => [radius, 64, 64], [radius]);
    const harmonyColor = useMemo(() => getHarmonyColor(harmonyScore), [harmonyScore]);

    const prevCameraQuat = useRef(new THREE.Quaternion());
    const rotationalEnergy = useRef(0);
    const accumulatedRotation = useRef(0);

    const spinPalette = useMemo(() => [
        new THREE.Color('#ff0055'),
        new THREE.Color('#ff6600'),
        new THREE.Color('#ffcc00'),
        new THREE.Color('#00ff88'),
        new THREE.Color('#00ccff'),
        new THREE.Color('#6600ff'),
        new THREE.Color('#ff00aa'),
    ], []);

    useFrame((state, delta) => {
        if (!meshRef.current || !materialRef.current) return;

        // 1. Calculate camera rotation change
        const currentCameraQuat = camera.quaternion.clone();
        const angleChanged = prevCameraQuat.current.angleTo(currentCameraQuat);
        prevCameraQuat.current.copy(currentCameraQuat);

        accumulatedRotation.current += angleChanged;

        // 2. Calculate rotational energy
        if (isDragging && angleChanged > 0.001) {
            rotationalEnergy.current = Math.min(rotationalEnergy.current + angleChanged * 20, 1);
        }

        // 3. Energy decay
        const decayRate = isDragging ? 0.3 : 2.5;
        // Using MathUtils.lerp instead of simple lerp for float
        rotationalEnergy.current = THREE.MathUtils.lerp(rotationalEnergy.current, 0, delta * decayRate);

        const energyIntensity = Math.min(Math.max(rotationalEnergy.current, 0), 1);

        // 4. Determine target color
        let targetColor: THREE.Color;

        if (energyIntensity > 0.01) {
            const hueCycleSpeed = 0.3;
            const hueCycle = (accumulatedRotation.current * hueCycleSpeed) % 1.0;

            const paletteIndex = hueCycle * spinPalette.length;
            const index1 = Math.floor(paletteIndex) % spinPalette.length;
            const index2 = (index1 + 1) % spinPalette.length;
            const blendFactor = paletteIndex - Math.floor(paletteIndex);

            const spinColor = new THREE.Color().copy(spinPalette[index1]);
            spinColor.lerp(spinPalette[index2], blendFactor);

            const hsl = { h: 0, s: 0, l: 0 };
            spinColor.getHSL(hsl);
            const saturationBoost = 0.8 + (energyIntensity * 0.2);
            const lightnessBoost = 0.45 + (energyIntensity * 0.25);
            spinColor.setHSL(hsl.h, saturationBoost, lightnessBoost);

            targetColor = new THREE.Color().copy(harmonyColor);
            targetColor.lerp(spinColor, energyIntensity);
        } else {
            targetColor = harmonyColor.clone();
        }

        // 5. Apply color using lerp (replacing easing.dampC)
        // Damping factor 0.15 * delta * 60 (approx frame rate) for similar feel or just standard lerp
        // Standard lerp frame-independent: a = lerp(a, b, 1 - exp(-lambda * dt))
        // Using basic lerp for simplicity and robustness without maath
        materialRef.current.color.lerp(targetColor, 0.1);

        // Auto rotation
        if (!isDragging) {
            meshRef.current.rotation.y += delta * 0.08;
        }
    });

    const handlePointerDown = useCallback((e: any) => {
        // e.point is 3D vector, but we want screen coords for drag check? 
        // R3F on native: e as ThreeEvent has clientX/Y but mapped. 
        // We really just want to detect clicks vs drags.
        // On native, Arcball handles the drag. 
        // We'll use a simple timestamp or position check if provided.
        // e.nativeEvent is the NativeSyntheticEvent
        pointerDownPos.current = { x: e.nativeEvent?.locationX || 0, y: e.nativeEvent?.locationY || 0 };
    }, []);

    const handlePointerUp = useCallback((e: any) => {
        if (pointerDownPos.current) {
            // Rough distance check
            const x = e.nativeEvent?.locationX || 0;
            const y = e.nativeEvent?.locationY || 0;
            const dx = x - pointerDownPos.current.x;
            const dy = y - pointerDownPos.current.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Tolerance for "tap"
            if (distance < 10 && onClick) {
                onClick();
            }
            pointerDownPos.current = null;
        }
    }, [onClick]);

    return (
        <mesh
            ref={meshRef}
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
                envMapIntensity={1.8}
            />
        </mesh>
    );
};

// -----------------------------------------------------------------------------
// 4. Main Component (Container)
// -----------------------------------------------------------------------------

interface EmulsionSphereNativeProps {
    number: number;
    onClick?: () => void;
}

export default function EmulsionSphereNative({ number, onClick }: EmulsionSphereNativeProps) {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragStart = useCallback(() => setIsDragging(true), []);
    const handleDragEnd = useCallback(() => setIsDragging(false), []);

    return (
        <View style={styles.container}>
            <Canvas
                camera={{ position: [0, 0, 4.5], fov: 45 }}
                gl={{ antialias: true, alpha: true }}
            // On mobile, events are automatically handled by R3F/native
            >
                <ambientLight intensity={0.4} />

                <Environment preset="sunset" background={false} />

                <LiquidBlob
                    harmonyScore={number}
                    isDragging={isDragging}
                    onClick={onClick}
                    distort={0.4}
                    speed={2}
                    radius={1.2}
                />

                <ArcballControls
                    makeDefault
                    enableZoom={false}
                    enablePan={false}
                    dampingFactor={0.05}
                    onStart={handleDragStart}
                    onEnd={handleDragEnd}
                />
            </Canvas>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 300,
        // zIndex or positioning can be handled by parent
    },
});
