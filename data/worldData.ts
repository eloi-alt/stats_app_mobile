
export interface TripData {
    year: number
    countries: string[] // ISO 3166-1 alpha-3 codes
    cities?: { name: string; lat: number; lng: number }[]
}

export interface FriendTravelProfile {
    id: string
    name: string
    trips: TripData[]
}

// ISO Alpha-3 codes mapping
export const COUNTRY_CODES: Record<string, string> = {
    // Europe
    'France': 'FRA',
    'Albania': 'ALB',
    'Italy': 'ITA',
    'Switzerland': 'CHE',
    'Spain': 'ESP',
    'Belgium': 'BEL',
    'Russia': 'RUS',
    'United Kingdom': 'GBR',
    'Ireland': 'IRL',
    'Germany': 'DEU',
    'Portugal': 'PRT',
    'Netherlands': 'NLD',
    'Iceland': 'ISL',
    'Greece': 'GRC',
    'Croatia': 'HRV',

    // North America
    'USA': 'USA',
    'Canada': 'CAN',
    'Mexico': 'MEX',
    'Costa Rica': 'CRI',

    // South America
    'Brazil': 'BRA',
    'Argentina': 'ARG',
    'Peru': 'PER',
    'Colombia': 'COL',

    // Asia
    'Japan': 'JPN',
    'India': 'IND',
    'Indonesia': 'IDN',
    'Thailand': 'THA',
    'Vietnam': 'VNM',
    'China': 'CHN',
    'UAE': 'ARE',

    // Africa
    'Togo': 'TGO',
    'Egypt': 'EGY',
    'South Africa': 'ZAF',
    'Morocco': 'MAR',

    // Oceania
    'Australia': 'AUS',
    'New Zealand': 'NZL',
}

// Eloi's Trip History
export const USER_TRIPS: TripData[] = [
    {
        year: 2026,
        countries: ['FRA']
    },
    {
        year: 2025,
        countries: ['CAN', 'USA', 'MEX', 'FRA', 'ALB', 'ITA', 'CHE'],
        cities: [
            { name: 'Montréal', lat: 45.5017, lng: -73.5673 },
            { name: 'Matane', lat: 48.8500, lng: -67.5333 },
            { name: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
            { name: 'San Francisco', lat: 37.7749, lng: -122.4194 },
            { name: 'Las Vegas', lat: 36.1699, lng: -115.1398 },
            { name: 'Cancun', lat: 21.1619, lng: -86.8515 },
            { name: 'Tulum', lat: 20.2114, lng: -87.4654 },
            { name: 'Paris', lat: 48.8566, lng: 2.3522 },
            { name: 'Lyon', lat: 45.7640, lng: 4.8357 },
            { name: 'Marseille', lat: 43.2965, lng: 5.3698 },
            { name: 'Tirana', lat: 41.3275, lng: 19.8187 },
            { name: 'Venise', lat: 45.4408, lng: 12.3155 },
            { name: 'Genève', lat: 46.2044, lng: 6.1432 },
        ]
    },
    {
        year: 2024,
        countries: ['CAN', 'USA', 'CHE', 'FRA'],
        cities: [
            { name: 'New York', lat: 40.7128, lng: -74.0060 },
        ]
    },
    {
        year: 2023,
        countries: ['CAN', 'USA', 'CHE', 'FRA'],
    },
    {
        year: 2022,
        countries: ['ESP', 'CHE', 'FRA', 'TGO', 'BEL'],
        cities: [
            { name: 'Barcelone', lat: 41.3851, lng: 2.1734 },
            { name: 'Lomé', lat: 6.1375, lng: 1.2125 },
            { name: 'Kara', lat: 9.5511, lng: 1.1861 },
            { name: 'Liège', lat: 50.6326, lng: 5.5797 },
        ]
    }
]

// Friends' Data (Rank 1 - All 10 Contacts)
export const FRIENDS_DATA: FriendTravelProfile[] = [
    {
        id: 'contact_sophie',
        name: 'Sophie',
        trips: [
            { year: 2025, countries: ['JPN', 'AUS', 'NZL'] },
            { year: 2024, countries: ['IDN', 'THA'] },
            { year: 2023, countries: ['VNM', 'KHM'] }
        ]
    },
    {
        id: 'contact_lucas',
        name: 'Lucas',
        trips: [
            { year: 2025, countries: ['USA', 'PRT'] },
            { year: 2024, countries: ['IDN', 'AUS'] },
            { year: 2023, countries: ['ZAF', 'NAM'] }
        ]
    },
    {
        id: 'contact_emma',
        name: 'Emma',
        trips: [
            { year: 2025, countries: ['ITA', 'GRC'] },
            { year: 2024, countries: ['GBR', 'IRL', 'DEU'] },
            { year: 2023, countries: ['DNK', 'SWE'] }
        ]
    },
    {
        id: 'contact_thomas',
        name: 'Thomas',
        trips: [
            { year: 2025, countries: ['USA', 'CHN', 'ARE'] },
            { year: 2024, countries: ['SGP', 'HKG'] },
            { year: 2023, countries: ['GBR', 'CHE'] }
        ]
    },
    {
        id: 'contact_lea',
        name: 'Lea',
        trips: [
            { year: 2025, countries: ['IND', 'NPL'] },
            { year: 2024, countries: ['CRI', 'PAN'] },
            { year: 2023, countries: ['IDN'] }
        ]
    },
    {
        id: 'contact_hugo',
        name: 'Hugo',
        trips: [
            { year: 2025, countries: ['ISL', 'NOR'] },
            { year: 2024, countries: ['PER', 'BOL'] },
            { year: 2023, countries: ['ZAF', 'BWA'] }
        ]
    },
    {
        id: 'contact_camille',
        name: 'Camille',
        trips: [
            { year: 2025, countries: ['CHE', 'CAN'] },
            { year: 2024, countries: ['JPN', 'KOR'] },
            { year: 2023, countries: ['USA'] }
        ]
    },
    {
        id: 'contact_antoine',
        name: 'Antoine',
        trips: [
            { year: 2025, countries: ['BRA', 'ARG'] },
            { year: 2024, countries: ['ESP', 'PRT'] },
            { year: 2023, countries: ['GBR', 'FRA'] }
        ]
    },
    {
        id: 'contact_marie',
        name: 'Marie',
        trips: [
            { year: 2025, countries: ['ITA', 'FRA'] },
            { year: 2024, countries: ['MEX', 'PER'] },
            { year: 2023, countries: ['JPN'] }
        ]
    },
    {
        id: 'contact_pierre',
        name: 'Pierre',
        trips: [
            { year: 2025, countries: ['USA', 'CAN'] },
            { year: 2024, countries: ['NLD', 'DEU'] },
            { year: 2022, countries: ['GBR', 'BEL'] }
        ]
    }
]

// Separate exports for backwards compatibility if needed, though we should migrate component to use FRIENDS_DATA
export const FRIENDS_TRIPS: TripData[] = FRIENDS_DATA.flatMap(f => f.trips)
