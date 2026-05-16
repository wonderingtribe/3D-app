import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { FileNode, Tab, ViewMode, AgentLog, WorkspaceConfig, PipelineItem, WorldEntity, Prefab, Scene } from './types';
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
  isAgentThinking: boolean;
  targetUrl: string;
  config: WorkspaceConfig;
  pipelineItems: PipelineItem[];
  entities: WorldEntity[];
  prefabs: Prefab[];
  scenes: Scene[];
  currentSceneId: string | null;
  
  setFiles: (files: FileNode[]) => void;
  openFile: (path: string) => Promise<void>;
  closeTab: (path: string) => void;
  setActiveTabPath: (path: string) => void;
  saveActiveFile: () => Promise<void>;
  updateTabContent: (path: string, content: string) => void;
  sendTerminalCommand: (cmd: string) => void;
  addAgentLog: (msg: string, type?: AgentLog['type']) => void;
  setViewMode: (mode: ViewMode) => void;
  setSidebarOpen: (open: boolean) => void;
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
  const [viewMode, setViewMode] = useState<ViewMode>('design');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
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
    setTerminalLogs(prev => [...prev, `> ${cmd}`, `Executed: ${cmd}`]);
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

  return (
    <WorkspaceContext.Provider value={{
      files, tabs, activeTabPath, terminalLogs, agentLogs, viewMode, isSidebarOpen, isAgentThinking, targetUrl, config, pipelineItems, entities, prefabs, scenes, currentSceneId,
      setFiles, openFile, closeTab, setActiveTabPath, saveActiveFile, updateTabContent, sendTerminalCommand, addAgentLog,
      setViewMode, setSidebarOpen, setTargetUrl, updateConfig, addPipelineItem,
      setEntities, addEntity, updateEntity, deleteEntity, addPrefab, saveScene, loadScene, createScene
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
