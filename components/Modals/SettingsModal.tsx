'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Modal from './Modal'
import { useLanguage } from '@/contexts/LanguageContext'
import { useTheme, ThemeMode } from '@/contexts/ThemeContext'
import { ThomasMorel } from '@/data/mockData'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onThemeChange?: (isDark: boolean) => void
}

export default function SettingsModal({ isOpen, onClose, onThemeChange }: SettingsModalProps) {
  const { language, setLanguage, t } = useLanguage()
  const { theme, setTheme, isDark } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [privacy, setPrivacy] = useState<'public' | 'friends' | 'private'>('friends')
  const [showVerificationModal, setShowVerificationModal] = useState(false)

  // Pattern mounted pour éviter les erreurs SSR
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleThemeChange = (newTheme: ThemeMode) => {
    setTheme(newTheme)
    onThemeChange?.(newTheme === 'dark')
  }

  // Theme option buttons
  const themeOptions: { value: ThemeMode; label: string; icon: string }[] = [
    { value: 'light', label: t('light') || 'Light', icon: 'fa-sun' },
    { value: 'dark', label: t('dark') || 'Dark', icon: 'fa-moon' },
    { value: 'system', label: t('system') || 'Auto', icon: 'fa-circle-half-stroke' },
  ]

  return (
    <Modal isOpen={isOpen} onClose={onClose} id="modal-settings" title={t('settings')}>
      <div
        className="rounded-2xl overflow-hidden mb-5"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-light)',
        }}
      >
        {/* Notifications */}
        <div
          className="flex justify-between items-center p-4"
          style={{ borderBottom: '1px solid var(--border-light)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(139, 168, 136, 0.15)' }}
            >
              <i className="fa-solid fa-bell text-sm" style={{ color: 'var(--accent-sage)' }} />
            </div>
            <span style={{ color: 'var(--text-primary)' }}>{t('notifications')}</span>
          </div>
          <button
            onClick={() => setNotifications(!notifications)}
            className="w-12 h-7 rounded-full relative transition-colors duration-200"
            style={{
              background: notifications ? 'var(--accent-sage)' : 'var(--hover-overlay)',
            }}
            aria-label={notifications ? 'Disable notifications' : 'Enable notifications'}
          >
            <div
              className="absolute top-1 w-5 h-5 rounded-full shadow-sm transition-transform duration-200"
              style={{
                background: 'var(--bg-elevated)',
                transform: notifications ? 'translateX(24px)' : 'translateX(4px)',
              }}
            />
          </button>
        </div>

        {/* Privacy */}
        <div
          className="flex justify-between items-center p-4"
          style={{ borderBottom: '1px solid var(--border-light)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(184, 165, 212, 0.15)' }}
            >
              <i className="fa-solid fa-lock text-sm" style={{ color: 'var(--accent-lavender)' }} />
            </div>
            <span style={{ color: 'var(--text-primary)' }}>{t('privacy')}</span>
          </div>
          <select
            value={privacy}
            onChange={(e) => setPrivacy(e.target.value as 'public' | 'friends' | 'private')}
            className="text-sm px-3 py-1.5 rounded-lg appearance-none cursor-pointer"
            style={{
              background: 'var(--hover-overlay)',
              color: 'var(--text-secondary)',
              border: 'none',
            }}
          >
            <option value="public">{t('public')}</option>
            <option value="friends">{t('friends')}</option>
            <option value="private">{t('private')}</option>
          </select>
        </div>

        {/* Language */}
        <div className="flex justify-between items-center p-4">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(165, 196, 212, 0.15)' }}
            >
              <i className="fa-solid fa-globe text-sm" style={{ color: 'var(--accent-sky)' }} />
            </div>
            <span style={{ color: 'var(--text-primary)' }}>{t('language')}</span>
          </div>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as 'en' | 'fr' | 'es')}
            className="text-sm px-3 py-1.5 rounded-lg appearance-none cursor-pointer"
            style={{
              background: 'var(--hover-overlay)',
              color: 'var(--text-secondary)',
              border: 'none',
            }}
          >
            <option value="en">English 🇬🇧</option>
            <option value="fr">Français 🇫🇷</option>
            <option value="es">Español 🇪🇸</option>
          </select>
        </div>
      </div>

      {/* Theme Section - Improved with 3 options */}
      <div
        className="text-[10px] uppercase tracking-[0.2em] font-medium mb-3 px-1"
        style={{ color: 'var(--text-tertiary)' }}
      >
        {t('appearance')}
      </div>

      <div
        className="rounded-2xl overflow-hidden mb-5 p-4"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-light)',
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(201, 169, 98, 0.15)' }}
          >
            <i className="fa-solid fa-palette text-sm" style={{ color: 'var(--accent-gold)' }} />
          </div>
          <span style={{ color: 'var(--text-primary)' }}>{t('theme')}</span>
        </div>

        {/* Theme selector - 3 pills */}
        <div
          className="flex rounded-xl p-1 gap-1"
          style={{ background: 'var(--hover-overlay)' }}
        >
          {themeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleThemeChange(option.value)}
              className="flex-1 py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200"
              style={{
                background: theme === option.value ? 'var(--bg-elevated)' : 'transparent',
                color: theme === option.value ? 'var(--text-primary)' : 'var(--text-secondary)',
                boxShadow: theme === option.value ? 'var(--shadow-sm)' : 'none',
              }}
              aria-pressed={theme === option.value}
            >
              <i className={`fa-solid ${option.icon} text-xs`} />
              <span className="text-sm font-medium">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Verification Section */}
      <div
        className="text-[10px] uppercase tracking-[0.2em] font-medium mb-3 px-1"
        style={{ color: 'var(--text-tertiary)' }}
      >
        Account
      </div>

      <div
        className="rounded-2xl overflow-hidden mb-5"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-light)',
        }}
      >
        <button
          onClick={() => setShowVerificationModal(true)}
          className="w-full flex justify-between items-center p-4 transition-colors"
          style={{ borderBottom: '1px solid var(--border-light)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(201, 169, 98, 0.15)' }}
            >
              <i className="fa-solid fa-badge-check text-sm" style={{ color: 'var(--accent-gold)' }} />
            </div>
            <div className="text-left">
              <div style={{ color: 'var(--text-primary)' }}>Verification</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                {ThomasMorel.identity.isVerified ? 'Verified account' : 'Get verified'}
              </div>
            </div>
          </div>
          {ThomasMorel.identity.isVerified ? (
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: 'var(--accent-gold)' }}
            >
              <i className="fa-solid fa-check text-xs text-white" />
            </div>
          ) : (
            <i className="fa-solid fa-chevron-right text-xs" style={{ color: 'var(--text-tertiary)' }} />
          )}
        </button>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <button
          className="w-full py-3.5 rounded-2xl text-sm font-medium transition-colors"
          style={{
            background: 'rgba(212, 165, 165, 0.15)',
            color: 'var(--accent-rose)',
          }}
        >
          <i className="fa-solid fa-right-from-bracket mr-2" />
          {t('signOut')}
        </button>
      </div>

      {/* Verification Modal - Bottom Sheet Standard avec Portal */}
      {mounted && showVerificationModal && createPortal(
        <div
          className="fixed inset-0 z-[99999] flex flex-col justify-end"
          onClick={() => setShowVerificationModal(false)}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 backdrop-blur-md"
            style={{ background: 'var(--bg-overlay)' }}
          />

          {/* Content Container - Toujours collé au sol */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full rounded-t-[32px] pb-safe pt-6 px-5 max-h-[70vh] overflow-y-auto cursor-default animate-slide-up"
            style={{
              background: 'var(--bg-elevated)',
              boxShadow: '0 -8px 40px rgba(0, 0, 0, 0.15)',
              borderTop: '1px solid var(--border-light)',
            }}
          >
            {/* Handle bar */}
            <div
              className="w-10 h-1 rounded-full mx-auto mb-6"
              style={{ background: 'var(--separator-color)' }}
            />

            {/* Close button */}
            <button
              onClick={() => setShowVerificationModal(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              style={{
                background: 'var(--hover-overlay)',
                color: 'var(--text-tertiary)',
              }}
            >
              <i className="fa-solid fa-xmark text-sm" />
            </button>

            <div className="text-center mb-6">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(201, 169, 98, 0.15)' }}
              >
                <i className="fa-solid fa-badge-check text-3xl" style={{ color: 'var(--accent-gold)' }} />
              </div>
              <h3 className="text-xl font-light mb-2" style={{ color: 'var(--text-primary)' }}>
                {ThomasMorel.identity.isVerified ? 'Verified Account' : 'Get Verified'}
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {ThomasMorel.identity.isVerified
                  ? 'Your account is verified. You can share your verified badge with others.'
                  : 'Verify your identity to get a verified badge and unlock exclusive features.'}
              </p>
            </div>

            {!ThomasMorel.identity.isVerified && (
              <div className="space-y-3 mb-5">
                <div
                  className="p-4 rounded-xl"
                  style={{ background: 'var(--hover-overlay)' }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <i className="fa-solid fa-id-card" style={{ color: 'var(--accent-gold)' }} />
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Identity Verification</span>
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                    Submit a government-issued ID for verification
                  </p>
                </div>
                <div
                  className="p-4 rounded-xl"
                  style={{ background: 'var(--hover-overlay)' }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <i className="fa-solid fa-link" style={{ color: 'var(--accent-gold)' }} />
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Social Links</span>
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                    Connect your social media accounts
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={() => {
                setShowVerificationModal(false)
                // In real app, this would trigger verification process
              }}
              className="w-full py-3.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: ThomasMorel.identity.isVerified
                  ? 'rgba(201, 169, 98, 0.15)'
                  : 'linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-sand) 100%)',
                color: ThomasMorel.identity.isVerified ? 'var(--accent-gold)' : 'white',
                boxShadow: ThomasMorel.identity.isVerified ? 'none' : '0 4px 12px rgba(201, 169, 98, 0.3)',
              }}
            >
              {ThomasMorel.identity.isVerified ? 'Verified ✓' : 'Start Verification'}
            </button>
          </div>
        </div>,
        document.body
      )}
    </Modal>
  )
}
