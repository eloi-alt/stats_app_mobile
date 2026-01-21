import React from 'react'
import { View, Text } from 'react-native'
import { useTheme } from '@/contexts/ThemeContext'

interface SectionHeaderProps {
    title: string
    uppercase?: boolean
    centered?: boolean
    className?: string
}

export default function SectionHeader({
    title,
    uppercase = true,
    centered = true,
    className = '',
}: SectionHeaderProps) {
    const { isDark } = useTheme()
    const lineColor = isDark ? '#38383A' : '#E5E5EA'
    const textColor = centered
        ? (isDark ? '#8E8E93' : '#636366')
        : (isDark ? '#FFFFFF' : '#1C1C1E')

    return (
        <View className={`flex-row items-center gap-3 mb-4 px-1 ${className}`}>
            {centered && (
                <View
                    className="h-px flex-1"
                    style={{ backgroundColor: lineColor }}
                />
            )}
            <Text
                className={uppercase ? 'text-[10px] tracking-[2px] uppercase font-semibold' : 'text-sm tracking-wider font-semibold'}
                style={{ color: textColor }}
            >
                {title}
            </Text>
            {centered && (
                <View
                    className="h-px flex-1"
                    style={{ backgroundColor: lineColor }}
                />
            )}
        </View>
    )
}
