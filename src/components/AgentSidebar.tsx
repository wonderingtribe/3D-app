import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../WorkspaceContext';
import { Cpu, Zap, History, Terminal, Database, Shield, BrainCircuit, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import TerminalComponent from './Terminal';

export default function AgentSidebar() {
  const { agentLogs, addAgentLog, isAgentThinking, executeAgentTask } = useWorkspace();
  const [taskInput, setTaskInput] = useState('');

  return (
    <div className="flex flex-col h-full bg-black/40 backdrop-blur-md border-l border-white/5">
      <div className="p-4 flex-1 flex flex-col min-h-0">
        <div className="text-[10px] uppercase tracking-widest text-white/40 mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className={cn("w-3 h-3", isAgentThinking ? "text-cyan-400 animate-spin" : "text-gray-500")} />
            AI Intelligence Feed
          </div>
          {isAgentThinking && (
            <span className="text-cyan-400 animate-pulse text-[9px]">Analyzing context...</span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-white/10">
          <AnimatePresence initial={false}>
            {agentLogs.slice().reverse().map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3"
              >
                <div className={cn(
                  "w-6 h-6 rounded-full border flex items-center justify-center shrink-0",
                  log.type === 'ai' ? "bg-cyan-600/20 border-cyan-500/30 text-cyan-400" :
                  log.type === 'action' ? "bg-orange-600/20 border-orange-500/30 text-orange-400" :
                  log.type === 'info' ? "bg-white/5 border-white/10 text-white/40" :
                  log.type === 'success' ? "bg-green-600/20 border-green-500/30 text-green-400" :
                  "bg-red-600/20 border-red-500/30 text-red-400"
                )}>
                  <span className="text-[8px] uppercase font-bold">
                    {log.type === 'ai' ? 'AI' : log.type === 'action' ? 'EX' : log.type.substring(0, 2)}
                  </span>
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between opacity-30 text-[8px] font-mono">
                    <span className="uppercase">{log.type}</span>
                    <span>{new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}</span>
                  </div>
                  <p className={cn(
                    "text-[11px] leading-relaxed",
                    log.type === 'ai' ? "text-white/80" : "text-white/50"
                  )}>
                    {log.message}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Terminal Section (Nested) */}
        <div className="mt-4 border-t border-white/10 pt-4 flex flex-col h-1/3">
           <TerminalComponent />
        </div>
      </div>

      <div className="p-4 bg-black/40 border-t border-white/5">
        <form 
          onSubmit={(e) => { 
            e.preventDefault(); 
            if(taskInput.trim() && !isAgentThinking) { 
              executeAgentTask(taskInput); 
              setTaskInput(''); 
            }
          }} 
          className="relative"
        >
          <input 
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            disabled={isAgentThinking}
            type="text" 
            placeholder={isAgentThinking ? "Agent sequence active..." : "/type a core task..."} 
            className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-3 text-xs focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all disabled:opacity-50"
          />
          <div className="absolute right-2 top-2 px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[9px] text-white/40 font-mono">
            {isAgentThinking ? <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" /> : '↵'}
          </div>
        </form>
      </div>
    </div>
  );
}
