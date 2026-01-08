'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/utils/supabase/client'
import { ThomasMorel } from '@/data/mockData'

// ============ Types ============

export interface UserCountry {
    id: string
    user_id: string
    country_code: string
    country_name: string
    first_visit_year?: number
    last_visit_year?: number
    visit_count: number
    created_at: string
    updated_at: string
}

export interface UserTrip {
    id: string
    user_id: string
    country_code: string
    city_name?: string
    year: number
    month?: number
    photo_url?: string
    description?: string
    created_at: string
}

export interface FriendCountryVisit {
    user_id: string
    username: string
    full_name: string
    avatar_url?: string
    country_code: string
    first_visit_year?: number
    last_visit_year?: number
    trip_photo_url?: string
}

export interface TravelData {
    countries: UserCountry[]
    trips: UserTrip[]
    isLoading: boolean
    isDemo: boolean
    hasAnyData: boolean
    totalCountries: number
    totalTrips: number
    totalDistanceKm: number
    totalCities: number
    // Actions
    addCountry: (countryCode: string, countryName: string, year: number) => Promise<boolean>
    addTrip: (countryCode: string, year: number, city?: string, photoUrl?: string, description?: string) => Promise<boolean>
    deleteCountry: (countryId: string) => Promise<boolean>
    deleteTrip: (tripId: string) => Promise<boolean>
    uploadTripPhoto: (file: File) => Promise<string | null>
    getFriendsCountries: () => Promise<FriendCountryVisit[]>
    getFriendsForCountry: (countryCode: string) => Promise<FriendCountryVisit[]>
    refetch: () => void
}

// ============ Demo Data ============

const DEMO_COUNTRIES: UserCountry[] = ThomasMorel.moduleB.countriesVisited.map((c, index) => ({
    id: `demo_${index}`,
    user_id: 'demo',
    country_code: c.code,
    country_name: c.name,
    first_visit_year: c.firstVisit ? parseInt(c.firstVisit.split('-')[0]) : undefined,
    last_visit_year: c.lastVisit ? parseInt(c.lastVisit.split('-')[0]) : undefined,
    visit_count: c.visitCount,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
}))

const DEMO_TRIPS: UserTrip[] = ThomasMorel.moduleB.trips.map((t, index) => ({
    id: `demo_trip_${index}`,
    user_id: 'demo',
    country_code: t.destination.country,
    city_name: t.destination.city || undefined,
    year: parseInt(t.startDate.split('-')[0]),
    month: parseInt(t.startDate.split('-')[1]),
    photo_url: undefined,
    description: undefined,
    created_at: new Date().toISOString(),
}))

// ============ Country Names Map ============

export const COUNTRY_NAMES: Record<string, string> = {
    AF: 'Afghanistan', AL: 'Albanie', DZ: 'Algérie', AD: 'Andorre', AO: 'Angola',
    AG: 'Antigua-et-Barbuda', AR: 'Argentine', AM: 'Arménie', AU: 'Australie', AT: 'Autriche',
    AZ: 'Azerbaïdjan', BS: 'Bahamas', BH: 'Bahreïn', BD: 'Bangladesh', BB: 'Barbade',
    BY: 'Biélorussie', BE: 'Belgique', BZ: 'Belize', BJ: 'Bénin', BT: 'Bhoutan',
    BO: 'Bolivie', BA: 'Bosnie-Herzégovine', BW: 'Botswana', BR: 'Brésil', BN: 'Brunei',
    BG: 'Bulgarie', BF: 'Burkina Faso', BI: 'Burundi', KH: 'Cambodge', CM: 'Cameroun',
    CA: 'Canada', CV: 'Cap-Vert', CF: 'Centrafrique', TD: 'Tchad', CL: 'Chili',
    CN: 'Chine', CO: 'Colombie', KM: 'Comores', CG: 'Congo', CD: 'RD Congo',
    CR: 'Costa Rica', HR: 'Croatie', CU: 'Cuba', CY: 'Chypre', CZ: 'Tchéquie',
    DK: 'Danemark', DJ: 'Djibouti', DM: 'Dominique', DO: 'Rép. Dominicaine', EC: 'Équateur',
    EG: 'Égypte', SV: 'Salvador', GQ: 'Guinée équatoriale', ER: 'Érythrée', EE: 'Estonie',
    SZ: 'Eswatini', ET: 'Éthiopie', FJ: 'Fidji', FI: 'Finlande', FR: 'France',
    GA: 'Gabon', GM: 'Gambie', GE: 'Géorgie', DE: 'Allemagne', GH: 'Ghana',
    GR: 'Grèce', GD: 'Grenade', GT: 'Guatemala', GN: 'Guinée', GW: 'Guinée-Bissau',
    GY: 'Guyana', HT: 'Haïti', HN: 'Honduras', HU: 'Hongrie', IS: 'Islande',
    IN: 'Inde', ID: 'Indonésie', IR: 'Iran', IQ: 'Irak', IE: 'Irlande',
    IL: 'Israël', IT: 'Italie', JM: 'Jamaïque', JP: 'Japon', JO: 'Jordanie',
    KZ: 'Kazakhstan', KE: 'Kenya', KI: 'Kiribati', KP: 'Corée du Nord', KR: 'Corée du Sud',
    KW: 'Koweït', KG: 'Kirghizistan', LA: 'Laos', LV: 'Lettonie', LB: 'Liban',
    LS: 'Lesotho', LR: 'Liberia', LY: 'Libye', LI: 'Liechtenstein', LT: 'Lituanie',
    LU: 'Luxembourg', MG: 'Madagascar', MW: 'Malawi', MY: 'Malaisie', MV: 'Maldives',
    ML: 'Mali', MT: 'Malte', MH: 'Îles Marshall', MR: 'Mauritanie', MU: 'Maurice',
    MX: 'Mexique', FM: 'Micronésie', MD: 'Moldavie', MC: 'Monaco', MN: 'Mongolie',
    ME: 'Monténégro', MA: 'Maroc', MZ: 'Mozambique', MM: 'Myanmar', NA: 'Namibie',
    NR: 'Nauru', NP: 'Népal', NL: 'Pays-Bas', NZ: 'Nouvelle-Zélande', NI: 'Nicaragua',
    NE: 'Niger', NG: 'Nigeria', MK: 'Macédoine du Nord', NO: 'Norvège', OM: 'Oman',
    PK: 'Pakistan', PW: 'Palaos', PS: 'Palestine', PA: 'Panama', PG: 'Papouasie-NG',
    PY: 'Paraguay', PE: 'Pérou', PH: 'Philippines', PL: 'Pologne', PT: 'Portugal',
    QA: 'Qatar', RO: 'Roumanie', RU: 'Russie', RW: 'Rwanda', KN: 'Saint-Kitts',
    LC: 'Sainte-Lucie', VC: 'Saint-Vincent', WS: 'Samoa', SM: 'Saint-Marin', ST: 'Sao Tomé',
    SA: 'Arabie Saoudite', SN: 'Sénégal', RS: 'Serbie', SC: 'Seychelles', SL: 'Sierra Leone',
    SG: 'Singapour', SK: 'Slovaquie', SI: 'Slovénie', SB: 'Îles Salomon', SO: 'Somalie',
    ZA: 'Afrique du Sud', SS: 'Soudan du Sud', ES: 'Espagne', LK: 'Sri Lanka', SD: 'Soudan',
    SR: 'Suriname', SE: 'Suède', CH: 'Suisse', SY: 'Syrie', TW: 'Taïwan',
    TJ: 'Tadjikistan', TZ: 'Tanzanie', TH: 'Thaïlande', TL: 'Timor-Leste', TG: 'Togo',
    TO: 'Tonga', TT: 'Trinité-et-Tobago', TN: 'Tunisie', TR: 'Turquie', TM: 'Turkménistan',
    TV: 'Tuvalu', UG: 'Ouganda', UA: 'Ukraine', AE: 'Émirats arabes unis', GB: 'Royaume-Uni',
    US: 'États-Unis', UY: 'Uruguay', UZ: 'Ouzbékistan', VU: 'Vanuatu', VA: 'Vatican',
    VE: 'Venezuela', VN: 'Vietnam', YE: 'Yémen', ZM: 'Zambie', ZW: 'Zimbabwe',
}

// ============ Hook ============

export function useTravelData(): TravelData {
    const [countries, setCountries] = useState<UserCountry[]>([])
    const [trips, setTrips] = useState<UserTrip[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isDemo, setIsDemo] = useState(false)

    // Fetch user data
    const fetchData = useCallback(async () => {
        setIsLoading(true)
        console.log('[useTravelData] fetchData called')
        try {
            const { data: { user } } = await supabase.auth.getUser()
            console.log('[useTravelData] Current user:', user?.id)

            if (!user) {
                // Demo mode
                console.log('[useTravelData] No user, using demo data')
                setCountries(DEMO_COUNTRIES)
                setTrips(DEMO_TRIPS)
                setIsDemo(true)
                setIsLoading(false)
                return
            }

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
                    .limit(100)
            ])

            console.log('[useTravelData] Countries response:', countriesRes)
            console.log('[useTravelData] Trips response:', tripsRes)

            if (countriesRes.error) {
                console.error('[useTravelData] Countries error:', countriesRes.error)
            }
            if (tripsRes.error) {
                console.error('[useTravelData] Trips error:', tripsRes.error)
            }

            if (countriesRes.data) {
                console.log('[useTravelData] Setting', countriesRes.data.length, 'countries')
                setCountries(countriesRes.data)
            }
            if (tripsRes.data) {
                console.log('[useTravelData] Setting', tripsRes.data.length, 'trips')
                setTrips(tripsRes.data)
            }

        } catch (err) {
            console.error('Error fetching travel data:', err)
            setCountries(DEMO_COUNTRIES)
            setTrips(DEMO_TRIPS)
            setIsDemo(true)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    // Add a country
    const addCountry = async (countryCode: string, countryName: string, year: number): Promise<boolean> => {
        if (isDemo) return false

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return false

            // Check if country already exists
            const existing = countries.find(c => c.country_code === countryCode)

            if (existing) {
                // Update existing
                const { error } = await supabase
                    .from('user_countries')
                    .update({
                        visit_count: existing.visit_count + 1,
                        last_visit_year: Math.max(existing.last_visit_year || 0, year),
                        first_visit_year: Math.min(existing.first_visit_year || 9999, year),
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', existing.id)

                if (error) throw error
            } else {
                // Insert new
                const { error } = await supabase
                    .from('user_countries')
                    .insert({
                        user_id: user.id,
                        country_code: countryCode,
                        country_name: countryName,
                        first_visit_year: year,
                        last_visit_year: year,
                        visit_count: 1
                    })

                if (error) throw error
            }

            await fetchData()
            return true
        } catch (err) {
            console.error('Error adding country:', err)
            return false
        }
    }

    // Add a trip
    const addTrip = async (
        countryCode: string,
        year: number,
        city?: string,
        photoUrl?: string,
        description?: string
    ): Promise<boolean> => {
        if (isDemo) return false

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return false

            const { error } = await supabase
                .from('user_trips')
                .insert({
                    user_id: user.id,
                    country_code: countryCode,
                    city_name: city,
                    year,
                    photo_url: photoUrl,
                    description
                })

            if (error) throw error

            // Also add/update the country
            const countryName = COUNTRY_NAMES[countryCode] || countryCode
            await addCountry(countryCode, countryName, year)

            await fetchData()
            return true
        } catch (err) {
            console.error('Error adding trip:', err)
            return false
        }
    }

    // Delete a country and all its associated trips
    const deleteCountry = async (countryId: string): Promise<boolean> => {
        if (isDemo) return false

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return false

            // First, get the country to know its country_code
            const { data: countryToDelete } = await supabase
                .from('user_countries')
                .select('country_code')
                .eq('id', countryId)
                .single()

            if (!countryToDelete) {
                console.error('Country not found')
                return false
            }

            const countryCode = countryToDelete.country_code

            // Delete all trips for this country first
            const { error: tripsError } = await supabase
                .from('user_trips')
                .delete()
                .eq('user_id', user.id)
                .eq('country_code', countryCode)

            if (tripsError) {
                console.error('Error deleting trips:', tripsError)
            }

            // Then delete the country
            const { error } = await supabase
                .from('user_countries')
                .delete()
                .eq('id', countryId)

            if (error) throw error
            await fetchData()
            return true
        } catch (err) {
            console.error('Error deleting country:', err)
            return false
        }
    }

    // Delete a trip
    const deleteTrip = async (tripId: string): Promise<boolean> => {
        if (isDemo) return false

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return false

            // First, get the trip to know its country_code
            const { data: tripToDelete } = await supabase
                .from('user_trips')
                .select('country_code')
                .eq('id', tripId)
                .single()

            if (!tripToDelete) {
                console.error('Trip not found')
                return false
            }

            const countryCode = tripToDelete.country_code

            // Delete the trip
            const { error } = await supabase
                .from('user_trips')
                .delete()
                .eq('id', tripId)

            if (error) throw error

            // Check if this was the last trip to this country
            const { data: remainingTrips, error: countError } = await supabase
                .from('user_trips')
                .select('id')
                .eq('user_id', user.id)
                .eq('country_code', countryCode)

            if (countError) {
                console.error('Error checking remaining trips:', countError)
            }

            // If no more trips to this country, delete the country too
            if (!remainingTrips || remainingTrips.length === 0) {
                const { error: deleteCountryError } = await supabase
                    .from('user_countries')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('country_code', countryCode)

                if (deleteCountryError) {
                    console.error('Error deleting country:', deleteCountryError)
                }
            } else {
                // Update the country's visit_count
                const { error: updateError } = await supabase
                    .from('user_countries')
                    .update({
                        visit_count: remainingTrips.length,
                        updated_at: new Date().toISOString()
                    })
                    .eq('user_id', user.id)
                    .eq('country_code', countryCode)

                if (updateError) {
                    console.error('Error updating country visit count:', updateError)
                }
            }

            await fetchData()
            return true
        } catch (err) {
            console.error('Error deleting trip:', err)
            return false
        }
    }

    // Upload trip photo
    const uploadTripPhoto = async (file: File): Promise<string | null> => {
        if (isDemo) return null

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return null

            const fileExt = file.name.split('.').pop()
            const fileName = `${user.id}/${Date.now()}.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from('trip-photos')
                .upload(fileName, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('trip-photos')
                .getPublicUrl(fileName)

            return publicUrl
        } catch (err) {
            console.error('Error uploading photo:', err)
            return null
        }
    }

    // Get all friends' countries
    const getFriendsCountries = async (): Promise<FriendCountryVisit[]> => {
        if (isDemo) return []

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return []

            // Get friend IDs
            const { data: friendships } = await supabase
                .from('friendships')
                .select('user_id, friend_id')
                .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)

            if (!friendships || friendships.length === 0) return []

            const friendIds = friendships.map(f =>
                f.user_id === user.id ? f.friend_id : f.user_id
            )

            // Get friends' countries with profile info
            const { data: friendCountries } = await supabase
                .from('user_countries')
                .select(`
          user_id,
          country_code,
          first_visit_year,
          last_visit_year
        `)
                .in('user_id', friendIds)

            if (!friendCountries) return []

            // Get profiles for these friends
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, username, full_name, avatar_url')
                .in('id', friendIds)

            const profileMap = new Map(profiles?.map(p => [p.id, p]) || [])

            // Get latest trip photos for each friend-country combo
            const { data: friendTrips } = await supabase
                .from('user_trips')
                .select('user_id, country_code, photo_url, year')
                .in('user_id', friendIds)
                .order('year', { ascending: false })

            const tripPhotoMap = new Map<string, string>()
            friendTrips?.forEach(t => {
                const key = `${t.user_id}-${t.country_code}`
                if (!tripPhotoMap.has(key) && t.photo_url) {
                    tripPhotoMap.set(key, t.photo_url)
                }
            })

            return friendCountries.map(fc => {
                const profile = profileMap.get(fc.user_id)
                return {
                    user_id: fc.user_id,
                    username: profile?.username || 'Unknown',
                    full_name: profile?.full_name || 'Unknown',
                    avatar_url: profile?.avatar_url,
                    country_code: fc.country_code,
                    first_visit_year: fc.first_visit_year,
                    last_visit_year: fc.last_visit_year,
                    trip_photo_url: tripPhotoMap.get(`${fc.user_id}-${fc.country_code}`)
                }
            })
        } catch (err) {
            console.error('Error fetching friends countries:', err)
            return []
        }
    }

    // Get friends who visited a specific country
    const getFriendsForCountry = async (countryCode: string): Promise<FriendCountryVisit[]> => {
        const allFriends = await getFriendsCountries()
        return allFriends.filter(f => f.country_code === countryCode)
    }

    // Computed values
    const totalCountries = countries.length
    const totalTrips = trips.length
    const totalDistanceKm = trips.length * 2000 // Estimation approximative
    const totalCities = new Set(trips.filter(t => t.city_name).map(t => t.city_name)).size
    const hasAnyData = countries.length > 0 || trips.length > 0

    return {
        countries,
        trips,
        isLoading,
        isDemo,
        hasAnyData,
        totalCountries,
        totalTrips,
        totalDistanceKm,
        totalCities,
        addCountry,
        addTrip,
        deleteCountry,
        deleteTrip,
        uploadTripPhoto,
        getFriendsCountries,
        getFriendsForCountry,
        refetch: fetchData
    }
}
