import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

type Language = 'en' | 'fr' | 'es'

interface Translations {
    [key: string]: {
        en: string
        fr: string
        es: string
    }
}

const translations: Translations = {
    // Greetings
    'goodMorning': { en: 'Good morning', fr: 'Bonjour', es: 'Buenos días' },
    'goodAfternoon': { en: 'Good afternoon', fr: 'Bon après-midi', es: 'Buenas tardes' },
    'goodEvening': { en: 'Good evening', fr: 'Bonsoir', es: 'Buenas noches' },

    // Navigation
    'health': { en: 'Health', fr: 'Santé', es: 'Salud' },
    'trueCircle': { en: 'TrueCircle', fr: 'TrueCircle', es: 'TrueCircle' },
    'home': { en: 'Home', fr: 'Accueil', es: 'Inicio' },
    'world': { en: 'World', fr: 'Monde', es: 'Mundo' },
    'career': { en: 'Career', fr: 'Carrière', es: 'Carrera' },

    // Sections
    'yourDomains': { en: 'Your domains', fr: 'Vos domaines', es: 'Tus dominios' },
    'metrics': { en: 'Metrics', fr: 'Métriques', es: 'Métricas' },
    'innerCircle': { en: 'Inner Circle', fr: 'Mon cercle proche', es: 'Círculo íntimo' },
    'ranking': { en: 'Ranking', fr: 'Classement', es: 'Clasificación' },
    'connections': { en: 'Connections', fr: 'Connexions', es: 'Conexiones' },
    'balance': { en: 'Balance', fr: 'Équilibre', es: 'Equilibrio' },
    'growth': { en: 'Growth', fr: 'Croissance', es: 'Crecimiento' },
    'exploration': { en: 'Exploration', fr: 'Exploration', es: 'Exploración' },

    // Profile
    'memberSince': { en: 'Member since', fr: 'Membre depuis', es: 'Miembro desde' },
    'globalScore': { en: 'Global score', fr: 'Score global', es: 'Puntuación global' },
    'countries': { en: 'Countries', fr: 'Pays', es: 'Países' },
    'achievements': { en: 'Achievements', fr: 'Réalisations', es: 'Logros' },
    'settings': { en: 'Settings', fr: 'Paramètres', es: 'Configuración' },
    'signOut': { en: 'Sign out', fr: 'Se déconnecter', es: 'Cerrar sesión' },
    'shareProfile': { en: 'Share Profile', fr: 'Partager le profil', es: 'Compartir perfil' },

    // Settings
    'notifications': { en: 'Notifications', fr: 'Notifications', es: 'Notificaciones' },
    'privacy': { en: 'Privacy', fr: 'Confidentialité', es: 'Privacidad' },
    'language': { en: 'Language', fr: 'Langue', es: 'Idioma' },
    'appearance': { en: 'Appearance', fr: 'Apparence', es: 'Apariencia' },
    'theme': { en: 'Theme', fr: 'Thème', es: 'Tema' },
    'light': { en: 'Light', fr: 'Clair', es: 'Claro' },
    'dark': { en: 'Dark', fr: 'Sombre', es: 'Oscuro' },

    // UI Controls
    'save': { en: 'Save', fr: 'Enregistrer', es: 'Guardar' },
    'cancel': { en: 'Cancel', fr: 'Annuler', es: 'Cancelar' },
    'close': { en: 'Close', fr: 'Fermer', es: 'Cerrar' },
    'add': { en: 'Add', fr: 'Ajouter', es: 'Añadir' },
    'edit': { en: 'Edit', fr: 'Modifier', es: 'Editar' },
    'back': { en: 'Back', fr: 'Retour', es: 'Volver' },
    'loading': { en: 'Loading...', fr: 'Chargement...', es: 'Cargando...' },

    // Health / Physio
    'sleep': { en: 'Sleep', fr: 'Sommeil', es: 'Sueño' },
    'weight': { en: 'Weight', fr: 'Poids', es: 'Peso' },
    'water': { en: 'Water', fr: 'Eau', es: 'Agua' },
    'workout': { en: 'Workout', fr: 'Entraînement', es: 'Entrenamiento' },
    'activity': { en: 'Activity', fr: 'Activité', es: 'Actividad' },
    'steps': { en: 'Steps', fr: 'Pas', es: 'Pasos' },
    'bodyComposition': { en: 'Body composition', fr: 'Composition corporelle', es: 'Composición corporal' },
    'bodyFat': { en: 'Body fat', fr: 'Masse grasse', es: 'Grasa corporal' },
    'muscleMass': { en: 'Muscle mass', fr: 'Masse musculaire', es: 'Masa muscular' },

    // Social
    'friends': { en: 'Friends', fr: 'Amis', es: 'Amigos' },
    'addFriend': { en: 'Add friend', fr: 'Ajouter en ami', es: 'Añadir amigo' },
    'searchUser': { en: 'Search user', fr: 'Rechercher un utilisateur', es: 'Buscar usuario' },
    'noUserFound': { en: 'No user found', fr: 'Aucun utilisateur trouvé', es: 'Usuario no encontrado' },

    // Module Names
    'moduleHealth': { en: 'Health', fr: 'Santé', es: 'Salud' },
    'moduleWorld': { en: 'World', fr: 'Monde', es: 'Mundo' },
    'moduleFinance': { en: 'Finance', fr: 'Finance', es: 'Finanzas' },
    'moduleCareer': { en: 'Career', fr: 'Carrière', es: 'Carrera' },
    'moduleCircle': { en: 'Social', fr: 'Social', es: 'Social' },
    'noData': { en: 'No data', fr: 'Aucune donnée', es: 'Sin datos' },

    // Harmony
    'harmony': { en: 'HARMONY', fr: 'HARMONIE', es: 'ARMONÍA' },
    'overallHarmony': { en: 'Overall Harmony', fr: 'Harmonie globale', es: 'Armonía global' },

    // Modes
    'visitorMode': { en: 'Visitor Mode', fr: 'Mode Visiteur', es: 'Modo Visitante' },
    'authenticatedMode': { en: 'Authenticated Mode', fr: 'Mode Authentifié', es: 'Modo Autenticado' },
    'demoData': { en: 'Demo data', fr: 'Données de démonstration', es: 'Datos de demostración' },

    // General
    'week': { en: 'Week', fr: 'Semaine', es: 'Semana' },
    'month': { en: 'Month', fr: 'Mois', es: 'Mes' },
    'year': { en: 'Year', fr: 'Année', es: 'Año' },
    'today': { en: 'Today', fr: 'Aujourd\'hui', es: 'Hoy' },
    'yesterday': { en: 'Yesterday', fr: 'Hier', es: 'Ayer' },
    'system': { en: 'Auto', fr: 'Auto', es: 'Auto' },
}

interface LanguageContextType {
    language: Language
    setLanguage: (lang: Language) => void
    t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const LANGUAGE_STORAGE_KEY = 'app_language'

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>('en')
    const [isLoaded, setIsLoaded] = useState(false)

    // Load saved language on mount
    useEffect(() => {
        const loadLanguage = async () => {
            try {
                const saved = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY)
                if (saved && ['en', 'fr', 'es'].includes(saved)) {
                    setLanguageState(saved as Language)
                }
            } catch (e) {
                console.error('Error loading language:', e)
            } finally {
                setIsLoaded(true)
            }
        }
        loadLanguage()
    }, [])

    const setLanguage = async (lang: Language) => {
        setLanguageState(lang)
        try {
            await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang)
        } catch (e) {
            console.error('Error saving language:', e)
        }
    }

    const t = (key: string): string => {
        return translations[key]?.[language] || translations[key]?.en || key
    }

    // Prevent flash of wrong language
    if (!isLoaded) {
        return null
    }

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const context = useContext(LanguageContext)
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider')
    }
    return context
}
