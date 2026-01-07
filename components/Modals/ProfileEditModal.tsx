'use client'

import { useState, useEffect } from 'react'
import BottomSheet from '../UI/BottomSheet'
import { supabase } from '@/utils/supabase/client'

interface ProfileEditModalProps {
    isOpen: boolean
    onClose: () => void
    userId: string
    currentUsername?: string
    onSave: (newUsername: string) => void
}

export default function ProfileEditModal({
    isOpen,
    onClose,
    userId,
    currentUsername,
    onSave
}: ProfileEditModalProps) {
    const [username, setUsername] = useState(currentUsername || '')
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
    const [checkingUsername, setCheckingUsername] = useState(false)

    // Update when currentUsername changes
    useEffect(() => {
        setUsername(currentUsername || '')
    }, [currentUsername])

    // Check username availability
    const checkUsername = async (usernameToCheck: string) => {
        if (!usernameToCheck || usernameToCheck.length < 3) {
            setUsernameAvailable(null)
            return
        }
        if (usernameToCheck === currentUsername) {
            setUsernameAvailable(true)
            return
        }

        setCheckingUsername(true)
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id')
                .eq('username', usernameToCheck)
                .neq('id', userId)
                .limit(1)

            if (error) throw error
            setUsernameAvailable(data.length === 0)
        } catch (err) {
            console.error('[ProfileEditModal] Error checking username:', err)
            setUsernameAvailable(null)
        } finally {
            setCheckingUsername(false)
        }
    }

    // Debounced username check
    useEffect(() => {
        const timer = setTimeout(() => {
            if (username) {
                checkUsername(username)
            }
        }, 500)
        return () => clearTimeout(timer)
    }, [username])

    const handleSave = async () => {
        if (!usernameAvailable && username !== currentUsername) {
            setError('Ce nom d\'utilisateur n\'est pas disponible')
            return
        }

        setIsSaving(true)
        setError(null)

        try {
            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    username: username,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId)

            if (updateError) throw updateError

            console.log('[ProfileEditModal] Username saved:', username)
            onSave(username)
            onClose()
        } catch (err: any) {
            console.error('[ProfileEditModal] Save error:', err)
            setError(err?.message || 'Erreur lors de la sauvegarde')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <BottomSheet isOpen={isOpen} onClose={onClose} initialHeight="auto" maxHeight="50vh">
            <div className="px-2">
                <h2 className="text-lg font-medium mb-4" style={{ color: 'var(--text-primary)' }}>
                    Modifier le pseudo
                </h2>

                <div>
                    <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-tertiary)' }}>
                        Nom d'utilisateur
                    </label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-muted)' }}>@</span>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => {
                                setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, ''))
                                setError(null)
                            }}
                            className="w-full pl-8 pr-10 py-3 rounded-xl text-sm"
                            style={{
                                background: 'var(--bg-secondary)',
                                border: `1px solid ${usernameAvailable === false ? 'var(--accent-rose)' : usernameAvailable === true ? 'var(--accent-sage)' : 'var(--border-light)'}`,
                                color: 'var(--text-primary)'
                            }}
                            placeholder="votre.pseudo"
                        />
                        {checkingUsername && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--text-muted) transparent transparent transparent' }} />
                            </div>
                        )}
                        {!checkingUsername && usernameAvailable !== null && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                <i className={`fa-solid ${usernameAvailable ? 'fa-check text-[var(--accent-sage)]' : 'fa-xmark text-[var(--accent-rose)]'}`} />
                            </div>
                        )}
                    </div>
                    {usernameAvailable === false && (
                        <p className="text-xs mt-1" style={{ color: 'var(--accent-rose)' }}>Ce nom d'utilisateur est déjà pris</p>
                    )}
                    <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                        Lettres minuscules, chiffres, points et underscores uniquement
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div className="mt-4 p-3 rounded-xl" style={{ background: 'rgba(212, 165, 165, 0.1)' }}>
                        <p className="text-sm text-center" style={{ color: 'var(--accent-rose)' }}>
                            <i className="fa-solid fa-circle-exclamation mr-2" />{error}
                        </p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 mt-6 pb-4">
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 rounded-xl text-sm font-medium"
                        style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving || usernameAvailable === false}
                        className="flex-1 py-4 rounded-xl text-sm font-medium"
                        style={{
                            background: 'var(--accent-gold)',
                            color: 'white',
                            opacity: (isSaving || usernameAvailable === false) ? 0.5 : 1
                        }}
                    >
                        {isSaving ? 'Sauvegarde...' : 'Enregistrer'}
                    </button>
                </div>
            </div>
        </BottomSheet>
    )
}
