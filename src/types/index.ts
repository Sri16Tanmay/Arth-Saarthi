export type Language =
  | 'en'
  | 'hi'
  | 'bn'
  | 'mr'
  | 'te'
  | 'ta'
  | 'gu'
  | 'kn'
  | 'ml'
  | 'pa'
  | 'or'
  | 'as'
  | 'ur'
  | 'sa'
  | 'ne'
  | 'kok'
  | 'ks'
  | 'sd'
  | 'mai'
  | 'doi'
  | 'mni';

export type TextDirection = 'ltr' | 'rtl';

export interface LanguageConfig {
  id: Language;
  code: Language;
  name: string;
  nativeName: string;
  locale: string;
  speechLocale: string;
  direction: TextDirection;
  fontFallback?: string;
  enabled: boolean;
}

export type NavigationTab = 'home' | 'learn' | 'ask' | 'simulate' | 'safety';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Lesson {
  id: string;
  slug: string;
  title: string;
  oneLiner: string;
  category: string;
  readTime: string;
  content: {
    simpleExplanation: string;
    realWorldExample: string;
    whyItMatters: string;
    keyTakeaway: string;
  };
  question: QuizQuestion;
}

export interface AssetAllocation {
  equity: number; // percentage
  debt: number;   // percentage
  gold: number;   // percentage
  cash: number;   // percentage
}

export interface SimulationScenario {
  id: string;
  title: string;
  description: string;
  impacts: {
    equity: number;
    debt: number;
    gold: number;
    cash: number;
  };
  macroContext: string;
}

export interface SimulationResult {
  scenarioId: string;
  scenarioTitle: string;
  initialCapital: number;
  finalValue: number;
  netChange: number;
  changePercent: number;
  assetBreakdown: {
    name: string;
    key: keyof AssetAllocation;
    initial: number;
    final: number;
    changePercent: number;
    color: string;
  }[];
  deterministicTakeaway: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
  language?: Language;
}

export interface SafetyAnalysisResult {
  riskLevel: 'low' | 'medium' | 'high';
  summary: string;
  warningSigns: string[];
  whatYouCanDo: string[];
}

export interface UserProgress {
  completedLessons: string[]; // lesson ids
  quizScores: Record<string, boolean>; // lessonId -> passed
  literacyScore: number; // 0 - 100
  selectedLanguage: Language;
  hasCompletedOnboarding: boolean;
  voiceEnabled: boolean;
}
