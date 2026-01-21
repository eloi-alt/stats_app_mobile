import '../global.css';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { VisitorProvider, useVisitor } from '@/contexts/VisitorContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';

function RootLayoutNav() {
    const { isDark } = useTheme();
    const { session, loading: authLoading } = useAuth();
    const { isVisitorMode } = useVisitor();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (authLoading) return;


        const inLogin = segments[0] === 'login';

        // Check if user is authenticated OR in visitor mode
        const isAuthorized = !!session || isVisitorMode;

        if (!isAuthorized && !inLogin) {
            // Redirect to login if not authorized and not already on login page
            router.replace('/login');
        } else if (isAuthorized && inLogin) {
            // Redirect to home if authorized and on login page
            router.replace('/');
        }
    }, [session, isVisitorMode, segments, authLoading]);

    if (authLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: isDark ? '#000000' : '#FAFAF8' }}>
                <ActivityIndicator size="large" color="#30D158" />
            </View>
        );
    }

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
            >
                <Stack.Screen name="login" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
        </>
    );
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
    );
}
