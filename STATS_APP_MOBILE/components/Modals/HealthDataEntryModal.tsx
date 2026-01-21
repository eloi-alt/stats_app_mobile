import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Platform } from 'react-native'
import { useLanguage } from '@/contexts/LanguageContext'
import { supabase } from '@/lib/supabase'
import BaseModal from '../UI/BaseModal'
import { Ionicons } from '@expo/vector-icons'
import DateTimePicker from '@react-native-community/datetimepicker'

interface HealthDataEntryModalProps {
    visible: boolean
    onClose: () => void
    userId: string
    metricType: 'sleep' | 'activity' | 'weight' | null
    onSave: () => void
}

export default function HealthDataEntryModal({
    visible,
    onClose,
    userId,
    metricType,
    onSave
}: HealthDataEntryModalProps) {
    const { t } = useLanguage()
    const [isLoading, setIsLoading] = useState(false)

    // Form State
    const [value, setValue] = useState('')
    const [date, setDate] = useState(new Date())
    const [description, setDescription] = useState('')

    // Sleep Specific
    const [sleepStart, setSleepStart] = useState(new Date())
    const [sleepEnd, setSleepEnd] = useState(new Date())

    const getTitle = () => {
        switch (metricType) {
            case 'sleep': return t('sleep')
            case 'activity': return t('sport')
            case 'weight': return t('weight')
            default: return 'Add Data'
        }
    }

    const handleSave = async () => {
        setIsLoading(true)
        try {
            if (metricType === 'sleep') {
                const durationHours = (sleepEnd.getTime() - sleepStart.getTime()) / (1000 * 60 * 60)
                if (durationHours <= 0) {
                    alert('End time must be after start time')
                    setIsLoading(false)
                    return
                }

                const { error } = await supabase.from('sleep_records').insert({
                    user_id: userId,
                    duration_hours: durationHours,
                    sleep_date: date.toISOString().split('T')[0],
                    quality_score: 75, // Default for manual entry
                })
                if (error) throw error
            }

            if (metricType === 'activity') {
                const { error } = await supabase.from('sport_sessions').insert({
                    user_id: userId,
                    type: description || 'Workout',
                    duration_minutes: parseInt(value) || 0,
                    calories_burned: (parseInt(value) || 0) * 8, // Estimate
                    session_date: date.toISOString(),
                })
                if (error) throw error
            }

            if (metricType === 'weight') {
                const { error } = await supabase.from('body_measurements').insert({
                    user_id: userId,
                    weight: parseFloat(value),
                    measurement_date: date.toISOString().split('T')[0],
                })
                if (error) throw error
            }

            onSave()
            onClose()
            // Reset form
            setValue('')
            setDescription('')
        } catch (error: any) {
            console.error('Error saving health data:', error)
            alert('Error saving data')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <BaseModal
            visible={visible}
            onClose={onClose}
            title={getTitle()}
        >
            <View className="mb-6">

                {/* Date Picker (Platform specific simplification) */}
                <View className="mb-4">
                    <Text className="text-xs font-medium text-text-tertiary mb-2 uppercase">Date</Text>
                    <View className="bg-bg-secondary p-3 rounded-xl">
                        <Text className="text-text-primary">{date.toLocaleDateString()}</Text>
                    </View>
                </View>

                {metricType === 'sleep' ? (
                    <View className="gap-4">
                        <View>
                            <Text className="text-xs font-medium text-text-tertiary mb-2 uppercase">Bed Time</Text>
                            <View className="bg-bg-secondary p-3 rounded-xl flex-row justify-between items-center">
                                <Text className="text-text-primary">{sleepStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                                {/* In a real app, use a TimePicker here */}
                                <TouchableOpacity onPress={() => {
                                    const newTime = new Date(sleepStart)
                                    newTime.setHours(newTime.getHours() - 1)
                                    setSleepStart(newTime)
                                }}>
                                    <Ionicons name="remove-circle-outline" size={24} color="#FF9500" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => {
                                    const newTime = new Date(sleepStart)
                                    newTime.setHours(newTime.getHours() + 1)
                                    setSleepStart(newTime)
                                }}>
                                    <Ionicons name="add-circle-outline" size={24} color="#FF9500" />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View>
                            <Text className="text-xs font-medium text-text-tertiary mb-2 uppercase">Wake Time</Text>
                            <View className="bg-bg-secondary p-3 rounded-xl flex-row justify-between items-center">
                                <Text className="text-text-primary">{sleepEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                                <TouchableOpacity onPress={() => {
                                    const newTime = new Date(sleepEnd)
                                    newTime.setHours(newTime.getHours() - 1)
                                    setSleepEnd(newTime)
                                }}>
                                    <Ionicons name="remove-circle-outline" size={24} color="#FF9500" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => {
                                    const newTime = new Date(sleepEnd)
                                    newTime.setHours(newTime.getHours() + 1)
                                    setSleepEnd(newTime)
                                }}>
                                    <Ionicons name="add-circle-outline" size={24} color="#FF9500" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View className="bg-accent-blue/10 p-3 rounded-xl">
                            <Text className="text-accent-blue text-center font-bold">
                                Duration: {((sleepEnd.getTime() - sleepStart.getTime()) / (1000 * 60 * 60)).toFixed(1)} hrs
                            </Text>
                        </View>
                    </View>
                ) : (
                    <View>
                        <Text className="text-xs font-medium text-text-tertiary mb-2 uppercase">
                            {metricType === 'weight' ? 'Weight (kg)' : 'Duration (min)'}
                        </Text>
                        <TextInput
                            value={value}
                            onChangeText={setValue}
                            keyboardType="numeric"
                            className="bg-bg-secondary p-4 rounded-xl text-text-primary text-lg mb-4"
                            placeholder="0"
                            placeholderTextColor="#8E8E93"
                        />

                        {metricType === 'activity' && (
                            <View>
                                <Text className="text-xs font-medium text-text-tertiary mb-2 uppercase">Activity Type</Text>
                                <TextInput
                                    value={description}
                                    onChangeText={setDescription}
                                    className="bg-bg-secondary p-4 rounded-xl text-text-primary text-base"
                                    placeholder="Running, Yoga, etc."
                                    placeholderTextColor="#8E8E93"
                                />
                            </View>
                        )}
                    </View>
                )}

            </View>

            <View className="flex-row gap-3">
                <TouchableOpacity
                    onPress={onClose}
                    className="flex-1 py-4 rounded-xl bg-bg-secondary items-center"
                >
                    <Text className="text-text-secondary font-semibold">{t('cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={handleSave}
                    disabled={isLoading}
                    className="flex-1 py-4 rounded-xl bg-accent-blue items-center"
                >
                    {isLoading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-semibold">{t('save')}</Text>
                    )}
                </TouchableOpacity>
            </View>
        </BaseModal>
    )
}
