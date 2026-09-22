import { uk } from './translations/uk';
import { en } from './translations/en';
import type { SupportedLanguage, TranslationDictionary } from './types';
import { useGameStore } from '../store/useGameStore';

export * from './types';

export const translations: Record<SupportedLanguage, TranslationDictionary> = {
  uk,
  en,
};

export const DEFAULT_LANGUAGE: SupportedLanguage = 'uk';
export const STORAGE_KEY = 'throne_of_mud_language';

export function getStoredLanguage(): SupportedLanguage {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'uk' || saved === 'en') {
      return saved;
    }
  } catch (e) {
    console.warn('Could not read language from localStorage:', e);
  }
  return DEFAULT_LANGUAGE;
}

export function saveStoredLanguage(lang: SupportedLanguage): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch (e) {
    console.warn('Could not save language to localStorage:', e);
  }
}

export function translate(
  lang: SupportedLanguage,
  path: string,
  params?: Record<string, string | number>
): string {
  const dict = translations[lang] || translations.uk;
  const parts = path.split('.');
  let current: any = dict;

  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      let fallback: any = translations.uk;
      for (const fbPart of parts) {
        if (fallback && typeof fallback === 'object' && fbPart in fallback) {
          fallback = fallback[fbPart];
        } else {
          fallback = undefined;
          break;
        }
      }
      current = fallback ?? path;
      break;
    }
  }

  let result = typeof current === 'string' ? current : path;

  if (params) {
    for (const [k, v] of Object.entries(params)) {
      result = result.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }
  }

  return result;
}

export function useTranslation() {
  const language = useGameStore((s) => s.language);
  const setLanguage = useGameStore((s) => s.setLanguage);

  const t = (path: string, params?: Record<string, string | number>): string => {
    return translate(language, path, params);
  };

  const dict = translations[language] || translations.uk;

  return {
    t,
    dict,
    language,
    setLanguage,
  };
}
