import React from 'react';
import { useWorkspace } from '../WorkspaceContext';
import { Settings, Shield, Cpu, Database, Link as LinkIcon, Palette, Zap } from 'lucide-react';
import { cn } from '../lib/utils';

export default function ProjectSettings() {
  const { config, updateConfig } = useWorkspace();

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/40 border-b border-white/5 pb-2">
        <Settings className="w-3 h-3" />
        Core Workspace Configuration
      </div>

      {/* Engine Selection */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-2">
            <Cpu className="w-3 h-3 text-cyan-400" />
            Rendering Engine
          </label>
          <button 
            onClick={() => updateConfig({ localDev: !config.localDev })}
            className={cn(
              "text-[9px] px-2 py-0.5 rounded border transition-all",
              config.localDev ? "bg-green-600/20 border-green-500 text-green-400" : "bg-white/5 border-white/10 text-white/40"
            )}
          >
            {config.localDev ? "LOCAL_DEV_ON" : "LOCAL_DEV_OFF"}
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {['three', 'playcanvas', 'babylon'].map((eng) => (
            <button
              key={eng}
              onClick={() => updateConfig({ engine: eng as any })}
              className={cn(
                "p-2 rounded border text-[10px] font-bold uppercase transition-all",
                config.engine === eng 
                  ? "bg-cyan-600/20 border-cyan-500/40 text-cyan-400" 
                  : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
              )}
            >
              {eng}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Engine URL */}
      {config.engine !== 'three' && (
        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
          <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-2">
            <LinkIcon className="w-3 h-3 text-purple-400" />
            External Engine URL
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={config.customEngineUrl || ''}
              onChange={(e) => updateConfig({ customEngineUrl: e.target.value })}
              placeholder="https://..."
              className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1.5 text-[10px] text-white focus:outline-none focus:border-purple-500 transition-all"
            />
          </div>
          <p className="text-[9px] text-white/30 italic">
            Connecting custom 3D runtime... The workspace will sandbox this URL.
          </p>
        </div>
      )}

      {/* Theme Selection */}
      <div className="space-y-3">
        <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-2">
          <Palette className="w-3 h-3 text-orange-400" />
          UI Atmosphere
        </label>
        <div className="flex flex-col gap-1">
          {['dark', 'light', 'brutalist'].map((theme) => (
            <button
              key={theme}
              onClick={() => updateConfig({ theme: theme as any })}
              className={cn(
                "w-full px-3 py-2 rounded text-left text-[10px] font-bold uppercase flex justify-between items-center transition-all",
                config.theme === theme 
                  ? "bg-orange-600/20 text-orange-400 border-l-2 border-orange-500" 
                  : "text-white/40 hover:bg-white/5"
              )}
            >
              {theme}
              {config.theme === theme && <div className="w-1.5 h-1.5 rounded-full bg-orange-400 shadow-[0_0_8px_orange]" />}
            </button>
          ))}
        </div>
      </div>

      {/* Features Toggle */}
      <div className="space-y-3">
        <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-2">
          <Shield className="w-3 h-3 text-green-400" />
          Feature Modules
        </label>
        <div className="space-y-2">
          {Object.entries(config.features).map(([key, value]) => (
            <button
              key={key}
              onClick={() => updateConfig({ features: { ...config.features, [key]: !value } })}
              className="w-full flex items-center justify-between text-[10px] p-2 bg-white/5 border border-white/5 rounded hover:bg-white/10 transition-all"
            >
              <span className="text-white/60 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
              <div className={cn(
                "w-8 h-4 rounded-full relative transition-colors duration-300",
                value ? "bg-green-600" : "bg-gray-800"
              )}>
                <div className={cn(
                  "absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform duration-300",
                  value ? "translate-x-4.5" : "translate-x-0.5"
                )} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Integration Guide */}
      <div className="bg-cyan-600/5 rounded-lg p-3 border border-cyan-500/10">
        <h4 className="text-[9px] font-bold text-cyan-400 uppercase mb-2 flex items-center gap-1">
          <Zap className="w-2.5 h-2.5" /> Integration Hub
        </h4>
        <ul className="text-[8px] text-white/40 space-y-2 list-disc pl-3">
          <li>Use <code className="text-cyan-300">/clone</code> to bring your existing repo into this workspace.</li>
          <li>Set <code className="text-cyan-300">Engine</code> to 'custom' and paste your build URL above.</li>
          <li>Each <code className="text-cyan-300">Deploy</code> creates a private user-sandbox at <code className="text-cyan-300">/generated-editors/</code>.</li>
        </ul>
      </div>
    </div>
  );
}
