import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useTravelData } from '@/hooks/useTravelData'
import { useAuth } from '@/contexts/AuthContext'
import { DonutChart } from '@/components/Charts'
import { SectionHeader, StatCard, Card } from '@/components/UI'
import { Ionicons } from '@expo/vector-icons'
import AddCountryModal from '@/components/Modals/AddCountryModal'

export default function WorldScreen() {
    const { t } = useLanguage()
    const { user } = useAuth()
    const {
        trips,
        isLoading,
        isDemo,
        totalCountries,
        totalTrips,
        addTrip,
        refetch
    } = useTravelData()

    const [refreshing, setRefreshing] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const onRefresh = async () => {
        setRefreshing(true)
        await refetch()
        setRefreshing(false)
    }

    const safeTrips = trips || []
    const WORLD_COUNTRIES = 195
    const percentageVisited = Math.round((totalCountries / WORLD_COUNTRIES) * 100)

    const chartData = [
        { name: t('visited'), value: totalCountries, color: '#FF9500' },
        { name: t('left'), value: WORLD_COUNTRIES - totalCountries, color: 'rgba(255, 149, 0, 0.2)' }
    ]

    return (
        <SafeAreaView className="flex-1 bg-bg-primary" edges={['top']}>
            <View className="flex-1">
                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF9500" />
                    }
                >
                    {/* Header */}
                    <Text className="text-3xl font-bold text-text-primary mb-2">
                        {t('world')}
                    </Text>
                    <Text className="text-base text-text-secondary mb-6">
                        {isDemo ? t('demoData') : 'Your exploration map'}
                    </Text>

                    {isLoading ? (
                        <Text className="text-text-secondary">{t('loading')}</Text>
                    ) : (
                        <>
                            <Card className="items-center mb-6">
                                <DonutChart
                                    data={chartData}
                                    size={220}
                                />
                                <View className="absolute inset-0 items-center justify-center pt-8">
                                    <Text className="text-4xl font-bold text-text-primary">
                                        {percentageVisited}%
                                    </Text>
                                    <Text className="text-text-secondary text-xs uppercase tracking-widest">
                                        {t('world')}
                                    </Text>
                                </View>
                            </Card>

                            <View className="flex-row gap-4 mb-8">
                                <StatCard
                                    label={t('countries')}
                                    value={totalCountries}
                                    color="#FF9500"
                                    icon="earth-outline"
                                    className="flex-1"
                                />
                                <StatCard
                                    label={t('trips')}
                                    value={totalTrips}
                                    color="#FF9500"
                                    icon="airplane-outline"
                                    className="flex-1"
                                />
                            </View>

                            <SectionHeader title={t('trips')} />

                            {safeTrips.length > 0 ? (
                                safeTrips.map((trip) => (
                                    <View key={trip.id} className="bg-bg-card rounded-xl p-4 mb-3 border-l-4 border-accent-orange">
                                        <div className="flex-row justify-between mb-1">
                                            <Text className="font-semibold text-text-primary text-lg">
                                                {trip.country_code} {trip.city_name ? `- ${trip.city_name}` : ''}
                                            </Text>
                                            <Text className="text-accent-orange font-bold">
                                                {trip.year}
                                            </Text>
                                        </div>
                                        <Text className="text-text-secondary" numberOfLines={2}>
                                            {trip.description || 'No notes'}
                                        </Text>
                                    </View>
                                ))
                            ) : (
                                <Text className="text-text-secondary">{t('noData')}</Text>
                            )}
                        </>
                    )}
                </ScrollView>

                <TouchableOpacity
                    onPress={() => setIsModalOpen(true)}
                    className="absolute bottom-6 right-6 w-14 h-14 bg-accent-orange rounded-full items-center justify-center shadow-lg"
                    style={{ shadowColor: '#FF9500', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 }}
                >
                    <Ionicons name="add" size={32} color="white" />
                </TouchableOpacity>

                <AddCountryModal
                    visible={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    isDemo={isDemo}
                    onAddTrip={async (code, year, city) => {
                        return await addTrip(code, year, city)
                    }}
                />
            </View>
        </SafeAreaView>
    )
}
