'use client'

interface TabBarProps {
  activeTab: string
  onTabChange: (tabId: string) => void
}

export default function TabBar({ activeTab, onTabChange }: TabBarProps) {
  const tabs = [
    { id: 'view-physio', icon: 'fa-heart-pulse' },
    { id: 'view-social', icon: 'fa-circle-nodes' },
    { id: 'view-home', icon: 'fa-house' },
    { id: 'view-map', icon: 'fa-earth-americas' },
    { id: 'view-pro', icon: 'fa-briefcase' },
  ]

  return (
    <nav
      className="absolute bottom-[35px] left-[25px] right-[25px] h-20 rounded-[45px] flex justify-around items-center z-[9000] relative overflow-hidden"
      style={{
        background: 'rgba(30, 30, 30, 0.4)',
        backdropFilter: 'blur(80px) saturate(180%)',
        WebkitBackdropFilter: 'blur(80px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: `
          0 8px 32px rgba(0, 0, 0, 0.3),
          inset 0 1px 0 rgba(255, 255, 255, 0.2),
          inset 0 -1px 0 rgba(0, 0, 0, 0.2)
        `,
      }}
    >
      {/* Gradient overlay pour effet liquid glass */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            linear-gradient(180deg, 
              rgba(255, 255, 255, 0.1) 0%, 
              transparent 50%, 
              rgba(0, 0, 0, 0.1) 100%
            )
          `,
        }}
      />
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`text-[18px] w-[50px] h-[50px] flex items-center justify-center rounded-full transition-all duration-300 relative z-10 ${
            activeTab === tab.id
              ? 'text-white -translate-y-1'
              : 'text-gray-500'
          }`}
          onClick={() => onTabChange(tab.id)}
          style={
            activeTab === tab.id
              ? {
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  boxShadow: `
                    0 4px 16px rgba(10, 132, 255, 0.3),
                    inset 0 1px 0 rgba(255, 255, 255, 0.3),
                    0 0 0 1px rgba(255, 255, 255, 0.1)
                  `,
                }
              : {}
          }
        >
          <i
            className={`fa-solid ${tab.icon} transition-all duration-300 ${
              activeTab === tab.id ? 'scale-110 text-accent-blue' : ''
            }`}
            style={
              activeTab === tab.id
                ? {
                    filter: 'drop-shadow(0 0 8px rgba(10, 132, 255, 0.6))',
                  }
                : {}
            }
          />
        </button>
      ))}
    </nav>
  )
}

