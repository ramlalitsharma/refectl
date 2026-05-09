'use client';

import React from 'react';
import Link from 'next/link';

export default function StudioDashboardPage() {
  const quickStats = [
    { label: 'Total Content', value: '1,284', change: '+12%', icon: 'description' },
    { label: 'Avg Engagement', value: '8.4%', change: '+2.1%', icon: 'show_chart' },
    { label: 'AI Gen Posts', value: '412', change: '+24%', icon: 'smart_toy', active: true },
    { label: 'Network Reach', value: '48.2k', change: '+5.4%', icon: 'public' },
  ];

  const recentActivity = [
    { type: 'blog', title: 'Why the Hantavirus Cruise Ship Outbreak...', time: '2h ago', status: 'Published' },
    { type: 'ai', title: 'AI Assistant generated a draft for "Future of AI"', time: '5h ago', status: 'Draft' },
    { type: 'system', title: 'New SEO Strategy deployed to 12 articles', time: '1d ago', status: 'System' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto custom-scrollbar">
      <header className="h-20 shrink-0 flex items-center justify-between px-8 border-b border-studio-border">
        <div>
          <h1 className="text-xl font-bold text-studio-text tracking-tight">Command Center</h1>
          <p className="text-[11px] text-studio-muted font-medium">Monitoring global content intelligence and performance</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex -space-x-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-studio-surface bg-studio-surface-hover flex items-center justify-center text-[10px] font-bold text-studio-muted">
                {String.fromCharCode(64 + i)}
              </div>
            ))}
          </div>
          <button className="bg-studio-primary text-white px-4 py-2 rounded-lg text-xs font-bold shadow-lg shadow-studio-primary/20">
            Export Report
          </button>
        </div>
      </header>

      <div className="p-8 space-y-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickStats.map((stat) => (
            <div key={stat.label} className={`bg-studio-surface border border-studio-border p-6 rounded-2xl relative overflow-hidden group hover:border-studio-primary/30 transition-colors ${stat.active ? 'ring-1 ring-studio-primary/20' : ''}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl bg-studio-surface-hover flex items-center justify-center text-studio-muted group-hover:text-studio-primary transition-colors">
                  <span className="material-symbols-outlined text-[20px]">{stat.icon}</span>
                </div>
                <span className={`text-[10px] font-bold ${stat.change.startsWith('+') ? 'text-studio-success' : 'text-red-400'}`}>
                  {stat.change}
                </span>
              </div>
              <div className="text-2xl font-bold text-studio-text mb-1">{stat.value}</div>
              <div className="text-[10px] font-bold text-studio-muted uppercase tracking-wider">{stat.label}</div>
              
              {stat.active && (
                <div className="absolute top-0 right-0 w-16 h-16 bg-studio-primary/5 rounded-bl-[4rem]" />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart Placeholder */}
          <div className="lg:col-span-2 bg-studio-surface border border-studio-border rounded-2xl p-6 h-[400px] flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-bold text-studio-text">Content Performance</h3>
              <div className="flex gap-2">
                <button className="px-3 py-1 rounded-md bg-studio-surface-hover text-studio-text text-[10px] font-bold">Week</button>
                <button className="px-3 py-1 rounded-md text-studio-muted text-[10px] font-bold">Month</button>
              </div>
            </div>
            <div className="flex-1 flex items-end gap-2 px-2">
              {[40, 60, 30, 80, 50, 90, 70, 45, 85, 55, 35, 75].map((h, i) => (
                <div key={i} className="flex-1 group relative">
                  <div 
                    className="w-full bg-studio-primary/20 group-hover:bg-studio-primary rounded-t-sm transition-all duration-500" 
                    style={{ height: `${h}%` }}
                  />
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-studio-surface border border-studio-border px-2 py-1 rounded text-[8px] font-bold text-studio-text opacity-0 group-hover:opacity-100 transition-opacity">
                    {h}%
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4 px-1 text-[9px] font-bold text-studio-muted uppercase tracking-widest">
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-studio-surface border border-studio-border rounded-2xl p-6 flex flex-col">
            <h3 className="text-sm font-bold text-studio-text mb-6">Recent Activity</h3>
            <div className="flex-1 space-y-4">
              {recentActivity.map((act, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className="w-8 h-8 rounded-lg bg-studio-surface-hover border border-studio-border flex items-center justify-center shrink-0 group-hover:border-studio-primary/30 transition-colors">
                    <span className="material-symbols-outlined text-[16px] text-studio-muted">
                      {act.type === 'blog' ? 'description' : act.type === 'ai' ? 'smart_toy' : 'settings'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-bold text-studio-text truncate">{act.title}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] text-studio-muted uppercase tracking-wider font-bold">{act.time}</span>
                      <span className="w-1 h-1 rounded-full bg-studio-border" />
                      <span className="text-[9px] text-studio-primary font-bold uppercase tracking-wider">{act.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-2 text-[10px] font-bold text-studio-muted hover:text-studio-text border border-studio-border rounded-lg transition-colors uppercase tracking-widest">
              View All Activity
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
