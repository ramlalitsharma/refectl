'use client';

import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Eye, 
  Users, 
  DollarSign, 
  Bot,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  ExternalLink,
  Lightbulb,
  Calendar
} from 'lucide-react';

const stats = [
  { label: 'Total Impressions', value: '2.4M', change: '+12.5%', trend: 'up', icon: <Eye size={20} /> },
  { label: 'Avg. Engagement', value: '4.8%', change: '+2.1%', trend: 'up', icon: <Users size={20} /> },
  { label: 'Est. Revenue', value: '$12,840', change: '-3.2%', trend: 'down', icon: <DollarSign size={20} /> },
  { label: 'AI Efficiency', value: '94%', change: '+5.0%', trend: 'up', icon: <Bot size={20} /> },
];

const topPosts = [
  { title: 'The Future of Neural Networks in 2026', views: '124K', engagement: '8.2%', author: 'Mota CEO', status: 'Trending' },
  { title: 'Global Semiconductor Shortage: An In-depth Analysis', views: '98K', engagement: '6.5%', author: 'Institutional Desk', status: 'Stable' },
  { title: 'Pedagogy in the Age of Artificial Intelligence', views: '76K', engagement: '5.1%', author: 'Refectl Author', status: 'Stable' },
  { title: 'Strategic Geopolitical Risk: A 2026 Outlook', views: '62K', engagement: '7.8%', author: 'Mota CEO', status: 'Viral' },
];

export default function AnalyticsDashboard() {
  return (
    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-studio-text tracking-tight">Performance Intelligence</h1>
          <p className="text-sm text-studio-muted">Real-time data synchronization with Global Node Cluster</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-studio-surface border border-studio-border rounded-xl p-1 flex items-center">
            <button className="px-4 py-1.5 bg-studio-primary text-white text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all shadow-lg shadow-studio-primary/20">Day</button>
            <button className="px-4 py-1.5 text-studio-muted hover:text-studio-text text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all">Week</button>
            <button className="px-4 py-1.5 text-studio-muted hover:text-studio-text text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all">Month</button>
          </div>
            <button className="bg-studio-surface border border-studio-border text-studio-text px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-studio-surface-hover transition-all">
            <Calendar size={18} />
            Custom Range
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-studio-surface border border-studio-border p-6 rounded-2xl group hover:border-studio-primary/50 transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-studio-primary/5 rounded-full blur-3xl -mr-8 -mt-8" />
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-studio-surface-hover border border-studio-border flex items-center justify-center text-studio-primary group-hover:bg-studio-primary group-hover:text-white transition-all">
                {stat.icon}
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-black ${stat.trend === 'up' ? 'text-studio-success' : 'text-red-400'}`}>
                {stat.trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {stat.change}
              </div>
            </div>
            <div className="text-2xl font-bold text-studio-text mb-1">{stat.value}</div>
            <div className="text-[10px] font-bold text-studio-muted uppercase tracking-[0.1em]">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        <div className="lg:col-span-2 bg-studio-surface border border-studio-border rounded-2xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-bold text-studio-text tracking-widest uppercase">Traffic Trajectory</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-studio-primary" />
                <span className="text-[10px] font-bold text-studio-muted uppercase">Impressions</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500" />
                <span className="text-[10px] font-bold text-studio-muted uppercase">Engagement</span>
              </div>
            </div>
          </div>
          
          {/* Simulated Chart */}
          <div className="h-64 flex items-end gap-2 px-4 relative">
            <div className="absolute inset-0 flex flex-col justify-between py-2 pointer-events-none">
              {[1, 2, 3, 4].map(i => <div key={i} className="w-full h-px bg-studio-border/30" />)}
            </div>
            {[45, 67, 89, 54, 78, 92, 70, 85, 95, 60, 75, 88].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col gap-1 items-center group relative h-full justify-end">
                <div 
                  className="w-full bg-gradient-to-t from-studio-primary/20 to-studio-primary rounded-t-sm transition-all duration-500 hover:scale-x-110" 
                  style={{ height: `${h}%` }}
                />
                <div 
                  className="absolute bottom-0 w-full bg-indigo-500/50 rounded-t-sm transition-all duration-500 delay-75" 
                  style={{ height: `${h * 0.4}%` }}
                />
                <div className="absolute -top-10 bg-studio-surface border border-studio-border px-2 py-1 rounded text-[9px] font-bold text-studio-text opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                  {h}K views
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-6 px-4">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => (
              <span key={m} className="text-[9px] font-bold text-studio-muted uppercase">{m}</span>
            ))}
          </div>
        </div>

        <div className="bg-studio-surface border border-studio-border rounded-2xl p-8">
          <h3 className="text-sm font-bold text-studio-text tracking-widest uppercase mb-8">Audience Insight</h3>
          <div className="space-y-6">
            {[
              { label: 'Direct Traffic', value: 45, color: 'bg-studio-primary' },
              { label: 'Organic Search', value: 32, color: 'bg-indigo-500' },
              { label: 'Social Media', value: 18, color: 'bg-amber-500' },
              { label: 'Referral', value: 5, color: 'bg-studio-muted' },
            ].map((source) => (
              <div key={source.label}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-studio-text uppercase tracking-wider">{source.label}</span>
                  <span className="text-[10px] font-bold text-studio-muted">{source.value}%</span>
                </div>
                <div className="w-full h-1.5 bg-studio-border rounded-full overflow-hidden">
                  <div className={`h-full ${source.color} rounded-full`} style={{ width: `${source.value}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 p-5 bg-studio-primary/5 border border-studio-primary/10 rounded-2xl">
            <div className="flex items-center gap-3 mb-3">
              <Lightbulb className="text-studio-primary" size={20} />
              <span className="text-xs font-bold text-studio-text uppercase">AI Advice</span>
            </div>
            <p className="text-[11px] text-studio-muted leading-relaxed">
              Traffic from "Organic Search" is up 12% this week. Focus on long-tail keywords for "Institutional AI" to capture emerging trends.
            </p>
          </div>
        </div>
      </div>

      {/* Top Content Table */}
      <div className="bg-studio-surface border border-studio-border rounded-2xl overflow-hidden">
        <div className="p-8 border-b border-studio-border flex items-center justify-between">
          <h3 className="text-sm font-bold text-studio-text tracking-widest uppercase">High Impact Content</h3>
          <button className="text-studio-muted hover:text-studio-text transition-colors">
            <ExternalLink size={20} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-studio-surface-hover/50 text-[10px] font-black text-studio-muted uppercase tracking-[0.2em]">
                <th className="px-8 py-4">Intelligence Asset</th>
                <th className="px-8 py-4">Total Reach</th>
                <th className="px-8 py-4">Engagement</th>
                <th className="px-8 py-4">Byline</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-studio-border">
              {topPosts.map((post) => (
                <tr key={post.title} className="hover:bg-studio-surface-hover/30 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="text-xs font-bold text-studio-text group-hover:text-studio-primary transition-colors">{post.title}</div>
                  </td>
                  <td className="px-8 py-5 text-xs font-medium text-studio-muted">{post.views}</td>
                  <td className="px-8 py-5 text-xs font-medium text-studio-muted">{post.engagement}</td>
                  <td className="px-8 py-5">
                    <span className="text-[10px] font-bold text-studio-text px-2 py-1 bg-studio-surface-hover rounded-md border border-studio-border">{post.author}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest ${
                      post.status === 'Trending' ? 'bg-studio-success/10 text-studio-success' :
                      post.status === 'Viral' ? 'bg-amber-500/10 text-amber-500' :
                      'bg-studio-muted/10 text-studio-muted'
                    }`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="text-studio-muted hover:text-studio-text transition-colors">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
