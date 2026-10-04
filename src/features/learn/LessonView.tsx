import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  BookOpen,
  AlertCircle,
} from 'lucide-react';
import { Lesson, Language } from '../../types';
import { translations } from '../../data/translations';

interface LessonViewProps {
  lesson: Lesson;
  onBack: () => void;
  onComplete: (lessonId: string, passedQuiz: boolean) => void;
  isCompleted: boolean;
  onNextLesson?: () => void;
  language: Language;
}

export const LessonView: React.FC<LessonViewProps> = ({
  lesson,
  onBack,
  onComplete,
  isCompleted,
  onNextLesson,
  language,
}) => {
  const t = translations[language];
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasSubmittedQuiz, setHasSubmittedQuiz] = useState<boolean>(isCompleted);
  const [isCorrect, setIsCorrect] = useState<boolean>(isCompleted);

  const handleSelectOption = (idx: number) => {
    if (hasSubmittedQuiz && isCorrect) return; // already completed
    setSelectedOption(idx);
  };

  const handleCheckQuiz = () => {
    if (selectedOption === null) return;
    const correct = selectedOption === lesson.question.correctIndex;
    setIsCorrect(correct);
    setHasSubmittedQuiz(true);
    if (correct) {
      onComplete(lesson.id, true);
    }
  };

  return (
    <article className="w-full max-w-3xl mx-auto px-4 sm:px-6 pt-4 pb-24 md:pb-16 flex flex-col gap-6 animate-in fade-in duration-200">
      {/* Top Breadcrumb Nav */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E6E4DD]">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-[#59605C] hover:text-[#141716] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.backToTopics}</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-[#59605C]">
          <span>{lesson.category}</span>
          <span aria-hidden="true">·</span>
          <span>{lesson.readTime} read</span>
          {isCompleted && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-[#166534] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Completed</span>
              </span>
            </>
          )}
        </div>
      </div>

      {/* Lesson Header */}
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-[#141716] tracking-tight">
          {lesson.title}
        </h1>
        <p className="text-base text-[#59605C] leading-relaxed">
          {lesson.oneLiner}
        </p>
      </header>

      {/* Main Lesson Content Cards */}
      <div className="flex flex-col gap-5">
        {/* 1. Simple Explanation */}
        <section className="glass-medium rounded-2xl p-5 sm:p-6 border border-[#E6E4DD]">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#166534] mb-2.5">
            01. Simple Explanation
          </h2>
          <p className="text-sm sm:text-base text-[#141716] leading-relaxed">
            {lesson.content.simpleExplanation}
          </p>
        </section>

        {/* 2. Real-World Indian Example */}
        <section className="glass-light rounded-2xl p-5 sm:p-6 border border-[#E6E4DD] bg-[#F7F7F2]/60">
          <div className="flex items-center gap-2 mb-2.5">
            <BookOpen className="w-4 h-4 text-[#D97706]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#D97706]">
              02. Real-World Indian Example
            </h2>
          </div>
          <p className="text-sm sm:text-base text-[#141716] leading-relaxed">
            {lesson.content.realWorldExample}
          </p>
        </section>

        {/* 3. Why It Matters */}
        <section className="glass-medium rounded-2xl p-5 sm:p-6 border border-[#E6E4DD]">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#141716] mb-2.5">
            03. Why It Matters
          </h2>
          <p className="text-sm sm:text-base text-[#59605C] leading-relaxed">
            {lesson.content.whyItMatters}
          </p>
        </section>

        {/* 4. Key Takeaway */}
        <section className="p-4 sm:p-5 rounded-2xl bg-[#166534]/[0.06] border border-[#166534]/20 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-[#166534] shrink-0 mt-0.5" />
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#166534] mb-1">
              Key Takeaway
            </h2>
            <p className="text-sm font-medium text-[#141716] leading-snug">
              {lesson.content.keyTakeaway}
            </p>
          </div>
        </section>

        {/* 5. One Interactive Comprehension Question */}
        <section className="glass-premium rounded-2xl p-5 sm:p-7 border border-[#E6E4DD] shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <HelpCircle className="w-5 h-5 text-[#166534]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#141716]">
              Check Your Understanding
            </h2>
          </div>

          <p className="text-sm sm:text-base font-semibold text-[#141716] mb-4">
            {lesson.question.question}
          </p>

          {/* Options */}
          <div className="flex flex-col gap-2.5 mb-5">
            {lesson.question.options.map((option, idx) => {
              const isSelected = selectedOption === idx;
              let optionStyle = 'border-[#E6E4DD] bg-white hover:border-neutral-300 text-[#141716]';

              if (hasSubmittedQuiz) {
                if (idx === lesson.question.correctIndex) {
                  optionStyle = 'border-[#166534] bg-[#166534]/10 text-[#166534] font-medium';
                } else if (isSelected && !isCorrect) {
                  optionStyle = 'border-rose-300 bg-rose-50 text-rose-800';
                }
              } else if (isSelected) {
                optionStyle = 'border-[#141716] bg-black/[0.04] text-[#141716] font-medium';
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  className={`p-3.5 rounded-xl border text-left text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-between ${optionStyle}`}
                >
                  <span>{option}</span>
                  {hasSubmittedQuiz && idx === lesson.question.correctIndex && (
                    <CheckCircle2 className="w-4 h-4 text-[#166534] shrink-0 ml-2" />
                  )}
                  {hasSubmittedQuiz && isSelected && !isCorrect && (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Feedback & Actions */}
          {!hasSubmittedQuiz ? (
            <button
              onClick={handleCheckQuiz}
              disabled={selectedOption === null}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#141716] hover:bg-neutral-800 text-[#FBFBF9] text-xs sm:text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {t.checkAnswer}
            </button>
          ) : (
            <div className="flex flex-col gap-3">
              <div
                className={`p-3.5 rounded-xl text-xs sm:text-sm border ${
                  isCorrect
                    ? 'bg-[#166534]/10 text-[#166534] border-[#166534]/20'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}
              >
                <span className="font-bold mr-1">
                  {isCorrect ? 'Correct!' : 'Not quite.'}
                </span>
                <span>{lesson.question.explanation}</span>
              </div>

              <div className="flex items-center gap-3">
                {!isCorrect && (
                  <button
                    onClick={() => {
                      setHasSubmittedQuiz(false);
                      setSelectedOption(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-white border border-[#E6E4DD] text-xs font-semibold text-[#141716] hover:bg-neutral-50 transition-all cursor-pointer"
                  >
                    Try again
                  </button>
                )}

                {onNextLesson && (
                  <button
                    onClick={onNextLesson}
                    className="px-5 py-2 rounded-xl bg-[#141716] text-[#FBFBF9] hover:bg-neutral-800 text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5 ml-auto"
                  >
                    <span>{t.nextLesson}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </article>
  );
};
