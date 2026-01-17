import React, { useRef, useState, useMemo } from 'react'
import { Image, useTexture, Billboard } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function PhotoCard({ url, position, onClick, layout, audioData, audioIndex, isRound }) {
    const ref = useRef()
    const [hovered, setHover] = useState(false)

    // Call useTexture at the top level, always. 
    // This follows the "Rules of Hooks".
    const texture = useTexture(url)

    useFrame((state, delta) => {
        if (!ref.current) return

        let audioY = 0
        let audioScale = 0

        // Handle Audio Reaction (Wave Mode)
        if (layout === 'wave' && audioData && audioData.length > 0) {
            const dataIdx = audioIndex % audioData.length
            const value = audioData[dataIdx] || 0
            const intensity = value / 255

            audioY = intensity * 15
            audioScale = intensity * 0.5
        }

        // Apply Position (Relative to the parent Group which is already at 'position')

        // Always reset X/Z to 0 local (center of group)
        ref.current.position.x = 0
        ref.current.position.z = 0

        if (layout === 'wave') {
            // For Wave, just jump up
            ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, audioY, 0.1)
        } else {
            // For others, gentle float around local 0
            // Use position.x as a random seed for the sine wave phase so they don't sync
            ref.current.position.y = Math.sin(state.clock.elapsedTime + position.x) * 0.1
        }

        // Scale animation
        const targetScale = (hovered ? 1.5 : 1) + audioScale
        ref.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 10)
    })

    return (
        <group position={position}>
            <Billboard>
                <group ref={ref}
                    onClick={(e) => {
                        e.stopPropagation()
                        onClick(url)
                    }}
                    onPointerOver={() => {
                        setHover(true)
                        document.body.style.cursor = 'pointer'
                    }}
                    onPointerOut={() => {
                        setHover(false)
                        document.body.style.cursor = 'auto'
                    }}
                >
                    {isRound ? (
                        <mesh>
                            <circleGeometry args={[0.7, 32]} />
                            <meshBasicMaterial map={texture} side={THREE.DoubleSide} transparent />
                        </mesh>
                    ) : (
                        <Image
                            url={url}
                            transparent
                            side={THREE.DoubleSide}
                            scale={[1.6, 1.2]}
                        />
                    )}
                </group>
            </Billboard>
        </group>
    )
}
