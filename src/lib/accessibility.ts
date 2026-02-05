import { useEffect } from 'react';
import { logger } from './logger';

type AriaRole =
  | 'button'
  | 'link'
  | 'navigation'
  | 'menu'
  | 'menuitem'
  | 'textbox'
  | 'searchbox'
  | 'combobox'
  | 'listbox'
  | 'option'
  | 'dialog'
  | 'alertdialog'
  | 'progressbar'
  | 'status'
  | 'region'
  | 'article'
  | 'heading'
  | 'separator'
  | 'tab'
  | 'tabpanel'
  | 'checkbox'
  | 'radio'
  | 'switch'
  | 'grid'
  | 'gridcell'
  | 'table'
  | 'row'
  | 'columnheader'
  | 'rowheader'
  | 'cell';

export interface AccessibilityAttributes {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean | 'true' | 'false';
  'aria-required'?: boolean | 'true' | 'false';
  'aria-disabled'?: boolean | 'true' | 'false';
  'aria-expanded'?: boolean | 'true' | 'false' | undefined;
  'aria-selected'?: boolean | 'true' | 'false' | undefined;
  'aria-checked'?: boolean | 'true' | 'false' | 'mixed' | undefined;
  'aria-pressed'?: boolean | 'true' | 'false' | 'mixed' | undefined;
  'aria-hidden'?: boolean | 'true' | 'false';
  'aria-live'?: 'polite' | 'assertive' | 'off';
  'aria-atomic'?: boolean | 'true' | 'false';
  'role'?: AriaRole;
}

export function useAccessibilityAttributes(props: AccessibilityAttributes): AccessibilityAttributes {
  useEffect(() => {
    logger.debug('Accessibility attributes applied', { props });
  }, [props]);

  return props;
}

export function validateAccessibility(element: HTMLElement): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!element.getAttribute('aria-label') && !element.getAttribute('aria-labelledby')) {
    if (element.tagName === 'BUTTON' || element.tagName === 'A' || element.tagName === 'INPUT') {
      errors.push(`العنصر <${element.tagName}> يحتاج على aria-label أو aria-labelledby`);
    }
  }

  const role = element.getAttribute('role');
  if (role) {
    if (role === 'button' && element.tagName !== 'BUTTON') {
      warnings.push(`العنصر <${element.tagName}> لديه role="button" لكن ليس زر`);
    }

    if (role === 'checkbox' && element.getAttribute('aria-checked') === null) {
      errors.push(`Checkbox يحتاج على aria-checked`);
    }

    if (role === 'radiogroup' && !element.getAttribute('aria-label')) {
      errors.push(`Radio group يحتاج على aria-label`);
    }
  }

  if (element.tagName === 'INPUT') {
    const type = element.getAttribute('type');
    const required = element.getAttribute('required');
    const ariaRequired = element.getAttribute('aria-required');

    if (required !== null && ariaRequired === null) {
      warnings.push('العنصر input لديه required="true" لكن يفتقر aria-required');
    }

    if (type === 'email' && !element.getAttribute('inputmode')) {
      warnings.push('توصية: استخدم inputmode="email" للأجهزة المحمولة');
    }

    if (type === 'tel' && !element.getAttribute('inputmode')) {
      warnings.push('توصية: استخدم inputmode="tel" للأجهزة المحمولة');
    }

    if (type === 'number' && !element.getAttribute('inputmode')) {
      warnings.push('توصية: استخدم inputmode="numeric" للأجهزة المحمولة');
    }
  }

  if (element.tagName === 'IMG') {
    if (!element.getAttribute('alt')) {
      errors.push('الصور يجب أن تحتوي على attribute alt');
    }
  }

  if (element.tagName === 'A') {
    if (!element.getAttribute('href')) {
      warnings.push('الرابط <a> بدون href قد يسبب ارتباك للمستخدمين');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function trapFocus(container: HTMLElement): () => void {
  const previousActiveElement: HTMLElement | null = document.activeElement as HTMLElement;
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    }
  };

  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      container.dispatchEvent(new CustomEvent('close', { bubbles: true }));
      if (previousActiveElement) {
        previousActiveElement.focus();
      }
    }
  };

  container.addEventListener('keydown', handleKeyDown);
  container.addEventListener('keydown', handleEscape);

  if (firstElement) {
    setTimeout(() => firstElement.focus(), 100);
  }

  return () => {
    container.removeEventListener('keydown', handleKeyDown);
    container.removeEventListener('keydown', handleEscape);
    if (previousActiveElement) {
      previousActiveElement.focus();
    }
  };
}

export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.setAttribute('class', 'sr-only');
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    announcement.remove();
  }, 1000);

  logger.debug('Announced to screen reader', { message, priority });
}

export function getA11yColors() {
  return {
    text: '#1f2937',
    background: '#ffffff',
    primary: '#2563eb',
    secondary: '#4b5563',
    accent: '#0891b2',
    destructive: '#dc2626',
    success: '#16a34a',
    warning: '#ca8a04',
    error: '#dc2626',
    disabled: '#71717a',
    disabledForeground: '#fcfcfc',
  };
}

export function skipToContent(anchorId: string): void {
  const element = document.getElementById(anchorId);
  if (element) {
    element.focus();
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    logger.debug('Skipped to content', { anchorId });
  } else {
    logger.warn('Anchor not found', { anchorId });
  }
}

export function useKeyboardNavigation(ref: React.RefObject<HTMLElement>): void {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        e.preventDefault();
          break;
        case 'ArrowDown':
          e.preventDefault();
          break;
        case 'ArrowLeft':
        case 'ArrowRight':
          e.preventDefault();
          break;
        case 'Home':
          e.preventDefault();
          break;
        case 'End':
          e.preventDefault();
          break;
        case 'PageUp':
        case 'PageDown':
          e.preventDefault();
          break;
        case 'Enter':
        case ' ':
          if (element.getAttribute('role') === 'button') {
            element.click();
          }
          break;
        case 'Escape':
          break;
      }
    };

    element.addEventListener('keydown', handleKeyDown);

    return () => {
      element.removeEventListener('keydown', handleKeyDown);
    };
  }, [ref]);
}

export function getWCAGCompliance(): {
  level: 'A' | 'AA' | 'AAA';
  criteria: string[];
} {
  const criteria = [
    'التباين اللون: نسبة تباين 4.5:1',
    'التباين اللون: حجم نص 14px',
    'لوحة المفاتيح: جميع الوظائف قابلة للوصول',
    'التمييز: وضوح الفواصل بين عناصر النموذج',
    'الفواصل: ترك مسافة كافٍ بين عناصر النموذج',
    'الربطات: وضوح الروابط والعمق',
    'العناوين: تسلسل هرمي صحيح',
    'اللغة: وجود lang attribute',
    'التركيز: ترتيب منطقي للعناصر',
    'الصور: alt text لجميع الصور',
  ];

  return {
    level: 'AA',
    criteria,
  };
}

export function generateAccessibleId(prefix: string, value: string): string {
  const sanitized = value.toLowerCase().replace(/[^a-z0-9]/g, '-');
  return `${prefix}-${sanitized}`;
}

export function useFocusManagement(options: {
  shouldFocusFirst?: boolean;
  shouldRestoreFocus?: boolean;
  onEscape?: () => void;
} = {}) {
  useEffect(() => {
    const { shouldFocusFirst, shouldRestoreFocus, onEscape } = options;

    let previousActiveElement: HTMLElement | null = null;

    if (shouldRestoreFocus) {
      previousActiveElement = document.activeElement as HTMLElement;
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onEscape?.();
        if (previousActiveElement) {
          previousActiveElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);

    if (shouldFocusFirst) {
      const focusableElement = document.querySelector('[tabindex="0"], [tabindex="-1"]') as HTMLElement;
      setTimeout(() => focusableElement?.focus(), 100);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [options]);
}

export const AccessibilityUtils = {
  validateAccessibility,
  trapFocus,
  announceToScreenReader,
  skipToContent,
  useKeyboardNavigation,
  useFocusManagement,
  getWCAGCompliance,
  getA11yColors,
  generateAccessibleId,
  useAccessibilityAttributes,
};

export default AccessibilityUtils;
