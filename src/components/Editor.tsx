import React from 'react';
import MonacoEditor from '@monaco-editor/react';
import { useWorkspace } from '../WorkspaceContext';
import { X, Save, Share2, Sparkles, BrainCircuit } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Editor() {
  const { tabs, activeTabPath, setActiveTabPath, closeTab, updateTabContent, saveActiveFile, executeAgentTask } = useWorkspace();
  const activeTab = tabs.find(t => t.path === activeTabPath);

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-black/20 overflow-hidden">
      {/* Tabs Header */}
      <div className="h-9 flex items-center bg-black/40 px-4 border-b border-white/5 gap-0.5 overflow-x-auto no-scrollbar">
        {tabs.map(tab => (
          <div
            key={tab.path}
            onClick={() => setActiveTabPath(tab.path)}
            className={cn(
              "group h-full flex items-center gap-2 px-3 cursor-pointer transition-all min-w-[100px] max-w-[180px] text-[11px]",
              activeTabPath === tab.path 
                ? "text-white/90 border-b-2 border-cyan-500 bg-white/5 font-medium" 
                : "text-white/30 hover:text-white/60 hover:bg-white/[0.02]"
            )}
          >
            <span className="truncate">{tab.name}</span>
            {tab.isDirty && <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]" />}
            <button
              onClick={(e) => { e.stopPropagation(); closeTab(tab.path); }}
              className="ml-auto opacity-0 group-hover:opacity-100 p-0.5 hover:bg-white/10 rounded transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {/* Editor Content */}
      <div className="flex-1 relative group bg-black/30">
        {activeTab ? (
          <>
            <MonacoEditor
              theme="vs-dark"
              path={activeTab.path}
              language={getLanguage(activeTab.path)}
              value={activeTab.content}
              onChange={(value) => updateTabContent(activeTab.path, value || '')}
              options={{
                fontSize: 13,
                fontFamily: "'JetBrains Mono', monospace",
                minimap: { enabled: false },
                padding: { top: 20 },
                smoothScrolling: true,
                cursorBlinking: "expand",
                cursorSmoothCaretAnimation: "on",
                bracketPairColorization: { enabled: true },
                lineNumbers: "on",
                renderLineHighlight: "all",
                scrollbar: {
                  vertical: "visible",
                  horizontal: "visible",
                  useShadows: false,
                  verticalHasArrows: false,
                  horizontalHasArrows: false,
                  verticalScrollbarSize: 6,
                  horizontalScrollbarSize: 6
                },
                overviewRulerBorder: false,
                hideCursorInOverviewRuler: true,
                lineHeight: 1.6
              }}
            />
            {/* AI Inline Actions */}
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
               <button 
                 onClick={() => executeAgentTask(`Review and optimize the code in ${activeTab.path}`)}
                 className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-full text-[11px] font-bold backdrop-blur-md transition-all whitespace-nowrap"
               >
                 <Sparkles className="w-3.5 h-3.5" />
                 AI Optimize
               </button>
               <button 
                 onClick={() => executeAgentTask(`Explain the logic in ${activeTab.path}`)}
                 className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/60 border border-white/10 rounded-full text-[11px] font-bold backdrop-blur-md transition-all whitespace-nowrap"
               >
                 <BrainCircuit className="w-3.5 h-3.5" />
                 Explain
               </button>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-white/10 select-none">
             <div className="relative w-32 h-32 mb-6">
                <div className="absolute inset-0 border-2 border-cyan-500/10 rounded-xl rotate-45 animate-pulse" />
                <div className="absolute inset-4 border border-blue-500/10 rounded-xl -rotate-12" />
                <div className="absolute inset-0 flex items-center justify-center">
                   <Share2 className="w-12 h-12 opacity-20" />
                </div>
             </div>
             <p className="text-xs font-bold uppercase tracking-widest">Awaiting Command Sequence</p>
             <p className="text-[10px] opacity-40 mt-2 font-mono">/index workspace to build neural map</p>
          </div>
        )}
        
        {/* Floating Actions */}
        {activeTab && (
          <div className="absolute right-6 bottom-6 flex flex-col gap-2">
            <button 
              onClick={saveActiveFile}
              className="p-3 bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-400 rounded-full backdrop-blur-xl border border-cyan-500/20 transition-all shadow-2xl hover:shadow-cyan-500/20"
            >
              <Save className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function getLanguage(path: string) {
  const ext = path.split('.').pop();
  switch (ext) {
    case 'ts':
    case 'tsx': return 'typescript';
    case 'js':
    case 'jsx': return 'javascript';
    case 'html': return 'html';
    case 'css': return 'css';
    case 'json': return 'json';
    case 'md': return 'markdown';
    default: return 'plaintext';
  }
}
