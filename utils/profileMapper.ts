import { ProfileData } from '@/hooks/useProfileData'
import { HealthData } from '@/hooks/useHealthData'
import { SocialData } from '@/hooks/useSocialData'
import { TravelData } from '@/hooks/useTravelData'
import { UserProfile, ModuleA_Physiologique, ModuleB_Exploration, ModuleC_Professionnel, ModuleD_Extraordinaire, ModuleE_Social, GlobalPerformance, UserIdentity, UserSettings } from '@/types/UserProfile'
import { ThomasMorel } from '@/data/mockData'

/**
 * Maps disparate React Hook data into a unified UserProfile object
 * compatible with the Harmony AI service.
 */
export function mapHooksToUserProfile(
    profile: ProfileData,
    health?: HealthData,
    social?: SocialData,
    travel?: TravelData
): UserProfile {

    // 1. Identity & Settings
    const identity: UserIdentity = {
        id: profile.id,
        firstName: profile.firstName,
        lastName: profile.lastName,
        displayName: profile.username,
        email: '', // Not available in profile hook
        avatar: profile.avatarUrl,
        dateOfBirth: profile.dateOfBirth || '',
        nationality: profile.nationality || '',
        joinedDate: profile.createdAt || new Date().toISOString(),
        lastActive: new Date().toISOString(),
        isVerified: true,
        pinnedModule: (profile.pinnedModule as any) || 'A',
    }

    const settings: UserSettings = {
        theme: 'auto',
        language: 'fr',
        currency: profile.currency,
        units: profile.unitsPreference as 'metric' | 'imperial',
        privacy: {
            moduleA: 'private',
            moduleB: 'friends',
            moduleC: 'private',
            moduleD: 'public',
            moduleE: 'friends'
        },
        notifications: { email: true, push: true, dunbarReminders: true }
    }

    // 2. Module A: Physiologique
    const moduleA: ModuleA_Physiologique = {
        sleep: health?.sleepRecords.map(s => ({
            date: s.date,
            duration: s.duration,
            quality: s.quality,
            deepSleepMinutes: s.deep_sleep_minutes || 0,
            remSleepMinutes: s.rem_sleep_minutes || 0,
            awakenings: s.awakenings || 0
        })) || [],
        sport: health?.sportSessions.map(s => ({
            date: s.date,
            duration: s.duration,
            type: s.type as any, // Cast to union if needed, or string
            caloriesBurned: s.calories_burned || 200,
            intensity: s.intensity,
            notes: ''
        })) || [],
        measurements: health?.bodyMeasurements.map(m => ({
            date: m.date,
            height: profile.height || 170, // Height is in profile
            weight: m.weight || profile.weight || 70,
            bodyFatPercentage: m.body_fat_percentage,
            muscleMass: m.muscle_mass,
            waistCircumference: 0,
            vo2Max: m.vo2_max,
            restingHeartRate: m.resting_heart_rate
        })) || [],
        nutrition: health?.nutritionLogs.map(n => ({
            date: n.date,
            calories: n.calories || 2000,
            protein: n.protein || 0,
            carbs: n.carbs || 0,
            fat: n.fat || 0,
            waterIntake: n.water_intake || 0,
            meals: 3 // Default
        })) || [],
        currentStats: {
            averageSleepQuality: 75,
            weeklyActivityMinutes: health?.sportSessions.reduce((acc, curr) => acc + curr.duration, 0) || 0,
            currentWeight: profile.weight || 70,
            hrv: 50,
            dailySteps: 5000
        }
    }

    // 3. Module B: Exploration
    const moduleB: ModuleB_Exploration = {
        countriesVisited: travel?.countries.map(c => ({
            code: c.country_code,
            name: c.country_name,
            regions: [],
            firstVisit: c.first_visit_year?.toString() || '',
            lastVisit: c.last_visit_year?.toString() || '',
            totalDaysSpent: 0,
            visitCount: c.visit_count,
            isHomeCountry: c.country_code === profile.homeCountry
        })) || [],
        trips: travel?.trips.map(t => ({
            id: t.id,
            destination: { country: t.country_code, city: t.city_name || '', coordinates: [0, 0] },
            startDate: `${t.year}-01-01`,
            endDate: `${t.year}-01-07`,
            duration: 7,
            purpose: 'leisure',
            transport: 'plane',
            distanceKm: 0,
            notes: t.description
        })) || [],
        stats: {
            totalCountries: travel?.totalCountries || 0,
            totalRegions: 0,
            totalDistanceKm: travel?.totalDistanceKm || 0,
            totalDaysAbroad: 0,
            mostUsedTransport: 'plane',
            currentYear: { distanceKm: 0, countriesVisited: 0, trips: 0 }
        },
        status: 'traveler',
        homeBase: { country: profile.homeCountry || 'France', city: '', coordinates: [0, 0] }
    }

    // 4. Module C: Professionnel
    const moduleC: ModuleC_Professionnel = {
        career: {
            currentPosition: profile.jobTitle || '',
            company: profile.company || '',
            industry: profile.industry || '',
            yearsInCurrentRole: 1,
            totalYearsExperience: profile.experienceYears || 0,
            skills: [],
            longTermGoal: ''
        },
        revenus: {
            sources: [],
            totalGrossAnnual: profile.annualIncome || 0,
            totalNetAnnual: (profile.annualIncome || 0) * 0.75, // Estimate
            monthlyNetAverage: ((profile.annualIncome || 0) * 0.75) / 12,
            currency: profile.currency,
            taxRate: 25,
            savingsRate: profile.savingsRate || 0
        },
        patrimoine: {
            realEstate: [],
            vehicles: [],
            financialAssets: [],
            liabilities: [],
            totalAssets: profile.netWorthEstimate || 0,
            totalLiabilities: 0,
            netWorth: profile.netWorthEstimate || 0,
            liquidAssets: (profile.netWorthEstimate || 0) * 0.1 // Estimate
        }
    }

    // 5. Module D: Extraordinaire (Mocked for now as no hook)
    const moduleD: ModuleD_Extraordinaire = ThomasMorel.moduleD // usage of mock for D

    // 6. Module E: Social
    const moduleE: ModuleE_Social = {
        contacts: social?.friends.map(f => ({
            id: f.friend_id,
            name: `${f.profile?.first_name} ${f.profile?.last_name}`,
            avatar: f.profile?.avatar_url,
            relationshipType: f.rank === 'cercle_proche' ? 'close_friend' : 'friend',
            tags: [],
            lastInteraction: new Date().toISOString(),
            interactionCount: 0,
            dunbarPriority: f.rank === 'cercle_proche' ? 'inner_circle' : 'acquaintances'
        })) || [],
        interactions: [],
        dunbarNumbers: { innerCircle: social?.innerCircleFriends.length || 0, sympathyGroup: 0, acquaintances: 0, recognized: 0 },
        stats: {
            totalContacts: social?.friendCount || 0,
            activeThisMonth: 0,
            neglectedContacts: [],
            averageInteractionsPerWeek: 0,
            socialScore: 50
        },
        recommendations: []
    }

    // 7. Performance & Harmony
    const performance: GlobalPerformance = {
        overall: profile.harmonyScore,
        byModule: { A: 0, B: 0, C: 0, D: 0, E: 0 },
        weekNumber: 1,
        year: new Date().getFullYear()
    }

    return {
        identity,
        settings,
        performance,
        moduleA,
        moduleB,
        moduleC,
        moduleD,
        moduleE,
        harmony: {
            currentScore: profile.harmonyScore,
            history: [],
            objectives: [],
            dimensionWeights: { health: 1, finance: 1, social: 1, career: 1, world: 1 },
            lastUpdated: new Date().toISOString()
        }
    }
}
