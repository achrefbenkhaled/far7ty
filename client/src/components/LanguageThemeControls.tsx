import React, { useState, useRef, useEffect } from 'react';
import { useLanguageTheme, Language } from '../context/LanguageThemeContext';
import { Sun, Moon, Globe, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const LanguageThemeControls: React.FC = () => {
  const { language, theme, setLanguage, toggleTheme, isRtl } = useLanguageTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languagesInfo: Record<Language, { label: string; sub: string; flag: string }> = {
    en: { label: 'English', sub: 'EN', flag: '🇺🇸' },
    fr: { label: 'Français', sub: 'FR', flag: '🇫🇷' },
    ar: { label: 'العربية', sub: 'AR', flag: '🇦🇪' },
    tn: { label: 'تونسي', sub: 'TN', flag: '🇹🇳' },
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectLanguage = (lang: Language) => {
    setLanguage(lang);
    setDropdownOpen(false);
  };

  return (
    <div className="flex items-center gap-2.5">
      {/* Dark/Night Mode Switcher */}
      <motion.button
        type="button"
        onClick={toggleTheme}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100/80 text-slate-700 hover:bg-slate-200/80 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white border border-slate-200/60 dark:border-white/10 shadow-sm backdrop-blur transition-colors"
        aria-label="Toggle Night Mode"
      >
        <AnimatePresence mode="wait" initial={false}>
          {theme === 'dark' ? (
            <motion.div
              key="sun"
              initial={{ rotate: -90, opacity: 0, scale: 0.8 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.25 }}
            >
              <Sun className="h-5 w-5 text-amber-400" />
            </motion.div>
          ) : (
            <motion.div
              key="moon"
              initial={{ rotate: 90, opacity: 0, scale: 0.8 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: -90, opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.25 }}
            >
              <Moon className="h-5 w-5 text-indigo-500" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Language Switcher */}
      <div className="relative" ref={dropdownRef}>
        <motion.button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex h-10 items-center gap-2 rounded-xl bg-slate-100/80 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200/80 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white border border-slate-200/60 dark:border-white/10 shadow-sm backdrop-blur transition-colors"
        >
          <Globe className="h-4 w-4" />
          <span>{languagesInfo[language].sub}</span>
          <ChevronDown className={`h-3 w-3 opacity-60 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
        </motion.button>

        <AnimatePresence>
          {dropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className={`absolute mt-2 w-40 overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-1.5 shadow-xl dark:border-white/10 dark:bg-slate-900/95 backdrop-blur z-50 ${
                isRtl ? 'left-0 origin-top-left' : 'right-0 origin-top-right'
              }`}
            >
              {(Object.keys(languagesInfo) as Language[]).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => selectLanguage(lang)}
                  className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs font-medium transition-colors ${
                    language === lang
                      ? 'bg-brand-50 text-brand-600 dark:bg-pink-500/10 dark:text-pink-300'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2 text-left">
                    <span className="text-base select-none">{languagesInfo[lang].flag}</span>
                    <span>{languagesInfo[lang].label}</span>
                  </div>
                  {language === lang && <Check className="h-3.5 w-3.5 flex-shrink-0" />}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
