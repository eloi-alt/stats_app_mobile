'use client'

import { useState, useEffect, useCallback, useMemo, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useVisitor } from '@/contexts/VisitorContext'
import { useProfileData } from '@/hooks/useProfileData'
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
import {
  modules,
  userProfile as demoUserProfile,
  physioMetrics,
  careerInfo,
  contacts,
  comparisonData,
  aiAnalysis,
  defaultPinConfig,
  type Module,
  type HomeUserProfile
} from '@/data/mockData'

const PINNED_MODULE_KEY = 'statsapp_pinned_module'
const MODULE_ORDER_KEY = 'statsapp_module_order'

import IPhoneWrapper from '@/components/IPhoneWrapper'


function HomeContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { isVisitor } = useVisitor()
  const profileData = useProfileData() // Get profile from Supabase or visitor mode
  const [isLoading, setIsLoading] = useState(true)
  const [activeView, setActiveView] = useState('view-home')
  const [initialContactName, setInitialContactName] = useState<string | null>(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  // Compute the user profile based on auth state
  // For authenticated users: use real profile from Supabase
  // For visitors: use demo profile
  const userProfile: HomeUserProfile = useMemo(() => {
    const now = new Date()
    const weekNumber = Math.ceil((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000))

    if (profileData.isAuthenticated && profileData.profile) {
      // Build user profile from real data
      return {
        name: `${profileData.profile.firstName} ${profileData.profile.lastName}`.trim() || 'User',
        subtitle: profileData.profile.jobTitle || '',
        globalPerformance: 0, // Will be calculated by harmony score
        year: now.getFullYear(),
        week: weekNumber,
        connections: 0, // TODO: Get from social hook
        avatar: profileData.profile.avatarUrl || '/icon.png',
      }
    }
    // Visitor mode - use demo data
    return demoUserProfile
  }, [profileData.isAuthenticated, profileData.profile])

  console.log('[HomeContent] Mode:', profileData.isAuthenticated ? 'AUTHENTICATED' : 'VISITOR', 'Profile:', userProfile.name)


  // Check authentication on mount - redirect to landing if not authenticated and not visitor
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session && !isVisitor) {
        router.push('/landing')
        return
      }

      // If logged in, check if onboarding is completed
      if (session) {
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
      }

      setIsLoading(false)
    }

    checkAuth()
  }, [isVisitor, router])

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
      .map(id => modules.find(m => m.id === id))
      .filter((m): m is Module => m !== undefined)
  }, [moduleOrder, pinnedModuleId])

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
          <ProfileDataGate module="physio">
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
          <ProfileDataGate module="pro">
            <ProView
              careerInfo={careerInfo}
              onAvatarClick={openProfile}
              onAssetsClick={() => setAssetsModalOpen(true)}
            />
          </ProfileDataGate>
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
