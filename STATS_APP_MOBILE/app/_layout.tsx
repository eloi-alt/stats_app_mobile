import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { AuthProvider } from '@/contexts/AuthContext'
import { VisitorProvider } from '@/contexts/VisitorContext'
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import '../global.css'

function RootLayoutNav() {
    const { isDark } = useTheme()

    return (
        <>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: {
                        backgroundColor: isDark ? '#000000' : '#FAFAF8',
                    },
                }}
            />
        </>
    )
}

export default function RootLayout() {
    return (
        <AuthProvider>
            <VisitorProvider>
                <ThemeProvider>
                    <LanguageProvider>
                        <RootLayoutNav />
                    </LanguageProvider>
                </ThemeProvider>
            </VisitorProvider>
        </AuthProvider>
    )
}
