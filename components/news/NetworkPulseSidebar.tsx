'use client';

import React from 'react';
import { 
  Activity, 
  Globe2, 
  ShieldCheck, 
  Zap, 
  BarChart3, 
  Cpu
} from 'lucide-react';

interface NetworkPulseSidebarProps {
  analytics?: {
    totalReads: number;
    activeTerminals: number;
    scannedNodes: number;
    networkPulse: string;
    ingressRate: string;
  };
}

export function NetworkPulseSidebar({ analytics }: NetworkPulseSidebarProps) {
  const stats = analytics || {
    totalReads: 14502,
    activeTerminals: 124,
    scannedNodes: 86,
    networkPulse: 'Optimal',
    ingressRate: '1.4 GB/s'
  };

  return (
    <div className="space-y-6">
      {/* Network Pulse Overview */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Globe2 size={80} />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">Live Network Pulse</h4>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Active Terminals</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-white">{stats.activeTerminals.toLocaleString()}</span>
                <span className="text-[10px] text-emerald-400 font-bold">+12%</span>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Analysis Nodes</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-white">{stats.scannedNodes}</span>
                <span className="text-[10px] text-indigo-400 font-bold">LIVE</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu size={12} className="text-slate-400" />
                <span className="text-[11px] text-slate-300">Ingress Rate</span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400">{stats.ingressRate}</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 w-[65%] rounded-full shadow-[0_0_10px_rgba(99,102,241,0.4)]" />
            </div>
          </div>
        </div>
      </div>

      {/* Security Status */}
      <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-5 backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <ShieldCheck size={12} className="text-indigo-400" />
            Security Protocol
          </h4>
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold">
            AES-256
          </span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed italic">
          All terminal sessions are end-to-end encrypted. User metadata is masked using the Refectl Sanitization Boundary.
        </p>
      </div>

      {/* Cumulative Engagement */}
      <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 relative overflow-hidden">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
          <BarChart3 size={12} className="text-amber-500" />
          Aggregate Intelligence
        </h4>
        
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Zap size={24} />
          </div>
          <div>
            <div className="text-xl font-black text-white leading-none mb-1">
              {stats.totalReads.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wide">
              Intelligence Scans
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center gap-1.5 h-6 items-end justify-center">
          {[8, 14, 10, 18, 12, 20, 14, 16, 12, 18, 12, 10, 14, 16].map((h, i) => (
            <div 
              key={i} 
              className="w-1 rounded-full bg-amber-500/20 animate-pulse" 
              style={{ 
                height: `${h}px`,
                animationDelay: `${i * 0.15}s`
              }} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}
