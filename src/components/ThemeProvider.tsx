import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { DEFAULT_UNIVERSITY_LOGO_SRC } from '@/lib/branding'

type Theme = 'dark' | 'light' | 'system'

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  defaultPrimaryColor?: string
  storageKey?: string
}

interface ThemeProviderState {
  theme: Theme
  primaryColor: string
  /** شعار مخصص من التخزين المحلي؛ null يعني استخدام الشعار الافتراضي */
  logo: string | null
  /** عنوان الصورة المعروض دائماً (مخصص أو الافتراضي من `public/assets/`) */
  displayLogo: string
  setTheme: (theme: Theme) => void
  setPrimaryColor: (color: string) => void
  setLogo: (logo: string | null) => void
}

const initialState: ThemeProviderState = {
  theme: 'system',
  primaryColor: '142.1 76.2% 36.3%',
  logo: null,
  displayLogo: DEFAULT_UNIVERSITY_LOGO_SRC,
  setTheme: () => null,
  setPrimaryColor: () => null,
  setLogo: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  defaultPrimaryColor = '142.1 76.2% 36.3%',
  storageKey = 'university-ui-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )

  const [primaryColor, setPrimaryColor] = useState<string>(
    () => localStorage.getItem('university-ui-primary') || defaultPrimaryColor
  )

  const [logo, setLogo] = useState<string | null>(
    () => localStorage.getItem('university-ui-logo')
  )

  const displayLogo = useMemo(
    () => (logo && logo.trim() !== '' ? logo : DEFAULT_UNIVERSITY_LOGO_SRC),
    [logo]
  )

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light'

      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  useEffect(() => {
    const root = window.document.documentElement
    root.style.setProperty('--primary', primaryColor)
  }, [primaryColor])

  const value = {
    theme,
    primaryColor,
    logo,
    displayLogo,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
    setPrimaryColor: (color: string) => {
      localStorage.setItem('university-ui-primary', color)
      setPrimaryColor(color)
    },
    setLogo: (logo: string | null) => {
      if (logo) {
        localStorage.setItem('university-ui-logo', logo)
      } else {
        localStorage.removeItem('university-ui-logo')
      }
      setLogo(logo)
    }
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider')

  return context
}

// Helper for HOC or other non-hook usages if needed
useTheme.displayName = 'useTheme';
