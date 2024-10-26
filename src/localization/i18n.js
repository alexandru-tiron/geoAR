import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import * as RNLocalize from 'react-native-localize';
import {en, ja} from './translations';
// Custom language detector
const languageDetector = {
  type: 'languageDetector',
  async: true, // flags below detection to be async
  detect: callback => {
    const locales = RNLocalize.getLocales();
    const bestLanguage = locales[0]?.languageTag || 'en';
    callback(bestLanguage);
  },
  init: () => {},
  cacheUserLanguage: () => {},
};

// Language resources
const resources = {
  en: {
    translation: en,
  },
  ja: {
    translation: ja,
  },
};
i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources,
    compatibilityJSON: 'v3',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    react: {
      useSuspense: true,
    },
  });
export default i18n;
