import React, { useState } from 'react';
import { useWorkspace } from '../WorkspaceContext';
import { 
  Box, 
  ChevronRight,
  Database,
  Link2,
  Terminal,
  Activity,
  Server,
  Cloud,
  Layers,
  Cpu,
  Zap,
  Network,
  Globe,
  Settings,
  Sparkles,
  Command,
  Loader2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { WorkspaceSetup, DeploymentTarget } from '../types';
import { motion, AnimatePresence } from 'motion/react';

type Step = 'orchestration' | 'connectivity' | 'deployment' | 'synthesis';

export default function SetupGate() {
  const { completeSetup } = useWorkspace();
  const [currentStep, setCurrentStep] = useState<Step>('orchestration');
  const [isAiSuggesting, setIsAiSuggesting] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  
  // Setup State
  const [engine, setEngine] = useState<WorkspaceSetup['engineVersion']>('v3-stable');
  const [hybridModules, setHybridModules] = useState<string[]>(['wasi', 'assets', 'physics', 'mesh-opt']);
  const [editor, setEditor] = useState<WorkspaceSetup['editorMode']>('full');
  const [deployment, setDeployment] = useState<DeploymentTarget>('k8s-pod');
  const [sources, setSources] = useState({
    engine: 'https://kernel.spatial.io',
    assets: 'https://cdn.assets.io',
    telemetry: 'wss://telemetry.cluster.local'
  });

  const steps: Step[] = ['orchestration', 'connectivity', 'deployment', 'synthesis'];
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
        deploymentTarget: deployment,
        hybridModules,
        sources,
        advancedTelemetry: true
      });
    }
  };

  const handleAiSuggest = async () => {
    setIsAiSuggesting(true);
    try {
      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Suggest a kernel configuration for this project goal: "${aiPrompt}". 
          Pick one engine from: v3-stable, v4-beta, v2-legacy, hybrid-custom.
          Pick modules from: wasi, assets, multiplayer, physics, compiler, mesh-opt.
          Return ONLY JSON in this format: {"engine": "...", "modules": ["...", "..."], "reasoning": "..."}`,
          history: [],
          context: { pods: [], scenes: [], viewMode: 'setup' }
        })
      });

      if (!response.ok) throw new Error('AI suggestion failed');
      const data = await response.json();
      
      // Handle markdown code block if present
      const cleanJson = data.content.includes('```json') 
        ? data.content.split('```json')[1].split('```')[0].trim()
        : data.content.includes('```')
          ? data.content.split('```')[1].split('```')[0].trim()
          : data.content.trim();
          
      const suggestion = JSON.parse(cleanJson);
      
      setEngine(suggestion.engine as any);
      setHybridModules(suggestion.modules);
      setAiPrompt("");
      // Show some feedback or log if needed
    } catch (error) {
      console.error('AI Suggestion Error:', error);
    } finally {
      setIsAiSuggesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#0d0f12] flex flex-col font-sans selection:bg-[#00b8ff]/30 selection:text-[#00b8ff] text-[#e2e8f0]">
      {/* GLOBAL HUD STYLES */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        @keyframes pulse-soft {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .animate-pulse-soft { animation: pulse-soft 2s infinite; }
      `}} />

      {/* TOP NAV */}
      <nav className="h-[52px] bg-[#13161b]/80 backdrop-blur-md border-b border-[#1f242d] px-6 flex items-center justify-between shrink-0 sticky top-0 z-[100]">
        <div className="flex items-center gap-5">
           <a href="#" className="flex items-center gap-2 font-mono text-[13px] font-semibold text-[#e2e8f0] no-underline">
              <div className="w-[26px] h-[26px] bg-gradient-to-br from-[#00b8ff] via-[#0077ff] to-[#a78bfa] rounded-md flex items-center justify-center text-[11px] text-white font-bold shadow-[0_0_15px_rgba(0,184,255,0.3)]">S</div>
              Spatial_IDE <span className="text-[#8b95a8] font-normal">/ workspace</span>
           </a>
           <div className="nav-divider-v" />
           <span className="font-mono text-[11px] text-[#00b8ff] bg-[#00b8ff]/10 border border-[#00b8ff]/20 px-2.5 py-0.5 rounded-md shadow-[0_0_10px_rgba(0,184,255,0.1)]">Kernel v9.0.Hybrid</span>
        </div>
        <div className="flex items-center gap-2.5">
           <button className="nav-btn-user hover:bg-white/5 transition-colors">Docs</button>
           <button className="nav-btn-user hover:bg-white/5 transition-colors">Settings</button>
           <button className="nav-btn-user text-[#00b8ff] border-[#00b8ff]/30 hover:bg-[#00b8ff]/10 transition-colors">Deploy</button>
        </div>
      </nav>

      <div className="flex-1 grid grid-cols-[220px_1fr_280px] min-h-0 container-custom relative">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
           <div className="absolute -top-[20%] -left-[10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
           <div className="absolute top-[30%] -right-[10%] w-[35%] h-[40%] bg-purple-500/5 blur-[100px] rounded-full" />
           <div className="absolute -bottom-[10%] left-[20%] w-[30%] h-[35%] bg-emerald-500/5 blur-[120px] rounded-full" />
        </div>
        
        {/* SIDEBAR: BUILD PHASES */}
        <aside className="bg-[#13161b] border-r border-[#1f242d] py-5 flex flex-col overflow-y-auto no-scrollbar">
           <div className="px-4 mb-6">
              <div className="font-mono text-[9px] font-semibold tracking-[0.12em] text-[#94a3b8] uppercase mb-2.5 px-1">Build Phases</div>
              <div className="space-y-0.5">
                 <PhaseItem num="01" name="Orchestration" status={currentIndex > 0 ? 'done' : currentIndex === 0 ? 'active' : 'pending'} />
                 <PhaseItem num="02" name="Connectivity" status={currentIndex > 1 ? 'done' : currentIndex === 1 ? 'active' : 'pending'} />
                 <PhaseItem num="03" name="Deployment" status={currentIndex > 2 ? 'done' : currentIndex === 2 ? 'active' : 'pending'} />
                 <PhaseItem num="04" name="Synthesis" status={currentIndex === 3 ? 'active' : 'pending'} />
              </div>
           </div>

           <div className="px-4 mt-auto mb-4">
              <div className="font-mono text-[9px] font-semibold tracking-[0.12em] text-[#94a3b8] uppercase mb-2.5 px-1">Active Stack</div>
              <div className="p-1 space-y-1.5">
                 <div className="font-mono text-[11px] text-[#00e5a0] flex items-center gap-1.5 ">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00e5a0] shadow-[0_0_8px_#00e5a0]" />
                    Hybrid Core Active
                 </div>
                 <div className="font-mono text-[11px] text-[#94a3b8] leading-relaxed">
                    Runtime: WASI<br/>
                    Cluster: {deployment.toUpperCase().replace(/-/g, '_')}<br/>
                    Workers: 3 active<br/>
                    PID: 4821
                 </div>
              </div>
           </div>
        </aside>

        {/* MAIN: CONTENT AREA */}
        <main className="bg-[#0d0f12] overflow-y-auto no-scrollbar flex flex-col h-full px-12 py-10">
           <div className="max-w-[900px] w-full mx-auto flex-1 space-y-12">
              <header className="pb-8 border-b border-[#1f242d]">
                <div className="font-mono text-[11px] text-[#94a3b8] mb-3 flex items-center gap-1.5 font-medium tracking-wide">
                   Spatial_IDE › Kernel › <span className="text-[#cbd5e1] capitalize font-bold">Synthesis</span>
                </div>
                <h1 className="text-[28px] font-bold tracking-tight text-[#f8fafc] mb-3 uppercase">
                   Kernel Synthesis
                </h1>
                <p className="text-[#94a3b8] text-[15px] leading-relaxed max-w-[600px] font-medium">
                   Merge core engine components to synthesize your custom 3D development kernel. Select a primary engine base and configure integration modules.
                </p>
              </header>

              {/* ACTIVE HUD BAR */}
              <div className="h-14 bg-[#13161b] border border-[#252b36] rounded-xl px-5 flex items-center gap-4 font-mono text-[11px] select-none shadow-sm">
                 <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-[#00e5a0] shadow-[0_0_8px_#00e5a0] animate-pulse-soft" />
                    <span className="text-[#cbd5e1] font-bold uppercase tracking-wider">Active Hybrid Stack</span>
                 </div>
                 <div className="flex-1 flex items-center gap-3">
                    <span className="text-[#475569] h-4 w-px bg-[#252b36]" />
                    <span className="text-[#f8fafc] font-black uppercase tracking-tight">core</span>
                    <span className="text-[#4b5563] font-bold">·</span>
                    <span className="text-[#94a3b8] font-bold">60_FPS</span>
                    <span className="text-[#4b5563] font-bold">·</span>
                    <span className="text-[#00e5a0] font-black uppercase tracking-widest text-[9px] bg-[#00e5a0]/10 px-2 py-0.5 rounded border border-[#00e5a0]/20">system_healthy</span>
                 </div>
              </div>

              {/* STEP RENDERERS */}
              <AnimatePresence mode="wait">
                <motion.div key={currentStep} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-16">
                  {currentStep === 'orchestration' && (
                    <>
                    <section>
                      <div className="bg-[#1a1e25]/50 border border-white/5 rounded-2xl p-6 mb-8 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10 flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                              <Sparkles size={20} />
                           </div>
                           <div className="flex-1">
                              <h3 className="text-sm font-bold text-white mb-1 uppercase tracking-wider">AI Synthesis Assistant</h3>
                              <p className="text-xs text-[#94a3b8] font-medium">Describe your project goal and let Gemini suggest the optimal kernel stack.</p>
                           </div>
                        </div>
                        <div className="mt-4 relative flex items-center">
                           <input 
                             type="text" 
                             placeholder="Describe project (e.g. 'Multiplayer ray-traced dungeon explorer')"
                             className="w-full bg-[#0d0f12] border border-white/10 rounded-xl py-3 pl-4 pr-32 text-xs text-white outline-none focus:border-blue-500/50 transition-all font-medium"
                             value={aiPrompt}
                             onChange={(e) => setAiPrompt(e.target.value)}
                             onKeyDown={(e) => e.key === 'Enter' && handleAiSuggest()}
                           />
                           <button 
                             onClick={handleAiSuggest}
                             disabled={!aiPrompt.trim() || isAiSuggesting}
                             className="absolute right-1.5 px-4 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-50 flex items-center gap-2"
                           >
                             {isAiSuggesting ? <Loader2 size={12} className="animate-spin" /> : 'Suggest'}
                           </button>
                        </div>
                      </div>

                      <div className="text-[12px] font-bold text-[#64748b] uppercase tracking-[0.2em] flex items-center gap-4 mb-6 after:content-[''] after:flex-1 after:h-[1px] after:bg-[#1f242d] selection:bg-none">
                         <span className="text-[#00b8ff]">01.</span> Primary Engine Base
                      </div>
                      <div className="grid grid-cols-2 gap-6 mb-2">
                         <EngineCard 
                           selected={engine === 'v3-stable'} 
                           onClick={() => {}} 
                           onDoubleClick={() => setEngine('v3-stable')}
                           version="V3 Pro" 
                           name="Production Engine" 
                           tag="GLTF / WebVR / Stable" 
                           desc="The industry standard for high-fidelity web experiences. Optimized for stable frame rates and cross-platform compatibility."
                           accent="blue" 
                         />
                         <EngineCard 
                           selected={engine === 'v4-beta'} 
                           onClick={() => {}} 
                           onDoubleClick={() => setEngine('v4-beta')}
                           version="V4 Hyper" 
                           name="Neural Engine" 
                           tag="Ray-Tracing / Experimental" 
                           desc="Leverage WebGPU and neural denoising for cinematic fidelity. Supports real-time ray-traced reflections and global illumination."
                           accent="yellow" 
                         />
                         <EngineCard 
                           selected={engine === 'v2-legacy'} 
                           onClick={() => {}} 
                           onDoubleClick={() => setEngine('v2-legacy')}
                           version="V2 Lite" 
                           name="Edge Engine" 
                           tag="Optimized / Low-latency" 
                           desc="Ultra-lightweight binary optimized for edge devices and low-bandwidth environments. Maximum performance with minimal footprint."
                           accent="green" 
                         />
                         <EngineCard 
                           selected={engine === 'hybrid-custom'} 
                           onClick={() => {}} 
                           onDoubleClick={() => setEngine('hybrid-custom')}
                           version="Hybrid" 
                           name="Manual Synthesis" 
                           tag="Custom / Full control" 
                           desc="Synthesize a bespoke kernel by manually bridging modules. Recommended for advanced architecture and custom rendering pipelines."
                           accent="purple" 
                         />
                      </div>
                    </section>

                    <section>
                      <div className="text-[12px] font-bold text-[#64748b] uppercase tracking-[0.2em] flex items-center gap-4 mb-6 after:content-[''] after:flex-1 after:h-[1px] after:bg-[#1f242d]">
                         <span className="text-[#00b8ff]">02.</span> Integration Modules
                      </div>
                      <div className="flex flex-wrap gap-3">
                         <ModuleToggle label="WASI Engine" icon="⚡" on={hybridModules.includes('wasi')} onClick={() => toggleModule('wasi')} />
                         <ModuleToggle label="Asset Stream" icon="📦" on={hybridModules.includes('assets')} onClick={() => toggleModule('assets')} />
                         <ModuleToggle label="Multi-User" icon="👥" on={hybridModules.includes('multiplayer')} onClick={() => toggleModule('multiplayer')} />
                         <ModuleToggle label="GPU Physics" icon="🎮" on={hybridModules.includes('physics')} onClick={() => toggleModule('physics')} />
                         <ModuleToggle label="Live Compiler" icon="◈" on={hybridModules.includes('compiler')} onClick={() => toggleModule('compiler')} />
                         <ModuleToggle label="Mesh Opt" icon="◉" on={hybridModules.includes('mesh-opt')} onClick={() => toggleModule('mesh-opt')} />
                      </div>
                    </section>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* FOOTER ACTIONS */}
              <footer className="mt-12 pt-8 border-t border-[#1f242d] flex items-center justify-between">
                <span className="font-mono text-[11px] text-[#64748b] font-bold tracking-[0.15em] uppercase">
                   Phase {currentIndex + 1} / 4 · {currentStep.replace(/-/g, '_')}
                </span>
                <button 
                  onClick={handleNext}
                  className="bg-[#00b8ff] hover:bg-[#33c9ff] text-black font-bold font-mono text-[13px] px-8 py-3 rounded-lg shadow-[0_0_25px_rgba(0,184,255,0.3)] hover:-translate-y-1 transition-all flex items-center gap-3 group active:scale-95"
                >
                  {currentStep === 'synthesis' ? 'INITIATE_SYNTHESIS' : 'NEXT_PHASE'}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="group-hover:translate-x-1.5 transition-transform">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>
              </footer>
           </div>
        </main>

        {/* RIGHT PANEL: AUDIT */}
        <aside className="bg-[#13161b] border-l border-[#1f242d] p-5 overflow-y-auto no-scrollbar">
           <div className="font-mono text-[10px] font-semibold tracking-[0.12em] text-[#94a3b8] uppercase mb-4">Kernel Config</div>
           <div className="space-y-0">
              <SpecRow label="ENGINE" value={engine === 'v4-beta' ? 'V4 Hyper' : engine === 'v3-stable' ? 'V3 Pro' : engine === 'v2-legacy' ? 'V2 Lite' : 'Hybrid'} color="accent" />
              <SpecRow label="RENDER" value={engine === 'v4-beta' ? 'RAY-TRACING' : 'GLTF / WEBVR'} />
              <SpecRow label="RUNTIME" value="WASI ACTIVE" color="green" />
              <SpecRow label="GPU" value={hybridModules.includes('physics') ? "PHYSICS ON" : "IDLE"} color={hybridModules.includes('physics') ? "green" : "dim"} />
              <SpecRow label="CLUSTER" value={deployment.toUpperCase().replace(/-/g, '_')} />
              <SpecRow label="FPS" value="60" color="green" />
              <SpecRow label="MODULES" value={`${hybridModules.length} active`} color="yellow" />
              <SpecRow label="STATUS" value="Ready" color="green" />
           </div>

           <div className="mt-5 bg-[#0d0f12] border border-[#1f242d] rounded-md p-3 font-mono text-[10px] leading-[1.8] min-h-[140px]">
              <div className="flex gap-2 text-[#94a3b8]">
                <span className="text-[#00e5a0]">›</span>
                <span className="text-[#cbd5e1]">Kernel_Synthesis init</span>
              </div>
              <div className="flex gap-2 text-[#64748b]">
                <span className="text-[#00e5a0]">›</span>
                <span className="text-[#cbd5e1]">Loading {engine === 'v3-stable' ? 'V3 Pro' : 'core'}...</span>
              </div>
              <div className="flex gap-2 text-[#64748b]">
                <span className="text-[#00e5a0]">›</span>
                <span className="text-[#94a3b8]">WASI engine attached</span>
              </div>
              <div className="flex gap-2 text-[#64748b]">
                <span className="text-[#00e5a0]">›</span>
                <span className="text-[#94a3b8]">Worker PID 4821</span>
              </div>
              <div className="flex gap-2 text-[#4a5568]">
                <span className="text-[#00e5a0]">✓</span>
                <span className="text-[#00e5a0]">Stack ready</span>
              </div>
           </div>
        </aside>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .nav-btn-user {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          padding: 5px 12px;
          border-radius: 5px;
          border: 1px solid #252b36;
          background: transparent;
          color: #8b95a8;
          cursor: pointer;
          transition: all 0.15s;
        }
        .nav-btn-user:hover { color: #e2e8f0; border-color: #4a5568; }
        .nav-divider-v { width: 1px; height: 20px; background: #252b36; }
        .container-custom { display: grid; grid-template-columns: 220px 1fr 280px; flex: 1; min-height: 0; }
        @media (max-width: 768px) {
          .container-custom { grid-template-columns: 1fr; }
        }
      `}} />
    </div>
  );
}

function PhaseItem({ num, name, status }: { num: string, name: string, status: 'done' | 'active' | 'pending' }) {
  return (
    <motion.button 
      type="button"
      whileHover={{ x: 4 }}
      className={cn(
        "w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#00b8ff]/50",
        status === 'active' ? "bg-[#00b8ff]/10 border border-[#00b8ff]/20" : "hover:bg-[#1a1e25]"
      )}
    >
       <div className={cn(
         "w-2 h-2 rounded-full shrink-0",
         status === 'done' ? "bg-[#00e5a0]" : 
         status === 'active' ? "bg-[#00b8ff] shadow-[0_0_10px_#00b8ff]" : "bg-[#64748b]"
       )} />
       <div className="flex gap-2.5 items-baseline">
          <span className={cn(
            "font-mono text-[11px] font-bold min-w-[22px]",
            status === 'done' ? "text-[#00e5a0]" : 
            status === 'active' ? "text-[#00b8ff]" : "text-[#475569]"
          )}>{num}</span>
          <span className={cn(
            "text-[13px] transition-colors",
            status === 'active' ? "text-[#f8fafc] font-bold" : "text-[#94a3b8]"
          )}>{name}</span>
       </div>
    </motion.button>
  );
}

function EngineCard({ selected, onClick, onDoubleClick, version, name, tag, desc, accent }: any) {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const accentColors = {
    blue: "text-[#00b8ff]",
    yellow: "text-[#f5c842]",
    green: "text-[#00e5a0]",
    purple: "text-[#a78bfa]"
  };

  const accentBorders = {
    blue: "border-[#00b8ff]/30",
    yellow: "border-[#f5c842]/30",
    green: "border-[#00e5a0]/30",
    purple: "border-[#a78bfa]/30"
  };
  
  const showInfo = isHovered || isExpanded;
  
  return (
    <motion.button 
      type="button"
      onClick={() => {
        setIsExpanded(!isExpanded);
        onClick?.();
      }}
      onDoubleClick={onDoubleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -8, scale: 1.015 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "text-left border-[1.5px] rounded-2xl p-6 cursor-pointer transition-all bg-[#13161b] relative overflow-hidden group outline-none focus-visible:ring-2 focus-visible:ring-[#00b8ff]/50 shadow-2xl",
        selected ? "border-[#00b8ff] bg-[#00b8ff]/10 ring-1 ring-[#00b8ff]/20" : "border-[#1f242d] hover:bg-[#1a1e25]",
        showInfo && !selected && accentBorders[accent as keyof typeof accentBorders]
      )}
    >
       {selected && <motion.div layoutId="accent-line" className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-[#00b8ff] to-[#0077ff]" />}
       <div className="flex items-start justify-between mb-3">
          <span className={cn("font-mono text-[11px] font-bold tracking-[0.1em] uppercase", accentColors[accent as keyof typeof accentColors])}>{version}</span>
          <div className={cn(
            "w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center",
            selected ? "border-[#00b8ff]" : "border-[#252b36]"
          )}>
            {selected && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-2 h-2 rounded-full bg-[#00b8ff]" />}
          </div>
       </div>
       <div className="text-[15px] font-extrabold text-[#f8fafc] mb-1 group-hover:text-[#fff] transition-colors">{name}</div>
       <div className="font-mono text-[10px] text-[#64748b] font-bold tracking-wider mb-2">{tag}</div>
       
       <AnimatePresence initial={false}>
         {showInfo && (
           <motion.div 
             initial={{ height: 0, opacity: 0 }}
             animate={{ height: "auto", opacity: 1 }}
             exit={{ height: 0, opacity: 0 }}
             className="overflow-hidden"
           >
             <p className="text-[13px] text-[#cbd5e1] mt-4 leading-relaxed border-t border-white/5 pt-4 font-medium">
               {desc}
             </p>
             <div className="mt-5 flex items-center gap-2 text-[10px] font-black text-[#00b8ff] uppercase tracking-[0.25em] opacity-90">
                <span>Double click to confirm</span>
                <motion.div animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                  <ChevronRight size={13} />
                </motion.div>
             </div>
           </motion.div>
         )}
       </AnimatePresence>
    </motion.button>
  );
}

function ModuleToggle({ label, icon, on, onClick }: any) {
  return (
    <motion.button 
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "flex items-center gap-3 px-4 py-2.5 rounded-xl border text-[13px] font-bold cursor-pointer transition-all select-none outline-none focus-visible:ring-2 focus-visible:ring-[#00b8ff]/50",
        on ? "border-[#00b8ff] bg-[#00b8ff]/15 text-[#00b8ff] shadow-[0_0_15px_rgba(0,184,255,0.1)]" : "border-[#252b36] bg-[#13161b] text-[#cbd5e1] hover:border-[#4a5568] hover:text-[#f8fafc]"
      )}
    >
       <span className="text-[15px]">{icon}</span>
       <span>{label}</span>
       <div className={cn("w-2 h-2 rounded-full transition-all ml-1", on ? "bg-[#00b8ff] shadow-[0_0_10px_#00b8ff]" : "bg-[#475569]")} />
    </motion.button>
  );
}

function SpecRow({ label, value, color }: { label: string, value: string, color?: string }) {
  const colorMap = {
    accent: "text-[#00b8ff]",
    green: "text-[#00e5a0]",
    yellow: "text-[#f5c842]",
    dim: "text-[#8b95a8]"
  };
  
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-[#1f242d] last:border-none">
       <span className="font-mono text-[10px] text-[#94a3b8] uppercase font-semibold tracking-wider">{label}</span>
       <span className={cn("text-[12px] font-medium text-right", color ? colorMap[color as keyof typeof colorMap] : "text-[#e2e8f0]")}>{value}</span>
    </div>
  );
}
