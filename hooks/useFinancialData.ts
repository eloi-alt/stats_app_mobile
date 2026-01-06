'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/utils/supabase/client'
import { ThomasMorel } from '@/data/mockData'

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
    isDemo: boolean
}

// Demo assets from mockData
const DEMO_ASSETS: Asset[] = [
    // Real Estate
    ...ThomasMorel.moduleC.patrimoine.realEstate.map((r, i) => ({
        id: `demo_re_${i}`,
        asset_type: 'real_estate' as const,
        name: r.location || 'Property',
        current_value: r.currentValue,
        purchase_value: r.purchasePrice,
        purchase_date: r.purchaseDate,
        currency: 'EUR',
        is_liquid: false
    })),
    // Vehicles
    ...ThomasMorel.moduleC.patrimoine.vehicles.map((v, i) => ({
        id: `demo_veh_${i}`,
        asset_type: 'vehicle' as const,
        name: `${v.brand} ${v.model}`,
        current_value: v.currentValue,
        purchase_value: v.purchasePrice,
        currency: 'EUR',
        is_liquid: false
    })),
    // Financial Assets
    ...ThomasMorel.moduleC.patrimoine.financialAssets.map((f, i) => ({
        id: `demo_fin_${i}`,
        asset_type: f.type as Asset['asset_type'],
        name: f.name || f.type,
        institution: f.institution,
        current_value: f.currentValue,
        currency: 'EUR',
        is_liquid: ['cash', 'savings', 'stocks', 'crypto'].includes(f.type)
    }))
]

const DEMO_LIABILITIES: Liability[] = ThomasMorel.moduleC.patrimoine.liabilities?.map((l, i) => ({
    id: `demo_lia_${i}`,
    liability_type: l.type as Liability['liability_type'],
    name: l.name || l.type,
    original_amount: l.originalAmount || 0,
    remaining_amount: l.remainingAmount,
    interest_rate: l.interestRate,
    monthly_payment: l.monthlyPayment,
    end_date: l.endDate,
    currency: 'EUR'
})) || []

export function useFinancialData(): FinancialData {
    const [assets, setAssets] = useState<Asset[]>([])
    const [liabilities, setLiabilities] = useState<Liability[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isDemo, setIsDemo] = useState(false)

    const fetchData = useCallback(async () => {
        setIsLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                // No authenticated user - use demo data
                setAssets(DEMO_ASSETS)
                setLiabilities(DEMO_LIABILITIES)
                setIsDemo(true)
                setIsLoading(false)
                return
            }

            // Authenticated user - fetch from Supabase
            setIsDemo(false)
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
            // On error, fall back to demo data
            setAssets(DEMO_ASSETS)
            setLiabilities(DEMO_LIABILITIES)
            setIsDemo(true)
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
        refetch: fetchData,
        isDemo
    }
}
