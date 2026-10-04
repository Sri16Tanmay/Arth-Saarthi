import { Language } from '../types';
import { getTranslations, TranslationDictionary } from '../i18n';

export type TranslationStrings = TranslationDictionary;

export const translations: Record<Language, TranslationStrings> = new Proxy(
  {} as Record<Language, TranslationStrings>,
  {
    get: (_, prop: string) => {
      return getTranslations(prop as Language);
    },
  }
);
