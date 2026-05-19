export type ViewMode = 'design' | 'engine' | 'spatial' | 'code' | 'pipeline' | 'settings' | 'infrastructure' | 'assistant';

export interface Pod {
  id: string;
  name: string;
  status: 'Running' | 'Pending' | 'Succeeded' | 'Failed' | 'Unknown';
  cpu: number;
  memory: number;
  restarts: number;
  age: string;
  node: string;
  namespace: string;
}

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  content?: string;
}

export interface Tab {
  path: string;
  name: string;
  content: string;
  isDirty?: boolean;
}

export interface AgentLog {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'thinking';
  timestamp: number;
}

export interface WorkspaceConfig {
  theme: "brutalist" | "minimal" | "cyber" | "soft";
  engine: "three" | "babylon" | "playcanvas" | "unity-webgl" | "unreal";
  pipeline: {
    autoOptimize: boolean;
    format: "glb" | "gltf" | "usdz";
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
  type: 'gltf' | 'texture' | 'audio' | 'script';
  status: 'raw' | 'processed' | 'error';
  size?: number;
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
  type: WorldEntity['type'];
  properties: any;
}

export interface Scene {
  id: string;
  name: string;
  entities: WorldEntity[];
  timestamp: number;
}

export interface WorkspaceSetup {
  engineVersion: 'v3-stable' | 'v4-beta' | 'v2-legacy' | 'hybrid-custom';
  editorMode: 'full' | 'code-lite' | 'spatial-only';
  hybridModules: string[];
  sources: {
    engine?: string;
    assets?: string;
    telemetry?: string;
  };
  customConfig?: string;
  advancedTelemetry: boolean;
}
