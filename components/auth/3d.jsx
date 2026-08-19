'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Sparkles } from '@react-three/drei'
import { useRef } from 'react'
function Orb({position, color,scale = 1,speed = 1 }){
    let mesh = useRef(null)
    useFrame((state) => {
        mesh.current.rotation.x = state.clock.elapsedTime * 0.1 * speed
        mesh.current.rotation.y = state.clock.elapsedTime * 0.15 * speed
      })
      return (
        <Float speed={speed} rotationIntensity={0.4} floatIntensity={1.2}>
          <mesh ref={mesh} position={position} scale={scale}>
            <icosahedronGeometry args={[1, 4]} />
            <MeshDistortMaterial
              color={color}
              distort={0.35}
              speed={1.5}
              roughness={0.15}
              metalness={0.6}
            />
          </mesh>
        </Float>
      )
    }
    
    // scrollProgress (0 to 1) comes from the layout and slowly rotates
    // the whole group as the user scrolls — that's your "scroll animation".
    export default function Scene3D({ scrollProgress = 0 }) {
      return (
        <Canvas camera={{ position: [0, 0, 6], fov: 45 }} dpr={[1, 1.5]}>
          <ambientLight intensity={0.4} />
          <pointLight position={[5, 5, 5]} intensity={1.2} color="#7C5CFC" />
          <pointLight position={[-5, -3, -2]} intensity={0.8} color="#3ED9C4" />
    
          <group rotation={[0, scrollProgress * 0.6, 0]}>
            <Orb position={[-1.4, 0.6, 0]} color="#7C5CFC" scale={1.1} speed={1} />
            <Orb position={[1.6, -0.4, -1]} color="#3ED9C4" scale={0.8} speed={1.4} />
            <Orb position={[0.2, 1.4, -2]} color="#5C6BFC" scale={0.5} speed={0.8} />
          </group>
    
          <Sparkles count={60} scale={6} size={2} speed={0.3} color="#8890A6" />
        </Canvas>
      )
    
}