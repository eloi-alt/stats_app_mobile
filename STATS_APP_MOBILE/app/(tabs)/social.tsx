import { View, Text, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLanguage } from '@/contexts/LanguageContext'
import { useSocialData } from '@/hooks/useSocialData'

export default function SocialScreen() {
    const { t } = useLanguage()
    const {
        friends,
        innerCircleFriends,
        amiFriends,
        isLoading,
        isDemo,
        hasAnyFriends,
        friendCount
    } = useSocialData()

    return (
        <SafeAreaView className="flex-1 bg-bg-primary" edges={['top']}>
            <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }}>
                {/* Header */}
                <Text className="text-3xl font-bold text-text-primary mb-2">
                    {t('trueCircle')}
                </Text>
                <Text className="text-base text-text-secondary mb-6">
                    {isDemo ? t('demoData') : 'Your social connections'}
                </Text>

                {/* Inner Circle Card */}
                <View className="bg-bg-card rounded-2xl p-5 mb-4">
                    <Text className="text-lg font-semibold text-text-primary mb-3">
                        {t('innerCircle')}
                    </Text>
                    <View className="flex-row items-center">
                        <View className="flex-row -space-x-2">
                            {['👤', '👤', '👤', '👤', '👤'].map((emoji, i) => (
                                <View
                                    key={i}
                                    className="w-10 h-10 rounded-full bg-bg-secondary items-center justify-center border-2 border-bg-card"
                                >
                                    <Text>{emoji}</Text>
                                </View>
                            ))}
                        </View>
                        <Text className="text-text-secondary ml-4">5 {t('friends')}</Text>
                    </View>
                </View>

                {/* Connections Card */}
                <View className="bg-bg-card rounded-2xl p-5 mb-4">
                    <Text className="text-lg font-semibold text-text-primary mb-3">
                        {t('connections')}
                    </Text>
                    <View className="flex-row justify-between">
                        <View className="items-center">
                            <Text className="text-2xl font-bold text-accent-blue">12</Text>
                            <Text className="text-sm text-text-tertiary">{t('friends')}</Text>
                        </View>
                        <View className="items-center">
                            <Text className="text-2xl font-bold text-accent-purple">48</Text>
                            <Text className="text-sm text-text-tertiary">{t('connections')}</Text>
                        </View>
                        <View className="items-center">
                            <Text className="text-2xl font-bold text-accent-green">156</Text>
                            <Text className="text-sm text-text-tertiary">{t('interactions')}</Text>
                        </View>
                    </View>
                </View>

                {/* Empty State for non-demo */}
                {!isDemo && (
                    <View className="bg-bg-card rounded-2xl p-6 items-center">
                        <Text className="text-4xl mb-3">👥</Text>
                        <Text className="text-lg font-semibold text-text-primary text-center mb-2">
                            {t('buildYourCircle')}
                        </Text>
                        <Text className="text-text-secondary text-center">
                            {t('buildYourCircleDesc')}
                        </Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    )
}
