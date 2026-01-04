'use client'

import { useMemo } from 'react'
import Modal from './Modal'
import { ThomasMorel } from '@/data/mockData'
import { useLanguage } from '@/contexts/LanguageContext'

interface CountryDetailModalProps {
    isOpen: boolean
    onClose: () => void
    countryCode: string
    countryName: string
}

// Country flag emoji from code
const getFlagEmoji = (countryCode: string): string => {
    if (!countryCode) return '🏳️'
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0))
    return String.fromCodePoint(...codePoints)
}

export default function CountryDetailModal({
    isOpen,
    onClose,
    countryCode,
    countryName,
}: CountryDetailModalProps) {
    const { t } = useLanguage()

    // Get full country data
    const countryData = useMemo(() => {
        return ThomasMorel.moduleB.countriesVisited.find(c => c.code === countryCode)
    }, [countryCode])

    // Get trips to this country
    const countryTrips = useMemo(() => {
        return ThomasMorel.moduleB.trips.filter(trip =>
            trip.destination.country === countryCode
        )
    }, [countryCode])

    // Mock photos for gallery placeholder
    const mockPhotos = [
        { id: 1, placeholder: true },
        { id: 2, placeholder: true },
        { id: 3, placeholder: true },
        { id: 4, placeholder: true },
    ]

    if (!countryData) return null

    return (
        <Modal isOpen={isOpen} onClose={onClose} id="country-detail-modal" title={countryName}>
            {/* Country header with flag */}
            <div className="flex items-center gap-4 mb-6">
                <span className="text-5xl">{getFlagEmoji(countryCode)}</span>
                <div className="flex-1">
                    <div className="text-2xl font-light text-display" style={{ color: 'var(--text-primary)' }}>
                        {countryName}
                    </div>
                    <div className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                        {countryData.visitCount} visit{countryData.visitCount > 1 ? 's' : ''} •{' '}
                        {countryData.regions?.length || 0} regions explored
                    </div>
                </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(165, 196, 212, 0.08)' }}>
                    <div className="text-lg font-light" style={{ color: 'var(--accent-sky)' }}>
                        {countryData.visitCount}
                    </div>
                    <div className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                        Visits
                    </div>
                </div>
                <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(201, 169, 98, 0.08)' }}>
                    <div className="text-lg font-light" style={{ color: 'var(--accent-gold)' }}>
                        {countryTrips.reduce((acc, t) => {
                            const start = new Date(t.startDate)
                            const end = new Date(t.endDate)
                            return acc + Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
                        }, 0)}
                    </div>
                    <div className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                        Days
                    </div>
                </div>
                <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(139, 168, 136, 0.08)' }}>
                    <div className="text-lg font-light" style={{ color: 'var(--accent-sage)' }}>
                        {countryData.regions?.length || 0}
                    </div>
                    <div className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                        Regions
                    </div>
                </div>
            </div>

            {/* Regions visited */}
            {countryData.regions && countryData.regions.length > 0 && (
                <>
                    <div
                        className="text-[10px] uppercase tracking-[0.2em] font-medium mb-3 px-1"
                        style={{ color: 'var(--text-tertiary)' }}
                    >
                        Regions Explored
                    </div>
                    <div className="flex flex-wrap gap-2 mb-5">
                        {countryData.regions.map((region) => (
                            <span
                                key={region.name}
                                className="px-3 py-1.5 rounded-full text-xs font-medium"
                                style={{
                                    background: 'rgba(201, 169, 98, 0.1)',
                                    color: 'var(--accent-gold)',
                                }}
                            >
                                {region.name}
                            </span>
                        ))}
                    </div>
                </>
            )}

            {/* Trip history */}
            <div
                className="text-[10px] uppercase tracking-[0.2em] font-medium mb-3 px-1"
                style={{ color: 'var(--text-tertiary)' }}
            >
                Trip History
            </div>
            <div className="space-y-2 mb-5">
                {countryTrips.map((trip) => (
                    <div
                        key={trip.id}
                        className="rounded-xl p-3 flex items-center gap-3"
                        style={{ background: 'rgba(0, 0, 0, 0.02)' }}
                    >
                        <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ background: 'rgba(165, 196, 212, 0.1)' }}
                        >
                            <i className="fa-solid fa-plane" style={{ color: 'var(--accent-sky)' }} />
                        </div>
                        <div className="flex-1">
                            <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                {trip.destination.city}
                            </div>
                            <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                                {new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                {' → '}
                                {new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                            </div>
                        </div>
                        <span
                            className="px-2 py-1 rounded-full text-[9px] font-medium"
                            style={{
                                background: trip.purpose === 'leisure' ? 'rgba(139, 168, 136, 0.1)' : 'rgba(184, 165, 212, 0.1)',
                                color: trip.purpose === 'leisure' ? 'var(--accent-sage)' : 'var(--accent-lavender)',
                            }}
                        >
                            {trip.purpose}
                        </span>
                    </div>
                ))}
            </div>

            {/* Photo gallery placeholder */}
            <div
                className="text-[10px] uppercase tracking-[0.2em] font-medium mb-3 px-1 flex items-center gap-2"
                style={{ color: 'var(--text-tertiary)' }}
            >
                <i className="fa-solid fa-images text-xs" />
                Trip Photos
                <span className="text-[8px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,0,0,0.05)' }}>
                    Coming Soon
                </span>
            </div>
            <div className="grid grid-cols-4 gap-2 mb-5">
                {mockPhotos.map((photo) => (
                    <div
                        key={photo.id}
                        className="aspect-square rounded-xl flex items-center justify-center"
                        style={{ background: 'rgba(0, 0, 0, 0.03)' }}
                    >
                        <i className="fa-solid fa-image text-lg" style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
                    </div>
                ))}
            </div>

            {/* Last visit info */}
            {countryData.lastVisit && (
                <div
                    className="rounded-xl p-4 text-center"
                    style={{ background: 'rgba(139, 168, 136, 0.08)' }}
                >
                    <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        Last visited
                    </div>
                    <div className="text-sm font-medium" style={{ color: 'var(--accent-sage)' }}>
                        {new Date(countryData.lastVisit).toLocaleDateString('en-US', {
                            month: 'long',
                            year: 'numeric',
                        })}
                    </div>
                </div>
            )}

            {/* Close button */}
            <button
                onClick={onClose}
                className="w-full py-3.5 rounded-2xl text-sm font-medium transition-all mt-5"
                style={{
                    background: 'var(--accent-sky)',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(165, 196, 212, 0.3)',
                }}
            >
                {t('close')}
            </button>
        </Modal>
    )
}
