'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Copy, Trash2, Database, Download, Check, FileText } from 'lucide-react';
import { toast } from 'sonner';

export function JsonToCsvTool() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [copied, setCopied] = useState(false);

    const convert = () => {
        try {
            const json = JSON.parse(input);
            if (!Array.isArray(json)) {
                throw new Error('Input must be a JSON array of objects');
            }

            if (json.length === 0) {
                setOutput('');
                return;
            }

            const headers = Object.keys(json[0]);
            const csv = [
                headers.join(','),
                ...json.map(row => headers.map(header => JSON.stringify(row[header])).join(','))
            ].join('\n');

            setOutput(csv);
            toast.success('Converted successfully');
        } catch (e: any) {
            toast.error(e.message || 'Invalid JSON format');
        }
    };

    const downloadCsv = () => {
        if (!output) return;
        const blob = new Blob([output], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'data.csv';
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">JSON Input (Array)</h3>
                        <Button variant="ghost" size="sm" onClick={() => setInput('')} className="h-8 w-8 p-0 text-slate-400 hover:text-red-500">
                            <Trash2 size={14} />
                        </Button>
                    </div>
                    <Card className="border-2 border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 overflow-hidden rounded-[2rem]">
                        <textarea
                            className="w-full h-[400px] p-6 bg-transparent resize-none focus:outline-none text-sm font-mono leading-relaxed"
                            placeholder='[{"id": 1, "name": "John"}, {"id": 2, "name": "Jane"}]'
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                    </Card>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-sm font-black text-blue-600 uppercase tracking-wider">CSV Output</h3>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={downloadCsv} title="Download" className="h-8 w-8 p-0 text-slate-400 hover:text-blue-500">
                                <Download size={14} />
                            </Button>
                        </div>
                    </div>
                    <Card className="border-2 border-blue-500/20 bg-blue-50/10 dark:bg-blue-900/10 overflow-hidden rounded-[2rem]">
                        <div className="w-full h-[400px] p-6 text-sm font-mono leading-relaxed whitespace-pre overflow-auto scrollbar-hide">
                            {output || <span className="text-slate-400 font-medium italic opacity-50">CSV data will appear here...</span>}
                        </div>
                    </Card>
                </div>
            </div>

            <Button
                onClick={convert}
                className="w-full h-16 rounded-2xl bg-slate-900 text-white font-black text-lg shadow-xl group hover:bg-blue-600 transition-all"
            >
                <Database className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" /> TRANSFORM TO CSV
            </Button>

            <div className="grid md:grid-cols-2 gap-6 p-8 bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] border border-slate-100 dark:border-white/5">
                <div className="flex gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-blue-600 flex-shrink-0">
                        <FileText size={20} />
                    </div>
                    <div>
                        <h5 className="font-black text-xs uppercase tracking-widest mb-1">Excel Conversion</h5>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed">Instantly bridge the gap between developer data and business spreadsheets. Perfect for quick data migrations.</p>
                    </div>
                </div>
                <div className="flex gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-emerald-600 flex-shrink-0">
                        <Database size={20} />
                    </div>
                    <div>
                        <h5 className="font-black text-xs uppercase tracking-widest mb-1">Schema Flattening</h5>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed">Automatically detects object keys and flattens them into CSV headers for perfect alignment.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
