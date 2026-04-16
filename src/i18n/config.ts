import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import ar from '@/locales/ar.json';
import en from '@/locales/en.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ar: { translation: ar },
      en: { translation: en },
    },
    lng: 'ar', // Default language
    fallbackLng: 'ar',
    interpolation: {
      // React already escapes content by default, so we disable i18next escaping
      // to avoid double-escaping. See: https://react.i18next.com/latest/trans-component
      escapeValue: false,
    },
  });

export default i18n;
