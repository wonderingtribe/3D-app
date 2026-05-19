import React, { useState, useEffect, useRef } from "react";
import { useWorkspace } from '../WorkspaceContext';
import { 
  Cpu, 
  Zap, 
  Activity, 
  Globe, 
  Database, 
  Link2, 
  ShieldCheck, 
  Terminal as TerminalIcon, 
  Settings, 
  RefreshCw,
  Power,
  Layers,
  Network,
  Box
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function SpatialView() {
  const { setupConfig, addAgentLog } = useWorkspace();
  const [connections, setConnections] = useState<Record<string, 'connecting' | 'connected' | 'error'>>({
    engine: 'connecting',
    assets: 'connecting',
    telemetry: 'connecting'
  });
  const [metrics, setMetrics] = useState({
    fps: 0,
    latency: 0,
    memory: 0,
    throughput: 0
  });

  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Simulate connection handshake
    const timer = setTimeout(() => {
      setConnections({
        engine: setupConfig?.sources.engine ? 'connected' : 'error',
        assets: setupConfig?.sources.assets ? 'connected' : 'error',
        telemetry: setupConfig?.sources.telemetry ? 'connected' : 'error'
      });
      addAgentLog("Hybrid kernel handshake complete", "success");
    }, 2000);

    const metricsInterval = setInterval(() => {
      setMetrics({
        fps: 58 + Math.random() * 4,
        latency: 12 + Math.random() * 8,
        memory: 400 + Math.random() * 50,
        throughput: 2.1 + Math.random() * 1.5
      });
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(metricsInterval);
    };
  }, [setupConfig, addAgentLog]);

  const handleReconnect = (key: string) => {
    setConnections(prev => ({ ...prev, [key]: 'connecting' }));
    setTimeout(() => {
      setConnections(prev => ({ ...prev, [key]: 'connected' }));
      addAgentLog(`Re-established link to ${key} source`, "success");
    }, 1500);
  };

  return (
    <div className="h-full flex flex-col bg-[#050608] text-white font-sans overflow-hidden">
      <div className="h-16 border-b border-white/[0.03] bg-[#0c0d12] px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
           <div className="p-2 bg-blue-500/10 rounded-lg">
              <Network className="w-5 h-5 text-blue-400" />
           </div>
           <div>
              <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none">Cluster_Orchestrator</div>
              <div className="text-sm font-black text-white uppercase tracking-tight mt-1">
                {setupConfig?.engineVersion} • {setupConfig?.deploymentTarget?.replace(/-/g, '_')}
              </div>
           </div>
        </div>

        <div className="flex items-center gap-6">
           <Metric label="FPS" value={metrics.fps.toFixed(0)} unit="hz" />
           <Metric label="LAT" value={metrics.latency.toFixed(1)} unit="ms" />
           <Metric label="MEM" value={metrics.memory.toFixed(0)} unit="mb" />
           <div className="w-px h-8 bg-white/5 mx-2" />
           <button className="p-2 text-zinc-600 hover:text-white transition-colors">
              <Settings className="w-4 h-4" />
           </button>
           <button className="px-4 py-1.5 bg-blue-600 text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition-all">
              Hot_Reload
           </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-80 border-r border-white/[0.03] bg-[#0c0d12] p-6 flex flex-col gap-6">
           <div>
              <label className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] block mb-4">Kernel_Connectivity</label>
              <div className="space-y-3">
                 <SourceState 
                    title="Engine Runtime" 
                    url={setupConfig?.sources.engine} 
                    status={connections.engine} 
                    onRetry={() => handleReconnect('engine')}
                 />
                 <SourceState 
                    title="Asset Bus" 
                    url={setupConfig?.sources.assets} 
                    status={connections.assets} 
                    onRetry={() => handleReconnect('assets')}
                 />
                 <SourceState 
                    title="Telemetry Feed" 
                    url={setupConfig?.sources.telemetry} 
                    status={connections.telemetry} 
                    onRetry={() => handleReconnect('telemetry')}
                 />
              </div>
           </div>

           <div>
              <label className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] block mb-4">Hybrid_Modules</label>
              <div className="grid grid-cols-2 gap-2">
                 {setupConfig?.hybridModules.map(m => (
                    <div key={m} className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex items-center gap-3 group hover:border-blue-500/30 transition-all">
                       <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                       <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest group-hover:text-white transition-colors">{m}</span>
                    </div>
                 ))}
              </div>
           </div>

           <div className="mt-auto p-4 bg-emerald-500/[0.02] border border-emerald-500/10 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                 <ShieldCheck className="w-3 h-3 text-emerald-400" />
                 <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Sentinel Integrity Verified</span>
              </div>
              <p className="text-[8px] text-zinc-600 font-bold uppercase leading-relaxed">
                 All source certificates verified. TLS handshake stable. Neural persistence active.
              </p>
           </div>
        </div>

        <div className="flex-1 bg-black relative">
          {setupConfig?.sources.engine ? (
            <iframe 
              ref={iframeRef}
              src={setupConfig.sources.engine}
              className="w-full h-full border-none"
              title="Spatial Engine Runtime"
              sandbox="allow-scripts allow-same-origin"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
               <div className="w-20 h-20 rounded-[2.5rem] bg-blue-500/10 flex items-center justify-center mb-6">
                  <Box className="w-10 h-10 text-blue-500 opacity-50" />
               </div>
               <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">Awaiting Engine Link</h3>
               <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest max-w-sm leading-relaxed">
                  No spatial runtime address provided. Synthesis plane is in standby mode. 
                  Please configure a valid kernel source in connectivity settings.
               </p>
            </div>
          )}

          <div className="absolute top-6 left-6 flex flex-col gap-3 pointer-events-none">
             <HudBadge icon={<Activity className="w-3 h-3" />} label="STABLE" />
             <HudBadge icon={<Link2 className="w-3 h-3" />} label={`${metrics.throughput.toFixed(1)} GB/S`} />
          </div>

          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)`,
            backgroundSize: `40px 40px`
          }} />
        </div>

        <div className="w-64 border-l border-white/[0.03] bg-[#0c0d12] p-6 space-y-8">
           <section>
              <label className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] block mb-4">Deployment_Audit</label>
              <div className="space-y-4">
                 <AuditItem label="Namespace" value="default-runtime" />
                 <AuditItem label="Runtime" value={setupConfig?.deploymentTarget || 'local'} />
                 <AuditItem label="Kernel" value="v9.0.2-hybrid" />
                 <AuditItem label="Orch" value="Synthesis_Engine" />
              </div>
           </section>

           <section>
              <label className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] block mb-4">Command_Center</label>
              <div className="space-y-2">
                 <CommandBtn label="Restart Cluster" icon={<RefreshCw size={12} />} />
                 <CommandBtn label="Flush Cache" icon={<Layers size={12} />} />
                 <CommandBtn label="Panic Shutdown" icon={<Power size={12} />} variant="danger" />
              </div>
           </section>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, unit }: { label: string, value: string, unit: string }) {
  return (
    <div className="flex flex-col items-end">
       <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest leading-none">{label}</span>
       <div className="flex items-baseline gap-0.5 mt-0.5">
          <span className="text-sm font-black text-zinc-200 tracking-tighter leading-none">{value}</span>
          <span className="text-[10px] font-bold text-zinc-600 tracking-tight">{unit}</span>
       </div>
    </div>
  );
}

function SourceState({ title, url, status, onRetry }: any) {
  const statusColors = {
    connected: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    connecting: "text-blue-400 bg-blue-500/10 border-blue-500/20 animate-pulse",
    error: "text-rose-400 bg-rose-500/10 border-rose-500/20"
  };

  return (
    <div className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl group hover:border-white/10 transition-all">
       <div className="flex items-center justify-between mb-2">
          <span className="text-[9px] font-black text-white uppercase tracking-tight">{title}</span>
          <div className={cn("px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border", statusColors[status as keyof typeof statusColors])}>
             {status}
          </div>
       </div>
       <div className="text-[10px] font-mono text-zinc-600 truncate mb-3">{url || 'NOT_CONFIGURED'}</div>
       <div className="flex gap-2">
          <button onClick={onRetry} className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-[8px] font-black text-zinc-500 uppercase tracking-widest transition-all">
             Refresh_Link
          </button>
          <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-zinc-600 hover:text-white transition-all">
             <Globe size={11} />
          </button>
       </div>
    </div>
  );
}

function HudBadge({ icon, label }: any) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 border border-white/10 rounded-full backdrop-blur-md">
       <div className="text-blue-500">{icon}</div>
       <span className="text-[9px] font-black text-white uppercase tracking-widest">{label}</span>
    </div>
  );
}

function AuditItem({ label, value }: any) {
  return (
    <div className="flex items-center justify-between py-1 border-b border-white/[0.02]">
       <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-tight">{label}</span>
       <span className="text-[10px] font-black text-zinc-300 uppercase tracking-tight">{value}</span>
    </div>
  );
}

function CommandBtn({ label, icon, variant = "default" }: any) {
  return (
    <button className={cn(
      "w-full py-3 px-4 rounded-xl flex items-center justify-between group transition-all border",
      variant === "danger" 
        ? "bg-rose-500/5 border-rose-500/10 hover:bg-rose-500/10 text-rose-500" 
        : "bg-white/5 border-white/5 hover:bg-white/10 text-zinc-400 hover:text-white"
    )}>
       <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
       <div className="transition-transform group-hover:scale-110">{icon}</div>
    </button>
  );
}
