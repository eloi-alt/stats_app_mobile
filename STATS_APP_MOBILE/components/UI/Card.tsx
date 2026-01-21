import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { useTheme } from '@/contexts/ThemeContext'
import { Ionicons } from '@expo/vector-icons'

type IconName = keyof typeof Ionicons.glyphMap

interface CardProps {
    children: React.ReactNode
    className?: string
    onPress?: () => void
    padding?: 'sm' | 'md' | 'lg'
}

export function Card({ children, className = '', onPress, padding = 'md' }: CardProps) {
    const paddingClass = {
        sm: 'p-3',
        md: 'p-5',
        lg: 'p-6',
    }[padding]

    const content = (
        <View className={`bg-bg-card rounded-2xl ${paddingClass} ${className}`}>
            {children}
        </View>
    )

    if (onPress) {
        return (
            <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
                {content}
            </TouchableOpacity>
        )
    }

    return content
}

interface CardHeaderProps {
    title: string
    icon?: IconName
    iconColor?: string
    action?: React.ReactNode
}

export function CardHeader({ title, icon, iconColor, action }: CardHeaderProps) {
    const { isDark } = useTheme()
    const defaultIconColor = isDark ? '#FFFFFF' : '#1C1C1E'

    return (
        <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
                {icon && (
                    <View className="w-8 h-8 rounded-lg bg-bg-secondary items-center justify-center mr-3">
                        <Ionicons name={icon} size={16} color={iconColor || defaultIconColor} />
                    </View>
                )}
                <Text className="text-lg font-semibold text-text-primary">{title}</Text>
            </View>
            {action}
        </View>
    )
}

interface CardRowProps {
    label: string
    value: string | number
    icon?: IconName
    iconColor?: string
    showBorder?: boolean
}

export function CardRow({ label, value, icon, iconColor, showBorder = true }: CardRowProps) {
    const { isDark } = useTheme()

    return (
        <View
            className={`flex-row items-center justify-between py-3 ${showBorder ? 'border-b border-border-light' : ''}`}
        >
            <View className="flex-row items-center">
                {icon && (
                    <Ionicons
                        name={icon}
                        size={16}
                        color={iconColor || (isDark ? '#8E8E93' : '#636366')}
                        style={{ marginRight: 8 }}
                    />
                )}
                <Text className="text-text-secondary">{label}</Text>
            </View>
            <Text className="text-text-primary font-medium">{value}</Text>
        </View>
    )
}

interface EmptyStateProps {
    icon: IconName
    title: string
    description?: string
    action?: React.ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    const { isDark } = useTheme()

    return (
        <View className="items-center py-8">
            <View className="w-16 h-16 rounded-full bg-bg-secondary items-center justify-center mb-4">
                <Ionicons name={icon} size={32} color={isDark ? '#8E8E93' : '#636366'} />
            </View>
            <Text className="text-lg font-semibold text-text-primary text-center mb-2">
                {title}
            </Text>
            {description && (
                <Text className="text-text-secondary text-center mb-4">
                    {description}
                </Text>
            )}
            {action}
        </View>
    )
}
