'use client';

import React from 'react';
import { 
  Trophy, 
  ExternalLink, 
  Maximize2, 
  Volume2
} from 'lucide-react';

export function IPLStreamSidebar() {
  const iplUrl = 'https://embed.crichd.tech/embed.php?id=ss1'; // Using Star Sports 1 as common ID

  return (
    <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl group">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-600 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy size={14} className="text-white animate-bounce" />
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Live Relay: IPL 2024</h4>
        </div>
        <div className="flex items-center gap-1.5 font-black text-[9px] text-white/80 uppercase tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          Live
        </div>
      </div>

      {/* Mini Player */}
      <div className="relative aspect-video bg-black overflow-hidden group-hover:shadow-[inset_0_0_20px_rgba(249,115,22,0.3)] transition-shadow">
        <iframe 
          src={iplUrl}
          width="100%" 
          height="100%" 
          frameBorder="0" 
          scrolling="no" 
          allowFullScreen
          className="pointer-events-none opacity-90 group-hover:opacity-100 transition-opacity"
        />
        
        {/* Overlay for "Click to Expand" */}
        <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <button 
            onClick={() => window.open('/news?category=IPL-Live', '_self')}
            className="p-2 bg-orange-500 text-white rounded-full hover:scale-110 transition-transform shadow-xl shadow-orange-500/40"
            title="Expand to Full Feed"
          >
            <Maximize2 size={16} />
          </button>
          <button 
            className="p-2 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors backdrop-blur-md"
            title="External Feed"
            onClick={() => window.open(iplUrl, '_blank')}
          >
            <ExternalLink size={16} />
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-white/5 bg-slate-950/40 backdrop-blur-md flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest leading-tight mb-1">Stream Status</span>
          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
            <Volume2 size={10} />
            Muted by Default
          </span>
        </div>
        <div className="text-right">
          <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest leading-tight block mb-1">Signal</span>
          <span className="text-[10px] text-white font-black tracking-wider uppercase">HD-1080p</span>
        </div>
      </div>
    </div>
  );
}
