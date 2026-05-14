export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
}

export interface Tab {
  path: string;
  name: string;
  content: string;
  isDirty?: boolean;
}

export type ViewMode = 'editor' | 'spatial' | 'preview' | 'hybrid' | 'engine';

export interface WorkspaceConfig {
  engine: "three" | "playcanvas" | "babylon";
  theme: "dark" | "light" | "brutalist";
  panels: {
    left: string[];
    center: string[];
    right: string[];
    bottom: string[];
  };
  tools: string[];
  features: {
    gltfImport: boolean;
    gltfExport: boolean;
    snap: boolean;
    grid: boolean;
    gizmos: boolean;
  };
  skybox: "city" | "night" | "apartment" | "forest" | "dawn" | "sunset" | "warehouse";
  customEngineUrl?: string;
  localDev?: boolean;
  keys?: {
    openai?: string;
    gemini?: string;
    anthropic?: string;
    perplexity?: string;
    groq?: string;
  };
}

export interface PipelineItem {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  type: 'gltf' | 'texture' | 'animation';
  timestamp: string;
}

export interface AgentLog {
  id: string;
  timestamp: number;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'ai' | 'thinking' | 'action';
}

export interface WorldEntity {
  id: string;
  type: 'mesh' | 'light' | 'camera' | 'group';
  name: string;
  x: number;
  y: number;
  z: number;
  scale: number;
  rotation: number;
  properties?: any;
}

export interface Prefab {
  id: string;
  name: string;
  type: 'mesh' | 'light' | 'camera' | 'group';
  properties: any;
}

export interface Scene {
  id: string;
  name: string;
  entities: WorldEntity[];
  timestamp: number;
}
