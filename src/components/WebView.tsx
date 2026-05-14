import React from 'react';
import { useWorkspace } from '../WorkspaceContext';
import { Globe, RefreshCw, ExternalLink, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export default function WebView() {
  const { targetUrl } = useWorkspace();
  const [url, setUrl] = React.useState(targetUrl);
  const [key, setKey] = React.useState(0);

  React.useEffect(() => {
    setUrl(targetUrl);
  }, [targetUrl]);

  return (
    <div className="h-full flex flex-col bg-[#050505]">
      <div className="h-10 border-b border-white/5 bg-black/40 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 max-w-xl">
           <Globe className="w-4 h-4 text-cyan-400" />
           <div className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-1 text-[11px] text-gray-400 flex items-center gap-2">
              <ShieldCheck className="w-3 h-3 text-green-500" />
              <input 
                type="text" 
                value={url} 
                onChange={(e) => setUrl(e.target.value)}
                className="bg-transparent border-none outline-none w-full"
              />
           </div>
        </div>
        <div className="flex items-center gap-2">
           <button 
             onClick={() => setKey(k => k + 1)}
             className="p-1.5 hover:bg-white/10 rounded-md text-gray-500 hover:text-white transition-all"
           >
             <RefreshCw className="w-3.5 h-3.5" />
           </button>
           <button className="p-1.5 hover:bg-white/10 rounded-md text-gray-500 hover:text-white transition-all">
             <ExternalLink className="w-3.5 h-3.5" />
           </button>
        </div>
      </div>

      <div className="flex-1 bg-white relative">
        <iframe 
          key={key}
          src={url} 
          className="w-full h-full border-none"
          title="Web Preview"
        />
        {/* Connection status overlay */}
        <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2 pointer-events-none">
           <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
           <span className="text-[10px] font-mono font-bold text-white uppercase tracking-tighter">Live Sync Active</span>
        </div>
      </div>
    </div>
  );
}
