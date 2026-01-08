'use client'

import { useState, useMemo, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { COUNTRY_NAMES } from '@/hooks/useTravelData'

interface AddCountryModalProps {
    isOpen: boolean
    onClose: () => void
    onAddCountry: (countryCode: string, countryName: string, year: number) => Promise<boolean>
    onAddTrip: (countryCode: string, year: number, city?: string, photoUrl?: string) => Promise<boolean>
    onUploadPhoto: (file: File) => Promise<string | null>
    isDemo: boolean
}

// Get flag emoji from country code
const getFlagEmoji = (countryCode: string): string => {
    if (!countryCode) return '🏳️'
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0))
    return String.fromCodePoint(...codePoints)
}

// All countries as array for search
const ALL_COUNTRIES = Object.entries(COUNTRY_NAMES).map(([code, name]) => ({
    code,
    name,
    flag: getFlagEmoji(code)
})).sort((a, b) => a.name.localeCompare(b.name, 'fr'))

export default function AddCountryModal({
    isOpen,
    onClose,
    onAddCountry,
    onAddTrip,
    onUploadPhoto,
    isDemo
}: AddCountryModalProps) {
    const [step, setStep] = useState<'country' | 'details'>('country')
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCountry, setSelectedCountry] = useState<{ code: string; name: string } | null>(null)
    const [year, setYear] = useState(new Date().getFullYear())
    const [city, setCity] = useState('')
    const [photoFile, setPhotoFile] = useState<File | null>(null)
    const [photoPreview, setPhotoPreview] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Filter countries based on search
    const filteredCountries = useMemo(() => {
        if (!searchQuery.trim()) return ALL_COUNTRIES.slice(0, 20)
        const query = searchQuery.toLowerCase()
        return ALL_COUNTRIES.filter(c =>
            c.name.toLowerCase().includes(query) ||
            c.code.toLowerCase().includes(query)
        ).slice(0, 20)
    }, [searchQuery])

    // Handle country selection
    const handleSelectCountry = (country: { code: string; name: string }) => {
        setSelectedCountry(country)
        setStep('details')
        setError(null)
    }

    // Handle photo selection
    const handlePhotoSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setPhotoFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }, [])

    // Handle submit
    const handleSubmit = async () => {
        if (!selectedCountry) return
        if (isDemo) {
            setError('Mode démo : les modifications ne sont pas sauvegardées')
            return
        }

        setIsSubmitting(true)
        setError(null)

        try {
            let photoUrl: string | undefined

            // Upload photo if selected
            if (photoFile) {
                const url = await onUploadPhoto(photoFile)
                if (url) photoUrl = url
            }

            // Add trip (which also adds/updates country)
            const success = await onAddTrip(
                selectedCountry.code,
                year,
                city || undefined,
                photoUrl
            )

            if (success) {
                handleClose()
            } else {
                setError('Erreur lors de l\'ajout du voyage')
            }
        } catch {
            setError('Une erreur est survenue')
        } finally {
            setIsSubmitting(false)
        }
    }

    // Reset and close
    const handleClose = () => {
        setStep('country')
        setSearchQuery('')
        setSelectedCountry(null)
        setYear(new Date().getFullYear())
        setCity('')
        setPhotoFile(null)
        setPhotoPreview(null)
        setError(null)
        onClose()
    }

    // Back to country selection
    const handleBack = () => {
        setStep('country')
        setSelectedCountry(null)
        setError(null)
    }

    if (!isOpen) return null

    return createPortal(
        <div
            className="fixed inset-0 z-[99999] flex items-end justify-center"
            onClick={handleClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-md" />

            {/* Modal */}
            <div
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-h-[85vh] rounded-t-[32px] overflow-hidden"
                style={{
                    background: 'var(--bg-elevated)',
                    boxShadow: '0 -8px 40px rgba(0,0,0,0.2)'
                }}
            >
                {/* Drag handle */}
                <div className="w-10 h-1 rounded-full mx-auto mt-4 mb-2" style={{ background: 'var(--separator-color)' }} />

                {/* Header */}
                <div className="flex items-center justify-between px-5 pb-4">
                    <div className="flex items-center gap-3">
                        {step === 'details' && (
                            <button
                                onClick={handleBack}
                                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                                style={{ background: 'var(--hover-overlay)' }}
                            >
                                <i className="fa-solid fa-arrow-left text-sm" style={{ color: 'var(--text-secondary)' }} />
                            </button>
                        )}
                        <h2
                            className="text-xl font-light"
                            style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond, Georgia, serif' }}
                        >
                            {step === 'country' ? 'Ajouter un voyage' : selectedCountry?.name}
                        </h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                        style={{ background: 'var(--hover-overlay)' }}
                    >
                        <i className="fa-solid fa-xmark text-sm" style={{ color: 'var(--text-tertiary)' }} />
                    </button>
                </div>

                {/* Content */}
                <div className="px-5 pb-8 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 100px)' }}>
                    {step === 'country' ? (
                        <>
                            {/* Search */}
                            <div className="relative mb-4">
                                <i
                                    className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-sm"
                                    style={{ color: 'var(--text-tertiary)' }}
                                />
                                <input
                                    type="text"
                                    placeholder="Rechercher un pays..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full py-3 pl-11 pr-4 rounded-xl text-sm"
                                    style={{
                                        background: 'var(--bg-card)',
                                        border: '1px solid var(--border-light)',
                                        color: 'var(--text-primary)',
                                        outline: 'none'
                                    }}
                                    autoFocus
                                />
                            </div>

                            {/* Countries grid */}
                            <div className="grid grid-cols-2 gap-2">
                                {filteredCountries.map(country => (
                                    <button
                                        key={country.code}
                                        onClick={() => handleSelectCountry(country)}
                                        className="flex items-center gap-3 p-3 rounded-xl transition-all active:scale-95"
                                        style={{
                                            background: 'var(--bg-card)',
                                            border: '1px solid var(--border-light)'
                                        }}
                                    >
                                        <span className="text-2xl">{country.flag}</span>
                                        <div className="flex-1 text-left">
                                            <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                                                {country.name}
                                            </div>
                                            <div className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                                                {country.code}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {filteredCountries.length === 0 && (
                                <div className="text-center py-8" style={{ color: 'var(--text-tertiary)' }}>
                                    <i className="fa-solid fa-globe text-3xl mb-2 block opacity-50" />
                                    <p className="text-sm">Aucun pays trouvé</p>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            {/* Selected country display */}
                            <div
                                className="flex items-center gap-4 p-4 rounded-2xl mb-6"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(165, 196, 212, 0.1) 0%, rgba(165, 196, 212, 0.05) 100%)',
                                    border: '1px solid rgba(165, 196, 212, 0.2)'
                                }}
                            >
                                <span className="text-5xl">{getFlagEmoji(selectedCountry?.code || '')}</span>
                                <div>
                                    <div className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
                                        {selectedCountry?.name}
                                    </div>
                                    <div className="text-sm" style={{ color: 'var(--accent-sky)' }}>
                                        {selectedCountry?.code}
                                    </div>
                                </div>
                            </div>

                            {/* Year selection */}
                            <div className="mb-5">
                                <label className="text-[10px] uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-tertiary)' }}>
                                    Année de visite
                                </label>
                                <input
                                    type="number"
                                    value={year}
                                    onChange={(e) => setYear(parseInt(e.target.value) || new Date().getFullYear())}
                                    min={1950}
                                    max={new Date().getFullYear()}
                                    className="w-full py-3 px-4 rounded-xl text-sm"
                                    style={{
                                        background: 'var(--bg-card)',
                                        border: '1px solid var(--border-light)',
                                        color: 'var(--text-primary)',
                                        outline: 'none'
                                    }}
                                />
                            </div>

                            {/* City (optional) */}
                            <div className="mb-5">
                                <label className="text-[10px] uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-tertiary)' }}>
                                    Ville principale (optionnel)
                                </label>
                                <input
                                    type="text"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    placeholder="Ex: Paris, Tokyo, New York..."
                                    className="w-full py-3 px-4 rounded-xl text-sm"
                                    style={{
                                        background: 'var(--bg-card)',
                                        border: '1px solid var(--border-light)',
                                        color: 'var(--text-primary)',
                                        outline: 'none'
                                    }}
                                />
                            </div>

                            {/* Photo upload */}
                            <div className="mb-6">
                                <label className="text-[10px] uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-tertiary)' }}>
                                    Photo souvenir (optionnel)
                                </label>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    accept="image/*"
                                    onChange={handlePhotoSelect}
                                    className="hidden"
                                />
                                {photoPreview ? (
                                    <div className="relative">
                                        <img
                                            src={photoPreview}
                                            alt="Preview"
                                            className="w-full h-40 object-cover rounded-xl"
                                        />
                                        <button
                                            onClick={() => {
                                                setPhotoFile(null)
                                                setPhotoPreview(null)
                                            }}
                                            className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center"
                                            style={{ background: 'rgba(0,0,0,0.5)' }}
                                        >
                                            <i className="fa-solid fa-xmark text-white text-sm" />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full py-8 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all"
                                        style={{
                                            borderColor: 'var(--border-light)',
                                            background: 'var(--bg-card)'
                                        }}
                                    >
                                        <i className="fa-solid fa-camera text-2xl" style={{ color: 'var(--text-tertiary)' }} />
                                        <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                                            Ajouter une photo
                                        </span>
                                    </button>
                                )}
                            </div>

                            {/* Error message */}
                            {error && (
                                <div
                                    className="p-3 rounded-xl mb-4 text-sm flex items-center gap-2"
                                    style={{
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        color: '#ef4444',
                                        border: '1px solid rgba(239, 68, 68, 0.2)'
                                    }}
                                >
                                    <i className="fa-solid fa-exclamation-circle" />
                                    {error}
                                </div>
                            )}

                            {/* Demo warning */}
                            {isDemo && (
                                <div
                                    className="p-3 rounded-xl mb-4 text-sm flex items-center gap-2"
                                    style={{
                                        background: 'rgba(201, 169, 98, 0.1)',
                                        color: 'var(--accent-gold)',
                                        border: '1px solid rgba(201, 169, 98, 0.2)'
                                    }}
                                >
                                    <i className="fa-solid fa-info-circle" />
                                    Mode démo : connectez-vous pour sauvegarder
                                </div>
                            )}

                            {/* Submit button */}
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting || isDemo}
                                className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
                                style={{
                                    background: 'linear-gradient(135deg, var(--accent-sky) 0%, #7aa8c4 100%)',
                                    color: 'white',
                                    boxShadow: '0 4px 16px rgba(165, 196, 212, 0.3)'
                                }}
                            >
                                {isSubmitting ? (
                                    <>
                                        <i className="fa-solid fa-spinner fa-spin" />
                                        <span>Ajout en cours...</span>
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-solid fa-plus" />
                                        <span className="font-medium">Ajouter ce voyage</span>
                                    </>
                                )}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>,
        document.body
    )
}
