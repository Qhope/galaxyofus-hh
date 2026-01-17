import React, { Suspense, useState, useRef, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { CameraControls, Stars } from '@react-three/drei'
import * as THREE from 'three'
import PhotoCloud from './components/PhotoCloud'
import musicFile from './music/onelife.mp3'

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
    const [playing, setPlaying] = useState(false)
    const [started, setStarted] = useState(false)
    const [isRound, setIsRound] = useState(false) // Shape toggle
    const [fov, setFov] = useState(60)

    const cameraControlsRef = useRef()
    const audioRef = useRef(new Audio(musicFile))
    const analyserRef = useRef(null)
    const audioContextRef = useRef(null)
    const dataArrayRef = useRef(new Uint8Array(128)) // Small buffer for visualization

    // Handle Responsive Camera FOV
    useEffect(() => {
        const handleResize = () => {
            const aspect = window.innerWidth / window.innerHeight
            // If portrait (height > width), increase FOV to fit more
            if (aspect < 1) {
                setFov(85)
            } else {
                setFov(60)
            }
        }
        handleResize()
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    useEffect(() => {
        audioRef.current.loop = true
        audioRef.current.volume = 0.4
        return () => {
            audioRef.current.pause()
        }
    }, [])

    const setupAudioContext = () => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
            analyserRef.current = audioContextRef.current.createAnalyser()
            analyserRef.current.fftSize = 256

            const source = audioContextRef.current.createMediaElementSource(audioRef.current)
            source.connect(analyserRef.current)
            analyserRef.current.connect(audioContextRef.current.destination)
        }
        if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume()
        }
    }

    const handleStart = async () => {
        try {
            await audioRef.current.play()
            setPlaying(true)
            setupAudioContext()
            setStarted(true)
        } catch (e) {
            console.error("Audio play failed", e)
        }
    }

    const toggleMusic = () => {
        if (playing) {
            audioRef.current.pause()
            setPlaying(false)
        } else {
            audioRef.current.play()
            setPlaying(true)
        }
    }

    if (!started) {
        return (
            <div style={{
                width: '100vw',
                height: '100vh',
                background: '#050510',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                zIndex: 9999,
                padding: '20px',
                textAlign: 'center'
            }}>
                <h1 style={{ fontSize: 'min(3em, 10vw)', fontWeight: 300, letterSpacing: '0.2em', marginBottom: '20px' }}>
                    MY LOVE Hoen Hoen
                </h1>
                <p style={{ opacity: 0.7, marginBottom: '40px', fontSize: '1em' }}>Galaxy of Memories</p>
                <button
                    onClick={handleStart}
                    style={{
                        padding: '15px 40px',
                        fontSize: '1.2em',
                        background: 'white',
                        color: 'black',
                        border: 'none',
                        borderRadius: '30px',
                        cursor: 'pointer',
                        letterSpacing: '0.1em',
                        transition: 'transform 0.2s',
                        boxShadow: '0 0 20px rgba(255,255,255,0.3)'
                    }}
                    onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                    onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                >
                    ENTER GALAXY
                </button>
            </div>
        )
    }

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>


            <Canvas camera={{ position: [0, 0, 25], fov: fov }}>
                <color attach="background" args={['#050510']} />

                {/* Ambient environment */}
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />

                <Suspense fallback={null}>
                    <Rig>
                        <PhotoCloud
                            onPhotoClick={setActiveImage}
                            layout={layout}
                            count={count}
                            analyser={analyserRef.current}
                            dataArray={dataArrayRef.current}
                            isRound={isRound}
                        />
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

            {/* Overlay UI - Centered Bottom */}
            <div style={{
                position: 'absolute',
                bottom: 'max(40px, env(safe-area-inset-bottom))',
                left: 0,
                width: '100%',
                textAlign: 'center',
                pointerEvents: 'none',
                color: 'white',
                opacity: activeImage ? 0 : 0.8,
                transition: 'opacity 0.5s',
                zIndex: 5
            }}>
                <h1 style={{ margin: 0, fontSize: 'min(2em, 6vw)', fontWeight: 300, letterSpacing: '0.2em' }}>
                    MY LOVE Hoen Hoen
                </h1>
                <p style={{ margin: '10px 0 0', fontSize: '0.9em', opacity: 0.6 }}>
                    Galaxy of Memories
                </p>
            </div>

            {/* Controls Container - Top Left with Safe Area */}
            <div style={{
                position: 'absolute',
                top: 'max(20px, env(safe-area-inset-top))',
                left: 'max(20px, env(safe-area-inset-left))',
                right: 'max(20px, env(safe-area-inset-right))',
                display: 'flex',
                flexDirection: 'column',
                gap: '15px',
                zIndex: 20,
                pointerEvents: 'none'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                    {/* Music Button */}
                    <button
                        onClick={toggleMusic}
                        style={{
                            pointerEvents: 'auto',
                            background: 'transparent',
                            border: '1px solid white',
                            borderRadius: '20px',
                            color: 'white',
                            padding: '8px 16px',
                            cursor: 'pointer',
                            fontSize: '0.75em',
                            backdropFilter: 'blur(5px)',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {playing ? '🎵 PAUSE' : '🔇 PLAY'}
                    </button>

                    {/* Secondary Controls (Shape) */}
                    <button
                        onClick={() => setIsRound(!isRound)}
                        style={{
                            pointerEvents: 'auto',
                            background: isRound ? 'white' : 'rgba(255,255,255,0.2)',
                            color: isRound ? 'black' : 'white',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            fontSize: '0.75em',
                            fontWeight: 600,
                            backdropFilter: 'blur(5px)',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {isRound ? '⚪ ROUND' : '⬜ SQUARE'}
                    </button>
                </div>

                {/* Layout Switcher - Horizontal Scroll on Mobile */}
                <div style={{
                    display: 'flex',
                    gap: '8px',
                    overflowX: 'auto',
                    paddingBottom: '5px',
                    pointerEvents: 'auto',
                    scrollbarWidth: 'none', // Firefox
                    msOverflowStyle: 'none' // IE/Edge
                }}>
                    <style>{`
                        div::-webkit-scrollbar { display: none; }
                    `}</style>
                    {['sphere', 'helix', 'random', 'heart', 'donut', 'wave'].map((mode) => (
                        <button
                            key={mode}
                            onClick={() => setLayout(mode)}
                            style={{
                                background: layout === mode ? 'white' : 'rgba(255,255,255,0.2)',
                                color: layout === mode ? 'black' : 'white',
                                border: 'none',
                                padding: '8px 14px',
                                borderRadius: '20px',
                                cursor: 'pointer',
                                textTransform: 'uppercase',
                                fontSize: '0.7em',
                                fontWeight: 700,
                                backdropFilter: 'blur(5px)',
                                transition: 'all 0.3s',
                                flexShrink: 0
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
                    backdropFilter: 'blur(5px)',
                    pointerEvents: 'auto',
                    width: 'fit-content'
                }}>
                    <span style={{ fontSize: '0.7em', fontWeight: 600, whiteSpace: 'nowrap' }}>LVL: {count}</span>
                    <input
                        type="range"
                        min="50"
                        max="1000"
                        step="50"
                        value={count}
                        onChange={(e) => setCount(parseInt(e.target.value))}
                        style={{ cursor: 'pointer', width: '100px' }}
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
                        backgroundColor: 'rgba(0,0,0,0.95)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 100,
                        cursor: 'default',
                        padding: '20px'
                    }}
                    onClick={() => setActiveImage(null)}
                >
                    <div style={{ position: 'relative', display: 'inline-block', maxWidth: '90vw', maxHeight: '85vh' }}>
                        <button
                            style={{
                                position: 'absolute',
                                top: 10,
                                right: 10,
                                background: 'rgba(0,0,0,0.5)',
                                border: '1px solid rgba(255,255,255,0.5)',
                                borderRadius: '50%',
                                width: '32px',
                                height: '32px',
                                color: 'white',
                                fontSize: '16px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 110,
                                backdropFilter: 'blur(5px)',
                                transition: 'background 0.2s'
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
                                maxHeight: '85vh',
                                maxWidth: '90vw',
                                boxShadow: '0 0 50px rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                objectFit: 'contain',
                                display: 'block'
                            }}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

export default App
