"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase/client'
import type { Factor } from '@supabase/supabase-js'

interface MFAVerificationProps {
    /** URL to redirect to after successful verification */
    redirectTo?: string
    /** Callback when verification succeeds */
    onSuccess?: () => void
    /** Callback when user chooses to cancel */
    onCancel?: () => void
}

/**
 * MFA Verification Component
 * 
 * Displayed after login when user has MFA enabled but session is AAL1.
 * Prompts user to enter TOTP code to elevate session to AAL2.
 * 
 * Security: This component is part of the authentication flow and should
 * be displayed on a protected route. The verification happens server-side
 * through Supabase's MFA challenge/verify APIs.
 */
export default function MFAVerification({
    redirectTo = '/dashboard',
    onSuccess,
    onCancel
}: MFAVerificationProps) {
    const router = useRouter()
    const [factors, setFactors] = useState<Factor[]>([])
    const [selectedFactor, setSelectedFactor] = useState<Factor | null>(null)
    const [code, setCode] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [loadingFactors, setLoadingFactors] = useState(true)

    /**
     * Load user's enrolled MFA factors on mount
     */
    useEffect(() => {
        const loadFactors = async () => {
            try {
                const { data, error } = await supabase.auth.mfa.listFactors()

                if (error) throw error

                // Filter for verified TOTP factors only
                const verifiedFactors = data.totp.filter(f => f.status === 'verified')
                setFactors(verifiedFactors)

                // Auto-select if only one factor
                if (verifiedFactors.length === 1) {
                    setSelectedFactor(verifiedFactors[0])
                }
            } catch (err) {
                console.error('Failed to load MFA factors:', err)
                setError('Failed to load MFA methods')
            } finally {
                setLoadingFactors(false)
            }
        }

        loadFactors()
    }, [])

    /**
     * Verify the TOTP code to elevate session to AAL2
     */
    const handleVerify = async () => {
        if (!selectedFactor || code.length !== 6) return

        setLoading(true)
        setError(null)

        try {
            // Create a challenge for the selected factor
            const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
                factorId: selectedFactor.id
            })

            if (challengeError) throw challengeError

            // Verify the code
            const { error: verifyError } = await supabase.auth.mfa.verify({
                factorId: selectedFactor.id,
                challengeId: challengeData.id,
                code
            })

            if (verifyError) throw verifyError

            // Success! Session is now AAL2
            onSuccess?.()
            router.push(redirectTo)
            router.refresh()
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Code invalide. Veuillez réessayer.')
            setCode('')
        } finally {
            setLoading(false)
        }
    }

    /**
     * Handle Enter key press for quick submit
     */
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && code.length === 6 && !loading) {
            handleVerify()
        }
    }

    if (loadingFactors) {
        return (
            <div className="mfa-verification">
                <style jsx>{`
                    .mfa-verification {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        min-height: 300px;
                        color: var(--text-secondary);
                    }
                `}</style>
                Chargement...
            </div>
        )
    }

    if (factors.length === 0) {
        return (
            <div className="mfa-verification">
                <style jsx>{`
                    .mfa-verification {
                        padding: 24px;
                        text-align: center;
                    }
                    .error-state {
                        color: var(--text-secondary);
                    }
                `}</style>
                <div className="error-state">
                    <p>Aucune méthode MFA configurée.</p>
                    <button onClick={onCancel}>Retour</button>
                </div>
            </div>
        )
    }

    return (
        <div className="mfa-verification">
            <style jsx>{`
                .mfa-verification {
                    padding: 24px;
                    max-width: 400px;
                    margin: 0 auto;
                }

                .mfa-header {
                    text-align: center;
                    margin-bottom: 32px;
                }

                .shield-icon {
                    font-size: 48px;
                    margin-bottom: 16px;
                }

                .mfa-title {
                    font-size: 24px;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin-bottom: 8px;
                }

                .mfa-subtitle {
                    font-size: 14px;
                    color: var(--text-secondary);
                }

                .factor-selector {
                    margin-bottom: 24px;
                }

                .factor-option {
                    display: flex;
                    align-items: center;
                    padding: 16px;
                    border: 2px solid var(--border-light);
                    border-radius: 12px;
                    margin-bottom: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                    background: var(--bg-secondary);
                }

                .factor-option:hover {
                    border-color: var(--accent-gold);
                    background: var(--bg-tertiary);
                }

                .factor-option.selected {
                    border-color: var(--accent-gold);
                    background: rgba(201, 169, 98, 0.1);
                }

                .factor-icon {
                    font-size: 24px;
                    margin-right: 12px;
                }

                .factor-name {
                    font-size: 16px;
                    color: var(--text-primary);
                    font-weight: 500;
                }

                .code-input {
                    width: 100%;
                    padding: 20px;
                    font-size: 32px;
                    text-align: center;
                    letter-spacing: 12px;
                    border: 2px solid var(--border-light);
                    border-radius: 16px;
                    background: var(--bg-secondary);
                    color: var(--text-primary);
                    font-family: monospace;
                    margin-bottom: 24px;
                }

                .code-input:focus {
                    outline: none;
                    border-color: var(--accent-gold);
                    box-shadow: 0 0 0 4px rgba(201, 169, 98, 0.1);
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
                    padding: 16px 24px;
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

                .help-text {
                    text-align: center;
                    margin-top: 16px;
                    font-size: 13px;
                    color: var(--text-tertiary);
                }
            `}</style>

            <div className="mfa-header">
                <div className="shield-icon">🔐</div>
                <h2 className="mfa-title">Vérification requise</h2>
                <p className="mfa-subtitle">
                    Entrez le code de votre application d&apos;authentification
                </p>
            </div>

            {/* Factor selector (if multiple factors) */}
            {factors.length > 1 && (
                <div className="factor-selector">
                    {factors.map((factor) => (
                        <div
                            key={factor.id}
                            className={`factor-option ${selectedFactor?.id === factor.id ? 'selected' : ''}`}
                            onClick={() => setSelectedFactor(factor)}
                        >
                            <span className="factor-icon">📱</span>
                            <span className="factor-name">
                                {factor.friendly_name || 'Authenticator'}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {error && <div className="error-message">{error}</div>}

            <input
                type="text"
                className="code-input"
                value={code}
                onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                    setCode(value)
                }}
                onKeyDown={handleKeyDown}
                placeholder="000000"
                maxLength={6}
                autoFocus
                inputMode="numeric"
                autoComplete="one-time-code"
            />

            <div className="button-group">
                {onCancel && (
                    <button
                        className="btn btn-secondary"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Annuler
                    </button>
                )}
                <button
                    className="btn btn-primary"
                    onClick={handleVerify}
                    disabled={loading || code.length !== 6 || !selectedFactor}
                >
                    {loading ? 'Vérification...' : 'Vérifier'}
                </button>
            </div>

            <p className="help-text">
                Ouvrez Google Authenticator ou votre app similaire pour obtenir le code
            </p>
        </div>
    )
}
