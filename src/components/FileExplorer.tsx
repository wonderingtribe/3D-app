import React, { useState } from 'react';
import { useWorkspace } from '../WorkspaceContext';
import { ChevronRight, ChevronDown, File, Folder, FolderPlus, FilePlus, RefreshCcw, BrainCircuit } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { FileNode } from '../types';

export default function FileExplorer() {
  const { files, openFile, activeTabPath, executeAgentTask } = useWorkspace();

  return (
    <div className="flex flex-col h-full bg-ui-bg transition-colors duration-300">
      <div className="flex items-center justify-between px-4 py-3 border-b border-ui-border">
        <span className="text-[10px] uppercase tracking-widest text-ui-text-muted font-bold">Workspace</span>
        <div className="flex gap-2.5">
          <button className="text-ui-text-muted hover:text-ui-accent transition-colors"><FilePlus className="w-3.5 h-3.5" /></button>
          <button className="text-ui-text-muted hover:text-ui-accent transition-colors"><FolderPlus className="w-3.5 h-3.5" /></button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
        <div className="space-y-0.5">
          {files.map(node => (
            <FileEntry key={node.path} node={node} depth={0} onOpen={openFile} activePath={activeTabPath} />
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-ui-border bg-ui-accent/5 group cursor-pointer" onClick={() => executeAgentTask("Brief me on the project structure and next steps.")}>
        <div className="flex items-center gap-2 text-[10px] text-ui-accent font-bold mb-1">
          <BrainCircuit className="w-3 h-3" />
          Neural Project Brief
        </div>
        <p className="text-[9px] text-ui-text-muted leading-tight group-hover:text-ui-text transition-colors">
          Aether engine status: STANDBY. Click to analyze active workspace and generate roadmap.
        </p>
      </div>
      
      <div className="mt-auto p-4 bg-ui-panel border-t border-ui-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono text-ui-text-muted">MEMORY POOL</span>
          <span className="text-[10px] text-ui-accent">Mem0 Active</span>
        </div>
        <div className="h-1 w-full bg-ui-bg rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '65%' }}
            className="h-full bg-ui-accent shadow-[0_0_10px_rgba(6,182,212,0.3)]"
          />
        </div>
      </div>
    </div>
  );
}

function FileEntry({ node, depth, onOpen, activePath }: { node: FileNode, depth: number, onOpen: (p: string) => void, activePath: string | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const isSelected = activePath === node.path;

  if (node.type === 'directory') {
    return (
      <div className="select-none">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full flex items-center gap-2 py-1.5 px-2 rounded hover:bg-ui-panel transition-colors text-xs text-ui-text-muted",
            isOpen ? "text-ui-text" : ""
          )}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          <Folder className={cn("w-3.5 h-3.5", isOpen ? "text-ui-accent" : "text-blue-500/60")} />
          <span>{node.name}</span>
        </button>
        {isOpen && node.children && (
          <div className="flex flex-col">
            {node.children.map(child => (
              <FileEntry key={child.path} node={child} depth={depth + 1} onOpen={onOpen} activePath={activePath} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => onOpen(node.path)}
      className={cn(
        "w-full flex items-center gap-2 py-1 px-2 rounded transition-all text-xs group",
        isSelected ? "bg-ui-accent/10 text-ui-text font-medium border border-ui-accent/20" : "text-ui-text-muted hover:text-ui-text hover:bg-ui-panel"
      )}
      style={{ paddingLeft: `${depth * 12 + 24}px` }}
    >
      <File className={cn("w-3.5 h-3.5", isSelected ? "text-ui-accent" : "text-ui-text-muted opacity-40 group-hover:opacity-100")} />
      <span>{node.name}</span>
      {isSelected && <div className="ml-auto w-1 h-1 rounded-full bg-ui-accent shadow-[0_0_5px_rgba(6,182,212,0.5)]" />}
    </button>
  );
}
