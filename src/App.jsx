import React, { Suspense, useState, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { CameraControls, Stars } from '@react-three/drei'
import * as THREE from 'three'
import PhotoCloud from './components/PhotoCloud'

function Rig({ children }) {
    const ref = useRef()
    useFrame((state) => {
        if (ref.current) {
            // Gentle parallax rotation based on mouse position
            // state.pointer.x/y are normalized coordinates (-1 to 1)
            ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, (state.pointer.x * Math.PI) / 20, 0.05)
            ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, (state.pointer.y * Math.PI) / 20, 0.05)
        }
    })
    return <group ref={ref}>{children}</group>
}

function App() {
    const [activeImage, setActiveImage] = useState(null)
    const [layout, setLayout] = useState('sphere')
    const [count, setCount] = useState(400)
    const cameraControlsRef = useRef()

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <Canvas camera={{ position: [0, 0, 25], fov: 60 }}>
                <color attach="background" args={['#050510']} />

                {/* Ambient environment */}
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />

                <Suspense fallback={null}>
                    <Rig>
                        <PhotoCloud onPhotoClick={setActiveImage} layout={layout} count={count} />
                    </Rig>
                </Suspense>

                <CameraControls
                    ref={cameraControlsRef}
                    dollyToCursor={true}
                    minDistance={5}
                    maxDistance={60}
                    enabled={!activeImage} // Disable controls when modal is open
                />
            </Canvas>

            {/* Overlay UI */}
            <div style={{
                position: 'absolute',
                bottom: 40,
                left: 0,
                width: '100%',
                textAlign: 'center',
                pointerEvents: 'none',
                color: 'white',
                opacity: activeImage ? 0 : 0.8, // Hide text when viewing
                transition: 'opacity 0.5s'
            }}>
                <h1 style={{ margin: 0, fontSize: '2em', fontWeight: 300, letterSpacing: '0.2em' }}>
                    MY LOVE
                </h1>
                <p style={{ margin: '10px 0 0', fontSize: '0.9em', opacity: 0.6 }}>
                    Galaxy of Memories
                </p>
            </div>

            {/* Controls Container */}
            <div style={{
                position: 'absolute',
                top: 20,
                left: 20,
                display: 'flex',
                flexDirection: 'column',
                gap: '15px',
                zIndex: 5
            }}>
                {/* Layout Switcher */}
                <div style={{ display: 'flex', gap: '10px' }}>
                    {['sphere', 'helix', 'random', 'heart', 'donut'].map((mode) => (
                        <button
                            key={mode}
                            onClick={() => setLayout(mode)}
                            style={{
                                background: layout === mode ? 'white' : 'rgba(255,255,255,0.2)',
                                color: layout === mode ? 'black' : 'white',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '20px',
                                cursor: 'pointer',
                                textTransform: 'uppercase',
                                fontSize: '0.8em',
                                fontWeight: 600,
                                backdropFilter: 'blur(5px)',
                                transition: 'all 0.3s'
                            }}
                        >
                            {mode}
                        </button>
                    ))}
                </div>

                {/* Count Slider */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    color: 'white',
                    background: 'rgba(0,0,0,0.5)',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    backdropFilter: 'blur(5px)'
                }}>
                    <span style={{ fontSize: '0.8em', fontWeight: 600 }}>MEMORIES: {count}</span>
                    <input
                        type="range"
                        min="50"
                        max="1000"
                        step="50"
                        value={count}
                        onChange={(e) => setCount(parseInt(e.target.value))}
                        style={{ cursor: 'pointer' }}
                    />
                </div>
            </div>

            {/* Active Image Overlay */}
            {activeImage && (
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0,0,0,0.9)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10,
                        cursor: 'default' // Default cursor for backdrop
                    }}
                    onClick={() => setActiveImage(null)}
                >
                    {/* Close Button defined inside overlay for clarity */}
                    <button
                        style={{
                            position: 'absolute',
                            top: 30,
                            right: 30,
                            background: 'transparent',
                            border: '2px solid white',
                            borderRadius: '50%',
                            width: '40px',
                            height: '40px',
                            color: 'white',
                            fontSize: '20px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 11
                        }}
                        onClick={(e) => {
                            e.stopPropagation()
                            setActiveImage(null)
                        }}
                    >
                        ✕
                    </button>

                    <img
                        src={activeImage}
                        alt="Memory"
                        style={{
                            maxHeight: '90vh',
                            maxWidth: '90vw',
                            boxShadow: '0 0 50px rgba(255,255,255,0.2)',
                            borderRadius: '8px',
                            cursor: 'auto' // Prevent verifying click through on image
                        }}
                        onClick={(e) => e.stopPropagation()} // Prevent close when clicking image itself
                    />
                </div>
            )}
        </div>
    )
}

export default App
