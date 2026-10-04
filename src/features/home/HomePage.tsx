import React, { useState } from 'react';
import {
  ArrowRight,
  Mic,
  Send,
  BookOpen,
  Sliders,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { Language, NavigationTab, UserProgress } from '../../types';
import { translations } from '../../data/translations';
import { coreLessons } from '../../data/learningContent';
import { voiceController, VoiceState } from '../../services/voiceService';

interface HomePageProps {
  onNavigate: (tab: NavigationTab) => void;
  onAskQuestion: (question: string) => void;
  language: Language;
  userProgress: UserProgress;
  onOpenLesson: (lessonId: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onAskQuestion,
  language,
  userProgress,
  onOpenLesson,
}) => {
  const t = translations[language];
  const [inputText, setInputText] = useState('');
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [voiceError, setVoiceError] = useState<string | null>(null);

  const quickPrompts = [
    { en: 'Explain SIP', hi: 'SIP क्या है समझाइए', mr: 'SIP म्हणजे काय समजावून सांगा' },
    { en: 'What is inflation?', hi: 'मुद्रास्फीति (महंगाई) क्या है?', mr: 'चलनवाढ (महागाई) म्हणजे काय?' },
    { en: 'Why do investments lose money?', hi: 'निवेश में पैसे क्यों डूबते हैं?', mr: 'गुंतवणुकीत पैसे का कमी होतात?' },
    { en: 'What is diversification?', hi: 'डायवर्सिफिकेशन क्या होता है?', mr: 'डायव्हर्सिफिकेशन म्हणजे काय?' },
  ];

  const handleSend = (textToSend?: string) => {
    const q = (textToSend || inputText).trim();
    if (!q) return;
    onAskQuestion(q);
    setInputText('');
  };

  const handleToggleVoice = () => {
    setVoiceError(null);
    if (voiceState === 'listening') {
      voiceController.stopListening();
      setVoiceState('idle');
      return;
    }

    voiceController.setLanguage(language);
    voiceController.startListening(
      (res) => {
        setInputText(res.transcript);
        if (res.isFinal) {
          handleSend(res.transcript);
        }
      },
      (state) => {
        setVoiceState(state);
      },
      (err) => {
        setVoiceError(err);
        setTimeout(() => setVoiceError(null), 5000);
      }
    );
  };

  // Find next or in-progress lesson
  const nextLessonId =
    coreLessons.find((l) => !userProgress.completedLessons.includes(l.id))?.id ||
    coreLessons[0].id;
  const nextLesson = coreLessons.find((l) => l.id === nextLessonId) || coreLessons[0];
  const hasStartedLearning = userProgress.completedLessons.length > 0;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-4 sm:pt-8 pb-24 md:pb-16 flex flex-col gap-6 sm:gap-8">
      {/* ========================================================
          1. HERO HEADLINE & MANIFESTO
         ======================================================== */}
      <section className="text-center sm:text-left flex flex-col gap-2.5 sm:gap-3 max-w-2xl">
        <div className="inline-flex items-center gap-2 self-center sm:self-start text-xs font-semibold tracking-wider text-[#166534] uppercase">
          <span className="w-2 h-2 rounded-full bg-[#166534] animate-pulse" />
          <span>Arth-Saarthi · Financial Companion</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#141716] leading-[1.15] whitespace-pre-line">
          {t.heroHeadline}
        </h1>

        <p className="text-base sm:text-lg text-[#59605C] leading-relaxed">
          {t.heroSubheadline}
        </p>
      </section>

      {/* ========================================================
          2. AI COMMAND BAR (The Primary Anchor)
         ======================================================== */}
      <section aria-label="Ask Arth-Saarthi Command Bar" className="w-full">
        <div className="glass-premium rounded-2xl p-2 sm:p-3 transition-all duration-200 focus-within:ring-2 focus-within:ring-[#166534]/30 focus-within:border-[#166534]/40">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 sm:gap-3"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                voiceState === 'listening'
                  ? t.commandBarListening
                  : t.commandBarPlaceholder
              }
              className="flex-1 bg-transparent px-3 py-2 text-sm sm:text-base text-[#141716] placeholder-[#59605C]/70 focus:outline-none"
            />

            {/* Microphone Button */}
            <button
              type="button"
              onClick={handleToggleVoice}
              aria-label={voiceState === 'listening' ? 'Stop listening' : 'Start voice input'}
              className={`p-2.5 sm:p-3 rounded-xl transition-all cursor-pointer ${
                voiceState === 'listening'
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-black/[0.04] text-[#59605C] hover:text-[#141716] hover:bg-black/[0.07]'
              }`}
            >
              {voiceState === 'listening' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </button>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputText.trim()}
              aria-label="Send message"
              className="p-2.5 sm:p-3 rounded-xl bg-[#141716] text-[#FBFBF9] hover:bg-neutral-800 disabled:opacity-35 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer flex items-center justify-center"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>

          {/* Voice error notice if microphone failed */}
          {voiceError && (
            <div className="mt-2 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 text-xs flex items-center justify-between border border-amber-200">
              <span>{voiceError}</span>
              <button
                type="button"
                onClick={() => setVoiceError(null)}
                className="font-bold ml-2 cursor-pointer"
              >
                ×
              </button>
            </div>
          )}
        </div>

        {/* Quick Prompts (4 crisp suggestions when empty) */}
        {!inputText && (
          <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs text-[#59605C] whitespace-nowrap hidden sm:inline">
              Try asking:
            </span>
            {quickPrompts.map((qp, idx) => {
              const label = (qp as Record<string, string>)[language] || qp.en;
              return (
                <button
                  key={idx}
                  onClick={() => handleSend(label)}
                  className="whitespace-nowrap px-3 py-1.5 rounded-xl bg-white hover:bg-neutral-50 text-[#141716] text-xs font-medium border border-[#E6E4DD] hover:border-neutral-300 transition-all cursor-pointer shadow-2xs"
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* ========================================================
          3. GATEWAYS (Learn · Simulate · Safety)
         ======================================================== */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
        {/* Gateway: Learn */}
        <button
          onClick={() => onNavigate('learn')}
          className="group glass-medium hover:glass-premium p-5 rounded-2xl text-left transition-all duration-200 cursor-pointer flex flex-col justify-between border hover:border-[#166534]/30"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-[#166534]/10 text-[#166534] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-[#141716] mb-1">
              {t.gatewayLearnTitle}
            </h2>
            <p className="text-xs text-[#59605C] leading-relaxed">
              {t.gatewayLearnDesc}
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-[#166534]">
            <span>Explore lessons</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        {/* Gateway: Simulate */}
        <button
          onClick={() => onNavigate('simulate')}
          className="group glass-medium hover:glass-premium p-5 rounded-2xl text-left transition-all duration-200 cursor-pointer flex flex-col justify-between border hover:border-[#166534]/30"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Sliders className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-[#141716] mb-1">
              {t.gatewaySimulateTitle}
            </h2>
            <p className="text-xs text-[#59605C] leading-relaxed">
              {t.gatewaySimulateDesc}
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-[#2563EB]">
            <span>Start simulation</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        {/* Gateway: Safety */}
        <button
          onClick={() => onNavigate('safety')}
          className="group glass-medium hover:glass-premium p-5 rounded-2xl text-left transition-all duration-200 cursor-pointer flex flex-col justify-between border hover:border-[#166534]/30"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-[#D97706]/10 text-[#D97706] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-[#141716] mb-1">
              {t.gatewaySafetyTitle}
            </h2>
            <p className="text-xs text-[#59605C] leading-relaxed">
              {t.gatewaySafetyDesc}
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-[#D97706]">
            <span>Audit message</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </section>

      {/* ========================================================
          4. CONTINUE LEARNING (Compact single progress card)
         ======================================================== */}
      <section className="w-full">
        <div className="glass-light rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-[#E6E4DD]">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white border border-[#E6E4DD] flex items-center justify-center text-[#166534] shadow-2xs shrink-0">
              {hasStartedLearning ? (
                <CheckCircle2 className="w-5 h-5 text-[#166534]" />
              ) : (
                <Sparkles className="w-5 h-5 text-[#D97706]" />
              )}
            </div>

            <div>
              <span className="text-xs font-medium text-[#59605C]">
                {hasStartedLearning ? t.continueLearning : 'Recommended for you'}
              </span>
              <h3 className="text-sm sm:text-base font-bold text-[#141716]">
                {nextLesson.title}
              </h3>
              <p className="text-xs text-[#59605C] line-clamp-1">
                {nextLesson.oneLiner}
              </p>
            </div>
          </div>

          <button
            onClick={() => onOpenLesson(nextLesson.id)}
            className="self-start sm:self-center px-4 py-2 rounded-xl bg-white hover:bg-neutral-50 text-[#141716] border border-[#E6E4DD] text-xs font-semibold transition-all cursor-pointer shrink-0 shadow-2xs flex items-center gap-1.5"
          >
            <span>
              {hasStartedLearning
                ? `Continue (${userProgress.completedLessons.length}/8)`
                : t.startBasics}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>
    </div>
  );
};
