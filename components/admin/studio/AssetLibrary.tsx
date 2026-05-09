'use client';

import React, { useState } from 'react';
import { 
  FolderOpen, 
  Image as ImageIcon, 
  Video, 
  FileText, 
  Upload, 
  Search, 
  MoreVertical, 
  Download, 
  Trash2, 
  Info,
  Maximize2,
  Filter
} from 'lucide-react';

const initialAssets = [
  { id: 1, name: 'neural_network_visual.jpg', type: 'image', size: '2.4 MB', dimensions: '1920x1080', date: '2 hours ago', url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=400' },
  { id: 2, name: 'global_finance_trends.pdf', type: 'doc', size: '1.2 MB', date: '5 hours ago', url: '#' },
  { id: 3, name: 'future_cities_drone.mp4', type: 'video', size: '45.8 MB', duration: '0:24', date: 'Yesterday', url: '#' },
  { id: 4, name: 'institutional_logo_dark.png', type: 'image', size: '120 KB', dimensions: '512x512', date: '2 days ago', url: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=400' },
  { id: 5, name: 'ai_ethics_whitepaper.docx', type: 'doc', size: '850 KB', date: '3 days ago', url: '#' },
  { id: 6, name: 'cybersecurity_header.webp', type: 'image', size: '1.1 MB', dimensions: '1200x600', date: '1 week ago', url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=400' },
];

export default function AssetLibrary() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<any>(null);

  const filteredAssets = initialAssets.filter(asset => {
    const matchesFilter = filter === 'all' || asset.type === filter;
    const matchesSearch = asset.name.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex-1 flex h-full overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full bg-studio-bg relative">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-studio-border bg-studio-bg/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-6 flex-1">
            <div className="flex items-center gap-1 bg-studio-surface border border-studio-border p-1 rounded-xl">
              <button 
                onClick={() => setFilter('all')}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${filter === 'all' ? 'bg-studio-primary text-white' : 'text-studio-muted hover:text-studio-text'}`}
              >
                All
              </button>
              <button 
                onClick={() => setFilter('image')}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${filter === 'image' ? 'bg-studio-primary text-white' : 'text-studio-muted hover:text-studio-text'}`}
              >
                Images
              </button>
              <button 
                onClick={() => setFilter('video')}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${filter === 'video' ? 'bg-studio-primary text-white' : 'text-studio-muted hover:text-studio-text'}`}
              >
                Videos
              </button>
              <button 
                onClick={() => setFilter('doc')}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${filter === 'doc' ? 'bg-studio-primary text-white' : 'text-studio-muted hover:text-studio-text'}`}
              >
                Docs
              </button>
            </div>

            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-studio-muted" size={16} />
              <input 
                type="text" 
                placeholder="Search assets..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-studio-surface border border-studio-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-studio-primary transition-colors"
              />
            </div>
          </div>

          <button className="bg-studio-primary hover:bg-studio-primary/90 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-studio-primary/20 transition-all hover:scale-[1.02]">
            <Upload size={16} />
            Upload Asset
          </button>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredAssets.map((asset) => (
              <div 
                key={asset.id}
                onClick={() => setSelectedAsset(asset)}
                className={`group bg-studio-surface border rounded-2xl overflow-hidden cursor-pointer transition-all ${selectedAsset?.id === asset.id ? 'border-studio-primary ring-1 ring-studio-primary' : 'border-studio-border hover:border-studio-primary/50'}`}
              >
                <div className="aspect-square bg-studio-bg flex items-center justify-center relative overflow-hidden">
                  {asset.type === 'image' ? (
                    <img src={asset.url} alt={asset.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : asset.type === 'video' ? (
                    <div className="flex flex-col items-center gap-2">
                      <Video size={40} className="text-studio-muted" />
                      <span className="text-[10px] font-bold text-studio-muted">{asset.duration}</span>
                    </div>
                  ) : (
                    <FileText size={40} className="text-studio-muted" />
                  )}
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button className="w-8 h-8 rounded-full bg-white/20 backdrop-blur text-white flex items-center justify-center hover:bg-studio-primary transition-colors">
                      <Maximize2 size={14} />
                    </button>
                    <button className="w-8 h-8 rounded-full bg-white/20 backdrop-blur text-white flex items-center justify-center hover:bg-studio-primary transition-colors">
                      <Download size={14} />
                    </button>
                  </div>
                </div>
                <div className="p-3">
                  <div className="text-[11px] font-bold text-studio-text truncate mb-1">{asset.name}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-studio-muted uppercase font-bold">{asset.size}</span>
                    <span className="text-[9px] text-studio-muted">{asset.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Info Sidebar */}
      {selectedAsset && (
        <div className="w-[320px] border-l border-studio-border bg-studio-surface/50 backdrop-blur-sm flex flex-col h-full animate-in slide-in-from-right duration-300">
          <div className="h-16 flex items-center justify-between px-6 border-b border-studio-border">
            <h3 className="text-xs font-bold text-studio-text uppercase tracking-widest flex items-center gap-2">
              <Info size={14} className="text-studio-primary" />
              Asset Details
            </h3>
            <button onClick={() => setSelectedAsset(null)} className="text-studio-muted hover:text-studio-text">
              <MoreVertical size={18} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <div className="aspect-video bg-studio-bg rounded-xl overflow-hidden mb-6 border border-studio-border">
              {selectedAsset.type === 'image' ? (
                <img src={selectedAsset.url} alt={selectedAsset.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  {selectedAsset.type === 'video' ? <Video size={48} className="text-studio-muted" /> : <FileText size={48} className="text-studio-muted" />}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-studio-muted uppercase tracking-[0.2em] block mb-2">Filename</label>
                <div className="text-xs font-bold text-studio-text break-all">{selectedAsset.name}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-studio-muted uppercase tracking-[0.2em] block mb-2">Size</label>
                  <div className="text-xs font-bold text-studio-text">{selectedAsset.size}</div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-studio-muted uppercase tracking-[0.2em] block mb-2">Created</label>
                  <div className="text-xs font-bold text-studio-text">{selectedAsset.date}</div>
                </div>
              </div>

              {selectedAsset.dimensions && (
                <div>
                  <label className="text-[10px] font-black text-studio-muted uppercase tracking-[0.2em] block mb-2">Dimensions</label>
                  <div className="text-xs font-bold text-studio-text">{selectedAsset.dimensions}</div>
                </div>
              )}

              <div className="pt-6 border-t border-studio-border flex flex-col gap-3">
                <button className="w-full py-2.5 bg-studio-surface border border-studio-border hover:border-studio-primary rounded-lg text-[10px] font-bold text-studio-text uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                  <Download size={14} /> Download File
                </button>
                <button className="w-full py-2.5 bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white rounded-lg text-[10px] font-bold text-red-500 uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                  <Trash2 size={14} /> Delete Asset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
