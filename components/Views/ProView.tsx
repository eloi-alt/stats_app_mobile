'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import Navbar from '../Navbar'
import CareerGoalModal from '../Modals/CareerGoalModal'
import SkillEndorsementModal from '../Modals/SkillEndorsementModal'
import FinancialProjectionsModal from '../Modals/FinancialProjectionsModal'
import CareerDataEntryModal from '../Modals/CareerDataEntryModal'
import EmptyModuleState from '../UI/EmptyModuleState'
import { CareerInfo, ThomasMorel } from '@/data/mockData'
import { useLanguage } from '@/contexts/LanguageContext'
import { useVisitor } from '@/contexts/VisitorContext'
import { useFinancialData } from '@/hooks/useFinancialData'
import { useProfileData } from '@/hooks/useProfileData'
import { supabase } from '@/utils/supabase/client'

interface ProViewProps {
  careerInfo: CareerInfo
  onAvatarClick: () => void
  onAssetsClick: () => void
}

export default function ProView({ careerInfo, onAvatarClick, onAssetsClick }: ProViewProps) {
  const { t } = useLanguage()
  const { isVisitor } = useVisitor()
  const financialData = useFinancialData()
  const profileData = useProfileData()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const [showSkillsModal, setShowSkillsModal] = useState(false)
  const [showGoalModal, setShowGoalModal] = useState(false)
  const [showCareerGoalModal, setShowCareerGoalModal] = useState(false)
  const [showSkillEndorsementModal, setShowSkillEndorsementModal] = useState(false)
  const [showFinancialModal, setShowFinancialModal] = useState(false)
  const [showCareerDataModal, setShowCareerDataModal] = useState(false)
  const [showToast, setShowToast] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  // Get current user ID
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id)
    })
  }, [])

  // Pattern mounted pour éviter les erreurs SSR
  useEffect(() => {
    setMounted(true)
  }, [])

  const skills = ThomasMorel.moduleC.career.skills
  const achievements = ThomasMorel.moduleD.achievements.filter(a => a.category === 'career')

  // Get profile data (moved up so displayData can use it)
  const profile: any = profileData.profile

  // Compute display values - use real data for authenticated users, demo for visitors
  const displayData = {
    jobTitle: !isVisitor && profile?.jobTitle ? profile.jobTitle : careerInfo.currentPosition,
    company: !isVisitor && profile?.company ? profile.company : ThomasMorel.moduleC.career.company,
    industry: !isVisitor && profile?.industry ? profile.industry : careerInfo.specialty,
    experienceYears: !isVisitor && profile?.experienceYears ? `${profile.experienceYears} ans` : careerInfo.experience,
    annualIncome: !isVisitor && profile?.annualIncome ? profile.annualIncome : ThomasMorel.moduleC.revenus.totalGrossAnnual,
    netWorthEstimate: !isVisitor && profile?.netWorthEstimate ? profile.netWorthEstimate : ThomasMorel.moduleC.revenus.totalNetAnnual,
    savingsRate: !isVisitor && profile?.savingsRate ? profile.savingsRate : 20,
    currency: !isVisitor && profile?.currency ? profile.currency : 'EUR',
  }

  // Format currency helper
  const formatMoney = (value: number, currency: string): string => {
    const symbol = currency === 'EUR' ? '€' : currency === 'USD' ? '$' : currency === 'GBP' ? '£' : currency
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M${symbol}`
    }
    if (value >= 1000) {
      return `${Math.round(value / 1000)}k${symbol}`
    }
    return `${value}${symbol}`
  }

  const handleAction = (message: string) => {
    setShowToast(message)
    setTimeout(() => setShowToast(null), 2000)
  }

  // Check if user has required job data
  const hasJobData = isVisitor || (
    (profile?.job_title || profile?.jobTitle) &&
    profile?.industry
  )

  // Show empty state for authenticated users without any career/financial data
  const showEmptyState = !isVisitor && !financialData.isLoading && !profileData.isLoading && !hasJobData && !financialData.hasAnyData

  // Loading state
  if (!isVisitor && (financialData.isLoading || profileData.isLoading)) {
    return (
      <div className="content">
        <Navbar
          title="TrueCircle"
          subtitle={t('growth')}
          onAvatarClick={onAvatarClick}
          showAvatar={false}
          scrollContainerRef={scrollContainerRef}
        />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: 'var(--accent-gold) transparent transparent transparent' }}
          />
        </div>
      </div>
    )
  }

  // Empty state for new users
  if (showEmptyState) {
    return (
      <div ref={scrollContainerRef} className="content">
        <Navbar
          title="TrueCircle"
          subtitle={t('growth')}
          onAvatarClick={onAvatarClick}
          showAvatar={false}
          scrollContainerRef={scrollContainerRef}
        />
        <EmptyModuleState
          moduleName="Carrière"
          moduleIcon="fa-briefcase"
          moduleColor="var(--accent-gold)"
          title="Configurez votre profil professionnel"
          description="Renseignez votre poste actuel et vos objectifs de carrière pour débloquer les projections et le suivi de votre progression professionnelle."
          actionLabel="Compléter mon profil"
          onAction={() => setShowCareerDataModal(true)}
        />

        {/* Career Data Entry Modal for empty state */}
        {userId && (
          <CareerDataEntryModal
            isOpen={showCareerDataModal}
            onClose={() => setShowCareerDataModal(false)}
            userId={userId}
            currentData={{
              jobTitle: '',
              company: '',
              industry: '',
              experienceYears: 0,
              annualIncome: 0,
              savingsRate: 20,
              netWorthEstimate: 0,
              currency: 'EUR',
            }}
            onSave={() => {
              handleAction('Profil professionnel créé')
              profileData.refetch()
              financialData.refetch()
            }}
          />
        )}
      </div>
    )
  }

  return (
    <div ref={scrollContainerRef} className="content">
      <Navbar
        title="TrueCircle"
        subtitle={t('growth')}
        onAvatarClick={onAvatarClick}
        showAvatar={false}
        scrollContainerRef={scrollContainerRef}
      />

      {/* Current position card */}
      <div
        className="rounded-3xl p-6 mb-4 relative"
        style={{
          background: 'linear-gradient(135deg, rgba(201, 169, 98, 0.08) 0%, rgba(212, 196, 168, 0.04) 100%)',
          border: '1px solid rgba(201, 169, 98, 0.15)',
        }}
      >
        {/* Edit button */}
        {!isVisitor && userId && (
          <button
            onClick={() => setShowCareerDataModal(true)}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-105"
            style={{ background: 'rgba(201, 169, 98, 0.15)' }}
          >
            <i className="fa-solid fa-pen text-xs" style={{ color: 'var(--accent-gold)' }} />
          </button>
        )}
        <div
          className="text-[9px] uppercase tracking-[0.2em] font-medium mb-2"
          style={{ color: 'var(--accent-gold)' }}
        >
          {t('currentPosition')}
        </div>
        <div
          className="text-2xl font-light text-display mb-3"
          style={{ color: 'var(--text-primary)' }}
        >
          {displayData.jobTitle}
        </div>
        <div className="flex flex-wrap gap-2">
          <span
            className="py-1.5 px-3 rounded-full text-[10px] font-medium"
            style={{
              background: 'rgba(201, 169, 98, 0.1)',
              color: 'var(--accent-gold)',
            }}
          >
            {displayData.experienceYears}
          </span>
          <span
            className="py-1.5 px-3 rounded-full text-[10px] font-medium"
            style={{
              background: 'rgba(0, 0, 0, 0.03)',
              color: 'var(--text-secondary)',
            }}
          >
            {displayData.industry}
          </span>
          <span
            className="py-1.5 px-3 rounded-full text-[10px] font-medium"
            style={{
              background: 'rgba(139, 168, 136, 0.1)',
              color: 'var(--accent-sage)',
            }}
          >
            {displayData.company}
          </span>
        </div>
      </div>

      {/* Skills card */}
      <div
        className="glass cursor-pointer"
        onClick={() => setShowSkillEndorsementModal(true)}
      >
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(184, 165, 212, 0.1)' }}
            >
              <i className="fa-solid fa-brain" style={{ color: 'var(--accent-lavender)' }} />
            </div>
            <div>
              <div
                className="font-medium text-sm"
                style={{ color: 'var(--text-primary)' }}
              >
                {t('skills')}
              </div>
              <div
                className="text-[10px] opacity-60"
                style={{ color: 'var(--text-tertiary)' }}
              >
                {skills.length} {t('skillsIdentified')}
              </div>
            </div>
          </div>
          <i
            className="fa-solid fa-chevron-right text-xs"
            style={{ color: 'var(--text-muted)' }}
          />
        </div>

        {/* Skills preview */}
        <div className="flex flex-wrap gap-1.5">
          {skills.slice(0, 4).map((skill) => (
            <span
              key={skill}
              className="px-2 py-1 rounded-lg text-[10px]"
              style={{
                background: 'rgba(184, 165, 212, 0.1)',
                color: 'var(--accent-lavender)',
              }}
            >
              {skill}
            </span>
          ))}
          {skills.length > 4 && (
            <span
              className="px-2 py-1 rounded-lg text-[10px]"
              style={{
                background: 'rgba(0, 0, 0, 0.03)',
                color: 'var(--text-muted)',
              }}
            >
              +{skills.length - 4}
            </span>
          )}
        </div>
      </div>

      {/* Career projection */}
      <div
        className="glass cursor-pointer"
        onClick={() => setShowCareerGoalModal(true)}
      >
        <div
          className="text-[10px] uppercase tracking-[0.2em] font-medium mb-4"
          style={{ color: 'var(--text-tertiary)' }}
        >
          {t('careerProjection')}
        </div>
        <div className="flex justify-between items-center mb-3">
          <span
            className="font-medium"
            style={{ color: 'var(--text-primary)' }}
          >
            {t('goal')}: {careerInfo.aspiringPosition}
          </span>
          <span
            className="text-sm font-medium"
            style={{ color: 'var(--accent-sage)' }}
          >
            {careerInfo.probability}%
          </span>
        </div>
        <div
          className="text-xs mb-4"
          style={{ color: 'var(--text-tertiary)' }}
        >
          <i className="fa-solid fa-lightbulb mr-2" style={{ color: 'var(--accent-gold)' }} />
          {t('toDevelop')}: {careerInfo.missingSkill}
        </div>
        <div className="bar-bg">
          <div
            className="bar-fill"
            style={{
              width: `${careerInfo.probability}%`,
              background: 'linear-gradient(90deg, var(--accent-sage), var(--accent-sky))',
            }}
          />
        </div>
      </div>

      {/* Career achievements */}
      {achievements.length > 0 && (
        <>
          <div className="flex items-center gap-3 mb-4 mt-6 px-1">
            <div className="h-px flex-1" style={{ background: 'var(--border-subtle)' }} />
            <span
              className="text-[10px] tracking-[0.2em] uppercase font-medium"
              style={{ color: 'var(--text-tertiary)' }}
            >
              {t('proAchievements')}
            </span>
            <div className="h-px flex-1" style={{ background: 'var(--border-subtle)' }} />
          </div>

          <div className="space-y-2">
            {achievements.slice(0, 2).map((achievement) => (
              <div
                key={achievement.id}
                className="glass flex items-center gap-3"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(201, 169, 98, 0.1)' }}
                >
                  <i className="fa-solid fa-trophy" style={{ color: 'var(--accent-gold)' }} />
                </div>
                <div className="flex-1">
                  <div
                    className="font-medium text-sm"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {achievement.title}
                  </div>
                  <div
                    className="text-xs mt-0.5"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    {achievement.location} • {new Date(achievement.dateAchieved).getFullYear()}
                  </div>
                </div>
                <span
                  className="px-2 py-1 rounded-full text-[9px] font-medium"
                  style={{
                    background: achievement.rarity === 'rare' ? 'rgba(184, 165, 212, 0.15)' : 'rgba(139, 168, 136, 0.15)',
                    color: achievement.rarity === 'rare' ? 'var(--accent-lavender)' : 'var(--accent-sage)',
                  }}
                >
                  {achievement.rarity}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Finance overview */}
      <div className="glass cursor-pointer mt-4\" onClick={() => setShowFinancialModal(true)}>
        <div className="flex items-center justify-between mb-4">
          <div
            className="text-[10px] uppercase tracking-[0.2em] font-medium"
            style={{ color: 'var(--text-tertiary)' }}
          >
            {t('financialOverview')}
          </div>
          <i
            className="fa-solid fa-expand text-xs"
            style={{ color: 'var(--text-muted)' }}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div
            className="text-center p-4 rounded-2xl"
            style={{ background: 'rgba(201, 169, 98, 0.06)' }}
          >
            <div className="text-xl font-light text-display" style={{ color: 'var(--accent-gold)' }}>
              {formatMoney(displayData.netWorthEstimate, displayData.currency)}
            </div>
            <div className="text-[9px] uppercase tracking-wider mt-1" style={{ color: 'var(--text-muted)' }}>
              {t('netWorth')}
            </div>
          </div>
          <div
            className="text-center p-4 rounded-2xl"
            style={{ background: 'rgba(139, 168, 136, 0.06)' }}
          >
            <div className="text-xl font-light text-display" style={{ color: 'var(--accent-sage)' }}>
              {formatMoney(displayData.annualIncome, displayData.currency)}
            </div>
            <div className="text-[9px] uppercase tracking-wider mt-1" style={{ color: 'var(--text-muted)' }}>
              {t('incomeYear')}
            </div>
          </div>
        </div>
      </div>

      <div className="h-5" />

      {/* Skills Modal */}
      {mounted && showSkillsModal && createPortal(
        <div
          className="fixed inset-0 z-[99999] flex flex-col justify-end"
          onClick={() => setShowSkillsModal(false)}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md" />
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full bg-[var(--bg-elevated)] rounded-t-[32px] pb-safe pt-6 px-5 shadow-[0_-8px_40px_rgba(0,0,0,0.15)] max-h-[85vh] overflow-y-auto cursor-default animate-slide-up"
          >
            <div className="w-10 h-1 rounded-full bg-black/10 mx-auto mb-6" />
            <button
              onClick={() => setShowSkillsModal(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              style={{ background: 'rgba(0, 0, 0, 0.04)', color: 'var(--text-tertiary)' }}
            >
              <i className="fa-solid fa-xmark text-sm" />
            </button>

            <h3 className="text-xl font-light text-display mb-5 pr-10" style={{ color: 'var(--text-primary)' }}>
              {t('skills')}
            </h3>

            <div className="space-y-3">
              {skills.map((skill, idx) => (
                <div
                  key={skill}
                  className="flex items-center justify-between p-3 rounded-xl"
                  style={{ background: 'rgba(0, 0, 0, 0.02)' }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                      style={{ background: 'rgba(184, 165, 212, 0.1)' }}
                    >
                      {idx + 1}
                    </div>
                    <span style={{ color: 'var(--text-primary)' }}>{skill}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className="w-2 h-2 rounded-full"
                        style={{ background: level <= (5 - idx % 3) ? 'var(--accent-lavender)' : 'rgba(0, 0, 0, 0.06)' }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                handleAction(t('skillAdded'))
                setShowSkillsModal(false)
              }}
              className="w-full py-4 rounded-2xl text-sm font-medium mt-6"
              style={{ background: 'var(--accent-lavender)', color: 'white' }}
            >
              <i className="fa-solid fa-plus mr-2" />
              {t('addSkill')}
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* Goal Modal */}
      {mounted && showGoalModal && createPortal(
        <div
          className="fixed inset-0 z-[99999] flex flex-col justify-end"
          onClick={() => setShowGoalModal(false)}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md" />
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full bg-[var(--bg-elevated)] rounded-t-[32px] pb-safe pt-6 px-5 shadow-[0_-8px_40px_rgba(0,0,0,0.15)] max-h-[85vh] overflow-y-auto cursor-default animate-slide-up"
          >
            <div className="w-10 h-1 rounded-full bg-black/10 mx-auto mb-6" />
            <button
              onClick={() => setShowGoalModal(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              style={{ background: 'rgba(0, 0, 0, 0.04)', color: 'var(--text-tertiary)' }}
            >
              <i className="fa-solid fa-xmark text-sm" />
            </button>

            <h3 className="text-xl font-light text-display mb-5 pr-10" style={{ color: 'var(--text-primary)' }}>
              {t('careerGoal')}
            </h3>

            <div
              className="text-center p-8 rounded-2xl mb-6"
              style={{ background: 'rgba(139, 168, 136, 0.06)' }}
            >
              <div
                className="text-3xl font-light text-display mb-2"
                style={{ color: 'var(--accent-sage)' }}
              >
                {careerInfo.aspiringPosition}
              </div>
              <div
                className="text-sm"
                style={{ color: 'var(--text-tertiary)' }}
              >
                {t('probability')}: {careerInfo.probability}%
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="glass flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(201, 169, 98, 0.1)' }}
                >
                  <i className="fa-solid fa-graduation-cap" style={{ color: 'var(--accent-gold)' }} />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-medium" style={{ color: 'var(--text-tertiary)' }}>{t('missingSkill')}</div>
                  <div className="text-sm" style={{ color: 'var(--text-primary)' }}>{careerInfo.missingSkill}</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowGoalModal(false)}
              className="w-full py-4 rounded-2xl text-sm font-medium"
              style={{ background: 'rgba(0, 0, 0, 0.04)', color: 'var(--text-secondary)' }}
            >
              {t('close')}
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* Toast */}
      {showToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[1000] px-6 py-3 rounded-2xl shadow-xl animate-fade-in" style={{ background: 'var(--text-primary)', color: 'white' }}>
          <i className="fa-solid fa-check mr-2" />
          {showToast}
        </div>
      )}

      <style jsx>{`
        @keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes fade-in-toast { from { opacity: 0; transform: translate(-50%, -20px); } to { opacity: 1; transform: translate(-50%, 0); } }
        .animate-fade-in-toast { animation: fade-in-toast 0.3s ease-out; }
      `}</style>

      {/* Career Goal Modal */}
      <CareerGoalModal
        isOpen={showCareerGoalModal}
        onClose={() => setShowCareerGoalModal(false)}
        careerInfo={careerInfo}
        onSave={(goal, years) => {
          handleAction(`Goal updated: ${goal} in ${years} years`)
        }}
      />

      {/* Skill Endorsement Modal */}
      <SkillEndorsementModal
        isOpen={showSkillEndorsementModal}
        onClose={() => setShowSkillEndorsementModal(false)}
      />

      {/* Financial Projections Modal */}
      <FinancialProjectionsModal
        isOpen={showFinancialModal}
        onClose={() => setShowFinancialModal(false)}
      />

      {/* Career Data Entry Modal */}
      {userId && (
        <CareerDataEntryModal
          isOpen={showCareerDataModal}
          onClose={() => setShowCareerDataModal(false)}
          userId={userId}
          currentData={{
            jobTitle: profile?.jobTitle || profile?.job_title || '',
            company: profile?.company || '',
            industry: profile?.industry || '',
            experienceYears: profile?.experienceYears || profile?.experience_years || 0,
            annualIncome: profile?.annualIncome || profile?.annual_income || 0,
            savingsRate: profile?.savingsRate || profile?.savings_rate || 20,
            netWorthEstimate: profile?.netWorthEstimate || profile?.net_worth_estimate || 0,
            currency: profile?.currency || 'EUR',
          }}
          onSave={() => {
            handleAction('Profil professionnel mis à jour')
            // Trigger refetch of profile and financial data
            profileData.refetch()
            financialData.refetch()
          }}
        />
      )}
    </div>
  )
}
