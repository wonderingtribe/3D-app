import React, { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Float, MeshDistortMaterial, Grid, Environment, KeyboardControls } from '@react-three/drei';
import * as THREE from 'three';
import { Box, Cuboid as Cube, Cpu, Zap, Box as BoxIcon, User, Bot, Map, Palette, Sparkles } from 'lucide-react';
import Player from '../spatial/Player';
import NPC from '../spatial/NPC';
import { useWorkspace } from '../WorkspaceContext';
import WebView from './WebView';
import { cn } from '../lib/utils';

function Scene({ controlMode }: { controlMode: 'orbit' | 'player' }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const { config, entities } = useWorkspace();

  const isLight = config.theme === 'light';
  const isBrutalist = config.theme === 'brutalist';

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.005;
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <>
      <ambientLight intensity={isLight ? 0.3 : 0.2} />
      
      {controlMode === 'player' && <Player />}

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
              intensity={ent.properties?.intensity || 2} 
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

      <NPC position={[3, 0, 3]} />
      <NPC position={[-3, 0, -5]} />
      
      {config.features.grid && (
        <Grid
          infiniteGrid
          fadeDistance={40}
          fadeStrength={5}
          cellSize={1}
          sectionSize={5}
          sectionColor={isBrutalist ? "#000000" : (isLight ? "#2563eb" : "#06b6d4")}
          cellColor={isLight ? "#cbd5e1" : "#313131"}
          position={[0, -0.01, 0]}
        />
      )}
      
      {config.features.gizmos && !isLight && <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />}
      <Environment preset={config.skybox as any} />
      {controlMode === 'orbit' && <OrbitControls makeDefault />}
    </>
  );
}

export default function SpatialView() {
  const { config, updateConfig, targetUrl } = useWorkspace();
  const [controlMode, setControlMode] = React.useState<'orbit' | 'player'>('orbit');
  const [showHUD, setShowHUD] = React.useState(true);
  
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
      {showHUD ? (
        <>
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
         <button 
           onClick={() => setControlMode('orbit')}
           className={cn(
             "p-2 backdrop-blur-md rounded-lg border transition-all group/btn relative",
             controlMode === 'orbit' ? "bg-ui-accent/20 border-ui-accent text-ui-accent" : "bg-ui-panel border-ui-border text-ui-text-muted hover:text-ui-accent hover:bg-ui-panel/80 transition-all"
           )}
         >
            <BoxIcon className="w-5 h-5" />
            <span className="absolute left-full ml-2 px-2 py-1 bg-ui-panel border border-ui-border rounded text-[10px] text-ui-text opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap shadow-xl">Orbit View</span>
         </button>
         <button 
           onClick={() => setControlMode('player')}
           className={cn(
             "p-2 backdrop-blur-md rounded-lg border transition-all group/btn relative",
             controlMode === 'player' ? "bg-ui-accent/20 border-ui-accent text-ui-accent" : "bg-ui-panel border-ui-border text-ui-text-muted hover:text-ui-accent hover:bg-ui-panel/80 transition-all"
           )}
         >
            <User className="w-5 h-5" />
            <span className="absolute left-full ml-2 px-2 py-1 bg-ui-panel border border-ui-border rounded text-[10px] text-ui-text opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap shadow-xl">Player Control (FPS)</span>
         </button>
         <button className="p-2 bg-ui-panel border border-ui-border text-ui-text-muted rounded-lg backdrop-blur-md hover:text-ui-accent hover:bg-ui-panel/80 transition-all group/btn relative">
            <Bot className="w-5 h-5" />
            <span className="absolute left-full ml-2 px-2 py-1 bg-ui-panel border border-ui-border rounded text-[10px] text-ui-text opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap shadow-xl">NPC Entities</span>
         </button>
         <button className="p-2 bg-ui-panel border border-ui-border text-ui-text-muted rounded-lg backdrop-blur-md hover:text-ui-accent hover:bg-ui-panel/80 transition-all group/btn relative">
            <Map className="w-5 h-5" />
            <span className="absolute left-full ml-2 px-2 py-1 bg-ui-panel border border-ui-border rounded text-[10px] text-ui-text opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap shadow-xl">World Map</span>
         </button>
      </div>

      <div className="absolute top-4 left-20 z-10 flex gap-2">
         <select 
           value={config.skybox} 
           onChange={(e) => updateConfig({ skybox: e.target.value as any })}
           className="bg-ui-panel border border-ui-border rounded-lg px-3 py-1.5 text-[10px] text-ui-accent font-bold outline-none cursor-pointer hover:bg-ui-accent/5 transition-colors backdrop-blur-md shadow-lg"
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

      <div className="absolute top-4 right-4 z-10 bg-ui-panel/80 backdrop-blur-md p-3 rounded-xl border border-ui-border flex flex-col gap-1 w-48 shadow-xl">
         <h3 className="text-[10px] font-bold text-ui-text-muted uppercase tracking-tighter mb-2">Metrics</h3>
         <Metric label="GPU" value="24%" color="bg-ui-accent" />
         <Metric label="MEM" value="1.2GB" color="bg-purple-500" />
         <Metric label="FPS" value="60" color="bg-green-500" />
      </div>

      <button 
        onClick={() => setShowHUD(false)}
        className="absolute bottom-4 right-4 z-10 p-2 bg-ui-panel/50 hover:bg-ui-accent text-ui-text-muted hover:text-white rounded-lg border border-ui-border transition-all"
        title="Hide HUD"
      >
        <Palette className="w-4 h-4" />
      </button>
    </>
  ) : (
    <button 
      onClick={() => setShowHUD(true)}
      className="absolute bottom-4 right-4 z-10 p-2 bg-ui-accent text-white rounded-lg shadow-lg animate-pulse"
      title="Show HUD"
    >
      <Sparkles className="w-4 h-4" />
    </button>
  )}

      <KeyboardControls map={map}>
        <Canvas shadows camera={{ position: [0, 5, 10], fov: 75 }}>
          <Suspense fallback={null}>
            <Scene controlMode={controlMode} />
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
       <span className="text-ui-text-muted">{label}</span>
       <div className="w-24 h-1.5 bg-ui-text-muted/10 rounded-full overflow-hidden mx-2">
          <div className={cn("h-full rounded-full transition-all duration-1000", color)} style={{ width: value.includes('%') ? value : '60%' }} />
       </div>
       <span className="text-ui-text font-bold">{value}</span>
    </div>
  );
}

// Remove local cn as we now import it correctly
