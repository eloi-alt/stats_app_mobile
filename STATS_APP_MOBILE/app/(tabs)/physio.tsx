import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useHealthData } from '@/hooks/useHealthData'
import { useAuth } from '@/contexts/AuthContext'
import { StatCard, SectionHeader, Card, CardHeader, EmptyState } from '@/components/UI'
import { HistoryChart, SimpleBarChart, ProgressRing } from '@/components/Charts'
import { Ionicons } from '@expo/vector-icons'
import HealthDataEntryModal from '@/components/Modals/HealthDataEntryModal'

export default function PhysioScreen() {
    const { t } = useLanguage()
    const { user } = useAuth()
    const {
        sleepData,
        sportSessions,
        isLoading,
        isDemo,
        currentWeight,
        weightGoal,
        refetch
    } = useHealthData()
    const [refreshing, setRefreshing] = useState(false)
    const [modalMetric, setModalMetric] = useState<'sleep' | 'activity' | 'weight' | null>(null)

    const onRefresh = async () => {
        setRefreshing(true)
        await refetch()
        setRefreshing(false)
    }

    // Safety check for data
    const safeSleepData = sleepData || []
    const safeSportSessions = sportSessions || []

    // Prepare Sleep Data for Chart
    const sleepLabels = safeSleepData.slice(0, 7).map(d => {
        const date = new Date(d.date)
        return `${date.getDate()}/${date.getMonth() + 1}`
    }).reverse()

    const sleepValues = safeSleepData.slice(0, 7).map(d => d.duration).reverse()

    // Prepare Sport Data (Last 5 Sessions Calories)
    const sportData = safeSportSessions.slice(0, 5).map(s => ({
        label: s.type.substring(0, 4), // Short label
        value: s.calories_burned || 0
    })).reverse()

    // Calculate Body Goal Progress
    const weightProgress = weightGoal ? (Math.min(currentWeight, weightGoal) / Math.max(currentWeight, weightGoal) * 100) : 0

    return (
        <SafeAreaView className="flex-1 bg-bg-primary" edges={['top']}>
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#34C759" />
                }
            >
                {/* Header */}
                <View className="flex-row justify-between items-center mb-6">
                    <View>
                        <Text className="text-3xl font-bold text-text-primary mb-2">
                            {t('health')}
                        </Text>
                        <Text className="text-base text-text-secondary">
                            {isDemo ? t('demoData') : 'Your physical status'}
                        </Text>
                    </View>
                    <View className="flex-row gap-2">
                        <TouchableOpacity
                            onPress={() => setModalMetric('activity')}
                            className="bg-accent-rose/20 p-3 rounded-full"
                        >
                            <Ionicons name="fitness" size={24} color="#FF3B30" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setModalMetric('sleep')}
                            className="bg-accent-purple/20 p-3 rounded-full"
                        >
                            <Ionicons name="moon" size={24} color="#AF52DE" />
                        </TouchableOpacity>
                    </View>
                </View>

                {isLoading ? (
                    <Text className="text-text-secondary">{t('loading')}</Text>
                ) : (
                    <>
                        {/* Sleep Section */}
                        <SectionHeader title={t('sleep')} />
                        <Card className="mb-6">
                            <CardHeader
                                title="Sleep Duration (7 Days)"
                                icon="moon-outline"
                                iconColor="#AF52DE"
                            />
                            {safeSleepData.length > 0 ? (
                                <HistoryChart
                                    data={sleepValues}
                                    labels={sleepLabels}
                                    height={220}
                                    color="#AF52DE"
                                />
                            ) : (
                                <EmptyState title="No sleep data" icon="bed-outline" />
                            )}
                        </Card>

                        {/* Sport Section */}
                        <SectionHeader title={t('sport')} />
                        <Card className="mb-6">
                            <CardHeader
                                title="Recent Workouts (Calories)"
                                icon="flame-outline"
                                iconColor="#FF3B30"
                            />
                            {safeSportSessions.length > 0 ? (
                                <SimpleBarChart
                                    data={sportData}
                                    height={220}
                                />
                            ) : (
                                <EmptyState title="No workouts yet" icon="fitness-outline" />
                            )}
                        </Card>

                        {/* Body Section */}
                        <SectionHeader title="Body" />
                        <View className="flex-row gap-4 mb-4">
                            <Card className="flex-1 items-center justify-center p-4">
                                <Text className="text-text-secondary text-xs uppercase mb-2">Weight Goal</Text>
                                <ProgressRing
                                    progress={weightProgress}
                                    size={100}
                                    strokeWidth={8}
                                    color="#007AFF"
                                />
                                <View className="absolute inset-0 items-center justify-center pt-6">
                                    <Text className="font-bold text-text-primary">
                                        {currentWeight}
                                    </Text>
                                    <Text className="text-xs text-text-tertiary">
                                        / {weightGoal} kg
                                    </Text>
                                </View>
                            </Card>

                            <View className="flex-1 justify-between">
                                <StatCard
                                    label="Weight"
                                    value={currentWeight}
                                    unit="kg"
                                    icon="scale-outline"
                                    color="#007AFF"
                                    onPress={() => setModalMetric('weight')}
                                />
                                <View className="h-4" />
                                <StatCard
                                    label="BMI"
                                    value={22.5}
                                    icon="body-outline"
                                    color="#34C759"
                                />
                            </View>
                        </View>

                    </>
                )}
            </ScrollView>

            {/* Health Data Entry Modal */}
            {user && (
                <HealthDataEntryModal
                    visible={!!modalMetric}
                    onClose={() => setModalMetric(null)}
                    userId={user.id}
                    metricType={modalMetric}
                    onSave={() => {
                        refetch()
                    }}
                />
            )}
        </SafeAreaView>
    )
}
