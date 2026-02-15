'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { motion } from 'framer-motion';

export default function RoleSelectionPage() {
    const t = useTranslations('Common');
    const router = useRouter();
    const [selectedRole, setSelectedRole] = useState<'student' | 'user' | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleRoleSelect = async () => {
        if (!selectedRole) return;
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/user/role/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: selectedRole }),
            });

            if (response.ok) {
                router.push('/dashboard');
            } else {
                console.error('Failed to update role');
            }
        } catch (error) {
            console.error('Error updating role:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-elite-bg flex items-center justify-center p-4">
            <div className="max-w-4xl w-full">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4">
                        Initialize Your <span className="text-elite-accent-cyan">Identity</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-lg uppercase font-bold tracking-[0.2em]">
                        Select your primary objective on Refectl
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Student Role */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedRole('student')}
                        className={`cursor-pointer group relative ${selectedRole === 'student' ? 'ring-2 ring-elite-accent-cyan' : ''
                            }`}
                    >
                        <div className={`glass-card-premium rounded-[2.5rem] p-8 h-full transition-all ${selectedRole === 'student' ? 'bg-elite-accent-cyan/10 border-elite-accent-cyan/50' : ''
                            }`}>
                            <div className="text-6xl mb-6 group-hover:scale-110 transition-transform">🎓</div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-widest mb-3">Academic Node</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
                                Access adaptive courses, track learning progress, and master your subjects with AI-powered insights.
                            </p>
                            {selectedRole === 'student' && (
                                <div className="absolute top-6 right-6 w-8 h-8 bg-elite-accent-cyan rounded-full flex items-center justify-center animate-in zoom-in-0 duration-300">
                                    <span className="text-white text-xs">✓</span>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* User Role */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedRole('user')}
                        className={`cursor-pointer group relative ${selectedRole === 'user' ? 'ring-2 ring-elite-accent-purple' : ''
                            }`}
                    >
                        <div className={`glass-card-premium rounded-[2.5rem] p-8 h-full transition-all ${selectedRole === 'user' ? 'bg-elite-accent-purple/10 border-elite-accent-purple/50' : ''
                            }`}>
                            <div className="text-6xl mb-6 group-hover:scale-110 transition-transform">👤</div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-widest mb-3">Standard Node</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
                                Explore tools, read the latest news, and engage with the community while managing your profile.
                            </p>
                            {selectedRole === 'user' && (
                                <div className="absolute top-6 right-6 w-8 h-8 bg-elite-accent-purple rounded-full flex items-center justify-center animate-in zoom-in-0 duration-300">
                                    <span className="text-white text-xs">✓</span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-12 flex justify-center"
                >
                    <Button
                        size="xl"
                        disabled={!selectedRole || isSubmitting}
                        onClick={handleRoleSelect}
                        className={`min-w-[300px] rounded-2xl font-black uppercase tracking-[0.2em] transition-all ${selectedRole === 'student'
                                ? 'bg-elite-accent-cyan hover:shadow-2xl hover:shadow-elite-accent-cyan/20'
                                : selectedRole === 'user'
                                    ? 'bg-elite-accent-purple hover:shadow-2xl hover:shadow-elite-accent-purple/20'
                                    : 'bg-slate-200 dark:bg-white/10 text-slate-400'
                            }`}
                    >
                        {isSubmitting ? 'Initializing Node...' : 'Commit Identity'}
                    </Button>
                </motion.div>
            </div>
        </div>
    );
}
