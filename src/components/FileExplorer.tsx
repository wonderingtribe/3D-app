import React, { useState } from 'react';
import { useWorkspace } from '../WorkspaceContext';
import { ChevronRight, ChevronDown, File, Folder, FolderPlus, FilePlus, RefreshCcw, BrainCircuit } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { FileNode } from '../types';

export default function FileExplorer() {
  const { files, openFile, activeTabPath, executeAgentTask } = useWorkspace();

  return (
    <div className="flex flex-col h-full bg-black/20">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Workspace</span>
        <div className="flex gap-2.5">
          <button className="text-white/30 hover:text-cyan-400 transition-colors"><FilePlus className="w-3.5 h-3.5" /></button>
          <button className="text-white/30 hover:text-cyan-400 transition-colors"><FolderPlus className="w-3.5 h-3.5" /></button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-white/10">
        <div className="space-y-0.5">
          {files.map(node => (
            <FileEntry key={node.path} node={node} depth={0} onOpen={openFile} activePath={activeTabPath} />
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-white/5 bg-cyan-500/5 group cursor-pointer" onClick={() => executeAgentTask("Brief me on the project structure and next steps.")}>
        <div className="flex items-center gap-2 text-[10px] text-cyan-400 font-bold mb-1">
          <BrainCircuit className="w-3 h-3" />
          Neural Project Brief
        </div>
        <p className="text-[9px] text-white/40 leading-tight group-hover:text-white/60 transition-colors">
          Aether engine status: STANDBY. Click to analyze active workspace and generate roadmap.
        </p>
      </div>
      
      <div className="mt-auto p-4 bg-white/5 border-t border-white/5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono text-white/40">MEMORY POOL</span>
          <span className="text-[10px] text-cyan-400">Mem0 Active</span>
        </div>
        <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '65%' }}
            className="h-full bg-cyan-500 shadow-[0_0_10px_#06b6d4]"
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
            "w-full flex items-center gap-2 py-1.5 px-2 rounded hover:bg-white/5 transition-colors text-xs text-white/60",
            isOpen ? "text-white/90" : ""
          )}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          <Folder className={cn("w-3.5 h-3.5", isOpen ? "text-cyan-400" : "text-blue-500/60")} />
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
        isSelected ? "bg-cyan-500/10 text-white font-medium border border-cyan-500/20" : "text-white/40 hover:text-white/80 hover:bg-white/5"
      )}
      style={{ paddingLeft: `${depth * 12 + 24}px` }}
    >
      <File className={cn("w-3.5 h-3.5", isSelected ? "text-cyan-400" : "text-white/20 group-hover:text-white/40")} />
      <span>{node.name}</span>
      {isSelected && <div className="ml-auto w-1 h-1 rounded-full bg-cyan-400" />}
    </button>
  );
}
