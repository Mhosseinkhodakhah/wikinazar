import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import en from './en';
import fa from './fa';
import type { Translations } from './en';

type Lang = 'en' | 'fa';

interface I18nContextType {
  lang: Lang;
  t: Translations;
  dir: 'ltr' | 'rtl';
  toggleLang: () => void;
  setLang: (lang: Lang) => void;
}

const translations: Record<Lang, Translations> = { en, fa };

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    return (localStorage.getItem('admin_lang') as Lang) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('admin_lang', lang);
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const toggleLang = () => setLangState((prev) => (prev === 'en' ? 'fa' : 'en'));
  const setLang = (l: Lang) => setLangState(l);

  return (
    <I18nContext.Provider
      value={{
        lang,
        t: translations[lang],
        dir: lang === 'fa' ? 'rtl' : 'ltr',
        toggleLang,
        setLang,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextType {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
