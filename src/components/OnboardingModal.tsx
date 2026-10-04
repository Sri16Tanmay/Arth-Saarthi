import React, { useState } from 'react';
import { Sparkles, Shield, Compass, Check, ArrowRight, X } from 'lucide-react';
import { Language } from '../types';
import { Logo } from './Logo';
import { LanguageSelector } from './LanguageSelector';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
  selectedLanguage: Language;
  onSelectLanguage: (lang: Language) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onComplete,
  selectedLanguage,
  onSelectLanguage,
}) => {
  const [step, setStep] = useState<number>(1);

  if (!isOpen) return null;

  const screens = [
    {
      title: 'Understand money simply.',
      subtitle:
        'Zero jargon, real Indian examples, and core principles explained like a conversation with a trusted friend.',
      icon: Compass,
      tag: '01 / 03',
    },
    {
      title: 'Experience risk without risking real money.',
      subtitle:
        'Test how market crashes, high inflation, and economic downturns affect investments using ₹1,00,000 simulated capital.',
      icon: Shield,
      tag: '02 / 03',
    },
    {
      title: "Learn in a language you're comfortable with.",
      subtitle:
        'Finance should speak your language. Switch between English, Hindi, and Marathi at any time.',
      icon: Sparkles,
      tag: '03 / 03',
    },
  ];

  const current = screens[step - 1];
  const IconComponent = current.icon;

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs transition-opacity duration-200"
    >
      <div className="relative w-full max-w-md glass-premium rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/80 animate-in fade-in duration-200">
        {/* Top bar with Step Indicator & Skip */}
        <div className="flex items-center justify-between pb-4 border-b border-black/[0.06]">
          <span className="text-xs font-mono tracking-wider text-[#59605C]">
            {current.tag}
          </span>
          <button
            onClick={onComplete}
            className="text-xs font-medium text-[#59605C] hover:text-[#141716] p-1 cursor-pointer flex items-center gap-1"
          >
            <span>Skip</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="py-6 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#166534]/10 text-[#166534] flex items-center justify-center mb-5 border border-[#166534]/20 shadow-xs">
            <IconComponent className="w-8 h-8" />
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#141716] mb-2 leading-snug">
            {current.title}
          </h2>

          <p className="text-sm text-[#59605C] leading-relaxed max-w-sm mb-6">
            {current.subtitle}
          </p>

          {/* If Step 3, show Language Selector buttons */}
          {step === 3 && (
            <div className="flex flex-col gap-2.5 w-full mb-6">
              <div className="grid grid-cols-3 gap-2 w-full">
                {[
                  { code: 'en' as Language, label: 'English', sub: 'Default' },
                  { code: 'hi' as Language, label: 'हिन्दी', sub: 'Hindi' },
                  { code: 'mr' as Language, label: 'मराठी', sub: 'Marathi' },
                ].map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => onSelectLanguage(lang.code)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedLanguage === lang.code
                        ? 'border-[#166534] bg-[#166534]/5 text-[#166534] shadow-xs'
                        : 'border-[#E6E4DD] bg-white text-[#141716] hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm">{lang.label}</span>
                      {selectedLanguage === lang.code && (
                        <Check className="w-3.5 h-3.5 text-[#166534]" />
                      )}
                    </div>
                    <span className="text-[11px] text-[#59605C]">{lang.sub}</span>
                  </button>
                ))}
              </div>

              {/* Or choose from all 21 languages */}
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-neutral-50 border border-[#E6E4DD] text-xs">
                <span className="text-[#59605C] font-medium">Or choose from 21 languages:</span>
                <LanguageSelector
                  currentLanguage={selectedLanguage}
                  onSelectLanguage={onSelectLanguage}
                  compact={true}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex items-center justify-between">
          {/* Step dots */}
          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((dot) => (
              <span
                key={dot}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  dot === step ? 'w-6 bg-[#166534]' : 'w-1.5 bg-[#E6E4DD]'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#141716] text-[#FBFBF9] hover:bg-neutral-800 text-sm font-semibold transition-all shadow-xs cursor-pointer"
          >
            <span>{step === 3 ? 'Get Started' : 'Next'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
