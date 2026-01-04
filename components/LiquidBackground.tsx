'use client'

export default function LiquidBackground() {
  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{
        zIndex: 0,
        width: '100vw',
        height: '100vh',
      }}
    >
      {/* Blob 1 - Sky (Bleu ciel) */}
      <div
        className="liquid-blob"
        style={{
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, var(--accent-sky) 0%, transparent 100%)',
          top: '10%',
          left: '10%',
          animationDelay: '0s',
          animationDuration: '20s',
        }}
      />

      {/* Blob 2 - Lavender (Lavande) */}
      <div
        className="liquid-blob"
        style={{
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, var(--accent-lavender) 0%, transparent 100%)',
          top: '60%',
          right: '15%',
          animationDelay: '6.66s',
          animationDuration: '25s',
        }}
      />

      {/* Blob 3 - Rose (Rose) */}
      <div
        className="liquid-blob"
        style={{
          width: '550px',
          height: '550px',
          background: 'radial-gradient(circle, var(--accent-rose) 0%, transparent 100%)',
          bottom: '15%',
          left: '50%',
          animationDelay: '13.33s',
          animationDuration: '22s',
        }}
      />

      {/* Blob 4 - Gold (subtil, dark mode friendly) */}
      <div
        className="liquid-blob"
        style={{
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, var(--accent-gold) 0%, transparent 100%)',
          top: '40%',
          left: '30%',
          animationDelay: '10s',
          animationDuration: '28s',
        }}
      />
    </div>
  )
}
