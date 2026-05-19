import React, { useState, useMemo } from 'react';
import { useWorkspace } from '../WorkspaceContext';
import { 
  Box, 
  Activity, 
  Cpu, 
  Database, 
  Network, 
  HardDrive, 
  RefreshCcw, 
  Terminal as TerminalIcon,
  Search,
  Filter,
  MoreVertical,
  RotateCcw
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Pod } from '../types';

export default function KubernetesView() {
  const { pods, refreshPods, rebootPod } = useWorkspace();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeNamespace, setActiveNamespace] = useState<string>("All");
  const [activeStatus, setActiveStatus] = useState<string>("All");

  const namespaces = useMemo(() => ["All", ...new Set(pods.map(p => p.namespace))], [pods]);
  const statuses = ["All", "Running", "Pending", "Failed"];

  const filteredPods = useMemo(() => {
    return pods.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesNamespace = activeNamespace === "All" || p.namespace === activeNamespace;
      const matchesStatus = activeStatus === "All" || p.status === activeStatus;
      return matchesSearch && matchesNamespace && matchesStatus;
    });
  }, [pods, searchQuery, activeNamespace, activeStatus]);

  const stats = useMemo(() => {
    const active = pods.filter(p => p.status === 'Running');
    const totalCpu = active.reduce((acc, p) => acc + p.cpu, 0);
    const totalMem = active.reduce((acc, p) => acc + (p.memory / 1024), 0); // GB
    return {
      cpu: pods.length > 0 ? (totalCpu / (pods.length * 100) * 100).toFixed(1) : "0.0",
      mem: totalMem.toFixed(1),
      net: (Math.random() * 2 + 0.5).toFixed(1),
      storage: Math.round(Math.random() * 500 + 400)
    };
  }, [pods]);

  return (
    <div className="h-full flex flex-col bg-[#0a0b0e] overflow-hidden font-mono">
      {/* Header */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-[#111318]/50">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tighter flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Box className="w-5 h-5 text-blue-400" />
            </div>
            KUBERNETES_ENVIRONMENT
          </h2>
          <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-widest">Cluster_Context: gke_spatial_production_us_west2</p>
        </div>

        <div className="flex items-center gap-4">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
              <input 
                placeholder="FILTER_RESOURCES..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-black/40 border border-white/5 rounded-lg py-1.5 pl-9 pr-4 text-[10px] text-zinc-300 outline-none focus:border-blue-500/50 transition-all w-64 uppercase"
              />
           </div>
           <button 
            onClick={refreshPods}
            className="p-2 hover:bg-white/5 rounded-lg border border-white/5 text-zinc-400 transition-colors active:rotate-180 duration-500"
            title="Refresh All Pods"
          >
              <RefreshCcw className="w-4 h-4" />
           </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6 space-y-8">
        
        {/* Cluster Stats */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard icon={<Cpu className="w-4 h-4" />} label="AGGREGATED_CPU" value={`${stats.cpu}%`} trend="+2.1%" color="text-blue-400" />
          <StatCard icon={<Database className="w-4 h-4" />} label="MEMORY_LOAD" value={`${stats.mem} GB`} trend="-0.5%" color="text-purple-400" />
          <StatCard icon={<Network className="w-4 h-4" />} label="NETWORK_IO" value={`${stats.net} GB/s`} trend="+124MB" color="text-emerald-400" />
          <StatCard icon={<HardDrive className="w-4 h-4" />} label="DISK_OPS" value={`${stats.storage} IOPS`} trend="STABLE" color="text-orange-400" />
        </div>

        {/* Pod List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <Activity className="w-3 h-3" />
              Active_Pods ({filteredPods.length})
            </h3>
            <div className="flex items-center gap-2">
              <select 
                value={activeNamespace}
                onChange={(e) => setActiveNamespace(e.target.value)}
                className="px-3 py-1 bg-black/40 rounded text-[10px] text-zinc-300 font-bold uppercase tracking-wider hover:bg-white/10 border border-white/5 outline-none cursor-pointer"
              >
                {namespaces.map(ns => <option key={ns} value={ns}>NS: {ns}</option>)}
              </select>
              <select 
                value={activeStatus}
                onChange={(e) => setActiveStatus(e.target.value)}
                className="px-3 py-1 bg-black/40 rounded text-[10px] text-zinc-300 font-bold uppercase tracking-wider hover:bg-white/10 border border-white/5 outline-none cursor-pointer"
              >
                {statuses.map(s => <option key={s} value={s}>Status: {s}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {filteredPods.map(pod => (
              <PodRow key={pod.id} pod={pod} onReboot={() => rebootPod(pod.id)} />
            ))}
            {filteredPods.length === 0 && (
              <div className="p-12 text-center border border-dashed border-white/5 rounded-xl bg-white/[0.02]">
                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">No resources match current filter criteria</p>
              </div>
            )}
          </div>
        </div>

        {/* Visual Infrastructure Mesh */}
        <div className="p-8 border border-white/5 rounded-2xl bg-[#0a0b0e] relative overflow-hidden group min-h-[300px]">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05)_0%,transparent_70%)]" />
           <div className="relative w-full h-full flex flex-col items-center justify-center space-y-6">
              <div className="grid grid-cols-8 gap-6">
                 {Array.from({ length: 32 }).map((_, i) => {
                   const isActive = Math.random() > 0.7;
                   return (
                   <div 
                    key={i} 
                    className={cn(
                      "w-3 h-3 rounded-full transition-all duration-700 relative",
                      isActive 
                        ? "bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)] scale-110" 
                        : "bg-white/5"
                    )} 
                   >
                     {isActive && (
                       <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-20" />
                     )}
                   </div>
                 )})}
              </div>
              <div className="text-center z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full mb-2">
                   <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" />
                   <span className="text-[8px] font-bold text-blue-400 uppercase tracking-widest">Live_Telemetry_Link: Active</span>
                </div>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Spatial_Mesh_Topology_V4</p>
                <p className="text-[8px] text-zinc-700 uppercase mt-1 tracking-widest max-w-xs mx-auto">Visualizing inter-pod latency and node saturation across us-west-2 clusters.</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, trend, color }: { icon: React.ReactNode, label: string, value: string, trend: string, color: string }) {
  return (
    <div className="bg-[#111318] border border-white/5 rounded-xl p-4 hover:border-white/10 transition-all group">
      <div className="flex items-center gap-2 mb-3">
        <div className={cn("p-1.5 bg-black/40 rounded-lg", color)}>
          {icon}
        </div>
        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{label}</span>
      </div>
      <div className="flex items-baseline justify-between">
        <div className="text-xl font-bold text-white tracking-tighter">{value}</div>
        <div className={cn("text-[9px] font-bold", trend.startsWith('+') ? "text-emerald-400" : trend === 'STABLE' ? "text-zinc-600" : "text-blue-400")}>{trend}</div>
      </div>
    </div>
  );
}

function PodRow({ pod, onReboot }: { pod: Pod, onReboot: () => void }) {
  return (
    <div className="group bg-[#111318]/40 border border-white/5 rounded-xl p-4 flex items-center gap-6 hover:bg-[#1a1d24]/60 hover:border-blue-500/30 transition-all cursor-pointer">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <div className={cn(
            "w-2 h-2 rounded-full",
            pod.status === 'Running' ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" :
            pod.status === 'Pending' ? "bg-amber-400 animate-pulse" : "bg-zinc-600"
          )} />
          <h4 className="text-[13px] font-bold text-zinc-200 truncate">{pod.name}</h4>
        </div>
        <div className="flex items-center gap-4 text-[9px] text-zinc-600 font-bold uppercase tracking-widest">
          <span>Namespace: <span className="text-zinc-400">{pod.namespace}</span></span>
          <span className="w-1 h-1 bg-zinc-800 rounded-full" />
          <span>Node: <span className="text-zinc-400">{pod.node}</span></span>
          <span className="w-1 h-1 bg-zinc-800 rounded-full" />
          <span>Restarts: <span className="text-zinc-400">{pod.restarts}</span></span>
        </div>
      </div>

      <div className="flex items-center gap-8 text-right">
        <div className="w-24">
          <div className="text-[9px] font-bold text-zinc-600 uppercase mb-1">CPU Usage</div>
          <div className="h-1 bg-black/40 rounded-full overflow-hidden">
             <div className="h-full bg-blue-500/50 transition-all" style={{ width: `${pod.cpu}%` }} />
          </div>
          <div className="mt-1 text-[10px] font-bold text-zinc-400">{pod.cpu}%</div>
        </div>
        
        <div className="w-24">
          <div className="text-[9px] font-bold text-zinc-600 uppercase mb-1">Memory</div>
          <div className="h-1 bg-black/40 rounded-full overflow-hidden">
             <div className="h-full bg-purple-500/50 transition-all" style={{ width: `${(pod.memory / 4096) * 100}%` }} />
          </div>
          <div className="mt-1 text-[10px] font-bold text-zinc-400">{pod.memory} MB</div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={(e) => { e.stopPropagation(); onReboot(); }}
            className="p-2 hover:bg-amber-500/10 rounded-lg text-zinc-600 hover:text-amber-400 transition-all"
            title="Reboot Pod"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-black/40 rounded-lg text-zinc-600 hover:text-white transition-all">
            <TerminalIcon className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-black/40 rounded-lg text-zinc-600 hover:text-white transition-all">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
