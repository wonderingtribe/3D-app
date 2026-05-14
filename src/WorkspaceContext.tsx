import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { FileNode, Tab, ViewMode, AgentLog, WorkspaceConfig, PipelineItem, WorldEntity, Prefab, Scene } from './types';
import { io, Socket } from 'socket.io-client';
import { askAgent } from './services/geminiService';

const DEFAULT_CONFIG: WorkspaceConfig = {
  engine: "three",
  theme: "dark",
  panels: {
    left: ["files", "assets"],
    center: ["viewport"],
    right: ["inspector", "ai"],
    bottom: ["terminal", "console"]
  },
  tools: ["translate", "rotate", "scale", "orbit"],
  features: {
    gltfImport: true,
    gltfExport: true,
    snap: true,
    grid: true,
    gizmos: true
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
  activeModel: string;
  activeProvider: string;
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
  sendTerminalCommand: (command: string) => void;
  addAgentLog: (message: string, type: AgentLog['type']) => void;
  setViewMode: (mode: ViewMode) => void;
  setSidebarOpen: (open: boolean) => void;
  setTargetUrl: (url: string) => void;
  setModel: (model: string) => void;
  setProvider: (provider: string) => void;
  executeAgentTask: (prompt: string) => Promise<void>;
  updateConfig: (config: Partial<WorkspaceConfig>) => void;
  addPipelineItem: (item: Omit<PipelineItem, 'id' | 'timestamp' | 'status' | 'progress'>) => void;
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

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [files, setFiles] = useState<FileNode[]>([]);
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabPath, setActiveTabPath] = useState<string | null>(null);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [agentLogs, setAgentLogs] = useState<AgentLog[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('editor');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [activeModel, setActiveModel] = useState('models/gemini-2.0-flash-exp');
  const [activeProvider, setActiveProvider] = useState('google');
  const [isAgentThinking, setIsAgentThinking] = useState(false);
  const [targetUrl, setTargetUrl] = useState('https://dreammakerhub.website');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [config, setConfig] = useState<WorkspaceConfig>(DEFAULT_CONFIG);
  const [pipelineItems, setPipelineItems] = useState<PipelineItem[]>([]);
  const [entities, setEntities] = useState<WorldEntity[]>([
    { id: '1', type: 'mesh', name: 'Primary Cube', x: 0, y: 2, z: -5, scale: 1, rotation: 0, properties: { color: '#06b6d4' } },
    { id: '2', type: 'light', name: 'Key Light', x: 10, y: 10, z: 10, scale: 1, rotation: 0, properties: { intensity: 1.5, color: '#00ffff' } },
    { id: '3', type: 'mesh', name: 'Ground Plane', x: 0, y: -0.01, z: 0, scale: 20, rotation: 0, properties: { color: '#313131' } },
  ]);
  const [prefabs, setPrefabs] = useState<Prefab[]>([
    { id: 'p1', name: 'Standard Box', type: 'mesh', properties: { scale: 1, color: '#06b6d4' } },
    { id: 'p2', name: 'Omni Light', type: 'light', properties: { intensity: 1.5, color: '#ffffff' } },
    { id: 'p3', name: 'Neon Sphere', type: 'mesh', properties: { scale: 1.2, color: '#ff00ff' } },
    { id: 'p4', name: 'Spotlight', type: 'light', properties: { intensity: 3, color: '#00ffff' } },
    { id: 'p5', name: 'Structure Block', type: 'group', properties: { color: '#ffffff' } } as any,
  ]);
  const [scenes, setScenes] = useState<Scene[]>([
    { id: 's1', name: 'Default Setup', entities: [
      { id: '1', type: 'mesh', name: 'Primary Cube', x: 0, y: 2, z: -5, scale: 1, rotation: 0, properties: { color: '#06b6d4' } },
      { id: '2', type: 'light', name: 'Key Light', x: 10, y: 10, z: 10, scale: 1, rotation: 0, properties: { intensity: 1.5, color: '#00ffff' } },
      { id: '3', type: 'mesh', name: 'Ground Plane', x: 0, y: -0.01, z: 0, scale: 20, rotation: 0, properties: { color: '#313131' } },
    ], timestamp: Date.now() }
  ]);
  const [currentSceneId, setCurrentSceneId] = useState<string | null>('s1');

  const refreshFiles = useCallback(async () => {
    const res = await fetch('/api/files');
    const data = await res.json();
    setFiles(data);
  }, []);

  useEffect(() => {
    const s = io();
    setSocket(s);

    s.on('terminal-output', (data: string) => {
      setTerminalLogs(prev => [...prev.slice(-100), data]);
    });

    refreshFiles();

    return () => {
      s.disconnect();
    };
  }, [refreshFiles]);

  const openFile = useCallback(async (path: string) => {
    if (tabs.find(t => t.path === path)) {
      setActiveTabPath(path);
      return;
    }

    const res = await fetch(`/api/file-content?filePath=${encodeURIComponent(path)}`);
    const { content } = await res.json();
    
    const newTab: Tab = {
      path,
      name: path.split('/').pop() || path,
      content,
      isDirty: false
    };

    setTabs(prev => [...prev, newTab]);
    setActiveTabPath(path);
  }, [tabs]);

  const closeTab = (path: string) => {
    setTabs(prev => prev.filter(t => t.path !== path));
    if (activeTabPath === path) {
      setActiveTabPath(tabs.find(t => t.path !== path)?.path || null);
    }
  };

  const updateTabContent = (path: string, content: string) => {
    setTabs(prev => prev.map(t => t.path === path ? { ...t, content, isDirty: true } : t));
  };

  const saveActiveFile = async () => {
    const tab = tabs.find(t => t.path === activeTabPath);
    if (!tab) return;

    await fetch('/api/save-file', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filePath: tab.path, content: tab.content })
    });

    setTabs(prev => prev.map(t => t.path === activeTabPath ? { ...t, isDirty: false } : t));
    addAgentLog(`Saved file: ${tab.path}`, 'success');
  };

  const sendTerminalCommand = (command: string) => {
    // Log the input to the terminal logs so user sees what they typed
    setTerminalLogs(prev => [...prev.slice(-100), `> ${command}`]);

    if (command.startsWith('/')) {
      const [cmd, ...args] = command.split(' ');
      
      // Common Logic for Workspace Commands
      if (cmd === '/clone') {
        const repo = args[0] || "";
        executeAgentTask(`Clone the repository ${repo} into a subdirectory called 'external-source'. Then analyze the project structure.`);
        return;
      }
      if (cmd === '/github') {
        executeAgentTask("Synchronize the current workspace with the upstream GitHub repository. Check for remote changes and merge them.");
        return;
      }
      if (cmd === '/build') {
        executeAgentTask(`Run the build command for the project in 'external-source' and copy the output to the 'generated-editors/local-workspace' directory.`);
        return;
      }
      if (cmd === '/deploy') {
        executeAgentTask("Produce a DISTRIBUTION_MANIFEST.md that catalogs current spatial assets and rendering logic for deployment.");
        return;
      }
      if (cmd === '/test') {
        executeAgentTask("Run the workspace test suite and verify system integrity.");
        return;
      }
      if (cmd === '/config:reset') {
        updateConfig({
          panels: {
            left: ["files", "assets"],
            center: ["viewport"],
            right: ["inspector", "ai"],
            bottom: ["terminal", "console"]
          },
          theme: "dark"
        });
        setTerminalLogs(prev => [...prev, "System configuration reset to factory defaults."]);
        return;
      }
      if (cmd === '/theme:toggle') {
        updateConfig({ theme: config.theme === 'dark' ? 'light' : 'dark' });
        setTerminalLogs(prev => [...prev, `Theme swapped to ${config.theme === 'dark' ? 'light' : 'dark'}`]);
        return;
      }
      if (cmd === '/spatial') {
        setViewMode('spatial');
        return;
      }
      if (cmd === '/engine') {
        setViewMode('engine');
        return;
      }
      if (cmd === '/clear') {
        setTerminalLogs([]);
        return;
      }
      if (cmd === '/help') {
        setTerminalLogs(prev => [
          ...prev, 
          "AVAILABLE COMMANDS:",
          "  /clone <url>    - Clone external repository",
          "  /github         - Sync with GitHub",
          "  /build          - Build external source",
          "  /deploy         - Package for distribution",
          "  /test           - Run workspace tests",
          "  /config:reset   - Reset layout",
          "  /theme:toggle   - Swap light/dark",
          "  /spatial        - Enter spatial view",
          "  /engine         - Enter merged engine editor",
          "  /clear          - Clear terminal",
          "  /help           - Show this message",
          "  [standard bash commands are passed to shell]"
        ]);
        return;
      }
    }
    
    if (socket) {
      socket.emit('terminal-input', command);
    }
  };

  const addAgentLog = (message: string, type: AgentLog['type']) => {
    setAgentLogs(prev => [
      ...prev,
      { id: Math.random().toString(36).substr(2, 9), timestamp: Date.now(), message, type }
    ]);
  };

  const executeAgentTask = async (prompt: string) => {
    setIsAgentThinking(true);
    addAgentLog(`Initiating autonomous task: ${prompt}`, 'ai');
    
    try {
      const response = await askAgent(prompt, { files, tabs, activeTabPath, targetUrl, config });
      
      if (response.functionCalls) {
        for (const call of response.functionCalls) {
          addAgentLog(`Agent initiating ${call.name} sequence...`, 'action');
          
          if (call.name === 'readFile') {
            await openFile(call.args.path as string);
          } else if (call.name === 'writeFile') {
            const { path: filePath, content: fileContent } = call.args as { path: string, content: string };
            await fetch('/api/save-file', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ filePath, content: fileContent })
            });
            addAgentLog(`File mutated: ${filePath}`, 'success');
            refreshFiles();
            // If the edited file is currently open in a tab, refresh its content in UI
            if (tabs.find(t => t.path === filePath)) {
               setTabs(prev => prev.map(t => t.path === filePath ? { ...t, content: fileContent, isDirty: false } : t));
            }
          } else if (call.name === 'runCommand') {
            addAgentLog(`Executing system command: ${call.args.command}`, 'info');
            sendTerminalCommand(call.args.command as string);
          } else if (call.name === 'updateConfig') {
            const newConfig = call.args as unknown as Partial<WorkspaceConfig>;
            updateConfig(newConfig);
            addAgentLog(`Workspace config synchronized`, 'success');
          }
        }
      }

      if (response.text) {
        addAgentLog(response.text, 'ai');
      }
    } catch (err: any) {
      addAgentLog(`Neural link error: ${err.message}`, 'error');
    } finally {
      setIsAgentThinking(false);
    }
  };

  const updateConfig = (newConfig: Partial<WorkspaceConfig>) => {
    setConfig(prev => ({
      ...prev,
      ...newConfig,
      panels: {
        ...prev.panels,
        ...(newConfig.panels || {})
      },
      features: {
        ...prev.features,
        ...(newConfig.features || {})
      }
    }));
  };

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('theme-dark', 'theme-light', 'theme-brutalist');
    root.classList.add(`theme-${config.theme}`);
  }, [config.theme]);

  const addPipelineItem = (item: Omit<PipelineItem, 'id' | 'timestamp' | 'status' | 'progress'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newItem: PipelineItem = {
      ...item,
      id,
      timestamp: new Date().toLocaleTimeString(),
      status: 'pending',
      progress: 0
    };
    
    setPipelineItems(prev => [newItem, ...prev]);

    // Simulate pipeline processing
    setTimeout(() => {
      setPipelineItems(prev => prev.map(i => i.id === id ? { ...i, status: 'processing', progress: 30 } : i));
      setTimeout(() => {
        setPipelineItems(prev => prev.map(i => i.id === id ? { ...i, progress: 65 } : i));
        setTimeout(() => {
          setPipelineItems(prev => prev.map(i => i.id === id ? { ...i, status: 'completed', progress: 100 } : i));
          addAgentLog(`Pipeline complete: ${item.name} successfully imported.`, 'success');
        }, 1500);
      }, 1000);
    }, 500);
  };

  const addEntity = (entity: Omit<WorldEntity, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newEntity: WorldEntity = {
      ...entity,
      id,
      scale: entity.scale ?? 1,
      rotation: entity.rotation ?? 0,
      z: entity.z ?? 0
    };
    setEntities(prev => [...prev, newEntity]);
  };

  const updateEntity = (id: string, updates: Partial<WorldEntity>) => {
    setEntities(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const deleteEntity = (id: string) => {
    setEntities(prev => prev.filter(e => e.id !== id));
  };

  const addPrefab = (prefab: Omit<Prefab, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
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
      files, tabs, activeTabPath, terminalLogs, agentLogs, viewMode, isSidebarOpen, activeModel, activeProvider, isAgentThinking, targetUrl, config, pipelineItems, entities, prefabs, scenes, currentSceneId,
      setFiles, openFile, closeTab, setActiveTabPath, saveActiveFile, updateTabContent, sendTerminalCommand, addAgentLog,
      setViewMode, setSidebarOpen, setTargetUrl, setModel: setActiveModel, setProvider: setActiveProvider, executeAgentTask, updateConfig, addPipelineItem,
      setEntities, addEntity, updateEntity, deleteEntity, addPrefab, saveScene, loadScene, createScene
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error('useWorkspace must be used within a WorkspaceProvider');
  return context;
};
