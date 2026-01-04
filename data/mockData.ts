// ============================================================================
// STATS - Mock Data
// Eloi - Profil Fictif Complet
// ============================================================================

import type {
  UserProfile,
  TransportType,
  AchievementCategory,
  AchievementRarity,
} from '../types/UserProfile';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const generateId = () => Math.random().toString(36).substring(2, 15);

// ============================================================================
// ELOI - USER PROFILE
// ============================================================================

export const ThomasMorel: UserProfile = {
  // --------------------------------------------------------------------------
  // IDENTITY
  // --------------------------------------------------------------------------
  identity: {
    id: 'usr_eloi_001',
    firstName: 'Eloi',
    lastName: '',
    displayName: 'Eloi',
    email: 'eloi@email.com',
    avatar: '/eloi.png',
    dateOfBirth: '1995-06-20',
    nationality: 'FR',
    bio: 'Développeur',
    joinedDate: '2024-01-15',
    lastActive: '2025-12-30T10:30:00Z',
    isVerified: true,
    pinnedModule: 'A', // Il est fier de sa santé
  },

  // --------------------------------------------------------------------------
  // SETTINGS
  // --------------------------------------------------------------------------
  settings: {
    theme: 'dark',
    language: 'fr',
    currency: 'EUR',
    units: 'metric',
    privacy: {
      moduleA: 'friends',
      moduleB: 'public',
      moduleC: 'friends',
      moduleD: 'public',
      moduleE: 'private',
    },
    notifications: {
      email: true,
      push: true,
      dunbarReminders: true,
    },
  },

  // --------------------------------------------------------------------------
  // PERFORMANCE GLOBALE
  // --------------------------------------------------------------------------
  performance: {
    overall: 85,
    byModule: {
      A: 92, // Santé - Excellent
      B: 88, // Exploration - Très bien
      C: 78, // Finance - Bon
      D: 75, // Achievements - Bon
      E: 42, // Social - À améliorer
    },
    weekNumber: 52,
    year: 2025,
  },

  // ==========================================================================
  // MODULE A : PHYSIOLOGIQUE (Le Corps)
  // ==========================================================================
  moduleA: {
    sleep: [
      {
        date: '2025-12-30',
        duration: 480, // 8h00 - Nuit dernière
        quality: 'excellent',
        deepSleepMinutes: 120,
        remSleepMinutes: 115,
        awakenings: 1,
      },
      {
        date: '2025-12-29',
        duration: 432, // 7h12
        quality: 'good',
        deepSleepMinutes: 95,
        remSleepMinutes: 110,
        awakenings: 2,
      },
      {
        date: '2025-12-28',
        duration: 420, // 7h00
        quality: 'excellent',
        deepSleepMinutes: 105,
        remSleepMinutes: 98,
        awakenings: 1,
      },
      {
        date: '2025-12-27',
        duration: 390, // 6h30
        quality: 'good',
        deepSleepMinutes: 85,
        remSleepMinutes: 92,
        awakenings: 3,
      },
      {
        date: '2025-12-26',
        duration: 480, // 8h00
        quality: 'excellent',
        deepSleepMinutes: 120,
        remSleepMinutes: 115,
        awakenings: 0,
      },
      {
        date: '2025-12-25',
        duration: 510, // 8h30
        quality: 'excellent',
        deepSleepMinutes: 130,
        remSleepMinutes: 125,
        awakenings: 1,
      },
    ],
    sport: [
      {
        date: '2025-12-29',
        duration: 45,
        type: 'running',
        caloriesBurned: 520,
        intensity: 'high',
        notes: 'Interval training en bord de Seine',
      },
      {
        date: '2025-12-28',
        duration: 60,
        type: 'gym',
        caloriesBurned: 380,
        intensity: 'moderate',
        notes: 'Upper body + core',
      },
      {
        date: '2025-12-27',
        duration: 30,
        type: 'yoga',
        caloriesBurned: 120,
        intensity: 'low',
        notes: 'Récupération active',
      },
      {
        date: '2025-12-26',
        duration: 90,
        type: 'cycling',
        caloriesBurned: 750,
        intensity: 'high',
        notes: 'Sortie groupe Vincennes',
      },
      {
        date: '2025-12-24',
        duration: 25,
        type: 'hiit',
        caloriesBurned: 310,
        intensity: 'extreme',
      },
    ],
    measurements: [
      {
        date: '2025-12-01',
        height: 188, // 188 cm
        weight: 70, // 70 kg
        bodyFatPercentage: 12.5,
        muscleMass: 38.2,
        waistCircumference: 78,
        vo2Max: 55,
        restingHeartRate: 52,
      },
      {
        date: '2025-11-01',
        height: 182,
        weight: 79.2,
        bodyFatPercentage: 15.1,
        muscleMass: 35.4,
        waistCircumference: 83,
        vo2Max: 50,
        restingHeartRate: 56,
      },
      {
        date: '2025-10-01',
        height: 182,
        weight: 80.1,
        bodyFatPercentage: 16.0,
        muscleMass: 35.0,
        waistCircumference: 85,
        vo2Max: 48,
        restingHeartRate: 58,
      },
    ],
    nutrition: [
      {
        date: '2025-12-29',
        calories: 2150,
        protein: 145,
        carbs: 210,
        fat: 75,
        waterIntake: 2.4,
        meals: 3,
        fasting: false,
      },
      {
        date: '2025-12-28',
        calories: 2300,
        protein: 160,
        carbs: 230,
        fat: 80,
        waterIntake: 2.8,
        meals: 4,
        fasting: false,
      },
      {
        date: '2025-12-27',
        calories: 1800,
        protein: 120,
        carbs: 150,
        fat: 70,
        waterIntake: 2.2,
        meals: 2,
        fasting: true,
      },
    ],
    currentStats: {
      averageSleepQuality: 85,
      weeklyActivityMinutes: 320,
      currentWeight: 70, // 70 kg
      hrv: 88,
      dailySteps: 9200,
    },
  },

  // ==========================================================================
  // MODULE B : CARTE D'EXPLORATION (Le Monde)
  // ==========================================================================
  moduleB: {
    countriesVisited: [
      {
        code: 'FR',
        name: 'France',
        regions: [
          {
            name: 'Île-de-France',
            exploredPercentage: 95,
            firstVisit: '1992-03-15',
            lastVisit: '2025-12-29',
            totalDaysSpent: 10000,
          },
          {
            name: 'Provence-Alpes-Côte d\'Azur',
            exploredPercentage: 70,
            firstVisit: '2000-07-15',
            lastVisit: '2025-08-20',
            totalDaysSpent: 120,
          },
          {
            name: 'Bretagne',
            exploredPercentage: 45,
            firstVisit: '2005-08-10',
            lastVisit: '2024-07-22',
            totalDaysSpent: 35,
          },
          {
            name: 'Nouvelle-Aquitaine',
            exploredPercentage: 30,
            firstVisit: '2010-06-01',
            lastVisit: '2025-05-15',
            totalDaysSpent: 25,
          },
        ],
        firstVisit: '1992-03-15',
        lastVisit: '2025-12-29',
        totalDaysSpent: 11500,
        visitCount: 1,
        isHomeCountry: true,
      },
      {
        code: 'US',
        name: 'États-Unis',
        regions: [
          {
            name: 'New York',
            exploredPercentage: 60,
            firstVisit: '2018-05-10',
            lastVisit: '2025-03-20',
            totalDaysSpent: 45,
          },
          {
            name: 'California',
            exploredPercentage: 50,
            firstVisit: '2019-09-01',
            lastVisit: '2025-04-15',
            totalDaysSpent: 38,
          },
          {
            name: 'Florida',
            exploredPercentage: 25,
            firstVisit: '2025-04-20',
            lastVisit: '2025-04-28',
            totalDaysSpent: 8,
          },
        ],
        firstVisit: '2018-05-10',
        lastVisit: '2025-04-28',
        totalDaysSpent: 91,
        visitCount: 5,
        isHomeCountry: false,
      },
      {
        code: 'JP',
        name: 'Japon',
        regions: [
          {
            name: 'Kantō (Tokyo)',
            exploredPercentage: 70,
            firstVisit: '2019-04-01',
            lastVisit: '2024-11-15',
            totalDaysSpent: 28,
          },
          {
            name: 'Kansai (Kyoto, Osaka)',
            exploredPercentage: 55,
            firstVisit: '2019-04-10',
            lastVisit: '2024-11-22',
            totalDaysSpent: 14,
          },
        ],
        firstVisit: '2019-04-01',
        lastVisit: '2024-11-22',
        totalDaysSpent: 42,
        visitCount: 3,
        isHomeCountry: false,
      },
      {
        code: 'AU',
        name: 'Australie',
        regions: [
          {
            name: 'New South Wales (Sydney)',
            exploredPercentage: 40,
            firstVisit: '2022-02-10',
            lastVisit: '2022-02-25',
            totalDaysSpent: 15,
          },
        ],
        firstVisit: '2022-02-10',
        lastVisit: '2022-02-25',
        totalDaysSpent: 15,
        visitCount: 1,
        isHomeCountry: false,
      },
      {
        code: 'ID',
        name: 'Indonésie',
        regions: [
          {
            name: 'Bali',
            exploredPercentage: 65,
            firstVisit: '2023-01-05',
            lastVisit: '2023-02-15',
            totalDaysSpent: 40,
          },
        ],
        firstVisit: '2023-01-05',
        lastVisit: '2023-02-15',
        totalDaysSpent: 40,
        visitCount: 1,
        isHomeCountry: false,
      },
      {
        code: 'RU',
        name: 'Russie',
        regions: [
          {
            name: 'Moscou',
            exploredPercentage: 35,
            firstVisit: '2017-12-20',
            lastVisit: '2017-12-28',
            totalDaysSpent: 8,
          },
        ],
        firstVisit: '2017-12-20',
        lastVisit: '2017-12-28',
        totalDaysSpent: 8,
        visitCount: 1,
        isHomeCountry: false,
      },
      {
        code: 'AE',
        name: 'Émirats Arabes Unis',
        regions: [
          {
            name: 'Dubaï',
            exploredPercentage: 50,
            firstVisit: '2024-01-10',
            lastVisit: '2024-01-18',
            totalDaysSpent: 8,
          },
        ],
        firstVisit: '2024-01-10',
        lastVisit: '2024-01-18',
        totalDaysSpent: 8,
        visitCount: 1,
        isHomeCountry: false,
      },
      {
        code: 'MX',
        name: 'Mexique',
        regions: [
          {
            name: 'Ciudad de México',
            exploredPercentage: 45,
            firstVisit: '2025-05-01',
            lastVisit: '2025-05-12',
            totalDaysSpent: 11,
          },
          {
            name: 'Quintana Roo (Cancún)',
            exploredPercentage: 30,
            firstVisit: '2025-05-12',
            lastVisit: '2025-05-18',
            totalDaysSpent: 6,
          },
        ],
        firstVisit: '2025-05-01',
        lastVisit: '2025-05-18',
        totalDaysSpent: 17,
        visitCount: 1,
        isHomeCountry: false,
      },
      {
        code: 'ES',
        name: 'Espagne',
        regions: [
          {
            name: 'Catalogne (Barcelone)',
            exploredPercentage: 55,
            firstVisit: '2016-08-01',
            lastVisit: '2025-06-20',
            totalDaysSpent: 22,
          },
          {
            name: 'Madrid',
            exploredPercentage: 40,
            firstVisit: '2020-02-10',
            lastVisit: '2025-06-15',
            totalDaysSpent: 12,
          },
        ],
        firstVisit: '2016-08-01',
        lastVisit: '2025-06-20',
        totalDaysSpent: 34,
        visitCount: 4,
        isHomeCountry: false,
      },
      {
        code: 'IT',
        name: 'Italie',
        regions: [
          {
            name: 'Lazio (Rome)',
            exploredPercentage: 60,
            firstVisit: '2015-04-15',
            lastVisit: '2024-09-10',
            totalDaysSpent: 18,
          },
          {
            name: 'Toscane (Florence)',
            exploredPercentage: 45,
            firstVisit: '2018-06-01',
            lastVisit: '2024-09-15',
            totalDaysSpent: 10,
          },
        ],
        firstVisit: '2015-04-15',
        lastVisit: '2024-09-15',
        totalDaysSpent: 28,
        visitCount: 3,
        isHomeCountry: false,
      },
      {
        code: 'TH',
        name: 'Thaïlande',
        regions: [
          {
            name: 'Bangkok',
            exploredPercentage: 50,
            firstVisit: '2021-11-01',
            lastVisit: '2021-11-20',
            totalDaysSpent: 19,
          },
        ],
        firstVisit: '2021-11-01',
        lastVisit: '2021-11-20',
        totalDaysSpent: 19,
        visitCount: 1,
        isHomeCountry: false,
      },
      {
        code: 'PT',
        name: 'Portugal',
        regions: [
          {
            name: 'Lisbonne',
            exploredPercentage: 65,
            firstVisit: '2023-09-05',
            lastVisit: '2025-09-20',
            totalDaysSpent: 25,
          },
        ],
        firstVisit: '2023-09-05',
        lastVisit: '2025-09-20',
        totalDaysSpent: 25,
        visitCount: 2,
        isHomeCountry: false,
      },
    ],
    trips: [
      {
        id: 'trip_001',
        destination: {
          country: 'US',
          city: 'New York',
          coordinates: [40.7128, -74.006],
        },
        startDate: '2025-03-15',
        endDate: '2025-03-25',
        duration: 10,
        purpose: 'work',
        transport: 'plane',
        distanceKm: 5850,
        notes: 'Conférence React NYC',
      },
      {
        id: 'trip_002',
        destination: {
          country: 'US',
          city: 'Los Angeles',
          coordinates: [34.0522, -118.2437],
        },
        startDate: '2025-04-01',
        endDate: '2025-04-15',
        duration: 14,
        purpose: 'leisure',
        transport: 'plane',
        distanceKm: 9100,
        notes: 'Roadtrip côte ouest',
      },
      {
        id: 'trip_003',
        destination: {
          country: 'US',
          city: 'Miami',
          coordinates: [25.7617, -80.1918],
        },
        startDate: '2025-04-18',
        endDate: '2025-04-28',
        duration: 10,
        purpose: 'leisure',
        transport: 'plane',
        distanceKm: 7350,
      },
      {
        id: 'trip_004',
        destination: {
          country: 'MX',
          city: 'Mexico City',
          coordinates: [19.4326, -99.1332],
        },
        startDate: '2025-05-01',
        endDate: '2025-05-18',
        duration: 17,
        purpose: 'work',
        transport: 'plane',
        distanceKm: 9200,
        notes: 'Remote work + exploration',
      },
      {
        id: 'trip_005',
        destination: {
          country: 'ES',
          city: 'Barcelone',
          coordinates: [41.3851, 2.1734],
        },
        startDate: '2025-06-15',
        endDate: '2025-06-25',
        duration: 10,
        purpose: 'leisure',
        transport: 'train',
        distanceKm: 1050,
        notes: 'TGV + exploration catalane',
      },
      {
        id: 'trip_006',
        destination: {
          country: 'PT',
          city: 'Lisbonne',
          coordinates: [38.7223, -9.1393],
        },
        startDate: '2025-09-10',
        endDate: '2025-09-20',
        duration: 10,
        purpose: 'work',
        transport: 'plane',
        distanceKm: 1450,
        notes: 'Web Summit',
      },
    ],
    stats: {
      totalCountries: 12,
      totalRegions: 24,
      totalDistanceKm: 156000,
      totalDaysAbroad: 327,
      mostUsedTransport: 'plane',
      currentYear: {
        distanceKm: 42100,
        countriesVisited: 5,
        trips: 6,
      },
    },
    status: 'digital_nomad',
    homeBase: {
      country: 'FR',
      city: 'Paris',
      coordinates: [48.8566, 2.3522],
    },
  },

  // ==========================================================================
  // MODULE C : PROFESSIONNEL & PATRIMOINE
  // ==========================================================================
  moduleC: {
    career: {
      currentPosition: 'Lead Developer',
      company: 'TechVentures SAS',
      industry: 'Tech / SaaS',
      yearsInCurrentRole: 2,
      totalYearsExperience: 5,
      skills: [
        'React',
        'TypeScript',
        'Node.js',
        'Next.js',
        'PostgreSQL',
        'AWS',
        'Team Leadership',
        'Agile/Scrum',
      ],
      longTermGoal: 'Entrepreneuriat - Lancer une startup SaaS B2B',
      aspirationRole: 'CTO',
      aspirationProbability: 78,
    },

    // FLUX - Revenus
    revenus: {
      sources: [
        {
          type: 'salary',
          name: 'TechVentures SAS',
          grossAnnual: 72000,
          netAnnual: 54000,
          frequency: 'monthly',
          isActive: true,
          startDate: '2023-01-01',
        },
        {
          type: 'freelance',
          name: 'Consulting Web',
          grossAnnual: 18000,
          netAnnual: 14400,
          frequency: 'irregular',
          isActive: true,
          startDate: '2022-06-01',
        },
        {
          type: 'investments',
          name: 'Dividendes ETF',
          grossAnnual: 2400,
          netAnnual: 1800,
          frequency: 'quarterly',
          isActive: true,
          startDate: '2021-01-01',
        },
        {
          type: 'dividends',
          name: 'Actions individuelles',
          grossAnnual: 1200,
          netAnnual: 900,
          frequency: 'annual',
          isActive: true,
          startDate: '2022-03-01',
        },
        {
          type: 'rental',
          name: 'Studio Paris 11',
          grossAnnual: 14400,
          netAnnual: 10800,
          frequency: 'monthly',
          isActive: true,
          startDate: '2024-03-01',
        },
      ],
      totalGrossAnnual: 108000,
      totalNetAnnual: 81900,
      monthlyNetAverage: 6825,
      currency: 'EUR',
      taxRate: 24.2,
      savingsRate: 35,
    },

    // STOCK - Patrimoine/Assets
    patrimoine: {
      realEstate: [
        {
          id: 'real_001',
          type: 'apartment',
          location: 'Paris 11ème - 65m²',
          purchaseDate: '2021-06-15',
          purchasePrice: 450000,
          currentValue: 520000,
          mortgageRemaining: 280000,
          isMainResidence: true,
        },
        {
          id: 'real_002',
          type: 'apartment',
          location: 'Paris 20ème - Studio 22m²',
          purchaseDate: '2024-01-10',
          purchasePrice: 180000,
          currentValue: 195000,
          mortgageRemaining: 145000,
          monthlyRentalIncome: 1200,
          isMainResidence: false,
        },
      ],
      vehicles: [
        {
          id: 'veh_001',
          type: 'car',
          brand: 'Tesla',
          model: 'Model 3 Long Range',
          year: 2023,
          purchasePrice: 52000,
          currentValue: 42000,
          isFinanced: false,
        },
        {
          id: 'veh_002',
          type: 'motorcycle',
          brand: 'Triumph',
          model: 'Street Triple RS',
          year: 2022,
          purchasePrice: 14500,
          currentValue: 11000,
          isFinanced: false,
        },
      ],
      financialAssets: [
        {
          id: 'fin_001',
          type: 'stocks',
          name: 'Portefeuille Actions US',
          institution: 'Interactive Brokers',
          currentValue: 35000,
          purchaseValue: 28000,
          returnPercentage: 25,
        },
        {
          id: 'fin_002',
          type: 'etf',
          name: 'MSCI World (CW8)',
          institution: 'Boursorama',
          currentValue: 42000,
          purchaseValue: 35000,
          returnPercentage: 20,
        },
        {
          id: 'fin_003',
          type: 'crypto',
          name: 'Portefeuille Crypto',
          institution: 'Ledger / Kraken',
          currentValue: 28000,
          purchaseValue: 15000,
          returnPercentage: 87,
        },
        {
          id: 'fin_004',
          type: 'savings',
          name: 'Livret A',
          institution: 'Boursorama',
          currentValue: 22950,
          returnPercentage: 3,
        },
        {
          id: 'fin_005',
          type: 'retirement',
          name: 'PER',
          institution: 'Linxea',
          currentValue: 18000,
          purchaseValue: 15000,
          returnPercentage: 20,
        },
        {
          id: 'fin_006',
          type: 'cash',
          name: 'Compte courant',
          institution: 'Boursorama',
          currentValue: 8500,
        },
      ],
      liabilities: [
        {
          id: 'debt_001',
          type: 'mortgage',
          name: 'Crédit appartement principal',
          originalAmount: 360000,
          remainingAmount: 280000,
          interestRate: 1.45,
          monthlyPayment: 1520,
          endDate: '2041-06-15',
        },
        {
          id: 'debt_002',
          type: 'mortgage',
          name: 'Crédit studio locatif',
          originalAmount: 150000,
          remainingAmount: 145000,
          interestRate: 3.2,
          monthlyPayment: 850,
          endDate: '2044-01-10',
        },
      ],
      totalAssets: 922450,
      totalLiabilities: 425000,
      netWorth: 497450,
      liquidAssets: 154450, // Cash + Crypto + Savings + Stocks
    },
  },

  // ==========================================================================
  // MODULE D : L'EXTRAORDINAIRE (Achievements)
  // ==========================================================================
  moduleD: {
    achievements: [
      {
        id: 'ach_001',
        title: 'Saut en parachute',
        description: 'Premier saut en tandem à 4000m au-dessus des Alpes',
        category: 'adventure',
        rarity: 'uncommon',
        dateAchieved: '2019-08-15',
        location: 'Gap, France',
        isPublic: true,
        likes: 124,
      },
      {
        id: 'ach_002',
        title: 'Marathon de Paris',
        description: 'Finisher du Marathon de Paris en 3h52',
        category: 'sport',
        rarity: 'uncommon',
        dateAchieved: '2024-04-07',
        location: 'Paris, France',
        isPublic: true,
        likes: 89,
      },
      {
        id: 'ach_003',
        title: 'Traversée du Japon',
        description: '3 semaines de Tokyo à Hiroshima en train local uniquement',
        category: 'travel',
        rarity: 'rare',
        dateAchieved: '2019-04-01',
        location: 'Japon',
        isPublic: true,
        likes: 156,
      },
      {
        id: 'ach_004',
        title: 'Speaker Tech Conference',
        description: 'Présentation de 45 minutes sur les micro-frontends à React NYC',
        category: 'career',
        rarity: 'rare',
        dateAchieved: '2025-03-20',
        location: 'New York, USA',
        isPublic: true,
        likes: 78,
      },
      {
        id: 'ach_005',
        title: 'Aurore Boréale',
        description: 'Observation d\'aurores boréales en Islande',
        category: 'adventure',
        rarity: 'rare',
        dateAchieved: '2020-02-14',
        location: 'Reykjavik, Islande',
        isPublic: true,
        likes: 203,
      },
      {
        id: 'ach_006',
        title: 'Plongée avec requins',
        description: 'Plongée cage avec grands requins blancs',
        category: 'adventure',
        rarity: 'epic',
        dateAchieved: '2022-02-18',
        location: 'Sydney, Australie',
        isPublic: true,
        likes: 312,
      },
      {
        id: 'ach_007',
        title: 'Contributeur Open Source',
        description: 'Plus de 100 contributions sur des projets majeurs (React, Next.js)',
        category: 'career',
        rarity: 'uncommon',
        dateAchieved: '2023-12-01',
        location: 'Remote',
        isPublic: true,
        likes: 45,
      },
      {
        id: 'ach_008',
        title: 'Premier investissement immobilier',
        description: 'Achat d\'un studio locatif à Paris, cash-flow positif dès le mois 1',
        category: 'career',
        rarity: 'uncommon',
        dateAchieved: '2024-03-01',
        location: 'Paris, France',
        isPublic: false,
        likes: 34,
      },
      {
        id: 'ach_009',
        title: 'Rencontre avec Elon Musk',
        description: '5 minutes de discussion lors d\'un événement Tesla à Berlin',
        category: 'social',
        rarity: 'epic',
        dateAchieved: '2023-03-10',
        location: 'Berlin, Allemagne',
        isPublic: true,
        likes: 567,
      },
      {
        id: 'ach_010',
        title: 'Ascension du Mont Fuji',
        description: 'Lever de soleil au sommet du Mont Fuji après ascension de nuit',
        category: 'adventure',
        rarity: 'rare',
        dateAchieved: '2024-07-15',
        location: 'Mont Fuji, Japon',
        isPublic: true,
        likes: 234,
      },
    ],
    stats: {
      total: 10,
      byCategory: {
        adventure: 4,
        travel: 1,
        career: 3,
        social: 1,
        sport: 1,
        creative: 0,
        education: 0,
        humanitarian: 0,
      },
      byRarity: {
        common: 0,
        uncommon: 4,
        rare: 4,
        epic: 2,
        legendary: 0,
      },
      latestUnlock: 'ach_004',
    },
    bucketList: [
      {
        id: 'bucket_001',
        title: 'Voir les pyramides d\'Égypte',
        category: 'travel',
        targetDate: '2026-03-01',
        progress: 10,
      },
      {
        id: 'bucket_002',
        title: 'Aller dans l\'espace (vol suborbital)',
        category: 'adventure',
        targetDate: '2035-01-01',
        progress: 5,
      },
      {
        id: 'bucket_003',
        title: 'Lancer ma startup',
        category: 'career',
        targetDate: '2027-01-01',
        progress: 35,
      },
      {
        id: 'bucket_004',
        title: 'Faire un Ironman',
        category: 'sport',
        targetDate: '2026-09-01',
        progress: 25,
      },
      {
        id: 'bucket_005',
        title: 'Apprendre le japonais (N3)',
        category: 'education',
        targetDate: '2026-12-01',
        progress: 40,
      },
    ],
  },

  // ==========================================================================
  // MODULE E : SOCIAL (Le Lien) - TrueCircle Rank 1
  // ==========================================================================
  moduleE: {
    contacts: [
      {
        id: 'contact_sophie',
        name: 'Sophie',
        avatar: '/truecircle/Sophie.jpg',
        relationshipType: 'close_friend',
        tags: ['amie', 'design', 'voyage'],
        location: 'Paris',
        phone: '+33 6 12 34 56 78',
        lastInteraction: '2025-12-30',
        interactionCount: 245,
        dunbarPriority: 'inner_circle',
        publicStats: {
          globalPerformance: 85,
          netWorth: 320000,
          countriesVisited: 14,
          achievements: 12,
        },
        privateStats: {
          monthlyIncome: 5800,
          savingsRate: 32,
          currentWeight: 58,
          weeklyActivity: 310,
        },
      },
      {
        id: 'contact_lucas',
        name: 'Lucas',
        avatar: '/truecircle/Lucas.jpg',
        relationshipType: 'close_friend',
        tags: ['ami', 'dev', 'sport'],
        location: 'Lyon',
        phone: '+33 6 23 45 67 89',
        lastInteraction: '2025-12-29',
        interactionCount: 189,
        dunbarPriority: 'inner_circle',
        publicStats: {
          globalPerformance: 78,
          netWorth: 285000,
          countriesVisited: 8,
          achievements: 7,
        },
        privateStats: {
          monthlyIncome: 5200,
          savingsRate: 28,
          currentWeight: 72,
          weeklyActivity: 280,
        },
      },
      {
        id: 'contact_emma',
        name: 'Emma',
        avatar: '/truecircle/Emma.jpg',
        relationshipType: 'close_friend',
        tags: ['amie', 'art', 'musique'],
        location: 'Bordeaux',
        phone: '+33 6 34 56 78 90',
        lastInteraction: '2025-12-28',
        interactionCount: 156,
        dunbarPriority: 'inner_circle',
        publicStats: {
          globalPerformance: 82,
          netWorth: 180000,
          countriesVisited: 11,
          achievements: 9,
        },
        privateStats: {
          monthlyIncome: 4200,
          savingsRate: 25,
          currentWeight: 55,
          weeklyActivity: 240,
        },
      },
      {
        id: 'contact_thomas',
        name: 'Thomas',
        avatar: '/truecircle/Thomas.jpg',
        relationshipType: 'close_friend',
        tags: ['ami', 'entrepreneur', 'finance'],
        location: 'Paris',
        phone: '+33 6 45 67 89 01',
        lastInteraction: '2025-12-27',
        interactionCount: 142,
        dunbarPriority: 'inner_circle',
        publicStats: {
          globalPerformance: 88,
          netWorth: 520000,
          countriesVisited: 16,
          achievements: 14,
        },
        privateStats: {
          monthlyIncome: 8500,
          savingsRate: 42,
          currentWeight: 78,
          weeklyActivity: 360,
        },
      },
      {
        id: 'contact_lea',
        name: 'Lea',
        avatar: '/truecircle/Lea.jpg',
        relationshipType: 'close_friend',
        tags: ['amie', 'yoga', 'bien-être'],
        location: 'Nice',
        phone: '+33 6 56 78 90 12',
        lastInteraction: '2025-12-26',
        interactionCount: 178,
        dunbarPriority: 'inner_circle',
        publicStats: {
          globalPerformance: 80,
          netWorth: 210000,
          countriesVisited: 9,
          achievements: 8,
        },
        privateStats: {
          monthlyIncome: 4800,
          savingsRate: 30,
          currentWeight: 52,
          weeklyActivity: 420,
        },
      },
      {
        id: 'contact_hugo',
        name: 'Hugo',
        avatar: '/truecircle/Hugo.jpg',
        relationshipType: 'close_friend',
        tags: ['ami', 'photo', 'voyage'],
        location: 'Marseille',
        phone: '+33 6 67 89 01 23',
        lastInteraction: '2025-12-25',
        interactionCount: 134,
        dunbarPriority: 'inner_circle',
        publicStats: {
          globalPerformance: 76,
          netWorth: 165000,
          countriesVisited: 22,
          achievements: 11,
        },
        privateStats: {
          monthlyIncome: 3800,
          savingsRate: 20,
          currentWeight: 70,
          weeklyActivity: 180,
        },
      },
      {
        id: 'contact_camille',
        name: 'Camille',
        avatar: '/truecircle/Camille.jpg',
        relationshipType: 'close_friend',
        tags: ['amie', 'médecine', 'lecture'],
        location: 'Toulouse',
        phone: '+33 6 78 90 12 34',
        lastInteraction: '2025-12-24',
        interactionCount: 112,
        dunbarPriority: 'inner_circle',
        publicStats: {
          globalPerformance: 84,
          netWorth: 290000,
          countriesVisited: 7,
          achievements: 6,
        },
        privateStats: {
          monthlyIncome: 6200,
          savingsRate: 35,
          currentWeight: 60,
          weeklyActivity: 200,
        },
      },
      {
        id: 'contact_antoine',
        name: 'Antoine',
        avatar: '/truecircle/Antoine.jpg',
        relationshipType: 'close_friend',
        tags: ['ami', 'sport', 'tech'],
        location: 'Nantes',
        phone: '+33 6 89 01 23 45',
        lastInteraction: '2025-12-23',
        interactionCount: 98,
        dunbarPriority: 'sympathy',
        publicStats: {
          globalPerformance: 79,
          netWorth: 195000,
          countriesVisited: 6,
          achievements: 5,
        },
        privateStats: {
          monthlyIncome: 4500,
          savingsRate: 27,
          currentWeight: 75,
          weeklyActivity: 350,
        },
      },
      {
        id: 'contact_marie',
        name: 'Marie',
        avatar: '/truecircle/Marie.jpg',
        relationshipType: 'close_friend',
        tags: ['amie', 'cuisine', 'jardinage'],
        location: 'Strasbourg',
        phone: '+33 6 90 12 34 56',
        lastInteraction: '2025-12-22',
        interactionCount: 87,
        dunbarPriority: 'sympathy',
        publicStats: {
          globalPerformance: 75,
          netWorth: 145000,
          countriesVisited: 5,
          achievements: 4,
        },
        privateStats: {
          monthlyIncome: 3600,
          savingsRate: 22,
          currentWeight: 62,
          weeklyActivity: 150,
        },
      },
      {
        id: 'contact_pierre',
        name: 'Pierre',
        avatar: '/truecircle/Pierre.jpg',
        relationshipType: 'close_friend',
        tags: ['ami', 'musique', 'cinéma'],
        location: 'Lille',
        phone: '+33 6 01 23 45 67',
        lastInteraction: '2025-12-21',
        interactionCount: 76,
        dunbarPriority: 'sympathy',
        publicStats: {
          globalPerformance: 72,
          netWorth: 125000,
          countriesVisited: 4,
          achievements: 3,
        },
        privateStats: {
          monthlyIncome: 3200,
          savingsRate: 18,
          currentWeight: 80,
          weeklyActivity: 120,
        },
      },
    ],
    interactions: [],
    dunbarNumbers: {
      innerCircle: 7,
      sympathyGroup: 3,
      acquaintances: 0,
      recognized: 0,
    },
    stats: {
      totalContacts: 10,
      activeThisMonth: 10,
      neglectedContacts: [],
      averageInteractionsPerWeek: 4.2,
      socialScore: 85,
    },
    recommendations: [],
  },
};

// ============================================================================
// EXPORTS ADDITIONNELS
// ============================================================================

// Export par défaut
export default ThomasMorel;

// Export des données séparées pour faciliter l'accès
export const thomasIdentity = ThomasMorel.identity;
export const thomasPhysio = ThomasMorel.moduleA;
export const thomasExploration = ThomasMorel.moduleB;
export const thomasPro = ThomasMorel.moduleC;
export const thomasAchievements = ThomasMorel.moduleD;
export const thomasSocial = ThomasMorel.moduleE;

// ============================================================================
// EXPORTS REQUIS PAR page.tsx ET LES COMPOSANTS
// ============================================================================

// Type Module pour l'affichage dans HomeView
export interface Module {
  id: string;
  title: string;
  percentage: number;
  subtitle: string;
  detailSubtitle: string;
  color: string;
  icon: string;
}

// Type HomeUserProfile pour HomeView
export interface HomeUserProfile {
  name: string;
  subtitle: string;
  globalPerformance: number;
  year: number;
  week: number;
  connections: number;
}

// Type PhysioMetric pour PhysioView
export interface PhysioMetric {
  id: string;
  icon: string;
  label: string;
  value: string;
  valueColor: string;
  progress: number;
  progressColor: string;
  detailSubtitle: string;
}

// Modules for HomeView
export const modules: Module[] = [
  {
    id: 'A',
    title: 'Health',
    percentage: ThomasMorel.performance.byModule.A,
    subtitle: 'Physiological score',
    detailSubtitle: 'Complete health analysis',
    color: '#10b981',
    icon: 'fa-solid fa-heart-pulse',
  },
  {
    id: 'C',
    title: 'Finance',
    percentage: ThomasMorel.performance.byModule.C,
    subtitle: `${Math.round(ThomasMorel.moduleC.patrimoine.netWorth / 1000)}k€ net worth`,
    detailSubtitle: 'Wealth management',
    color: '#f59e0b',
    icon: 'fa-solid fa-coins',
  },
  {
    id: 'D',
    title: 'Achievements',
    percentage: ThomasMorel.performance.byModule.D,
    subtitle: `${ThomasMorel.moduleD.stats.total} achievements`,
    detailSubtitle: 'Your extraordinary accomplishments',
    color: '#8b5cf6',
    icon: 'fa-solid fa-trophy',
  },
  {
    id: 'E',
    title: 'Circle',
    percentage: ThomasMorel.moduleE.stats.socialScore,
    subtitle: `${ThomasMorel.moduleE.dunbarNumbers.innerCircle} inner circle`,
    detailSubtitle: 'Your social network',
    color: '#ec4899',
    icon: 'fa-solid fa-users',
  },
  {
    id: 'B',
    title: 'World',
    percentage: Math.round((ThomasMorel.moduleB.stats.totalCountries / 195) * 100),
    subtitle: `${ThomasMorel.moduleB.stats.totalCountries} countries visited`,
    detailSubtitle: 'Your world exploration map',
    color: '#3b82f6',
    icon: 'fa-solid fa-globe',
  },
];

// Profil utilisateur pour HomeView
export const userProfile: HomeUserProfile = {
  name: ThomasMorel.identity.displayName,
  subtitle: ThomasMorel.identity.bio || '',
  globalPerformance: ThomasMorel.performance.overall, // Will be overridden by harmony calculator
  year: ThomasMorel.performance.year,
  week: ThomasMorel.performance.weekNumber,
  connections: 2050, // Real connections count
};

// Liste des pays visités pour WorldMapCard (format Country[])
export const visitedCountries = ThomasMorel.moduleB.countriesVisited.map(c => ({
  code: c.code,
  name: c.name,
  visits: c.visitCount,
  lastVisit: c.lastVisit,
}));

// Physio metrics for PhysioView
export const physioMetrics: PhysioMetric[] = [
  {
    id: 'sleep',
    icon: 'fa-solid fa-moon',
    label: 'Sleep',
    value: `${Math.floor(ThomasMorel.moduleA.sleep[0]?.duration / 60)}h${ThomasMorel.moduleA.sleep[0]?.duration % 60}`,
    valueColor: '#10b981',
    progress: ThomasMorel.moduleA.currentStats.averageSleepQuality,
    progressColor: '#10b981',
    detailSubtitle: 'Sleep quality this week',
  },
  {
    id: 'activity',
    icon: 'fa-solid fa-person-running',
    label: 'Activity',
    value: `${ThomasMorel.moduleA.currentStats.weeklyActivityMinutes} min`,
    valueColor: '#f59e0b',
    progress: Math.min(100, Math.round((ThomasMorel.moduleA.currentStats.weeklyActivityMinutes / 300) * 100)),
    progressColor: '#f59e0b',
    detailSubtitle: 'Activity minutes this week',
  },
  {
    id: 'steps',
    icon: 'fa-solid fa-shoe-prints',
    label: 'Steps',
    value: `${(ThomasMorel.moduleA.currentStats.dailySteps / 1000).toFixed(1)}k`,
    valueColor: '#3b82f6',
    progress: Math.min(100, Math.round((ThomasMorel.moduleA.currentStats.dailySteps / 10000) * 100)),
    progressColor: '#3b82f6',
    detailSubtitle: 'Steps today',
  },
  {
    id: 'weight',
    icon: 'fa-solid fa-weight-scale',
    label: 'Weight',
    value: `${ThomasMorel.moduleA.currentStats.currentWeight} kg`,
    valueColor: '#8b5cf6',
    progress: 100,
    progressColor: '#8b5cf6',
    detailSubtitle: 'Current weight',
  },
  {
    id: 'hrv',
    icon: 'fa-solid fa-heart-pulse',
    label: 'HRV',
    value: `${ThomasMorel.moduleA.currentStats.hrv} ms`,
    valueColor: '#ec4899',
    progress: Math.min(100, Math.round((ThomasMorel.moduleA.currentStats.hrv / 100) * 100)),
    progressColor: '#ec4899',
    detailSubtitle: 'Heart rate variability',
  },
  {
    id: 'hydration',
    icon: 'fa-solid fa-droplet',
    label: 'Hydration',
    value: `${ThomasMorel.moduleA.nutrition[0]?.waterIntake || 0}L`,
    valueColor: '#06b6d4',
    progress: Math.min(100, Math.round(((ThomasMorel.moduleA.nutrition[0]?.waterIntake || 0) / 3) * 100)),
    progressColor: '#06b6d4',
    detailSubtitle: 'Water intake today',
  },
];

// AI Analysis for PhysioView
export const aiAnalysis = {
  title: 'AI Analysis',
  message: 'Excellent overall fitness. Keep up your sleep and activity efforts. Consider slightly increasing your protein intake.',
};

// Type CareerInfo pour ProView
export interface CareerInfo {
  currentPosition: string;
  experience: string;
  specialty: string;
  aspiringPosition: string;
  probability: number;
  missingSkill: string;
  netWorth: string;
  annualIncome: string;
}

// Career info for ProView
export const careerInfo: CareerInfo = {
  currentPosition: ThomasMorel.moduleC.career.currentPosition,
  experience: `${ThomasMorel.moduleC.career.totalYearsExperience} years`,
  specialty: ThomasMorel.moduleC.career.industry,
  aspiringPosition: ThomasMorel.moduleC.career.aspirationRole || 'Senior Role',
  probability: ThomasMorel.moduleC.career.aspirationProbability || 50,
  missingSkill: 'Strategic Management',
  netWorth: `${Math.round(ThomasMorel.moduleC.patrimoine.netWorth / 1000)}k€`,
  annualIncome: `${Math.round(ThomasMorel.moduleC.revenus.totalNetAnnual / 1000)}k€`,
};

// Type Contact pour SocialView
export interface Contact {
  id: string;
  avatar: string;
  name: string;
  role: string;
  lastContact: string;
  lastContactColor: string;
  phone?: string;
}

// Contacts for SocialView - Include Théo and Ugo first, then recommendations
export const contacts: Contact[] = [
  // All Rank 1 contacts from moduleE
  ...ThomasMorel.moduleE.contacts
    .map(contact => ({
      id: contact.id,
      avatar: contact.avatar || '',
      name: contact.name,
      role: contact.tags?.[0] || 'Ami',
      lastContact: contact.lastInteraction
        ? `${Math.floor((Date.now() - new Date(contact.lastInteraction).getTime()) / (1000 * 60 * 60 * 24))}d`
        : 'N/A',
      lastContactColor: 'text-green-400',
      phone: contact.phone,
    })),
  // Then recommendations
  ...ThomasMorel.moduleE.recommendations.map((rec) => {
    const contact = ThomasMorel.moduleE.contacts.find(c => c.id === rec.contactId);
    return {
      id: rec.contactId,
      avatar: contact?.avatar || '',
      name: rec.contactName,
      role: contact?.tags?.[0] || 'Contact',
      lastContact: contact?.lastInteraction
        ? `${Math.floor((Date.now() - new Date(contact.lastInteraction).getTime()) / (1000 * 60 * 60 * 24))}d`
        : 'N/A',
      lastContactColor: rec.urgency === 'high' ? 'text-red-400' : 'text-yellow-400',
      phone: contact?.phone,
    };
  }),
];

// Données de comparaison pour SocialView
export const comparisonData = {
  friends: {
    fi: { width: 65, text: 'Top 35%' },
    sp: { width: 80, text: 'Top 20%' },
    sl: { width: 70, text: 'Top 30%' },
  },
  country: {
    fi: { width: 85, text: 'Top 15%' },
    sp: { width: 90, text: 'Top 10%' },
    sl: { width: 75, text: 'Top 25%' },
  },
  world: {
    fi: { width: 95, text: 'Top 5%' },
    sp: { width: 92, text: 'Top 8%' },
    sl: { width: 88, text: 'Top 12%' },
  },
};

// Configuration par défaut du pinning
export const defaultPinConfig = {
  pinnedModuleId: ThomasMorel.identity.pinnedModule || 'A',
  moduleOrder: ['B', 'A', 'C', 'D', 'E'], // B (Exploration) first as pinned
};

// Données financières détaillées pour FinanceCard
export const financeData = {
  // FLUX - Revenus
  flux: {
    totalNet: ThomasMorel.moduleC.revenus.totalNetAnnual,
    monthly: ThomasMorel.moduleC.revenus.monthlyNetAverage,
    sources: ThomasMorel.moduleC.revenus.sources.map(s => ({
      name: s.name,
      amount: s.netAnnual,
      type: s.type,
    })),
    savingsRate: ThomasMorel.moduleC.revenus.savingsRate,
  },
  // STOCK - Patrimoine
  stock: {
    netWorth: ThomasMorel.moduleC.patrimoine.netWorth,
    totalAssets: ThomasMorel.moduleC.patrimoine.totalAssets,
    totalLiabilities: ThomasMorel.moduleC.patrimoine.totalLiabilities,
    liquidAssets: ThomasMorel.moduleC.patrimoine.liquidAssets,
    realEstate: ThomasMorel.moduleC.patrimoine.realEstate.reduce((sum, r) => sum + r.currentValue, 0),
    financial: ThomasMorel.moduleC.patrimoine.financialAssets.reduce((sum, f) => sum + f.currentValue, 0),
    vehicles: ThomasMorel.moduleC.patrimoine.vehicles.reduce((sum, v) => sum + v.currentValue, 0),
  },
};
