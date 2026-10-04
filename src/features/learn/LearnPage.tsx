import React, { useState } from 'react';
import { CheckCircle2, ChevronRight, BookOpen } from 'lucide-react';
import { Language, UserProgress } from '../../types';
import { coreLessons } from '../../data/learningContent';
import { translations } from '../../data/translations';
import { LessonView } from './LessonView';

interface LearnPageProps {
  language: Language;
  userProgress: UserProgress;
  onUpdateProgress: (lessonId: string, passedQuiz: boolean) => void;
  activeLessonId?: string | null;
  onClearActiveLesson?: () => void;
}

export const LearnPage: React.FC<LearnPageProps> = ({
  language,
  userProgress,
  onUpdateProgress,
  activeLessonId: propActiveLessonId,
  onClearActiveLesson,
}) => {
  const t = translations[language];
  const [internalActiveLessonId, setInternalActiveLessonId] = useState<string | null>(
    propActiveLessonId || null
  );

  const activeId = propActiveLessonId || internalActiveLessonId;
  const currentLesson = coreLessons.find((l) => l.id === activeId);

  const handleSelectLesson = (id: string) => {
    setInternalActiveLessonId(id);
  };

  const handleBack = () => {
    setInternalActiveLessonId(null);
    if (onClearActiveLesson) onClearActiveLesson();
  };

  const handleNextLesson = () => {
    if (!currentLesson) return;
    const currentIndex = coreLessons.findIndex((l) => l.id === currentLesson.id);
    if (currentIndex < coreLessons.length - 1) {
      setInternalActiveLessonId(coreLessons[currentIndex + 1].id);
    } else {
      handleBack();
    }
  };

  if (currentLesson) {
    return (
      <LessonView
        lesson={currentLesson}
        onBack={handleBack}
        onComplete={onUpdateProgress}
        isCompleted={userProgress.completedLessons.includes(currentLesson.id)}
        onNextLesson={handleNextLesson}
        language={language}
      />
    );
  }

  const completedCount = userProgress.completedLessons.length;
  const progressPercent = Math.round((completedCount / coreLessons.length) * 100);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-4 sm:pt-8 pb-24 md:pb-16 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#E6E4DD]">
        <div>
          <div className="text-xs font-semibold tracking-wider text-[#166534] uppercase mb-1">
            Curriculum · 8 Core Principles
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#141716] tracking-tight">
            Learn Financial Fundamentals
          </h1>
          <p className="text-sm text-[#59605C] mt-1 max-w-xl">
            Short, focused lessons designed for first-time Indian investors. No jargon, just practical principles.
          </p>
        </div>

        {/* Progress summary */}
        <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl border border-[#E6E4DD] shrink-0 self-start sm:self-auto shadow-2xs">
          <div className="text-right">
            <span className="text-xs text-[#59605C] block">Completed</span>
            <span className="text-sm font-bold text-[#141716]">
              {completedCount} / {coreLessons.length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#166534]/10 text-[#166534] flex items-center justify-center font-bold text-xs">
            {progressPercent}%
          </div>
        </div>
      </div>

      {/* Grid of 8 Core Topics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
        {coreLessons.map((lesson, idx) => {
          const isDone = userProgress.completedLessons.includes(lesson.id);

          return (
            <button
              key={lesson.id}
              onClick={() => handleSelectLesson(lesson.id)}
              className="glass-medium hover:glass-premium p-5 rounded-2xl text-left border border-[#E6E4DD] hover:border-[#166534]/40 transition-all duration-150 cursor-pointer flex flex-col justify-between group shadow-2xs"
            >
              <div>
                {/* Meta unboxed text: zero pill discipline */}
                <div className="flex items-center justify-between text-xs text-[#59605C] mb-2.5">
                  <span className="font-mono text-[#59605C]">
                    0{idx + 1}. {lesson.category}
                  </span>
                  <span>{lesson.readTime}</span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-[#141716] mb-1.5 group-hover:text-[#166534] transition-colors">
                  {lesson.title}
                </h3>

                <p className="text-xs sm:text-sm text-[#59605C] leading-relaxed line-clamp-2">
                  {lesson.oneLiner}
                </p>
              </div>

              {/* Card Footer */}
              <div className="mt-4 pt-3 border-t border-black/[0.04] flex items-center justify-between">
                {isDone ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#166534]">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Completed</span>
                  </span>
                ) : (
                  <span className="text-xs font-medium text-[#59605C]">
                    Start lesson
                  </span>
                )}

                <div className="w-6 h-6 rounded-lg bg-black/[0.03] group-hover:bg-[#166534]/10 group-hover:text-[#166534] flex items-center justify-center text-[#59605C] transition-colors">
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
