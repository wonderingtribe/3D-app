import React, { useState } from 'react';
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
import KubernetesView from './KubernetesView';
import AIAssistant from './AIAssistant';
import { ChevronDown, BrainCircuit, Box, Sparkles, Layers } from 'lucide-react';

const COLORS = {
  bg: "#0a0b0e",
  surface: "#111318",
  surfaceHover: "#1a1d24",
  border: "#1e2330",
  borderBright: "#2a3040",
  accent: "#00d4ff",
  accentDim: "#00a8cc",
  accentGlow: "rgba(0,212,255,0.12)",
  accentGlow2: "rgba(0,212,255,0.06)",
  green: "#00e5a0",
  amber: "#ffb340",
  red: "#ff4d6a",
  text: "#f8fafc",
  textDim: "#cbd5e1",
  textFaint: "#94a3b8",
};

const NAV_TABS = [
  { id: "assistant", label: "AI Intelligence" },
  { id: "infrastructure", label: "Clusters & Pods" },
  { id: "design", label: "UI Design" },
  { id: "engine", label: "Engine Setup" },
  { id: "spatial", label: "Spatial View" },
  { id: "code", label: "Source Code" },
  { id: "pipeline", label: "Asset Pipeline" },
  { id: "settings", label: "Settings" },
];

export default function Shell() {
  const { 
    viewMode, 
    setViewMode, 
    isSidebarOpen, 
    setSidebarOpen, 
    isAgentSidebarOpen, 
    setAgentSidebarOpen, 
    isAgentThinking, 
    addAgentLog, 
    setupConfig,
    hybridSplit,
    setHybridSplit
  } = useWorkspace();
  const [deployOpen, setDeployOpen] = useState(false);

  // Split View Implementation
  const renderMainContent = () => {
    if (hybridSplit && (viewMode === 'code' || viewMode === 'spatial')) {
      return (
        <div style={{ flex: 1, display: "flex", height: "100%", overflow: "hidden" }}>
           <div style={{ flex: 1, borderRight: `1px solid ${COLORS.border}`, display: "flex", flexDirection: "column" }}>
              <Editor />
           </div>
           <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <SpatialView />
           </div>
        </div>
      );
    }

    switch(viewMode) {
      case 'design': return <CanvasEditor />;
      case 'engine': return <EngineEditor />;
      case 'spatial': return <SpatialView />;
      case 'settings': return <ProjectSettings />;
      case 'code': return <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}><Editor /></div>;
      case 'pipeline': return <GltfPipeline />;
      case 'infrastructure': return <KubernetesView />;
      case 'assistant': return <AIAssistant />;
      default: return <SpatialView />;
    }
  };

  const filteredTabs = NAV_TABS.filter(tab => {
    if (!setupConfig) return true;
    if (setupConfig.editorMode === 'code-lite') {
      return !['design', 'pipeline'].includes(tab.id);
    }
    if (setupConfig.editorMode === 'spatial-only') {
      return !['code', 'engine'].includes(tab.id);
    }
    return true;
  });

  return (
    <div style={{
      height: "100vh", display: "flex", flexDirection: "column",
      background: COLORS.bg, fontFamily: "'Inter', 'Segoe UI', sans-serif",
      color: COLORS.text, overflow: "hidden",
    }}>

      {/* TOP BAR */}
      <div style={{
        height: 48, background: COLORS.surface, borderBottom: `1px solid ${COLORS.border}`,
        display: "flex", alignItems: "center", padding: "0 16px", gap: 16, flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginRight: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7, background: `linear-gradient(135deg, ${COLORS.accent}, #7c3aed)`,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            boxShadow: `0 0 12px ${COLORS.accentGlow}`
          }}>
            <Box size={16} color="white" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 900, letterSpacing: "-0.02em", lineHeight: 1.2, textTransform: "uppercase" }}>Spatial_IDE</div>
            <div style={{ fontSize: 9, color: COLORS.textFaint, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 700 }}>
              Kernel: {setupConfig?.engineVersion?.toUpperCase() || 'V9.0.HYBRID'} • Runtime: {setupConfig?.deploymentTarget?.toUpperCase().replace(/-/g, '_') || 'LOCAL'}
            </div>
          </div>
        </div>

        {/* Nav Tabs */}
        <div style={{ display: "flex", gap: 2, flex: 1, overflow: "auto" }}>
          {filteredTabs.map(tab => (
            <button key={tab.id} onClick={() => setViewMode(tab.id as any)} style={{
              background: viewMode === tab.id ? COLORS.accentGlow : "transparent",
              border: viewMode === tab.id ? `1px solid ${COLORS.accent}44` : "1px solid transparent",
              borderRadius: 6, padding: "5px 12px", fontSize: 12, fontWeight: viewMode === tab.id ? 600 : 400,
              color: viewMode === tab.id ? COLORS.accent : COLORS.textDim,
              cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.15s",
            }}
            onMouseEnter={e => { if (viewMode !== tab.id) e.currentTarget.style.color = COLORS.text; }}
            onMouseLeave={e => { if (viewMode !== tab.id) e.currentTarget.style.color = COLORS.textDim; }}
            >{tab.label}</button>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8, flexShrink: 0, alignItems: "center" }}>
          
           {(viewMode === 'code' || viewMode === 'spatial') && (
             <button 
               onClick={() => setHybridSplit(!hybridSplit)}
               style={{
                background: hybridSplit ? COLORS.accentGlow : "transparent",
                border: `1px solid ${hybridSplit ? COLORS.accent : COLORS.border}`,
                borderRadius: 6, padding: "5px 12px", fontSize: 11, fontWeight: 700,
                color: hybridSplit ? COLORS.accent : COLORS.textDim, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s"
               }}
             >
                <Layers size={14} />
                {hybridSplit ? "HYBRID_SPLIT: ON" : "HYBRID_SPLIT: OFF"}
             </button>
           )}

           {isAgentThinking && (
             <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", background: COLORS.accentGlow, borderRadius: 20, border: `1px solid ${COLORS.accent}44` }}>
               <div style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS.accent }} className="animate-pulse" />
               <span style={{ fontSize: 10, fontWeight: 700, color: COLORS.accent, textTransform: "uppercase", letterSpacing: "0.05em" }}>Thinking...</span>
             </div>
           )}

          <button onClick={() => setViewMode('settings' as any)} style={{
            background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 6,
            padding: "5px 10px", fontSize: 11, color: COLORS.textDim, cursor: "pointer", display: "flex", alignItems: "center", gap: 5
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
            </svg>
            Export NPM
          </button>
          <button onClick={() => setViewMode('settings' as any)} style={{
            background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 6,
            padding: "5px 10px", fontSize: 11, color: COLORS.textDim, cursor: "pointer", display: "flex", alignItems: "center", gap: 5
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
            API Keys
          </button>
          
          <div style={{ position: "relative" }}>
             <button 
                onClick={() => setDeployOpen(!deployOpen)}
                style={{
                  background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentDim})`,
                  border: "none", borderRadius: 6, padding: "5px 14px",
                  fontSize: 12, fontWeight: 600, color: "#000", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 5,
                  boxShadow: `0 0 16px ${COLORS.accentGlow}`
                }}
             >
               <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                 <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
               </svg>
               Deploy
               <ChevronDown size={14} style={{ marginLeft: 4 }} />
             </button>
             
             {deployOpen && (
                <div style={{
                   position: 'absolute', top: '100%', right: 0, marginTop: 8, zIndex: 100,
                   background: COLORS.surface, border: `1px solid ${COLORS.borderBright}`,
                   borderRadius: 8, overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', width: 180
                }}>
                   <div 
                      onClick={() => {
                        setDeployOpen(false);
                        addAgentLog("Packaging spatial application...", "thinking");
                        setTimeout(() => {
                          const data = JSON.stringify({ workspace: "Spatial Platform Beta", timestamp: new Date().toISOString() }, null, 2);
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
                      style={{ padding: '10px 14px', fontSize: 11, fontWeight: 600, color: COLORS.text, cursor: 'pointer', borderBottom: `1px solid ${COLORS.border}` }}
                      onMouseEnter={e => e.currentTarget.style.background = COLORS.surfaceHover}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                   >
                      Release Bundle
                   </div>
                </div>
             )}
          </div>

          <button onClick={() => setAgentSidebarOpen(!isAgentSidebarOpen)} style={{
            background: isAgentSidebarOpen ? COLORS.accentGlow : "transparent",
            color: isAgentSidebarOpen ? COLORS.accent : COLORS.textDim,
            border: isAgentSidebarOpen ? `1px solid ${COLORS.accent}44` : `1px solid ${COLORS.border}`, 
            borderRadius: 6, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer"
          }}>
             <BrainCircuit size={16} />
          </button>
        </div>
      </div>

      {/* MAIN AREA */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* ACTIVITY BAR */}
        <div style={{
          width: 48, background: COLORS.surface, borderRight: `1px solid ${COLORS.border}`,
          display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 0", gap: 8, flexShrink: 0,
        }}>
          <ActivityButton id="explorer" icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>} active={isSidebarOpen} onClick={() => setSidebarOpen(!isSidebarOpen)} />
          <ActivityButton id="infra" icon={<Box size={20} />} active={viewMode === 'infrastructure'} onClick={() => setViewMode('infrastructure')} />
          <ActivityButton id="ai" icon={<Sparkles size={20} />} active={viewMode === 'assistant'} onClick={() => setViewMode('assistant')} />
        </div>

        {/* FILE EXPLORER PANEL */}
        {isSidebarOpen && (
          <div style={{
            width: 240, background: COLORS.surface, borderRight: `1px solid ${COLORS.border}`,
            display: "flex", flexDirection: "column", flexShrink: 0, overflow: "hidden"
          }} className="shadow-2xl z-20">
            <FileExplorer />
          </div>
        )}

        {/* EDITOR AREA */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0, position: "relative" }}>
           <main style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", position: "relative" }}>
             {renderMainContent()}
           </main>

           <Terminal />
        </div>

        {/* Right Sidebar (Agent & Logistics) */}
        {isAgentSidebarOpen && (
          <div style={{
            width: 320, background: COLORS.surface, borderLeft: `1px solid ${COLORS.border}`,
            display: "flex", flexDirection: "column", flexShrink: 0, overflow: "hidden",
            boxShadow: "-10px 0 30px rgba(0,0,0,0.5)"
          }} className="z-20">
             <AgentSidebar />
          </div>
        )}
      </div>
    </div>
  );
}

function ActivityButton({ id, icon, active, onClick }: { id: string, icon: React.ReactNode, active: boolean, onClick: () => void }) {
  return (
    <button title={id} onClick={onClick} style={{
      width: 36, height: 36, borderRadius: 8, border: "none",
      background: active ? COLORS.accentGlow : "transparent",
      color: active ? COLORS.accent : COLORS.textFaint,
      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
      transition: "all 0.15s", position: "relative",
    }}
    onMouseEnter={e => { if (!active) { e.currentTarget.style.background = COLORS.surfaceHover; e.currentTarget.style.color = COLORS.textDim; }}}
    onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = COLORS.textFaint; }}}
    >
      {active && <div style={{
        position: "absolute", left: -1, top: "25%", height: "50%", width: 3,
        background: COLORS.accent, borderRadius: "0 2px 2px 0"
      }}/>}
      {icon}
    </button>
  );
}

