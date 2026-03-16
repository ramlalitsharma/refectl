'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Copy, Trash2, ArrowLeftRight, Type, Check, Download } from 'lucide-react';
import { toast } from 'sonner';

export function CaseConverterTool() {
    const [input, setInput] = useState('');
    const [copied, setCopied] = useState(false);

    const stats = useMemo(() => ({
        chars: input.length,
        words: input.trim().split(/\s+/).filter(Boolean).length,
        lines: input.split('\n').filter(Boolean).length
    }), [input]);

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(input);
            setCopied(true);
            toast.success('Copied to clipboard!');
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            toast.error('Failed to copy');
        }
    };

    const clearText = () => {
        setInput('');
        toast.success('Cleared');
    };

    const transform = (type: 'upper' | 'lower' | 'title' | 'sentence' | 'inverse') => {
        if (!input) return;

        let result = '';
        switch (type) {
            case 'upper':
                result = input.toUpperCase();
                break;
            case 'lower':
                result = input.toLowerCase();
                break;
            case 'title':
                result = input.toLowerCase().split(' ').map(s => s.charAt(0).toUpperCase() + s.substring(1)).join(' ');
                break;
            case 'sentence':
                result = input.toLowerCase().replace(/(^\s*\w|[\.\!\?]\s*\w)/g, c => c.toUpperCase());
                break;
            case 'inverse':
                result = input.split('').map(c =>
                    c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()
                ).join('');
                break;
        }
        setInput(result);
    };

    const downloadTxt = () => {
        const element = document.createElement("a");
        const file = new Blob([input], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = "converted-text.txt";
        document.body.appendChild(element);
        element.click();
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid lg:grid-cols-1 gap-6">
                <Card className="border-none bg-slate-50 dark:bg-slate-900/50 shadow-none">
                    <CardContent className="p-0">
                        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-white/10">
                            <div className="flex gap-4">
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    Words: <span className="text-blue-500">{stats.words}</span>
                                </div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    Chars: <span className="text-blue-500">{stats.chars}</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm" onClick={clearText} className="h-8 w-8 p-0 text-slate-400 hover:text-red-500">
                                    <Trash2 size={14} />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={downloadTxt} className="h-8 w-8 p-0 text-slate-400 hover:text-blue-500">
                                    <Download size={14} />
                                </Button>
                            </div>
                        </div>
                        <textarea
                            className="w-full min-h-[300px] p-6 bg-transparent resize-none focus:outline-none text-lg font-medium leading-relaxed dark:text-slate-200 scrollbar-hide"
                            placeholder="Paste or type your text here for instant case transformation..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                    </CardContent>
                </Card>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {[
                        { label: 'UPPER CASE', type: 'upper' },
                        { label: 'lower case', type: 'lower' },
                        { label: 'Title Case', type: 'title' },
                        { label: 'Sentence case', type: 'sentence' },
                        { label: 'iNVERSE cASE', type: 'inverse' }
                    ].map((btn) => (
                        <Button
                            key={btn.type}
                            variant="outline"
                            className="h-14 font-black text-xs tracking-tighter rounded-2xl border-2 border-slate-200 dark:border-white/10 hover:border-blue-500 hover:bg-blue-500/5 hover:text-blue-600 transition-all uppercase"
                            onClick={() => transform(btn.type as any)}
                        >
                            <Type className="mr-2 h-4 w-4" />
                            {btn.label}
                        </Button>
                    ))}
                </div>

                <Button
                    className="w-full h-16 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-lg shadow-xl shadow-blue-500/20 group"
                    onClick={copyToClipboard}
                >
                    {copied ? (
                        <><Check className="mr-2 h-5 w-5" /> Copied!</>
                    ) : (
                        <><Copy className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" /> Copy Transformation</>
                    )}
                </Button>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-3xl p-8 border border-blue-100 dark:border-blue-900/30">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white">
                        <ArrowLeftRight size={20} />
                    </div>
                    <div>
                        <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">Pro Tips</h3>
                        <p className="text-xs text-slate-500">Efficiency for editors and developers</p>
                    </div>
                </div>
                <ul className="grid md:grid-cols-3 gap-6 text-sm text-slate-600 dark:text-slate-400 font-medium">
                    <li className="flex gap-3">
                        <span className="text-blue-600 font-black">01</span>
                        Use "Title Case" for blog headings and "Sentence Case" for paragraphs.
                    </li>
                    <li className="flex gap-3">
                        <span className="text-blue-600 font-black">02</span>
                        "Inverse Case" is great for fixing accidental Caps Lock errors in messages.
                    </li>
                    <li className="flex gap-3">
                        <span className="text-blue-600 font-black">03</span>
                        The counter helps track character limits for social media or SEO metadata.
                    </li>
                </ul>
            </div>
        </div>
    );
}
