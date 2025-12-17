'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Trophy, Zap, Info } from 'lucide-react';

export interface Toast {
    id: string;
    type: 'success' | 'info' | 'warning' | 'achievement';
    title: string;
    message: string;
    duration?: number;
}

interface ToastContextType {
    addToast: (toast: Omit<Toast, 'id'>) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within a ToastProvider');
    return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = (toast: Omit<Toast, 'id'>) => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { ...toast, id }]);

        if (toast.duration !== 0) {
            setTimeout(() => {
                removeToast(id);
            }, toast.duration || 5000);
        }
    };

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="fixed bottom-6 left-6 z-[60] flex flex-col gap-2 pointer-events-none">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: -50, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: -20, scale: 0.9 }}
                            className="pointer-events-auto min-w-[300px] bg-white border border-slate-200 shadow-xl rounded-xl p-4 flex items-start gap-3 overflow-hidden"
                        >
                            <div className={`mt-1 p-2 rounded-full flex-shrink-0 ${toast.type === 'achievement' ? 'bg-amber-100 text-amber-600' :
                                    toast.type === 'success' ? 'bg-green-100 text-green-600' :
                                        toast.type === 'warning' ? 'bg-red-100 text-red-600' :
                                            'bg-blue-100 text-blue-600'
                                }`}>
                                {toast.type === 'achievement' && <Trophy className="w-4 h-4" />}
                                {toast.type === 'success' && <Zap className="w-4 h-4" />}
                                {toast.type === 'info' && <Bell className="w-4 h-4" />}
                                {toast.type === 'warning' && <Info className="w-4 h-4" />}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold text-slate-800 text-sm">{toast.title}</h4>
                                <p className="text-slate-600 text-xs mt-1">{toast.message}</p>
                            </div>
                            <button
                                onClick={() => removeToast(toast.id)}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>

                            {/* Progress bar for auto-dismiss */}
                            <motion.div
                                initial={{ width: '100%' }}
                                animate={{ width: '0%' }}
                                transition={{ duration: (toast.duration || 5000) / 1000, ease: 'linear' }}
                                className={`absolute bottom-0 left-0 h-1 ${toast.type === 'achievement' ? 'bg-amber-500' :
                                        toast.type === 'success' ? 'bg-green-500' :
                                            'bg-indigo-500'
                                    }`}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}
