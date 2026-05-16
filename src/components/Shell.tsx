import React from 'react';
import { 
  Box, 
  Code2, 
  Layout, 
  Terminal as TerminalIcon, 
  Settings as SettingsIcon, 
  Cpu, 
  Workflow, 
  Eye,
  PanelLeftClose,
  PanelLeftOpen,
  Zap
} from 'lucide-react';
import { useWorkspace } from '../WorkspaceContext';
import { cn } from '../lib/utils';
import FileExplorer from './FileExplorer';
import Editor from './Editor';
import Terminal from './Terminal';
import SpatialView from './SpatialView';
import CanvasEditor from './CanvasEditor';
import EngineEditor from './EngineEditor';
import GltfPipeline from './GltfPipeline';
import ProjectSettings from './ProjectSettings';
import AgentSidebar from './AgentSidebar';
import WebView from './WebView';

export default function Shell() {
  const { viewMode, setViewMode, isSidebarOpen, setSidebarOpen, isAgentThinking } = useWorkspace();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-ui-bg text-ui-text select-none">
      {/* Dynamic Nav Rail */}
      <div className="w-16 flex flex-col items-center py-4 bg-ui-panel border-r border-ui-border z-50">
        <div className="w-10 h-10 bg-ui-accent rounded-xl flex items-center justify-center mb-8 shadow-lg shadow-ui-accent/20">
          <Zap className="w-6 h-6 text-white" />
        </div>
        
        <NavButton 
          icon={<Layout className="w-5 h-5" />} 
          label="UI Designer" 
          active={viewMode === 'design'} 
          onClick={() => setViewMode('design')} 
        />
        <NavButton 
          icon={<Cpu className="w-5 h-5" />} 
          label="Engine" 
          active={viewMode === 'engine'} 
          onClick={() => setViewMode('engine')} 
        />
        <NavButton 
          icon={<Eye className="w-5 h-5" />} 
          label="Spatial" 
          active={viewMode === 'spatial'} 
          onClick={() => setViewMode('spatial')} 
        />
        <NavButton 
          icon={<Code2 className="w-5 h-5" />} 
          label="Code" 
          active={viewMode === 'code'} 
          onClick={() => setViewMode('code')} 
        />
        <NavButton 
          icon={<Workflow className="w-5 h-5" />} 
          label="Pipeline" 
          active={viewMode === 'pipeline'} 
          onClick={() => setViewMode('pipeline')} 
        />
        
        <div className="mt-auto">
          <NavButton 
            icon={<SettingsIcon className="w-5 h-5" />} 
            label="Settings" 
            active={false} 
            onClick={() => {}} 
          />
        </div>
      </div>

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col relative min-w-0">
        <div className="flex-1 flex min-w-0">
          {/* Left Panel (File Explorer + Contextual Inspector) */}
          {isSidebarOpen && (
            <div className="w-64 border-r border-ui-border bg-ui-panel/50 flex flex-col animate-in slide-in-from-left duration-300">
               <FileExplorer />
            </div>
          )}

          {/* Core Viewport */}
          <div className="flex-1 flex flex-col min-w-0 relative bg-ui-bg">
            <header className="h-12 border-b border-ui-border flex items-center px-4 justify-between bg-ui-panel/30 backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setSidebarOpen(!isSidebarOpen)}
                  className="p-1.5 hover:bg-white/5 rounded text-ui-text-muted transition-colors"
                >
                  {isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
                </button>
                <div className="flex items-center gap-2 text-[11px] font-medium text-ui-text-muted uppercase tracking-widest">
                  <span className="text-ui-accent opacity-50 font-bold">PROJECT_B</span>
                  <span className="opacity-30">/</span>
                  <span className="text-ui-text">workspace_main</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {isAgentThinking && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-ui-accent/10 border border-ui-accent/20 rounded-full animate-pulse">
                    <div className="w-1.5 h-1.5 bg-ui-accent rounded-full" />
                    <span className="text-[9px] font-bold text-ui-accent uppercase tracking-tighter">Architect Thinking...</span>
                  </div>
                )}
                <button className="px-4 py-1.5 bg-ui-accent text-white rounded-lg text-[11px] font-bold shadow-lg shadow-ui-accent/20 hover:scale-105 transition-all">
                  DEPLOY SPATIAL
                </button>
              </div>
            </header>

            <main className="flex-1 relative min-h-0 flex flex-col">
               {viewMode === 'design' && <CanvasEditor />}
               {viewMode === 'engine' && <EngineEditor />}
               {viewMode === 'spatial' && <SpatialView />}
               {viewMode === 'code' && (
                 <div className="flex-1 flex flex-col h-full overflow-hidden">
                    <Editor />
                 </div>
               )}
               {viewMode === 'pipeline' && <GltfPipeline />}
            </main>

            <Terminal />
          </div>
        </div>
      </div>

      {/* Right Sidebar (Agent & Logistics) */}
      <AgentSidebar />
    </div>
  );
}

function NavButton({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      title={label}
      className={cn(
        "group relative w-12 h-12 flex items-center justify-center rounded-xl mb-4 transition-all duration-300",
        active 
          ? "bg-ui-accent text-white shadow-xl shadow-ui-accent/20 scale-110" 
          : "text-ui-text-muted hover:bg-white/5 hover:text-ui-text"
      )}
    >
      {icon}
      {active && (
        <div className="absolute -left-4 w-1 h-6 bg-ui-accent rounded-r-full" />
      )}
    </button>
  );
}
