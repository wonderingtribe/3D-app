import React from 'react';
import SpatialView from './SpatialView';
import CanvasEditor from './CanvasEditor';
import { useWorkspace } from '../WorkspaceContext';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Box, Layers, Play, Database, Cpu, Zap } from 'lucide-react';

export default function EngineEditor() {
  const { config } = useWorkspace();

  return (
    <div className="h-full w-full flex flex-col relative bg-black">
      {/* Upper Logic Layer (Canvas Editor) */}
      <div className="h-[40%] min-h-[300px] border-b border-ui-border relative overflow-hidden">
        <div className="absolute top-2 left-4 z-30 flex items-center gap-2">
          <div className="px-2 py-0.5 bg-ui-accent/20 border border-ui-accent/40 rounded text-[9px] font-bold text-ui-accent uppercase tracking-tighter">
            Logic_Flow_v2.0
          </div>
          <div className="text-[9px] text-ui-text-muted uppercase font-mono italic">
            Visual Scripting Interface
          </div>
        </div>
        <CanvasEditor />
      </div>

      {/* Primary Rendering Layer (WebGL Spatial View) */}
      <div className="flex-1 relative group">
        <SpatialView />
        
        {/* Engine Overlay Controls */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Viewport Label */}
          <div className="absolute top-4 right-22 z-10 flex gap-2 pointer-events-auto">
             <div className="p-2 bg-ui-panel/40 backdrop-blur-md rounded-lg border border-ui-border flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_cyan]" />
                <span className="text-[10px] font-bold text-white uppercase font-mono">RENDER_ACTIVE</span>
             </div>
          </div>

          {/* Engine Selection Bar */}
          <div className="absolute left-1/2 -bottom-4 -translate-x-1/2 p-1 bg-ui-panel/80 backdrop-blur-xl border border-ui-border rounded-full flex gap-1 pointer-events-auto shadow-2xl scale-90 group-hover:bottom-4 group-hover:scale-100 transition-all duration-500">
             <EngineTab label="THREE.JS" active={config.engine === 'three'} icon={<Box className="w-3 h-3" />} />
             <EngineTab label="PLAYCANVAS" active={config.engine === 'playcanvas'} icon={<Layers className="w-3 h-3" />} />
             <EngineTab label="BABYLON" active={config.engine === 'babylon'} icon={<Zap className="w-3 h-3" />} />
          </div>
        </div>
      </div>

      {/* Floating Status Bar for Merged View */}
      <div className="absolute bottom-4 left-4 pointer-events-none">
        <div className="flex gap-4 p-2 bg-black/40 backdrop-blur-md border border-white/5 rounded-xl pointer-events-auto group/stats transition-all hover:bg-black/60">
           <StatusMetric label="LATENCY" value="1.2ms" />
           <StatusMetric label="DRAWCALLS" value="142" />
           <StatusMetric label="TRIANGLES" value="1.2M" />
        </div>
      </div>
    </div>
  );
}

function EngineTab({ label, active, icon }: { label: string; active: boolean; icon: React.ReactNode }) {
  return (
    <button className={cn(
      "px-3 py-1.5 rounded-full text-[9px] font-bold uppercase flex items-center gap-2 transition-all",
      active ? "bg-ui-accent text-white shadow-lg shadow-ui-accent/20" : "text-ui-text-muted hover:text-ui-text hover:bg-white/5"
    )}>
      {icon}
      {label}
    </button>
  );
}

function StatusMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
       <span className="text-[7px] text-white/30 uppercase tracking-tighter">{label}</span>
       <span className="text-[10px] text-ui-accent font-mono font-bold leading-none">{value}</span>
    </div>
  );
}
