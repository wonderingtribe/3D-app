import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Environment, 
  Float, 
  Grid,
  Text,
  ContactShadows,
  Center
} from '@react-three/drei';
import { useWorkspace } from '../WorkspaceContext';

export default function SpatialView() {
  const { entities, config } = useWorkspace();
  const isBrutalist = config.theme === 'brutalist';

  return (
    <div className="flex-1 relative bg-ui-bg">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[10, 10, 10]} />
        <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 1.75} />
        
        {/* Environment & Lighting */}
        <Suspense fallback={null}>
          <Environment preset={config.skybox as any} />
        </Suspense>
        
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} castShadow />

        {/* Render Entities from Workspace Context */}
        {entities.map((ent) => {
          // Map 2D Canvas coordinates to 3D roughly
          // ent.x -> 3D X
          // ent.y -> 3D Z
          // ent.z -> 3D Y (Height)
          const pos: [number, number, number] = [
            (ent.x - 200) / 20, 
            ent.z || (ent.type === 'mesh' ? 1 : 4), 
            (ent.y - 200) / 20
          ];

          const scale = ent.scale || 1;
          const rotation: [number, number, number] = [0, (ent.rotation || 0) * (Math.PI / 180), 0];

          if (ent.type === 'light') {
            return (
              <pointLight 
                key={ent.id} 
                position={pos} 
                intensity={ent.properties?.intensity || 1} 
                color={ent.properties?.color || "#ffffff"} 
              />
            );
          }

          return (
            <Float key={ent.id} speed={1} rotationIntensity={0.2} floatIntensity={0.2} position={pos} rotation={rotation}>
              <mesh scale={[scale, scale, scale]}>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial 
                  color={ent.properties?.color || (isBrutalist ? "#ffde00" : "#06b6d4")} 
                  metalness={0.5}
                  roughness={0.2}
                />
              </mesh>
            </Float>
          );
        })}

        {/* Scene Floor / Reference */}
        <Grid 
          infiniteGrid 
          fadeDistance={50} 
          fadeStrength={5} 
          cellSize={1} 
          sectionSize={5} 
          sectionColor={isBrutalist ? "#ffde00" : "#06b6d4"} 
          sectionThickness={1.5}
        />
        
        <ContactShadows 
          opacity={0.4} 
          scale={20} 
          blur={2.4} 
          far={4.5} 
          color="#000000" 
        />

        <Center top position={[0, 0, 0]}>
          <Text
            font="/inter-bold.woff" // Ideally a valid font path or default
            fontSize={0.5}
            color={isBrutalist ? "#ffde00" : "#06b6d4"}
            maxWidth={200}
            lineHeight={1}
            letterSpacing={0.02}
            textAlign="center"
          >
            {config.engine === 'unreal' ? "UNREAL_PIXEL_STREAM_ACTIVE" : "SPATIAL_SYNC_ACTIVE"}
          </Text>
        </Center>
      </Canvas>

      {/* Overlay Stats */}
      <div className="absolute top-4 left-4 p-4 bg-ui-panel/80 border border-ui-border rounded-xl backdrop-blur-md">
        <div className="text-[10px] font-bold text-ui-text uppercase tracking-widest mb-2 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Engine: {config.engine.toUpperCase()}
        </div>
        <div className="space-y-1">
          <div className="flex justify-between gap-8">
            <span className="text-[8px] text-ui-text-muted uppercase">Entities</span>
            <span className="text-[9px] font-mono text-ui-accent">{entities.length}</span>
          </div>
          <div className="flex justify-between gap-8">
            <span className="text-[8px] text-ui-text-muted uppercase">Draw Calls</span>
            <span className="text-[9px] font-mono text-ui-accent">~{entities.length * 2}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
