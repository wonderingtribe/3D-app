import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Sparkles, Loader2, X, Send, Wand2 } from 'lucide-react';
import { useWorkspace } from '../WorkspaceContext';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function AIArchitect({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { setEntities, addAgentLog } = useWorkspace();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateScene = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    addAgentLog(`AI Architect is designing: ${prompt}`, 'ai');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Design a 3D scene based on this description: "${prompt}". 
        Return an array of entities with their types ('mesh' or 'light'), names, and 3D coordinates (x, y, z).
        The coordinates should be roughly in the range of -20 to 20 for x and z, and 0 to 10 for y.
        Also include a 'color' property in hex format for each entity.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              entities: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING, enum: ['mesh', 'light'] },
                    name: { type: Type.STRING },
                    x: { type: Type.NUMBER },
                    y: { type: Type.NUMBER },
                    z: { type: Type.NUMBER },
                    color: { type: Type.STRING }
                  },
                  required: ['type', 'name', 'x', 'y', 'z', 'color']
                }
              }
            },
            required: ['entities']
          }
        }
      });

      const data = JSON.parse(response.text);
      
      if (data.entities && Array.isArray(data.entities)) {
        const newEntities = data.entities.map((ent: any) => ({
          id: Math.random().toString(36).substr(2, 9),
          type: ent.type,
          name: ent.name,
          // Canvas Editor uses 2D coords for its view, so we map them
          x: ent.x * 20 + 200,
          y: ent.z * 20 + 200,
          z: ent.y,
          scale: 1,
          rotation: 0,
          properties: { color: ent.color }
        }));
        
        setEntities(newEntities);
        addAgentLog(`AI successfully architected ${newEntities.length} entities.`, 'success');
        onClose();
      }
    } catch (error) {
      console.error("AI Generation Error:", error);
      addAgentLog(`AI Architect failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-ui-panel border border-ui-border rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-4 border-b border-ui-border flex items-center justify-between bg-ui-bg/30">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-ui-accent/20 rounded-lg">
                  <Wand2 className="w-4 h-4 text-ui-accent" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-ui-text uppercase tracking-widest leading-none">AI Architect</h3>
                  <p className="text-[10px] text-ui-text-muted mt-1 uppercase tracking-tighter">Describe a scene to auto-generate entities</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-1.5 hover:bg-white/5 rounded-full text-ui-text-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., A futuristic laboratory with blue accent lights and a central podium..."
                className="w-full h-32 bg-ui-bg border border-ui-border rounded-xl p-4 text-xs text-ui-text outline-none focus:border-ui-accent transition-all resize-none"
                disabled={isGenerating}
              />

              <div className="flex gap-2">
                 <PromptChip label="Neon Cyberpunk" onClick={() => setPrompt("A neon-lit cyberpunk alleyway with pink and cyan lights")} />
                 <PromptChip label="Minimalist Room" onClick={() => setPrompt("A minimalist art gallery with soft white spotlights")} />
                 <PromptChip label="Sci-Fi Core" onClick={() => setPrompt("The reactor core of a spaceship with pulsing red energy")} />
              </div>

              <button
                onClick={generateScene}
                disabled={isGenerating || !prompt.trim()}
                className={cn(
                  "w-full py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest transition-all",
                  isGenerating 
                    ? "bg-ui-accent/20 text-ui-accent cursor-not-allowed" 
                    : "bg-ui-accent text-white hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] shadow-lg"
                )}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating Scene Data...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Architect Scene
                  </>
                )}
              </button>
            </div>
            
            <div className="px-4 py-3 bg-ui-bg/50 border-t border-ui-border flex items-center justify-between">
               <div className="flex items-center gap-2">
                  <Sparkles className="w-3 h-3 text-ui-accent" />
                  <span className="text-[9px] text-ui-text-muted uppercase tracking-tighter">Gemini 3 Flash Powered</span>
               </div>
               <div className="text-[9px] text-white/20 italic">
                  spatial_v2.0_neural_engine
               </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function PromptChip({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="px-2 py-1 bg-ui-accent/10 border border-ui-accent/20 rounded text-[9px] text-ui-accent font-bold hover:bg-ui-accent/20 transition-all uppercase tracking-tighter"
    >
      {label}
    </button>
  );
}
