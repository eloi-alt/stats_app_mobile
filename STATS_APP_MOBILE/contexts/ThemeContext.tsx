import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useColorScheme } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

type Theme = 'light' | 'dark' | 'system'

type ThemeContextType = {
    theme: Theme
    isDark: boolean
    setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType>({
    theme: 'system',
    isDark: false,
    setTheme: () => { },
})

export const useTheme = () => useContext(ThemeContext)

const THEME_STORAGE_KEY = 'app_theme'

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const systemColorScheme = useColorScheme()
    const [theme, setThemeState] = useState<Theme>('system')
    const [isLoaded, setIsLoaded] = useState(false)

    // Charger le thème sauvegardé au démarrage
    useEffect(() => {
        const loadTheme = async () => {
            try {
                const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY)
                if (saved && (saved === 'light' || saved === 'dark' || saved === 'system')) {
                    setThemeState(saved)
                }
            } catch (e) {
                console.error('Error loading theme:', e)
            } finally {
                setIsLoaded(true)
            }
        }
        loadTheme()
    }, [])

    // Sauvegarder quand le thème change
    const setTheme = async (newTheme: Theme) => {
        setThemeState(newTheme)
        try {
            await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme)
        } catch (e) {
            console.error('Error saving theme:', e)
        }
    }

    // Calculer si dark mode est actif
    const isDark = theme === 'dark' || (theme === 'system' && systemColorScheme === 'dark')

    if (!isLoaded) {
        return null // Éviter le flash de thème
    }

    return (
        <ThemeContext.Provider value={{ theme, isDark, setTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}
