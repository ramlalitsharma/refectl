'use client';

import React, { useState } from 'react';
import { 
  Bot, 
  Cpu, 
  Zap, 
  Terminal, 
  BrainCircuit, 
  Sparkles,
  Play,
  History,
  Settings,
  ChevronRight,
  ShieldCheck,
  Globe
} from 'lucide-react';

const agents = [
  { 
    id: 'mota', 
    name: 'Mota CEO', 
    role: 'Autonomous Strategist', 
    desc: 'Handles high-level revenue balancing, trend discovery, and systemic health.',
    status: 'Active',
    lastAction: 'Analyzing Finance trends in India',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10'
  },
  { 
    id: 'editorial', 
    name: 'Institutional Desk', 
    role: 'Content Architect', 
    desc: 'Generates 1500-word deep-dives and academic research reports.',
    status: 'Idle',
    lastAction: 'Published: Pedagogy in 2026',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10'
  },
  { 
    id: 'news', 
    name: 'News Sweep Agent', 
    role: 'Real-time Reporter', 
    desc: 'Monitors global RSS feeds and ingests breaking news into the system.',
    status: 'Scanning',
    lastAction: 'Ingested 12 vectors from Nepal',
    color: 'text-studio-success',
    bg: 'bg-studio-success/10'
  },
];

const logs = [
  { time: '10:42 AM', agent: 'Mota CEO', action: 'Revenue rebalanced: Priority set to Finance (CPM: $12.40)' },
  { time: '10:38 AM', agent: 'News Sweep', action: 'Global Parallel Sweep complete: 42 articles auto-published' },
  { time: '10:15 AM', agent: 'Institutional Desk', action: 'Integrity check passed for "Cybersecurity Trends"' },
  { time: '09:50 AM', agent: 'Mota CEO', action: 'Purged 142 stale articles from news inventory' },
];

export default function AICoPilotDashboard() {
  const [prompt, setPrompt] = useState('');

  return (
    <div className="flex-1 flex h-full overflow-hidden">
      {/* Main Command Area */}
      <div className="flex-1 flex flex-col h-full p-8 overflow-y-auto custom-scrollbar">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-studio-text tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-studio-primary flex items-center justify-center shadow-lg shadow-studio-primary/20">
              <Bot className="text-white" size={24} />
            </div>
            AI Control Center
          </h1>
          <p className="text-sm text-studio-muted mt-2">Managing the autonomous intelligence layer of Refectl Global Node</p>
        </header>

        {/* Agent Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {agents.map((agent) => (
            <div key={agent.id} className="bg-studio-surface border border-studio-border rounded-2xl p-6 hover:border-studio-primary/50 transition-all group relative overflow-hidden">
              <div className={`absolute top-0 right-0 w-24 h-24 ${agent.bg.replace('10', '5')} rounded-full blur-3xl -mr-8 -mt-8`} />
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl ${agent.bg} flex items-center justify-center ${agent.color}`}>
                  {agent.id === 'mota' ? <ShieldCheck size={20} /> : agent.id === 'editorial' ? <BrainCircuit size={20} /> : <Globe size={20} />}
                </div>
                <div className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${agent.status === 'Idle' ? 'bg-studio-muted' : 'bg-studio-success'}`} />
                  <span className="text-[10px] font-bold text-studio-muted uppercase tracking-widest">{agent.status}</span>
                </div>
              </div>
              <h3 className="text-base font-bold text-studio-text mb-1">{agent.name}</h3>
              <div className="text-[10px] font-black text-studio-muted uppercase tracking-widest mb-3">{agent.role}</div>
              <p className="text-[11px] text-studio-muted leading-relaxed mb-4">{agent.desc}</p>
              <div className="pt-4 border-t border-studio-border/50">
                <div className="text-[9px] font-bold text-studio-muted uppercase mb-1">Latest Activity</div>
                <div className="text-[10px] text-studio-text font-medium italic">"{agent.lastAction}"</div>
              </div>
            </div>
          ))}
        </div>

        {/* Neural Prompt Input */}
        <div className="bg-studio-surface border border-studio-border rounded-2xl p-8 mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="text-studio-primary" size={18} />
            <h3 className="text-sm font-bold text-studio-text uppercase tracking-widest">Execute Neural Task</h3>
          </div>
          <div className="relative">
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g. 'Deploy Mota CEO to research emerging AI trends in Southeast Asia and draft a 5-part educational series...'"
              className="w-full bg-studio-bg border border-studio-border rounded-xl p-5 text-sm text-studio-text focus:outline-none focus:border-studio-primary transition-all min-h-[120px] resize-none placeholder:text-studio-muted/50"
            />
            <button className="absolute bottom-4 right-4 bg-studio-primary hover:bg-studio-primary/90 text-white px-6 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg shadow-studio-primary/20 transition-all hover:scale-[1.02]">
              <Play size={14} fill="currentColor" />
              Initialize Session
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {['News Sweep', 'Strategic Audit', 'Content Ingest', 'CPM Optimization'].map(tag => (
              <button key={tag} className="px-3 py-1 bg-studio-surface-hover border border-studio-border rounded-full text-[10px] font-bold text-studio-muted hover:text-studio-text transition-colors">
                + {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Real-time Telemetry Log */}
        <div className="bg-studio-surface border border-studio-border rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-studio-border flex items-center justify-between bg-studio-surface-hover/30">
            <div className="flex items-center gap-3">
              <Terminal size={18} className="text-studio-primary" />
              <h3 className="text-sm font-bold text-studio-text uppercase tracking-widest">Neural Execution Log</h3>
            </div>
            <button className="text-studio-muted hover:text-studio-text transition-colors">
              <History size={18} />
            </button>
          </div>
          <div className="divide-y divide-studio-border">
            {logs.map((log, i) => (
              <div key={i} className="flex items-center gap-6 px-6 py-4 hover:bg-studio-surface-hover/20 transition-colors">
                <span className="text-[10px] font-mono text-studio-muted w-20 shrink-0">{log.time}</span>
                <span className="text-[10px] font-black text-studio-primary uppercase tracking-widest w-32 shrink-0">{log.agent}</span>
                <span className="text-xs text-studio-text flex-1 font-medium">{log.action}</span>
                <ChevronRight size={14} className="text-studio-muted opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Sidebar: System Stats */}
      <div className="w-[300px] border-l border-studio-border bg-studio-surface/50 backdrop-blur-sm p-8 flex flex-col gap-8 overflow-y-auto custom-scrollbar">
        <div>
          <h4 className="text-[10px] font-black text-studio-muted uppercase tracking-[0.2em] mb-6">System Health</h4>
          <div className="space-y-6">
            {[
              { label: 'Neural Latency', value: '42ms', color: 'bg-studio-success' },
              { label: 'Token Utilization', value: '84%', color: 'bg-amber-500' },
              { label: 'Agent Uptime', value: '99.9%', color: 'bg-studio-primary' },
            ].map(stat => (
              <div key={stat.label}>
                <div className="flex justify-between mb-2">
                  <span className="text-[10px] font-bold text-studio-text uppercase">{stat.label}</span>
                  <span className="text-[10px] font-bold text-studio-muted">{stat.value}</span>
                </div>
                <div className="h-1 bg-studio-border rounded-full overflow-hidden">
                  <div className={`h-full ${stat.color} w-[${stat.value}]`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 bg-gradient-to-br from-studio-primary/10 to-indigo-500/10 border border-studio-primary/20 rounded-2xl">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="text-studio-primary" size={16} />
            <span className="text-[10px] font-black text-studio-text uppercase">Co-Pilot Insight</span>
          </div>
          <p className="text-[11px] text-studio-muted leading-relaxed italic">
            "I've detected a 14% increase in educational interest from UK markets. Suggest deploying the Institutional Desk for a series on Higher Ed Policy."
          </p>
          <button className="w-full mt-4 py-2 bg-studio-primary text-white text-[10px] font-bold rounded-lg uppercase tracking-widest shadow-lg shadow-studio-primary/20">
            Accept Advice
          </button>
        </div>

        <div className="mt-auto">
          <button className="w-full flex items-center justify-between p-4 bg-studio-surface border border-studio-border rounded-xl text-studio-muted hover:text-studio-text hover:border-studio-primary transition-all group">
            <div className="flex items-center gap-3">
              <Settings size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest">Configuration</span>
            </div>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
