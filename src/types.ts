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

export type ViewMode = 'editor' | 'spatial' | 'preview' | 'hybrid';

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

export interface WorkspaceState {
  targetUrl: string;
}
