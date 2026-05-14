import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Html } from '@react-three/drei';
import * as THREE from 'three';

export default function NPC({ position = [2, 0, 2] }: { position?: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(t) * 0.1 + 1;
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group position={position}>
      <mesh 
        ref={meshRef} 
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[0.8, 1.6, 0.5]} />
        <meshStandardMaterial color={hovered ? "#ff00ff" : "#444444"} />
      </mesh>
      
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        NEURAL_BOT_v1
      </Text>

      {hovered && (
        <Html position={[0, 3, 0]} center>
          <div className="bg-black/80 backdrop-blur-md border border-cyan-500/30 px-2 py-1 rounded text-[10px] text-cyan-400 whitespace-nowrap">
            "Awaiting instructions..."
          </div>
        </Html>
      )}
    </group>
  );
}
