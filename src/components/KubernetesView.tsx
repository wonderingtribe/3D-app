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
  RotateCcw,
  Settings
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Pod, DeploymentTarget } from '../types';
import KubernetesHistoricalChart from './KubernetesHistoricalChart';

export default function KubernetesView() {
  const { pods, refreshPods, rebootPod, activeEngineId, spinUpEnginePod } = useWorkspace();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeNamespace, setActiveNamespace] = useState<string>("All");
  const [activeStatus, setActiveStatus] = useState<string>("All");

  const [provisioningId, setProvisioningId] = useState<string | null>(null);
  const [provisionProgress, setProvisionProgress] = useState(0);

  // Advanced 3D Engine Build Target customizability states
  const [selectedEngine, setSelectedEngine] = useState<'unreal' | 'playcanvas' | 'unity' | 'three'>('unreal');
  const [engineBuildTargets, setEngineBuildTargets] = useState<Record<string, DeploymentTarget>>({
    unreal: 'k8s-pod',
    playcanvas: 'k8s-pod',
    unity: 'k8s-pod',
    three: 'k8s-pod',
  });
  const [engineCompileOptions, setEngineCompileOptions] = useState({
    replicas: 3,
    baseImage: 'nvidia/cuda:12.0-base',
    registryUrl: 'gcr.io/spatial-3d/render',
    exposedPort: 3000,
    mountPath: '/usr/src/app',
    autoUpdate: true,
    scalingMetric: 'CPU_utilization_80'
  });

  const handleUpdateEngineTarget = (engineId: 'unreal' | 'playcanvas' | 'unity' | 'three', val: DeploymentTarget) => {
    setEngineBuildTargets(prev => ({ ...prev, [engineId]: val }));
    setSelectedEngine(engineId);
  };

  const handleProvisionEngine = (engineId: 'unreal' | 'playcanvas' | 'unity' | 'three') => {
    setProvisioningId(engineId);
    setProvisionProgress(0);
    
    const target = engineBuildTargets[engineId] || 'k8s-pod';
    spinUpEnginePod(engineId, target, engineCompileOptions);

    const interval = setInterval(() => {
      setProvisionProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setProvisioningId(null);
          return 100;
        }
        return p + 20;
      });
    }, 400);
  };

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

        {/* D3 Historical Pod Loading Chart */}
        <KubernetesHistoricalChart pods={pods} />

        {/* Engine Provisioning Registry */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <Network className="w-3.5 h-3.5 text-blue-400" />
              ENGINE_PROVISIONING_REGISTRY (BUILD & COMPILATION TARGETS)
            </h3>
            <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase">Interactive 3D Orchestrator</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Unreal Card */}
            <div className={cn(
              "p-4 bg-[#111318] border rounded-xl relative overflow-hidden transition-all group flex flex-col justify-between h-[230px]",
              activeEngineId === 'unreal' ? 'border-[#00b8ff] shadow-[0_0_15px_rgba(0,184,255,0.15)] bg-slate-900/10' : 'border-white/5 hover:border-[#00b8ff]/30'
            )}>
              <div>
                <div className="flex justify-between items-start mb-1.5">
                  <span className="text-[9px] font-bold text-[#f5c842] uppercase tracking-widest bg-[#f5c842]/10 border border-[#f5c842]/15 px-2 py-0.5 rounded">HEAVY_GPU</span>
                  <span className="text-[9px] text-[#cbd5e1] uppercase font-mono tracking-wide">PORT: 3000</span>
                </div>
                <h4 className="text-sm font-black text-white uppercase tracking-tight">Unreal Engine 5</h4>
                <p className="text-[9.5px] text-zinc-500 uppercase font-mono mt-0.5 tracking-wider leading-normal">
                  Raytracing Core, Pixel Streaming container pod with multi-threaded shaders.
                </p>
              </div>

              {/* Build Target dropdown */}
              <div className="space-y-1 bg-black/30 p-2 rounded border border-white/5 my-1.5">
                <div className="flex items-center justify-between text-[8px] font-mono text-zinc-500">
                  <span>TARGET:</span>
                  <select 
                    value={engineBuildTargets['unreal'] || 'k8s-pod'}
                    onChange={e => handleUpdateEngineTarget('unreal', e.target.value as DeploymentTarget)}
                    disabled={activeEngineId === 'unreal' || provisioningId === 'unreal'}
                    className="bg-[#050608] border border-white/5 rounded px-1 py-0.5 text-[8.5px] font-mono text-zinc-300 outline-none"
                  >
                    <option value="k8s-pod">K8S Pod</option>
                    <option value="k8s-dev-container">K8S Dev-Container</option>
                    <option value="k8s-deployment">K8S Deployment</option>
                    <option value="docker-image">Docker Image</option>
                    <option value="docker-container">Docker Container</option>
                  </select>
                </div>
              </div>

              <div className="mt-1">
                {provisioningId === 'unreal' ? (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[8.5px] font-bold text-zinc-500">
                      <span>COMPILING LAYERS...</span>
                      <span>{provisionProgress}%</span>
                    </div>
                    <div className="h-1 bg-black/40 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${provisionProgress}%` }} />
                    </div>
                  </div>
                ) : activeEngineId === 'unreal' ? (
                  <div className="w-full text-center py-2 bg-[#00b8ff]/10 text-[#00b8ff] rounded-lg text-[9px] font-extrabold uppercase border border-[#00b8ff]/20">
                    🟢 ACTIVE_{engineBuildTargets['unreal']?.toUpperCase().replace(/-/g, '_')}
                  </div>
                ) : (
                  <button 
                    onClick={() => handleProvisionEngine('unreal')}
                    className="w-full py-2 bg-white/5 hover:bg-white/10 hover:text-[#00b8ff] border border-white/5 rounded-lg text-[9.5px] font-extrabold uppercase text-zinc-400 tracking-wider transition-all"
                  >
                    DEPLOY 3D COMPILER
                  </button>
                )}
              </div>
            </div>

            {/* PlayCanvas Card */}
            <div className={cn(
              "p-4 bg-[#111318] border rounded-xl relative overflow-hidden transition-all group flex flex-col justify-between h-[230px]",
              activeEngineId === 'playcanvas' ? 'border-[#00e5a0] shadow-[0_0_15px_rgba(0,229,160,0.15)] bg-slate-900/10' : 'border-white/5 hover:border-[#00e5a0]/30'
            )}>
              <div>
                <div className="flex justify-between items-start mb-1.5">
                  <span className="text-[9px] font-bold text-[#00e5a0] uppercase tracking-widest bg-[#00e5a0]/10 border border-[#00e5a0]/15 px-2 py-0.5 rounded">WEB_STANDARD</span>
                  <span className="text-[9px] text-[#cbd5e1] uppercase font-mono tracking-wide">PORT: 3001</span>
                </div>
                <h4 className="text-sm font-black text-white uppercase tracking-tight">PlayCanvas Studio</h4>
                <p className="text-[9.5px] text-zinc-500 uppercase font-mono mt-0.5 tracking-wider leading-normal">
                  Full-fidelity Node builder, lightweight web-based developer sandbox.
                </p>
              </div>

              {/* Build Target dropdown */}
              <div className="space-y-1 bg-black/30 p-2 rounded border border-white/5 my-1.5">
                <div className="flex items-center justify-between text-[8px] font-mono text-zinc-500">
                  <span>TARGET:</span>
                  <select 
                    value={engineBuildTargets['playcanvas'] || 'k8s-pod'}
                    onChange={e => handleUpdateEngineTarget('playcanvas', e.target.value as DeploymentTarget)}
                    disabled={activeEngineId === 'playcanvas' || provisioningId === 'playcanvas'}
                    className="bg-[#050608] border border-white/5 rounded px-1 py-0.5 text-[8.5px] font-mono text-zinc-300 outline-none"
                  >
                    <option value="k8s-pod">K8S Pod</option>
                    <option value="k8s-dev-container">K8S Dev-Container</option>
                    <option value="k8s-deployment">K8S Deployment</option>
                    <option value="docker-image">Docker Image</option>
                    <option value="docker-container">Docker Container</option>
                  </select>
                </div>
              </div>

              <div className="mt-1">
                {provisioningId === 'playcanvas' ? (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[8.5px] font-bold text-zinc-500">
                      <span>COMPILING LAYERS...</span>
                      <span>{provisionProgress}%</span>
                    </div>
                    <div className="h-1 bg-black/40 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${provisionProgress}%` }} />
                    </div>
                  </div>
                ) : activeEngineId === 'playcanvas' ? (
                  <div className="w-full text-center py-2 bg-[#00e5a0]/10 text-[#00e5a0] rounded-lg text-[9px] font-extrabold uppercase border border-[#00e5a0]/20">
                    🟢 ACTIVE_{engineBuildTargets['playcanvas']?.toUpperCase().replace(/-/g, '_')}
                  </div>
                ) : (
                  <button 
                    onClick={() => handleProvisionEngine('playcanvas')}
                    className="w-full py-2 bg-white/5 hover:bg-white/10 hover:text-[#00e5a0] border border-white/5 rounded-lg text-[9.5px] font-extrabold uppercase text-zinc-400 tracking-wider transition-all"
                  >
                    DEPLOY 3D COMPILER
                  </button>
                )}
              </div>
            </div>

            {/* Unity Card */}
            <div className={cn(
              "p-4 bg-[#111318] border rounded-xl relative overflow-hidden transition-all group flex flex-col justify-between h-[230px]",
              activeEngineId === 'unity' ? 'border-[#a78bfa] shadow-[0_0_15px_rgba(167,139,250,0.15)] bg-slate-900/10' : 'border-white/5 hover:border-[#a78bfa]/30'
            )}>
              <div>
                <div className="flex justify-between items-start mb-1.5">
                  <span className="text-[9px] font-bold text-[#a78bfa] uppercase tracking-widest bg-[#a78bfa]/10 border border-[#a78bfa]/15 px-2 py-0.5 rounded">WASM_COMPILER</span>
                  <span className="text-[9px] text-[#cbd5e1] uppercase font-mono tracking-wide">PORT: 3002</span>
                </div>
                <h4 className="text-sm font-black text-white uppercase tracking-tight">Unity Reflect</h4>
                <p className="text-[9.5px] text-zinc-500 uppercase font-mono mt-0.5 tracking-wider leading-normal">
                  Real-time C# WASM dynamic linking proxy, memory layout inspectors.
                </p>
              </div>

              {/* Build Target dropdown */}
              <div className="space-y-1 bg-black/30 p-2 rounded border border-white/5 my-1.5">
                <div className="flex items-center justify-between text-[8px] font-mono text-zinc-500">
                  <span>TARGET:</span>
                  <select 
                    value={engineBuildTargets['unity'] || 'k8s-pod'}
                    onChange={e => handleUpdateEngineTarget('unity', e.target.value as DeploymentTarget)}
                    disabled={activeEngineId === 'unity' || provisioningId === 'unity'}
                    className="bg-[#050608] border border-white/5 rounded px-1 py-0.5 text-[8.5px] font-mono text-zinc-300 outline-none"
                  >
                    <option value="k8s-pod">K8S Pod</option>
                    <option value="k8s-dev-container">K8S Dev-Container</option>
                    <option value="k8s-deployment">K8S Deployment</option>
                    <option value="docker-image">Docker Image</option>
                    <option value="docker-container">Docker Container</option>
                  </select>
                </div>
              </div>

              <div className="mt-1">
                {provisioningId === 'unity' ? (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[8.5px] font-bold text-zinc-500">
                      <span>COMPILING LAYERS...</span>
                      <span>{provisionProgress}%</span>
                    </div>
                    <div className="h-1 bg-black/40 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 transition-all duration-300" style={{ width: `${provisionProgress}%` }} />
                    </div>
                  </div>
                ) : activeEngineId === 'unity' ? (
                  <div className="w-full text-center py-2 bg-[#a78bfa]/10 text-[#a78bfa] rounded-lg text-[9px] font-extrabold uppercase border border-[#a78bfa]/20">
                    🟢 ACTIVE_{engineBuildTargets['unity']?.toUpperCase().replace(/-/g, '_')}
                  </div>
                ) : (
                  <button 
                    onClick={() => handleProvisionEngine('unity')}
                    className="w-full py-2 bg-white/5 hover:bg-white/10 hover:text-[#a78bfa] border border-white/5 rounded-lg text-[9.5px] font-extrabold uppercase text-zinc-400 tracking-wider transition-all"
                  >
                    DEPLOY 3D COMPILER
                  </button>
                )}
              </div>
            </div>

            {/* General WebGL Card */}
            <div className={cn(
              "p-4 bg-[#111318] border rounded-xl relative overflow-hidden transition-all group flex flex-col justify-between h-[230px]",
              activeEngineId === 'three' ? 'border-zinc-500 shadow-[0_0_15px_rgba(255,255,255,0.05)] bg-[#111318]' : 'border-white/5 hover:border-zinc-500/30'
            )}>
              <div>
                <div className="flex justify-between items-start mb-1.5">
                  <span className="text-[9px] font-bold text-[#64748b] uppercase tracking-widest bg-[#64748b]/10 border border-[#64748b]/15 px-2 py-0.5 rounded">LIGHT_EDGE</span>
                  <span className="text-[9px] text-[#cbd5e1] uppercase font-mono tracking-wide">PORT: 5173</span>
                </div>
                <h4 className="text-sm font-black text-white uppercase tracking-tight">Core WebGL</h4>
                <p className="text-[9.5px] text-zinc-500 uppercase font-mono mt-0.5 tracking-wider leading-normal">
                  WebGL / ThreeJS render thread compiler with real-time frame buffers.
                </p>
              </div>

              {/* Build Target dropdown */}
              <div className="space-y-1 bg-black/30 p-2 rounded border border-white/5 my-1.5">
                <div className="flex items-center justify-between text-[8px] font-mono text-zinc-500">
                  <span>TARGET:</span>
                  <select 
                    value={engineBuildTargets['three'] || 'k8s-pod'}
                    onChange={e => handleUpdateEngineTarget('three', e.target.value as DeploymentTarget)}
                    disabled={activeEngineId === 'three' || provisioningId === 'three'}
                    className="bg-[#050608] border border-white/5 rounded px-1 py-0.5 text-[8.5px] font-mono text-zinc-300 outline-none"
                  >
                    <option value="k8s-pod">K8S Pod</option>
                    <option value="k8s-dev-container">K8S Dev-Container</option>
                    <option value="k8s-deployment">K8S Deployment</option>
                    <option value="docker-image">Docker Image</option>
                    <option value="docker-container">Docker Container</option>
                  </select>
                </div>
              </div>

              <div className="mt-1">
                {provisioningId === 'three' ? (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[8.5px] font-bold text-zinc-500">
                      <span>COMPILING LAYERS...</span>
                      <span>{provisionProgress}%</span>
                    </div>
                    <div className="h-1 bg-black/40 rounded-full overflow-hidden">
                      <div className="h-full bg-gray-500 transition-all duration-300" style={{ width: `${provisionProgress}%` }} />
                    </div>
                  </div>
                ) : activeEngineId === 'three' ? (
                  <div className="w-full text-center py-2 bg-white/10 text-white rounded-lg text-[9px] font-extrabold uppercase border border-white/20">
                    🟢 ACTIVE_{engineBuildTargets['three']?.toUpperCase().replace(/-/g, '_')}
                  </div>
                ) : (
                  <button 
                    onClick={() => handleProvisionEngine('three')}
                    className="w-full py-2 bg-white/5 hover:bg-white/10 hover:text-white border border-white/5 rounded-lg text-[9.5px] font-extrabold uppercase text-zinc-400 tracking-wider transition-all"
                  >
                    DEPLOY 3D COMPILER
                  </button>
                )}
              </div>
            </div>

          </div>

          {/* Dynamic Build Customizer Panel for all 4 Engines */}
          <div className="p-5 bg-[#0e1115]/80 border border-white/5 rounded-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
              <h3 className="text-[10px] font-bold text-[#00b8ff] uppercase tracking-wider flex items-center gap-2">
                <Settings className="w-3.5 h-3.5" />
                Build Configuration Parameters: {selectedEngine.toUpperCase()} ({engineBuildTargets[selectedEngine]?.toUpperCase().replace(/-/g, '_')})
              </h3>
              <span className="text-[8.5px] font-mono text-zinc-500 font-bold bg-white/5 px-2 py-0.5 rounded lowercase">interactive 3D container customization</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-zinc-400 font-mono block uppercase">Registry Repo Path / Image Tag</label>
                <input 
                  type="text" 
                  className="w-full bg-[#050608] border border-white/5 rounded-lg p-2 text-xs font-mono text-zinc-200 outline-none focus:border-blue-500/40"
                  value={engineCompileOptions.registryUrl}
                  onChange={e => setEngineCompileOptions(prev => ({ ...prev, registryUrl: e.target.value }))}
                />
                <span className="text-[8px] text-zinc-500 font-mono block">Target repository endpoint for push compilation actions</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-zinc-400 font-mono block uppercase">Docker Base Configuration Image</label>
                <input 
                  type="text" 
                  className="w-full bg-[#050608] border border-white/5 rounded-lg p-2 text-xs font-mono text-zinc-200 outline-none focus:border-blue-500/40"
                  value={engineCompileOptions.baseImage}
                  onChange={e => setEngineCompileOptions(prev => ({ ...prev, baseImage: e.target.value }))}
                />
                <span className="text-[8px] text-zinc-500 font-mono block">e.g. nvidia/cuda:12.0-base base layers</span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center bg-[#050608] p-1 px-2 rounded-lg border border-white/5">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider font-mono">Deployment Replicas</label>
                  <span className="font-mono text-xs text-[#00b8ff] font-bold">{engineCompileOptions.replicas} INSTANCES</span>
                </div>
                <input 
                  type="range" 
                  min={1} 
                  max={8} 
                  step={1}
                  value={engineCompileOptions.replicas} 
                  onChange={e => setEngineCompileOptions(prev => ({ ...prev, replicas: Number(e.target.value) }))}
                  className="w-full accent-[#00b8ff] bg-zinc-950 p-1 cursor-pointer rounded-lg h-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-zinc-400 font-mono block uppercase">Condition Auto-Scaling Metric</label>
                <select 
                  value={engineCompileOptions.scalingMetric}
                  onChange={e => setEngineCompileOptions(prev => ({ ...prev, scalingMetric: e.target.value }))}
                  className="w-full bg-[#050608] border border-white/5 rounded-lg p-2 text-xs font-mono text-zinc-300 outline-none focus:border-blue-500/40 cursor-pointer"
                >
                  <option value="CPU_utilization_80">Average CPU Utilization &gt; 80%</option>
                  <option value="Memory_saturation_75">Memory saturation &gt; 75%</option>
                  <option value="Network_Throughput_60">Active requests thread size &gt; 500/s</option>
                  <option value="None">None (Static Replica Bounds)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-zinc-400 font-mono block uppercase">Host Dev Mount Volume Mapping Path</label>
                <input 
                  type="text" 
                  className="w-full bg-[#050608] border border-white/5 rounded-lg p-2 text-xs font-mono text-zinc-200 outline-none focus:border-blue-500/40"
                  value={engineCompileOptions.mountPath}
                  onChange={e => setEngineCompileOptions(prev => ({ ...prev, mountPath: e.target.value }))}
                />
              </div>
            </div>
          </div>
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
