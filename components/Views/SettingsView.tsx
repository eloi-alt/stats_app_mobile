'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import { useTheme, ThemeMode } from '@/contexts/ThemeContext'
import { supabase } from '@/utils/supabase/client'

interface SettingsViewProps {
    onBack?: () => void
}

export default function SettingsView({ onBack }: SettingsViewProps) {
    const router = useRouter()
    const { language, setLanguage, t } = useLanguage()
    const { theme, setTheme } = useTheme()
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const [notifications, setNotifications] = useState(true)
    const [privacy, setPrivacy] = useState<'public' | 'friends' | 'private'>('friends')
    const [isSigningOut, setIsSigningOut] = useState(false)

    const handleThemeChange = (newTheme: ThemeMode) => {
        setTheme(newTheme)
    }

    const handleSignOut = async () => {
        setIsSigningOut(true)
        try {
            await supabase.auth.signOut()
            router.push('/landing')
        } catch (error) {
            console.error('Sign out error:', error)
            setIsSigningOut(false)
        }
    }

    return (
        <div ref={scrollContainerRef} className="px-4 pb-6">
            {/* Title */}
            <h1 className="text-xl font-light mb-6" style={{ color: 'var(--text-primary)' }}>
                {t('settings')}
            </h1>

            {/* Theme Selection - Visual */}
            <div className="mb-6">
                <div className="text-xs uppercase tracking-widest mb-3 px-1" style={{ color: 'var(--text-muted)' }}>
                    {t('appearance')}
                </div>
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { value: 'light' as ThemeMode, icon: 'fa-sun', label: t('light') },
                        { value: 'dark' as ThemeMode, icon: 'fa-moon', label: t('dark') },
                        { value: 'system' as ThemeMode, icon: 'fa-circle-half-stroke', label: t('system') },
                    ].map((option) => (
                        <button
                            key={option.value}
                            onClick={() => handleThemeChange(option.value)}
                            className="py-5 rounded-2xl flex flex-col items-center gap-2 transition-all active:scale-95"
                            style={{
                                background: theme === option.value
                                    ? 'linear-gradient(135deg, rgba(201, 169, 98, 0.15) 0%, rgba(184, 165, 212, 0.15) 100%)'
                                    : 'var(--glass-bg)',
                                border: theme === option.value
                                    ? '1px solid var(--accent-gold)'
                                    : '1px solid var(--border-light)',
                            }}
                        >
                            <i
                                className={`fa-solid ${option.icon} text-lg`}
                                style={{ color: theme === option.value ? 'var(--accent-gold)' : 'var(--text-muted)' }}
                            />
                            <span
                                className="text-xs font-medium"
                                style={{ color: theme === option.value ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                            >
                                {option.label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Language Selection - Visual */}
            <div className="mb-6">
                <div className="text-xs uppercase tracking-widest mb-3 px-1" style={{ color: 'var(--text-muted)' }}>
                    {t('language')}
                </div>
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { value: 'en' as const, flag: '🇬🇧', label: 'English' },
                        { value: 'fr' as const, flag: '🇫🇷', label: 'Français' },
                        { value: 'es' as const, flag: '🇪🇸', label: 'Español' },
                    ].map((option) => (
                        <button
                            key={option.value}
                            onClick={() => setLanguage(option.value)}
                            className="py-5 rounded-2xl flex flex-col items-center gap-2 transition-all active:scale-95"
                            style={{
                                background: language === option.value
                                    ? 'linear-gradient(135deg, rgba(165, 196, 212, 0.15) 0%, rgba(139, 168, 136, 0.15) 100%)'
                                    : 'var(--glass-bg)',
                                border: language === option.value
                                    ? '1px solid var(--accent-sky)'
                                    : '1px solid var(--border-light)',
                            }}
                        >
                            <span className="text-2xl">{option.flag}</span>
                            <span
                                className="text-xs font-medium"
                                style={{ color: language === option.value ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                            >
                                {option.label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Preferences */}
            <div className="mb-6">
                <div className="text-xs uppercase tracking-widest mb-3 px-1" style={{ color: 'var(--text-muted)' }}>
                    {t('general')}
                </div>

                <div
                    className="rounded-2xl overflow-hidden"
                    style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-light)' }}
                >
                    {/* Notifications */}
                    <div
                        className="flex items-center justify-between p-4"
                        style={{ borderBottom: '1px solid var(--border-subtle)' }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(139, 168, 136, 0.15)' }}>
                                <i className="fa-solid fa-bell text-sm" style={{ color: 'var(--accent-sage)' }} />
                            </div>
                            <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{t('notifications')}</span>
                        </div>
                        <button
                            onClick={() => setNotifications(!notifications)}
                            className="w-12 h-7 rounded-full relative transition-all"
                            style={{ background: notifications ? 'var(--accent-sage)' : 'var(--border-light)' }}
                        >
                            <div
                                className="absolute top-1 w-5 h-5 rounded-full shadow-sm transition-transform"
                                style={{
                                    background: 'var(--bg-primary)',
                                    transform: notifications ? 'translateX(24px)' : 'translateX(4px)',
                                }}
                            />
                        </button>
                    </div>

                    {/* Privacy */}
                    <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(184, 165, 212, 0.15)' }}>
                                <i className="fa-solid fa-lock text-sm" style={{ color: 'var(--accent-lavender)' }} />
                            </div>
                            <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{t('privacy')}</span>
                        </div>
                        <select
                            value={privacy}
                            onChange={(e) => setPrivacy(e.target.value as 'public' | 'friends' | 'private')}
                            className="text-sm px-3 py-1.5 rounded-lg appearance-none cursor-pointer"
                            style={{ background: 'var(--bg-primary)', color: 'var(--text-secondary)', border: 'none' }}
                        >
                            <option value="public">{t('public')}</option>
                            <option value="friends">{t('friends')}</option>
                            <option value="private">{t('private')}</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Data & About */}
            <div className="mb-6">
                <div className="text-xs uppercase tracking-widest mb-3 px-1" style={{ color: 'var(--text-muted)' }}>
                    {t('about')}
                </div>

                <div
                    className="rounded-2xl overflow-hidden"
                    style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-light)' }}
                >
                    <div
                        className="flex items-center justify-between p-4"
                        style={{ borderBottom: '1px solid var(--border-subtle)' }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(165, 196, 212, 0.15)' }}>
                                <i className="fa-solid fa-database text-sm" style={{ color: 'var(--accent-sky)' }} />
                            </div>
                            <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{t('dataStorage')}</span>
                        </div>
                        <i className="fa-solid fa-chevron-right text-xs" style={{ color: 'var(--text-muted)' }} />
                    </div>

                    <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(212, 165, 165, 0.15)' }}>
                                <i className="fa-solid fa-circle-info text-sm" style={{ color: 'var(--accent-rose)' }} />
                            </div>
                            <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{t('version')}</span>
                        </div>
                        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>1.0.0</span>
                    </div>
                </div>
            </div>

            {/* Sign Out */}
            <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="w-full py-4 rounded-2xl text-sm font-medium transition-all active:scale-98"
                style={{
                    background: 'rgba(212, 165, 165, 0.15)',
                    color: 'var(--accent-rose)',
                    opacity: isSigningOut ? 0.6 : 1
                }}
            >
                {isSigningOut ? (
                    <>
                        <div className="inline-block w-4 h-4 border-2 border-t-transparent rounded-full animate-spin mr-2" style={{ borderColor: 'var(--accent-rose) transparent transparent transparent' }} />
                        Déconnexion...
                    </>
                ) : (
                    <>
                        <i className="fa-solid fa-right-from-bracket mr-2" />
                        {t('signOut')}
                    </>
                )}
            </button>

            <div className="h-24" />
        </div>
    )
}
