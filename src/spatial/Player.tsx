import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { PointerLockControls, useKeyboardControls } from '@react-three/drei';
import * as THREE from 'three';

const SPEED = 5;

export default function Player() {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [, getKeys] = useKeyboardControls();
  
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());

  useFrame((state) => {
    const { forward, backward, left, right, jump } = getKeys();
    
    // Front/back movement
    direction.current.z = Number(backward) - Number(forward);
    // Side movement
    direction.current.x = Number(right) - Number(left);
    direction.current.normalize();

    // Update velocity
    velocity.current.z = direction.current.z * SPEED;
    velocity.current.x = direction.current.x * SPEED;

    // Apply movement
    if (meshRef.current) {
       // Since it's a first person view, we usually move the camera
       // But for this visualization, we move the capsule
       meshRef.current.position.x += velocity.current.x * state.clock.getDelta();
       meshRef.current.position.z += velocity.current.z * state.clock.getDelta();
       
       // Update camera to follow player (First Person style)
       state.camera.position.set(
         meshRef.current.position.x,
         meshRef.current.position.y + 1, // eye level
         meshRef.current.position.z
       );
    }
  });
  
  return (
    <>
      <PointerLockControls />
      <mesh ref={meshRef} position={[0, 1, 0]}>
        <capsuleGeometry args={[0.5, 1, 4, 8]} />
        <meshStandardMaterial color="#06b6d4" />
      </mesh>
    </>
  );
}
