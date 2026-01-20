'use client'

import { useState, useRef, useCallback } from 'react'
import BottomSheet from '../UI/BottomSheet'
import PublicCardDisplay, { PublicCardCategory } from '../Cards/PublicCardDisplay'
import { supabase } from '@/utils/supabase/client'

interface PublicCardCreatorModalProps {
    isOpen: boolean
    onClose: () => void
    userId?: string
    isDemo?: boolean
    userStats: {
        physio?: { weight?: number; height?: number; bmi?: number; age?: number; activityLevel?: number }
        social?: { friendsCount?: number; harmonyScore?: number }
        world?: { countriesVisited?: number; tripsCount?: number }
        career?: { jobTitle?: string; industry?: string; experienceYears?: number }
        finance?: { netWorth?: number; savingsRate?: number }
    }
    userName: string
    username?: string
    avatarUrl?: string
    onCardCreated?: (card: { imageUrl: string; category: PublicCardCategory }) => void
}

const categories: { id: PublicCardCategory; icon: string; label: string; color: string }[] = [
    { id: 'physio', icon: 'fa-heart-pulse', label: 'Santé', color: '#8BA888' },
    { id: 'social', icon: 'fa-users', label: 'Social', color: '#D4A5A5' },
    { id: 'world', icon: 'fa-globe', label: 'Monde', color: '#A5C4D4' },
    { id: 'career', icon: 'fa-briefcase', label: 'Carrière', color: '#B8A5D4' },
    { id: 'finance', icon: 'fa-coins', label: 'Finance', color: '#C9A962' },
]

export default function PublicCardCreatorModal({
    isOpen,
    onClose,
    userId,
    isDemo = false,
    userStats,
    userName,
    username,
    avatarUrl,
    onCardCreated
}: PublicCardCreatorModalProps) {
    const [step, setStep] = useState<1 | 2 | 3>(1)
    const [selectedCategory, setSelectedCategory] = useState<PublicCardCategory | null>(null)
    const [selectedImage, setSelectedImage] = useState<string | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const resetState = () => {
        setStep(1)
        setSelectedCategory(null)
        setSelectedImage(null)
        setError(null)
    }

    const handleClose = () => {
        resetState()
        onClose()
    }

    const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Veuillez sélectionner une image')
            return
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image trop grande (max 5MB)')
            return
        }

        setIsUploading(true)
        setError(null)

        try {
            // Create preview immediately
            const reader = new FileReader()

            reader.onerror = () => {
                console.error('[PublicCardCreator] FileReader error')
                setError('Erreur lors de la lecture du fichier')
                setIsUploading(false)
            }

            reader.onload = (event) => {
                const img = new Image()

                img.onerror = () => {
                    console.error('[PublicCardCreator] Image load error')
                    setError('Erreur lors du chargement de l\'image')
                    setIsUploading(false)
                }

                img.onload = () => {
                    try {
                        // Create canvas for 4:5 crop (800x1000)
                        const canvas = document.createElement('canvas')
                        const targetWidth = 800
                        const targetHeight = 1000
                        canvas.width = targetWidth
                        canvas.height = targetHeight

                        const ctx = canvas.getContext('2d')
                        if (!ctx) {
                            setError('Erreur lors du traitement de l\'image')
                            setIsUploading(false)
                            return
                        }

                        // Calculate crop dimensions
                        const sourceAspect = img.width / img.height
                        const targetAspect = targetWidth / targetHeight

                        let sourceX = 0, sourceY = 0, sourceWidth = img.width, sourceHeight = img.height

                        if (sourceAspect > targetAspect) {
                            // Image is wider - crop sides
                            sourceWidth = img.height * targetAspect
                            sourceX = (img.width - sourceWidth) / 2
                        } else {
                            // Image is taller - crop top/bottom
                            sourceHeight = img.width / targetAspect
                            sourceY = (img.height - sourceHeight) / 2
                        }

                        // Draw cropped and resized image
                        ctx.drawImage(
                            img,
                            sourceX, sourceY, sourceWidth, sourceHeight,
                            0, 0, targetWidth, targetHeight
                        )

                        // Convert to data URL
                        const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.85)
                        setSelectedImage(croppedDataUrl)
                        setStep(3) // Go to preview
                        setIsUploading(false)
                    } catch (canvasError) {
                        console.error('[PublicCardCreator] Canvas error:', canvasError)
                        setError('Erreur lors du traitement de l\'image')
                        setIsUploading(false)
                    }
                }
                img.src = event.target?.result as string
            }
            reader.readAsDataURL(file)
        } catch (err) {
            console.error('[PublicCardCreator] Error processing image:', err)
            setError('Erreur lors du traitement de l\'image')
            setIsUploading(false)
        }
    }, [])

    const handleSave = async () => {
        if (!selectedCategory || !selectedImage) return

        setIsSaving(true)
        setError(null)

        try {
            let finalImageUrl = selectedImage

            // Upload to Supabase Storage if not demo
            if (!isDemo && userId) {
                // Convert data URL to blob without using fetch (to avoid CSP issues)
                const dataUrlToBlob = (dataUrl: string): Blob => {
                    const parts = dataUrl.split(',')
                    const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg'
                    const bstr = atob(parts[1])
                    let n = bstr.length
                    const u8arr = new Uint8Array(n)
                    while (n--) {
                        u8arr[n] = bstr.charCodeAt(n)
                    }
                    return new Blob([u8arr], { type: mime })
                }

                const blob = dataUrlToBlob(selectedImage)

                const fileName = `${userId}/public_card_${Date.now()}.jpg`
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('avatars') // Using existing avatars bucket
                    .upload(fileName, blob, {
                        contentType: 'image/jpeg',
                        upsert: true
                    })

                if (uploadError) throw uploadError

                // Get public URL
                const { data: urlData } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(fileName)

                finalImageUrl = urlData.publicUrl

                // Save to public_cards table
                const statsSnapshot = userStats[selectedCategory]

                const { error: dbError } = await supabase
                    .from('public_cards')
                    .upsert({
                        user_id: userId,
                        image_url: finalImageUrl,
                        category: selectedCategory,
                        stats_snapshot: statsSnapshot,
                        updated_at: new Date().toISOString()
                    }, {
                        onConflict: 'user_id'
                    })

                if (dbError) throw dbError
            } else {
                // Demo mode: save to localStorage
                const demoCard = {
                    imageUrl: finalImageUrl,
                    category: selectedCategory,
                    stats: userStats,
                    createdAt: new Date().toISOString()
                }
                localStorage.setItem('demoPublicCard', JSON.stringify(demoCard))
            }

            console.log('[PublicCardCreator] Card saved successfully')
            onCardCreated?.({ imageUrl: finalImageUrl, category: selectedCategory })
            handleClose()
        } catch (err: any) {
            console.error('[PublicCardCreator] Save error:', err)
            setError(err?.message || 'Erreur lors de la sauvegarde')
        } finally {
            setIsSaving(false)
        }
    }

    const renderStepIndicator = () => (
        <div className="flex items-center justify-center gap-2 mb-6">
            {[1, 2, 3].map((s) => (
                <div
                    key={s}
                    className="w-2 h-2 rounded-full transition-all"
                    style={{
                        background: s === step ? 'var(--accent-gold)' : 'var(--border-light)',
                        width: s === step ? '24px' : '8px'
                    }}
                />
            ))}
        </div>
    )

    const renderStep1 = () => (
        <div className="px-2">
            <h2 className="text-lg font-medium text-center mb-2" style={{ color: 'var(--text-primary)' }}>
                Choisissez votre domaine
            </h2>
            <p className="text-xs text-center mb-6" style={{ color: 'var(--text-muted)' }}>
                Sélectionnez la catégorie à mettre en avant sur votre carte
            </p>

            <div className="grid grid-cols-2 gap-3">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => {
                            setSelectedCategory(cat.id)
                            setStep(2)
                        }}
                        className="p-4 rounded-2xl flex flex-col items-center gap-2 transition-all active:scale-95"
                        style={{
                            background: selectedCategory === cat.id
                                ? `${cat.color}20`
                                : 'var(--glass-bg)',
                            border: selectedCategory === cat.id
                                ? `2px solid ${cat.color}`
                                : '1px solid var(--border-light)'
                        }}
                    >
                        <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center"
                            style={{ background: `${cat.color}15` }}
                        >
                            <i className={`fa-solid ${cat.icon} text-xl`} style={{ color: cat.color }} />
                        </div>
                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                            {cat.label}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    )

    const renderStep2 = () => (
        <div className="px-2">
            <h2 className="text-lg font-medium text-center mb-2" style={{ color: 'var(--text-primary)' }}>
                Choisissez votre photo
            </h2>
            <p className="text-xs text-center mb-6" style={{ color: 'var(--text-muted)' }}>
                Cette photo sera recadrée au format 4:5 (800×1000px)
            </p>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
            />

            <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full py-16 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all active:scale-98"
                style={{
                    borderColor: 'var(--border-light)',
                    background: 'var(--glass-bg)',
                    opacity: isUploading ? 0.6 : 1
                }}
            >
                {isUploading ? (
                    <>
                        <div
                            className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
                            style={{ borderColor: 'var(--accent-gold) transparent transparent transparent' }}
                        />
                        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Traitement...</span>
                    </>
                ) : (
                    <>
                        <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center"
                            style={{ background: 'var(--bg-secondary)' }}
                        >
                            <i className="fa-solid fa-image text-2xl" style={{ color: 'var(--text-muted)' }} />
                        </div>
                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                            Sélectionner une photo
                        </span>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            JPG, PNG • Max 5MB
                        </span>
                    </>
                )}
            </button>

            <button
                onClick={() => setStep(1)}
                className="w-full mt-4 py-3 rounded-xl text-sm font-medium"
                style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
            >
                ← Retour
            </button>
        </div>
    )

    const renderStep3 = () => (
        <div className="px-2">
            <h2 className="text-lg font-medium text-center mb-2" style={{ color: 'var(--text-primary)' }}>
                Prévisualisation
            </h2>
            <p className="text-xs text-center mb-6" style={{ color: 'var(--text-muted)' }}>
                Voici à quoi ressemblera votre carte publique
            </p>

            {selectedImage && selectedCategory && (
                <div className="flex justify-center mb-6">
                    <PublicCardDisplay
                        imageUrl={selectedImage}
                        category={selectedCategory}
                        stats={userStats}
                        userName={userName}
                        username={username}
                        avatarUrl={avatarUrl}
                        size="medium"
                    />
                </div>
            )}

            <div className="flex gap-3">
                <button
                    onClick={() => setStep(2)}
                    className="flex-1 py-4 rounded-xl text-sm font-medium"
                    style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
                >
                    Changer photo
                </button>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 py-4 rounded-xl text-sm font-medium"
                    style={{
                        background: 'var(--accent-sage)',
                        color: 'white',
                        opacity: isSaving ? 0.7 : 1
                    }}
                >
                    {isSaving ? 'Création...' : 'Créer ma carte'}
                </button>
            </div>
        </div>
    )

    return (
        <BottomSheet isOpen={isOpen} onClose={handleClose} initialHeight="auto" maxHeight="90vh">
            {renderStepIndicator()}

            {error && (
                <div className="mx-2 mb-4 p-3 rounded-xl" style={{ background: 'rgba(212, 165, 165, 0.1)' }}>
                    <p className="text-sm text-center" style={{ color: 'var(--accent-rose)' }}>
                        <i className="fa-solid fa-circle-exclamation mr-2" />{error}
                    </p>
                </div>
            )}

            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}

            <div className="h-6" />
        </BottomSheet>
    )
}
