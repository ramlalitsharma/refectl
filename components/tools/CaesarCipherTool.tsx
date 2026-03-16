'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Copy, Trash2, Lock, Unlock, Hash, Check, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export function CaesarCipherTool() {
    const [input, setInput] = useState('');
    const [shift, setShift] = useState(3);
    const [copied, setCopied] = useState(false);

    const processedText = useMemo(() => {
        if (!input) return '';
        return input.split('').map(char => {
            if (char.match(/[a-z]/i)) {
                const code = char.charCodeAt(0);
                let base = code >= 65 && code <= 90 ? 65 : 97;
                return String.fromCharCode(((code - base + shift + 26) % 26) + base);
            }
            return char;
        }).join('');
    }, [input, shift]);

    const copyToClipboard = async () => {
        if (!processedText) return;
        try {
            await navigator.clipboard.writeText(processedText);
            setCopied(true);
            toast.success('Copied result!');
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            toast.error('Failed to copy');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid lg:grid-cols-2 gap-8">
                {/* Input area */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Original Message</h3>
                        <Button variant="ghost" size="sm" onClick={() => setInput('')} className="h-8 w-8 p-0 text-slate-400 hover:text-red-500">
                            <Trash2 size={14} />
                        </Button>
                    </div>
                    <Card className="border-2 border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 overflow-hidden rounded-3xl">
                        <textarea
                            className="w-full h-[300px] p-6 bg-transparent resize-none focus:outline-none text-lg font-medium leading-relaxed dark:text-slate-200"
                            placeholder="Enter text to encrypt or decrypt..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                    </Card>
                </div>

                {/* Output area */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-sm font-black text-blue-600 uppercase tracking-wider">Shifted Result</h3>
                        <Button variant="ghost" size="sm" onClick={copyToClipboard} className="h-8 w-8 p-0 text-slate-400 hover:text-blue-500">
                            <Copy size={14} />
                        </Button>
                    </div>
                    <Card className="border-2 border-blue-500/20 bg-blue-50/30 dark:bg-blue-900/10 overflow-hidden rounded-3xl relative group">
                        <div className="absolute top-4 right-4 text-blue-500/20 group-hover:text-blue-500/40 transition-colors">
                            {shift >= 0 ? <Lock size={40} /> : <Unlock size={40} />}
                        </div>
                        <div className="w-full h-[300px] p-6 text-lg font-bold text-slate-900 dark:text-white leading-relaxed whitespace-pre-wrap break-words overflow-y-auto">
                            {processedText || <span className="text-slate-400 font-medium">Result will appear here...</span>}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Control Panel */}
            <Card className="p-8 border-none bg-slate-900 rounded-[2rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -mr-32 -mt-32" />
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/40">
                            <Hash size={32} />
                        </div>
                        <div>
                            <h4 className="text-2xl font-black text-white italic uppercase tracking-tighter">Cipher Shift</h4>
                            <p className="text-slate-400 text-sm">Adjust the offset for encryption</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 bg-white/5 p-4 rounded-3xl border border-white/10">
                        <Button
                            variant="ghost"
                            className="h-12 w-12 rounded-xl text-white hover:bg-white/10 text-xl font-black"
                            onClick={() => setShift(s => (s - 1 + 26) % 26)}
                        >
                            -
                        </Button>
                        <div className="text-4xl font-black text-blue-500 w-16 text-center tabular-nums">
                            {shift}
                        </div>
                        <Button
                            variant="ghost"
                            className="h-12 w-12 rounded-xl text-white hover:bg-white/10 text-xl font-black"
                            onClick={() => setShift(s => (s + 1) % 26)}
                        >
                            +
                        </Button>
                    </div>

                    <Button
                        className="h-16 px-10 rounded-2xl bg-white text-black font-black hover:bg-blue-500 hover:text-white transition-all shadow-xl"
                        onClick={copyToClipboard}
                    >
                        {copied ? <><Check className="mr-2" /> COPIED</> : <><RefreshCw className="mr-2" /> COPY RESULT</>}
                    </Button>
                </div>
            </Card>

            <div className="grid md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-900/50 p-8 rounded-[2rem] border border-slate-100 dark:border-white/5">
                <div>
                    <h5 className="font-black text-slate-900 dark:text-white uppercase text-xs mb-3 flex items-center gap-2">
                        <Lock size={14} className="text-blue-500" />
                        How to Encrypt
                    </h5>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium">
                        Type your message in the left box and choose a positive shift. The Caesar cipher moves each letter forward in the alphabet by your chosen number. Take note of the shift value as it acts as the "key" for decryption.
                    </p>
                </div>
                <div>
                    <h5 className="font-black text-slate-900 dark:text-white uppercase text-xs mb-3 flex items-center gap-2">
                        <Unlock size={14} className="text-emerald-500" />
                        How to Decrypt
                    </h5>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium">
                        Paste the encoded text in the left box. To reverse the process, set the shift value such that (Shift + Original Shift = 26) or use the negative offset. For example, if it was shifted by 3, use 23 (or -3) to decrypt.
                    </p>
                </div>
            </div>
        </div>
    );
}
