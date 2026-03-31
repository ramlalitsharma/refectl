'use client';

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { editor as MonacoEditor } from 'monaco-editor';
import {
  Play, Save, FolderOpen, Copy, Check, X, Plus, RefreshCw,
  Terminal, Globe, Settings, Trash2, ChevronRight,
  Code2, Files, Search, Package, GitBranch, Pencil, Pin,
  ChevronDown, Minus, FolderPlus, Folder, File,
  Sparkles, Wand2, KeyRound, SendHorizontal, Bot, AlertTriangle, MessageSquare,
  Database, Braces, FileText
} from 'lucide-react';



const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

/* ─── Language Config ─── */
const LANGUAGES = [
  { id: 'javascript', label: 'JavaScript', ext: 'js', monaco: 'javascript', 
    icon: (props: any) => (
      <svg viewBox="0 0 32 32" {...props}><path fill="#f7df1e" d="M0 0h32v32H0z"/><path d="m18.7 18.2 1.4-1c.2.4.4.8.7 1 .3.2.7.4 1.1.4.3 0 .7-.1.9-.3s.3-.4.3-.6c0-.2-.1-.4-.2-.5s-.3-.2-.5-.3-.5-.1-.8-.2l-1-.2c-.4-.1-.8-.2-1.1-.4S19 15.6 19 15c0-.4.1-.8.3-1.1s.5-.5.9-.7 1-.3 1.5-.3c.4 0 .9.1 1.2.2.4.1.7.3 1 .6l-1.2 1.1c-.2-.2-.5-.4-.7-.5-.3-.1-.5-.1-.8-.1-.3 0-.5.1-.7.2s-.2.3-.2.5c0 .2.1.3.2.4s.3.2.6.3l1 .2c.5.1.9.2 1.2.4s.6.5.8.8.4.6.4 1.1c0 .5-.1.9-.4 1.3s-.7.7-1.1.9-1 .3-1.6.3c-.6 0-1.2-.1-1.6-.4s-.8-.7-1.1-1.1zM11.7 13h1.8v8.6c0 .4-.1.8-.3 1.1s-.5.5-.9.7-1 .3-1.5.3c-.4 0-.9-.1-1.2-.2-.4-.1-.7-.3-1-.6l1.2-1.1c.2.2.5.4.7.5.3.1.5.1.8.1.3 0 .5-.1.7-.2s.2-.3.2-.5V13z"/></svg>
    ), 
    color: '#f7df1e',
    defaultCode: `// JavaScript  ✦  Ctrl+Enter to run\nconst greet = (name) => \`Hello, \${name}! 🚀\`;\nconsole.log(greet('World'));\n\nconst nums = [1, 2, 3, 4, 5];\nconst doubled = nums.map(n => n * 2);\nconsole.log('Doubled:', doubled);\nconsole.log('Sum:', doubled.reduce((a, b) => a + b, 0));` },
  { id: 'typescript', label: 'TypeScript', ext: 'ts', monaco: 'typescript', 
    icon: (props: any) => (
      <svg viewBox="0 0 32 32" {...props}><path fill="#3178c6" d="M0 0h32v32H0z"/><path fill="#fff" d="M11.7 13h1.8v8.6c0 .4-.1.8-.3 1.1s-.5.5-.9.7-1 .3-1.5.3c-.4 0-.9-.1-1.2-.2-.4-.1-.7-.3-1-.6l1.2-1.1c.2.2.5.4.7.5.3.1.5.1.8.1.3 0 .5-.1.7-.2s.2-.3.2-.5V13zm7 5.2 1.4-1.1c.2.4.4.8.7 1 .3.2.7.4 1.1.4.3 0 .7-.1.9-.3s.3-.4.3-.6c0-.2-.1-.4-.2-.5s-.3-.2-.5-.3-.5-.1-.8-.2l-1-.2c-.4-.1-.8-.2-1.1-.4S19 15.6 19 15c0-.4.1-.8.3-1.1s.5-.5.9-.7 1-.3 1.5-.3c.4 0 .9.1 1.2.2.4.1.7.3 1 .6l-1.2 1.1c-.2-.2-.5-.4-.7-.5-.3-.1-.5-.1-.8-.1-.3 0-.5.1-.7.2s-.2.3-.2.5c0 .2.1.3.2.4s.3.2.6.3l1 .2c.5.1.9.2 1.2.4s.6.5.8.8.4.6.4 1.1c0 .5-.1.9-.4 1.3s-.7.7-1.1.9-1 .3-1.6.3c-.6 0-1.2-.1-1.6-.4s-.8-.7-1.1-1.1z"/></svg>
    ),
    color: '#3178c6',
    defaultCode: `// TypeScript  ✦  Ctrl+Enter to run\ninterface User {\n  id: number;\n  name: string;\n  role: 'admin' | 'user';\n  score?: number;\n}\n\nconst rankUsers = (users: User[]): User[] =>\n  [...users].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));\n\nconst users: User[] = [\n  { id: 1, name: 'Alice', role: 'admin', score: 95 },\n  { id: 2, name: 'Bob',   role: 'user',  score: 78 },\n];\n\nrankUsers(users).forEach((u, i) =>\n  console.log(\`#\${i + 1} \${u.name} — \${u.score} pts\`)\n);` },
  { id: 'html', label: 'HTML', ext: 'html', monaco: 'html', 
    icon: (props: any) => (
      <svg viewBox="0 0 32 32" {...props}><path fill="#e34f26" d="M5.3 4h21.4l-1.9 21.6L16 28.5l-8.7-2.9z"/><path fill="#ef652a" d="M16 6.1v20l6.8-2.3 1.6-17.7z"/><path fill="#fff" d="M16 12.3h-3.3l-.2-2.5h3.5v-2.3H10.1l.6 6.8h5.3zm0 7.8-2.8-.7-.2-2.1h-2.3l.4 4.8 4.9 1.3v-3.3zm0-11-5.6-.1.1 1.2h4.3l-.1 1.2h-4.4L10.2 15h5.8zm0 5.8-3.3-.9-.2-2.1h-2.3l.4 4.8 5.4 1.5zm7.3-8.8H16v2.3h3.5l-.3 3.4H16v2.3h3.2l-.3 3.5-2.9.8v2.4l5.3-1.5.7-8.1.1-1.2z"/></svg>
    ),
    color: '#e34c26',
    defaultCode: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>Live Preview</title>\n  <style>\n    body { font-family: system-ui; min-height:100vh; display:flex; align-items:center; justify-content:center; margin:0; background: linear-gradient(135deg,#0f0c29,#302b63); color:white; }\n    h1 { font-size:3rem; font-weight:900; letter-spacing:-2px; }\n    button { margin-top:1rem; padding:.75rem 2rem; background:#7c3aed; border:none; border-radius:12px; color:white; font-weight:700; cursor:pointer; }\n    button:hover { background:#6d28d9; transform:scale(1.05); transition:.2s; }\n  </style>\n</head>\n<body>\n  <div style="text-align:center">\n    <h1>Hello World 🌍</h1>\n    <p style="color:rgba(255,255,255,.6)">Edit and see live preview →</p>\n    <button onclick="this.textContent='🎉 Clicked!'">Click Me</button>\n  </div>\n</body>\n</html>` },
  { id: 'css', label: 'CSS', ext: 'css', monaco: 'css', 
    icon: (props: any) => (
      <svg viewBox="0 0 32 32" {...props}><path fill="#1572b6" d="M5.3 4h21.4l-1.9 21.6L16 28.5l-8.7-2.9-1.9-21.6z"/><path fill="#33a9dc" d="M16 6.1v20l6.8-2.3 1.6-17.7H16z"/><path fill="#fff" d="M16 12.3h-3.3l-.2-2.5h3.5v-2.3H10.1l.6 6.8h5.3v-2zm0 6.6-2.8-.7-.2-2.1h-2.3l.4 4.8 4.9 1.3v-3.3zm7.3-8.8H16v2.3h3.5l-.3 3.4H16v2.3h3.2l-.3 3.5-2.9.8v2.4l5.3-1.5.7-8.1.1-1.2z"/></svg>
    ),
    color: '#264de4',
    defaultCode: `/* CSS Demo — live preview */\nbody {\n  margin: 0;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  min-height: 100vh;\n  background: #0f172a;\n}\n\n.card {\n  width: 180px;\n  height: 180px;\n  background: linear-gradient(135deg, #6366f1, #8b5cf6);\n  border-radius: 2rem;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  color: white;\n  font-size: 3rem;\n  box-shadow: 0 25px 50px -12px rgba(99,102,241,.5);\n  animation: float 3s ease-in-out infinite;\n}\n\n@keyframes float {\n  0%,100% { transform: translateY(0) rotate(0deg); }\n  50%      { transform: translateY(-20px) rotate(5deg); }\n}` },
  { id: 'json', label: 'JSON', ext: 'json', monaco: 'json', 
    icon: (props: any) => (
      <svg viewBox="0 0 32 32" {...props}><path fill="#cbcb41" d="M0 0h32v32H0z"/><path d="M14 10v12h-2v-12h2zm6 0v12h-2v-12h2zm-4 4h-2v-4h2v4zm0 4h-2v4h2v-4z" fill="#fff"/></svg>
    ), 
    color: '#cbcb41',
    defaultCode: `{\n  "name": "forge-project",\n  "version": "1.0.0",\n  "description": "My awesome project",\n  "scripts": {\n    "dev": "next dev",\n    "build": "next build",\n    "test": "jest"\n  },\n  "dependencies": {\n    "react": "^18.0.0",\n    "next": "^14.0.0"\n  },\n  "license": "MIT"\n}` },
  { id: 'python', label: 'Python', ext: 'py', monaco: 'python', 
    icon: (props: any) => (
      <svg viewBox="0 0 32 32" {...props}><path fill="#3776ab" d="M15.9 3c-3.6 0-3.4 1.6-3.4 1.6l.1 1.6h3.4v.5h-4.8c-2.3 0-4 1.6-4 3.7v3c0 1.4.9 2.7 2.2 3.1v-3.6c0-1.8 1.4-3.3 3.2-3.3h5.4c1 0 1.8-.8 1.8-1.8V5.3c0-2.3-1.6-2.3-3.9-2.3z"/><path fill="#ffd343" d="M16.1 29c3.6 0 3.4-1.6 3.4-1.6l-.1-1.6h-3.4v-.5h4.8c2.3 0 4-1.6 4-3.7v-3c0-1.4-.9-2.7-2.2-3.1v3.6c0 1.8-1.4 3.3-3.2 3.3h-5.4c-1 0-1.8.8-1.8 1.8v2.6c0 2.3 1.6 2.3 3.9 2.3z"/><path fill="#fff" d="M13.5 5.5a.7.7 0 1 1-1.4 0 .7.7 0 0 1 1.4 0zm5 21a.7.7 0 1 1-1.4 0 .7.7 0 0 1 1.4 0z"/></svg>
    ),
    color: '#3776ab',
    defaultCode: `# Python — simulated output\nprint("Hello from Python! 🐍")\n\nfor i in range(1, 21):\n    if i % 15 == 0: print("FizzBuzz")\n    elif i % 3 == 0: print("Fizz")\n    elif i % 5 == 0: print("Buzz")\n    else: print(i)\n\nsquares = [x**2 for x in range(1, 6)]\nprint("Squares:", squares)` },
  { id: 'php', label: 'PHP', ext: 'php', monaco: 'php',
    icon: (props: any) => (
      <svg viewBox="0 0 32 32" {...props}>
        <ellipse cx="16" cy="16" rx="13" ry="9" fill="#777bb4" />
        <path fill="#fff" d="M8.2 20.7 9.7 11h3.9c2.2 0 3.4 1 3.1 3.1-.3 2.1-1.9 3.3-4.2 3.3h-1.7l-.5 3.3H8.2zm3-5h1.4c1 0 1.7-.5 1.8-1.4.1-.8-.4-1.3-1.4-1.3h-1.4l-.4 2.7zm6.1 5 1.5-9.7h2.1l-.5 3.4h1.8c2.1 0 3 1 2.7 3l-.5 3.3h-2.1l.5-3c.1-.8-.2-1.3-1.1-1.3H20l-.7 4.3h-2zm8.2 0L27 11h2.1l-.5 3.4h1.8c2.1 0 3 1 2.7 3l-.5 3.3h-2.1l.5-3c.1-.8-.2-1.3-1.1-1.3h-1.6l-.7 4.3h-2z" />
      </svg>
    ),
    color: '#777bb4',
    defaultCode: `<?php\n\necho "Hello from forgeIDE PHP";\n` },
  { id: 'plaintext', label: 'Plain Text', ext: 'txt', monaco: 'plaintext',
    icon: (props: any) => <File {...props} />,
    color: '#94a3b8',
    defaultCode: `` },
  { id: 'yaml', label: 'YAML', ext: 'yaml', monaco: 'yaml',
    icon: (props: any) => <Braces {...props} />,
    color: '#f59e0b',
    defaultCode: `name: forge-workspace\nversion: 1.0.0\nfeatures:\n  - local-files\n  - ai-panel\n` },
  { id: 'shell', label: 'Shell', ext: 'sh', monaco: 'shell',
    icon: (props: any) => <Terminal {...props} />,
    color: '#22c55e',
    defaultCode: `#!/usr/bin/env bash\n\necho \"Forge IDE shell script\"\n` },
  { id: 'sql', label: 'SQL', ext: 'sql', monaco: 'sql',
    icon: (props: any) => <Database {...props} />,
    color: '#0ea5e9',
    defaultCode: `SELECT id, name\nFROM users\nORDER BY created_at DESC;\n` },
  { id: 'xml', label: 'XML', ext: 'xml', monaco: 'xml',
    icon: (props: any) => <FileText {...props} />,
    color: '#fb7185',
    defaultCode: `<note>\n  <title>Forge IDE</title>\n  <message>Ready to ship.</message>\n</note>\n` },
  { id: 'env', label: 'Dotenv', ext: 'env', monaco: 'shell',
    icon: (props: any) => <FileText {...props} />,
    color: '#84cc16',
    defaultCode: `APP_NAME=forgeIDE\nNODE_ENV=development\n` },
  { id: 'markdown', label: 'Markdown', ext: 'md', monaco: 'markdown', 
    icon: (props: any) => (
      <svg viewBox="0 0 32 32" {...props}><path fill="#000" d="M0 0h32v32H0z"/><path fill="#fff" d="M4 10v12h3v-7l3 4 3-4v7h3V10h-3l-3 4-3-4H4zm13.1 8 2.2 2 2.2-2h-1.5v-8H17v8h-1.5l2.2 2-2.2-2z"/></svg>
    ),
    color: '#42a5f5',
    defaultCode: `# Forge IDE\n\nA **world-class** browser-based IDE.\n\n## Features\n- 🟨 JavaScript / TypeScript\n- 🟧 HTML / CSS live preview\n- 🐍 Python (simulated)\n- 📁 Local file system access\n- ⚙️ Full editor settings\n\n## Keyboard Shortcuts\n| Key | Action |\n|-----|--------|\n| Ctrl+Enter | Run code |\n| Ctrl+S | Save to disk |\n| Ctrl+/ | Toggle comment |` },
];

/* ─── Extensions (visual) ─── */
const EXTENSIONS = [
  { name: 'Prettier', desc: 'Code formatter', author: 'Prettier', icon: '✨', installed: true },
  { name: 'ESLint', desc: 'JavaScript linter', author: 'Microsoft', icon: '🔍', installed: true },
  { name: 'GitLens', desc: 'Git supercharged', author: 'GitKraken', icon: '🦊', installed: false },
  { name: 'Tailwind CSS IntelliSense', desc: 'Autocomplete for Tailwind', author: 'Tailwind Labs', icon: '💨', installed: false },
  { name: 'Thunder Client', desc: 'REST API client', author: 'Thunder Client', icon: '⚡', installed: false },
  { name: 'Error Lens', desc: 'Inline errors', author: 'Alexander', icon: '🔴', installed: true },
  { name: 'Bracket Pair Colorizer', desc: 'Color brackets', author: 'CoenraadS', icon: '🌈', installed: true },
  { name: 'Path IntelliSense', desc: 'File path autocomplete', author: 'Christian Kohler', icon: '📁', installed: false },
];

/* ─── Types ─── */
interface FileTab {
  id: string;
  name: string;
  langId: string;
  code: string;
  saved: boolean;
  codeLoaded: boolean;
}

type ActivityTab = 'explorer' | 'search' | 'extensions' | 'git' | null;
type PanelMode = 'split' | 'editor' | 'output';
type BottomPanelTab = 'output' | 'console' | 'terminal' | 'ai';
type AIProvider = 'openai' | 'gemini';

interface TerminalSession {
  id: string;
  title: string;
  lines: string[];
  input: string;
  cwd: string;
  createdAt: number;
  accent: string;
}

interface ForgeAIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  pending?: boolean;
  kind?: 'chat' | 'analyze' | 'fix';
}

const makeid = () => Math.random().toString(36).slice(2);
const TERMINAL_ACCENTS = ['#7c3aed', '#06b6d4', '#f59e0b', '#22c55e', '#ef4444'];
const AI_PROVIDER_DEFAULT_MODEL: Record<AIProvider, string> = {
  openai: 'gpt-4o-mini',
  gemini: 'gemini-1.5-flash',
};
const AI_CONFIG_STORAGE_KEY = 'forge-ide-ai-config';
const PLAIN_TEXT_LANGUAGE_ID = 'plaintext';
const LANGUAGE_EXTENSION_ALIASES: Record<string, string> = {
  js: 'javascript',
  jsx: 'javascript',
  cjs: 'javascript',
  mjs: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  cts: 'typescript',
  mts: 'typescript',
  html: 'html',
  htm: 'html',
  css: 'css',
  json: 'json',
  py: 'python',
  php: 'php',
  txt: 'plaintext',
  text: 'plaintext',
  log: 'plaintext',
  conf: 'plaintext',
  ini: 'plaintext',
  toml: 'plaintext',
  md: 'markdown',
  markdown: 'markdown',
  yaml: 'yaml',
  yml: 'yaml',
  sh: 'shell',
  bash: 'shell',
  zsh: 'shell',
  env: 'env',
  sql: 'sql',
  xml: 'xml',
  svg: 'xml',
};

const getFileExtension = (name: string) => {
  const baseName = name.split('/').pop() || name;
  if (baseName.startsWith('.') && baseName.lastIndexOf('.') === 0 && baseName.length > 1) {
    return baseName.slice(1).toLowerCase();
  }
  const dotIndex = baseName.lastIndexOf('.');
  if (dotIndex <= 0 || dotIndex === baseName.length - 1) return '';
  return baseName.slice(dotIndex + 1).toLowerCase();
};

const resolveLanguageForName = (name: string) => {
  const extension = getFileExtension(name);
  const alias = LANGUAGE_EXTENSION_ALIASES[extension] ?? extension;
  return LANGUAGES.find(lang => lang.id === alias || lang.ext === alias) ?? LANGUAGES.find(lang => lang.id === PLAIN_TEXT_LANGUAGE_ID) ?? LANGUAGES[0];
};

const getInitialCodeForFile = (name: string) => {
  const language = resolveLanguageForName(name);
  if (language.id === 'plaintext') return '';
  if (language.id === 'markdown') return `# ${name}`;
  if (language.id === 'html') return language.defaultCode;
  if (language.id === 'css') return language.defaultCode;
  if (language.id === 'php') return language.defaultCode;
  return `// ${name}`;
};

const makeTerminalSession = (index: number): TerminalSession => ({
  id: makeid(),
  title: `Session ${index}`,
  lines: ['Forge terminal ready.', 'Type "help" to see available commands.'],
  input: '',
  cwd: '',
  createdAt: Date.now(),
  accent: TERMINAL_ACCENTS[(index - 1) % TERMINAL_ACCENTS.length],
});

const makeWelcomeAIMessage = (): ForgeAIMessage => ({
  id: makeid(),
  role: 'assistant',
  content: 'Forge AI is ready. Add your OpenAI or Gemini API key, then ask for analysis, debugging help, refactors, or code generation for the active file.',
});

/* ─── Run Engine ─── */
function executeCode(lang: typeof LANGUAGES[0], code: string): { logs: string[]; isHtml: boolean } {
  const isHtml = lang.id === 'html' || lang.id === 'css';
  if (isHtml) return { logs: [], isHtml: true };

  const logs: string[] = [];
  if (lang.id === 'javascript' || lang.id === 'typescript') {
    const mc = {
      log:   (...a: any[]) => logs.push(a.map((x: any) => typeof x === 'object' ? JSON.stringify(x, null, 2) : String(x)).join(' ')),
      error: (...a: any[]) => logs.push('❌ ' + a.map(String).join(' ')),
      warn:  (...a: any[]) => logs.push('⚠️ ' + a.map(String).join(' ')),
      info:  (...a: any[]) => logs.push('ℹ️ ' + a.map(String).join(' ')),
    };
    try { new Function('console', code)(mc); } catch (e: any) { logs.push('❌ ' + e.message); }
  } else if (lang.id === 'python') {
    const re = /print\(([^)]+)\)/g; let m;
    while ((m = re.exec(code)) !== null) logs.push(m[1].replace(/^["'`]|["'`]$/g, ''));
    if (!logs.length) logs.push('ℹ️ Python simulated — only print() is captured');
  } else if (lang.id === 'json') {
    try { logs.push('✅ Valid JSON\n' + JSON.stringify(JSON.parse(code), null, 2)); }
    catch (e: any) { logs.push('❌ ' + e.message); }
  } else if (lang.id === 'markdown') {
    logs.push('📝 Markdown preview not available in output pane.\nRendered as plain text above.');
  } else {
    logs.push('ℹ️ Run not supported for this language in browser.');
  }
  return { logs, isHtml: false };
}

/* ─── Settings defaults ─── */
const defaultSettings = {
  theme: 'vs-dark' as 'vs-dark' | 'light',
  fontSize: 14,
  tabSize: 2,
  wordWrap: false,
  minimap: true,
  lineNumbers: true,
  autoSave: false,
  formatOnSave: false,
  bracketPairs: true,
  renderWhitespace: false,
};

/* ═══════════════════════════════════════════════════════════ */
export default function CodeToolPage() {
  // Start with an empty tab
  const initialTabs: FileTab[] = [{
    id: makeid(),
    name: 'main.js',
    langId: 'javascript',
    code: '',
    saved: true,
    codeLoaded: true,
  }];
  const initialTerminalSessions = [makeTerminalSession(1)];
  const [tabs, setTabs] = useState<FileTab[]>(initialTabs);
  const [openTabIds, setOpenTabIds] = useState<string[]>([initialTabs[0].id]);
  const [pinnedTabIds, setPinnedTabIds] = useState<string[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(initialTabs[0].id);
  const [secondaryTabId, setSecondaryTabId] = useState<string | null>(null);
  const [output, setOutput] = useState<string[]>([]);
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [renamingNode, setRenamingNode] = useState<{ path: string; type: 'file' | 'folder' } | null>(null);
  const [draggingNodePath, setDraggingNodePath] = useState<string | null>(null);
  const [dragOverPath, setDragOverPath] = useState<string>('');
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ id: string, x: number, y: number, isFolder?: boolean, path?: string } | null>(null);
  const [selectedDir, setSelectedDir] = useState<string>(''); 
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());
  const [explicitFolders, setExplicitFolders] = useState<string[]>([]);
  const [creatingNode, setCreatingNode] = useState<{ type: 'file'|'folder', parent: string } | null>(null);
  const [newNodeName, setNewNodeName] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isHtmlOutput, setIsHtmlOutput] = useState(false);
  const [htmlContent, setHtmlContent] = useState('');
  const [settings, setSettings] = useState(defaultSettings);
  const [showSettings, setShowSettings] = useState(false);
  const [panelMode, setPanelMode] = useState<PanelMode>('editor');
  const [isFullFrame, setIsFullFrame] = useState(false);
  const [activityTab, setActivityTab] = useState<ActivityTab>('explorer');
  const [bottomPanelTab, setBottomPanelTab] = useState<BottomPanelTab>('console');
  const [showBottomPanel, setShowBottomPanel] = useState(false);
  const [terminalSessions, setTerminalSessions] = useState<TerminalSession[]>(initialTerminalSessions);
  const [activeTerminalId, setActiveTerminalId] = useState<string>(initialTerminalSessions[0].id);
  const [secondaryTerminalId, setSecondaryTerminalId] = useState<string | null>(null);
  const [terminalPanelMode, setTerminalPanelMode] = useState<'single' | 'split'>('single');
  const [editingTerminalSessionId, setEditingTerminalSessionId] = useState<string | null>(null);
  const [editingTerminalTitle, setEditingTerminalTitle] = useState('');
  const [livePreview, setLivePreview] = useState(false);
  const [copied, setCopied] = useState(false);
  const [extSearch, setExtSearch] = useState('');
  const [installedExts, setInstalledExts] = useState<string[]>(['Prettier', 'ESLint', 'Error Lens', 'Bracket Pair Colorizer']);
  const [aiProvider, setAiProvider] = useState<AIProvider>('openai');
  const [aiModel, setAiModel] = useState(AI_PROVIDER_DEFAULT_MODEL.openai);
  const [aiApiKey, setAiApiKey] = useState('');
  const [rememberAiKey, setRememberAiKey] = useState(true);
  const [aiMessages, setAiMessages] = useState<ForgeAIMessage[]>([makeWelcomeAIMessage()]);
  const [aiInput, setAiInput] = useState('');
  const [aiSubmitting, setAiSubmitting] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiIncludeFile, setAiIncludeFile] = useState(true);
  const [aiIncludeConsole, setAiIncludeConsole] = useState(true);
  const [workspaceMode, setWorkspaceMode] = useState<'scratch' | 'local'>('scratch');
  const [workspaceLabel, setWorkspaceLabel] = useState('Scratch Workspace');
  const [workspaceBusy, setWorkspaceBusy] = useState(false);
  const [workspaceNotice, setWorkspaceNotice] = useState('');
  const [explorerFilter, setExplorerFilter] = useState('');
  const [showQuickOpen, setShowQuickOpen] = useState(false);
  const [quickOpenQuery, setQuickOpenQuery] = useState('');
  const [quickOpenIndex, setQuickOpenIndex] = useState(0);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [commandPaletteQuery, setCommandPaletteQuery] = useState('');
  const [commandPaletteIndex, setCommandPaletteIndex] = useState(0);

  const settingsRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<MonacoEditor.IStandaloneCodeEditor | null>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);
  const createInputRef = useRef<HTMLInputElement>(null);
  const terminalInputRef = useRef<HTMLInputElement>(null);
  const terminalOutputRef = useRef<HTMLDivElement>(null);
  const consoleOutputRef = useRef<HTMLDivElement>(null);
  const quickOpenInputRef = useRef<HTMLInputElement>(null);
  const commandPaletteInputRef = useRef<HTMLInputElement>(null);
  const aiInputRef = useRef<HTMLTextAreaElement>(null);
  const aiMessagesRef = useRef<HTMLDivElement>(null);
  const sidebarResizeRef = useRef<{ startX: number; startWidth: number } | null>(null);
  const workspaceRootRef = useRef<any | null>(null);
  const folderHandlesRef = useRef<Map<string, any>>(new Map());
  const fileHandlesRef = useRef<Map<string, any>>(new Map());
  const tabsRef = useRef<FileTab[]>(initialTabs);
  const openTabIdsRef = useRef<string[]>([initialTabs[0].id]);
  const activeTabIdRef = useRef<string | null>(initialTabs[0].id);
  const expandedDirsRef = useRef<Set<string>>(new Set());

  const activeTab = tabs.find(t => t.id === activeTabId);
  const openTabs = useMemo(() => {
    const pinnedSet = new Set(pinnedTabIds);
    const resolved = openTabIds.map(id => tabs.find(tab => tab.id === id)).filter(Boolean) as FileTab[];
    const pinned: FileTab[] = [];
    const regular: FileTab[] = [];
    resolved.forEach(tab => {
      if (pinnedSet.has(tab.id)) pinned.push(tab);
      else regular.push(tab);
    });
    return [...pinned, ...regular];
  }, [openTabIds, pinnedTabIds, tabs]);
  const quickOpenResults = useMemo(() => {
    const query = quickOpenQuery.trim().toLowerCase();
    const openSet = new Set(openTabIds);

    return tabs
      .filter(tab => {
        if (!query) return true;
        const haystack = `${tab.name} ${tab.langId}`.toLowerCase();
        return haystack.includes(query);
      })
      .map(tab => ({
        tab,
        score: (openSet.has(tab.id) ? 0 : 1000) + (query && tab.name.toLowerCase() === query ? 0 : query && tab.name.toLowerCase().startsWith(query) ? 10 : 20),
      }))
      .sort((a, b) => a.score - b.score || a.tab.name.localeCompare(b.tab.name))
      .map(entry => entry.tab)
      .slice(0, 30);
  }, [openTabIds, quickOpenQuery, tabs]);
  const secondaryTab = tabs.find(t => t.id === secondaryTabId) ?? null;
  const activeLang = activeTab ? resolveLanguageForName(activeTab.name) : LANGUAGES[0];
  const isHtmlLang = activeLang.id === 'html' || activeLang.id === 'css';
  const activeTerminal = terminalSessions.find(session => session.id === activeTerminalId) ?? terminalSessions[0];
  const consoleEntries = useMemo(() => output.map((line, index) => {
    const trimmed = line.trim();
    const lower = trimmed.toLowerCase();
    const tone: 'error' | 'warning' | 'success' | 'info' =
      /^(❌|error|typeerror|referenceerror|syntaxerror|aborterror|uncaught)/i.test(trimmed) ? 'error'
        : /^(⚠️|warn|warning)/i.test(trimmed) ? 'warning'
          : /^(✅|success|done|compiled|ready)/i.test(trimmed) ? 'success'
            : 'info';

    return {
      id: `${index}-${trimmed}`,
      line,
      tone,
      ts: new Date(Date.now() + index * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      short: tone === 'error' ? 'ERR' : tone === 'warning' ? 'WARN' : tone === 'success' ? 'OK' : 'LOG',
      searchable: lower,
    };
  }), [output]);
  const consoleSummary = useMemo(() => ({
    total: consoleEntries.length,
    errors: consoleEntries.filter(entry => entry.tone === 'error').length,
    warnings: consoleEntries.filter(entry => entry.tone === 'warning').length,
  }), [consoleEntries]);
  const bottomPanelHeight = bottomPanelTab === 'ai' ? 420 : bottomPanelTab === 'terminal' ? 320 : 260;

  const isDark = settings.theme === 'vs-dark';

  useEffect(() => {
    tabsRef.current = tabs;
  }, [tabs]);

  useEffect(() => {
    openTabIdsRef.current = openTabIds;
  }, [openTabIds]);

  useEffect(() => {
    activeTabIdRef.current = activeTabId;
  }, [activeTabId]);

  useEffect(() => {
    expandedDirsRef.current = expandedDirs;
  }, [expandedDirs]);

  useEffect(() => {
    const tabIds = new Set(tabs.map(tab => tab.id));
    setPinnedTabIds(prev => {
      const next = prev.filter(id => tabIds.has(id));
      return next.length === prev.length ? prev : next;
    });
    setOpenTabIds(prev => {
      const next = prev.filter(id => tabIds.has(id));
      return next.length === prev.length ? prev : next;
    });
    if (secondaryTabId && !tabIds.has(secondaryTabId)) {
      setSecondaryTabId(null);
      setPanelMode('editor');
    }
  }, [secondaryTabId, tabs]);

  useEffect(() => {
    if (panelMode !== 'split') return;
    if (!secondaryTab || secondaryTab.id === activeTabId) {
      const fallback = openTabs.find(tab => tab.id !== activeTabId);
      if (fallback) setSecondaryTabId(fallback.id);
      else {
        setSecondaryTabId(null);
        setPanelMode('editor');
      }
    }
  }, [activeTabId, openTabs, panelMode, secondaryTab]);

  /* click-outside to close settings & context menu */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setShowSettings(false);
      }
      setContextMenu(null);
    };
    if (showSettings || contextMenu) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showSettings, contextMenu]);

  useEffect(() => {
    if ((editingTabId || renamingNode) && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [editingTabId, renamingNode]);
  useEffect(() => { if (creatingNode && createInputRef.current) createInputRef.current.focus(); }, [creatingNode]);
  useEffect(() => {
    if (showBottomPanel && bottomPanelTab === 'terminal' && terminalInputRef.current) {
      terminalInputRef.current.focus();
    }
    if (showBottomPanel && bottomPanelTab === 'ai' && aiInputRef.current) {
      aiInputRef.current.focus();
    }
  }, [showBottomPanel, bottomPanelTab, activeTerminalId]);

  useEffect(() => {
    if (showQuickOpen && quickOpenInputRef.current) {
      quickOpenInputRef.current.focus();
      quickOpenInputRef.current.select();
    }
  }, [showQuickOpen]);

  useEffect(() => {
    setQuickOpenIndex(prev => {
      if (!quickOpenResults.length) return 0;
      return Math.min(prev, quickOpenResults.length - 1);
    });
  }, [quickOpenResults]);

  useEffect(() => {
    if (showBottomPanel && bottomPanelTab === 'terminal' && terminalOutputRef.current) {
      terminalOutputRef.current.scrollTop = terminalOutputRef.current.scrollHeight;
    }
  }, [activeTerminalId, activeTerminal?.lines, bottomPanelTab, showBottomPanel]);

  useEffect(() => {
    if (showBottomPanel && bottomPanelTab === 'console' && consoleOutputRef.current) {
      consoleOutputRef.current.scrollTop = consoleOutputRef.current.scrollHeight;
    }
  }, [bottomPanelTab, consoleEntries, showBottomPanel]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(AI_CONFIG_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<{ provider: AIProvider; model: string; apiKey: string; rememberAiKey: boolean }>;
      if (parsed.provider === 'openai' || parsed.provider === 'gemini') {
        setAiProvider(parsed.provider);
        setAiModel(parsed.model || AI_PROVIDER_DEFAULT_MODEL[parsed.provider]);
      }
      if (typeof parsed.rememberAiKey === 'boolean') setRememberAiKey(parsed.rememberAiKey);
      if (typeof parsed.apiKey === 'string') setAiApiKey(parsed.apiKey);
    } catch { }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const payload = rememberAiKey
        ? { provider: aiProvider, model: aiModel, apiKey: aiApiKey, rememberAiKey }
        : { provider: aiProvider, model: aiModel, rememberAiKey };
      window.localStorage.setItem(AI_CONFIG_STORAGE_KEY, JSON.stringify(payload));
    } catch { }
  }, [aiApiKey, aiModel, aiProvider, rememberAiKey]);

  useEffect(() => {
    if (!aiMessagesRef.current) return;
    aiMessagesRef.current.scrollTop = aiMessagesRef.current.scrollHeight;
  }, [aiMessages, aiSubmitting]);

  useEffect(() => {
    if (!isResizingSidebar) return;

    const onMouseMove = (event: MouseEvent) => {
      if (!sidebarResizeRef.current) return;
      const delta = event.clientX - sidebarResizeRef.current.startX;
      const nextWidth = Math.min(420, Math.max(220, sidebarResizeRef.current.startWidth + delta));
      setSidebarWidth(nextWidth);
    };

    const onMouseUp = () => {
      setIsResizingSidebar(false);
      sidebarResizeRef.current = null;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizingSidebar]);

  /* live preview */
  useEffect(() => {
    if (!livePreview || !isHtmlLang || !activeTab) return;
    const content = activeLang.id === 'css'
      ? `<html><body style="margin:0"><style>${activeTab.code}</style><div class="card">🎨</div></body></html>`
      : activeTab.code;
    setHtmlContent(content);
    setIsHtmlOutput(true);
  }, [activeTab, livePreview, isHtmlLang, activeLang.id]);

  const setSetting = <K extends keyof typeof defaultSettings>(key: K, val: typeof defaultSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: val }));
  };

  const updateCode = (code: string, tabId = activeTabId) => {
    setTabs(prev => prev.map(t => t.id === tabId ? { ...t, code, saved: false, codeLoaded: true } : t));
  };

  const addTab = (langId = 'javascript') => {
    const lang = LANGUAGES.find(l => l.id === langId) ?? LANGUAGES[0];
    let nextNum = 1;
    while (tabsRef.current.some(t => t.name === `Untitled-${nextNum}.${lang.ext}`)) {
      nextNum++;
    }
    const name = `Untitled-${nextNum}.${lang.ext}`;
    const tab: FileTab = {
      id: makeid(), name, langId: lang.id, code: '', saved: true, codeLoaded: true,
    };
    setTabs(prev => [...prev, tab]);
    setOpenTabIds(openPrev => openPrev.includes(tab.id) ? openPrev : [...openPrev, tab.id]);
    setActiveTabId(tab.id);
  };

  const openEditorTab = useCallback(async (tabId: string) => {
    const targetTab = tabsRef.current.find(tab => tab.id === tabId);
    if (!targetTab) return;

    setOpenTabIds(prev => prev.includes(tabId) ? prev : [...prev, tabId]);
    setActiveTabId(tabId);

    if (workspaceMode !== 'local' || targetTab.codeLoaded) return;

    const fileHandle = fileHandlesRef.current.get(targetTab.name);
    if (!fileHandle) return;

    try {
      const file = await fileHandle.getFile();
      const text = await file.text();
      setTabs(prev => prev.map(tab => (
        tab.id === tabId
          ? { ...tab, code: text, saved: true, codeLoaded: true }
          : tab
      )));
    } catch (error: any) {
      setWorkspaceNotice(error?.message || `Unable to open ${targetTab.name} from the local workspace.`);
    }
  }, [workspaceMode]);

  const closeEditorTab = useCallback((id: string) => {
    setOpenTabIds(prev => {
      if (!prev.includes(id)) return prev;
      const currentIndex = prev.indexOf(id);
      const next = prev.filter(tabId => tabId !== id);
      if (activeTabIdRef.current === id) {
        const replacement = next[currentIndex - 1] ?? next[currentIndex] ?? next[next.length - 1] ?? null;
        setActiveTabId(replacement);
      }
      return next;
    });
    setPinnedTabIds(prev => prev.filter(tabId => tabId !== id));
    setSecondaryTabId(prev => {
      if (prev !== id) return prev;
      const fallback = openTabIdsRef.current.find(tabId => tabId !== id && tabId !== activeTabIdRef.current) ?? null;
      if (!fallback) setPanelMode('editor');
      return fallback;
    });
  }, []);

  const togglePinnedTab = useCallback((id: string) => {
    setPinnedTabIds(prev => prev.includes(id) ? prev.filter(tabId => tabId !== id) : [...prev, id]);
  }, []);

  const openSplitWithTab = useCallback(async (tabId: string) => {
    await openEditorTab(tabId);
    const targetSecondary = tabId === activeTabIdRef.current
      ? openTabIdsRef.current.find(id => id !== tabId) ?? null
      : tabId;

    if (!targetSecondary) {
      setPanelMode('editor');
      setSecondaryTabId(null);
      return;
    }

    setSecondaryTabId(targetSecondary);
    setPanelMode('split');
  }, [openEditorTab]);

  const openQuickOpen = useCallback(() => {
    setShowQuickOpen(true);
    setQuickOpenQuery('');
    const activeIndex = activeTabId ? Math.max(quickOpenResults.findIndex(tab => tab.id === activeTabId), 0) : 0;
    setQuickOpenIndex(activeIndex);
  }, [activeTabId, quickOpenResults]);

  const closeQuickOpen = useCallback(() => {
    setShowQuickOpen(false);
    setQuickOpenQuery('');
    setQuickOpenIndex(0);
  }, []);

  const commitQuickOpen = useCallback(async (tabId?: string) => {
    const nextTabId = tabId ?? quickOpenResults[quickOpenIndex]?.id;
    if (!nextTabId) return;
    await openEditorTab(nextTabId);
    closeQuickOpen();
  }, [closeQuickOpen, openEditorTab, quickOpenIndex, quickOpenResults]);

  const removeWorkspaceEntries = useCallback((matcher: (tab: FileTab) => boolean, folderMatcher?: (folder: string) => boolean) => {
    const removedTabs = tabsRef.current.filter(matcher);
    const removedIds = new Set(removedTabs.map(tab => tab.id));
    const removedPaths = new Set(removedTabs.map(tab => tab.name));

    setTabs(prev => prev.filter(tab => !matcher(tab)));
    setPinnedTabIds(prev => prev.filter(id => !removedIds.has(id)));
    setOpenTabIds(prev => {
      const next = prev.filter(id => !removedIds.has(id));
      if (activeTabIdRef.current && removedIds.has(activeTabIdRef.current)) {
        const currentIndex = prev.indexOf(activeTabIdRef.current);
        const replacement = next[currentIndex - 1] ?? next[currentIndex] ?? next[next.length - 1] ?? null;
        setActiveTabId(replacement);
      } else if (activeTabIdRef.current && !next.includes(activeTabIdRef.current) && next.length > 0) {
        setActiveTabId(next[next.length - 1]);
      }
      return next;
    });
    setSecondaryTabId(prev => {
      if (!prev || !removedIds.has(prev)) return prev;
      const fallback = openTabIdsRef.current.find(id => id !== prev && !removedIds.has(id) && id !== activeTabIdRef.current) ?? null;
      if (!fallback) setPanelMode('editor');
      return fallback;
    });

    if (folderMatcher) {
      setExplicitFolders(prev => prev.filter(folder => !folderMatcher(folder)));
      setExpandedDirs(prev => {
        const next = new Set<string>();
        prev.forEach(folder => {
          if (!folderMatcher(folder)) next.add(folder);
        });
        return next;
      });
    }

    if (selectedDir && (removedPaths.has(selectedDir) || (folderMatcher && folderMatcher(selectedDir)))) setSelectedDir('');
    if (renamingNode?.path && (removedPaths.has(renamingNode.path) || (folderMatcher && folderMatcher(renamingNode.path)))) setRenamingNode(null);
  }, [renamingNode?.path, selectedDir]);

  const renameTab = (id: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) {
      setEditingTabId(null);
      return;
    }
    setTabs(prev => prev.map(t => {
      if (t.id !== id) return t;
      const up = t.name.includes('/') ? t.name.substring(0, t.name.lastIndexOf('/')) + '/' : '';
      const fullPath = up + trimmed;
      const newLang = resolveLanguageForName(fullPath);
      return { ...t, name: fullPath, langId: newLang.id };
    }));
    setEditingTabId(null);
  };

  const getParentPath = (path: string) => path.includes('/') ? path.substring(0, path.lastIndexOf('/')) : '';
  const isFolderPath = useCallback((path: string) => explicitFolders.includes(path) || tabs.some(t => t.name.startsWith(path + '/')), [explicitFolders, tabs]);
  const selectedFolderPath = selectedDir ? (isFolderPath(selectedDir) ? selectedDir : getParentPath(selectedDir)) : '';
  const findExplorerFile = useCallback((path: string) => tabs.find(tab => tab.name === path), [tabs]);

  const writeLocalFile = useCallback(async (handle: any, content: string) => {
    const writable = await handle.createWritable();
    await writable.write(content);
    await writable.close();
  }, []);

  const readLocalFile = useCallback(async (handle: any) => {
    const file = await handle.getFile();
    return file.text();
  }, []);

  const readWorkspaceTabContent = useCallback(async (tab: FileTab) => {
    if (tab.codeLoaded) return tab.code;
    const handle = fileHandlesRef.current.get(tab.name);
    if (!handle) return tab.code;
    return readLocalFile(handle);
  }, [readLocalFile]);

  useEffect(() => {
    if (!activeTab || activeTab.saved || !activeTab.codeLoaded) return;
    const handle = fileHandlesRef.current.get(activeTab.name);
    if (!handle) return;

    const timeout = window.setTimeout(() => {
      void writeLocalFile(handle, activeTab.code)
        .then(() => {
          setTabs(prev => prev.map(tab => (
            tab.id === activeTab.id
              ? { ...tab, saved: true }
              : tab
          )));
        })
        .catch((error: any) => {
          setWorkspaceNotice(error?.message || `Unable to auto-save ${activeTab.name} locally.`);
        });
    }, 900);

    return () => window.clearTimeout(timeout);
  }, [activeTab, writeLocalFile]);

  const getDirectoryHandleForPath = useCallback(async (path: string, create = false) => {
    let current = workspaceRootRef.current;
    if (!current) return null;
    if (!path) return current;

    let currentPath = '';
    for (const segment of path.split('/').filter(Boolean)) {
      current = await current.getDirectoryHandle(segment, { create });
      currentPath = currentPath ? `${currentPath}/${segment}` : segment;
      folderHandlesRef.current.set(currentPath, current);
    }
    return current;
  }, []);

  const remapWorkspacePaths = useCallback((sourcePath: string, nextPath: string, type: 'file' | 'folder') => {
    if (type === 'file') {
      const nextTabs = tabsRef.current.map(tab => (
        tab.name === sourcePath
          ? { ...tab, name: nextPath, langId: resolveLanguageForName(nextPath).id }
          : tab
      ));
      tabsRef.current = nextTabs;
      setTabs(nextTabs);

      const sourceHandle = fileHandlesRef.current.get(sourcePath);
      if (sourceHandle) {
        fileHandlesRef.current.delete(sourcePath);
        fileHandlesRef.current.set(nextPath, sourceHandle);
      }

      if (selectedDir === sourcePath) setSelectedDir(nextPath);
      return;
    }

    const prefix = `${sourcePath}/`;
    const nextPrefix = `${nextPath}/`;
    const nextTabs = tabsRef.current.map(tab => {
      if (!tab.name.startsWith(prefix)) return tab;
      const remappedName = `${nextPrefix}${tab.name.slice(prefix.length)}`;
      return { ...tab, name: remappedName, langId: resolveLanguageForName(remappedName).id };
    });
    tabsRef.current = nextTabs;
    setTabs(nextTabs);

    setExplicitFolders(prev => prev.map(folder => {
      if (folder === sourcePath) return nextPath;
      if (folder.startsWith(prefix)) return `${nextPrefix}${folder.slice(prefix.length)}`;
      return folder;
    }));

    setExpandedDirs(prev => {
      const updated = new Set<string>();
      prev.forEach(folder => {
        if (folder === sourcePath) updated.add(nextPath);
        else if (folder.startsWith(prefix)) updated.add(`${nextPrefix}${folder.slice(prefix.length)}`);
        else updated.add(folder);
      });
      return updated;
    });

    const nextFileHandles = new Map<string, any>();
    fileHandlesRef.current.forEach((handle, key) => {
      if (key === sourcePath) nextFileHandles.set(nextPath, handle);
      else if (key.startsWith(prefix)) nextFileHandles.set(`${nextPrefix}${key.slice(prefix.length)}`, handle);
      else nextFileHandles.set(key, handle);
    });
    fileHandlesRef.current = nextFileHandles;

    const nextFolderHandles = new Map<string, any>();
    folderHandlesRef.current.forEach((handle, key) => {
      if (key === sourcePath) nextFolderHandles.set(nextPath, handle);
      else if (key.startsWith(prefix)) nextFolderHandles.set(`${nextPrefix}${key.slice(prefix.length)}`, handle);
      else nextFolderHandles.set(key, handle);
    });
    folderHandlesRef.current = nextFolderHandles;

    if (selectedDir === sourcePath) setSelectedDir(nextPath);
    else if (selectedDir.startsWith(prefix)) setSelectedDir(`${nextPrefix}${selectedDir.slice(prefix.length)}`);
  }, [selectedDir]);

  const loadLocalWorkspace = useCallback(async (rootHandle: any, preferredPath: string | null = null) => {
    setWorkspaceBusy(true);
    setWorkspaceNotice('');
    try {
      const nextFolders: string[] = [];
      const nextTabs: FileTab[] = [];
      const nextFolderHandles = new Map<string, any>();
      const nextFileHandles = new Map<string, any>();
      const previousTabs = tabsRef.current;
      const previousByPath = new Map(previousTabs.map(tab => [tab.name, tab]));
      const previousOpenPaths = new Set(
        previousTabs
          .filter(tab => openTabIdsRef.current.includes(tab.id))
          .map(tab => tab.name),
      );

      const walkDirectory = async (dirHandle: any, currentPath = '') => {
        if (currentPath) {
          nextFolders.push(currentPath);
          nextFolderHandles.set(currentPath, dirHandle);
        }

        const entries: Array<[string, any]> = [];
        for await (const entry of dirHandle.entries()) {
          entries.push(entry as [string, any]);
        }
        entries.sort((a, b) => a[0].localeCompare(b[0]));

        for (const [name, handle] of entries) {
          const fullPath = currentPath ? `${currentPath}/${name}` : name;
          if (handle.kind === 'directory') {
            await walkDirectory(handle, fullPath);
            continue;
          }

          try {
            const language = resolveLanguageForName(fullPath);
            const existing = previousByPath.get(fullPath);
            const shouldOpenNow = previousOpenPaths.has(fullPath) || preferredPath === fullPath;
            let code = existing?.codeLoaded ? existing.code : '';
            let codeLoaded = Boolean(existing?.codeLoaded);
            let saved = existing?.saved ?? true;

            if (!codeLoaded && shouldOpenNow) {
              code = await readLocalFile(handle);
              codeLoaded = true;
              saved = true;
            }

            nextTabs.push({
              id: existing?.id ?? makeid(),
              name: fullPath,
              langId: language.id,
              code,
              saved,
              codeLoaded,
            });
            nextFileHandles.set(fullPath, handle);
          } catch {
            // Ignore unreadable local files instead of breaking the workspace import.
          }
        }
      };

      await walkDirectory(rootHandle);

      workspaceRootRef.current = rootHandle;
      folderHandlesRef.current = nextFolderHandles;
      fileHandlesRef.current = nextFileHandles;
      setWorkspaceMode('local');
      setWorkspaceLabel(rootHandle.name || 'Local Workspace');
      setExplicitFolders(nextFolders);
      setTabs(nextTabs);
      const nextOpenIds = nextTabs.filter(tab => previousOpenPaths.has(tab.name) || preferredPath === tab.name).map(tab => tab.id);
      setOpenTabIds(nextOpenIds);

      const initialExpanded = new Set([
        ...nextFolders.filter(path => !path.includes('/')),
        ...Array.from(expandedDirsRef.current).filter(path => nextFolders.includes(path)),
      ]);
      setExpandedDirs(initialExpanded);

      const selectedPath = preferredPath && (nextFolders.includes(preferredPath) || nextTabs.some(tab => tab.name === preferredPath))
        ? preferredPath
        : '';
      setSelectedDir(selectedPath);

      const nextActivePath =
        preferredPath && nextTabs.some(tab => tab.name === preferredPath)
          ? preferredPath
          : previousTabs.find(tab => openTabIdsRef.current.includes(tab.id) && nextTabs.some(nextTab => nextTab.name === tab.name))?.name;
      const nextActiveTab = nextActivePath ? nextTabs.find(tab => tab.name === nextActivePath) : undefined;
      setActiveTabId(nextActiveTab?.id ?? null);
      setWorkspaceNotice('Local workspace linked. File and folder actions stay on this PC in your browser session.');
    } catch (error: any) {
      setWorkspaceNotice(error?.message || 'Unable to open the selected local folder.');
    } finally {
      setWorkspaceBusy(false);
    }
  }, [readLocalFile]);

  const syncLocalWorkspace = useCallback(async (preferredPath: string | null = null) => {
    if (!workspaceRootRef.current) return;
    await loadLocalWorkspace(workspaceRootRef.current, preferredPath ?? selectedDir);
  }, [loadLocalWorkspace, selectedDir]);

  const openLocalWorkspace = useCallback(async () => {
    if (!('showDirectoryPicker' in window)) {
      setWorkspaceNotice('This browser does not support local folder access. Try a Chromium-based browser.');
      return;
    }

    try {
      const handle = await (window as any).showDirectoryPicker();
      await loadLocalWorkspace(handle);
    } catch (error: any) {
      if (error?.name === 'AbortError') return;
      setWorkspaceNotice(error?.message || 'Unable to open a local folder.');
    }
  }, [loadLocalWorkspace]);

  const startRenamingNode = (path: string, type: 'file' | 'folder') => {
    setEditingTabId(null);
    setRenamingNode({ path, type });
    setEditingName(path.split('/').pop() || path);
  };

  const toggleFolderOpen = useCallback((path: string) => {
    setExpandedDirs(prev => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }, []);

  const renameExplorerNode = async (path: string, type: 'file' | 'folder', newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) {
      setRenamingNode(null);
      return;
    }

    const parentPath = getParentPath(path);
    const nextPath = parentPath ? `${parentPath}/${trimmed}` : trimmed;

    if (nextPath === path) {
      setRenamingNode(null);
      return;
    }

    if (workspaceMode === 'local' && workspaceRootRef.current) {
      try {
        if (type === 'file') {
          if (tabs.some(tab => tab.name === nextPath && tab.name !== path)) {
            setRenamingNode(null);
            return;
          }

          const sourceHandle = fileHandlesRef.current.get(path);
          const parentHandle = await getDirectoryHandleForPath(parentPath, true);
          if (!sourceHandle || !parentHandle) throw new Error('Unable to access the local file for rename.');
          const existingTab = tabsRef.current.find(tab => tab.name === path);
          const content = existingTab ? await readWorkspaceTabContent(existingTab) : await readLocalFile(sourceHandle);
          const targetHandle = await parentHandle.getFileHandle(trimmed, { create: true });
          await writeLocalFile(targetHandle, content);
          await parentHandle.removeEntry(path.split('/').pop()!, { recursive: false });
          remapWorkspacePaths(path, nextPath, 'file');
          setRenamingNode(null);
          await syncLocalWorkspace(nextPath);
          return;
        }

        if (allFolderPaths.includes(nextPath) || tabs.some(tab => getParentPath(tab.name) === nextPath)) {
          setRenamingNode(null);
          return;
        }

        const sourceParentHandle = await getDirectoryHandleForPath(parentPath, true);
        const targetFolderHandle = await getDirectoryHandleForPath(nextPath, true);
        if (!sourceParentHandle || !targetFolderHandle) throw new Error('Unable to access the local folder for rename.');

        const folderPrefix = `${path}/`;
        const nextPrefix = `${nextPath}/`;
        const nestedFolders = allFolderPaths.filter(folder => folder.startsWith(folderPrefix)).sort((a, b) => a.length - b.length);
        for (const nestedFolder of nestedFolders) {
          const relative = nestedFolder.slice(folderPrefix.length);
          await getDirectoryHandleForPath(`${nextPrefix}${relative}`, true);
        }

        for (const tab of tabs.filter(entry => entry.name.startsWith(folderPrefix))) {
          const relativePath = tab.name.slice(folderPrefix.length);
          const targetParent = await getDirectoryHandleForPath(getParentPath(`${nextPrefix}${relativePath}`), true);
          if (!targetParent) continue;
          const targetFileHandle = await targetParent.getFileHandle(relativePath.split('/').pop()!, { create: true });
          await writeLocalFile(targetFileHandle, await readWorkspaceTabContent(tab));
        }

        await sourceParentHandle.removeEntry(path.split('/').pop()!, { recursive: true });
        remapWorkspacePaths(path, nextPath, 'folder');
        setRenamingNode(null);
        await syncLocalWorkspace(nextPath);
        return;
      } catch (error: any) {
        setWorkspaceNotice(error?.message || 'Unable to rename this item in the local workspace.');
        setRenamingNode(null);
        return;
      }
    }

    if (type === 'file') {
      if (tabs.some(tab => tab.name === nextPath && tab.name !== path)) {
        setRenamingNode(null);
        return;
      }

      setTabs(prev => prev.map(tab => {
        if (tab.name !== path) return tab;
        const newLang = resolveLanguageForName(nextPath);
        return {
          ...tab,
          name: nextPath,
          langId: newLang.id,
        };
      }));
      if (selectedDir === path) setSelectedDir(nextPath);
    } else {
      if (explicitFolders.includes(nextPath) || tabs.some(tab => getParentPath(tab.name) === nextPath)) {
        setRenamingNode(null);
        return;
      }

      const prefix = `${path}/`;
      const nextPrefix = `${nextPath}/`;

      setExplicitFolders(prev => prev.map(folder => {
        if (folder === path) return nextPath;
        if (folder.startsWith(prefix)) return `${nextPrefix}${folder.slice(prefix.length)}`;
        return folder;
      }));

      setExpandedDirs(prev => {
        const updated = new Set<string>();
        prev.forEach(folder => {
          if (folder === path) updated.add(nextPath);
          else if (folder.startsWith(prefix)) updated.add(`${nextPrefix}${folder.slice(prefix.length)}`);
          else updated.add(folder);
        });
        return updated;
      });

      setTabs(prev => prev.map(tab => {
        if (!tab.name.startsWith(prefix)) return tab;
        return {
          ...tab,
          name: `${nextPrefix}${tab.name.slice(prefix.length)}`,
        };
      }));

      if (selectedDir === path) setSelectedDir(nextPath);
      else if (selectedDir.startsWith(prefix)) setSelectedDir(`${nextPrefix}${selectedDir.slice(prefix.length)}`);
    }

    setRenamingNode(null);
  };

  const deleteExplorerNode = useCallback(async (path: string) => {
    if (workspaceMode === 'local' && workspaceRootRef.current) {
      try {
        const parentHandle = await getDirectoryHandleForPath(getParentPath(path), true);
        if (!parentHandle) throw new Error('Unable to access the local workspace item.');
        await parentHandle.removeEntry(path.split('/').pop()!, { recursive: isFolderPath(path) });
        await syncLocalWorkspace(getParentPath(path));
      } catch (error: any) {
        setWorkspaceNotice(error?.message || 'Unable to delete this item from the local workspace.');
      }
      return;
    }

    if (isFolderPath(path)) {
      removeWorkspaceEntries(
        tab => tab.name.startsWith(path + '/'),
        folder => folder === path || folder.startsWith(path + '/'),
      );
      return;
    }

    const targetTab = findExplorerFile(path);
    if (!targetTab) return;
    removeWorkspaceEntries(tab => tab.id === targetTab.id);
  }, [findExplorerFile, getDirectoryHandleForPath, isFolderPath, removeWorkspaceEntries, syncLocalWorkspace, workspaceMode]);

  const handleRun = useCallback(async () => {
    if (!activeTab || !activeTab.codeLoaded) return;
    setIsRunning(true);
    await new Promise(r => setTimeout(r, 200));
    const { logs, isHtml } = executeCode(activeLang, activeTab.code);
    if (isHtml) {
      const content = activeLang.id === 'css'
        ? `<html><body style="margin:0"><style>${activeTab.code}</style><div class="card">🎨</div></body></html>`
        : activeTab.code;
      setHtmlContent(content);
      setIsHtmlOutput(true);
      setOutput([]);
    } else {
      setIsHtmlOutput(false);
      setOutput(logs.length ? logs : ['✅ No output']);
    }
    // Automatically show bottom panel and switch to Console tab for logs
    setShowBottomPanel(true);
    setBottomPanelTab('console');
    setIsRunning(false);
  }, [activeLang, activeTab]);

  const copyConsoleOutput = useCallback(async () => {
    if (!output.length || typeof navigator === 'undefined' || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(output.join('\n'));
    } catch { }
  }, [output]);

  const saveToLocal = useCallback(async () => {
    if (!activeTab) return;
    try {
      const existingHandle = fileHandlesRef.current.get(activeTab.name);
      if (workspaceMode === 'local' && existingHandle) {
        await writeLocalFile(existingHandle, activeTab.code);
      } else if ('showSaveFilePicker' in window) {
        const h = await (window as any).showSaveFilePicker({ suggestedName: activeTab.name, types: [{ description: 'Code', accept: { 'text/plain': [`.${activeLang.ext}`] } }] });
        const w = await h.createWritable(); await w.write(activeTab.code); await w.close();
        fileHandlesRef.current.set(activeTab.name, h);
      } else {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([activeTab.code], { type: 'text/plain' }));
        a.download = activeTab.name; a.click();
      }
      setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, saved: true } : t));
    } catch { }
  }, [activeLang.ext, activeTab, activeTabId, workspaceMode, writeLocalFile]);

  const openFromLocal = async () => {
    try {
      let name = '', text = '', pickedPath = '';
      let pickedHandle: any = null;
      if ('showOpenFilePicker' in window) {
        const [h] = await (window as any).showOpenFilePicker({ types: [{ description: 'Code', accept: { 'text/plain': ['.js', '.jsx', '.ts', '.tsx', '.html', '.css', '.json', '.py', '.md', '.txt', '.php', '.yaml', '.yml', '.sh', '.env', '.sql', '.xml'] } }] });
        const file = await h.getFile(); text = await file.text(); name = file.name; pickedHandle = h;
      } else {
        await new Promise<void>((res) => {
          const inp = document.createElement('input'); inp.type = 'file';
          inp.onchange = async (e) => { const f = (e.target as HTMLInputElement).files?.[0]; if (f) { text = await f.text(); name = f.name; } res(); };
          inp.click();
        });
      }
      if (!name) return;
      const lang = resolveLanguageForName(name);
      const tab: FileTab = { id: makeid(), name, langId: lang.id, code: text, saved: true, codeLoaded: true };
      pickedPath = name;
      setTabs(prev => [...prev, tab]);
      setOpenTabIds(prev => prev.includes(tab.id) ? prev : [...prev, tab.id]);
      setActiveTabId(tab.id);
      if (pickedHandle) {
        fileHandlesRef.current.set(pickedPath, pickedHandle);
        setWorkspaceNotice('Opened a local file directly from this PC. It is not stored on our server.');
      }
    } catch { }
  };

  const copyCode = () => {
    if (!activeTab) return;
    navigator.clipboard.writeText(activeTab.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  /* keyboard shortcuts */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        openQuickOpen();
        return;
      }

      if (showQuickOpen && e.key === 'Escape') {
        e.preventDefault();
        closeQuickOpen();
        return;
      }

      const target = e.target as HTMLElement | null;
      const isTypingTarget = Boolean(
        target &&
        (
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable
        )
      );

      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); handleRun(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); saveToLocal(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') { e.preventDefault(); setActivityTab(p => p ? null : 'explorer'); }
      if ((e.ctrlKey || e.metaKey) && e.key === '`') {
        e.preventDefault();
        setBottomPanelTab('terminal');
        setShowBottomPanel(true);
      }

      if (isTypingTarget || activityTab !== 'explorer' || !selectedDir || creatingNode || editingTabId || renamingNode) return;

      if (e.key === 'F2') {
        e.preventDefault();
        startRenamingNode(selectedDir, isFolderPath(selectedDir) ? 'folder' : 'file');
      }

      if (e.key === 'Delete') {
        e.preventDefault();
        void deleteExplorerNode(selectedDir);
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        if (isFolderPath(selectedDir)) {
          toggleFolderOpen(selectedDir);
        } else {
          const targetTab = findExplorerFile(selectedDir);
          if (targetTab) void openEditorTab(targetTab.id);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activityTab, closeQuickOpen, creatingNode, deleteExplorerNode, editingTabId, findExplorerFile, handleRun, isFolderPath, openEditorTab, openQuickOpen, renamingNode, saveToLocal, selectedDir, showQuickOpen, toggleFolderOpen]);

  const updateTerminalSession = useCallback((sessionId: string, updater: (session: TerminalSession) => TerminalSession) => {
    setTerminalSessions(prev => prev.map(session => session.id === sessionId ? updater(session) : session));
  }, []);

  const createTerminalSessionAction = () => {
    const session = makeTerminalSession(terminalSessions.length + 1);
    setTerminalSessions(prev => [...prev, session]);
    setActiveTerminalId(session.id);
    setShowBottomPanel(true);
    setBottomPanelTab('terminal');
  };

  const removeTerminalSession = (sessionId: string) => {
    setTerminalSessions(prev => {
      const filtered = prev.filter(session => session.id !== sessionId);
      if (filtered.length === 0) {
        const fallback = makeTerminalSession(1);
        setActiveTerminalId(fallback.id);
        return [fallback];
      }

      if (sessionId === activeTerminalId) {
        const previousIndex = prev.findIndex(session => session.id === sessionId);
        const nextSession = filtered[Math.min(previousIndex, filtered.length - 1)] ?? filtered[0];
        if (nextSession) setActiveTerminalId(nextSession.id);
      }

      return filtered;
    });
  };

  const buildAIUserMessage = useCallback((prompt: string, action: 'chat' | 'analyze' | 'fix') => {
    const sections = [prompt.trim()];

    if (aiIncludeFile && activeTab) {
      sections.push([
        `Active file: ${activeTab.name}`,
        `Language: ${activeLang.label}`,
        'Code:',
        activeTab.code || '// Empty file',
      ].join('\n'));
    }

    if (aiIncludeConsole && output.length) {
      sections.push([
        'Console / output context:',
        output.join('\n'),
      ].join('\n'));
    }

    if (action === 'fix' && !output.length) {
      sections.push('There is no current console output. Infer likely fixes from the file itself and note that runtime output was not provided.');
    }

    return sections.filter(Boolean).join('\n\n---\n\n');
  }, [activeLang.label, activeTab, aiIncludeConsole, aiIncludeFile, output]);

  const submitAIRequest = useCallback(async (promptOverride?: string, action: 'chat' | 'analyze' | 'fix' = 'chat') => {
    const basePrompt = (promptOverride ?? aiInput).trim();
    if (!basePrompt) return;

    if (!aiApiKey.trim()) {
      setAiError('Add your OpenAI or Gemini API key to use Forge AI.');
      setShowBottomPanel(true);
      setBottomPanelTab('ai');
      return;
    }

    const visibleUserMessage: ForgeAIMessage = {
      id: makeid(),
      role: 'user',
      content: basePrompt,
      kind: action,
    };
    const pendingId = makeid();
    const pendingMessage: ForgeAIMessage = {
      id: pendingId,
      role: 'assistant',
      content: 'Thinking through the active workspace...',
      pending: true,
      kind: action,
    };

    const systemPrompt = [
      'You are Forge AI, a senior software engineering assistant embedded inside a browser IDE.',
      'Be practical, structured, and concise.',
      'When reviewing code, prioritize bugs, regressions, missing validations, UX issues, and concrete next edits.',
      'When asked to fix errors, return the likely root cause first, then specific code changes.',
    ].join(' ');

    const requestMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...aiMessages
        .filter(message => !message.pending && message.role !== 'system')
        .slice(-8)
        .map(message => ({ role: message.role, content: message.content })),
      { role: 'user' as const, content: buildAIUserMessage(basePrompt, action) },
    ];

    setAiError('');
    setAiSubmitting(true);
    setAiMessages(prev => [...prev, visibleUserMessage, pendingMessage]);
    if (!promptOverride) setAiInput('');

    try {
      const response = await fetch('/api/tools/forge-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: aiProvider,
          apiKey: aiApiKey,
          model: aiModel,
          messages: requestMessages,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || 'Forge AI request failed.');
      }

      setAiMessages(prev => prev.map(message => (
        message.id === pendingId
          ? { ...message, pending: false, content: payload.message || 'No response returned.' }
          : message
      )));
    } catch (error: any) {
      const message = error?.message || 'Unable to reach Forge AI right now.';
      setAiError(message);
      setAiMessages(prev => prev.map(entry => (
        entry.id === pendingId
          ? { ...entry, pending: false, content: `Request failed: ${message}` }
          : entry
      )));
    } finally {
      setAiSubmitting(false);
    }
  }, [aiApiKey, aiInput, aiMessages, aiModel, aiProvider, buildAIUserMessage]);

  const handleTerminalInput = async (sessionId: string, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
    const session = terminalSessions.find(entry => entry.id === sessionId);
    if (!session) return;

    const cmdStr = session.input.trim();
    if (!cmdStr) return;
    updateTerminalSession(sessionId, current => ({ ...current, input: '' }));
    
    const resolvePath = (p: string) => {
      if (!p) return session.cwd;
      if (p === '/') return '';
      let curr = p.startsWith('/') ? '' : session.cwd;
      const parts = p.split('/');
      for (const part of parts) {
        if (!part || part === '.') continue;
        if (part === '..') {
          curr = curr.includes('/') ? curr.substring(0, curr.lastIndexOf('/')) : '';
        } else {
          curr = curr ? `${curr}/${part}` : part;
        }
      }
      return curr;
    };

    const args = cmdStr.split(/\s+/);
    const cmd = args[0];
    const rawArg = cmdStr.substring(cmd.length).trim();
    let res: string | string[] = '';
    let nextCwd = session.cwd;
    
    if (cmd === 'help') {
      res = [
        `Commands for ${session.title}: clear, pwd, ls, cd, mkdir, touch, rm, cat, run, echo, date`,
        'Tip: each terminal session keeps its own cwd and draft input.',
      ];
    } 
    else if (cmd === 'clear') {
      updateTerminalSession(sessionId, current => ({ ...current, lines: [] }));
      return;
    }
    else if (cmd === 'pwd') { res = `/${session.cwd}`; }
    else if (cmd === 'ls') {
      const target = resolvePath(args[1] || '');
      const folderSet = new Set<string>();
      explicitFolders.forEach(f => {
        if (f !== target && (target === '' ? !f.includes('/') : f.startsWith(target + '/'))) {
          const sub = target === '' ? f : f.substring(target.length + 1);
          folderSet.add(sub.split('/')[0] + (sub.includes('/') ? '/' : ''));
        }
      });
      tabs.forEach(t => {
        const tPath = t.name;
        if (target === '' ? !tPath.includes('/') : tPath.startsWith(target + '/')) {
          const sub = target === '' ? tPath : tPath.substring(target.length + 1);
          if (sub) folderSet.add(sub.split('/')[0] + (sub.includes('/') ? '/' : ''));
        }
      });
      res = Array.from(folderSet).sort().join('  ');
    }
    else if (cmd === 'cd') {
      const target = resolvePath(args[1] || '/');
      if (target === '') {
        nextCwd = '';
        res = '/';
      }
      else {
        const exists = explicitFolders.includes(target) || tabs.some(t => t.name.startsWith(target + '/'));
        if (exists) {
          nextCwd = target;
          res = `moved to /${target}`;
        }
        else res = `cd: ${args[1]}: No such directory`;
      }
    }
    else if (cmd === 'mkdir') {
      if (!args[1]) res = 'mkdir: missing operand';
      else {
        const target = resolvePath(args[1]);
        if (!explicitFolders.includes(target) && !tabs.some(t => t.name.startsWith(target + '/'))) {
          setExplicitFolders(prev => [...prev, target]);
          res = `created directory /${target}`;
        } else { res = `mkdir: cannot create directory '${args[1]}': File exists`; }
      }
    }
    else if (cmd === 'touch') {
      if (!args[1]) res = 'touch: missing file operand';
      else {
        const target = resolvePath(args[1]);
        if (!tabs.find(t => t.name === target)) {
          const newLang = resolveLanguageForName(target);
          const tab: FileTab = { id: makeid(), name: target, langId: newLang.id, code: getInitialCodeForFile(target), saved: true, codeLoaded: true };
          setTabs(prev => [...prev, tab]);
          setOpenTabIds(prev => prev.includes(tab.id) ? prev : [...prev, tab.id]);
          setActiveTabId(tab.id);
          res = `created file /${target}`;
        } else {
          res = `touch: ${args[1]}: File already exists`;
        }
      }
    }
    else if (cmd === 'rm') {
      const isRecursive = args[1] === '-r' || args[1] === '-rf';
      const targetArg = isRecursive ? args[2] : args[1];
      if (!targetArg) res = 'rm: missing operand';
      else {
        const target = resolvePath(targetArg);
        const exactTab = tabs.find(t => t.name === target);
        if (exactTab) {
          removeWorkspaceEntries(tab => tab.id === exactTab.id);
          res = `removed file /${target}`;
        } else if (isRecursive) {
          removeWorkspaceEntries(
            tab => tab.name.startsWith(target + '/'),
            folder => folder === target || folder.startsWith(target + '/'),
          );
          res = `removed directory /${target}`;
        } else { res = `rm: cannot remove '${targetArg}': No such file or (use -r to remove directories)`; }
      }
    }
    else if (cmd === 'cat') {
      if (!args[1]) res = 'cat: missing operand';
      else {
        const target = resolvePath(args[1]);
        const tab = tabs.find(t => t.name === target);
        if (tab) {
          if (workspaceMode === 'local' && !tab.codeLoaded) {
            const fileHandle = fileHandlesRef.current.get(tab.name);
            if (fileHandle) {
              const content = await readLocalFile(fileHandle);
              res = content.split('\n');
            } else {
              res = tab.code.split('\n');
            }
          } else {
            res = tab.code.split('\n');
          }
        }
        else res = `cat: ${args[1]}: No such file or directory`;
      }
    }
    else if (cmd === 'run' || cmd === 'node' || cmd === 'python') {
       const targetArg = (cmd !== 'run') ? args[1] : (args[1] || '');
       if (targetArg) {
         const target = resolvePath(targetArg);
         const tab = tabs.find(t => t.name === target);
         if (tab) {
           await openEditorTab(tab.id);
           setTimeout(() => handleRun(), 50);
           res = `→ Executing ${targetArg}…`;
         } else { res = `${cmd}: can't open file '${targetArg}': [Errno 2] No such file or directory`; }
       } else {
         if (cmd === 'run') { handleRun(); res = '→ Running code…'; }
         else { res = `${cmd}: Please specify a file`; }
       }
    }
    else if (cmd === 'echo') res = rawArg;
    else if (cmd === 'date') res = new Date().toString();
    else res = `bash: ${cmd}: command not found`;
    
    updateTerminalSession(sessionId, current => {
      const newLines = [...current.lines, `lms@browser:/${session.cwd}$ ${cmdStr}`];
      if (Array.isArray(res)) newLines.push(...res);
      else if (res) newLines.push(res);
      return {
        ...current,
        cwd: nextCwd,
        lines: newLines,
      };
    });
  };

  const handleAnalyzeCurrentFile = () => {
    const fileLabel = activeTab?.name || 'the current workspace';
    void submitAIRequest(
      `Analyze ${fileLabel}. Explain what it does, point out bugs or risks, and recommend the highest-impact improvements first.`,
      'analyze',
    );
  };

  const handleFixErrors = () => {
    const fileLabel = activeTab?.name || 'the current workspace';
    void submitAIRequest(
      `Help me fix issues in ${fileLabel}. Use the current code and any console output to identify the root cause, suggest edits, and provide corrected code snippets where useful.`,
      'fix',
    );
  };

  const clearAIConversation = () => {
    setAiMessages([makeWelcomeAIMessage()]);
    setAiError('');
    setAiInput('');
  };

  /* Activity sidebar width */
  const sidebarOpen = activityTab !== null;

  const barBg = isDark ? '#161b22' : '#f3f3f3';
  const border = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.12)';
  const textMain = isDark ? '#e6edf3' : '#1f2328';
  const textMuted = isDark ? '#7d8590' : '#656d76';

  const allFolderPaths = useMemo(() => {
    const folderSet = new Set<string>(explicitFolders);
    tabs.forEach(tab => {
      const parts = tab.name.split('/');
      parts.pop();
      let current = '';
      parts.forEach(part => {
        current = current ? `${current}/${part}` : part;
        folderSet.add(current);
      });
    });
    return Array.from(folderSet).sort();
  }, [explicitFolders, tabs]);

  const getVisibleNodes = () => {
    const nodes: { type: 'folder' | 'file'; path: string; name: string; level: number; tab?: FileTab }[] = [];
    const query = explorerFilter.trim().toLowerCase();
    const hasFilter = Boolean(query);
    const matchesQuery = (value: string) => value.toLowerCase().includes(query);
    const folderHasMatch = (folderPath: string) => {
      if (!hasFilter) return true;
      const folderName = folderPath.split('/').pop() || folderPath;
      if (matchesQuery(folderName) || matchesQuery(folderPath)) return true;
      return tabs.some(tab => tab.name.startsWith(folderPath + '/') && matchesQuery(tab.name));
    };

    const buildNode = (currentPath: string, level: number) => {
      const childFolders = allFolderPaths
        .filter(f => {
          const up = f.substring(0, f.lastIndexOf('/'));
          const isDirectChild = currentPath === '' ? !f.includes('/') : (up === currentPath && f !== currentPath);
          return isDirectChild && folderHasMatch(f);
        })
        .sort();
      
      const childFiles = tabs
        .filter(t => {
          const up = t.name.substring(0, t.name.lastIndexOf('/'));
          const isDirectChild = currentPath === '' ? !t.name.includes('/') : up === currentPath;
          return isDirectChild && (!hasFilter || matchesQuery(t.name) || matchesQuery(t.name.split('/').pop() || t.name));
        })
        .sort((a,b) => a.name.localeCompare(b.name));

      childFolders.forEach(f => {
        const fName = f.split('/').pop()!;
        nodes.push({ type: 'folder', path: f, name: fName, level });
        if (hasFilter || expandedDirs.has(f)) buildNode(f, level + 1);
      });

      if (creatingNode && creatingNode.parent === currentPath) {
        nodes.push({ type: creatingNode.type, path: '@@creating@@', name: '', level, tab: undefined });
      }

      childFiles.forEach(t => {
        const tName = t.name.split('/').pop()!;
        nodes.push({ type: 'file', path: t.name, name: tName, level, tab: t });
      });
    };

    buildNode('', 0);
    return nodes;
  };

  const visibleNodes = activityTab === 'explorer' ? getVisibleNodes() : [];

  const submitCreateNode = async () => {
    if (!newNodeName.trim() || !creatingNode) {
      setCreatingNode(null);
      return;
    }
    const name = newNodeName.trim();
    const fullPath = creatingNode.parent ? `${creatingNode.parent}/${name}` : name;
    
    if (workspaceMode === 'local' && workspaceRootRef.current) {
      try {
        const parentHandle = await getDirectoryHandleForPath(creatingNode.parent, true);
        if (!parentHandle) throw new Error('Unable to access the selected local folder.');

        if (creatingNode.type === 'folder') {
          await parentHandle.getDirectoryHandle(name, { create: true });
        } else {
          const fileHandle = await parentHandle.getFileHandle(name, { create: true });
          const initialCode = getInitialCodeForFile(fullPath);
          await writeLocalFile(fileHandle, initialCode);
        }

        await syncLocalWorkspace(fullPath);
      } catch (error: any) {
        setWorkspaceNotice(error?.message || 'Unable to create this item in the local workspace.');
      }
    } else if (creatingNode.type === 'folder') {
      if (!explicitFolders.includes(fullPath)) {
        setExplicitFolders(prev => [...prev, fullPath]);
        setExpandedDirs(prev => new Set(prev).add(fullPath));
      }
    } else {
      const newLang = resolveLanguageForName(fullPath);
      const tab: FileTab = { id: makeid(), name: fullPath, langId: newLang.id, code: getInitialCodeForFile(fullPath), saved: true, codeLoaded: true };
      setTabs(prev => [...prev, tab]);
      setOpenTabIds(prev => prev.includes(tab.id) ? prev : [...prev, tab.id]);
      setActiveTabId(tab.id);
    }
    setCreatingNode(null);
    setNewNodeName('');
  };

  const explorerLocation = selectedDir ? (isFolderPath(selectedDir) ? selectedDir : getParentPath(selectedDir)) : '';
  const explorerCrumbs = explorerLocation
    ? explorerLocation.split('/').filter(Boolean).map((segment, index, arr) => ({
        label: segment,
        path: arr.slice(0, index + 1).join('/'),
      }))
    : [];
  const explorerStats = {
    files: tabs.length,
    folders: allFolderPaths.length,
  };

  const moveExplorerNode = useCallback(async (sourcePath: string, destinationFolder: string) => {
    if (!sourcePath) return;
    const sourceIsFolder = isFolderPath(sourcePath);
    const sourceName = sourcePath.split('/').pop() || sourcePath;
    const nextPath = destinationFolder ? `${destinationFolder}/${sourceName}` : sourceName;

    if (nextPath === sourcePath) return;
    if (sourceIsFolder && (destinationFolder === sourcePath || destinationFolder.startsWith(sourcePath + '/'))) return;

    const destinationOccupied = sourceIsFolder
      ? allFolderPaths.includes(nextPath) || tabs.some(tab => getParentPath(tab.name) === nextPath)
      : tabs.some(tab => tab.name === nextPath);

    if (destinationOccupied) return;

    if (workspaceMode === 'local' && workspaceRootRef.current) {
      try {
        if (sourceIsFolder) {
          const sourceParentHandle = await getDirectoryHandleForPath(getParentPath(sourcePath), true);
          const targetFolderHandle = await getDirectoryHandleForPath(nextPath, true);
          if (!sourceParentHandle || !targetFolderHandle) throw new Error('Unable to move this local folder.');

          const folderPrefix = `${sourcePath}/`;
          const nextPrefix = `${nextPath}/`;
          const nestedFolders = allFolderPaths.filter(folder => folder.startsWith(folderPrefix)).sort((a, b) => a.length - b.length);
          for (const nestedFolder of nestedFolders) {
            const relative = nestedFolder.slice(folderPrefix.length);
            await getDirectoryHandleForPath(`${nextPrefix}${relative}`, true);
          }

          for (const tab of tabs.filter(entry => entry.name.startsWith(folderPrefix))) {
            const relativePath = tab.name.slice(folderPrefix.length);
            const targetParent = await getDirectoryHandleForPath(getParentPath(`${nextPrefix}${relativePath}`), true);
            if (!targetParent) continue;
            const targetFileHandle = await targetParent.getFileHandle(relativePath.split('/').pop()!, { create: true });
            await writeLocalFile(targetFileHandle, await readWorkspaceTabContent(tab));
          }

          await sourceParentHandle.removeEntry(sourcePath.split('/').pop()!, { recursive: true });
          remapWorkspacePaths(sourcePath, nextPath, 'folder');
          await syncLocalWorkspace(nextPath);
          return;
        }

        const sourceHandle = fileHandlesRef.current.get(sourcePath);
        const targetParent = await getDirectoryHandleForPath(destinationFolder, true);
        const sourceParent = await getDirectoryHandleForPath(getParentPath(sourcePath), true);
        if (!sourceHandle || !targetParent || !sourceParent) throw new Error('Unable to move this local file.');
        const existingTab = tabsRef.current.find(tab => tab.name === sourcePath);
        const content = existingTab ? await readWorkspaceTabContent(existingTab) : await readLocalFile(sourceHandle);
        const targetHandle = await targetParent.getFileHandle(sourceName, { create: true });
        await writeLocalFile(targetHandle, content);
        await sourceParent.removeEntry(sourceName, { recursive: false });
        remapWorkspacePaths(sourcePath, nextPath, 'file');
        await syncLocalWorkspace(nextPath);
      } catch (error: any) {
        setWorkspaceNotice(error?.message || 'Unable to move this item in the local workspace.');
      }
      return;
    }

    if (sourceIsFolder) {
      const prefix = `${sourcePath}/`;
      const nextPrefix = `${nextPath}/`;

      setExplicitFolders(prev => prev.map(folder => {
        if (folder === sourcePath) return nextPath;
        if (folder.startsWith(prefix)) return `${nextPrefix}${folder.slice(prefix.length)}`;
        return folder;
      }));

      setExpandedDirs(prev => {
        const next = new Set<string>();
        prev.forEach(folder => {
          if (folder === sourcePath) next.add(nextPath);
          else if (folder.startsWith(prefix)) next.add(`${nextPrefix}${folder.slice(prefix.length)}`);
          else next.add(folder);
        });
        return next;
      });

      setTabs(prev => prev.map(tab => {
        if (!tab.name.startsWith(prefix)) return tab;
        return { ...tab, name: `${nextPrefix}${tab.name.slice(prefix.length)}` };
      }));

      if (selectedDir === sourcePath) setSelectedDir(nextPath);
      else if (selectedDir.startsWith(prefix)) setSelectedDir(`${nextPrefix}${selectedDir.slice(prefix.length)}`);
      if (renamingNode?.path === sourcePath || renamingNode?.path.startsWith(prefix)) setRenamingNode(null);
      setExpandedDirs(prev => new Set(prev).add(destinationFolder));
      return;
    }

    setTabs(prev => prev.map(tab => {
      if (tab.name !== sourcePath) return tab;
      return { ...tab, name: nextPath };
    }));
    if (selectedDir === sourcePath) setSelectedDir(nextPath);
    if (renamingNode?.path === sourcePath) setRenamingNode(null);
    if (destinationFolder) setExpandedDirs(prev => new Set(prev).add(destinationFolder));
  }, [allFolderPaths, getDirectoryHandleForPath, isFolderPath, readLocalFile, readWorkspaceTabContent, remapWorkspacePaths, renamingNode?.path, selectedDir, syncLocalWorkspace, tabs, workspaceMode, writeLocalFile]);

  const renderEditorPane = (tab: FileTab | null, mode: 'primary' | 'secondary') => {
    if (!tab) return null;
    const language = resolveLanguageForName(tab.name);
    const isPaneActive = mode === 'primary' ? activeTabId === tab.id : secondaryTabId === tab.id;

    return (
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden" style={{ background: isDark ? '#0d1117' : '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '8px 12px', borderBottom: `1px solid ${border}`, background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(248,250,252,0.85)' }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              {mode === 'primary' ? 'Primary Editor' : 'Split Editor'}
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: textMain, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {tab.name}
            </div>
          </div>
          <div className="flex items-center gap-2" style={{ flexShrink: 0 }}>
            {!tab.saved && (
              <span style={{ fontSize: 10, fontWeight: 700, color: '#f59e0b', padding: '4px 8px', borderRadius: 999, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.24)' }}>
                Unsaved
              </span>
            )}
            {mode === 'secondary' && (
              <button
                type="button"
                onClick={() => {
                  setPanelMode('editor');
                  setSecondaryTabId(null);
                }}
                style={{ fontSize: 10, fontWeight: 700, color: textMuted, background: 'transparent', border: `1px solid ${border}`, borderRadius: 999, padding: '4px 8px', cursor: 'pointer' }}
              >
                Close Split
              </button>
            )}
            {mode === 'primary' && panelMode === 'split' && openTabs.length > 1 && (
              <button
                type="button"
                onClick={() => {
                  const fallback = openTabs.find(candidate => candidate.id !== tab.id);
                  if (fallback) void openSplitWithTab(fallback.id);
                }}
                style={{ fontSize: 10, fontWeight: 700, color: textMuted, background: 'transparent', border: `1px solid ${border}`, borderRadius: 999, padding: '4px 8px', cursor: 'pointer' }}
              >
                Swap Split
              </button>
            )}
          </div>
        </div>
        {!tab.codeLoaded ? (
          <div className="flex h-full flex-col items-center justify-center gap-3" style={{ background: isDark ? '#111827' : '#f8fafc' }}>
            <RefreshCw className="animate-spin" style={{ width: 20, height: 20, color: '#7c3aed' }} />
            <div style={{ fontSize: 14, fontWeight: 700, color: textMain }}>Opening {tab.name.split('/').pop() || tab.name}…</div>
            <div style={{ fontSize: 12, color: textMuted, maxWidth: 320, textAlign: 'center' }}>
              Loading file contents from your local workspace so editing stays on this device.
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, overflow: 'hidden', position: 'relative', outline: 'none' }}>
            <Editor
              height="100%"
              theme={settings.theme}
              language={language.monaco}
              value={tab.code}
              onChange={(value) => updateCode(value ?? '', tab.id)}
              onMount={(editor) => {
                if (mode === 'primary') {
                  editorRef.current = editor;
                  editor.focus();
                }
              }}
              options={{
                minimap: { enabled: settings.minimap && mode === 'primary' },
                fontSize: settings.fontSize,
                tabSize: settings.tabSize,
                lineNumbers: settings.lineNumbers ? 'on' : 'off',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                wordWrap: settings.wordWrap ? 'on' : 'off',
                cursorBlinking: 'blink',
                cursorStyle: 'line',
                smoothScrolling: true,
                padding: { top: 16, bottom: 16 },
                renderLineHighlight: isPaneActive ? 'all' : 'gutter',
                bracketPairColorization: { enabled: settings.bracketPairs },
                renderWhitespace: settings.renderWhitespace ? 'all' : 'none',
                scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
                breadcrumbs: { enabled: false },
                glyphMargin: false,
                folding: true,
                lineDecorationsWidth: 0,
                lineNumbersMinChars: 3,
              }}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`flex flex-col overflow-hidden ${isFullFrame ? 'fixed inset-0 z-[9999999] h-screen w-screen' : 'h-full flex-1 min-h-[500px]'}`} 
      style={{ background: isDark ? '#0d1117' : '#ffffff', color: textMain, fontFamily: 'system-ui, sans-serif', position: isFullFrame ? 'fixed' : 'relative' }}>

      {/* ══ TITLE BAR ══ */}
      <div className="flex items-center gap-2 px-4 shrink-0 z-[101] select-none" style={{ height: 48, background: barBg, borderBottom: `1px solid ${border}` }}>
        {/* Logo */}
        <div className="flex items-center gap-2 mr-3">
          <div className="w-6 h-6 rounded bg-violet-600 flex items-center justify-center">
            <Code2 style={{ width: 14, height: 14, color: 'white' }} />
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.1em' }} className="hidden sm:block">Forge IDE</span>
        </div>

        {/* Menu items */}
        {['File', 'Edit', 'View', 'Run', 'Help'].map(m => (
          <button key={m} style={{ fontSize: 12, color: textMuted, padding: '4px 8px', borderRadius: 4, background: 'transparent', border: 'none', cursor: 'pointer' }}
            className="hover:bg-white/10 transition-colors">{m}</button>
        ))}

        {/* File actions */}
        <div className="flex items-center gap-1 ml-4">
          {[
            { icon: FolderOpen, label: workspaceBusy ? 'Opening…' : 'Folder', title: 'Open local folder', fn: () => void openLocalWorkspace(), disabled: workspaceBusy },
            { icon: FolderOpen, label: 'Open', title: 'Open file (Ctrl+O)', fn: openFromLocal, disabled: false },
            { icon: Save, label: 'Save', title: 'Save (Ctrl+S)', fn: saveToLocal, disabled: false },
            { icon: copied ? Check : Copy, label: copied ? 'Copied' : 'Copy', title: 'Copy code', fn: copyCode, disabled: false },
          ].map(({ icon: Icon, label, title, fn, disabled }) => (
            <button key={label} onClick={fn} title={title} disabled={disabled}
              className="flex items-center gap-1.5 transition-colors hover:bg-white/10 rounded"
              style={{ fontSize: 11, fontWeight: 600, color: copied && label === 'Copied' ? '#3fb950' : textMuted, padding: '4px 8px', background: 'transparent', border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.65 : 1 }}>
              <Icon style={{ width: 13, height: 13 }} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        <div style={{ width: 1, height: 20, background: border, margin: '0 8px' }} />

        {/* View mode */}
        <div className="flex items-center gap-0.5" style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderRadius: 8, padding: 3 }}>
          <button onClick={() => {
            if (showBottomPanel && bottomPanelTab === 'terminal') setShowBottomPanel(false);
            else {
              setShowBottomPanel(true);
              setBottomPanelTab('terminal');
            }
          }}
            style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '3px 8px', borderRadius: 6, border: 'none', cursor: 'pointer', background: showBottomPanel && bottomPanelTab === 'terminal' ? 'rgba(124,58,237,0.2)' : 'transparent', color: showBottomPanel && bottomPanelTab === 'terminal' ? '#7c3aed' : textMuted, transition: 'all .15s' }}>
            Terminal
          </button>
          <button onClick={() => { setShowBottomPanel(true); setBottomPanelTab('ai'); }}
            style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '3px 8px', borderRadius: 6, border: 'none', cursor: 'pointer', background: showBottomPanel && bottomPanelTab === 'ai' ? 'rgba(124,58,237,0.2)' : 'transparent', color: showBottomPanel && bottomPanelTab === 'ai' ? '#7c3aed' : textMuted, transition: 'all .15s' }}>
            AI
          </button>
          <div style={{ width: 1, height: 12, background: border, margin: '0 4px' }} />
          <button onClick={() => setIsFullFrame(p => !p)}
            title={isFullFrame ? "Exit Full Frame" : "Full Frame Mode"}
            style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '3px 8px', borderRadius: 6, border: 'none', cursor: 'pointer', background: isFullFrame ? 'rgba(63,185,80,0.2)' : 'transparent', color: isFullFrame ? '#3fb950' : textMuted, transition: 'all .15s' }}>
            {isFullFrame ? 'Normal' : 'Full View'}
          </button>
          {activeTab && (
            <button
              onClick={() => {
                if (panelMode === 'split') {
                  setPanelMode('editor');
                  setSecondaryTabId(null);
                } else {
                  void openSplitWithTab(activeTab.id);
                }
              }}
              title={panelMode === 'split' ? 'Exit split view' : 'Open split view'}
              style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '3px 8px', borderRadius: 6, border: 'none', cursor: 'pointer', background: panelMode === 'split' ? 'rgba(14,165,233,0.2)' : 'transparent', color: panelMode === 'split' ? '#38bdf8' : textMuted, transition: 'all .15s' }}
            >
              {panelMode === 'split' ? 'Single' : 'Split'}
            </button>
          )}
        </div>

        {/* Live preview */}
        {isHtmlLang && (
          <button onClick={() => setLivePreview(p => !p)}
            style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 8, background: livePreview ? 'rgba(63,185,80,0.2)' : 'transparent', color: livePreview ? '#3fb950' : textMuted, border: livePreview ? '1px solid rgba(63,185,80,0.4)' : `1px solid ${border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Globe style={{ width: 12, height: 12 }} />Live
          </button>
        )}

        {/* Settings gear */}
        <div className="relative ml-auto" ref={settingsRef}>
          <button onClick={() => setShowSettings(p => !p)}
            style={{ padding: 6, borderRadius: 8, background: showSettings ? (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)') : 'transparent', border: 'none', cursor: 'pointer', color: textMuted, display: 'flex' }}>
            <Settings style={{ width: 16, height: 16 }} />
          </button>

          {showSettings && (
            <div style={{ position: 'absolute', right: 0, top: 36, width: 300, background: isDark ? '#21262d' : '#f6f8fa', border: `1px solid ${border}`, borderRadius: 12, padding: 16, boxShadow: '0 16px 40px rgba(0,0,0,0.4)', zIndex: 999 }}>
              <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: textMuted, marginBottom: 12 }}>Editor Settings</div>

              {/* Theme */}
              <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 13, color: textMain }}>Theme</label>
                <div className="flex gap-1">
                  {(['vs-dark', 'light'] as const).map(t => (
                    <button key={t} onClick={() => setSetting('theme', t)}
                      style={{ fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 8, background: settings.theme === t ? '#7c3aed' : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'), color: settings.theme === t ? 'white' : textMuted, border: 'none', cursor: 'pointer', transition: 'all .15s' }}>
                      {t === 'vs-dark' ? '🌙 Dark' : '☀️ Light'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font size */}
              <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 13, color: textMain }}>Font Size</label>
                <div className="flex items-center gap-2">
                  <button onClick={() => setSetting('fontSize', Math.max(10, settings.fontSize - 1))} style={{ width: 26, height: 26, borderRadius: 8, background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)', border: 'none', cursor: 'pointer', color: textMain, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus style={{ width: 12, height: 12 }} /></button>
                  <span style={{ fontSize: 13, fontWeight: 700, width: 28, textAlign: 'center', color: textMain }}>{settings.fontSize}</span>
                  <button onClick={() => setSetting('fontSize', Math.min(28, settings.fontSize + 1))} style={{ width: 26, height: 26, borderRadius: 8, background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)', border: 'none', cursor: 'pointer', color: textMain, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus style={{ width: 12, height: 12 }} /></button>
                </div>
              </div>

              {/* Tab size */}
              <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 13, color: textMain }}>Tab Size</label>
                <div className="flex gap-1">
                  {[2, 4].map(s => (
                    <button key={s} onClick={() => setSetting('tabSize', s)}
                      style={{ fontSize: 11, fontWeight: 700, padding: '3px 12px', borderRadius: 8, background: settings.tabSize === s ? '#7c3aed' : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'), color: settings.tabSize === s ? 'white' : textMuted, border: 'none', cursor: 'pointer' }}>
                      {s} spaces
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              {([
                { key: 'wordWrap', label: 'Word Wrap' },
                { key: 'minimap', label: 'Minimap' },
                { key: 'lineNumbers', label: 'Line Numbers' },
                { key: 'bracketPairs', label: 'Bracket Pair Colors' },
                { key: 'renderWhitespace', label: 'Show Whitespace' },
              ] as { key: keyof typeof defaultSettings; label: string }[]).map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between" style={{ marginBottom: 10 }}>
                  <label style={{ fontSize: 13, color: textMain }}>{label}</label>
                  <button onClick={() => setSetting(key, !settings[key] as any)}
                    style={{ width: 36, height: 20, borderRadius: 100, background: settings[key] ? '#7c3aed' : (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.15)'), border: 'none', cursor: 'pointer', position: 'relative', transition: 'background .2s', padding: 0 }}>
                    <div style={{ position: 'absolute', top: 2, left: settings[key] ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: 'white', transition: 'left .2s' }} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Run button */}
        <button onClick={handleRun} disabled={isRunning}
          className="flex items-center gap-2"
          style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '6px 16px', borderRadius: 10, background: 'linear-gradient(135deg,#16a34a,#059669)', color: 'white', border: 'none', cursor: isRunning ? 'not-allowed' : 'pointer', opacity: isRunning ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 4px 12px rgba(22,163,74,0.35)', whiteSpace: 'nowrap' }}>
          {isRunning ? <RefreshCw style={{ width: 13, height: 13, animation: 'spin 1s linear infinite' }} /> : <Play style={{ width: 13, height: 13 }} />}
          {isRunning ? 'Running…' : 'Run'}
          <kbd style={{ fontSize: 9, opacity: 0.65, background: 'rgba(255,255,255,0.2)', padding: '1px 5px', borderRadius: 4 }} className="hidden sm:inline">Ctrl+↵</kbd>
        </button>
      </div>

      {/* ══ MAIN BODY ══ */}
      <div className="flex flex-1 overflow-hidden min-h-0">

        {/* ── Activity Bar ── */}
        <div className="flex flex-col items-center py-2 gap-1 shrink-0" style={{ width: 48, background: isDark ? '#010409' : '#e8eaed', borderRight: `1px solid ${border}` }}>
          {[
            { id: 'explorer', icon: Files, title: 'Explorer (Ctrl+B)' },
            { id: 'search', icon: Search, title: 'Search' },
            { id: 'git', icon: GitBranch, title: 'Source Control' },
            { id: 'extensions', icon: Package, title: 'Extensions' },
          ].map(({ id, icon: Icon, title }) => (
            <button key={id} title={title} onClick={() => setActivityTab(activityTab === id as ActivityTab ? null : id as ActivityTab)}
              style={{ width: 36, height: 36, borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: activityTab === id ? (isDark ? '#e6edf3' : '#1f2328') : textMuted, borderLeft: activityTab === id ? '2px solid #7c3aed' : '2px solid transparent', transition: 'all .15s' }}
              className="hover:bg-white/10">
              <Icon style={{ width: 18, height: 18 }} />
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <button title="Settings" onClick={() => setShowSettings(p => !p)}
            style={{ width: 36, height: 36, borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: textMuted }}
            className="hover:bg-white/10">
            <Settings style={{ width: 18, height: 18 }} />
          </button>
        </div>

        {/* ── Sidebar panel ── */}
        {sidebarOpen && (
          <div className="flex flex-col shrink-0 overflow-hidden" style={{ width: sidebarWidth, background: isDark ? '#0d1117' : '#f6f8fa', borderRight: `1px solid ${border}` }}>
            <div style={{ padding: '10px 12px 6px', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: textMuted }}>{activityTab?.toUpperCase()}</div>

            {/* Explorer */}
            {activityTab === 'explorer' && (
              <div
                className="flex-1 overflow-y-auto relative"
                onMouseDown={(e) => { if (e.target === e.currentTarget) setSelectedDir(''); }}
                onDragOver={(e) => {
                  if (!draggingNodePath) return;
                  e.preventDefault();
                  setDragOverPath('');
                }}
                onDrop={(e) => {
                  if (!draggingNodePath) return;
                  e.preventDefault();
                  void moveExplorerNode(draggingNodePath, '');
                  setDraggingNodePath(null);
                  setDragOverPath('');
                }}
              >
                <div style={{ padding: '4px 0' }}>
                  <div style={{ padding: '4px 12px', fontSize: 11, fontWeight: 700, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div className="flex flex-col">
                      <span>Open Files</span>
                      <span style={{ fontSize: 9, color: workspaceMode === 'local' ? '#22c55e' : textMuted, letterSpacing: '0.12em' }}>
                        {workspaceMode === 'local' ? `Local · ${workspaceLabel}` : 'Browser Scratch'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button onClick={(e) => { e.stopPropagation(); void openLocalWorkspace(); }} disabled={workspaceBusy} title="Open local folder" style={{ background: 'none', border: 'none', cursor: workspaceBusy ? 'not-allowed' : 'pointer', color: workspaceMode === 'local' ? '#22c55e' : textMuted, opacity: workspaceBusy ? 0.65 : 1 }} className="hover:text-white transition-colors">
                        <FolderOpen style={{ width: 13, height: 13 }} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); if(selectedFolderPath) setExpandedDirs(prev => new Set(prev).add(selectedFolderPath)); setCreatingNode({ type: 'file', parent: selectedFolderPath }); setNewNodeName(''); }} title="New File" style={{ background: 'none', border: 'none', cursor: 'pointer', color: textMuted }} className="hover:text-white transition-colors">
                        <FilePlus style={{ width: 13, height: 13 }} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); if(selectedFolderPath) setExpandedDirs(prev => new Set(prev).add(selectedFolderPath)); setCreatingNode({ type: 'folder', parent: selectedFolderPath }); setNewNodeName(''); }} title="New Folder" style={{ background: 'none', border: 'none', cursor: 'pointer', color: textMuted }} className="hover:text-white transition-colors">
                        <FolderPlus style={{ width: 13, height: 13 }} />
                      </button>
                    </div>
                  </div>
                  <div style={{ padding: '0 12px 12px' }}>
                    <div style={{ marginBottom: 8, padding: '10px 10px', borderRadius: 12, background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.72)', border: `1px solid ${border}` }}>
                      <div style={{ fontSize: 10, fontWeight: 800, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 8 }}>Filter Files</div>
                      <div className="flex items-center gap-2">
                        <Search style={{ width: 13, height: 13, color: textMuted, flexShrink: 0 }} />
                        <input
                          value={explorerFilter}
                          onChange={(e) => setExplorerFilter(e.target.value)}
                          placeholder="Find files or folders..."
                          style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: textMain, fontSize: 12 }}
                        />
                        {explorerFilter && (
                          <button
                            type="button"
                            onClick={() => setExplorerFilter('')}
                            style={{ background: 'transparent', border: 'none', color: textMuted, cursor: 'pointer', padding: 0 }}
                          >
                            <X style={{ width: 12, height: 12 }} />
                          </button>
                        )}
                      </div>
                    </div>
                    {workspaceNotice && (
                      <div style={{ marginBottom: 8, padding: '10px 10px', borderRadius: 12, background: workspaceNotice.toLowerCase().includes('unable') ? (isDark ? 'rgba(239,68,68,0.12)' : 'rgba(254,226,226,0.9)') : (isDark ? 'rgba(34,197,94,0.12)' : 'rgba(220,252,231,0.95)'), border: `1px solid ${workspaceNotice.toLowerCase().includes('unable') ? 'rgba(239,68,68,0.24)' : 'rgba(34,197,94,0.22)'}` }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: workspaceNotice.toLowerCase().includes('unable') ? (isDark ? '#fecaca' : '#991b1b') : (isDark ? '#bbf7d0' : '#166534') }}>
                          {workspaceNotice}
                        </div>
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8, padding: '10px 10px', borderRadius: 12, background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.72)', border: `1px solid ${border}` }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 10, fontWeight: 800, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.14em' }}>Location</div>
                        <div className="flex items-center gap-1 flex-wrap" style={{ marginTop: 4 }}>
                          <button
                            type="button"
                            onClick={() => setSelectedDir('')}
                            style={{ fontSize: 11, fontWeight: explorerCrumbs.length ? 700 : 800, color: explorerCrumbs.length ? textMuted : textMain, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                          >
                            workspace
                          </button>
                          {explorerCrumbs.map((crumb, index) => (
                            <React.Fragment key={crumb.path}>
                              <ChevronRight style={{ width: 11, height: 11, color: textMuted }} />
                              <button
                                type="button"
                                onClick={() => setSelectedDir(crumb.path)}
                                style={{ fontSize: 11, fontWeight: index === explorerCrumbs.length - 1 ? 800 : 700, color: index === explorerCrumbs.length - 1 ? textMain : textMuted, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                              >
                                {crumb.label}
                              </button>
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                        {[
                          { label: 'Files', value: explorerStats.files },
                          { label: 'Folders', value: explorerStats.folders },
                        ].map(stat => (
                          <div key={stat.label} style={{ minWidth: 52, padding: '8px 10px', borderRadius: 10, background: isDark ? 'rgba(0,0,0,0.22)' : 'rgba(248,250,252,0.95)', border: `1px solid ${border}` }}>
                            <div style={{ fontSize: 9, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 800 }}>{stat.label}</div>
                            <div style={{ fontSize: 12, color: textMain, fontWeight: 800, marginTop: 2 }}>{stat.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      paddingBottom: 20,
                      minHeight: '100%',
                      width: '100%',
                      boxSizing: 'border-box',
                      background: draggingNodePath && dragOverPath === '' ? (isDark ? 'rgba(124,58,237,0.08)' : 'rgba(124,58,237,0.05)') : 'transparent',
                      borderTop: draggingNodePath && dragOverPath === '' ? '1px dashed rgba(124,58,237,0.5)' : '1px solid transparent',
                      position: 'relative',
                    }}
                    onMouseDown={(e) => { if (e.target === e.currentTarget) setSelectedDir(''); }}
                  >
                    {draggingNodePath && dragOverPath === '' && (
                      <div style={{ margin: '0 12px 8px', padding: '8px 10px', borderRadius: 10, background: isDark ? 'rgba(124,58,237,0.12)' : 'rgba(124,58,237,0.08)', border: '1px dashed rgba(124,58,237,0.45)', color: isDark ? '#d8b4fe' : '#6d28d9', fontSize: 11, fontWeight: 700 }}>
                        Drop here to move this item to the workspace root
                      </div>
                    )}
                    {visibleNodes.map((node) => {
                      if (node.path === '@@creating@@') {
                        return (
                          <div key="creating" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: `5px 12px 5px ${12 + node.level * 12}px`, background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
                            {creatingNode?.type === 'folder' ? (
                              <Folder style={{ width: 14, height: 14, color: '#dcb67a' }} fill="#dcb67a" />
                            ) : (
                              <File style={{ width: 14, height: 14, color: textMuted }} />
                            )}
                            <input 
                              ref={createInputRef}
                              value={newNodeName}
                              placeholder={creatingNode?.type === 'folder' ? 'Folder name' : 'File name.ext'}
                              onClick={(e) => e.stopPropagation()}
                              onChange={e => setNewNodeName(e.target.value)}
                              onKeyDown={e => { if(e.key==='Enter') submitCreateNode(); if(e.key==='Escape') setCreatingNode(null); }}
                              onBlur={submitCreateNode}
                              style={{ flex: 1, background: isDark ? '#0d1117' : '#ffffff', border: `1px solid ${border}`, borderRadius: 4, padding: '2px 6px', fontSize: 12, color: textMain, outline: 'none' }} />
                          </div>
                        );
                      }
                      const Icon = node.type === 'folder' ? (expandedDirs.has(node.path) ? ChevronDown : ChevronRight) : (node.tab ? (resolveLanguageForName(node.tab.name).icon as React.ElementType) || File : File);
                      const isSelected = selectedDir === node.path;
                      const isActive = activeTabId === node.tab?.id;
                      const isDropTarget = dragOverPath === node.path;
                      const isDirty = node.type === 'file' && node.tab ? !node.tab.saved : false;
                      const directFileCount = node.type === 'folder' ? tabs.filter(tab => getParentPath(tab.name) === node.path).length : 0;
                      return (
                        <div key={node.path} 
                          draggable={node.path !== '@@creating@@'}
                          onDragStart={(e) => {
                            e.dataTransfer.effectAllowed = 'move';
                            setDraggingNodePath(node.path);
                          }}
                          onDragEnd={() => {
                            setDraggingNodePath(null);
                            setDragOverPath('');
                          }}
                          onDragOver={(e) => {
                            if (!draggingNodePath) return;
                            if (node.type !== 'folder') return;
                            if (draggingNodePath === node.path || node.path.startsWith(draggingNodePath + '/')) return;
                            e.preventDefault();
                            setDragOverPath(node.path);
                          }}
                          onDragLeave={() => {
                            if (dragOverPath === node.path) setDragOverPath('');
                          }}
                          onDrop={(e) => {
                            if (!draggingNodePath || node.type !== 'folder') return;
                            e.preventDefault();
                            void moveExplorerNode(draggingNodePath, node.path);
                            setDraggingNodePath(null);
                            setDragOverPath('');
                          }}
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            if(node.type === 'folder') {
                              toggleFolderOpen(node.path);
                              setSelectedDir(node.path);
                            } else if(node.tab) {
                              void openEditorTab(node.tab.id);
                              setSelectedDir(node.path);
                            }
                          }}
                          onDoubleClick={(e) => {
                            if (node.type !== 'file') return;
                            e.stopPropagation();
                            startRenamingNode(node.path, 'file');
                          }}
                          onContextMenu={(e) => { 
                            e.preventDefault(); 
                            setSelectedDir(node.path);
                            setContextMenu({ id: node.tab?.id || '', x: e.clientX, y: e.clientY, isFolder: node.type === 'folder', path: node.path });
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: `4px 12px 4px ${12 + node.level * 12}px`,
                            background: isDropTarget ? (isDark ? 'rgba(6,182,212,0.12)' : 'rgba(6,182,212,0.08)') : isSelected ? 'rgba(124,58,237,0.1)' : 'transparent',
                            cursor: 'pointer',
                            transition: 'all .1s',
                            borderLeft: isActive ? '2px solid #7c3aed' : isDropTarget ? '2px solid #06b6d4' : '2px solid transparent',
                            borderTop: isDropTarget ? '1px solid rgba(6,182,212,0.5)' : '1px solid transparent',
                            borderBottom: isDropTarget ? '1px solid rgba(6,182,212,0.5)' : '1px solid transparent',
                            boxShadow: isDropTarget ? 'inset 0 0 0 1px rgba(6,182,212,0.18)' : 'none',
                            opacity: draggingNodePath === node.path ? 0.55 : 1,
                          }}
                          className="hover:bg-white/5 group">
                          <div style={{ width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Icon style={{ width: 14, height: 14, color: node.type === 'folder' ? '#dcb67a' : textMuted }} />
                          </div>
                          {renamingNode?.path === node.path ? (
                            <input
                              ref={renameInputRef}
                              value={editingName}
                              onClick={(e) => e.stopPropagation()}
                              onChange={e => setEditingName(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === 'Enter') void renameExplorerNode(node.path, node.type, editingName);
                                if (e.key === 'Escape') setRenamingNode(null);
                              }}
                              onBlur={() => void renameExplorerNode(node.path, node.type, editingName)}
                              style={{ flex: 1, background: isDark ? '#0d1117' : '#ffffff', border: `1px solid ${border}`, borderRadius: 4, padding: '2px 6px', fontSize: 12, color: textMain, outline: 'none' }}
                            />
                          ) : (
                            <span style={{ fontSize: 13, color: isActive ? textMain : textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{node.name}</span>
                          )}
                          <div className="ml-auto flex items-center gap-1.5">
                            {isDirty && (
                              <span
                                title="Unsaved changes"
                                style={{
                                  width: 7,
                                  height: 7,
                                  borderRadius: 999,
                                  background: '#f59e0b',
                                  boxShadow: '0 0 10px rgba(245,158,11,0.55)',
                                  flexShrink: 0,
                                }}
                              />
                            )}
                            {node.type === 'folder' && (
                              <span
                                className="group-hover:opacity-0"
                                style={{ fontSize: 10, color: textMuted, opacity: 0.7, transition: 'opacity .12s ease' }}
                              >
                                {directFileCount}
                              </span>
                            )}
                            {renamingNode?.path !== node.path && (
                              <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                {node.type === 'folder' && (
                                  <>
                                    <button
                                      type="button"
                                      title="New file in folder"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setExpandedDirs(prev => new Set(prev).add(node.path));
                                        setSelectedDir(node.path);
                                        setCreatingNode({ type: 'file', parent: node.path });
                                        setNewNodeName('');
                                      }}
                                      style={{ width: 20, height: 20, borderRadius: 6, background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', border: 'none', cursor: 'pointer', color: textMuted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                      className="hover:bg-violet-500/15 hover:text-violet-300"
                                    >
                                      <FilePlus style={{ width: 11, height: 11 }} />
                                    </button>
                                    <button
                                      type="button"
                                      title="New folder in folder"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setExpandedDirs(prev => new Set(prev).add(node.path));
                                        setSelectedDir(node.path);
                                        setCreatingNode({ type: 'folder', parent: node.path });
                                        setNewNodeName('');
                                      }}
                                      style={{ width: 20, height: 20, borderRadius: 6, background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', border: 'none', cursor: 'pointer', color: textMuted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                      className="hover:bg-violet-500/15 hover:text-violet-300"
                                    >
                                      <FolderPlus style={{ width: 11, height: 11 }} />
                                    </button>
                                  </>
                                )}
                                <button
                                  type="button"
                                  title="Rename"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    startRenamingNode(node.path, node.type);
                                  }}
                                  style={{ width: 20, height: 20, borderRadius: 6, background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', border: 'none', cursor: 'pointer', color: textMuted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                  className="hover:bg-cyan-500/15 hover:text-cyan-300"
                                >
                                  <Pencil style={{ width: 11, height: 11 }} />
                                </button>
                                <button
                                  type="button"
                                  title="Delete"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    void deleteExplorerNode(node.path);
                                  }}
                                  style={{ width: 20, height: 20, borderRadius: 6, background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', border: 'none', cursor: 'pointer', color: textMuted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                  className="hover:bg-red-500/15 hover:text-red-300"
                                >
                                  <Trash2 style={{ width: 11, height: 11 }} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                    );
                  })}
                  {!visibleNodes.length && (
                    <div style={{ padding: '18px 16px', color: textMuted, fontSize: 12 }}>
                      {explorerFilter
                        ? `No files or folders match "${explorerFilter}".`
                        : 'This workspace is empty. Create a file or folder to get started.'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

            {/* Search */}
            {activityTab === 'search' && (
              <div className="p-3">
                <input placeholder="Search in files…" style={{ width: '100%', padding: '6px 10px', borderRadius: 8, background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)', border: `1px solid ${border}`, color: textMain, fontSize: 12, outline: 'none' }} />
                <p style={{ fontSize: 11, color: textMuted, marginTop: 12 }}>Type to search across open tabs.</p>
              </div>
            )}

            {/* Git (Source Control placeholder) */}
            {activityTab === 'git' && (
              <div className="p-4 flex flex-col items-center justify-center h-full text-center gap-2">
                <GitBranch style={{ width: 48, height: 48, color: textMuted, opacity: 0.2 }} />
                <div style={{ fontSize: 13, fontWeight: 700, color: textMain }}>No source control providers registered.</div>
                <div style={{ fontSize: 11, color: textMuted, lineHeight: 1.6 }}>Open a folder or initialize a git repo to use Source Control.</div>
              </div>
            )}

            {/* Extensions */}
            {activityTab === 'extensions' && (
              <div className="flex flex-col overflow-hidden flex-1">
                <div className="p-2">
                  <input value={extSearch} onChange={e => setExtSearch(e.target.value)} placeholder="Search extensions…"
                    style={{ width: '100%', padding: '6px 10px', borderRadius: 8, background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)', border: `1px solid ${border}`, color: textMain, fontSize: 12, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div className="overflow-y-auto flex-1">
                  {EXTENSIONS.filter(e => !extSearch || e.name.toLowerCase().includes(extSearch.toLowerCase())).map(ext => (
                    <div key={ext.name} style={{ padding: '8px 12px', borderBottom: `1px solid ${border}` }}>
                      <div className="flex items-start gap-2">
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{ext.icon}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: textMain }}>{ext.name}</div>
                          <div style={{ fontSize: 10, color: textMuted }}>{ext.desc}</div>
                          <div style={{ fontSize: 10, color: textMuted }}>{ext.author}</div>
                        </div>
                      </div>
                      <button onClick={() => setInstalledExts(p => p.includes(ext.name) ? p.filter(n => n !== ext.name) : [...p, ext.name])}
                        style={{ marginTop: 6, fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 6, background: installedExts.includes(ext.name) ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)') : '#7c3aed', color: installedExts.includes(ext.name) ? textMuted : 'white', border: 'none', cursor: 'pointer' }}>
                        {installedExts.includes(ext.name) ? 'Uninstall' : 'Install'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {sidebarOpen && (
          <div
            onMouseDown={(e) => {
              e.preventDefault();
              sidebarResizeRef.current = { startX: e.clientX, startWidth: sidebarWidth };
              setIsResizingSidebar(true);
            }}
            onDoubleClick={() => setSidebarWidth(260)}
            style={{
              width: 6,
              cursor: 'col-resize',
              background: isResizingSidebar ? 'rgba(124,58,237,0.24)' : 'transparent',
              borderRight: `1px solid ${border}`,
              borderLeft: `1px solid ${border}`,
              transition: 'background .15s ease',
            }}
            className="hover:bg-violet-500/15"
            title="Drag to resize explorer"
          />
        )}

        {/* ── Main Workspace ── */}
        <div className="flex flex-col flex-1 overflow-hidden min-w-0">
          
          {/* Editor Header & Tabs */}
          <div className="flex items-end gap-0.5 px-2 pt-1 overflow-x-auto shrink-0 select-none" style={{ background: isDark ? '#0d1117' : '#ffffff', borderBottom: `1px solid ${border}`, minHeight: 40 }}>
            {openTabs.map(tab => {
              const lang = resolveLanguageForName(tab.name);
              const isActive = tab.id === activeTabId;
              const isDirty = !tab.saved;
              const isPinned = pinnedTabIds.includes(tab.id);
              const isSecondary = panelMode === 'split' && secondaryTabId === tab.id;
              return (
                <div key={tab.id} 
                  onClick={() => void openEditorTab(tab.id)}
                  onDoubleClick={() => { setEditingTabId(tab.id); setEditingName(tab.name.split('/').pop() || tab.name); }}
                  className="group flex items-center gap-2 flex-shrink-0"
                  style={{ padding: '8px 14px', borderRadius: '8px 8px 0 0', cursor: 'pointer', background: isActive ? (isDark ? '#1e2430' : '#ffffff') : isSecondary ? (isDark ? 'rgba(56,189,248,0.08)' : 'rgba(56,189,248,0.08)') : 'transparent', borderTop: `1px solid ${isActive || isSecondary ? border : 'transparent'}`, borderLeft: `1px solid ${isActive || isSecondary ? border : 'transparent'}`, borderRight: `1px solid ${isActive || isSecondary ? border : 'transparent'}`, borderBottom: isActive ? `1px solid ${isDark ? '#1e2430' : '#ffffff'}` : isSecondary ? `1px solid ${isDark ? 'rgba(56,189,248,0.2)' : 'rgba(56,189,248,0.2)'}` : 'none', marginBottom: -1, fontSize: 12, color: isActive ? textMain : textMuted, userSelect: 'none', whiteSpace: 'nowrap' }}>
                  <span style={{ width: 14, height: 14, display: 'flex' }}>
                    {(() => { const Icon = lang.icon as any; return <Icon style={{ width: 14, height: 14 }} />; })()}
                  </span>
                  {editingTabId === tab.id ? (
                    <input 
                      ref={renameInputRef}
                      value={editingName}
                      onChange={e => setEditingName(e.target.value)}
                      onKeyDown={e => { if(e.key==='Enter') renameTab(tab.id, editingName); if(e.key==='Escape') setEditingTabId(null); }}
                      onBlur={() => renameTab(tab.id, editingName)}
                      style={{ background: isDark ? '#0d1117' : '#ffffff', border: `1px solid ${border}`, borderRadius: 4, padding: '0 4px', fontSize: 12, color: textMain, outline: 'none' }} />
                  ) : (
                    <span style={{ fontWeight: isActive ? 600 : 400 }}>{tab.name.split('/').pop() || tab.name}</span>
                  )}
                  {isPinned && (
                    <Pin style={{ width: 11, height: 11, color: '#f59e0b', fill: '#f59e0b' }} />
                  )}
                  {isDirty && (
                    <span
                      title="Unsaved changes"
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 999,
                        background: '#f59e0b',
                        boxShadow: '0 0 10px rgba(245,158,11,0.6)',
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); togglePinnedTab(tab.id); }}
                    title={isPinned ? 'Unpin tab' : 'Pin tab'}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, borderRadius: 4 }}
                    className="opacity-0 group-hover:opacity-100 hover:bg-white/10 text-muted"
                  >
                    <Pin style={{ width: 11, height: 11, color: isPinned ? '#f59e0b' : textMuted }} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); void openSplitWithTab(tab.id); }}
                    title={isSecondary ? 'Shown in split view' : 'Open in split view'}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, borderRadius: 4 }}
                    className="opacity-0 group-hover:opacity-100 hover:bg-white/10 text-muted"
                  >
                    <Files style={{ width: 11, height: 11, color: isSecondary ? '#38bdf8' : textMuted }} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); closeEditorTab(tab.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, borderRadius: 4 }} className="opacity-0 group-hover:opacity-100 hover:bg-white/10 text-muted">
                    <X style={{ width: 12, height: 12 }} />
                  </button>
                </div>
              );
            })}
            <button onClick={() => addTab()} style={{ padding: '8px 12px', background: 'transparent', border: 'none', cursor: 'pointer', color: textMuted }} className="hover:text-white"><Plus style={{ width: 16, height: 16 }} /></button>
          </div>

          {/* Core editor + optional output */}
          <div className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden relative">
            <div className="flex flex-1 overflow-hidden min-h-0">
              {/* Editor Workspace */}
              <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden" style={{ borderRight: (panelMode === 'split') ? `1px solid ${border}` : 'none' }}>
                {activeTab ? (
                  <div className="flex h-full min-h-0 min-w-0 overflow-hidden">
                    {renderEditorPane(activeTab, 'primary')}
                    {panelMode === 'split' && secondaryTab && secondaryTab.id !== activeTab.id && (
                      <>
                        <div style={{ width: 1, background: border, flexShrink: 0 }} />
                        {renderEditorPane(secondaryTab, 'secondary')}
                      </>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center" style={{ background: isDark ? '#1e2430' : '#f8f9fa' }}>
                    <div className="w-20 h-20 rounded-full bg-violet-600/10 flex items-center justify-center mb-6"> <Terminal style={{ width: 42, height: 42, color: '#7c3aed' }} /> </div>
                    <h2 style={{ fontSize: 24, fontWeight: 800, color: textMain, marginBottom: 12 }}>No file open</h2>
                    <p style={{ fontSize: 14, color: textMuted, maxWidth: 300, marginBottom: 32, lineHeight: 1.6 }}>Create a new file or open one from the explorer to start coding in this premium environment.</p>
                    <div className="flex gap-3">
                      <button onClick={() => addTab()} style={{ padding: '10px 24px', borderRadius: 12, background: '#7c3aed', color: 'white', border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 16px rgba(124,58,237,0.3)' }} className="hover:scale-105 transition-transform active:scale-95"> New File </button>
                      <button onClick={() => setActivityTab('explorer')} style={{ padding: '10px 24px', borderRadius: 12, background: 'transparent', border: `1px solid ${border}`, color: textMain, fontSize: 14, fontWeight: 700, cursor: 'pointer' }} className="hover:bg-white/5"> Open Explorer </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
            {showBottomPanel && (
              <div className="flex flex-col shrink-0" style={{ height: bottomPanelHeight, background: isDark ? '#0a0d14' : '#f6f8fa', borderTop: `1px solid ${border}`, zIndex: 40 }}>
                {/* Panel Tabs */}
                <div className="flex items-center gap-4 px-4 shrink-0 select-none" style={{ height: 36, background: isDark ? '#161b22' : '#efefef', borderBottom: `1px solid ${border}` }}>
                  {[
                    { id: 'output', label: 'Output' },
                    { id: 'console', label: 'Console' },
                    { id: 'terminal', label: 'Terminal' },
                    { id: 'ai', label: 'AI' },
                  ].map(t => (
                    <button key={t.id} onClick={() => setBottomPanelTab(t.id as any)}
                      style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', height: '100%', borderBottom: bottomPanelTab === t.id ? '2px solid #7c3aed' : '2px solid transparent', color: bottomPanelTab === t.id ? textMain : textMuted, background: 'transparent', borderLeft: 'none', borderRight: 'none', borderTop: 'none', cursor: 'pointer', transition: 'all .15s' }}>
                      {t.label}
                    </button>
                  ))}
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                    {bottomPanelTab === 'output' && (
                      <button onClick={() => { setOutput([]); setIsHtmlOutput(false); }} title="Clear Console" style={{ background: 'none', border: 'none', cursor: 'pointer', color: textMuted }} className="hover:text-white"><Trash2 style={{ width: 14, height: 14 }} /></button>
                    )}
                    {bottomPanelTab === 'console' && (
                      <>
                        <button onClick={() => void copyConsoleOutput()} title="Copy console output" style={{ background: 'none', border: 'none', cursor: 'pointer', color: textMuted }} className="hover:text-white">
                          <Copy style={{ width: 14, height: 14 }} />
                        </button>
                        <button onClick={() => setOutput([])} title="Clear console output" style={{ background: 'none', border: 'none', cursor: 'pointer', color: textMuted }} className="hover:text-white">
                          <Trash2 style={{ width: 14, height: 14 }} />
                        </button>
                      </>
                    )}
                    {bottomPanelTab === 'terminal' && (
                      <button onClick={createTerminalSessionAction} title="New terminal session" style={{ background: 'none', border: 'none', cursor: 'pointer', color: textMuted }} className="hover:text-white"><Plus style={{ width: 14, height: 14 }} /></button>
                    )}
                    {bottomPanelTab === 'ai' && (
                      <button onClick={clearAIConversation} title="Clear AI conversation" style={{ background: 'none', border: 'none', cursor: 'pointer', color: textMuted }} className="hover:text-white"><Trash2 style={{ width: 14, height: 14 }} /></button>
                    )}
                    <button onClick={() => setShowBottomPanel(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: textMuted }} className="hover:text-white"><ChevronDown style={{ width: 14, height: 14 }} /></button>
                  </div>
                </div>

                {/* Panel Content */}
                <div className="flex-1 overflow-hidden p-4">
                  {bottomPanelTab === 'output' ? (
                    <div className="h-full">
                      {!isHtmlOutput && <div className="flex items-center justify-center h-full text-muted opacity-40">No system output available.</div>}
                      {isHtmlOutput && <iframe srcDoc={htmlContent} className="w-full h-full rounded" style={{ background: 'white', border: 'none' }} title="Result" />}
                    </div>
                  ) : bottomPanelTab === 'console' ? (
                    <div className="flex h-full min-h-0 flex-col gap-3">
                      <div className="flex items-center justify-between gap-3 rounded-2xl border px-4 py-3" style={{ borderColor: border, background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.82)' }}>
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: isDark ? 'rgba(14,165,233,0.16)' : 'rgba(14,165,233,0.12)', color: '#38bdf8' }}>
                            <MessageSquare style={{ width: 16, height: 16 }} />
                          </div>
                          <div className="min-w-0">
                            <div style={{ fontSize: 12, fontWeight: 800, color: textMain }}>Runtime Console</div>
                            <div style={{ fontSize: 11, color: textMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {isRunning ? 'Execution in progress… new logs will appear here.' : output.length ? `Logs from ${activeTab?.name || 'the current file'}.` : 'Run a file to inspect logs, warnings, and runtime errors.'}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          {[
                            { label: 'Logs', value: consoleSummary.total, tone: textMain },
                            { label: 'Errors', value: consoleSummary.errors, tone: '#f87171' },
                            { label: 'Warnings', value: consoleSummary.warnings, tone: '#fbbf24' },
                          ].map(item => (
                            <span
                              key={item.label}
                              style={{
                                fontSize: 10,
                                fontWeight: 700,
                                color: item.tone,
                                padding: '6px 9px',
                                borderRadius: 999,
                                border: `1px solid ${border}`,
                                background: isDark ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.72)',
                              }}
                            >
                              {item.label} {item.value}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div
                        ref={consoleOutputRef}
                        className="flex-1 overflow-y-auto rounded-2xl border px-3 py-3 font-mono"
                        style={{ borderColor: border, background: isDark ? 'rgba(2,6,23,0.78)' : 'rgba(255,255,255,0.92)' }}
                      >
                        {!output.length && !isRunning ? (
                          <div className="flex h-full min-h-[120px] flex-col items-center justify-center text-center" style={{ color: textMuted }}>
                            <Terminal style={{ width: 20, height: 20, marginBottom: 10, opacity: 0.7 }} />
                            <div style={{ fontSize: 12, fontWeight: 700, color: textMain }}>Console is ready</div>
                            <div style={{ fontSize: 11, marginTop: 4, maxWidth: 360 }}>Run code from the editor and we’ll stream logs, warnings, and failures here in a cleaner debug view.</div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {isRunning && (
                              <div className="flex items-center gap-2 rounded-xl border px-3 py-2" style={{ borderColor: 'rgba(124,58,237,0.28)', background: isDark ? 'rgba(124,58,237,0.12)' : 'rgba(124,58,237,0.08)', color: '#a78bfa', fontSize: 12 }}>
                                <RefreshCw className="animate-spin" style={{ width: 14, height: 14 }} />
                                Executing code…
                              </div>
                            )}
                            {consoleEntries.map(entry => {
                              const toneStyles = entry.tone === 'error'
                                ? { badge: '#7f1d1d', borderColor: 'rgba(248,113,113,0.3)', label: '#fca5a5', text: '#fecaca', icon: <X style={{ width: 12, height: 12 }} /> }
                                : entry.tone === 'warning'
                                  ? { badge: '#78350f', borderColor: 'rgba(251,191,36,0.3)', label: '#fcd34d', text: '#fde68a', icon: <AlertTriangle style={{ width: 12, height: 12 }} /> }
                                  : entry.tone === 'success'
                                    ? { badge: '#14532d', borderColor: 'rgba(74,222,128,0.24)', label: '#86efac', text: isDark ? '#dcfce7' : '#166534', icon: <Check style={{ width: 12, height: 12 }} /> }
                                    : { badge: isDark ? '#1f2937' : '#e2e8f0', borderColor: border, label: textMuted, text: textMain, icon: <Terminal style={{ width: 12, height: 12 }} /> };

                              return (
                                <div
                                  key={entry.id}
                                  className="flex items-start gap-3 rounded-xl border px-3 py-2"
                                  style={{ borderColor: toneStyles.borderColor, background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(248,250,252,0.95)' }}
                                >
                                  <div className="mt-0.5 flex items-center gap-2">
                                    <span
                                      className="inline-flex items-center gap-1 rounded-md px-2 py-1"
                                      style={{ background: toneStyles.badge, color: toneStyles.label, fontSize: 10, fontWeight: 800, letterSpacing: '0.06em' }}
                                    >
                                      {toneStyles.icon}
                                      {entry.short}
                                    </span>
                                    <span style={{ fontSize: 10, color: textMuted }}>{entry.ts}</span>
                                  </div>
                                  <div style={{ fontSize: 12, color: toneStyles.text, whiteSpace: 'pre-wrap', wordBreak: 'break-word', flex: 1 }}>
                                    {entry.line}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : bottomPanelTab === 'terminal' ? (
                    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border font-mono text-sm" style={{ borderColor: border, background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.82)' }}>
                      <div className="flex items-center gap-2 border-b px-2 py-2" style={{ borderColor: border, background: isDark ? 'rgba(15,23,42,0.72)' : 'rgba(248,250,252,0.92)' }}>
                        <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto pb-1">
                          {terminalSessions.map((session) => {
                            const active = session.id === activeTerminalId;
                            return (
                              <div
                                key={session.id}
                                className="group flex min-w-[150px] max-w-[240px] items-center rounded-xl border"
                                style={{
                                  borderColor: active ? 'rgba(124,58,237,0.34)' : border,
                                  background: active ? (isDark ? 'rgba(124,58,237,0.14)' : 'rgba(124,58,237,0.08)') : 'transparent',
                                  boxShadow: active ? 'inset 0 1px 0 rgba(255,255,255,0.05)' : 'none',
                                  flexShrink: 0,
                                }}
                              >
                                <div
                                  onClick={() => setActiveTerminalId(session.id)}
                                  onKeyDown={(event) => {
                                    if (event.key === 'Enter' || event.key === ' ') {
                                      event.preventDefault();
                                      setActiveTerminalId(session.id);
                                    }
                                  }}
                                  role="button"
                                  tabIndex={0}
                                  aria-pressed={active}
                                  title={`/${session.cwd || ''}`}
                                  className="flex min-w-0 flex-1 items-center gap-2 px-3 py-2 outline-none"
                                  style={{ cursor: 'pointer' }}
                                >
                                  <span style={{ width: 8, height: 8, borderRadius: 999, background: session.accent, boxShadow: active ? `0 0 12px ${session.accent}` : 'none', flexShrink: 0 }} />
                                  <span style={{ fontSize: 12, fontWeight: 700, color: textMain, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{session.title}</span>
                                  <span style={{ fontSize: 10, color: textMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>/{session.cwd || ''}</span>
                                </div>
                                <button
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    removeTerminalSession(session.id);
                                  }}
                                  title={`Close ${session.title}`}
                                  style={{ background: 'transparent', border: 'none', color: textMuted, cursor: 'pointer', padding: '6px 8px', flexShrink: 0 }}
                                  className="hover:text-white"
                                >
                                  <X style={{ width: 11, height: 11 }} />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex items-center gap-2 pl-1">
                          <span style={{ fontSize: 10, color: textMuted, whiteSpace: 'nowrap' }}>{terminalSessions.length} session{terminalSessions.length === 1 ? '' : 's'}</span>
                          <button onClick={createTerminalSessionAction} title="New terminal session" style={{ width: 28, height: 28, borderRadius: 9, background: isDark ? 'rgba(124,58,237,0.14)' : 'rgba(124,58,237,0.1)', color: '#7c3aed', border: `1px solid ${isDark ? 'rgba(124,58,237,0.28)' : 'rgba(124,58,237,0.2)'}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Plus style={{ width: 13, height: 13 }} />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3 border-b px-3 py-2" style={{ borderColor: border, background: isDark ? 'rgba(2,6,23,0.54)' : 'rgba(255,255,255,0.82)' }}>
                        <div className="flex min-w-0 items-center gap-2">
                          <Terminal style={{ width: 13, height: 13, color: '#22c55e', flexShrink: 0 }} />
                          <span style={{ fontSize: 11, color: textMuted }}>cwd</span>
                          <span style={{ fontSize: 11, color: textMain, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>/ {activeTerminal?.cwd || ''}</span>
                        </div>
                        <div className="flex items-center gap-2" style={{ fontSize: 10, color: textMuted }}>
                          <span style={{ padding: '4px 8px', borderRadius: 999, border: `1px solid ${border}` }}>{activeTerminal?.lines.length || 0} lines</span>
                          <span style={{ padding: '4px 8px', borderRadius: 999, border: `1px solid ${border}` }}>Shell #{Math.max(terminalSessions.findIndex(session => session.id === activeTerminal?.id), 0) + 1}</span>
                        </div>
                      </div>

                      <div
                        ref={terminalOutputRef}
                        className="flex-1 overflow-y-auto px-4 py-3"
                        style={{ background: isDark ? 'rgba(3,7,18,0.82)' : 'rgba(255,255,255,0.92)' }}
                      >
                        {(activeTerminal?.lines || []).map((line, i) => (
                          <div key={i} style={{ color: line.includes('$ ') ? '#3fb950' : textMain, padding: '1px 0', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{line}</div>
                        ))}
                      </div>

                      <div className="border-t px-3 py-2" style={{ borderColor: border, background: isDark ? 'rgba(2,6,23,0.54)' : 'rgba(248,250,252,0.9)' }}>
                        <div className="flex items-center gap-2 rounded-xl border px-3 py-2" style={{ borderColor: border, background: isDark ? 'rgba(0,0,0,0.24)' : 'rgba(255,255,255,0.84)' }}>
                          <span style={{ color: '#3fb950', fontWeight: 700, whiteSpace: 'nowrap' }}>lms@browser:~/{activeTerminal?.cwd || ''}$</span>
                          <input
                            ref={terminalInputRef}
                            value={activeTerminal?.input || ''}
                            onChange={e => activeTerminal && updateTerminalSession(activeTerminal.id, current => ({ ...current, input: e.target.value }))}
                            onKeyDown={e => activeTerminal && handleTerminalInput(activeTerminal.id, e)}
                            placeholder="Run forge commands in this terminal..."
                            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: textMain, font: 'inherit' }}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid h-full gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
                      <div className="flex min-h-0 flex-col gap-4 overflow-y-auto rounded-2xl border p-4" style={{ borderColor: border, background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }}>
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ background: 'rgba(124,58,237,0.16)', color: '#7c3aed' }}>
                              <Sparkles style={{ width: 18, height: 18 }} />
                            </div>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 800, color: textMain }}>Forge AI</div>
                              <div style={{ fontSize: 11, color: textMuted }}>BYOK assistant for code review, debugging, and file-aware prompts.</div>
                            </div>
                          </div>
                          <div style={{ fontSize: 10, color: textMuted, marginTop: 8 }}>Keys stay in component state or local storage only. Nothing is persisted server-side.</div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          {(['openai', 'gemini'] as AIProvider[]).map(provider => (
                            <button
                              key={provider}
                              onClick={() => {
                                setAiProvider(provider);
                                setAiModel(AI_PROVIDER_DEFAULT_MODEL[provider]);
                              }}
                              style={{
                                padding: '10px 12px',
                                borderRadius: 12,
                                border: `1px solid ${aiProvider === provider ? 'rgba(124,58,237,0.35)' : border}`,
                                background: aiProvider === provider ? (isDark ? 'rgba(124,58,237,0.16)' : 'rgba(124,58,237,0.08)') : 'transparent',
                                color: aiProvider === provider ? textMain : textMuted,
                                fontSize: 11,
                                fontWeight: 700,
                                cursor: 'pointer',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                              }}
                            >
                              {provider}
                            </button>
                          ))}
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: textMain, marginBottom: 6 }}>API Key</label>
                          <div className="flex items-center gap-2 rounded-xl border px-3 py-2" style={{ borderColor: border, background: isDark ? 'rgba(0,0,0,0.22)' : 'rgba(255,255,255,0.75)' }}>
                            <KeyRound style={{ width: 14, height: 14, color: textMuted }} />
                            <input
                              type="password"
                              value={aiApiKey}
                              onChange={e => setAiApiKey(e.target.value)}
                              placeholder={aiProvider === 'openai' ? 'sk-...' : 'AIza...'}
                              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: textMain, fontSize: 12 }}
                            />
                          </div>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: textMain, marginBottom: 6 }}>Model</label>
                          <input
                            value={aiModel}
                            onChange={e => setAiModel(e.target.value)}
                            placeholder={AI_PROVIDER_DEFAULT_MODEL[aiProvider]}
                            style={{ width: '100%', padding: '10px 12px', borderRadius: 12, background: isDark ? 'rgba(0,0,0,0.22)' : 'rgba(255,255,255,0.75)', border: `1px solid ${border}`, color: textMain, fontSize: 12, outline: 'none', boxSizing: 'border-box' }}
                          />
                        </div>

                        <label className="flex items-center gap-2" style={{ fontSize: 11, color: textMain }}>
                          <input type="checkbox" checked={rememberAiKey} onChange={e => setRememberAiKey(e.target.checked)} />
                          Remember this key locally on this device
                        </label>

                        <div className="space-y-2">
                          <button
                            onClick={handleAnalyzeCurrentFile}
                            disabled={!activeTab || aiSubmitting}
                            style={{ width: '100%', padding: '10px 12px', borderRadius: 12, background: 'rgba(34,197,94,0.14)', color: isDark ? '#dcfce7' : '#166534', border: '1px solid rgba(34,197,94,0.24)', fontSize: 11, fontWeight: 700, cursor: !activeTab || aiSubmitting ? 'not-allowed' : 'pointer', opacity: !activeTab || aiSubmitting ? 0.55 : 1, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}
                          >
                            <Bot style={{ width: 14, height: 14 }} /> Analyze Current File
                          </button>
                          <button
                            onClick={handleFixErrors}
                            disabled={!activeTab || aiSubmitting}
                            style={{ width: '100%', padding: '10px 12px', borderRadius: 12, background: 'rgba(245,158,11,0.14)', color: isDark ? '#fef3c7' : '#92400e', border: '1px solid rgba(245,158,11,0.24)', fontSize: 11, fontWeight: 700, cursor: !activeTab || aiSubmitting ? 'not-allowed' : 'pointer', opacity: !activeTab || aiSubmitting ? 0.55 : 1, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}
                          >
                            <Wand2 style={{ width: 14, height: 14 }} /> Fix Errors
                          </button>
                        </div>

                        <div className="rounded-2xl border p-3" style={{ borderColor: border, background: isDark ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.7)' }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: textMain }}>Attached context</div>
                          <label className="mt-2 flex items-center gap-2" style={{ fontSize: 11, color: textMain }}>
                            <input type="checkbox" checked={aiIncludeFile} onChange={e => setAiIncludeFile(e.target.checked)} />
                            Include active file code
                          </label>
                          <label className="mt-2 flex items-center gap-2" style={{ fontSize: 11, color: textMain }}>
                            <input type="checkbox" checked={aiIncludeConsole} onChange={e => setAiIncludeConsole(e.target.checked)} />
                            Include console output
                          </label>
                          <div style={{ fontSize: 10, color: textMuted, marginTop: 8 }}>
                            Active file: {activeTab?.name || 'none selected'}<br />
                            Console lines: {output.length}
                          </div>
                        </div>
                      </div>

                      <div className="flex min-h-0 flex-col rounded-2xl border p-4" style={{ borderColor: border, background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.82)' }}>
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 800, color: textMain }}>Conversation</div>
                            <div style={{ fontSize: 11, color: textMuted }}>Ask about the current file, request fixes, or generate next steps.</div>
                          </div>
                          <div className="flex items-center gap-2" style={{ fontSize: 10, color: textMuted }}>
                            <MessageSquare style={{ width: 12, height: 12 }} />
                            {aiMessages.filter(message => message.role !== 'system').length} messages
                          </div>
                        </div>

                        {aiError && (
                          <div className="mb-3 flex items-start gap-2 rounded-2xl border px-3 py-3" style={{ borderColor: 'rgba(239,68,68,0.24)', background: 'rgba(239,68,68,0.08)', color: isDark ? '#fecaca' : '#991b1b' }}>
                            <AlertTriangle style={{ width: 14, height: 14, flexShrink: 0, marginTop: 2 }} />
                            <div style={{ fontSize: 11 }}>{aiError}</div>
                          </div>
                        )}

                        <div ref={aiMessagesRef} className="flex-1 overflow-y-auto rounded-2xl border px-3 py-3" style={{ borderColor: border, background: isDark ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.72)' }}>
                          <div className="space-y-3">
                            {aiMessages.map(message => (
                              <div key={message.id} style={{ display: 'flex', justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start' }}>
                                <div style={{
                                  maxWidth: '82%',
                                  padding: '10px 12px',
                                  borderRadius: 16,
                                  background: message.role === 'user'
                                    ? '#7c3aed'
                                    : isDark
                                      ? 'rgba(255,255,255,0.06)'
                                      : 'rgba(0,0,0,0.05)',
                                  color: message.role === 'user' ? 'white' : textMain,
                                  border: message.role === 'user' ? 'none' : `1px solid ${border}`,
                                  fontSize: 12,
                                  lineHeight: 1.6,
                                  whiteSpace: 'pre-wrap',
                                }}>
                                  {message.content}
                                  {message.pending && (
                                    <div style={{ fontSize: 10, opacity: 0.7, marginTop: 6 }}>Waiting for response...</div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="mt-3 rounded-2xl border p-3" style={{ borderColor: border, background: isDark ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.72)' }}>
                          <textarea
                            ref={aiInputRef}
                            value={aiInput}
                            onChange={e => setAiInput(e.target.value)}
                            onKeyDown={e => {
                              if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                                e.preventDefault();
                                void submitAIRequest();
                              }
                            }}
                            placeholder="Ask Forge AI to analyze, debug, refactor, or generate code for the active file..."
                            style={{ width: '100%', minHeight: 88, resize: 'none', background: 'transparent', border: 'none', outline: 'none', color: textMain, fontSize: 12, lineHeight: 1.6 }}
                          />
                          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                            <div style={{ fontSize: 10, color: textMuted }}>
                              Provider: {aiProvider} · Model: {aiModel}
                            </div>
                            <button
                              onClick={() => void submitAIRequest()}
                              disabled={aiSubmitting || !aiInput.trim()}
                              style={{ padding: '9px 14px', borderRadius: 12, background: aiSubmitting || !aiInput.trim() ? 'rgba(124,58,237,0.35)' : '#7c3aed', color: 'white', border: 'none', cursor: aiSubmitting || !aiInput.trim() ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 700 }}
                            >
                              {aiSubmitting ? <RefreshCw className="animate-spin" style={{ width: 13, height: 13 }} /> : <SendHorizontal style={{ width: 13, height: 13 }} />}
                              {aiSubmitting ? 'Thinking...' : 'Send'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

      {/* ── Context Menu ── */}
      {contextMenu && (
        <div style={{ position: 'fixed', top: contextMenu.y, left: contextMenu.x, zIndex: 9999, background: isDark ? 'rgba(22,27,34,0.96)' : 'rgba(255,255,255,0.98)', border: `1px solid ${border}`, borderRadius: 14, padding: 6, boxShadow: isDark ? '0 18px 40px rgba(0,0,0,0.45)' : '0 18px 40px rgba(15,23,42,0.18)', width: 188, backdropFilter: 'blur(18px)' }}
             onMouseDown={e => e.stopPropagation()}>
          <div style={{ padding: '6px 10px 8px', borderBottom: `1px solid ${border}`, marginBottom: 4 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.14em' }}>
              {contextMenu.isFolder ? 'Folder Actions' : 'File Actions'}
            </div>
            {contextMenu.path && (
              <div style={{ fontSize: 11, color: textMain, fontWeight: 700, marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {contextMenu.path.split('/').pop()}
              </div>
            )}
          </div>
          {contextMenu.path && (
            <>
              <button onClick={() => { 
                  const targetPath = contextMenu.path!;
                  const targetType = contextMenu.isFolder ? 'folder' : 'file';
                  setSelectedDir(targetPath);
                  setContextMenu(null); 
                  requestAnimationFrame(() => startRenamingNode(targetPath, targetType));
                }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', textAlign: 'left', padding: '8px 10px', fontSize: 12, background: 'transparent', border: 'none', color: textMain, cursor: 'pointer', borderRadius: 10, fontWeight: 600 }} className="hover:bg-white/10">
                <Sparkles style={{ width: 14, height: 14 }} />
                Rename
              </button>
              {!contextMenu.isFolder && (
                <>
              <button onClick={() => { 
                  const t = tabs.find(x=>x.id===contextMenu.id); 
                  if(t) {
                    const ext = t.name.split('.').pop() ?? 'js';
                    let nextNum = 1;
                    const base = t.name.replace(`.${ext}`, '');
                    while (tabs.some(x => x.name === `${base} copy${nextNum > 1 ? ` ${nextNum}` : ''}.${ext}`)) {
                      nextNum++;
                    }
                    const name = `${base} copy${nextNum > 1 ? ` ${nextNum}` : ''}.${ext}`;
                    setTabs(prev => [...prev, { ...t, id: makeid(), name }]);
                  }
                  setContextMenu(null); 
                }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', textAlign: 'left', padding: '8px 10px', fontSize: 12, background: 'transparent', border: 'none', color: textMain, cursor: 'pointer', borderRadius: 10, fontWeight: 600 }} className="hover:bg-white/10">
                <Copy style={{ width: 14, height: 14 }} />
                Duplicate
              </button>
                </>
              )}
              <div style={{ height: 1, background: border, margin: '4px 0' }} />
            </>
          )}
          <button onClick={() => { 
              if (contextMenu.path) void deleteExplorerNode(contextMenu.path);
              setContextMenu(null); 
            }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', textAlign: 'left', padding: '8px 10px', fontSize: 12, background: 'transparent', border: 'none', color: '#f85149', cursor: 'pointer', borderRadius: 10, fontWeight: 700 }} className="hover:bg-white/10">
            <Trash2 style={{ width: 14, height: 14 }} />
            Delete
          </button>
        </div>
      )}

      {showQuickOpen && (
        <div
          className="fixed inset-0 flex items-start justify-center px-4 py-14"
          style={{ zIndex: 9998, background: isDark ? 'rgba(2,6,23,0.52)' : 'rgba(15,23,42,0.18)', backdropFilter: 'blur(10px)' }}
          onMouseDown={closeQuickOpen}
        >
          <div
            className="w-full max-w-2xl overflow-hidden rounded-2xl border"
            style={{ borderColor: border, background: isDark ? 'rgba(15,23,42,0.96)' : 'rgba(255,255,255,0.98)', boxShadow: isDark ? '0 28px 70px rgba(0,0,0,0.45)' : '0 28px 70px rgba(15,23,42,0.18)' }}
            onMouseDown={event => event.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b px-4 py-3" style={{ borderColor: border }}>
              <Search style={{ width: 16, height: 16, color: '#38bdf8', flexShrink: 0 }} />
              <input
                ref={quickOpenInputRef}
                value={quickOpenQuery}
                onChange={event => {
                  setQuickOpenQuery(event.target.value);
                  setQuickOpenIndex(0);
                }}
                onKeyDown={async event => {
                  if (event.key === 'ArrowDown') {
                    event.preventDefault();
                    setQuickOpenIndex(prev => Math.min(prev + 1, Math.max(quickOpenResults.length - 1, 0)));
                  } else if (event.key === 'ArrowUp') {
                    event.preventDefault();
                    setQuickOpenIndex(prev => Math.max(prev - 1, 0));
                  } else if (event.key === 'Enter') {
                    event.preventDefault();
                    await commitQuickOpen();
                  } else if (event.key === 'Escape') {
                    event.preventDefault();
                    closeQuickOpen();
                  }
                }}
                placeholder="Type a file name to open…"
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: textMain, fontSize: 14, fontWeight: 600 }}
              />
              <span style={{ fontSize: 10, color: textMuted, padding: '5px 8px', borderRadius: 8, border: `1px solid ${border}` }}>Ctrl+P</span>
            </div>

            <div className="border-b px-4 py-2" style={{ borderColor: border, fontSize: 11, color: textMuted }}>
              Quick Open · {quickOpenResults.length} result{quickOpenResults.length === 1 ? '' : 's'}
            </div>

            <div className="max-h-[420px] overflow-y-auto py-2">
              {!quickOpenResults.length ? (
                <div className="px-4 py-8 text-center">
                  <FileText style={{ width: 18, height: 18, color: textMuted, margin: '0 auto 10px' }} />
                  <div style={{ fontSize: 12, fontWeight: 700, color: textMain }}>No matching files</div>
                  <div style={{ fontSize: 11, color: textMuted, marginTop: 4 }}>Try part of a file name or extension like `page`, `php`, or `.env`.</div>
                </div>
              ) : (
                quickOpenResults.map((tab, index) => {
                  const lang = resolveLanguageForName(tab.name);
                  const Icon = lang.icon;
                  const active = index === quickOpenIndex;
                  const open = openTabIds.includes(tab.id);
                  return (
                    <button
                      key={tab.id}
                      onClick={() => void commitQuickOpen(tab.id)}
                      onMouseEnter={() => setQuickOpenIndex(index)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left"
                      style={{
                        border: 'none',
                        borderTop: 'none',
                        borderLeft: 'none',
                        borderRight: 'none',
                        borderBottom: `1px solid ${index === quickOpenResults.length - 1 ? 'transparent' : border}`,
                        background: active ? (isDark ? 'rgba(56,189,248,0.12)' : 'rgba(56,189,248,0.08)') : 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.05)' }}>
                        <Icon style={{ width: 16, height: 16, color: lang.color }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div style={{ fontSize: 12, fontWeight: 700, color: textMain, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tab.name}</div>
                        <div style={{ fontSize: 11, color: textMuted, display: 'flex', gap: 8, alignItems: 'center' }}>
                          <span>{lang.label}</span>
                          {open && <span style={{ color: '#22c55e' }}>Open</span>}
                          {tab.saved === false && <span style={{ color: '#f59e0b' }}>Unsaved</span>}
                        </div>
                      </div>
                      <span style={{ fontSize: 10, color: textMuted, padding: '5px 8px', borderRadius: 999, border: `1px solid ${border}` }}>
                        {index === quickOpenIndex ? 'Enter' : `${index + 1}`}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Style Overrides */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        
        /* Silence Monaco Artifacts (Pencil icon, Blue boxes, etc.) */
        .monaco-breadcrumbs { display: none !important; }
        .monaco-editor .rename-box { display: none !important; }
        .monaco-editor .find-widget { display: none !important; }
        .monaco-editor .symbol-icon { display: none !important; }
        .monaco-editor .margin-view-overlays { border-right: none !important; }
        .monaco-editor .monaco-scrollable-element > .scrollbar > .slider { background: ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} !important; border-radius: 4px; }
        .monaco-editor .view-line > span > .monaco-token { outline: none !important; border: none !important; }
        .monaco-editor .monaco-editor-hover { display: none !important; }
        .monaco-editor .monaco-editor-overlay { display: none !important; }
        .monaco-editor .monaco-editor-floating-widget { display: none !important; }
        * { outline: none !important; -webkit-tap-highlight-color: transparent !important; }
      `}</style>
    </div>
  );
}

/* Helper icons */
function FilePlus(props: any) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
    </svg>
  );
}

function FolderPlus(props: any) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/>
    </svg>
  );
}
