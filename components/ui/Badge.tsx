import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'destructive' | 'outline' | 'secondary' | 'inverse';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const baseClasses = 'ui-animate inline-flex items-center font-medium rounded-full';
  
  const variantClasses = {
    default: 'bg-[var(--color-surface-2)] text-[var(--foreground)]',
    success: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
    warning: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
    error: 'bg-rose-500/15 text-rose-700 dark:text-rose-300',
    info: 'bg-sky-500/15 text-sky-700 dark:text-sky-300',
    destructive: 'bg-rose-500/15 text-rose-700 dark:text-rose-300',
    outline: 'border border-[var(--color-border)] text-[var(--color-muted-strong)]',
    secondary: 'bg-[var(--color-surface-3)] text-[var(--foreground)]',
    inverse: 'bg-[var(--foreground)] text-[var(--background)]',
  };
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };
  
  return (
    <span
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </span>
  );
};
