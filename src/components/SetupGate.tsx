import React, { useState } from 'react';
import { useWorkspace } from '../WorkspaceContext';
import { 
  Cpu, 
  Layers, 
  Upload, 
  Zap, 
  Box, 
  ShieldCheck, 
  ChevronRight,
  ChevronLeft,
  Globe,
  Layout,
  Code,
  Network,
  Database,
  Link2,
  GitBranch,
  Terminal,
  Activity
} from 'lucide-react';
import { cn } from '../lib/utils';
import { WorkspaceSetup } from '../types';
import { motion, AnimatePresence } from 'motion/react';

type Step = 'orchestration' | 'connectivity' | 'synthesis';

export default function SetupGate() {
  const { completeSetup } = useWorkspace();
  const [currentStep, setCurrentStep] = useState<Step>('orchestration');
  
  // Setup State
  const [engine, setEngine] = useState<WorkspaceSetup['engineVersion']>('v3-stable');
  const [hybridModules, setHybridModules] = useState<string[]>(['core']);
  const [editor, setEditor] = useState<WorkspaceSetup['editorMode']>('full');
  const [sources, setSources] = useState({
    engine: 'https://kernel.spatial.io',
    assets: 'https://cdn.assets.io',
    telemetry: 'wss://telemetry.cluster.local'
  });
  const [telemetry, setTelemetry] = useState(true);

  const steps: Step[] = ['orchestration', 'connectivity', 'synthesis'];
  const currentIndex = steps.indexOf(currentStep);

  const toggleModule = (id: string) => {
    setHybridModules(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const handleNext = () => {
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    } else {
      completeSetup({
        engineVersion: engine,
        editorMode: editor,
        hybridModules,
        sources,
        advancedTelemetry: telemetry
      });
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#050608] flex items-center justify-center p-6 overflow-auto font-sans">
      <div className="absolute inset-0 bg-[#050608]" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/5 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-6xl relative"
      >
        <div className="bg-[#0c0d12] border border-white/[0.03] rounded-[48px] overflow-hidden shadow-[0_64px_128px_-32px_rgba(0,0,0,0.8)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 h-[720px]">
            
            {/* Sidebar Status */}
            <div className="lg:col-span-4 p-12 bg-[#0f1016] border-r border-white/[0.03] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-10">
                  <div className="w-10 h-10 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Box className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-white uppercase tracking-[0.3em]">Spatial_IDE</div>
                    <div className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mt-0.5">Kernel v9.0.Hybrid</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h1 className="text-4xl font-black text-white tracking-tighter leading-none uppercase">
                    {currentStep === 'orchestration' && "Kernel_Synthesis"}
                    {currentStep === 'connectivity' && "Source_Linkage"}
                    {currentStep === 'synthesis' && "IDE_Deployment"}
                  </h1>
                  <p className="text-zinc-500 text-sm leading-relaxed max-w-[280px]">
                    {currentStep === 'orchestration' && "Merge core engine components to synthesize your custom 3D development kernel."}
                    {currentStep === 'connectivity' && "Define your source providers. Connect to external clusters, CDN endpoints, or local telemetry streams."}
                    {currentStep === 'synthesis' && "Finalize your workspace interface and deploy the synthesized orchestration layer."}
                  </p>
                </div>

                <div className="mt-12 space-y-6">
                   {steps.map((s, i) => (
                     <div key={s} className="flex items-center gap-4">
                        <div className={cn(
                          "w-1.5 h-8 rounded-full transition-all duration-500",
                          currentIndex === i ? "bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)]" : 
                          currentIndex > i ? "bg-emerald-500/50" : "bg-white/5"
                        )} />
                        <div>
                          <div className={cn(
                            "text-[8px] font-black uppercase tracking-[0.2em]",
                            currentIndex === i ? "text-blue-400" : "text-zinc-700"
                          )}>Phase_{String(i + 1).padStart(2, '0')}</div>
                          <div className={cn(
                            "text-[10px] font-bold uppercase tracking-widest",
                            currentIndex === i ? "text-white" : "text-zinc-600"
                          )}>{s}</div>
                        </div>
                     </div>
                   ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                   <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-3 h-3 text-emerald-400" />
                      <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Active Hybrid Stack</span>
                   </div>
                   <div className="flex flex-wrap gap-1.5">
                      {hybridModules.map(m => (
                        <span key={m} className="px-2 py-0.5 bg-white/5 rounded-md text-[7px] font-black text-zinc-500 uppercase tracking-widest border border-white/5">{m}</span>
                      ))}
                   </div>
                </div>
              </div>
            </div>

            {/* Config panel */}
            <div className="lg:col-span-8 p-12 flex flex-col relative overflow-hidden bg-[#0c0d12]">
              <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
                <AnimatePresence mode="wait">
                  {currentStep === 'orchestration' && (
                    <motion.div key="orch" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                       <section>
                          <label className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] block mb-6">Select Primary Engine Base</label>
                          <div className="grid grid-cols-2 gap-4">
                             <DetailedBase active={engine === 'v3-stable'} onClick={() => setEngine('v3-stable')} icon={<Cpu />} title="V3 Pro" desc="Production GLTF/WebVR" />
                             <DetailedBase active={engine === 'v4-beta'} onClick={() => setEngine('v4-beta')} icon={<Zap />} title="V4 Hyper" desc="Neural Ray-Tracing" />
                             <DetailedBase active={engine === 'v2-legacy'} onClick={() => setEngine('v2-legacy')} icon={<Layers />} title="V2 Lite" desc="Edge optimized" />
                             <DetailedBase active={engine === 'hybrid-custom'} onClick={() => setEngine('hybrid-custom')} icon={<Network />} title="Hybrid" desc="Manual Synthesis" />
                          </div>
                       </section>

                       <section>
                          <label className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] block mb-6">Merge Integration Modules</label>
                          <div className="grid grid-cols-3 gap-3">
                             <ModuleChip icon={<Terminal size={14}/>} label="WASI Engine" active={hybridModules.includes('wasi')} onClick={() => toggleModule('wasi')} />
                             <ModuleChip icon={<Database size={14}/>} label="Asset Stream" active={hybridModules.includes('assets')} onClick={() => toggleModule('assets')} />
                             <ModuleChip icon={<Network size={14}/>} label="Multi-User" active={hybridModules.includes('multiplayer')} onClick={() => toggleModule('multiplayer')} />
                             <ModuleChip icon={<Zap size={14}/>} label="GPU Physics" active={hybridModules.includes('physics')} onClick={() => toggleModule('physics')} />
                             <ModuleChip icon={<Code size={14}/>} label="Live Compiler" active={hybridModules.includes('compiler')} onClick={() => toggleModule('compiler')} />
                             <ModuleChip icon={<Layers size={14}/>} label="Mesh Opt" active={hybridModules.includes('optimizer')} onClick={() => toggleModule('optimizer')} />
                          </div>
                       </section>
                    </motion.div>
                  )}

                  {currentStep === 'connectivity' && (
                    <motion.div key="conn" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                       <section className="space-y-6">
                          <SourceInput 
                            label="Engine Kernel Endpoint" 
                            icon={<Link2 />} 
                            value={sources.engine} 
                            onChange={(v: string) => setSources({...sources, engine: v})} 
                            desc="Target URL for the 3D runtime orchestration layer"
                          />
                          <SourceInput 
                            label="Asset Content Delivery" 
                            icon={<Database />} 
                            value={sources.assets} 
                            onChange={(v: string) => setSources({...sources, assets: v})} 
                            desc="CDN or Local Path for GLTF/Texture streams"
                          />
                          <SourceInput 
                            label="Telemetry Stream (WSS)" 
                            icon={<Zap />} 
                            value={sources.telemetry} 
                            onChange={(v: string) => setSources({...sources, telemetry: v})} 
                            desc="Bi-directional socket for real-time profiling"
                          />
                       </section>
                       
                       <div className="p-6 bg-blue-600/[0.03] border border-blue-500/10 rounded-[2rem] flex items-center gap-4">
                          <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400"><GitBranch className="w-5 h-5" /></div>
                          <div>
                            <div className="text-[10px] font-black text-white uppercase tracking-widest">Auto-Discovery Active</div>
                            <div className="text-[9px] text-zinc-600 font-bold uppercase tracking-tight mt-0.5">Attempting to resolve local cluster on port 3000...</div>
                          </div>
                       </div>
                    </motion.div>
                  )}

                  {currentStep === 'synthesis' && (
                    <motion.div key="syn" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                       <section>
                          <label className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] block mb-6">Select IDE Synthesis Mode</label>
                          <div className="grid grid-cols-2 gap-4">
                             <DetailedBase active={editor === 'full'} onClick={() => setEditor('full')} icon={<Layout />} title="Full Suite" desc="Complete 3D/Code hybrid IDE" />
                             <DetailedBase active={editor === 'code-lite'} onClick={() => setEditor('code-lite')} icon={<Code />} title="Code Lite" desc="Terminal and Script focus" />
                             <DetailedBase active={editor === 'spatial-only'} onClick={() => setEditor('spatial-only')} icon={<Box />} title="Spatialist" desc="3D View and Inspector only" />
                             <div className="p-6 rounded-[2rem] border border-white/[0.03] bg-[#111318]/40 flex items-center justify-center grayscale opacity-30">
                                <span className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">VR_MODE_LOCKED</span>
                             </div>
                          </div>
                       </section>

                       <section className="flex items-center justify-between p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem]">
                          <div className="flex items-center gap-4">
                             <div className={cn("w-12 h-6 rounded-full relative cursor-pointer", telemetry ? "bg-blue-600" : "bg-zinc-800")} onClick={() => setTelemetry(!telemetry)}>
                                <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all", telemetry ? "left-7" : "left-1")} />
                             </div>
                             <div>
                                <div className="text-[10px] font-black text-white uppercase tracking-widest">Advanced Telemetry</div>
                                <div className="text-[8px] text-zinc-600 font-bold uppercase tracking-tight">Enable deep kernel profiling (Experimental)</div>
                             </div>
                          </div>
                          <ShieldCheck className="w-5 h-5 text-zinc-800" />
                       </section>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="pt-10 border-t border-white/5 flex items-center justify-between">
                 <button onClick={handleBack} disabled={currentIndex === 0} className="px-6 py-3 text-[10px] font-black text-zinc-600 uppercase tracking-widest hover:text-white transition-all disabled:opacity-0 flex items-center gap-2">
                    <ChevronLeft className="w-4 h-4" /> Go_Back
                 </button>

                 <button onClick={handleNext} className="px-10 py-4 bg-white text-black rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.03] active:scale-95 transition-all flex items-center gap-3">
                    {currentStep === 'synthesis' ? "SYNTHESIZE_ENVIRONMENT" : "NEXT_PHASE"}
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

function DetailedBase({ active, onClick, icon, title, desc }: any) {
  return (
    <div onClick={onClick} className={cn(
      "p-6 rounded-[2rem] border transition-all cursor-pointer group relative flex flex-col gap-4",
      active ? "bg-blue-600/10 border-blue-500/40" : "bg-[#111318]/40 border-white/[0.05] hover:border-white/10"
    )}>
       <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-all", active ? "bg-blue-500 text-white shadow-lg" : "bg-black/40 text-zinc-600")}>
          {React.cloneElement(icon, { size: 20 })}
       </div>
       <div>
          <div className="text-xs font-black text-white uppercase tracking-widest mb-0.5">{title}</div>
          <div className="text-[9px] text-zinc-600 font-bold uppercase tracking-tighter">{desc}</div>
       </div>
       {active && <div className="absolute top-4 right-4 w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />}
    </div>
  );
}

function ModuleChip({ icon, label, active, onClick }: any) {
  return (
    <button onClick={onClick} className={cn(
      "flex items-center gap-3 p-4 rounded-2xl border transition-all",
      active ? "bg-white/5 border-white/20 text-white" : "bg-[#111318] border-white/[0.03] text-zinc-600 hover:text-zinc-500"
    )}>
       {icon}
       <span className="text-[9px] font-black uppercase tracking-tight">{label}</span>
    </button>
  );
}

function SourceInput({ label, icon, value, onChange, desc }: any) {
  return (
    <div className="space-y-2">
       <div className="flex items-center justify-between px-1">
          <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest leading-none">{label}</label>
          <span className="text-[8px] text-zinc-700 font-bold uppercase">{desc}</span>
       </div>
       <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500 transition-colors">
             {React.cloneElement(icon, { size: 14 })}
          </div>
          <input 
            value={value} 
            onChange={(e) => onChange(e.target.value)} 
            className="w-full bg-[#111318] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-[11px] text-zinc-300 font-mono outline-none focus:border-blue-500/30 transition-all font-bold"
            placeholder="https://source.provider.endpoint"
          />
       </div>
    </div>
  );
}
