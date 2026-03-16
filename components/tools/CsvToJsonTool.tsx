'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Copy, Trash2, FileJson, Coffee, Braces } from 'lucide-react';
import { toast } from 'sonner';

export function CsvToJsonTool() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [copied, setCopied] = useState(false);

    const convert = () => {
        try {
            const lines = input.trim().split('\n');
            if (lines.length < 2) {
                throw new Error('CSV must have at least a header and one row');
            }

            const headers = lines[0].split(',').map(h => h.trim());
            const res = lines.slice(1).map(line => {
                const values = line.split(',');
                const obj: any = {};
                headers.forEach((header, i) => {
                    let val: any = values[i]?.trim() || "";
                    // Simple number/boolean detection
                    if (!isNaN(val as any) && val !== "") val = Number(val);
                    if (val.toLowerCase() === 'true') val = true;
                    if (val.toLowerCase() === 'false') val = false;
                    obj[header] = val;
                });
                return obj;
            });

            setOutput(JSON.stringify(res, null, 2));
            toast.success('Converted to structured JSON');
        } catch (e: any) {
            toast.error(e.message || 'Invalid CSV format');
        }
    };

    const copyToClipboard = async () => {
        if (!output) return;
        try {
            await navigator.clipboard.writeText(output);
            setCopied(true);
            toast.success('JSON copied!');
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            toast.error('Failed to copy');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">CSV Data (Comma Delimited)</h3>
                        <Button variant="ghost" size="sm" onClick={() => setInput('')} className="h-8 w-8 p-0 text-slate-400 hover:text-red-500">
                            <Trash2 size={14} />
                        </Button>
                    </div>
                    <Card className="border-2 border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 overflow-hidden rounded-[2rem]">
                        <textarea
                            className="w-full h-[400px] p-6 bg-transparent resize-none focus:outline-none text-sm font-mono leading-relaxed"
                            placeholder="id,name,role&#10;1,Alice,Dev&#10;2,Bob,Product"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                    </Card>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-sm font-black text-purple-600 uppercase tracking-wider">JSON Result</h3>
                        <Button variant="ghost" size="sm" onClick={copyToClipboard} className="h-8 w-8 p-0 text-slate-400 hover:text-purple-500">
                            <Copy size={14} />
                        </Button>
                    </div>
                    <Card className="border-2 border-purple-500/20 bg-purple-50/10 dark:bg-purple-900/10 overflow-hidden rounded-[2rem]">
                        <div className="w-full h-[400px] p-6 text-xs font-mono leading-relaxed whitespace-pre overflow-auto scrollbar-hide">
                            {output || <span className="text-slate-400 font-medium italic opacity-50">JSON array will appear here...</span>}
                        </div>
                    </Card>
                </div>
            </div>

            <Button
                onClick={convert}
                className="w-full h-16 rounded-2xl bg-purple-600 text-white font-black text-lg shadow-xl hover:bg-purple-700 transition-all shadow-purple-500/20"
            >
                <Braces className="mr-2 h-5 w-5" /> GENERATE JSON CLUTCH
            </Button>

            <div className="grid md:grid-cols-3 gap-6 p-8 bg-slate-900 rounded-[2.5rem] text-white">
                <div className="space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center font-black">1</div>
                    <h6 className="font-bold text-xs uppercase text-purple-400">Auto-Detection</h6>
                    <p className="text-[11px] text-slate-400">Identifies numbers and booleans automatically from the CSV strings.</p>
                </div>
                <div className="space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-black">2</div>
                    <h6 className="font-bold text-xs uppercase text-emerald-400">Clean Schema</h6>
                    <p className="text-[11px] text-slate-400">Trims whitespace and handles empty cells gracefully for a clean JSON output.</p>
                </div>
                <div className="space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center font-black">3</div>
                    <h6 className="font-bold text-xs uppercase text-blue-400">Developer Ready</h6>
                    <p className="text-[11px] text-slate-400">Output is formatted with 2-space indentation, ready for any local storage or API mocks.</p>
                </div>
            </div>
        </div>
    );
}
