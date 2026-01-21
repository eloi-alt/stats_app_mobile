import React, { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useTheme } from '@/contexts/ThemeContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { supabase } from '@/lib/supabase'
import BaseModal from '../UI/BaseModal'
import { Ionicons } from '@expo/vector-icons'

interface ProfileEditModalProps {
    visible: boolean
    onClose: () => void
    userId: string
    currentUsername?: string
    onSave: (newUsername: string) => void
}

export default function ProfileEditModal({
    visible,
    onClose,
    userId,
    currentUsername,
    onSave
}: ProfileEditModalProps) {
    const { t } = useLanguage()
    const { isDark } = useTheme()
    const [username, setUsername] = useState(currentUsername || '')
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
    const [checkingUsername, setCheckingUsername] = useState(false)

    const textColor = isDark ? '#FFFFFF' : '#1C1C1E'
    const inputBg = isDark ? '#2C2C2E' : '#F2F2F7'
    const borderColor = isDark ? '#38383A' : '#E5E5EA'

    // Update when currentUsername changes
    useEffect(() => {
        if (visible) {
            setUsername(currentUsername || '')
            setError(null)
            setUsernameAvailable(null)
        }
    }, [visible, currentUsername])

    // Check username availability
    const checkUsername = async (usernameToCheck: string) => {
        if (!usernameToCheck || usernameToCheck.length < 3) {
            setUsernameAvailable(null)
            return
        }
        if (usernameToCheck === currentUsername) {
            setUsernameAvailable(true)
            return
        }

        setCheckingUsername(true)
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id')
                .eq('username', usernameToCheck)
                .neq('id', userId)
                .limit(1)

            if (error) throw error
            setUsernameAvailable(data.length === 0)
        } catch (err) {
            console.error('[ProfileEditModal] Error checking username:', err)
            setUsernameAvailable(null)
        } finally {
            setCheckingUsername(false)
        }
    }

    // Debounced username check
    useEffect(() => {
        const timer = setTimeout(() => {
            if (username && username !== currentUsername) {
                checkUsername(username)
            } else if (username === currentUsername) {
                setUsernameAvailable(true)
            }
        }, 500)
        return () => clearTimeout(timer)
    }, [username])

    const handleSave = async () => {
        if (!usernameAvailable && username !== currentUsername) {
            setError(t('usernameUnavailable') || 'Username unavailable')
            return
        }

        setIsSaving(true)
        setError(null)

        try {
            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    username: username,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId)

            if (updateError) throw updateError

            console.log('[ProfileEditModal] Username saved:', username)
            onSave(username)
            onClose()
        } catch (err: any) {
            console.error('[ProfileEditModal] Save error:', err)
            setError(err?.message || 'Error saving profile')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <BaseModal
            visible={visible}
            onClose={onClose}
            title={t('editProfile')}
        >
            <View className="mb-6">
                <Text className="text-xs font-medium text-text-tertiary mb-2 uppercase">
                    Username
                </Text>

                <View className="relative">
                    <View
                        className="flex-row items-center rounded-xl overflow-hidden border"
                        style={{
                            backgroundColor: inputBg,
                            borderColor: usernameAvailable === false ? '#FF3B30' :
                                usernameAvailable === true ? '#34C759' : borderColor
                        }}
                    >
                        <Text className="pl-4 text-text-secondary">@</Text>
                        <TextInput
                            value={username}
                            onChangeText={(text) => {
                                setUsername(text.toLowerCase().replace(/[^a-z0-9._]/g, ''))
                                setError(null)
                            }}
                            className="flex-1 p-4 text-base font-medium"
                            style={{ color: textColor }}
                            autoCapitalize="none"
                            autoCorrect={false}
                            placeholder="username"
                            placeholderTextColor="#8E8E93"
                        />
                        <View className="pr-4">
                            {checkingUsername ? (
                                <ActivityIndicator size="small" color="#8E8E93" />
                            ) : usernameAvailable !== null ? (
                                <Ionicons
                                    name={usernameAvailable ? "checkmark-circle" : "close-circle"}
                                    size={20}
                                    color={usernameAvailable ? "#34C759" : "#FF3B30"}
                                />
                            ) : null}
                        </View>
                    </View>
                </View>

                {usernameAvailable === false && (
                    <Text className="text-xs text-accent-rose mt-1">
                        {t('usernameUnavailable') || 'Username unavailable'}
                    </Text>
                )}
                <Text className="text-xs text-text-tertiary mt-2">
                    Lowercase letters, numbers, dots and underscores only.
                </Text>
            </View>

            {error && (
                <View className="bg-accent-rose/10 p-3 rounded-xl mb-4">
                    <Text className="text-accent-rose text-center text-sm">{error}</Text>
                </View>
            )}

            <View className="flex-row gap-3">
                <TouchableOpacity
                    onPress={onClose}
                    className="flex-1 py-4 rounded-xl bg-bg-secondary items-center"
                >
                    <Text className="text-text-secondary font-semibold">{t('cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={handleSave}
                    disabled={isSaving || usernameAvailable === false}
                    className="flex-1 py-4 rounded-xl bg-accent-blue items-center"
                    style={{ opacity: (isSaving || usernameAvailable === false) ? 0.5 : 1 }}
                >
                    {isSaving ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-semibold">{t('save')}</Text>
                    )}
                </TouchableOpacity>
            </View>
        </BaseModal>
    )
}
