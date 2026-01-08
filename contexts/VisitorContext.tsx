"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/utils/supabase/client'

type VisitorContextType = {
    isVisitor: boolean  // Will always be false when authenticated (no visitor mode)
    isLoading: boolean
    isAuthenticated: boolean
}

const VisitorContext = createContext<VisitorContextType>({
    isVisitor: false, // Default to not visitor - auth required
    isLoading: true,
    isAuthenticated: false,
})

export const useVisitor = () => useContext(VisitorContext)

export const VisitorProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Check initial auth state
        const checkAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession()
                setIsAuthenticated(!!session)
            } catch (error) {
                console.error('Error checking auth:', error)
                setIsAuthenticated(false)
            } finally {
                setIsLoading(false)
            }
        }

        checkAuth()

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                console.log('[VisitorContext] Auth state changed:', event, !!session)
                setIsAuthenticated(!!session)
                setIsLoading(false)
            }
        )

        return () => {
            subscription.unsubscribe()
        }
    }, [])

    // isVisitor is now always false - visitor mode removed
    // Components that check isVisitor will always get false
    const isVisitor = false

    return (
        <VisitorContext.Provider value={{ isVisitor, isLoading, isAuthenticated }}>
            {children}
        </VisitorContext.Provider>
    )
}
