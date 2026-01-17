import React, { useRef, useState } from 'react'
import { Image, Billboard } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function PhotoCard({ url, position, onClick }) {
    const ref = useRef()
    const [hovered, setHover] = useState(false)

    // Smoothly animate hover scale
    useFrame((state, delta) => {
        // Basic gentle floating
        if (ref.current) {
            ref.current.position.y += Math.sin(state.clock.elapsedTime + position.x) * 0.002
        }

        // Scale animation
        const targetScale = hovered ? 1.5 : 1
        if (ref.current) {
            ref.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 10)
        }
    })

    return (
        <group position={position}>
            <Billboard
                follow={true}
                lockX={false}
                lockY={false}
                lockZ={false} // Lock Z rotation to prevent spinning when camera moves directly over
            >
                <Image
                    ref={ref}
                    url={url}
                    transparent
                    scale={[1.6, 1.2]} // 4:3 aspect ratio approx
                    opacity={0.9}
                    onPointerOver={(e) => {
                        e.stopPropagation()
                        setHover(true)
                        document.body.style.cursor = 'pointer'
                    }}
                    onPointerOut={() => {
                        setHover(false)
                        document.body.style.cursor = 'auto'
                    }}
                    onClick={(e) => {
                        e.stopPropagation()
                        onClick(url)
                    }}
                />
            </Billboard>
        </group>
    )
}
