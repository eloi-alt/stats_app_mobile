import React from 'react'
import { View, Text } from 'react-native'
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated'

interface ProgressBarProps {
    progress: number
    color?: string
    height?: number
    showLabel?: boolean
    label?: string
    className?: string
}

export default function ProgressBar({
    progress,
    color = '#8B9A6B', // accent-sage
    height = 6,
    showLabel = false,
    label,
    className = '',
}: ProgressBarProps) {
    const clampedProgress = Math.min(100, Math.max(0, progress))

    return (
        <View className={className}>
            {showLabel && (
                <View className="flex-row justify-between mb-1">
                    <Text className="text-[10px] text-text-tertiary">{label}</Text>
                    <Text className="text-[10px]" style={{ color }}>
                        {Math.round(clampedProgress)}%
                    </Text>
                </View>
            )}
            <View
                className="relative rounded-full overflow-hidden"
                style={{
                    height,
                    backgroundColor: 'rgba(0, 0, 0, 0.08)'
                }}
            >
                <View
                    className="absolute left-0 top-0 h-full rounded-full"
                    style={{
                        width: `${clampedProgress}%`,
                        backgroundColor: color,
                    }}
                />
            </View>
        </View>
    )
}
