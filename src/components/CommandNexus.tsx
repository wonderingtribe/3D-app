import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Command, Terminal, Cpu, Search, Sparkles, Database, Github, Box, Zap, Layers } from 'lucide-react';
import { useWorkspace } from '../WorkspaceContext';
import { cn } from '../lib/utils';

const COMMAND_LIST = [
  { cmd: '/config:reset', desc: 'Reset layout to defaults', icon: Zap },
  { cmd: '/theme:toggle', desc: 'Swap between light/dark themes', icon: Sparkles },
  { cmd: '/pipeline', desc: 'Open asset processing pipeline', icon: Layers },
  { cmd: '/provider', desc: 'Switch AI provider', icon: Cpu },
  { cmd: '/model', desc: 'Select active model', icon: Sparkles },
  { cmd: '/deploy', desc: 'Deploy to OCI', icon: Database },
  { cmd: '/github', desc: 'Sync with GitHub', icon: Github },
  { cmd: '/clone', desc: 'Clone external repository', icon: Search },
  { cmd: '/test', desc: 'Run workspace test suite', icon: Zap },
  { cmd: '/spatial', desc: 'Enter spatial mode', icon: Box },
  { cmd: '/terminal', desc: 'Open integrated shell', icon: Terminal },
];

export default function CommandNexus() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { setViewMode, addAgentLog, executeAgentTask, config, updateConfig } = useWorkspace();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredCommands = COMMAND_LIST.filter(c => 
    c.cmd.toLowerCase().includes(query.toLowerCase()) || 
    c.desc.toLowerCase().includes(query.toLowerCase())
  );

  const handleCommand = (cmd: string) => {
    setIsOpen(false);
    setQuery('');
    
    if (cmd.startsWith('Task: ')) {
      executeAgentTask(cmd.replace('Task: ', ''));
      return;
    }

    if (cmd === '/spatial') setViewMode('spatial');
    if (cmd === '/clone') executeAgentTask("Help me clone a repository to bring in my website code.");
    if (cmd === '/test') executeAgentTask("Run the test suite and check for any failures in my 3D engine.");
    if (cmd === '/config:reset') {
      updateConfig({
        panels: {
          left: ["files", "assets"],
          center: ["viewport"],
          right: ["inspector", "ai"],
          bottom: ["terminal", "console"]
        },
        theme: "dark"
      });
    }
    if (cmd === '/theme:toggle') {
      updateConfig({ theme: config.theme === 'dark' ? 'light' : 'dark' });
    }
    
    addAgentLog(`Initiated command: ${cmd}`, 'ai');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 w-full max-w-xl bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl z-[101] overflow-hidden"
          >
            <div className="p-4 border-b border-white/5 flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
              <input
                autoFocus
                type="text"
                value={query}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && query.startsWith('/') === false) {
                    handleCommand(`Task: ${query}`);
                  }
                }}
                onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
                placeholder="Ask Aether AI or type / command..."
                className="flex-1 bg-transparent border-none outline-none text-sm text-gray-200 placeholder-white/20"
              />
              <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 text-[10px] text-gray-400 font-mono">
                AI_READY
              </div>
            </div>

            <div className="max-h-[350px] overflow-y-auto p-2">
               {filteredCommands.length > 0 ? (
                 filteredCommands.map((item, i) => (
                   <button
                     key={item.cmd}
                     onClick={() => handleCommand(item.cmd)}
                     onMouseEnter={() => setSelectedIndex(i)}
                     className={cn(
                       "w-full flex items-center justify-between p-3 rounded-xl transition-all text-left",
                       selectedIndex === i ? "bg-white/10" : ""
                     )}
                   >
                     <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2 rounded-lg bg-white/5 border border-white/10",
                          selectedIndex === i ? "text-cyan-400" : "text-gray-500"
                        )}>
                          <item.icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-200">{item.cmd}</p>
                          <p className="text-[10px] text-gray-500">{item.desc}</p>
                        </div>
                     </div>
                     {selectedIndex === i && (
                       <div className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-[10px] font-bold rounded">
                         ENTER
                       </div>
                     )}
                   </button>
                 ))
               ) : (
                 <div className="p-8 text-center text-gray-600">
                    <p className="text-sm">No commands found matching "{query}"</p>
                 </div>
               )}
            </div>

            <div className="p-3 bg-black/40 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-600 uppercase font-bold tracking-tighter">
               <span>AetherOS Command Hub</span>
               <div className="flex gap-3">
                  <span>↑↓ Navigate</span>
                  <span>↵ Execute</span>
               </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
