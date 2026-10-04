/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Language, NavigationTab, UserProgress } from './types';
import { Navigation } from './components/Navigation';
import { OnboardingModal } from './components/OnboardingModal';
import { HomePage } from './features/home/HomePage';
import { LearnPage } from './features/learn/LearnPage';
import { AskPage } from './features/ask/AskPage';
import { SimulatePage } from './features/simulate/SimulatePage';
import { SafetyPage } from './features/safety/SafetyPage';
import { ProfileModal } from './features/profile/ProfileModal';
import { coreLessons } from './data/learningContent';
import { DEFAULT_LANGUAGE, getLanguageConfig } from './i18n';

const STORAGE_KEY = 'arth_saarthi_user_progress_v2';

export default function App() {
  // Load progress from localStorage, default strictly to English ('en') on first launch
  const [userProgress, setUserProgress] = useState<UserProgress>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          return {
            ...parsed,
            selectedLanguage: parsed.selectedLanguage || DEFAULT_LANGUAGE,
          };
        }
      } catch (e) {
        console.warn('Could not read user progress:', e);
      }
    }
    return {
      completedLessons: ['lesson-1'],
      quizScores: { 'lesson-1': true },
      literacyScore: 24,
      selectedLanguage: DEFAULT_LANGUAGE, // ALWAYS ENGLISH BY DEFAULT
      hasCompletedOnboarding: true,
      voiceEnabled: true,
    };
  });

  const [activeTab, setActiveTab] = useState<NavigationTab>('home');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [pendingAskQuestion, setPendingAskQuestion] = useState<string | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);

  const activeLanguageConfig = getLanguageConfig(userProgress.selectedLanguage);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userProgress));
    } catch (e) {
      console.warn('Could not save user progress:', e);
    }
  }, [userProgress]);

  // Set RTL direction and HTML lang tag dynamically
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = activeLanguageConfig.direction;
      document.documentElement.lang = activeLanguageConfig.code;
    }
  }, [activeLanguageConfig]);

  const handleLanguageChange = (lang: Language) => {
    setUserProgress((prev) => ({
      ...prev,
      selectedLanguage: lang,
    }));
  };

  const handleUpdateProgress = (lessonId: string, passedQuiz: boolean) => {
    setUserProgress((prev) => {
      const alreadyCompleted = prev.completedLessons.includes(lessonId);
      const newCompleted = alreadyCompleted
        ? prev.completedLessons
        : [...prev.completedLessons, lessonId];

      const newQuizScores = { ...prev.quizScores, [lessonId]: passedQuiz };

      // Calculate literacy score: base 10 + 10 points per completed lesson + 1.25 per quiz pass
      const calculatedScore = Math.min(
        100,
        Math.round(10 + (newCompleted.length / coreLessons.length) * 80 + (passedQuiz ? 10 : 0))
      );

      return {
        ...prev,
        completedLessons: newCompleted,
        quizScores: newQuizScores,
        literacyScore: calculatedScore,
      };
    });
  };

  const handleResetProgress = () => {
    const fresh: UserProgress = {
      completedLessons: [],
      quizScores: {},
      literacyScore: 10,
      selectedLanguage: DEFAULT_LANGUAGE, // resets back to default English
      hasCompletedOnboarding: true,
      voiceEnabled: true,
    };
    setUserProgress(fresh);
    setIsProfileOpen(false);
  };

  const handleAskQuestionFromHome = (question: string) => {
    setPendingAskQuestion(question);
    setActiveTab('ask');
  };

  const handleOpenLessonFromHome = (lessonId: string) => {
    setActiveLessonId(lessonId);
    setActiveTab('learn');
  };

  return (
    <div
      dir={activeLanguageConfig.direction}
      className="min-h-screen flex flex-col bg-[#FBFBF9] text-[#141716] antialiased selection:bg-[#EBF5EE] selection:text-[#166534] transition-colors duration-150"
      style={{
        fontFamily: activeLanguageConfig.fontFallback || 'Inter, sans-serif',
      }}
    >
      {/* Navigation (Floating Desktop Top & Mobile Bottom) */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'instant' });
        }}
        language={userProgress.selectedLanguage}
        onLanguageChange={handleLanguageChange}
        onOpenProfile={() => setIsProfileOpen(true)}
        literacyScore={userProgress.literacyScore}
      />

      {/* Main View Area */}
      <main className="flex-1 w-full flex flex-col items-center">
        {activeTab === 'home' && (
          <HomePage
            onNavigate={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'instant' });
            }}
            onAskQuestion={handleAskQuestionFromHome}
            language={userProgress.selectedLanguage}
            userProgress={userProgress}
            onOpenLesson={handleOpenLessonFromHome}
          />
        )}

        {activeTab === 'learn' && (
          <LearnPage
            language={userProgress.selectedLanguage}
            userProgress={userProgress}
            onUpdateProgress={handleUpdateProgress}
            activeLessonId={activeLessonId}
            onClearActiveLesson={() => setActiveLessonId(null)}
          />
        )}

        {activeTab === 'ask' && (
          <AskPage
            language={userProgress.selectedLanguage}
            initialQuestion={pendingAskQuestion}
            onClearInitialQuestion={() => setPendingAskQuestion(null)}
          />
        )}

        {activeTab === 'simulate' && (
          <SimulatePage language={userProgress.selectedLanguage} />
        )}

        {activeTab === 'safety' && (
          <SafetyPage language={userProgress.selectedLanguage} />
        )}
      </main>

      {/* Profile & Settings Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        userProgress={userProgress}
        onLanguageChange={handleLanguageChange}
        onResetProgress={handleResetProgress}
        onToggleVoice={() =>
          setUserProgress((prev) => ({
            ...prev,
            voiceEnabled: !prev.voiceEnabled,
          }))
        }
      />

      {/* First-time Onboarding Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onComplete={() => {
          setIsOnboardingOpen(false);
          setUserProgress((prev) => ({ ...prev, hasCompletedOnboarding: true }));
        }}
        selectedLanguage={userProgress.selectedLanguage}
        onSelectLanguage={handleLanguageChange}
      />
    </div>
  );
}
