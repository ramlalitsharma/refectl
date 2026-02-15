import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin-check';
import { getDatabase } from '@/lib/mongodb';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Brain, Sparkles, Plus, Search, Filter } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function FlashcardForgePage() {
    const { userId } = await auth();
    if (!userId) redirect('/sign-in');

    try {
        await requireAdmin();
    } catch {
        redirect('/dashboard');
    }

    // Placeholder for flashcard decks until we have a formal schema
    const mockDecks = [
        { id: '1', name: 'Neural Foundations', cards: 42, subject: 'Intelligence' },
        { id: '2', name: 'Quantum Logic', cards: 28, subject: 'Physics' },
        { id: '3', name: 'Elite Vocabulary', cards: 156, subject: 'Linguistics' },
    ];

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-pink-500/30">
            {/* Background Orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-pink-500/5 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] animate-pulse delay-1000" />
            </div>

            <header className="border-b border-white/5 bg-slate-900/40 backdrop-blur-xl sticky top-0 z-50">
                <div className="container mx-auto px-6 py-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 w-fit">
                                <Brain size={12} className="text-pink-400" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-pink-400">Neural Synthesis Studio</span>
                            </div>
                            <h1 className="text-4xl font-black text-white uppercase tracking-tighter">
                                Flashcard <span className="text-pink-500">Forge</span>
                            </h1>
                            <p className="text-sm text-slate-500 font-medium uppercase tracking-[0.1em] max-w-2xl leading-relaxed">
                                Design high-fidelity spaced-repetition modules and neural memory decks for hyper-efficient synchronization.
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button className="rounded-xl border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 px-8 h-12">
                                Forge New Deck
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-12 relative z-10 space-y-12">
                <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {mockDecks.map((deck) => (
                        <Card key={deck.id} className="glass-card-premium border-white/5 rounded-[2.5rem] group hover:border-pink-500/20 transition-all duration-500 overflow-hidden">
                            <CardHeader className="p-8 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="bg-white/5 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-500 border border-white/5 text-pink-400">
                                        <Sparkles size={24} />
                                    </div>
                                    <span className="text-[9px] font-black uppercase bg-pink-500/10 px-3 py-1 rounded-full border border-pink-500/20 text-pink-400">
                                        {deck.cards} Cards
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-black text-white tracking-tight uppercase group-hover:text-pink-400 transition-colors">{deck.name}</h3>
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest leading-relaxed">{deck.subject}</p>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8 pt-0">
                                <Button className="w-full h-12 rounded-2xl bg-white text-slate-950 font-black uppercase text-[10px] tracking-[0.3em] shadow-xl group-hover:bg-pink-500 transition-colors">
                                    Enter Forge →
                                </Button>
                            </CardContent>
                        </Card>
                    ))}

                    <button className="h-full min-h-[300px] border-2 border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 group hover:bg-white/5 hover:border-pink-500/20 transition-all duration-500">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-slate-500 group-hover:scale-110 group-hover:bg-pink-500/10 group-hover:text-pink-400 transition-all duration-500">
                            <Plus size={32} />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-black text-white uppercase tracking-widest">Initialize New Deck</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Deploy New Logic Module</p>
                        </div>
                    </button>
                </section>
            </main>
        </div>
    );
}
