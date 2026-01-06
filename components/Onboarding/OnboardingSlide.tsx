'use client'

import { ReactNode } from 'react'

interface OnboardingSlideProps {
  title: string
  subtitle?: string
  icon?: string
  children: ReactNode
  currentStep: number
  totalSteps: number
  onNext: () => void
  onBack: () => void
  onSkip: () => void
  canProceed: boolean
  isLoading?: boolean
  showBack?: boolean
  nextLabel?: string
}

export default function OnboardingSlide({
  title,
  subtitle,
  icon,
  children,
  currentStep,
  totalSteps,
  onNext,
  onBack,
  onSkip,
  canProceed,
  isLoading = false,
  showBack = true,
  nextLabel = 'Continuer'
}: OnboardingSlideProps) {
  const progress = ((currentStep) / totalSteps) * 100

  return (
    <div className="onboarding-slide">
      <style jsx>{`
        .onboarding-slide {
          height: 100vh;
          max-height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--bg-primary);
          padding: 12px 16px;
          overflow: hidden;
          box-sizing: border-box;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          flex-shrink: 0;
        }

        .skip-btn {
          background: none;
          border: none;
          color: var(--text-tertiary);
          font-size: 14px;
          cursor: pointer;
          padding: 8px 12px;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .skip-btn:hover {
          background: var(--bg-secondary);
          color: var(--text-secondary);
        }

        .progress-container {
          margin-bottom: 12px;
          flex-shrink: 0;
        }

        .progress-bar {
          height: 4px;
          background: var(--bg-tertiary);
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--accent-sage), var(--accent-gold));
          border-radius: 2px;
          transition: width 0.3s ease;
        }

        .step-text {
          font-size: 12px;
          color: var(--text-tertiary);
          margin-top: 8px;
          text-align: center;
        }

        .content {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          text-align: center;
          padding-top: 8px;
          min-height: 0;
          overflow: hidden;
        }

        .icon {
          font-size: 32px;
          margin-bottom: 12px;
          color: var(--accent-gold);
          flex-shrink: 0;
        }

        .title {
          font-size: 20px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 4px;
          flex-shrink: 0;
        }

        .subtitle {
          font-size: 13px;
          color: var(--text-secondary);
          margin-bottom: 16px;
          max-width: 280px;
          flex-shrink: 0;
        }

        .input-container {
          width: 100%;
          max-width: 320px;
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
        }

        .actions {
          display: flex;
          gap: 8px;
          padding: 12px 0 8px;
          flex-shrink: 0;
        }

        .btn {
          flex: 1;
          padding: 14px 20px;
          border-radius: 14px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .btn-back {
          background: var(--bg-secondary);
          color: var(--text-secondary);
        }

        .btn-back:hover {
          background: var(--bg-tertiary);
        }

        .btn-next {
          background: linear-gradient(135deg, var(--accent-gold), var(--accent-sand));
          color: white;
          box-shadow: 0 4px 16px rgba(201, 169, 98, 0.3);
        }

        .btn-next:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(201, 169, 98, 0.4);
        }

        .btn-next:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .loading-spinner {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 2px solid transparent;
          border-top-color: currentColor;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Header with skip button */}
      <div className="header">
        <div></div>
        <button className="skip-btn" onClick={onSkip}>
          Continuer plus tard
        </button>
      </div>

      {/* Progress bar */}
      <div className="progress-container">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="step-text">Étape {currentStep} sur {totalSteps}</div>
      </div>

      {/* Main content */}
      <div className="content">
        {icon && (
          <div className="icon">
            <i className={`fa-solid ${icon}`} />
          </div>
        )}
        <h1 className="title">{title}</h1>
        {subtitle && <p className="subtitle">{subtitle}</p>}
        <div className="input-container">
          {children}
        </div>
      </div>

      {/* Action buttons */}
      <div className="actions">
        {showBack && currentStep > 1 && (
          <button className="btn btn-back" onClick={onBack}>
            <i className="fa-solid fa-arrow-left" style={{ marginRight: 8 }} />
            Retour
          </button>
        )}
        <button
          className="btn btn-next"
          onClick={onNext}
          disabled={!canProceed || isLoading}
        >
          {isLoading ? (
            <span className="loading-spinner" />
          ) : (
            <>
              {nextLabel}
              <i className="fa-solid fa-arrow-right" style={{ marginLeft: 8 }} />
            </>
          )}
        </button>
      </div>
    </div>
  )
}
