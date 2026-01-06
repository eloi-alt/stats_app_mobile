'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase/client'
import OnboardingSlide from '@/components/Onboarding/OnboardingSlide'
import UsernameInput from '@/components/Onboarding/UsernameInput'
import AvatarUploader from '@/components/Onboarding/AvatarUploader'

const TOTAL_STEPS = 20

const industries = [
    'Technologie', 'Finance', 'Santé', 'Éducation', 'Commerce',
    'Industrie', 'Services', 'Médias', 'Immobilier', 'Transport',
    'Énergie', 'Agriculture', 'Art & Culture', 'Sport', 'Autre'
]

const countries = [
    { code: 'FR', name: 'France' },
    { code: 'US', name: 'États-Unis' },
    { code: 'GB', name: 'Royaume-Uni' },
    { code: 'DE', name: 'Allemagne' },
    { code: 'ES', name: 'Espagne' },
    { code: 'IT', name: 'Italie' },
    { code: 'BE', name: 'Belgique' },
    { code: 'CH', name: 'Suisse' },
    { code: 'CA', name: 'Canada' },
    { code: 'JP', name: 'Japon' },
    { code: 'CN', name: 'Chine' },
    { code: 'AU', name: 'Australie' },
    { code: 'BR', name: 'Brésil' },
    { code: 'MA', name: 'Maroc' },
    { code: 'PT', name: 'Portugal' },
    { code: 'NL', name: 'Pays-Bas' },
]

const currencies = [
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'USD', symbol: '$', name: 'Dollar US' },
    { code: 'GBP', symbol: '£', name: 'Livre Sterling' },
    { code: 'CHF', symbol: 'CHF', name: 'Franc Suisse' },
    { code: 'CAD', symbol: 'C$', name: 'Dollar Canadien' },
    { code: 'JPY', symbol: '¥', name: 'Yen' },
]

const modules = [
    { id: 'A', name: 'Santé', icon: 'fa-heart-pulse', color: 'var(--accent-sage)' },
    { id: 'B', name: 'Monde', icon: 'fa-globe', color: 'var(--accent-ocean)' },
    { id: 'C', name: 'Carrière', icon: 'fa-briefcase', color: 'var(--accent-gold)' },
    { id: 'D', name: 'Succès', icon: 'fa-trophy', color: 'var(--accent-rose)' },
    { id: 'E', name: 'Social', icon: 'fa-users', color: 'var(--accent-lavender)' },
]

interface ProfileData {
    firstName: string
    lastName: string
    username: string
    avatarUrl: string
    gender: string
    dateOfBirth: string
    nationality: string
    height: number
    weight: number
    activityLevel: number
    unitsPreference: string
    homeCountry: string
    currency: string
    jobTitle: string
    company: string
    industry: string
    experienceYears: number
    annualIncome: number
    savingsRate: number
    pinnedModule: string
}

function OnboardingContent() {
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState(1)
    const [userId, setUserId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [usernameValid, setUsernameValid] = useState(false)

    const [profileData, setProfileData] = useState<ProfileData>({
        firstName: '',
        lastName: '',
        username: '',
        avatarUrl: '',
        gender: '',
        dateOfBirth: '',
        nationality: 'FR',
        height: 175,
        weight: 70,
        activityLevel: 3,
        unitsPreference: 'metric',
        homeCountry: 'FR',
        currency: 'EUR',
        jobTitle: '',
        company: '',
        industry: '',
        experienceYears: 0,
        annualIncome: 50000,
        savingsRate: 20,
        pinnedModule: 'A'
    })

    // Get current user on mount
    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }
            setUserId(user.id)

            // Load existing profile data if any
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (profile) {
                setProfileData(prev => ({
                    ...prev,
                    firstName: profile.first_name || '',
                    lastName: profile.last_name || '',
                    username: profile.username || '',
                    avatarUrl: profile.avatar_url || '',
                    gender: profile.gender || '',
                    dateOfBirth: profile.date_of_birth || '',
                    nationality: profile.nationality || 'FR',
                    height: profile.height || 175,
                    weight: profile.weight || 70,
                    activityLevel: profile.activity_level || 3,
                    unitsPreference: profile.units_preference || 'metric',
                    homeCountry: profile.home_country || 'FR',
                    currency: profile.currency || 'EUR',
                    jobTitle: profile.job_title || '',
                    company: profile.company || '',
                    industry: profile.industry || '',
                    experienceYears: profile.experience_years || 0,
                    annualIncome: profile.annual_income || 50000,
                    savingsRate: profile.savings_rate || 20,
                    pinnedModule: profile.pinned_module || 'A'
                }))
                // Resume from saved step
                if (profile.onboarding_step && profile.onboarding_step > 0) {
                    setCurrentStep(profile.onboarding_step)
                }
            }
        }
        getUser()
    }, [router])

    // Save profile data
    const saveProfile = async (step: number, completed: boolean = false) => {
        if (!userId) return

        setIsLoading(true)
        try {
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: userId,
                    first_name: profileData.firstName,
                    last_name: profileData.lastName,
                    username: profileData.username,
                    avatar_url: profileData.avatarUrl,
                    gender: profileData.gender || null,
                    date_of_birth: profileData.dateOfBirth || null,
                    nationality: profileData.nationality,
                    height: profileData.height,
                    weight: profileData.weight,
                    activity_level: profileData.activityLevel,
                    units_preference: profileData.unitsPreference,
                    home_country: profileData.homeCountry,
                    currency: profileData.currency,
                    job_title: profileData.jobTitle || null,
                    company: profileData.company || null,
                    industry: profileData.industry || null,
                    experience_years: profileData.experienceYears,
                    annual_income: profileData.annualIncome,
                    savings_rate: profileData.savingsRate,
                    pinned_module: profileData.pinnedModule,
                    onboarding_step: step,
                    onboarding_completed: completed,
                    updated_at: new Date().toISOString()
                })

            if (error) throw error
        } catch (err) {
            console.error('Error saving profile:', err)
        } finally {
            setIsLoading(false)
        }
    }

    const handleNext = async () => {
        await saveProfile(currentStep + 1)

        if (currentStep >= TOTAL_STEPS) {
            await saveProfile(TOTAL_STEPS, true)
            router.push('/')
        } else {
            setCurrentStep(prev => prev + 1)
        }
    }

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1)
        }
    }

    const handleSkip = async () => {
        await saveProfile(currentStep, false)
        router.push('/')
    }

    const updateData = (key: keyof ProfileData, value: any) => {
        setProfileData(prev => ({ ...prev, [key]: value }))
    }

    const formatIncome = (value: number) => {
        if (value >= 1000000) {
            return `${(value / 1000000).toFixed(1)}M`
        } else if (value >= 1000) {
            return `${Math.round(value / 1000)}k`
        }
        return value.toString()
    }

    const canProceed = () => {
        switch (currentStep) {
            case 1: return profileData.firstName.length >= 2
            case 2: return profileData.lastName.length >= 2
            case 3: return usernameValid
            case 4: return true // Avatar is optional
            case 5: return profileData.gender !== '' // Gender required
            case 6: return true // Date of birth optional
            case 7: return true // Nationality
            case 8: return true // Height
            case 9: return true // Weight
            case 10: return true // Activity level
            case 11: return true // Units
            case 12: return true // Home country
            case 13: return true // Currency
            case 14: return true // Job title optional
            case 15: return true // Company optional
            case 16: return true // Industry optional
            case 17: return true // Experience
            case 18: return true // Income
            case 19: return true // Savings
            case 20: return true // Pinned module
            default: return true
        }
    }

    const renderSlide = () => {
        const commonProps = {
            currentStep,
            totalSteps: TOTAL_STEPS,
            onNext: handleNext,
            onBack: handleBack,
            onSkip: handleSkip,
            canProceed: canProceed(),
            isLoading,
            showBack: currentStep > 1
        }

        switch (currentStep) {
            case 1:
                return (
                    <OnboardingSlide
                        title="Comment vous appelez-vous ?"
                        subtitle="Entrez votre prénom"
                        icon="fa-user"
                        {...commonProps}
                    >
                        <input
                            type="text"
                            value={profileData.firstName}
                            onChange={(e) => updateData('firstName', e.target.value)}
                            placeholder="Prénom"
                            className="onboarding-input"
                            autoFocus
                        />
                    </OnboardingSlide>
                )

            case 2:
                return (
                    <OnboardingSlide
                        title="Quel est votre nom ?"
                        subtitle="Entrez votre nom de famille"
                        icon="fa-id-card"
                        {...commonProps}
                    >
                        <input
                            type="text"
                            value={profileData.lastName}
                            onChange={(e) => updateData('lastName', e.target.value)}
                            placeholder="Nom"
                            className="onboarding-input"
                            autoFocus
                        />
                    </OnboardingSlide>
                )

            case 3:
                return (
                    <OnboardingSlide
                        title="Choisissez un pseudo"
                        subtitle="Votre identifiant unique sur l'application"
                        icon="fa-at"
                        {...commonProps}
                    >
                        <UsernameInput
                            firstName={profileData.firstName}
                            lastName={profileData.lastName}
                            value={profileData.username}
                            onChange={(val) => updateData('username', val)}
                            onValidChange={setUsernameValid}
                        />
                    </OnboardingSlide>
                )

            case 4:
                return (
                    <OnboardingSlide
                        title="Photo de profil"
                        subtitle="Ajoutez une photo pour personnaliser votre compte"
                        icon="fa-camera"
                        {...commonProps}
                    >
                        {userId && (
                            <AvatarUploader
                                userId={userId}
                                currentAvatarUrl={profileData.avatarUrl}
                                onUploadComplete={(url) => {
                                    updateData('avatarUrl', url)
                                }}
                                onSkip={() => handleNext()}
                            />
                        )}
                    </OnboardingSlide>
                )

            case 5:
                return (
                    <OnboardingSlide
                        title="Quel est votre genre ?"
                        icon="fa-venus-mars"
                        {...commonProps}
                    >
                        <div className="options-grid gender">
                            {[
                                { value: 'male', label: 'Homme', icon: 'fa-mars' },
                                { value: 'female', label: 'Femme', icon: 'fa-venus' },
                                { value: 'other', label: 'Autre', icon: 'fa-genderless' }
                            ].map((opt) => (
                                <button
                                    key={opt.value}
                                    className={`option-btn large ${profileData.gender === opt.value ? 'active' : ''}`}
                                    onClick={() => updateData('gender', opt.value)}
                                >
                                    <i className={`fa-solid ${opt.icon}`}></i>
                                    <span>{opt.label}</span>
                                </button>
                            ))}
                        </div>
                    </OnboardingSlide>
                )

            case 6:
                return (
                    <OnboardingSlide
                        title="Quelle est votre date de naissance ?"
                        subtitle="Pour personnaliser votre expérience"
                        icon="fa-cake-candles"
                        {...commonProps}
                    >
                        <input
                            type="date"
                            value={profileData.dateOfBirth}
                            onChange={(e) => updateData('dateOfBirth', e.target.value)}
                            className="onboarding-input"
                            max={new Date().toISOString().split('T')[0]}
                        />
                    </OnboardingSlide>
                )

            case 7:
                return (
                    <OnboardingSlide
                        title="Quelle est votre nationalité ?"
                        subtitle="Votre passeport"
                        icon="fa-passport"
                        {...commonProps}
                    >
                        <div className="options-grid countries">
                            {countries.map((country) => (
                                <button
                                    key={country.code}
                                    className={`option-btn country ${profileData.nationality === country.code ? 'active' : ''}`}
                                    onClick={() => updateData('nationality', country.code)}
                                >
                                    <span className="country-flag">{getFlagEmoji(country.code)}</span>
                                    {country.name}
                                </button>
                            ))}
                        </div>
                    </OnboardingSlide>
                )

            case 8:
                return (
                    <OnboardingSlide
                        title="Quelle est votre taille ?"
                        icon="fa-ruler-vertical"
                        {...commonProps}
                    >
                        <div className="slider-container">
                            <div className="slider-value">{profileData.height} cm</div>
                            <input
                                type="range"
                                min={140}
                                max={220}
                                value={profileData.height}
                                onChange={(e) => updateData('height', parseInt(e.target.value))}
                                className="onboarding-slider"
                            />
                            <div className="slider-labels">
                                <span>140 cm</span>
                                <span>220 cm</span>
                            </div>
                        </div>
                    </OnboardingSlide>
                )

            case 9:
                return (
                    <OnboardingSlide
                        title="Quel est votre poids ?"
                        icon="fa-weight-scale"
                        {...commonProps}
                    >
                        <div className="slider-container">
                            <div className="slider-value">{profileData.weight} kg</div>
                            <input
                                type="range"
                                min={40}
                                max={150}
                                value={profileData.weight}
                                onChange={(e) => updateData('weight', parseInt(e.target.value))}
                                className="onboarding-slider"
                            />
                            <div className="slider-labels">
                                <span>40 kg</span>
                                <span>150 kg</span>
                            </div>
                        </div>
                    </OnboardingSlide>
                )

            case 10:
                return (
                    <OnboardingSlide
                        title="Niveau d'activité physique"
                        subtitle="Combien de jours par semaine faites-vous du sport ?"
                        icon="fa-person-running"
                        {...commonProps}
                    >
                        <div className="slider-container">
                            <div className="slider-value">{profileData.activityLevel} jours/semaine</div>
                            <input
                                type="range"
                                min={0}
                                max={7}
                                value={profileData.activityLevel}
                                onChange={(e) => updateData('activityLevel', parseInt(e.target.value))}
                                className="onboarding-slider"
                            />
                            <div className="slider-labels">
                                <span>Sédentaire</span>
                                <span>Très actif</span>
                            </div>
                        </div>
                    </OnboardingSlide>
                )

            case 11:
                return (
                    <OnboardingSlide
                        title="Système d'unités"
                        subtitle="Comment préférez-vous voir vos mesures ?"
                        icon="fa-ruler"
                        {...commonProps}
                    >
                        <div className="options-grid units">
                            <button
                                className={`option-btn large ${profileData.unitsPreference === 'metric' ? 'active' : ''}`}
                                onClick={() => updateData('unitsPreference', 'metric')}
                            >
                                <span className="unit-label">Métrique</span>
                                <span className="unit-examples">kg, cm, km</span>
                            </button>
                            <button
                                className={`option-btn large ${profileData.unitsPreference === 'imperial' ? 'active' : ''}`}
                                onClick={() => updateData('unitsPreference', 'imperial')}
                            >
                                <span className="unit-label">Impérial</span>
                                <span className="unit-examples">lb, ft, mi</span>
                            </button>
                        </div>
                    </OnboardingSlide>
                )

            case 12:
                return (
                    <OnboardingSlide
                        title="Votre pays de résidence"
                        subtitle="Où habitez-vous actuellement ?"
                        icon="fa-house"
                        {...commonProps}
                    >
                        <div className="options-grid countries">
                            {countries.map((country) => (
                                <button
                                    key={country.code}
                                    className={`option-btn country ${profileData.homeCountry === country.code ? 'active' : ''}`}
                                    onClick={() => updateData('homeCountry', country.code)}
                                >
                                    <span className="country-flag">{getFlagEmoji(country.code)}</span>
                                    {country.name}
                                </button>
                            ))}
                        </div>
                    </OnboardingSlide>
                )

            case 13:
                return (
                    <OnboardingSlide
                        title="Votre devise principale"
                        subtitle="Pour le suivi financier"
                        icon="fa-coins"
                        {...commonProps}
                    >
                        <div className="options-grid currencies">
                            {currencies.map((curr) => (
                                <button
                                    key={curr.code}
                                    className={`option-btn currency ${profileData.currency === curr.code ? 'active' : ''}`}
                                    onClick={() => updateData('currency', curr.code)}
                                >
                                    <span className="currency-symbol">{curr.symbol}</span>
                                    <span className="currency-name">{curr.name}</span>
                                </button>
                            ))}
                        </div>
                    </OnboardingSlide>
                )

            case 14:
                return (
                    <OnboardingSlide
                        title="Quel est votre métier ?"
                        subtitle="Votre poste actuel ou souhaité"
                        icon="fa-briefcase"
                        {...commonProps}
                    >
                        <input
                            type="text"
                            value={profileData.jobTitle}
                            onChange={(e) => updateData('jobTitle', e.target.value)}
                            placeholder="Ex: Développeur, Designer, Manager..."
                            className="onboarding-input"
                        />
                    </OnboardingSlide>
                )

            case 15:
                return (
                    <OnboardingSlide
                        title="Dans quelle entreprise ?"
                        subtitle="Votre employeur actuel"
                        icon="fa-building"
                        {...commonProps}
                    >
                        <input
                            type="text"
                            value={profileData.company}
                            onChange={(e) => updateData('company', e.target.value)}
                            placeholder="Ex: Google, Freelance, Startup..."
                            className="onboarding-input"
                        />
                    </OnboardingSlide>
                )

            case 16:
                return (
                    <OnboardingSlide
                        title="Dans quel secteur ?"
                        subtitle="Choisissez votre industrie"
                        icon="fa-industry"
                        {...commonProps}
                    >
                        <div className="options-grid">
                            {industries.map((ind) => (
                                <button
                                    key={ind}
                                    className={`option-btn ${profileData.industry === ind ? 'active' : ''}`}
                                    onClick={() => updateData('industry', ind)}
                                >
                                    {ind}
                                </button>
                            ))}
                        </div>
                    </OnboardingSlide>
                )

            case 17:
                return (
                    <OnboardingSlide
                        title="Années d'expérience"
                        subtitle="Dans votre domaine professionnel"
                        icon="fa-chart-line"
                        {...commonProps}
                    >
                        <div className="slider-container">
                            <div className="slider-value">{profileData.experienceYears} ans</div>
                            <input
                                type="range"
                                min={0}
                                max={40}
                                value={profileData.experienceYears}
                                onChange={(e) => updateData('experienceYears', parseInt(e.target.value))}
                                className="onboarding-slider"
                            />
                            <div className="slider-labels">
                                <span>Débutant</span>
                                <span>40+ ans</span>
                            </div>
                        </div>
                    </OnboardingSlide>
                )

            case 18:
                return (
                    <OnboardingSlide
                        title="Revenu annuel brut"
                        subtitle="Estimation de vos revenus annuels"
                        icon="fa-sack-dollar"
                        {...commonProps}
                    >
                        <div className="slider-container">
                            <div className="slider-value">
                                {formatIncome(profileData.annualIncome)} {currencies.find(c => c.code === profileData.currency)?.symbol || '€'}
                            </div>
                            <input
                                type="range"
                                min={0}
                                max={500000}
                                step={5000}
                                value={profileData.annualIncome}
                                onChange={(e) => updateData('annualIncome', parseInt(e.target.value))}
                                className="onboarding-slider"
                            />
                            <div className="slider-labels">
                                <span>0</span>
                                <span>500k+</span>
                            </div>
                        </div>
                    </OnboardingSlide>
                )

            case 19:
                return (
                    <OnboardingSlide
                        title="Taux d'épargne"
                        subtitle="Quel pourcentage de vos revenus épargnez-vous ?"
                        icon="fa-piggy-bank"
                        {...commonProps}
                    >
                        <div className="slider-container">
                            <div className="slider-value">{profileData.savingsRate}%</div>
                            <input
                                type="range"
                                min={0}
                                max={80}
                                value={profileData.savingsRate}
                                onChange={(e) => updateData('savingsRate', parseInt(e.target.value))}
                                className="onboarding-slider"
                            />
                            <div className="slider-labels">
                                <span>0%</span>
                                <span>80%</span>
                            </div>
                        </div>
                    </OnboardingSlide>
                )

            case 20:
                return (
                    <OnboardingSlide
                        title="Module prioritaire"
                        subtitle="Quel aspect de votre vie souhaitez-vous améliorer en priorité ?"
                        icon="fa-star"
                        nextLabel="Terminer"
                        {...commonProps}
                    >
                        <div className="options-grid modules">
                            {modules.map((mod) => (
                                <button
                                    key={mod.id}
                                    className={`option-btn module ${profileData.pinnedModule === mod.id ? 'active' : ''}`}
                                    onClick={() => updateData('pinnedModule', mod.id)}
                                    style={{ '--module-color': mod.color } as React.CSSProperties}
                                >
                                    <i className={`fa-solid ${mod.icon}`}></i>
                                    <span>{mod.name}</span>
                                </button>
                            ))}
                        </div>
                    </OnboardingSlide>
                )

            default:
                return null
        }
    }

    return (
        <div className="onboarding-container">
            <style jsx global>{`
        .onboarding-container {
          min-height: 100vh;
          background: var(--bg-primary);
        }

        .onboarding-input {
          width: 100%;
          padding: 16px;
          border: 2px solid var(--border-light);
          border-radius: 16px;
          font-size: 18px;
          background: var(--bg-secondary);
          color: var(--text-primary);
          text-align: center;
          transition: all 0.2s;
        }

        .onboarding-input:focus {
          outline: none;
          border-color: var(--accent-gold);
          box-shadow: 0 0 0 4px rgba(201, 169, 98, 0.1);
        }

        .slider-container {
          width: 100%;
          max-width: 100%;
          padding: 0 8px;
        }

        .slider-value {
          font-size: 28px;
          font-weight: 700;
          color: var(--accent-gold);
          margin-bottom: 12px;
          text-align: center;
        }

        .onboarding-slider {
          width: 100%;
          height: 6px;
          border-radius: 3px;
          background: var(--bg-tertiary);
          appearance: none;
          cursor: pointer;
        }

        .onboarding-slider::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--accent-gold);
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(201, 169, 98, 0.4);
        }

        .slider-labels {
          display: flex;
          justify-content: space-between;
          margin-top: 6px;
          font-size: 10px;
          color: var(--text-tertiary);
        }

        .options-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6px;
          width: 100%;
          max-height: 240px;
          overflow-y: auto;
          padding: 4px;
        }

        .options-grid.countries {
          grid-template-columns: repeat(2, 1fr);
          max-height: 220px;
          overflow-y: auto;
        }

        .options-grid.currencies {
          grid-template-columns: repeat(2, 1fr);
          max-height: 220px;
        }

        .options-grid.gender {
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          max-height: none;
        }

        .options-grid.units {
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          max-height: none;
        }

        .options-grid.modules {
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
          max-height: 200px;
        }

        .option-btn {
          padding: 10px 6px;
          border: 2px solid var(--border-light);
          border-radius: 10px;
          background: var(--bg-secondary);
          color: var(--text-secondary);
          font-size: 11px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .option-btn:hover {
          border-color: var(--accent-gold);
        }

        .option-btn.active {
          background: var(--accent-gold);
          border-color: var(--accent-gold);
          color: white;
        }

        .option-btn.large {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 14px 12px;
          font-size: 13px;
        }

        .option-btn.large i {
          font-size: 20px;
        }

        .option-btn.country {
          display: flex;
          align-items: center;
          gap: 6px;
          justify-content: flex-start;
          padding: 10px 12px;
        }

        .option-btn.currency {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          padding: 12px;
        }

        .option-btn.module {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 14px;
        }

        .option-btn.module i {
          font-size: 22px;
        }

        .option-btn.module.active {
          background: var(--module-color);
          border-color: var(--module-color);
        }

        .country-flag {
          font-size: 16px;
        }

        .currency-symbol {
          font-size: 20px;
          font-weight: 700;
          color: var(--accent-gold);
        }

        .option-btn.active .currency-symbol {
          color: white;
        }

        .currency-name {
          font-size: 10px;
        }

        .unit-label {
          font-size: 16px;
          font-weight: 600;
        }

        .unit-examples {
          font-size: 12px;
          color: var(--text-tertiary);
        }

        .option-btn.active .unit-examples {
          color: rgba(255,255,255,0.8);
        }
      `}</style>

            {renderSlide()}
        </div>
    )
}

function getFlagEmoji(countryCode: string) {
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0))
    return String.fromCodePoint(...codePoints)
}

export default function OnboardingPage() {
    return (
        <Suspense fallback={<div>Chargement...</div>}>
            <OnboardingContent />
        </Suspense>
    )
}
