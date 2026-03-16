'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Copy, Trash2, Globe, Check, RefreshCw, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';

export function UrlEncoderTool() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [copied, setCopied] = useState(false);

    const encode = () => {
        try {
            setOutput(encodeURIComponent(input));
            toast.success('URL encoded successfully');
        } catch (e) {
            toast.error('Failed to encode URL');
        }
    };

    const decode = () => {
        try {
            setOutput(decodeURIComponent(input));
            toast.success('URL decoded successfully');
        } catch (e) {
            toast.error('Failed to decode: Invalid percent encoding');
        }
    };

    const copyToClipboard = async () => {
        if (!output) return;
        try {
            await navigator.clipboard.writeText(output);
            setCopied(true);
            toast.success('Copied to clipboard');
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            toast.error('Failed to copy');
        }
    };

    const applyToInput = () => {
        setInput(output);
        setOutput('');
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid lg:grid-cols-2 gap-8">
                {/* Input area */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider italic">Source URL / String</h3>
                        <Button variant="ghost" size="sm" onClick={() => setInput('')} title="Clear" className="h-8 w-8 p-0 text-slate-400 hover:text-red-500">
                            <Trash2 size={14} />
                        </Button>
                    </div>
                    <Card className="border-2 border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 overflow-hidden rounded-3xl shadow-sm">
                        <textarea
                            className="w-full h-[300px] p-6 bg-transparent resize-none focus:outline-none text-lg font-medium leading-relaxed dark:text-slate-200"
                            placeholder="Paste URL components or strings here..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                    </Card>
                </div>

                {/* Output area */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-sm font-black text-emerald-600 uppercase tracking-wider italic">Processed Result</h3>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={applyToInput} title="Edit Result" className="h-8 w-8 p-0 text-slate-400 hover:text-emerald-500">
                                <RefreshCw size={14} />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={copyToClipboard} className="h-8 w-8 p-0 text-slate-400 hover:text-emerald-500">
                                <Copy size={14} />
                            </Button>
                        </div>
                    </div>
                    <Card className="border-2 border-emerald-500/20 bg-emerald-50/10 dark:bg-emerald-900/10 overflow-hidden rounded-3xl">
                        <div className="w-full h-[300px] p-6 text-lg font-bold text-slate-900 dark:text-white leading-relaxed whitespace-pre-wrap break-words overflow-y-auto tabular-nums">
                            {output || <span className="text-slate-400 font-medium italic opacity-50">Safe characters will appear here...</span>}
                        </div>
                    </Card>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <Button
                    onClick={encode}
                    className="h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg shadow-xl shadow-emerald-500/20 group"
                >
                    <LinkIcon className="mr-2 h-5 w-5 group-hover:-rotate-45 transition-transform" /> Percent Encode
                </Button>
                <Button
                    onClick={decode}
                    className="h-16 rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-2 border-slate-200 dark:border-white/10 hover:border-emerald-500 font-black text-lg shadow-xl"
                >
                    <Globe className="mr-2 h-5 w-5" /> Standard Decode
                </Button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                        <Globe size={24} />
                    </div>
                    <div>
                        <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tighter">URL Optimization</h4>
                        <p className="text-xs text-slate-500">Universal character compatibility</p>
                    </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                    Standard URI components must be "percent-encoded" to be safely transmitted. This tool converts unsafe ASCII characters (like spaces, braces, and emojis) into their safe percentage representation (e.g., Space becomes <code className="text-emerald-600 font-bold">%20</code>).
                </p>
            </div>
        </div>
    );
}
