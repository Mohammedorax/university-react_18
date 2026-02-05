/**
 * @file useT.ts
 * @description Helper hook for simple translations
 */

import { useTranslation } from './i18n';

export function useT() {
  const { t: translate } = useTranslation();
  return translate;
}
