import React from 'react';
import { X, Globe, RotateCcw, Volume2, Award, CheckCircle2, AlertCircle } from 'lucide-react';
import { Language, UserProgress } from '../../types';
import { coreLessons } from '../../data/learningContent';
import { translations } from '../../data/translations';
import { getLanguageConfig } from '../../i18n';
import { LanguageSelector } from '../../components/LanguageSelector';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProgress: UserProgress;
  onLanguageChange: (lang: Language) => void;
  onResetProgress: () => void;
  onToggleVoice: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  userProgress,
  onLanguageChange,
  onResetProgress,
  onToggleVoice,
}) => {
  if (!isOpen) return null;

  const t = translations[userProgress.selectedLanguage];

  // Derive strong and improve topics
  const strongLessons = coreLessons.filter((l) =>
    userProgress.completedLessons.includes(l.id)
  );
  const improveLessons = coreLessons.filter(
    (l) => !userProgress.completedLessons.includes(l.id)
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
    >
      <div className="w-full max-w-md glass-premium rounded-3xl p-6 sm:p-7 shadow-2xl border border-white/80 animate-in fade-in duration-150 flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E6E4DD]">
          <h2 className="text-lg font-bold text-[#141716] tracking-tight">
            {t.profileTitle}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#59605C] hover:text-[#141716] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Educational Literacy Score */}
        <div className="p-4 rounded-2xl bg-white border border-[#E6E4DD] flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-xs text-[#59605C] font-medium block">
              {t.literacyScore}
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-3xl font-black text-[#166534]">
                {userProgress.literacyScore}
              </span>
              <span className="text-xs text-[#59605C]">/ 100</span>
            </div>
            <p className="text-[10px] text-[#59605C] mt-1 max-w-[220px]">
              Educational metric only. Not a credit or financial health score.
            </p>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-[#166534]/10 text-[#166534] flex items-center justify-center font-bold">
            <Award className="w-6 h-6" />
          </div>
        </div>

        {/* 2. Strong & Topics to Explore */}
        <div className="flex flex-col gap-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#166534] mb-1.5 block">
              {t.strongAreas} ({strongLessons.length})
            </span>
            {strongLessons.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {strongLessons.map((l) => (
                  <span
                    key={l.id}
                    className="text-xs text-[#141716] bg-neutral-100 border border-[#E6E4DD] px-2.5 py-1 rounded-lg font-medium"
                  >
                    ✓ {l.title}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-xs text-[#59605C] italic">
                Complete lessons to build understood concepts.
              </span>
            )}
          </div>

          {improveLessons.length > 0 && (
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#D97706] mb-1.5 block">
                {t.areasToImprove} ({improveLessons.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {improveLessons.slice(0, 4).map((l) => (
                  <span
                    key={l.id}
                    className="text-xs text-[#59605C] bg-white border border-[#E6E4DD] px-2.5 py-1 rounded-lg"
                  >
                    · {l.title}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 3. Language Selector */}
        <div className="pt-2 border-t border-[#E6E4DD]">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#141716]">
              {t.languageSelect}
            </label>
            <span className="text-[11px] text-[#59605C]">21 languages available</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-[#E6E4DD] shadow-2xs">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-[#141716]">
                {getLanguageConfig(userProgress.selectedLanguage).nativeName}
              </span>
              <span className="text-xs text-[#59605C]">
                {getLanguageConfig(userProgress.selectedLanguage).name} (
                {getLanguageConfig(userProgress.selectedLanguage).code.toUpperCase()})
              </span>
            </div>
            <LanguageSelector
              currentLanguage={userProgress.selectedLanguage}
              onSelectLanguage={onLanguageChange}
            />
          </div>
        </div>

        {/* 4. Reset & Preferences */}
        <div className="pt-2 border-t border-[#E6E4DD] flex items-center justify-between">
          <button
            onClick={onResetProgress}
            className="text-xs text-rose-700 hover:text-rose-900 font-semibold flex items-center gap-1.5 cursor-pointer py-1.5 px-2 rounded-lg hover:bg-rose-50 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset learning progress</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#141716] text-[#FBFBF9] text-xs font-semibold hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
