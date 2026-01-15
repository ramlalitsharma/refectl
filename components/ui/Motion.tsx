'use client';

import { motion, MotionProps } from 'framer-motion';
import React from 'react';

/**
 * FadeIn Animation
 */
export function FadeIn({ children, delay = 0, ...rest }: { children: React.ReactNode; delay?: number } & MotionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut', delay }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/**
 * ScaleIn Animation
 */
export function ScaleIn({ children, delay = 0, ...rest }: { children: React.ReactNode; delay?: number } & MotionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut', delay }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/**
 * ScaleOnHover Interaction
 */
export function ScaleOnHover({ children, ...rest }: { children: React.ReactNode } & MotionProps) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.15 }} {...rest}>
      {children}
    </motion.div>
  );
}
