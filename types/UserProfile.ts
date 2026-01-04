// ============================================================================
// STATS - UserProfile Interface
// Version: 1.0 | Conforme au PRD Section 2
// ============================================================================

// ============================================================================
// MODULE A : PHYSIOLOGIQUE (Le Corps)
// ============================================================================

export interface SleepRecord {
  date: string; // ISO date format
  duration: number; // in minutes
  quality: 'poor' | 'fair' | 'good' | 'excellent';
  deepSleepMinutes: number;
  remSleepMinutes: number;
  awakenings: number;
}

export interface SportSession {
  date: string;
  duration: number; // in minutes
  type: 'running' | 'cycling' | 'swimming' | 'gym' | 'yoga' | 'hiit' | 'walking' | 'climbing' | 'other';
  caloriesBurned: number;
  intensity: 'low' | 'moderate' | 'high' | 'extreme';
  notes?: string;
}

export interface BodyMeasurements {
  date: string;
  height: number; // in cm
  weight: number; // in kg
  bodyFatPercentage?: number;
  muscleMass?: number; // in kg
  waistCircumference?: number; // in cm
  vo2Max?: number;
  restingHeartRate?: number; // bpm
}

export interface NutritionDay {
  date: string;
  calories: number;
  protein: number; // in grams
  carbs: number; // in grams
  fat: number; // in grams
  waterIntake: number; // in liters
  meals: number;
  fasting?: boolean;
}

export interface ModuleA_Physiologique {
  sleep: SleepRecord[];
  sport: SportSession[];
  measurements: BodyMeasurements[];
  nutrition: NutritionDay[];
  currentStats: {
    averageSleepQuality: number; // 0-100
    weeklyActivityMinutes: number;
    currentWeight: number;
    hrv: number; // Heart Rate Variability in ms
    dailySteps: number;
  };
}

// ============================================================================
// MODULE B : CARTE D'EXPLORATION (Le Monde)
// ============================================================================

export type TransportType =
  | 'plane'
  | 'train'
  | 'car'
  | 'bus'
  | 'boat'
  | 'motorcycle'
  | 'bicycle'
  | 'walking'
  | 'other';

export interface VisitedRegion {
  name: string;
  exploredPercentage: number; // 0-100
  firstVisit: string; // ISO date
  lastVisit: string; // ISO date
  totalDaysSpent: number;
}

export interface VisitedCountry {
  code: string; // ISO 3166-1 alpha-2 (e.g., "FR", "US")
  name: string;
  regions: VisitedRegion[];
  firstVisit: string; // ISO date
  lastVisit: string; // ISO date
  totalDaysSpent: number;
  visitCount: number;
  isHomeCountry: boolean;
}

export interface Trip {
  id: string;
  destination: {
    country: string; // country code
    city: string;
    coordinates: [number, number]; // [lat, lng]
  };
  startDate: string;
  endDate: string;
  duration: number; // in days
  purpose: 'leisure' | 'work' | 'family' | 'education' | 'medical' | 'other';
  transport: TransportType;
  distanceKm: number;
  notes?: string;
}

export interface ModuleB_Exploration {
  countriesVisited: VisitedCountry[];
  trips: Trip[];
  stats: {
    totalCountries: number;
    totalRegions: number;
    totalDistanceKm: number;
    totalDaysAbroad: number;
    mostUsedTransport: TransportType;
    currentYear: {
      distanceKm: number;
      countriesVisited: number;
      trips: number;
    };
  };
  status: 'sedentary' | 'traveler' | 'nomad' | 'digital_nomad' | 'explorer';
  homeBase: {
    country: string;
    city: string;
    coordinates: [number, number];
  };
}

// ============================================================================
// MODULE C : PROFESSIONNEL & PATRIMOINE (La Réussite)
// ============================================================================

// --- FLUX (Revenus) ---
export interface IncomeSource {
  type: 'salary' | 'freelance' | 'business' | 'investments' | 'rental' | 'dividends' | 'other';
  name: string;
  grossAnnual: number; // in EUR
  netAnnual: number; // in EUR
  frequency: 'monthly' | 'quarterly' | 'annual' | 'irregular';
  isActive: boolean;
  startDate: string;
}

export interface Revenus_Flux {
  sources: IncomeSource[];
  totalGrossAnnual: number;
  totalNetAnnual: number;
  monthlyNetAverage: number;
  currency: string;
  taxRate: number; // percentage
  savingsRate: number; // percentage of income saved
}

// --- STOCK (Patrimoine/Assets) ---
export interface RealEstateAsset {
  id: string;
  type: 'house' | 'apartment' | 'land' | 'commercial' | 'parking';
  location: string;
  purchaseDate: string;
  purchasePrice: number;
  currentValue: number;
  mortgageRemaining?: number;
  monthlyRentalIncome?: number;
  isMainResidence: boolean;
}

export interface VehicleAsset {
  id: string;
  type: 'car' | 'motorcycle' | 'boat' | 'plane' | 'other';
  brand: string;
  model: string;
  year: number;
  purchasePrice: number;
  currentValue: number;
  isFinanced: boolean;
  remainingDebt?: number;
}

export interface FinancialAsset {
  id: string;
  type: 'stocks' | 'bonds' | 'crypto' | 'etf' | 'savings' | 'retirement' | 'cash' | 'other';
  name: string;
  institution?: string;
  currentValue: number;
  purchaseValue?: number;
  returnPercentage?: number;
}

export interface Liability {
  id: string;
  type: 'mortgage' | 'car_loan' | 'student_loan' | 'personal_loan' | 'credit_card' | 'other';
  name: string;
  originalAmount: number;
  remainingAmount: number;
  interestRate: number;
  monthlyPayment: number;
  endDate: string;
}

export interface Patrimoine_Stock {
  realEstate: RealEstateAsset[];
  vehicles: VehicleAsset[];
  financialAssets: FinancialAsset[];
  liabilities: Liability[];
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  liquidAssets: number; // easily accessible cash
}

export interface CareerInfo {
  currentPosition: string;
  company: string;
  industry: string;
  yearsInCurrentRole: number;
  totalYearsExperience: number;
  skills: string[];
  longTermGoal: string;
  aspirationRole?: string;
  aspirationProbability?: number; // 0-100
}

export interface ModuleC_Professionnel {
  career: CareerInfo;
  revenus: Revenus_Flux; // FLUX
  patrimoine: Patrimoine_Stock; // STOCK
}

// ============================================================================
// MODULE D : L'EXTRAORDINAIRE (Achievements)
// ============================================================================

export type AchievementCategory =
  | 'adventure'
  | 'travel'
  | 'career'
  | 'social'
  | 'sport'
  | 'creative'
  | 'education'
  | 'humanitarian';

export type AchievementRarity =
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'epic'
  | 'legendary';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  dateAchieved: string;
  location?: string;
  proof?: string; // URL to photo/document
  witnesses?: string[]; // userIds who can verify
  isPublic: boolean;
  likes?: number;
}

export interface ModuleD_Extraordinaire {
  achievements: Achievement[];
  stats: {
    total: number;
    byCategory: Record<AchievementCategory, number>;
    byRarity: Record<AchievementRarity, number>;
    latestUnlock: string; // achievement id
  };
  bucketList: {
    id: string;
    title: string;
    category: AchievementCategory;
    targetDate?: string;
    progress: number; // 0-100
  }[];
}

// ============================================================================
// MODULE E : SOCIAL (Le Lien)
// ============================================================================

export type RelationshipType =
  | 'family'
  | 'close_friend'
  | 'friend'
  | 'colleague'
  | 'acquaintance'
  | 'professional';

export interface Contact {
  id: string;
  name: string;
  avatar?: string;
  relationshipType: RelationshipType;
  tags: string[]; // e.g., "investor", "designer", "mentor"
  location?: string;
  phone?: string; // Phone number for calling
  lastInteraction: string; // ISO date
  interactionCount: number;
  dunbarPriority: 'inner_circle' | 'sympathy' | 'acquaintances' | 'recognized';
  notes?: string;
  publicStats?: {
    globalPerformance: number;
    netWorth: number;
    countriesVisited: number;
    achievements: number;
  };
  privateStats?: {
    monthlyIncome: number;
    savingsRate: number;
    currentWeight: number;
    weeklyActivity: number;
  };
}

export interface SocialInteraction {
  id: string;
  contactId: string;
  date: string;
  type: 'in_person' | 'video_call' | 'phone' | 'message' | 'social_media';
  duration?: number; // in minutes
  location?: string;
  quality: 'poor' | 'neutral' | 'good' | 'great';
  notes?: string;
}

export interface DunbarCircle {
  innerCircle: number; // ~5 closest
  sympathyGroup: number; // ~15 close friends/family
  acquaintances: number; // ~50 friends
  recognized: number; // ~150 known people
}

export interface ModuleE_Social {
  contacts: Contact[];
  interactions: SocialInteraction[];
  dunbarNumbers: DunbarCircle;
  stats: {
    totalContacts: number;
    activeThisMonth: number;
    neglectedContacts: Contact[]; // not contacted in 3+ months
    averageInteractionsPerWeek: number;
    socialScore: number; // 0-100
  };
  recommendations: {
    contactId: string;
    contactName: string;
    reason: string;
    urgency: 'low' | 'medium' | 'high';
  }[];
}

// ============================================================================
// GLOBAL USER PROFILE
// ============================================================================

export interface UserIdentity {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  avatar: string;
  dateOfBirth: string;
  nationality: string;
  bio?: string;
  joinedDate: string;
  lastActive: string;
  isVerified: boolean;
  pinnedModule: 'A' | 'B' | 'C' | 'D' | 'E'; // Pinning System from PRD
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  currency: string;
  units: 'metric' | 'imperial';
  privacy: {
    moduleA: 'public' | 'friends' | 'private';
    moduleB: 'public' | 'friends' | 'private';
    moduleC: 'public' | 'friends' | 'private';
    moduleD: 'public' | 'friends' | 'private';
    moduleE: 'public' | 'friends' | 'private';
  };
  notifications: {
    email: boolean;
    push: boolean;
    dunbarReminders: boolean;
  };
}

export interface GlobalPerformance {
  overall: number; // 0-100
  byModule: {
    A: number;
    B: number;
    C: number;
    D: number;
    E: number;
  };
  weekNumber: number;
  year: number;
}

// ============================================================================
// MAIN INTERFACE: UserProfile
// ============================================================================

export interface UserProfile {
  identity: UserIdentity;
  settings: UserSettings;
  performance: GlobalPerformance;

  // Les 5 modules du PRD Section 2
  moduleA: ModuleA_Physiologique;
  moduleB: ModuleB_Exploration;
  moduleC: ModuleC_Professionnel;
  moduleD: ModuleD_Extraordinaire;
  moduleE: ModuleE_Social;
}

