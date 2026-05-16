import React from 'react';
import { useWorkspace } from '../WorkspaceContext';
import { 
  X, 
  Save, 
  FileCode, 
  ChevronRight,
  Terminal as TerminalIcon
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function Editor() {
  const { tabs, activeTabPath, closeTab, setActiveTabPath, updateTabContent, saveActiveFile } = useWorkspace();
  const activeTab = tabs.find(t => t.path === activeTabPath);

  if (!activeTabPath || !activeTab) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-ui-text-muted/20 opacity-50 bg-ui-bg/50">
        <FileCode className="w-16 h-16 mb-4 stroke-[1px]" />
        <p className="text-[11px] font-bold uppercase tracking-[0.3em]">Select source to inspect</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 h-full overflow-hidden">
      {/* Tab Bar */}
      <div className="h-10 flex border-b border-ui-border bg-ui-panel/40 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <div 
            key={tab.path}
            onClick={() => setActiveTabPath(tab.path)}
            className={cn(
              "group flex items-center gap-2 px-4 h-full border-r border-ui-border cursor-pointer transition-all min-w-[120px] max-w-[200px]",
              activeTabPath === tab.path ? "bg-ui-bg text-ui-text border-b border-b-ui-accent" : "text-ui-text-muted hover:bg-white/5 active:bg-white/10"
            )}
          >
            <FileCode className="w-3 h-3 flex-shrink-0" />
            <span className="text-[10px] font-medium truncate flex-1">{tab.name}</span>
            {tab.isDirty && <div className="w-1.5 h-1.5 rounded-full bg-ui-accent" />}
            <button 
              onClick={(e) => { e.stopPropagation(); closeTab(tab.path); }}
              className="p-1 hover:bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-all"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Editor Surface */}
      <div className="flex-1 relative bg-ui-bg/20 font-mono text-[13px] leading-relaxed group">
         <textarea 
            className="w-full h-full p-6 bg-transparent outline-none resize-none text-ui-text selection:bg-ui-accent/30 selection:text-white"
            value={activeTab.content}
            onChange={(e) => updateTabContent(activeTab.path, e.target.value)}
            spellCheck={false}
         />
         
         <div className="absolute bottom-6 right-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
            <div className="px-3 py-1 bg-ui-panel border border-ui-border rounded-lg text-[9px] font-bold text-ui-text-muted uppercase">Line 1, Col 1</div>
            <button 
              onClick={saveActiveFile}
              className="flex items-center gap-2 px-4 py-1.5 bg-ui-accent text-white rounded-lg text-[10px] font-bold shadow-lg shadow-ui-accent/20 hover:scale-105 active:scale-95 transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              SAVE_FILE
            </button>
         </div>
      </div>

      {/* Breadcrumbs */}
      <div className="h-6 border-t border-ui-border flex items-center px-4 gap-2 text-[9px] font-bold text-ui-text-muted/60 uppercase tracking-wider bg-ui-panel/10">
         {activeTabPath.split('/').map((seg, i, arr) => (
           <React.Fragment key={i}>
              <span className={cn(i === arr.length - 1 && "text-ui-accent")}>{seg}</span>
              {i < arr.length - 1 && <ChevronRight className="w-2.5 h-2.5 opacity-30" />}
           </React.Fragment>
         ))}
      </div>
    </div>
  );
}
