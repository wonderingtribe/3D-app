import React, { useState } from 'react';
import { useWorkspace } from '../WorkspaceContext';
import { Layers, Loader2, CheckCircle2, XCircle, Clock, Upload, Filter, Search as SearchIcon, ChevronRight, Github, Globe } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function GltfPipeline() {
  const { pipelineItems, addPipelineItem, addAgentLog, executeAgentTask } = useWorkspace();
  const [filter, setFilter] = useState<'all' | 'pending' | 'processing' | 'completed'>('all');

  const filteredItems = pipelineItems.filter(item => filter === 'all' || item.status === filter);

  const simulateUpload = () => {
    const names = ['hero_character.glb', 'sci_fi_helmet.gltf', 'ancient_statue.glb', 'low_poly_tree.gltf'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    addPipelineItem({
      name: randomName,
      type: 'gltf'
    });
  };

  return (
    <div className="h-full flex flex-col bg-ui-bg transition-colors duration-300">
      <div className="p-4 border-b border-ui-border space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[10px] font-bold text-ui-text uppercase tracking-widest flex items-center gap-2">
            <Layers className="w-3 h-3 text-ui-accent" />
            Asset Pipeline
          </h2>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                const url = prompt("Enter Git Repository URL:");
                if (url) {
                  addAgentLog(`Manually triggering clone sequence for ${url}`, 'info');
                  executeAgentTask(`Clone the repository from ${url} into a subdirectory called 'external-source'. Then analyze the project structure.`);
                }
              }}
              className="p-1 px-2 border border-ui-border hover:bg-ui-panel rounded text-[9px] font-bold text-ui-text-muted flex items-center gap-1 transition-all"
            >
              <Github className="w-3 h-3" />
              SOURCE
            </button>
            <button 
              onClick={() => {
                const url = prompt("Enter GLTF/GLB URL:");
                if (url) {
                  addPipelineItem({
                    name: url.split('/').pop() || 'external_model.glb',
                    type: 'gltf'
                  });
                  addAgentLog(`Importing external asset from: ${url}`, 'info');
                }
              }}
              className="p-1 px-2 border border-ui-border hover:bg-ui-panel rounded text-[9px] font-bold text-ui-text-muted flex items-center gap-1 transition-all"
            >
              <Globe className="w-3 h-3" />
              EXTERNAL
            </button>
            <button 
              onClick={simulateUpload}
              className="p-1 px-2 bg-ui-accent hover:opacity-90 rounded text-[9px] font-bold text-white flex items-center gap-1 transition-all shadow-lg"
            >
              <Upload className="w-3 h-3" />
              IMPORT
            </button>
          </div>
        </div>

        <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
          {['all', 'pending', 'processing', 'completed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={cn(
                "px-2 py-0.5 rounded text-[8px] font-bold uppercase transition-all whitespace-nowrap border",
                filter === f ? "bg-ui-accent/10 text-ui-accent border-ui-accent/20" : "text-ui-text-muted border-transparent hover:text-ui-text"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-thin">
        <AnimatePresence initial={false}>
          {filteredItems.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center text-ui-text-muted/20 space-y-2">
              <SearchIcon className="w-8 h-8 opacity-10" />
              <span className="text-[9px] uppercase tracking-tighter">Queue Empty</span>
            </div>
          ) : (
            filteredItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-ui-panel border border-ui-border rounded-lg p-3 hover:shadow-lg transition-all group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-6 h-6 rounded flex items-center justify-center",
                      item.status === 'completed' ? "bg-green-500/20" : 
                      item.status === 'processing' ? "bg-ui-accent/20" : "bg-ui-bg"
                    )}>
                      {item.status === 'completed' ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> :
                       item.status === 'processing' ? <Loader2 className="w-3.5 h-3.5 text-ui-accent animate-spin" /> :
                       item.status === 'failed' ? <XCircle className="w-3.5 h-3.5 text-red-400" /> :
                       <Clock className="w-3.5 h-3.5 text-ui-text-muted" />}
                    </div>
                    <div>
                      <h3 className="text-[10px] font-bold text-ui-text truncate max-w-[120px]">{item.name}</h3>
                      <p className="text-[8px] text-ui-text-muted uppercase tracking-tighter">{item.type} • {item.timestamp}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3 h-3 text-ui-text-muted group-hover:text-ui-accent transition-colors" />
                </div>

                {item.status === 'processing' && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[8px] text-ui-accent/60 uppercase font-mono">
                      <span>Analyzing Geometry...</span>
                      <span>{item.progress}%</span>
                    </div>
                    <div className="h-1 bg-ui-bg rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-ui-accent"
                        initial={{ width: 0 }}
                        animate={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {item.status === 'completed' && (
                  <div className="flex gap-2 mt-2">
                    <button className="flex-1 bg-ui-bg hover:bg-ui-bg/80 text-[8px] font-bold uppercase py-1 rounded transition-colors text-ui-text-muted hover:text-ui-text border border-ui-border">
                      Inspect
                    </button>
                    <button 
                      onClick={() => addAgentLog(`Importing ${item.name} entity into spatial scene...`, 'action')}
                      className="flex-1 bg-green-600/20 hover:bg-green-600/40 text-[8px] font-bold uppercase py-1 rounded transition-colors text-green-400 border border-green-500/20"
                    >
                      Add to Scene
                    </button>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <div className="p-3 border-t border-ui-border bg-ui-panel/40 backdrop-blur-sm">
        <div className="flex items-center justify-between text-[8px] text-ui-text-muted">
          <span className="flex items-center gap-1 uppercase tracking-widest font-bold">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]" />
             Pipeline Link Active
          </span>
          <span className="font-mono">v1.2.4</span>
        </div>
      </div>
    </div>
  );
}
