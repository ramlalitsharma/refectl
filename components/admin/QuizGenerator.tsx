'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Loader2, Sparkles, Save, Trash2, CheckCircle } from 'lucide-react';

interface GeneratedQuestion {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
}

export default function QuizGenerator() {
    const [topic, setTopic] = useState('');
    const [difficulty, setDifficulty] = useState('medium');
    const [isGenerating, setIsGenerating] = useState(false);
    const [result, setResult] = useState<GeneratedQuestion[] | null>(null);
    const [source, setSource] = useState<'ai' | 'mock' | null>(null);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        if (!topic) return;
        setIsGenerating(true);
        setError('');
        setResult(null);
        setSaved(false);

        try {
            const res = await fetch('/api/admin/content/generate-quiz', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic, difficulty }),
            });

            const data = await res.json();
            if (!data.success) throw new Error(data.error);

            setResult(data.data.questions);
            setSource(data.data.source);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSave = async () => {
        // In a real app, this would POST to /api/admin/content/quests to create a template
        // For now, we just simulate the save action
        setSaved(true);
        setTimeout(() => {
            setTopic('');
            setResult(null);
            setSaved(false);
        }, 2000);
    };

    return (
        <Card className="border-none shadow-lg bg-gradient-to-br from-white to-slate-50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-indigo-700">
                    <Sparkles className="w-6 h-6 text-indigo-500" />
                    AI Quiz Generator
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* Inputs */}
                <div className="flex gap-4 items-end">
                    <div className="flex-1 space-y-2">
                        <label className="text-sm font-medium text-slate-700">Quiz Topic</label>
                        <input
                            type="text"
                            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-200 outline-none"
                            placeholder="e.g., Photosynthesis, The Cold War, JavaScript Arrays..."
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                        />
                    </div>
                    <div className="w-32 space-y-2">
                        <label className="text-sm font-medium text-slate-700">Difficulty</label>
                        <select
                            className="w-full p-3 border rounded-xl outline-none bg-white"
                            value={difficulty}
                            onChange={(e) => setDifficulty(e.target.value)}
                        >
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>
                    </div>
                    <Button
                        onClick={handleGenerate}
                        disabled={isGenerating || !topic}
                        className="h-[50px] px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition-all active:scale-95"
                    >
                        {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Generate'}
                    </Button>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
                        {error}
                    </div>
                )}

                {/* Results Preview */}
                <AnimatePresence>
                    {result && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-4"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-slate-800">
                                    Generated Questions
                                    {source === 'mock' && <span className="ml-2 text-xs font-normal text-amber-600 bg-amber-100 px-2 py-1 rounded-full">Demo Mode (No API Key)</span>}
                                </h3>

                                <Button
                                    onClick={handleSave}
                                    className={`gap-2 ${saved ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-900 hover:bg-slate-800'}`}
                                >
                                    {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                                    {saved ? 'Saved!' : 'Save to Library'}
                                </Button>
                            </div>

                            <div className="grid gap-4">
                                {result.map((q, idx) => (
                                    <div key={idx} className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                                        <div className="flex gap-3">
                                            <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full">
                                                {idx + 1}
                                            </span>
                                            <div className="flex-1 space-y-2">
                                                <p className="font-medium text-slate-800">{q.question}</p>
                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                    {q.options.map((opt, i) => (
                                                        <div
                                                            key={i}
                                                            className={`p-2 rounded-lg border ${i === q.correctAnswer ? 'bg-green-50 border-green-200 text-green-800 font-medium' : 'bg-slate-50 border-slate-100 text-slate-600'}`}
                                                        >
                                                            {opt}
                                                        </div>
                                                    ))}
                                                </div>
                                                <p className="text-xs text-slate-500 italic mt-2">💡 {q.explanation}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    );
}
