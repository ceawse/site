import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import translationEN from './locales/en/translation.json';
import translationRU from './locales/ru/translation.json';
import translationIT from './locales/it/translation.json';
import translationES from './locales/es/translation.json';
import translationDE from './locales/de/translation.json';

const resources = {
  en: {
    translation: translationEN
  },
  ru: {
    translation: translationRU
  },
  it: {
    translation: translationIT
  },
  es: {
    translation: translationES
  },
  de: {
    translation: translationDE
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // react already safes from xss
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
});

export default i18n;
