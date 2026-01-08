'use client'

import { useState, useEffect, RefObject } from 'react'

interface NavbarProps {
  title?: string
  subtitle?: string
  onAvatarClick?: () => void
  onNotificationClick?: () => void
  notificationCount?: number
  showAvatar?: boolean
  avatarUrl?: string
  scrollContainerRef?: RefObject<HTMLElement>
  isHidden?: boolean
}

export default function Navbar({
  title,
  subtitle,
  onAvatarClick,
  onNotificationClick,
  notificationCount = 0,
  showAvatar = true,
  avatarUrl,
  scrollContainerRef,
  isHidden = false
}: NavbarProps) {
  const [isMinimized, setIsMinimized] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [titleOpacity, setTitleOpacity] = useState(1)

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const resetTimer = () => {
      clearTimeout(timeoutId)
      setIsMinimized(false)
      timeoutId = setTimeout(() => {
        if (!isHovered) {
          setIsMinimized(true)
        }
      }, 2000) // Réduit après 2 secondes d'inactivité
    }

    // Détecter les interactions
    const handleInteraction = () => {
      resetTimer()
    }

    // Gérer le scroll pour faire disparaître le titre
    const handleScroll = () => {
      // Si scrollContainerRef est fourni, utiliser scrollTop de l'élément, sinon window.scrollY
      const currentScrollY = scrollContainerRef?.current
        ? scrollContainerRef.current.scrollTop
        : window.scrollY

      setScrollY(currentScrollY)

      // Faire disparaître progressivement le titre entre 0px et 60px de scroll (plus rapide et fluide)
      const opacity = Math.max(0, 1 - (currentScrollY / 60))
      setTitleOpacity(opacity)

      resetTimer()
    }

    // Déterminer l'élément à écouter
    const scrollElement = scrollContainerRef?.current || window

    // Écouter les événements seulement si scrollElement existe
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll, { passive: true })
    }
    window.addEventListener('mousemove', handleInteraction, { passive: true })
    window.addEventListener('touchstart', handleInteraction, { passive: true })

    // Timer initial
    resetTimer()

    return () => {
      clearTimeout(timeoutId)
      if (scrollElement) {
        scrollElement.removeEventListener('scroll', handleScroll)
      }
      window.removeEventListener('mousemove', handleInteraction)
      window.removeEventListener('touchstart', handleInteraction)
    }
  }, [isHovered, scrollContainerRef])

  // Hide navbar if isHidden prop is true
  if (isHidden) {
    return null
  }

  return (
    <div
      className="sticky top-0 z-[10001] w-full transition-all duration-300 pointer-events-none"
      style={{
        background: 'transparent',
      }}
      onMouseEnter={() => {
        setIsHovered(true)
        setIsMinimized(false)
      }}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex justify-between items-center relative h-10 px-4 py-2 navbar-content pointer-events-auto">
        {/* Gauche : Bouton de notification circulaire style Avatar */}
        <div className="ml-4 flex items-center justify-center">
          {onNotificationClick ? (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onNotificationClick()
              }}
              className="relative flex items-center justify-center transition-all active:scale-90"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'var(--bg-elevated)',
                border: '1.5px solid var(--text-primary)',
                padding: 0,
              }}
              aria-label="Notifications"
            >
              <i
                className="fa-solid fa-bell text-[16px]"
                style={{ color: 'var(--text-primary)' }}
              />
              {notificationCount > 0 && (
                <span
                  className="absolute flex items-center justify-center font-bold"
                  style={{
                    top: '-2px',
                    right: '-2px',
                    minWidth: '18px',
                    height: '18px',
                    fontSize: '10px',
                    borderRadius: '50%',
                    background: 'var(--text-primary)',
                    color: 'var(--text-inverse)',
                    border: '1.5px solid var(--bg-elevated)',
                    padding: '1px',
                  }}
                >
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </button>
          ) : (
            <div className="w-8" />
          )}
        </div>

        {/* Titre central - minimaliste - disparaît lors du scroll */}
        {title && (
          <div
            className="absolute left-1/2 -translate-x-1/2 text-center navbar-title pointer-events-auto"
            style={{
              opacity: titleOpacity,
              transform: `translate(-50%, ${scrollY > 30 ? '-10px' : '0px'})`,
              transition: 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1), transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {subtitle && (
              <div
                className="text-[7px] font-medium tracking-[0.2em] uppercase mb-0.5 navbar-subtitle"
                style={{
                  color: 'var(--text-tertiary)',
                  opacity: titleOpacity * 0.7,
                }}
              >
                {subtitle}
              </div>
            )}
            <h1
              className="text-xl font-semibold m-0 tracking-wide navbar-title-text"
              style={{
                color: 'var(--text-primary)',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {title}
            </h1>
          </div>
        )}

        {/* Droite : Avatar uniquement */}
        <div className="mr-4 pointer-events-auto relative z-[10010]">
          {showAvatar && (
            <div
              className="avatar-fade cursor-pointer transition-opacity active:opacity-70 navbar-avatar"
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                if (onAvatarClick) {
                  onAvatarClick()
                }
              }}
              onMouseDown={(e) => {
                e.stopPropagation()
              }}
              style={{
                width: title ? '32px' : '44px',
                height: title ? '32px' : '44px',
                position: 'relative',
              }}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  className="w-full h-full rounded-full object-cover pointer-events-none"
                  alt="Avatar"
                  style={{
                    border: '1.5px solid var(--text-primary)',
                  }}
                />
              ) : (
                <div
                  className="w-full h-full rounded-full pointer-events-none"
                  style={{
                    border: '1.5px solid var(--text-primary)',
                    background: `
                      repeating-conic-gradient(
                        var(--bg-secondary) 0deg 90deg,
                        var(--bg-tertiary) 90deg 180deg
                      ) 0 0 / 8px 8px
                    `,
                  }}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
