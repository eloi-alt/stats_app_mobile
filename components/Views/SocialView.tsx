'use client'

import { useState, useRef, useEffect } from 'react'
import Navbar from '../Navbar'
import SocialSphere3D from '../SocialSphere3D'
import ComparisonCard from '../Cards/ComparisonCard'
import BottomSheet from '../UI/BottomSheet'
import SwipeableCard from '../UI/SwipeableCard'
import RankingDetailModal from '../Modals/RankingDetailModal'
import CompareWithFriendModal from '../Modals/CompareWithFriendModal'
import { Contact, ThomasMorel } from '@/data/mockData'
import { useLanguage } from '@/contexts/LanguageContext'

interface ComparisonDataItem {
  width: number
  text: string
}

interface ComparisonDataSet {
  fi: ComparisonDataItem
  sp: ComparisonDataItem
  sl: ComparisonDataItem
}

interface SocialViewProps {
  contacts: Contact[]
  comparisonData: {
    friends: ComparisonDataSet
    country: ComparisonDataSet
    world: ComparisonDataSet
  }
  onObjectiveClick: (title: string, value: string, subtitle: string, color: string) => void
  initialContactName?: string | null
  onClearInitialContact?: () => void
}

interface ContactDetailModal {
  contact: Contact
  fullContact: typeof ThomasMorel.moduleE.contacts[0] | null
}

export default function SocialView({ contacts, comparisonData, onObjectiveClick, initialContactName, onClearInitialContact }: SocialViewProps) {
  const { t } = useLanguage()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [comparisonType, setComparisonType] = useState<'friends' | 'country' | 'world'>('friends')
  const [selectedContact, setSelectedContact] = useState<ContactDetailModal | null>(null)
  const [showInteraction, setShowInteraction] = useState<string | null>(null)
  const [isInnerCircleExpanded, setIsInnerCircleExpanded] = useState(false)
  const [selectedRanking, setSelectedRanking] = useState<{
    category: string
    icon: string
    iconColor: string
    userValue: number
    comparisonValue: number
    displayValue: string
  } | null>(null)
  const [showCompareModal, setShowCompareModal] = useState(false)

  // Handle deep linking for contact
  useEffect(() => {
    if (initialContactName) {
      const contact = contacts.find(c => c.name.toLowerCase() === initialContactName.toLowerCase())
      if (contact) {
        handleContactClick(contact)
        if (onClearInitialContact) {
          onClearInitialContact()
        }
      }
    }
  }, [initialContactName, contacts])

  const currentData = comparisonData[comparisonType]
  const dunbarNumbers = ThomasMorel.moduleE.dunbarNumbers

  const getFullContact = (contactId: string) => {
    return ThomasMorel.moduleE.contacts.find(c => c.id === contactId) || null
  }

  const handleContactClick = (contact: Contact) => {
    setSelectedContact({
      contact,
      fullContact: getFullContact(contact.id),
    })
  }

  const handleAction = (action: string, contactName: string) => {
    setShowInteraction(`${action} ${contactName}...`)
    setTimeout(() => setShowInteraction(null), 2000)
  }

  return (
    <div ref={scrollContainerRef} className="content">
      <Navbar
        title="TrueCircle"
        subtitle={t('connections')}
        showAvatar={false}
        scrollContainerRef={scrollContainerRef}
      />

      {/* Boule sociale 3D - Rank 1 Sphere */}
      <div className="relative w-full mb-8 pointer-events-auto" style={{ height: '450px' }}>
        <SocialSphere3D
          userAvatar={ThomasMorel.identity.avatar}
          contacts={ThomasMorel.moduleE.contacts
            .filter(c => c.dunbarPriority === 'inner_circle')
            .map(c => ({
              id: c.id,
              name: c.name,
              relationshipType: 'close_friend',
              avatar: c.avatar
            }))
          }
        />

        {/* TC Button - Opens full TrueCircle visualization */}
        <button
          onClick={() => {
            window.location.href = '/testmobile.html'
          }}
          className="absolute bottom-4 right-4 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 active:scale-95 hover:scale-105"
          style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid var(--glass-border)',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
          }}
          title="Ouvrir TrueCircle complet"
          aria-label="Ouvrir TrueCircle complet"
        >
          <i className="fa-solid fa-circle-nodes" style={{ fontSize: '18px', color: 'var(--text-primary)' }}></i>
        </button>
      </div>

      {/* Tab selector */}
      <div className="flex p-1 rounded-2xl mb-5" style={{ background: 'var(--glass-bg)' }}>
        {[
          { key: 'friends', label: t('friends') },
          { key: 'country', label: t('national') },
          { key: 'world', label: t('world') },
        ].map(({ key, label }) => (
          <button
            key={key}
            className={`flex-1 text-center py-2.5 text-[11px] font-medium tracking-wide rounded-xl transition-all duration-300 cursor-pointer ${comparisonType === key ? 'shadow-sm' : ''}`}
            style={{
              background: comparisonType === key ? 'var(--bg-primary)' : 'transparent',
              color: comparisonType === key ? 'var(--text-primary)' : 'var(--text-muted)',
              boxShadow: comparisonType === key ? '0 2px 8px var(--shadow-color, rgba(0,0,0,0.04))' : 'none',
            }}
            onClick={() => setComparisonType(key as any)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Comparison card */}
      <div className="glass mb-5">
        <div className="text-sm uppercase tracking-[0.15em] font-semibold mb-5" style={{ color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>{t('ranking')}</div>

        <ComparisonCard
          icon="fa-solid fa-coins"
          iconColor="var(--accent-gold)"
          label="Finance"
          value={currentData.fi.text}
          myProgress={75}
          otherProgress={currentData.fi.width}
          myColor="var(--accent-gold)"
          onClick={() => setSelectedRanking({
            category: 'Finance',
            icon: 'fa-solid fa-coins',
            iconColor: 'var(--accent-gold)',
            userValue: 75,
            comparisonValue: currentData.fi.width,
            displayValue: currentData.fi.text,
          })}
        />
        <ComparisonCard
          icon="fa-solid fa-person-running"
          iconColor="var(--accent-sage)"
          label="Sport"
          value={currentData.sp.text}
          myProgress={90}
          otherProgress={currentData.sp.width}
          myColor="var(--accent-sage)"
          onClick={() => setSelectedRanking({
            category: 'Sport',
            icon: 'fa-solid fa-person-running',
            iconColor: 'var(--accent-sage)',
            userValue: 90,
            comparisonValue: currentData.sp.width,
            displayValue: currentData.sp.text,
          })}
        />
        <ComparisonCard
          icon="fa-solid fa-moon"
          iconColor="var(--accent-sky)"
          label="Sleep"
          value={currentData.sl.text}
          myProgress={80}
          otherProgress={currentData.sl.width}
          myColor="var(--accent-sky)"
          onClick={() => setSelectedRanking({
            category: 'Sleep',
            icon: 'fa-solid fa-moon',
            iconColor: 'var(--accent-sky)',
            userValue: 80,
            comparisonValue: currentData.sl.width,
            displayValue: currentData.sl.text,
          })}
        />
        <ComparisonCard
          icon="fa-solid fa-globe"
          iconColor="var(--accent-lavender)"
          label="Exploration"
          value="12 countries"
          myProgress={85}
          otherProgress={72}
          myColor="var(--accent-lavender)"
          onClick={() => setSelectedRanking({
            category: 'Exploration',
            icon: 'fa-solid fa-globe',
            iconColor: 'var(--accent-lavender)',
            userValue: 85,
            comparisonValue: 72,
            displayValue: '12 countries',
          })}
        />
        <ComparisonCard
          icon="fa-solid fa-link"
          iconColor="var(--accent-rose)"
          label="Connection"
          value="Level 8"
          myProgress={80}
          otherProgress={65}
          myColor="var(--accent-rose)"
          onClick={() => setSelectedRanking({
            category: 'Connection',
            icon: 'fa-solid fa-link',
            iconColor: 'var(--accent-rose)',
            userValue: 80,
            comparisonValue: 65,
            displayValue: 'Level 8',
          })}
        />
      </div>

      {/* Section title */}
      <div
        className="flex items-center gap-3 mb-5 px-1 cursor-pointer"
        onClick={() => setIsInnerCircleExpanded(!isInnerCircleExpanded)}
      >
        <div className="h-px flex-1" style={{ background: 'var(--border-subtle)' }} />
        <span className="text-sm tracking-[0.15em] uppercase font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>
          {t('innerCircle')}
          <i className={`fa-solid ${isInnerCircleExpanded ? 'fa-chevron-up' : 'fa-chevron-down'} text-xs transition-transform duration-300`} style={{ color: 'var(--text-tertiary)' }} />
        </span>
        <div className="h-px flex-1" style={{ background: 'var(--border-subtle)' }} />
      </div>

      {/* Contacts list container wrapper to avoid global .content > * overrides */}
      <div className="w-full">
        <div
          className="glass transition-all duration-500 ease-in-out"
          style={{
            padding: 0,
            maxHeight: isInnerCircleExpanded ? '2000px' : '260px',
            overflow: 'hidden',
            minHeight: '80px'
          }}
        >
          {contacts.map((contact, index) => (
            <SwipeableCard
              key={contact.id}
              leftActions={contact.phone ? [
                {
                  icon: 'fa-phone',
                  color: 'white',
                  bgColor: 'var(--accent-sage)',
                  label: t('call'),
                  onClick: () => window.location.href = `tel:${contact.phone!.replace(/\s/g, '')}`,
                },
              ] : []}
              rightActions={[
                {
                  icon: 'fa-message',
                  color: 'white',
                  bgColor: 'var(--accent-sky)',
                  label: t('message'),
                  onClick: () => contact.phone && (window.location.href = `sms:${contact.phone.replace(/\s/g, '')}`),
                },
                {
                  icon: 'fa-bell',
                  color: 'white',
                  bgColor: 'var(--accent-gold)',
                  label: t('remind'),
                  onClick: () => handleAction(t('remind'), contact.name),
                },
              ]}
            >
              <div
                className="p-4 flex items-center gap-4 transition-colors cursor-pointer"
                style={{
                  background: 'var(--bg-primary)',
                  borderBottom: index < contacts.length - 1 ? '1px solid var(--border-light)' : 'none',
                }}
                onClick={() => handleContactClick(contact)}
              >
                <div className="avatar-fade" style={{ width: '44px', height: '44px' }}>
                  <img src={contact.avatar} className="w-full h-full rounded-full object-cover" alt={contact.name} />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{contact.name}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                    {contact.role} • <span style={{ color: contact.lastContactColor.includes('red') ? 'var(--accent-rose)' : 'var(--accent-gold)' }}>{contact.lastContact}</span>
                  </div>
                </div>
                <i className="fa-solid fa-chevron-right text-xs" style={{ color: 'var(--text-muted)' }} />
              </div>
            </SwipeableCard>
          ))}
        </div>
      </div>

      <div className="h-10" />

      {/* Contact detail modal - Bottom Sheet Interactive avec Framer Motion */}
      <BottomSheet
        isOpen={!!selectedContact}
        onClose={() => setSelectedContact(null)}
        initialHeight="60vh"
        maxHeight="90vh"
        showCloseButton={true}
      >
        {selectedContact && (
          <>
            <div className="text-center mb-6 mt-2">
              <div className="avatar-fade mx-auto mb-4" style={{ width: '96px', height: '96px' }}>
                <img src={selectedContact.contact.avatar} className="w-full h-full rounded-full object-cover" alt={selectedContact.contact.name} />
              </div>
              <h3 className="text-2xl font-light text-display mb-1" style={{ color: 'var(--text-primary)' }}>{selectedContact.contact.name}</h3>
              <p className="text-sm mt-1 mb-2" style={{ color: 'var(--text-tertiary)' }}>{selectedContact.contact.role}</p>
              {selectedContact.fullContact && (
                <p className="text-xs mt-1 flex items-center justify-center gap-1" style={{ color: 'var(--text-muted)' }}>
                  <i className="fa-solid fa-location-dot text-[10px]" />
                  {selectedContact.fullContact.location}
                </p>
              )}
            </div>

            {selectedContact?.fullContact?.tags && (
              <div className="flex flex-wrap justify-center gap-2 mb-5">
                {selectedContact.fullContact.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 rounded-full text-xs" style={{ background: 'rgba(201, 169, 98, 0.1)', color: 'var(--accent-gold)' }}>{tag}</span>
                ))}
              </div>
            )}

            {/* Public Stats */}
            {selectedContact.fullContact?.publicStats && (
              <>
                <div
                  className="text-[10px] uppercase tracking-[0.2em] font-medium mb-3 px-1"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  {t('publicStats')}
                </div>
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="rounded-2xl p-4 text-center" style={{ background: 'rgba(201, 169, 98, 0.06)' }}>
                    <div className="text-xl font-light text-display" style={{ color: 'var(--accent-gold)' }}>
                      {selectedContact.fullContact.publicStats.globalPerformance}%
                    </div>
                    <div className="text-[9px] uppercase tracking-wider mt-1" style={{ color: 'var(--text-muted)' }}>{t('globalScore')}</div>
                  </div>
                  <div className="rounded-2xl p-4 text-center" style={{ background: 'rgba(139, 168, 136, 0.06)' }}>
                    <div className="text-xl font-light text-display" style={{ color: 'var(--accent-sage)' }}>
                      {Math.round(selectedContact.fullContact.publicStats.netWorth / 1000)}k€
                    </div>
                    <div className="text-[9px] uppercase tracking-wider mt-1" style={{ color: 'var(--text-muted)' }}>{t('netWorth')}</div>
                  </div>
                  <div className="rounded-2xl p-4 text-center" style={{ background: 'rgba(165, 196, 212, 0.06)' }}>
                    <div className="text-xl font-light text-display" style={{ color: 'var(--accent-sky)' }}>
                      {selectedContact.fullContact.publicStats.countriesVisited}
                    </div>
                    <div className="text-[9px] uppercase tracking-wider mt-1" style={{ color: 'var(--text-muted)' }}>{t('countries')}</div>
                  </div>
                  <div className="rounded-2xl p-4 text-center" style={{ background: 'rgba(184, 165, 212, 0.06)' }}>
                    <div className="text-xl font-light text-display" style={{ color: 'var(--accent-lavender)' }}>
                      {selectedContact.fullContact.publicStats.achievements}
                    </div>
                    <div className="text-[9px] uppercase tracking-wider mt-1" style={{ color: 'var(--text-muted)' }}>{t('achievements')}</div>
                  </div>
                </div>
              </>
            )}

            {/* Private Stats (Blurred) */}
            {selectedContact.fullContact?.privateStats && (
              <>
                <div
                  className="text-[10px] uppercase tracking-[0.2em] font-medium mb-3 px-1 flex items-center gap-2"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  <i className="fa-solid fa-lock text-[8px]" />
                  {t('privateStats')}
                </div>
                <div className="grid grid-cols-2 gap-3 mb-5 relative">
                  <div className="rounded-2xl p-4 text-center relative overflow-hidden" style={{ background: 'var(--glass-bg)' }}>
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        background: 'var(--blur-overlay-bg, rgba(255, 255, 255, 0.7))',
                      }}
                    >
                      <div className="text-lg font-light" style={{ color: 'var(--text-muted)' }}>•••</div>
                    </div>
                    <div className="text-xl font-light text-display opacity-0" style={{ color: 'var(--accent-gold)' }}>
                      {selectedContact.fullContact.privateStats.monthlyIncome}€
                    </div>
                    <div className="text-[9px] uppercase tracking-wider mt-1 opacity-0" style={{ color: 'var(--text-muted)' }}>Monthly</div>
                  </div>
                  <div className="rounded-2xl p-4 text-center relative overflow-hidden" style={{ background: 'rgba(0, 0, 0, 0.02)' }}>
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        background: 'rgba(255, 255, 255, 0.7)',
                      }}
                    >
                      <div className="text-lg font-light" style={{ color: 'var(--text-muted)' }}>•••</div>
                    </div>
                    <div className="text-xl font-light text-display opacity-0" style={{ color: 'var(--accent-sage)' }}>
                      {selectedContact.fullContact.privateStats.savingsRate}%
                    </div>
                    <div className="text-[9px] uppercase tracking-wider mt-1 opacity-0" style={{ color: 'var(--text-muted)' }}>Savings</div>
                  </div>
                  <div className="rounded-2xl p-4 text-center relative overflow-hidden" style={{ background: 'rgba(0, 0, 0, 0.02)' }}>
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        background: 'rgba(255, 255, 255, 0.7)',
                      }}
                    >
                      <div className="text-lg font-light" style={{ color: 'var(--text-muted)' }}>•••</div>
                    </div>
                    <div className="text-xl font-light text-display opacity-0" style={{ color: 'var(--accent-rose)' }}>
                      {selectedContact.fullContact.privateStats.currentWeight}kg
                    </div>
                    <div className="text-[9px] uppercase tracking-wider mt-1 opacity-0" style={{ color: 'var(--text-muted)' }}>Weight</div>
                  </div>
                  <div className="rounded-2xl p-4 text-center relative overflow-hidden" style={{ background: 'rgba(0, 0, 0, 0.02)' }}>
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        background: 'rgba(255, 255, 255, 0.7)',
                      }}
                    >
                      <div className="text-lg font-light" style={{ color: 'var(--text-muted)' }}>•••</div>
                    </div>
                    <div className="text-xl font-light text-display opacity-0" style={{ color: 'var(--accent-gold)' }}>
                      {selectedContact.fullContact.privateStats.weeklyActivity}min
                    </div>
                    <div className="text-[9px] uppercase tracking-wider mt-1 opacity-0" style={{ color: 'var(--text-muted)' }}>Activity</div>
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-around py-4 rounded-2xl mb-5" style={{ background: 'var(--glass-bg)' }}>
              <div className="text-center">
                <div className="text-lg font-light text-display" style={{ color: 'var(--text-primary)' }}>{selectedContact.fullContact?.interactionCount || 0}</div>
                <div className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{t('interactions')}</div>
              </div>
              <div className="w-px" style={{ background: 'var(--border-subtle)' }} />
              <div className="text-center">
                <div className="text-lg font-light text-display" style={{ color: 'var(--text-primary)' }}>{selectedContact.contact.lastContact}</div>
                <div className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{t('lastContact')}</div>
              </div>
            </div>

            {/* Contact actions */}
            {selectedContact.fullContact?.phone && (
              <div className="grid grid-cols-4 gap-2 mb-5">
                <a
                  href={`sms:${selectedContact.fullContact.phone.replace(/\s/g, '')}`}
                  className="py-3 rounded-xl flex flex-col items-center gap-1 transition-all active:scale-95"
                  style={{ background: 'rgba(165, 196, 212, 0.1)' }}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleAction(t('message'), selectedContact.contact.name)
                  }}
                >
                  <i className="fa-solid fa-message" style={{ color: 'var(--accent-sky)' }} />
                  <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{t('message')}</span>
                </a>
                <a
                  href={`tel:${selectedContact.fullContact.phone.replace(/\s/g, '')}`}
                  className="py-3 rounded-xl flex flex-col items-center gap-1 transition-all active:scale-95"
                  style={{ background: 'rgba(139, 168, 136, 0.1)' }}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleAction(t('call'), selectedContact.contact.name)
                  }}
                >
                  <i className="fa-solid fa-phone" style={{ color: 'var(--accent-sage)' }} />
                  <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{t('call')}</span>
                </a>
                <button
                  className="py-3 rounded-xl flex flex-col items-center gap-1 transition-all active:scale-95"
                  style={{ background: 'rgba(201, 169, 98, 0.1)' }}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleAction(t('remind'), selectedContact.contact.name)
                  }}
                >
                  <i className="fa-solid fa-bell" style={{ color: 'var(--accent-gold)' }} />
                  <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{t('remind')}</span>
                </button>
                <button
                  className="py-3 rounded-xl flex flex-col items-center gap-1 transition-all active:scale-95"
                  style={{ background: 'rgba(184, 165, 212, 0.1)' }}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedContact(null)
                    setShowCompareModal(true)
                  }}
                >
                  <i className="fa-solid fa-scale-balanced" style={{ color: 'var(--accent-lavender)' }} />
                  <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Compare</span>
                </button>
              </div>
            )}
          </>
        )}
      </BottomSheet>

      {/* Interaction toast */}
      {showInteraction && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[600] px-5 py-3 rounded-xl" style={{ background: 'var(--text-primary)', color: 'white', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)', animation: 'fadeInToast 0.2s ease-out' }}>
          <i className="fa-solid fa-check mr-2" />{showInteraction}
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInToast { from { opacity: 0; transform: translate(-50%, -10px); } to { opacity: 1; transform: translate(-50%, 0); } }
      `}</style>

      {/* Ranking Detail Modal */}
      {selectedRanking && (
        <RankingDetailModal
          isOpen={!!selectedRanking}
          onClose={() => setSelectedRanking(null)}
          category={selectedRanking.category}
          icon={selectedRanking.icon}
          iconColor={selectedRanking.iconColor}
          userValue={selectedRanking.userValue}
          comparisonValue={selectedRanking.comparisonValue}
          comparisonType={comparisonType}
          displayValue={selectedRanking.displayValue}
        />
      )}

      {/* Compare With Friend Modal */}
      <CompareWithFriendModal
        isOpen={showCompareModal}
        onClose={() => setShowCompareModal(false)}
        currentContact={selectedContact?.contact || null}
        allContacts={contacts}
      />
    </div>
  )
}