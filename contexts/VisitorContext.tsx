"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/utils/supabase/client'

type VisitorContextType = {
    isVisitor: boolean
    setIsVisitor: (value: boolean) => void
    isLoading: boolean
}

const VisitorContext = createContext<VisitorContextType>({
    isVisitor: true, // Default to visitor mode until we check auth
    setIsVisitor: () => { },
    isLoading: true,
})

export const useVisitor = () => useContext(VisitorContext)

export const VisitorProvider = ({ children }: { children: ReactNode }) => {
    const [isVisitor, setIsVisitor] = useState(true) // Start as visitor
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Check initial auth state
        const checkAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession()
                // Only set isVisitor to false if we have a valid session
                setIsVisitor(!session)
            } catch (error) {
                console.error('Error checking auth:', error)
                setIsVisitor(true) // On error, default to visitor
            } finally {
                setIsLoading(false)
            }
        }

        checkAuth()

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                console.log('[VisitorContext] Auth state changed:', event, !!session)
                // Update visitor status based on session
                setIsVisitor(!session)
                setIsLoading(false)
            }
        )

        return () => {
            subscription.unsubscribe()
        }
    }, [])

    return (
        <VisitorContext.Provider value={{ isVisitor, setIsVisitor, isLoading }}>
            {children}
        </VisitorContext.Provider>
    )
}
