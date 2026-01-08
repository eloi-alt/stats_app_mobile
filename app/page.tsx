'use client'

import { useState, useEffect, useCallback, useMemo, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useProfileData } from '@/hooks/useProfileData'
import { useHealthData } from '@/hooks/useHealthData'
import { useTravelData } from '@/hooks/useTravelData'
import { useSocialData } from '@/hooks/useSocialData'
import { supabase } from '@/utils/supabase/client'
import TabBar from '@/components/TabBar'
import HomeView from '@/components/Views/HomeView'
import PhysioView from '@/components/Views/PhysioView'
import SocialView from '@/components/Views/SocialView'
import MapView from '@/components/Views/MapView'
import ProView from '@/components/Views/ProView'
import ProfileView from '@/components/Views/ProfileView'
import SettingsView from '@/components/Views/SettingsView'
import ViewSheet from '@/components/UI/ViewSheet'
import ProfileDataGate from '@/components/UI/ProfileDataGate'
import AssetsModal from '@/components/Modals/AssetsModal'
import ObjectiveModal from '@/components/Modals/ObjectiveModal'
import BodyDataEntryModal from '@/components/Modals/BodyDataEntryModal'
import {
  modules,
  careerInfo,
  contacts,
  comparisonData,
  aiAnalysis,
  defaultPinConfig,
  type Module,
  type HomeUserProfile,
  type PhysioMetric
} from '@/data/mockData'

const PINNED_MODULE_KEY = 'statsapp_pinned_module'
const MODULE_ORDER_KEY = 'statsapp_module_order'

import IPhoneWrapper from '@/components/IPhoneWrapper'


function HomeContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const profileData = useProfileData() // Get profile from Supabase
  const healthData = useHealthData() // Get health data based on auth state
  const travelData = useTravelData() // Get travel data (countries, trips)
  const socialData = useSocialData() // Get social data (friends)
  const [isLoading, setIsLoading] = useState(true)
  const [activeView, setActiveView] = useState('view-home')
  const [initialContactName, setInitialContactName] = useState<string | null>(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [showPhysioDataModal, setShowPhysioDataModal] = useState(false)

  // Create dynamic physioMetrics based on auth state
  // For authenticated users: compute from healthData and profileData
  const physioMetrics: PhysioMetric[] = useMemo(() => {
    // If still loading or no health data yet, return empty array
    if (healthData.isDemo || healthData.isLoading) {
      return []
    }

    // For authenticated users, build metrics from their actual data
    const latestSleep = healthData.sleepRecords[0]
    const latestNutrition = healthData.nutritionLogs[0]
    const latestBody = healthData.bodyMeasurements[0]

    // Calculate weekly activity from sport sessions
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const recentSport = healthData.sportSessions.filter(s => s.date >= lastWeek)
    const weeklyActivity = recentSport.reduce((sum, s) => sum + s.duration, 0)

    // Default values for new users
    const weight = latestBody?.weight || profileData.profile?.weight || 0
    const sleepDuration = latestSleep?.duration || 0
    const sleepHours = Math.floor(sleepDuration / 60)
    const sleepMins = sleepDuration % 60
    const waterIntake = latestNutrition?.water_intake || 0

    return [
      {
        id: 'sleep',
        icon: 'fa-solid fa-moon',
        label: 'Sleep',
        value: sleepDuration > 0 ? `${sleepHours}h${sleepMins}` : '--',
        valueColor: '#ef4444',
        progress: 0,
        progressColor: '#ef4444',
        detailSubtitle: 'Sleep quality this week',
      },
      {
        id: 'activity',
        icon: 'fa-solid fa-person-running',
        label: 'Activity',
        value: weeklyActivity > 0 ? `${weeklyActivity} min` : '--',
        valueColor: '#f59e0b',
        progress: Math.min(100, Math.round((weeklyActivity / 300) * 100)),
        progressColor: '#f59e0b',
        detailSubtitle: 'Activity minutes this week',
      },
      {
        id: 'steps',
        icon: 'fa-solid fa-shoe-prints',
        label: 'Steps',
        value: '--', // TODO: Add steps tracking
        valueColor: '#f59e0b',
        progress: 0,
        progressColor: '#f59e0b',
        detailSubtitle: 'Steps today',
      },
      {
        id: 'weight',
        icon: 'fa-solid fa-weight-scale',
        label: 'Weight',
        value: weight > 0 ? `${weight} kg` : '--',
        valueColor: '#8b5cf6',
        progress: 100,
        progressColor: '#8b5cf6',
        detailSubtitle: 'Current weight',
      },
      {
        id: 'hrv',
        icon: 'fa-solid fa-heart-pulse',
        label: 'HRV',
        value: latestBody?.resting_heart_rate ? `${latestBody.resting_heart_rate} bpm` : '--',
        valueColor: '#ef4444',
        progress: 0,
        progressColor: '#ef4444',
        detailSubtitle: 'Resting heart rate',
      },
      {
        id: 'hydration',
        icon: 'fa-solid fa-droplet',
        label: 'Hydration',
        value: waterIntake > 0 ? `${waterIntake}L` : '--',
        valueColor: '#f59e0b',
        progress: Math.min(100, Math.round((waterIntake / 3) * 100)),
        progressColor: '#f59e0b',
        detailSubtitle: 'Water intake today',
      },
    ]
  }, [healthData, profileData.profile])

  // Compute the user profile based on auth state
  // For authenticated users: use real profile from Supabase
  // For non-authenticated: use demo profile (shouldn't happen as they should be redirected to landing)
  const userProfile: HomeUserProfile = useMemo(() => {
    const now = new Date()
    const weekNumber = Math.ceil((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000))

    if (profileData.isAuthenticated) {
      if (profileData.profile) {
        // Build user profile from real data
        return {
          name: `${profileData.profile.firstName} ${profileData.profile.lastName}`.trim() || 'User',
          subtitle: profileData.profile.jobTitle || '',
          globalPerformance: 0, // Will be calculated by harmony score
          year: now.getFullYear(),
          week: weekNumber,
          connections: 0, // TODO: Get from social hook
          avatar: profileData.profile.avatarUrl || undefined,
        }
      } else {
        // Authenticated but no profile yet - show basic user info
        return {
          name: 'Nouveau membre',
          subtitle: 'Profil en cours de création...',
          globalPerformance: 0,
          year: now.getFullYear(),
          week: weekNumber,
          connections: 0,
          avatar: undefined,
        }
      }
    }
    // Not authenticated - generic empty profile (shouldn't happen - should redirect to landing)
    return {
      name: 'Chargement...',
      subtitle: '',
      globalPerformance: 0,
      year: new Date().getFullYear(),
      week: 1,
      connections: 0,
      avatar: undefined,
    }
  }, [profileData.isAuthenticated, profileData.profile])

  // Compute dynamic modules based on real Supabase data
  const dynamicModules: Module[] = useMemo(() => {
    // Calculate health percentage (average of available data quality)
    const calculateHealthPercentage = () => {
      if (!healthData.hasAnyData || healthData.isDemo) return 0

      let totalScore = 0
      let metrics = 0

      // Sleep quality score (based on last 7 days average)
      if (healthData.hasSleepData) {
        const avgSleep = healthData.sleepRecords.slice(0, 7)
          .reduce((sum, r) => sum + r.duration, 0) / Math.min(7, healthData.sleepRecords.length)
        // Score: 8h = 100%, scale proportionally
        totalScore += Math.min(100, Math.round((avgSleep / 480) * 100))
        metrics++
      }

      // Activity score (based on weekly activity)
      if (healthData.hasSportData) {
        const weeklyMinutes = healthData.sportSessions
          .filter(s => new Date(s.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
          .reduce((sum, s) => sum + s.duration, 0)
        // Score: 300 min/week = 100%
        totalScore += Math.min(100, Math.round((weeklyMinutes / 300) * 100))
        metrics++
      }

      return metrics > 0 ? Math.round(totalScore / metrics) : 0
    }

    // Calculate travel percentage (% of world explored)
    const calculateTravelPercentage = () => {
      if (!travelData.hasAnyData || travelData.isDemo) return 0
      return Math.round((travelData.totalCountries / 195) * 100)
    }

    // Calculate social percentage (based on connection count)
    const calculateSocialPercentage = () => {
      if (!socialData.hasAnyFriends || socialData.isDemo) return 0
      // Score: 50 friends = 100% (Dunbar's inner circle)
      return Math.min(100, Math.round((socialData.friendCount / 50) * 100))
    }

    // Calculate career percentage (from profile completeness)
    const calculateCareerPercentage = () => {
      if (!profileData.profile) return 0
      let score = 0
      if (profileData.profile.jobTitle) score += 50
      if (profileData.profile.company) score += 50
      return score
    }

    const healthPct = calculateHealthPercentage()
    const travelPct = calculateTravelPercentage()
    const socialPct = calculateSocialPercentage()
    const careerPct = calculateCareerPercentage()

    return [
      {
        id: 'A',
        title: 'Santé',
        percentage: healthPct,
        subtitle: healthData.hasAnyData && !healthData.isDemo
          ? `${healthData.sleepRecords.length + healthData.sportSessions.length} entrées`
          : 'Aucune donnée',
        detailSubtitle: 'Analyse santé complète',
        color: '#8BA888',
        icon: 'fa-solid fa-heart-pulse',
      },
      {
        id: 'D',
        title: 'Carrière',
        percentage: careerPct,
        subtitle: profileData.profile?.jobTitle || 'Aucune donnée',
        detailSubtitle: 'Objectifs professionnels',
        color: '#C9A962',
        icon: 'fa-solid fa-briefcase',
      },
      {
        id: 'E',
        title: 'Social',
        percentage: socialPct,
        subtitle: socialData.hasAnyFriends && !socialData.isDemo
          ? `${socialData.friendCount} connexions`
          : 'Aucune donnée',
        detailSubtitle: 'Votre réseau social',
        color: '#D4A5A5',
        icon: 'fa-solid fa-users',
      },
      {
        id: 'B',
        title: 'Monde',
        percentage: travelPct,
        subtitle: travelData.hasAnyData && !travelData.isDemo
          ? `${travelData.totalCountries} pays visités`
          : 'Aucune donnée',
        detailSubtitle: 'Votre exploration du monde',
        color: '#A5C4D4',
        icon: 'fa-solid fa-globe',
      },
    ]
  }, [healthData, travelData, socialData, profileData.profile])

  console.log('[HomeContent] Auth:', profileData.isAuthenticated ? 'YES' : 'NO', 'Loading:', profileData.isLoading, 'Profile:', userProfile.name)


  // Check authentication on mount - ALWAYS redirect to landing if not authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      // No session = redirect to landing (authentication required)
      if (!session) {
        router.push('/landing')
        return
      }

      // Check if profile exists and onboarding completed
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', session.user.id)
        .single()

      // If profile exists but onboarding not completed, redirect to onboarding
      if (profile && !profile.onboarding_completed) {
        router.push('/onboarding')
        return
      }

      // If no profile exists, also redirect to onboarding to create one
      if (!profile) {
        router.push('/onboarding')
        return
      }

      setIsLoading(false)
    }

    checkAuth()
  }, [router])

  useEffect(() => {
    const viewParam = searchParams.get('view')
    const contactNameParam = searchParams.get('contactName')

    if (viewParam) {
      setActiveView(viewParam)
    } else {
      setActiveView('view-home')
    }

    if (contactNameParam && (viewParam === 'view-social' || !viewParam)) {
      setInitialContactName(contactNameParam)
      if (!viewParam) {
        setActiveView('view-social')
      }
    }
  }, [searchParams])

  const [assetsModalOpen, setAssetsModalOpen] = useState(false)
  const [objectiveModalOpen, setObjectiveModalOpen] = useState(false)
  const [objectiveData, setObjectiveData] = useState({
    title: '',
    value: '',
    subtitle: '',
    color: '',
  })

  const [pinnedModuleId, setPinnedModuleId] = useState<string>(defaultPinConfig.pinnedModuleId)
  const [moduleOrder, setModuleOrder] = useState<string[]>(defaultPinConfig.moduleOrder)
  const [isReorderMode, setIsReorderMode] = useState(false)
  const [isMapFullscreen, setIsMapFullscreen] = useState(false)

  useEffect(() => {
    const savedPinnedModule = localStorage.getItem(PINNED_MODULE_KEY)
    const savedModuleOrder = localStorage.getItem(MODULE_ORDER_KEY)

    if (savedPinnedModule) {
      setPinnedModuleId(savedPinnedModule)
    }

    if (savedModuleOrder) {
      try {
        const parsedOrder = JSON.parse(savedModuleOrder)
        if (Array.isArray(parsedOrder)) {
          setModuleOrder(parsedOrder)
        }
      } catch (e) {
        console.error('Erreur lors du chargement de l\'ordre des modules:', e)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(PINNED_MODULE_KEY, pinnedModuleId)
  }, [pinnedModuleId])

  useEffect(() => {
    localStorage.setItem(MODULE_ORDER_KEY, JSON.stringify(moduleOrder))
  }, [moduleOrder])

  const handlePinModule = useCallback((moduleId: string) => {
    setPinnedModuleId(moduleId)
    setModuleOrder(prev => {
      const newOrder = prev.filter(id => id !== moduleId)
      return [moduleId, ...newOrder]
    })
  }, [])

  const handleMoveUp = useCallback((moduleId: string) => {
    setModuleOrder(prev => {
      const index = prev.indexOf(moduleId)
      if (index <= 0) return prev
      const newOrder = [...prev]
        ;[newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]]
      return newOrder
    })
  }, [])

  const handleMoveDown = useCallback((moduleId: string) => {
    setModuleOrder(prev => {
      const index = prev.indexOf(moduleId)
      if (index >= prev.length - 1) return prev
      const newOrder = [...prev]
        ;[newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]]
      return newOrder
    })
  }, [])

  const getOrderedModules = useCallback((): Module[] => {
    const orderedIds = moduleOrder.includes(pinnedModuleId)
      ? [pinnedModuleId, ...moduleOrder.filter(id => id !== pinnedModuleId)]
      : moduleOrder

    return orderedIds
      .map(id => dynamicModules.find(m => m.id === id))
      .filter((m): m is Module => m !== undefined)
  }, [moduleOrder, pinnedModuleId, dynamicModules])

  const handleViewChange = (viewId: string) => {
    setActiveView(viewId)
  }

  const handleObjectiveClick = (title: string, value: string, subtitle: string, color: string) => {
    setObjectiveData({ title, value, subtitle, color })
    setObjectiveModalOpen(true)
  }

  const openProfile = () => {
    setSettingsOpen(false)
    setProfileOpen(true)
  }

  const openSettings = () => {
    setSettingsOpen(true)
  }

  const closeProfile = () => {
    setProfileOpen(false)
    setSettingsOpen(false)
  }

  const closeSettings = () => {
    setSettingsOpen(false)
  }

  const viewStyle = (viewId: string) => ({
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: activeView === viewId ? 1 : 0,
    pointerEvents: activeView === viewId ? 'auto' as const : 'none' as const,
    zIndex: activeView === viewId ? 1 : 0,
    transition: 'opacity 0.3s ease'
  })

  // Show loading while checking auth
  if (isLoading) {
    return (
      <IPhoneWrapper>
        <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
            <div>Chargement...</div>
          </div>
        </div>
      </IPhoneWrapper>
    )
  }

  return (
    <IPhoneWrapper>
      <div className="app-container">
        {/* Main views - simple opacity-based switching */}
        <section id="view-home" className="view" style={viewStyle('view-home')}>
          <HomeView
            userProfile={userProfile}
            modules={getOrderedModules()}
            pinnedModuleId={pinnedModuleId}
            isReorderMode={isReorderMode}
            onAvatarClick={openProfile}
            onObjectiveClick={handleObjectiveClick}
            onPinModule={handlePinModule}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
            onToggleReorderMode={() => setIsReorderMode(!isReorderMode)}
          />
        </section>

        <section id="view-physio" className="view" style={viewStyle('view-physio')}>
          <ProfileDataGate module="physio" onMissingDataAction={() => setShowPhysioDataModal(true)}>
            <PhysioView
              metrics={physioMetrics}
              aiAnalysis={aiAnalysis}
              onAvatarClick={openProfile}
              onCardClick={handleObjectiveClick}
            />
          </ProfileDataGate>
        </section>

        <section id="view-social" className="view" style={viewStyle('view-social')}>
          <SocialView
            contacts={contacts}
            comparisonData={comparisonData}
            onObjectiveClick={handleObjectiveClick}
            initialContactName={initialContactName}
            onClearInitialContact={() => setInitialContactName(null)}
          />
        </section>

        <section id="view-map" className="view" style={viewStyle('view-map')}>
          <ProfileDataGate module="map">
            <MapView mapContainerId="map-full" onFullscreenChange={setIsMapFullscreen} />
          </ProfileDataGate>
        </section>

        <section id="view-pro" className="view" style={viewStyle('view-pro')}>
          <ProView
            careerInfo={careerInfo}
            onAvatarClick={openProfile}
            onAssetsClick={() => setAssetsModalOpen(true)}
          />
        </section>

        {/* TabBar with swipe support */}
        {!isMapFullscreen && !profileOpen && !settingsOpen && (
          <TabBar activeTab={activeView} onTabChange={handleViewChange} />
        )}

        {/* Profile ViewSheet */}
        <ViewSheet isOpen={profileOpen} onClose={closeProfile}>
          <ProfileView
            onOpenSettings={openSettings}
            onNavigate={handleViewChange}
            onBack={closeProfile}
            userProfile={profileData.isAuthenticated && profileData.profile ? {
              id: profileData.profile.id,
              firstName: profileData.profile.firstName || '',
              lastName: profileData.profile.lastName || '',
              avatarUrl: profileData.profile.avatarUrl || '',
              username: profileData.profile.username || '',
              harmonyScore: profileData.profile.harmonyScore || 0,
              joinedDate: profileData.profile.createdAt || new Date().toISOString(),
            } : undefined}
          />
        </ViewSheet>

        {/* Settings ViewSheet */}
        <ViewSheet isOpen={settingsOpen} onClose={closeSettings}>
          <SettingsView onBack={closeSettings} />
        </ViewSheet>

        {/* Modals */}
        <AssetsModal isOpen={assetsModalOpen} onClose={() => setAssetsModalOpen(false)} />

        <ObjectiveModal
          isOpen={objectiveModalOpen}
          onClose={() => setObjectiveModalOpen(false)}
          title={objectiveData.title}
          value={objectiveData.value}
          subtitle={objectiveData.subtitle}
          color={objectiveData.color}
        />

        {/* Physio Data Entry Modal - triggered from MissingDataPrompt */}
        {profileData.profile?.id && (
          <BodyDataEntryModal
            isOpen={showPhysioDataModal}
            onClose={() => setShowPhysioDataModal(false)}
            userId={profileData.profile.id}
            currentData={{
              dateOfBirth: profileData.profile.dateOfBirth || undefined,
              gender: profileData.profile.gender || undefined,
              height: profileData.profile.height || undefined,
              weight: profileData.profile.weight || undefined,
              activityLevel: profileData.profile.activityLevel || undefined,
            }}
            onSave={() => {
              setShowPhysioDataModal(false)
              profileData.refetch()
            }}
          />
        )}
      </div>
    </IPhoneWrapper>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  )
}
