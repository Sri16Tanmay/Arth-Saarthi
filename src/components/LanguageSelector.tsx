import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check, Globe, X } from 'lucide-react';
import { Language } from '../types';
import { SUPPORTED_LANGUAGES, getLanguageConfig } from '../i18n';

interface LanguageSelectorProps {
  currentLanguage: Language;
  onSelectLanguage: (lang: Language) => void;
  compact?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLanguage,
  onSelectLanguage,
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const popoverRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const activeConfig = getLanguageConfig(currentLanguage);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Focus search input on open
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Filter languages based on search query (searches name, nativeName, code)
  const filteredLanguages = SUPPORTED_LANGUAGES.filter((lang) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      lang.name.toLowerCase().includes(q) ||
      lang.nativeName.toLowerCase().includes(q) ||
      lang.code.toLowerCase().includes(q)
    );
  });

  const handleSelect = (code: Language) => {
    onSelectLanguage(code);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="relative inline-block text-left" ref={popoverRef}>
      {/* Trigger Button: [ EN ▾ ] */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Select language"
        className={`flex items-center gap-1.5 rounded-xl border border-[#E6E4DD] bg-white hover:bg-neutral-50 hover:border-neutral-300 text-[#141716] font-semibold transition-all duration-150 cursor-pointer shadow-2xs ${
          compact ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-1.5 text-xs sm:text-sm'
        }`}
      >
        <Globe className="w-3.5 h-3.5 text-[#166534]" />
        <span className="uppercase tracking-wide font-mono font-bold text-xs">
          {activeConfig.code}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[#59605C] transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute right-0 mt-2 w-72 sm:w-80 glass-premium rounded-2xl shadow-xl border border-[#E6E4DD] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header & Search */}
          <div className="p-3 border-b border-[#E6E4DD] bg-white/70">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#166534]">
                Choose Language (21)
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-[#59605C] hover:text-[#141716] p-1"
                aria-label="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-[#59605C] absolute left-3 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Hindi, हिन्दी, ta..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white rounded-lg border border-[#E6E4DD] text-[#141716] placeholder-[#59605C]/70 focus:outline-none focus:ring-1 focus:ring-[#166534]"
              />
            </div>
          </div>

          {/* Languages List */}
          <div className="max-h-72 overflow-y-auto p-1.5 divide-y divide-black/[0.03]">
            {filteredLanguages.length > 0 ? (
              filteredLanguages.map((lang) => {
                const isSelected = lang.code === currentLanguage;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleSelect(lang.code)}
                    role="option"
                    aria-selected={isSelected}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#166534]/10 text-[#166534] font-bold'
                        : 'hover:bg-black/[0.04] text-[#141716]'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold tracking-tight">
                        {lang.nativeName}
                      </span>
                      <span className="text-[11px] text-[#59605C]">
                        {lang.name} · <span className="uppercase font-mono">{lang.code}</span>
                        {lang.direction === 'rtl' ? ' (RTL)' : ''}
                      </span>
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-[#166534] shrink-0 ml-2" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="p-4 text-center text-xs text-[#59605C]">
                No matching languages found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
