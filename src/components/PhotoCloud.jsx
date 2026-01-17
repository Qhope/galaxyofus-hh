import React, { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import PhotoCard from './PhotoCard'
import * as THREE from 'three'

// --- Layout Algorithms ---
const layouts = {
    sphere: (count, radius) => {
        const points = []
        const phi = Math.PI * (3 - Math.sqrt(5))
        for (let i = 0; i < count; i++) {
            const y = 1 - (i / (count - 1)) * 2
            const radiusAtY = Math.sqrt(1 - y * y)
            const theta = phi * i
            points.push(new THREE.Vector3(
                Math.cos(theta) * radiusAtY * radius,
                y * radius,
                Math.sin(theta) * radiusAtY * radius
            ))
        }
        return points
    },

    helix: (count, radius) => {
        const points = []
        for (let i = 0; i < count; i++) {
            const theta = i * 0.2 // Spacing of spiral
            const y = - (i * 0.1) + (count * 0.05) // Vertical spread
            const x = Math.cos(theta) * radius
            const z = Math.sin(theta) * radius
            points.push(new THREE.Vector3(x, y, z))
        }
        return points
    },

    random: (count, radius) => {
        const points = []
        for (let i = 0; i < count; i++) {
            const v = new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2
            ).normalize().multiplyScalar(radius * (0.5 + Math.random() * 0.5))
            points.push(v)
        }
        return points
    },

    heart: (count, radius) => {
        const points = []
        let i = 0
        // Rejection sampling for true 3D volume heart
        // Inequality: (x^2 + 9y^2/4 + z^2 - 1)^3 - x^2z^3 - 9y^2z^3/80 < 0
        while (i < count) {
            const x = (Math.random() - 0.5) * 3
            const y = (Math.random() - 0.5) * 3
            const z = (Math.random() - 0.5) * 3

            const a = x * x + (9 / 4) * y * y + z * z - 1
            const term2 = x * x * z * z * z
            const term3 = (9 / 80) * y * y * z * z * z

            if (a * a * a - term2 - term3 < 0) {
                // Success, point is inside heart
                // Rotate -90deg around X to make it upright
                const v = new THREE.Vector3(x, z, -y).multiplyScalar(radius * 0.8)
                points.push(v)
                i++
            }
        }
        return points
    },

    donut: (count, radius) => {
        const points = []
        const tubeRadius = radius * 0.3
        const ringRadius = radius * 0.8
        for (let i = 0; i < count; i++) {
            // Uniform distribution on torus surface
            const u = Math.random() * Math.PI * 2 // Tube angle
            const v = Math.random() * Math.PI * 2 // Ring angle

            // Torus parametric equation
            const x = (ringRadius + tubeRadius * Math.cos(v)) * Math.cos(u)
            const z = (ringRadius + tubeRadius * Math.cos(v)) * Math.sin(u)
            const y = tubeRadius * Math.sin(v)

            points.push(new THREE.Vector3(x, y, z))
        }
        return points
    },

    wave: (count, radius) => {
        // Ring/Cylinder layout for equalizer
        const points = []
        for (let i = 0; i < count; i++) {
            const theta = (i / count) * Math.PI * 2 // Full circle
            const r = radius * 1.2 // slightly wider
            const x = Math.cos(theta) * r
            const z = Math.sin(theta) * r
            const y = 0 // Base Y, will be offset by music

            points.push(new THREE.Vector3(x, y, z))
        }
        return points
    }
}

export default function PhotoCloud({ onPhotoClick, layout = 'sphere', count = 200, analyser, dataArray, isRound }) {
    // 1. Import all images
    const imagesGlob = import.meta.glob('../assets/*.jpg', { eager: true })
    const originalImageUrls = Object.values(imagesGlob).map(mod => mod.default)

    // 2. Repeat images to fill 'count' spots
    const imageUrls = useMemo(() => {
        if (originalImageUrls.length === 0) return []
        const repeated = []
        for (let i = 0; i < count; i++) {
            repeated.push(originalImageUrls[i % originalImageUrls.length])
        }
        return repeated
    }, [originalImageUrls, count])

    // 3. Compute positions based on layout prop
    const radius = 12 // Increased radius for more items
    const positions = useMemo(() => {
        const algo = layouts[layout] || layouts.sphere
        return algo(imageUrls.length, radius)
    }, [imageUrls.length, layout])

    // 4. Update audio data every frame
    useFrame(() => {
        if (analyser && dataArray) {
            analyser.getByteFrequencyData(dataArray)
        }
    })

    return (
        <group>
            {imageUrls.map((url, i) => (
                <PhotoCard
                    key={i}
                    url={url}
                    position={positions[i]}
                    onClick={onPhotoClick}
                    // Audio props
                    layout={layout}
                    audioData={dataArray}
                    audioIndex={i}
                    isRound={isRound}
                />
            ))}
        </group>
    )
}
