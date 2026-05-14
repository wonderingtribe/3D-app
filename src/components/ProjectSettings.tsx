import React from 'react';
import { useWorkspace } from '../WorkspaceContext';
import { Settings, Shield, Cpu, Database, Link as LinkIcon, Palette, Zap, Globe, Key, Eye, EyeOff } from 'lucide-react';
import { cn } from '../lib/utils';

export default function ProjectSettings() {
  const { config, updateConfig, addAgentLog, executeAgentTask } = useWorkspace();

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-ui-text-muted border-b border-ui-border pb-2">
        <Settings className="w-3 h-3 text-ui-accent" />
        Core Workspace Configuration
      </div>

      {/* Engine Selection */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-bold text-ui-text-muted uppercase flex items-center gap-2">
            <Cpu className="w-3 h-3 text-ui-accent" />
            Rendering Engine
          </label>
          <button 
            onClick={() => updateConfig({ localDev: !config.localDev })}
            className={cn(
              "text-[9px] px-2 py-0.5 rounded border transition-all",
              config.localDev ? "bg-green-600/20 border-green-500 text-green-400" : "bg-ui-panel border-ui-border text-ui-text-muted"
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
                  ? "bg-ui-accent/20 border-ui-accent/40 text-ui-accent" 
                  : "bg-ui-panel border-ui-border text-ui-text-muted hover:bg-ui-accent/5"
              )}
            >
              {eng}
            </button>
          ))}
        </div>
      </div>

      {/* BYOK Section */}
      <div className="space-y-4">
        <label className="text-[10px] font-bold text-ui-text-muted uppercase flex items-center gap-2">
          <Key className="w-3 h-3 text-ui-accent" />
          BYOK (Bring Your Own Key)
        </label>
        <div className="space-y-3 bg-ui-panel/40 border border-ui-border rounded-xl p-3">
          <KeyInput 
            label="OpenAI API Key" 
            placeholder="sk-..." 
            value={config.keys?.openai || ''} 
            onChange={(val) => updateConfig({ keys: { ...config.keys, openai: val } })}
          />
          <KeyInput 
            label="Gemini API Key" 
            placeholder="AIza..." 
            value={config.keys?.gemini || ''} 
            onChange={(val) => updateConfig({ keys: { ...config.keys, gemini: val } })}
          />
          <KeyInput 
            label="Anthropic Key" 
            placeholder="sk-ant-..." 
            value={config.keys?.anthropic || ''} 
            onChange={(val) => updateConfig({ keys: { ...config.keys, anthropic: val } })}
          />
          <KeyInput 
            label="Perplexity Key" 
            placeholder="pplx-..." 
            value={config.keys?.perplexity || ''} 
            onChange={(val) => updateConfig({ keys: { ...config.keys, perplexity: val } })}
          />
          <KeyInput 
            label="Groq API Key" 
            placeholder="gsk_..." 
            value={config.keys?.groq || ''} 
            onChange={(val) => updateConfig({ keys: { ...config.keys, groq: val } })}
          />
          <p className="text-[8px] text-ui-text-muted/60 italic leading-tight">
            Keys are stored locally in the workspace session. They will be used to prioritize your own quotas.
          </p>
        </div>
      </div>
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
        <label className="text-[10px] font-bold text-ui-text-muted uppercase flex items-center gap-2">
          <Palette className="w-3 h-3 text-orange-400" />
          UI Atmosphere
        </label>
        <div className="flex flex-col gap-1">
          {['dark', 'light', 'brutalist'].map((t) => (
            <button
              key={t}
              onClick={() => updateConfig({ theme: t as any })}
              className={cn(
                "w-full px-3 py-2 rounded text-left text-[10px] font-bold uppercase flex justify-between items-center transition-all",
                config.theme === t 
                  ? "bg-orange-600/20 text-orange-500 border-l-2 border-orange-500" 
                  : "text-ui-text-muted hover:bg-ui-panel hover:text-ui-text"
              )}
            >
              {t}
              {config.theme === t && <div className="w-1.5 h-1.5 rounded-full bg-orange-400 shadow-[0_0_8px_orange]" />}
            </button>
          ))}
        </div>
      </div>

      {/* Features Toggle */}
      <div className="space-y-3">
        <label className="text-[10px] font-bold text-ui-text-muted uppercase flex items-center gap-2">
          <Shield className="w-3 h-3 text-green-400" />
          Feature Modules
        </label>
        <div className="space-y-2">
          {Object.entries(config.features).map(([key, value]) => (
            <button
              key={key}
              onClick={() => updateConfig({ features: { ...config.features, [key]: !value } })}
              className="w-full flex items-center justify-between text-[10px] p-2 bg-ui-panel border border-ui-border rounded hover:bg-ui-accent/5 transition-all"
            >
              <span className="text-ui-text-muted capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
              <div className={cn(
                "w-8 h-4 rounded-full relative transition-colors duration-300",
                value ? "bg-green-600" : "bg-ui-text-muted/20"
              )}>
                <div className={cn(
                  "absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform duration-300 shadow",
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

      <div className="pt-2 border-t border-white/5">
        <button 
          onClick={() => {
            addAgentLog("Initiating full system distillation for distribution...", "info");
            executeAgentTask("Generate a full deployment template for this workspace. Create a standalone 'dist-package' folder containing all current spatial configurations, asset references, and a self-bootstrapping server setup. The goal is to make this app 'replicate' itself for distribution.");
          }}
          className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-[10px] font-bold uppercase flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(6,182,212,0.1)]"
        >
          <Globe className="w-4 h-4" />
          Deploy to Aether Cloud
        </button>
      </div>
    </div>
  );
}

function KeyInput({ label, placeholder, value, onChange }: { label: string; placeholder: string; value: string; onChange: (v: string) => void }) {
  const [show, setShow] = React.useState(false);
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center px-1">
        <label className="text-[8px] text-ui-text-muted uppercase font-bold">{label}</label>
      </div>
      <div className="relative group">
        <input 
          type={show ? "text" : "password"}
          placeholder={placeholder}
          className="w-full bg-ui-bg border border-ui-border rounded-lg p-1.5 px-3 text-[10px] text-ui-text outline-none focus:border-ui-accent transition-all pr-8"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <button 
          onClick={() => setShow(!show)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-ui-text-muted hover:text-ui-accent transition-colors p-1"
        >
          {show ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
        </button>
      </div>
    </div>
  );
}
