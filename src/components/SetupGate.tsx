import React, { useState } from 'react';
import { useWorkspace } from '../WorkspaceContext';
import { 
  Cpu, 
  Layers, 
  Upload, 
  Zap, 
  Terminal, 
  Box, 
  Terminal as TerminalIcon, 
  ShieldCheck, 
  Settings, 
  ChevronRight,
  Database,
  Globe,
  Layout,
  Code
} from 'lucide-react';
import { cn } from '../lib/utils';
import { WorkspaceSetup } from '../types';
import { motion, AnimatePresence } from 'motion/react';

export default function SetupGate() {
  const { completeSetup } = useWorkspace();
  const [engine, setEngine] = useState<WorkspaceSetup['engineVersion']>('v3-stable');
  const [editor, setEditor] = useState<WorkspaceSetup['editorMode']>('full');
  const [isUploading, setIsUploading] = useState(false);
  const [customConfig, setCustomConfig] = useState<string>("");
  const [telemetry, setTelemetry] = useState(true);

  const handleInitialize = () => {
    completeSetup({
      engineVersion: engine,
      editorMode: editor,
      customConfig: customConfig || undefined,
      advancedTelemetry: telemetry
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      setCustomConfig(event.target?.result as string);
      setTimeout(() => setIsUploading(false), 800);
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#050608] flex items-center justify-center p-6 overflow-auto font-sans">
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] brightness-100 contrast-150" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-4xl relative"
      >
        <div className="bg-[#0c0d12] border border-white/[0.03] rounded-[32px] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]">
          
          <div className="grid grid-cols-1 lg:grid-cols-5 h-full min-h-[600px]">
            
            {/* Sidebar / Info */}
            <div className="lg:col-span-2 p-10 bg-gradient-to-b from-[#111318] to-transparent border-r border-white/[0.03] flex flex-col justify-between">
              <div>
                <motion.div 
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full mb-6"
                >
                  <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" />
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em]">System Initialization</span>
                </motion.div>
                
                <h1 className="text-4xl font-black text-white tracking-tighter leading-none mb-4 uppercase">
                  Spatial_OS<br />Workspace
                </h1>
                <p className="text-zinc-500 text-sm leading-relaxed max-w-[240px]">
                  Configure your spatial development environment and engine telemetry parameters.
                </p>

                <div className="mt-12 space-y-6">
                  <FeatureItem 
                    icon={<Globe className="w-4 h-4" />} 
                    title="Engine Cluster" 
                    desc="Global edge distribution" 
                  />
                  <FeatureItem 
                    icon={<ShieldCheck className="w-4 h-4" />} 
                    title="Secure Sandbox" 
                    desc="Isolated compute pods" 
                  />
                  <FeatureItem 
                    icon={<Zap className="w-4 h-4" />} 
                    title="Real-time Sync" 
                    desc="Multi-user collaboration" 
                  />
                </div>
              </div>

              <div className="text-[10px] font-mono text-zinc-700 uppercase tracking-widest">
                Kernel Version: 4.8.22-spat
              </div>
            </div>

            {/* Main Config */}
            <div className="lg:col-span-3 p-10 flex flex-col">
              
              <div className="flex-1 space-y-10">
                
                {/* Engine Selection */}
                <section>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-6 block">Select 3D Architecture System</label>
                  <div className="grid grid-cols-1 gap-6">
                    <DetailedOptionCard 
                      active={engine === 'v3-stable'}
                      onClick={() => setEngine('v3-stable')}
                      icon={<Cpu className="w-6 h-6" />}
                      title="Spatial Engine v3"
                      desc="The industry standard for high-fidelity spatial applications."
                      tag="Production Ready"
                      features={["Real-time Physics Sync", "GLTF/WebGPU Pipeline", "Multi-user Proximity Audio"]}
                      howToUse="Best for complex environments, commercial apps, and stable production deployments."
                    />
                    
                    <DetailedOptionCard 
                      active={engine === 'v4-beta'}
                      onClick={() => setEngine('v4-beta')}
                      icon={<Zap className="w-6 h-6" />}
                      title="Hyper-Spatial v4"
                      desc="Experimental engine with neural-rendered lighting clusters."
                      tag="Experimental"
                      accent="amber"
                      features={["Ray-traced Global Illumination", "Neural Level-of-Detail", "Quantum State Persistence"]}
                      howToUse="Ideal for cutting-edge visual experiences, large-scale simulations, and early-access R&D."
                    />

                    <DetailedOptionCard 
                      active={engine === 'v2-legacy'}
                      onClick={() => setEngine('v2-legacy')}
                      icon={<Layers className="w-6 h-6" />}
                      title="Heritage Engine v2"
                      desc="Optimized for lightweight devices and mobile-first spatial web."
                      tag="Legacy Support"
                      accent="zinc"
                      features={["Ultra-low Latency", "Mobile Device Compatibility", "Minimal Asset Handshake"]}
                      howToUse="Use when building for budget hardware or requiring maximum reach with minimal overhead."
                    />
                  </div>
                </section>

                {/* Editor Mode */}
                <section>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4 block">Editor Configuration</label>
                  <div className="flex gap-4">
                    <ModeButton 
                      active={editor === 'full'} 
                      onClick={() => setEditor('full')} 
                      label="Full Suite" 
                      icon={<Layout className="w-4 h-4" />} 
                    />
                    <ModeButton 
                      active={editor === 'code-lite'} 
                      onClick={() => setEditor('code-lite')} 
                      label="Code Lite" 
                      icon={<Code className="w-4 h-4" />} 
                    />
                    <ModeButton 
                      active={editor === 'spatial-only'} 
                      onClick={() => setEditor('spatial-only')} 
                      label="Spatial Only" 
                      icon={<Box className="w-4 h-4" />} 
                    />
                  </div>
                </section>

                {/* Import Custom setup */}
                <section>
                   <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4 block">Custom Environments</label>
                   <div className="relative group">
                     <input 
                      type="file" 
                      accept=".json,.txt"
                      onChange={handleFileUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                     />
                     <div className={cn(
                       "border-2 border-dashed border-white/[0.05] rounded-2xl p-6 transition-all group-hover:border-blue-500/30 group-hover:bg-blue-500/[0.02] flex items-center gap-4",
                       customConfig ? "border-emerald-500/20 bg-emerald-500/[0.02]" : ""
                     )}>
                        <div className={cn(
                          "p-3 rounded-xl",
                          customConfig ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-zinc-500"
                        )}>
                          {isUploading ? <Loader className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-zinc-300 uppercase tracking-tight">
                            {customConfig ? "Custom configuration loaded" : "Import Custom Setup"}
                          </p>
                          <p className="text-[10px] text-zinc-600 truncate uppercase mt-0.5">
                            {customConfig ? "Using custom environment parameters" : "Drag & drop profile (.JSON)"}
                          </p>
                        </div>
                     </div>
                   </div>
                </section>
              </div>

              {/* Action */}
              <div className="pt-10 flex items-center justify-between border-t border-white/[0.03]">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => setTelemetry(!telemetry)}>
                  <div className={cn(
                    "w-8 h-4 rounded-full transition-all relative",
                    telemetry ? "bg-blue-600" : "bg-zinc-800"
                  )}>
                    <div className={cn(
                      "absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all",
                      telemetry ? "left-4.5" : "left-0.5"
                    )} />
                  </div>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Enhanced Telemetry</span>
                </div>
                
                <button 
                  onClick={handleInitialize}
                  className="group relative px-8 py-3 bg-white text-black rounded-xl font-bold text-xs uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all flex items-center gap-3 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity" />
                  INITIALIZE_WORKSPACE
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>

        </div>
      </motion.div>
    </div>
  );
}

function FeatureItem({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-zinc-400">
        {icon}
      </div>
      <div>
        <h4 className="text-[11px] font-bold text-zinc-200 uppercase tracking-wider">{title}</h4>
        <p className="text-[10px] text-zinc-600 uppercase tracking-tight">{desc}</p>
      </div>
    </div>
  );
}

function DetailedOptionCard({ 
  active, 
  onClick, 
  icon, 
  title, 
  desc, 
  tag, 
  features, 
  howToUse,
  accent = "blue"
}: { 
  active: boolean, 
  onClick: () => void, 
  icon: React.ReactNode, 
  title: string, 
  desc: string, 
  tag?: string,
  features: string[],
  howToUse: string,
  accent?: "blue" | "amber" | "zinc"
}) {
  const accentColors = {
    blue: {
      border: "border-blue-500/40",
      bg: "bg-blue-500/[0.03]",
      icon: "bg-blue-500/20 text-blue-400",
      pill: "bg-blue-500/10 text-blue-400",
      dot: "bg-blue-400",
      cta: "bg-blue-600 shadow-blue-500/20"
    },
    amber: {
      border: "border-amber-500/40",
      bg: "bg-amber-500/[0.03]",
      icon: "bg-amber-500/20 text-amber-400",
      pill: "bg-amber-500/10 text-amber-400",
      dot: "bg-amber-400",
      cta: "bg-amber-600 shadow-amber-500/20"
    },
    zinc: {
      border: "border-zinc-500/40",
      bg: "bg-zinc-500/[0.03]",
      icon: "bg-zinc-500/20 text-zinc-400",
      pill: "bg-zinc-500/10 text-zinc-400",
      dot: "bg-zinc-400",
      cta: "bg-zinc-700 shadow-zinc-500/20"
    }
  }[accent];

  return (
    <motion.div 
      layout
      onClick={onClick}
      className={cn(
        "relative p-6 rounded-[2.5rem] border transition-all cursor-pointer group flex flex-col gap-6",
        active 
          ? cn("shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)] z-10", accentColors.border, accentColors.bg) 
          : "bg-[#111318]/40 border-white/[0.03] hover:border-white/10 hover:bg-[#1a1d24]/60"
      )}
    >
      <div className="flex items-start gap-5">
        <div className={cn(
          "w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all flex-shrink-0",
          active ? accentColors.icon : "bg-black/40 text-zinc-600 group-hover:text-zinc-400"
        )}>
          {icon}
        </div>
        <div className="flex-1 pt-1">
          <div className="flex items-center gap-3 mb-1.5">
            <h4 className="text-lg font-black text-white uppercase tracking-tight leading-none">{title}</h4>
            {tag && <span className={cn("px-2 py-0.5 text-[8px] font-black uppercase rounded-full tracking-widest", accentColors.pill)}>{tag}</span>}
          </div>
          <p className="text-xs text-zinc-500 font-medium uppercase tracking-tight leading-relaxed max-w-sm">{desc}</p>
        </div>

        {/* Bubble CTA */}
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center transition-all",
          active ? cn("scale-110", accentColors.cta, "text-white shadow-xl") : "bg-white/5 text-zinc-700"
        )}>
          {active ? <ChevronRight className="w-5 h-5" /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {active && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-4 border-t border-white/[0.03] grid grid-cols-2 gap-6">
               <div className="space-y-3">
                  <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest block">Core_Capabilities</span>
                  <ul className="space-y-2">
                    {features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-tight">
                        <div className={cn("w-1 h-1 rounded-full", accentColors.dot)} />
                        {f}
                      </li>
                    ))}
                  </ul>
               </div>
               <div className="space-y-3">
                  <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest block">Deployment_Context</span>
                  <p className="text-[10px] font-bold text-zinc-500 leading-relaxed uppercase tracking-tight italic">
                    {howToUse}
                  </p>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ModeButton({ active, onClick, label, icon }: { active: boolean, onClick: () => void, label: string, icon: React.ReactNode }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex-1 flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all",
        active 
          ? "bg-white/[0.03] border-white/20 text-white" 
          : "bg-[#111318] border-white/[0.05] text-zinc-600 hover:text-zinc-400"
      )}
    >
      <div className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center",
        active ? "bg-white/10" : "bg-black/20"
      )}>
        {icon}
      </div>
      <span className="text-[9px] font-black uppercase tracking-[0.2em]">{label}</span>
    </button>
  );
}

function Loader({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
  );
}
