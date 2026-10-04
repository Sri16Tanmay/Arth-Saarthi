import React from 'react';
import {
  Home,
  BookOpen,
  MessageSquare,
  Sliders,
  ShieldCheck,
  User,
} from 'lucide-react';
import { Language, NavigationTab } from '../types';
import { translations } from '../data/translations';
import { Logo } from './Logo';
import { LanguageSelector } from './LanguageSelector';

interface NavigationProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenProfile: () => void;
  literacyScore: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  language,
  onLanguageChange,
  onOpenProfile,
  literacyScore,
}) => {
  const t = translations[language];

  const navItems: { id: NavigationTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'home', label: t.navHome, icon: Home },
    { id: 'learn', label: t.navLearn, icon: BookOpen },
    { id: 'ask', label: t.navAsk, icon: MessageSquare },
    { id: 'simulate', label: t.navSimulate, icon: Sliders },
    { id: 'safety', label: t.navSafety, icon: ShieldCheck },
  ];

  return (
    <>
      {/* ========================================================
          DESKTOP FLOATING GLASS TOP NAVIGATION (md and up)
         ======================================================== */}
      <header className="hidden md:block sticky top-3 z-40 px-4 sm:px-6 max-w-6xl mx-auto w-full transition-all duration-200">
        <nav
          aria-label="Primary Desktop Navigation"
          className="glass-premium rounded-2xl px-5 py-3 flex items-center justify-between"
        >
          {/* Logo Brand on left */}
          <button
            onClick={() => onSelectTab('home')}
            className="cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#166534] rounded-lg"
          >
            <Logo size="md" />
          </button>

          {/* Navigation Items in center */}
          <div className="flex items-center gap-1 bg-[#141716]/[0.03] p-1 rounded-xl border border-black/[0.04]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-white text-[#141716] shadow-xs'
                      : 'text-[#59605C] hover:text-[#141716] hover:bg-black/[0.02]'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-[#166534]' : 'text-[#59605C]'
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Action: Language Selector & Profile Score */}
          <div className="flex items-center gap-3">
            {/* Direct Top Language Selector [ EN ▾ ] */}
            <LanguageSelector
              currentLanguage={language}
              onSelectLanguage={onLanguageChange}
            />

            {/* Profile / Literacy Score Trigger */}
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#166534]/[0.08] hover:bg-[#166534]/[0.14] text-[#166534] border border-[#166534]/20 transition-all cursor-pointer"
              title="View Literacy Score & Settings"
            >
              <User className="w-3.5 h-3.5 text-[#166534]" />
              <span>{literacyScore}/100</span>
            </button>
          </div>
        </nav>
      </header>

      {/* ========================================================
          MOBILE TOP SLIM APP BAR (Logo + Language + Profile)
         ======================================================== */}
      <header className="md:hidden sticky top-0 z-30 px-4 pt-2.5 pb-2 glass-premium border-b border-black/[0.05]">
        <div className="flex items-center justify-between">
          <button
            onClick={() => onSelectTab('home')}
            className="cursor-pointer text-left focus:outline-none"
          >
            <Logo size="sm" showWordmark={true} />
          </button>

          <div className="flex items-center gap-2">
            {/* Mobile Top Compact Language Selector [ EN ▾ ] */}
            <LanguageSelector
              compact={true}
              currentLanguage={language}
              onSelectLanguage={onLanguageChange}
            />

            {/* Profile button */}
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-[#166534]/10 text-[#166534] cursor-pointer"
            >
              <User className="w-3.5 h-3.5" />
              <span>{literacyScore}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================
          MOBILE FLOATING GLASS BOTTOM NAVIGATION
         ======================================================== */}
      <nav
        aria-label="Primary Mobile Navigation"
        className="md:hidden fixed bottom-3 left-3 right-3 z-40 max-w-md mx-auto"
      >
        <div className="glass-premium rounded-2xl px-2 py-1.5 shadow-lg border border-white/80">
          <div className="grid grid-cols-5 gap-1 items-center">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-[#141716] text-[#FBFBF9]'
                      : 'text-[#59605C] hover:text-[#141716]'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 transition-transform ${
                      isActive ? 'text-[#FBFBF9] scale-105' : 'text-[#59605C]'
                    }`}
                  />
                  <span
                    className={`text-[11px] mt-0.5 tracking-tight font-medium ${
                      isActive ? 'text-[#FBFBF9]' : 'text-[#59605C]'
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
};
