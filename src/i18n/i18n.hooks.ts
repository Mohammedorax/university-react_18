/**
 * @file i18n.hooks.ts
 * @description React hooks for i18n
 * @module i18n
 */

import { useContext } from 'react';
import { I18nContext } from './i18n.context';
import { type I18nContextType } from './i18n.types';

/**
 * Hook للوصول إلى سياق الترجمة
 * @function useTranslation
 * @returns {I18nContextType} سياق الترجمة
 * @throws {Error} إذا استُخدم خارج I18nProvider
 * @description Hook React للوصول إلى اللغة الحالية ودالة الترجمة
 * @example
 * function MyComponent() {
 *   const { t, language, setLanguage, isRTL } = useTranslation();
 *
 *   return (
 *     <div>
 *       <h1>{t('common.welcome')}</h1>
 *       <p>اللغة الحالية: {language}</p>
 *       <button onClick={() => setLanguage('en')}>
 *         Switch to English
 *       </button>
 *     </div>
 *   );
 * }
 */
export function useTranslation(): I18nContextType {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
}
