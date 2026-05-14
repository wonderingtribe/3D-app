import React, { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Float, MeshDistortMaterial, Grid, Environment, KeyboardControls } from '@react-three/drei';
import * as THREE from 'three';
import { Box, Cuboid as Cube, Cpu, Zap, Box as BoxIcon, User, Bot, Map, Palette } from 'lucide-react';
import Player from '../spatial/Player';
import NPC from '../spatial/NPC';
import { useWorkspace } from '../WorkspaceContext';
import WebView from './WebView';

function Scene() {
  const meshRef = useRef<THREE.Mesh>(null!);
  const { config } = useWorkspace();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.005;
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#00ffff" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff00ff" />
      
      <Player />

      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <mesh ref={meshRef} position={[0, 2, -5]}>
          <boxGeometry args={[2, 2, 2]} />
          <MeshDistortMaterial color="#06b6d4" speed={2} distort={0.4} radius={1} />
        </mesh>
      </Float>

      <NPC position={[3, 0, 3]} />
      <NPC position={[-3, 0, -5]} />
      
      {config.features.grid && (
        <Grid
          infiniteGrid
          fadeDistance={40}
          fadeStrength={5}
          cellSize={1}
          sectionSize={5}
          sectionColor="#06b6d4"
          cellColor="#313131"
          position={[0, -0.01, 0]}
        />
      )}
      
      {config.features.gizmos && <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />}
      <Environment preset={config.skybox as any} />
      <OrbitControls makeDefault />
    </>
  );
}

export default function SpatialView() {
  const { config, updateConfig, targetUrl } = useWorkspace();
  const map = useMemo(() => [
    { name: "forward", keys: ["ArrowUp", "w", "W"] },
    { name: "backward", keys: ["ArrowDown", "s", "S"] },
    { name: "left", keys: ["ArrowLeft", "a", "A"] },
    { name: "right", keys: ["ArrowRight", "d", "D"] },
    { name: "jump", keys: ["Space"] },
  ], []);

  return (
    <div className="h-full w-full relative group">
      {((config.engine !== 'three' && config.customEngineUrl) || config.localDev) ? (
        <div className="h-full w-full bg-black flex flex-col">
          <div className="h-8 bg-black/80 border-b border-white/10 flex items-center px-4 justify-between">
            <span className="text-[9px] text-cyan-500 font-mono">
              {config.localDev ? 'SOURCE_PIPELINE::ACTIVE' : `SANDBOX_MODE::${config.engine.toUpperCase()}`}
            </span>
            <div className="flex gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
               <span className="text-[9px] text-white/40 uppercase">
                 {config.localDev ? 'Previewing Local Build' : 'External Core Active'}
               </span>
            </div>
          </div>
          <iframe 
            src={config.localDev ? '/preview/local-workspace/index.html' : config.customEngineUrl} 
            className="flex-1 w-full border-none"
            key={config.localDev ? 'local' : 'remote'}
            title="Custom 3D Engine"
            allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
          />
        </div>
      ) : (
        <>
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
         <button className="p-2 bg-black/40 backdrop-blur-md rounded-lg border border-white/10 text-cyan-400 hover:bg-white/10 transition-all group/btn relative">
            <BoxIcon className="w-5 h-5" />
            <span className="absolute left-full ml-2 px-2 py-1 bg-black/80 rounded text-[10px] text-white opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap">Assets</span>
         </button>
         <button className="p-2 bg-black/40 backdrop-blur-md rounded-lg border border-white/10 text-white/40 hover:text-cyan-400 hover:bg-white/10 transition-all group/btn relative">
            <User className="w-5 h-5" />
            <span className="absolute left-full ml-2 px-2 py-1 bg-black/80 rounded text-[10px] text-white opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap">Player Control</span>
         </button>
         <button className="p-2 bg-black/40 backdrop-blur-md rounded-lg border border-white/10 text-white/40 hover:text-cyan-400 hover:bg-white/10 transition-all group/btn relative">
            <Bot className="w-5 h-5" />
            <span className="absolute left-full ml-2 px-2 py-1 bg-black/80 rounded text-[10px] text-white opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap">NPC Entities</span>
         </button>
         <button className="p-2 bg-black/40 backdrop-blur-md rounded-lg border border-white/10 text-white/40 hover:text-cyan-400 hover:bg-white/10 transition-all group/btn relative">
            <Map className="w-5 h-5" />
            <span className="absolute left-full ml-2 px-2 py-1 bg-black/80 rounded text-[10px] text-white opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap">World Map</span>
         </button>
      </div>

      <div className="absolute top-4 left-20 z-10 flex gap-2">
         <select 
           value={config.skybox} 
           onChange={(e) => updateConfig({ skybox: e.target.value as any })}
           className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg px-3 py-1.5 text-[10px] text-cyan-400 font-bold outline-none cursor-pointer hover:bg-white/5 transition-colors"
         >
           <option value="city">CITY_DUSK</option>
           <option value="night">DEEP_NIGHT</option>
           <option value="apartment">INTERIOR</option>
           <option value="forest">FOREST_BIOME</option>
           <option value="dawn">DAWN_BREAK</option>
           <option value="sunset">SYNTH_SUNSET</option>
           <option value="warehouse">IND_WAREHOUSE</option>
         </select>
      </div>

      <div className="absolute bottom-20 right-4 z-20 flex flex-col gap-2">
         <button 
           onClick={() => { /* This would trigger an AI task in a real scenario */ }}
           className="px-4 py-2 bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-400 border border-cyan-500/30 rounded-full text-xs font-bold backdrop-blur-md transition-all shadow-[0_0_20px_rgba(6,182,212,0.2)]"
         >
           AI: GENERATE ASSET
         </button>
      </div>

      <div className="absolute top-4 right-4 z-10 bg-black/40 backdrop-blur-md p-3 rounded-xl border border-white/10 flex flex-col gap-1 w-48">
         <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter mb-2">Metrics</h3>
         <Metric label="GPU" value="24%" color="bg-cyan-500" />
         <Metric label="MEM" value="1.2GB" color="bg-purple-500" />
         <Metric label="FPS" value="60" color="bg-green-500" />
      </div>

      <KeyboardControls map={map}>
        <Canvas shadows camera={{ position: [0, 5, 10], fov: 75 }}>
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </Canvas>
      </KeyboardControls>
      </>
      )}

      <div className="absolute bottom-4 left-4 z-10 text-[10px] text-gray-600 font-mono">
         SPATIAL_ENGINE::v.0.1.0_BETA
      </div>
    </div>
  );
}

function Metric({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <div className="flex items-center justify-between text-[10px]">
       <span className="text-gray-400">{label}</span>
       <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden mx-2">
          <div className={cn("h-full rounded-full transition-all duration-1000", color)} style={{ width: value.includes('%') ? value : '60%' }} />
       </div>
       <span className="text-white font-bold">{value}</span>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
