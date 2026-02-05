/**
 * @file i18n.ts
 * @description نظام الترجمة والتوطين (i18n) للتطبيق
 * @module i18n
 */

import React, { useState, useCallback, useMemo, type ReactNode } from 'react';
import { Language, LanguageConfig, languages, type TranslationDict } from './ar';
import { type TranslationKey, type I18nContextType } from './i18n.types';
import { I18nContext } from './i18n.context';

// Main translations object
import translations from './ar';

/**
 * مزود الترجمة والتوطين
 * @component I18nProvider
 * @param {Object} props
 * @param {ReactNode} props.children - العناصر الفرعية
 * @description مكون React يوفر سياق الترجمة لجميع العناصر الفرعية
 * @example
 * // في App.tsx أو ملف التطبيق الرئيسي
 * function App() {
 *   return (
 *     <I18nProvider>
 *       <Router />
 *     </I18nProvider>
 *   );
 * }
 */
export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('ar');

  /**
   * دالة الترجمة مع دعم المفاتيح المتداخلة
   * @param {TranslationKey} key - مفتاح الترجمة (مثل 'common.save')
   * @param {Object} [params] - معاملات للاستبدال في النص
   * @returns {string} النص المترجم
   * @example
   * const title = t('students.list'); // "قائمة الطلاب"
   * const message = t('errors.notFound', { id: 123 }); // "لم يتم العثور على الطالب 123"
   */
  const t = useCallback((key: TranslationKey, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let result: string | TranslationDict = translations[language];
    
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        // Fallback to Arabic or English
        const fallbackResult = translations.ar;
        let fallback: string | TranslationDict = fallbackResult;
        for (const fk of keys) {
          if (fallback && typeof fallback === 'object' && fk in fallback) {
            fallback = fallback[fk];
          } else {
            return key; // Return key if not found
          }
        }
        return typeof fallback === 'string' ? fallback : key;
      }
    }

    if (typeof result !== 'string') {
      return key;
    }

    // Replace parameters
    if (params) {
      return Object.entries(params).reduce((str, [param, value]) => {
        return str.replace(new RegExp(`\\{${param}\\}`, 'g'), String(value));
      }, result);
    }

    return result;
  }, [language]);

  const value = useMemo(() => ({
    language,
    /**
     * تغيير اللغة الحالية
     * @param {Language} lang - رمز اللغة ('ar' | 'en')
     */
    setLanguage: (lang: Language) => {
      setLanguage(lang);
      document.documentElement.lang = lang;
      document.documentElement.dir = languages[lang].dir;
      localStorage.setItem('language', lang);
    },
    t,
    dir: languages[language].dir,
    isRTL: languages[language].dir === 'rtl',
    availableLanguages: Object.values(languages),
  }), [language, t]);

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export default I18nProvider;
