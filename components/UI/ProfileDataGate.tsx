'use client'

import { ReactNode } from 'react'
import { useProfileData, ProfileCompleteness } from '@/hooks/useProfileData'
import { useVisitor } from '@/contexts/VisitorContext'
import MissingDataPrompt from './MissingDataPrompt'

type ModuleType = 'physio' | 'pro' | 'map' | 'social'

interface ProfileDataGateProps {
    children: ReactNode
    module: ModuleType
    fallbackComponent?: ReactNode
}

const MODULE_CONFIG: Record<ModuleType, {
    name: string
    icon: string
    color: string
    completenessKey: keyof ProfileCompleteness
    missingFieldsKey: keyof ProfileCompleteness
}> = {
    physio: {
        name: 'Santé',
        icon: 'fa-heart-pulse',
        color: 'var(--accent-sage)',
        completenessKey: 'physioComplete',
        missingFieldsKey: 'missingPhysioFields'
    },
    pro: {
        name: 'Carrière',
        icon: 'fa-briefcase',
        color: 'var(--accent-gold)',
        completenessKey: 'proComplete',
        missingFieldsKey: 'missingProFields'
    },
    map: {
        name: 'Monde',
        icon: 'fa-globe',
        color: 'var(--accent-ocean)',
        completenessKey: 'mapComplete',
        missingFieldsKey: 'missingMapFields'
    },
    social: {
        name: 'Social',
        icon: 'fa-users',
        color: 'var(--accent-lavender)',
        completenessKey: 'isComplete', // Social doesn't have specific field requirements
        missingFieldsKey: 'missingPhysioFields' // Won't be used
    }
}

export default function ProfileDataGate({ children, module, fallbackComponent }: ProfileDataGateProps) {
    const profileData = useProfileData()
    const { isVisitor } = useVisitor()
    const config = MODULE_CONFIG[module]

    // In visitor mode, show content directly with demo data
    if (isVisitor) {
        return <>{children}</>
    }

    // While loading, show nothing or a skeleton
    if (profileData.isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
                    style={{ borderColor: `${config.color} transparent transparent transparent` }}
                />
            </div>
        )
    }

    // If not authenticated, the app should redirect to login
    // (handled elsewhere, but we can show nothing here)
    if (!profileData.isAuthenticated) {
        return null
    }

    // Social module doesn't require specific fields (friends are added manually)
    if (module === 'social') {
        return <>{children}</>
    }

    // Check if the module has complete data
    const isComplete = profileData[config.completenessKey] as boolean
    const missingFields = profileData[config.missingFieldsKey] as { key: string; label: string }[]

    if (!isComplete && missingFields.length > 0) {
        if (fallbackComponent) {
            return <>{fallbackComponent}</>
        }

        return (
            <MissingDataPrompt
                moduleName={config.name}
                moduleIcon={config.icon}
                moduleColor={config.color}
                missingFields={missingFields}
            />
        )
    }

    return <>{children}</>
}
