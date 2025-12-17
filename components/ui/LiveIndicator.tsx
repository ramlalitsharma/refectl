'use client';

import { motion } from 'framer-motion';

export function LiveIndicator() {
    return (
        <div className="flex items-center gap-2 px-2 py-1 bg-red-50 rounded-full border border-red-100">
            <span className="relative flex h-2 w-2">
                <motion.span
                    animate={{ scale: [1, 1.5, 1], opacity: [0.7, 0, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"
                />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
            </span>
            <span className="text-[10px] font-bold tracking-wider text-red-600 uppercase">
                Live
            </span>
        </div>
    );
}
