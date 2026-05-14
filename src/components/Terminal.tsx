import React, { useState, useEffect, useRef } from 'react';
import { useWorkspace } from '../WorkspaceContext';
import { Terminal as TerminalIcon, X, Maximize2, Trash2, Command, Zap } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

export default function Terminal() {
  const { terminalLogs, sendTerminalCommand } = useWorkspace();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [terminalLogs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendTerminalCommand(input);
    setInput('');
  };

  return (
    <div className="h-full flex flex-col bg-black/40 font-mono">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="text-[10px] uppercase tracking-widest text-white/40">Terminal Stream</div>
          <div className="flex items-center gap-1">
             <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
             <span className="text-[9px] text-green-500/80 font-bold">SSH_ACTIVE</span>
          </div>
        </div>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 bg-black/60 rounded-lg border border-white/5 p-3 text-[10px] space-y-1 overflow-y-auto no-scrollbar"
      >
        <div className="text-cyan-400 opacity-60">$ aetheros-init --runtime=cloud</div>
        <div className="text-white/40 italic">Initializing high-compute OCI environment...</div>
        {terminalLogs.map((log, i) => (
          <div key={i} className="whitespace-pre-wrap text-white/70">
            <span className="text-cyan-500/40 mr-1.5">›</span>
            {log}
          </div>
        ))}
        {terminalLogs.length === 0 && (
          <div className="text-white/20 italic">Waiting for process attachment...</div>
        )}
        <motion.div 
          animate={{ opacity: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="w-1.5 h-3 bg-white/40 inline-block align-middle ml-1"
        />
      </div>

      <form onSubmit={handleSubmit} className="mt-2 relative">
        <div className="absolute left-2 top-1.5 text-cyan-500 font-bold text-[10px]">λ</div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="input sequence..."
          className="w-full bg-white/5 border border-white/10 rounded-md py-1.5 pl-6 pr-3 text-[10px] text-white placeholder-white/10 outline-none focus:border-cyan-500/30 transition-all font-mono"
        />
      </form>
    </div>
  );
}
