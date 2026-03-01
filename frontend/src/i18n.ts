import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const LOCALE_KEY = 'app-locale';

function getStoredLocale(): string {
  if (typeof window === 'undefined') return 'ar';
  const stored = window.localStorage.getItem(LOCALE_KEY);
  return stored === 'en' || stored === 'ar' ? stored : 'ar';
}

import ar from './locales/ar.json';
import en from './locales/en.json';

i18n.use(initReactI18next).init({
  resources: {
    ar: { translation: ar as Record<string, unknown> },
    en: { translation: en as Record<string, unknown> },
  },
  lng: getStoredLocale(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

i18n.on('languageChanged', (lng) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.setAttribute('lang', lng);
  root.setAttribute('dir', lng === 'ar' ? 'rtl' : 'ltr');
  if (typeof window !== 'undefined') window.localStorage.setItem(LOCALE_KEY, lng);
});

if (typeof document !== 'undefined') {
  const initial = i18n.language || getStoredLocale();
  document.documentElement.setAttribute('lang', initial);
  document.documentElement.setAttribute('dir', initial === 'ar' ? 'rtl' : 'ltr');
}

export default i18n;
