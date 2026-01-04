'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'

// Types for theme management
export type ThemeMode = 'light' | 'dark' | 'system'
export type ColorScheme = 'light' | 'dark'

interface ThemeContextProps {
    theme: ThemeMode         // User preference ('light', 'dark', or 'system')
    resolvedTheme: ColorScheme // Actual rendered theme ('light' or 'dark')
    setTheme: (theme: ThemeMode) => void
    toggleTheme: () => void
    isDark: boolean          // Convenience boolean for checking dark mode
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined)

const STORAGE_KEY = 'app_theme'

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<ThemeMode>('light')
    const [resolvedTheme, setResolvedTheme] = useState<ColorScheme>('light')
    const [mounted, setMounted] = useState(false)

    // Apply theme to DOM
    const applyTheme = useCallback((scheme: ColorScheme) => {
        // Remove transitions during theme change to prevent flash
        document.body.classList.add('no-transitions')

        document.documentElement.setAttribute('data-theme', scheme)

        if (scheme === 'dark') {
            document.body.classList.add('dark-mode')
        } else {
            document.body.classList.remove('dark-mode')
        }

        setResolvedTheme(scheme)

        // Re-enable transitions after a short delay
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                document.body.classList.remove('no-transitions')
            })
        })
    }, [])

    // Load saved theme on mount
    useEffect(() => {
        setMounted(true)

        try {
            const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null
            if (saved && ['light', 'dark', 'system'].includes(saved)) {
                setThemeState(saved)
            }
        } catch (e) {
            console.warn('Failed to load theme from localStorage', e)
        }
    }, [])

    // Apply theme when it changes
    useEffect(() => {
        if (!mounted) return

        if (theme === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
            applyTheme(mediaQuery.matches ? 'dark' : 'light')

            const handler = (e: MediaQueryListEvent) => applyTheme(e.matches ? 'dark' : 'light')
            mediaQuery.addEventListener('change', handler)

            return () => mediaQuery.removeEventListener('change', handler)
        } else {
            applyTheme(theme)
        }
    }, [theme, mounted, applyTheme])

    // Persist to localStorage
    useEffect(() => {
        if (mounted) {
            try {
                localStorage.setItem(STORAGE_KEY, theme)
            } catch (e) {
                console.warn('Failed to save theme to localStorage', e)
            }
        }
    }, [theme, mounted])

    const setTheme = useCallback((newTheme: ThemeMode) => {
        setThemeState(newTheme)
    }, [])

    const toggleTheme = useCallback(() => {
        setThemeState(prev => prev === 'dark' ? 'light' : 'dark')
    }, [])

    const value: ThemeContextProps = {
        theme,
        resolvedTheme,
        setTheme,
        toggleTheme,
        isDark: resolvedTheme === 'dark'
    }

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme(): ThemeContextProps {
    const context = useContext(ThemeContext)
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider')
    }
    return context
}

// Export for use in non-React contexts (e.g., native bridge)
export function getSystemTheme(): ColorScheme {
    if (typeof window === 'undefined') return 'light'
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}
