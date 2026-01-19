"use client"

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/utils/supabase/client'

function LoginForm() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [isSignUp, setIsSignUp] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()

    // Check URL params for signup mode
    useEffect(() => {
        if (searchParams.get('mode') === 'signup') {
            setIsSignUp(true)
        }
    }, [searchParams])

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) throw error

            // Check if onboarding is completed
            const { data: profile } = await supabase
                .from('profiles')
                .select('onboarding_completed')
                .eq('id', data.user.id)
                .single()

            if (profile && !profile.onboarding_completed) {
                router.push('/onboarding')
            } else {
                router.push('/')
            }
            router.refresh()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSuccess(null)

        if (password.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères')
            setLoading(false)
            return
        }

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/onboarding`,
                }
            })

            if (error) throw error

            // If email confirmation is disabled, redirect directly to onboarding
            if (data.session) {
                router.push('/onboarding')
            } else {
                setSuccess('Vérifiez votre email pour confirmer votre inscription, puis revenez vous connecter.')
            }
        } catch (err: any) {
            console.error('Sign up error:', err)
            setError(err.message || 'Une erreur est survenue')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="login-container">
            <style jsx>{`
                .login-container {
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 24px;
                    background: var(--bg-primary);
                }

                .login-card {
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

                .title {
                    font-size: 28px;
                    font-weight: 700;
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
                    gap: 16px;
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
                    border-radius: 12px;
                    background: rgba(231, 76, 60, 0.1);
                    border: 1px solid rgba(231, 76, 60, 0.3);
                    color: #e74c3c;
                    font-size: 14px;
                    text-align: center;
                }

                .success {
                    padding: 12px;
                    border-radius: 12px;
                    background: rgba(46, 204, 113, 0.1);
                    border: 1px solid rgba(46, 204, 113, 0.3);
                    color: #2ecc71;
                    font-size: 14px;
                    text-align: center;
                }

                .submit-btn {
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
                    margin-top: 8px;
                }

                .submit-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(201, 169, 98, 0.4);
                }

                .submit-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .toggle {
                    margin-top: 24px;
                    text-align: center;
                    font-size: 14px;
                    color: var(--text-secondary);
                }

                .toggle-link {
                    color: var(--accent-gold);
                    cursor: pointer;
                    font-weight: 600;
                }

                .toggle-link:hover {
                    text-decoration: underline;
                }

                .back-link {
                    margin-top: 16px;
                    text-align: center;
                }

                .back-link a {
                    color: var(--text-tertiary);
                    text-decoration: none;
                    font-size: 14px;
                }

                .back-link a:hover {
                    color: var(--text-secondary);
                }

                .loading-spinner {
                    display: inline-block;
                    width: 20px;
                    height: 20px;
                    border: 2px solid transparent;
                    border-top-color: currentColor;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                    margin-right: 8px;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>

            <div className="login-card">
                <div className="header">
                    <h1 className="title">
                        {isSignUp ? 'Créer un compte' : 'Bon retour !'}
                    </h1>
                    <p className="subtitle">
                        {isSignUp ? 'Rejoignez STATS pour suivre votre vie' : 'Connectez-vous pour continuer'}
                    </p>
                </div>

                <form className="form" onSubmit={isSignUp ? handleSignUp : handleSignIn}>
                    <div className="input-group">
                        <label className="label" htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            className="input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="votre@email.com"
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="input-group">
                        <label className="label" htmlFor="password">Mot de passe</label>
                        <input
                            id="password"
                            type="password"
                            className="input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            autoComplete={isSignUp ? 'new-password' : 'current-password'}
                        />
                        {!isSignUp && (
                            <a
                                href="/forgot-password"
                                style={{
                                    fontSize: '13px',
                                    color: 'var(--accent-gold)',
                                    textDecoration: 'none',
                                    marginTop: '4px',
                                    display: 'inline-block'
                                }}
                            >
                                Mot de passe oublié ?
                            </a>
                        )}
                    </div>

                    {error && <div className="error">{error}</div>}
                    {success && <div className="success">{success}</div>}

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading && <span className="loading-spinner" />}
                        {isSignUp ? "S'inscrire" : 'Se connecter'}
                    </button>
                </form>

                <div className="toggle">
                    {isSignUp ? (
                        <>
                            Déjà un compte ?{' '}
                            <span className="toggle-link" onClick={() => { setIsSignUp(false); setError(null); setSuccess(null); }}>
                                Se connecter
                            </span>
                        </>
                    ) : (
                        <>
                            Pas encore de compte ?{' '}
                            <span className="toggle-link" onClick={() => { setIsSignUp(true); setError(null); setSuccess(null); }}>
                                S&apos;inscrire
                            </span>
                        </>
                    )}
                </div>

                <div className="back-link">
                    <a href="/landing">← Retour à l&apos;accueil</a>
                </div>
            </div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
                <div style={{ color: 'var(--text-secondary)' }}>Chargement...</div>
            </div>
        }>
            <LoginForm />
        </Suspense>
    )
}
