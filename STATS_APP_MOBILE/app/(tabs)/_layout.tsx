import { Tabs } from 'expo-router'
import { useTheme } from '@/contexts/ThemeContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { Ionicons } from '@expo/vector-icons'
import { View, Platform } from 'react-native'

type IconName = keyof typeof Ionicons.glyphMap

export default function TabLayout() {
    const { isDark } = useTheme()
    const { t } = useLanguage()

    const tabBarStyle = {
        backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
        borderTopColor: isDark ? '#38383A' : '#E5E5EA',
        borderTopWidth: 0.5,
        height: Platform.OS === 'ios' ? 85 : 65,
        paddingBottom: Platform.OS === 'ios' ? 25 : 10,
        paddingTop: 10,
    }

    const getTabIcon = (name: IconName, focused: boolean) => {
        return (
            <Ionicons
                name={name}
                size={focused ? 26 : 22}
                color={focused ? (isDark ? '#FFFFFF' : '#1C1C1E') : (isDark ? '#8E8E93' : '#8E8E93')}
                style={{
                    transform: [{ scale: focused ? 1.1 : 1 }],
                }}
            />
        )
    }

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: tabBarStyle,
                tabBarActiveTintColor: isDark ? '#FFFFFF' : '#1C1C1E',
                tabBarInactiveTintColor: '#8E8E93',
                tabBarShowLabel: false,
            }}
        >
            <Tabs.Screen
                name="physio"
                options={{
                    title: t('health'),
                    tabBarIcon: ({ focused }) => getTabIcon('heart', focused),
                }}
            />
            <Tabs.Screen
                name="social"
                options={{
                    title: t('trueCircle'),
                    tabBarIcon: ({ focused }) => getTabIcon('people', focused),
                }}
            />
            <Tabs.Screen
                name="index"
                options={{
                    title: t('home'),
                    tabBarIcon: ({ focused }) => getTabIcon('home', focused),
                }}
            />
            <Tabs.Screen
                name="world"
                options={{
                    title: t('world'),
                    tabBarIcon: ({ focused }) => getTabIcon('globe', focused),
                }}
            />
            <Tabs.Screen
                name="pro"
                options={{
                    title: t('career'),
                    tabBarIcon: ({ focused }) => getTabIcon('briefcase', focused),
                }}
            />
        </Tabs>
    )
}
