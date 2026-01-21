import { View, Text, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useLanguage } from '@/contexts/LanguageContext'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'
import { Ionicons } from '@expo/vector-icons'

type IconName = keyof typeof Ionicons.glyphMap

interface SettingRowProps {
    icon: IconName
    label: string
    value?: string
    onPress?: () => void
    showArrow?: boolean
    rightElement?: React.ReactNode
}

function SettingRow({ icon, label, value, onPress, showArrow = true, rightElement }: SettingRowProps) {
    const { isDark } = useTheme()
    const iconColor = isDark ? '#8E8E93' : '#636366'

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={!onPress && !rightElement}
            className="flex-row items-center py-4 border-b border-border-light"
            activeOpacity={0.7}
        >
            <View className="w-8 h-8 rounded-lg bg-bg-secondary items-center justify-center mr-3">
                <Ionicons name={icon} size={18} color={iconColor} />
            </View>
            <Text className="flex-1 text-base text-text-primary">{label}</Text>
            {value && <Text className="text-text-secondary mr-2">{value}</Text>}
            {rightElement}
            {showArrow && onPress && (
                <Ionicons name="chevron-forward" size={18} color={iconColor} />
            )}
        </TouchableOpacity>
    )
}

export default function SettingsScreen() {
    const { t } = useLanguage()
    const router = useRouter()
    const { isDark, theme, setTheme } = useTheme()
    const { language, setLanguage } = useLanguage()
    const { user, signOut } = useAuth()

    const iconColor = isDark ? '#FFFFFF' : '#1C1C1E'

    const handleSignOut = async () => {
        Alert.alert(
            t('signOut'),
            'Are you sure you want to sign out?',
            [
                { text: t('cancel'), style: 'cancel' },
                {
                    text: t('signOut'),
                    style: 'destructive',
                    onPress: async () => {
                        await signOut()
                        router.replace('/')
                    }
                }
            ]
        )
    }

    const cycleTheme = () => {
        const modes: Array<'system' | 'light' | 'dark'> = ['system', 'light', 'dark']
        const currentIndex = modes.indexOf(theme)
        const nextIndex = (currentIndex + 1) % modes.length
        setTheme(modes[nextIndex])
    }

    const cycleLanguage = () => {
        const langs: Array<'en' | 'fr' | 'es'> = ['en', 'fr', 'es']
        const currentIndex = langs.indexOf(language)
        const nextIndex = (currentIndex + 1) % langs.length
        setLanguage(langs[nextIndex])
    }

    const themeLabel = theme === 'system' ? t('system') : theme === 'light' ? t('light') : t('dark')
    const languageLabel = language === 'en' ? 'English' : language === 'fr' ? 'Français' : 'Español'

    return (
        <SafeAreaView className="flex-1 bg-bg-primary" edges={['top']}>
            <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }}>
                {/* Header */}
                <View className="flex-row items-center mb-6">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="mr-4"
                    >
                        <Ionicons name="arrow-back" size={24} color={iconColor} />
                    </TouchableOpacity>
                    <Text className="text-3xl font-bold text-text-primary">
                        {t('settings')}
                    </Text>
                </View>

                {/* General Section */}
                <View className="bg-bg-card rounded-2xl p-4 mb-6">
                    <Text className="text-sm font-semibold text-text-tertiary uppercase mb-2">
                        {t('general')}
                    </Text>

                    <SettingRow
                        icon="moon-outline"
                        label={t('theme')}
                        value={themeLabel}
                        onPress={cycleTheme}
                    />
                    <SettingRow
                        icon="language-outline"
                        label={t('language')}
                        value={languageLabel}
                        onPress={cycleLanguage}
                    />
                    <SettingRow
                        icon="notifications-outline"
                        label={t('notifications')}
                        onPress={() => { }}
                    />
                </View>

                {/* Privacy Section */}
                <View className="bg-bg-card rounded-2xl p-4 mb-6">
                    <Text className="text-sm font-semibold text-text-tertiary uppercase mb-2">
                        {t('privacy')}
                    </Text>

                    <SettingRow
                        icon="lock-closed-outline"
                        label={t('privacy')}
                        onPress={() => { }}
                    />
                    <SettingRow
                        icon="cloud-outline"
                        label={t('dataStorage')}
                        onPress={() => { }}
                    />
                </View>

                {/* Account Section */}
                {user && (
                    <View className="bg-bg-card rounded-2xl p-4 mb-6">
                        <Text className="text-sm font-semibold text-text-tertiary uppercase mb-2">
                            {t('account')}
                        </Text>

                        <SettingRow
                            icon="person-outline"
                            label="Email"
                            value={user.email?.substring(0, 20) || ''}
                            showArrow={false}
                        />
                        <SettingRow
                            icon="log-out-outline"
                            label={t('signOut')}
                            onPress={handleSignOut}
                        />
                    </View>
                )}

                {/* About Section */}
                <View className="bg-bg-card rounded-2xl p-4 mb-6">
                    <Text className="text-sm font-semibold text-text-tertiary uppercase mb-2">
                        {t('about')}
                    </Text>

                    <SettingRow
                        icon="information-circle-outline"
                        label={t('version')}
                        value="1.0.0"
                        showArrow={false}
                    />
                </View>

                {/* Footer */}
                <View className="items-center mt-4">
                    <Text className="text-text-tertiary text-sm">
                        {t('madeWith')} ❤️
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}
