'use client'

import { useEffect, useState } from 'react'

export default function StatusBar() {
  const [time, setTime] = useState('9:41')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setTime(`${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`)
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div 
      className="absolute top-0 w-full h-[50px] pt-4 px-8 flex justify-between items-start font-semibold text-sm z-[9000] pointer-events-none"
      style={{ color: 'var(--text-primary)' }}
    >
      <span>{time}</span>
      <span style={{ color: 'var(--text-secondary)' }}>
        <i className="fa-solid fa-signal"></i>
        &nbsp;
        <i className="fa-solid fa-battery-full"></i>
      </span>
    </div>
  )
}
