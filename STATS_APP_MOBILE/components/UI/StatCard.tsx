import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

type IconName = keyof typeof Ionicons.glyphMap

interface StatCardProps {
    value: string | number
    label: string
    unit?: string
    icon?: IconName
    color?: string
    className?: string
    onPress?: () => void
}

export default function StatCard({
    value,
    label,
    unit,
    icon,
    color = '#D4AF37', // accent-gold
    className = '',
    onPress,
}: StatCardProps) {
    const Content = (
        <View
            className={`rounded-xl p-4 items-center ${className}`}
            style={{
                backgroundColor: `${color}15`,
                borderWidth: 1,
                borderColor: `${color}30`,
            }}
        >
            {icon && (
                <View
                    className="w-8 h-8 rounded-lg items-center justify-center mb-2"
                    style={{ backgroundColor: `${color}20` }}
                >
                    <Ionicons name={icon} size={16} color={color} />
                </View>
            )}
            <View className="flex-row items-baseline">
                <Text
                    className="text-xl font-light"
                    style={{ color }}
                >
                    {value}
                </Text>
                {unit && (
                    <Text className="text-[10px] ml-1 opacity-60" style={{ color }}>
                        {unit}
                    </Text>
                )}
            </View>
            <Text className="text-[9px] uppercase tracking-widest mt-1 text-text-tertiary text-center">
                {label}
            </Text>
        </View>
    )

    if (onPress) {
        return (
            <TouchableOpacity onPress={onPress} activeOpacity={0.7} className={className}>
                {Content}
            </TouchableOpacity>
        )
    }

    return Content
}
