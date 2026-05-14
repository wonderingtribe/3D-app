import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileCode, 
  Terminal as TerminalIcon, 
  Settings, 
  Activity, 
  Box, 
  Search, 
  Cpu,
  Github,
  Cloud,
  Database,
  Globe,
  Layers,
  Zap
} from 'lucide-react';
import { useWorkspace } from '../WorkspaceContext';
import FileExplorer from './FileExplorer';
import Editor from './Editor';
import SpatialView from './SpatialView';
import Terminal from './Terminal';
import AgentSidebar from './AgentSidebar';
import CommandNexus from './CommandNexus';
import WebView from './WebView';
import ProjectSettings from './ProjectSettings';
import GltfPipeline from './GltfPipeline';
import { cn } from '../lib/utils';

export default function Shell() {
  const { isSidebarOpen, setSidebarOpen, viewMode, setViewMode, isAgentThinking, executeAgentTask, config } = useWorkspace();
  const [activeSidePanel, setActiveSidePanel] = useState<'files' | 'search' | 'github' | 'settings' | 'pipeline'>('files');

  const hasLeftPanel = config.panels.left.length > 0;
  const hasRightPanel = config.panels.right.length > 0;
  const hasBottomPanel = config.panels.bottom.length > 0;

  return (
    <div className={cn(
      "relative h-full flex flex-col transition-colors duration-500",
      config.theme === 'dark' ? "bg-ui-bg text-slate-300" : 
      config.theme === 'light' ? "bg-slate-50 text-slate-900 border-slate-200" : 
      "bg-black text-lime-400 font-mono" // Brutalist
    )}>
      {/* Top Navigation / Status Bar */}
      <header className={cn(
        "h-12 border-b flex items-center justify-between px-4 z-50",
        config.theme === 'dark' ? "bg-black/40 border-white/5 backdrop-blur-md" :
        config.theme === 'light' ? "bg-white border-slate-200" :
        "bg-black border-lime-400"
      )}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-6 h-6 rounded-md flex items-center justify-center",
              config.theme === 'brutalist' ? "bg-lime-400" : "bg-gradient-to-br from-cyan-500 to-blue-600"
            )}>
              <div className={cn(
                "w-1.5 h-1.5 rounded-full animate-pulse",
                config.theme === 'brutalist' ? "bg-black" : "bg-white shadow-[0_0_8px_white]"
              )}></div>
            </div>
            <span className={cn(
              "font-bold tracking-tight uppercase text-sm",
              config.theme === 'brutalist' ? "text-lime-400" : "text-white"
            )}>AETHER_OS</span>
          </div>
          <div className="h-4 w-[1px] bg-white/10 mx-2"></div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
            <span className="text-[9px] uppercase tracking-widest text-white/50">PROD_READY</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 text-[10px]">
             <div className="flex gap-1 border border-white/5 p-1 rounded-lg bg-black/20">
                <NavButton active={viewMode === 'editor'} onClick={() => setViewMode('editor')} icon={FileCode} />
                <NavButton active={viewMode === 'spatial'} onClick={() => setViewMode('spatial')} icon={Box} />
                <NavButton active={viewMode === 'preview'} onClick={() => setViewMode('preview')} icon={Globe} />
                <NavButton active={viewMode === 'hybrid'} onClick={() => setViewMode('hybrid')} icon={Layers} />
             </div>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-white/40 hidden sm:inline">Engine: <strong className="text-white uppercase">{config.engine}</strong></span>
            <button 
              onClick={async () => {
                const res = await fetch('/api/generate-editor', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ config })
                });
                const data = await res.json();
                executeAgentTask(`I just generated a new editor workspace: ${data.message}. Brief me on how to move this to my website.`);
              }}
              className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-bold rounded-md transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center gap-2"
            >
              <Zap className="w-3 h-3 fill-current" />
              DEPLOY TO WEB
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Area */}
      <main className="flex-1 flex overflow-hidden">
        {/* Slim Activity Bar */}
        {hasLeftPanel && (
          <aside className="w-12 border-r border-white/5 bg-black/20 flex flex-col items-center py-4 gap-4 z-40">
             {config.panels.left.includes('files') && <ActivityIconButton active={activeSidePanel === 'files'} onClick={() => { setActiveSidePanel('files'); setSidebarOpen(true); }} icon={FileCode} />}
             <ActivityIconButton active={activeSidePanel === 'pipeline'} onClick={() => { setActiveSidePanel('pipeline'); setSidebarOpen(true); }} icon={Layers} />
             <ActivityIconButton active={activeSidePanel === 'search'} onClick={() => { setActiveSidePanel('search'); setSidebarOpen(true); }} icon={Search} />
             <ActivityIconButton active={activeSidePanel === 'github'} onClick={() => { setActiveSidePanel('github'); setSidebarOpen(true); }} icon={Github} />
             <div className="mt-auto flex flex-col gap-4 mb-2">
               <ActivityIconButton active={activeSidePanel === 'settings'} onClick={() => { setActiveSidePanel('settings'); setSidebarOpen(true); }} icon={Settings} />
             </div>
          </aside>
        )}

        {/* Dynamic Sidebar Panel */}
        <AnimatePresence initial={false}>
          {isSidebarOpen && hasLeftPanel && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 240, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-r border-white/5 bg-black/10 backdrop-blur-sm overflow-hidden flex flex-col"
            >
              <div className="h-full">
                {activeSidePanel === 'files' && <FileExplorer />}
                {activeSidePanel === 'pipeline' && <GltfPipeline />}
                {activeSidePanel === 'settings' && <ProjectSettings />}
                {activeSidePanel === 'search' && <div className="p-4 text-[10px] text-white/40 uppercase tracking-widest">Global Search</div>}
                {activeSidePanel === 'github' && <div className="p-4 text-[10px] text-white/40 uppercase tracking-widest">Repository Sync</div>}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Content Area */}
        <section className="flex-1 flex flex-col overflow-hidden relative">
           <div className={cn(
             "flex-1 flex min-h-0",
             viewMode === 'hybrid' ? 'flex-col' : ''
           )}>
             {(viewMode === 'editor' || viewMode === 'hybrid') && (
               <div className={cn(
                 "flex flex-col min-w-0 min-h-0",
                 viewMode === 'hybrid' ? 'h-[50%] border-b border-white/5' : 'flex-1'
               )}>
                  <Editor />
               </div>
             )}
             {viewMode === 'spatial' && (
               <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-black">
                  <SpatialView />
               </div>
             )}
             {viewMode === 'preview' && (
               <div className="flex-1 flex flex-col min-w-0 min-h-0">
                  <WebView />
               </div>
             )}
             {viewMode === 'hybrid' && (
               <div className="h-[50%] flex flex-row min-w-0 min-h-0">
                  <div className="flex-1 border-r border-white/5">
                    <SpatialView />
                  </div>
                  <div className="flex-1">
                    <WebView />
                  </div>
               </div>
             )}
           </div>

           {/* Bottom Panel (Terminal/Logs) if visible */}
           {hasBottomPanel && (
             <div className="h-48 border-t border-white/5 bg-black/40 backdrop-blur-sm">
                <Terminal />
             </div>
           )}
        </section>

        {/* Right Panel: AI Feed & Terminal */}
        {hasRightPanel && (
          <aside className="w-80 border-l border-white/5 bg-black/40 flex flex-col hidden xl:flex">
            {config.panels.right.includes('ai') && <AgentSidebar />}
          </aside>
        )}
      </main>

      {/* Floating Command Nexus */}
      <CommandNexus />

      {/* Global AI Assistant Support Trigger */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => executeAgentTask("I need some general help with the workspace.")}
        className="fixed bottom-12 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20 flex items-center justify-center z-[100] border border-white/10 group overflow-hidden"
      >
        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
        <Zap className={cn("w-6 h-6", isAgentThinking ? "animate-pulse" : "")} />
      </motion.button>

      {/* Bottom Bar: Infra Health */}
      <footer className="h-8 bg-black/80 border-t border-white/5 px-4 flex items-center justify-between z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">
            <Globe className="w-3.5 h-3.5 text-green-400" />
            <span className="text-[9px] uppercase font-bold tracking-tighter">GitHub Connected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_5px_#f97316]"></div>
            <span className="text-[9px] uppercase font-bold tracking-tighter">OCI: US_WEST_2</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_5px_#22d3ee]"></div>
            <span className="text-[9px] uppercase font-bold tracking-tighter">Mem0: Persisting</span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-mono text-white/30">
          <span className="flex items-center gap-1">RTT: <span className="text-cyan-400">12ms</span></span>
          <div className="h-3 w-[1px] bg-white/10"></div>
          <span className="flex items-center gap-1">MEM: <span className="text-cyan-400">2.4GB</span></span>
        </div>
      </footer>
    </div>
  );
}

function NavButton({ active, onClick, icon: Icon }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "p-1.5 rounded-md transition-all",
        active ? "bg-white/10 text-cyan-400 border border-cyan-500/20" : "text-white/40 hover:text-white/60 hover:bg-white/5"
      )}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}

function ActivityIconButton({ active, onClick, icon: Icon }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "p-2 rounded-lg transition-all relative group",
        active ? "text-cyan-400 bg-cyan-400/5 border border-cyan-500/10" : "text-white/20 hover:text-white/60 hover:bg-white/5"
      )}
    >
      <Icon className="w-5 h-5" />
      {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-cyan-400 rounded-r-full shadow-[0_0_8px_#22d3ee]" />}
    </button>
  );
}
