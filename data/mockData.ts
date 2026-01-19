// ============================================================================
// STATS - Mock Data
// Jeffrey - Demo Profile
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
// JEFFREY - USER PROFILE
// ============================================================================

export const ThomasMorel: UserProfile = {
  // --------------------------------------------------------------------------
  // IDENTITY
  // --------------------------------------------------------------------------
  identity: {
    id: 'usr_jeffrey_001',
    firstName: 'Jeffrey',
    lastName: 'Epstein',
    displayName: 'Jeffrey',
    email: 'jeffrey@jepstein.com',
    avatar: '/jeffrey.jpg',
    dateOfBirth: '1953-01-20',
    nationality: 'US',
    bio: 'Financier & Philanthropist',
    joinedDate: '2019-01-01',
    lastActive: '2019-08-10T10:30:00Z',
    isVerified: true,
    pinnedModule: 'C', // Proud of his wealth
  },

  // --------------------------------------------------------------------------
  // SETTINGS
  // --------------------------------------------------------------------------
  settings: {
    theme: 'dark',
    language: 'en',
    currency: 'USD',
    units: 'imperial',
    privacy: {
      moduleA: 'private',
      moduleB: 'private',
      moduleC: 'private',
      moduleD: 'private',
      moduleE: 'private',
    },
    notifications: {
      email: false,
      push: false,
      dunbarReminders: false,
    },
  },

  // --------------------------------------------------------------------------
  // PERFORMANCE GLOBALE
  // --------------------------------------------------------------------------
  performance: {
    overall: 72,
    byModule: {
      A: 45, // Health - Poor
      B: 95, // Exploration - Excellent
      C: 99, // Finance - Peak
      D: 88, // Achievements - Great
      E: 25, // Social - Very Poor (reputation)
    },
    weekNumber: 32,
    year: 2019,
  },

  // ==========================================================================
  // MODULE A : PHYSIOLOGIQUE (Le Corps)
  // ==========================================================================
  moduleA: {
    sleep: [
      {
        date: '2019-08-09',
        duration: 300, // 5h00 - Poor sleep
        quality: 'poor',
        deepSleepMinutes: 45,
        remSleepMinutes: 60,
        awakenings: 8,
      },
      {
        date: '2019-08-08',
        duration: 360, // 6h00
        quality: 'fair',
        deepSleepMinutes: 55,
        remSleepMinutes: 70,
        awakenings: 5,
      },
      {
        date: '2019-08-07',
        duration: 330, // 5h30
        quality: 'poor',
        deepSleepMinutes: 40,
        remSleepMinutes: 55,
        awakenings: 7,
      },
      {
        date: '2019-08-06',
        duration: 390, // 6h30
        quality: 'fair',
        deepSleepMinutes: 65,
        remSleepMinutes: 75,
        awakenings: 4,
      },
      {
        date: '2019-08-05',
        duration: 420, // 7h00
        quality: 'good',
        deepSleepMinutes: 80,
        remSleepMinutes: 90,
        awakenings: 2,
      },
      {
        date: '2019-08-04',
        duration: 300, // 5h00
        quality: 'poor',
        deepSleepMinutes: 35,
        remSleepMinutes: 50,
        awakenings: 9,
      },
    ],
    sport: [
      {
        date: '2019-08-08',
        duration: 30,
        type: 'walking',
        caloriesBurned: 120,
        intensity: 'low',
        notes: 'Morning walk around estate',
      },
      {
        date: '2019-08-06',
        duration: 45,
        type: 'swimming',
        caloriesBurned: 280,
        intensity: 'moderate',
        notes: 'Pool at Palm Beach mansion',
      },
      {
        date: '2019-08-04',
        duration: 20,
        type: 'yoga',
        caloriesBurned: 50,
        intensity: 'low',
        notes: 'Physical therapy exercises',
      },
      {
        date: '2019-08-01',
        duration: 60,
        type: 'other',
        caloriesBurned: 420,
        intensity: 'moderate',
        notes: 'Private court',
      },
    ],
    measurements: [
      {
        date: '2019-08-01',
        height: 183, // 6'0"
        weight: 82, // 181 lbs
        bodyFatPercentage: 28.5,
        muscleMass: 32.1,
        waistCircumference: 96,
        vo2Max: 32,
        restingHeartRate: 78,
      },
      {
        date: '2019-07-01',
        height: 183,
        weight: 81.5,
        bodyFatPercentage: 28.0,
        muscleMass: 32.3,
        waistCircumference: 95,
        vo2Max: 33,
        restingHeartRate: 76,
      },
      {
        date: '2019-06-01',
        height: 183,
        weight: 80.8,
        bodyFatPercentage: 27.5,
        muscleMass: 32.5,
        waistCircumference: 94,
        vo2Max: 34,
        restingHeartRate: 74,
      },
    ],
    nutrition: [
      {
        date: '2019-08-09',
        calories: 2800,
        protein: 95,
        carbs: 320,
        fat: 125,
        waterIntake: 1.5,
        meals: 4,
        fasting: false,
      },
      {
        date: '2019-08-08',
        calories: 3100,
        protein: 110,
        carbs: 350,
        fat: 140,
        waterIntake: 1.8,
        meals: 5,
        fasting: false,
      },
      {
        date: '2019-08-07',
        calories: 2600,
        protein: 85,
        carbs: 280,
        fat: 115,
        waterIntake: 1.2,
        meals: 3,
        fasting: false,
      },
    ],
    currentStats: {
      averageSleepQuality: 48,
      weeklyActivityMinutes: 155,
      currentWeight: 82, // kg
      hrv: 42,
      dailySteps: 4200,
    },
  },

  // ==========================================================================
  // MODULE B : CARTE D'EXPLORATION (Le Monde)
  // ==========================================================================
  moduleB: {
    countriesVisited: [
      {
        code: 'US',
        name: 'United States',
        regions: [
          {
            name: 'New York',
            exploredPercentage: 98,
            firstVisit: '1953-01-20',
            lastVisit: '2019-07-06',
            totalDaysSpent: 15000,
          },
          {
            name: 'Florida',
            exploredPercentage: 85,
            firstVisit: '1985-03-15',
            lastVisit: '2019-07-15',
            totalDaysSpent: 3500,
          },
          {
            name: 'New Mexico',
            exploredPercentage: 60,
            firstVisit: '1993-06-01',
            lastVisit: '2019-06-20',
            totalDaysSpent: 800,
          },
        ],
        firstVisit: '1953-01-20',
        lastVisit: '2019-08-09',
        totalDaysSpent: 20000,
        visitCount: 1,
        isHomeCountry: true,
      },
      {
        code: 'VI',
        name: 'U.S. Virgin Islands',
        regions: [
          {
            name: 'Little St. James',
            exploredPercentage: 100,
            firstVisit: '1998-01-01',
            lastVisit: '2019-07-01',
            totalDaysSpent: 2500,
          },
          {
            name: 'Great St. James',
            exploredPercentage: 80,
            firstVisit: '2016-01-01',
            lastVisit: '2019-06-15',
            totalDaysSpent: 200,
          },
        ],
        firstVisit: '1998-01-01',
        lastVisit: '2019-07-01',
        totalDaysSpent: 2700,
        visitCount: 150,
        isHomeCountry: false,
      },
      {
        code: 'FR',
        name: 'France',
        regions: [
          {
            name: 'Paris',
            exploredPercentage: 90,
            firstVisit: '1985-06-15',
            lastVisit: '2019-04-20',
            totalDaysSpent: 450,
          },
          {
            name: 'Côte d\'Azur',
            exploredPercentage: 75,
            firstVisit: '1990-07-01',
            lastVisit: '2018-08-15',
            totalDaysSpent: 280,
          },
        ],
        firstVisit: '1985-06-15',
        lastVisit: '2019-04-20',
        totalDaysSpent: 730,
        visitCount: 85,
        isHomeCountry: false,
      },
      {
        code: 'GB',
        name: 'United Kingdom',
        regions: [
          {
            name: 'London',
            exploredPercentage: 85,
            firstVisit: '1988-03-10',
            lastVisit: '2019-05-15',
            totalDaysSpent: 380,
          },
        ],
        firstVisit: '1988-03-10',
        lastVisit: '2019-05-15',
        totalDaysSpent: 380,
        visitCount: 65,
        isHomeCountry: false,
      },
      {
        code: 'MC',
        name: 'Monaco',
        regions: [
          {
            name: 'Monte Carlo',
            exploredPercentage: 95,
            firstVisit: '1992-05-01',
            lastVisit: '2018-07-20',
            totalDaysSpent: 150,
          },
        ],
        firstVisit: '1992-05-01',
        lastVisit: '2018-07-20',
        totalDaysSpent: 150,
        visitCount: 40,
        isHomeCountry: false,
      },
      {
        code: 'CH',
        name: 'Switzerland',
        regions: [
          {
            name: 'Zurich',
            exploredPercentage: 70,
            firstVisit: '1990-01-15',
            lastVisit: '2018-12-01',
            totalDaysSpent: 120,
          },
          {
            name: 'Geneva',
            exploredPercentage: 65,
            firstVisit: '1995-06-01',
            lastVisit: '2019-01-10',
            totalDaysSpent: 95,
          },
        ],
        firstVisit: '1990-01-15',
        lastVisit: '2019-01-10',
        totalDaysSpent: 215,
        visitCount: 55,
        isHomeCountry: false,
      },
      {
        code: 'IL',
        name: 'Israel',
        regions: [
          {
            name: 'Tel Aviv',
            exploredPercentage: 60,
            firstVisit: '2000-03-01',
            lastVisit: '2016-12-15',
            totalDaysSpent: 85,
          },
        ],
        firstVisit: '2000-03-01',
        lastVisit: '2016-12-15',
        totalDaysSpent: 85,
        visitCount: 20,
        isHomeCountry: false,
      },
      {
        code: 'JP',
        name: 'Japan',
        regions: [
          {
            name: 'Tokyo',
            exploredPercentage: 55,
            firstVisit: '2002-04-15',
            lastVisit: '2017-10-20',
            totalDaysSpent: 65,
          },
        ],
        firstVisit: '2002-04-15',
        lastVisit: '2017-10-20',
        totalDaysSpent: 65,
        visitCount: 12,
        isHomeCountry: false,
      },
      {
        code: 'AE',
        name: 'United Arab Emirates',
        regions: [
          {
            name: 'Dubai',
            exploredPercentage: 70,
            firstVisit: '2005-01-10',
            lastVisit: '2018-02-28',
            totalDaysSpent: 90,
          },
          {
            name: 'Abu Dhabi',
            exploredPercentage: 45,
            firstVisit: '2010-05-01',
            lastVisit: '2017-11-15',
            totalDaysSpent: 35,
          },
        ],
        firstVisit: '2005-01-10',
        lastVisit: '2018-02-28',
        totalDaysSpent: 125,
        visitCount: 25,
        isHomeCountry: false,
      },
      {
        code: 'MX',
        name: 'Mexico',
        regions: [
          {
            name: 'Cancun',
            exploredPercentage: 60,
            firstVisit: '1998-12-20',
            lastVisit: '2016-03-10',
            totalDaysSpent: 75,
          },
        ],
        firstVisit: '1998-12-20',
        lastVisit: '2016-03-10',
        totalDaysSpent: 75,
        visitCount: 15,
        isHomeCountry: false,
      },
      {
        code: 'BS',
        name: 'Bahamas',
        regions: [
          {
            name: 'Nassau',
            exploredPercentage: 80,
            firstVisit: '1995-02-14',
            lastVisit: '2018-04-05',
            totalDaysSpent: 180,
          },
        ],
        firstVisit: '1995-02-14',
        lastVisit: '2018-04-05',
        totalDaysSpent: 180,
        visitCount: 45,
        isHomeCountry: false,
      },
      {
        code: 'MA',
        name: 'Morocco',
        regions: [
          {
            name: 'Marrakech',
            exploredPercentage: 50,
            firstVisit: '2008-09-01',
            lastVisit: '2015-06-20',
            totalDaysSpent: 40,
          },
        ],
        firstVisit: '2008-09-01',
        lastVisit: '2015-06-20',
        totalDaysSpent: 40,
        visitCount: 8,
        isHomeCountry: false,
      },
    ],
    trips: [
      {
        id: 'trip_001',
        destination: {
          country: 'VI',
          city: 'Little St. James',
          coordinates: [18.3000, -64.8250],
        },
        startDate: '2019-06-25',
        endDate: '2019-07-01',
        duration: 6,
        purpose: 'leisure',
        transport: 'plane',
        distanceKm: 2500,
        notes: 'Private island retreat',
      },
      {
        id: 'trip_002',
        destination: {
          country: 'FR',
          city: 'Paris',
          coordinates: [48.8566, 2.3522],
        },
        startDate: '2019-04-15',
        endDate: '2019-04-22',
        duration: 7,
        purpose: 'work',
        transport: 'plane',
        distanceKm: 5850,
        notes: 'Business meetings',
      },
      {
        id: 'trip_003',
        destination: {
          country: 'GB',
          city: 'London',
          coordinates: [51.5074, -0.1278],
        },
        startDate: '2019-05-10',
        endDate: '2019-05-18',
        duration: 8,
        purpose: 'work',
        transport: 'plane',
        distanceKm: 5570,
        notes: 'Royal connections',
      },
      {
        id: 'trip_004',
        destination: {
          country: 'CH',
          city: 'Zurich',
          coordinates: [47.3769, 8.5417],
        },
        startDate: '2019-01-05',
        endDate: '2019-01-12',
        duration: 7,
        purpose: 'work',
        transport: 'plane',
        distanceKm: 6350,
        notes: 'Banking arrangements',
      },
      {
        id: 'trip_005',
        destination: {
          country: 'MC',
          city: 'Monte Carlo',
          coordinates: [43.7384, 7.4246],
        },
        startDate: '2018-07-15',
        endDate: '2018-07-22',
        duration: 7,
        purpose: 'leisure',
        transport: 'plane',
        distanceKm: 6200,
        notes: 'Casino and yacht',
      },
      {
        id: 'trip_006',
        destination: {
          country: 'AE',
          city: 'Dubai',
          coordinates: [25.2048, 55.2708],
        },
        startDate: '2018-02-20',
        endDate: '2018-03-01',
        duration: 9,
        purpose: 'work',
        transport: 'plane',
        distanceKm: 11000,
        notes: 'Investment meetings',
      },
    ],
    stats: {
      totalCountries: 12,
      totalRegions: 22,
      totalDistanceKm: 850000,
      totalDaysAbroad: 4745,
      mostUsedTransport: 'plane',
      currentYear: {
        distanceKm: 45000,
        countriesVisited: 6,
        trips: 4,
      },
    },
    status: 'jet_setter',
    homeBase: {
      country: 'US',
      city: 'New York',
      coordinates: [40.7128, -74.0060],
    },
  },

  // ==========================================================================
  // MODULE C : PROFESSIONNEL & PATRIMOINE
  // ==========================================================================
  moduleC: {
    career: {
      currentPosition: 'CEO & Founder',
      company: 'J. Epstein & Co.',
      industry: 'Finance / Wealth Management',
      yearsInCurrentRole: 38,
      totalYearsExperience: 45,
      skills: [
        'Wealth Management',
        'Tax Optimization',
        'Private Banking',
        'Hedge Funds',
        'Real Estate',
        'Art Collection',
        'Philanthropy',
        'Network Building',
      ],
      longTermGoal: 'Building the largest private wealth management empire',
      aspirationRole: 'Global Finance Titan',
      aspirationProbability: 35,
    },

    // FLUX - Revenus
    revenus: {
      sources: [
        {
          type: 'investments',
          name: 'Hedge Fund Returns',
          grossAnnual: 85000000,
          netAnnual: 65000000,
          frequency: 'quarterly',
          isActive: true,
          startDate: '1982-01-01',
        },
        {
          type: 'investments',
          name: 'Real Estate Portfolio',
          grossAnnual: 25000000,
          netAnnual: 18000000,
          frequency: 'monthly',
          isActive: true,
          startDate: '1990-01-01',
        },
        {
          type: 'dividends',
          name: 'Equity Holdings',
          grossAnnual: 15000000,
          netAnnual: 11000000,
          frequency: 'quarterly',
          isActive: true,
          startDate: '1995-01-01',
        },
        {
          type: 'freelance',
          name: 'Consulting Fees',
          grossAnnual: 8000000,
          netAnnual: 6000000,
          frequency: 'irregular',
          isActive: true,
          startDate: '2000-01-01',
        },
      ],
      totalGrossAnnual: 133000000,
      totalNetAnnual: 100000000,
      monthlyNetAverage: 8333333,
      currency: 'USD',
      taxRate: 24.8,
      savingsRate: 75,
    },

    // STOCK - Patrimoine/Assets
    patrimoine: {
      realEstate: [
        {
          id: 'real_001',
          type: 'mansion',
          location: 'Manhattan, NYC - 9 E 71st St',
          purchaseDate: '1989-01-15',
          purchasePrice: 13200000,
          currentValue: 77000000,
          mortgageRemaining: 0,
          isMainResidence: true,
        },
        {
          id: 'real_002',
          type: 'estate',
          location: 'Palm Beach, FL - El Brillo Way',
          purchaseDate: '1990-06-01',
          purchasePrice: 2500000,
          currentValue: 18500000,
          mortgageRemaining: 0,
          isMainResidence: false,
        },
        {
          id: 'real_003',
          type: 'ranch',
          location: 'Stanley, NM - Zorro Ranch',
          purchaseDate: '1993-08-15',
          purchasePrice: 7500000,
          currentValue: 26000000,
          mortgageRemaining: 0,
          isMainResidence: false,
        },
        {
          id: 'real_004',
          type: 'island',
          location: 'USVI - Little St. James Island',
          purchaseDate: '1998-01-01',
          purchasePrice: 7950000,
          currentValue: 63800000,
          mortgageRemaining: 0,
          isMainResidence: false,
        },
        {
          id: 'real_005',
          type: 'island',
          location: 'USVI - Great St. James Island',
          purchaseDate: '2016-06-01',
          purchasePrice: 22500000,
          currentValue: 25000000,
          mortgageRemaining: 0,
          isMainResidence: false,
        },
        {
          id: 'real_006',
          type: 'apartment',
          location: 'Paris - Avenue Foch',
          purchaseDate: '2002-03-01',
          purchasePrice: 8900000,
          currentValue: 15500000,
          mortgageRemaining: 0,
          isMainResidence: false,
        },
      ],
      vehicles: [
        {
          id: 'veh_001',
          type: 'aircraft',
          brand: 'Gulfstream',
          model: 'G550',
          year: 2008,
          purchasePrice: 53000000,
          currentValue: 38000000,
          isFinanced: false,
        },
        {
          id: 'veh_002',
          type: 'aircraft',
          brand: 'Boeing',
          model: '727-31',
          year: 1987,
          purchasePrice: 100000000,
          currentValue: 15000000,
          isFinanced: false,
        },
        {
          id: 'veh_003',
          type: 'helicopter',
          brand: 'Sikorsky',
          model: 'S-76C',
          year: 2005,
          purchasePrice: 8500000,
          currentValue: 4200000,
          isFinanced: false,
        },
        {
          id: 'veh_004',
          type: 'car',
          brand: 'Bentley',
          model: 'Continental GT',
          year: 2018,
          purchasePrice: 245000,
          currentValue: 185000,
          isFinanced: false,
        },
        {
          id: 'veh_005',
          type: 'car',
          brand: 'Tesla',
          model: 'Model S',
          year: 2019,
          purchasePrice: 120000,
          currentValue: 95000,
          isFinanced: false,
        },
      ],
      financialAssets: [
        {
          id: 'fin_001',
          type: 'stocks',
          name: 'US Equity Portfolio',
          institution: 'Deutsche Bank',
          currentValue: 180000000,
          purchaseValue: 95000000,
          returnPercentage: 89,
        },
        {
          id: 'fin_002',
          type: 'bonds',
          name: 'Government & Corporate Bonds',
          institution: 'UBS',
          currentValue: 85000000,
          purchaseValue: 75000000,
          returnPercentage: 13,
        },
        {
          id: 'fin_003',
          type: 'other',
          name: 'Offshore Holdings',
          institution: 'Credit Suisse',
          currentValue: 125000000,
          purchaseValue: 80000000,
          returnPercentage: 56,
        },
        {
          id: 'fin_004',
          type: 'other',
          name: 'Art Collection',
          institution: 'Private Vault',
          currentValue: 45000000,
          purchaseValue: 18000000,
          returnPercentage: 150,
        },
        {
          id: 'fin_005',
          type: 'cash',
          name: 'Liquid Cash Reserves',
          institution: 'Various Banks',
          currentValue: 35000000,
        },
      ],
      liabilities: [
        {
          id: 'debt_001',
          type: 'other',
          name: 'Legal Defense Fund',
          originalAmount: 50000000,
          remainingAmount: 45000000,
          interestRate: 0,
          monthlyPayment: 0,
          endDate: '',
        },
      ],
      totalAssets: 752780000,
      totalLiabilities: 45000000,
      netWorth: 707780000,
      liquidAssets: 435000000,
    },
  },

  // ==========================================================================
  // MODULE D : L'EXTRAORDINAIRE (Achievements)
  // ==========================================================================
  moduleD: {
    achievements: [
      {
        id: 'ach_001',
        title: 'Bear Stearns Executive',
        description: 'Youngest partner in Bear Stearns history at age 28',
        category: 'career',
        rarity: 'epic',
        dateAchieved: '1981-06-15',
        location: 'New York, USA',
        isPublic: true,
        likes: 0,
      },
      {
        id: 'ach_002',
        title: 'Private Island Owner',
        description: 'Acquired Little St. James Island in the U.S. Virgin Islands',
        category: 'career',
        rarity: 'legendary',
        dateAchieved: '1998-01-01',
        location: 'U.S. Virgin Islands',
        isPublic: true,
        likes: 0,
      },
      {
        id: 'ach_003',
        title: 'Harvard Connections',
        description: 'Major donor to Harvard University science programs',
        category: 'education',
        rarity: 'rare',
        dateAchieved: '2003-05-20',
        location: 'Cambridge, MA',
        isPublic: true,
        likes: 0,
      },
      {
        id: 'ach_004',
        title: 'Media Mogul Network',
        description: 'Established connections with major media executives',
        category: 'social',
        rarity: 'rare',
        dateAchieved: '1995-08-10',
        location: 'New York, USA',
        isPublic: false,
        likes: 0,
      },
      {
        id: 'ach_005',
        title: 'Science Philanthropy',
        description: 'Founded Jeffrey Epstein VI Foundation for science research',
        category: 'humanitarian',
        rarity: 'uncommon',
        dateAchieved: '2000-01-01',
        location: 'New York, USA',
        isPublic: true,
        likes: 0,
      },
      {
        id: 'ach_006',
        title: 'Council on Foreign Relations',
        description: 'Member of the prestigious CFR',
        category: 'career',
        rarity: 'rare',
        dateAchieved: '1995-03-15',
        location: 'New York, USA',
        isPublic: true,
        likes: 0,
      },
      {
        id: 'ach_007',
        title: 'Trilateral Commission',
        description: 'Invited to join the Trilateral Commission',
        category: 'career',
        rarity: 'epic',
        dateAchieved: '2000-06-01',
        location: 'Washington D.C.',
        isPublic: true,
        likes: 0,
      },
      {
        id: 'ach_008',
        title: 'Manhattan Mansion',
        description: 'Acquired one of the largest private residences in Manhattan',
        category: 'career',
        rarity: 'legendary',
        dateAchieved: '1989-01-15',
        location: 'New York, USA',
        isPublic: true,
        likes: 0,
      },
    ],
    stats: {
      total: 8,
      byCategory: {
        adventure: 0,
        travel: 0,
        career: 5,
        social: 1,
        sport: 0,
        creative: 0,
        education: 1,
        humanitarian: 1,
      },
      byRarity: {
        common: 0,
        uncommon: 1,
        rare: 3,
        epic: 2,
        legendary: 2,
      },
      latestUnlock: 'ach_002',
    },
    bucketList: [
      {
        id: 'bucket_001',
        title: 'Establish permanent scientific foundation',
        category: 'education',
        targetDate: '2025-01-01',
        progress: 60,
      },
      {
        id: 'bucket_002',
        title: 'Acquire third Caribbean island',
        category: 'career',
        targetDate: '2022-01-01',
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
        id: 'contact_musk',
        name: 'Elon Musk',
        avatar: '/base/musk.jpeg',
        relationshipType: 'professional',
        tags: ['tech', 'entrepreneur', 'innovation'],
        location: 'Austin, TX',
        phone: '+1 512 555 0001',
        lastInteraction: '2025-12-30',
        interactionCount: 312,
        dunbarPriority: 'inner_circle',
        publicStats: {
          globalPerformance: 98,
          netWorth: 250000000000,
          countriesVisited: 45,
          achievements: 89,
        },
        privateStats: {
          monthlyIncome: 15000000,
          savingsRate: 85,
          currentWeight: 82,
          weeklyActivity: 420,
        },
      },
      {
        id: 'contact_gates',
        name: 'Bill Gates',
        avatar: '/base/gates.jpg',
        relationshipType: 'professional',
        tags: ['tech', 'philanthropy', 'investment'],
        location: 'Seattle, WA',
        phone: '+1 206 555 0002',
        lastInteraction: '2025-12-29',
        interactionCount: 256,
        dunbarPriority: 'inner_circle',
        publicStats: {
          globalPerformance: 96,
          netWorth: 130000000000,
          countriesVisited: 120,
          achievements: 124,
        },
        privateStats: {
          monthlyIncome: 8500000,
          savingsRate: 92,
          currentWeight: 78,
          weeklyActivity: 280,
        },
      },
      {
        id: 'contact_jobs',
        name: 'Steve Jobs',
        avatar: '/base/jobs.jpeg',
        relationshipType: 'professional',
        tags: ['tech', 'design', 'visionary'],
        location: 'Palo Alto, CA',
        phone: '+1 650 555 0003',
        lastInteraction: '2025-12-28',
        interactionCount: 189,
        dunbarPriority: 'inner_circle',
        publicStats: {
          globalPerformance: 99,
          netWorth: 10000000000,
          countriesVisited: 38,
          achievements: 156,
        },
        privateStats: {
          monthlyIncome: 1,
          savingsRate: 99,
          currentWeight: 68,
          weeklyActivity: 180,
        },
      },
      {
        id: 'contact_macron',
        name: 'Emmanuel Macron',
        avatar: '/base/macron.jpeg',
        relationshipType: 'professional',
        tags: ['politics', 'finance', 'diplomacy'],
        location: 'Paris, France',
        phone: '+33 1 42 92 81 00',
        lastInteraction: '2025-12-27',
        interactionCount: 145,
        dunbarPriority: 'inner_circle',
        publicStats: {
          globalPerformance: 92,
          netWorth: 8000000,
          countriesVisited: 95,
          achievements: 67,
        },
        privateStats: {
          monthlyIncome: 15000,
          savingsRate: 45,
          currentWeight: 74,
          weeklyActivity: 320,
        },
      },
      {
        id: 'contact_mehdi',
        name: 'Mehdi',
        avatar: '/base/mehdi.jpg',
        relationshipType: 'close_friend',
        tags: ['ami', 'tech', 'startup'],
        location: 'Paris, France',
        phone: '+33 6 12 34 56 78',
        lastInteraction: '2025-12-30',
        interactionCount: 456,
        dunbarPriority: 'inner_circle',
        publicStats: {
          globalPerformance: 88,
          netWorth: 2500000,
          countriesVisited: 28,
          achievements: 34,
        },
        privateStats: {
          monthlyIncome: 18000,
          savingsRate: 55,
          currentWeight: 76,
          weeklyActivity: 380,
        },
      },
      {
        id: 'contact_karp',
        name: 'Alex Karp',
        avatar: '/base/karp.jpg',
        relationshipType: 'professional',
        tags: ['tech', 'data', 'defense'],
        location: 'Denver, CO',
        phone: '+1 303 555 0006',
        lastInteraction: '2025-12-26',
        interactionCount: 123,
        dunbarPriority: 'inner_circle',
        publicStats: {
          globalPerformance: 94,
          netWorth: 2800000000,
          countriesVisited: 52,
          achievements: 45,
        },
        privateStats: {
          monthlyIncome: 1200000,
          savingsRate: 78,
          currentWeight: 72,
          weeklyActivity: 450,
        },
      },
      {
        id: 'contact_pichai',
        name: 'Sundar Pichai',
        avatar: '/base/pichai.jpg',
        relationshipType: 'professional',
        tags: ['tech', 'ai', 'leadership'],
        location: 'Mountain View, CA',
        phone: '+1 650 555 0007',
        lastInteraction: '2025-12-25',
        interactionCount: 167,
        dunbarPriority: 'inner_circle',
        publicStats: {
          globalPerformance: 95,
          netWorth: 1400000000,
          countriesVisited: 68,
          achievements: 78,
        },
        privateStats: {
          monthlyIncome: 2000000,
          savingsRate: 82,
          currentWeight: 70,
          weeklyActivity: 260,
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

  // ==========================================================================
  // MODULE F : HARMONY (Alignement & Guide IA)
  // ==========================================================================
  harmony: {
    // Objectifs personnels par dimension
    objectives: [
      // === Santé ===
      {
        id: 'obj_health_1',
        dimension: 'health',
        title: 'Improve sleep quality',
        description: 'Get more than 6 hours of quality sleep',
        target: 7,
        current: 5.5,
        unit: 'h',
        priority: 'high',
        deadline: '2020-01-01',
      },
      {
        id: 'obj_health_2',
        dimension: 'health',
        title: 'Reduce stress levels',
        description: 'Lower cortisol through meditation',
        target: 30,
        current: 85,
        unit: 'stress',
        priority: 'high',
        deadline: null,
      },
      {
        id: 'obj_health_3',
        dimension: 'health',
        title: 'Increase weekly activity',
        description: 'More structured exercise routine',
        target: 300,
        current: 155,
        unit: 'min',
        priority: 'medium',
        deadline: null,
      },

      // === Finance ===
      {
        id: 'obj_finance_1',
        dimension: 'finance',
        title: '$1B net worth',
        description: 'Achieve billionaire status',
        target: 1000000000,
        current: 707780000,
        unit: '$',
        priority: 'high',
        deadline: '2025-01-01',
      },
      {
        id: 'obj_finance_2',
        dimension: 'finance',
        title: 'Diversify offshore',
        description: 'Increase offshore holdings',
        target: 200000000,
        current: 125000000,
        unit: '$',
        priority: 'medium',
        deadline: null,
      },

      // === Social ===
      {
        id: 'obj_social_1',
        dimension: 'social',
        title: 'Rebuild reputation',
        description: 'Improve public image through philanthropy',
        target: 100,
        current: 15,
        unit: '%',
        priority: 'high',
        deadline: null,
      },

      // === Carrière ===
      {
        id: 'obj_career_1',
        dimension: 'career',
        title: 'Expand foundation',
        description: 'Grow scientific philanthropy network',
        target: 100,
        current: 65,
        unit: '%',
        priority: 'medium',
        deadline: '2022-01-01',
      },

      // === Monde / Exploration ===
      {
        id: 'obj_world_1',
        dimension: 'world',
        title: 'Visit 50 countries',
        description: 'Expand global footprint',
        target: 50,
        current: 12,
        unit: 'countries',
        priority: 'low',
        deadline: '2030-01-01',
      },
    ],

    // Poids de chaque dimension dans le score global
    dimensionWeights: {
      health: 0.15,
      finance: 0.35,
      social: 0.20,
      career: 0.15,
      world: 0.15,
    },

    // Score d'alignement actuel (calculé)
    currentScore: 45,

    // Dernière mise à jour
    lastUpdated: '2019-08-09',

    // Insight IA (mock pour MVP)
    aiInsight: 'Your financial position is extremely strong at $708M net worth. However, health metrics are concerning - sleep quality is very poor at 48%. Social reputation score is critically low. Consider focusing on stress reduction and public relations.',

    // Historique des scores
    history: [
      { date: '2019-07-01', score: 52 },
      { date: '2019-07-08', score: 50 },
      { date: '2019-07-15', score: 48 },
      { date: '2019-07-22', score: 46 },
      { date: '2019-07-29', score: 44 },
      { date: '2019-08-05', score: 45 },
    ],
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
  avatar?: string;
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

// Modules for HomeView - Default values (0%), actual data comes from hooks
export const modules: Module[] = [
  {
    id: 'A',
    title: 'Santé',
    percentage: 0, // Populated from useHealthData
    subtitle: 'Aucune donnée',
    detailSubtitle: 'Analyse santé complète',
    color: '#8BA888',
    icon: 'fa-solid fa-heart-pulse',
  },
  {
    id: 'D',
    title: 'Carrière',
    percentage: 0, // Populated from profile/financial data
    subtitle: 'Aucune donnée',
    detailSubtitle: 'Objectifs professionnels',
    color: '#C9A962',
    icon: 'fa-solid fa-briefcase',
  },
  {
    id: 'E',
    title: 'Social',
    percentage: 0, // Populated from useSocialData
    subtitle: 'Aucune donnée',
    detailSubtitle: 'Votre réseau social',
    color: '#D4A5A5',
    icon: 'fa-solid fa-users',
  },
  {
    id: 'B',
    title: 'Monde',
    percentage: 0, // Populated from useTravelData
    subtitle: 'Aucune donnée',
    detailSubtitle: 'Votre exploration du monde',
    color: '#A5C4D4',
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
  connections: 847, // His known contacts from flight logs
  avatar: ThomasMorel.identity.avatar,
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
    valueColor: '#ef4444',
    progress: ThomasMorel.moduleA.currentStats.averageSleepQuality,
    progressColor: '#ef4444',
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
    valueColor: '#f59e0b',
    progress: Math.min(100, Math.round((ThomasMorel.moduleA.currentStats.dailySteps / 10000) * 100)),
    progressColor: '#f59e0b',
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
    valueColor: '#ef4444',
    progress: Math.min(100, Math.round((ThomasMorel.moduleA.currentStats.hrv / 100) * 100)),
    progressColor: '#ef4444',
    detailSubtitle: 'Heart rate variability',
  },
  {
    id: 'hydration',
    icon: 'fa-solid fa-droplet',
    label: 'Hydration',
    value: `${ThomasMorel.moduleA.nutrition[0]?.waterIntake || 0}L`,
    valueColor: '#f59e0b',
    progress: Math.min(100, Math.round(((ThomasMorel.moduleA.nutrition[0]?.waterIntake || 0) / 3) * 100)),
    progressColor: '#f59e0b',
    detailSubtitle: 'Water intake today',
  },
];

// AI Analysis for PhysioView
export const aiAnalysis = {
  title: 'AI Analysis',
  message: 'Health metrics need significant improvement. Sleep quality is poor and activity levels are below recommended. Consider stress management and regular exercise routine.',
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
  missingSkill: 'Public Relations',
  netWorth: `$${Math.round(ThomasMorel.moduleC.patrimoine.netWorth / 1000000)}M`,
  annualIncome: `$${Math.round(ThomasMorel.moduleC.revenus.totalNetAnnual / 1000000)}M`,
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

// Contacts for SocialView - Include all Rank 1 contacts from moduleE
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
    fi: { width: 95, text: 'Top 5%' },
    sp: { width: 25, text: 'Top 75%' },
    sl: { width: 20, text: 'Top 80%' },
  },
  country: {
    fi: { width: 99, text: 'Top 1%' },
    sp: { width: 35, text: 'Top 65%' },
    sl: { width: 30, text: 'Top 70%' },
  },
  world: {
    fi: { width: 99, text: 'Top 1%' },
    sp: { width: 45, text: 'Top 55%' },
    sl: { width: 40, text: 'Top 60%' },
  },
};

// Configuration par défaut du pinning
export const defaultPinConfig = {
  pinnedModuleId: ThomasMorel.identity.pinnedModule || 'C',
  moduleOrder: ['C', 'B', 'A', 'D', 'E'], // C (Finance) first as pinned
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

// ============================================================================
// USER GOALS for AI Harmony Score Calculation
// ============================================================================

export const userGoals = {
  health: {
    target_weight: 75, // kg - Jeffrey's ideal weight
    sleep_hours: 8, // hours per night
    weekly_activity_minutes: 200, // minutes of exercise
    description: 'Maintain optimal health for longevity and performance',
  },
  finance: {
    net_worth_target: 1000000000, // $1B target
    monthly_savings: 5000000, // $5M monthly
    debt_free_date: undefined, // Already debt-free
    description: 'Expand wealth empire and influence',
  },
  social: {
    close_friends_count: 50, // VIP network
    weekly_interactions: 20, // High social activity
    network_size: 'extensive' as const,
    description: 'Maintain elite social network',
  },
  growth: {
    countries_to_visit: 100, // Global presence
    skills_to_learn: ['philanthropy', 'scientific patronage'],
    career_milestone: 'Become leading philanthropist',
    description: 'Leave lasting legacy through science funding',
  },
};

