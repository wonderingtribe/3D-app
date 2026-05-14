import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Square, 
  Circle, 
  Type, 
  Image as ImageIcon, 
  MousePointer2, 
  Layers, 
  Settings, 
  Plus,
  Play,
  Save,
  Trash2,
  ChevronDown,
  Wand2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useWorkspace } from '../WorkspaceContext';
import { WorldEntity, Prefab } from '../types';
import AIArchitect from './AIArchitect';

export default function CanvasEditor() {
  const { config, addAgentLog, entities, updateEntity, addEntity, deleteEntity, prefabs, addPrefab, scenes, currentSceneId, saveScene, loadScene, createScene } = useWorkspace();
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isAIArchitectOpen, setIsAIArchitectOpen] = useState(false);
  const [activeTool, setActiveTool] = useState<'select' | 'place'>('select');
  const containerRef = useRef<HTMLDivElement>(null);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (activeTool !== 'place' || !containerRef.current) return;
    
    // Check if we clicked on an existing entity (don't place on top)
    if ((e.target as HTMLElement).closest('.cursor-move')) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - 200; // Offset for centered origin or just local coord
    const y = e.clientY - rect.top;

    const name = window.prompt("Enter Entity Name:", "New Entity");
    if (!name) return;

    const type = window.confirm("Is this a Light? (Cancel for Mesh)") ? 'light' : 'mesh';

    addEntity({
      type,
      name,
      x: x,
      y: y,
      z: type === 'light' ? 5 : 1,
      scale: 1,
      rotation: 0,
      properties: {},
    });

    addAgentLog(`Placed new ${type} '${name}' at ${Math.round(x)}, ${Math.round(y)}`, 'info');
    setActiveTool('select');
  };

  const addNewEntity = (type: WorldEntity['type']) => {
    addEntity({
      type,
      name: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      x: 50 + Math.random() * 200,
      y: 50 + Math.random() * 200,
      z: -5,
      scale: 1,
      rotation: 0,
      properties: {},
    });
    addAgentLog(`Added new ${type} entity to workspace`, 'info');
  };

  const instantiatePrefab = (prefab: Prefab) => {
    addEntity({
      type: prefab.type,
      name: `${prefab.name} (Instance)`,
      x: 100 + Math.random() * 50,
      y: 100 + Math.random() * 50,
      z: -5,
      scale: prefab.properties.scale || 1,
      rotation: prefab.properties.rotation || 0,
      properties: { ...prefab.properties },
    });
    addAgentLog(`Instantiated prefab: ${prefab.name}`, 'success');
  };

  const saveAsPrefab = (nodeId: string) => {
    const node = entities.find(n => n.id === nodeId);
    if (!node) return;

    addPrefab({
      name: `${node.name} Template`,
      type: node.type,
      properties: { ...node.properties },
    });
    addAgentLog(`Saved ${node.name} as a new prefab`, 'success');
  };

  return (
    <div className="h-full w-full bg-ui-bg flex flex-col relative overflow-hidden" ref={containerRef}>
      {/* Canvas Toolbar */}
      <div className="h-12 border-b border-ui-border flex items-center px-4 justify-between bg-ui-panel/50 backdrop-blur-md z-20">
        <div className="flex items-center gap-2">
          <div className="flex bg-ui-bg rounded-lg border border-ui-border p-1">
            <ToolbarButton 
              icon={<MousePointer2 className="w-3.5 h-3.5" />} 
              active={activeTool === 'select'} 
              onClick={() => setActiveTool('select')}
            />
            <ToolbarButton 
              icon={<Plus className="w-3.5 h-3.5" />} 
              active={activeTool === 'place'}
              onClick={() => setActiveTool('place')}
            />
          </div>
          <div className="h-4 w-[1px] bg-ui-border mx-2" />
          <div className="flex gap-1">
            <button onClick={() => addNewEntity('mesh')} className="p-1.5 hover:bg-ui-accent/10 rounded transition-colors" title="Add Mesh">
              <Square className="w-4 h-4 text-cyan-400" />
            </button>
            <button onClick={() => addNewEntity('light')} className="p-1.5 hover:bg-ui-accent/10 rounded transition-colors" title="Add Light">
              <Circle className="w-4 h-4 text-yellow-400" />
            </button>
            <button className="p-1.5 hover:bg-ui-accent/10 rounded transition-colors" title="Add Label">
              <Type className="w-4 h-4 text-purple-400" />
            </button>
            <div className="w-[1px] h-4 bg-ui-border mx-1" />
            <button 
              onClick={() => setIsAIArchitectOpen(true)}
              className="p-1.5 bg-ui-accent/10 hover:bg-ui-accent/20 text-ui-accent rounded transition-colors flex items-center gap-1.5 px-2" 
              title="AI Architect"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-tighter">AI Architect</span>
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-2 py-1 bg-ui-accent/10 border border-ui-accent/20 rounded text-[10px] font-bold text-ui-accent">
            <Play className="w-3 h-3 fill-current" />
            LIVE_SYNC_ON
          </div>
          <button 
            onClick={() => {
              const name = prompt("Scene Name:", scenes.find(s => s.id === currentSceneId)?.name || 'New Scene');
              if (name) saveScene(name);
            }}
            className="p-2 hover:bg-ui-panel border border-ui-border rounded-lg text-ui-text-muted transition-all"
            title="Save Current Scene"
          >
            <Save className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden flex">
        {/* Prefab Library Sidebar */}
        <div className="w-48 bg-ui-panel border-r border-ui-border flex flex-col z-20">
          <div className="p-3 border-b border-ui-border flex items-center gap-2 text-[10px] font-bold text-ui-text uppercase tracking-widest bg-ui-bg/30">
            <Layers className="w-3.5 h-3.5 text-orange-400" />
            Prefab Library
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {prefabs.map((prefab) => (
              <button
                key={prefab.id}
                onClick={() => instantiatePrefab(prefab)}
                className="w-full p-2 bg-ui-bg border border-ui-border rounded-lg text-left group hover:border-ui-accent transition-all"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1 bg-ui-accent/10 rounded">
                    {prefab.type === 'mesh' ? <Square className="w-3 h-3 text-cyan-400" /> : <Circle className="w-3 h-3 text-yellow-400" />}
                  </div>
                  <span className="text-[10px] font-bold text-ui-text-muted group-hover:text-ui-text transition-colors">
                    {prefab.name}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[8px] text-ui-text-muted/60">
                  <span>ID: {prefab.id}</span>
                  <Plus className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            ))}
          </div>

          <div className="p-3 border-t border-b border-ui-border flex items-center justify-between text-[10px] font-bold text-ui-text uppercase tracking-widest bg-ui-bg/30">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
              Scenes
            </div>
            <button 
              onClick={() => {
                const name = prompt("New Scene Name:");
                if (name) createScene(name);
              }}
              className="p-1 hover:bg-ui-accent hover:text-white rounded transition-colors"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
          <div className="h-48 overflow-y-auto p-2 space-y-1">
            {scenes.map((scene) => (
              <button
                key={scene.id}
                onClick={() => loadScene(scene.id)}
                className={cn(
                  "w-full p-2 rounded-lg text-left transition-all border flex items-center justify-between group",
                  currentSceneId === scene.id 
                    ? "bg-ui-accent/20 border-ui-accent text-ui-accent" 
                    : "bg-ui-bg border-ui-border text-ui-text-muted hover:border-ui-accent/50"
                )}
              >
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold truncate">{scene.name}</span>
                  <span className="text-[8px] opacity-60">
                    {new Date(scene.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                {currentSceneId === scene.id && <div className="w-1.5 h-1.5 rounded-full bg-ui-accent animate-pulse" />}
              </button>
            ))}
          </div>
        </div>

        <div 
          className={cn(
            "flex-1 relative overflow-hidden bg-ui-bg",
            activeTool === 'place' && "cursor-crosshair"
          )}
          onClick={handleCanvasClick}
        >
          {/* Infinite Grid Background */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ 
            backgroundImage: 'radial-gradient(#fff 1px, transparent 0)',
            backgroundSize: '24px 24px'
          }} />

        {/* Nodes Layer */}
        <div className="relative h-full w-full p-8">
          {entities.map((node) => (
            <motion.div
              key={node.id}
              drag
              dragMomentum={false}
              onDragStart={() => setSelectedNode(node.id)}
              onDrag={(e, info) => {
                updateEntity(node.id, { 
                  x: node.x + info.delta.x, 
                  y: node.y + info.delta.y 
                });
              }}
              className={cn(
                "absolute w-40 bg-ui-panel border rounded-xl overflow-hidden shadow-xl cursor-move flex flex-col group",
                selectedNode === node.id ? "border-ui-accent ring-1 ring-ui-accent shadow-ui-accent/20" : "border-ui-border"
              )}
              style={{ left: node.x, top: node.y }}
            >
              <div className="p-2 bg-ui-bg/50 border-b border-ui-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {node.type === 'mesh' && <Square className="w-3 h-3 text-cyan-400" />}
                  {node.type === 'light' && <Circle className="w-3 h-3 text-yellow-400" />}
                  <span className="text-[10px] font-bold text-ui-text uppercase tracking-tighter truncate w-24">
                    {node.name}
                  </span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]" />
              </div>
              <div className="p-3 space-y-1">
                <div className="flex justify-between text-[8px] text-ui-text-muted">
                  <span>LOCATION</span>
                  <span className="text-ui-text">X:{Math.round(node.x)} Y:{Math.round(node.y)}</span>
                </div>
                <div className="flex justify-between text-[8px] text-ui-text-muted">
                  <span>ASSET_REF</span>
                  <span className="text-ui-accent truncate">local://entity_${node.id}</span>
                </div>
              </div>
              <div className="h-1 bg-ui-accent/10">
                <div className="h-full bg-ui-accent w-1/2" />
              </div>
            </motion.div>
          ))}
          
          {/* Node Connections (placeholder visual) */}
          <svg className="absolute inset-0 pointer-events-none w-full h-full opacity-20">
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: '#06b6d4', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
            {entities.length > 1 && entities.slice(0, -1).map((node, i) => (
              <line 
                key={i} 
                x1={node.x + 80} 
                y1={node.y + 40} 
                x2={entities[i+1].x + 80} 
                y2={entities[i+1].y + 40} 
                stroke="url(#grad1)" 
                strokeWidth="1" 
                strokeDasharray="4 4"
              />
            ))}
          </svg>
        </div>
      </div>
      </div>

      {/* Properties Sidebar (Nested in Canvas) */}
      <div className="absolute top-16 right-4 bottom-4 w-60 bg-ui-panel/90 backdrop-blur-xl border border-ui-border rounded-2xl shadow-2xl z-30 flex flex-col p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[10px] font-bold text-ui-text flex items-center gap-2 uppercase">
            <Settings className="w-3.5 h-3.5 text-ui-accent" />
            Entity Inspector
          </h3>
          <button 
            onClick={() => selectedNode && deleteEntity(selectedNode)}
            className="text-ui-text-muted hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
        
        {selectedNode ? (() => {
          const node = entities.find(n => n.id === selectedNode);
          if (!node) return null;
          return (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[8px] text-ui-text-muted uppercase">Entity Identity</label>
                <input 
                  className="w-full bg-ui-bg border border-ui-border rounded p-1.5 text-[10px] text-ui-text outline-none focus:border-ui-accent"
                  value={node.name}
                  onChange={(e) => updateEntity(node.id, { name: e.target.value })}
                />
              </div>
              
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <PropertyInput 
                    label="Pos X" 
                    value={node.x} 
                    onChange={(v) => updateEntity(node.id, { x: v })} 
                  />
                  <PropertyInput 
                    label="Pos Y" 
                    value={node.y} 
                    onChange={(v) => updateEntity(node.id, { y: v })} 
                  />
                  <PropertyInput 
                    label="Pos Z" 
                    value={node.z} 
                    onChange={(v) => updateEntity(node.id, { z: v })} 
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <PropertyInput 
                    label="Scale" 
                    value={node.scale} 
                    onChange={(v) => updateEntity(node.id, { scale: v })} 
                  />
                  <PropertyInput 
                    label="Rotation" 
                    value={node.rotation} 
                    onChange={(v) => updateEntity(node.id, { rotation: v })} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[8px] text-ui-text-muted uppercase">Logic Hooks</label>
                <div className="p-2 bg-ui-bg border border-ui-border rounded text-[9px] font-mono text-cyan-400/80">
                  {"on_update: () => move(self)"}
                </div>
              </div>
              
              <div className="mt-auto pt-4 border-t border-ui-border space-y-2">
                 <button 
                   onClick={() => saveAsPrefab(selectedNode)}
                   className="w-full py-2 border border-ui-accent text-ui-accent hover:bg-ui-accent hover:text-white rounded text-[10px] font-bold uppercase tracking-widest transition-all"
                 >
                   Save as Prefab
                 </button>
                 <button className="w-full py-2 bg-ui-accent rounded text-[10px] font-bold text-white uppercase tracking-widest shadow-lg">
                   Sync with Spatial
                 </button>
              </div>
            </div>
          );
        })() : (
          <div className="flex-1 flex flex-col items-center justify-center text-ui-text-muted/40 text-center space-y-2">
            <Layers className="w-8 h-8 opacity-10" />
            <p className="text-[9px] uppercase">Select an entity to<br/>inspect parameters</p>
          </div>
        )}
      </div>

      <AIArchitect 
        isOpen={isAIArchitectOpen} 
        onClose={() => setIsAIArchitectOpen(false)} 
      />
    </div>
  );
}

function ToolbarButton({ icon, active, onClick }: { icon: React.ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "p-1.5 rounded transition-all",
        active ? "bg-ui-accent text-white shadow-sm" : "text-ui-text-muted hover:bg-ui-accent/10 hover:text-ui-text"
      )}
    >
      {icon}
    </button>
  );
}

function PropertyInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="space-y-1">
      <label className="text-[8px] text-ui-text-muted uppercase">{label}</label>
      <input 
        type="number"
        step="0.1"
        className="w-full bg-ui-bg border border-ui-border rounded p-1 text-[10px] text-ui-text text-center outline-none focus:border-ui-accent transition-colors"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      />
    </div>
  );
}
