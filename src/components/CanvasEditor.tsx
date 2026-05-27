import React from 'react';
import { 
  Plus, 
  Layers, 
  MousePointer2, 
  Grid3X3, 
  Play, 
  Save, 
  Trash2,
  Move,
  Search,
  Image as ImageIcon,
  Box,
  Zap
} from 'lucide-react';
import { useWorkspace } from '../WorkspaceContext';
import { cn } from '../lib/utils';
import { WorldEntity } from '../types';
import AIArchitect from './AIArchitect';
import { useState, useRef } from 'react';

export default function CanvasEditor() {
  const { config, addAgentLog, entities, updateEntity, addEntity, deleteEntity, prefabs, addPrefab, scenes, currentSceneId, saveScene, loadScene, createScene } = useWorkspace();
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [isAIArchitectOpen, setIsAIArchitectOpen] = useState(false);
  const [activeTool, setActiveTool] = useState<'select' | 'place'>('select');
  const containerRef = useRef<HTMLDivElement>(null);

  // Creative Overlay Modal States
  const [creationModalOpen, setCreationModalOpen] = useState(false);
  const [creationName, setCreationName] = useState('New Entity');
  const [creationType, setCreationType] = useState<'mesh' | 'light'>('mesh');
  const [creationCoords, setCreationCoords] = useState({ x: 0, y: 0 });

  // Custom Prompt Modal States
  const [promptOpen, setPromptOpen] = useState(false);
  const [promptTitle, setPromptTitle] = useState('');
  const [promptValue, setPromptValue] = useState('');
  const [promptPlaceholder, setPromptPlaceholder] = useState('');
  const [onPromptSubmit, setOnPromptSubmit] = useState<((val: string) => void) | null>(null);

  const triggerPrompt = (title: string, defaultValue: string, placeholder: string, callback: (val: string) => void) => {
    setPromptTitle(title);
    setPromptValue(defaultValue);
    setPromptPlaceholder(placeholder);
    setOnPromptSubmit(() => callback);
    setPromptOpen(true);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (activeTool !== 'place' || !containerRef.current) return;
    
    // Check if we clicked on an existing entity (don't place on top)
    if ((e.target as HTMLElement).closest('.cursor-move')) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - 200; // Offset for centered origin or just local coord
    const y = e.clientY - rect.top;

    setCreationCoords({ x, y });
    setCreationName(`Node_${Math.floor(Math.random() * 900 + 100)}`);
    setCreationType('mesh');
    setCreationModalOpen(true);
  };

  const handleConfirmCreation = () => {
    addEntity({
      type: creationType,
      name: creationName,
      x: creationCoords.x,
      y: creationCoords.y,
      z: creationType === 'light' ? 5 : 1,
      scale: 1,
      rotation: 0,
      properties: {},
    });

    addAgentLog(`Placed new ${creationType} '${creationName}' at ${Math.round(creationCoords.x)}, ${Math.round(creationCoords.y)}`, 'info');
    setActiveTool('select');
    setCreationModalOpen(false);
  };

  const addNewEntity = (type: WorldEntity['type']) => {
    addEntity({
      type,
      name: `New ${type}`,
      x: 50 + Math.random() * 200,
      y: 50 + Math.random() * 200,
      z: -5,
      scale: 1,
      rotation: 0,
      properties: {},
    });
    addAgentLog(`Added new ${type} entity to workspace`, 'info');
  };

  const instantiatePrefab = (prefab: any) => {
    if (prefab.type === 'group' && prefab.properties.children) {
      const baseX = 100 + Math.random() * 50;
      const baseY = 100 + Math.random() * 50;
      prefab.properties.children.forEach((child: any) => {
        addEntity({
          type: child.type,
          name: child.name,
          x: baseX + child.x,
          y: baseY + child.y,
          z: child.z,
          scale: child.scale,
          rotation: child.rotation,
          properties: child.properties
        });
      });
      addAgentLog(`Instantiated group prefab: ${prefab.name}`, 'success');
    } else {
      addEntity({
        type: prefab.type,
        name: `Instanced ${prefab.name}`,
        x: 100 + Math.random() * 50,
        y: 100 + Math.random() * 50,
        z: -5,
        scale: prefab.properties.scale || 1,
        rotation: prefab.properties.rotation || 0,
        properties: { ...prefab.properties },
      });
      addAgentLog(`Instantiated prefab: ${prefab.name}`, 'success');
    }
  };

  const saveAsPrefab = () => {
    if (selectedNodes.length === 0) return;
    
    if (selectedNodes.length === 1) {
      const entity = entities.find(e => e.id === selectedNodes[0]);
      if (!entity) return;
      addPrefab({
        name: entity.name + " PFB",
        type: entity.type,
        properties: { ...entity.properties, scale: entity.scale, rotation: entity.rotation }
      });
      addAgentLog(`Defined new prefab from ${entity.name}`, 'success');
      return;
    }
    
    const selectedEntities = entities.filter(e => selectedNodes.includes(e.id));
    
    triggerPrompt("Group Prefab Name", "New Group Prefab", "Enter group label name", (name) => {
      const pName = name.trim() || "Group Prefab";
      const avgX = selectedEntities.reduce((sum, e) => sum + e.x, 0) / selectedEntities.length;
      const avgY = selectedEntities.reduce((sum, e) => sum + e.y, 0) / selectedEntities.length;
      
      const children = selectedEntities.map(e => ({
         ...e,
         x: e.x - avgX,
         y: e.y - avgY
      }));
      
      addPrefab({
        name: pName,
        type: 'group',
        properties: { children }
      });
      addAgentLog(`Defined new grouped prefab from ${selectedNodes.length} entities`, 'success');
    });
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Node Graph / Tree Inspector Sidebar */}
      <div className="w-64 border-r border-ui-border flex flex-col bg-ui-panel/30">
        <div className="p-3 border-b border-ui-border flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] font-bold text-ui-text uppercase tracking-widest">
            <Layers className="w-3.5 h-3.5 text-ui-accent" />
            Workspace Tree
          </div>
          <div className="flex gap-1">
             <button title="Global Search" className="p-1 hover:bg-white/5 rounded"><Search className="w-3 h-3 text-ui-text-muted" /></button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {entities.map((node) => (
            <div 
              key={node.id}
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey) {
                  setSelectedNodes(prev => prev.includes(node.id) ? prev.filter(id => id !== node.id) : [...prev, node.id]);
                } else {
                  setSelectedNodes([node.id]);
                }
              }}
              className={cn(
                "group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all border",
                selectedNodes.includes(node.id) 
                  ? "bg-ui-accent/10 border-ui-accent/30 text-ui-text shadow-inner" 
                  : "bg-white/5 border-transparent text-ui-text-muted hover:border-white/10 hover:bg-white/10"
              )}
            >
              <div className={cn(
                "w-1.5 h-1.5 rounded-full",
                node.type === 'mesh' ? "bg-cyan-400" : node.type === 'light' ? "bg-yellow-400" : "bg-purple-400"
              )} />
              <span className="text-[10px] font-medium flex-1 truncate">{node.name}</span>
              <button 
                onClick={(e) => { e.stopPropagation(); deleteEntity(node.id); setSelectedNodes(prev => prev.filter(id => id !== node.id)); }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        {/* Prefabs Section */}
        <div className="p-3 border-t border-ui-border flex items-center gap-2 text-[10px] font-bold text-ui-text uppercase tracking-widest bg-ui-bg/30">
          <Box className="w-3.5 h-3.5 text-ui-accent" />
          Prefab Library
        </div>
        <div className="h-48 overflow-y-auto p-2 space-y-1">
          {prefabs.map((prefab) => (
            <button
              key={prefab.id}
              onClick={() => instantiatePrefab(prefab)}
              className="w-full group flex items-center gap-3 p-2 rounded-lg bg-ui-bg border border-ui-border hover:border-ui-accent/50 text-ui-text-muted hover:text-ui-text transition-all text-left"
            >
              <div className="w-6 h-6 rounded bg-ui-panel flex items-center justify-center border border-ui-border group-hover:bg-ui-accent/10 transition-colors">
                <Box className="w-3 h-3 opacity-50" />
              </div>
              <span className="text-[10px] font-medium truncate">{prefab.name}</span>
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
              triggerPrompt("New Scene Name", "New Scene", "Enter scene label", (name) => {
                if (name.trim()) createScene(name.trim());
              });
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

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-ui-bg relative">
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
               <button onClick={() => addNewEntity('mesh')} className="p-1 px-2 border border-ui-border rounded hover:bg-ui-panel text-[9px] font-bold text-ui-text-muted">NEW_MESH</button>
               <button onClick={() => addNewEntity('light')} className="p-1 px-2 border border-ui-border rounded hover:bg-ui-panel text-[9px] font-bold text-ui-text-muted">NEW_LIGHT</button>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-[9px] font-bold text-green-400 bg-green-400/10 px-3 py-1 rounded-full border border-green-400/20 shadow-sm shadow-green-400/10">
            <Play className="w-3 h-3 fill-current" />
            LIVE_SYNC_ON
          </div>
          <button 
            onClick={() => {
              const currentName = scenes.find(s => s.id === currentSceneId)?.name || 'New Scene';
              triggerPrompt("Save Scene", currentName, "Enter scene label", (name) => {
                if (name.trim()) saveScene(name.trim());
              });
            }}
            className="p-2 hover:bg-ui-panel border border-ui-border rounded-lg text-ui-text-muted transition-all"
            title="Save Current Scene"
          >
            <Save className="w-4 h-4" />
          </button>
        </div>

        <div 
          ref={containerRef}
          className={cn(
            "flex-1 relative overflow-hidden bg-ui-bg",
            activeTool === 'place' && "cursor-crosshair"
          )}
          onClick={handleCanvasClick}
        >
          {/* Infinite Grid Background */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ 
            backgroundImage: 'radial-gradient(#fff 1px, transparent 0)',
            backgroundSize: '30px 30px'
          }} />

          {/* Render Nodes as draggable cards on 2D plane */}
          {entities.map((node) => (
            <div
              key={node.id}
              className={cn(
                "absolute cursor-move transition-shadow p-3 rounded-lg border flex flex-col gap-2 min-w-[120px] shadow-lg",
                selectedNodes.includes(node.id) 
                  ? "bg-ui-accent/20 border-ui-accent shadow-ui-accent/20 z-10" 
                  : "bg-ui-panel/80 border-ui-border text-ui-text-muted backdrop-blur-md"
              )}
              style={{
                left: node.x + 200,
                top: node.y,
                transform: `scale(${selectedNodes.includes(node.id) ? 1.05 : 1})`,
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                let currentlySelected = selectedNodes;
                if (!selectedNodes.includes(node.id)) {
                  if (e.metaKey || e.ctrlKey || e.shiftKey) {
                    currentlySelected = [...selectedNodes, node.id];
                  } else {
                    currentlySelected = [node.id];
                  }
                  setSelectedNodes(currentlySelected);
                }
                
                const startX = e.clientX;
                const startY = e.clientY;
                
                const startPositions = currentlySelected.map(id => {
                  const ent = entities.find(e => e.id === id);
                  return { id, origX: ent?.x || 0, origY: ent?.y || 0 };
                });
                
                const handleMouseMove = (mmE: MouseEvent) => {
                  const dx = mmE.clientX - startX;
                  const dy = mmE.clientY - startY;
                  startPositions.forEach(({ id, origX, origY }) => {
                    updateEntity(id, {
                      x: origX + dx,
                      y: origY + dy
                    });
                  });
                };
                
                const handleMouseUp = () => {
                  window.removeEventListener('mousemove', handleMouseMove);
                  window.removeEventListener('mouseup', handleMouseUp);
                };
                
                window.addEventListener('mousemove', handleMouseMove);
                window.addEventListener('mouseup', handleMouseUp);
              }}
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-1 mb-1">
                <span className="text-[9px] font-bold uppercase truncate pr-4">{node.name}</span>
                <Move className="w-2.5 h-2.5 opacity-30" />
              </div>
              <div className="flex justify-between items-center opacity-70">
                 <div className="flex flex-col gap-0.5">
                    <span className="text-[7px] uppercase font-bold text-ui-text-muted">Coord_X</span>
                    <span className="text-[9px] font-mono">{Math.round(node.x)}</span>
                 </div>
                 <div className="flex flex-col items-end gap-0.5">
                    <span className="text-[7px] uppercase font-bold text-ui-text-muted">Coord_Y</span>
                    <span className="text-[9px] font-mono">{Math.round(node.y)}</span>
                 </div>
              </div>
            </div>
          ))}

          {/* AI Architect Overlay */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-30">
            <button 
              onClick={() => setIsAIArchitectOpen(true)}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-ui-accent rounded-full text-[12px] font-bold text-white shadow-2xl shadow-purple-500/20 flex items-center gap-3 hover:scale-110 transition-transform active:scale-95"
            >
              <Zap className="w-4 h-4 fill-current" />
              SUMMON_ARCHITECT
            </button>
          </div>

          {isAIArchitectOpen && (
            <AIArchitect onClose={() => setIsAIArchitectOpen(false)} />
          )}

          {/* Custom Creation Dialog */}
          {creationModalOpen && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-[#0c0d12] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative">
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-1">Assemble Entity Node</h3>
                <p className="text-[10px] text-zinc-500 uppercase font-mono mb-4">Coordinates: X:{Math.round(creationCoords.x)} Y:{Math.round(creationCoords.y)}</p>
                
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-400 uppercase font-bold">Node Label</label>
                    <input 
                      type="text"
                      className="w-full bg-[#111318] border border-white/5 rounded-xl p-2.5 text-xs text-zinc-200 outline-none focus:border-ui-accent"
                      value={creationName}
                      onChange={(e) => setCreationName(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-400 uppercase font-bold block">Engine Class</label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <button 
                        type="button"
                        onClick={() => setCreationType('mesh')}
                        className={cn(
                          "py-2 rounded-xl text-xs font-bold transition-all border",
                          creationType === 'mesh' ? "bg-ui-accent/10 border-ui-accent text-ui-text" : "bg-transparent border-white/5 text-zinc-500 hover:border-white/10"
                        )}
                      >
                        Mesh Base
                      </button>
                      <button 
                        type="button"
                        onClick={() => setCreationType('light')}
                        className={cn(
                          "py-2 rounded-xl text-xs font-bold transition-all border",
                          creationType === 'light' ? "bg-amber-500/10 border-amber-500 text-amber-400" : "bg-transparent border-white/5 text-zinc-500 hover:border-white/10"
                        )}
                      >
                        Light Emit
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  <button 
                    type="button"
                    onClick={() => setCreationModalOpen(false)}
                    className="flex-1 py-2 rounded-xl text-xs font-bold text-zinc-400 bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="button"
                    onClick={handleConfirmCreation}
                    className="flex-1 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg transition-colors"
                  >
                    Assemble Node
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Custom Prompt Dialog */}
          {promptOpen && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-[#0c0d12] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative">
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-4">{promptTitle}</h3>
                
                <div className="space-y-4">
                  <input 
                    type="text"
                    className="w-full bg-[#111318] border border-white/5 rounded-xl p-2.5 text-xs text-zinc-200 outline-none focus:border-ui-accent"
                    placeholder={promptPlaceholder}
                    value={promptValue}
                    onChange={(e) => setPromptValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        onPromptSubmit?.(promptValue);
                        setPromptOpen(false);
                      }
                    }}
                  />
                </div>

                <div className="flex gap-2 mt-6">
                  <button 
                    type="button"
                    onClick={() => setPromptOpen(false)}
                    className="flex-1 py-2 rounded-xl text-xs font-bold text-zinc-400 bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      onPromptSubmit?.(promptValue);
                      setPromptOpen(false);
                    }}
                    className="flex-1 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg transition-colors"
                  >
                    Apply Label
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Property Inspector Panel */}
      <div className="w-72 border-l border-ui-border flex flex-col bg-ui-panel/30 backdrop-blur-xl">
        <div className="h-12 border-b border-ui-border flex items-center justify-between px-4">
          <div className="flex items-center gap-2 text-[10px] font-bold text-ui-text uppercase tracking-widest">
            <Grid3X3 className="w-3.5 h-3.5 text-ui-accent" />
            Param_Grid
          </div>
          <button className="p-1 hover:bg-white/5 rounded">
            <Plus className="w-3.5 h-3.5 text-ui-text-muted" />
          </button>
        </div>
        
        {selectedNodes.length > 0 ? (() => {
          if (selectedNodes.length === 1) {
            const node = entities.find(n => n.id === selectedNodes[0]);
            if (!node) return null;
            return (
              <div className="space-y-4 p-4">
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
                     onClick={saveAsPrefab}
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
          } else {
            return (
              <div className="space-y-4 p-4 text-center mt-10">
                <Layers className="w-8 h-8 text-ui-text-muted mx-auto mb-4 opacity-50" />
                <h4 className="text-[12px] font-bold text-ui-text">{selectedNodes.length} Entities Selected</h4>
                <p className="text-[10px] text-ui-text-muted mb-8">Group manipulation features</p>
                
                <div className="pt-4 border-t border-ui-border space-y-2">
                  <button 
                    onClick={saveAsPrefab}
                    className="w-full py-2 border border-ui-accent text-ui-accent hover:bg-ui-accent hover:text-white rounded text-[10px] font-bold uppercase tracking-widest transition-all"
                  >
                    Save Group as Prefab
                  </button>
                  <button 
                    onClick={() => {
                      selectedNodes.forEach(id => deleteEntity(id));
                      setSelectedNodes([]);
                      addAgentLog(`Deleted ${selectedNodes.length} entities`, 'warning');
                    }}
                    className="w-full py-2 border border-red-500/50 text-red-400 hover:bg-red-500 hover:text-white rounded text-[10px] font-bold uppercase tracking-widest transition-all"
                  >
                    Delete Selected
                  </button>
                </div>
              </div>
            );
          }
        })() : (
          <div className="flex-1 flex flex-col items-center justify-center text-ui-text-muted/40 text-center space-y-2">
            <Layers className="w-8 h-8 opacity-10" />
            <p className="text-[9px] uppercase">Select an entity to<br/>inspect parameters</p>
          </div>
        )}
      </div>
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

