'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { usePrivacySettings, PrivacySettings, PrivacyCategory } from '@/hooks/usePrivacySettings'
import { supabase } from '@/utils/supabase/client'

interface PrivacyContextType {
    // Legacy blur toggle (kept for backward compatibility)
    blurSensitiveData: boolean
    setBlurSensitiveData: (value: boolean) => void

    // New granular privacy settings
    privacySettings: PrivacySettings | null
    isLoadingSettings: boolean
    updatePrivacySetting: (category: PrivacyCategory, isPublic: boolean) => Promise<{ success: boolean; error?: string }>
    isDataPublic: (category: PrivacyCategory) => boolean
}

const PrivacyContext = createContext<PrivacyContextType>({
    blurSensitiveData: false,
    setBlurSensitiveData: () => { },
    privacySettings: null,
    isLoadingSettings: false,
    updatePrivacySetting: async () => ({ success: false }),
    isDataPublic: () => false,
})

const STORAGE_KEY = 'statsapp_blur_sensitive'

export function PrivacyProvider({ children }: { children: ReactNode }) {
    const [blurSensitiveData, setBlurSensitiveDataState] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [currentUserId, setCurrentUserId] = useState<string | undefined>()

    // Get current user on mount
    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setCurrentUserId(user?.id)
        }
        getUser()

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setCurrentUserId(session?.user?.id)
        })

        return () => subscription.unsubscribe()
    }, [])

    // Use the privacy settings hook
    const {
        settings: privacySettings,
        isLoading: isLoadingSettings,
        updateSetting: updatePrivacySetting,
    } = usePrivacySettings(currentUserId)

    // Load blur setting from localStorage on mount
    useEffect(() => {
        setMounted(true)
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved !== null) {
            setBlurSensitiveDataState(saved === 'true')
        }
    }, [])

    // Persist blur setting to localStorage
    const setBlurSensitiveData = (value: boolean) => {
        setBlurSensitiveDataState(value)
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, String(value))
        }
    }

    // Helper to check if a category is public
    const isDataPublic = (category: PrivacyCategory): boolean => {
        if (!privacySettings) return false

        const categoryMap: Record<PrivacyCategory, keyof PrivacySettings> = {
            finance: 'financePublic',
            physio: 'physioPublic',
            world: 'worldPublic',
            career: 'careerPublic',
            social: 'socialPublic',
        }

        const key = categoryMap[category]
        return privacySettings[key] as boolean
    }

    // Prevent hydration mismatch
    if (!mounted) {
        return <>{children}</>
    }

    return (
        <PrivacyContext.Provider
            value={{
                blurSensitiveData,
                setBlurSensitiveData,
                privacySettings,
                isLoadingSettings,
                updatePrivacySetting,
                isDataPublic,
            }}
        >
            {children}
        </PrivacyContext.Provider>
    )
}

export function usePrivacy() {
    const context = useContext(PrivacyContext)
    if (!context) {
        throw new Error('usePrivacy must be used within a PrivacyProvider')
    }
    return context
}

export default PrivacyContext
