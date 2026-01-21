import { View, Text, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLanguage } from '@/contexts/LanguageContext'
import { useFinancialData } from '@/hooks/useFinancialData'
import { useProfileData } from '@/hooks/useProfileData'
import { DonutChart } from '@/components/Charts'
import { SectionHeader, StatCard, Card, CardHeader, CardRow } from '@/components/UI'

export default function ProScreen() {
    const { t } = useLanguage()
    const {
        assets,
        liabilities,
        netWorth,
        liquidAssets,
        isLoading: isFinanceLoading,
        isDemo
    } = useFinancialData()

    const { profile, isLoading: isProfileLoading } = useProfileData()
    const isLoading = isFinanceLoading || isProfileLoading

    // Safety
    const safeAssets = assets || []
    const safeLiabilities = liabilities || []

    // Format Large Numbers
    const formatCurrency = (amount: number) => {
        if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`
        if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`
        return `$${amount}`
    }

    // Group Assets for Chart
    const assetDistribution = safeAssets.reduce((acc, asset) => {
        const existing = acc.find(a => a.name === asset.asset_type)
        if (existing) {
            existing.value += asset.current_value
        } else {
            // Assign colors based on type
            let color = '#8E8E93'
            switch (asset.asset_type) {
                case 'real_estate': color = '#FF3B30'; break; // Red
                case 'stocks': color = '#34C75 green'; break; // Green
                case 'crypto': color = '#5856D6'; break; // Purple
                case 'cash': color = '#FFCC00'; break; // Yellow
                case 'vehicle': color = '#007AFF'; break; // Blue
            }
            acc.push({ name: asset.asset_type, value: asset.current_value, color })
        }
        return acc
    }, [] as { name: string; value: number; color: string }[])

    return (
        <SafeAreaView className="flex-1 bg-bg-primary" edges={['top']}>
            <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }}>
                {/* Header */}
                <Text className="text-3xl font-bold text-text-primary mb-2">
                    {t('career')}
                </Text>
                <Text className="text-base text-text-secondary mb-6">
                    {isDemo ? t('demoData') : 'Your financial overview'}
                </Text>

                {isLoading ? (
                    <Text className="text-text-secondary">{t('loading')}</Text>
                ) : (
                    <>
                        {/* Net Worth Card */}
                        <Card className="mb-6 bg-bg-card border-none">
                            <View>
                                <Text className="text-text-secondary text-sm uppercase mb-1">Net Worth</Text>
                                <Text className="text-4xl font-bold text-accent-gold mb-2">
                                    {formatCurrency(netWorth)}
                                </Text>
                                <View className="flex-row gap-2">
                                    <View className="bg-accent-green/20 px-2 py-1 rounded">
                                        <Text className="text-accent-green text-xs font-bold">+12% YTD</Text>
                                    </View>
                                    <View className="bg-bg-secondary px-2 py-1 rounded">
                                        <Text className="text-text-secondary text-xs"> liquid: {formatCurrency(liquidAssets)}</Text>
                                    </View>
                                </View>
                            </View>
                        </Card>

                        {/* Asset Allocation */}
                        <SectionHeader title="Asset Allocation" />
                        <Card className="mb-6 items-center">
                            <DonutChart
                                data={assetDistribution}
                                size={200}
                            />
                        </Card>

                        {/* Career Info */}
                        <SectionHeader title="Professional" />
                        <Card className="mb-6">
                            <CardRow
                                label="Total Assets"
                                value={formatCurrency(safeAssets.reduce((sum, a) => sum + a.current_value, 0))}
                                icon="wallet-outline"
                                iconColor="#34C759"
                            />
                            <CardRow
                                label="Liabilities"
                                value={formatCurrency(safeLiabilities.reduce((sum, l) => sum + l.remaining_amount, 0))}
                                icon="card-outline"
                                iconColor="#FF3B30"
                            />
                            {profile?.jobTitle && (
                                <CardRow
                                    label="Current Role"
                                    value={profile.jobTitle}
                                    icon="briefcase-outline"
                                    iconColor="#007AFF"
                                    showBorder={false}
                                />
                            )}
                        </Card>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    )
}
