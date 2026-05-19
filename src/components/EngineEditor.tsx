import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Cpu, 
  Play, 
  Settings, 
  ChevronRight, 
  Box, 
  Zap,
  Globe,
  Database
} from 'lucide-react';
import { useWorkspace } from '../WorkspaceContext';
import { cn } from '../lib/utils';

export default function EngineEditor() {
  const { config, updateConfig, addAgentLog, setupConfig } = useWorkspace();
  const [isCompiling, setIsCompiling] = useState(false);

  const simulateCompile = () => {
    setIsCompiling(true);
    addAgentLog(`Compiling engine source for target: ${config.engine} (${setupConfig?.engineVersion || 'Stable'})`, 'info');
    setTimeout(() => {
      setIsCompiling(false);
      addAgentLog(`Engine build successful. Native extensions initialized.`, 'success');
    }, 2000);
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-ui-bg">
      <div className="w-64 border-r border-ui-border flex flex-col bg-ui-panel/30">
        <div className="p-4 border-b border-ui-border">
          <label className="text-[10px] font-bold text-ui-text uppercase tracking-[0.2em] mb-4 block">Core Modules</label>
          <div className="space-y-1">
            <ModuleItem label="Physics_PhysX" active />
            <ModuleItem label="Audio_WebAudio" active />
            <ModuleItem label="Render_VulkanProxy" />
            <ModuleItem label="Script_GeminiVM" active />
          </div>
        </div>
        
        <div className="p-4 bg-ui-panel/20 flex-1">
          <label className="text-[10px] font-bold text-ui-text-muted uppercase tracking-widest mb-3 block">Compiler Target</label>
          <div className="space-y-2">
            <RadioOption 
              selected={config.engine === 'three'} 
              label="Three.js Fiber" 
              onClick={() => updateConfig({ engine: 'three' })} 
            />
            <RadioOption 
              selected={config.engine === 'babylon'} 
              label="Babylon Native" 
              onClick={() => updateConfig({ engine: 'babylon' })} 
            />
            <RadioOption 
              selected={config.engine === 'playcanvas'} 
              label="PlayCanvas Web" 
              onClick={() => updateConfig({ engine: 'playcanvas' })} 
            />
            <RadioOption 
              selected={config.engine === 'unity-webgl'} 
              label="Unity WebGL" 
              onClick={() => updateConfig({ engine: 'unity-webgl' })} 
            />
            <RadioOption 
              selected={config.engine === 'unreal'} 
              label="Unreal Engine (Pixel Stream/WebGL)" 
              onClick={() => {
                updateConfig({ engine: 'unreal' });
              }} 
            />
          </div>
          {config.engine === 'unreal' && (
            <div className="mt-4 p-3 bg-ui-accent/10 border border-ui-accent/20 rounded text-[10px] text-ui-text-muted leading-relaxed">
              <span className="font-bold text-ui-accent">Unreal Selected:</span> This setting prepares the scene graph to sync with a remote Unreal Engine backend via Pixel Streaming, or export as Unreal WebGL.
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col relative">
        <div className="p-8 max-w-2xl mx-auto w-full space-y-12 py-16">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-ui-accent/20 rounded-2xl border border-ui-accent/30 shadow-2xl shadow-ui-accent/10">
                <Cpu className="w-8 h-8 text-ui-accent" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Engine Core Configuration</h1>
                <p className="text-ui-text-muted text-sm italic">Manage low-level spatial runtime parameters.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <StatCard label="Memory Usage" value="124.5MB" icon={<Database className="w-4 h-4 text-purple-400" />} />
              <StatCard label="Network Latency" value="12ms" icon={<Globe className="w-4 h-4 text-emerald-400" />} />
            </div>
          </div>

          <div className="space-y-6">
            <SectionHeader title="Runtime Preferences" icon={<Settings className="w-4 h-4" />} />
            <div className="space-y-4 bg-ui-panel border border-ui-border rounded-2xl p-6 shadow-xl">
               <ToggleOption 
                 label="Local Dev Server" 
                 active={config.localDev || false} 
                 onChange={(v) => updateConfig({ localDev: v })} 
                 desc="Serve engine modules from localhost:3000"
               />
               <div className="h-[1px] bg-ui-border mx--6" />
               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-ui-text-muted uppercase">Custom Engine URL</label>
                  <div className="flex gap-2">
                    <input 
                      className="flex-1 bg-ui-bg border border-ui-border rounded-lg p-2 text-[11px] text-ui-text outline-none focus:border-ui-accent font-mono"
                      placeholder="https://cdn.spatial.io/v4/engine.js"
                      value={config.customEngineUrl}
                      onChange={(e) => updateConfig({ customEngineUrl: e.target.value })}
                    />
                    <button className="px-4 py-2 bg-white/5 border border-ui-border rounded-lg text-[10px] font-bold hover:bg-white/10">CHECK_URL</button>
                  </div>
               </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
             <button className="px-6 py-2.5 border border-ui-border text-ui-text-muted rounded-xl text-[12px] font-bold hover:bg-white/5 transition-all">REVERT_VARS</button>
             <button 
               onClick={simulateCompile}
               disabled={isCompiling}
               className={cn(
                 "px-8 py-2.5 bg-ui-accent text-white rounded-xl text-[12px] font-bold shadow-xl shadow-ui-accent/20 transition-all flex items-center gap-3",
                 isCompiling ? "opacity-50 scale-95" : "hover:scale-105 active:scale-95"
               )}
             >
               {isCompiling ? <Zap className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
               {isCompiling ? "COMPILING..." : "BUILD_ENGINE"}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModuleItem({ label, active }: { label: string; active?: boolean }) {
  return (
    <div className={cn(
      "flex items-center justify-between p-2 rounded-lg border text-[10px] font-medium transition-all",
      active ? "bg-ui-accent/5 border-ui-accent/20 text-ui-text" : "bg-transparent border-transparent text-ui-text-muted opacity-50"
    )}>
      {label}
      {active && <div className="w-1.5 h-1.5 rounded-full bg-ui-accent animate-pulse" />}
    </div>
  );
}

function RadioOption({ selected, label, onClick }: { selected: boolean; label: string; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 p-3 rounded-xl border transition-all",
        selected ? "bg-ui-accent text-white border-ui-accent shadow-lg shadow-ui-accent/10" : "bg-ui-bg border-ui-border text-ui-text-muted hover:border-ui-accent/30"
      )}
    >
      <div className={cn(
        "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all",
        selected ? "border-white bg-white/20" : "border-ui-border"
      )}>
        {selected && <div className="w-2 h-2 rounded-full bg-white" />}
      </div>
      <span className="text-[11px] font-bold uppercase tracking-tight">{label}</span>
    </button>
  );
}

function ToggleOption({ label, active, onChange, desc }: { label: string; active: boolean; onChange: (v: boolean) => void; desc?: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex flex-col gap-0.5">
        <span className="text-[11px] font-bold text-ui-text">{label}</span>
        {desc && <span className="text-[9px] text-ui-text-muted italic">{desc}</span>}
      </div>
      <button 
        onClick={() => onChange(!active)}
        className={cn(
          "w-12 h-6 rounded-full p-1 transition-all",
          active ? "bg-ui-accent" : "bg-ui-bg border border-ui-border shadow-inner"
        )}
      >
        <div className={cn(
          "w-4 h-4 rounded-full bg-white transition-all transform",
          active ? "translate-x-6" : "translate-x-0"
        )} />
      </button>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-ui-panel border border-ui-border rounded-xl p-4 flex items-center gap-4 shadow-lg group hover:border-ui-accent/30 transition-all">
      <div className="p-2 bg-ui-bg rounded-lg group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-[9px] font-bold text-ui-text-muted uppercase tracking-widest">{label}</span>
        <span className="text-[14px] font-bold text-ui-text font-mono">{value}</span>
      </div>
    </div>
  );
}

function SectionHeader({ title, icon }: { title: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="p-1.5 bg-ui-panel rounded border border-ui-border text-ui-accent">
        {icon}
      </div>
      <h3 className="text-[11px] font-bold text-ui-text uppercase tracking-[0.2em]">{title}</h3>
      <div className="h-[1px] flex-1 bg-ui-border ml-2" />
    </div>
  );
}
