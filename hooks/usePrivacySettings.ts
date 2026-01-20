'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/utils/supabase/client'

export type PrivacyCategory = 'finance' | 'physio' | 'world' | 'career' | 'social'

export interface PrivacySettings {
    userId: string
    financePublic: boolean
    physioPublic: boolean
    worldPublic: boolean
    careerPublic: boolean
    socialPublic: boolean
}

interface UsePrivacySettingsReturn {
    settings: PrivacySettings | null
    isLoading: boolean
    updateSetting: (category: PrivacyCategory, isPublic: boolean) => Promise<{ success: boolean; error?: string }>
    refetch: () => Promise<void>
}

/**
 * Hook to manage privacy settings for the current user
 */
export function usePrivacySettings(userId?: string): UsePrivacySettingsReturn {
    const [settings, setSettings] = useState<PrivacySettings | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    // Fetch privacy settings from Supabase
    const fetchSettings = useCallback(async () => {
        if (!userId) {
            setSettings(null)
            setIsLoading(false)
            return
        }

        try {
            const { data, error } = await supabase
                .from('privacy_settings')
                .select('*')
                .eq('user_id', userId)
                .single()

            if (error) {
                // If no settings exist, create default ones
                if (error.code === 'PGRST116') {
                    const { data: newData, error: insertError } = await supabase
                        .from('privacy_settings')
                        .insert({
                            user_id: userId,
                            finance_public: false,
                            physio_public: false,
                            world_public: false,
                            career_public: false,
                            social_public: false
                        })
                        .select()
                        .single()

                    if (insertError) {
                        console.error('[PrivacySettings] Error creating default settings:', insertError)
                        return
                    }

                    setSettings({
                        userId: newData.user_id,
                        financePublic: newData.finance_public,
                        physioPublic: newData.physio_public,
                        worldPublic: newData.world_public,
                        careerPublic: newData.career_public,
                        socialPublic: newData.social_public
                    })
                } else {
                    console.error('[PrivacySettings] Error fetching settings:', error)
                }
                return
            }

            setSettings({
                userId: data.user_id,
                financePublic: data.finance_public,
                physioPublic: data.physio_public,
                worldPublic: data.world_public,
                careerPublic: data.career_public,
                socialPublic: data.social_public
            })
        } catch (err) {
            console.error('[PrivacySettings] Unexpected error:', err)
        } finally {
            setIsLoading(false)
        }
    }, [userId])

    // Update a specific privacy setting
    const updateSetting = useCallback(async (
        category: PrivacyCategory,
        isPublic: boolean
    ): Promise<{ success: boolean; error?: string }> => {
        if (!userId) {
            return { success: false, error: 'Not authenticated' }
        }

        const columnName = `${category}_public`

        const { error } = await supabase
            .from('privacy_settings')
            .update({ [columnName]: isPublic, updated_at: new Date().toISOString() })
            .eq('user_id', userId)

        if (error) {
            console.error(`[PrivacySettings] Error updating ${category}:`, error)
            return { success: false, error: 'Erreur lors de la mise à jour' }
        }

        // Update local state
        setSettings(prev => {
            if (!prev) return null
            return {
                ...prev,
                [`${category}Public`]: isPublic
            }
        })

        return { success: true }
    }, [userId])

    // Load settings on mount and when userId changes
    useEffect(() => {
        fetchSettings()
    }, [fetchSettings])

    return {
        settings,
        isLoading,
        updateSetting,
        refetch: fetchSettings
    }
}

/**
 * Hook to fetch privacy settings for another user (e.g., a friend)
 */
export function useFriendPrivacySettings(friendId?: string) {
    const [settings, setSettings] = useState<PrivacySettings | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (!friendId) {
            setSettings(null)
            setIsLoading(false)
            return
        }

        const fetchFriendSettings = async () => {
            setIsLoading(true)
            try {
                const { data, error } = await supabase
                    .from('privacy_settings')
                    .select('*')
                    .eq('user_id', friendId)
                    .single()

                if (error) {
                    console.error('[PrivacySettings] Error fetching friend settings:', error)
                    setSettings(null)
                    return
                }

                setSettings({
                    userId: data.user_id,
                    financePublic: data.finance_public,
                    physioPublic: data.physio_public,
                    worldPublic: data.world_public,
                    careerPublic: data.career_public,
                    socialPublic: data.social_public
                })
            } catch (err) {
                console.error('[PrivacySettings] Unexpected error:', err)
                setSettings(null)
            } finally {
                setIsLoading(false)
            }
        }

        fetchFriendSettings()
    }, [friendId])

    return { settings, isLoading }
}
