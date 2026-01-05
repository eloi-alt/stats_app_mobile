'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface PrivacyContextType {
    blurSensitiveData: boolean
    setBlurSensitiveData: (value: boolean) => void
}

const PrivacyContext = createContext<PrivacyContextType>({
    blurSensitiveData: false,
    setBlurSensitiveData: () => { },
})

const STORAGE_KEY = 'statsapp_blur_sensitive'

export function PrivacyProvider({ children }: { children: ReactNode }) {
    const [blurSensitiveData, setBlurSensitiveDataState] = useState(false)
    const [mounted, setMounted] = useState(false)

    // Load from localStorage on mount
    useEffect(() => {
        setMounted(true)
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved !== null) {
            setBlurSensitiveDataState(saved === 'true')
        }
    }, [])

    // Persist to localStorage
    const setBlurSensitiveData = (value: boolean) => {
        setBlurSensitiveDataState(value)
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, String(value))
        }
    }

    // Prevent hydration mismatch
    if (!mounted) {
        return <>{children}</>
    }

    return (
        <PrivacyContext.Provider value={{ blurSensitiveData, setBlurSensitiveData }}>
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
