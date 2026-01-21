import React from 'react'
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    TouchableWithoutFeedback,
    ScrollView,
    Dimensions
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '@/contexts/ThemeContext'
import { Ionicons } from '@expo/vector-icons'

interface BaseModalProps {
    visible: boolean
    onClose: () => void
    title?: string
    children: React.ReactNode
    showCloseButton?: boolean
    fullScreen?: boolean
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window')

export default function BaseModal({
    visible,
    onClose,
    title,
    children,
    showCloseButton = true,
    fullScreen = false,
}: BaseModalProps) {
    const { isDark } = useTheme()
    const bgColor = isDark ? '#1C1C1E' : '#FFFFFF'
    const iconColor = isDark ? '#FFFFFF' : '#1C1C1E'

    if (fullScreen) {
        return (
            <Modal
                visible={visible}
                animationType="slide"
                presentationStyle="fullScreen"
                onRequestClose={onClose}
            >
                <SafeAreaView
                    className="flex-1"
                    style={{ backgroundColor: isDark ? '#000000' : '#FAFAF8' }}
                >
                    {/* Header */}
                    <View className="flex-row items-center justify-between px-6 py-4 border-b border-border-light">
                        {showCloseButton && (
                            <TouchableOpacity onPress={onClose} className="p-2 -ml-2">
                                <Ionicons name="close" size={24} color={iconColor} />
                            </TouchableOpacity>
                        )}
                        {title && (
                            <Text className="text-lg font-semibold text-text-primary flex-1 text-center">
                                {title}
                            </Text>
                        )}
                        {showCloseButton && <View className="w-10" />}
                    </View>

                    {/* Content */}
                    <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }}>
                        {children}
                    </ScrollView>
                </SafeAreaView>
            </Modal>
        )
    }

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <TouchableWithoutFeedback>
                        <View
                            className="rounded-t-3xl overflow-hidden"
                            style={{
                                backgroundColor: bgColor,
                                maxHeight: SCREEN_HEIGHT * 0.85,
                            }}
                        >
                            {/* Handle */}
                            <View className="items-center py-3">
                                <View
                                    className="w-10 h-1 rounded-full"
                                    style={{ backgroundColor: isDark ? '#48484A' : '#D1D1D6' }}
                                />
                            </View>

                            {/* Header */}
                            {(title || showCloseButton) && (
                                <View className="flex-row items-center justify-between px-6 pb-4">
                                    {showCloseButton && (
                                        <TouchableOpacity onPress={onClose} className="p-2 -ml-2">
                                            <Ionicons name="close" size={24} color={iconColor} />
                                        </TouchableOpacity>
                                    )}
                                    {title && (
                                        <Text className="text-lg font-semibold text-text-primary flex-1 text-center">
                                            {title}
                                        </Text>
                                    )}
                                    {showCloseButton && <View className="w-10" />}
                                </View>
                            )}

                            {/* Content */}
                            <ScrollView
                                className="px-6 pb-6"
                                showsVerticalScrollIndicator={false}
                            >
                                {children}
                            </ScrollView>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    )
}
