'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/utils/supabase/client'

export interface VisitedCountry {
    id: string
    country_code: string
    country_name: string
    first_visit?: string
    last_visit?: string
    total_days_spent: number
    visit_count: number
    is_home_country: boolean
}

export interface Trip {
    id: string
    destination_country: string
    destination_city?: string
    start_date: string
    end_date?: string
    duration?: number
    purpose: 'leisure' | 'work' | 'family' | 'education' | 'medical' | 'other'
    transport?: string
    distance_km?: number
}

export interface TravelData {
    visitedCountries: VisitedCountry[]
    trips: Trip[]
    isLoading: boolean
    hasAnyData: boolean
    totalCountriesVisited: number
    totalTrips: number
    totalDistanceKm: number
    refetch: () => void
}

export function useTravelData(): TravelData {
    const [visitedCountries, setVisitedCountries] = useState<VisitedCountry[]>([])
    const [trips, setTrips] = useState<Trip[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchData = useCallback(async () => {
        setIsLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                setIsLoading(false)
                return
            }

            const [countriesRes, tripsRes] = await Promise.all([
                supabase.from('visited_countries')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('last_visit', { ascending: false }),
                supabase.from('trips')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('start_date', { ascending: false })
                    .limit(50)
            ])

            if (countriesRes.data) setVisitedCountries(countriesRes.data)
            if (tripsRes.data) setTrips(tripsRes.data)
        } catch (err) {
            console.error('Error fetching travel data:', err)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const totalCountriesVisited = visitedCountries.length
    const totalTrips = trips.length
    const totalDistanceKm = trips.reduce((sum, t) => sum + (t.distance_km || 0), 0)
    const hasAnyData = visitedCountries.length > 0 || trips.length > 0

    return {
        visitedCountries,
        trips,
        isLoading,
        hasAnyData,
        totalCountriesVisited,
        totalTrips,
        totalDistanceKm,
        refetch: fetchData
    }
}
