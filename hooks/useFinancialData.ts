'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/utils/supabase/client'

export interface Asset {
    id: string
    asset_type: 'real_estate' | 'vehicle' | 'stocks' | 'bonds' | 'crypto' | 'etf' | 'savings' | 'retirement' | 'cash' | 'other'
    name: string
    institution?: string
    current_value: number
    purchase_value?: number
    purchase_date?: string
    currency: string
    is_liquid: boolean
}

export interface Liability {
    id: string
    liability_type: 'mortgage' | 'car_loan' | 'student_loan' | 'personal_loan' | 'credit_card' | 'other'
    name: string
    original_amount: number
    remaining_amount: number
    interest_rate?: number
    monthly_payment?: number
    end_date?: string
    currency: string
}

export interface FinancialData {
    assets: Asset[]
    liabilities: Liability[]
    isLoading: boolean
    hasAnyData: boolean
    totalAssets: number
    totalLiabilities: number
    netWorth: number
    liquidAssets: number
    refetch: () => void
}

export function useFinancialData(): FinancialData {
    const [assets, setAssets] = useState<Asset[]>([])
    const [liabilities, setLiabilities] = useState<Liability[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchData = useCallback(async () => {
        setIsLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                setIsLoading(false)
                return
            }

            const [assetsRes, liabilitiesRes] = await Promise.all([
                supabase.from('assets')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('current_value', { ascending: false }),
                supabase.from('liabilities')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('remaining_amount', { ascending: false })
            ])

            if (assetsRes.data) setAssets(assetsRes.data)
            if (liabilitiesRes.data) setLiabilities(liabilitiesRes.data)
        } catch (err) {
            console.error('Error fetching financial data:', err)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const totalAssets = assets.reduce((sum, a) => sum + a.current_value, 0)
    const totalLiabilities = liabilities.reduce((sum, l) => sum + l.remaining_amount, 0)
    const netWorth = totalAssets - totalLiabilities
    const liquidAssets = assets.filter(a => a.is_liquid).reduce((sum, a) => sum + a.current_value, 0)
    const hasAnyData = assets.length > 0 || liabilities.length > 0

    return {
        assets,
        liabilities,
        isLoading,
        hasAnyData,
        totalAssets,
        totalLiabilities,
        netWorth,
        liquidAssets,
        refetch: fetchData
    }
}
