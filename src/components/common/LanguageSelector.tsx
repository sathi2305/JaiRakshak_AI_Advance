import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown, RefreshCw, Sparkles, Search } from 'lucide-react';
import {
  useLanguage,
  SUPPORTED_LANGUAGES,
  SupportedLanguageCode
} from '../../i18n/LanguageContext';

export const LanguageSelector: React.FC = () => {
  const {
    language,
    setLanguage,
    currentLanguageOption,
    isTranslatingPage,
    translatedNodesCount,
    retranslatePage
  } = useLanguage();

  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSelectLanguage = (code: SupportedLanguageCode) => {
    setLanguage(code);
    setOpen(false);
  };

  // Persistent quick-switch languages visible directly in the header bar
  const quickSwitchCodes: SupportedLanguageCode[] = ['en', 'ta', 'hi'];
  if (!quickSwitchCodes.includes(language)) {
    quickSwitchCodes.push(language);
  }

  const filteredLanguages = SUPPORTED_LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative flex items-center" ref={dropdownRef} data-no-translate="true">
      {/* Persistent Segmented Language Switcher Pill in Header */}
      <div className="flex items-center bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-xl p-0.5 shadow-2xs">
        {/* Quick 1-Click Language Pills */}
        <div className="hidden md:flex items-center gap-0.5 pr-1 border-r border-slate-200 dark:border-slate-800">
          {quickSwitchCodes.map((code) => {
            const opt = SUPPORTED_LANGUAGES.find((l) => l.code === code)!;
            const isActive = language === code;
            return (
              <button
                key={code}
                type="button"
                onClick={() => handleSelectLanguage(code)}
                className={`px-2 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-linear-to-r from-cyan-600 to-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800'
                }`}
                title={`Switch entire app to ${opt.name} (${opt.nativeName})`}
              >
                {opt.shortLabel}
              </button>
            );
          })}
        </div>

        {/* Full Language Switcher Trigger Button */}
        <button
          type="button"
          id="language-selector-btn"
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Open Persistent Multi-Language Switcher (12 Languages)"
          aria-expanded={open}
        >
          {isTranslatingPage ? (
            <RefreshCw className="w-3.5 h-3.5 text-cyan-500 animate-spin shrink-0" />
          ) : (
            <Globe className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
          )}
          <span className="text-[11px]">{currentLanguageOption.flag}</span>
          <span className="text-[11px] font-extrabold text-slate-900 dark:text-white">
            {currentLanguageOption.nativeName}
          </span>
          <ChevronDown
            className={`w-3 h-3 text-slate-400 transition-transform duration-150 ${
              open ? 'rotate-180 text-cyan-500' : ''
            }`}
          />
        </button>
      </div>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-3 z-50 animate-in fade-in zoom-in-95 space-y-2.5">
          {/* Header & Live Translation Status */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                <span>Global App Language</span>
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                Dynamically translates entire application
              </span>
            </div>
            <button
              type="button"
              onClick={() => retranslatePage()}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-cyan-50 dark:hover:bg-cyan-950/60 text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors cursor-pointer"
              title="Re-scan and translate current page content"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTranslatingPage ? 'animate-spin text-cyan-500' : ''}`} />
            </button>
          </div>

          {/* Search Filter */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter language..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-cyan-500"
            />
          </div>

          {/* Language List */}
          <div className="max-h-64 overflow-y-auto space-y-1 pr-0.5 custom-scrollbar">
            {filteredLanguages.map((lang) => {
              const isSelected = lang.code === language;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelectLanguage(lang.code)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-linear-to-r from-cyan-500/15 to-blue-500/15 text-cyan-900 dark:text-cyan-200 font-bold border border-cyan-400/50 shadow-2xs'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 font-medium border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base leading-none">{lang.flag}</span>
                    <div className="text-left">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 dark:text-white leading-tight">
                          {lang.nativeName}
                        </span>
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {lang.code}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {lang.name} • {lang.region}
                      </span>
                    </div>
                  </div>
                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-cyan-600 text-white flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer Status */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isTranslatingPage ? 'bg-amber-400 animate-ping' : 'bg-emerald-500'
                }`}
              />
              <span>
                {isTranslatingPage
                  ? 'Translating page nodes...'
                  : language === 'en'
                  ? 'Original English Active'
                  : `${translatedNodesCount} text nodes translated`}
              </span>
            </span>
            <span className="font-mono text-cyan-600 dark:text-cyan-400 font-semibold">Persistent</span>
          </div>
        </div>
      )}
    </div>
  );
};
