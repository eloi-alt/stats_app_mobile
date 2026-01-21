import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { ThomasMorel } from '@/data/mockData'

export interface UserCountry {
    id: string
    user_id: string
    country_code: string
    country_name: string
    first_visit_year?: number
    last_visit_year?: number
    visit_count: number
    created_at: string
}

export interface UserTrip {
    id: string
    user_id: string
    country_code: string
    city_name?: string
    year: number
    month?: number
    description?: string
    created_at: string
}

export interface TravelData {
    countries: UserCountry[]
    trips: UserTrip[]
    isLoading: boolean
    isDemo: boolean
    hasAnyData: boolean
    totalCountries: number
    totalTrips: number
    addTrip: (countryCode: string, year: number, city?: string) => Promise<boolean>
    refetch: () => void
}

// Demo data from mockData
const DEMO_COUNTRIES: UserCountry[] = ThomasMorel.moduleB.countriesVisited.map((c, index) => ({
    id: `demo_${index}`,
    user_id: 'demo',
    country_code: c.code,
    country_name: c.name,
    first_visit_year: c.firstVisit ? parseInt(c.firstVisit.split('-')[0]) : undefined,
    last_visit_year: c.lastVisit ? parseInt(c.lastVisit.split('-')[0]) : undefined,
    visit_count: c.visitCount,
    created_at: new Date().toISOString(),
}))

const DEMO_TRIPS: UserTrip[] = ThomasMorel.moduleB.trips.map((t, index) => ({
    id: `demo_trip_${index}`,
    user_id: 'demo',
    country_code: t.destination.country,
    city_name: t.destination.city,
    year: parseInt(t.startDate.split('-')[0]),
    month: parseInt(t.startDate.split('-')[1]),
    description: t.notes,
    created_at: new Date().toISOString(),
}))

// Country names map (subset)
export const COUNTRY_NAMES: Record<string, string> = {
    US: 'United States', FR: 'France', GB: 'United Kingdom', DE: 'Germany',
    IT: 'Italy', ES: 'Spain', JP: 'Japan', CN: 'China', CA: 'Canada',
    AU: 'Australia', BR: 'Brazil', MX: 'Mexico', IN: 'India', KR: 'South Korea',
    CH: 'Switzerland', NL: 'Netherlands', BE: 'Belgium', AT: 'Austria', SE: 'Sweden',
    NO: 'Norway', DK: 'Denmark', FI: 'Finland', PT: 'Portugal', GR: 'Greece',
    PL: 'Poland', CZ: 'Czech Republic', HU: 'Hungary', RU: 'Russia', ZA: 'South Africa',
    EG: 'Egypt', MA: 'Morocco', TN: 'Tunisia', KE: 'Kenya', NG: 'Nigeria',
    AE: 'UAE', SA: 'Saudi Arabia', IL: 'Israel', TR: 'Turkey', TH: 'Thailand',
    VN: 'Vietnam', SG: 'Singapore', MY: 'Malaysia', ID: 'Indonesia', PH: 'Philippines',
    NZ: 'New Zealand', AR: 'Argentina', CL: 'Chile', CO: 'Colombia', PE: 'Peru',
    VI: 'U.S. Virgin Islands', MC: 'Monaco', BS: 'Bahamas',
}

export function useTravelData(): TravelData {
    const [countries, setCountries] = useState<UserCountry[]>([])
    const [trips, setTrips] = useState<UserTrip[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isDemo, setIsDemo] = useState(true)

    const fetchData = useCallback(async () => {
        setIsLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                // No authenticated user - use demo data
                setCountries(DEMO_COUNTRIES)
                setTrips(DEMO_TRIPS)
                setIsDemo(true)
                setIsLoading(false)
                return
            }

            // Authenticated user - fetch from Supabase
            setIsDemo(false)
            const [countriesRes, tripsRes] = await Promise.all([
                supabase.from('user_countries')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('last_visit_year', { ascending: false }),
                supabase.from('user_trips')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('year', { ascending: false })
                    .limit(50)
            ])

            if (countriesRes.data) setCountries(countriesRes.data)
            if (tripsRes.data) setTrips(tripsRes.data)

        } catch (err) {
            console.error('Error fetching travel data:', err)
            setCountries(DEMO_COUNTRIES)
            setTrips(DEMO_TRIPS)
            setIsDemo(true)
        } finally {
            setIsLoading(false)
        }
    }, [])

    const addTrip = async (countryCode: string, year: number, city?: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return false

            const { error: tripError } = await supabase.from('user_trips').insert({
                user_id: user.id,
                country_code: countryCode,
                city_name: city,
                year: year,
                created_at: new Date().toISOString()
            })

            if (tripError) throw tripError

            // Optionally update user_countries too, but for now we refetch
            await fetchData()
            return true
        } catch (error) {
            console.error('Error adding trip:', error)
            return false
        }
    }

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const totalCountries = countries.length
    const totalTrips = trips.length
    const hasAnyData = totalCountries > 0 || totalTrips > 0

    return {
        countries,
        trips,
        isLoading,
        isDemo,
        hasAnyData,
        totalCountries,
        totalTrips,
        addTrip,
        refetch: fetchData
    }
}
