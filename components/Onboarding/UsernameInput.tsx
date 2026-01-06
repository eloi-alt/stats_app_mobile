'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/utils/supabase/client'

interface UsernameInputProps {
    firstName: string
    lastName: string
    value: string
    onChange: (username: string) => void
    onValidChange: (isValid: boolean) => void
}

export default function UsernameInput({
    firstName,
    lastName,
    value,
    onChange,
    onValidChange
}: UsernameInputProps) {
    const [isChecking, setIsChecking] = useState(false)
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
    const [suggestions, setSuggestions] = useState<string[]>([])

    // Generate username suggestions
    const generateSuggestions = useCallback(() => {
        if (!firstName || !lastName) return []

        const first = firstName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z]/g, '')
        const last = lastName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z]/g, '')

        const base = [
            `${first}.${last}`,
            `${first}_${last}`,
            `${first}${last}`,
            `${first}.${last}${Math.floor(Math.random() * 100)}`,
            `${first[0]}${last}`,
        ]

        return base.filter(s => s.length >= 3)
    }, [firstName, lastName])

    // Generate suggestions when names change
    useEffect(() => {
        const newSuggestions = generateSuggestions()
        setSuggestions(newSuggestions)

        // Auto-select first suggestion if no value
        if (!value && newSuggestions.length > 0) {
            onChange(newSuggestions[0])
        }
    }, [firstName, lastName, generateSuggestions, value, onChange])

    // Check username availability with debounce
    useEffect(() => {
        if (!value || value.length < 3) {
            setIsAvailable(null)
            onValidChange(false)
            return
        }

        const timer = setTimeout(async () => {
            setIsChecking(true)
            try {
                const { data, error } = await supabase
                    .rpc('check_username_available', { check_username: value })

                if (error) throw error

                setIsAvailable(data)
                onValidChange(data)
            } catch (err) {
                console.error('Error checking username:', err)
                setIsAvailable(null)
                onValidChange(false)
            } finally {
                setIsChecking(false)
            }
        }, 500)

        return () => clearTimeout(timer)
    }, [value, onValidChange])

    return (
        <div className="username-input">
            <style jsx>{`
        .username-input {
          width: 100%;
        }

        .input-wrapper {
          position: relative;
        }

        .input {
          width: 100%;
          padding: 16px 48px 16px 16px;
          border: 2px solid var(--border-light);
          border-radius: 16px;
          font-size: 18px;
          background: var(--bg-secondary);
          color: var(--text-primary);
          transition: all 0.2s;
          text-align: center;
        }

        .input:focus {
          outline: none;
          border-color: var(--accent-gold);
          box-shadow: 0 0 0 4px rgba(201, 169, 98, 0.1);
        }

        .input.valid {
          border-color: var(--accent-sage);
        }

        .input.invalid {
          border-color: #e74c3c;
        }

        .status-icon {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 18px;
        }

        .status-icon.checking {
          animation: spin 1s linear infinite;
          color: var(--text-tertiary);
        }

        .status-icon.valid {
          color: var(--accent-sage);
        }

        .status-icon.invalid {
          color: #e74c3c;
        }

        @keyframes spin {
          to { transform: translateY(-50%) rotate(360deg); }
        }

        .status-text {
          font-size: 12px;
          margin-top: 8px;
          text-align: center;
        }

        .status-text.valid {
          color: var(--accent-sage);
        }

        .status-text.invalid {
          color: #e74c3c;
        }

        .suggestions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 16px;
          justify-content: center;
        }

        .suggestion {
          padding: 8px 12px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-light);
          border-radius: 20px;
          font-size: 13px;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s;
        }

        .suggestion:hover {
          background: var(--accent-gold);
          color: white;
          border-color: var(--accent-gold);
        }

        .suggestion.active {
          background: var(--accent-gold);
          color: white;
          border-color: var(--accent-gold);
        }
      `}</style>

            <div className="input-wrapper">
                <input
                    type="text"
                    className={`input ${isAvailable === true ? 'valid' : isAvailable === false ? 'invalid' : ''}`}
                    value={value}
                    onChange={(e) => onChange(e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, ''))}
                    placeholder="votre.username"
                    maxLength={30}
                />
                <span className={`status-icon ${isChecking ? 'checking' : isAvailable === true ? 'valid' : isAvailable === false ? 'invalid' : ''}`}>
                    {isChecking ? (
                        <i className="fa-solid fa-spinner" />
                    ) : isAvailable === true ? (
                        <i className="fa-solid fa-check" />
                    ) : isAvailable === false ? (
                        <i className="fa-solid fa-xmark" />
                    ) : null}
                </span>
            </div>

            {isAvailable === true && (
                <div className="status-text valid">Ce nom d&apos;utilisateur est disponible !</div>
            )}
            {isAvailable === false && (
                <div className="status-text invalid">Ce nom d&apos;utilisateur est déjà pris</div>
            )}

            {suggestions.length > 0 && (
                <div className="suggestions">
                    {suggestions.slice(0, 4).map((suggestion) => (
                        <button
                            key={suggestion}
                            className={`suggestion ${value === suggestion ? 'active' : ''}`}
                            onClick={() => onChange(suggestion)}
                        >
                            @{suggestion}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
