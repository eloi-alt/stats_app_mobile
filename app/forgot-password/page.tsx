"use client"

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/utils/supabase/client'

/**
 * Forgot Password Page
 * 
 * SECURITY FEATURES:
 * 1. Uses Supabase's PKCE flow via redirectTo parameter
 * 2. Generic success message to prevent user enumeration
 * 3. Redirects through /auth/callback for proper session handling
 */
export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            // Request password reset email
            // The redirectTo must point to our callback route with a next parameter
            // This ensures the PKCE code exchange happens properly
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
            })

            if (error) {
                // Log error for debugging but show generic message
                console.error('[ForgotPassword] Error:', error)
                // Still show success to prevent enumeration
            }

            // ALWAYS show success message (prevents user enumeration)
            // Attacker can't tell if email exists or not
            setSubmitted(true)
        } catch (err) {
            console.error('[ForgotPassword] Unexpected error:', err)
            setError('Une erreur inattendue s\'est produite. Veuillez réessayer.')
        } finally {
            setLoading(false)
        }
    }

    if (submitted) {
        return (
            <div className="forgot-password-page">
                <style jsx>{`
                    .forgot-password-page {
                        min-height: 100vh;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        padding: 24px;
                        background: var(--bg-primary);
                    }

                    .card {
                        width: 100%;
                        max-width: 400px;
                        padding: 32px;
                        border-radius: 24px;
                        background: var(--bg-card);
                        border: 1px solid var(--border-light);
                        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
                        text-align: center;
                    }

                    .success-icon {
                        font-size: 48px;
                        margin-bottom: 16px;
                    }

                    .title {
                        font-size: 24px;
                        font-weight: 600;
                        color: var(--text-primary);
                        margin-bottom: 12px;
                    }

                    .message {
                        font-size: 14px;
                        color: var(--text-secondary);
                        line-height: 1.6;
                        margin-bottom: 24px;
                    }

                    .back-link {
                        color: var(--accent-gold);
                        text-decoration: none;
                        font-size: 14px;
                        font-weight: 500;
                    }

                    .back-link:hover {
                        text-decoration: underline;
                    }
                `}</style>

                <div className="card">
                    <div className="success-icon">✉️</div>
                    <h1 className="title">Vérifiez vos emails</h1>
                    <p className="message">
                        Si un compte existe avec l&apos;adresse <strong>{email}</strong>,
                        vous recevrez un lien pour réinitialiser votre mot de passe.
                        <br /><br />
                        Le lien expire dans 1 heure.
                    </p>
                    <Link href="/login" className="back-link">
                        ← Retour à la connexion
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="forgot-password-page">
            <style jsx>{`
                .forgot-password-page {
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 24px;
                    background: var(--bg-primary);
                }

                .card {
                    width: 100%;
                    max-width: 400px;
                    padding: 32px;
                    border-radius: 24px;
                    background: var(--bg-card);
                    border: 1px solid var(--border-light);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
                }

                .header {
                    text-align: center;
                    margin-bottom: 32px;
                }

                .icon {
                    font-size: 48px;
                    margin-bottom: 16px;
                }

                .title {
                    font-size: 24px;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin-bottom: 8px;
                }

                .subtitle {
                    font-size: 14px;
                    color: var(--text-secondary);
                    line-height: 1.5;
                }

                .form {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .input-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .label {
                    font-size: 14px;
                    font-weight: 500;
                    color: var(--text-secondary);
                }

                .input {
                    width: 100%;
                    padding: 14px 16px;
                    border: 2px solid var(--border-light);
                    border-radius: 12px;
                    font-size: 16px;
                    background: var(--bg-secondary);
                    color: var(--text-primary);
                    transition: all 0.2s;
                }

                .input:focus {
                    outline: none;
                    border-color: var(--accent-gold);
                    box-shadow: 0 0 0 4px rgba(201, 169, 98, 0.1);
                }

                .error {
                    padding: 12px;
                    background: rgba(231, 76, 60, 0.1);
                    border: 1px solid rgba(231, 76, 60, 0.3);
                    border-radius: 8px;
                    color: #e74c3c;
                    font-size: 14px;
                    text-align: center;
                }

                .btn {
                    width: 100%;
                    padding: 16px;
                    border: none;
                    border-radius: 12px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    background: linear-gradient(135deg, var(--accent-gold), var(--accent-sand));
                    color: white;
                    box-shadow: 0 4px 16px rgba(201, 169, 98, 0.3);
                }

                .btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(201, 169, 98, 0.4);
                }

                .btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .back-link {
                    display: block;
                    text-align: center;
                    margin-top: 24px;
                    color: var(--text-tertiary);
                    text-decoration: none;
                    font-size: 14px;
                }

                .back-link:hover {
                    color: var(--text-secondary);
                }
            `}</style>

            <div className="card">
                <div className="header">
                    <div className="icon">🔑</div>
                    <h1 className="title">Mot de passe oublié ?</h1>
                    <p className="subtitle">
                        Entrez votre adresse email et nous vous enverrons un lien
                        pour réinitialiser votre mot de passe.
                    </p>
                </div>

                <form className="form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="label" htmlFor="email">
                            Adresse email
                        </label>
                        <input
                            id="email"
                            type="email"
                            className="input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="votre@email.com"
                            required
                            autoComplete="email"
                            autoFocus
                        />
                    </div>

                    {error && <div className="error">{error}</div>}

                    <button type="submit" className="btn" disabled={loading || !email}>
                        {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
                    </button>
                </form>

                <Link href="/login" className="back-link">
                    ← Retour à la connexion
                </Link>
            </div>
        </div>
    )
}
