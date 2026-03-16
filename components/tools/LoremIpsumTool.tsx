'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Copy, RefreshCw, Layers, AlignLeft, Hash, Check } from 'lucide-react';
import { toast } from 'sonner';

const LOREM_DB = [
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ",
    "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ",
    "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. ",
    "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. ",
    "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. ",
    "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. ",
    "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. ",
    "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. ",
    "Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? ",
    "Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?"
];

export function LoremIpsumTool() {
    const [amount, setAmount] = useState(3);
    const [type, setType] = useState<'paragraphs' | 'sentences' | 'words'>('paragraphs');
    const [output, setOutput] = useState('');
    const [copied, setCopied] = useState(false);

    const generate = () => {
        let result = '';
        if (type === 'paragraphs') {
            const p = [];
            for (let i = 0; i < amount; i++) {
                p.push(LOREM_DB.join(' '));
            }
            result = p.join('\n\n');
        } else if (type === 'sentences') {
            const s = [];
            for (let i = 0; i < amount; i++) {
                s.push(LOREM_DB[i % LOREM_DB.length]);
            }
            result = s.join(' ');
        } else {
            const w = LOREM_DB.join(' ').split(' ');
            result = w.slice(0, amount).join(' ');
        }
        setOutput(result);
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

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Card className="p-8 border-none bg-slate-900 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -mr-32 -mt-32" />
                <div className="relative z-10 flex flex-col lg:row items-center justify-between gap-8">
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <div className="flex bg-white/5 p-2 rounded-2xl border border-white/10">
                            {['paragraphs', 'sentences', 'words'].map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setType(t as any)}
                                    className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${type === t ? 'bg-white text-black shadow-lg' : 'text-slate-400 hover:text-white'
                                        }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/10">
                            <button onClick={() => setAmount(Math.max(1, amount - 1))} className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 rounded-lg font-black">-</button>
                            <span className="text-xl font-black text-blue-500 w-12 text-center tabular-nums">{amount}</span>
                            <button onClick={() => setAmount(amount + 1)} className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 rounded-lg font-black">+</button>
                        </div>
                    </div>

                    <Button
                        onClick={generate}
                        className="h-16 px-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-lg shadow-xl shadow-blue-500/40"
                    >
                        <RefreshCw className="mr-2 h-5 w-5" /> Generate Text
                    </Button>
                </div>
            </Card>

            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <AlignLeft size={16} className="text-blue-500" />
                        Preview Area
                    </h3>
                    <Button variant="ghost" size="sm" onClick={copyToClipboard} className="h-10 px-4 text-slate-500 hover:text-blue-500 font-bold border-2 border-slate-100 dark:border-white/5 rounded-xl">
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                        <span className="ml-2">{copied ? 'Copied' : 'Copy Text'}</span>
                    </Button>
                </div>
                <Card className="border-2 border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/50 rounded-[2.5rem] shadow-sm overflow-hidden min-h-[400px]">
                    <div className="p-10 text-xl font-medium leading-[1.8] text-slate-600 dark:text-slate-300 whitespace-pre-wrap selection:bg-blue-500/20">
                        {output || <div className="text-center py-20 opacity-30 italic">Click generate to create dummy text...</div>}
                    </div>
                </Card>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {[
                    { title: 'Typeface Testing', desc: 'Perfect for checking line heights and font pairings.', icon: Hash },
                    { title: 'Layout Padding', desc: 'Fill empty components to visualize true spacing.', icon: Layers },
                    { title: 'Standard Origin', desc: 'Uses the classic Cicero text for standard testing.', icon: AlignLeft },
                ].map((feat, i) => (
                    <div key={i} className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-white/5 space-y-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                            <feat.icon size={20} />
                        </div>
                        <h5 className="font-black text-slate-900 dark:text-white uppercase text-xs tracking-wider">{feat.title}</h5>
                        <p className="text-sm text-slate-500 leading-relaxed font-medium">{feat.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
