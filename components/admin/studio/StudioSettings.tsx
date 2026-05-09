'use client';

import React, { useState } from 'react';
import { 
  Settings, 
  Palette, 
  Bot, 
  Shield, 
  Globe, 
  Bell, 
  Save, 
  User, 
  Languages,
  Clock,
  Eye,
  Type
} from 'lucide-react';

const sections = [
  { id: 'general', label: 'General', icon: <Settings size={18} /> },
  { id: 'editorial', label: 'Editorial', icon: <Type size={18} /> },
  { id: 'ai', label: 'AI Agents', icon: <Bot size={18} /> },
  { id: 'appearance', label: 'Appearance', icon: <Palette size={18} /> },
  { id: 'security', label: 'Security', icon: <Shield size={18} /> },
];

export default function StudioSettings() {
  const [activeSection, setActiveSection] = useState('general');

  return (
    <div className="flex-1 flex h-full overflow-hidden">
      {/* Sidebar Navigation */}
      <div className="w-64 border-r border-studio-border bg-studio-surface/30 p-6 flex flex-col gap-2">
        <h2 className="text-[10px] font-black text-studio-muted uppercase tracking-[0.2em] mb-4 px-3">Studio Configuration</h2>
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium ${
              activeSection === section.id 
                ? 'bg-studio-primary text-white shadow-lg shadow-studio-primary/20' 
                : 'text-studio-muted hover:bg-studio-surface-hover hover:text-studio-text'
            }`}
          >
            {section.icon}
            {section.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-12 custom-scrollbar bg-studio-bg">
        <div className="max-w-3xl">
          <header className="mb-10">
            <h1 className="text-2xl font-bold text-studio-text tracking-tight uppercase">
              {sections.find(s => s.id === activeSection)?.label} Settings
            </h1>
            <p className="text-sm text-studio-muted mt-2">Configure the core operational parameters of your editorial suite.</p>
          </header>

          {activeSection === 'general' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <section className="bg-studio-surface border border-studio-border rounded-2xl p-6">
                <h3 className="text-xs font-bold text-studio-text uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Globe size={14} className="text-studio-primary" />
                  Site Localization
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black text-studio-muted uppercase tracking-widest block mb-2">Default Language</label>
                    <select className="w-full bg-studio-bg border border-studio-border rounded-lg px-4 py-2 text-sm text-studio-text focus:outline-none focus:border-studio-primary">
                      <option>English (US)</option>
                      <option>English (UK)</option>
                      <option>Nepali</option>
                      <option>Hindi</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-studio-muted uppercase tracking-widest block mb-2">Time Zone</label>
                    <select className="w-full bg-studio-bg border border-studio-border rounded-lg px-4 py-2 text-sm text-studio-text focus:outline-none focus:border-studio-primary">
                      <option>UTC+05:45 (Kathmandu)</option>
                      <option>UTC+05:30 (India)</option>
                      <option>UTC-08:00 (Pacific Time)</option>
                    </select>
                  </div>
                </div>
              </section>

              <section className="bg-studio-surface border border-studio-border rounded-2xl p-6">
                <h3 className="text-xs font-bold text-studio-text uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Bell size={14} className="text-studio-primary" />
                  Notifications
                </h3>
                <div className="space-y-4">
                  {[
                    { label: 'Blog Publication', desc: 'Notify when an agent publishes a new post.', checked: true },
                    { label: 'System Health Alerts', desc: 'Critical alerts regarding database or API status.', checked: true },
                    { label: 'Revenue Milestones', desc: 'Monthly CPM and performance reports.', checked: false },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-2">
                      <div>
                        <div className="text-sm font-bold text-studio-text">{item.label}</div>
                        <div className="text-[11px] text-studio-muted">{item.desc}</div>
                      </div>
                      <div className={`w-10 h-5 rounded-full p-1 cursor-pointer transition-colors ${item.checked ? 'bg-studio-primary' : 'bg-studio-border'}`}>
                        <div className={`w-3 h-3 bg-white rounded-full transition-transform ${item.checked ? 'translate-x-5' : 'translate-x-0'}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {activeSection === 'ai' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <section className="bg-studio-surface border border-studio-border rounded-2xl p-6">
                <h3 className="text-xs font-bold text-studio-text uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Bot size={14} className="text-studio-primary" />
                  Mota CEO Autonomy
                </h3>
                <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl mb-6">
                  <p className="text-[11px] text-amber-500 leading-relaxed font-medium">
                    Warning: Increasing autonomy allows agents to publish content and purge inventory without human oversight.
                  </p>
                </div>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-4">
                      <label className="text-[10px] font-black text-studio-muted uppercase tracking-widest">Creativity Variance</label>
                      <span className="text-[10px] font-bold text-studio-primary">0.82 / 1.0</span>
                    </div>
                    <input type="range" className="w-full accent-studio-primary h-1 bg-studio-border rounded-full appearance-none cursor-pointer" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-studio-text">Permissionless Ingestion</span>
                    <div className="w-10 h-5 bg-studio-primary rounded-full p-1 relative cursor-pointer">
                      <div className="w-3 h-3 bg-white rounded-full translate-x-5" />
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Save Button */}
          <div className="mt-12 flex items-center gap-4">
            <button className="bg-studio-primary hover:bg-studio-primary/90 text-white px-8 py-3 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xl shadow-studio-primary/20 transition-all hover:scale-[1.02]">
              <Save size={16} />
              Save Changes
            </button>
            <button className="text-studio-muted hover:text-studio-text text-xs font-bold uppercase tracking-widest px-6 py-3 transition-colors">
              Reset to Defaults
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
