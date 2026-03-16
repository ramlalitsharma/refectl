'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Copy, Trash2, Lock, ShieldCheck, Fingerprint, Zap } from 'lucide-react';
import { toast } from 'sonner';

export function HashGeneratorTool() {
    const [input, setInput] = useState('');
    const [hashes, setHashes] = useState<{ sha256: string; sha512: string; sha1: string }>({ sha256: '', sha512: '', sha1: '' });
    const [loading, setLoading] = useState(false);

    const generateHashes = async () => {
        if (!input) return;
        setLoading(true);
        try {
            const msgBuffer = new TextEncoder().encode(input);

            const hashBuffer256 = await crypto.subtle.digest('SHA-256', msgBuffer);
            const hashArray256 = Array.from(new Uint8Array(hashBuffer256));
            const hashHex256 = hashArray256.map(b => b.toString(16).padStart(2, '0')).join('');

            const hashBuffer512 = await crypto.subtle.digest('SHA-512', msgBuffer);
            const hashArray512 = Array.from(new Uint8Array(hashBuffer512));
            const hashHex512 = hashArray512.map(b => b.toString(16).padStart(2, '0')).join('');

            const hashBuffer1 = await crypto.subtle.digest('SHA-1', msgBuffer);
            const hashArray1 = Array.from(new Uint8Array(hashBuffer1));
            const hashHex1 = hashArray1.map(b => b.toString(16).padStart(2, '0')).join('');

            setHashes({
                sha256: hashHex256,
                sha512: hashHex512,
                sha1: hashHex1
            });
            toast.success('Hashes generated');
        } catch (e) {
            toast.error('Hashing failed');
        } finally {
            setLoading(false);
        }
    };

    const copyHash = async (hash: string) => {
        if (!hash) return;
        try {
            await navigator.clipboard.writeText(hash);
            toast.success('Hash copied!');
        } catch (err) {
            toast.error('Failed to copy');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Source Content</h3>
                    <Button variant="ghost" size="sm" onClick={() => setInput('')} className="h-8 w-8 p-0 text-slate-400 hover:text-red-500">
                        <Trash2 size={14} />
                    </Button>
                </div>
                <Card className="border-2 border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm overflow-hidden">
                    <textarea
                        className="w-full h-[200px] p-8 bg-transparent resize-none focus:outline-none text-lg font-medium leading-relaxed dark:text-slate-200 placeholder:opacity-30"
                        placeholder="Enter string to hash securely using industry-standard algorithms..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                </Card>
            </div>

            <Button
                onClick={generateHashes}
                disabled={loading || !input}
                className="w-full h-16 rounded-2xl bg-black text-white font-black text-lg shadow-xl hover:bg-slate-800 transition-all disabled:opacity-50"
            >
                <Zap className={`mr-2 h-5 w-5 ${loading ? 'animate-spin' : ''}`} /> {loading ? 'COMPUTING...' : 'GENERATE CHECKSUMS'}
            </Button>

            <div className="space-y-4">
                {[
                    { id: 'SHA-256', value: hashes.sha256, icon: ShieldCheck, color: 'text-blue-500', desc: 'Secure Hash Algorithm 256-bit' },
                    { id: 'SHA-512', value: hashes.sha512, icon: Fingerprint, color: 'text-purple-500', desc: 'Secure Hash Algorithm 512-bit' },
                    { id: 'SHA-1', value: hashes.sha1, icon: Lock, color: 'text-orange-500', desc: 'Legacy Compatibility Hash' }
                ].map((algo) => (
                    <Card key={algo.id} className="border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl hover:border-blue-500/30 transition-all group">
                        <div className="flex flex-col md:row items-center justify-between gap-6">
                            <div className="flex items-center gap-5">
                                <div className={`w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center ${algo.color}`}>
                                    <algo.icon size={24} />
                                </div>
                                <div>
                                    <h4 className="font-black text-slate-900 dark:text-white flex items-center gap-2">
                                        {algo.id}
                                        <span className="text-[10px] bg-slate-200 dark:bg-white/10 px-2 py-0.5 rounded-full text-slate-500 uppercase">HEX</span>
                                    </h4>
                                    <p className="text-xs text-slate-500 font-medium">{algo.desc}</p>
                                </div>
                            </div>
                            <div className="flex-1 max-w-full overflow-hidden">
                                <div className="bg-white dark:bg-black/20 p-4 rounded-xl font-mono text-xs break-all selection:bg-blue-500/20 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-white/5">
                                    {algo.value || 'Wait for generation...'}
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyHash(algo.value)}
                                className="h-10 px-4 text-slate-400 hover:text-blue-600"
                            >
                                <Copy size={16} />
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="bg-emerald-600 rounded-[2.5rem] p-10 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-24 -mt-24" />
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
                        <ShieldCheck size={32} />
                    </div>
                    <div>
                        <h4 className="text-2xl font-black uppercase tracking-tighter">Secure Local Execution</h4>
                        <p className="text-emerald-100 font-medium">Your data never leaves your computer. All cryptographic computation happens locally within your browser's secure context.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
