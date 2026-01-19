"use client"

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import MFAVerification from '@/components/auth/MFAVerification'

function MFAVerifyContent() {
    const searchParams = useSearchParams()
    const next = searchParams.get('next') || '/dashboard'

    const handleCancel = () => {
        // Redirect to login if user cancels
        window.location.href = '/login'
    }

    return (
        <div className="mfa-verify-page">
            <style jsx>{`
                .mfa-verify-page {
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 24px;
                    background: var(--bg-primary);
                }

                .mfa-card {
                    width: 100%;
                    max-width: 440px;
                    padding: 24px;
                    border-radius: 24px;
                    background: var(--bg-card);
                    border: 1px solid var(--border-light);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
                }

                .back-link {
                    margin-top: 24px;
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
            `}</style>

            <div className="mfa-card">
                <MFAVerification
                    redirectTo={next}
                    onCancel={handleCancel}
                />
            </div>

            <div className="back-link">
                <a href="/login">← Utiliser un autre compte</a>
            </div>
        </div>
    )
}

export default function MFAVerifyPage() {
    return (
        <Suspense fallback={
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-primary)'
            }}>
                <div style={{ color: 'var(--text-secondary)' }}>Chargement...</div>
            </div>
        }>
            <MFAVerifyContent />
        </Suspense>
    )
}
