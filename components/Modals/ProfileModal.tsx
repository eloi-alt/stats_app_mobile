'use client'

import { useState } from 'react'
import Modal from './Modal'
import SettingsModal from './SettingsModal'
import { ThomasMorel } from '@/data/mockData'
import { useLanguage } from '@/contexts/LanguageContext'

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
  onToggleTheme: () => void
  onNavigate?: (viewId: string) => void
}

export default function ProfileModal({ isOpen, onClose, onToggleTheme, onNavigate }: ProfileModalProps) {
  const { t } = useLanguage()
  const [settingsModalOpen, setSettingsModalOpen] = useState(false)
  const [isEditingBio, setIsEditingBio] = useState(false)
  const [bio, setBio] = useState(ThomasMorel.identity.bio)
  const user = ThomasMorel.identity

  // Generate QR code URL for profile
  const profileUrl = `https://statsapp.com/profile/${user.id}`
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(profileUrl)}`

  const handleStatClick = (statType: 'global' | 'countries' | 'achievements') => {
    if (!onNavigate) return
    onClose()
    switch (statType) {
      case 'global':
        onNavigate('view-home')
        break
      case 'countries':
        onNavigate('view-map')
        break
      case 'achievements':
        onNavigate('view-pro')
        break
    }
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} id="modal-profile">
        {/* Profile header with QR Code - Magnifique Design */}
        <div
          className="relative rounded-3xl p-6 mb-6 text-center overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.85) 0%, rgba(30, 30, 30, 0.9) 100%)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          }}
        >
          {/* Decorative gradient overlay */}
          <div
            className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20"
            style={{
              background: 'radial-gradient(circle, var(--accent-gold) 0%, transparent 70%)',
              filter: 'blur(40px)',
            }}
          />

          <div className="relative z-10">
            <div className="relative inline-block mb-4">
              <div className="avatar-fade" style={{ width: '112px', height: '112px' }}>
                <img
                  src={user.avatar}
                  className="w-full h-full rounded-full object-cover"
                  alt="Profile"
                />
              </div>
              {user.isVerified && (
                <div
                  className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center"
                  style={{
                    background: 'var(--accent-gold)',
                    boxShadow: '0 4px 12px rgba(201, 169, 98, 0.6)',
                  }}
                >
                  <i className="fa-solid fa-check text-white text-xs" />
                </div>
              )}
            </div>
            <h2
              className="text-2xl font-light text-display mb-2"
              style={{ color: 'white' }}
            >
              {user.displayName}
            </h2>
            {isEditingBio ? (
              <div className="mb-3">
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  onBlur={() => setIsEditingBio(false)}
                  className="w-full bg-transparent border border-white/20 rounded-lg px-3 py-2 resize-none"
                  style={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    minHeight: '60px',
                    fontSize: '16px',
                    lineHeight: '1.5',
                  }}
                  autoFocus
                  rows={2}
                  inputMode="text"
                />
              </div>
            ) : (
              <p
                className="text-sm mb-3 opacity-90 cursor-pointer hover:opacity-100 transition-opacity"
                style={{ color: 'rgba(255, 255, 255, 0.8)' }}
                onClick={() => setIsEditingBio(true)}
              >
                {bio || t('tapToAddBio')}
              </p>
            )}
            <div
              className="text-xs mb-4 opacity-70"
              style={{ color: 'rgba(255, 255, 255, 0.7)' }}
            >
              {t('memberSince')} {new Date(user.joinedDate).getFullYear()}
            </div>

            {/* QR Code - Design Magnifique */}
            <div className="flex flex-col items-center mt-6">
              <div
                className="relative p-6 rounded-3xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.95) 100%)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.3)',
                  border: '2px solid rgba(201, 169, 98, 0.2)',
                }}
              >
                {/* Decorative corner elements */}
                <div
                  className="absolute top-2 left-2 w-3 h-3 rounded-full"
                  style={{ background: 'var(--accent-gold)', opacity: 0.3 }}
                />
                <div
                  className="absolute top-2 right-2 w-3 h-3 rounded-full"
                  style={{ background: 'var(--accent-gold)', opacity: 0.3 }}
                />
                <div
                  className="absolute bottom-2 left-2 w-3 h-3 rounded-full"
                  style={{ background: 'var(--accent-gold)', opacity: 0.3 }}
                />
                <div
                  className="absolute bottom-2 right-2 w-3 h-3 rounded-full"
                  style={{ background: 'var(--accent-gold)', opacity: 0.3 }}
                />

                {/* QR Code with padding */}
                <div className="p-2 bg-white rounded-xl">
                  <img
                    src={qrCodeUrl}
                    alt="Profile QR Code"
                    className="w-32 h-32"
                    style={{ imageRendering: 'crisp-edges' }}
                  />
                </div>

                {/* Decorative border */}
                <div
                  className="absolute inset-0 rounded-3xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(201, 169, 98, 0.1) 0%, transparent 50%, rgba(212, 196, 168, 0.1) 100%)',
                    pointerEvents: 'none',
                  }}
                />
              </div>

              {/* Label */}
              <div className="mt-4 text-center">
                <p
                  className="text-xs font-medium mb-1"
                  style={{ color: 'rgba(255, 255, 255, 0.9)' }}
                >
                  {t('shareProfile')}
                </p>
                <p
                  className="text-[10px] opacity-70"
                  style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                >
                  {t('scanToView')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats row - Agrandie et cliquable */}
        <div
          className="grid grid-cols-3 gap-3 mb-6"
        >
          <button
            onClick={() => handleStatClick('global')}
            className="py-6 rounded-2xl transition-all active:scale-95"
            style={{
              background: 'linear-gradient(135deg, rgba(201, 169, 98, 0.1) 0%, rgba(201, 169, 98, 0.05) 100%)',
              border: '1px solid rgba(201, 169, 98, 0.2)',
            }}
          >
            <div
              className="text-3xl font-light text-display mb-2"
              style={{ color: 'var(--accent-gold)' }}
            >
              {ThomasMorel.performance.overall}%
            </div>
            <div
              className="text-[11px] uppercase tracking-wider font-medium"
              style={{ color: 'var(--text-secondary)' }}
            >
              {t('globalScore')}
            </div>
          </button>
          <button
            onClick={() => handleStatClick('countries')}
            className="py-6 rounded-2xl transition-all active:scale-95"
            style={{
              background: 'linear-gradient(135deg, rgba(165, 196, 212, 0.1) 0%, rgba(165, 196, 212, 0.05) 100%)',
              border: '1px solid rgba(165, 196, 212, 0.2)',
            }}
          >
            <div
              className="text-3xl font-light text-display mb-2"
              style={{ color: 'var(--accent-sky)' }}
            >
              {ThomasMorel.moduleB.stats.totalCountries}
            </div>
            <div
              className="text-[11px] uppercase tracking-wider font-medium"
              style={{ color: 'var(--text-secondary)' }}
            >
              {t('countries')}
            </div>
          </button>
          <button
            onClick={() => handleStatClick('achievements')}
            className="py-6 rounded-2xl transition-all active:scale-95"
            style={{
              background: 'linear-gradient(135deg, rgba(184, 165, 212, 0.1) 0%, rgba(184, 165, 212, 0.05) 100%)',
              border: '1px solid rgba(184, 165, 212, 0.2)',
            }}
          >
            <div
              className="text-3xl font-light text-display mb-2"
              style={{ color: 'var(--accent-lavender)' }}
            >
              {ThomasMorel.moduleD.stats.total}
            </div>
            <div
              className="text-[11px] uppercase tracking-wider font-medium"
              style={{ color: 'var(--text-secondary)' }}
            >
              {t('achievements')}
            </div>
          </button>
        </div>

        {/* Settings button */}
        <button
          onClick={() => setSettingsModalOpen(true)}
          className="w-full py-4 rounded-2xl mb-4 flex items-center justify-between transition-all active:scale-98"
          style={{
            background: 'var(--hover-overlay)',
            border: '1px solid var(--border-light)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(139, 168, 136, 0.1)' }}
            >
              <i className="fa-solid fa-gear text-base" style={{ color: 'var(--accent-sage)' }} />
            </div>
            <span
              className="text-base font-medium"
              style={{ color: 'var(--text-primary)' }}
            >
              {t('settings')}
            </span>
          </div>
          <i
            className="fa-solid fa-chevron-right text-sm"
            style={{ color: 'var(--text-tertiary)' }}
          />
        </button>
      </Modal>

      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        onThemeChange={onToggleTheme}
      />
    </>
  )
}
