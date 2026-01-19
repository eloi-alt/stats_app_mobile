import type { Metadata } from 'next'
import './globals.css'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { VisitorProvider } from '@/contexts/VisitorContext'
import { AuthProvider } from '@/contexts/AuthContext'
import LiquidBackground from '@/components/LiquidBackground'
import FriendWrapper from '@/components/FriendWrapper'

export const metadata: Metadata = {
  title: 'STATS | Ultimate Edition v2',
  description: 'Application de statistiques personnelles',
}

// Script anti-flash pour éviter le flash blanc en dark mode
const themeInitScript = `
(function() {
  try {
    var saved = localStorage.getItem('app_theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var isDark = saved === 'dark' || (saved === 'system' && prefersDark);
    
    // Apply theme to html element immediately (always available)
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
    
    // Function to apply body classes (deferred until body exists)
    function applyBodyClasses() {
      if (!document.body) return;
      
      if (isDark) {
        document.body.classList.add('dark-mode');
      }
      
      // Add no-transitions class initially to prevent flash
      document.body.classList.add('no-transitions');
      
      // Remove no-transitions after a short delay
      requestAnimationFrame(function() {
        requestAnimationFrame(function() {
          if (document.body) {
            document.body.classList.remove('no-transitions');
          }
        });
      });
    }
    
    // Try to apply immediately if body exists, otherwise wait for DOMContentLoaded
    if (document.body) {
      applyBodyClasses();
    } else {
      document.addEventListener('DOMContentLoaded', applyBodyClasses);
    }
  } catch(e) {
    console.warn('Theme initialization failed:', e);
  }
})();
`

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover, shrink-to-fit=no" />
        <meta name="theme-color" content="#FAFAF8" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
        {/* Anti-flash script - runs before React hydration */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <AuthProvider>
          <VisitorProvider>
            <ThemeProvider>
              <LanguageProvider>
                <FriendWrapper>
                  <LiquidBackground />
                  <main className="flex min-h-screen flex-col items-center justify-center overflow-x-hidden w-full relative" style={{ zIndex: 1 }}>
                    {children}
                  </main>
                </FriendWrapper>
              </LanguageProvider>
            </ThemeProvider>
          </VisitorProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

