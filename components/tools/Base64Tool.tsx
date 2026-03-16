'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Copy, Trash2, ArrowLeftRight, Check, Hash, Code } from 'lucide-react';
import { toast } from 'sonner';

export function Base64Tool() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [copied, setCopied] = useState(false);

    const encode = () => {
        try {
            setOutput(btoa(input));
            toast.success('Encoded successfully');
        } catch (e) {
            toast.error('Failed to encode: Invalid input for Base64');
        }
    };

    const decode = () => {
        try {
            setOutput(atob(input));
            toast.success('Decoded successfully');
        } catch (e) {
            toast.error('Failed to decode: Invalid Base64 string');
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

    const swapToInput = () => {
        setInput(output);
        setOutput('');
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid lg:grid-cols-2 gap-8">
                {/* Input area */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Input Text</h3>
                        <Button variant="ghost" size="sm" onClick={() => setInput('')} className="h-8 w-8 p-0 text-slate-400 hover:text-red-500">
                            <Trash2 size={14} />
                        </Button>
                    </div>
                    <Card className="border-2 border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 overflow-hidden rounded-3xl shadow-sm">
                        <textarea
                            className="w-full h-[300px] p-6 bg-transparent resize-none focus:outline-none text-lg font-medium leading-relaxed dark:text-slate-200"
                            placeholder="Paste text to encode or base64 to decode..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                    </Card>
                </div>

                {/* Output area */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-sm font-black text-blue-600 uppercase tracking-wider">Result</h3>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={swapToInput} title="Use as Input" className="h-8 w-8 p-0 text-slate-400 hover:text-blue-500">
                                <ArrowLeftRight size={14} />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={copyToClipboard} className="h-8 w-8 p-0 text-slate-400 hover:text-blue-500">
                                <Copy size={14} />
                            </Button>
                        </div>
                    </div>
                    <Card className="border-2 border-blue-500/20 bg-blue-50/30 dark:bg-blue-900/10 overflow-hidden rounded-3xl">
                        <div className="w-full h-[300px] p-6 text-lg font-bold text-slate-900 dark:text-white leading-relaxed whitespace-pre-wrap break-words overflow-y-auto tabular-nums">
                            {output || <span className="text-slate-400 font-medium italic opacity-50">Transformed data will appear here...</span>}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Action Bar */}
            <div className="grid md:grid-cols-2 gap-4">
                <Button
                    onClick={encode}
                    className="h-16 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-lg shadow-xl shadow-blue-500/20 group"
                >
                    <Code className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" /> Encode to Base64
                </Button>
                <Button
                    onClick={decode}
                    className="h-16 rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-2 border-slate-200 dark:border-white/10 hover:border-blue-500 font-black text-lg shadow-xl"
                >
                    <ArrowLeftRight className="mr-2 h-5 w-5" /> Decode from Base64
                </Button>
            </div>

            <div className="bg-slate-900 text-white rounded-[2rem] p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
                <h4 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-6 italic">Developer Note</h4>
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white font-black">?</div>
                            <span className="font-bold">What is it?</span>
                        </div>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            Base64 encoding is commonly used to embed image data in HTML/CSS or to transport binary data over text-only protocols.
                        </p>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-black">✓</div>
                            <span className="font-bold">Privacy First</span>
                        </div>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            All encoding and decoding happens locally in your browser using the `btoa` and `atob` APIs. Your data is never sent to our servers.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
