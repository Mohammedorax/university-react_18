/**
 * @file i18n.types.ts
 * @description TypeScript types for i18n module
 * @module i18n
 */

import { Language, LanguageConfig, TranslationDict } from './ar';
import translations from './ar';

/**
 * نوع المفتاح المتداخل في القواميس
 * @typedef NestedKeyOf
 * @template T - نوع القاموس
 */
export type NestedKeyOf<T extends TranslationDict> = {
  [K in keyof T & string]: T[K] extends TranslationDict
    ? `${K}.${NestedKeyOf<T[K]>}`
    : K;
}[keyof T & string];

/**
 * نوع مفتاح الترجمة - يدعم المفاتيح المتداخلة
 * @typedef {string} TranslationKey
 * @example 'common.save' | 'errors.notFound' | 'students.list'
 */
export type TranslationKey = NestedKeyOf<typeof translations.ar>;

/**
 * واجهة سياق الترجمة
 * @interface I18nContextType
 * @property {Language} language - اللغة الحالية
 * @property {Function} setLanguage - تغيير اللغة
 * @property {Function} t - دالة الترجمة
 * @property {'rtl' | 'ltr'} dir - اتجاه النص
 * @property {boolean} isRTL - هل اللغة RTL
 * @property {LanguageConfig[]} availableLanguages - اللغات المتاحة
 */
export interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  dir: 'rtl' | 'ltr';
  isRTL: boolean;
  availableLanguages: LanguageConfig[];
}

export { type TranslationDict };
