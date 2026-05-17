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
  Zap,
  BrainCircuit,
  ChevronDown
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
  const { viewMode, setViewMode, isSidebarOpen, setSidebarOpen, isAgentSidebarOpen, setAgentSidebarOpen, isAgentThinking, addAgentLog } = useWorkspace();

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-ui-bg text-ui-text">
      {/* Top Navigation Bar */}
      <header className="h-14 bg-ui-panel border-b border-ui-border flex items-center justify-between px-4 z-50 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-ui-accent rounded-lg flex items-center justify-center shadow-lg shadow-ui-accent/20">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col mr-2">
             <div className="text-[11px] font-bold text-ui-text tracking-widest uppercase">Spatial Platform</div>
             <div className="text-[8px] text-ui-text-muted italic uppercase">Workspace Beta</div>
          </div>
          
          <div className="w-px h-6 bg-ui-border" />
          
          <button 
             onClick={() => setSidebarOpen(!isSidebarOpen)}
             className={cn(
               "flex items-center gap-2 px-3 py-1.5 text-[10px] rounded-md font-bold uppercase transition-all",
               isSidebarOpen ? "bg-ui-accent/20 text-ui-accent border border-ui-accent/30" : "bg-ui-bg border border-ui-border text-ui-text-muted hover:bg-white/5"
             )}
          >
             {isSidebarOpen ? <PanelLeftClose className="w-3.5 h-3.5" /> : <PanelLeftOpen className="w-3.5 h-3.5" />}
             Assets Explorer
          </button>
        </div>

        {/* Tab Navigation Center */}
        <div className="flex bg-ui-bg p-1 rounded-xl border border-ui-border shadow-inner absolute left-1/2 -translate-x-1/2">
           <TopTab label="UI Design" icon={<Layout className="w-3.5 h-3.5" />} active={viewMode === 'design'} onClick={() => setViewMode('design')} />
           <TopTab label="Engine Setup" icon={<Cpu className="w-3.5 h-3.5" />} active={viewMode === 'engine'} onClick={() => setViewMode('engine')} />
           <TopTab label="Spatial View" icon={<Eye className="w-3.5 h-3.5" />} active={viewMode === 'spatial'} onClick={() => setViewMode('spatial')} />
           <TopTab label="Source Code" icon={<Code2 className="w-3.5 h-3.5" />} active={viewMode === 'code'} onClick={() => setViewMode('code')} />
           <TopTab label="Asset Pipeline" icon={<Workflow className="w-3.5 h-3.5" />} active={viewMode === 'pipeline'} onClick={() => setViewMode('pipeline')} />
           <div className="w-px h-6 bg-ui-border mx-2 mt-1" />
           <TopTab label="Settings" icon={<SettingsIcon className="w-3.5 h-3.5" />} active={viewMode === 'settings'} onClick={() => setViewMode('settings' as any)} />
        </div>
        
        {/* Right CTA */}
        <div className="flex items-center gap-3">
            {isAgentThinking && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-ui-accent/10 border border-ui-accent/20 rounded-full animate-pulse mr-2">
                <div className="w-1.5 h-1.5 bg-ui-accent rounded-full" />
                <span className="text-[9px] font-bold text-ui-accent uppercase tracking-tighter">Architect Thinking...</span>
              </div>
            )}
           
           <div className="relative group">
              <button 
                 onClick={() => {
                   addAgentLog("Packaging spatial application...", "thinking");
                   setTimeout(() => {
                     const data = JSON.stringify({ workspace: "Spatial Platform Beta", config: {}, timestamp: new Date().toISOString() }, null, 2);
                     const blob = new Blob([data], { type: 'application/json' });
                     const url = URL.createObjectURL(blob);
                     const a = document.createElement('a');
                     a.href = url;
                     a.download = 'spatial-release.json';
                     a.click();
                     URL.revokeObjectURL(url);
                     addAgentLog("Deployment complete. Released spatial-release.json", "success");
                   }, 1000);
                 }}
                 className="px-5 py-2 pr-10 bg-emerald-500 text-white rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 relative"
              >
                Deploy Project
                <div className="absolute right-0 top-0 bottom-0 w-8 border-l border-white/20 flex items-center justify-center">
                   <ChevronDown className="w-3.5 h-3.5" />
                </div>
              </button>
              
              <div className="absolute right-0 top-full mt-2 w-48 bg-ui-panel border border-ui-border rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col overflow-hidden z-50">
                <button 
                  onClick={() => setViewMode('settings' as any)}
                  className="px-4 py-3 text-[10px] font-bold text-left hover:bg-white/5 uppercase tracking-wider text-ui-text border-b border-ui-border"
                >
                  Export NPM Package
                </button>
                <button 
                  onClick={() => setViewMode('settings' as any)}
                  className="px-4 py-3 text-[10px] font-bold text-left hover:bg-white/5 uppercase tracking-wider text-ui-text"
                >
                  Manage API Keys
                </button>
              </div>
           </div>
           <button 
              onClick={() => setAgentSidebarOpen(!isAgentSidebarOpen)}
              className={cn(
                "p-2 rounded-lg transition-colors border",
                isAgentSidebarOpen ? "bg-ui-accent/20 text-ui-accent border-ui-accent/40" : "bg-ui-bg border-ui-border text-ui-text-muted hover:bg-white/5"
              )}
              title="Toggle Log Output Sidebar"
            >
              <BrainCircuit className="w-4 h-4" />
            </button>
        </div>
      </header>

      {/* Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        {/* Left Panel (File Explorer + Contextual Inspector) */}
        {isSidebarOpen && (
          <div className="w-64 border-r border-ui-border bg-ui-panel flex flex-col shrink-0 z-20 shadow-2xl">
             <FileExplorer />
          </div>
        )}

        {/* Core Viewport */}
        <div className="flex-1 flex flex-col min-w-0 relative bg-ui-bg">
          <main className="flex-1 relative min-h-0 flex flex-col">
             {viewMode === 'design' && <CanvasEditor />}
             {viewMode === 'engine' && <EngineEditor />}
             {viewMode === 'spatial' && <SpatialView />}
             {viewMode === 'settings' && <ProjectSettings />}
             {viewMode === 'code' && (
               <div className="flex-1 flex flex-col h-full overflow-hidden">
                  <Editor />
               </div>
             )}
             {viewMode === 'pipeline' && <GltfPipeline />}
          </main>

          <Terminal />
        </div>

        {/* Right Sidebar (Agent & Logistics) */}
        {isAgentSidebarOpen && (
          <div className="w-80 border-l border-ui-border bg-ui-panel flex flex-col shrink-0 z-20 shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">
             <AgentSidebar />
          </div>
        )}
      </div>
    </div>
  );
}

function TopTab({ label, icon, active, onClick }: { label: string; icon: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all whitespace-nowrap",
        active 
          ? "bg-ui-accent text-white shadow" 
          : "text-ui-text-muted hover:text-ui-text hover:bg-white/5"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

