import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useProfileData } from '@/hooks/useProfileData'
import { useTravelData } from '@/hooks/useTravelData'
import { useFinancialData } from '@/hooks/useFinancialData'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/contexts/ThemeContext'
import ProfileEditModal from '@/components/Modals/ProfileEditModal'

export default function ProfileScreen() {
    const { t } = useLanguage()
    const router = useRouter()
    const { isDark } = useTheme()
    const { profile, isLoading, isDemo, refetch } = useProfileData()
    const { totalCountries } = useTravelData()
    const { netWorth } = useFinancialData()
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)

    const iconColor = isDark ? '#FFFFFF' : '#1C1C1E'

    const formatNumber = (num: number) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
        if (num >= 1000) return `${(num / 1000).toFixed(0)}K`
        return num.toString()
    }

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-bg-primary items-center justify-center">
                <Text className="text-text-secondary">{t('loading')}</Text>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView className="flex-1 bg-bg-primary" edges={['top']}>
            <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }}>
                {/* Header with Settings */}
                <View className="flex-row justify-between items-center mb-6">
                    <Text className="text-3xl font-bold text-text-primary">
                        {t('profile')}
                    </Text>
                    <TouchableOpacity
                        onPress={() => router.push('/settings')}
                        className="w-10 h-10 rounded-full bg-bg-card items-center justify-center"
                    >
                        <Ionicons name="settings-outline" size={22} color={iconColor} />
                    </TouchableOpacity>
                </View>

                {isDemo && (
                    <View className="bg-accent-orange/20 rounded-xl px-4 py-2 mb-4">
                        <Text className="text-accent-orange text-center">{t('demoData')}</Text>
                    </View>
                )}

                {/* Avatar & Name */}
                <View className="items-center mb-6">
                    <View className="w-24 h-24 rounded-full bg-bg-secondary items-center justify-center mb-4 overflow-hidden">
                        {profile?.avatarUrl ? (
                            <Image
                                source={{ uri: profile.avatarUrl }}
                                className="w-full h-full"
                                resizeMode="cover"
                            />
                        ) : (
                            <Ionicons name="person" size={48} color={iconColor} />
                        )}
                    </View>
                    <Text className="text-2xl font-bold text-text-primary">
                        {profile?.firstName} {profile?.lastName}
                    </Text>
                    <Text className="text-base text-text-secondary">
                        @{profile?.username || 'username'}
                    </Text>
                </View>

                {/* Stats Row */}
                <View className="flex-row bg-bg-card rounded-2xl p-4 mb-6">
                    <View className="flex-1 items-center">
                        <Text className="text-2xl font-bold text-accent-blue">
                            {profile?.harmonyScore || 0}
                        </Text>
                        <Text className="text-sm text-text-tertiary">{t('harmony')}</Text>
                    </View>
                    <View className="w-px bg-border-light" />
                    <View className="flex-1 items-center">
                        <Text className="text-2xl font-bold text-accent-green">
                            {totalCountries}
                        </Text>
                        <Text className="text-sm text-text-tertiary">{t('countries')}</Text>
                    </View>
                    <View className="w-px bg-border-light" />
                    <View className="flex-1 items-center">
                        <Text className="text-2xl font-bold text-accent-gold">
                            {formatNumber(netWorth)}
                        </Text>
                        <Text className="text-sm text-text-tertiary">{t('netWorth')}</Text>
                    </View>
                </View>

                {/* Details Card */}
                <View className="bg-bg-card rounded-2xl p-5 mb-4">
                    <Text className="text-lg font-semibold text-text-primary mb-4">
                        Details
                    </Text>

                    <View className="space-y-3">
                        {profile?.nationality && (
                            <View className="flex-row justify-between py-2">
                                <Text className="text-text-secondary">Nationality</Text>
                                <Text className="text-text-primary">{profile.nationality}</Text>
                            </View>
                        )}
                        {profile?.jobTitle && (
                            <View className="flex-row justify-between py-2">
                                <Text className="text-text-secondary">{t('currentPosition')}</Text>
                                <Text className="text-text-primary">{profile.jobTitle}</Text>
                            </View>
                        )}
                        {profile?.company && (
                            <View className="flex-row justify-between py-2">
                                <Text className="text-text-secondary">Company</Text>
                                <Text className="text-text-primary">{profile.company}</Text>
                            </View>
                        )}
                        {profile?.createdAt && (
                            <View className="flex-row justify-between py-2">
                                <Text className="text-text-secondary">{t('memberSince')}</Text>
                                <Text className="text-text-primary">
                                    {new Date(profile.createdAt).getFullYear()}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Edit Profile Button */}
                <TouchableOpacity
                    className="bg-accent-blue rounded-xl py-4 items-center"
                    activeOpacity={0.8}
                    onPress={() => setIsEditModalOpen(true)}
                >
                    <Text className="text-white font-semibold text-lg">
                        {t('editProfile')}
                    </Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Profile Edit Modal */}
            {profile && (
                <ProfileEditModal
                    visible={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    userId={profile.id}
                    currentUsername={profile.username}
                    onSave={(newUsername) => {
                        refetch()
                    }}
                />
            )}
        </SafeAreaView>
    )
}
