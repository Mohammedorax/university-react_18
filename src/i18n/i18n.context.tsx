/**
 * @file i18n.context.tsx
 * @description React Context for i18n
 * @module i18n
 */

import { createContext, type ReactNode } from 'react';
import { type I18nContextType } from './i18n.types';

export const I18nContext = createContext<I18nContextType | undefined>(undefined);
