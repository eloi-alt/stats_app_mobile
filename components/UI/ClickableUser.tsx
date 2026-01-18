'use client'

import { useCallback } from 'react'
import { useFriendContextOptional } from '@/contexts/FriendContext'
import haptics from '@/utils/haptics'

interface ClickableUserProps {
    userId: string
    name?: string
    avatarUrl?: string
    showAvatar?: boolean
    showName?: boolean
    avatarSize?: 'xs' | 'sm' | 'md' | 'lg'
    className?: string
    nameClassName?: string
    avatarClassName?: string
    disabled?: boolean
    children?: React.ReactNode
}

const avatarSizes = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
}

const iconSizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
}

export default function ClickableUser({
    userId,
    name,
    avatarUrl,
    showAvatar = true,
    showName = true,
    avatarSize = 'md',
    className = '',
    nameClassName = '',
    avatarClassName = '',
    disabled = false,
    children
}: ClickableUserProps) {
    const friendContext = useFriendContextOptional()

    const handleClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation()
        e.preventDefault()

        if (disabled || !friendContext) return

        haptics.light()
        friendContext.openFriendProfile(userId)
    }, [userId, disabled, friendContext])

    // If no context or disabled, just render content without click handler
    if (!friendContext || disabled) {
        return (
            <span className={`inline-flex items-center gap-2 ${className}`}>
                {children ? children : (
                    <>
                        {showAvatar && (
                            <span
                                className={`${avatarSizes[avatarSize]} rounded-full overflow-hidden flex-shrink-0 ${avatarClassName}`}
                                style={{ background: avatarUrl ? 'transparent' : 'var(--bg-secondary)' }}
                            >
                                {avatarUrl ? (
                                    <img
                                        src={avatarUrl}
                                        alt={name || 'User'}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="w-full h-full flex items-center justify-center">
                                        <i className={`fa-solid fa-user ${iconSizes[avatarSize]}`} style={{ color: 'var(--text-muted)' }} />
                                    </span>
                                )}
                            </span>
                        )}
                        {showName && name && (
                            <span className={nameClassName} style={{ color: 'var(--text-primary)' }}>
                                {name}
                            </span>
                        )}
                    </>
                )}
            </span>
        )
    }

    return (
        <button
            onClick={handleClick}
            className={`inline-flex items-center gap-2 cursor-pointer transition-opacity hover:opacity-80 active:opacity-60 ${className}`}
            style={{ background: 'transparent', border: 'none', padding: 0 }}
            type="button"
        >
            {children ? children : (
                <>
                    {showAvatar && (
                        <span
                            className={`${avatarSizes[avatarSize]} rounded-full overflow-hidden flex-shrink-0 ${avatarClassName}`}
                            style={{ background: avatarUrl ? 'transparent' : 'var(--bg-secondary)' }}
                        >
                            {avatarUrl ? (
                                <img
                                    src={avatarUrl}
                                    alt={name || 'User'}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="w-full h-full flex items-center justify-center">
                                    <i className={`fa-solid fa-user ${iconSizes[avatarSize]}`} style={{ color: 'var(--text-muted)' }} />
                                </span>
                            )}
                        </span>
                    )}
                    {showName && name && (
                        <span className={nameClassName} style={{ color: 'var(--text-primary)' }}>
                            {name}
                        </span>
                    )}
                </>
            )}
        </button>
    )
}

// Export a simpler component for just the avatar
export function ClickableAvatar({
    userId,
    avatarUrl,
    name,
    size = 'md',
    className = '',
    disabled = false
}: {
    userId: string
    avatarUrl?: string
    name?: string
    size?: 'xs' | 'sm' | 'md' | 'lg'
    className?: string
    disabled?: boolean
}) {
    return (
        <ClickableUser
            userId={userId}
            avatarUrl={avatarUrl}
            name={name}
            showAvatar={true}
            showName={false}
            avatarSize={size}
            avatarClassName={className}
            disabled={disabled}
        />
    )
}

// Export a simpler component for just the name
export function ClickableName({
    userId,
    name,
    className = '',
    disabled = false
}: {
    userId: string
    name: string
    className?: string
    disabled?: boolean
}) {
    return (
        <ClickableUser
            userId={userId}
            name={name}
            showAvatar={false}
            showName={true}
            nameClassName={className}
            disabled={disabled}
        />
    )
}
