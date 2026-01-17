import React, { useMemo } from 'react'
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
    }
}

export default function PhotoCloud({ onPhotoClick, layout = 'sphere' }) {
    // 1. Import all images
    const imagesGlob = import.meta.glob('../assets/*.jpg', { eager: true })
    const originalImageUrls = Object.values(imagesGlob).map(mod => mod.default)

    // 2. Repeat images to fill ~200 spots
    const targetCount = 200
    const imageUrls = useMemo(() => {
        if (originalImageUrls.length === 0) return []
        const repeated = []
        for (let i = 0; i < targetCount; i++) {
            repeated.push(originalImageUrls[i % originalImageUrls.length])
        }
        return repeated
    }, [originalImageUrls])

    // 3. Compute positions based on layout prop
    const radius = 12 // Increased radius for more items
    const positions = useMemo(() => {
        const algo = layouts[layout] || layouts.sphere
        return algo(imageUrls.length, radius)
    }, [imageUrls.length, layout])

    return (
        <group>
            {imageUrls.map((url, i) => (
                <PhotoCard
                    key={i}
                    url={url}
                    position={positions[i]}
                    onClick={onPhotoClick}
                />
            ))}
        </group>
    )
}
