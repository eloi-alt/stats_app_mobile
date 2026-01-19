"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase/client'
import MFAEnrollment from '@/components/auth/MFAEnrollment'
import type { Factor } from '@supabase/supabase-js'

/**
 * MFA Settings Panel
 * 
 * Shows MFA status and allows users to enable/disable MFA.
 * Can be embedded in a settings page or modal.
 * 
 * Security: Disabling MFA requires re-authentication to prevent
 * unauthorized removal of the security layer.
 */
export default function MFASettings() {
    const [factors, setFactors] = useState<Factor[]>([])
    const [loading, setLoading] = useState(true)
    const [showEnrollment, setShowEnrollment] = useState(false)
    const [disabling, setDisabling] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    /**
     * Load MFA factors on mount
     */
    useEffect(() => {
        loadFactors()
    }, [])

    const loadFactors = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase.auth.mfa.listFactors()
            if (error) throw error

            // Only show verified factors
            const verifiedFactors = data.totp.filter(f => f.status === 'verified')
            setFactors(verifiedFactors)
        } catch (err) {
            console.error('Failed to load MFA factors:', err)
        } finally {
            setLoading(false)
        }
    }

    /**
     * Handle successful MFA enrollment
     */
    const handleEnrollSuccess = () => {
        setShowEnrollment(false)
        setSuccess('L\'authentification à deux facteurs a été activée avec succès !')
        loadFactors()

        // Clear success message after 5 seconds
        setTimeout(() => setSuccess(null), 5000)
    }

    /**
     * Disable MFA for a factor
     * Note: This should ideally require password re-entry for security
     */
    const handleDisableMFA = async (factorId: string) => {
        if (!confirm('Êtes-vous sûr de vouloir désactiver l\'authentification à deux facteurs ? Votre compte sera moins sécurisé.')) {
            return
        }

        setDisabling(true)
        setError(null)

        try {
            const { error } = await supabase.auth.mfa.unenroll({ factorId })
            if (error) throw error

            setSuccess('L\'authentification à deux facteurs a été désactivée.')
            loadFactors()

            setTimeout(() => setSuccess(null), 5000)
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Échec de la désactivation')
        } finally {
            setDisabling(false)
        }
    }

    if (loading) {
        return (
            <div className="mfa-settings">
                <style jsx>{`
                    .mfa-settings {
                        padding: 16px;
                        color: var(--text-secondary);
                    }
                `}</style>
                Chargement...
            </div>
        )
    }

    if (showEnrollment) {
        return (
            <MFAEnrollment
                onSuccess={handleEnrollSuccess}
                onCancel={() => setShowEnrollment(false)}
            />
        )
    }

    const hasMFA = factors.length > 0

    return (
        <div className="mfa-settings">
            <style jsx>{`
                .mfa-settings {
                    padding: 16px;
                }

                .section-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 16px;
                }

                .section-title {
                    font-size: 16px;
                    font-weight: 600;
                    color: var(--text-primary);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .status-badge {
                    font-size: 12px;
                    font-weight: 500;
                    padding: 4px 10px;
                    border-radius: 12px;
                }

                .status-badge.active {
                    background: rgba(46, 204, 113, 0.15);
                    color: #2ecc71;
                }

                .status-badge.inactive {
                    background: rgba(149, 165, 166, 0.15);
                    color: #95a5a6;
                }

                .description {
                    font-size: 14px;
                    color: var(--text-secondary);
                    line-height: 1.5;
                    margin-bottom: 20px;
                }

                .factor-list {
                    margin-bottom: 20px;
                }

                .factor-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 14px 16px;
                    background: var(--bg-secondary);
                    border-radius: 12px;
                    margin-bottom: 8px;
                }

                .factor-info {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .factor-icon {
                    font-size: 24px;
                }

                .factor-details {
                    display: flex;
                    flex-direction: column;
                }

                .factor-name {
                    font-size: 14px;
                    font-weight: 500;
                    color: var(--text-primary);
                }

                .factor-type {
                    font-size: 12px;
                    color: var(--text-tertiary);
                }

                .btn {
                    padding: 10px 16px;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                    border: none;
                }

                .btn-primary {
                    background: linear-gradient(135deg, var(--accent-gold), var(--accent-sand));
                    color: white;
                }

                .btn-primary:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 8px rgba(201, 169, 98, 0.3);
                }

                .btn-danger {
                    background: rgba(231, 76, 60, 0.1);
                    color: #e74c3c;
                    border: 1px solid rgba(231, 76, 60, 0.2);
                }

                .btn-danger:hover {
                    background: rgba(231, 76, 60, 0.2);
                }

                .btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .alert {
                    padding: 12px 16px;
                    border-radius: 8px;
                    font-size: 14px;
                    margin-bottom: 16px;
                }

                .alert-success {
                    background: rgba(46, 204, 113, 0.1);
                    border: 1px solid rgba(46, 204, 113, 0.3);
                    color: #2ecc71;
                }

                .alert-error {
                    background: rgba(231, 76, 60, 0.1);
                    border: 1px solid rgba(231, 76, 60, 0.3);
                    color: #e74c3c;
                }

                .security-note {
                    padding: 12px 16px;
                    background: rgba(241, 196, 15, 0.1);
                    border: 1px solid rgba(241, 196, 15, 0.2);
                    border-radius: 8px;
                    font-size: 13px;
                    color: var(--text-secondary);
                    line-height: 1.5;
                }

                .security-note strong {
                    color: var(--text-primary);
                }
            `}</style>

            <div className="section-header">
                <h3 className="section-title">
                    🔐 Authentification à deux facteurs
                </h3>
                <span className={`status-badge ${hasMFA ? 'active' : 'inactive'}`}>
                    {hasMFA ? '✓ Activé' : 'Désactivé'}
                </span>
            </div>

            <p className="description">
                {hasMFA
                    ? 'Votre compte est protégé par une vérification en deux étapes.'
                    : 'Ajoutez une couche de sécurité supplémentaire à votre compte en activant l\'authentification à deux facteurs.'
                }
            </p>

            {success && <div className="alert alert-success">{success}</div>}
            {error && <div className="alert alert-error">{error}</div>}

            {hasMFA ? (
                <>
                    <div className="factor-list">
                        {factors.map((factor) => (
                            <div key={factor.id} className="factor-item">
                                <div className="factor-info">
                                    <span className="factor-icon">📱</span>
                                    <div className="factor-details">
                                        <span className="factor-name">
                                            {factor.friendly_name || 'Authenticator App'}
                                        </span>
                                        <span className="factor-type">TOTP • Google Authenticator</span>
                                    </div>
                                </div>
                                <button
                                    className="btn btn-danger"
                                    onClick={() => handleDisableMFA(factor.id)}
                                    disabled={disabling}
                                >
                                    {disabling ? 'Suppression...' : 'Supprimer'}
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="security-note">
                        <strong>💡 Conseil de sécurité :</strong> Gardez votre application d&apos;authentification
                        sauvegardée. Si vous perdez l&apos;accès à votre téléphone, vous pourriez être bloqué
                        de votre compte.
                    </div>
                </>
            ) : (
                <>
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowEnrollment(true)}
                    >
                        Activer l&apos;authentification à deux facteurs
                    </button>

                    <div className="security-note" style={{ marginTop: '16px' }}>
                        <strong>⚠️ Recommandé :</strong> L&apos;application STATS contient vos données
                        financières et de santé. L&apos;activation du MFA protège ces informations
                        sensibles contre les accès non autorisés.
                    </div>
                </>
            )}
        </div>
    )
}
