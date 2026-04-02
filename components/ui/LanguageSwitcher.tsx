'use client';

import { useState, useRef, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/lib/navigation';
import { Button } from '@/components/ui/Button';
import { locales } from '@/lib/navigation';
import { trackLocaleSwitch } from '@/lib/analytics';
import { Languages, ChevronDown } from 'lucide-react';

export function LanguageSwitcher() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    const handleLanguageChange = (newLocale: string) => {
        if (newLocale !== locale) {
            trackLocaleSwitch(locale, newLocale);
            router.replace(pathname, { locale: newLocale });
        }
        setIsOpen(false);
    };

    const localeNames: Record<string, string> = {
        en: 'English',
        es: 'Español',
        hi: 'हिन्दी',
        zh: '中文',
        ja: '日本語',
        ko: '한국어',
        fr: 'Français',
        de: 'Deutsch',
        it: 'Italiano',
        pt: 'Português',
        ru: 'Русский',
        ar: 'العربية',
        ur: 'اردو',
        ms: 'Bahasa Melayu',
        id: 'Bahasa Indonesia',
        tr: 'Türkçe',
        vi: 'Tiếng Việt',
        bn: 'বাংলা',
        he: 'עברית',
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
                className="gap-2 px-3 rounded-xl border border-slate-200 bg-white/50 backdrop-blur-sm hover:bg-white transition-all shadow-sm"
            >
                <Languages className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-700 uppercase">{locale}</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </Button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 max-h-[60vh] overflow-y-auto custom-scrollbar bg-white rounded-2xl p-2 border border-slate-100 shadow-2xl z-[100] animate-in fade-in zoom-in-95 duration-200">
                    {locales.map((l) => (
                        <button
                            key={l}
                            onClick={() => handleLanguageChange(l)}
                            className={`w-full flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-bold transition-colors ${locale === l
                                ? 'bg-blue-50 text-blue-600'
                                : 'text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            <span>{localeNames[l] || l.toUpperCase()}</span>
                            {locale === l && <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
