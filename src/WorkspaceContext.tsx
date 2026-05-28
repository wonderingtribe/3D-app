import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { FileNode, Tab, ViewMode, AgentLog, WorkspaceConfig, PipelineItem, WorldEntity, Prefab, Scene, Pod, WorkspaceSetup, DeploymentTarget } from './types';
import { io, Socket } from 'socket.io-client';

const DEFAULT_CONFIG: WorkspaceConfig = {
  theme: "minimal",
  engine: "three",
  pipeline: {
    autoOptimize: true,
    format: "glb"
  },
  skybox: "city",
  customEngineUrl: "",
  localDev: false,
  keys: {
    openai: "",
    gemini: "",
    anthropic: "",
    perplexity: "",
    groq: ""
  }
};

interface WorkspaceContextType {
  files: FileNode[];
  tabs: Tab[];
  activeTabPath: string | null;
  terminalLogs: string[];
  agentLogs: AgentLog[];
  viewMode: ViewMode;
  isSidebarOpen: boolean;
  isAgentSidebarOpen: boolean;
  isAgentThinking: boolean;
  targetUrl: string;
  config: WorkspaceConfig;
  pipelineItems: PipelineItem[];
  entities: WorldEntity[];
  prefabs: Prefab[];
  scenes: Scene[];
  currentSceneId: string | null;
  pods: Pod[];
  isSetupComplete: boolean;
  setupConfig: WorkspaceSetup | null;
  hybridSplit: boolean;
  synthesisStatus: 'idle' | 'synthesizing' | 'complete';
  activeEngineId: 'unreal' | 'playcanvas' | 'unity' | 'three' | 'babylon';
  setHybridSplit: (val: boolean) => void;
  setSynthesisStatus: (status: 'idle' | 'synthesizing' | 'complete') => void;
  spinUpEnginePod: (engineId: 'unreal' | 'playcanvas' | 'unity' | 'three' | 'babylon', buildTarget?: DeploymentTarget, customOptions?: any) => void;
  
  setFiles: (files: FileNode[]) => void;
  completeSetup: (setup: WorkspaceSetup) => void;
  refreshPods: () => void;
  rebootPod: (id: string) => void;
  deletePod: (id: string) => void;
  openFile: (path: string) => Promise<void>;
  closeTab: (path: string) => void;
  setActiveTabPath: (path: string) => void;
  saveActiveFile: () => Promise<void>;
  updateTabContent: (path: string, content: string) => void;
  sendTerminalCommand: (cmd: string) => void;
  addAgentLog: (msg: string, type?: AgentLog['type']) => void;
  setViewMode: (mode: ViewMode) => void;
  setSidebarOpen: (open: boolean) => void;
  setAgentSidebarOpen: (open: boolean) => void;
  setTargetUrl: (url: string) => void;
  updateConfig: (updates: Partial<WorkspaceConfig>) => void;
  addPipelineItem: (item: Omit<PipelineItem, 'id' | 'status'>) => void;
  setEntities: (entities: WorldEntity[]) => void;
  addEntity: (entity: Omit<WorldEntity, 'id'>) => void;
  updateEntity: (id: string, updates: Partial<WorldEntity>) => void;
  deleteEntity: (id: string) => void;
  addPrefab: (prefab: Omit<Prefab, 'id'>) => void;
  saveScene: (name: string) => void;
  loadScene: (id: string) => void;
  createScene: (name: string) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [files, setFiles] = useState<FileNode[]>([]);
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabPath, setActiveTabPath] = useState<string | null>(null);
  const [terminalLogs, setTerminalLogs] = useState<string[]>(["Spatial Shell v1.0.4", "Connected to engine context..."]);
  const [agentLogs, setAgentLogs] = useState<AgentLog[]>([
    { id: '1', message: 'Canvas ready for spatial reconstruction', type: 'info', timestamp: Date.now() }
  ]);
  const [viewMode, setViewMode] = useState<ViewMode>('pod-studio');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isAgentSidebarOpen, setAgentSidebarOpen] = useState(false);
  const [isAgentThinking, setIsAgentThinking] = useState(false);
  const [targetUrl, setTargetUrl] = useState("https://spatial-engine-v3.dev");
  const [config, setConfig] = useState<WorkspaceConfig>(DEFAULT_CONFIG);
  const [pipelineItems, setPipelineItems] = useState<PipelineItem[]>([]);
  const [entities, setEntities] = useState<WorldEntity[]>([
    { id: '1', type: 'mesh', name: 'Primary Cube', x: 0, y: 2, z: -5, scale: 1, rotation: 0, properties: { color: '#06b6d4' } },
    { id: '2', type: 'light', name: 'Key Light', x: 10, y: 10, z: 10, scale: 1, rotation: 0, properties: { intensity: 1.5, color: '#00ffff' } },
    { id: '3', type: 'mesh', name: 'Ground Plane', x: 0, y: -0.01, z: 0, scale: 20, rotation: 0, properties: { color: '#313131' } },
  ]);
  const [prefabs, setPrefabs] = useState<Prefab[]>([
    { id: 'p1', name: 'Standard Box', type: 'mesh', properties: { scale: 1, color: '#06b6d4' } },
    { id: 'p2', name: 'Point Light', type: 'light', properties: { intensity: 1, color: '#ffffff' } },
    { id: 'p3', name: 'Neon Sphere', type: 'mesh', properties: { scale: 0.5, color: '#ff00ff', emissive: true } },
    { id: 'p4', name: 'Spotlight', type: 'light', properties: { intensity: 3, color: '#00ffff' } },
  ]);
  const [scenes, setScenes] = useState<Scene[]>([
    { id: 's1', name: 'Default Setup', entities: [
      { id: '1', type: 'mesh', name: 'Primary Cube', x: 0, y: 2, z: -5, scale: 1, rotation: 0, properties: { color: '#06b6d4' } },
      { id: '2', type: 'light', name: 'Key Light', x: 10, y: 10, z: 10, scale: 1, rotation: 0, properties: { intensity: 1.5, color: '#00ffff' } },
      { id: '3', type: 'mesh', name: 'Ground Plane', x: 0, y: -0.01, z: 0, scale: 20, rotation: 0, properties: { color: '#313131' } },
    ], timestamp: Date.now() }
  ]);
  const [currentSceneId, setCurrentSceneId] = useState<string | null>('s1');
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [setupConfig, setSetupConfig] = useState<WorkspaceSetup | null>(null);
  const [hybridSplit, setHybridSplit] = useState(false);
  const [synthesisStatus, setSynthesisStatus] = useState<'idle' | 'synthesizing' | 'complete'>('idle');
  const [activeEngineId, setActiveEngineId] = useState<'unreal' | 'playcanvas' | 'unity' | 'three' | 'babylon'>('three');

  // Persistence Logic
  useEffect(() => {
    const savedSetup = localStorage.getItem('spatial_setup');
    const savedEntities = localStorage.getItem('spatial_entities');
    const savedScenes = localStorage.getItem('spatial_scenes');
    const savedEngine = localStorage.getItem('spatial_active_engine');

    if (savedSetup) {
      const parsedSetup = JSON.parse(savedSetup);
      setSetupConfig(parsedSetup);
      setIsSetupComplete(true);
    }
    if (savedEntities) {
      setEntities(JSON.parse(savedEntities));
    }
    if (savedScenes) {
      setScenes(JSON.parse(savedScenes));
    }
    if (savedEngine) {
      setActiveEngineId(savedEngine as any);
    }
  }, []);

  useEffect(() => {
    if (isSetupComplete && setupConfig) {
      localStorage.setItem('spatial_setup', JSON.stringify(setupConfig));
    }
  }, [isSetupComplete, setupConfig]);

  useEffect(() => {
    localStorage.setItem('spatial_entities', JSON.stringify(entities));
  }, [entities]);

  useEffect(() => {
    localStorage.setItem('spatial_scenes', JSON.stringify(scenes));
  }, [scenes]);

  useEffect(() => {
    localStorage.setItem('spatial_active_engine', activeEngineId);
  }, [activeEngineId]);

  const [pods, setPods] = useState<Pod[]>([
    { id: 'p1', name: 'api-server-7fb9-d8s', status: 'Running', cpu: 12, memory: 256, restarts: 0, age: '4d 2h', node: 'node-01', namespace: 'default' },
    { id: 'p2', name: 'spatial-engine-v3-9kx', status: 'Running', cpu: 45, memory: 1024, restarts: 1, age: '2d 4h', node: 'node-02', namespace: 'default' },
    { id: 'p3', name: 'worker-primary-f2s', status: 'Running', cpu: 8, memory: 512, restarts: 0, age: '12d', node: 'node-01', namespace: 'infra' },
    { id: 'p4', name: 'vector-db-0', status: 'Running', cpu: 5, memory: 2048, restarts: 0, age: '30d', node: 'node-03', namespace: 'data' },
    { id: 'p5', name: 'redis-cache-main', status: 'Pending', cpu: 0, memory: 0, restarts: 0, age: '12s', node: 'node-02', namespace: 'infra' },
  ]);

  // Simulate Telemetry
  useEffect(() => {
    const interval = setInterval(() => {
      setPods(prev => prev.map(p => {
        if (p.status !== 'Running') return p;
        // Jitter CPU and Memory slightly
        const cpuJitter = (Math.random() - 0.5) * 5;
        const memJitter = (Math.random() - 0.5) * 10;
        return {
          ...p,
          cpu: Math.max(1, Math.min(99, Math.round(p.cpu + cpuJitter))),
          memory: Math.max(100, Math.min(4096, Math.round(p.memory + memJitter)))
        };
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const refreshPods = () => {
    addAgentLog('Refreshing Kubernetes pod state...', 'info');
    // Simulate a brief pending state for the one that is pending
    setPods(prev => prev.map(p => p.status === 'Pending' ? { ...p, status: 'Running', cpu: 5, memory: 128 } : p));
  };

  const rebootPod = (id: string) => {
    setPods(prev => prev.map(p => {
      if (p.id === id) {
        addAgentLog(`Rebooting pod: ${p.name}`, 'warning');
        return { ...p, status: 'Pending', cpu: 0, restarts: p.restarts + 1 };
      }
      return p;
    }));
    
    setTimeout(() => {
      setPods(prev => prev.map(p => p.id === id ? { ...p, status: 'Running', cpu: 10, memory: 256 } : p));
      addAgentLog(`Pod successfully restarted`, 'success');
    }, 3000);
  };

  const deletePod = (id: string) => {
    setPods(prev => {
      const pod = prev.find(p => p.id === id);
      if (pod) {
        addAgentLog(`Deleting pod: ${pod.name}`, 'warning');
      }
      return prev.filter(p => p.id !== id);
    });
  };

  const spinUpEnginePod = (
    engineId: 'unreal' | 'playcanvas' | 'unity' | 'three' | 'babylon',
    buildTarget: DeploymentTarget = 'k8s-pod',
    customOptions: any = {}
  ) => {
    setActiveEngineId(engineId);
    
    const targetName = buildTarget.toUpperCase().replace(/-/g, '_');
    addAgentLog(`Provisioning 3D Cluster Stack: ${engineId.toUpperCase()} with Target ${targetName}...`, 'thinking');
    
    // Clear any existing pods for this engine first
    setPods(prev => prev.filter(p => !p.id.startsWith(`p_${engineId}`)));

    // Create customized Pod or multiple replica pods
    if (buildTarget === 'k8s-deployment') {
      const numReplicas = customOptions?.replicas || 3;
      addAgentLog(`Creating multi-replica K8s Deployment mapping: scaling is capped at ${numReplicas} pods`, 'info');
      
      const replicaPods: Pod[] = Array.from({ length: numReplicas }).map((_, idx) => ({
        id: `p_${engineId}_replica_${idx + 1}`,
        name: `${engineId}-deployment-replica-${idx + 1}`,
        status: 'Pending',
        cpu: 0,
        memory: 0,
        restarts: 0,
        age: '1s',
        node: `node-0${(idx % 3) + 1}`,
        namespace: customOptions?.scalingMetric !== 'None' ? 'autoscale' : 'default'
      }));

      setPods(prev => [...prev, ...replicaPods]);

      setTimeout(() => {
        addAgentLog(`Applying load balancers and ingress hosts config...`, 'info');
      }, 1000);

      setTimeout(() => {
        setPods(prev => prev.map(p => p.id.startsWith(`p_${engineId}_replica`) ? {
          ...p,
          status: 'Running',
          cpu: Math.floor(Math.random() * 20) + 20,
          memory: engineId === 'unreal' ? 1024 : 512,
        } : p));
        addAgentLog(`✔ Kubernetes Deployment finalized successfully: ${numReplicas} active replicas running perfectly.`, 'success');
      }, 2500);

    } else if (buildTarget === 'docker-image') {
      addAgentLog(`Orchestrating containerized compilation sequence for Docker image...`, 'thinking');
      const base = customOptions?.baseImage || 'node:20-alpine';
      const reg = customOptions?.registryUrl || 'gcr.io/spatial-3d';
      
      const buildPod: Pod = {
        id: `p_${engineId}_builder`,
        name: `${engineId}-docker-image-builder`,
        status: 'Pending',
        cpu: 2,
        memory: 512,
        restarts: 0,
        age: '1s',
        node: 'node-02',
        namespace: 'builds'
      };

      setPods(prev => [...prev, buildPod]);

      setTimeout(() => {
        addAgentLog(`$ docker build -f ${engineId}.Dockerfile -t ${reg}/${engineId}-render:latest --build-arg BASE_IMAGE=${base}`, 'info');
        addAgentLog(`[Step 1/3] Copying 3D compiler headers: compiling Draco vertex streams...`, 'info');
        setPods(prev => prev.map(p => p.id === `p_${engineId}_builder` ? { ...p, status: 'Running', cpu: 78 } : p));
      }, 1000);

      setTimeout(() => {
        addAgentLog(`[Step 2/3] Shrinking layout binaries: Draco geometry meshopt pass...`, 'info');
      }, 2000);

      setTimeout(() => {
        setPods(prev => prev.map(p => p.id === `p_${engineId}_builder` ? {
          ...p,
          status: 'Succeeded',
          cpu: 0,
          memory: 0,
        } : p));
        addAgentLog(`✔ Docker Image successfully pushed to registry mapping: ${reg}/${engineId}-render:latest`, 'success');
      }, 3500);

    } else if (buildTarget === 'k8s-dev-container') {
      addAgentLog(`Initiating live-mount decontainer workspace binding...`, 'thinking');
      const mPath = customOptions?.mountPath || '/usr/src/app';
      
      const devPod: Pod = {
        id: `p_${engineId}_dev`,
        name: `${engineId}-dev-decontainer-0`,
        status: 'Pending',
        cpu: 1,
        memory: 256,
        restarts: 0,
        age: '1s',
        node: 'node-01',
        namespace: 'dev'
      };

      setPods(prev => [...prev, devPod]);

      setTimeout(() => {
        addAgentLog(`Mounting host volumes onto container paths: binding workspace ${mPath}...`, 'info');
      }, 1000);

      setTimeout(() => {
        setPods(prev => prev.map(p => p.id === `p_${engineId}_dev` ? {
          ...p,
          status: 'Running',
          cpu: 15,
          memory: 512
        } : p));
        addAgentLog(`✔ Kubernetes decontainer online. Real-time file sync watchers established on port 3000!`, 'success');
      }, 2500);

    } else {
      // Default / standard single pod behavior (e.g. k8s-pod or docker-container or local-process)
      const newPod: Pod = {
        id: `p_${engineId}`,
        name: engineId === 'unreal' ? 'unreal-editor-render-pod' :
              engineId === 'playcanvas' ? 'playcanvas-studio-node-pod' :
              engineId === 'babylon' ? 'babylon-standard-render-pod' :
              engineId === 'unity' ? 'unity-wasm-reflect-pod' : 'threejs-webgpu-sandbox-pod',
        status: 'Pending',
        cpu: 1,
        memory: 128,
        restarts: 0,
        age: '1s',
        node: ['unreal', 'babylon'].includes(engineId) ? 'node-gpu-01' : 'node-02',
        namespace: buildTarget === 'docker-container' ? 'docker' : 'engine'
      };
      setPods(prev => [...prev, newPod]);

      setTimeout(() => {
        addAgentLog(`Connecting storage claims & starting compiler stream on port 3000...`, 'info');
      }, 1000);

      setTimeout(() => {
        setPods(prev => prev.map(p => p.id === `p_${engineId}` ? {
          ...p,
          status: 'Running',
          cpu: engineId === 'unreal' ? 84 : engineId === 'playcanvas' ? 35 : engineId === 'babylon' ? 42 : engineId === 'unity' ? 55 : 20,
          memory: engineId === 'unreal' ? 3072 : engineId === 'playcanvas' ? 1024 : engineId === 'babylon' ? 1280 : engineId === 'unity' ? 1536 : 512,
        } : p));
        addAgentLog(`✔ [${buildTarget.toUpperCase()}] ${engineId.toUpperCase()} workspace container in running state! Port 3000 is open.`, 'success');
      }, 2500);
    }
  };

  const addAgentLog = (message: string, type: AgentLog['type'] = 'info') => {
    setAgentLogs(prev => [{ id: Math.random().toString(), message, type, timestamp: Date.now() }, ...prev]);
  };

  const openFile = async (path: string) => {
    if (tabs.find(t => t.path === path)) {
      setActiveTabPath(path);
      return;
    }
    const nodes = path.split('/');
    const name = nodes[nodes.length - 1];
    setTabs(prev => [...prev, { path, name, content: '// Content for ' + path }]);
    setActiveTabPath(path);
  };

  const closeTab = (path: string) => {
    setTabs(prev => prev.filter(t => t.path !== path));
    if (activeTabPath === path) {
      setActiveTabPath(tabs[tabs.length - 2]?.path || null);
    }
  };

  const updateTabContent = (path: string, content: string) => {
    setTabs(prev => prev.map(t => t.path === path ? { ...t, content, isDirty: true } : t));
  };

  const saveActiveFile = async () => {
    if (!activeTabPath) return;
    setTabs(prev => prev.map(t => t.path === activeTabPath ? { ...t, isDirty: false } : t));
    addAgentLog(`Saved changes to ${activeTabPath}`, 'success');
  };

  const sendTerminalCommand = (cmd: string) => {
    const rawCmd = cmd.trim().toLowerCase();
    setTerminalLogs(prev => [...prev, `> ${cmd}`]);

    if (rawCmd === 'help') {
      setTerminalLogs(prev => [...prev, 
        'AVAILABLE COMMANDS:',
        '  help      - Display this help menu',
        '  cls       - Clear terminal history',
        '  pods      - List all kubernetes pods',
        '  ls        - List workspace files',
        '  whoami    - Display current user context',
        '  reboot    - Usage: reboot [id] (reboots a specific pod)'
      ]);
    } else if (rawCmd === 'cls' || rawCmd === 'clear') {
      setTerminalLogs(["Terminal session cleared."]);
    } else if (rawCmd === 'pods') {
      setTerminalLogs(prev => [...prev, 
        'CURRENT KUBERNETES PODS:',
        ...pods.map(p => `  ${p.name.padEnd(25)} [${p.status.padEnd(10)}] NS:${p.namespace}`)
      ]);
    } else if (rawCmd === 'whoami') {
      setTerminalLogs(prev => [...prev, 'User: Spatial_Architect_01', 'Context: cluster_admin_group']);
    } else if (rawCmd === 'ls') {
      setTerminalLogs(prev => [...prev, 'BUILD_MANIFEST.json', 'spatials.db', 'engine_v3.bin', 'source/']);
    } else if (rawCmd.startsWith('reboot ')) {
      const id = rawCmd.split(' ')[1];
      const pod = pods.find(p => p.id === id || p.name === id);
      if (pod) {
        rebootPod(pod.id);
      } else {
        setTerminalLogs(prev => [...prev, `Error: Pod '${id}' not found.`]);
      }
    } else {
      setTerminalLogs(prev => [...prev, `Command not found: ${cmd}. Type 'help' for options.`]);
    }
  };

  const updateConfig = (updates: Partial<WorkspaceConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const addPipelineItem = (item: Omit<PipelineItem, 'id' | 'status'>) => {
    const newItem: PipelineItem = { ...item, id: Math.random().toString(), status: 'raw' };
    setPipelineItems(prev => [...prev, newItem]);
    setTimeout(() => {
      setPipelineItems(prev => prev.map(i => i.id === newItem.id ? { ...i, status: 'processed' } : i));
    }, 2000);
  };

  const addEntity = (entity: Omit<WorldEntity, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setEntities(prev => [...prev, { ...entity, id }]);
  };

  const updateEntity = (id: string, updates: Partial<WorldEntity>) => {
    setEntities(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const deleteEntity = (id: string) => {
    setEntities(prev => prev.filter(e => e.id !== id));
  };

  const addPrefab = (prefab: Omit<Prefab, 'id'>) => {
    const id = 'p' + (prefabs.length + 1);
    setPrefabs(prev => [...prev, { ...prefab, id }]);
  };

  const saveScene = (name: string) => {
    if (currentSceneId) {
      setScenes(prev => prev.map(s => s.id === currentSceneId ? { ...s, name, entities, timestamp: Date.now() } : s));
      addAgentLog(`Saved scene: ${name}`, 'success');
    } else {
      createScene(name);
    }
  };

  const loadScene = (id: string) => {
    const scene = scenes.find(s => s.id === id);
    if (scene) {
      setEntities([...scene.entities]);
      setCurrentSceneId(id);
      addAgentLog(`Loaded scene: ${scene.name}`, 'info');
    }
  };

  const createScene = (name: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newScene: Scene = { id, name, entities: [...entities], timestamp: Date.now() };
    setScenes(prev => [...prev, newScene]);
    setCurrentSceneId(id);
    addAgentLog(`Created new scene: ${name}`, 'success');
  };

  const completeSetup = (setup: WorkspaceSetup) => {
    setSetupConfig(setup);
    setIsSetupComplete(true);
    localStorage.setItem('spatial_setup', JSON.stringify(setup));
    addAgentLog(`Workspace initialized: ${setup.engineVersion} / ${setup.editorMode}`, 'success');
    
    // Deployment Orchestration Sequence
    setTimeout(() => {
      addAgentLog(`Orchestrating ${setup.deploymentTarget} target...`, 'thinking');
    }, 500);

    setTimeout(() => {
      if (setup.deploymentTarget.startsWith('k8s')) {
        addAgentLog(`Injecting sidecars into Kubernetes cluster...`, 'info');
      } else if (setup.deploymentTarget.startsWith('docker')) {
        addAgentLog(`Pulling spatial runtime image from registry...`, 'info');
      }
    }, 1500);

    setTimeout(() => {
        addAgentLog(`Environment spin-up finalized. Orchestration complete.`, 'success');
    }, 3000);

    // Apply changes based on setup
    if (setup.engineVersion === 'hybrid-custom') {
      addAgentLog(`Synthesizing custom hybrid kernel with ${setup.hybridModules.length} modules`, 'thinking');
      setTargetUrl(setup.sources.engine || "https://hybrid-kernel.local");
    } else {
      setTargetUrl(setup.sources.engine || "https://spatial-engine.default");
    }

    // Initialize clean data plane
    setEntities([]);
  };

  return (
    <WorkspaceContext.Provider value={{
      files, tabs, activeTabPath, terminalLogs, agentLogs, viewMode, isSidebarOpen, isAgentSidebarOpen, isAgentThinking, targetUrl, config, pipelineItems, entities, prefabs, scenes, currentSceneId, pods, isSetupComplete, setupConfig,
      hybridSplit, synthesisStatus, setHybridSplit, setSynthesisStatus, activeEngineId,
      setFiles, openFile, closeTab, setActiveTabPath, saveActiveFile, updateTabContent, sendTerminalCommand, addAgentLog,
      setViewMode, setSidebarOpen, setAgentSidebarOpen, setTargetUrl, updateConfig, addPipelineItem,
      setEntities, addEntity, updateEntity, deleteEntity, addPrefab, saveScene, loadScene, createScene, refreshPods, rebootPod, deletePod, completeSetup, spinUpEnginePod
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error('useWorkspace must be used within a WorkspaceProvider');
  return context;
}
