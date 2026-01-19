"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/utils/supabase/client'

/**
 * Update Password Page (Protected Route)
 * 
 * SECURITY FEATURES:
 * 1. Only accessible with valid session (from email link)
 * 2. Validates new password strength
 * 3. Uses Supabase's secure updateUser API
 * 4. Clears session and redirects after success
 * 
 * FLOW:
 * 1. User clicks email link → /auth/callback?next=/update-password
 * 2. Callback exchanges code for session (PKCE)
 * 3. User lands here WITH active session
 * 4. User enters new password → updateUser()
 */
export default function UpdatePasswordPage() {
    const router = useRouter()
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [checkingAuth, setCheckingAuth] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    // SECURITY: Verify user has a valid session
    useEffect(() => {
        const checkSession = async () => {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                // No session = user hasn't clicked the email link properly
                // Redirect to login with error message
                router.push('/login?error=session_expired')
                return
            }

            setCheckingAuth(false)
        }

        checkSession()
    }, [router])

    const validatePassword = (pwd: string): string | null => {
        if (pwd.length < 8) {
            return 'Le mot de passe doit contenir au moins 8 caractères'
        }
        if (!/[A-Z]/.test(pwd)) {
            return 'Le mot de passe doit contenir au moins une majuscule'
        }
        if (!/[a-z]/.test(pwd)) {
            return 'Le mot de passe doit contenir au moins une minuscule'
        }
        if (!/[0-9]/.test(pwd)) {
            return 'Le mot de passe doit contenir au moins un chiffre'
        }
        return null
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        // Validate passwords match
        if (password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas')
            return
        }

        // Validate password strength
        const validationError = validatePassword(password)
        if (validationError) {
            setError(validationError)
            return
        }

        setLoading(true)

        try {
            // Update the password using Supabase Auth
            const { error } = await supabase.auth.updateUser({
                password: password
            })

            if (error) throw error

            // Success!
            setSuccess(true)

            // Sign out and redirect to login after 3 seconds
            setTimeout(async () => {
                await supabase.auth.signOut()
                router.push('/login?message=password_updated')
            }, 3000)
        } catch (err: unknown) {
            console.error('[UpdatePassword] Error:', err)
            setError(err instanceof Error ? err.message : 'Échec de la mise à jour du mot de passe')
        } finally {
            setLoading(false)
        }
    }

    // Show loading while checking auth
    if (checkingAuth) {
        return (
            <div className="update-password-page">
                <style jsx>{`
                    .update-password-page {
                        min-height: 100vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: var(--bg-primary);
                        color: var(--text-secondary);
                    }
                `}</style>
                Vérification de la session...
            </div>
        )
    }

    // Show success state
    if (success) {
        return (
            <div className="update-password-page">
                <style jsx>{`
                    .update-password-page {
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
                    }
                `}</style>

                <div className="card">
                    <div className="success-icon">✅</div>
                    <h1 className="title">Mot de passe mis à jour !</h1>
                    <p className="message">
                        Votre mot de passe a été changé avec succès.
                        <br />
                        Redirection vers la page de connexion...
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="update-password-page">
            <style jsx>{`
                .update-password-page {
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

                .password-requirements {
                    font-size: 12px;
                    color: var(--text-tertiary);
                    line-height: 1.5;
                    margin-top: 4px;
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
                    <div className="icon">🔐</div>
                    <h1 className="title">Nouveau mot de passe</h1>
                    <p className="subtitle">
                        Choisissez un mot de passe sécurisé pour votre compte
                    </p>
                </div>

                <form className="form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="label" htmlFor="password">
                            Nouveau mot de passe
                        </label>
                        <input
                            id="password"
                            type="password"
                            className="input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••••••"
                            required
                            autoComplete="new-password"
                            autoFocus
                        />
                        <p className="password-requirements">
                            Minimum 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre
                        </p>
                    </div>

                    <div className="input-group">
                        <label className="label" htmlFor="confirmPassword">
                            Confirmer le mot de passe
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            className="input"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••••••"
                            required
                            autoComplete="new-password"
                        />
                    </div>

                    {error && <div className="error">{error}</div>}

                    <button
                        type="submit"
                        className="btn"
                        disabled={loading || !password || !confirmPassword}
                    >
                        {loading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
                    </button>
                </form>

                <Link href="/login" className="back-link">
                    ← Retour à la connexion
                </Link>
            </div>
        </div>
    )
}
