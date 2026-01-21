import React, { useState, useMemo } from 'react'
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native'
import { useLanguage } from '@/contexts/LanguageContext'
import BaseModal from '../UI/BaseModal'
import { Ionicons } from '@expo/vector-icons'
import { COUNTRY_NAMES } from '@/hooks/useTravelData'

interface AddCountryModalProps {
    visible: boolean
    onClose: () => void
    onAddTrip: (countryCode: string, year: number, city?: string) => Promise<boolean>
    isDemo: boolean
}

// Get flag emoji setup
const getFlagEmoji = (countryCode: string): string => {
    if (!countryCode) return '🏳️'
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0))
    return String.fromCodePoint(...codePoints)
}

const ALL_COUNTRIES = Object.entries(COUNTRY_NAMES).map(([code, name]) => ({
    code,
    name,
    flag: getFlagEmoji(code)
})).sort((a, b) => a.name.localeCompare(b.name))

export default function AddCountryModal({
    visible,
    onClose,
    onAddTrip,
    isDemo
}: AddCountryModalProps) {
    const { t } = useLanguage()
    const [step, setStep] = useState<'country' | 'details'>('country')
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCountry, setSelectedCountry] = useState<{ code: string; name: string, flag: string } | null>(null)
    const [year, setYear] = useState(new Date().getFullYear().toString())
    const [city, setCity] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    // Filter countries
    const filteredCountries = useMemo(() => {
        if (!searchQuery.trim()) return ALL_COUNTRIES.slice(0, 50)
        const query = searchQuery.toLowerCase()
        return ALL_COUNTRIES.filter(c =>
            c.name.toLowerCase().includes(query) ||
            c.code.toLowerCase().includes(query)
        ).slice(0, 50)
    }, [searchQuery])

    const handleSelectCountry = (country: typeof ALL_COUNTRIES[0]) => {
        setSelectedCountry(country)
        setStep('details')
    }

    const handleBack = () => {
        setStep('country')
        setSelectedCountry(null)
    }

    const handleSubmit = async () => {
        if (!selectedCountry) return

        setIsLoading(true)
        try {
            const success = await onAddTrip(
                selectedCountry.code,
                parseInt(year) || 2024,
                city || undefined
            )
            if (success) {
                handleReset()
                onClose()
            }
        } catch (error) {
            console.error('Error adding trip:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleReset = () => {
        setStep('country')
        setSearchQuery('')
        setSelectedCountry(null)
        setYear(new Date().getFullYear().toString())
        setCity('')
    }

    return (
        <BaseModal
            visible={visible}
            onClose={() => {
                handleReset()
                onClose()
            }}
            title={step === 'country' ? t('addTrip') || 'Add Trip' : selectedCountry?.name}
        >
            {step === 'country' ? (
                <View className="h-[500px]">
                    {/* Search */}
                    <View className="mb-4 bg-bg-secondary flex-row items-center rounded-xl px-3 py-2">
                        <Ionicons name="search" size={20} color="#8E8E93" />
                        <TextInput
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholder={t('searchCountry') || "Search for a country..."}
                            placeholderTextColor="#8E8E93"
                            className="flex-1 ml-2 text-text-primary text-base"
                            autoCorrect={false}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Ionicons name="close-circle" size={16} color="#8E8E93" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* List */}
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {filteredCountries.map(country => (
                            <TouchableOpacity
                                key={country.code}
                                onPress={() => handleSelectCountry(country)}
                                className="flex-row items-center p-4 border-b border-bg-secondary active:bg-bg-secondary"
                            >
                                <Text className="text-3xl mr-4">{country.flag}</Text>
                                <View>
                                    <Text className="text-text-primary text-base font-medium">{country.name}</Text>
                                    <Text className="text-text-tertiary text-xs">{country.code}</Text>
                                </View>
                                <View className="flex-1 items-end">
                                    <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            ) : (
                <View>
                    {/* Header with Back */}
                    <TouchableOpacity onPress={handleBack} className="flex-row items-center mb-6">
                        <Ionicons name="arrow-back" size={20} color="#007AFF" />
                        <Text className="text-accent-blue ml-1 font-medium">{t('back') || 'Back'}</Text>
                    </TouchableOpacity>

                    {/* Country Display */}
                    <View className="flex-row items-center bg-bg-secondary p-4 rounded-xl mb-6">
                        <Text className="text-4xl mr-4">{selectedCountry?.flag}</Text>
                        <View>
                            <Text className="text-text-primary text-xl font-bold">{selectedCountry?.name}</Text>
                            <Text className="text-accent-blue font-bold">{selectedCountry?.code}</Text>
                        </View>
                    </View>

                    {/* Form */}
                    <View className="mb-4">
                        <Text className="text-xs font-medium text-text-tertiary mb-2 uppercase">Year Visited</Text>
                        <TextInput
                            value={year}
                            onChangeText={setYear}
                            keyboardType="number-pad"
                            className="bg-bg-secondary p-4 rounded-xl text-text-primary text-lg"
                        />
                    </View>

                    <View className="mb-6">
                        <Text className="text-xs font-medium text-text-tertiary mb-2 uppercase">City (Optional)</Text>
                        <TextInput
                            value={city}
                            onChangeText={setCity}
                            placeholder="e.g. Paris, Tokyo"
                            placeholderTextColor="#8E8E93"
                            className="bg-bg-secondary p-4 rounded-xl text-text-primary text-lg"
                        />
                    </View>

                    {isDemo && (
                        <View className="bg-accent-orange/20 p-3 rounded-xl mb-4">
                            <Text className="text-accent-orange text-center text-sm">
                                {t('demoData') || 'Demo mode: Changes will not be saved'}
                            </Text>
                        </View>
                    )}

                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={isLoading || isDemo}
                        className="w-full py-4 rounded-xl bg-accent-blue items-center"
                        style={{ opacity: (isLoading || isDemo) ? 0.5 : 1 }}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white font-semibold text-lg">{t('saveTrip') || 'Add Trip'}</Text>
                        )}
                    </TouchableOpacity>
                </View>
            )}
        </BaseModal>
    )
}
