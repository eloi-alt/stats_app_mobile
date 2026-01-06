'use client'

import { useRouter } from 'next/navigation'

interface EmptyModuleStateProps {
    moduleName: string
    moduleIcon: string
    moduleColor: string
    title: string
    description: string
    actionLabel: string
    onAction?: () => void
    actionHref?: string
    secondaryActionLabel?: string
    onSecondaryAction?: () => void
}

export default function EmptyModuleState({
    moduleName,
    moduleIcon,
    moduleColor,
    title,
    description,
    actionLabel,
    onAction,
    actionHref,
    secondaryActionLabel,
    onSecondaryAction
}: EmptyModuleStateProps) {
    const router = useRouter()

    const handleAction = () => {
        if (onAction) {
            onAction()
        } else if (actionHref) {
            router.push(actionHref)
        }
    }

    return (
        <div className="empty-module-state">
            <style jsx>{`
                .empty-module-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 50vh;
                    padding: 32px 24px;
                    text-align: center;
                }

                .empty-icon {
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    background: ${moduleColor}15;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 20px;
                }

                .empty-icon i {
                    font-size: 32px;
                    color: ${moduleColor};
                    opacity: 0.8;
                }

                .empty-title {
                    font-size: 20px;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin-bottom: 8px;
                }

                .empty-description {
                    font-size: 14px;
                    color: var(--text-secondary);
                    line-height: 1.5;
                    max-width: 280px;
                    margin-bottom: 24px;
                }

                .empty-action {
                    padding: 14px 28px;
                    background: ${moduleColor};
                    border: none;
                    border-radius: 14px;
                    color: white;
                    font-size: 15px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .empty-action:hover {
                    transform: translateY(-2px);
                    opacity: 0.9;
                }

                .empty-action:active {
                    transform: translateY(0);
                }

                .secondary-action {
                    margin-top: 12px;
                    padding: 10px 20px;
                    background: transparent;
                    border: 1px solid var(--border-light);
                    border-radius: 12px;
                    color: var(--text-secondary);
                    font-size: 13px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .secondary-action:hover {
                    border-color: ${moduleColor};
                    color: ${moduleColor};
                }

                .empty-hint {
                    margin-top: 24px;
                    font-size: 12px;
                    color: var(--text-tertiary);
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .empty-hint i {
                    font-size: 14px;
                }
            `}</style>

            <div className="empty-icon">
                <i className={`fa-solid ${moduleIcon}`}></i>
            </div>

            <h3 className="empty-title">{title}</h3>
            <p className="empty-description">{description}</p>

            <button className="empty-action" onClick={handleAction}>
                <i className="fa-solid fa-plus"></i>
                {actionLabel}
            </button>

            {secondaryActionLabel && onSecondaryAction && (
                <button className="secondary-action" onClick={onSecondaryAction}>
                    {secondaryActionLabel}
                </button>
            )}
        </div>
    )
}
