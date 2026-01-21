import React from 'react'
import { View, Text, Dimensions } from 'react-native'
import { LineChart as RNLineChart, BarChart as RNBarChart, PieChart as RNPieChart } from 'react-native-chart-kit'
import { useTheme } from '@/contexts/ThemeContext'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

// Common chart config
const useChartConfig = (color: string = '#007AFF') => {
    const { isDark } = useTheme()

    return {
        backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
        backgroundGradientFrom: isDark ? '#1C1C1E' : '#FFFFFF',
        backgroundGradientTo: isDark ? '#1C1C1E' : '#FFFFFF',
        decimalPlaces: 0,
        color: (opacity = 1) => {
            // Parse hex color and apply opacity
            const hex = color.replace('#', '')
            const r = parseInt(hex.substring(0, 2), 16)
            const g = parseInt(hex.substring(2, 4), 16)
            const b = parseInt(hex.substring(4, 6), 16)
            return `rgba(${r}, ${g}, ${b}, ${opacity})`
        },
        labelColor: () => isDark ? '#8E8E93' : '#636366',
        style: {
            borderRadius: 16,
        },
        propsForBackgroundLines: {
            strokeDasharray: '',
            stroke: isDark ? '#38383A' : '#E5E5EA',
            strokeWidth: 1,
        },
    }
}

interface HistoryChartProps {
    data: number[]
    labels?: string[]
    color?: string
    height?: number
    width?: number
    showLabels?: boolean
    title?: string
}

export function HistoryChart({
    data,
    labels,
    color = '#007AFF',
    height = 200,
    width = SCREEN_WIDTH - 48,
    showLabels = true,
    title,
}: HistoryChartProps) {
    const chartConfig = useChartConfig(color)

    if (data.length === 0) {
        return (
            <View className="items-center justify-center" style={{ height }}>
                <Text className="text-text-tertiary">No data</Text>
            </View>
        )
    }

    const chartData = {
        labels: labels || data.map((_, i) => `${i + 1}`),
        datasets: [{ data }],
    }

    return (
        <View>
            {title && (
                <Text className="text-sm font-medium text-text-primary mb-2">{title}</Text>
            )}
            <RNLineChart
                data={chartData}
                width={width}
                height={height}
                chartConfig={chartConfig}
                bezier
                style={{ borderRadius: 12 }}
                withHorizontalLabels={showLabels}
                withVerticalLabels={showLabels}
                withDots={data.length <= 10}
                withShadow={false}
                fromZero
            />
        </View>
    )
}

interface BarChartProps {
    data: { label: string; value: number }[]
    color?: string
    height?: number
    width?: number
    title?: string
}

export function SimpleBarChart({
    data,
    color = '#34C759',
    height = 200,
    width = SCREEN_WIDTH - 48,
    title,
}: BarChartProps) {
    const chartConfig = useChartConfig(color)

    if (data.length === 0) {
        return (
            <View className="items-center justify-center" style={{ height }}>
                <Text className="text-text-tertiary">No data</Text>
            </View>
        )
    }

    const chartData = {
        labels: data.map(d => d.label),
        datasets: [{ data: data.map(d => d.value) }],
    }

    return (
        <View>
            {title && (
                <Text className="text-sm font-medium text-text-primary mb-2">{title}</Text>
            )}
            <RNBarChart
                data={chartData}
                width={width}
                height={height}
                chartConfig={chartConfig}
                style={{ borderRadius: 12 }}
                fromZero
                showValuesOnTopOfBars
                yAxisLabel=""
                yAxisSuffix=""
            />
        </View>
    )
}

interface ProgressRingProps {
    progress: number // 0-100
    size?: number
    strokeWidth?: number
    color?: string
    showValue?: boolean
    label?: string
}

export function ProgressRing({
    progress,
    size = 120,
    strokeWidth = 12,
    color = '#007AFF',
    showValue = true,
    label,
}: ProgressRingProps) {
    const { isDark } = useTheme()
    const clampedProgress = Math.min(100, Math.max(0, progress))
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference - (clampedProgress / 100) * circumference

    return (
        <View className="items-center">
            <View style={{ width: size, height: size }}>
                {/* Background Circle */}
                <View
                    style={{
                        position: 'absolute',
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                        borderWidth: strokeWidth,
                        borderColor: isDark ? '#38383A' : '#E5E5EA',
                    }}
                />
                {/* Progress Circle - simplified without SVG */}
                <View
                    style={{
                        position: 'absolute',
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                        borderWidth: strokeWidth,
                        borderColor: color,
                        borderTopColor: 'transparent',
                        borderRightColor: 'transparent',
                        transform: [{ rotate: `${(clampedProgress / 100) * 360 - 90}deg` }],
                    }}
                />
                {/* Center Value */}
                {showValue && (
                    <View
                        className="absolute inset-0 items-center justify-center"
                        style={{ width: size, height: size }}
                    >
                        <Text
                            className="text-2xl font-bold"
                            style={{ color }}
                        >
                            {Math.round(clampedProgress)}
                        </Text>
                    </View>
                )}
            </View>
            {label && (
                <Text className="text-sm text-text-tertiary mt-2">{label}</Text>
            )}
        </View>
    )
}

interface DonutChartProps {
    data: { name: string; value: number; color: string }[]
    size?: number
    title?: string
}

export function DonutChart({
    data,
    size = 200,
    title,
}: DonutChartProps) {
    const { isDark } = useTheme()

    if (data.length === 0) {
        return (
            <View className="items-center justify-center" style={{ height: size }}>
                <Text className="text-text-tertiary">No data</Text>
            </View>
        )
    }

    const chartData = data.map(d => ({
        name: d.name,
        population: d.value,
        color: d.color,
        legendFontColor: isDark ? '#8E8E93' : '#636366',
        legendFontSize: 12,
    }))

    return (
        <View className="items-center">
            {title && (
                <Text className="text-sm font-medium text-text-primary mb-2">{title}</Text>
            )}
            <RNPieChart
                data={chartData}
                width={SCREEN_WIDTH - 48}
                height={size}
                chartConfig={{
                    color: () => isDark ? '#FFFFFF' : '#1C1C1E',
                }}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
            />
        </View>
    )
}
