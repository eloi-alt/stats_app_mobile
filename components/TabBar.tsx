'use client'

interface TabBarProps {
  activeTab: string
  onTabChange: (tabId: string) => void
}

export default function TabBar({ activeTab, onTabChange }: TabBarProps) {
  const tabs = [
    { id: 'view-physio', icon: 'fa-heart-pulse', label: 'Health' },
    { id: 'view-social', icon: 'fa-users', label: 'TrueCircle' },
    { id: 'view-home', icon: 'fa-house', label: 'Home' },
    { id: 'view-map', icon: 'fa-globe', label: 'World' },
    { id: 'view-pro', icon: 'fa-briefcase', label: 'Career' },
  ]

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 h-[80px] rounded-t-[32px] flex justify-around items-center z-[9000] backdrop-blur-xl"
      style={{
        paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))',
        paddingTop: '12px',
        background: 'var(--bg-card)',
        borderTop: '1px solid var(--border-light)',
        boxShadow: '0 -4px 30px rgba(0, 0, 0, 0.08)',
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id

        return (
          <button
            key={tab.id}
            className="flex flex-col items-center justify-center transition-all duration-300 relative"
            onClick={() => onTabChange(tab.id)}
            style={{
              width: '44px',
              height: '44px',
            }}
            aria-label={tab.label}
            aria-current={isActive ? 'page' : undefined}
          >
            <div
              className="flex items-center justify-center"
              style={{
                width: '40px',
                height: '40px',
              }}
            >
              <i
                className={`fa-solid ${tab.icon}`}
                style={{
                  fontSize: isActive ? '24px' : '18px',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  opacity: isActive ? 1 : 0.7,
                  transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  transform: isActive ? 'scale(1.2)' : 'scale(1)',
                }}
              />
            </div>
          </button>
        )
      })}
    </nav>
  )
}
