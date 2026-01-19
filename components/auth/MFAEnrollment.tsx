"use client"

import { useState } from 'react'
import { supabase } from '@/utils/supabase/client'

interface MFAEnrollmentProps {
    onSuccess?: () => void
    onCancel?: () => void
}

/**
 * MFA Enrollment Component
 * 
 * Allows users to enable TOTP-based MFA using Google Authenticator or similar apps.
 * 
 * Security: This component uses Supabase's native MFA APIs which handle
 * cryptographic operations server-side. The QR code contains a TOTP secret
 * that is only transmitted once during enrollment.
 */
export default function MFAEnrollment({ onSuccess, onCancel }: MFAEnrollmentProps) {
    const [step, setStep] = useState<'initial' | 'scanning' | 'verifying'>('initial')
    const [qrCode, setQrCode] = useState<string | null>(null)
    const [secret, setSecret] = useState<string | null>(null)
    const [factorId, setFactorId] = useState<string | null>(null)
    const [verifyCode, setVerifyCode] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    /**
     * Step 1: Enroll a new TOTP factor
     * This generates a QR code that the user scans with their authenticator app
     */
    const handleEnroll = async () => {
        setLoading(true)
        setError(null)

        try {
            const { data, error } = await supabase.auth.mfa.enroll({
                factorType: 'totp',
                friendlyName: 'STATS Authenticator'
            })

            if (error) throw error

            // Store the enrollment data
            setQrCode(data.totp.qr_code)
            setSecret(data.totp.secret)
            setFactorId(data.id)
            setStep('scanning')
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to start MFA enrollment')
        } finally {
            setLoading(false)
        }
    }

    /**
     * Step 2: Verify the TOTP code to complete enrollment
     * This creates a challenge and verifies the user can generate valid codes
     */
    const handleVerify = async () => {
        if (!factorId || verifyCode.length !== 6) return

        setLoading(true)
        setError(null)

        try {
            // Create a challenge for this factor
            const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
                factorId
            })

            if (challengeError) throw challengeError

            // Verify the code
            const { error: verifyError } = await supabase.auth.mfa.verify({
                factorId,
                challengeId: challengeData.id,
                code: verifyCode
            })

            if (verifyError) throw verifyError

            // Success! MFA is now enabled
            onSuccess?.()
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Invalid verification code')
            setVerifyCode('')
        } finally {
            setLoading(false)
        }
    }

    /**
     * Cancel enrollment and unenroll the factor if it was created
     */
    const handleCancel = async () => {
        if (factorId) {
            // Unenroll the factor since enrollment wasn't completed
            await supabase.auth.mfa.unenroll({ factorId })
        }
        onCancel?.()
    }

    return (
        <div className="mfa-enrollment">
            <style jsx>{`
                .mfa-enrollment {
                    padding: 24px;
                    max-width: 400px;
                    margin: 0 auto;
                }

                .mfa-header {
                    text-align: center;
                    margin-bottom: 24px;
                }

                .mfa-title {
                    font-size: 20px;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin-bottom: 8px;
                }

                .mfa-subtitle {
                    font-size: 14px;
                    color: var(--text-secondary);
                    line-height: 1.5;
                }

                .qr-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 24px;
                    background: white;
                    border-radius: 16px;
                    margin-bottom: 16px;
                }

                .qr-code {
                    width: 200px;
                    height: 200px;
                    border-radius: 8px;
                }

                .secret-code {
                    margin-top: 16px;
                    padding: 12px 16px;
                    background: var(--bg-secondary);
                    border-radius: 8px;
                    font-family: monospace;
                    font-size: 12px;
                    color: var(--text-secondary);
                    word-break: break-all;
                    text-align: center;
                }

                .secret-label {
                    font-size: 12px;
                    color: var(--text-tertiary);
                    margin-bottom: 4px;
                }

                .verify-input {
                    width: 100%;
                    padding: 16px;
                    font-size: 24px;
                    text-align: center;
                    letter-spacing: 8px;
                    border: 2px solid var(--border-light);
                    border-radius: 12px;
                    background: var(--bg-secondary);
                    color: var(--text-primary);
                    font-family: monospace;
                    margin-bottom: 16px;
                }

                .verify-input:focus {
                    outline: none;
                    border-color: var(--accent-gold);
                }

                .error-message {
                    padding: 12px;
                    background: rgba(231, 76, 60, 0.1);
                    border: 1px solid rgba(231, 76, 60, 0.3);
                    border-radius: 8px;
                    color: #e74c3c;
                    font-size: 14px;
                    text-align: center;
                    margin-bottom: 16px;
                }

                .button-group {
                    display: flex;
                    gap: 12px;
                }

                .btn {
                    flex: 1;
                    padding: 14px 24px;
                    border-radius: 12px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    border: none;
                }

                .btn-primary {
                    background: linear-gradient(135deg, var(--accent-gold), var(--accent-sand));
                    color: white;
                }

                .btn-primary:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(201, 169, 98, 0.3);
                }

                .btn-secondary {
                    background: var(--bg-secondary);
                    color: var(--text-secondary);
                    border: 1px solid var(--border-light);
                }

                .btn-secondary:hover {
                    background: var(--bg-tertiary);
                }

                .btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .step-indicator {
                    display: flex;
                    justify-content: center;
                    gap: 8px;
                    margin-bottom: 24px;
                }

                .step-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: var(--border-light);
                }

                .step-dot.active {
                    background: var(--accent-gold);
                }

                .instructions {
                    background: var(--bg-secondary);
                    border-radius: 12px;
                    padding: 16px;
                    margin-bottom: 20px;
                }

                .instructions ol {
                    margin: 0;
                    padding-left: 20px;
                }

                .instructions li {
                    font-size: 14px;
                    color: var(--text-secondary);
                    margin-bottom: 8px;
                    line-height: 1.5;
                }

                .instructions li:last-child {
                    margin-bottom: 0;
                }

                .shield-icon {
                    font-size: 48px;
                    margin-bottom: 16px;
                }
            `}</style>

            {/* Step Indicator */}
            <div className="step-indicator">
                <div className={`step-dot ${step === 'initial' ? 'active' : ''}`} />
                <div className={`step-dot ${step === 'scanning' ? 'active' : ''}`} />
                <div className={`step-dot ${step === 'verifying' ? 'active' : ''}`} />
            </div>

            {/* Step 1: Initial */}
            {step === 'initial' && (
                <>
                    <div className="mfa-header">
                        <div className="shield-icon">🔐</div>
                        <h2 className="mfa-title">Activer l&apos;authentification à deux facteurs</h2>
                        <p className="mfa-subtitle">
                            Protégez votre compte avec une couche de sécurité supplémentaire.
                            Vous aurez besoin d&apos;une application comme Google Authenticator.
                        </p>
                    </div>

                    <div className="instructions">
                        <ol>
                            <li>Téléchargez <strong>Google Authenticator</strong> ou <strong>Authy</strong> sur votre téléphone</li>
                            <li>Scannez le QR code qui apparaîtra</li>
                            <li>Entrez le code à 6 chiffres pour vérifier</li>
                        </ol>
                    </div>

                    <div className="button-group">
                        <button
                            className="btn btn-secondary"
                            onClick={onCancel}
                            disabled={loading}
                        >
                            Annuler
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={handleEnroll}
                            disabled={loading}
                        >
                            {loading ? 'Chargement...' : 'Commencer'}
                        </button>
                    </div>
                </>
            )}

            {/* Step 2: Scanning QR Code */}
            {step === 'scanning' && qrCode && (
                <>
                    <div className="mfa-header">
                        <h2 className="mfa-title">Scannez le QR Code</h2>
                        <p className="mfa-subtitle">
                            Ouvrez votre application d&apos;authentification et scannez ce code
                        </p>
                    </div>

                    <div className="qr-container">
                        <img
                            src={qrCode}
                            alt="QR Code pour MFA"
                            className="qr-code"
                        />
                        {secret && (
                            <div className="secret-code">
                                <div className="secret-label">Ou entrez ce code manuellement :</div>
                                {secret}
                            </div>
                        )}
                    </div>

                    <div className="button-group">
                        <button
                            className="btn btn-secondary"
                            onClick={handleCancel}
                        >
                            Annuler
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={() => setStep('verifying')}
                        >
                            Suivant
                        </button>
                    </div>
                </>
            )}

            {/* Step 3: Verifying Code */}
            {step === 'verifying' && (
                <>
                    <div className="mfa-header">
                        <h2 className="mfa-title">Vérifiez votre code</h2>
                        <p className="mfa-subtitle">
                            Entrez le code à 6 chiffres affiché dans votre application
                        </p>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <input
                        type="text"
                        className="verify-input"
                        value={verifyCode}
                        onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                            setVerifyCode(value)
                        }}
                        placeholder="000000"
                        maxLength={6}
                        autoFocus
                        inputMode="numeric"
                    />

                    <div className="button-group">
                        <button
                            className="btn btn-secondary"
                            onClick={() => setStep('scanning')}
                            disabled={loading}
                        >
                            Retour
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={handleVerify}
                            disabled={loading || verifyCode.length !== 6}
                        >
                            {loading ? 'Vérification...' : 'Activer MFA'}
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}
