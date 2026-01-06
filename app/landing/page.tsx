"use client"

import { useRouter } from 'next/navigation'
import { useVisitor } from '@/contexts/VisitorContext'
import { useState } from 'react'

export default function LandingPage() {
    const router = useRouter()
    const { setIsVisitor } = useVisitor()
    const [isLoading, setIsLoading] = useState<string | null>(null)

    const handleVisitorMode = () => {
        setIsLoading('visitor')
        setIsVisitor(true)
        router.push('/')
    }

    const handleSignIn = () => {
        setIsLoading('signin')
        router.push('/login')
    }

    const handleSignUp = () => {
        setIsLoading('signup')
        router.push('/login?mode=signup')
    }

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background gradient */}
            <div
                className="absolute inset-0 -z-10"
                style={{
                    background: 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 50%, var(--bg-primary) 100%)',
                }}
            />

            {/* Decorative circles */}
            <div
                className="absolute top-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full opacity-20 blur-3xl"
                style={{ background: 'var(--accent-sage)' }}
            />
            <div
                className="absolute bottom-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full opacity-15 blur-3xl"
                style={{ background: 'var(--accent-lavender)' }}
            />

            {/* Main content */}
            <div className="w-full max-w-md space-y-8 text-center relative z-10">
                {/* Logo/Brand */}
                <div className="space-y-4">
                    <div
                        className="w-24 h-24 mx-auto mb-6 relative hover:scale-105 transition-transform duration-300"
                    >
                        <img
                            src="/icon2.png"
                            alt="STATS Logo"
                            className="w-full h-full object-contain drop-shadow-2xl"
                        />
                    </div>
                    <h1
                        className="text-4xl font-bold tracking-tight"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        STATS
                    </h1>
                    <p
                        className="text-lg font-light"
                        style={{ color: 'var(--text-secondary)' }}
                    >
                        Ultimate Edition
                    </p>
                </div>

                {/* Tagline */}
                <p
                    className="text-sm max-w-xs mx-auto"
                    style={{ color: 'var(--text-tertiary)' }}
                >
                    Votre vie en données. Santé, voyages, finances, carrière — tout en un coup d&apos;œil.
                </p>

                {/* Action buttons */}
                <div className="space-y-3 pt-6">
                    {/* Sign In */}
                    <button
                        onClick={handleSignIn}
                        disabled={isLoading !== null}
                        className="w-full py-4 rounded-2xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                        style={{
                            background: 'linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-sand) 100%)',
                            color: 'white',
                            boxShadow: '0 4px 20px rgba(201, 169, 98, 0.3)',
                        }}
                    >
                        {isLoading === 'signin' ? (
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                        ) : (
                            <>
                                <i className="fa-solid fa-right-to-bracket" />
                                Se connecter
                            </>
                        )}
                    </button>

                    {/* Sign Up */}
                    <button
                        onClick={handleSignUp}
                        disabled={isLoading !== null}
                        className="w-full py-4 rounded-2xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                        style={{
                            background: 'var(--bg-card)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border-light)',
                        }}
                    >
                        {isLoading === 'signup' ? (
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                        ) : (
                            <>
                                <i className="fa-solid fa-user-plus" />
                                Créer un compte
                            </>
                        )}
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-4 py-2">
                        <div className="flex-1 h-px" style={{ background: 'var(--border-light)' }} />
                        <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>ou</span>
                        <div className="flex-1 h-px" style={{ background: 'var(--border-light)' }} />
                    </div>

                    {/* Visitor Mode */}
                    <button
                        onClick={handleVisitorMode}
                        disabled={isLoading !== null}
                        className="w-full py-4 rounded-2xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
                        style={{
                            background: 'rgba(139, 168, 136, 0.15)',
                            color: 'var(--accent-sage)',
                            border: '1px solid rgba(139, 168, 136, 0.3)',
                        }}
                    >
                        {isLoading === 'visitor' ? (
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                        ) : (
                            <>
                                <i className="fa-solid fa-eye" />
                                Mode Visiteur
                            </>
                        )}
                    </button>

                    <p
                        className="text-xs pt-1"
                        style={{ color: 'var(--text-tertiary)' }}
                    >
                        Explorez l&apos;app avec des données de démonstration
                    </p>
                </div>
            </div>

            {/* Footer */}
            <div
                className="absolute bottom-6 text-xs"
                style={{ color: 'var(--text-tertiary)' }}
            >
                v2.0 • Made with ♥
            </div>
        </div>
    )
}
