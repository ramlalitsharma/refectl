'use client';

import React, { useState } from 'react';
import { 
  X, 
  Play, 
  Copy, 
  Download, 
  Upload, 
  Terminal, 
  Code2,
  Key,
  CheckCircle2,
  Sparkles,
  Box,
  Layers,
  Archive,
  Folder,
  // Icon imports for mapping
  Zap, RefreshCw, Languages, Image as ImageIcon, BarChart, 
  Mic, Scissors, Maximize, Minimize, Palette, Code, 
  ShieldCheck, Activity, Binary, Database, SplitSquareHorizontal, 
  Globe, Shield, ShieldAlert, FileText, Mail, QrCode, 
  Cpu, Waves, Gauge, Lock, ZapOff, Clock
} from 'lucide-react';
import { Tool } from '@/lib/tools-registry';

const IconMap: Record<string, React.ReactNode> = {
  Zap: <Zap size={24} strokeWidth={1.5} />,
  RefreshCw: <RefreshCw size={24} strokeWidth={1.5} />,
  Languages: <Languages size={24} strokeWidth={1.5} />,
  Terminal: <Terminal size={24} strokeWidth={1.5} />,
  Image: <ImageIcon size={24} strokeWidth={1.5} />,
  BarChart: <BarChart size={24} strokeWidth={1.5} />,
  Mic: <Mic size={24} strokeWidth={1.5} />,
  Scissors: <Scissors size={24} strokeWidth={1.5} />,
  Maximize: <Maximize size={24} strokeWidth={1.5} />,
  Minimize: <Minimize size={24} strokeWidth={1.5} />,
  Palette: <Palette size={24} strokeWidth={1.5} />,
  Code: <Code size={24} strokeWidth={1.5} />,
  ShieldCheck: <ShieldCheck size={24} strokeWidth={1.5} />,
  Search: <Search size={24} strokeWidth={1.5} />,
  Lock: <Lock size={24} strokeWidth={1.5} />,
  Activity: <Activity size={24} strokeWidth={1.5} />,
  Binary: <Binary size={24} strokeWidth={1.5} />,
  Database: <Database size={24} strokeWidth={1.5} />,
  LayoutGrid: <LayoutGrid size={24} strokeWidth={1.5} />,
  SplitSquareHorizontal: <SplitSquareHorizontal size={24} strokeWidth={1.5} />,
  Globe: <Globe size={24} strokeWidth={1.5} />,
  Shield: <Shield size={24} strokeWidth={1.5} />,
  ShieldAlert: <ShieldAlert size={24} strokeWidth={1.5} />,
  FileText: <FileText size={24} strokeWidth={1.5} />,
  Mail: <Mail size={24} strokeWidth={1.5} />,
  QrCode: <QrCode size={24} strokeWidth={1.5} />,
  Cpu: <Cpu size={24} strokeWidth={1.5} />,
  Waves: <Waves size={24} strokeWidth={1.5} />,
  Gauge: <Gauge size={24} strokeWidth={1.5} />,
  ZapOff: <ZapOff size={24} strokeWidth={1.5} />,
  Clock: <Clock size={24} strokeWidth={1.5} />,
};

interface ToolExecutionWorkspaceProps {
  tool: Tool;
  onClose: () => void;
}

export default function ToolExecutionWorkspace({ tool, onClose }: ToolExecutionWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<'execution' | 'api'>('execution');
  const [inputText, setInputText] = useState('');
  const [outputResult, setOutputResult] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [copiedKey, setCopiedKey] = useState(false);

  const handleRun = () => {
    setIsRunning(true);
    setProgress(0);
    
    // Simulate execution
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRunning(false);
          setOutputResult(`[SUCCESS] Protocol executed for ${tool.name}.\n\nProcessed ${inputText.length} characters.\n\nResult: The operation completed successfully using the standard configuration. Integration endpoints are ready.`);
          return 100;
        }
        return prev + 5;
      });
    }, 60);
  };

  const copyToClipboard = (text: string, isKey = false) => {
    navigator.clipboard.writeText(text);
    if (isKey) {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  const iconComponent = tool.icon && IconMap[tool.icon] ? IconMap[tool.icon] : <Box size={24} strokeWidth={1.5} />;
  const apiKey = `pt_${Math.random().toString(36).substr(2, 9)}_${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 md:p-12">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" 
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 border border-slate-200">
        
        {/* Top Progress Bar (Active when running) */}
        {isRunning && (
          <div className="absolute top-0 left-0 h-1 bg-orange-500 transition-all duration-300 z-50 rounded-r-full shadow-[0_0_10px_rgba(249,115,22,0.8)]" style={{ width: `${progress}%` }} />
        )}

        {/* Header */}
        <header className="flex items-start sm:items-center justify-between p-8 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 shadow-inner border border-orange-100/50">
              {iconComponent}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {tool.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded border border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  {tool.category}
                </span>
              </div>
              <p className="text-slate-500 text-sm font-medium">{tool.description}</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-colors border border-slate-200/60 shadow-sm"
          >
            <X size={20} />
          </button>
        </header>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-8 bg-slate-50/50">
          <button 
            onClick={() => setActiveTab('execution')}
            className={`px-6 py-4 text-sm font-bold tracking-wide transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'execution' 
                ? 'border-orange-500 text-orange-600 bg-white' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Terminal size={16} />
            Execution Environment
          </button>
          <button 
            onClick={() => setActiveTab('api')}
            className={`px-6 py-4 text-sm font-bold tracking-wide transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'api' 
                ? 'border-orange-500 text-orange-600 bg-white' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Code2 size={16} />
            API & Integration
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden relative bg-white">
          
          {/* Execution Tab */}
          {activeTab === 'execution' && (
            <div className="absolute inset-0 flex flex-col md:flex-row p-6 gap-6 overflow-y-auto custom-scrollbar">
              
              {/* Input Pane */}
              <div className="flex-1 flex flex-col bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-white">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                    <Upload size={14} className="text-orange-500" />
                    Input Data
                  </label>
                </div>

                <div className="flex-1 relative">
                  <textarea 
                    className="w-full h-full bg-transparent border-none text-slate-800 placeholder-slate-400 p-5 resize-none focus:ring-0 text-sm font-mono leading-relaxed outline-none"
                    placeholder={`Enter data to process with ${tool.name}...`}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                  />
                </div>
              </div>

              {/* Action Column */}
              <div className="flex flex-col items-center justify-center gap-4">
                <button 
                  onClick={handleRun}
                  disabled={isRunning || inputText.length === 0}
                  className="w-16 h-16 rounded-2xl bg-orange-500 hover:bg-orange-600 disabled:bg-slate-200 disabled:text-slate-400 text-white flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95 disabled:hover:scale-100 disabled:shadow-none"
                >
                  <Play size={28} className="ml-1" fill="currentColor" />
                </button>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center max-w-[80px]">
                  {isRunning ? 'Processing...' : 'Run Tool'}
                </div>
              </div>

              {/* Output Pane */}
              <div className="flex-1 flex flex-col bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-white">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                    <Sparkles size={14} className="text-orange-500" />
                    Output Result
                  </label>
                  <div className="flex gap-2">
                    <button className="p-1.5 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded transition-colors" title="Copy">
                      <Copy size={14} />
                    </button>
                    <button className="p-1.5 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded transition-colors" title="Download">
                      <Download size={14} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 relative">
                  {outputResult ? (
                    <textarea 
                      readOnly
                      className="w-full h-full bg-slate-900 border-none text-emerald-400 p-5 resize-none focus:ring-0 text-sm font-mono leading-relaxed outline-none"
                      value={outputResult}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-3">
                      <Terminal size={32} strokeWidth={1} className="opacity-50" />
                      <p className="text-sm font-medium">Awaiting execution...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* API Integration Tab */}
          {activeTab === 'api' && (
            <div className="absolute inset-0 p-8 overflow-y-auto custom-scrollbar">
              <div className="max-w-4xl mx-auto space-y-8">
                
                {/* Intro */}
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Integrate {tool.name}</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Use your dedicated API key to programmatically access this tool from your own applications, websites, or external workflows. All API requests are securely processed through the ProTools global network.
                  </p>
                </div>

                {/* API Key Section */}
                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Key size={120} />
                  </div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-orange-800 mb-4 flex items-center gap-2">
                    <Key size={14} />
                    Your Integration Key
                  </h4>
                  
                  <div className="flex items-center gap-3 max-w-xl relative z-10">
                    <div className="flex-1 bg-white border border-orange-200 rounded-xl px-4 py-3 font-mono text-sm text-slate-700 shadow-sm flex items-center justify-between">
                      <span className="select-all">{apiKey}</span>
                    </div>
                    <button 
                      onClick={() => copyToClipboard(apiKey, true)}
                      className={`px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-sm flex items-center gap-2 ${
                        copiedKey 
                          ? 'bg-emerald-500 text-white border-emerald-600' 
                          : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {copiedKey ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                      {copiedKey ? 'COPIED!' : 'COPY'}
                    </button>
                  </div>
                  <p className="text-xs text-orange-700 mt-3 font-medium">Keep this key secret. It grants full access to execute this specific tool.</p>
                </div>

                {/* Code Snippets */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <Code2 size={14} />
                    Integration Examples
                  </h4>
                  
                  <div className="bg-[#0D1117] rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
                    <div className="flex items-center border-b border-slate-800 px-4 bg-[#161B22]">
                      <div className="px-4 py-3 text-xs font-bold text-white border-b-2 border-orange-500">cURL</div>
                      <div className="px-4 py-3 text-xs font-bold text-slate-500 hover:text-slate-300 cursor-pointer">Node.js</div>
                      <div className="px-4 py-3 text-xs font-bold text-slate-500 hover:text-slate-300 cursor-pointer">Python</div>
                    </div>
                    <div className="p-5 relative group">
                      <button className="absolute top-4 right-4 p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <Copy size={14} />
                      </button>
                      <pre className="font-mono text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
<span className="text-pink-400">curl</span> -X POST https://api.protools.dev/v1/execute/{tool.id} \
  -H <span className="text-emerald-300">"Authorization: Bearer {apiKey}"</span> \
  -H <span className="text-emerald-300">"Content-Type: application/json"</span> \
  -d <span className="text-amber-300">'{'{'}</span>
    <span className="text-blue-300">"input"</span>: <span className="text-emerald-300">"your_data_here"</span>,
    <span className="text-blue-300">"params"</span>: <span className="text-amber-300">{'{'}</span><span className="text-amber-300">{'}'}</span>
  <span className="text-amber-300">{'}'}'</span>
                      </pre>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
