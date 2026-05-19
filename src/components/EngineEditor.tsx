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
  Database,
  RefreshCw
} from 'lucide-react';
import { useWorkspace } from '../WorkspaceContext';
import { cn } from '../lib/utils';

export default function EngineEditor() {
  const { config, updateConfig, addAgentLog, setupConfig, synthesisStatus, setSynthesisStatus } = useWorkspace();

  const handleSynthesize = () => {
    setSynthesisStatus('synthesizing');
    addAgentLog(`Initiating hybrid synthesis sequence for ${setupConfig?.engineVersion}...`, 'thinking');
    
    setTimeout(() => {
      addAgentLog(`Merging modules: ${setupConfig?.hybridModules.join(', ')}`, 'info');
    }, 1000);

    setTimeout(() => {
      addAgentLog(`Kernel optimization pass complete`, 'info');
    }, 2500);

    setTimeout(() => {
      setSynthesisStatus('complete');
      addAgentLog(`Hybrid Engine Synthesized Successfully`, 'success');
    }, 4000);
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-[#050608]">
      <div className="w-64 border-r border-white/5 flex flex-col bg-[#0c0d12]">
        <div className="p-4 border-b border-white/5">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4 block">Synthesized Modules</label>
          <div className="space-y-1">
            {setupConfig?.hybridModules.map(m => (
              <ModuleItem key={m} label={m.toUpperCase()} active />
            ))}
          </div>
        </div>
        
        <div className="p-4 bg-white/[0.01] flex-1">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3 block">Deployment Core</label>
          <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-[11px] font-black text-blue-400 uppercase tracking-widest text-center">
             {setupConfig?.deploymentTarget?.replace(/-/g, '_')}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col relative overflow-auto">
        <div className="p-12 max-w-4xl mx-auto w-full space-y-12">
          <div className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-blue-500/10 rounded-[2rem] border border-blue-500/20 flex items-center justify-center shadow-2xl shadow-blue-500/10">
                {synthesisStatus === 'synthesizing' ? <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" /> : <Cpu className="w-8 h-8 text-blue-500" />}
              </div>
              <div>
                <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Hybrid_Kernel_Orchestration</h1>
                <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest mt-1">Status: {synthesisStatus.toUpperCase()}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <StatCard label="Memory Usage" value="1.24 GB" icon={<Database className="w-4 h-4 text-purple-400" />} />
              <StatCard label="Synthesis Latency" value="1.4s" icon={<Globe className="w-4 h-4 text-emerald-400" />} />
            </div>
          </div>

          <div className="space-y-8">
            <SectionHeader title="Synthesis Parameters" icon={<Settings className="w-4 h-4" />} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <ConfigCard title="Telemetry Stream" desc="Real-time kernel profiling endpoint" value={setupConfig?.sources.telemetry} />
               <ConfigCard title="Asset Bus" desc="Content delivery network link" value={setupConfig?.sources.assets} />
               <ConfigCard title="Engine Kernel" desc="Target spatial runtime source" value={setupConfig?.sources.engine} />
               <ConfigCard title="Version Control" desc="Kernel semantic versioning" value={setupConfig?.engineVersion} />
            </div>
          </div>

          <div className="pt-10 flex border-t border-white/5 justify-between items-center">
             <div className="flex items-center gap-3">
                <div className={cn("w-3 h-3 rounded-full", synthesisStatus === 'complete' ? "bg-emerald-500" : "bg-zinc-800")} />
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Compiler_Link: {synthesisStatus === 'complete' ? 'READY' : 'STANDBY'}</span>
             </div>
             <div className="flex gap-4">
                <button className="px-8 py-3 border border-white/10 text-zinc-500 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:text-white hover:bg-white/5 transition-all">FLUSH_CACHE</button>
                <button 
                  onClick={handleSynthesize}
                  disabled={synthesisStatus === 'synthesizing'}
                  className={cn(
                    "px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl transition-all flex items-center gap-3",
                    synthesisStatus === 'synthesizing' 
                      ? "bg-zinc-800 text-zinc-500" 
                      : "bg-blue-600 text-white hover:bg-blue-500 hover:scale-[1.03] active:scale-95"
                  )}
                >
                  {synthesisStatus === 'synthesizing' ? "SYNTHESIZING..." : "INITIATE_SYNTHESIS"}
                  <Zap className={cn("w-4 h-4", synthesisStatus === 'synthesizing' && "animate-pulse")} />
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfigCard({ title, desc, value }: any) {
  return (
    <div className="p-6 bg-[#0c0d12] border border-white/5 rounded-[2rem] space-y-3 group hover:border-blue-500/20 transition-all">
       <div className="flex items-center justify-between">
          <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{title}</span>
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500/40 group-hover:bg-blue-500 transition-colors" />
       </div>
       <div className="text-[11px] font-bold text-white truncate font-mono">{value || 'UNSET'}</div>
       <p className="text-[9px] text-zinc-600 font-bold uppercase">{desc}</p>
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
