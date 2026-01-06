'use client'

import { useRouter } from 'next/navigation'

interface MissingDataPromptProps {
    moduleName: string
    moduleIcon: string
    moduleColor: string
    missingFields: { key: string; label: string }[]
    onComplete?: () => void
}

export default function MissingDataPrompt({
    moduleName,
    moduleIcon,
    moduleColor,
    missingFields,
    onComplete
}: MissingDataPromptProps) {
    const router = useRouter()

    const handleCompleteProfile = () => {
        router.push('/onboarding')
        onComplete?.()
    }

    return (
        <div className="missing-data-container">
            <style jsx>{`
                .missing-data-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 60vh;
                    padding: 24px;
                    text-align: center;
                }

                .missing-data-card {
                    background: rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 24px;
                    padding: 40px 32px;
                    max-width: 400px;
                    width: 100%;
                }

                .icon-container {
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    background: ${moduleColor}20;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 24px;
                }

                .icon-container i {
                    font-size: 32px;
                    color: ${moduleColor};
                }

                .title {
                    font-size: 24px;
                    font-weight: 700;
                    color: var(--text-primary);
                    margin-bottom: 8px;
                }

                .subtitle {
                    font-size: 14px;
                    color: var(--text-secondary);
                    margin-bottom: 24px;
                    line-height: 1.5;
                }

                .missing-fields {
                    background: rgba(0, 0, 0, 0.2);
                    border-radius: 12px;
                    padding: 16px;
                    margin-bottom: 24px;
                }

                .missing-fields-title {
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--text-tertiary);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 12px;
                }

                .missing-field {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 0;
                    color: var(--text-secondary);
                    font-size: 14px;
                }

                .missing-field i {
                    color: var(--accent-rose);
                    font-size: 12px;
                }

                .complete-btn {
                    width: 100%;
                    padding: 16px;
                    background: ${moduleColor};
                    border: none;
                    border-radius: 16px;
                    color: white;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: transform 0.2s, opacity 0.2s;
                }

                .complete-btn:hover {
                    transform: translateY(-2px);
                    opacity: 0.9;
                }

                .complete-btn:active {
                    transform: translateY(0);
                }

                .skip-btn {
                    margin-top: 12px;
                    padding: 12px;
                    background: transparent;
                    border: none;
                    color: var(--text-tertiary);
                    font-size: 14px;
                    cursor: pointer;
                    transition: color 0.2s;
                }

                .skip-btn:hover {
                    color: var(--text-secondary);
                }
            `}</style>

            <div className="missing-data-card">
                <div className="icon-container">
                    <i className={`fa-solid ${moduleIcon}`}></i>
                </div>

                <h2 className="title">Module {moduleName}</h2>
                <p className="subtitle">
                    Pour accéder à ce module, veuillez d'abord compléter les informations suivantes dans votre profil.
                </p>

                <div className="missing-fields">
                    <div className="missing-fields-title">Données manquantes</div>
                    {missingFields.map((field) => (
                        <div key={field.key} className="missing-field">
                            <i className="fa-solid fa-circle-exclamation"></i>
                            <span>{field.label}</span>
                        </div>
                    ))}
                </div>

                <button className="complete-btn" onClick={handleCompleteProfile}>
                    <i className="fa-solid fa-pen-to-square" style={{ marginRight: 8 }}></i>
                    Compléter mon profil
                </button>
            </div>
        </div>
    )
}
