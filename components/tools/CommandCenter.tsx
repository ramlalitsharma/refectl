'use client';

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  LayoutGrid, 
  Settings, 
  Terminal, 
  Box,
  Folder,
  Layers,
  Archive,
  HelpCircle,
  Filter,
  SlidersHorizontal,
  // Tool Icons
  Zap, RefreshCw, Languages, Image as ImageIcon, BarChart, 
  Mic, Scissors, Maximize, Minimize, Palette, Code, 
  ShieldCheck, Activity, Binary, Database, SplitSquareHorizontal, 
  Globe, Shield, ShieldAlert, FileText, Mail, QrCode, 
  Cpu, Waves, Gauge, Lock, ZapOff, Clock
} from 'lucide-react';
import { TOOLS_REGISTRY, Tool } from '@/lib/tools-registry';
import ToolExecutionWorkspace from './ToolExecutionWorkspace';

// Icon Mapping
const IconMap: Record<string, React.ReactNode> = {
  Zap: <Zap size={20} strokeWidth={1.5} />,
  RefreshCw: <RefreshCw size={20} strokeWidth={1.5} />,
  Languages: <Languages size={20} strokeWidth={1.5} />,
  Terminal: <Terminal size={20} strokeWidth={1.5} />,
  Image: <ImageIcon size={20} strokeWidth={1.5} />,
  BarChart: <BarChart size={20} strokeWidth={1.5} />,
  Mic: <Mic size={20} strokeWidth={1.5} />,
  Scissors: <Scissors size={20} strokeWidth={1.5} />,
  Maximize: <Maximize size={20} strokeWidth={1.5} />,
  Minimize: <Minimize size={20} strokeWidth={1.5} />,
  Palette: <Palette size={20} strokeWidth={1.5} />,
  Code: <Code size={20} strokeWidth={1.5} />,
  ShieldCheck: <ShieldCheck size={20} strokeWidth={1.5} />,
  Search: <Search size={20} strokeWidth={1.5} />,
  Lock: <Lock size={20} strokeWidth={1.5} />,
  Activity: <Activity size={20} strokeWidth={1.5} />,
  Binary: <Binary size={20} strokeWidth={1.5} />,
  Database: <Database size={20} strokeWidth={1.5} />,
  LayoutGrid: <LayoutGrid size={20} strokeWidth={1.5} />,
  SplitSquareHorizontal: <SplitSquareHorizontal size={20} strokeWidth={1.5} />,
  Globe: <Globe size={20} strokeWidth={1.5} />,
  Shield: <Shield size={20} strokeWidth={1.5} />,
  ShieldAlert: <ShieldAlert size={20} strokeWidth={1.5} />,
  FileText: <FileText size={20} strokeWidth={1.5} />,
  Mail: <Mail size={20} strokeWidth={1.5} />,
  QrCode: <QrCode size={20} strokeWidth={1.5} />,
  Cpu: <Cpu size={20} strokeWidth={1.5} />,
  Waves: <Waves size={20} strokeWidth={1.5} />,
  Gauge: <Gauge size={20} strokeWidth={1.5} />,
  ZapOff: <ZapOff size={20} strokeWidth={1.5} />,
  Clock: <Clock size={20} strokeWidth={1.5} />,
};

// Category Colors for Cards
const CategoryColors: Record<string, { bg: string, text: string, badge: string }> = {
  'AI': { bg: 'bg-violet-100', text: 'text-violet-600', badge: 'bg-violet-50 text-violet-700 border-violet-100' },
  'Media': { bg: 'bg-orange-100', text: 'text-orange-600', badge: 'bg-orange-50 text-orange-700 border-orange-100' },
  'Developer': { bg: 'bg-blue-100', text: 'text-blue-600', badge: 'bg-blue-50 text-blue-700 border-blue-100' },
  'Data': { bg: 'bg-emerald-100', text: 'text-emerald-600', badge: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  'Security': { bg: 'bg-rose-100', text: 'text-rose-600', badge: 'bg-rose-50 text-rose-700 border-rose-100' },
  'SEO': { bg: 'bg-cyan-100', text: 'text-cyan-600', badge: 'bg-cyan-50 text-cyan-700 border-cyan-100' },
  'Everyday': { bg: 'bg-slate-100', text: 'text-slate-600', badge: 'bg-slate-50 text-slate-700 border-slate-100' },
};

const DefaultColor = { bg: 'bg-slate-100', text: 'text-slate-600', badge: 'bg-slate-50 text-slate-700 border-slate-100' };

export default function CommandCenter() {
  const [activeCategory, setActiveCategory] = useState('All Tools');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);

  const categories = [
    { id: 'All Tools', icon: LayoutGrid },
    { id: 'AI', icon: Box },
    { id: 'Media', icon: Layers },
    { id: 'Developer', icon: Terminal },
    { id: 'Data', icon: Folder },
    { id: 'Security', icon: Archive },
  ];

  const filteredTools = useMemo(() => {
    return TOOLS_REGISTRY.filter(tool => {
      const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          tool.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All Tools' || tool.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  return (
    <div className="flex h-screen w-full bg-[#F4F5F7] font-sans text-slate-800 overflow-hidden">
      
      {/* Sidebar - Deep Dark Theme */}
      <aside className="w-[260px] flex-shrink-0 bg-[#1A1121] text-white flex flex-col h-full z-20 shadow-xl border-r border-[#2A1D33]">
        {/* Logo Area */}
        <div className="p-8 pb-6 flex items-center gap-4 border-b border-[#2A1D33]/50">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.3)]">
            <LayoutGrid size={20} className="text-white" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base tracking-tight text-white/95">ProTools</span>
            <span className="text-[10px] font-medium text-orange-400 tracking-wider">v2.49</span>
          </div>
        </div>

        {/* Search inside sidebar (Stitch Style) */}
        <div className="px-6 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              className="w-full bg-[#2A1D33]/40 border border-[#3D2C4A]/50 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all"
              placeholder="Search categories..."
            />
          </div>
        </div>

        {/* Navigation Categories */}
        <div className="px-6 py-2 mt-2">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Main Categories</h4>
        </div>
        <nav className="flex-1 px-4 flex flex-col gap-1 overflow-y-auto custom-scrollbar pb-6">
          {categories.map(item => {
            const isActive = activeCategory === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveCategory(item.id)}
                className={`flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                  isActive 
                    ? 'bg-white/10 text-white' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={16} className={`${isActive ? 'text-orange-400' : 'text-slate-500 group-hover:text-slate-400'}`} />
                  {item.id}
                </div>
                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]" />}
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-[#2A1D33]/50 bg-[#150E1B]">
          <button className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            <Settings size={16} />
            Settings
          </button>
          <button className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            <HelpCircle size={16} />
            Help & Support
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative h-full overflow-hidden bg-[#F4F5F7]">
        
        {/* Top Header */}
        <header className="h-[90px] shrink-0 bg-[#F4F5F7] flex items-center justify-between px-10 z-10">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{activeCategory}</h1>
            <span className="px-3 py-1 rounded-full bg-slate-200/70 text-slate-600 text-[11px] font-bold tracking-wider border border-slate-300/50">
              {filteredTools.length} tools
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Global Search Bar */}
            <div className="relative group mr-2">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                className="w-[280px] bg-white border border-slate-200/80 rounded-xl pl-10 pr-4 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-slate-400 font-medium"
                placeholder="Search all tools..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <button className="p-2.5 bg-white border border-slate-200/80 rounded-xl text-slate-500 hover:text-slate-800 hover:border-slate-300 shadow-sm transition-all flex items-center gap-2">
              <Filter size={16} />
            </button>
            <button className="p-2.5 bg-white border border-slate-200/80 rounded-xl text-slate-500 hover:text-slate-800 hover:border-slate-300 shadow-sm transition-all flex items-center gap-2">
              <SlidersHorizontal size={16} />
            </button>
          </div>
        </header>

        {/* Scrollable Grid Content */}
        <div className="flex-1 overflow-y-auto px-10 pb-10">
          <div className="max-w-[1600px] mx-auto">
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
              {filteredTools.map((tool) => {
                const colors = CategoryColors[tool.category] || DefaultColor;
                const iconComponent = tool.icon ? IconMap[tool.icon] : <Box size={20} strokeWidth={1.5} />;

                return (
                  <div 
                    key={tool.id}
                    onClick={() => setSelectedTool(tool)}
                    className="bg-white rounded-2xl border border-slate-200/70 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-1 cursor-pointer transition-all duration-300 relative overflow-hidden flex flex-col h-[200px] group p-6"
                  >
                    {/* Top Section: Icon & Badges */}
                    <div className="flex justify-between items-start mb-5">
                      <div className={`p-3 rounded-xl ${colors.bg} ${colors.text} transition-colors group-hover:scale-110 duration-300 shadow-inner`}>
                        {iconComponent}
                      </div>
                      
                      <div className="flex flex-col items-end gap-1.5">
                        {tool.isPopular && (
                          <span className="text-[9px] font-black uppercase tracking-widest text-orange-500 bg-orange-50 px-2 py-0.5 rounded border border-orange-100">
                            HOT
                          </span>
                        )}
                        <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${colors.badge}`}>
                          {tool.category}
                        </span>
                      </div>
                    </div>
                    
                    {/* Content Section */}
                    <div className="mt-auto">
                      <h4 className="font-extrabold text-[15px] text-slate-800 mb-1.5 group-hover:text-orange-600 transition-colors line-clamp-1">
                        {tool.name}
                      </h4>
                      <p className="text-[13px] text-slate-500 leading-snug line-clamp-2 font-medium">
                        {tool.description}
                      </p>
                    </div>

                    {/* Footer Section */}
                    <div className="mt-4 flex items-center justify-between pt-4 border-t border-slate-100/80 opacity-60 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] font-semibold text-slate-400">
                        {/* Mocking last used time */}
                        Used {Math.floor(Math.random() * 5) + 1}d ago
                      </span>
                      <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-orange-100 group-hover:text-orange-600 transition-colors">
                        <Terminal size={10} />
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {filteredTools.length === 0 && (
                <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400 bg-white rounded-3xl border border-slate-200 border-dashed">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <Search size={24} className="text-slate-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">No utilities found</h3>
                  <p className="text-sm font-medium">We couldn't find any tools matching "{searchQuery}"</p>
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="mt-6 px-6 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-bold shadow-md hover:bg-orange-600 transition-colors"
                  >
                    Clear Search
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </main>

      {/* Tool Execution Workspace Modal */}
      {selectedTool && (
        <div className="absolute inset-0 z-50 bg-[#F4F5F7]">
          <ToolExecutionWorkspace 
            tool={selectedTool} 
            onClose={() => setSelectedTool(null)} 
          />
        </div>
      )}
    </div>
  );
}
