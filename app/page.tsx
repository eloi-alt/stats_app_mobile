'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import TabBar from '@/components/TabBar'
import HomeView from '@/components/Views/HomeView'
import PhysioView from '@/components/Views/PhysioView'
import SocialView from '@/components/Views/SocialView'
import MapView from '@/components/Views/MapView'
import ProView from '@/components/Views/ProView'
import ProfileModal from '@/components/Modals/ProfileModal'
import AssetsModal from '@/components/Modals/AssetsModal'
import ObjectiveModal from '@/components/Modals/ObjectiveModal'
import SettingsModal from '@/components/Modals/SettingsModal'
import {
  modules,
  userProfile,
  physioMetrics,
  careerInfo,
  contacts,
  comparisonData,
  aiAnalysis,
  defaultPinConfig,
  type Module
} from '@/data/mockData'

// Clés pour le localStorage
const PINNED_MODULE_KEY = 'statsapp_pinned_module'
const MODULE_ORDER_KEY = 'statsapp_module_order'

import IPhoneWrapper from '@/components/IPhoneWrapper'



function HomeContent() {
  const searchParams = useSearchParams()
  const [activeView, setActiveView] = useState('view-home')
  const [initialContactName, setInitialContactName] = useState<string | null>(null)

  useEffect(() => {
    const viewParam = searchParams.get('view')
    const contactNameParam = searchParams.get('contactName')

    // On s'assure de toujours avoir une vue par défaut (Home) si rien n'est spécifié
    if (viewParam) {
      setActiveView(viewParam)
    } else {
      setActiveView('view-home')
    }

    // On ne traite contactName que si on est dans la vue sociale
    // Cela évite d'ouvrir une modal portale au-dessus de la Home au chargement
    if (contactNameParam && (viewParam === 'view-social' || !viewParam)) {
      setInitialContactName(contactNameParam)
      // Si on a un contact mais pas de vue spécifiée, on force la vue sociale
      if (!viewParam) {
        setActiveView('view-social')
      }
    }
  }, [searchParams])

  const [isLightMode, setIsLightMode] = useState(false)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [assetsModalOpen, setAssetsModalOpen] = useState(false)
  const [objectiveModalOpen, setObjectiveModalOpen] = useState(false)
  const [objectiveData, setObjectiveData] = useState({
    title: '',
    value: '',
    subtitle: '',
    color: '',
  })

  // État du système de pinning
  const [pinnedModuleId, setPinnedModuleId] = useState<string>(defaultPinConfig.pinnedModuleId)
  const [moduleOrder, setModuleOrder] = useState<string[]>(defaultPinConfig.moduleOrder)
  const [isReorderMode, setIsReorderMode] = useState(false)
  const [isMapFullscreen, setIsMapFullscreen] = useState(false)

  // Charger la configuration de pinning depuis le localStorage
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

  // Sauvegarder la configuration de pinning
  useEffect(() => {
    localStorage.setItem(PINNED_MODULE_KEY, pinnedModuleId)
  }, [pinnedModuleId])

  useEffect(() => {
    localStorage.setItem(MODULE_ORDER_KEY, JSON.stringify(moduleOrder))
  }, [moduleOrder])

  useEffect(() => {
    if (isLightMode) {
      document.body.classList.add('light-mode')
    } else {
      document.body.classList.remove('light-mode')
    }
  }, [isLightMode])

  // Fonction pour épingler un module
  const handlePinModule = useCallback((moduleId: string) => {
    setPinnedModuleId(moduleId)
    // Réorganiser pour mettre le module épinglé en premier
    setModuleOrder(prev => {
      const newOrder = prev.filter(id => id !== moduleId)
      return [moduleId, ...newOrder]
    })
  }, [])

  // Fonction pour déplacer un module vers le haut
  const handleMoveUp = useCallback((moduleId: string) => {
    setModuleOrder(prev => {
      const index = prev.indexOf(moduleId)
      if (index <= 0) return prev
      const newOrder = [...prev]
        ;[newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]]
      return newOrder
    })
  }, [])

  // Fonction pour déplacer un module vers le bas
  const handleMoveDown = useCallback((moduleId: string) => {
    setModuleOrder(prev => {
      const index = prev.indexOf(moduleId)
      if (index >= prev.length - 1) return prev
      const newOrder = [...prev]
        ;[newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]]
      return newOrder
    })
  }, [])

  // Obtenir les modules dans l'ordre configuré avec le module épinglé en premier
  const getOrderedModules = useCallback((): Module[] => {
    // S'assurer que le module épinglé est toujours en premier
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

  return (
    <IPhoneWrapper>
      <div className="app-container">

        <section
          id="view-home"
          className="view active"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: activeView === 'view-home' ? 1 : 0,
            pointerEvents: activeView === 'view-home' ? 'auto' : 'none',
            zIndex: activeView === 'view-home' ? 1 : 0,
            transition: 'opacity 0.3s ease'
          }}
        >
          <HomeView
            userProfile={userProfile}
            modules={getOrderedModules()}
            pinnedModuleId={pinnedModuleId}
            isReorderMode={isReorderMode}
            onAvatarClick={() => setProfileModalOpen(true)}
            onObjectiveClick={handleObjectiveClick}
            onPinModule={handlePinModule}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
            onToggleReorderMode={() => setIsReorderMode(!isReorderMode)}
          />
        </section>

        <section
          id="view-physio"
          className="view"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: activeView === 'view-physio' ? 1 : 0,
            pointerEvents: activeView === 'view-physio' ? 'auto' : 'none',
            zIndex: activeView === 'view-physio' ? 1 : 0,
            transition: 'opacity 0.3s ease'
          }}
        >
          <PhysioView
            metrics={physioMetrics}
            aiAnalysis={aiAnalysis}
            onAvatarClick={() => setProfileModalOpen(true)}
            onCardClick={handleObjectiveClick}
          />
        </section>

        <section
          id="view-social"
          className="view"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: activeView === 'view-social' ? 1 : 0,
            pointerEvents: activeView === 'view-social' ? 'auto' : 'none',
            zIndex: activeView === 'view-social' ? 1 : 0,
            transition: 'opacity 0.3s ease'
          }}
        >
          <SocialView
            contacts={contacts}
            comparisonData={comparisonData}
            onObjectiveClick={handleObjectiveClick}
            initialContactName={initialContactName}
            onClearInitialContact={() => setInitialContactName(null)}
          />
        </section>

        <section
          id="view-map"
          className="view"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: activeView === 'view-map' ? 1 : 0,
            pointerEvents: activeView === 'view-map' ? 'auto' : 'none',
            zIndex: activeView === 'view-map' ? 1 : 0,
            transition: 'opacity 0.3s ease'
          }}
        >
          <MapView mapContainerId="map-full" onFullscreenChange={setIsMapFullscreen} />
        </section>

        <section
          id="view-pro"
          className="view"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: activeView === 'view-pro' ? 1 : 0,
            pointerEvents: activeView === 'view-pro' ? 'auto' : 'none',
            zIndex: activeView === 'view-pro' ? 1 : 0,
            transition: 'opacity 0.3s ease'
          }}
        >
          <ProView
            careerInfo={careerInfo}
            onAvatarClick={() => setProfileModalOpen(true)}
            onAssetsClick={() => setAssetsModalOpen(true)}
          />
        </section>

        {!isMapFullscreen && <TabBar activeTab={activeView} onTabChange={handleViewChange} />}

        <ProfileModal
          isOpen={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
          onToggleTheme={() => setIsLightMode(!isLightMode)}
          onNavigate={handleViewChange}
        />

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
