import React from 'react';
import { useWorkspace } from '../WorkspaceContext';
import { 
  ChevronRight, 
  ChevronDown, 
  File, 
  Folder, 
  Plus, 
  RefreshCw,
  Search,
  MoreVertical
} from 'lucide-react';
import { cn } from '../lib/utils';
import { FileNode } from '../types';

export default function FileExplorer() {
  const { openFile } = useWorkspace();
  
  // Mock internal files since they were deleted
  const mockFiles: FileNode[] = [
    {
      name: 'src',
      path: 'src',
      type: 'directory',
      children: [
        { name: 'App.tsx', path: 'src/App.tsx', type: 'file' },
        { name: 'main.tsx', path: 'src/main.tsx', type: 'file' },
        { name: 'WorkspaceContext.tsx', path: 'src/WorkspaceContext.tsx', type: 'file' },
        { 
          name: 'components', 
          path: 'src/components', 
          type: 'directory',
          children: [
            { name: 'Shell.tsx', path: 'src/components/Shell.tsx', type: 'file' },
            { name: 'CanvasEditor.tsx', path: 'src/components/CanvasEditor.tsx', type: 'file' },
            { name: 'SpatialView.tsx', path: 'src/components/SpatialView.tsx', type: 'file' },
          ]
        }
      ]
    },
    { name: 'package.json', path: 'package.json', type: 'file' },
    { name: 'vite.config.ts', path: 'vite.config.ts', type: 'file' }
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-ui-panel/40">
      <div className="p-3 border-b border-ui-border flex items-center justify-between bg-ui-panel/60">
        <label className="text-[10px] font-bold text-ui-text uppercase tracking-widest">Explorer</label>
        <div className="flex gap-1.5">
          <button className="p-1 hover:bg-white/5 rounded text-ui-text-muted"><Plus className="w-3.5 h-3.5" /></button>
          <button className="p-1 hover:bg-white/5 rounded text-ui-text-muted"><RefreshCw className="w-3.5 h-3.5" /></button>
        </div>
      </div>
      
      <div className="p-2">
        <div className="relative mb-2">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-ui-text-muted/50" />
          <input 
            placeholder="FILTER..."
            className="w-full bg-ui-bg/50 border border-ui-border rounded-lg py-1 pl-7 pr-2 text-[9px] text-ui-text outline-none focus:border-ui-accent transition-all uppercase font-medium tracking-wider"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {mockFiles.map((node) => (
          <FileEntry key={node.path} node={node} openFile={openFile} depth={0} />
        ))}
      </div>
    </div>
  );
}

function FileEntry({ node, openFile, depth }: { node: FileNode; openFile: (p: string) => void; depth: number }) {
  const [isOpen, setIsOpen] = React.useState(true);
  const isDir = node.type === 'directory';

  return (
    <div className="flex flex-col">
      <div 
        onClick={() => isDir ? setIsOpen(!isOpen) : openFile(node.path)}
        className={cn(
          "group flex items-center gap-1.5 py-1 px-2 rounded cursor-pointer transition-colors",
          "hover:bg-white/5"
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {isDir ? (
          isOpen ? <ChevronDown className="w-3.5 h-3.5 text-ui-text-muted" /> : <ChevronRight className="w-3.5 h-3.5 text-ui-text-muted" />
        ) : (
          <File className="w-3.5 h-3.5 text-ui-accent/60" />
        )}
        {isDir && (isOpen ? <Folder className="w-3.5 h-3.5 text-ui-accent/80 fill-ui-accent/20" /> : <Folder className="w-3.5 h-3.5 text-ui-text-muted/60" />)}
        <span className={cn(
          "text-[10px] font-medium tracking-tight",
          isDir ? "text-ui-text" : "text-ui-text-muted group-hover:text-ui-text"
        )}>
          {node.name}
        </span>
      </div>
      
      {isDir && isOpen && node.children && (
        <div className="flex flex-col">
          {node.children.map((child) => (
            <FileEntry key={child.path} node={child} openFile={openFile} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
