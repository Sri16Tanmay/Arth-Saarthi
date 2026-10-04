import { Language } from '../types';
import { TranslationDictionary } from './types';
import { en } from './locales/en';
import { hi, mr, sa, ne, kok, mai, doi } from './locales/hindiGroup';
import { te, ta, kn, ml } from './locales/southGroup';
import { bn, or, as, mni } from './locales/eastGroup';
import { gu, pa, ur, ks, sd } from './locales/westNorthGroup';

const LOCALES: Record<Language, TranslationDictionary> = {
  en,
  hi,
  mr,
  sa,
  ne,
  kok,
  mai,
  doi,
  te,
  ta,
  kn,
  ml,
  bn,
  or,
  as,
  mni,
  gu,
  pa,
  ur,
  ks,
  sd,
};

export function getTranslations(lang: Language): TranslationDictionary {
  const dictionary = LOCALES[lang];
  if (!dictionary) {
    return en;
  }
  return {
    ...en,
    ...dictionary,
  };
}

export function t(key: keyof TranslationDictionary, lang: Language): string {
  const dict = getTranslations(lang);
  return dict[key] || en[key] || String(key);
}

export { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, getLanguageConfig } from './languages';
export type { TranslationDictionary } from './types';
