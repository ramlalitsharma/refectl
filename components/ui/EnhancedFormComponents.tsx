'use client';

import { ReactNode, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
    title?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    showCloseButton?: boolean;
    closeOnBackdrop?: boolean;
    className?: string;
}

export function EnhancedModal({
    isOpen,
    onClose,
    children,
    title,
    size = 'md',
    showCloseButton = true,
    closeOnBackdrop = true,
    className = '',
}: ModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';

            // Focus trap
            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'Escape') {
                    onClose();
                }
            };

            document.addEventListener('keydown', handleKeyDown);
            return () => {
                document.body.style.overflow = 'unset';
                document.removeEventListener('keydown', handleKeyDown);
            };
        }
    }, [isOpen, onClose]);

    if (!mounted || !isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'max-w-7xl',
    };

    return createPortal(
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={closeOnBackdrop ? onClose : undefined}
        >
            {/* Backdrop with blur */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

            {/* Modal */}
            <div
                className={`relative ${sizeClasses[size]} w-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 ${className}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                {(title || showCloseButton) && (
                    <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
                        {title && (
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                                {title}
                            </h2>
                        )}
                        {showCloseButton && (
                            <button
                                onClick={onClose}
                                className="ml-auto w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors btn-lift"
                                aria-label="Close modal"
                            >
                                <svg
                                    className="w-5 h-5 text-slate-600 dark:text-slate-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        )}
                    </div>
                )}

                {/* Content */}
                <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
}

interface FloatingLabelInputProps {
    id: string;
    label: string;
    type?: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
}

export function FloatingLabelInput({
    id,
    label,
    type = 'text',
    value,
    onChange,
    error,
    placeholder = ' ',
    required = false,
    disabled = false,
    className = '',
}: FloatingLabelInputProps) {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className={`relative ${className}`}>
            <input
                id={id}
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={placeholder}
                required={required}
                disabled={disabled}
                className={`
          peer w-full px-4 pt-6 pb-2 rounded-xl border-2 
          bg-white dark:bg-slate-900 
          text-slate-900 dark:text-white
          transition-all duration-200
          ${error
                        ? 'border-red-500 focus:border-red-600'
                        : 'border-slate-200 dark:border-slate-700 focus:border-elite-accent-cyan'
                    }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          focus:outline-none focus:ring-4 focus:ring-elite-accent-cyan/10
        `}
            />
            <label
                htmlFor={id}
                className={`
          absolute left-4 transition-all duration-200 pointer-events-none
          ${value || isFocused
                        ? 'top-2 text-xs font-semibold'
                        : 'top-4 text-base'
                    }
          ${error
                        ? 'text-red-500'
                        : isFocused
                            ? 'text-elite-accent-cyan'
                            : 'text-slate-500 dark:text-slate-400'
                    }
        `}
            >
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {error && (
                <p className="mt-1 text-sm text-red-500 animate-in slide-in-from-top-1 duration-200">
                    {error}
                </p>
            )}
        </div>
    );
}

interface ToastProps {
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
    onClose: () => void;
}

export function Toast({ message, type = 'info', duration = 3000, onClose }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ',
    };

    const colors = {
        success: 'bg-emerald-500',
        error: 'bg-red-500',
        warning: 'bg-amber-500',
        info: 'bg-blue-500',
    };

    return (
        <div className="fixed bottom-8 right-8 z-[9999] animate-in slide-in-from-bottom-4 bounce-in">
            <div className={`${colors[type]} text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 min-w-[300px]`}>
                <span className="text-2xl">{icons[type]}</span>
                <p className="font-semibold flex-1">{message}</p>
                <button
                    onClick={onClose}
                    className="w-6 h-6 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                    aria-label="Close"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

interface TabsProps {
    tabs: { id: string; label: string; icon?: ReactNode }[];
    activeTab: string;
    onChange: (tabId: string) => void;
    className?: string;
}

export function EnhancedTabs({ tabs, activeTab, onChange, className = '' }: TabsProps) {
    return (
        <div className={`flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl ${className}`}>
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onChange(tab.id)}
                    className={`
            flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200
            ${activeTab === tab.id
                            ? 'bg-white dark:bg-slate-900 text-elite-accent-cyan shadow-lg'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }
          `}
                >
                    {tab.icon}
                    <span>{tab.label}</span>
                </button>
            ))}
        </div>
    );
}

interface DropdownProps {
    trigger: ReactNode;
    items: { id: string; label: string; icon?: ReactNode; onClick: () => void }[];
    align?: 'left' | 'right';
    className?: string;
}

export function EnhancedDropdown({ trigger, items, align = 'right', className = '' }: DropdownProps) {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const handleClickOutside = () => setIsOpen(false);
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [isOpen]);

    return (
        <div className={`relative ${className}`}>
            <div onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}>
                {trigger}
            </div>

            {isOpen && (
                <div
                    className={`
            absolute top-full mt-2 min-w-[200px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50
            animate-in fade-in slide-in-from-top-2 duration-200
            ${align === 'right' ? 'right-0' : 'left-0'}
          `}
                    onClick={(e) => e.stopPropagation()}
                >
                    {items.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                item.onClick();
                                setIsOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
                        >
                            {item.icon}
                            <span className="text-slate-900 dark:text-white font-medium">{item.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
