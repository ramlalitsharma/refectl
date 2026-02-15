'use client';

import { motion, MotionProps, useReducedMotion } from 'framer-motion';
import React from 'react';

/**
 * FadeIn Animation
 */
export function FadeIn({ children, delay = 0, className, ...rest }: { children: React.ReactNode; delay?: number; className?: string } & MotionProps) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.4, ease: 'easeOut', delay }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/**
 * ScaleIn Animation
 */
export function ScaleIn({ children, delay = 0, className, ...rest }: { children: React.ReactNode; delay?: number; className?: string } & MotionProps) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.25, ease: 'easeOut', delay }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/**
 * ScaleOnHover Interaction
 */
export function ScaleOnHover({ children, className, ...rest }: { children: React.ReactNode; className?: string } & MotionProps) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      whileHover={reduceMotion ? undefined : { scale: 1.02 }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.18 }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
