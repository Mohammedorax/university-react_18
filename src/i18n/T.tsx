/**
 * @file T.tsx
 * @description Component for translating text
 */

import { useTranslation } from './i18n';
import type { TranslationKey } from './i18n';

export function T({
  children,
  params
}: {
  children: TranslationKey;
  params?: Record<string, string | number>
}) {
  const { t } = useTranslation();
  return <>{t(children, params)}</>;
}
