import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { useTheme } from '@/contexts/ThemeContext'
import { useHealthData } from '@/hooks/useHealthData'
import { Ionicons } from '@expo/vector-icons'

export default function HomeScreen() {
    const { user, loading: authLoading } = useAuth()
    const { t } = useLanguage()
    const { isDark } = useTheme()
    const router = useRouter()
    const { sleepRecords, sportSessions, isLoading, isDemo, hasSleepData, hasSportData } = useHealthData()

    const isLoaded = !authLoading && !isLoading
    const iconColor = isDark ? '#FFFFFF' : '#1C1C1E'

    return (
        <SafeAreaView className="flex-1 bg-bg-primary" edges={['top']}>
            <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }}>
                {/* Header with Profile Link */}
                <View className="flex-row justify-between items-center mb-6">
                    <View>
                        <Text className="text-3xl font-bold text-text-primary">
                            STATS App
                        </Text>
                        <Text className="text-lg text-text-secondary">
                            Mobile Edition
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => router.push('/profile')}
                        className="w-10 h-10 rounded-full bg-bg-card items-center justify-center"
                    >
                        <Ionicons name="person-circle-outline" size={28} color={iconColor} />
                    </TouchableOpacity>
                </View>

                {/* Status Card */}
                <View className="bg-bg-card rounded-2xl p-6 w-full shadow-sm mb-6">
                    <Text className="text-sm text-text-tertiary uppercase tracking-wide mb-2">
                        Mode
                    </Text>

                    {!isLoaded ? (
                        <Text className="text-lg text-text-secondary">{t('loading')}</Text>
                    ) : user ? (
                        <>
                            <View className="flex-row items-center mb-2">
                                <View className="w-3 h-3 rounded-full bg-accent-green mr-2" />
                                <Text className="text-xl font-semibold text-accent-green">
                                    {t('authenticatedMode')}
                                </Text>
                            </View>
                            <Text className="text-text-secondary">
                                {user.email}
                            </Text>
                        </>
                    ) : (
                        <>
                            <View className="flex-row items-center mb-2">
                                <View className="w-3 h-3 rounded-full bg-accent-orange mr-2" />
                                <Text className="text-xl font-semibold text-accent-orange">
                                    {t('visitorMode')}
                                </Text>
                            </View>
                            <Text className="text-text-secondary">
                                {t('demoData')}
                            </Text>
                        </>
                    )}
                </View>

                {/* Health Data Card */}
                {isLoaded && (
                    <View className="bg-bg-card rounded-2xl p-6 w-full shadow-sm mb-6">
                        <Text className="text-lg font-semibold text-text-primary mb-4">
                            {t('moduleHealth')} {isDemo ? '(Demo)' : ''}
                        </Text>

                        {hasSleepData && (
                            <View className="mb-3">
                                <Text className="text-sm text-text-tertiary">{t('sleep')}</Text>
                                <Text className="text-base text-text-primary">
                                    {sleepRecords.length} records • Last: {sleepRecords[0]?.duration} min
                                </Text>
                            </View>
                        )}

                        {hasSportData && (
                            <View className="mb-3">
                                <Text className="text-sm text-text-tertiary">{t('workout')}</Text>
                                <Text className="text-base text-text-primary">
                                    {sportSessions.length} sessions • Last: {sportSessions[0]?.type}
                                </Text>
                            </View>
                        )}

                        {!hasSleepData && !hasSportData && (
                            <Text className="text-text-secondary">{t('noData')}</Text>
                        )}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    )
}
